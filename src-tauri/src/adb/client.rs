use std::path::PathBuf;
use std::process::Stdio;
use tokio::process::{Child, Command};
use tracing::{debug, error};

use crate::error::AppError;

/// ADB client — wraps adb binary execution
pub struct AdbClient {
    adb_path: PathBuf,
}

impl AdbClient {
    /// Create a new ADB client, auto-detecting the binary path.
    /// Priority: bundled binary → system PATH
    pub fn new() -> Self {
        let adb_path = Self::detect_adb_path();
        debug!("Using ADB at: {}", adb_path.display());
        Self { adb_path }
    }

    /// Execute an ADB command and return stdout
    pub async fn execute(&self, args: &[&str]) -> Result<String, AppError> {
        debug!("adb {}", args.join(" "));

        let output = Command::new(&self.adb_path)
            .args(args)
            .output()
            .await
            .map_err(|e| AppError::Adb(format!("Failed to run adb: {e}")))?;

        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr);
            error!("adb error: {stderr}");
            return Err(AppError::Adb(stderr.trim().to_string()));
        }

        Ok(String::from_utf8_lossy(&output.stdout).to_string())
    }

    /// Execute an ADB command targeting a specific device
    pub async fn execute_for_device(
        &self,
        device_id: &str,
        args: &[&str],
    ) -> Result<String, AppError> {
        let mut full_args = vec!["-s", device_id];
        full_args.extend_from_slice(args);
        self.execute(&full_args).await
    }

    /// Spawn an ADB command targeting a device, returning the Child process.
    /// stderr is piped for progress reading; stdout is piped for output capture.
    pub fn spawn_for_device(
        &self,
        device_id: &str,
        args: &[&str],
    ) -> Result<Child, AppError> {
        let mut full_args = vec!["-s".to_string(), device_id.to_string()];
        full_args.extend(args.iter().map(|s| s.to_string()));
        debug!("adb (spawn) {}", full_args.join(" "));

        Command::new(&self.adb_path)
            .args(&full_args)
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .spawn()
            .map_err(|e| AppError::Adb(format!("Failed to spawn adb: {e}")))
    }

    /// Detect ADB binary path: bundled first, then system PATH
    fn detect_adb_path() -> PathBuf {
        // Try bundled binary next to the executable
        if let Ok(exe) = std::env::current_exe() {
            if let Some(dir) = exe.parent() {
                let bundled = dir.join("adb");
                if bundled.exists() {
                    return bundled;
                }
            }
        }

        // Fallback to system PATH
        PathBuf::from("adb")
    }
}
