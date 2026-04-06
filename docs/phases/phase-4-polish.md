# Phase 4: Polish & Packaging

**Status**: pending
**Depends on**: Phase 3
**Estimated**: Day 5

## Goal

Error handling, dark/light mode, keyboard shortcuts, app packaging

## Tasks

### 4.1 Error Handling & UX
- [ ] Device disconnected mid-transfer → แสดง error + retry option
- [ ] Permission denied → แจ้งเตือนให้ enable USB debugging
- [ ] File not found / path invalid → toast notification
- [ ] Transfer failed → error detail + retry
- [ ] Confirmation dialog ก่อนลบ file

### 4.2 Theme
- [ ] Dark/Light mode ตาม macOS system preference
- [ ] `prefers-color-scheme` media query
- [ ] Tailwind dark: variant

### 4.3 Keyboard Shortcuts
- [ ] `Cmd+C` — copy (pull/push depending on active panel)
- [ ] `Cmd+V` — paste
- [ ] `Delete/Backspace` — delete selected files (with confirm)
- [ ] `Cmd+A` — select all
- [ ] `Cmd+R` — refresh file list
- [ ] `Enter` — open folder
- [ ] `Cmd+Backspace` — go up one level
- [ ] Arrow keys — navigate file list

### 4.4 Packaging
- [ ] App icon (simple "T" logo)
- [ ] `tauri.conf.json` — app metadata, window config
- [ ] `cargo tauri build` — สร้าง .dmg
- [ ] Test install บน macOS จริง

## Acceptance Criteria

1. ถอดสาย USB ระหว่าง transfer → app ไม่ crash, แสดง error สวยงาม
2. Dark/Light mode สลับตาม system
3. Keyboard shortcuts ทำงานทุกตัว
4. `cargo tauri build` สร้าง .dmg สำเร็จ
5. Install จาก .dmg แล้วเปิดใช้งานได้
