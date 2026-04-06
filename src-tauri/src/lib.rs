mod adb;
mod commands;
mod device;
mod error;
mod transfer;

use adb::client::AdbClient;
use device::manager::DeviceManager;
use transfer::service::TransferService;

pub fn run() {
    let adb_client = AdbClient::new();
    let device_manager = DeviceManager::new(AdbClient::new());
    let transfer_service = TransferService::new(adb_client);

    tauri::Builder::default()
        .manage(device_manager)
        .manage(transfer_service)
        .invoke_handler(tauri::generate_handler![
            commands::device_cmd::list_devices,
            commands::file_cmd::list_files,
            commands::file_cmd::list_local_files,
            commands::file_cmd::delete_files,
            commands::file_cmd::create_folder,
            commands::transfer_cmd::pull_files,
            commands::transfer_cmd::push_files,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
