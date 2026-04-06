use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FileEntry {
    pub name: String,
    pub is_dir: bool,
    pub size: u64,
    pub modified: String,
    pub permissions: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TransferProgress {
    pub file_name: String,
    pub bytes_transferred: u64,
    pub total_bytes: u64,
    pub percentage: f32,
    pub speed_bps: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TransferResult {
    pub file_name: String,
    pub success: bool,
    pub error: Option<String>,
}
