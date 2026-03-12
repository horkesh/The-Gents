# The Toast — Technical Architecture

## Project Overview

**The Toast** is a browser-based virtual cocktail party app by **The Gents**. Three fixed host characters — Keys & Cocktails (The Alchemist), Beard & Bass (The Atmosphere), and The Lorekeeper (The Architect) — host 4-8 invited female guests through a cinematic, AI-powered group experience lasting 35-40 minutes.

The evening follows a structured 4-act format with timer-based progression. All content (scenes, portraits, cocktails, prompts, wrapped cards) is AI-generated via Google Gemini. Interaction during the party is tap/gesture-only — no text input.

### Experience Flow

```
LANDING (/) → HOST A PARTY (creates room)
                    ↓
           LOBBY (/lobby/:code) ← JOIN A PARTY → PROFILE SETUP (/setup/:code)
                    ↓
           ACT I: Arrivals (5 min)
                    ↓
           ACT II: Warm-Up (10 min)
                    ↓
           ACT III: Main Event (15 min)
                    ↓
           ACT IV: Last Call (10 min)
                    ↓
           WRAPPED (/wrapped/:code) — personalized recap card
```

---

## Technology Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Monorepo | pnpm workspaces + Turborepo | pnpm 10.x, turbo 2.8 | Package management + build orchestration |
| Language | TypeScript | 5.7+ | End-to-end type safety |
| Frontend | React | 19.x | UI framework |
| Routing | React Router | 7.x | Client-side routing (5 routes) |
| Bundler | Vite | 6.x | Dev server + production builds |
| Styling | Tailwind CSS | 4.x | Utility-first CSS with custom theme |
| Animations | Framer Motion | 12.x | Page transitions, reveals, reactions |
| State | React Context + Jotai | 2.x | Client state management |
| Real-time | Socket.io | 4.8.x | Bidirectional WebSocket events |
| Server | Express | 4.21.x | HTTP API + Socket.io host |
| AI (text) | Google Gemini 2.5 Flash | `@google/genai` 1.x | Scenes, cocktails, prompts, wrapped |
| AI (image) | Gemini 2.5 Flash Preview | `@google/genai` 1.x | Portraits, backdrops, cocktail photos |
| Video | Daily.co | `@daily-co/daily-react` 0.24 | WebRTC group video (planned) |
| File upload | Multer | 1.4.x | Photo upload for profile generation |
| Screenshots | html-to-image | 1.11.x | Wrapped card export |

### Planned (Not Yet Integrated)

| Technology | Purpose |
|-----------|---------|
| Upstash Redis | Session state with TTL (currently in-memory) |
| Supabase | Persistent DB for profiles, sessions, photos (currently in-memory) |
| Fly.io | Server deployment |
| Vercel | Client deployment |

---

## Monorepo Structure

