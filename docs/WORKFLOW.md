# Toss — Claude Code Workflow

## Session Flow

```
/recap → อ่าน phase spec → plan mode → execute tasks → /commit → /rrr
```

## Per-Phase Steps

### Step 1: Read Phase Spec

```
อ่าน docs/phases/phase-N-*.md
```

ทุกครั้งก่อนเริ่มทำ — ดู tasks, acceptance criteria, pinned versions

### Step 2: Plan

เข้า plan mode → Claude Code จะ:
- อ่าน phase spec + acceptance criteria
- แตก tasks ย่อยเป็น actionable items
- ระบุ files ที่ต้องสร้าง/แก้ไข
- เสนอ approach ให้ Boss review ก่อนลงมือ

### Step 3: Execute

ทำทีละ task ย่อย:
1. Implement task
2. Verify — `cargo check` / `pnpm typecheck` / `pnpm lint`
3. `/commit` ทันที (1 task = 1 commit)
4. Mark task done ✅ ใน phase spec

### Step 4: Phase Complete

- อัพเดท phase status → `done`
- Run acceptance criteria checks ทุกข้อ
- `/rrr` — retrospective + lessons learned

### Step 5: Next Phase

อ่าน phase ถัดไป → กลับ Step 1

## Commit Convention

```
phase-N: short description
```

ตัวอย่าง:
- `phase-1: init tauri v2 project with react + typescript`
- `phase-1: setup tailwind css v4`
- `phase-1: create rust module structure`
- `phase-2: implement adb client wrapper`
- `phase-2: add device manager with polling`
- `phase-3: add file panel with virtual scroll`
- `phase-4: add dark/light mode support`

## Quick Commands

| Action | Command |
|--------|---------|
| เริ่ม session | `/recap` |
| วางแผน phase | เข้า plan mode |
| commit งาน | `/commit` |
| จบ session | `/rrr` แล้ว `/forward` |
| ดู status | ดู `docs/phases/phase-N-*.md` |

## Phase Overview

| Phase | Description | Est. | Status |
|-------|-------------|------|--------|
| 1 | Project Setup — Tauri + React + Tailwind + ADB | Day 1 | pending |
| 2 | Core Backend — Rust ADB wrapper + Tauri commands | Day 2-3 | pending |
| 3 | Frontend UI — 2-panel file browser + drag & drop | Day 3-4 | pending |
| 4 | Polish & Packaging — error handling + theme + build | Day 5 | pending |

## Rules

- **1 task = 1 commit** — ย่อยพอดีๆ ไม่รวมหลาย tasks ใน commit เดียว
- **Verify ก่อน commit** — compile/lint/typecheck ต้องผ่าน
- **อ่าน phase spec ก่อนทำ** — มี acceptance criteria สำคัญ
- **ถาม Boss ถ้าไม่แน่ใจ** — ไม่เดา ไม่ทำเกิน scope
- **ใช้ pnpm เท่านั้น** — ห้าม npm / yarn
