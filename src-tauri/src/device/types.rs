use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub enum DeviceState {
    Connected,
    Unauthorized,
    Offline,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Device {
    pub id: String,
    pub model: String,
    pub product: String,
    pub state: DeviceState,
}
