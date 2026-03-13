import { motion } from 'framer-motion';
import { EMOJIS } from '@the-toast/shared';
import { useSocketContext } from '@/contexts/SocketContext';

export function ReactionBar() {
  const { socket } = useSocketContext();

  const sendReaction = (emoji: string) => {
    socket?.emit('SEND_REACTION', { emoji });
  };

  return (
    <div className="flex items-center justify-center gap-2 py-2 px-4" role="toolbar" aria-label="Reactions">
      {EMOJIS.map((emoji) => (
        <motion.button
          key={emoji}
          onClick={() => sendReaction(emoji)}
          whileTap={{ scale: 1.4 }}
          whileHover={{ scale: 1.1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          aria-label={`Send ${emoji} reaction`}
          className="w-11 h-11 flex items-center justify-center text-xl
                     rounded-full glass
                     hover:border-cream/15 hover:bg-cream/5
                     active:bg-cream/10 transition-all duration-200"
        >
          {emoji}
        </motion.button>
      ))}
    </div>
  );
}
