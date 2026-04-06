/// Tauri commands for device operations
#[tauri::command]
pub async fn list_devices() -> Result<Vec<String>, String> {
    Ok(vec![])
}
