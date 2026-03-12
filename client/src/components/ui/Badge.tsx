import type { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'gold' | 'ember' | 'teal' | 'muted';
}

const variants = {
  gold: 'bg-gold/20 text-gold border-gold/30',
  ember: 'bg-ember/20 text-ember-light border-ember/30',
  teal: 'bg-teal/20 text-cream border-teal/30',
  muted: 'bg-cream/5 text-cream/40 border-cream/10',
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
