export type PartyTheme = 'classic' | 'havana' | 'amalfi' | 'tokyo' | 'marrakech' | 'stockholm';

export const THEMES: Record<PartyTheme, {
  label: string;
  scenePool: Record<1 | 2 | 3 | 4, string[]>;
  cocktailStyle: string;
  colorAccent: string;
  description: string;
}> = {
  classic: {
    label: 'Classic',
    scenePool: {
      1: [
        'A candlelit terrace overlooking the Adriatic',
        'A private room in a Havana jazz club',
        'The deck of a vintage yacht at anchor',
      ],
      2: [
        'The energy has shifted — more voices, clinking glasses',
        'Candles lower, music shifts, the ice in glasses has melted',
      ],
      3: [
        'The crowd has thinned. It\'s just us now.',
        'A shift to a second location — somewhere quieter, more intimate',
      ],
      4: [
        'Dawn approaching. The venue is quiet.',
        'Glasses empty. One last record plays.',
      ],
    },
    cocktailStyle: 'Classic European cocktails with a modern twist',
    colorAccent: '#c9a84c',
    description: 'The original. Timeless elegance.',
  },
  havana: {
    label: 'Havana',
    scenePool: {
      1: [
        'A rooftop bar in Old Havana, salsa drifting up from the streets',
        'A cigar lounge with cracked leather and ceiling fans turning slow',
        'The courtyard of a colonial mansion, rum already poured',
      ],
      2: [
        'The band picks up tempo. Someone\'s dancing near the bar.',
        'Smoke curls through the lamplight. The rum is flowing faster.',
      ],
      3: [
        'The music slows to son cubano. Only the regulars remain.',
        'A back room. Dominos on the table. Quiet confessions.',
      ],
      4: [
        'The Malecón at 4am. Salt air and empty glasses.',
        'Last call was an hour ago. Nobody noticed.',
      ],
    },
    cocktailStyle: 'Cuban-inspired: rum, tropical fruits, sugarcane, citrus',
    colorAccent: '#d4a574',
    description: 'Rum, rhythm, and rooftops.',
  },
  amalfi: {
    label: 'Amalfi',
    scenePool: {
      1: [
        'A cliffside terrace in Positano, the sea glittering below',
        'A lemon grove courtyard, Aperol already sweating on the table',
        'The deck of a wooden boat anchored off Capri',
      ],
      2: [
        'The sun has set. Fairy lights reflect off the water.',
        'Someone ordered another bottle. The waiter pretends not to notice.',
      ],
      3: [
        'The restaurant has emptied. Your table is the last one.',
        'A walk down stone steps to a quieter cove.',
      ],
      4: [
        'First light on the water. Espresso appears without being ordered.',
        'The fishermen are already out. You\'re still here.',
      ],
    },
    cocktailStyle: 'Italian-inspired: limoncello, Aperol, prosecco, amaretto, citrus',
    colorAccent: '#e8a640',
    description: 'Cliffs, limoncello, and la dolce vita.',
  },
  tokyo: {
    label: 'Tokyo',
    scenePool: {
      1: [
        'A hidden bar in Golden Gai, six seats and a jazz record',
        'The 47th floor of a Shinjuku tower, city lights below',
        'A sake house in Shimokitazawa, paper lanterns swaying',
      ],
      2: [
        'The bartender polishes a glass and says nothing. He knows.',
        'Neon bleeds through the window. The whisky is getting deeper.',
      ],
      3: [
        'The last train left an hour ago. Nobody\'s leaving.',
        'A quieter room. The music shifted to something slower.',
      ],
      4: [
        'Dawn through rice paper screens. Green tea replaces whisky.',
        'The city is waking up. You haven\'t slept.',
      ],
    },
    cocktailStyle: 'Japanese-inspired: whisky, sake, yuzu, matcha, plum',
    colorAccent: '#c45c5c',
    description: 'Neon, whisky, and quiet revelations.',
  },
  marrakech: {
    label: 'Marrakech',
    scenePool: {
      1: [
        'A riad courtyard, fountain trickling, mint tea steaming',
        'A rooftop above the Medina, the call to prayer fading',
        'A private salon draped in silk, brass lanterns flickering',
      ],
      2: [
        'The air thickens with oud and cardamom. Conversation deepens.',
        'Someone brought out the hookah. The cushions got more comfortable.',
      ],
      3: [
        'The souk is quiet now. Just the fountain and whispers.',
        'A smaller room. Candlelight only. The mint tea turned to wine.',
      ],
      4: [
        'Stars over the Atlas Mountains. The fire is almost out.',
        'Dawn muezzin. The riad is silent except for you.',
      ],
    },
    cocktailStyle: 'Moroccan-inspired: mint, saffron, rosewater, fig, date, pomegranate',
    colorAccent: '#b87333',
    description: 'Spice, silk, and starlight.',
  },
  stockholm: {
    label: 'Stockholm',
    scenePool: {
      1: [
        'A candlelit cellar bar in Gamla Stan, aquavit on the table',
        'A waterfront restaurant, the archipelago frozen and beautiful',
        'A design studio converted to a private bar, concrete and warm wood',
      ],
      2: [
        'The playlist shifted to something electronic. Minimalist. Perfect.',
        'More candles were lit. The hygge deepened.',
      ],
      3: [
        'The group has moved to the leather sofa. Quieter now.',
        'A sauna. Steam. Honesty.',
      ],
      4: [
        'Northern light through floor-to-ceiling windows. Coffee appears.',
        'The Baltic is still dark. The conversation isn\'t.',
      ],
    },
    cocktailStyle: 'Scandinavian-inspired: aquavit, lingonberry, elderflower, birch, dill',
    colorAccent: '#6b8e9b',
    description: 'Minimalism, midnight sun, and raw honesty.',
  },
};
