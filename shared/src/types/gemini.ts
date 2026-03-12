import type { ActNumber, VibeState } from './room.js';

export interface SessionContext {
  act: ActNumber;
  sceneDescription: string;
  sceneLocation: string;
  vibe: VibeState;
  participantSummaries: ParticipantSummary[];
  recentEvents: string[];
  usedPrompts: string[];
}

export interface ParticipantSummary {
  alias: string;
  traits: string[];
  role: string;
}

export interface ProfileGenerationRequest {
  photoBase64: string;
  role: string;
  name: string;
}

export interface ProfileGenerationResult {
  portraitBase64: string;
  alias: string;
  traits: [string, string, string];
  dossier: string;
}

export interface SceneGenerationRequest {
  act: ActNumber;
  vibe: VibeState;
  baseLocation: string | null;
  previousScene: string | null;
}

export interface SceneGenerationResult {
  description: string;
  backdropBase64: string;
  location: string;
}

export interface CocktailGenerationRequest {
  context: SessionContext;
  targetAlias?: string;
}

export interface CocktailGenerationResult {
  name: string;
  story: string;
  imageBase64: string;
}

export interface ConfessionGenerationRequest {
  context: SessionContext;
}

export interface ConfessionGenerationResult {
  question: string;
}

export interface ConfessionCommentaryRequest {
  question: string;
  yesCount: number;
  total: number;
  context: SessionContext;
}

export interface CompositeGenerationRequest {
  selfies: string[]; // base64 images
  sceneDescription: string;
  sceneBackdropBase64: string;
}

export interface WrappedGenerationRequest {
  alias: string;
  traits: string[];
  stats: {
    drinksReceived: number;
    drinksAccepted: number;
    drinksDodged: number;
    confessionsParticipated: number;
    timesSpotlighted: number;
    snapsAppeared: number;
  };
  keyMoments: string[];
}

export interface WrappedGenerationResult {
  lorekeeperNote: string;
}
