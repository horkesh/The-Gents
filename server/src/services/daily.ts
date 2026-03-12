import { config } from '../config.js';
import { logger } from '../utils/logger.js';

const DAILY_API_BASE = 'https://api.daily.co/v1';

let warnedUnconfigured = false;

function isConfigured(): boolean {
  return !!config.daily.apiKey;
}

/**
 * Creates a Daily.co room for a party.
 * Returns the room URL or empty string if Daily.co is not configured.
 */
export async function createDailyRoom(roomCode: string): Promise<string> {
  if (!isConfigured()) {
    if (!warnedUnconfigured) {
      logger.warn('daily', 'Daily.co not configured — video rooms will be skipped');
      warnedUnconfigured = true;
    }
    return '';
  }

  try {
    const res = await fetch(`${DAILY_API_BASE}/rooms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.daily.apiKey}`,
      },
      body: JSON.stringify({
        name: `toast-${roomCode.toLowerCase()}`,
        properties: {
          max_participants: 12,
          enable_chat: false,
          enable_screenshare: false,
          exp: Math.floor(Date.now() / 1000) + 3 * 60 * 60, // 3 hours
        },
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Daily.co API ${res.status}: ${body}`);
    }

    const data = await res.json();
    logger.info('daily', `Created room: ${data.url}`);
    return data.url;
  } catch (err) {
    logger.error('daily', 'Failed to create room', err);
    return '';
  }
}

/**
 * Generates a meeting token for a participant.
 * Returns token string or empty string if Daily.co is not configured.
 */
export async function getDailyRoomToken(
  roomName: string,
  participantId: string
): Promise<string> {
  if (!isConfigured()) {
    return '';
  }

  try {
    const res = await fetch(`${DAILY_API_BASE}/meeting-tokens`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.daily.apiKey}`,
      },
      body: JSON.stringify({
        properties: {
          room_name: roomName,
          user_id: participantId,
          exp: Math.floor(Date.now() / 1000) + 3 * 60 * 60,
        },
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Daily.co token API ${res.status}: ${body}`);
    }

    const data = await res.json();
    return data.token;
  } catch (err) {
    logger.error('daily', 'Failed to generate meeting token', err);
    return '';
  }
}
