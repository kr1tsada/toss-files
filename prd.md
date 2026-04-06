# PRD: Toss — File Transfer

## Context

Desktop app สำหรับ transfer file ระหว่าง Android มือถือ กับ macOS ผ่านสาย USB
เน้น UI simple ทำไว ใช้ Tauri (Rust) เป็น framework หลัก

---

## 1. Product Overview

| Item | Detail |
|------|--------|
| **ชื่อ App** | Toss |
| **Platform** | macOS desktop app (Tauri v2) |
| **Target Device** | Android phone/tablet ผ่าน USB |
| **Transfer Method** | ADB (Android Debug Bridge) ผ่านสาย USB |
| **File Types** | ทุกประเภท — รูป, วิดีโอ, เอกสาร, zip, apk, etc. |
| **Tech Stack** | Tauri v2 (Rust backend) + React + TypeScript (frontend) |

## 2. Problem Statement

การ transfer file ระหว่าง Android กับ macOS ปัจจุบันยุ่งยาก:
- Android File Transfer (Google) ถูก deprecate แล้ว ใช้งานไม่ได้บน macOS ใหม่
- ต้องพึ่ง cloud services (Google Drive, etc.) ซึ่งช้าและต้องใช้ internet
- App ทางเลือกเช่น OpenMTP ก็มี bugs และ UX ไม่ดี

## 3. Goals

1. **Simple** — UI สะอาด ใช้งานง่าย drag & drop ได้
2. **Fast** — transfer ผ่าน USB โดยตรง ไม่ต้องพึ่ง internet
3. **Reliable** — ไม่ crash ไม่ค้าง รองรับ file ใหญ่
4. **Ship fast** — MVP ภายใน scope ที่จัดการได้

## 4. User Stories

| # | As a user, I want to... | Priority |
|---|------------------------|----------|
| U1 | เสียบ USB แล้วเห็น Android device ทันที | P0 |
| U2 | Browse file/folder บน Android จาก macOS | P0 |
| U3 | Copy file จาก Android → macOS (pull) | P0 |
| U4 | Copy file จาก macOS → Android (push) | P0 |
| U5 | Drag & drop file ทั้งสองทิศทาง | P0 |
| U6 | เห็น progress bar ระหว่าง transfer | P0 |
| U7 | Transfer หลาย file พร้อมกัน (batch) | P1 |
| U8 | ลบ file/folder บน Android จาก app | P1 |
| U8.1 | สร้าง folder ใหม่บน Android | P1 |
| U9 | Preview รูปภาพ/วิดีโอ thumbnail | P2 |
| U10 | Bookmark folder ที่ใช้บ่อย | P2 |

## 5. Architecture

```
┌─────────────────────────────────────────┐
│            Tauri v2 App                 │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │   Frontend (React + TypeScript) │    │
│  │   - File browser UI (2-panel)   │    │
│  │   - Drag & drop                 │    │
│  │   - Progress indicators         │    │
│  └──────────────┬──────────────────┘    │
│                 │ Tauri Commands         │
│  ┌──────────────▼──────────────────┐    │
│  │   Rust Backend                  │    │
│  │   - ADB wrapper (adb cli)       │    │
│  │   - File operations             │    │
│  │   - Device detection            │    │
│  │   - Transfer queue              │    │
│  └──────────────┬──────────────────┘    │
│                 │                        │
└─────────────────┼───────────────────────┘
                  │ USB
          ┌───────▼───────┐
          │ Android Device │
          │  (ADB mode)    │
          └───────────────┘
```

## 6. UI Design — Minimal 2-Panel Layout

```
┌──────────────────────────────────────────────────┐
│  Mob File Transfer              [─] [□] [×]      │
├──────────────────────────────────────────────────┤
│  📱 Pixel 8 Pro (connected)         ⟳ Refresh    │
├───────────────────────┬──────────────────────────┤
│  Android              │  macOS                   │
│  /sdcard/DCIM/        │  ~/Downloads/            │
│  ────────────────     │  ────────────────        │
│  📁 Camera        ▸   │  📁 Documents        ▸   │
│  📁 Screenshots   ▸   │  📁 Pictures         ▸   │
│  🖼 IMG_001.jpg       │  📄 report.pdf           │
│  🖼 IMG_002.jpg       │  📄 notes.txt            │
│  🎬 VID_001.mp4       │                          │
│                       │                          │
│                       │                          │
├───────────────────────┴──────────────────────────┤
│  ← Pull to Mac    Push to Android →              │
├──────────────────────────────────────────────────┤
│  Transfer: IMG_001.jpg ████████░░ 78%  2.1 MB/s  │
└──────────────────────────────────────────────────┘
```

### UI Principles
- **2-panel file browser**: ซ้าย = Android, ขวา = macOS
- **Minimal chrome**: ไม่มี menu bar ซับซ้อน
- **Dark/Light mode**: ตาม system preference
- **Keyboard shortcuts**: Cmd+C/V สำหรับ copy, Delete สำหรับลบ

## 7. Technical Details

### 7.1 ADB Integration (Rust Backend)
- Bundle `adb` binary กับ app หรือใช้ system adb
- Detect device via `adb devices`
- Browse files via `adb shell ls -la`
- Pull files via `adb pull`
- Push files via `adb push`
- Track progress โดย monitor transfer bytes

