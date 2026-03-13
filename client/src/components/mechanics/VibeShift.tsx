import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocketContext } from '@/contexts/SocketContext';
import { useAudio } from '@/contexts/AudioContext';
import type { VibeMode } from '@the-toast/shared';

const vibeFilters: Record<VibeMode, string> = {
  slow_burn: 'brightness(0.85) saturate(0.9) sepia(0.1)',
  cruise: 'brightness(1) saturate(1.05)',
  ignition: 'brightness(1.1) saturate(1.2) contrast(1.05)',
};

const vibeOverlayColors: Record<VibeMode, string> = {
  slow_burn: 'bg-amber-900/10',
  cruise: 'bg-teal/5',
  ignition: 'bg-ember/10',
};

export function VibeShiftOverlay() {
  const { socket } = useSocketContext();
  const { playSfx } = useAudio();
  const [narration, setNarration] = useState<string | null>(null);
  const [currentVibe, setCurrentVibe] = useState<VibeMode>('slow_burn');

  useEffect(() => {
    if (!socket) return;

    socket.on('VIBE_CHANGED', ({ mode, narration: text }) => {
      setCurrentVibe(mode);
      setNarration(text);
      playSfx('scratch');
      setTimeout(() => setNarration(null), 4000);
    });

    return () => {
      socket.off('VIBE_CHANGED');
    };
  }, [socket, playSfx]);

  return (
    <>
      {/* Color overlay that shifts with vibe */}
      <div
        className={`fixed inset-0 pointer-events-none z-10 transition-all duration-2000 ${vibeOverlayColors[currentVibe]}`}
        style={{ filter: vibeFilters[currentVibe] }}
      />

      {/* Narration text */}
      <AnimatePresence>
        {narration && (
          <motion.div
            className="fixed top-1/3 left-0 right-0 z-40 text-center px-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.8 }}
          >
            <p className="heading-display-italic text-lg text-cream/70 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
              {narration}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
