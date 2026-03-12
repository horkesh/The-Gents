import type { RoomState, ParticipantProfile, GentRole } from '@the-toast/shared';
import { generateRoomCode } from '../utils/codes.js';
import { logger } from '../utils/logger.js';

// In-memory room store (will be backed by Redis in Phase 2 expansion)
const rooms = new Map<string, RoomState>();

export async function createRoom(hostId: string, hostRole: GentRole): Promise<{ code: string; room: RoomState }> {
  let code = generateRoomCode();

  // Ensure uniqueness
  let attempts = 0;
  while (rooms.has(code) && attempts < 50) {
    code = generateRoomCode();
    attempts++;
  }

  const room: RoomState = {
    code,
    participants: [],
    act: 0, // lobby
    scene: null,
    vibe: { energy: 'slow_burn', mood: 'anticipation' },
    events: [],
    dailyRoomUrl: '', // Will be set when Daily.co is integrated
    startedAt: null,
    actStartedAt: null,
  };

  rooms.set(code, room);
  logger.info('room', `Created room ${code} by ${hostRole} (${hostId})`);

  return { code, room };
}

export async function getRoom(code: string): Promise<RoomState | null> {
  return rooms.get(code.toUpperCase()) || null;
}

export async function joinRoom(
  code: string,
  profile: Pick<ParticipantProfile, 'id' | 'name' | 'role' | 'photoUrl'>
): Promise<RoomState | null> {
  const room = rooms.get(code.toUpperCase());
  if (!room) return null;

  // Check if participant already exists (reconnection)
  const existing = room.participants.find((p) => p.id === profile.id);
  if (existing) {
    existing.connected = true;
    logger.info('room', `${profile.name} reconnected to ${code}`);
    return room;
  }

  const participant: ParticipantProfile = {
    id: profile.id,
    name: profile.name,
    role: profile.role,
    photoUrl: profile.photoUrl,
    alias: '',
    portraitUrl: '',
    traits: ['', '', ''],
    dossier: '',
    connected: true,
  };

  room.participants.push(participant);
  logger.info('room', `${profile.name} joined room ${code} (${room.participants.length} participants)`);

  return room;
}

export async function leaveRoom(code: string, participantId: string): Promise<void> {
  const room = rooms.get(code.toUpperCase());
  if (!room) return;

  const participant = room.participants.find((p) => p.id === participantId);
  if (participant) {
    participant.connected = false;
    logger.info('room', `${participant.name} disconnected from ${code}`);
  }
}

export async function updateParticipantProfile(
  code: string,
  participantId: string,
  updates: Partial<ParticipantProfile>
): Promise<void> {
  const room = rooms.get(code.toUpperCase());
  if (!room) return;

  const participant = room.participants.find((p) => p.id === participantId);
  if (participant) {
    Object.assign(participant, updates);
  }
}

export async function updateRoomState(code: string, updates: Partial<RoomState>): Promise<void> {
  const room = rooms.get(code.toUpperCase());
  if (!room) return;

  Object.assign(room, updates);
}

export async function destroyRoom(code: string): Promise<void> {
  rooms.delete(code.toUpperCase());
  logger.info('room', `Destroyed room ${code}`);
}
