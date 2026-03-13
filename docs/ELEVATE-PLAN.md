# Elevation Features — Implementation Plan

> Ordered by dependency chain and impact. Each feature lists exactly what changes.
> Reference: docs/ELEVATE.md for the full feature descriptions.

---

## Wave 1: Solo Features (No Dependencies Between Them)

These can be built in any order or in parallel. Each is self-contained.

---

### Feature 1: The Entrance

**Effort:** Small — 1 new event, 1 new component, minor server change

**Shared types** (`shared/src/types/events.ts`):
- Add `GUEST_ENTRANCE` to `ServerToClientEvents`:
  ```ts
  GUEST_ENTRANCE: (payload: {
    profile: ParticipantProfile;
    intro: string; // AI-generated one-liner
    arrivalOrder: number;
  }) => void;
  ```

**Server** (`server/src/socket/lobby.ts`):
- In the `JOIN_ROOM` handler, after adding participant to room:
  - Track arrival order (counter per room, stored alongside room state)
  - Call Gemini to generate a one-line entrance intro using the guest's alias and traits
  - Emit `GUEST_ENTRANCE` to the room (not just `PARTICIPANT_JOINED`)
- Store `arrivalOrder` in `participantStats` for Wrapped use (Feature 9)

**Server** (`server/src/services/gemini/prompts.ts`):
- Add `ENTRANCE_INTRO` prompt template:
  - Input: guest alias, traits, arrival order, current act
  - Output: One cinematic sentence, max 15 words
  - Example: *"The Velvet Fox arrives. The room adjusts itself."*

**Client** (`client/src/components/party/GuestEntrance.tsx` — NEW):
- Full-screen overlay (z-45, below act transition)
- Portrait image slides in from bottom, alias fades in, intro text appears
- Auto-dismisses after 4 seconds
- Uses `scaleReveal` + custom entrance animation
- Plays a subtle SFX (add `entrance.mp3` to audio assets list)

**Client** (`client/src/contexts/PartyContext.tsx`):
- Add `activeEntrance` to state (profile + intro + arrivalOrder)
- Listen for `GUEST_ENTRANCE` event, set state, auto-clear after 4s

**Client** (`client/src/pages/Party.tsx`):
- Render `<GuestEntrance />` alongside other mechanic overlays

---

### Feature 5: Third Confession Option — "I'll Never Tell"

**Effort:** Small — extend existing vote payload, update UI and result display

**Shared types** (`shared/src/types/events.ts`):
- Change `CONFESSION_VOTE` payload:
  ```ts
  CONFESSION_VOTE: (payload: {
    answer: boolean | null; // null = "I'll never tell"
  }) => void;
  ```
- Change `CONFESSION_RESULT` payload:
  ```ts
  CONFESSION_RESULT: (payload: {
    question: string;
    yesCount: number;
    noCount: number;
    mysteryCount: number;
    total: number;
    commentary: string;
  }) => void;
  ```

**Server** (`server/src/socket/party.ts`):
- In confession vote counting, track three categories: yes, no, mystery
- Pass `mysteryCount` to AI commentary prompt
- Adjust commentary prompt to reference mystery voters: *"1 refused to answer."*

**Client** (`client/src/components/mechanics/ConfessionRound.tsx`):
- Add third button between NO and YES: 👀 (or "I'LL NEVER TELL")
- Style: gold/ghost variant, slightly smaller
- Result phase: show `mysteryCount` if > 0: *"X refused to answer"*

---

### Feature 6: Spotlight

**Effort:** Medium — new event pair, new Gent control, new client overlay

**Shared types** (`shared/src/types/events.ts`):
- Add `TRIGGER_SPOTLIGHT` to `ClientToServerEvents`:
  ```ts
  TRIGGER_SPOTLIGHT: (payload: { targetId: string }) => void;
  ```
- Add `SPOTLIGHT` to `ServerToClientEvents`:
  ```ts
  SPOTLIGHT: (payload: {
    profile: ParticipantProfile;
    roast: string; // AI-generated one-liner
  }) => void;
  ```

**Server** (`server/src/socket/party.ts`):
- Handler for `TRIGGER_SPOTLIGHT`:
  - Validate sender is lorekeeper
  - Look up target participant profile
  - Generate one-line roast via Gemini (use alias, traits, drink history)
  - Emit `SPOTLIGHT` to room
  - Increment target's `timesSpotlighted`
  - Add key moment

