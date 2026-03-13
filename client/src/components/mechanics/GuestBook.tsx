import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocketContext } from '@/contexts/SocketContext';
import { usePartyContext } from '@/contexts/PartyContext';
import { Button } from '../ui/Button';
import { slideUp } from '@/lib/animations';

export function GuestBook() {
  const { socket } = useSocketContext();
  const { guestBookOpen } = usePartyContext();
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!message.trim()) return;
    socket?.emit('SUBMIT_GUEST_BOOK', { message: message.trim() });
    setSubmitted(true);
  };

  if (!guestBookOpen || submitted) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed bottom-20 left-0 right-0 flex justify-center px-6 z-30 pointer-events-none"
        {...slideUp}
      >
        <div className="glass-strong rounded-2xl p-4 max-w-sm w-full shadow-[0_-4px_20px_rgba(0,0,0,0.3)] pointer-events-auto gradient-border">
          <p className="label text-gold/40 text-center mb-3 tracking-[0.3em]">THE GUEST BOOK</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value.slice(0, 100))}
              placeholder="Leave a note for the guest book..."
              className="flex-1 glass rounded-xl px-3 py-2.5 text-cream text-sm font-body placeholder:text-cream/15 focus:outline-none focus:ring-1 focus:ring-gold/30 transition-all duration-200"
              maxLength={100}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
            <Button variant="gold" size="sm" onClick={handleSubmit}>
              SIGN
            </Button>
          </div>
          <p className="text-cream/15 text-xs font-body text-right mt-1">
            {message.length}/100
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
