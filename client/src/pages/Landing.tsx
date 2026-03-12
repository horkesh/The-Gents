import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeIn, slideUp } from '@/lib/animations';
import { GENT_ARCHETYPES } from '@the-toast/shared';
import type { GentRole } from '@the-toast/shared';

const GENT_ROLES = (Object.values(GENT_ARCHETYPES) as Array<typeof GENT_ARCHETYPES[GentRole]>).map((g) => ({
  role: g.role,
  title: g.controlPanelTitle,
  icon: g.controlPanelIcon,
  desc: g.superpower,
}));

export function Landing() {
  const navigate = useNavigate();
  const [joinCode, setJoinCode] = useState('');
  const [showJoin, setShowJoin] = useState(false);
  const [showRoleSelect, setShowRoleSelect] = useState(false);

  const handleHostWithRole = async (role: GentRole) => {
    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hostId: crypto.randomUUID(),
          hostRole: role,
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
          <AnimatePresence mode="wait">
            {!showJoin && !showRoleSelect ? (
              <motion.div key="main" {...fadeIn} className="flex flex-col gap-4">
                <button
                  onClick={() => setShowRoleSelect(true)}
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
              </motion.div>
            ) : showRoleSelect ? (
              <motion.div key="roles" {...fadeIn} className="flex flex-col gap-3">
                <p className="label text-cream/50 text-center mb-1">CHOOSE YOUR ROLE</p>
                {GENT_ROLES.map(({ role, title, icon, desc }) => (
                  <button
                    key={role}
                    onClick={() => handleHostWithRole(role)}
                    className="w-full py-3 px-4 border border-gold/20 text-cream font-body rounded-lg
                               hover:bg-gold/10 hover:border-gold/40 active:bg-gold/5 transition-colors
                               flex items-center gap-3"
                  >
                    <span className="text-2xl">{icon}</span>
                    <div className="text-left">
                      <div className="font-bold text-gold text-sm">{title}</div>
                      <div className="text-cream/40 text-xs">{desc}</div>
                    </div>
                  </button>
                ))}
                <button
                  onClick={() => setShowRoleSelect(false)}
                  className="w-full py-3 border border-cream/10 text-cream/50 font-body rounded-lg
                             hover:bg-cream/5 transition-colors mt-1"
                >
                  BACK
                </button>
              </motion.div>
            ) : (
              <motion.div key="join" {...fadeIn} className="flex flex-col gap-4">
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
          </AnimatePresence>
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
