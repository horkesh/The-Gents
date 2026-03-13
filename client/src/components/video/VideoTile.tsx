import { useVideoTrack, useAudioTrack } from '@daily-co/daily-react';
import { useEffect, useRef } from 'react';
import { ParticipantTile } from './ParticipantTile';
import type { ParticipantProfile } from '@the-toast/shared';

interface VideoTileProps {
  sessionId: string;
  profile: ParticipantProfile;
  isGent?: boolean;
  isActiveSpeaker?: boolean;
  onClick?: () => void;
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

  const videoSlot = hasVideo ? (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted
      className="w-full h-full object-cover mirror"
    />
  ) : undefined;

  return (
    <>
      <ParticipantTile
        profile={profile}
        isGent={isGent}
        isActiveSpeaker={isActiveSpeaker}
        onClick={onClick}
        videoSlot={videoSlot}
      />
      <audio ref={audioRef} autoPlay playsInline className="hidden" />
    </>
  );
}
