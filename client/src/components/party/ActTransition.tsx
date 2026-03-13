import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocketContext } from '@/contexts/SocketContext';
import { ACTS } from '@the-toast/shared';
import type { ActNumber } from '@the-toast/shared';

export function ActTransition() {
  const { socket } = useSocketContext();
  const [transition, setTransition] = useState<{
    act: ActNumber;
    narration: string;
  } | null>(null);

  useEffect(() => {
    if (!socket) return;

    socket.on('ACT_TRANSITION', ({ act, narration }) => {
      setTransition({ act: act as ActNumber, narration });
      setTimeout(() => setTransition(null), 4000);
    });

    return () => {
      socket.off('ACT_TRANSITION');
    };
  }, [socket]);

  if (!transition) return null;

  const actDef = ACTS[transition.act as keyof typeof ACTS];

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1 }}
      >
        {/* Cinematic background with subtle gold glow */}
        <div className="absolute inset-0 bg-charcoal" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-gold/3 blur-[100px] pointer-events-none" />

        <div className="text-center relative z-10 px-8">
          <motion.div
            className="w-12 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent mx-auto mb-6"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          />
          <motion.p
            className="label text-gold/50 mb-4 tracking-[0.35em]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {actDef?.name || `ACT ${transition.act}`}
          </motion.p>
          <motion.h2
            className="heading-display text-3xl gold-shimmer mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            {actDef?.subtitle || ''}
          </motion.h2>
          <motion.p
            className="heading-display-italic text-cream/40 max-w-xs mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            {transition.narration}
          </motion.p>
          <motion.div
            className="w-12 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent mx-auto mt-6"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.8 }}
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