```
the-toast/
├── package.json                    # Root workspace: pnpm + turbo scripts
├── pnpm-workspace.yaml             # Defines shared, server, client packages
├── turbo.json                      # Build task orchestration (dev, build, lint)
├── pnpm-lock.yaml                  # Dependency lockfile
├── .gitignore                      # node_modules, dist, .env, .turbo, logs
├── .pnpm-approve-builds.json       # Approved native build packages
│
├── assets/                         # Original brand assets
│   ├── 01 Gold logo.png            # Gold monochrome logo
│   └── 02 color logo.png           # Full color logo
│
├── shared/                         # @the-toast/shared — types & constants
│   ├── package.json                # type: module, ESM barrel exports
│   ├── tsconfig.json               # ES2022, composite: true
│   └── src/
│       ├── index.ts                # Re-exports types + constants (with .js extensions)
│       ├── types/
│       │   ├── index.ts            # Barrel: room, events, gents, gemini
│       │   ├── room.ts             # Core types: RoomState, ParticipantProfile, etc.
│       │   ├── events.ts           # Socket.io typed events (C→S and S→C)
│       │   ├── gents.ts            # GentArchetype + GENT_ARCHETYPES constant
│       │   └── gemini.ts           # AI request/response interfaces
│       └── constants/
│           ├── index.ts            # Barrel: brand, acts, scenes
│           ├── brand.ts            # BRAND colors/fonts, EMOJIS array
│           ├── acts.ts             # ACTS definitions, ACT_ORDER, VIBE_MODES
│           └── scenes.ts           # SCENE_POOLS per act, ROOM_CODE_WORDS
│
├── server/                         # @the-toast/server — Express + Socket.io
│   ├── package.json                # type: module, deps: genai, express, socket.io
│   ├── tsconfig.json               # ES2022, declaration: true
│   ├── .env                        # Environment variables (gitignored)
│   ├── .env.example                # Template for env vars
│   └── src/
│       ├── index.ts                # Express + Socket.io bootstrap, route mounting
│       ├── config.ts               # Environment variable loader with defaults
│       ├── routes/
│       │   ├── health.ts           # GET /api/health
│       │   ├── rooms.ts            # POST /api/rooms, GET /api/rooms/:code
│       │   └── profiles.ts         # POST /api/profiles/generate (multipart)
│       ├── socket/
│       │   ├── handler.ts          # Main connection orchestrator
│       │   ├── lobby.ts            # JOIN_ROOM, LEAVE_ROOM, disconnect
│       │   ├── party.ts            # All game mechanics + act progression
│       │   └── reactions.ts        # SEND_REACTION broadcasting
│       ├── services/
│       │   ├── room.ts             # In-memory room store (Map)
│       │   ├── session.ts          # Act state machine with timers
│       │   └── gemini/
│       │       ├── client.ts       # GoogleGenAI SDK init, model constants
│       │       ├── prompts.ts      # System instruction + image style templates
│       │       ├── context.ts      # Session context assembly (<500 tokens)
│       │       ├── profiles.ts     # Photo → portrait + alias + traits + dossier
│       │       ├── scenes.ts       # Act + vibe → description + backdrop image
│       │       ├── cocktails.ts    # Context → cocktail name + story + image
│       │       ├── confessions.ts  # Context → prompt + commentary
│       │       └── wrapped.ts      # Stats → Lorekeeper's Note, session title, vibe narration
│       └── utils/
│           ├── codes.ts            # Room code generator (curated word list)
│           └── logger.ts           # [The Toast] prefixed console logger
│
├── client/                         # @the-toast/client — React SPA
│   ├── package.json                # type: module, deps: react 19, framer-motion 12
│   ├── tsconfig.json               # ES2022, jsx: react-jsx, path alias @/*
│   ├── vite.config.ts              # React + Tailwind plugins, proxy to :3001
│   ├── index.html                  # Google Fonts, meta viewport, theme-color
│   ├── public/
│   │   ├── logo/
│   │   │   ├── 01_Gold_logo.png    # Gold logo (dark backgrounds)
│   │   │   └── 02_color_logo.png   # Color logo
│   │   ├── audio/                  # (empty — planned for ambient loops + SFX)
│   │   └── fonts/                  # (empty — using Google Fonts CDN)
│   └── src/
│       ├── main.tsx                # React root mount
│       ├── App.tsx                 # Provider stack + BrowserRouter + routes
│       ├── styles/
│       │   └── globals.css         # Tailwind v4 @theme, custom utilities
│       ├── lib/
│       │   └── animations.ts       # Framer Motion variant definitions
│       ├── contexts/
│       │   ├── SocketContext.tsx    # Socket.io connection (autoConnect: false)
│       │   ├── RoomContext.tsx      # Room state, participants, join/leave/start
│       │   └── PartyContext.tsx     # Act, scene, vibe, active mechanics
│       ├── pages/
│       │   ├── Landing.tsx         # HOST / JOIN entry point
│       │   ├── ProfileSetup.tsx    # Photo + name → AI profile generation
│       │   ├── Lobby.tsx           # Waiting room with room code + participant list
│       │   ├── Party.tsx           # Main party view (all mechanics)
│       │   └── Wrapped.tsx         # End-of-session recap card
│       └── components/
│           ├── ui/
│           │   ├── index.ts        # Barrel exports
│           │   ├── Button.tsx      # 4 variants, 3 sizes, Framer Motion tap
│           │   ├── Card.tsx        # Charcoal card with gold border + optional glow
│           │   ├── Badge.tsx       # 4 color variants, uppercase tracking
│           │   └── Spinner.tsx     # Rotating gold border circle
│           ├── profile/
│           │   ├── ProfileCard.tsx      # Full profile view (portrait, alias, traits, dossier)
│           │   ├── ProfileAvatar.tsx    # Circular avatar with role-based border
│           │   └── ProfileSetupForm.tsx # Camera capture / file upload + name input
│           ├── mechanics/
│           │   ├── ReactionBar.tsx      # 6 emoji buttons (always visible)
│           │   ├── FloatingReaction.tsx  # Animated floating emojis
│           │   ├── DrinkRound.tsx       # Cocktail card modal (accept/dodge)
│           │   ├── ConfessionRound.tsx  # 3-phase: prompt → vote → result
│           │   ├── GroupSnap.tsx        # Countdown → camera capture → result
│           │   └── VibeShift.tsx        # CSS filter overlay + narration text
│           ├── party/
│           │   ├── SceneBackdrop.tsx    # Full-screen AI scene with dark overlay
│           │   ├── ActTransition.tsx    # Cinematic act change overlay (4s)
│           │   └── ActTimer.tsx         # Progress bar + remaining time
│           ├── gent/
│           │   ├── KeysPanel.tsx        # SHAKE TO MIX cocktail control
│           │   ├── BassPanel.tsx        # 3 vibe mode selection cards
│           │   └── LorekeeperPanel.tsx  # SNAP, CONFESSION, NEXT ACT, WRAP IT UP
│           ├── layout/
│           │   └── GentControlPanel.tsx # Slide-up tabbed overlay (Gents only)
│           ├── video/                   # (empty — planned for Daily.co integration)
│           └── wrapped/                 # (empty — wrapped layout is in pages/Wrapped.tsx)
```

