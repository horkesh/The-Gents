import { motion, AnimatePresence } from 'framer-motion';
import { usePartyContext } from '@/contexts/PartyContext';
import { scaleReveal } from '@/lib/animations';

export function GuestEntrance() {
  const { activeEntrance } = usePartyContext();

  return (
    <AnimatePresence>
      {activeEntrance && (
        <motion.div
          className="fixed inset-0 flex items-end justify-center z-45 pointer-events-none pb-24 px-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="flex flex-col items-center text-center"
            {...scaleReveal}
          >
            {activeEntrance.profile.portraitUrl || activeEntrance.profile.photoUrl ? (
              <motion.div
                className="w-24 h-24 rounded-full border-2 border-gold overflow-hidden mb-3 shadow-[0_0_20px_rgba(201,168,76,0.3)]"
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                <img
                  src={activeEntrance.profile.portraitUrl || activeEntrance.profile.photoUrl}
                  alt={activeEntrance.profile.alias || activeEntrance.profile.name}
                  className="w-full h-full object-cover"
                />
              </motion.div>
            ) : null}

            <motion.h3
              className="heading-display text-lg text-gold mb-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {activeEntrance.profile.alias || activeEntrance.profile.name}
            </motion.h3>

            <motion.p
              className="heading-display-italic text-sm text-cream/60"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {activeEntrance.intro}
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
