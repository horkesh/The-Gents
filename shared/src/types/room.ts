export type GentRole = 'keys' | 'bass' | 'lorekeeper';
export type ParticipantRole = GentRole | 'guest';

export type ActNumber = 0 | 1 | 2 | 3 | 4 | 5;
// 0 = lobby, 1-4 = acts, 5 = wrapped

export type VibeMode = 'slow_burn' | 'cruise' | 'ignition';

export interface VibeState {
  energy: VibeMode;
  mood: string;
}

export interface ParticipantProfile {
  id: string;
  name: string;
  alias: string;
  role: ParticipantRole;
  photoUrl: string;
  portraitUrl: string;
  traits: [string, string, string];
  dossier: string;
  connected: boolean;
}

export interface ParticipantStats {
  drinksReceived: number;
  drinksAccepted: number;
  drinksDodged: number;
  confessionsParticipated: number;
  timesSpotlighted: number;
  snapsAppeared: number;
  arrivalOrder: number;
  cocktailsAccepted: string[];
  cocktailsDodged: string[];
}

export interface Cocktail {
  name: string;
  story: string;
  imageUrl: string;
}

export interface SceneData {
  description: string;
  backdropUrl: string;
  location: string;
}

export interface SessionEvent {
  id: string;
  type: string;
  message: string;
  timestamp: number;
}

import type { PartyTheme } from '../constants/themes.js';

export interface RoomState {
  code: string;
  participants: ParticipantProfile[];
  act: ActNumber;
  scene: SceneData | null;
  vibe: VibeState;
  events: SessionEvent[];
  dailyRoomUrl: string;
  startedAt: number | null;
  actStartedAt: number | null;
  theme: PartyTheme;
}
