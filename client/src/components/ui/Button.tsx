import { motion } from 'framer-motion';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'gold';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

const variants = {
  primary: 'bg-ember text-cream hover:bg-ember-light active:bg-ember-dark',
  secondary: 'bg-teal text-cream hover:bg-teal-light active:bg-teal-dark',
  ghost: 'border border-cream/10 text-cream/60 hover:bg-cream/5 active:bg-cream/10',
  gold: 'border border-gold/30 text-gold hover:bg-gold/10 active:bg-gold/5',
};

const sizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
};

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      className={`
        font-body font-bold rounded-lg transition-colors
        disabled:opacity-30 disabled:cursor-not-allowed
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      disabled={disabled}
      {...(props as Record<string, unknown>)}
    >
      {children}
    </motion.button>
  );
}
