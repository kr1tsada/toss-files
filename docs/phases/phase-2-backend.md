# Phase 2: Core Backend (Rust + ADB)

**Status**: done
**Depends on**: Phase 1
**Estimated**: Day 2-3

## Goal

Implement ADB wrapper ใน Rust พร้อม Tauri commands สำหรับ device detection, file browsing, pull/push

## Tasks

### 2.0 Error Types (`error.rs`)
- [ ] `AppError` enum ด้วย `thiserror` — AdbError, DeviceError, TransferError, IoError
- [ ] Implement `From<AppError>` for Tauri command error handling

### 2.1 ADB Client (`adb/client.rs`)
- [ ] สร้าง `AdbClient` struct ที่ wrap ADB binary path
- [ ] `execute(args)` — run ADB command แล้ว return output
- [ ] `execute_with_progress(args, callback)` — stream output สำหรับ progress tracking
- [ ] Auto-detect ADB path: bundled binary → system PATH fallback
- [ ] Handle ADB errors → map to `AppError::Adb`

### 2.1.1 ADB Parser (`adb/parser.rs`)
- [ ] `parse_device_list(output)` — parse `adb devices -l`
- [ ] `parse_file_list(output)` — parse `adb shell ls -la`
- [ ] `parse_transfer_progress(line)` — parse progress output
- [ ] Unit tests ใน `adb/client_test.rs` — test parser ด้วย mock output

### 2.2 Device Manager (`device/manager.rs` + `device/types.rs`)
- [ ] `Device` struct + `DeviceState` enum ใน `types.rs`
- [ ] `DeviceManager` — ใช้ `AdbClient` + parser
- [ ] `list_devices()` → `Vec<Device>`
- [ ] Device polling (watch for connect/disconnect)
- [ ] Unit tests ใน `device/manager_test.rs`

### 2.3 Transfer Service (`transfer/service.rs` + `transfer/types.rs`)
- [ ] `TransferProgress`, `TransferResult` ใน `types.rs`
- [ ] `pull_files()` — ใช้ `AdbClient`
- [ ] `push_files()` — ใช้ `AdbClient`
- [ ] `delete_files()` — `adb shell rm`
- [ ] `create_folder()` — `adb shell mkdir`
- [ ] Emit Tauri events สำหรับ progress
- [ ] Unit tests ใน `transfer/service_test.rs`

### 2.3.1 Transfer Queue (`transfer/queue.rs`)
- [ ] `TransferQueue` — batch multiple transfers
- [ ] Support cancellation via tokio channel
- [ ] Queue status (pending, in-progress, done, failed)

### 2.4 Tauri Commands (`commands/`)
- [ ] `device_cmd.rs` — `list_devices` command (thin wrapper)
- [ ] `file_cmd.rs` — `list_files`, `delete_files`, `create_folder` commands
- [ ] `transfer_cmd.rs` — `pull_files`, `push_files` commands
- [ ] Register all commands ใน `main.rs`

## Acceptance Criteria

1. เสียบ Android USB → `list_devices` return device info ถูกต้อง
2. `list_files` แสดง file/folder listing ของ Android
3. `pull_files` ดึง file จาก Android มา macOS ได้
4. `push_files` ส่ง file จาก macOS ไป Android ได้
5. `delete_files` ลบ file บน Android ได้
6. Progress events ถูก emit ระหว่าง transfer

## Key Types

```rust
#[derive(Serialize)]
pub struct Device {
    pub id: String,
    pub model: String,
    pub product: String,
    pub state: DeviceState, // Connected, Unauthorized, Offline
}

#[derive(Serialize)]
pub struct FileEntry {
    pub name: String,
    pub is_dir: bool,
    pub size: u64,
    pub modified: String,
    pub permissions: String,
}

#[derive(Serialize)]
pub struct TransferProgress {
    pub file_name: String,
    pub bytes_transferred: u64,
    pub total_bytes: u64,
    pub speed_bps: u64,
}
```
