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
    const el = videoRef.current;
    if (videoTrack?.persistentTrack && el) {
      el.srcObject = new MediaStream([videoTrack.persistentTrack]);
    }
    return () => { if (el) el.srcObject = null; };
  }, [videoTrack?.persistentTrack]);

  useEffect(() => {
    const el = audioRef.current;
    if (audioTrack?.persistentTrack && el) {
      el.srcObject = new MediaStream([audioTrack.persistentTrack]);
    }
    return () => { if (el) el.srcObject = null; };
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
