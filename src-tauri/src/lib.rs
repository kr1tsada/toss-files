mod adb;
mod commands;
mod device;
mod error;
mod transfer;

pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            commands::device_cmd::list_devices,
            commands::file_cmd::list_files,
            commands::transfer_cmd::transfer_files,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
