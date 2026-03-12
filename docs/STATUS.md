# The Toast — Implementation Status

> Last updated: February 2025

---

## Build Status

| Package | Build | Notes |
|---------|-------|-------|
| `@the-toast/shared` | **Pass** | TypeScript compiles, composite references work |
| `@the-toast/server` | **Pass** | TypeScript compiles to `dist/` |
| `@the-toast/client` | **Pass** | TypeScript + Vite build (505 modules, 0 errors) |

- **Server**: Boots on port 3001, health endpoint responds, room creation API tested
- **Client**: Vite dev server on port 5173, all pages render, navigation works
- **Full build**: `pnpm run build` completes in ~9s (Turborepo, all 3 packages)

### Browser Verification

Tested end-to-end in Chrome:
- Landing page renders with brand styling (logo, gold heading, ember/gold buttons)
- "HOST A PARTY" creates room via API and navigates to lobby
- Lobby displays room code (e.g., "COVE") with participant list
- "JOIN A PARTY" shows code input, navigates to profile setup
- Profile setup page renders camera/upload + name form

---

## MVP Feature Status (12 Features)

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 1 | Lobby with room codes | ✅ Complete | Room creation, code display, participant list, real-time joins |
| 2 | Profile generation via Gemini | ✅ Complete | Photo upload → alias + traits + dossier + portrait |
| 3 | Profile cards viewable | ✅ Complete | Tap avatar to view full profile card |
| 4 | 4-act timer structure | ✅ Complete | 5/10/15/10 min durations, auto-advance, Lorekeeper override |
| 5 | Scene generation | ✅ Complete | Text + backdrop image per act, scene pool seeding |
| 6 | Daily.co video | ❌ Not started | SDK installed, no components built, needs API key |
| 7 | Emoji reactions | ✅ Complete | 6 emojis, floating animations, real-time broadcast |
| 8 | Group drink round | ✅ Complete | Keys triggers → Gemini cocktail → card modal → accept/dodge |
| 9 | Confession round | ✅ Complete | Lorekeeper triggers → prompt → YES/NO vote → result + commentary |
| 10 | Group snap | ⚠️ Partial | Countdown + capture works; compositing uses placeholder (first image) |
| 11 | Vibe shift | ✅ Complete | 3 modes with CSS filters, narration overlay, room state update |
| 12 | Wrapped cards | ✅ Complete | Per-participant stats, Lorekeeper's Note, session title, share button |

**Summary**: 9/12 fully implemented, 1 partial, 1 not started, 1 (video) blocked on external service.

---

## Known Placeholders & Incomplete Logic

### 1. Group Snap Photo Compositing
**File**: `server/src/socket/party.ts` (UPLOAD_SNAP handler)
**Issue**: When clients upload selfies after a group snap, the server currently uses the first uploaded image as the result instead of compositing all images via Gemini.
**Fix needed**: Implement real Gemini composite generation using all uploaded selfies + current scene backdrop.

### 2. Reaction Sender Name
**File**: `server/src/socket/reactions.ts`
**Issue**: `senderName` is broadcast as empty string `''` instead of the actual participant name.
**Fix needed**: Look up sender's profile from room state by socket ID.

### 3. Key Moments Tracking
**File**: `server/src/socket/party.ts` (generateWrappedCards function)
**Issue**: `keyMoments` array is always empty when generating Wrapped cards. Should track notable events (first drink, memorable confessions, etc.) throughout the session.
**Fix needed**: Populate `keyMoments` during game mechanics.

### 4. Landing Page Gent Role Selection
**File**: `client/src/pages/Landing.tsx` (handleHost function, line 12)
**Issue**: "HOST A PARTY" hardcodes `hostRole: 'keys'`. Should show role selection (Keys/Bass/Lorekeeper) before creating room.
**Fix needed**: Add role selection UI before room creation.

### 5. timesSpotlighted Stat
**File**: `server/src/socket/party.ts`
**Issue**: `timesSpotlighted` in `ParticipantStats` is never incremented. The spotlight mechanic is not implemented.
**Fix needed**: Define what "spotlighted" means in gameplay and implement tracking.

### 6. START_PARTY Lobby Handler
**File**: `server/src/socket/lobby.ts`
**Issue**: The lobby handler for START_PARTY has a comment "will be expanded in Phase 8" — the actual start logic lives in `party.ts` but lobby.ts has a stub.
**Fix needed**: Consolidate or remove the duplicate handler.

---

## Missing External Integrations

### Daily.co Video (Critical)
- **Status**: SDK packages installed (`@daily-co/daily-js`, `@daily-co/daily-react`)
- **Missing**:
  - Daily.co API key (needs account signup)
  - `server/src/services/daily.ts` — REST API for room creation
  - `server/src/routes/daily.ts` — proxy route
  - `client/src/components/video/VideoGrid.tsx` — participant video grid
  - `client/src/components/video/VideoTile.tsx` — individual video tile
  - `client/src/components/video/VideoControls.tsx` — mute/camera toggle
- **Impact**: Party view currently shows static avatar tiles instead of live video
- **Room URL**: `RoomState.dailyRoomUrl` is empty string placeholder

### Supabase Persistence
- **Status**: SDK installed (`@supabase/supabase-js`), env vars defined, schema designed
- **Missing**:
  - Supabase project (needs signup)
  - Database migrations (tables: sessions, profiles, snapshots, wrapped)
  - Integration in room.ts and session.ts to persist data
- **Impact**: All data lives in-memory Maps, lost on server restart
- **Designed Schema**: See `ROADMAP.md` for full SQL

### Upstash Redis
- **Status**: SDK installed (`@upstash/redis`), env vars defined
- **Missing**:
  - Upstash database (needs signup)
  - `server/src/services/redis.ts` client
  - Migration of room.ts from Map to Redis-backed store
  - TTL-based session expiry (planned: 2 hours)
- **Impact**: No session recovery on server restart, no horizontal scaling

### Audio System
- **Status**: `client/public/audio/` directory exists (empty)
- **Missing**:
  - Audio files (ambient loops per vibe mode, SFX)
  - `client/src/contexts/AudioContext.tsx` — audio state management
  - `client/src/lib/audio.ts` — audio manager
  - Integration in VibeShift, DrinkRound, ConfessionRound, GroupSnap
- **Impact**: Completely silent experience (visual-only)
- **Planned sounds**: Pour, clink, shutter, envelope, vinyl scratch, 3 ambient loops

---

## Bugs Fixed During Build

| Bug | Root Cause | Fix |
|-----|-----------|-----|
| ESM module resolution failure | `@the-toast/shared` barrel exports used extensionless imports | Added `"type": "module"` to shared/package.json, changed all barrel imports to use `.js` extensions |
| Turborepo workspace resolution | Missing `packageManager` field in root package.json | Added `"packageManager": "pnpm@10.29.3"` |
| Express Router type inference (TS2742) | Router return type couldn't be named without deep type reference | Added explicit `RouterType` annotations to all route files |
| Framer Motion ease type errors | `ease: 'easeOut'` typed as `string` instead of literal | Added `as const` assertions and `[number, number, number, number]` tuples |
| Port 3001 already in use | Previous server process left running | Kill process via `netstat`/`taskkill` |
| pnpm approve-builds prompt | `esbuild` and `protobufjs` needed build approval | Added `onlyBuiltDependencies` to root package.json |

---

## File Count

| Package | Source Files | Config Files |
|---------|-------------|--------------|
| shared | 10 | 2 |
| server | 20 | 4 |
| client | 30 | 4 |
| root | — | 5 |
| **Total** | **60** | **15** |
