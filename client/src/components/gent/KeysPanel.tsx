import { useState } from 'react';
import { motion } from 'framer-motion';
import { useSocketContext } from '@/contexts/SocketContext';
import { useRoomContext } from '@/contexts/RoomContext';
import { Button } from '../ui/Button';
import { Spinner } from '../ui/Spinner';

export function KeysPanel() {
  const { socket } = useSocketContext();
  const { participants } = useRoomContext();
  const [mixing, setMixing] = useState(false);
  const [dedicatedTo, setDedicatedTo] = useState<string | undefined>();

  const guests = participants.filter((p) => p.role === 'guest');
  const selectedGuest = dedicatedTo ? guests.find((g) => g.id === dedicatedTo) : undefined;

  const handleMix = () => {
    setMixing(true);
    socket?.emit('SEND_GROUP_DRINK', dedicatedTo ? { dedicatedTo } : undefined);
    setTimeout(() => {
      setMixing(false);
      setDedicatedTo(undefined);
    }, 3000);
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
              {selectedGuest ? `Crafting for ${selectedGuest.alias || selectedGuest.name}...` : 'Mixing something special...'}
            </p>
          </motion.div>
        ) : (
          <>
            <Button variant="gold" size="lg" onClick={handleMix} className="w-full">
              SHAKE TO MIX
            </Button>

            {/* Dedication selector */}
            <div className="w-full">
              <p className="label text-cream/30 mb-2 text-center">DEDICATE TO</p>
              <div className="flex flex-wrap gap-1 justify-center">
                <button
                  onClick={() => setDedicatedTo(undefined)}
                  className={`text-xs px-2 py-1 rounded font-body ${!dedicatedTo ? 'bg-gold/20 text-gold' : 'text-cream/30 hover:text-cream/50'}`}
                >
                  Everyone
                </button>
                {guests.map((guest) => (
                  <button
                    key={guest.id}
                    onClick={() => setDedicatedTo(guest.id)}
                    className={`text-xs px-2 py-1 rounded font-body ${dedicatedTo === guest.id ? 'bg-gold/20 text-gold' : 'text-cream/30 hover:text-cream/50'}`}
                  >
                    {guest.alias || guest.name}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
