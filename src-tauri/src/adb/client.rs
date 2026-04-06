/// ADB client — wraps adb binary execution
pub struct AdbClient {
    pub adb_path: String,
}

impl AdbClient {
    pub fn new(adb_path: String) -> Self {
        Self { adb_path }
    }
}
