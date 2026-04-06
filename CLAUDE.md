# Toss — Project Instructions for Claude Code

## Project Overview

**Toss** — Desktop app สำหรับ transfer file ระหว่าง Android กับ macOS ผ่าน USB (ADB)
Built with Tauri v2 (Rust) + React 19 + TypeScript + Tailwind CSS v4

## Tech Stack & Versions

### Rust Crates
| Crate | Version |
|-------|---------|
| tauri | 2.10.3 |
| tauri-build | 2.5.6 |
| serde | 1.0.228 |
| serde_json | 1.0.149 |
| tokio | 1.51.0 |
| thiserror | 2.0.18 |
| tracing | 0.1.44 |

### Package Manager
- **pnpm** 10.24.0 (ห้ามใช้ npm หรือ yarn)

### npm Packages (installed via pnpm)
| Package | Version |
|---------|---------|
| react | 19.2.4 |
| react-dom | 19.2.4 |
| @tauri-apps/api | 2.10.1 |
| @tauri-apps/cli | 2.10.1 |
| tailwindcss | 4.2.2 |
| @tailwindcss/vite | 4.2.2 |
| lucide-react | 1.7.0 |
| @tanstack/react-virtual | 3.13.23 |
| typescript | 6.0.2 |
| vite | 8.0.3 |
| @vitejs/plugin-react | 6.0.1 |

## Project Structure

```
src-tauri/src/
├── main.rs              App entry — setup + run
├── error.rs             AppError enum (thiserror)
├── adb/                 ADB binary wrapper
│   ├── client.rs        Execute adb commands
│   ├── parser.rs        Parse adb output (testable แยก)
│   └── client_test.rs   Unit tests
├── device/              Device detection
│   ├── manager.rs       Poll, detect, list devices
│   ├── types.rs         Device, DeviceState
│   └── manager_test.rs
├── transfer/            File transfer
│   ├── service.rs       pull, push, delete, mkdir
│   ├── queue.rs         Batch transfer + cancel
│   ├── types.rs         TransferProgress, TransferResult
│   └── service_test.rs
└── commands/            Tauri command layer (thin)
    ├── device_cmd.rs
    ├── file_cmd.rs
    └── transfer_cmd.rs

src/
├── main.tsx             Entry point
├── App.tsx              Layout shell
├── constants.ts         Default paths, config values
├── components/
│   ├── device/          Device connection UI
│   ├── file-browser/    File panel, rows, breadcrumb
│   ├── transfer/        Progress bar, queue
│   └── ui/              Shared UI (toolbar, dialog, toast)
├── hooks/               useDevice, useFileSystem, useTransfer, useKeyboardShortcuts
├── lib/                 commands.ts (invoke), events.ts (listen), fileUtils.ts
└── types/               device.ts, file.ts, transfer.ts
```

## Development Commands

```bash
cargo tauri dev          # Run in development mode
cargo tauri build        # Build .dmg for production
pnpm dev              # Frontend only (no Tauri)
pnpm lint             # Lint check
pnpm typecheck        # TypeScript check
```

## Coding Standards

### Rust
- Use `thiserror` for error types
- All Tauri commands return `Result<T, String>` for frontend compatibility
- ADB operations are async — use `tokio::process::Command`
- File paths: always use forward slash for Android paths, native for macOS
- Log errors with `tracing` crate

### TypeScript / React
- Functional components only
- Hooks for all state/effects — no class components
- `invoke()` from `@tauri-apps/api/core` สำหรับเรียก Rust commands
- `listen()` from `@tauri-apps/api/event` สำหรับ progress events
- Tailwind utility classes — ไม่ใช้ CSS modules
- Named exports (ไม่ใช้ default export)

### File Naming
- Rust: `snake_case.rs`
- Components: `PascalCase.tsx`
- Hooks: `camelCase.ts` (prefix `use`)
- Types/Utils: `camelCase.ts`

## Phase Workflow

แต่ละ phase มี spec อยู่ใน `docs/phases/`:
1. `phase-1-setup.md` — Project init, Tauri + React + Tailwind + ADB
2. `phase-2-backend.md` — Rust ADB wrapper + Tauri commands
3. `phase-3-frontend.md` — 2-panel UI, drag & drop, progress bar
4. `phase-4-polish.md` — Error handling, theme, shortcuts, packaging

**อ่าน phase spec ก่อนเริ่มทำทุกครั้ง** — มี tasks, acceptance criteria, และ notes สำคัญ
อัพเดท status ใน phase file เมื่อเริ่มทำและทำเสร็จ (`pending` → `in-progress` → `done`)

## Important Rules

- ห้าม `git push --force`
- ห้าม commit secrets (.env, credentials, API keys)
- ห้ามลบ file โดยไม่ถาม Boss ก่อน
- Commit บ่อย — จบแต่ละ task ย่อยให้ commit
- Commit message เป็นภาษาอังกฤษ สั้นกระชับ
- ทดสอบ `cargo tauri dev` ทุกครั้งหลังแก้ Rust code
- ถ้า error ไม่แน่ใจ ให้ถาม Boss ก่อน ไม่ต้องเดา

## ADB Notes

- ADB binary อยู่ที่ `src-tauri/bin/adb` (bundled)
- Android device ต้อง enable USB debugging ก่อนใช้
- ใช้ `adb devices -l` สำหรับ device listing
- ใช้ `adb -s <device_id>` เมื่อมีหลาย device
- File paths บน Android ใช้ `/sdcard/` เป็น default root
