# Project Ledger

Chronological record of decisions, changes, and session notes.

---

## 2026-03-12 — Sessions 1-4: Prototype Discipline & Cleanup

### Context
Adopted project discipline from the Tonight repo. Set up CLAUDE.md, napkin runbook, project ledger, state-of-app docs. Decomposed the monolithic 532-line prototype, added loading timeouts, error UI, vendor chunking.

### Summary
- Phase 1: Critical fixes (hooks violation, dead files, lint script)
- Phase 2: Decomposition (15 files from 1)
- Phase 3: Resilience (loading timeouts, error toasts, vendor chunking 491→208KB)

---

## 2026-03-13 — Session 5: Migration to Full Monorepo

### Context
The prototype in the repo was a single-player proof of concept. The real codebase ("The Toast") existed separately as a full pnpm monorepo with server, client, and shared packages — 60 source files, 9/12 features complete, zero build errors.

### Decisions
- **Replaced prototype with full monorepo** — archived all flat prototype files, copied in the complete `shared/`, `server/`, `client/` packages
- **Kept discipline system** — CLAUDE.md, napkin, ledger updated for monorepo architecture
- **Kept all design docs** — THE-PITCH.md, ROADMAP.md, ARCHITECTURE.md, STATUS.md preserved
- **Updated .gitignore** for monorepo (node_modules, dist, .turbo, .env)

### What Moved In
- `shared/` — 10 files (types + constants, fully typed socket events)
- `server/` — 20 files (Express + Socket.io, Gemini AI services, room/session management)
- `client/` — 30 files (React 19, 5 pages, 25+ components, 3 contexts, Framer Motion)
- `assets/` — brand logos
- Root config: package.json, pnpm-workspace.yaml, turbo.json

### What Was Removed
- Prototype: App.tsx, index.tsx, types.ts, constants.ts, geminiService.ts
- Prototype components, hooks, vite.config.ts, tsconfig.json, vercel.json
- Single-player game logic (replaced by server-authoritative multiplayer)

### What's Next
- Verify full build in this repo
- Install dependencies
- Fix 6 known placeholders from STATUS.md
- Deploy: client → Vercel, server → Fly.io
