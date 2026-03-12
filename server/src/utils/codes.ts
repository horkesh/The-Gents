import { ROOM_CODE_WORDS } from '@the-toast/shared';

export function generateRoomCode(): string {
  const index = Math.floor(Math.random() * ROOM_CODE_WORDS.length);
  return ROOM_CODE_WORDS[index];
}
