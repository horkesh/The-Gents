import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useRoomContext } from '@/contexts/RoomContext';
import { useSocketContext } from '@/contexts/SocketContext';
import { ProfileAvatar } from '@/components/profile/ProfileAvatar';
import { ProfileCard } from '@/components/profile/ProfileCard';
import { Button } from '@/components/ui/Button';
import { fadeIn, staggerContainer, staggerItem } from '@/lib/animations';
import { getStoredProfile } from '@/lib/storage';
import type { ParticipantProfile } from '@the-toast/shared';

export function Lobby() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { socket } = useSocketContext();
  const { participants, isGent, joinRoom, startParty } = useRoomContext();
  const [selectedProfile, setSelectedProfile] = useState<ParticipantProfile | null>(null);
  const [copied, setCopied] = useState(false);

  const shareUrl = `${window.location.origin}/setup/${code}`;

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: select a hidden input
    }
  }, [shareUrl]);

  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'The Toast — You\'re Invited',
          text: `Join our cocktail party! Code: ${code}`,
          url: shareUrl,
        });
      } catch {
        // User cancelled share
      }
    } else {
      handleCopy();
    }
  }, [shareUrl, code, handleCopy]);

  // Join room on mount
  useEffect(() => {
    if (!code) return;
    const profile = getStoredProfile();
    if (profile) {
      joinRoom(code, profile);
    }
  }, [code, joinRoom]);

  // Listen for party start
  useEffect(() => {
    if (!socket) return;
    socket.on('PARTY_STARTED', () => {
      navigate(`/party/${code}`);
    });
    return () => {
      socket.off('PARTY_STARTED');
    };
  }, [socket, code, navigate]);

  const gents = participants.filter((p) => p.role !== 'guest');
  const guests = participants.filter((p) => p.role === 'guest');

  return (
    <motion.div {...fadeIn} className="min-h-dvh flex flex-col items-center px-6 py-8">
      <div className="max-w-md w-full flex flex-col items-center flex-1">
        <img src="/logo/01_Gold_logo.png" alt="The Gents" className="w-20 h-20 mb-4" />
        <p className="label text-cream/30 mb-2">Waiting Room</p>
        <h1 className="heading-display text-2xl text-cream mb-6">The Toast</h1>

        <div className="bg-charcoal-light rounded-xl p-5 mb-4 border border-gold/10 text-center w-full">
          <p className="label text-cream/30 mb-1">Share This Code</p>
          <p className="heading-display text-3xl text-gold tracking-[0.25em]">{code}</p>
        </div>

        <div className="flex gap-3 mb-8 w-full">
          <button
            onClick={handleCopy}
            className="flex-1 py-3 border border-gold/20 text-gold/70 font-body text-sm font-bold rounded-lg
                       hover:bg-gold/10 active:bg-gold/5 transition-colors"
          >
            {copied ? 'COPIED!' : 'COPY LINK'}
          </button>
          <button
            onClick={handleShare}
            className="flex-1 py-3 bg-teal text-cream font-body text-sm font-bold rounded-lg
                       hover:bg-teal-light active:bg-teal-dark transition-colors"
          >
            SHARE INVITE
          </button>
        </div>

        <div className="w-full flex-1">
          {gents.length > 0 && (
            <div className="mb-6">
              <p className="label text-gold/40 mb-3">Hosts</p>
              <motion.div className="flex flex-wrap gap-4 justify-center" variants={staggerContainer} initial="initial" animate="animate">
                {gents.map((g) => (
                  <motion.div key={g.id} variants={staggerItem}>
                    <ProfileAvatar profile={g} size="lg" glow onClick={() => setSelectedProfile(g)} />
                  </motion.div>
                ))}
              </motion.div>
            </div>
          )}

          <div>
            <p className="label text-cream/30 mb-3">Guests ({guests.length})</p>
            <motion.div className="flex flex-wrap gap-4 justify-center" variants={staggerContainer} initial="initial" animate="animate">
              <AnimatePresence>
                {guests.map((g) => (
                  <motion.div key={g.id} variants={staggerItem} initial="initial" animate="animate" exit={{ opacity: 0, scale: 0.8 }} layout>
                    <ProfileAvatar profile={g} size="md" onClick={() => setSelectedProfile(g)} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
            {guests.length === 0 && (
              <p className="text-cream/20 text-sm font-body text-center py-8">Waiting for guests to join...</p>
            )}
          </div>
        </div>

        {isGent && participants.length >= 2 && (
          <motion.div className="w-full mt-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Button variant="primary" size="lg" onClick={startParty} className="w-full">START THE EVENING</Button>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {selectedProfile && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/70 backdrop-blur-sm px-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedProfile(null)}>
            <ProfileCard profile={selectedProfile} onClose={() => setSelectedProfile(null)} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
