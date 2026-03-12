import type { Namespace, Socket } from 'socket.io';
import type { ClientToServerEvents, ServerToClientEvents } from '@the-toast/shared';

type PartySocket = Socket<ClientToServerEvents, ServerToClientEvents>;
type PartyNamespace = Namespace<ClientToServerEvents, ServerToClientEvents>;

export function setupReactionHandlers(namespace: PartyNamespace, socket: PartySocket) {
  socket.on('SEND_REACTION', ({ emoji }) => {
    // Broadcast to all rooms this socket is in
    for (const room of socket.rooms) {
      if (room !== socket.id) {
        namespace.to(room).emit('REACTION', {
          emoji,
          senderName: '', // Will be resolved from room state
          senderId: socket.id,
        });
      }
    }
  });
}