---

## Shared Package (`@the-toast/shared`)

### ESM Module Pattern

All barrel exports use `.js` extensions for ESM compatibility:

```typescript
// shared/src/index.ts
export * from './types/index.js';
export * from './constants/index.js';
```

### Core Types (`shared/src/types/room.ts`)

```typescript
type GentRole = 'keys' | 'bass' | 'lorekeeper'
type ParticipantRole = GentRole | 'guest'
type ActNumber = 0 | 1 | 2 | 3 | 4 | 5    // 0=lobby, 1-4=acts, 5=wrapped
type VibeMode = 'slow_burn' | 'cruise' | 'ignition'

interface VibeState {
  energy: VibeMode
  mood: string
}

interface ParticipantProfile {
  id: string
  name: string
  alias: string               // AI-generated cocktail alias
  role: ParticipantRole
  photoUrl: string            // Original selfie
  portraitUrl: string         // AI-stylized portrait
  traits: [string, string, string]  // 3 AI-generated traits
  dossier: string             // 1-line AI dossier
  connected: boolean
}

interface ParticipantStats {
  drinksReceived: number
  drinksAccepted: number
  drinksDodged: number
  confessionsParticipated: number
  timesSpotlighted: number
  snapsAppeared: number
}

interface Cocktail {
  name: string
  story: string
  imageUrl: string
}

interface SceneData {
  description: string         // max 25 words
  backdropUrl: string         // AI-generated 16:9 image
  location: string            // Location name
}

interface SessionEvent {
  id: string
  type: string
  message: string
  timestamp: number
}

interface RoomState {
  code: string                // 4-letter word from curated list
  participants: ParticipantProfile[]
  act: ActNumber
  scene: SceneData | null
  vibe: VibeState
  events: SessionEvent[]
  dailyRoomUrl: string        // Empty string until Daily.co integrated
  startedAt: number | null
  actStartedAt: number | null
}
```

### Socket Event Types (`shared/src/types/events.ts`)

