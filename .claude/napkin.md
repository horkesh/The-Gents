# Napkin Runbook

## Curation Rules
- Re-prioritize on every read.
- Keep recurring, high-value notes only.
- Max 10 items per category.
- Each item includes date + "Do instead".

## Startup Protocol
1. **[2026-03-12] Every Gents session should begin with context alignment**
   Do instead: read `CLAUDE.md` first, `.claude/napkin.md` second, `docs/project_ledger.md` third, and `docs/state-of-app.md` fourth before substantial work.
2. **[2026-03-12] Use docs/state-of-app.md for architecture questions**
   Do instead: read `docs/state-of-app.md` before proposing architectural changes so you understand current patterns and known debt.
3. **[2026-03-12] Update the ledger after every meaningful change**
   Do instead: append a dated entry to `docs/project_ledger.md` after landing fixes, features, or decisions so the next session has continuity.

## Execution & Validation
1. **[2026-03-12] Type-check before committing**
   Do instead: run `npx tsc --noEmit` after meaningful changes to catch type errors early.
2. **[2026-03-12] Keep docs and code in sync**
   Do instead: when adding new files, components, or changing architecture, update `docs/state-of-app.md` and `docs/project_ledger.md` in the same session.
3. **[2026-03-12] Verify Gemini model names against the actual API before using them**
   Do instead: check `@google/genai` SDK docs or Google AI Studio model list for valid model IDs. Never guess model names.
4. **[2026-03-12] API key is exposed via `process.env.API_KEY` in client bundle**
   Do instead: be aware this is a Vite `define` replacement — the key is embedded in the built JS. Fine for personal use, not for production.

## Frontend Patterns
1. **[2026-03-12] index.tsx is a monolith — decompose carefully**
   Do instead: when extracting components, keep the game flow logic in one place. Extract visual components first, logic hooks second.
2. **[2026-03-12] Views are selected by state, not by URL routing**
   Do instead: this is a SPA with view-based rendering via `gameState.act`. No router. Add new views as conditional renders in `App`.
3. **[2026-03-12] Keep the cinematic aesthetic consistent**
   Do instead: use existing design tokens (gents-gold, gents-charcoal, glass-panel, etc). Dark, premium, late-night cocktail bar look.
4. **[2026-03-12] AI failures have fallbacks but no user-visible error UI**
   Do instead: when a Gemini call fails, the service returns fake data silently. Consider adding retry buttons or error toasts for important failures.
5. **[2026-03-12] Hosts are fixed characters — never modify THE_GENTS array shape**
   Do instead: Keys/Bass/Lore are constants. Their traits, dossiers, and photos can evolve but their IDs and roles are canonical.
6. **[2026-03-12] useState inside render functions violates React rules**
   Do instead: `renderWrapped()` calls `useState` and `useEffect` inside a render method. This must be extracted to a proper component.

## Shell & Environment
1. **[2026-03-12] This is a Windows machine with bash shell**
   Do instead: use Unix shell syntax (forward slashes, /dev/null) but be aware some tools may behave differently on Windows.
2. **[2026-03-12] Vite dev server runs on port 3000**
   Do instead: check `vite.config.ts` for server configuration before assuming defaults.

## Working Style
1. **[2026-03-12] Keep changes grounded in the real codebase**
   Do instead: inspect entrypoints, configs, and active implementation files before proposing structure or documenting behavior.
2. **[2026-03-12] Favor concise, actionable guidance**
   Do instead: record short rules with clear next actions rather than long explanations.
3. **[2026-03-12] Napkin updates are part of the work, not an afterthought**
   Do instead: read `.claude/napkin.md` at session start and update it during the same slice whenever a reusable rule becomes clearer.
4. **[2026-03-12] Ledger updates are part of every fix session**
   Do instead: after landing fixes or making decisions, append a dated entry to `docs/project_ledger.md` before ending the session.
