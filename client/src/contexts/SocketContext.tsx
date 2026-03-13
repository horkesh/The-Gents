import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { io, type Socket } from 'socket.io-client';
import type { ClientToServerEvents, ServerToClientEvents } from '@the-toast/shared';

type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

interface SocketContextValue {
  socket: TypedSocket | null;
  connected: boolean;
}

const SocketContext = createContext<SocketContextValue>({
  socket: null,
  connected: false,
});

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<TypedSocket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const s = io('/party', {
      autoConnect: false,
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
    }) as TypedSocket;

    s.on('connect', () => {
      setConnected(true);

      // Rejoin room if we had one before disconnect
      const stored = sessionStorage.getItem('theToast_profile');
      const code = sessionStorage.getItem('theToast_roomCode');
      if (stored && code) {
        const profile = JSON.parse(stored);
        s.emit('JOIN_ROOM', { code, profile });
      }
    });

    s.on('disconnect', () => setConnected(false));

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocketContext() {
  return useContext(SocketContext);
}
