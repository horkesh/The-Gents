import { motion, AnimatePresence } from 'framer-motion';
import { useSocketContext } from '@/contexts/SocketContext';

export function ConnectionStatus() {
  const { connected } = useSocketContext();

  return (
    <AnimatePresence>
      {!connected && (
        <motion.div
          className="fixed top-0 left-0 right-0 z-50 bg-ember/90 text-cream text-center py-2 text-sm font-body safe-top"
          initial={{ y: -40 }}
          animate={{ y: 0 }}
          exit={{ y: -40 }}
          role="alert"
        >
          Reconnecting...
        </motion.div>
      )}
    </AnimatePresence>
  );
}
