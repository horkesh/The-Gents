import type { Namespace, Socket } from 'socket.io';
import type { ClientToServerEvents, ServerToClientEvents } from '@the-toast/shared';
import { getRoom } from '../services/room.js';

type PartySocket = Socket<ClientToServerEvents, ServerToClientEvents>;
type PartyNamespace = Namespace<ClientToServerEvents, ServerToClientEvents>;

export function setupReactionHandlers(namespace: PartyNamespace, socket: PartySocket) {
  socket.on('SEND_REACTION', async ({ emoji }) => {
    for (const roomCode of socket.rooms) {
      if (roomCode !== socket.id) {
        const room = await getRoom(roomCode);
        const participant = room?.participants.find((p) => p.id === socket.id);
        const senderName = participant?.alias || participant?.name || '';

        namespace.to(roomCode).emit('REACTION', {
          emoji,
          senderName,
          senderId: socket.id,
        });
      }
    }
  });
}
