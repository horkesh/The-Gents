import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { DailyProvider } from '@daily-co/daily-react';
import DailyIframe from '@daily-co/daily-js';
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
import { GentControlPanel } from '@/components/layout/GentControlPanel';
import { VideoGrid } from '@/components/video/VideoGrid';
import { VideoControls } from '@/components/video/VideoControls';
import { ProfileCard } from '@/components/profile/ProfileCard';
import { fadeIn } from '@/lib/animations';
import type { ParticipantProfile } from '@the-toast/shared';

export function Party() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { socket } = useSocketContext();
  const { room, participants, joinRoom } = useRoomContext();
  const { isWrapped } = usePartyContext();
  const [selectedProfile, setSelectedProfile] = useState<ParticipantProfile | null>(null);

  const dailyRoomUrl = room?.dailyRoomUrl || '';
  const callObject = useMemo(() => {
    if (!dailyRoomUrl) return null;
    return DailyIframe.createCallObject({ url: dailyRoomUrl });
  }, [dailyRoomUrl]);

  useEffect(() => {
    if (!code) return;
    const stored = sessionStorage.getItem('theToast_profile');
    if (stored) {
      const profile = JSON.parse(stored);
      joinRoom(code, profile);
    }
  }, [code, joinRoom]);

  // Join/leave Daily.co call
  useEffect(() => {
    if (!callObject || !dailyRoomUrl) return;
    callObject.join({ url: dailyRoomUrl });
    return () => { callObject.leave(); };
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
            {/* Static avatar fallback when no video */}
            <div className="flex justify-center gap-3 mb-4">
              {gents.map((gent) => (
                <motion.div key={gent.id} whileTap={{ scale: 0.95 }}>
                  <div
                    className="w-20 h-24 rounded-xl overflow-hidden border-2 border-gold/40 bg-charcoal-light cursor-pointer"
                    onClick={() => setSelectedProfile(gent)}
                  >
                    {(gent.portraitUrl || gent.photoUrl) ? (
                      <img src={gent.portraitUrl || gent.photoUrl} alt={gent.alias || gent.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-cream/20 text-lg">{gent.name.charAt(0)}</div>
                    )}
                  </div>
                  <p className="text-[0.5rem] text-gold/60 tracking-wider uppercase text-center mt-1 truncate max-w-20">
                    {gent.alias || gent.name}
                  </p>
                </motion.div>
              ))}
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              {guests.map((guest) => (
                <motion.div key={guest.id} whileTap={{ scale: 0.95 }}>
                  <div
                    className={`w-16 h-20 rounded-lg overflow-hidden border bg-charcoal-light cursor-pointer ${guest.connected ? 'border-cream/10' : 'border-cream/5 opacity-40 grayscale'}`}
                    onClick={() => setSelectedProfile(guest)}
                  >
                    {(guest.portraitUrl || guest.photoUrl) ? (
                      <img src={guest.portraitUrl || guest.photoUrl} alt={guest.alias || guest.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-cream/20">{guest.name.charAt(0)}</div>
                    )}
                  </div>
                  <p className="text-[0.45rem] text-cream/30 tracking-wider uppercase text-center mt-1 truncate max-w-16">
                    {guest.alias || guest.name}
                  </p>
                </motion.div>
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
      <ActTransition />
      <GentControlPanel />

      <AnimatePresence>
        {selectedProfile && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/70 backdrop-blur-sm px-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedProfile(null)}>
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
