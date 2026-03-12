export enum Act {
  LOBBY = 'LOBBY',
  ACT_I = 'ACT_I', // Arrivals
  ACT_II = 'ACT_II', // Warm-Up
  ACT_III = 'ACT_III', // Main Event
  ACT_IV = 'ACT_IV', // Last Call
  WRAPPED = 'WRAPPED'
}

export enum Role {
  HOST_ALCHEMIST = 'HOST_ALCHEMIST', // Keys
  HOST_ATMOSPHERE = 'HOST_ATMOSPHERE', // Bass
  HOST_ARCHITECT = 'HOST_ARCHITECT', // Lorekeeper
  GUEST = 'GUEST'
}

export enum Vibe {
  SLOW_BURN = 'SLOW_BURN',
  CRUISE = 'CRUISE',
  IGNITION = 'IGNITION'
}

export interface Participant {
  id: string;
  name: string;
  alias: string;
  role: Role;
  photoUrl: string; // The stylized portrait
  realPhotoUrl?: string; // Original selfie
  traits: string[];
  dossier: string;
  stats: {
    drinksReceived: number;
    drinksAccepted: number;
    drinksDodged: number;
    confessions: number;
    spotlights: number;
  };
  isSelf: boolean;
}

export interface Cocktail {
  name: string;
  story: string;
  imageUrl: string;
  recipientId?: string; // If private
}

export interface Scene {
  description: string;
  imageUrl: string;
  title: string;
}

export interface Confession {
  question: string;
  yesCount: number;
  noCount: number;
  totalVotes: number;
  commentary?: string;
  isActive: boolean;
  myVote?: 'YES' | 'NO';
}

export interface GameState {
  act: Act;
  roomCode: string;
  participants: Participant[];
  currentScene: Scene | null;
  currentVibe: Vibe;
  activeCocktail: Cocktail | null;
  activeConfession: Confession | null;
  reactions: Array<{ id: string; emoji: string; sender: string; x: number }>;
  isLoading: boolean;
  loadingMessage: string;
  errorMessage: string;
}