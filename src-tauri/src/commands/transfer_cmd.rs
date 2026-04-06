use tauri::State;

use crate::error::AppError;
use crate::transfer::service::TransferService;
use crate::transfer::types::TransferResult;

#[tauri::command]
pub async fn pull_files(
    service: State<'_, TransferService>,
    device_id: String,
    remote_path: String,
    local_path: String,
) -> Result<TransferResult, String> {
    service
        .pull_file(&device_id, &remote_path, &local_path)
        .await
        .map_err(AppError::into)
}

#[tauri::command]
pub async fn push_files(
    service: State<'_, TransferService>,
    device_id: String,
    local_path: String,
    remote_path: String,
) -> Result<TransferResult, String> {
    service
        .push_file(&device_id, &local_path, &remote_path)
        .await
        .map_err(AppError::into)
}
