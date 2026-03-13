import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocketContext } from '@/contexts/SocketContext';
import { usePartyContext } from '@/contexts/PartyContext';
import { useAudio } from '@/contexts/AudioContext';

export function GroupSnap() {
  const { socket } = useSocketContext();
  const { snapCountdown } = usePartyContext();
  const { playSfx } = useAudio();
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!socket) return;

    socket.on('SNAP_COUNTDOWN', ({ seconds }) => {
      if (seconds === 0) {
        playSfx('shutter');
        captureAndUpload();
      }
    });

    socket.on('PHOTO_READY', ({ imageUrl }) => {
      setPhotoUrl(imageUrl);
      // Auto-dismiss after 5 seconds
      setTimeout(() => setPhotoUrl(null), 5000);
    });

    return () => {
      socket.off('SNAP_COUNTDOWN');
      socket.off('PHOTO_READY');
    };
  }, [socket, playSfx]);

  const captureAndUpload = async () => {
    let stream: MediaStream | null = null;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 640 },
      });
      const video = document.createElement('video');
      video.srcObject = stream;
      await video.play();

      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 640;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, 640, 640);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        const base64 = dataUrl.split(',')[1];
        socket?.emit('UPLOAD_SNAP', { imageData: base64 });
      }
      video.srcObject = null;
    } catch {
      // Camera not available — skip
    } finally {
      stream?.getTracks().forEach((t) => t.stop());
    }
  };

  return (
    <>
      {/* Countdown overlay */}
      <AnimatePresence>
        {snapCountdown !== null && snapCountdown > 0 && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50 bg-charcoal/40 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.span
              key={snapCountdown}
              className="heading-display text-8xl gold-shimmer drop-shadow-[0_0_40px_rgba(201,168,76,0.4)]"
              initial={{ scale: 2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              {snapCountdown}
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Flash effect */}
      <AnimatePresence>
        {snapCountdown === 0 && (
          <motion.div
            className="fixed inset-0 bg-white z-50"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </AnimatePresence>

      {/* Photo result */}
      <AnimatePresence>
        {photoUrl && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-40 bg-charcoal/70 backdrop-blur-md px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="max-w-sm w-full rounded-2xl overflow-hidden border-2 border-gold/20 shadow-[0_8px_40px_rgba(201,168,76,0.15)]"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 20 }}
            >
              <img src={photoUrl} alt="Group photo" className="w-full" />
              <div className="glass-strong p-3 text-center">
                <p className="label text-gold/40 tracking-[0.3em]">Group Photo</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
