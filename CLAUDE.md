# The Gents

The Gents is a premium, AI-powered virtual cocktail party hosted by three fixed characters (Keys/The Alchemist, Bass/The Atmosphere, Lore/The Architect). Built with React 19, TypeScript, Vite, and Google Gemini AI.

## Stack

- **Runtime**: Vite dev server (port 3000), browser-based SPA
- **UI**: React 19, Tailwind CSS (CDN), custom animations in `index.html`
- **State**: React hooks (`useState` in `index.tsx`)
- **AI**: Google Gemini API (`@google/genai`) via `geminiService.ts`
- **Fonts**: Cormorant Garamond (display), DM Sans (body) — Google Fonts CDN
- **Path alias**: `@/*` → `./*`

## Repo Structure

```
index.html        HTML shell with Tailwind CDN config, theme vars, animations
index.tsx         Main React app — all components, state, and logic (monolith)
App.tsx           Empty — unused
types.ts          Enums (Act, Role, Vibe), interfaces (Participant, GameState, etc.)
constants.ts      Host characters, mock guests, room codes, system instruction
geminiService.ts  All Gemini API calls (profile, scene, cocktail, confession, wrapped)
services/         Contains duplicate empty geminiService.ts — unused
docs/             Planning and architecture notes
```

## Key Entrypoints

- `index.html` → `index.tsx` (monolithic — renders `<App>` directly)
- Game flow: `LOBBY → ACT_I → ACT_II → ACT_III → ACT_IV → WRAPPED`
- Views are rendered inline via conditional rendering in `App` component

## Commands

```bash
npm run dev       # Start Vite dev server on port 3000
npm run build     # Production build
npx tsc --noEmit  # Type check
```

## Environment

- `GEMINI_API_KEY` in `.env.local` (loaded via Vite `define` in `vite.config.ts` as `process.env.API_KEY`)
- Never commit `.env.local` or API keys

## Conventions

### State Management
- All state lives in `App` component via `useState` hooks
- No external state library yet — evaluate Zustand if complexity grows
- Game state is a single `GameState` object

### Components
- Currently all inline in `index.tsx` — decompose as needed
- Sub-components: `LoadingScreen`, `Button`, `ProfileCard`, `VideoTile`, `EventToast`
- View rendering: `renderLobby()`, `renderVideoGrid()`, `renderWrapped()`, `renderHostControls()`

### AI Integration
- All Gemini calls go through `geminiService.ts`
- System instruction defined in `constants.ts` (`SYSTEM_INSTRUCTION`)
- Model: `gemini-3-flash-preview`
- All functions have try/catch with graceful fallback data

### Styling
- Tailwind CSS via CDN with custom config in `index.html` `<script>` tag
- Theme colors: `gents-orange` (#ac3d29), `gents-teal` (#194f4c), `gents-gold` (#c9a84c), `gents-cream` (#f5f0e8), `gents-charcoal` (#1a1a1a)
- Dark cinematic aesthetic — maintain consistency
- Glass panel effect: `rgba(26,26,26,0.85)` + blur

### Code Style
- TypeScript (not strict mode yet)
- Functional components with hooks
- Keep the noir cocktail-party tone in all AI prompts and UI copy
