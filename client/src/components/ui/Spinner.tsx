import { motion } from 'framer-motion';

interface SpinnerProps {
  size?: number;
  className?: string;
}

export function Spinner({ size = 32, className = '' }: SpinnerProps) {
  return (
    <motion.div
      className={`inline-block rounded-full border-2 border-gold/20 border-t-gold ${className}`}
      style={{ width: size, height: size }}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    />
  );
}
