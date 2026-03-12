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
