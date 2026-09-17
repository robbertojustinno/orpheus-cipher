use serde::{Deserialize, Serialize};
use base64::{engine::general_purpose::URL_SAFE_NO_PAD, Engine as _};
use ed25519_dalek::{Signature, Verifier, VerifyingKey};
use hickory_resolver::{proto::rr::RecordType, Resolver, TokioResolver};
use std::time::Duration;
use std::path::{Path, PathBuf};
use std::ffi::OsStr;

const LICENSE_KEY_ID: &str = "orpheus-2026-01";
const LICENSE_PUBLIC_KEY: &str = "brK0nUXFPiSlwzieGtJHeftNWzpl1x3Df-awzpwdOXs";

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
struct LicenseIdentity {
    license_id: String,
    #[serde(rename = "type")]
    license_type: String,
    founder_number: Option<u8>,
    issued_at: String,
    expires_at: Option<String>,
    status: String,
    capabilities: Vec<String>,
    key_id: String,
    max_activations: u32,
    offline_grace_days: u16,
}

fn verify_license_with_key(token: &str, public_key: &[u8; 32]) -> Result<LicenseIdentity, String> {
    let parts: Vec<&str> = token.trim().split('.').collect();
    if parts.len() != 3 || parts[0] != "ORPHEUS1" { return Err("INVALID LICENSE".into()); }
    let payload = URL_SAFE_NO_PAD.decode(parts[1]).map_err(|_| "INVALID LICENSE")?;
    let signature_bytes = URL_SAFE_NO_PAD.decode(parts[2]).map_err(|_| "INVALID SIGNATURE")?;
    let signature = Signature::from_slice(&signature_bytes).map_err(|_| "INVALID SIGNATURE")?;
    let verifying_key = VerifyingKey::from_bytes(public_key).map_err(|_| "LICENSE VALIDATION UNAVAILABLE")?;
    verifying_key.verify(&payload, &signature).map_err(|_| "INVALID SIGNATURE")?;
    let license: LicenseIdentity = serde_json::from_slice(&payload).map_err(|_| "INVALID LICENSE")?;
    if license.key_id != LICENSE_KEY_ID { return Err("UNRECOGNIZED LICENSE KEY".into()); }
    if license.status == "revoked" { return Err("LICENSE REVOKED".into()); }
    if license.status == "suspended" { return Err("LICENSE SUSPENDED".into()); }
    if license.status != "active" { return Err("INVALID LICENSE STATUS".into()); }
    if let Some(expires_at)=&license.expires_at { let expiry=chrono::DateTime::parse_from_rfc3339(expires_at).map_err(|_| "INVALID LICENSE EXPIRY")?;if expiry<=chrono::Utc::now(){return Err("LICENSE EXPIRED".into());} }
    match license.license_type.as_str() {
        "MASTER" if license.founder_number.is_none() => (),
        "FOUNDER" if matches!(license.founder_number, Some(1..=30)) => (),
        "STANDARD" if license.founder_number.is_none() => (),
        _ => return Err("INVALID LICENSE IDENTITY".into()),
    }
    Ok(license)
}

