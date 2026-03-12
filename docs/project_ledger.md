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
