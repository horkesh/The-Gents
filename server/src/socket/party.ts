import type { Namespace, Socket } from 'socket.io';
import type { ClientToServerEvents, ServerToClientEvents } from '@the-toast/shared';
import { getRoom } from '../services/room.js';
import { startParty, advanceAct, wrapUp } from '../services/session.js';
import { assembleContext } from '../services/gemini/context.js';
import { generateCocktail } from '../services/gemini/cocktails.js';
import { generateConfession, generateConfessionCommentary } from '../services/gemini/confessions.js';
import { generateVibeNarration, generateWrappedNote, generateSessionTitle } from '../services/gemini/wrapped.js';
import { logger } from '../utils/logger.js';

type PartySocket = Socket<ClientToServerEvents, ServerToClientEvents>;
type PartyNamespace = Namespace<ClientToServerEvents, ServerToClientEvents>;

// Track socket → room mapping
const socketRooms = new Map<string, string>();

// Active confession votes per room
const confessionVotes = new Map<string, { question: string; votes: Map<string, boolean> }>();

// Active snap uploads per room
const snapUploads = new Map<string, Map<string, string>>();

// Per-participant stats
const participantStats = new Map<string, Map<string, {
  drinksReceived: number;
  drinksAccepted: number;
  drinksDodged: number;
  confessionsParticipated: number;
  timesSpotlighted: number;
  snapsAppeared: number;
}>>();

function getRoomCode(socket: PartySocket): string | undefined {
  for (const room of socket.rooms) {
    if (room !== socket.id) return room;
  }
  return undefined;
}

function getOrCreateStats(roomCode: string, participantId: string) {
  if (!participantStats.has(roomCode)) {
    participantStats.set(roomCode, new Map());
  }
  const roomStats = participantStats.get(roomCode)!;
  if (!roomStats.has(participantId)) {
    roomStats.set(participantId, {
      drinksReceived: 0,
      drinksAccepted: 0,
      drinksDodged: 0,
      confessionsParticipated: 0,
      timesSpotlighted: 0,
      snapsAppeared: 0,
    });
  }
  return roomStats.get(participantId)!;
}

