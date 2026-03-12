# State of the App

## Current Architecture (v2 — Full Monorepo)

### Core Concept
"The Toast" is a real-time, multiplayer virtual cocktail party by The Gents. Three fixed host characters host 4-8 invited guests through a cinematic, AI-powered 35-40 minute evening with timer-based 4-act progression, AI-generated content, and tap/gesture-only interaction.

### Package Structure

**`@the-toast/shared`** (10 files) — Canonical types and constants
- Domain types: `RoomState`, `ParticipantProfile`, `ActNumber`, `VibeMode`, `Cocktail`, `SceneData`
- Socket events: 14 client→server, 19 server→client (fully typed)
- Constants: brand colors/fonts, act definitions, vibe modes, scene pools, room codes

**`@the-toast/server`** (20 files) — Express + Socket.io
- HTTP routes: health, rooms (create/fetch), profiles (multipart upload → Gemini)
- Socket handlers: lobby (join/leave), party (all 11 game mechanics), reactions
- Services: in-memory room store, act state machine with timers
- Gemini AI: profiles, scenes, cocktails, confessions, wrapped (each in own file)

**`@the-toast/client`** (30 files) — React 19 SPA
- 5 routes: Landing, ProfileSetup, Lobby, Party, Wrapped
- 3 contexts: Socket, Room, Party
- 25+ components across ui/, profile/, mechanics/, party/, gent/, layout/
- Framer Motion animation system, Tailwind v4 theme

### Feature Status (12 Features)

| # | Feature | Status |
|---|---------|--------|
| 1 | Lobby with room codes | Done |
| 2 | Profile generation via Gemini | Done |
| 3 | Profile cards viewable | Done |
| 4 | 4-act timer structure | Done |
| 5 | Scene generation | Done |
| 6 | Daily.co video | Not started |
| 7 | Emoji reactions | Done |
| 8 | Group drink round | Done |
| 9 | Confession round | Done |
| 10 | Group snap | Partial (compositing placeholder) |
| 11 | Vibe shift | Done |
| 12 | Wrapped cards | Done |

### Known Placeholders (from STATUS.md)
1. Group snap compositing — returns first image instead of Gemini composite
2. Reaction sender name — broadcast as empty string
3. Key moments tracking — always empty in wrapped cards
4. Landing page hardcodes hostRole to 'keys' — needs role selection
5. timesSpotlighted stat — never incremented
6. START_PARTY stub in lobby.ts — duplicate of party.ts handler

### Missing External Integrations
- **Daily.co** — SDK installed, no components or API key
- **Supabase** — SDK installed, schema designed, not integrated
- **Upstash Redis** — SDK installed, not integrated
- **Audio** — empty directory, no files
