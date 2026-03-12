import { motion } from 'framer-motion';
import type { ParticipantProfile } from '@the-toast/shared';

interface ProfileAvatarProps {
  profile: ParticipantProfile;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  showName?: boolean;
  glow?: boolean;
}

const sizes = {
  sm: 'w-10 h-10 text-sm',
  md: 'w-14 h-14 text-lg',
  lg: 'w-20 h-20 text-2xl',
};

const borderColors: Record<string, string> = {
  keys: 'border-gold',
  bass: 'border-ember',
  lorekeeper: 'border-teal',
  guest: 'border-cream/20',
};

export function ProfileAvatar({
  profile,
  size = 'md',
  onClick,
  showName = true,
  glow = false,
}: ProfileAvatarProps) {
  const borderColor = borderColors[profile.role] || borderColors.guest;
  const imageUrl = profile.portraitUrl || profile.photoUrl;

  return (
    <motion.button
      onClick={onClick}
      className="flex flex-col items-center gap-1"
      whileTap={{ scale: 0.95 }}
    >
      <div
        className={`
          rounded-full border-2 overflow-hidden ${sizes[size]} ${borderColor}
          ${glow ? 'shadow-[0_0_12px_rgba(201,168,76,0.4)]' : ''}
          ${!profile.connected ? 'opacity-40 grayscale' : ''}
        `}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={profile.alias || profile.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-charcoal-lighter flex items-center justify-center text-cream/30">
            {profile.name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      {showName && (
        <span className="text-[0.6rem] tracking-wide uppercase text-cream/40 max-w-16 truncate">
          {profile.alias || profile.name}
        </span>
      )}
    </motion.button>
  );
}
