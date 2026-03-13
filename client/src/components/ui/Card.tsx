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
        glass-strong rounded-2xl p-6
        ${glow ? 'ambient-glow gradient-border' : 'border border-gold/8'}
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.div>
  );
}
