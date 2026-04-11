use tauri::{AppHandle, State};

use crate::commands::path_util::expand_local_path;
use crate::error::AppError;
use crate::transfer::service::TransferService;
use crate::transfer::types::TransferResult;

#[tauri::command]
pub async fn pull_files(
    app: AppHandle,
    service: State<'_, TransferService>,
    device_id: String,
    remote_path: String,
    local_path: String,
) -> Result<TransferResult, String> {
    let local = expand_local_path(&local_path);
    service
        .pull_file(&device_id, &remote_path, &local, &app)
        .await
        .map_err(AppError::into)
}

#[tauri::command]
pub async fn push_files(
    app: AppHandle,
    service: State<'_, TransferService>,
    device_id: String,
    local_path: String,
    remote_path: String,
) -> Result<TransferResult, String> {
    let local = expand_local_path(&local_path);
    service
        .push_file(&device_id, &local, &remote_path, &app)
        .await
        .map_err(AppError::into)
}

#[tauri::command]
pub async fn cancel_transfer(
    service: State<'_, TransferService>,
) -> Result<(), String> {
    service.cancel().await.map_err(AppError::into)
}