export function setupPartyHandlers(namespace: PartyNamespace, socket: PartySocket) {

  // ─── START PARTY ──────────────────────────────
  socket.on('START_PARTY', async () => {
    const code = getRoomCode(socket);
    if (!code) return;

    try {
      const room = await startParty(code);
      if (!room) return;

      namespace.to(code).emit('PARTY_STARTED', {
        scene: room.scene || { description: 'The evening begins.', backdropUrl: '', location: 'Unknown' },
      });

      namespace.to(code).emit('ROOM_STATE_UPDATE', room);
      logger.info('party', `Party started in ${code}`);
    } catch (err) {
      logger.error('party', 'Failed to start party', err);
    }
  });

  // ─── NEXT ACT ─────────────────────────────────
  socket.on('NEXT_ACT', async () => {
    const code = getRoomCode(socket);
    if (!code) return;

    try {
      const transition = await advanceAct(code);
      if (!transition) return;

      if (transition.act === 5) {
        // Wrapped — generate cards for each participant
        await generateWrappedCards(namespace, code);
      } else {
        namespace.to(code).emit('ACT_TRANSITION', {
          act: transition.act,
          scene: transition.scene,
          narration: transition.narration,
        });
      }
    } catch (err) {
      logger.error('party', 'Failed to advance act', err);
    }
  });

  // ─── WRAP IT UP ───────────────────────────────
  socket.on('WRAP_IT_UP', async () => {
    const code = getRoomCode(socket);
    if (!code) return;

    await wrapUp(code);
    await generateWrappedCards(namespace, code);
  });

  // ─── GROUP DRINK ──────────────────────────────
  socket.on('SEND_GROUP_DRINK', async () => {
    const code = getRoomCode(socket);
    if (!code) return;

    try {
      const room = await getRoom(code);
      if (!room) return;

      const context = assembleContext(room);
      const cocktail = await generateCocktail(context);

      const cocktailData = {
        name: cocktail.name,
        story: cocktail.story,
        imageUrl: cocktail.imageBase64 ? `data:image/png;base64,${cocktail.imageBase64}` : '',
      };

      namespace.to(code).emit('DRINK_SENT', {
        cocktail: cocktailData,
        fromGent: 'Keys & Cocktails',
      });

      // Update stats for all guests
      for (const p of room.participants.filter((p) => p.role === 'guest')) {
        const stats = getOrCreateStats(code, p.id);
        stats.drinksReceived++;
      }

      logger.info('party', `Drink "${cocktail.name}" sent to all in ${code}`);
    } catch (err) {
      logger.error('party', 'Failed to send group drink', err);
    }
  });

  // ─── ACCEPT / DODGE DRINK ─────────────────────
  socket.on('ACCEPT_DRINK', ({ cocktailName }) => {
    const code = getRoomCode(socket);
    if (!code) return;

    const stats = getOrCreateStats(code, socket.id);
    stats.drinksAccepted++;

    namespace.to(code).emit('DRINK_ACCEPTED', {
      participantName: socket.id,
      cocktailName,
    });
  });

  socket.on('DODGE_DRINK', ({ cocktailName }) => {
    const code = getRoomCode(socket);
    if (!code) return;

    const stats = getOrCreateStats(code, socket.id);
    stats.drinksDodged++;

    namespace.to(code).emit('DRINK_DODGED', {
      participantName: socket.id,
      cocktailName,
      commentary: 'Sent it back. Noted.',
    });
  });

  // ─── CONFESSION ───────────────────────────────
  socket.on('TRIGGER_CONFESSION', async () => {
    const code = getRoomCode(socket);
    if (!code) return;

    try {
      const room = await getRoom(code);
      if (!room) return;

      const context = assembleContext(room);
      const question = await generateConfession(context);

      confessionVotes.set(code, { question, votes: new Map() });
      namespace.to(code).emit('CONFESSION_PROMPT', { question });
      logger.info('party', `Confession triggered in ${code}: "${question}"`);
    } catch (err) {
      logger.error('party', 'Failed to trigger confession', err);
    }
  });

  socket.on('CONFESSION_VOTE', async ({ answer }) => {
    const code = getRoomCode(socket);
    if (!code) return;

    const confession = confessionVotes.get(code);
    if (!confession) return;

    confession.votes.set(socket.id, answer);
    const stats = getOrCreateStats(code, socket.id);
    stats.confessionsParticipated++;

    // Check if all connected participants have voted
    const room = await getRoom(code);
    if (!room) return;

    const connectedCount = room.participants.filter((p) => p.connected).length;
    if (confession.votes.size >= connectedCount) {
      // Tally results
      const yesCount = Array.from(confession.votes.values()).filter(Boolean).length;
      const total = confession.votes.size;

      const context = assembleContext(room);
      const commentary = await generateConfessionCommentary(
        confession.question, yesCount, total, context
      );

      namespace.to(code).emit('CONFESSION_RESULT', {
        question: confession.question,
        yesCount,
        total,
        commentary,
      });

      confessionVotes.delete(code);
    }
  });

  // ─── SNAP ─────────────────────────────────────
  socket.on('TRIGGER_SNAP', async () => {
    const code = getRoomCode(socket);
    if (!code) return;

    snapUploads.set(code, new Map());

    // 3-second countdown
    for (let i = 3; i >= 0; i--) {
      namespace.to(code).emit('SNAP_COUNTDOWN', { seconds: i });
      if (i > 0) await sleep(1000);
    }
  });

  socket.on('UPLOAD_SNAP', async ({ imageData }) => {
    const code = getRoomCode(socket);
    if (!code) return;

    const uploads = snapUploads.get(code);
    if (!uploads) return;

    uploads.set(socket.id, imageData);

    // Update stats
    const stats = getOrCreateStats(code, socket.id);
    stats.snapsAppeared++;

    // For now, just acknowledge the photo (composite generation would happen here)
    // In full implementation, this would call Gemini to composite all selfies
    if (uploads.size >= 1) {
      // Use the first uploaded image as a placeholder for the composite
      const firstImage = Array.from(uploads.values())[0];
      namespace.to(code).emit('PHOTO_READY', {
        imageUrl: `data:image/jpeg;base64,${firstImage}`,
        act: 1,
      });
      snapUploads.delete(code);
    }
  });

  // ─── VIBE SHIFT ───────────────────────────────
  socket.on('VIBE_SHIFT', async ({ mode }) => {
    const code = getRoomCode(socket);
    if (!code) return;

    try {
      const room = await getRoom(code);
      if (!room) return;

      const oldVibe = room.vibe.energy;
      const narration = await generateVibeNarration(oldVibe, mode);

      room.vibe.energy = mode;

      namespace.to(code).emit('VIBE_CHANGED', { mode, narration });
      logger.info('party', `Vibe shifted to ${mode} in ${code}`);
    } catch (err) {
      logger.error('party', 'Failed to shift vibe', err);
    }
  });

  // Track room for this socket
  socket.on('JOIN_ROOM', ({ code }) => {
    socketRooms.set(socket.id, code);
  });
}

async function generateWrappedCards(namespace: PartyNamespace, code: string) {
  const room = await getRoom(code);
  if (!room) return;

  const sessionTitle = await generateSessionTitle(room.scene?.location || 'the evening');

  for (const participant of room.participants) {
    const stats = getOrCreateStats(code, participant.id);
    const wrappedResult = await generateWrappedNote({
      alias: participant.alias || participant.name,
      traits: [...participant.traits].filter(Boolean),
      stats,
      keyMoments: [],
    });

    // Send personalized wrapped card to each participant
    namespace.to(code).emit('WRAPPED_READY', {
      stats,
      lorekeeperNote: wrappedResult.lorekeeperNote,
      sessionTitle,
      photos: [],
      profile: participant,
    });
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
