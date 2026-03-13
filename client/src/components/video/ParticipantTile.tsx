import { motion } from 'framer-motion';
import type { ParticipantProfile } from '@the-toast/shared';
import type { ReactNode } from 'react';

interface ParticipantTileProps {
  profile: ParticipantProfile;
  isGent?: boolean;
  isActiveSpeaker?: boolean;
  onClick?: () => void;
  videoSlot?: ReactNode;
}

/**
 * Renders a participant tile with portrait/initial fallback.
 * Optionally accepts a videoSlot to overlay live video when available.
 * Works without any Daily.co dependency.
 */
export function ParticipantTile({
  profile,
  isGent = false,
  isActiveSpeaker = false,
  onClick,
  videoSlot,
}: ParticipantTileProps) {
  const borderColor = isActiveSpeaker
    ? 'border-gold ring-2 ring-gold/40'
    : isGent
      ? 'border-gold/40'
      : profile.connected
        ? 'border-cream/10'
        : 'border-cream/5 opacity-40 grayscale';

  return (
    <motion.div whileTap={{ scale: 0.95 }}>
      <div
        className={`${isGent ? 'w-20 h-24 rounded-xl' : 'w-16 h-20 rounded-lg'} overflow-hidden border-2 ${borderColor} bg-charcoal-light cursor-pointer relative`}
        onClick={onClick}
      >
        {videoSlot || (
          (profile.portraitUrl || profile.photoUrl) ? (
            <img
              src={profile.portraitUrl || profile.photoUrl}
              alt={profile.alias || profile.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-cream/20 text-lg">
              {profile.name.charAt(0)}
            </div>
          )
        )}
      </div>
      <p className={isGent
        ? 'text-[0.5rem] text-gold/60 tracking-wider uppercase text-center mt-1 truncate max-w-20'
        : 'text-[0.45rem] text-cream/30 tracking-wider uppercase text-center mt-1 truncate max-w-16'
      }>
        {profile.alias || profile.name}
      </p>
    </motion.div>
  );
}
