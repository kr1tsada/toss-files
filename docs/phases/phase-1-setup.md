# Phase 1: Project Setup

**Status**: done
**Estimated**: Day 1

## Goal

Init Tauri v2 project พร้อม React + TypeScript + Tailwind CSS และ bundle ADB binary

## Tasks

- [ ] Init Tauri v2 project (`pnpm create tauri-app` with React + TypeScript template)
- [ ] Setup Tailwind CSS v4
- [ ] ตั้งค่า `tauri.conf.json` — app name "Toss", window size 900x600
- [ ] Download ADB binary สำหรับ macOS (platform-tools)
- [ ] วาง ADB binary ใน `src-tauri/bin/` และ config resource bundling
- [ ] สร้าง Rust module structure:
  - `src-tauri/src/error.rs` — AppError enum
  - `src-tauri/src/adb/` — mod.rs, client.rs, parser.rs
  - `src-tauri/src/device/` — mod.rs, manager.rs, types.rs
  - `src-tauri/src/transfer/` — mod.rs, service.rs, queue.rs, types.rs
  - `src-tauri/src/commands/` — mod.rs, device_cmd.rs, file_cmd.rs, transfer_cmd.rs
- [ ] สร้าง frontend structure:
  - `src/components/device/` — DeviceStatus.tsx, DeviceGuide.tsx
  - `src/components/file-browser/` — FilePanel.tsx, FileRow.tsx, Breadcrumb.tsx, EmptyState.tsx
  - `src/components/transfer/` — TransferBar.tsx, TransferQueue.tsx
  - `src/components/ui/` — Toolbar.tsx, ConfirmDialog.tsx, Toast.tsx
  - `src/hooks/` — useDevice.ts, useFileSystem.ts, useTransfer.ts, useKeyboardShortcuts.ts
  - `src/lib/` — commands.ts, events.ts, fileUtils.ts
  - `src/types/` — device.ts, file.ts, transfer.ts
  - `src/constants.ts`
- [ ] Verify: `cargo tauri dev` runs และแสดง hello world

## Acceptance Criteria

1. `cargo tauri dev` เปิด app window ได้
2. ADB binary อยู่ใน bundle path ถูกต้อง
3. Tailwind CSS ใช้งานได้ (ทดสอบด้วย utility class)
4. Rust modules compile ผ่าน (empty structs/functions OK)

## Pinned Versions

### Rust (`Cargo.toml`)
```toml
[dependencies]
tauri = "2.10.3"
serde = { version = "1.0.228", features = ["derive"] }
serde_json = "1.0.149"
tokio = { version = "1.51.0", features = ["full"] }
thiserror = "2.0.18"
tracing = "0.1.44"

[build-dependencies]
tauri-build = "2.5.6"
```

### npm (`package.json`)
```json
{
  "dependencies": {
    "react": "^19.2.4",
    "react-dom": "^19.2.4",
    "@tauri-apps/api": "^2.10.1",
    "lucide-react": "^1.7.0",
    "@tanstack/react-virtual": "^3.13.23"
  },
  "devDependencies": {
    "@tauri-apps/cli": "^2.10.1",
    "typescript": "^6.0.2",
    "vite": "^8.0.3",
    "@vitejs/plugin-react": "^6.0.1",
    "tailwindcss": "^4.2.2",
    "@tailwindcss/vite": "^4.2.2"
  }
}
```

## Notes

- ใช้ **pnpm** เท่านั้น (ห้าม npm / yarn) — version 10.24.0
- ใช้ Tauri v2 (ไม่ใช่ v1)
- React 19 + TypeScript strict mode
- Tailwind CSS v4 (ใช้ `@import "tailwindcss"` ไม่ใช่ `@tailwind`)
- ADB binary: ดาวน์โหลดจาก Android SDK platform-tools for macOS
