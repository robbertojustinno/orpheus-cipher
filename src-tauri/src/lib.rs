use serde::Serialize;
use hickory_resolver::{proto::rr::RecordType, Resolver, TokioResolver};
use std::time::Duration;

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
        .invoke_handler(tauri::generate_handler![get_operator_identity, resolve_public_dns])
        .run(tauri::generate_context!())
        .expect("erro ao iniciar ORPHEUS");
}

#[cfg(test)]
mod tests {
    use super::*;
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
}
