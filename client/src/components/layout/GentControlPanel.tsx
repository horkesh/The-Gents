import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRoomContext } from '@/contexts/RoomContext';
import { KeysPanel } from '../gent/KeysPanel';
import { BassPanel } from '../gent/BassPanel';
import { LorekeeperPanel } from '../gent/LorekeeperPanel';
import type { GentRole } from '@the-toast/shared';

const TABS: { role: GentRole; label: string; icon: string }[] = [
  { role: 'keys', label: 'Keys', icon: '🍸' },
  { role: 'bass', label: 'Bass', icon: '🎵' },
  { role: 'lorekeeper', label: 'Lore', icon: '📜' },
];

export function GentControlPanel() {
  const { currentUser, isGent } = useRoomContext();
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<GentRole>(
    (currentUser?.role as GentRole) || 'keys'
  );

  if (!isGent) return null;

  return (
    <>
      {/* Toggle button */}
      <motion.button
        onClick={() => setOpen(!open)}
        className="fixed bottom-20 right-4 z-30 w-14 h-14 rounded-full glass
                   border-gold/20 flex items-center justify-center
                   shadow-[0_2px_12px_rgba(201,168,76,0.15)]"
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.05 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      >
        <img src="/logo/01_Gold_logo.png" alt="Controls" className="w-8 h-8 drop-shadow-[0_0_8px_rgba(201,168,76,0.2)]" />
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-x-0 bottom-0 z-30 glass-strong
                       border-t border-gold/10 rounded-t-3xl safe-bottom
                       shadow-[0_-8px_40px_rgba(0,0,0,0.3)]"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Tab bar */}
            <div className="flex border-b border-cream/5">
              {TABS.map((tab) => (
                <button
                  key={tab.role}
                  onClick={() => setActiveTab(tab.role)}
                  className={`
                    flex-1 py-3 text-center transition-colors
                    ${activeTab === tab.role ? 'text-gold border-b-2 border-gold' : 'text-cream/30'}
                  `}
                >
                  <span className="text-lg">{tab.icon}</span>
                  <span className="block text-[0.55rem] tracking-widest uppercase mt-0.5">
                    {tab.label}
                  </span>
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="p-6 max-h-[50vh] overflow-y-auto">
              {activeTab === 'keys' && <KeysPanel />}
              {activeTab === 'bass' && <BassPanel />}
              {activeTab === 'lorekeeper' && <LorekeeperPanel />}
            </div>

            {/* Close */}
            <button
              onClick={() => setOpen(false)}
              className="w-full py-3 text-cream/20 text-sm border-t border-cream/5 hover:text-cream/40 transition-colors"
            >
              Close
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
