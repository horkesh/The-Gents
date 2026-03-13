import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocketContext } from '@/contexts/SocketContext';
import { usePartyContext } from '@/contexts/PartyContext';
import { useAudio } from '@/contexts/AudioContext';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { scaleReveal } from '@/lib/animations';

type Phase = 'prompt' | 'voting' | 'result';

export function ConfessionRound() {
  const { socket } = useSocketContext();
  const { activeConfession } = usePartyContext();
  const { playSfx } = useAudio();
  const [phase, setPhase] = useState<Phase>('prompt');
  const [voted, setVoted] = useState(false);
  const [result, setResult] = useState<{
    question: string;
    yesCount: number;
    noCount: number;
    mysteryCount: number;
    total: number;
    commentary: string;
  } | null>(null);
  const [timer, setTimer] = useState(10);

  // Reset when new confession arrives
  useEffect(() => {
    if (activeConfession) {
      setPhase('prompt');
      setVoted(false);
      setResult(null);
      setTimer(10);
      playSfx('envelope');

      // Auto-advance to voting after 2 seconds
      const t = setTimeout(() => setPhase('voting'), 2000);
      return () => clearTimeout(t);
    }
  }, [activeConfession?.question, playSfx]);

  // Voting countdown
  useEffect(() => {
    if (phase !== 'voting') return;

    const interval = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) { clearInterval(interval); return 0; }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [phase]);

  // Listen for result
  useEffect(() => {
    if (!socket) return;

    socket.on('CONFESSION_RESULT', (data) => {
      setResult(data);
      setPhase('result');
    });

    return () => {
      socket.off('CONFESSION_RESULT');
    };
  }, [socket]);

  const handleVote = (answer: boolean | null) => {
    if (voted) return;
    setVoted(true);
    socket?.emit('CONFESSION_VOTE', { answer });
  };

  if (!activeConfession && !result) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 flex items-center justify-center z-40 bg-charcoal/70 backdrop-blur-md px-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <Card glow className="max-w-sm w-full text-center" {...scaleReveal}>
          {phase === 'prompt' && activeConfession && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <p className="label text-ember/60 mb-4 tracking-[0.3em]">CONFESSION</p>
              <p className="heading-display text-lg text-cream leading-relaxed">
                {activeConfession.question}
              </p>
            </motion.div>
          )}

          {phase === 'voting' && activeConfession && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <p className="label text-ember/60 mb-4 tracking-[0.3em]">CONFESSION</p>
              <p className="heading-display text-lg text-cream leading-relaxed mb-6">
                {activeConfession.question}
              </p>

              {!voted ? (
                <div className="flex gap-2 mb-4">
                  <Button variant="ghost" size="lg" onClick={() => handleVote(false)} className="flex-1">
                    NO
                  </Button>
                  <Button variant="secondary" size="md" onClick={() => handleVote(null)} className="px-3">
                    I'LL NEVER TELL
                  </Button>
                  <Button variant="primary" size="lg" onClick={() => handleVote(true)} className="flex-1">
                    YES
                  </Button>
                </div>
              ) : (
                <p className="text-cream/40 font-body mb-4">Waiting for others...</p>
              )}

              <div className="w-full bg-charcoal rounded-full h-1">
                <motion.div
                  className="bg-gold h-1 rounded-full"
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ duration: timer, ease: 'linear' }}
                />
              </div>
            </motion.div>
          )}

          {phase === 'result' && result && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              <p className="label text-ember/60 mb-4 tracking-[0.3em]">THE VERDICT</p>
              <p className="heading-display text-3xl gold-shimmer mb-2">
                {result.yesCount} / {result.total}
              </p>
              <p className="text-cream/50 font-body text-sm mb-1">said yes</p>
              {result.mysteryCount > 0 && (
                <p className="text-gold/40 font-body text-xs mb-3">
                  {result.mysteryCount} refused to answer
                </p>
              )}
              <p className="heading-display-italic text-cream/60">
                "{result.commentary}"
              </p>
            </motion.div>
          )}
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
