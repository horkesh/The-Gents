import { useParticipantIds, useActiveSpeakerId } from '@daily-co/daily-react';
import { VideoTile } from './VideoTile';
import type { ParticipantProfile } from '@the-toast/shared';

interface VideoGridProps {
  gents: ParticipantProfile[];
  guests: ParticipantProfile[];
  onSelectProfile: (profile: ParticipantProfile) => void;
}

export function VideoGrid({ gents, guests, onSelectProfile }: VideoGridProps) {
  const dailyParticipantIds = useParticipantIds();
  const activeSpeakerId = useActiveSpeakerId();

  // Map our participant IDs to Daily session IDs
  // For now, use participant.id as the Daily session ID mapping
  function getDailySessionId(profile: ParticipantProfile): string {
    return dailyParticipantIds.find((id) => id === profile.id) || profile.id;
  }

  return (
    <div className="flex-1 flex flex-col justify-center px-4 py-4">
      {/* Gents row */}
      <div className="flex justify-center gap-3 mb-4">
        {gents.map((gent) => (
          <VideoTile
            key={gent.id}
            sessionId={getDailySessionId(gent)}
            profile={gent}
            isGent
            isActiveSpeaker={activeSpeakerId === getDailySessionId(gent)}
            onClick={() => onSelectProfile(gent)}
          />
        ))}
      </div>

      {/* Guest grid */}
      <div className="flex flex-wrap justify-center gap-3">
        {guests.map((guest) => (
          <VideoTile
            key={guest.id}
            sessionId={getDailySessionId(guest)}
            profile={guest}
            isActiveSpeaker={activeSpeakerId === getDailySessionId(guest)}
            onClick={() => onSelectProfile(guest)}
          />
        ))}
      </div>
    </div>
  );
}
