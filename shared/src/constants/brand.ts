export const BRAND = {
  colors: {
    ember: '#ac3d29',
    teal: '#194f4c',
    gold: '#c9a84c',
    cream: '#f5f0e8',
    charcoal: '#1a1a1a',
    charcoalLight: '#2a2a2a',
  },
  fonts: {
    display: 'Playfair Display',
    body: 'DM Sans',
  },
  logo: {
    gold: '/logo/01_Gold_logo.png',
    color: '/logo/02_color_logo.png',
  },
  handle: '@the.gents.chronicles',
} as const;

export const EMOJIS = ['🔥', '❤️', '😂', '🥂', '👀', '💀'] as const;
export type ReactionEmoji = (typeof EMOJIS)[number];
