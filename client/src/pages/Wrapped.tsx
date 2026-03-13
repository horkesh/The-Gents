import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSocketContext } from '@/contexts/SocketContext';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { fadeIn, slideUp, scaleReveal } from '@/lib/animations';
import type { ParticipantProfile, ParticipantStats } from '@the-toast/shared';

interface WrappedData {
  stats: ParticipantStats;
  lorekeeperNote: string;
  sessionTitle: string;
  photos: string[];
  profile: ParticipantProfile;
  guestBookEntries: string[];
  mostAlignedWith?: {
    alias: string;
    matchScore: number;
    quip: string;
  };
  totalGuests: number;
}

export function Wrapped() {
  const { code } = useParams<{ code: string }>();
  const { socket } = useSocketContext();
  const [data, setData] = useState<WrappedData | null>(null);

  useEffect(() => {
    if (!socket) return;
    socket.on('WRAPPED_READY', (payload) => {
      setData(payload);
    });
    return () => {
      socket.off('WRAPPED_READY');
    };
  }, [socket]);

  const handleShare = async () => {
    // Use Web Share API if available
    if (navigator.share) {
      try {
        await navigator.share({
          title: `The Toast - ${data?.sessionTitle || 'My Evening'}`,
          text: data?.lorekeeperNote || 'An evening with The Gents',
        });
      } catch {
        // User cancelled or not supported
      }
    }
  };

  if (!data) {
    return (
      <motion.div {...fadeIn} className="noise-overlay min-h-dvh flex flex-col items-center justify-center px-6 relative overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-gold/3 blur-[120px] pointer-events-none" />
        <div className="relative z-10 flex flex-col items-center">
          <div className="relative">
            <div className="absolute inset-0 w-20 h-20 rounded-full bg-gold/10 blur-2xl" />
            <img src="/logo/01_Gold_logo.png" alt="The Gents" className="w-20 h-20 relative drop-shadow-[0_0_20px_rgba(201,168,76,0.2)]" />
          </div>
          <p className="heading-display-italic text-gold/50 text-lg mt-6">
            The evening wraps up...
          </p>
          <p className="label text-cream/20 mt-4">Session {code}</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div {...fadeIn} className="noise-overlay min-h-dvh px-6 py-8 relative overflow-hidden">
      {/* Ambient background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-gold/3 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px] rounded-full bg-ember/5 blur-[100px] pointer-events-none" />

      <div className="max-w-sm mx-auto relative z-10">
        {/* Header */}
        <motion.div className="text-center mb-8" {...slideUp}>
          <div className="relative inline-block">
            <div className="absolute inset-0 w-14 h-14 rounded-full bg-gold/10 blur-xl" />
            <img src="/logo/01_Gold_logo.png" alt="The Gents" className="w-14 h-14 mx-auto mb-4 relative drop-shadow-[0_0_12px_rgba(201,168,76,0.2)]" />
          </div>
          <h1 className="heading-display text-xl gold-shimmer mb-1">{data.sessionTitle}</h1>
          <p className="label text-cream/30">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </motion.div>

        {/* Portrait */}
        <motion.div className="flex flex-col items-center mb-8" {...scaleReveal}>
          <div className="relative">
            <div className="absolute inset-0 w-36 h-36 rounded-full bg-gold/8 blur-2xl" />
            <div className="w-36 h-36 rounded-full border-2 border-gold overflow-hidden mb-4 shadow-[0_0_30px_rgba(201,168,76,0.2)] relative">
              <img
                src={data.profile.portraitUrl || data.profile.photoUrl}
                alt={data.profile.alias}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <h2 className="heading-display text-2xl text-cream">{data.profile.alias}</h2>
          <p className="text-cream/30 text-sm font-body">{data.profile.name}</p>
          <div className="flex gap-2 mt-3">
            <Badge variant="gold">GUEST</Badge>
          </div>
          {data.stats.arrivalOrder > 0 && (
            <p className="text-cream/20 text-xs font-body mt-2 italic">
              {arrivalOrderText(data.stats.arrivalOrder, data.totalGuests)}
            </p>
          )}
        </motion.div>

        {/* Stats */}
        <motion.div
          className="grid grid-cols-2 gap-3 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <StatCard label="DRINKS RECEIVED" value={data.stats.drinksReceived} />
          <StatCard label="DRINKS ACCEPTED" value={data.stats.drinksAccepted} />
          <StatCard label="DRINKS DODGED" value={data.stats.drinksDodged} />
          <StatCard label="CONFESSIONS" value={data.stats.confessionsParticipated} />
          <StatCard label="SPOTLIGHTED" value={data.stats.timesSpotlighted} />
          <StatCard label="GROUP PHOTOS" value={data.stats.snapsAppeared} />
        </motion.div>

        {/* Lorekeeper's Note */}
        <motion.div
          className="glass-strong rounded-2xl p-6 mb-8 text-center ambient-glow gradient-border"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <p className="label text-gold/40 mb-3">The Lorekeeper's Note</p>
          <p className="heading-display-italic text-cream/70 leading-relaxed">
            "{data.lorekeeperNote}"
          </p>
        </motion.div>

        {/* Compatibility */}
        {data.mostAlignedWith && (
          <motion.div
            className="glass-strong rounded-2xl p-6 mb-8 text-center gradient-border"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <p className="label text-gold/40 mb-3">YOUR MATCH</p>
            <p className="heading-display text-xl text-cream mb-1">{data.mostAlignedWith.alias}</p>
            <p className="text-gold text-2xl font-body font-bold mb-2">{data.mostAlignedWith.matchScore}%</p>
            <p className="heading-display-italic text-cream/50 text-sm">
              "{data.mostAlignedWith.quip}"
            </p>
          </motion.div>
        )}

        {/* Guest Book */}
        {data.guestBookEntries.length > 0 && (
          <motion.div
            className="glass rounded-2xl p-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
          >
            <p className="label text-cream/30 mb-4 text-center">FROM THE GUEST BOOK</p>
            <div className="space-y-3">
              {data.guestBookEntries.map((entry, i) => (
                <p key={i} className="heading-display-italic text-cream/50 text-sm text-center">
                  "{entry}"
                </p>
              ))}
            </div>
          </motion.div>
        )}

        {/* Photos */}
        {data.photos.length > 0 && (
          <motion.div
            className="mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0 }}
          >
            <p className="label text-cream/30 mb-3 text-center">Moments</p>
            <div className="flex gap-2.5 overflow-x-auto pb-2">
              {data.photos.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt={`Moment ${i + 1}`}
                  className="w-24 h-24 rounded-xl object-cover flex-shrink-0 border border-gold/8 shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Share */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <Button variant="gold" size="lg" onClick={handleShare} className="w-full">
            SHARE YOUR EVENING
          </Button>
        </motion.div>

        {/* Footer */}
        <div className="flex flex-col items-center gap-2 mt-8">
          <div className="w-8 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
          <p className="label text-cream/10">
            @the.gents.chronicles
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function arrivalOrderText(order: number, total: number): string {
  if (order === 1) return 'First to arrive.';
  if (order === total) return 'Last to arrive — fashionably.';
  const suffix = order === 2 ? 'nd' : order === 3 ? 'rd' : 'th';
  return `Arrived ${order}${suffix}.`;
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="glass rounded-xl p-3.5 text-center">
      <p className="heading-display text-2xl text-gold">{value}</p>
      <p className="label text-cream/20 mt-1" style={{ fontSize: '0.5rem' }}>{label}</p>
    </div>
  );
}
