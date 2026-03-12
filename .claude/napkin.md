# Napkin Runbook

## Curation Rules
- Re-prioritize on every read.
- Keep recurring, high-value notes only.
- Max 10 items per category.
- Each item includes date + "Do instead".

## Startup Protocol
1. **[2026-03-13] Every session begins with context alignment**
   Do instead: read `CLAUDE.md` first, `.claude/napkin.md` second, `docs/project_ledger.md` third. For architecture questions, read `docs/ARCHITECTURE.md`.
2. **[2026-03-13] Know the vision before touching code**
   Do instead: read `docs/THE-PITCH.md` for product intent, `docs/ROADMAP.md` for phased plan, `docs/STATUS.md` for what's built vs missing.
3. **[2026-03-13] Update the ledger after every meaningful change**
   Do instead: append a dated entry to `docs/project_ledger.md` after landing fixes, features, or decisions.

## Execution & Validation
1. **[2026-03-13] Build all packages before committing**
   Do instead: run `pnpm run build` to verify shared → server → client all compile.
2. **[2026-03-13] Keep docs and code in sync**
   Do instead: when changing architecture, update `docs/STATUS.md` and `docs/project_ledger.md` in the same session.
3. **[2026-03-13] Shared types are canonical**
   Do instead: all domain types live in `shared/src/types/`. Never duplicate types in server or client.
4. **[2026-03-13] Verify Gemini model names before using them**
   Do instead: check `server/src/services/gemini/client.ts` for current model constants. Never guess model names.

## Architecture Patterns
1. **[2026-03-13] Server owns all game state**
   Do instead: client never mutates game state directly. All actions flow: client emits socket event → server processes → server broadcasts result.
2. **[2026-03-13] Socket events are typed end-to-end**
   Do instead: add new events to `shared/src/types/events.ts` first, then implement handler in server, then emit/listen in client.
3. **[2026-03-13] AI calls happen server-side only**
   Do instead: all Gemini calls go through `server/src/services/gemini/`. Never call Gemini from the client.
4. **[2026-03-13] Context providers wrap the entire app**
   Do instead: nesting order is `SocketProvider` → `RoomProvider` → `PartyProvider` → `BrowserRouter`. New state goes in the appropriate context.
5. **[2026-03-13] Prompts live in services/gemini/prompts.ts**
   Do instead: system instruction and style templates are centralized. Individual AI services import from prompts.ts.

## Frontend Patterns
1. **[2026-03-13] Pages are route-level, components are reusable**
   Do instead: one page per route in `pages/`. UI primitives in `components/ui/`. Domain components grouped by feature.
2. **[2026-03-13] Framer Motion variants are centralized**
   Do instead: use variants from `lib/animations.ts`. Don't inline animation configs in components.
3. **[2026-03-13] Keep the cinematic aesthetic consistent**
   Do instead: use existing design tokens from `globals.css` @theme. Dark, premium, Wes Anderson meets speakeasy.
4. **[2026-03-13] Gent controls are host-only**
   Do instead: `GentControlPanel` checks `isGent` from RoomContext. Guests never see host controls.

## Shell & Environment
1. **[2026-03-13] This is a Windows machine with bash shell**
   Do instead: use Unix shell syntax but be aware of Windows quirks.
2. **[2026-03-13] Two dev servers: client on 5173, server on 3001**
   Do instead: client proxies `/api` and `/socket.io` to server via Vite config.
3. **[2026-03-13] Only GEMINI_API_KEY is required**
   Do instead: Daily.co, Supabase, Upstash have in-memory fallbacks. App runs with just the Gemini key.

## Working Style
1. **[2026-03-13] Favor concise, actionable guidance**
   Do instead: record short rules with clear next actions rather than long explanations.
2. **[2026-03-13] Napkin and ledger updates are part of every session**
   Do instead: update both before ending a session.