### 7.2 Key Tauri Commands
```rust
#[tauri::command]
fn list_devices() -> Vec<Device>

#[tauri::command]
fn list_files(device_id: &str, path: &str) -> Vec<FileEntry>

#[tauri::command]
fn pull_files(device_id: &str, remote_paths: Vec<String>, local_dest: &str) -> TransferResult

#[tauri::command]
fn push_files(device_id: &str, local_paths: Vec<String>, remote_dest: &str) -> TransferResult

#[tauri::command]
fn delete_files(device_id: &str, paths: Vec<String>) -> Result<()>

#[tauri::command]
fn create_folder(device_id: &str, path: &str) -> Result<()>
```

### 7.3 Frontend Stack
- **React 19** + **TypeScript**
- **Tailwind CSS** สำหรับ styling
- **Lucide icons** สำหรับ file type icons
- **@tanstack/virtual** สำหรับ virtualized file list (performance)

## 8. Project Structure

```
mob-file-transfer/
├── src-tauri/
│   ├── src/
│   │   ├── main.rs                  # App entry — setup + run
│   │   ├── error.rs                 # AppError enum (thiserror)
│   │   ├── adb/
│   │   │   ├── mod.rs
│   │   │   ├── client.rs            # Adb struct — execute commands
│   │   │   ├── parser.rs            # Parse adb output
│   │   │   └── client_test.rs       # Unit tests
│   │   ├── device/
│   │   │   ├── mod.rs
│   │   │   ├── manager.rs           # DeviceManager — poll, detect
│   │   │   ├── types.rs             # Device, DeviceState
│   │   │   └── manager_test.rs
│   │   ├── transfer/
│   │   │   ├── mod.rs
│   │   │   ├── service.rs           # pull, push, delete, mkdir
│   │   │   ├── queue.rs             # TransferQueue — batch, cancel
│   │   │   ├── types.rs             # TransferProgress, TransferResult
│   │   │   └── service_test.rs
│   │   └── commands/
│   │       ├── mod.rs
│   │       ├── device_cmd.rs        # list_devices
│   │       ├── file_cmd.rs          # list_files, delete, mkdir
│   │       └── transfer_cmd.rs      # pull, push
│   ├── Cargo.toml
│   └── tauri.conf.json
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── constants.ts                 # Default paths, config
│   ├── components/
│   │   ├── device/
│   │   │   ├── DeviceStatus.tsx
│   │   │   └── DeviceGuide.tsx
│   │   ├── file-browser/
│   │   │   ├── FilePanel.tsx
│   │   │   ├── FileRow.tsx
│   │   │   ├── Breadcrumb.tsx
│   │   │   └── EmptyState.tsx
│   │   ├── transfer/
│   │   │   ├── TransferBar.tsx
│   │   │   └── TransferQueue.tsx
│   │   └── ui/
│   │       ├── Toolbar.tsx
│   │       ├── ConfirmDialog.tsx
│   │       └── Toast.tsx
│   ├── hooks/
│   │   ├── useDevice.ts
│   │   ├── useFileSystem.ts
│   │   ├── useTransfer.ts
│   │   └── useKeyboardShortcuts.ts
│   ├── lib/
│   │   ├── commands.ts              # All invoke() bindings
│   │   ├── events.ts                # All listen() bindings
│   │   └── fileUtils.ts             # Format size, icon mapping
│   └── types/
│       ├── device.ts
│       ├── file.ts
│       └── transfer.ts
├── package.json
└── README.md
```

## 9. MVP Scope (v0.1)

### In Scope
- [ ] Device detection (USB + ADB)
- [ ] 2-panel file browser
- [ ] Pull files (Android → macOS)
- [ ] Push files (macOS → Android)
- [ ] Drag & drop support
- [ ] Transfer progress bar
- [ ] Basic error handling (device disconnected, permission denied)

### Out of Scope (v0.2+)
- Wireless ADB (Wi-Fi debugging)
- File preview / thumbnails
- Multiple device support
- Folder sync
- Bookmark / favorites
- iOS support
- Windows/Linux builds

## 10. Non-Functional Requirements

| Requirement | Target |
|------------|--------|
| App size | < 15 MB |
| Startup time | < 2 seconds |
| Transfer speed | >= 90% of raw ADB speed |
| Memory usage | < 100 MB idle |
| macOS support | macOS 13+ (Ventura) |

## 11. Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| ADB ต้อง enable USB debugging | แสดง guide step-by-step ใน app |
| macOS security blocks ADB | Bundle signed adb binary, handle Gatekeeper |
| File ใหญ่ transfer ช้า | ใช้ streaming, แสดง progress + ETA |
| Device ไม่ detect | Auto-retry + manual refresh button |

## 12. Implementation Plan

### Phase 1: Setup (Day 1)
1. Init Tauri v2 project + React + TypeScript
2. Setup Tailwind CSS
3. Bundle ADB binary

### Phase 2: Core Backend (Day 2-3)
4. Implement ADB wrapper in Rust
5. Device detection + listing
6. File browsing (ls)
7. Pull/Push commands with progress

### Phase 3: Frontend UI (Day 3-4)
8. Device status bar
9. 2-panel file browser component
10. Drag & drop integration
11. Transfer progress bar

### Phase 4: Polish (Day 5)
12. Error handling + user feedback
13. Dark/Light mode
14. Keyboard shortcuts
15. App icon + packaging

## 13. Verification

- [ ] `cargo tauri dev` runs without errors
- [ ] Connect Android via USB → device detected
- [ ] Browse Android file system from app
- [ ] Pull file จาก Android → macOS สำเร็จ
- [ ] Push file จาก macOS → Android สำเร็จ
- [ ] Drag & drop ทำงานทั้งสองทิศทาง
- [ ] Progress bar แสดงผลถูกต้อง
- [ ] Disconnect USB → app แสดง status ถูกต้อง
