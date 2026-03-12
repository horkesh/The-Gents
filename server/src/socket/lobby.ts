import type { Namespace, Socket } from 'socket.io';
import type { ClientToServerEvents, ServerToClientEvents } from '@the-toast/shared';
import { joinRoom, leaveRoom } from '../services/room.js';

type PartySocket = Socket<ClientToServerEvents, ServerToClientEvents>;
type PartyNamespace = Namespace<ClientToServerEvents, ServerToClientEvents>;

// Track which room each socket is in
const socketRooms = new Map<string, string>();

export function setupLobbyHandlers(namespace: PartyNamespace, socket: PartySocket) {
  socket.on('JOIN_ROOM', async ({ code, profile }) => {
    try {
      const room = await joinRoom(code, profile);
      if (!room) {
        socket.emit('ERROR', { message: 'Room not found' });
        return;
      }

      socketRooms.set(socket.id, code);
      socket.join(code);

      // Notify others
      socket.to(code).emit('PARTICIPANT_JOINED', {
        ...profile,
        alias: '',
        portraitUrl: '',
        traits: ['', '', ''],
        dossier: '',
        connected: true,
      });

      // Send full state to joiner
      socket.emit('ROOM_STATE_UPDATE', room);
    } catch (err) {
      console.error('[lobby] JOIN_ROOM error:', err);
      socket.emit('ERROR', { message: 'Failed to join room' });
    }
  });

  socket.on('LEAVE_ROOM', async () => {
    const code = socketRooms.get(socket.id);
    if (!code) return;

    socketRooms.delete(socket.id);
    socket.leave(code);
  });

  socket.on('disconnect', () => {
    const code = socketRooms.get(socket.id);
    if (code) {
      socketRooms.delete(socket.id);
    }
  });
}
