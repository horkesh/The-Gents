import { useLocalParticipant, useDaily } from '@daily-co/daily-react';
import { motion } from 'framer-motion';

export function VideoControls() {
  const daily = useDaily();
  const localParticipant = useLocalParticipant();

  if (!daily || !localParticipant) return null;

  const isMuted = !localParticipant.audio;
  const isCameraOff = !localParticipant.video;

  const toggleMic = () => {
    daily.setLocalAudio(!localParticipant.audio);
  };

  const toggleCamera = () => {
    daily.setLocalVideo(!localParticipant.video);
  };

  return (
    <div className="flex justify-center gap-3">
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={toggleMic}
        className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
          isMuted
            ? 'bg-ember/80 text-cream'
            : 'bg-charcoal-light border border-cream/10 text-cream/60'
        }`}
        aria-label={isMuted ? 'Unmute microphone' : 'Mute microphone'}
      >
        {isMuted ? '🔇' : '🎙️'}
      </motion.button>

      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={toggleCamera}
        className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
          isCameraOff
            ? 'bg-ember/80 text-cream'
            : 'bg-charcoal-light border border-cream/10 text-cream/60'
        }`}
        aria-label={isCameraOff ? 'Turn camera on' : 'Turn camera off'}
      >
        {isCameraOff ? '📷' : '📹'}
      </motion.button>
    </div>
  );
}
