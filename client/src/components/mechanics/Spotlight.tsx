import { motion, AnimatePresence } from 'framer-motion';
import { usePartyContext } from '@/contexts/PartyContext';
import { spotlightGlow } from '@/lib/animations';

export function Spotlight() {
  const { activeSpotlight } = usePartyContext();

  return (
    <AnimatePresence>
      {activeSpotlight && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center z-40 bg-charcoal/80 backdrop-blur-sm px-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="flex flex-col items-center text-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              className="w-48 h-48 rounded-full border-3 border-gold overflow-hidden mb-6"
              variants={spotlightGlow}
              initial="initial"
              animate="animate"
            >
              <img
                src={activeSpotlight.profile.portraitUrl || activeSpotlight.profile.photoUrl}
                alt={activeSpotlight.profile.alias}
                className="w-full h-full object-cover"
              />
            </motion.div>

            <h2 className="heading-display text-2xl text-gold mb-3">
              {activeSpotlight.profile.alias || activeSpotlight.profile.name}
            </h2>

            <p className="heading-display-italic text-cream/60 text-lg max-w-xs">
              "{activeSpotlight.roast}"
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
