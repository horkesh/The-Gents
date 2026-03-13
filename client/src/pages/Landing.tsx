import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GENT_ARCHETYPES, THEMES } from '@the-toast/shared';
import type { GentRole, PartyTheme } from '@the-toast/shared';

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
  const [selectedRole, setSelectedRole] = useState<GentRole | null>(null);
  const [showThemeSelect, setShowThemeSelect] = useState(false);

  const handleRoleSelected = (role: GentRole) => {
    setSelectedRole(role);
    setShowRoleSelect(false);
    setShowThemeSelect(true);
  };

  const handleHostWithTheme = async (theme: PartyTheme) => {
    if (!selectedRole) return;
    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hostId: crypto.randomUUID(),
          hostRole: selectedRole,
          theme,
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
    <div className="noise-overlay min-h-dvh flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gold/3 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-ember/5 blur-[100px] pointer-events-none" />

      <motion.div
        className="flex flex-col items-center gap-10 max-w-sm w-full relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Logo */}
        <motion.div
          className="relative"
          initial={{ opacity: 0, scale: 0.7, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="absolute inset-0 w-32 h-32 rounded-full bg-gold/10 blur-2xl" />
          <img
            src="/logo/01_Gold_logo.png"
            alt="The Gents"
            className="w-32 h-32 relative drop-shadow-[0_0_20px_rgba(201,168,76,0.2)]"
          />
        </motion.div>

        {/* Title */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <h1 className="heading-display text-5xl gold-shimmer mb-3">The Toast</h1>
          <p className="label text-cream/30 tracking-[0.35em]">By The Gents</p>
        </motion.div>

        {/* Actions */}
        <motion.div
          className="flex flex-col gap-4 w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <AnimatePresence mode="wait">
            {!showJoin && !showRoleSelect && !showThemeSelect ? (
              <motion.div
                key="main"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-4"
              >
                <motion.button
                  onClick={() => setShowRoleSelect(true)}
                  className="w-full py-4 bg-ember text-cream font-body font-bold rounded-xl
                             hover:bg-ember-light active:bg-ember-dark transition-all duration-200
                             shadow-[0_4px_20px_-4px_rgba(172,61,41,0.5)]
                             hover:shadow-[0_6px_28px_-4px_rgba(172,61,41,0.6)]"
                  whileTap={{ scale: 0.97 }}
                  whileHover={{ scale: 1.01 }}
                >
                  HOST A PARTY
                </motion.button>
                <motion.button
                  onClick={() => setShowJoin(true)}
                  className="w-full py-4 glass text-gold font-body font-bold rounded-xl
                             hover:bg-gold/8 transition-all duration-200
                             shadow-[0_2px_12px_-4px_rgba(201,168,76,0.15)]"
                  whileTap={{ scale: 0.97 }}
                  whileHover={{ scale: 1.01 }}
                >
                  JOIN A PARTY
                </motion.button>
              </motion.div>
            ) : showThemeSelect ? (
              <motion.div
                key="themes"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-3"
              >
                <p className="label text-cream/40 text-center mb-2 tracking-[0.3em]">CHOOSE A SCENE</p>
                {(Object.entries(THEMES) as [PartyTheme, typeof THEMES[PartyTheme]][]).map(([key, theme], i) => (
                  <motion.button
                    key={key}
                    onClick={() => handleHostWithTheme(key)}
                    className="w-full py-3.5 px-5 glass rounded-xl
                               hover:bg-gold/8 transition-all duration-200
                               flex items-center gap-4"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-[0_0_8px_0px]"
                      style={{ backgroundColor: theme.colorAccent, boxShadow: `0 0 8px ${theme.colorAccent}40` }}
                    />
                    <div className="text-left">
                      <div className="font-bold text-cream text-sm">{theme.label}</div>
                      <div className="text-cream/30 text-xs">{theme.description}</div>
                    </div>
                  </motion.button>
                ))}
                <button
                  onClick={() => { setShowThemeSelect(false); setShowRoleSelect(true); }}
                  className="w-full py-3 text-cream/30 font-body text-sm rounded-xl
                             hover:text-cream/50 transition-colors mt-1"
                >
                  BACK
                </button>
              </motion.div>
            ) : showRoleSelect ? (
              <motion.div
                key="roles"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-3"
              >
                <p className="label text-cream/40 text-center mb-2 tracking-[0.3em]">CHOOSE YOUR ROLE</p>
                {GENT_ROLES.map(({ role, title, icon, desc }, i) => (
                  <motion.button
                    key={role}
                    onClick={() => handleRoleSelected(role)}
                    className="w-full py-3.5 px-5 glass rounded-xl
                               hover:bg-gold/8 transition-all duration-200
                               flex items-center gap-4"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="text-2xl">{icon}</span>
                    <div className="text-left">
                      <div className="font-bold text-gold text-sm">{title}</div>
                      <div className="text-cream/30 text-xs">{desc}</div>
                    </div>
                  </motion.button>
                ))}
                <button
                  onClick={() => setShowRoleSelect(false)}
                  className="w-full py-3 text-cream/30 font-body text-sm rounded-xl
                             hover:text-cream/50 transition-colors mt-1"
                >
                  BACK
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="join"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-4"
              >
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 4))}
                  placeholder="ENTER CODE"
                  maxLength={4}
                  className="w-full py-5 px-6 glass text-cream
                             text-center font-body text-2xl tracking-[0.4em] rounded-xl
                             placeholder:text-cream/15 focus:outline-none focus:ring-1 focus:ring-gold/30
                             transition-all duration-200"
                  autoFocus
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowJoin(false)}
                    className="flex-1 py-3.5 text-cream/30 font-body rounded-xl
                               hover:text-cream/50 hover:bg-cream/3 transition-all duration-200"
                  >
                    BACK
                  </button>
                  <motion.button
                    onClick={handleJoin}
                    disabled={joinCode.length !== 4}
                    className="flex-1 py-3.5 bg-teal text-cream font-body font-bold rounded-xl
                               hover:bg-teal-light disabled:opacity-20 disabled:cursor-not-allowed
                               transition-all duration-200 shadow-[0_4px_16px_-4px_rgba(25,79,76,0.5)]"
                    whileTap={{ scale: 0.97 }}
                  >
                    JOIN
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Footer */}
        <motion.div
          className="flex flex-col items-center gap-2 mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 }}
        >
          <div className="w-8 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
          <p className="label text-cream/15 tracking-[0.35em]">
            An invitation-only experience
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
