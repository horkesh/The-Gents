import type { ActNumber, VibeMode } from '../types/room.js';

export interface ActDefinition {
  number: ActNumber;
  name: string;
  subtitle: string;
  durationMinutes: number;
  defaultVibe: VibeMode;
  availableMechanics: string[];
}

export const ACTS: Record<Exclude<ActNumber, 0 | 5>, ActDefinition> = {
  1: {
    number: 1,
    name: 'ACT I',
    subtitle: 'Arrivals',
    durationMinutes: 5,
    defaultVibe: 'slow_burn',
    availableMechanics: ['group_drink', 'snap'],
  },
  2: {
    number: 2,
    name: 'ACT II',
    subtitle: 'Warm-Up',
    durationMinutes: 10,
    defaultVibe: 'cruise',
    availableMechanics: ['confession', 'group_drink', 'snap', 'vibe_shift'],
  },
  3: {
    number: 3,
    name: 'ACT III',
    subtitle: 'Main Event',
    durationMinutes: 15,
    defaultVibe: 'cruise',
    availableMechanics: ['confession', 'group_drink', 'snap', 'vibe_shift'],
  },
  4: {
    number: 4,
    name: 'ACT IV',
    subtitle: 'Last Call',
    durationMinutes: 10,
    defaultVibe: 'slow_burn',
    availableMechanics: ['group_drink', 'snap'],
  },
};

export const ACT_ORDER: Exclude<ActNumber, 0 | 5>[] = [1, 2, 3, 4];

export const VIBE_MODES: Record<VibeMode, { label: string; icon: string; description: string }> = {
  slow_burn: {
    label: 'SLOW BURN',
    icon: '🕯️',
    description: 'Lo-fi jazz, vinyl crackle, candlelight',
  },
  cruise: {
    label: 'CRUISE',
    icon: '🌊',
    description: 'Bossa nova, warm bass, easy rhythm',
  },
  ignition: {
    label: 'IGNITION',
    icon: '🔥',
    description: 'Uptempo lounge, confident brass',
  },
};
