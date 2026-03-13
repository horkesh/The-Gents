import { motion } from 'framer-motion';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'gold';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

const variants = {
  primary: 'bg-ember text-cream hover:bg-ember-light active:bg-ember-dark shadow-[0_2px_12px_-2px_rgba(172,61,41,0.4)] hover:shadow-[0_4px_16px_-2px_rgba(172,61,41,0.5)]',
  secondary: 'bg-teal text-cream hover:bg-teal-light active:bg-teal-dark shadow-[0_2px_12px_-2px_rgba(25,79,76,0.4)]',
  ghost: 'border border-cream/10 text-cream/60 hover:bg-cream/5 hover:border-cream/20 active:bg-cream/10',
  gold: 'border border-gold/30 text-gold hover:bg-gold/10 hover:border-gold/50 active:bg-gold/5 shadow-[0_2px_12px_-4px_rgba(201,168,76,0.2)] hover:shadow-[0_4px_16px_-4px_rgba(201,168,76,0.3)]',
};

const sizes = {
  sm: 'px-4 py-2.5 text-sm min-h-[44px]',
  md: 'px-6 py-3 text-base min-h-[44px]',
  lg: 'px-8 py-4 text-lg min-h-[48px]',
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
      whileTap={disabled ? undefined : { scale: 0.97 }}
      whileHover={disabled ? undefined : { scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={`
        font-body font-bold rounded-lg transition-all duration-200
        disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      disabled={disabled}
      {...(props as Record<string, unknown>)}
    >
      {children}
    </motion.button>
  );
}