Fully typed `ClientToServerEvents` (14 events) and `ServerToClientEvents` (19 events). See **Socket Event Registry** below.

### Gent Archetypes (`shared/src/types/gents.ts`)

| Role | Name | Archetype | Age | Superpower |
|------|------|-----------|-----|------------|
| keys | Keys & Cocktails | The Alchemist | 45 | Reads people through what they drink |
| bass | Beard & Bass | The Atmosphere | 35 | Controls the energy of any room |
| lorekeeper | The Lorekeeper | The Architect | 45 | Remembers everything, documents moments |

### Constants

**Brand** (`shared/src/constants/brand.ts`):
- Colors: ember `#ac3d29`, teal `#194f4c`, gold `#c9a84c`, cream `#f5f0e8`, charcoal `#1a1a1a`
- Fonts: display = Playfair Display, body = DM Sans
- Emojis: `['🔥', '❤️', '😂', '🥂', '👀', '💀']`

**Acts** (`shared/src/constants/acts.ts`):

| Act | Name | Subtitle | Duration | Default Vibe | Mechanics |
|-----|------|----------|----------|--------------|-----------|
| I | ACT I | Arrivals | 5 min | slow_burn | group_drink, snap |
| II | ACT II | Warm-Up | 10 min | cruise | confession, group_drink, snap, vibe_shift |
| III | ACT III | Main Event | 15 min | cruise | confession, group_drink, snap, vibe_shift |
| IV | ACT IV | Last Call | 10 min | slow_burn | group_drink, snap |

**Vibe Modes** (`shared/src/constants/acts.ts`):

| Mode | Label | Icon | Description |
|------|-------|------|-------------|
| slow_burn | SLOW BURN | 🕯️ | Lo-fi jazz, vinyl crackle, candlelight |
| cruise | CRUISE | 🌊 | Bossa nova, warm bass, easy rhythm |
| ignition | IGNITION | 🔥 | Uptempo lounge, confident brass |

**Room Code Words** (`shared/src/constants/scenes.ts`): 25 curated 4-letter words (SILK, NOIR, JAZZ, HAZE, GLOW, WINE, DEEP, LUNA, FIRE, SOUL, DUSK, VEIL, MIST, ONYX, SAGE, RUBY, ECHO, WREN, DUNE, PLUM, COVE, FERN, OPAL, LUSH, GILT)

**Scene Pools** (`shared/src/constants/scenes.ts`): Curated scene seeds per act (rooftop bars, jazz lounges, etc.) used as starting points for Gemini scene generation.

---

## Server Package (`@the-toast/server`)

### Entry Point (`server/src/index.ts`)

- Express app with CORS (configured for `CLIENT_URL`)
- JSON body parser (10MB limit for base64 images)
- Socket.io server on `/party` namespace
- Routes mounted at `/api/health`, `/api/rooms`, `/api/profiles`

### HTTP API Routes

#### `GET /api/health`
```
Response: { status: 'ok', service: 'the-toast' }
```

#### `POST /api/rooms`
```
Request:  { hostId: string, hostRole: GentRole }
Response: { code: string, room: RoomState }
```
Creates a new room with a unique 4-letter code from the curated word list.

#### `GET /api/rooms/:code`
```
Response: RoomState | { error: 'Room not found' }
```

#### `POST /api/profiles/generate`
```
Request:  FormData { name: string, role: string, photo: File (max 5MB) }
Response: { alias: string, traits: string[], dossier: string, portraitBase64: string }
```
Sends photo to Gemini for AI profile generation (text + stylized portrait image).

### Socket.io Event Registry

**Namespace**: `/party`

#### Client → Server Events

