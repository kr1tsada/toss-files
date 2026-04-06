use crate::adb::client::AdbClient;
use crate::adb::parser;
use crate::error::AppError;

use super::types::Device;

/// Device manager — detect and list connected Android devices
pub struct DeviceManager {
    client: AdbClient,
}

impl DeviceManager {
    pub fn new(client: AdbClient) -> Self {
        Self { client }
    }

    /// List all connected devices
    pub async fn list_devices(&self) -> Result<Vec<Device>, AppError> {
        let output = self.client.execute(&["devices", "-l"]).await?;
        Ok(parser::parse_device_list(&output))
    }
}
