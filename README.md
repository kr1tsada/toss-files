# Toss

Simple USB file transfer between Android and macOS.

No cloud. No Wi-Fi. Just plug in and toss files.

## Features

- **2-panel file browser** — Android on the left, macOS on the right
- **Drag & drop** — toss files between devices
- **USB transfer via ADB** — fast, no internet needed
- **Progress tracking** — see speed and ETA
- **Dark/Light mode** — follows system preference

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Desktop | [Tauri v2](https://v2.tauri.app/) (Rust) | 2.10.3 |
| Frontend | React + TypeScript | 19.2.4 / TS 6.0.2 |
| Styling | Tailwind CSS | 4.2.2 |
| Bundler | Vite | 8.0.3 |
| Transfer | ADB (Android Debug Bridge) | — |

## Prerequisites

- macOS 13+ (Ventura or later)
- Android device with USB debugging enabled
- USB cable

### Enable USB Debugging on Android

1. Go to **Settings → About phone**
2. Tap **Build number** 7 times to enable Developer options
3. Go to **Settings → Developer options**
4. Enable **USB debugging**

## Development

```bash
# Install dependencies
pnpm install

# Run in development mode
cargo tauri dev

# Build for production
cargo tauri build
```

## Project Structure

```
src-tauri/src/
├── adb/           ADB client + output parser
├── device/        Device detection + polling
├── transfer/      File transfer service + queue
└── commands/      Tauri command layer (thin)

src/
├── components/
│   ├── device/        Device status UI
│   ├── file-browser/  File panel, rows, breadcrumb
│   ├── transfer/      Progress bar, queue
│   └── ui/            Shared UI (toolbar, dialog, toast)
├── hooks/             React hooks
├── lib/               Tauri bindings + utils
└── types/             TypeScript types
```

## License

MIT
