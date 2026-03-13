import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocketContext } from '@/contexts/SocketContext';
import { useAudio } from '@/contexts/AudioContext';
import { cinematicEntrance } from '@/lib/animations';

type ToastPhase = 'speech' | 'countdown' | 'capture' | null;

export function TheToast() {
  const { socket } = useSocketContext();
  const { playSfx } = useAudio();
  const [phase, setPhase] = useState<ToastPhase>(null);
  const [speech, setSpeech] = useState('');
  const [countdown, setCountdown] = useState(3);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const photoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!socket) return;

    socket.on('TOAST_SPEECH', ({ speech: s }) => {
      setSpeech(s);
      setPhase('speech');
    });

    socket.on('TOAST_SNAP', () => {
      setPhase('countdown');
      setCountdown(3);
    });

    socket.on('TOAST_PHOTO_READY', ({ imageUrl }) => {
      setPhotoUrl(imageUrl);
      setPhase(null);
      if (photoTimerRef.current) clearTimeout(photoTimerRef.current);
      photoTimerRef.current = setTimeout(() => {
        setPhotoUrl(null);
        photoTimerRef.current = null;
      }, 8000);
    });

    return () => {
      socket.off('TOAST_SPEECH');
      socket.off('TOAST_SNAP');
      socket.off('TOAST_PHOTO_READY');
      if (photoTimerRef.current) clearTimeout(photoTimerRef.current);
    };
  }, [socket]);

  // Countdown timer
  useEffect(() => {
    if (phase !== 'countdown') return;

    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(interval);
          playSfx('shutter');
          setPhase('capture');
          return 0;
        }
        return c - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [phase, playSfx]);

  return (
    <AnimatePresence>
      {phase === 'speech' && (
        <motion.div
          key="toast-speech"
          className="fixed inset-0 flex items-center justify-center z-45 bg-charcoal/80 backdrop-blur-md px-8"
          {...cinematicEntrance}
        >
          <div className="text-center max-w-md">
            <p className="label text-gold/60 mb-6">THE TOAST</p>
            <p className="heading-display-italic text-cream text-xl leading-relaxed">
              "{speech}"
            </p>
          </div>
        </motion.div>
      )}

      {phase === 'countdown' && (
        <motion.div
          key="toast-countdown"
          className="fixed inset-0 flex items-center justify-center z-45 bg-charcoal/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="text-center">
            <p className="label text-gold mb-4">RAISE YOUR GLASS</p>
            <motion.p
              key={countdown}
              className="heading-display text-7xl text-gold"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {countdown}
            </motion.p>
          </div>
        </motion.div>
      )}

      {phase === 'capture' && (
        <motion.div
          key="toast-flash"
          className="fixed inset-0 bg-cream z-50"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          onAnimationComplete={() => setPhase(null)}
        />
      )}

      {photoUrl && (
        <motion.div
          key="toast-photo"
          className="fixed inset-0 flex items-center justify-center z-40 bg-charcoal/70 backdrop-blur-sm px-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="text-center">
            <p className="label text-gold/60 mb-4">THE TOAST</p>
            <div className="rounded-xl overflow-hidden border-2 border-gold shadow-[0_0_30px_rgba(201,168,76,0.3)] max-w-sm">
              <img src={photoUrl} alt="The Toast" className="w-full" />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
