import { motion, AnimatePresence } from 'framer-motion';
import { useSocketContext } from '@/contexts/SocketContext';
import { usePartyContext } from '@/contexts/PartyContext';
import { useAudio } from '@/contexts/AudioContext';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { pourAnimation, scaleReveal } from '@/lib/animations';
import type { Cocktail } from '@the-toast/shared';

export function DrinkRound() {
  const { socket } = useSocketContext();
  const { activeDrink } = usePartyContext();
  const { playSfx } = useAudio();

  const handleAccept = (cocktailName: string) => {
    playSfx('clink');
    socket?.emit('ACCEPT_DRINK', { cocktailName });
  };

  const handleDodge = (cocktailName: string) => {
    socket?.emit('DODGE_DRINK', { cocktailName });
  };

  return (
    <AnimatePresence>
      {activeDrink && (
        <DrinkCard
          cocktail={activeDrink.cocktail}
          fromGent={activeDrink.fromGent}
          onAccept={() => handleAccept(activeDrink.cocktail.name)}
          onDodge={() => handleDodge(activeDrink.cocktail.name)}
          onAppear={() => playSfx('pour')}
        />
      )}
    </AnimatePresence>
  );
}

function DrinkCard({
  cocktail,
  fromGent,
  onAccept,
  onDodge,
  onAppear,
}: {
  cocktail: Cocktail;
  fromGent: string;
  onAccept: () => void;
  onDodge: () => void;
  onAppear: () => void;
}) {
  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center z-40 bg-charcoal/60 backdrop-blur-sm px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Card glow className="max-w-sm w-full text-center" {...scaleReveal} onAnimationStart={onAppear}>
        <p className="label text-gold/50 mb-3">{fromGent} serves</p>

        {/* Cocktail image */}
        {cocktail.imageUrl && (
          <motion.div
            className="w-48 h-48 mx-auto mb-4 rounded-xl overflow-hidden"
            variants={pourAnimation}
            initial="initial"
            animate="animate"
          >
            <img
              src={cocktail.imageUrl}
              alt={cocktail.name}
              className="w-full h-full object-cover"
            />
          </motion.div>
        )}

        <h3 className="heading-display text-xl text-gold mb-2">{cocktail.name}</h3>
        <p className="heading-display-italic text-sm text-cream/50 mb-6">
          "{cocktail.story}"
        </p>

        <div className="flex gap-3">
          <Button variant="ghost" size="sm" onClick={onDodge} className="flex-1">
            DODGE
          </Button>
          <Button variant="primary" size="sm" onClick={onAccept} className="flex-1">
            ACCEPT
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}