**Server** (`server/src/services/gemini/prompts.ts`):
- Add `SPOTLIGHT_ROAST` prompt:
  - Input: guest alias, traits, dossier, stats so far
  - Output: One affectionate roast, max 20 words
  - Rules: Warm, never mean. Like roasting a close friend.

**Client** (`client/src/components/mechanics/Spotlight.tsx` — NEW):
- Full-screen overlay showing:
  - Large portrait (200x200) with gold ring animation
  - Alias in heading-display
  - Roast text in heading-display-italic
  - Dims background to charcoal/80
- Auto-dismisses after 6 seconds

**Client** — Lorekeeper control panel (`client/src/components/layout/LorekeeperPanel.tsx`):
- Add "SPOTLIGHT" section with guest list
- Each guest has a button to spotlight them
- Disabled for 30 seconds after use (cooldown)

**Client** (`client/src/contexts/PartyContext.tsx`):
- Add `activeSpotlight` state
- Listen for `SPOTLIGHT`, auto-clear after 6s

---

### Feature 7: The Guest Book

**Effort:** Medium — new event pair, new component, new Wrapped section

**Shared types** (`shared/src/types/events.ts`):
- Add `SUBMIT_GUEST_BOOK` to `ClientToServerEvents`:
  ```ts
  SUBMIT_GUEST_BOOK: (payload: { message: string }) => void;
  ```
- Add `GUEST_BOOK_OPEN` to `ServerToClientEvents`:
  ```ts
  GUEST_BOOK_OPEN: () => void;
  ```
- Extend `WRAPPED_READY` payload:
  ```ts
  guestBookEntries: string[]; // anonymous messages from all guests
  ```

**Server** (`server/src/socket/party.ts`):
- New in-memory Map: `guestBookEntries: Map<string, string[]>` (room code → entries)
- When Act IV starts (or 2 minutes before wrap), emit `GUEST_BOOK_OPEN`
- Handler for `SUBMIT_GUEST_BOOK`: store message (max 100 chars, one per guest)
- Include `guestBookEntries` in Wrapped payload
- Clean up in `cleanupRoom()`

