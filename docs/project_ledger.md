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

---

## 2026-03-13 — Session 6 (cont): Phase 1-3 Implementation

### Phase 1: External Service Layers
- `server/src/services/daily.ts` — Daily.co room creation + token generation, no-op when unconfigured
- `server/src/services/supabase.ts` — Supabase CRUD (sessions, profiles, snapshots, wrapped), no-op fallback
- `server/src/services/redis.ts` — Redis room store with 2h TTL, no-op fallback
- `server/src/routes/daily.ts` — Token proxy endpoint
- `server/src/services/room.ts` — Daily room auto-created on room creation (fire-and-forget)

### Phase 2: Video Components
- `client/src/components/video/VideoGrid.tsx` — Gent row + guest grid, active speaker highlight
- `client/src/components/video/VideoTile.tsx` — Daily track hooks, composes ParticipantTile
- `client/src/components/video/ParticipantTile.tsx` — Pure display component, no Daily dependency
- `client/src/components/video/VideoControls.tsx` — Mic/camera toggle
- `client/src/pages/Party.tsx` — DailyProvider integration, useEffect callObject lifecycle
- `client/vite.config.ts` — Vendor chunking (react, daily, framer)

### Phase 3: Audio System
- `client/src/lib/audio.ts` — AudioManager class: Web Audio API, crossfade ambient loops, SFX playback, volume control
- `client/src/contexts/AudioContext.tsx` — AudioProvider with auto-init on interaction, vibe crossfade, mute/volume
- `client/src/App.tsx` — AudioProvider added to provider hierarchy
- `client/src/components/mechanics/VibeShift.tsx` — scratch SFX on vibe change
- `client/src/components/mechanics/DrinkRound.tsx` — pour SFX on appear, clink on accept
- `client/src/components/mechanics/ConfessionRound.tsx` — envelope SFX on prompt
- `client/src/components/mechanics/GroupSnap.tsx` — shutter SFX on snap

### Phase 4: Polish & Error Handling
- `client/src/components/ui/ErrorBoundary.tsx` — Class component with retry button
- `client/src/components/ui/ConnectionStatus.tsx` — Reconnecting banner on disconnect
- `client/src/contexts/SocketContext.tsx` — Reconnection with backoff (1s→10s, 10 attempts), auto room rejoin
- `client/src/contexts/RoomContext.tsx` — Store/clear roomCode in sessionStorage, memoized context
- `client/src/lib/storage.ts` — Centralized storage keys + safe getStoredProfile()
- `client/src/styles/globals.css` — Focus rings, prefers-reduced-motion, 16px inputs, mirror class
- `client/src/components/ui/Button.tsx` — 44px min touch targets
- `client/src/components/mechanics/ReactionBar.tsx` — ARIA labels

### Phase 5: Deployment
- `server/Dockerfile` — Multi-stage Node 20 + pnpm build (shared+server → production)
- `fly.toml` — Fly.io config with WebSocket support, auto-scale
- `client/vercel.json` — Vite framework, monorepo build, SPA rewrites
- `.dockerignore` — Excludes client, docs, node_modules from Docker context

---

## 2026-03-13 — Session 7: Elevation Features (10 of 12)

### Context
Implemented all 10 actionable elevation features from `docs/ELEVATE-PLAN.md`. Features 11-12 deferred (require Supabase + email infrastructure).

### Changes — Shared Types & Constants
- `shared/src/types/events.ts` — Added 8 new socket events: GUEST_ENTRANCE, TRIGGER_SPOTLIGHT, SPOTLIGHT, TRIGGER_TOAST, TOAST_SPEECH, TOAST_SNAP, TOAST_PHOTO_READY, GUEST_BOOK_OPEN, SUBMIT_GUEST_BOOK. Extended CONFESSION_VOTE (boolean|null), CONFESSION_RESULT (+noCount, mysteryCount), DRINK_SENT (+dedicatedTo), SEND_GROUP_DRINK (+dedicatedTo), WRAPPED_READY (+guestBookEntries, mostAlignedWith, totalGuests)
- `shared/src/types/room.ts` — Added arrivalOrder, cocktailsAccepted, cocktailsDodged to ParticipantStats. Added theme to RoomState
- `shared/src/types/gemini.ts` — Extended WrappedGenerationRequest stats with new fields
- `shared/src/constants/themes.ts` — NEW: 6 scene themes (classic, havana, amalfi, tokyo, marrakech, stockholm) with per-act scene pools, cocktail style, and accent colors

### Changes — Server
- `server/src/socket/party.ts` — Added handlers for TRIGGER_SPOTLIGHT, SUBMIT_GUEST_BOOK, TRIGGER_TOAST, SEND_GROUP_DRINK (with dedications). Added vote/drink tracking for compatibility. Pre-computed compatibility scores with parallel quip generation
- `server/src/socket/lobby.ts` — Added arrival order tracking, GUEST_ENTRANCE event emission
- `server/src/services/gemini/social.ts` — NEW: generateEntranceIntro, generateSpotlightRoast, generateCompatibilityQuip, generateToastSpeech
- `server/src/services/gemini/prompts.ts` — Added ENTRANCE_INTRO_PROMPT, SPOTLIGHT_ROAST_PROMPT, COMPATIBILITY_QUIP_PROMPT, TOAST_SPEECH_PROMPT
- `server/src/services/gemini/confessions.ts` — Extended commentary to reference mystery voters
- `server/src/services/gemini/wrapped.ts` — Drink stats narrative (cocktail names in Lorekeeper's Note)
- `server/src/services/room.ts` — Theme parameter in createRoom
- `server/src/routes/rooms.ts` — Theme in POST /rooms

### Changes — Client
- `client/src/components/party/GuestEntrance.tsx` — NEW: cinematic arrival overlay with portrait + AI intro
- `client/src/components/mechanics/Spotlight.tsx` — NEW: full-screen spotlight with gold glow + AI roast
- `client/src/components/mechanics/GuestBook.tsx` — NEW: floating text input for anonymous entries
- `client/src/components/mechanics/TheToast.tsx` — NEW: synchronized speech → countdown → snap → photo reveal
- `client/src/components/mechanics/ConfessionRound.tsx` — "I'll Never Tell" third vote option, mystery count display
- `client/src/components/mechanics/DrinkRound.tsx` — Dedication badge on drink cards
- `client/src/components/gent/LorekeeperPanel.tsx` — Spotlight controls per guest (30s cooldown), Toast button (Act III+, once)
- `client/src/components/gent/KeysPanel.tsx` — Dedication guest selector before mixing
- `client/src/contexts/PartyContext.tsx` — Added activeEntrance, activeSpotlight, guestBookOpen state with timer ref cleanup
- `client/src/pages/Party.tsx` — Renders new components (GuestEntrance, Spotlight, GuestBook, TheToast)
- `client/src/pages/Wrapped.tsx` — Arrival order easter egg, compatibility "YOUR MATCH" section, guest book entries section
- `client/src/pages/Landing.tsx` — Theme picker after role selection (6 themed cards)

### Simplify Pass
- Fixed setTimeout leaks in PartyContext (entrance/spotlight auto-clear) with refs + cleanup on unmount
- Fixed setTimeout leak in TheToast photo auto-clear
- Moved generateEntranceIntro from inline lobby.ts to social.ts service
- Pre-computed compatibility scores once + parallelized quip generation in wrapped cards
