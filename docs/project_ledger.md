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

---

## 2026-03-13 — Session 6: Priority 0 Quick Fixes + Full Planning System

### Context
Created `docs/planning.md` as an active work tracker synthesizing ROADMAP + STATUS into ordered, checkboxed tasks. Then implemented all 6 known placeholder fixes.

### Changes
1. **Reaction sender name** — `reactions.ts` now looks up participant alias/name from room state by socket ID
2. **START_PARTY lobby stub removed** — deleted duplicate handler from `lobby.ts`, real logic in `party.ts`
3. **timesSpotlighted** — incremented for all participants who vote in confession rounds
4. **Key moments tracking** — new `keyMoments` store in `party.ts`, populated during drinks, confessions, vibe shifts, snaps. Fed into Wrapped card generation
5. **Landing role selection** — three-button picker (Alchemist/Atmosphere/Architect) replaces hardcoded `'keys'`
6. **Group snap compositing** — new `gemini/composite.ts` service generates artistic composites via Gemini image model. Falls back to first image on failure
7. **ACCEPT_DRINK/DODGE_DRINK** — now resolve participant alias/name instead of broadcasting socket ID

### Files Modified
- `server/src/socket/reactions.ts` — sender name resolution
- `server/src/socket/lobby.ts` — removed START_PARTY stub
- `server/src/socket/party.ts` — key moments, timesSpotlighted, compositing, name resolution
- `server/src/services/gemini/composite.ts` — NEW: Gemini composite photo generation
- `client/src/pages/Landing.tsx` — role selection UI
- `docs/planning.md` — NEW: active work tracker
- `docs/STATUS.md` — updated feature table and placeholders section
- `docs/state-of-app.md` — will be updated after Phase completion
