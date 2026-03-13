# The Toast — Active Planning

> Living tracker. Updated as work is completed.
> Last updated: 2026-03-13

---

## Priority 0: Quick Fixes (Known Placeholders)

These are bugs/stubs in the existing codebase. No external dependencies required.

- [x] **Fix reaction sender name** — `server/src/socket/reactions.ts`
  Look up sender's `participantProfile.name` from room state by socket ID instead of broadcasting empty string.

- [x] **Remove START_PARTY stub in lobby** — `server/src/socket/lobby.ts`
  Delete the duplicate handler; real logic lives in `server/src/socket/party.ts`.

- [x] **Increment timesSpotlighted** — `server/src/socket/party.ts`
  Incremented for all participants who vote in confession rounds.

- [x] **Track key moments for Wrapped** — `server/src/socket/party.ts`
  Tracks drinks served, confession prompts/results, vibe shifts, and group snaps. Fed into Wrapped card generation.

- [x] **Add Gent role selection to Landing** — `client/src/pages/Landing.tsx`
  Three-button role picker (Alchemist/Atmosphere/Architect) shown before room creation.

- [x] **Fix group snap compositing** — `server/src/socket/party.ts` + new `server/src/services/gemini/composite.ts`
  Real Gemini composite generation using all uploaded selfies + scene backdrop. Falls back to first image on failure.

---

## Phase 1: External Service Setup

Accounts and API keys required. Each service has an in-memory fallback, so these can be done incrementally.

- [ ] **Daily.co account + API key**
  Sign up, add `DAILY_API_KEY` to `server/.env`.
- [x] **Daily.co server service** — `server/src/services/daily.ts`
  `createDailyRoom(roomCode)` + `getDailyRoomToken(roomName, participantId)`. Graceful no-op when unconfigured.
- [x] **Daily.co proxy route** — `server/src/routes/daily.ts`
- [x] **Wire Daily.co into room creation** — auto-creates Daily room alongside game room when API key present.

- [ ] **Supabase project + credentials**
  Sign up, add `SUPABASE_URL` + `SUPABASE_SERVICE_KEY` to `server/.env`.
- [ ] **Run Supabase migrations** — sessions, profiles, snapshots, wrapped tables (SQL in ROADMAP.md).
- [x] **Create Supabase client** — `server/src/services/supabase.ts`
  Full CRUD: createSession, endSession, saveProfile, saveSnapshot, saveWrapped. No-op when unconfigured.
- [ ] **Integrate Supabase** — persist profiles, sessions, snapshots, wrapped cards.

- [ ] **Upstash Redis database + credentials**
  Sign up, add `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` to `server/.env`.
- [x] **Create Redis client** — `server/src/services/redis.ts`
  getRoom, setRoom, deleteRoom, touchRoom with 2h TTL. No-op when unconfigured.
- [ ] **Migrate room store to Redis** — replace in-memory Map in `server/src/services/room.ts`, add 2h TTL.

---

## Phase 2: Daily.co Video Components

Depends on Phase 1 Daily.co setup.

- [x] **VideoGrid** — `client/src/components/video/VideoGrid.tsx`
  3 Gent tiles (larger, gold border) + guest grid, active speaker highlight.
- [x] **VideoTile** — `client/src/components/video/VideoTile.tsx`
  Video track + audio track, camera-off portrait fallback, speaker ring.
- [x] **VideoControls** — `client/src/components/video/VideoControls.tsx`
  Mic toggle, camera toggle with visual state.
- [x] **DailyProvider integration** — Party page wrapped with DailyProvider, join/leave on mount/unmount, static avatar fallback when no video.

---

## Phase 3: Audio System

No external dependencies. Needs audio asset files.

- [ ] **Source audio assets** — 3 ambient loops (slow_burn, cruise, ignition) + 5 SFX (pour, clink, shutter, envelope, scratch).
- [x] **Audio manager** — `client/src/lib/audio.ts`
  Web Audio API, crossfade ambient loops on vibe shift, volume control, SFX triggers.
- [x] **AudioContext provider** — `client/src/contexts/AudioContext.tsx`
- [x] **Integrate SFX** — wire into VibeShift, DrinkRound, ConfessionRound, GroupSnap components.

---

## Phase 4: Polish & Error Handling

- [x] **Error boundaries** — app root ErrorBoundary with retry button.
- [x] **Socket reconnection** — auto-reconnect with exponential backoff (1s→10s, 10 attempts), room rejoin from sessionStorage.
- [ ] **Loading skeletons** — lobby participant list, scene transitions, cocktail generation.
- [x] **Mobile optimization** — 44px min touch targets on buttons, prevent zoom on input focus, safe area padding.
- [x] **Accessibility** — focus rings (:focus-visible), ARIA labels on reactions/controls, `prefers-reduced-motion` disable.

---

## Phase 5: Deployment

- [x] **Server Dockerfile** — `server/Dockerfile` (Node 20, pnpm, multi-stage build, shared+server).
- [x] **Fly.io config** — `fly.toml` at repo root with WebSocket-friendly settings.
- [x] **Configure Vercel for client** — `client/vercel.json` with SPA rewrites, monorepo build command.
- [ ] **Deploy server to Fly.io** — `fly launch` + `fly secrets set` (requires Fly.io account).
- [ ] **Deploy client to Vercel** — import project + set `VITE_API_URL` (requires Vercel account).
- [ ] **DNS + SSL** — custom domains on both, update `CLIENT_URL` on server.

---

## Progress Log

| Date | What | Docs Updated |
|------|------|-------------|
| 2026-03-13 | Created planning tracker | planning.md |
| 2026-03-13 | Priority 0: All 6 quick fixes complete | planning.md, STATUS.md |
| 2026-03-13 | Phase 1: External service layers built (Daily, Supabase, Redis) | planning.md |
| 2026-03-13 | Phase 2: Video components (VideoGrid, VideoTile, VideoControls) + DailyProvider | planning.md |
| 2026-03-13 | Phase 3: Audio system (AudioManager, AudioProvider, SFX wiring) | planning.md |
| 2026-03-13 | Phase 4: Error boundary, socket reconnection, mobile/a11y polish | planning.md |
| 2026-03-13 | Phase 5: Deployment configs (Dockerfile, fly.toml, vercel.json) | planning.md |
