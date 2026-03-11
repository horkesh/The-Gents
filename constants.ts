import { Role, Participant } from './types';

export const THE_GENTS: Participant[] = [
  {
    id: 'gent-keys',
    name: 'Keys',
    alias: 'The Alchemist',
    role: Role.HOST_ALCHEMIST,
    photoUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=500&auto=format&fit=crop',
    traits: ['Precision', 'Taste', 'Control'],
    dossier: 'He orchestrates the liquid courage.',
    stats: { drinksReceived: 0, drinksAccepted: 0, drinksDodged: 0, confessions: 0, spotlights: 0 },
    isSelf: false
  },
  {
    id: 'gent-bass',
    name: 'Bass',
    alias: 'The Atmosphere',
    role: Role.HOST_ATMOSPHERE,
    photoUrl: 'https://images.unsplash.com/photo-1534030347209-7147fd9e7fec?q=80&w=500&auto=format&fit=crop',
    traits: ['Presence', 'Charisma', 'Grounded'],
    dossier: 'He controls the pulse of the room.',
    stats: { drinksReceived: 0, drinksAccepted: 0, drinksDodged: 0, confessions: 0, spotlights: 0 },
    isSelf: false
  },
  {
    id: 'gent-lore',
    name: 'Lore',
    alias: 'The Architect',
    role: Role.HOST_ARCHITECT,
    photoUrl: 'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?q=80&w=500&auto=format&fit=crop',
    traits: ['Narrator', 'Memory', 'Legacy'],
    dossier: 'He remembers what you did last summer.',
    stats: { drinksReceived: 0, drinksAccepted: 0, drinksDodged: 0, confessions: 0, spotlights: 0 },
    isSelf: false
  }
];

export const MOCK_GUESTS: Participant[] = [
  {
    id: 'guest-1',
    name: 'Elena',
    alias: 'Velvet',
    role: Role.GUEST,
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=500&auto=format&fit=crop',
    traits: ['Mysterious', 'Elegant', 'Observant'],
    dossier: 'Arrived fashionably late. Eyes suggest mischief.',
    stats: { drinksReceived: 2, drinksAccepted: 2, drinksDodged: 0, confessions: 1, spotlights: 0 },
    isSelf: false
  },
  {
    id: 'guest-2',
    name: 'Sarah',
    alias: 'Ember',
    role: Role.GUEST,
    photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=500&auto=format&fit=crop',
    traits: ['Fiery', 'Bold', 'Laughing'],
    dossier: 'Likely to start a revolution or a dance party.',
    stats: { drinksReceived: 1, drinksAccepted: 1, drinksDodged: 0, confessions: 1, spotlights: 1 },
    isSelf: false
  }
];

export const ROOM_CODES = ['SILK', 'NOIR', 'JAZZ', 'HAZE', 'GLOW', 'WINE', 'DEEP'];

export const SYSTEM_INSTRUCTION = `
You are the invisible fourth host of "The Gents Virtual Cocktail Party".
Tone: Cinematic, European summer, late-evening warmth. Witty and dry, never corny.
Brand colors: Burnt orange-red (#ac3d29), Deep teal (#194f4c), Gold (#c9a84c).
Rules:
- Max 25 words for scene descriptions.
- Cocktail names must be evocative (never real names).
- Never break the fourth wall.
- Output JSON when requested.
`;