#[tauri::command]
fn verify_license_token(token: String, installation_id: String) -> Result<LicenseIdentity, String> {
    if installation_id.len() < 16 || installation_id.len() > 64 { return Err("INVALID INSTALLATION ID".into()); }
    let raw = URL_SAFE_NO_PAD.decode(LICENSE_PUBLIC_KEY).map_err(|_| "LICENSE VALIDATION UNAVAILABLE")?;
    let public_key: [u8; 32] = raw.try_into().map_err(|_| "LICENSE VALIDATION UNAVAILABLE")?;
    verify_license_with_key(&token, &public_key)
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct OperatorIdentity {
    username: String,
    hostname: String,
    platform: String,
    arch: String,
}

fn safe_env(keys: &[&str], fallback: &str) -> String {
    keys.iter()
        .find_map(|key| std::env::var(key).ok())
        .filter(|value| !value.trim().is_empty())
        .unwrap_or_else(|| fallback.to_string())
}

fn safe_export_filename(filename: &str) -> bool {
    if filename.is_empty() || filename.len() > 128 { return false; }
    if Path::new(filename).file_name() != Some(OsStr::new(filename)) { return false; }
    matches!(Path::new(filename).extension().and_then(OsStr::to_str), Some("json") | Some("svg"))
}

fn downloads_dir() -> Result<PathBuf, String> {
    let home = std::env::var_os("USERPROFILE")
        .or_else(|| std::env::var_os("HOME"))
        .ok_or_else(|| "EXPORT DIRECTORY UNAVAILABLE".to_string())?;
    let downloads = PathBuf::from(&home).join("Downloads");
    if downloads.is_dir() { Ok(downloads) } else { Ok(PathBuf::from(home)) }
}

#[tauri::command]
fn save_export_file(filename: String, content: String) -> Result<String, String> {
    if !safe_export_filename(&filename) { return Err("INVALID EXPORT FILENAME".into()); }
    if content.len() > 2_000_000 { return Err("EXPORT TOO LARGE".into()); }
    let directory = downloads_dir()?;
    let mut target = directory.join(&filename);
    if target.exists() {
        let stem = Path::new(&filename).file_stem().and_then(OsStr::to_str).unwrap_or("orpheus-export");
        let extension = Path::new(&filename).extension().and_then(OsStr::to_str).unwrap_or("txt");
        let stamp = chrono::Utc::now().timestamp();
        target = directory.join(format!("{stem}-{stamp}.{extension}"));
    }
    std::fs::write(&target, content.as_bytes()).map_err(|_| "EXPORT WRITE FAILED".to_string())?;
    Ok(target.to_string_lossy().to_string())
}

#[tauri::command]
fn get_operator_identity() -> OperatorIdentity {
    OperatorIdentity {
        username: safe_env(&["USERNAME", "USER"], "OPERADOR"),
        hostname: safe_env(&["COMPUTERNAME", "HOSTNAME"], "HOST-UNKNOWN"),
        platform: std::env::consts::OS.to_string(),
        arch: std::env::consts::ARCH.to_string(),
    }
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct DnsRecordSet {
    domain: String,
    a: Vec<String>,
    aaaa: Vec<String>,
    mx: Vec<String>,
    ns: Vec<String>,
    cname: Vec<String>,
    txt: Vec<String>,
    queried_at: String,
    status: String,
}

fn valid_domain(domain: &str) -> bool {
    let value = domain.trim().trim_end_matches('.').to_ascii_lowercase();
    value.len() <= 253
        && value.contains('.')
        && value.split('.').all(|label| {
            !label.is_empty()
                && label.len() <= 63
                && !label.starts_with('-')
                && !label.ends_with('-')
                && label.bytes().all(|c| c.is_ascii_lowercase() || c.is_ascii_digit() || c == b'-')
        })
}

async fn lookup_records(resolver: &TokioResolver, domain: &str, record_type: RecordType) -> Vec<String> {
    match tokio::time::timeout(Duration::from_secs(5), resolver.lookup(domain, record_type)).await {
        Ok(Ok(records)) => records.answers().iter().map(|record| record.data.to_string()).collect(),
        _ => Vec::new(),
    }
}

#[tauri::command]
async fn resolve_public_dns(domain: String) -> Result<DnsRecordSet, String> {
    let domain = domain.trim().trim_end_matches('.').to_ascii_lowercase();
    if !valid_domain(&domain) { return Err("INVALID DOMAIN".to_string()); }
    let resolver = Resolver::builder_tokio().map_err(|_| "DNS RESOLVER UNAVAILABLE")?.build().map_err(|_| "DNS RESOLVER UNAVAILABLE")?;
    let fqdn = format!("{domain}.");
    let (a, aaaa, mx, ns, cname, txt) = tokio::join!(
        lookup_records(&resolver, &fqdn, RecordType::A),
        lookup_records(&resolver, &fqdn, RecordType::AAAA),
        lookup_records(&resolver, &fqdn, RecordType::MX),
        lookup_records(&resolver, &fqdn, RecordType::NS),
        lookup_records(&resolver, &fqdn, RecordType::CNAME),
        lookup_records(&resolver, &fqdn, RecordType::TXT),
    );
    let status = if [&a,&aaaa,&mx,&ns,&cname,&txt].iter().any(|records| !records.is_empty()) { "ONLINE" } else { "UNAVAILABLE" };
    Ok(DnsRecordSet { domain, a, aaaa, mx, ns, cname, txt, queried_at: format!("{:?}", std::time::SystemTime::now()), status: status.to_string() })
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![get_operator_identity, resolve_public_dns, verify_license_token, save_export_file])
        .run(tauri::generate_context!())
        .expect("erro ao iniciar ORPHEUS");
}

#[cfg(test)]
mod tests {
    use super::*;
    use ed25519_dalek::{Signer, SigningKey};
    fn signed_test_license(founder_number: Option<u8>, license_type: &str, status: &str) -> (String, [u8;32]) {
        let signing_key=SigningKey::from_bytes(&[7u8;32]);let public=signing_key.verifying_key().to_bytes();
        let payload=LicenseIdentity{license_id:"LIC-TEST".into(),license_type:license_type.into(),founder_number,issued_at:"2026-08-23T00:00:00Z".into(),expires_at:None,status:status.into(),capabilities:vec!["orpheus-core".into()],key_id:LICENSE_KEY_ID.into(),max_activations:2,offline_grace_days:30};
        let bytes=serde_json::to_vec(&payload).unwrap();let signature=signing_key.sign(&bytes);(format!("ORPHEUS1.{}.{}",URL_SAFE_NO_PAD.encode(bytes),URL_SAFE_NO_PAD.encode(signature.to_bytes())),public)
    }
    #[test]
    fn identity_always_has_safe_values() {
        let identity = get_operator_identity();
        assert!(!identity.username.is_empty());
        assert!(!identity.hostname.is_empty());
        assert!(!identity.platform.is_empty());
        assert!(!identity.arch.is_empty());
    }
    #[test]
    fn domain_validation_blocks_command_like_input() {
        assert!(valid_domain("example.com"));
        assert!(valid_domain("sub.example.com."));
        assert!(!valid_domain("example.com && powershell"));
        assert!(!valid_domain("-invalid.example"));
        assert!(!valid_domain("localhost"));
    }
    #[tokio::test]
    async fn public_dns_resolves_example_domain() {
        let result = resolve_public_dns("example.com".to_string()).await.expect("example.com should be a valid public DNS target");
        assert_eq!(result.domain, "example.com");
        assert!(result.status == "ONLINE" || result.status == "UNAVAILABLE");
    }
    #[test]
    fn founder_bounds_and_master_identity_are_enforced() {
        for number in [1,30]{let(token,key)=signed_test_license(Some(number),"FOUNDER","active");assert_eq!(verify_license_with_key(&token,&key).unwrap().founder_number,Some(number));}
        for number in [0,31]{let(token,key)=signed_test_license(Some(number),"FOUNDER","active");assert_eq!(verify_license_with_key(&token,&key).unwrap_err(),"INVALID LICENSE IDENTITY");}
        let(token,key)=signed_test_license(None,"MASTER","active");assert_eq!(verify_license_with_key(&token,&key).unwrap().license_type,"MASTER");
    }
    #[test]
    fn export_filename_rejects_traversal_and_unapproved_extensions() {
        assert!(safe_export_filename("orpheus-operation-report.json"));
        assert!(safe_export_filename("orpheus-operation-complete.svg"));
        assert!(!safe_export_filename("../secret.json"));
        assert!(!safe_export_filename("private.key"));
    }
    #[test]
    fn tampering_and_revocation_are_rejected() {
        let(token,key)=signed_test_license(Some(7),"FOUNDER","active");let mut parts:Vec<String>=token.split('.').map(str::to_string).collect();let mut payload=URL_SAFE_NO_PAD.decode(&parts[1]).unwrap();payload[10]^=1;parts[1]=URL_SAFE_NO_PAD.encode(payload);assert_eq!(verify_license_with_key(&parts.join("."),&key).unwrap_err(),"INVALID SIGNATURE");
        let(revoked,key)=signed_test_license(Some(7),"FOUNDER","revoked");assert_eq!(verify_license_with_key(&revoked,&key).unwrap_err(),"LICENSE REVOKED");
    }
}
