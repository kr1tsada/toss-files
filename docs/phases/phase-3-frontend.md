# Phase 3: Frontend UI

**Status**: done
**Depends on**: Phase 2
**Estimated**: Day 3-4

## Goal

สร้าง UI 2-panel file browser พร้อม drag & drop และ transfer progress

## Tasks

### 3.1 Types & Bindings
- [x] `types/device.ts` — Device, DeviceState
- [x] `types/file.ts` — FileEntry
- [x] `types/transfer.ts` — TransferProgress, TransferResult
- [x] `lib/commands.ts` — invoke() bindings สำหรับทุก Tauri command
- [x] `lib/events.ts` — listen() bindings สำหรับ progress + device events
- [x] `lib/fileUtils.ts` — formatFileSize(), getFileIcon(), isImageFile(), etc.
- [x] `constants.ts` — DEFAULT_ANDROID_PATH, DEFAULT_MAC_PATH, etc.

### 3.2 Device Components (`components/device/`)
- [x] `DeviceStatus.tsx` — แสดงชื่อ device + connection status
  - สถานะ: connected (green), disconnected (gray), unauthorized (yellow)
  - Refresh button
- [x] `DeviceGuide.tsx` — step-by-step guide เปิด USB debugging
  - แสดงเมื่อไม่มี device หรือ unauthorized

### 3.3 File Browser (`components/file-browser/`)
- [x] `FilePanel.tsx` — reusable panel ใช้ได้ทั้ง Android + macOS side
  - Sort by name/size/date
  - Multi-select (Cmd+click, Shift+click)
  - Virtualized list ด้วย `@tanstack/virtual`
- [x] `FileRow.tsx` — single file/folder row พร้อม icon ตาม type
  - Double-click folder → navigate
  - Drag source สำหรับ drag & drop
- [x] `Breadcrumb.tsx` — clickable path segments navigation
- [x] `EmptyState.tsx` — แสดงเมื่อ folder ว่างหรือไม่มี device

### 3.4 Transfer Components (`components/transfer/`)
- [x] `TransferBar.tsx` — progress bar: file name + % + speed (MB/s)
  - Cancel button
- [x] `TransferQueue.tsx` — batch transfer list (pending, active, done)

### 3.5 Shared UI (`components/ui/`)
- [x] `Toolbar.tsx` — Pull, Push, Delete, New folder, Refresh
- [x] `ConfirmDialog.tsx` — reusable confirm dialog (delete, overwrite)
- [x] `Toast.tsx` — success/error notifications

### 3.6 Hooks
- [x] `useDevice.ts` — device list, polling, connection state
- [x] `useFileSystem.ts` — file listing, navigation, selection state
- [x] `useTransfer.ts` — pull/push/delete, progress, queue
- [x] `useKeyboardShortcuts.ts` — Cmd+C/V, Delete, Cmd+A, arrows

### 3.7 Drag & Drop
- [x] Drag file จาก Android panel → macOS panel (pull)
- [x] Drag file จาก macOS panel → Android panel (push)
- [x] Visual feedback: drop zone highlight
- [x] Support drag หลาย files พร้อมกัน

### 3.8 Layout (`App.tsx`)
- [x] 2-panel layout: Android (left) | macOS (right)
- [x] Resizable panel divider
- [x] Device status bar (top)
- [x] Transfer bar (bottom)

## Acceptance Criteria

1. เห็น 2-panel UI เมื่อเปิด app
2. Browse file/folder ได้ทั้ง Android และ macOS side
3. Drag & drop file ข้ามฝั่งแล้ว transfer สำเร็จ
4. Progress bar แสดงผลถูกต้องระหว่าง transfer
5. Multi-select + batch transfer ทำงานได้
6. Empty state แสดง guide เมื่อไม่มี device

## UI Reference

```
┌──────────────────────────────────────────────────┐
│  Toss                               [─] [□] [×] │
├──────────────────────────────────────────────────┤
│  📱 Pixel 8 Pro (connected)         ⟳ Refresh   │
├───────────────────────┬──────────────────────────┤
│  Android              │  macOS                   │
│  /sdcard/DCIM/        │  ~/Downloads/            │
│  ────────────────     │  ────────────────        │
│  📁 Camera        ▸   │  📁 Documents        ▸   │
│  📁 Screenshots   ▸   │  📁 Pictures         ▸   │
│  🖼 IMG_001.jpg       │  📄 report.pdf           │
│  🖼 IMG_002.jpg       │  📄 notes.txt            │
│  🎬 VID_001.mp4       │                          │
├───────────────────────┴──────────────────────────┤
│  ← Pull to Mac    Push to Android →    🗑 Delete │
├──────────────────────────────────────────────────┤
│  Transfer: IMG_001.jpg ████████░░ 78%  2.1 MB/s  │
└──────────────────────────────────────────────────┘
```