| Event | Payload | Trigger | Handler |
|-------|---------|---------|---------|
| `JOIN_ROOM` | `{ code, profile }` | Guest/Gent enters lobby | lobby.ts |
| `LEAVE_ROOM` | `{}` | User exits | lobby.ts |
| `START_PARTY` | `{}` | Gent starts the evening | party.ts |
| `NEXT_ACT` | `{}` | Lorekeeper advances act | party.ts |
| `WRAP_IT_UP` | `{}` | Lorekeeper ends evening | party.ts |
| `SEND_REACTION` | `{ emoji }` | Any participant | reactions.ts |
| `SEND_GROUP_DRINK` | `{}` | Keys triggers cocktail | party.ts |
| `ACCEPT_DRINK` | `{ cocktailName }` | Guest accepts drink | party.ts |
| `DODGE_DRINK` | `{ cocktailName }` | Guest dodges drink | party.ts |
| `TRIGGER_CONFESSION` | `{}` | Lorekeeper triggers | party.ts |
| `CONFESSION_VOTE` | `{ answer: boolean }` | Guest votes YES/NO | party.ts |
| `TRIGGER_SNAP` | `{}` | Lorekeeper triggers | party.ts |
| `UPLOAD_SNAP` | `{ imageData: string }` | Client sends selfie | party.ts |
| `VIBE_SHIFT` | `{ mode: VibeMode }` | Bass shifts energy | party.ts |

#### Server → Client Events

| Event | Payload | Trigger |
|-------|---------|---------|
| `ROOM_STATE_UPDATE` | `RoomState` | Any room state change |
| `PARTICIPANT_JOINED` | `ParticipantProfile` | New participant joins |
| `PARTICIPANT_LEFT` | `{ id }` | Participant disconnects |
| `PARTICIPANT_RECONNECTED` | `{ id }` | Participant rejoins |
| `PARTY_STARTED` | `{ scene: SceneData }` | Gent starts party |
| `ACT_TRANSITION` | `{ act, scene, narration }` | Act changes |
| `SCENE_UPDATE` | `SceneData` | Scene updates mid-act |
| `TIMER_SYNC` | `{ act, elapsed, duration }` | Timer synchronization |
| `REACTION` | `{ emoji, senderName, senderId }` | Emoji broadcast |
| `DRINK_SENT` | `{ cocktail: Cocktail, fromGent }` | Cocktail served |
| `DRINK_ACCEPTED` | `{ participantName, cocktailName }` | Guest accepts |
| `DRINK_DODGED` | `{ participantName, cocktailName, commentary }` | Guest dodges |
| `CONFESSION_PROMPT` | `{ question }` | Confession begins |
| `CONFESSION_RESULT` | `{ question, yesCount, total, commentary }` | Voting complete |
| `SNAP_COUNTDOWN` | `{ seconds }` | Countdown ticks |
| `PHOTO_READY` | `{ imageUrl, act }` | Photo processed |
| `VIBE_CHANGED` | `{ mode, narration }` | Vibe shift complete |
| `WRAPPED_READY` | `{ stats, lorekeeperNote, sessionTitle, photos, profile }` | Per-participant |
| `ERROR` | `{ message }` | Server error |

### Services Layer

#### Room Service (`server/src/services/room.ts`)

In-memory `Map<string, RoomState>` store. Functions:

- `createRoom(hostId, hostRole)` — generates unique code (50 retry max), initializes room state
- `getRoom(code)` — lookup by code
- `joinRoom(code, profile)` — adds participant, detects reconnection
- `leaveRoom(code, participantId)` — soft delete (sets `connected: false`)
- `updateParticipantProfile(code, id, updates)` — partial profile update
- `updateRoomState(code, updates)` — partial room state update
- `destroyRoom(code)` — removes from store

Initial room state: `{ act: 0, vibe: { energy: 'slow_burn', mood: 'anticipation' }, dailyRoomUrl: '', events: [] }`

#### Session Service (`server/src/services/session.ts`)

Act state machine with timer-based progression:

- `startParty(code, namespace)` — generates Act I scene via Gemini, sets act=1, starts timer
- `advanceAct(code, namespace)` — progresses to next act, generates new scene, broadcasts transition
- `wrapUp(code, namespace)` — jumps to act=5 (WRAPPED)

Timers stored in per-room `Map<string, NodeJS.Timeout>`. Auto-advances at act duration.

#### Gemini AI Services (`server/src/services/gemini/`)

