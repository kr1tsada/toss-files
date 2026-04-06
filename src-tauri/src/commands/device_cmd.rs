use tauri::State;

use crate::device::manager::DeviceManager;
use crate::device::types::Device;
use crate::error::AppError;

#[tauri::command]
pub async fn list_devices(
    manager: State<'_, DeviceManager>,
) -> Result<Vec<Device>, String> {
    manager.list_devices().await.map_err(AppError::into)
}
