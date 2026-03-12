import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocketContext } from '@/contexts/SocketContext';

interface FloatingEmoji {
  id: string;
  emoji: string;
  senderName: string;
  x: number;
}

export function FloatingReactions() {
  const { socket } = useSocketContext();
  const [reactions, setReactions] = useState<FloatingEmoji[]>([]);

  useEffect(() => {
    if (!socket) return;

    socket.on('REACTION', ({ emoji, senderName, senderId }) => {
      const id = `${senderId}-${Date.now()}`;
      const x = 10 + Math.random() * 80; // 10-90% of screen width

      setReactions((prev) => [...prev, { id, emoji, senderName, x }]);

      // Auto-remove after animation
      setTimeout(() => {
        setReactions((prev) => prev.filter((r) => r.id !== id));
      }, 2500);
    });

    return () => {
      socket.off('REACTION');
    };
  }, [socket]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      <AnimatePresence>
        {reactions.map((reaction) => (
          <motion.div
            key={reaction.id}
            initial={{ opacity: 1, y: 0, scale: 1 }}
            animate={{
              opacity: [1, 1, 0],
              y: -250,
              scale: [1, 1.3, 0.8],
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2.5, ease: 'easeOut' }}
            className="absolute bottom-24 flex flex-col items-center"
            style={{ left: `${reaction.x}%` }}
          >
            <span className="text-3xl">{reaction.emoji}</span>
            <span className="text-[0.5rem] text-cream/40 tracking-wider uppercase mt-1">
              {reaction.senderName}
            </span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
