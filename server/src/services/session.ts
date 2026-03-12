import { ACTS, ACT_ORDER } from '@the-toast/shared';
import type { ActNumber, RoomState } from '@the-toast/shared';
import { getRoom, updateRoomState } from './room.js';
import { generateScene } from './gemini/scenes.js';
import { logger } from '../utils/logger.js';

// Active session timers
const sessionTimers = new Map<string, NodeJS.Timeout>();

/**
 * Starts the party — generates Act I scene and starts the timer.
 */
export async function startParty(code: string): Promise<RoomState | null> {
  const room = await getRoom(code);
  if (!room) return null;

  // Generate the opening scene
  const scene = await generateScene(1, room.vibe, null, null);

  const now = Date.now();
  await updateRoomState(code, {
    act: 1 as ActNumber,
    scene: {
      description: scene.description,
      backdropUrl: scene.backdropBase64 ? `data:image/png;base64,${scene.backdropBase64}` : '',
      location: scene.location,
    },
    startedAt: now,
    actStartedAt: now,
  });

  // Start act timer
  startActTimer(code, 1 as ActNumber);

  logger.info('session', `Party started in room ${code}`);
  return await getRoom(code);
}

/**
 * Starts a timer for the current act.
 */
function startActTimer(code: string, act: ActNumber) {
  // Clear existing timer
  const existing = sessionTimers.get(code);
  if (existing) clearTimeout(existing);

  const actDef = ACTS[act as keyof typeof ACTS];
  if (!actDef) return;

  const durationMs = actDef.durationMinutes * 60 * 1000;

  const timer = setTimeout(async () => {
    await advanceAct(code);
  }, durationMs);

  sessionTimers.set(code, timer);
  logger.info('session', `Act ${act} timer started for ${actDef.durationMinutes} minutes in room ${code}`);
}

/**
 * Advances to the next act (or to Wrapped).
 * Returns the transition data needed for the client.
 */
export async function advanceAct(code: string): Promise<{
  act: ActNumber;
  scene: { description: string; backdropUrl: string; location: string };
  narration: string;
} | null> {
  const room = await getRoom(code);
  if (!room) return null;

  const currentIndex = ACT_ORDER.indexOf(room.act as (typeof ACT_ORDER)[number]);
  const nextIndex = currentIndex + 1;

  if (nextIndex >= ACT_ORDER.length) {
    // Move to Wrapped
    await updateRoomState(code, { act: 5 as ActNumber });
    clearTimer(code);
    logger.info('session', `Room ${code} moved to Wrapped`);
    return {
      act: 5 as ActNumber,
      scene: room.scene || { description: '', backdropUrl: '', location: '' },
      narration: 'The evening draws to a close.',
    };
  }

  const nextAct = ACT_ORDER[nextIndex] as ActNumber;
  const scene = await generateScene(
    nextAct,
    room.vibe,
    room.scene?.location || null,
    room.scene?.description || null
  );

  const now = Date.now();
  await updateRoomState(code, {
    act: nextAct,
    scene: {
      description: scene.description,
      backdropUrl: scene.backdropBase64 ? `data:image/png;base64,${scene.backdropBase64}` : '',
      location: scene.location,
    },
    actStartedAt: now,
  });

  startActTimer(code, nextAct);
  logger.info('session', `Room ${code} advanced to Act ${nextAct}`);

  return {
    act: nextAct,
    scene: {
      description: scene.description,
      backdropUrl: scene.backdropBase64 ? `data:image/png;base64,${scene.backdropBase64}` : '',
      location: scene.location,
    },
    narration: scene.description,
  };
}

/**
 * Immediately ends the party and moves to Wrapped.
 */
export async function wrapUp(code: string): Promise<void> {
  clearTimer(code);
  await updateRoomState(code, { act: 5 as ActNumber });
  logger.info('session', `Room ${code} wrapped up`);
}

function clearTimer(code: string) {
  const timer = sessionTimers.get(code);
  if (timer) {
    clearTimeout(timer);
    sessionTimers.delete(code);
  }
}
