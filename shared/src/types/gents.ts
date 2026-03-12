import type { GentRole } from './room';

export interface GentArchetype {
  role: GentRole;
  title: string;
  name: string;
  age: number;
  look: string;
  archetype: string;
  energy: string;
  superpower: string;
  controlPanelIcon: string;
  controlPanelTitle: string;
}

export const GENT_ARCHETYPES: Record<GentRole, GentArchetype> = {
  keys: {
    role: 'keys',
    title: 'Keys & Cocktails',
    name: 'The Alchemist',
    age: 45,
    look: 'Closely shaved',
    archetype: 'The orchestrator, planner, tone-setter',
    energy: 'Precision, taste, controlled indulgence',
    superpower: 'Creates and serves cocktails',
    controlPanelIcon: '🍸',
    controlPanelTitle: 'THE ALCHEMIST',
  },
  bass: {
    role: 'bass',
    title: 'Beard & Bass',
    name: 'The Atmosphere',
    age: 35,
    look: 'Tall, athletic build, full beard',
    archetype: 'The physical presence, relaxed charisma',
    energy: 'Confidence, grounded masculinity',
    superpower: "Controls the room's mood and energy",
    controlPanelIcon: '🎵',
    controlPanelTitle: 'THE ATMOSPHERE',
  },
  lorekeeper: {
    role: 'lorekeeper',
    title: 'Lorekeeper',
    name: 'The Architect',
    age: 45,
    look: 'Shaved head, close-cropped beard, curled mustache',
    archetype: 'The narrator, historian, memory architect',
    energy: 'Ritual, continuity, legacy',
    superpower: 'Triggers group photos, prompts, confession rounds, and act transitions',
    controlPanelIcon: '📜',
    controlPanelTitle: 'THE ARCHITECT',
  },
};
