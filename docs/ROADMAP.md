# The Toast — Roadmap

> What remains to go from working MVP to production-ready experience.

---

## Phase 1: External Service Setup

**Goal**: Connect the three external services needed for production.

### Daily.co (Video)
1. Sign up at [daily.co](https://daily.co) (free tier: 10,000 participant-minutes/month)
2. Create API key from dashboard
3. Add `DAILY_API_KEY` to `server/.env`
4. Create `server/src/services/daily.ts`:
   - `createDailyRoom(roomCode)` — POST to Daily.co REST API
   - `getDailyRoomToken(roomName, participantId)` — meeting token generation
5. Create `server/src/routes/daily.ts` — proxy route for room creation
6. Update room creation flow to auto-create Daily.co room alongside game room

### Supabase (Database)
1. Create project at [supabase.com](https://supabase.com) (free tier available)
2. Run schema migrations:

```sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  title TEXT,
  scene_location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  host_ids TEXT[]
);

CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id),
  name TEXT NOT NULL,
  photo_url TEXT,
  portrait_url TEXT,
  alias TEXT,
  traits TEXT[],
  dossier TEXT,
  role TEXT CHECK (role IN ('keys', 'bass', 'lorekeeper', 'guest')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id),
  image_url TEXT NOT NULL,
  act INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE wrapped (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id),
  profile_id UUID REFERENCES profiles(id),
  stats JSONB,
  lorekeeper_note TEXT,
  card_image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

3. Add `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` to `server/.env`
4. Create `server/src/services/supabase.ts` client
5. Integrate into profile generation, session lifecycle, wrapped card storage

### Upstash Redis (Session State)
1. Create database at [upstash.com](https://upstash.com) (free tier: 10,000 commands/day)
2. Add `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` to `server/.env`
3. Create `server/src/services/redis.ts` — REST client wrapper
4. Migrate `room.ts` from in-memory Map to Redis-backed store
5. Add TTL: rooms expire after 2 hours of inactivity

---

## Phase 2: Daily.co Video Components

**Goal**: Replace static avatar tiles with live video grid.

### Files to Create
- `client/src/components/video/VideoGrid.tsx` — responsive participant grid
  - Top row: 3 Gent tiles (larger, gold border)
  - Below: guest grid (2-4 columns based on count)
  - Semi-transparent overlay on scene backdrop
- `client/src/components/video/VideoTile.tsx` — individual tile
  - Video element + name label + role badge
  - Active speaker highlight (gold ring)
  - Camera-off state shows portrait/avatar
- `client/src/components/video/VideoControls.tsx` — minimal bottom bar
  - Mute mic toggle
  - Camera on/off toggle
  - No screen share (not in spec)

### Integration
- `DailyProvider` wrapping the Party page
- Join Daily.co call on party mount, leave on unmount
- Use `@daily-co/daily-react` hooks (`useParticipantIds`, `useVideoTrack`, etc.)

---

## Phase 3: Audio System

**Goal**: Ambient soundscape + mechanic sound effects.

### Audio Assets Needed
| File | Purpose | When |
|------|---------|------|
| `slow-burn.mp3` | Ambient loop | Vibe = slow_burn |
| `cruise.mp3` | Ambient loop | Vibe = cruise |
| `ignition.mp3` | Ambient loop | Vibe = ignition |
| `pour.mp3` | Cocktail pouring | Drink round starts |
| `clink.mp3` | Glass clink | Drink accepted |
| `shutter.mp3` | Camera snap | Group snap at 0 |
| `envelope.mp3` | Paper opening | Confession prompt |
| `scratch.mp3` | Vinyl scratch | Vibe shift transition |

### Files to Create
- `client/src/lib/audio.ts` — Audio manager class (Web Audio API)
  - Crossfade between ambient loops on vibe shift
  - Volume control, mute toggle
  - SFX trigger methods
- `client/src/contexts/AudioContext.tsx` — React context wrapping audio manager
- Integrate SFX into: VibeShift, DrinkRound, ConfessionRound, GroupSnap

---

## Phase 4: Photo Compositing

**Goal**: Real AI-generated group composite photos from individual selfies.

### Current State
The `UPLOAD_SNAP` handler in `server/src/socket/party.ts` collects selfie uploads from all clients but uses the first image as a placeholder result.

### Implementation
1. Collect all uploaded selfies (base64)
2. Include current scene backdrop as context
3. Send to Gemini image model with composite style prompt
4. Generate artistic group photo (Wes Anderson aesthetic)
5. Store composite URL in Supabase snapshots table
6. Broadcast `PHOTO_READY` with composite URL

### Challenges
- Gemini image generation with multiple reference images
- Processing time (may need loading overlay)
- Fallback if generation fails (collage of individual selfies)

---

## Phase 5: Polish & Error Handling

**Goal**: Production-quality UX with graceful failures.

### Error Boundaries
- React error boundary at app root
- Per-page error boundaries with retry buttons
- Socket disconnection/reconnection handling
- Gemini API failure fallbacks (use cached/default content)

### Loading States
- Skeleton screens for lobby participant list
- Profile generation loading (already has spinner)
- Scene transition loading
- Cocktail generation loading

### Reconnection
- Socket.io auto-reconnect with exponential backoff
- Daily.co call reconnection
- Room rejoin on page refresh (from sessionStorage)

### Mobile Optimization
- `dvh` units for full-height views (already using `min-h-dvh`)
- Safe area insets (utility classes exist)
- 44px minimum touch targets
- Prevent zoom on input focus
- Orientation lock (portrait preferred)

### Accessibility
- Focus ring styles for keyboard navigation
- ARIA labels on interactive elements
- `prefers-reduced-motion` media query for animations
- Screen reader text for emoji reactions
- Color contrast compliance (gold on charcoal)

---

## Phase 6: Deployment

### Server (Fly.io)
```dockerfile
# server/Dockerfile
FROM node:20-slim
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY shared/ ./shared/
COPY server/ ./server/
RUN npm install -g pnpm && pnpm install --frozen-lockfile
RUN pnpm --filter @the-toast/shared build
RUN pnpm --filter @the-toast/server build
EXPOSE 3001
CMD ["node", "server/dist/index.js"]
```

- Deploy: `fly launch` + `fly deploy`
- Secrets: `fly secrets set GEMINI_API_KEY=... DAILY_API_KEY=...`
- WebSocket support: Fly.io natively supports long-running connections

### Client (Vercel)
- Framework: Vite
- Build: `pnpm --filter @the-toast/client build`
- Output: `client/dist/`
- Environment: Set `VITE_API_URL` to Fly.io server URL
- Rewrites: SPA fallback to `index.html`

### DNS & SSL
- Custom domain setup on Vercel (client) and Fly.io (server)
- HTTPS enforced on both
- Update `CLIENT_URL` env var on server to match production domain

---

## Nice-to-Haves (Post-MVP)

| Feature | Description | Priority |
|---------|-------------|----------|
| DM draft sharing | Lorekeeper sends personalized Instagram DM to each guest post-session | Medium |
| Session replay | Timeline view of all events/mechanics from a completed session | Low |
| Host analytics | Dashboard showing sessions hosted, guest count, popular drinks | Low |
| Guest history | Returning guests see their previous aliases/portraits | Medium |
| Custom room themes | Hosts choose scene theme (Havana, Tokyo, Amalfi, etc.) | Medium |
| Scheduled parties | Create room in advance with calendar invite link | Medium |
| Tip jar | Guests can tip The Gents (Stripe integration) | Low |
| Party recordings | Save highlights reel from Daily.co recording | Low |

---

## Developer Setup Guide

### Prerequisites
- Node.js 20+
- pnpm 10+ (`npm install -g pnpm`)
- Google Gemini API key ([ai.google.dev](https://ai.google.dev))

### Quick Start

```bash
# 1. Clone and install
git clone <repo-url>
cd the-toast
pnpm install

# 2. Configure environment
cp server/.env.example server/.env
# Edit server/.env and add your GEMINI_API_KEY

# 3. Build shared types
pnpm --filter @the-toast/shared build

# 4. Start development servers
# Terminal 1: Server
pnpm --filter @the-toast/server dev

# Terminal 2: Client
pnpm --filter @the-toast/client dev

# 5. Open browser
# Navigate to http://localhost:5173
```

### Full Build

```bash
pnpm run build    # Builds all 3 packages via Turborepo
```

### Project Scripts

| Command | What it does |
|---------|-------------|
| `pnpm run dev` | Starts all packages in dev mode (turbo) |
| `pnpm run build` | Production build all packages |
| `pnpm --filter @the-toast/server dev` | Server only with hot reload |
| `pnpm --filter @the-toast/client dev` | Client only with HMR |
| `pnpm --filter @the-toast/shared build` | Build shared types |

### Environment Variables

Copy `server/.env.example` to `server/.env` and fill in:

| Variable | Required | Where to get it |
|----------|----------|----------------|
| `GEMINI_API_KEY` | **Yes** | [ai.google.dev](https://ai.google.dev) |
| `DAILY_API_KEY` | For video | [daily.co](https://daily.co) |
| `UPSTASH_REDIS_REST_URL` | For persistence | [upstash.com](https://upstash.com) |
| `UPSTASH_REDIS_REST_TOKEN` | For persistence | [upstash.com](https://upstash.com) |
| `SUPABASE_URL` | For persistence | [supabase.com](https://supabase.com) |
| `SUPABASE_SERVICE_KEY` | For persistence | [supabase.com](https://supabase.com) |

> **Note**: Only `GEMINI_API_KEY` is required to run the app locally. All other services have in-memory fallbacks.

### Testing a Full Flow

1. Open `http://localhost:5173` — click "HOST A PARTY"
2. Note the room code (e.g., "COVE")
3. Open a second browser tab → `http://localhost:5173`
4. Click "JOIN A PARTY" → enter the room code
5. Upload a photo and enter a name → AI generates your profile
6. Both tabs now show the lobby with participants
7. Click "START THE EVENING" from the host tab
8. The party begins with Act I — test mechanics from the Gent Control Panel
