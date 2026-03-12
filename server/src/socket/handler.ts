import type { Namespace, Socket } from 'socket.io';
import type { ClientToServerEvents, ServerToClientEvents } from '@the-toast/shared';
import { setupLobbyHandlers } from './lobby.js';
import { setupPartyHandlers } from './party.js';
import { setupReactionHandlers } from './reactions.js';

type PartySocket = Socket<ClientToServerEvents, ServerToClientEvents>;
type PartyNamespace = Namespace<ClientToServerEvents, ServerToClientEvents>;

export function setupSocketHandler(namespace: PartyNamespace) {
  namespace.on('connection', (socket: PartySocket) => {
    console.log(`[socket] Connected: ${socket.id}`);

    setupLobbyHandlers(namespace, socket);
    setupPartyHandlers(namespace, socket);
    setupReactionHandlers(namespace, socket);

    socket.on('disconnect', () => {
      console.log(`[socket] Disconnected: ${socket.id}`);
    });
  });
}
