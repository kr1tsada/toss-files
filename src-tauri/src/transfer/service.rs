use std::sync::Arc;
use tokio::io::{AsyncBufReadExt, BufReader};
use tokio::sync::Mutex;
use tauri::{AppHandle, Emitter};
use tracing::{debug, error};

use crate::adb::client::AdbClient;
use crate::adb::parser;
use crate::error::AppError;

use super::types::{FileEntry, TransferProgress, TransferResult};

/// Transfer service — file operations via ADB
pub struct TransferService {
    client: AdbClient,
    active_child: Arc<Mutex<Option<tokio::process::Child>>>,
}

impl TransferService {
    pub fn new(client: AdbClient) -> Self {
        Self {
            client,
            active_child: Arc::new(Mutex::new(None)),
        }
    }

    /// List files in a directory on the device
    pub async fn list_files(
        &self,
        device_id: &str,
        path: &str,
    ) -> Result<Vec<FileEntry>, AppError> {
        let output = self
            .client
            .execute_for_device(device_id, &["shell", "ls", "-la", path])
            .await?;
        Ok(parser::parse_file_list(&output))
    }

    /// Pull a file from device to local path, emitting progress events
    pub async fn pull_file(
        &self,
        device_id: &str,
        remote_path: &str,
        local_path: &str,
        app_handle: &AppHandle,
    ) -> Result<TransferResult, AppError> {
        let file_name = remote_path
            .rsplit('/')
            .next()
            .unwrap_or(remote_path)
            .to_string();

        self.run_transfer(
            device_id,
            &["pull", remote_path, local_path],
            &file_name,
            app_handle,
        )
        .await
    }

    /// Push a file from local to device, emitting progress events
    pub async fn push_file(
        &self,
        device_id: &str,
        local_path: &str,
        remote_path: &str,
        app_handle: &AppHandle,
    ) -> Result<TransferResult, AppError> {
        let file_name = local_path
            .rsplit('/')
            .next()
            .unwrap_or(local_path)
            .to_string();

        self.run_transfer(
            device_id,
            &["push", local_path, remote_path],
            &file_name,
            app_handle,
        )
        .await
    }

    /// Run a transfer command (pull/push) with progress streaming
    async fn run_transfer(
        &self,
        device_id: &str,
        args: &[&str],
        file_name: &str,
        app_handle: &AppHandle,
    ) -> Result<TransferResult, AppError> {
        let mut child = self.client.spawn_for_device(device_id, args)?;

        // Take stderr for progress reading
        let stderr = child
            .stderr
            .take()
            .ok_or_else(|| AppError::Transfer("Failed to capture stderr".into()))?;

        // Store child for cancellation
        {
            let mut guard = self.active_child.lock().await;
            *guard = Some(child);
        }

        // Read stderr line-by-line for progress
        // ADB uses \r for progress updates, so we read by byte and split on \r or \n
        let mut reader = BufReader::new(stderr);
        let mut buf = String::new();
        let mut last_stderr = String::new();

        loop {
            buf.clear();
            match reader.read_line(&mut buf).await {
                Ok(0) => break, // EOF
                Ok(_) => {
                    // ADB sometimes puts multiple progress updates in one line separated by \r
                    for segment in buf.split('\r') {
                        let segment = segment.trim();
                        if segment.is_empty() {
                            continue;
                        }
                        if let Some((percentage, bytes_transferred, total_bytes)) =
                            parser::parse_transfer_progress(segment)
                        {
                            let progress = TransferProgress {
                                file_name: file_name.to_string(),
                                bytes_transferred,
                                total_bytes,
                                percentage,
                                speed_bps: 0, // ADB doesn't provide speed directly
                            };
                            let _ = app_handle.emit("transfer-progress", &progress);
                        } else {
                            // Capture non-progress output as potential error info
                            if !segment.is_empty() {
                                last_stderr = segment.to_string();
                            }
                        }
                    }
                }
                Err(e) => {
                    debug!("stderr read error: {e}");
                    break;
                }
            }
        }

        // Wait for process to finish
        let status = {
            let mut guard = self.active_child.lock().await;
            if let Some(mut child) = guard.take() {
                child.wait().await.ok()
            } else {
                // Process was cancelled
                return Ok(TransferResult {
                    file_name: file_name.to_string(),
                    success: false,
                    error: Some("Transfer cancelled".into()),
                });
            }
        };

        match status {
            Some(s) if s.success() => Ok(TransferResult {
                file_name: file_name.to_string(),
                success: true,
                error: None,
            }),
            Some(_) => {
                error!("transfer failed: {last_stderr}");
                Ok(TransferResult {
                    file_name: file_name.to_string(),
                    success: false,
                    error: Some(if last_stderr.is_empty() {
                        "Transfer failed".into()
                    } else {
                        last_stderr
                    }),
                })
            }
            None => Ok(TransferResult {
                file_name: file_name.to_string(),
                success: false,
                error: Some("Transfer process exited unexpectedly".into()),
            }),
        }
    }

    /// Cancel the active transfer by killing the child process
    pub async fn cancel(&self) -> Result<(), AppError> {
        let mut guard = self.active_child.lock().await;
        if let Some(ref mut child) = *guard {
            child
                .kill()
                .await
                .map_err(|e| AppError::Transfer(format!("Failed to cancel: {e}")))?;
            debug!("Transfer cancelled");
        }
        *guard = None;
        Ok(())
    }

    /// Delete a file or directory on the device
    pub async fn delete_file(
        &self,
        device_id: &str,
        remote_path: &str,
    ) -> Result<(), AppError> {
        self.client
            .execute_for_device(device_id, &["shell", "rm", "-rf", remote_path])
            .await?;
        Ok(())
    }

    /// Create a directory on the device
    pub async fn create_folder(
        &self,
        device_id: &str,
        remote_path: &str,
    ) -> Result<(), AppError> {
        self.client
            .execute_for_device(device_id, &["shell", "mkdir", "-p", remote_path])
            .await?;
        Ok(())
    }
}
