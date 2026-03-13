import type {
  ParticipantProfile,
  RoomState,
  Cocktail,
  SceneData,
  VibeMode,
  ParticipantStats,
} from './room.js';

// ─── Client → Server Events ────────────────────────────────

export interface ClientToServerEvents {
  JOIN_ROOM: (payload: {
    code: string;
    profile: Pick<ParticipantProfile, 'id' | 'name' | 'role' | 'photoUrl'>;
  }) => void;

  LEAVE_ROOM: () => void;

  START_PARTY: () => void;

  SEND_REACTION: (payload: {
    emoji: string;
  }) => void;

  SEND_GROUP_DRINK: (payload?: { dedicatedTo?: string }) => void;

  ACCEPT_DRINK: (payload: {
    cocktailName: string;
  }) => void;

  DODGE_DRINK: (payload: {
    cocktailName: string;
  }) => void;

  TRIGGER_CONFESSION: () => void;

  CONFESSION_VOTE: (payload: {
    answer: boolean | null; // null = "I'll never tell"
  }) => void;

  TRIGGER_SPOTLIGHT: (payload: { targetId: string }) => void;

  TRIGGER_TOAST: () => void;

  SUBMIT_GUEST_BOOK: (payload: { message: string }) => void;

  TRIGGER_SNAP: () => void;

  UPLOAD_SNAP: (payload: {
    imageData: string; // base64
  }) => void;

  VIBE_SHIFT: (payload: {
    mode: VibeMode;
  }) => void;

  NEXT_ACT: () => void;

  WRAP_IT_UP: () => void;
}

// ─── Server → Client Events ────────────────────────────────

export interface ServerToClientEvents {
  ROOM_STATE_UPDATE: (state: RoomState) => void;

  PARTICIPANT_JOINED: (profile: ParticipantProfile) => void;

  GUEST_ENTRANCE: (payload: {
    profile: ParticipantProfile;
    intro: string;
    arrivalOrder: number;
  }) => void;

  PARTICIPANT_LEFT: (payload: { id: string }) => void;

  PARTICIPANT_RECONNECTED: (payload: { id: string }) => void;

  PARTY_STARTED: (payload: {
    scene: SceneData;
  }) => void;

  ACT_TRANSITION: (payload: {
    act: number;
    scene: SceneData;
    narration: string;
  }) => void;

  SCENE_UPDATE: (scene: SceneData) => void;

  TIMER_SYNC: (payload: {
    act: number;
    elapsed: number;
    duration: number;
  }) => void;

  REACTION: (payload: {
    emoji: string;
    senderName: string;
    senderId: string;
  }) => void;

  DRINK_SENT: (payload: {
    cocktail: Cocktail;
    fromGent: string;
    dedicatedTo?: string;
  }) => void;

  DRINK_ACCEPTED: (payload: {
    participantName: string;
    cocktailName: string;
  }) => void;

  DRINK_DODGED: (payload: {
    participantName: string;
    cocktailName: string;
    commentary: string;
  }) => void;

  CONFESSION_PROMPT: (payload: {
    question: string;
  }) => void;

  CONFESSION_RESULT: (payload: {
    question: string;
    yesCount: number;
    noCount: number;
    mysteryCount: number;
    total: number;
    commentary: string;
  }) => void;

  SNAP_COUNTDOWN: (payload: {
    seconds: number;
  }) => void;

  PHOTO_READY: (payload: {
    imageUrl: string;
    act: number;
  }) => void;

  SPOTLIGHT: (payload: {
    profile: ParticipantProfile;
    roast: string;
  }) => void;

  GUEST_BOOK_OPEN: () => void;

  TOAST_SPEECH: (payload: {
    speech: string;
  }) => void;

  TOAST_SNAP: () => void;

  TOAST_PHOTO_READY: (payload: {
    imageUrl: string;
  }) => void;

  VIBE_CHANGED: (payload: {
    mode: VibeMode;
    narration: string;
  }) => void;

  WRAPPED_READY: (payload: {
    stats: ParticipantStats;
    lorekeeperNote: string;
    sessionTitle: string;
    photos: string[];
    profile: ParticipantProfile;
    guestBookEntries: string[];
    mostAlignedWith?: {
      alias: string;
      matchScore: number;
      quip: string;
    };
    totalGuests: number;
  }) => void;

  ERROR: (payload: {
    message: string;
  }) => void;
}
