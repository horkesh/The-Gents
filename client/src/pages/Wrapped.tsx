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
      <motion.div {...fadeIn} className="min-h-dvh flex flex-col items-center justify-center px-6 bg-charcoal">
        <img src="/logo/01_Gold_logo.png" alt="The Gents" className="w-20 h-20 mb-6" />
        <p className="heading-display-italic text-gold/50 text-lg">
          The evening wraps up...
        </p>
        <p className="label text-cream/20 mt-4">Session {code}</p>
      </motion.div>
    );
  }

  return (
    <motion.div {...fadeIn} className="min-h-dvh bg-charcoal px-6 py-8">
      <div className="max-w-sm mx-auto">
        {/* Header */}
        <motion.div className="text-center mb-8" {...slideUp}>
          <img src="/logo/01_Gold_logo.png" alt="The Gents" className="w-14 h-14 mx-auto mb-4" />
          <h1 className="heading-display text-xl text-gold mb-1">{data.sessionTitle}</h1>
          <p className="label text-cream/30">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </motion.div>

        {/* Portrait */}
        <motion.div className="flex flex-col items-center mb-8" {...scaleReveal}>
          <div className="w-36 h-36 rounded-full border-2 border-gold overflow-hidden mb-4 shadow-[0_0_20px_rgba(201,168,76,0.2)]">
            <img
              src={data.profile.portraitUrl || data.profile.photoUrl}
              alt={data.profile.alias}
              className="w-full h-full object-cover"
            />
          </div>
          <h2 className="heading-display text-2xl text-cream">{data.profile.alias}</h2>
          <p className="text-cream/30 text-sm font-body">{data.profile.name}</p>
          <div className="flex gap-2 mt-3">
            <Badge variant="gold">GUEST</Badge>
          </div>
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
          className="bg-charcoal-light rounded-xl border border-gold/10 p-6 mb-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <p className="label text-gold/40 mb-3">The Lorekeeper's Note</p>
          <p className="heading-display-italic text-cream/70 leading-relaxed">
            "{data.lorekeeperNote}"
          </p>
        </motion.div>

        {/* Photos */}
        {data.photos.length > 0 && (
          <motion.div
            className="mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0 }}
          >
            <p className="label text-cream/30 mb-3">Moments</p>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {data.photos.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt={`Moment ${i + 1}`}
                  className="w-24 h-24 rounded-lg object-cover flex-shrink-0 border border-cream/5"
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
        <p className="label text-cream/10 text-center mt-8">
          @the.gents.chronicles
        </p>
      </div>
    </motion.div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-charcoal-light rounded-lg border border-cream/5 p-3 text-center">
      <p className="heading-display text-2xl text-gold">{value}</p>
      <p className="label text-cream/20 mt-1" style={{ fontSize: '0.5rem' }}>{label}</p>
    </div>
  );
}