**Client** (`client.ts`):
- Models: `gemini-2.5-flash` (text), `gemini-2.5-flash-preview-image-generation` (images)
- Initialized via `@google/genai` SDK with `GEMINI_API_KEY`

**System Instruction** (`prompts.ts`):
- Persona: "Invisible fourth host" at a European summer cocktail party
- Tone: Wes Anderson narrator meets seasoned bartender
- Constraints: max 25 words for scene descriptions, max 15 words for toasts/roasts
- Brand colors embedded: ember, teal, gold, cream, charcoal

**Context Assembly** (`context.ts`):
- `assembleContext(room)` — builds `SessionContext` with connected participants, current act/vibe, last 10 events
- `formatContextForPrompt(ctx)` — serializes to string, target <500 tokens

**Profile Generation** (`profiles.ts`):
- Input: photo (base64), name, role
- Step 1: Text model generates JSON `{ alias, traits[3], dossier }` from photo
- Step 2: Image model generates stylized portrait
- Fallback: "Unknown" alias, generic traits on parse failure

**Scene Generation** (`scenes.ts`):
- Input: act number, vibe mode, base location, previous scene
- Selects random seed from `SCENE_POOLS[act]`
- Generates description + location name (text) + backdrop image (16:9, no people)
- Maintains scene continuity across acts

**Cocktail Generation** (`cocktails.ts`):
- Input: session context, optional target alias
- Generates: evocative original name (never real cocktails) + story + photorealistic image
- Fallback: "The Unnamed"

**Confession Generation** (`confessions.ts`):
- `generateConfession(context)` — "have you ever..." prompt (provocative but party-appropriate)
- `generateConfessionCommentary(question, yesCount, total, context)` — witty result line (max 15 words)
- Tracks `usedPrompts` to avoid repetition

**Wrapped Generation** (`wrapped.ts`):
- `generateWrappedNote(request)` — 2-sentence personalized Lorekeeper's Note referencing stats
- `generateSessionTitle(location)` — "The [Location] Session" style title
- `generateVibeNarration(oldVibe, newVibe)` — cinematic transition line

### Configuration (`server/src/config.ts`)

| Variable | Required | Default | Purpose |
|----------|----------|---------|---------|
| `GEMINI_API_KEY` | Yes | — | Google Gemini API key |
| `PORT` | No | 3001 | Server port |
| `CLIENT_URL` | No | `http://localhost:5173` | CORS origin |
| `DAILY_API_KEY` | No | `''` | Daily.co API key (planned) |
| `UPSTASH_REDIS_REST_URL` | No | `''` | Redis URL (planned) |
| `UPSTASH_REDIS_REST_TOKEN` | No | `''` | Redis auth (planned) |
| `SUPABASE_URL` | No | `''` | Supabase URL (planned) |
| `SUPABASE_SERVICE_KEY` | No | `''` | Supabase key (planned) |

---

## Client Package (`@the-toast/client`)

### App Shell (`client/src/App.tsx`)

Provider nesting order: `SocketProvider` → `RoomProvider` → `PartyProvider` → `BrowserRouter`

Routes:

| Path | Component | Purpose |
|------|-----------|---------|
| `/` | `Landing` | Host or join entry |
| `/setup/:code` | `ProfileSetup` | AI profile generation |
| `/lobby/:code` | `Lobby` | Waiting room |
| `/party/:code` | `Party` | Main experience |
| `/wrapped/:code` | `Wrapped` | Recap card |

### Context Providers

#### SocketContext
- Creates typed Socket.io client connecting to `/party` namespace
- `autoConnect: false` (connected manually by RoomContext on join)
- Exposes: `{ socket, connected }`

#### RoomContext
- Manages room state, participant list, current user identity
- Derived `isGent` flag: `currentUser.role !== 'guest'`
- Actions: `joinRoom(code, profile)`, `leaveRoom()`, `startParty()`
- Listens: `ROOM_STATE_UPDATE`, `PARTICIPANT_JOINED`, `PARTICIPANT_LEFT`, `PARTICIPANT_RECONNECTED`

