import { createContext, useContext, useCallback, useEffect, useState, useMemo, type ReactNode } from 'react';
import { useSocketContext } from './SocketContext';
import { STORAGE_KEYS } from '@/lib/storage';
import type { RoomState, ParticipantProfile } from '@the-toast/shared';

interface RoomContextValue {
  room: RoomState | null;
  participants: ParticipantProfile[];
  currentUser: ParticipantProfile | null;
  isGent: boolean;
  joinRoom: (code: string, profile: Pick<ParticipantProfile, 'id' | 'name' | 'role' | 'photoUrl'>) => void;
  leaveRoom: () => void;
  startParty: () => void;
}

const RoomContext = createContext<RoomContextValue>({
  room: null,
  participants: [],
  currentUser: null,
  isGent: false,
  joinRoom: () => {},
  leaveRoom: () => {},
  startParty: () => {},
});

function updateParticipantConnected(prev: RoomState | null, id: string, connected: boolean): RoomState | null {
  if (!prev) return prev;
  const participant = prev.participants.find((p) => p.id === id);
  if (!participant || participant.connected === connected) return prev;
  return {
    ...prev,
    participants: prev.participants.map((p) =>
      p.id === id ? { ...p, connected } : p
    ),
  };
}

export function RoomProvider({ children }: { children: ReactNode }) {
  const { socket } = useSocketContext();
  const [room, setRoom] = useState<RoomState | null>(null);
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    if (!socket) return;

    socket.on('ROOM_STATE_UPDATE', (state) => {
      setRoom(state);
    });

    socket.on('PARTICIPANT_JOINED', (profile) => {
      setRoom((prev) => {
        if (!prev) return prev;
        const exists = prev.participants.some((p) => p.id === profile.id);
        if (exists) return prev;
        return { ...prev, participants: [...prev.participants, profile] };
      });
    });

    socket.on('PARTICIPANT_LEFT', ({ id }) => {
      setRoom((prev) => updateParticipantConnected(prev, id, false));
    });

    socket.on('PARTICIPANT_RECONNECTED', ({ id }) => {
      setRoom((prev) => updateParticipantConnected(prev, id, true));
    });

    return () => {
      socket.off('ROOM_STATE_UPDATE');
      socket.off('PARTICIPANT_JOINED');
      socket.off('PARTICIPANT_LEFT');
      socket.off('PARTICIPANT_RECONNECTED');
    };
  }, [socket]);

  const joinRoom = useCallback(
    (code: string, profile: Pick<ParticipantProfile, 'id' | 'name' | 'role' | 'photoUrl'>) => {
      if (!socket) return;
      setUserId(profile.id);
      sessionStorage.setItem(STORAGE_KEYS.roomCode, code);
      socket.connect();
      socket.emit('JOIN_ROOM', { code, profile });
    },
    [socket]
  );

  const leaveRoom = useCallback(() => {
    if (!socket) return;
    socket.emit('LEAVE_ROOM');
    socket.disconnect();
    sessionStorage.removeItem(STORAGE_KEYS.roomCode);
    setUserId('');
    setRoom(null);
  }, [socket]);

  const startParty = useCallback(() => {
    if (!socket) return;
    socket.emit('START_PARTY');
  }, [socket]);

  const participants = useMemo(() => room?.participants || [], [room]);
  const currentUser = useMemo(() => participants.find((p) => p.id === userId) || null, [participants, userId]);
  const isGent = currentUser?.role !== 'guest' && currentUser?.role !== undefined;

  const value = useMemo(
    () => ({ room, participants, currentUser, isGent, joinRoom, leaveRoom, startParty }),
    [room, participants, currentUser, isGent, joinRoom, leaveRoom, startParty],
  );

  return (
    <RoomContext.Provider value={value}>
      {children}
    </RoomContext.Provider>
  );
}

export function useRoomContext() {
  return useContext(RoomContext);
}
