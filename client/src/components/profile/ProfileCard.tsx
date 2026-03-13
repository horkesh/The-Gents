import { motion } from 'framer-motion';
import { Badge } from '../ui/Badge';
import { scaleReveal } from '@/lib/animations';
import type { ParticipantProfile } from '@the-toast/shared';

interface ProfileCardProps {
  profile: ParticipantProfile;
  onClose?: () => void;
}

const roleBadgeMap: Record<string, { label: string; variant: 'gold' | 'ember' | 'teal' | 'muted' }> = {
  keys: { label: 'HOST: ALCHEMIST', variant: 'gold' },
  bass: { label: 'HOST: ATMOSPHERE', variant: 'ember' },
  lorekeeper: { label: 'HOST: ARCHITECT', variant: 'teal' },
  guest: { label: 'GUEST', variant: 'muted' },
};

export function ProfileCard({ profile, onClose }: ProfileCardProps) {
  const roleBadge = roleBadgeMap[profile.role] || roleBadgeMap.guest;

  return (
    <motion.div
      {...scaleReveal}
      className="glass-strong rounded-2xl overflow-hidden max-w-xs w-full gradient-border shadow-[0_8px_40px_-8px_rgba(0,0,0,0.5)]"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Portrait */}
      <div className="relative aspect-[3/4] bg-charcoal">
        {profile.portraitUrl ? (
          <img
            src={profile.portraitUrl}
            alt={profile.alias || profile.name}
            className="w-full h-full object-cover"
          />
        ) : profile.photoUrl ? (
          <img
            src={profile.photoUrl}
            alt={profile.name}
            className="w-full h-full object-cover opacity-60"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl text-cream/20">
            {profile.name.charAt(0).toUpperCase()}
          </div>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-charcoal/20 to-transparent" />

        {/* Name overlay */}
        <div className="absolute bottom-4 left-4 right-4">
          <Badge variant={roleBadge.variant}>{roleBadge.label}</Badge>
          <h3 className="heading-display text-xl text-cream mt-2">
            {profile.alias || profile.name}
          </h3>
          {profile.alias && (
            <p className="text-cream/40 text-sm font-body">{profile.name}</p>
          )}
        </div>

        {!profile.connected && (
          <div className="absolute top-4 right-4">
            <Badge variant="muted">SIGNAL LOST</Badge>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="p-4 space-y-3">
        {/* Traits */}
        {profile.traits.some(Boolean) && (
          <div className="flex flex-wrap gap-2">
            {profile.traits.filter(Boolean).map((trait, i) => (
              <span
                key={i}
                className="text-[0.65rem] tracking-wide uppercase text-gold/60 bg-gold/8 px-2.5 py-1 rounded-md border border-gold/10"
              >
                {trait}
              </span>
            ))}
          </div>
        )}

        {/* Dossier */}
        {profile.dossier && (
          <p className="heading-display-italic text-sm text-cream/50">
            "{profile.dossier}"
          </p>
        )}
      </div>

      {/* Close button */}
      {onClose && (
        <button
          onClick={onClose}
          className="w-full py-3 text-cream/30 text-sm font-body hover:text-cream/50 transition-all duration-200 border-t border-cream/5"
        >
          Close
        </button>
      )}
    </motion.div>
  );
}