#### PartyContext
- Manages active party state: current act, scene, vibe, timers
- Tracks active mechanics: `activeConfession`, `activeDrink`, `snapCountdown`
- Derived: `isPartyActive` (act 1-4), `isWrapped` (act 5)
- Listens: `PARTY_STARTED`, `ACT_TRANSITION`, `SCENE_UPDATE`, `TIMER_SYNC`, `VIBE_CHANGED`, `CONFESSION_PROMPT`, `CONFESSION_RESULT`, `DRINK_SENT`, `SNAP_COUNTDOWN`, `PHOTO_READY`

### Pages

**Landing** — Two flows: "HOST A PARTY" creates room via `POST /api/rooms` and navigates to lobby; "JOIN A PARTY" shows 4-letter code input and navigates to profile setup.

**ProfileSetup** — Camera capture (getUserMedia) or file upload → name input → `POST /api/profiles/generate` → shows ProfileCard preview → stores in sessionStorage → navigates to lobby.

**Lobby** — Joins room via socket. Displays room code for sharing. Shows hosts (gold glow) and guests (entrance animations). "START THE EVENING" button visible only to Gents (min 2 participants). Profile cards viewable on avatar tap.

**Party** — Full party view with SceneBackdrop (background), VibeShift (filter overlay), video grid (Gent tiles top row, guest tiles below), ActTimer, ReactionBar + FloatingReactions, and modal overlays for DrinkRound, ConfessionRound, GroupSnap, ActTransition. GentControlPanel for hosts only.

**Wrapped** — Receives `WRAPPED_READY` event. Displays: logo, session title + date, circular portrait with gold border, alias, 6-stat grid, Lorekeeper's Note in italic serif, photo strip, share button (Web Share API).

### Component Inventory

#### UI Components (4)
- **Button** — 4 variants (primary/ember, secondary/teal, ghost, gold), 3 sizes (sm/md/lg)
- **Card** — Charcoal-light bg, gold border, optional glow shadow
- **Badge** — 4 color variants (gold, ember, teal, muted), uppercase tracking
- **Spinner** — Rotating gold border circle, configurable size

#### Profile Components (3)
- **ProfileCard** — Full profile view with portrait, gradient overlay, role badge, name/alias, traits tags, dossier
- **ProfileAvatar** — Circular avatar with role-based border color (gold/ember/teal/cream), size variants, glow, disconnected grayscale
- **ProfileSetupForm** — Camera capture or file upload, name input, loading spinner state

#### Mechanics Components (6)
- **ReactionBar** — 6 emoji buttons from `EMOJIS` constant, emits `SEND_REACTION`
- **FloatingReaction** — Listens for `REACTION`, renders emoji + sender name rising animation (2.5s)
- **DrinkRound** — Cocktail card modal with pour animation, story text, Accept/Dodge buttons
- **ConfessionRound** — 3-phase flow: prompt reveal → voting (YES/NO, 10s countdown) → result display
- **GroupSnap** — 3-2-1 countdown overlay, white flash, auto-captures front camera, photo result modal
- **VibeShift** — CSS filter overlay per vibe mode, narration text fade in/out (4s)

#### Party Components (3)
- **SceneBackdrop** — Full-screen AI image with 60% dark overlay, scene description text
- **ActTransition** — Full-screen overlay with act name + subtitle + narration (4s auto-dismiss)
- **ActTimer** — Thin progress bar with act label and M:SS remaining

#### Gent Components (4)
- **KeysPanel** — "SHAKE TO MIX" button, 3s mixing spinner, emits `SEND_GROUP_DRINK`
- **BassPanel** — 3 vibe mode cards, active state highlight, emits `VIBE_SHIFT`
- **LorekeeperPanel** — SNAP + CONFESSION buttons, NEXT ACT + WRAP IT UP controls
- **GentControlPanel** — Fixed bottom-right toggle, slide-up bottom sheet, 3 tabs (Keys/Bass/Lore)

### Animation System (`client/src/lib/animations.ts`)

