use serde::Serialize;

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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![get_operator_identity])
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
}
