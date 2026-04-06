/// Tauri commands for file browsing operations
#[tauri::command]
pub async fn list_files(_device_id: String, _path: String) -> Result<Vec<String>, String> {
    Ok(vec![])
}