| Variant | Usage | Duration |
|---------|-------|----------|
| `fadeIn` | General reveals | 0.5s |
| `slideUp` | Cards, sections | 0.5s, easeOut |
| `scaleReveal` | Portraits, cards | 0.6s, cubic bezier |
| `floatUp` | Emoji reactions | 2s, rises 200px |
| `cinematicEntrance` | Act transitions | 1.2s in, 0.6s exit |
| `staggerContainer/Item` | Lists | 0.1s stagger |
| `pourAnimation` | Drink reveals | 1.5s clip-path |
| `spotlightGlow` | Highlighted avatars | 2s infinite pulse |

### Brand / Design System (`client/src/styles/globals.css`)

**Tailwind v4 Theme** (`@theme`):
- Colors: `--color-ember`, `--color-teal`, `--color-gold`, `--color-cream`, `--color-charcoal` + light/dark variants
- Fonts: `--font-display: 'Playfair Display'`, `--font-body: 'DM Sans'`

**Custom Utilities**:
- `.label` — uppercase, 0.2em tracking, 0.625rem, font-bold, font-body
- `.heading-display` — Playfair Display, 700 weight
- `.heading-display-italic` — Playfair Display, 400 weight, italic
- `.safe-top` / `.safe-bottom` — env(safe-area-inset-*) padding

---

## Key Data Flows

### Room Creation Flow
```
Client Landing → POST /api/rooms { hostId, hostRole }
  → Server: generateRoomCode() → createRoom() → return { code, room }
Client → navigate to /lobby/:code
```

### Profile Generation Flow
```
Client ProfileSetup → POST /api/profiles/generate (FormData: name, role, photo)
  → Server: multer extracts file → base64 encode
  → Gemini text model: photo + name → { alias, traits, dossier }
  → Gemini image model: portrait style prompt → stylized portrait
  → Return { alias, traits, dossier, portraitBase64 }
Client → ProfileCard preview → sessionStorage → navigate to /lobby/:code
```

### Act Progression Flow
```
Gent emits START_PARTY
  → Server: startParty() → generateScene(act=1) → broadcast PARTY_STARTED
  → Timer: setTimeout(advanceAct, 5 min)
Timer fires (or Lorekeeper emits NEXT_ACT)
  → Server: advanceAct() → generateScene(act=N+1) → broadcast ACT_TRANSITION
  → Repeat for acts 2, 3, 4
Act 4 timer fires (or Lorekeeper emits WRAP_IT_UP)
  → Server: wrapUp() → generateWrappedCards() for each participant → broadcast WRAPPED_READY
```

### Drink Round Flow
```
Keys emits SEND_GROUP_DRINK
  → Server: assembleContext() → generateCocktail() → broadcast DRINK_SENT { cocktail }
  → All clients show DrinkRound modal
Guest taps Accept → emits ACCEPT_DRINK → Server updates stats → broadcasts DRINK_ACCEPTED
Guest taps Dodge → emits DODGE_DRINK → Server updates stats → broadcasts DRINK_DODGED
```

### Confession Round Flow
```
Lorekeeper emits TRIGGER_CONFESSION
  → Server: assembleContext() → generateConfession() → broadcast CONFESSION_PROMPT { question }
  → All clients show ConfessionRound with YES/NO buttons (10s timer)
Each guest emits CONFESSION_VOTE { answer: boolean }
  → Server collects votes → when all voted → generateConfessionCommentary()
  → Broadcast CONFESSION_RESULT { question, yesCount, total, commentary }
```

### Group Snap Flow
```
Lorekeeper emits TRIGGER_SNAP
  → Server broadcasts SNAP_COUNTDOWN { seconds: 3 }
  → Clients show 3-2-1 countdown
  → At 0: clients capture front camera frame → emit UPLOAD_SNAP { imageData }
  → Server collects images → broadcast PHOTO_READY { imageUrl }
```

---

## Vite Dev Server Configuration

```typescript
// client/vite.config.ts
{
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': './src' } },
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3001',
      '/socket.io': { target: 'http://localhost:3001', ws: true }
    }
  }
}
```
