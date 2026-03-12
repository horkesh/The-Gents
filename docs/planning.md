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
- [ ] **Daily.co server service** — create `server/src/services/daily.ts`
  `createDailyRoom(roomCode)` + `getDailyRoomToken(roomName, participantId)`.
- [ ] **Daily.co proxy route** — create `server/src/routes/daily.ts`
- [ ] **Wire Daily.co into room creation** — auto-create Daily room alongside game room.

- [ ] **Supabase project + credentials**
  Sign up, add `SUPABASE_URL` + `SUPABASE_SERVICE_KEY` to `server/.env`.
- [ ] **Run Supabase migrations** — sessions, profiles, snapshots, wrapped tables (SQL in ROADMAP.md).
- [ ] **Create Supabase client** — `server/src/services/supabase.ts`
- [ ] **Integrate Supabase** — persist profiles, sessions, snapshots, wrapped cards.

- [ ] **Upstash Redis database + credentials**
  Sign up, add `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` to `server/.env`.
- [ ] **Create Redis client** — `server/src/services/redis.ts`
- [ ] **Migrate room store to Redis** — replace in-memory Map in `server/src/services/room.ts`, add 2h TTL.

---

## Phase 2: Daily.co Video Components

Depends on Phase 1 Daily.co setup.

- [ ] **VideoGrid** — `client/src/components/video/VideoGrid.tsx`
  3 Gent tiles (larger, gold border) + guest grid (2-4 cols).
- [ ] **VideoTile** — `client/src/components/video/VideoTile.tsx`
  Video + name + role badge, active speaker highlight, camera-off fallback.
- [ ] **VideoControls** — `client/src/components/video/VideoControls.tsx`
  Mic toggle, camera toggle.
- [ ] **DailyProvider integration** — wrap Party page, join/leave on mount/unmount.

---

## Phase 3: Audio System

No external dependencies. Needs audio asset files.

- [ ] **Source audio assets** — 3 ambient loops (slow_burn, cruise, ignition) + 5 SFX (pour, clink, shutter, envelope, scratch).
- [ ] **Audio manager** — `client/src/lib/audio.ts`
  Web Audio API, crossfade ambient loops on vibe shift, volume control, SFX triggers.
- [ ] **AudioContext provider** — `client/src/contexts/AudioContext.tsx`
- [ ] **Integrate SFX** — wire into VibeShift, DrinkRound, ConfessionRound, GroupSnap components.

---

## Phase 4: Polish & Error Handling

- [ ] **Error boundaries** — app root + per-page with retry buttons.
- [ ] **Socket reconnection** — auto-reconnect with backoff, room rejoin from sessionStorage.
- [ ] **Loading skeletons** — lobby participant list, scene transitions, cocktail generation.
- [ ] **Mobile optimization** — 44px touch targets, prevent zoom on focus, orientation lock.
- [ ] **Accessibility** — focus rings, ARIA labels, `prefers-reduced-motion`, color contrast audit.

---

## Phase 5: Deployment

- [ ] **Server Dockerfile** — `server/Dockerfile` (Node 20, pnpm, build shared+server).
- [ ] **Deploy server to Fly.io** — `fly launch` + `fly secrets set`.
- [ ] **Configure Vercel for client** — Vite framework, `VITE_API_URL` env var, SPA fallback.
- [ ] **DNS + SSL** — custom domains on both, update `CLIENT_URL` on server.

---

## Progress Log

| Date | What | Docs Updated |
|------|------|-------------|
| 2026-03-13 | Created planning tracker | planning.md |
| 2026-03-13 | Priority 0: All 6 quick fixes complete | planning.md, STATUS.md |
