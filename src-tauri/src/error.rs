use thiserror::Error;

#[derive(Debug, Error)]
pub enum AppError {
    #[error("ADB error: {0}")]
    Adb(String),

    #[error("Device error: {0}")]
    Device(String),

    #[error("Transfer error: {0}")]
    Transfer(String),

    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),

    #[error("Parse error: {0}")]
    Parse(String),
}

impl From<AppError> for String {
    fn from(err: AppError) -> String {
        err.to_string()
    }
}
