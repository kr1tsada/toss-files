use crate::adb::client::AdbClient;
use crate::adb::parser;
use crate::error::AppError;

use super::types::{FileEntry, TransferResult};

/// Transfer service — file operations via ADB
pub struct TransferService {
    client: AdbClient,
}

impl TransferService {
    pub fn new(client: AdbClient) -> Self {
        Self { client }
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

    /// Pull a file from device to local path
    pub async fn pull_file(
        &self,
        device_id: &str,
        remote_path: &str,
        local_path: &str,
    ) -> Result<TransferResult, AppError> {
        let file_name = remote_path
            .rsplit('/')
            .next()
            .unwrap_or(remote_path)
            .to_string();

        match self
            .client
            .execute_for_device(device_id, &["pull", remote_path, local_path])
            .await
        {
            Ok(_) => Ok(TransferResult {
                file_name,
                success: true,
                error: None,
            }),
            Err(e) => Ok(TransferResult {
                file_name,
                success: false,
                error: Some(e.to_string()),
            }),
        }
    }

    /// Push a file from local to device
    pub async fn push_file(
        &self,
        device_id: &str,
        local_path: &str,
        remote_path: &str,
    ) -> Result<TransferResult, AppError> {
        let file_name = local_path
            .rsplit('/')
            .next()
            .unwrap_or(local_path)
            .to_string();

        match self
            .client
            .execute_for_device(device_id, &["push", local_path, remote_path])
            .await
        {
            Ok(_) => Ok(TransferResult {
                file_name,
                success: true,
                error: None,
            }),
            Err(e) => Ok(TransferResult {
                file_name,
                success: false,
                error: Some(e.to_string()),
            }),
        }
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
