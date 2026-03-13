import type { ParticipantProfile } from '@the-toast/shared';

export const STORAGE_KEYS = {
  profile: 'theToast_profile',
  roomCode: 'theToast_roomCode',
} as const;

export function getStoredProfile(): Pick<ParticipantProfile, 'id' | 'name' | 'role' | 'photoUrl'> | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEYS.profile);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.id || !parsed?.name) return null;
    return parsed;
  } catch {
    sessionStorage.removeItem(STORAGE_KEYS.profile);
    return null;
  }
}
