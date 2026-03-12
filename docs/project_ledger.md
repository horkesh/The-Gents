# Project Ledger

Chronological record of decisions, changes, and session notes.

---

## 2026-03-12 — Session 1: Adoption & Audit

### Context
Adopted project discipline from the Tonight repo. Set up CLAUDE.md, napkin runbook, project ledger, state-of-app docs, and `.claude/settings.local.json`.

### Decisions
- **Discipline system**: Created `CLAUDE.md` (project conventions), `.claude/napkin.md` (runbook), this ledger, `docs/state-of-app.md`.
- **Adapted from Tonight**: Startup protocol, napkin curation rules, ledger format, execution & validation rules. Dropped P2P-specific patterns (no networking in this project), Zustand references (not yet used), Framer Motion patterns.
- **Kept project-specific**: Host character conventions, cinematic aesthetic rules, AI integration patterns.

### Audit Findings (Full Codebase)

**Critical**
1. `renderWrapped()` calls `useState`/`useEffect` inside a render function — violates React Rules of Hooks. Will cause bugs on re-render.
2. `index.html` has duplicate `<script type="module" src="index.tsx">` tags (lines 82-83).

**High**
3. Monolithic `index.tsx` (532 lines) — all components, state, game logic, and view rendering in one file.
4. AI failures are silent — `geminiService.ts` returns fallback data that looks real. User never sees errors.
5. `LoadingScreen` has no timeout — if a Gemini call hangs, user is permanently stuck.
6. Dead files: `App.tsx` (empty), `services/geminiService.ts` (empty duplicate).
7. `INITIAL_SCENE` constant lives in `types.ts` instead of `constants.ts`.

**Medium**
8. Tailwind via CDN — no tree-shaking or `@apply` support.
9. No vendor chunking in `vite.config.ts`.
10. No lint or test scripts in `package.json`.
11. `process.env.API_KEY` is embedded in client bundle via Vite `define` — fine for personal use, not for production.

### What's Next
- Fix critical hooks violation in `renderWrapped()`
- Remove duplicate script tag
- Clean up dead files
- Add lint script to package.json

---

## 2026-03-12 — Session 2: GitHub + Vercel + Critical Fixes

### Context
Set up GitHub push-to-deploy pipeline and fixed all critical audit findings.

### Infrastructure
- **Git initialized** and connected to `https://github.com/horkesh/The-Gents`
- **Vercel** linked via dashboard import, `vercel.json` added (Vite framework, SPA rewrites)
- **GEMINI_API_KEY** set in Vercel environment variables

### Fixes Applied

1. **React hooks violation** — extracted `renderWrapped()` (which illegally called `useState`/`useEffect` inside a render function) to a proper `WrappedView` component. Hooks now run at component top level.

2. **Dead files removed** — deleted empty `App.tsx` and empty `services/geminiService.ts`.

3. **INITIAL_SCENE relocated** — moved from `types.ts` to `constants.ts` where it belongs with other data constants.

4. **Lint script added** — `"lint": "tsc --noEmit"` in `package.json`.

5. **Deployment section** — added to `CLAUDE.md` with Vercel config and GitHub URL.

### Verification
- `npx tsc --noEmit`: 0 errors
- `npm run build`: success (1.44s, 491KB app chunk)
- `git push`: all changes live on `main`

### What's Next
- Phase 2: Decompose monolithic `index.tsx` into components/views/hooks
- Phase 3: Add error UI, loading timeouts, vendor chunking

---

## 2026-03-12 — Session 3: Decomposition (Phase 2)

### Context
Broke the 532-line monolithic `index.tsx` into proper file structure following Tonight's patterns.

### Changes

**New files created (10):**
- `components/ui/Button.tsx` — reusable button primitive
- `components/LoadingScreen.tsx` — fullscreen loading overlay
- `components/ProfileCard.tsx` — profile modal with stats
- `components/VideoTile.tsx` — participant tile
- `components/EventToast.tsx` — cocktail/confession overlays
- `components/views/LobbyView.tsx` — join form + lobby waiting room
- `components/views/WrappedView.tsx` — end-of-night summary
- `hooks/useGameActions.ts` — all game logic extracted from App
- `App.tsx` — thin composition layer (state + view routing)
- `index.tsx` — entry point only (7 lines)

**Architecture:**
- `index.tsx` → `App.tsx` → views + components
- `App.tsx` owns state, delegates actions to `useGameActions` hook
- Views receive data via props, call back via callbacks
- No prop drilling — views get exactly what they need

### Verification
- `npx tsc --noEmit`: 0 errors
- `npm run build`: success (1.02s, 491KB app chunk)

### What's Next
- Phase 3: Loading timeouts, error UI, vendor chunking

---

## 2026-03-12 — Session 4: Resilience (Phase 3)

### Context
Users could get permanently stuck on loading screens if Gemini calls failed, and AI errors were completely invisible.

### Changes

1. **LoadingScreen timeout** — 30s timer with "Continue Anyway" escape hatch. Timer resets when loading message changes. No more permanent stuck states.

2. **ErrorToast component** — glass-panel toast in `gents-orange` that auto-dismisses after 5s. Renders at top of screen with `z-50`.

3. **Error UI on all async actions** — every Gemini-calling action (`handleJoin`, `startGame`, `triggerDrink`, `triggerConfession`, `changeVibe`, `nextAct`) now has try/catch with in-character error messages:
   - "The doorman lost your invitation."
   - "The doors are stuck."
   - "The Alchemist spilled the cocktail."
   - "The Lorekeeper lost his train of thought."
   - "The Atmosphere couldn't shift the vibe."
   - "The night stumbled between acts."

4. **GameState.errorMessage** — new field in `types.ts`, wired through App.tsx.

5. **Vendor chunking** — `vite.config.ts` splits react (12KB) and @google/genai (272KB) into separately cached chunks. App code: 491KB → 208KB.

### Verification
- `npx tsc --noEmit`: 0 errors
- `npm run build`: success (1.06s)
  - `vendor-react`: 12KB
  - `vendor-genai`: 272KB
  - `app`: 208KB (was 491KB)

### Remaining Debt
- Tailwind via CDN (no tree-shaking) — fine for personal project
- Mock guests hardcoded — fine for single-player
- No tests — evaluate when scope grows
