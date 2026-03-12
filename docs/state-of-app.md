# State of the App

## Current Architecture (v1 — Decomposed)

### Core Concept
"The Gents" is a single-player AI-powered virtual cocktail party. Three fixed AI host characters (Keys/The Alchemist, Bass/The Atmosphere, Lore/The Architect) run a cinematic multi-act evening with cocktails, confessions, vibe shifts, and a personalized "Wrapped" summary. Guest profiles are generated from selfies via Gemini AI.

### Key Components

1. **App Shell (`App.tsx`)**
   * Thin composition layer — state + view routing
   * State: `useState<GameState>` plus `userName`, `userPhoto`, `viewedProfile`
   * Delegates all game logic to `useGameActions` hook
   * Game flow: `LOBBY → ACT_I → ACT_II → ACT_III → ACT_IV → WRAPPED`

2. **Entry Point (`index.tsx` — 7 lines)**
   * Just `createRoot` + `<App />` render

3. **Components**
   * `components/ui/Button.tsx` — reusable button primitive (primary/secondary/ghost/danger)
   * `components/LoadingScreen.tsx` — fullscreen loading overlay
   * `components/ProfileCard.tsx` — profile modal with stats
   * `components/VideoTile.tsx` — participant tile in video grid
   * `components/EventToast.tsx` — cocktail serve + confession voting overlays
   * `components/views/LobbyView.tsx` — join form + lobby waiting room
   * `components/views/WrappedView.tsx` — end-of-night summary with AI lore

4. **Hooks**
   * `hooks/useGameActions.ts` — all game logic (join, drinks, confessions, vibes, acts, reactions)

2. **AI Services (`geminiService.ts`)**
   * All Gemini API calls: `generateProfile`, `generateScene`, `generateCocktail`, `generateConfessionPrompt`, `generateWrappedNote`
   * Model: `gemini-3-flash-preview`
   * System instruction from `constants.ts`
   * All functions have try/catch with fallback data
   * Prompts are inline in the service (not extracted to builders)

3. **Data (`types.ts`, `constants.ts`)**
   * `types.ts`: Enums (`Act`, `Role`, `Vibe`), interfaces (`Participant`, `Cocktail`, `Scene`, `Confession`, `GameState`), `INITIAL_SCENE` constant
   * `constants.ts`: `THE_GENTS` (3 hosts), `MOCK_GUESTS` (2 sample guests), `ROOM_CODES`, `SYSTEM_INSTRUCTION`

4. **Build & Styling**
   * Vite with React plugin, port 3000
   * Tailwind CSS via CDN (not bundled)
   * Custom theme colors in `index.html` via `window.tailwind.config`
   * Custom animations: `floatUp`, `fadeIn`
   * Glass panel CSS class

### Data Flow
1. User enters name + selfie → `Gemini.generateProfile()` → creates `Participant`
2. "Open The Doors" → `Gemini.generateScene()` → enters `ACT_I`
3. In-act: trigger drinks (`generateCocktail`), confessions (`generateConfessionPrompt`), vibe shifts (`generateScene`)
4. `nextAct()` progresses through acts, generating scenes
5. `WRAPPED` → `generateWrappedNote()` → personalized summary

### Known Issues / Technical Debt

**Critical**
1. `renderWrapped()` calls `useState` and `useEffect` inside a render function — violates React Rules of Hooks
2. `index.html` has duplicate `<script>` tags for `index.tsx` (lines 82-83)

**High**
3. ~~Monolithic `index.tsx`~~ — **RESOLVED**: decomposed into 10 files
4. ~~No error UI~~ — **RESOLVED**: ErrorToast with in-character messages on all async failures
5. ~~No timeouts on `LoadingScreen`~~ — **RESOLVED**: 30s timeout with "Continue Anyway" escape
6. Empty `App.tsx` and `services/geminiService.ts` — dead files
7. `INITIAL_SCENE` lives in `types.ts` — should be in `constants.ts` with other data

**Medium**
8. Tailwind via CDN — works but no tree-shaking, no `@apply`, no build-time optimization
9. ~~No vendor chunking~~ — **RESOLVED**: react + genai split into cached vendor chunks
10. ~~No lint or test scripts~~ — **RESOLVED**: `npm run lint` added
11. Mock guests are hardcoded, always present — no dynamic guest management
12. Reactions have no partner — single-player only, reactions are self-directed
13. Voting simulation is random (`Math.random()` for yes/no counts) — fine for single-player

---

## Refactoring Plan

### Phase 1: Critical Fixes ✓
- [x] Extract `renderWrapped()` to a proper `WrappedView` component (hooks violation)
- [x] Remove duplicate `<script>` tag in `index.html` (was only in local drift, not on remote)
- [x] Remove dead files (`App.tsx`, `services/geminiService.ts`)
- [x] Move `INITIAL_SCENE` from `types.ts` to `constants.ts`

### Phase 2: Decomposition ✓
- [x] Extract sub-components to individual files in `components/`
- [x] Extract view render functions to `components/views/`
- [x] Extract game logic to custom hooks in `hooks/`
- [ ] Extract prompts to `services/prompts/` builders (deferred — low value at current scale)

### Phase 3: Resilience ✓
- [x] Add timeout + escape hatch to `LoadingScreen` (30s timeout, "Continue Anyway")
- [x] Add error UI for AI failures (`ErrorToast` with in-character messages)
- [x] Add `npx tsc --noEmit` as lint script
- [x] Vendor chunking (react 12KB + genai 272KB split, app 491→208KB)
- [ ] Evaluate bundled Tailwind (`@tailwindcss/vite`) vs CDN (deferred — CDN works fine for now)
