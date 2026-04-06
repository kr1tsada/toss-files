/// Tauri commands for file transfer operations
#[tauri::command]
pub async fn transfer_files() -> Result<String, String> {
    Ok("ok".to_string())
}
