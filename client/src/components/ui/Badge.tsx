import type { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'gold' | 'ember' | 'teal' | 'muted';
}

const variants = {
  gold: 'bg-gold/15 text-gold border-gold/25 shadow-[0_0_8px_rgba(201,168,76,0.1)]',
  ember: 'bg-ember/15 text-ember-light border-ember/25 shadow-[0_0_8px_rgba(172,61,41,0.1)]',
  teal: 'bg-teal/15 text-cream border-teal/25 shadow-[0_0_8px_rgba(25,79,76,0.1)]',
  muted: 'bg-cream/5 text-cream/40 border-cream/8',
};

export function Badge({ children, variant = 'gold' }: BadgeProps) {
  return (
    <span
      className={`
        inline-block px-2 py-0.5 rounded-full border text-[0.6rem]
        font-bold tracking-[0.15em] uppercase
        ${variants[variant]}
      `}
    >
      {children}
    </span>
  );
}
