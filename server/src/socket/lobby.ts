import type { Namespace, Socket } from 'socket.io';
import type { ClientToServerEvents, ServerToClientEvents } from '@the-toast/shared';
import { joinRoom, leaveRoom } from '../services/room.js';
import { generateEntranceIntro } from '../services/gemini/social.js';
import { logger } from '../utils/logger.js';

type PartySocket = Socket<ClientToServerEvents, ServerToClientEvents>;
type PartyNamespace = Namespace<ClientToServerEvents, ServerToClientEvents>;

// Track which room each socket is in
const socketRooms = new Map<string, string>();

// Arrival counters per room (exported for party.ts to use)
export const arrivalCounters = new Map<string, number>();

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

      // Track arrival order
      const currentCount = arrivalCounters.get(code) || 0;
      const arrivalOrder = currentCount + 1;
      arrivalCounters.set(code, arrivalOrder);

      const fullProfile = {
        ...profile,
        alias: '',
        portraitUrl: '',
        traits: ['', '', ''] as [string, string, string],
        dossier: '',
        connected: true,
      };

      // Notify others
      socket.to(code).emit('PARTICIPANT_JOINED', fullProfile);

      // Send full state to joiner
      socket.emit('ROOM_STATE_UPDATE', room);

      // Generate entrance intro (fire-and-forget, non-blocking)
      generateEntranceIntro(fullProfile.alias || profile.name, [], arrivalOrder, room.act)
        .then((intro) => {
          namespace.to(code).emit('GUEST_ENTRANCE', {
            profile: fullProfile,
            intro,
            arrivalOrder,
          });
        })
        .catch((err) => logger.error('lobby', 'Failed to generate entrance intro', err));
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
