import { useVideoTrack, useAudioTrack } from '@daily-co/daily-react';
import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import type { ParticipantProfile } from '@the-toast/shared';

interface VideoTileProps {
  sessionId: string;
  profile: ParticipantProfile;
  isGent?: boolean;
  isActiveSpeaker?: boolean;
  onClick?: () => void;
  key?: React.Key;
}

export function VideoTile({
  sessionId,
  profile,
  isGent = false,
  isActiveSpeaker = false,
  onClick,
}: VideoTileProps) {
  const videoTrack = useVideoTrack(sessionId);
  const audioTrack = useAudioTrack(sessionId);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (videoTrack?.persistentTrack && videoRef.current) {
      videoRef.current.srcObject = new MediaStream([videoTrack.persistentTrack]);
    }
  }, [videoTrack?.persistentTrack]);

  useEffect(() => {
    if (audioTrack?.persistentTrack && audioRef.current) {
      audioRef.current.srcObject = new MediaStream([audioTrack.persistentTrack]);
    }
  }, [audioTrack?.persistentTrack]);

  const hasVideo = videoTrack?.state === 'playable';
  const size = isGent ? 'w-20 h-24' : 'w-16 h-20';
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
        className={`${size} rounded-${isGent ? 'xl' : 'lg'} overflow-hidden border-2 ${borderColor} bg-charcoal-light cursor-pointer relative`}
        onClick={onClick}
      >
        {hasVideo ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover mirror"
          />
        ) : (profile.portraitUrl || profile.photoUrl) ? (
          <img
            src={profile.portraitUrl || profile.photoUrl}
            alt={profile.alias || profile.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-cream/20 text-lg">
            {profile.name.charAt(0)}
          </div>
        )}
      </div>
      <p className={`text-${isGent ? '[0.5rem]' : '[0.45rem]'} text-${isGent ? 'gold/60' : 'cream/30'} tracking-wider uppercase text-center mt-1 truncate max-w-${isGent ? '20' : '16'}`}>
        {profile.alias || profile.name}
      </p>
      {/* Hidden audio element for remote participants */}
      <audio ref={audioRef} autoPlay playsInline />
    </motion.div>
  );
}
