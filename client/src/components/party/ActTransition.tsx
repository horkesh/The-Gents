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
        className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1 }}
      >
        <div className="text-center">
          <motion.p
            className="label text-gold/40 mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {actDef?.name || `ACT ${transition.act}`}
          </motion.p>
          <motion.h2
            className="heading-display text-3xl text-cream mb-6"
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
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
