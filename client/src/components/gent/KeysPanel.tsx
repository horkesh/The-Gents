import { useState } from 'react';
import { motion } from 'framer-motion';
import { useSocketContext } from '@/contexts/SocketContext';
import { Button } from '../ui/Button';
import { Spinner } from '../ui/Spinner';

export function KeysPanel() {
  const { socket } = useSocketContext();
  const [mixing, setMixing] = useState(false);

  const handleMix = () => {
    setMixing(true);
    socket?.emit('SEND_GROUP_DRINK');
    // Reset after a delay (server will broadcast the drink)
    setTimeout(() => setMixing(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-3xl mb-2">🍸</p>
        <h3 className="label text-gold">THE ALCHEMIST</h3>
      </div>

      <div className="flex flex-col items-center gap-4">
        {mixing ? (
          <motion.div
            className="flex flex-col items-center gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Spinner size={40} />
            <p className="heading-display-italic text-sm text-cream/50">
              Mixing something special...
            </p>
          </motion.div>
        ) : (
          <Button variant="gold" size="lg" onClick={handleMix} className="w-full">
            SHAKE TO MIX
          </Button>
        )}

        <p className="text-cream/30 text-xs font-body text-center">
          Sends a cocktail to everyone
        </p>
      </div>
    </div>
  );
}
