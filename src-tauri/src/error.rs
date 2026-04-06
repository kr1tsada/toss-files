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
}

impl From<AppError> for String {
    fn from(err: AppError) -> String {
        err.to_string()
    }
}
