import { motion } from 'framer-motion';
import { EMOJIS } from '@the-toast/shared';
import { useSocketContext } from '@/contexts/SocketContext';

export function ReactionBar() {
  const { socket } = useSocketContext();

  const sendReaction = (emoji: string) => {
    socket?.emit('SEND_REACTION', { emoji });
  };

  return (
    <div className="flex items-center justify-center gap-2 py-2 px-4">
      {EMOJIS.map((emoji) => (
        <motion.button
          key={emoji}
          onClick={() => sendReaction(emoji)}
          whileTap={{ scale: 1.4 }}
          className="w-11 h-11 flex items-center justify-center text-xl
                     rounded-full bg-charcoal-light/80 backdrop-blur-sm
                     border border-cream/5 hover:border-cream/20
                     active:bg-cream/10 transition-colors"
        >
          {emoji}
        </motion.button>
      ))}
    </div>
  );
}
