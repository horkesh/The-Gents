import { motion } from 'framer-motion';
import { useSocketContext } from '@/contexts/SocketContext';
import { usePartyContext } from '@/contexts/PartyContext';
import { VIBE_MODES } from '@the-toast/shared';
import type { VibeMode } from '@the-toast/shared';

export function BassPanel() {
  const { socket } = useSocketContext();
  const { vibe } = usePartyContext();

  const handleVibeShift = (mode: VibeMode) => {
    socket?.emit('VIBE_SHIFT', { mode });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-3xl mb-2">🎵</p>
        <h3 className="label text-gold">THE ATMOSPHERE</h3>
      </div>

      <div className="space-y-3">
        {(Object.entries(VIBE_MODES) as [VibeMode, typeof VIBE_MODES[VibeMode]][]).map(
          ([mode, info]) => (
            <motion.button
              key={mode}
              onClick={() => handleVibeShift(mode)}
              whileTap={{ scale: 0.97 }}
              className={`
                w-full p-4 rounded-xl border text-left transition-all
                ${vibe === mode
                  ? 'border-gold/40 bg-gold/10'
                  : 'border-cream/5 bg-charcoal hover:bg-charcoal-lighter'}
              `}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{info.icon}</span>
                <div>
                  <p className="label text-cream text-[0.7rem]">{info.label}</p>
                  <p className="text-cream/30 text-xs font-body">{info.description}</p>
                </div>
              </div>
            </motion.button>
          )
        )}
      </div>
    </div>
  );
}
