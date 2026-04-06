use tauri::State;

use crate::error::AppError;
use crate::transfer::service::TransferService;
use crate::transfer::types::FileEntry;

#[tauri::command]
pub async fn list_files(
    service: State<'_, TransferService>,
    device_id: String,
    path: String,
) -> Result<Vec<FileEntry>, String> {
    service
        .list_files(&device_id, &path)
        .await
        .map_err(AppError::into)
}

#[tauri::command]
pub async fn delete_files(
    service: State<'_, TransferService>,
    device_id: String,
    path: String,
) -> Result<(), String> {
    service
        .delete_file(&device_id, &path)
        .await
        .map_err(AppError::into)
}

#[tauri::command]
pub async fn create_folder(
    service: State<'_, TransferService>,
    device_id: String,
    path: String,
) -> Result<(), String> {
    service
        .create_folder(&device_id, &path)
        .await
        .map_err(AppError::into)
}
