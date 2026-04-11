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

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum ErrorKind {
    DeviceOffline,
    Unauthorized,
    PermissionDenied,
    FileNotFound,
    NoSpace,
    Cancelled,
    Unknown,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TransferResult {
    pub file_name: String,
    pub success: bool,
    pub error: Option<String>,
    pub error_kind: Option<ErrorKind>,
}

/// Classify an adb stderr string into a known ErrorKind
pub fn classify_error(stderr: &str) -> ErrorKind {
    let s = stderr.to_lowercase();
    if s.contains("device offline") || s.contains("device not found") || s.contains("no devices") {
        ErrorKind::DeviceOffline
    } else if s.contains("unauthorized") {
        ErrorKind::Unauthorized
    } else if s.contains("permission denied") || s.contains("read-only") {
        ErrorKind::PermissionDenied
    } else if s.contains("no such file") || s.contains("does not exist") || s.contains("not found") {
        ErrorKind::FileNotFound
    } else if s.contains("no space") || s.contains("enospc") {
        ErrorKind::NoSpace
    } else if s.contains("cancel") {
        ErrorKind::Cancelled
    } else {
        ErrorKind::Unknown
    }
}
