import { motion, AnimatePresence } from 'framer-motion';
import { usePartyContext } from '@/contexts/PartyContext';
import { spotlightGlow } from '@/lib/animations';

export function Spotlight() {
  const { activeSpotlight } = usePartyContext();

  return (
    <AnimatePresence>
      {activeSpotlight && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center z-40 bg-charcoal/85 backdrop-blur-md px-6"
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
            <div className="relative mb-6">
              <div className="absolute inset-0 w-48 h-48 rounded-full bg-gold/10 blur-3xl" />
              <motion.div
                className="w-48 h-48 rounded-full border-2 border-gold overflow-hidden shadow-[0_0_40px_rgba(201,168,76,0.3)] relative"
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
            </div>

            <h2 className="heading-display text-2xl gold-shimmer mb-3">
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
