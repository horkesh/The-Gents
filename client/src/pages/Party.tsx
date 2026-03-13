import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { DailyProvider } from '@daily-co/daily-react';
import DailyIframe, { type DailyCall } from '@daily-co/daily-js';
import { useRoomContext } from '@/contexts/RoomContext';
import { usePartyContext } from '@/contexts/PartyContext';
import { useSocketContext } from '@/contexts/SocketContext';
import { SceneBackdrop } from '@/components/party/SceneBackdrop';
import { ActTransition } from '@/components/party/ActTransition';
import { ActTimer } from '@/components/party/ActTimer';
import { ReactionBar } from '@/components/mechanics/ReactionBar';
import { FloatingReactions } from '@/components/mechanics/FloatingReaction';
import { DrinkRound } from '@/components/mechanics/DrinkRound';
import { ConfessionRound } from '@/components/mechanics/ConfessionRound';
import { GroupSnap } from '@/components/mechanics/GroupSnap';
import { VibeShiftOverlay } from '@/components/mechanics/VibeShift';
import { Spotlight } from '@/components/mechanics/Spotlight';
import { GuestBook } from '@/components/mechanics/GuestBook';
import { TheToast } from '@/components/mechanics/TheToast';
import { GuestEntrance } from '@/components/party/GuestEntrance';
import { GentControlPanel } from '@/components/layout/GentControlPanel';
import { VideoGrid } from '@/components/video/VideoGrid';
import { VideoControls } from '@/components/video/VideoControls';
import { ParticipantTile } from '@/components/video/ParticipantTile';
import { ProfileCard } from '@/components/profile/ProfileCard';
import { fadeIn } from '@/lib/animations';
import { getStoredProfile } from '@/lib/storage';
import type { ParticipantProfile } from '@the-toast/shared';

export function Party() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { socket } = useSocketContext();
  const { room, participants, joinRoom } = useRoomContext();
  const { isWrapped } = usePartyContext();
  const [selectedProfile, setSelectedProfile] = useState<ParticipantProfile | null>(null);

  const dailyRoomUrl = room?.dailyRoomUrl || '';
  const [callObject, setCallObject] = useState<DailyCall | null>(null);

  useEffect(() => {
    if (!dailyRoomUrl) return;
    const co = DailyIframe.createCallObject({ url: dailyRoomUrl });
    setCallObject(co);
    return () => {
      co.destroy();
    };
  }, [dailyRoomUrl]);

  useEffect(() => {
    if (!code) return;
    const profile = getStoredProfile();
    if (profile) {
      joinRoom(code, profile);
    }
  }, [code, joinRoom]);

  // Join Daily.co call (leave/destroy handled by callObject creation effect)
  useEffect(() => {
    if (!callObject || !dailyRoomUrl) return;
    callObject.join({ url: dailyRoomUrl });
  }, [callObject, dailyRoomUrl]);

  useEffect(() => {
    if (isWrapped) navigate(`/wrapped/${code}`);
  }, [isWrapped, code, navigate]);

  useEffect(() => {
    if (!socket) return;
    socket.on('WRAPPED_READY', () => navigate(`/wrapped/${code}`));
    return () => { socket.off('WRAPPED_READY'); };
  }, [socket, code, navigate]);

  const gents = participants.filter((p) => p.role !== 'guest');
  const guests = participants.filter((p) => p.role === 'guest');

  const partyContent = (
    <motion.div {...fadeIn} className="min-h-dvh relative">
      <SceneBackdrop />
      <VibeShiftOverlay />

      <div className="relative z-20 min-h-dvh flex flex-col">
        <div className="px-4 pt-4 safe-top">
          <ActTimer />
        </div>

        {callObject ? (
          <VideoGrid
            gents={gents}
            guests={guests}
            onSelectProfile={setSelectedProfile}
          />
        ) : (
          <div className="flex-1 flex flex-col justify-center px-4 py-4">
            <div className="flex justify-center gap-3.5 mb-5">
              {gents.map((gent) => (
                <ParticipantTile
                  key={gent.id}
                  profile={gent}
                  isGent
                  onClick={() => setSelectedProfile(gent)}
                />
              ))}
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              {guests.map((guest) => (
                <ParticipantTile
                  key={guest.id}
                  profile={guest}
                  onClick={() => setSelectedProfile(guest)}
                />
              ))}
            </div>
          </div>
        )}

        <div className="px-4 pb-4 safe-bottom flex flex-col gap-3">
          {callObject && <VideoControls />}
          <ReactionBar />
        </div>
      </div>

      <FloatingReactions />
      <DrinkRound />
      <ConfessionRound />
      <GroupSnap />
      <Spotlight />
      <GuestBook />
      <TheToast />
      <GuestEntrance />
      <ActTransition />
      <GentControlPanel />

      <AnimatePresence>
        {selectedProfile && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/80 backdrop-blur-md px-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedProfile(null)}>
            <ProfileCard profile={selectedProfile} onClose={() => setSelectedProfile(null)} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  // Wrap with DailyProvider when video is available
  if (callObject) {
    return <DailyProvider callObject={callObject}>{partyContent}</DailyProvider>;
  }
  return partyContent;
}
