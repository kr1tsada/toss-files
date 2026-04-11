use std::fs;
use std::os::unix::fs::PermissionsExt;
use std::path::PathBuf;
use std::time::UNIX_EPOCH;

use tauri::State;

use crate::commands::path_util::expand_local_path;
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
pub async fn list_local_files(path: String) -> Result<Vec<FileEntry>, String> {
    let resolved = PathBuf::from(expand_local_path(&path));

    let entries = fs::read_dir(&resolved).map_err(|e| e.to_string())?;
    let mut files: Vec<FileEntry> = Vec::new();

    for entry in entries.flatten() {
        let meta = match entry.metadata() {
            Ok(m) => m,
            Err(_) => continue,
        };
        let name = entry.file_name().to_string_lossy().to_string();
        // Skip hidden files
        if name.starts_with('.') {
            continue;
        }
        let modified = meta
            .modified()
            .unwrap_or(UNIX_EPOCH)
            .duration_since(UNIX_EPOCH)
            .unwrap_or_default()
            .as_secs()
            .to_string();
        let permissions = format!("{:o}", meta.permissions().mode());

        files.push(FileEntry {
            name,
            is_dir: meta.is_dir(),
            size: meta.len(),
            modified,
            permissions,
        });
    }

    // Folders first, then by name
    files.sort_by(|a, b| b.is_dir.cmp(&a.is_dir).then(a.name.cmp(&b.name)));
    Ok(files)
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
