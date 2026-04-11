use std::path::PathBuf;

/// Expand a user-supplied local path.
/// - `~` or `~/...` → resolved against the OS home directory
/// - Everything else is returned as-is
///
/// adb and Rust's std::fs do not expand `~` (it's a shell construct), so the
/// frontend default of `~/` would otherwise land as a literal "~" directory.
pub fn expand_local_path(input: &str) -> String {
    if input == "~" {
        return dirs::home_dir()
            .unwrap_or_default()
            .to_string_lossy()
            .to_string();
    }
    if let Some(rest) = input.strip_prefix("~/") {
        let home = dirs::home_dir().unwrap_or_default();
        let joined: PathBuf = home.join(rest);
        return joined.to_string_lossy().to_string();
    }
    input.to_string()
}
