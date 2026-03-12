import type { Variants } from 'framer-motion';

// Basic fade in
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.5 },
} as const;

// Slide up with fade
export const slideUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: 'easeOut' as const },
};

// Scale reveal (for portraits, cards)
export const scaleReveal = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
};

// Float up (for reactions)
export const floatUp: Variants = {
  initial: { opacity: 1, y: 0, scale: 1 },
  animate: {
    opacity: [1, 1, 0],
    y: -200,
    scale: [1, 1.2, 0.8],
    transition: { duration: 2, ease: 'easeOut' as const },
  },
};

// Cinematic entrance (for act transitions)
export const cinematicEntrance: Variants = {
  initial: { opacity: 0, scale: 1.1 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.6 },
  },
};

// Stagger children
export const staggerContainer: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export const staggerItem: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
};

// Pour animation (for drinks)
export const pourAnimation: Variants = {
  initial: { clipPath: 'inset(100% 0 0 0)' },
  animate: {
    clipPath: 'inset(0% 0 0 0)',
    transition: { duration: 1.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
};

// Spotlight glow
export const spotlightGlow: Variants = {
  initial: { boxShadow: '0 0 0 0 rgba(201, 168, 76, 0)' },
  animate: {
    boxShadow: [
      '0 0 0 0 rgba(201, 168, 76, 0)',
      '0 0 30px 10px rgba(201, 168, 76, 0.4)',
      '0 0 20px 5px rgba(201, 168, 76, 0.2)',
    ],
    transition: { duration: 2, repeat: Infinity },
  },
};
