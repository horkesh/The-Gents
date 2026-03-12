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
    }) as TypedSocket;

    s.on('connect', () => setConnected(true));
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
