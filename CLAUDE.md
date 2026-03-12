# The Toast — by The Gents

The Toast is a real-time, multiplayer virtual cocktail party. Three fixed host characters (Keys/The Alchemist, Bass/The Atmosphere, Lore/The Architect) host 4-8 invited guests through a cinematic, AI-powered 35-40 minute evening.

## Stack

| Layer | Technology |
|-------|-----------|
| Monorepo | pnpm workspaces + Turborepo |
| Language | TypeScript (end-to-end) |
| Frontend | React 19, React Router 7, Framer Motion 12 |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite`) |
| State | React Context + Jotai |
| Real-time | Socket.io (client ↔ server) |
| Server | Express + Socket.io |
| AI (text) | Google Gemini (`@google/genai`) |
| AI (image) | Gemini image generation |
| Video | Daily.co (planned) |
| Fonts | Playfair Display (display), DM Sans (body) |

## Repo Structure

```
package.json              Root workspace config
pnpm-workspace.yaml       Defines shared, server, client packages
turbo.json                Build orchestration

shared/                   @the-toast/shared — types & constants
  src/types/              RoomState, events, gents, gemini interfaces
  src/constants/          Brand colors, acts, vibes, scenes, room codes

server/                   @the-toast/server — Express + Socket.io
  src/index.ts            Entry: Express + Socket.io bootstrap
  src/routes/             HTTP API (health, rooms, profiles)
  src/socket/             Socket handlers (lobby, party, reactions)
  src/services/           Room store, session state machine
  src/services/gemini/    AI services (profiles, scenes, cocktails, confessions, wrapped)
  src/utils/              Room codes, logger

client/                   @the-toast/client — React SPA
  src/main.tsx            Entry point
  src/App.tsx             Provider stack + router (5 routes)
  src/contexts/           Socket, Room, Party contexts
  src/pages/              Landing, ProfileSetup, Lobby, Party, Wrapped
  src/components/ui/      Button, Card, Badge, Spinner
  src/components/profile/ ProfileCard, ProfileAvatar, ProfileSetupForm
  src/components/mechanics/  ReactionBar, DrinkRound, ConfessionRound, GroupSnap, VibeShift
  src/components/party/   SceneBackdrop, ActTransition, ActTimer
  src/components/gent/    KeysPanel, BassPanel, LorekeeperPanel
  src/components/layout/  GentControlPanel
  src/styles/globals.css  Tailwind v4 theme + custom utilities
  src/lib/animations.ts   Framer Motion variants

assets/                   Brand logos
docs/                     Architecture, roadmap, status, pitch, ledger
```

## Commands

```bash
pnpm install                              # Install all packages
pnpm run build                            # Build all (Turborepo)
pnpm run dev                              # Dev mode all packages
pnpm --filter @the-toast/server dev       # Server only (port 3001)
pnpm --filter @the-toast/client dev       # Client only (port 5173)
pnpm --filter @the-toast/shared build     # Build shared types
```

## Environment

Server env vars in `server/.env` (copy from `server/.env.example`):
- `GEMINI_API_KEY` — **required**
- `PORT` — default 3001
- `CLIENT_URL` — default http://localhost:5173
- `DAILY_API_KEY`, `UPSTASH_*`, `SUPABASE_*` — optional, have fallbacks

## Key Conventions

### Architecture
- Shared types are canonical — both server and client import from `@the-toast/shared`
- Server owns game state (in-memory Map, will move to Redis)
- Client receives state via Socket.io events, never mutates directly
- All AI calls happen server-side via `services/gemini/`

### Socket Events
- 14 client→server events, 19 server→client events (typed in `shared/src/types/events.ts`)
- All game mechanics flow: client emits → server processes → server broadcasts result

### Components
- UI primitives in `components/ui/`
- Domain components grouped: `profile/`, `mechanics/`, `party/`, `gent/`
- Pages in `pages/` — one per route

### Styling
- Tailwind v4 with `@theme` in `globals.css`
- Brand colors: ember (#ac3d29), teal (#194f4c), gold (#c9a84c), cream (#f5f0e8), charcoal (#1a1a1a)
- Dark cinematic aesthetic — maintain consistency

### AI Integration
- System instruction in `server/src/services/gemini/prompts.ts`
- Context assembly in `context.ts` (<500 tokens)
- Each AI feature has its own service file with fallbacks
- Models: `gemini-2.5-flash` (text), `gemini-2.5-flash-preview-image-generation` (images)

## Deployment

- **Client**: Vercel (Vite framework)
- **Server**: Fly.io (Node.js, WebSocket support)
- **GitHub**: https://github.com/horkesh/The-Gents
