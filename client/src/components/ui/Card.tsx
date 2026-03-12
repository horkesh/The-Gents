import { motion, type HTMLMotionProps } from 'framer-motion';
import type { ReactNode } from 'react';

interface CardProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
  glow?: boolean;
}

export function Card({ children, glow, className = '', ...props }: CardProps) {
  return (
    <motion.div
      className={`
        bg-charcoal-light rounded-xl border border-gold/10 p-6
        ${glow ? 'shadow-[0_0_20px_rgba(201,168,76,0.15)]' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.div>
  );
}
