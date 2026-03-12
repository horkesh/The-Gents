import { createContext, useContext, useCallback, useEffect, useState, type ReactNode } from 'react';
import { useSocketContext } from './SocketContext';
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
      setRoom((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          participants: prev.participants.map((p) =>
            p.id === id ? { ...p, connected: false } : p
          ),
        };
      });
    });

    socket.on('PARTICIPANT_RECONNECTED', ({ id }) => {
      setRoom((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          participants: prev.participants.map((p) =>
            p.id === id ? { ...p, connected: true } : p
          ),
        };
      });
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
      socket.connect();
      socket.emit('JOIN_ROOM', { code, profile });
    },
    [socket]
  );

  const leaveRoom = useCallback(() => {
    if (!socket) return;
    socket.emit('LEAVE_ROOM');
    socket.disconnect();
    setRoom(null);
  }, [socket]);

  const startParty = useCallback(() => {
    if (!socket) return;
    socket.emit('START_PARTY');
  }, [socket]);

  const participants = room?.participants || [];
  const currentUser = participants.find((p) => p.id === userId) || null;
  const isGent = currentUser?.role !== 'guest' && currentUser?.role !== undefined;

  return (
    <RoomContext.Provider
      value={{ room, participants, currentUser, isGent, joinRoom, leaveRoom, startParty }}
    >
      {children}
    </RoomContext.Provider>
  );
}

export function useRoomContext() {
  return useContext(RoomContext);
}
