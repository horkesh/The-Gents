import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fadeIn, slideUp } from '@/lib/animations';

export function Landing() {
  const navigate = useNavigate();
  const [joinCode, setJoinCode] = useState('');
  const [showJoin, setShowJoin] = useState(false);

  const handleHost = async () => {
    // TODO: Gent role selection → create room → redirect to lobby
    // For now, create room as keys
    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hostId: crypto.randomUUID(),
          hostRole: 'keys',
        }),
      });
      const { code } = await res.json();
      navigate(`/lobby/${code}`);
    } catch (err) {
      console.error('Failed to create room:', err);
    }
  };

  const handleJoin = () => {
    if (joinCode.length === 4) {
      navigate(`/setup/${joinCode.toUpperCase()}`);
    }
  };

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6">
      <motion.div {...fadeIn} className="flex flex-col items-center gap-8 max-w-sm w-full">
        {/* Logo */}
        <motion.img
          src="/logo/01_Gold_logo.png"
          alt="The Gents"
          className="w-32 h-32"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' as const }}
        />

        {/* Title */}
        <motion.div {...slideUp} className="text-center">
          <h1 className="heading-display text-4xl text-gold mb-2">The Toast</h1>
          <p className="label text-cream/50">By The Gents</p>
        </motion.div>

        {/* Actions */}
        <motion.div
          className="flex flex-col gap-4 w-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {!showJoin ? (
            <>
              <button
                onClick={handleHost}
                className="w-full py-4 bg-ember text-cream font-body font-bold rounded-lg
                           hover:bg-ember-light active:bg-ember-dark transition-colors"
              >
                HOST A PARTY
              </button>
              <button
                onClick={() => setShowJoin(true)}
                className="w-full py-4 border border-gold/30 text-gold font-body font-bold rounded-lg
                           hover:bg-gold/10 active:bg-gold/5 transition-colors"
              >
                JOIN A PARTY
              </button>
            </>
          ) : (
            <motion.div {...fadeIn} className="flex flex-col gap-4">
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 4))}
                placeholder="ENTER CODE"
                maxLength={4}
                className="w-full py-4 px-6 bg-charcoal-light border border-gold/20 text-cream
                           text-center font-body text-2xl tracking-[0.3em] rounded-lg
                           placeholder:text-cream/20 focus:outline-none focus:border-gold/50"
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setShowJoin(false)}
                  className="flex-1 py-3 border border-cream/10 text-cream/50 font-body rounded-lg
                             hover:bg-cream/5 transition-colors"
                >
                  BACK
                </button>
                <button
                  onClick={handleJoin}
                  disabled={joinCode.length !== 4}
                  className="flex-1 py-3 bg-teal text-cream font-body font-bold rounded-lg
                             hover:bg-teal-light disabled:opacity-30 disabled:cursor-not-allowed
                             transition-colors"
                >
                  JOIN
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Footer */}
        <motion.p
          className="label text-cream/20 mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          An invitation-only experience
        </motion.p>
      </motion.div>
    </div>
  );
}