**Client** (`client/src/components/mechanics/GuestBook.tsx` — NEW):
- Appears when `GUEST_BOOK_OPEN` fires
- Floating card at bottom of screen (not full overlay — don't block the party)
- Single text input (100 char limit) + submit button
- Placeholder: *"Leave a note for the guest book..."*
- Disappears after submission
- This is the ONLY text input during the party — make it feel special

**Client** (`client/src/pages/Wrapped.tsx`):
- New section after Lorekeeper's Note: "FROM THE GUEST BOOK"
- Display entries as anonymous italicized quotes
- Only show if entries exist

---

### Feature 9: Arrival Order Easter Egg

**Effort:** Tiny — rides on Feature 1's arrivalOrder data

**Depends on:** Feature 1 (The Entrance) storing `arrivalOrder` in stats

**Shared types** (`shared/src/types/room.ts`):
- Add `arrivalOrder: number` to `ParticipantStats`

**Server** (`server/src/socket/party.ts`):
- Already stored in Feature 1. Pass through to Wrapped.

**Client** (`client/src/pages/Wrapped.tsx`):
- Add subtle line below profile card:
  - Order 1: *"First to arrive."*
  - Last: *"Last to arrive — fashionably."*
  - Middle: *"Arrived 3rd."*

---

### Feature 10: Drink Stats Narrative

**Effort:** Small — AI prompt change + Wrapped UI tweak

**Server** (`server/src/services/gemini/prompts.ts`):
- Modify `WRAPPED_NOTE` prompt to include narrative stats instruction:
  - Instead of raw numbers, the Lorekeeper's Note should weave in drink behavior
  - Add to prompt: *"Reference their drink stats narratively. If they dodged a drink, name it."*

**Server** (`server/src/socket/party.ts`):
- Track which specific cocktails each guest accepted/dodged (not just counts)
- Pass cocktail names to Wrapped generation prompt

**Shared types** (`shared/src/types/room.ts`):
- Extend `ParticipantStats`:
  ```ts
  cocktailsAccepted: string[]; // cocktail names
  cocktailsDodged: string[];
  ```

**Client** (`client/src/pages/Wrapped.tsx`):
- No change needed if the Lorekeeper's Note handles it narratively
- Optionally: replace raw stat numbers with narrative versions from the AI

---

## Wave 2: Requires Wave 1 Foundations

---

### Feature 2: Cocktail Dedications

**Effort:** Medium — modifies existing drink flow, adds targeting UI

**Depends on:** Nothing from Wave 1, but builds on existing drink system

**Shared types** (`shared/src/types/events.ts`):
- Change `SEND_GROUP_DRINK`:
  ```ts
  SEND_GROUP_DRINK: (payload?: { dedicatedTo?: string }) => void; // participant ID
  ```
- Change `DRINK_SENT`:
  ```ts
  DRINK_SENT: (payload: {
    cocktail: Cocktail;
    fromGent: string;
    dedicatedTo?: string; // alias of the dedicated guest
  }) => void;
  ```

**Server** (`server/src/socket/party.ts`):
- If `dedicatedTo` is provided, include the alias in the drink event
- AI cocktail generation prompt gets the target's alias/traits for personalization
- Key moment: *"The Alchemist dedicated The Midnight Orchid to The Velvet Fox"*

**Client** — Keys control panel (`client/src/components/layout/KeysPanel.tsx`):
- Add optional "DEDICATE TO" guest selector before mixing
- Default: no dedication (broadcast to all, like current behavior)
- Selected: shows guest portrait thumbnail next to mix button

**Client** (`client/src/components/mechanics/DrinkRound.tsx`):
- If `dedicatedTo` matches current user's alias, show special highlight
- Card shows: *"Crafted for you"* badge in gold
- If dedicated to someone else: show *"Crafted for The Velvet Fox"* (still visible to all)

---

### Feature 4: Who Knows Who (Compatibility)

**Effort:** Medium — server-side computation, Wrapped UI addition

**Depends on:** Feature 5 (third confession option changes vote structure)

**Server** (`server/src/socket/party.ts`):
- Track per-guest vote history: `Map<participantId, Map<question, answer>>`
- Track per-guest drink decisions: `Map<participantId, Map<cocktailName, 'accept'|'dodge'>>`
- At Wrapped generation time, compute pairwise similarity:
  - For each pair of guests, count matching confession votes + matching drink decisions
  - Find each guest's highest-match partner

**Shared types** — extend `WRAPPED_READY`:
  ```ts
  mostAlignedWith?: {
    alias: string;
    matchScore: number; // percentage
    quip: string; // AI-generated, e.g. "Suspicious."
  };
  ```

**Server** (`server/src/services/gemini/prompts.ts`):
- Add `COMPATIBILITY_QUIP` prompt: given two aliases and match %, generate a one-liner

**Client** (`client/src/pages/Wrapped.tsx`):
- New section: "YOUR MATCH"
- Shows the other guest's alias + match percentage + quip
- Only shows if there were enough data points (>= 3 shared decisions)

---

### Feature 3: The Toast

**Effort:** Large — new mechanic combining speech + synchronized snap + special composite

**Depends on:** Existing snap infrastructure

**Shared types** (`shared/src/types/events.ts`):
- Add `TRIGGER_TOAST` to `ClientToServerEvents` (Lorekeeper only)
- Add `TOAST_SPEECH` to `ServerToClientEvents`:
  ```ts
  TOAST_SPEECH: (payload: {
    speech: string; // 2-3 sentences from the Lorekeeper AI
  }) => void;
  ```
- Add `TOAST_SNAP` to `ServerToClientEvents` (triggers camera after speech)
- Add `TOAST_PHOTO_READY` to `ServerToClientEvents`:
  ```ts
  TOAST_PHOTO_READY: (payload: { imageUrl: string }) => void;
  ```

**Server** (`server/src/socket/party.ts`):
- `TRIGGER_TOAST` handler:
  1. Generate a 2-3 sentence toast speech via Gemini (references the evening so far, key moments)
  2. Emit `TOAST_SPEECH` — clients display the speech for 8 seconds
  3. After 8 seconds, emit `TOAST_SNAP` (same countdown as group snap but labeled "RAISE YOUR GLASS")
  4. Collect selfies, generate composite with toast-specific prompt
  5. Emit `TOAST_PHOTO_READY`
  6. Mark this photo as the "toast photo" — it leads the Wrapped card
- Limit: once per party

**Client** (`client/src/components/mechanics/TheToast.tsx` — NEW):
- Phase 1: Speech overlay — Lorekeeper's words appear cinematically, one sentence at a time
- Phase 2: "RAISE YOUR GLASS" countdown (3-2-1)
- Phase 3: Flash + capture (reuse GroupSnap camera logic)
- Phase 4: Toast photo reveal with special gold frame

**Client** — Lorekeeper control panel:
- Add "THE TOAST" button (only available in Act III, usable once)
- Gold styling, prominent placement

**Client** (`client/src/pages/Wrapped.tsx`):
- Toast photo displayed larger than other photos, with gold border
- Positioned as the hero image of the card

---

## Wave 3: Requires External Infrastructure

---

### Feature 8: Scene Themes

**Effort:** Medium — data structure + prompt modifications, host UI

**Shared types** (`shared/src/types/room.ts`):
- Add `PartyTheme` type:
  ```ts
  export type PartyTheme = 'classic' | 'havana' | 'amalfi' | 'tokyo' | 'marrakech' | 'stockholm';
  ```
- Add `theme: PartyTheme` to `RoomState`

**Shared constants** (`shared/src/constants/themes.ts` — NEW):
- Per-theme config:
  ```ts
  export const THEMES: Record<PartyTheme, {
    label: string;
    scenePool: Record<1|2|3|4, string[]>;
    cocktailStyle: string; // prompt modifier for cocktail generation
    colorAccent: string; // optional UI tint
    description: string;
  }>;
  ```
- Each theme has its own scene descriptions, cocktail flavor profile, cultural references

**Server** (`server/src/services/gemini/prompts.ts`):
- All prompts receive `theme` parameter
- Scene generation uses theme's scene pool instead of default `SCENE_POOLS`
- Cocktail generation incorporates theme's cocktail style
- Confession prompts adapt cultural references

**Client** (`client/src/pages/Landing.tsx`):
- After role selection, show theme picker (6 cards with theme name + short description)
- Default: "Classic" (current behavior)
- Theme stored in room creation API call

---

### Feature 11: The Morning After

**Effort:** Medium — requires notification infrastructure (email or SMS)

**Depends on:** Supabase for persistence, email service (Resend/SendGrid)

**Server** (`server/src/services/morning-after.ts` — NEW):
- After Wrapped generation, schedule a follow-up message for 12 hours later
- For each guest: compose a single Lorekeeper line + link to their Wrapped card
- Requires: guest email/phone (collected during profile setup) + email API

**Client** (`client/src/pages/ProfileSetup.tsx`):
- Optional email field: *"Want a morning-after note from the Lorekeeper?"*
- Stored in profile, not required

**Note:** This feature requires Supabase (to persist Wrapped cards with stable URLs) and an email service. Plan as post-deployment.

---

### Feature 12: Returning Guest Recognition

**Effort:** Medium — requires persistence (Supabase)

**Depends on:** Supabase profiles table being active

**Server** (`server/src/socket/lobby.ts`):
- On `JOIN_ROOM`, query Supabase profiles by name or photo hash
- If match found, retrieve previous alias
- Pass `returningAs` field to profile generation prompt
- Entrance intro (Feature 1) references previous alias: *"The Velvet Fox returns."*

**Server** (`server/src/services/gemini/prompts.ts`):
- Modify profile generation prompt: if returning, reference their history
- Entrance intro variant for returning guests

**Note:** Requires Supabase integration to be live. Plan as post-deployment.

---

## Implementation Order

| Order | Feature | Effort | Dependencies |
|-------|---------|--------|-------------|
| 1 | **#5 Third Confession Option** | Small | None |
| 2 | **#9 Arrival Order Easter Egg** | Tiny | None (just stats) |
| 3 | **#10 Drink Stats Narrative** | Small | None |
| 4 | **#1 The Entrance** | Small | None |
| 5 | **#6 Spotlight** | Medium | None |
| 6 | **#7 The Guest Book** | Medium | None |
| 7 | **#2 Cocktail Dedications** | Medium | None |
| 8 | **#4 Who Knows Who** | Medium | #5 |
| 9 | **#3 The Toast** | Large | Snap infra |
| 10 | **#8 Scene Themes** | Medium | None |
| 11 | **#12 Returning Guests** | Medium | Supabase |
| 12 | **#11 Morning After** | Medium | Supabase + Email |

**Recommended first session:** Features 1, 5, 9, 10 (all small, no dependencies, high impact).
**Recommended second session:** Features 6, 7 (medium, no dependencies, high shareability).
**Recommended third session:** Features 2, 4 (medium, complete the social features).
**Final session:** Feature 3 — The Toast (the crown jewel, save it for last).
