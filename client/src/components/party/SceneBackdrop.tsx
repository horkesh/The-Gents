import { motion, AnimatePresence } from 'framer-motion';
import { usePartyContext } from '@/contexts/PartyContext';

export function SceneBackdrop() {
  const { scene } = usePartyContext();

  return (
    <div className="fixed inset-0 z-0">
      <AnimatePresence mode="wait">
        {scene?.backdropUrl && (
          <motion.div
            key={scene.backdropUrl}
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2, ease: 'easeOut' }}
          >
            <img
              src={scene.backdropUrl}
              alt=""
              className="w-full h-full object-cover"
            />
            {/* Dark overlay + vignette for readability */}
            <div className="absolute inset-0 bg-charcoal/60" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(26,26,26,0.4)_70%,rgba(26,26,26,0.8)_100%)]" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scene description */}
      {scene?.description && (
        <div className="absolute bottom-32 left-0 right-0 text-center px-8 z-10">
          <motion.p
            key={scene.description}
            className="heading-display-italic text-sm text-cream/25 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 1.2 }}
          >
            {scene.description}
          </motion.p>
        </div>
      )}
    </div>
  );
}
