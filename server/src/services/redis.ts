import { Redis } from '@upstash/redis';
import { config } from '../config.js';
import { logger } from '../utils/logger.js';
import type { RoomState } from '@the-toast/shared';

const ROOM_TTL_SECONDS = 2 * 60 * 60; // 2 hours
const KEY_PREFIX = 'toast:room:';

let client: Redis | null = null;

function getClient(): Redis | null {
  if (client) return client;
  if (!config.redis.url || !config.redis.token) {
    return null;
  }
  client = new Redis({
    url: config.redis.url,
    token: config.redis.token,
  });
  logger.info('redis', 'Client initialized');
  return client;
}

/**
 * Returns true if Redis is configured and available.
 */
export function isConfigured(): boolean {
  return !!getClient();
}

/**
 * Gets a room from Redis. Returns null if not found or Redis unavailable.
 */
export async function getRoom(code: string): Promise<RoomState | null> {
  const redis = getClient();
  if (!redis) return null;

  try {
    const data = await redis.get<RoomState>(`${KEY_PREFIX}${code.toUpperCase()}`);
    return data;
  } catch (err) {
    logger.error('redis', `Failed to get room ${code}`, err);
    return null;
  }
}

/**
 * Saves a room to Redis with TTL.
 */
export async function setRoom(code: string, room: RoomState): Promise<void> {
  const redis = getClient();
  if (!redis) return;

  try {
    await redis.set(`${KEY_PREFIX}${code.toUpperCase()}`, room, {
      ex: ROOM_TTL_SECONDS,
    });
  } catch (err) {
    logger.error('redis', `Failed to set room ${code}`, err);
  }
}

/**
 * Deletes a room from Redis.
 */
export async function deleteRoom(code: string): Promise<void> {
  const redis = getClient();
  if (!redis) return;

  try {
    await redis.del(`${KEY_PREFIX}${code.toUpperCase()}`);
    logger.info('redis', `Deleted room ${code}`);
  } catch (err) {
    logger.error('redis', `Failed to delete room ${code}`, err);
  }
}

/**
 * Refreshes TTL on a room (call on activity).
 */
export async function touchRoom(code: string): Promise<void> {
  const redis = getClient();
  if (!redis) return;

  try {
    await redis.expire(`${KEY_PREFIX}${code.toUpperCase()}`, ROOM_TTL_SECONDS);
  } catch (err) {
    logger.error('redis', `Failed to touch room ${code}`, err);
  }
}
