import type { Namespace, Socket } from 'socket.io';
import type { ClientToServerEvents, ServerToClientEvents } from '@the-toast/shared';
import { getRoom, getParticipantDisplayName } from '../services/room.js';
import { arrivalCounters } from './lobby.js';
import { startParty, advanceAct, wrapUp } from '../services/session.js';
import { assembleContext } from '../services/gemini/context.js';
import { generateCocktail } from '../services/gemini/cocktails.js';
import { generateConfession, generateConfessionCommentary } from '../services/gemini/confessions.js';
import { generateVibeNarration, generateWrappedNote, generateSessionTitle } from '../services/gemini/wrapped.js';
import { generateSpotlightRoast, generateCompatibilityQuip, generateToastSpeech } from '../services/gemini/social.js';
import { generateComposite } from '../services/gemini/composite.js';
import { logger } from '../utils/logger.js';

type PartySocket = Socket<ClientToServerEvents, ServerToClientEvents>;
type PartyNamespace = Namespace<ClientToServerEvents, ServerToClientEvents>;

// Active confession votes per room
const confessionVotes = new Map<string, { question: string; votes: Map<string, boolean | null> }>();

// Active snap uploads per room
const snapUploads = new Map<string, Map<string, string>>();

// Key moments per room (for Wrapped cards)
const keyMoments = new Map<string, string[]>();

// Guest book entries per room
const guestBookEntries = new Map<string, Map<string, string>>();

// Toast used flag per room
const toastUsed = new Map<string, boolean>();

// Per-guest vote history for compatibility (Feature #4)
const voteHistory = new Map<string, Map<string, Map<string, boolean | null>>>();

// Per-guest drink decisions for compatibility
const drinkDecisions = new Map<string, Map<string, Map<string, 'accept' | 'dodge'>>>();

function addKeyMoment(roomCode: string, moment: string) {
  if (!keyMoments.has(roomCode)) {
    keyMoments.set(roomCode, []);
  }
  keyMoments.get(roomCode)!.push(moment);
}

// Per-participant stats
const participantStats = new Map<string, Map<string, {
  drinksReceived: number;
  drinksAccepted: number;
  drinksDodged: number;
  confessionsParticipated: number;
  timesSpotlighted: number;
  snapsAppeared: number;
  arrivalOrder: number;
  cocktailsAccepted: string[];
  cocktailsDodged: string[];
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
      arrivalOrder: 0,
      cocktailsAccepted: [],
      cocktailsDodged: [],
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

        // Open guest book in Act IV
        if (transition.act === 4) {
          namespace.to(code).emit('GUEST_BOOK_OPEN');
        }
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

  // ─── ACCEPT / DODGE DRINK ─────────────────────
  socket.on('ACCEPT_DRINK', async ({ cocktailName }) => {
    const code = getRoomCode(socket);
    if (!code) return;

    const displayName = await getParticipantDisplayName(code, socket.id, socket.id);
    const stats = getOrCreateStats(code, socket.id);
    stats.drinksAccepted++;
    stats.cocktailsAccepted.push(cocktailName);

    // Track for compatibility
    trackDrinkDecision(code, socket.id, cocktailName, 'accept');

    namespace.to(code).emit('DRINK_ACCEPTED', {
      participantName: displayName,
      cocktailName,
    });
  });

  socket.on('DODGE_DRINK', async ({ cocktailName }) => {
    const code = getRoomCode(socket);
    if (!code) return;

    const displayName = await getParticipantDisplayName(code, socket.id, socket.id);
    const stats = getOrCreateStats(code, socket.id);
    stats.drinksDodged++;
    stats.cocktailsDodged.push(cocktailName);

    // Track for compatibility
    trackDrinkDecision(code, socket.id, cocktailName, 'dodge');

    namespace.to(code).emit('DRINK_DODGED', {
      participantName: displayName,
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
      addKeyMoment(code, `Confession: "${question}"`);
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

    // Track for compatibility
    trackVote(code, socket.id, confession.question, answer);

    // Check if all connected participants have voted
    const room = await getRoom(code);
    if (!room) return;

    const connectedCount = room.participants.filter((p) => p.connected).length;
    if (confession.votes.size >= connectedCount) {
      // Tally results
      const votes = Array.from(confession.votes.values());
      const yesCount = votes.filter((v) => v === true).length;
      const noCount = votes.filter((v) => v === false).length;
      const mysteryCount = votes.filter((v) => v === null).length;
      const total = confession.votes.size;

      const context = assembleContext(room);
      const commentary = await generateConfessionCommentary(
        confession.question, yesCount, noCount, mysteryCount, total, context
      );

      // Increment timesSpotlighted for all participants who voted
      for (const voterId of confession.votes.keys()) {
        const voterStats = getOrCreateStats(code, voterId);
        voterStats.timesSpotlighted++;
      }

      namespace.to(code).emit('CONFESSION_RESULT', {
        question: confession.question,
        yesCount,
        noCount,
        mysteryCount,
        total,
        commentary,
      });

      addKeyMoment(code, `Confession result: ${yesCount}/${total} said YES${mysteryCount > 0 ? `, ${mysteryCount} refused to answer` : ''} to "${confession.question}"`);
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

    // Check if all connected participants have uploaded
    const room = await getRoom(code);
    if (!room) return;

    const connectedCount = room.participants.filter((p) => p.connected).length;
    if (uploads.size >= connectedCount) {
      const selfies = Array.from(uploads.values());

      try {
        const compositeBase64 = await generateComposite({
          selfies,
          sceneDescription: room.scene?.description || 'a cocktail party',
          sceneBackdropBase64: room.scene?.backdropUrl?.replace('data:image/png;base64,', '') || '',
        });

        namespace.to(code).emit('PHOTO_READY', {
          imageUrl: `data:image/png;base64,${compositeBase64}`,
          act: room.act,
        });

        addKeyMoment(code, `Group snap taken during Act ${room.act}`);
        logger.info('party', `Composite photo generated for ${code}`);
      } catch (err) {
        // Fallback: use first image as collage
        logger.error('party', 'Composite generation failed, using fallback', err);
        const firstImage = selfies[0];
        namespace.to(code).emit('PHOTO_READY', {
          imageUrl: `data:image/jpeg;base64,${firstImage}`,
          act: room.act,
        });
      }

      snapUploads.delete(code);
    }
  });

  // ─── SPOTLIGHT ───────────────────────────────
  socket.on('TRIGGER_SPOTLIGHT', async ({ targetId }) => {
    const code = getRoomCode(socket);
    if (!code) return;

    try {
      const room = await getRoom(code);
      if (!room) return;

      // Validate sender is lorekeeper
      const sender = room.participants.find((p) => p.id === socket.id);
      if (sender?.role !== 'lorekeeper') return;

      const target = room.participants.find((p) => p.id === targetId);
      if (!target) return;

      const roast = await generateSpotlightRoast(
        target.alias || target.name,
        [...target.traits].filter(Boolean),
        target.dossier || ''
      );

      namespace.to(code).emit('SPOTLIGHT', { profile: target, roast });

      const stats = getOrCreateStats(code, targetId);
      stats.timesSpotlighted++;

      addKeyMoment(code, `${target.alias || target.name} was spotlighted: "${roast}"`);
      logger.info('party', `Spotlight on ${target.alias} in ${code}`);
    } catch (err) {
      logger.error('party', 'Failed to spotlight', err);
    }
  });

  // ─── GUEST BOOK ─────────────────────────────
  socket.on('SUBMIT_GUEST_BOOK', ({ message }) => {
    const code = getRoomCode(socket);
    if (!code) return;

    if (!guestBookEntries.has(code)) {
      guestBookEntries.set(code, new Map());
    }

    const entries = guestBookEntries.get(code)!;
    // One entry per guest, max 100 chars
    entries.set(socket.id, message.slice(0, 100));
    logger.info('party', `Guest book entry in ${code}`);
  });

  // ─── THE TOAST ──────────────────────────────
  socket.on('TRIGGER_TOAST', async () => {
    const code = getRoomCode(socket);
    if (!code) return;

    // Once per party
    if (toastUsed.get(code)) return;
    toastUsed.set(code, true);

    try {
      const room = await getRoom(code);
      if (!room) return;

      const roomKeyMoments = keyMoments.get(code) || [];
      const aliases = room.participants.map((p) => p.alias || p.name);
      const speech = await generateToastSpeech(roomKeyMoments, aliases);

      // Phase 1: Speech
      namespace.to(code).emit('TOAST_SPEECH', { speech });
      addKeyMoment(code, `The Toast was raised: "${speech}"`);

      // Phase 2: After 8 seconds, trigger snap
      await sleep(8000);
      namespace.to(code).emit('TOAST_SNAP');

      // Snap countdown
      snapUploads.set(code, new Map());
      for (let i = 3; i >= 0; i--) {
        namespace.to(code).emit('SNAP_COUNTDOWN', { seconds: i });
        if (i > 0) await sleep(1000);
      }
    } catch (err) {
      logger.error('party', 'Failed to trigger toast', err);
    }
  });

  // ─── COCKTAIL DEDICATIONS ──────────────────
  socket.on('SEND_GROUP_DRINK', async (payload) => {
    const code = getRoomCode(socket);
    if (!code) return;

    try {
      const room = await getRoom(code);
      if (!room) return;

      const dedicatedTo = payload?.dedicatedTo;
      const targetParticipant = dedicatedTo
        ? room.participants.find((p) => p.id === dedicatedTo)
        : undefined;
      const targetAlias = targetParticipant?.alias || targetParticipant?.name;

      const context = assembleContext(room);
      const cocktail = await generateCocktail(context, targetAlias);

      const cocktailData = {
        name: cocktail.name,
        story: cocktail.story,
        imageUrl: cocktail.imageBase64 ? `data:image/png;base64,${cocktail.imageBase64}` : '',
      };

      namespace.to(code).emit('DRINK_SENT', {
        cocktail: cocktailData,
        fromGent: 'Keys & Cocktails',
        dedicatedTo: targetAlias,
      });

      // Update stats for all guests
      for (const p of room.participants.filter((p) => p.role === 'guest')) {
        const stats = getOrCreateStats(code, p.id);
        stats.drinksReceived++;
      }

      const dedicationNote = targetAlias ? ` — dedicated to ${targetAlias}` : '';
      addKeyMoment(code, `"${cocktail.name}" was served to the room${dedicationNote}`);
      logger.info('party', `Drink "${cocktail.name}" sent to all in ${code}${dedicationNote}`);
    } catch (err) {
      logger.error('party', 'Failed to send group drink', err);
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
      addKeyMoment(code, `Vibe shifted from ${oldVibe} to ${mode}`);
      logger.info('party', `Vibe shifted to ${mode} in ${code}`);
    } catch (err) {
      logger.error('party', 'Failed to shift vibe', err);
    }
  });

}

async function generateWrappedCards(namespace: PartyNamespace, code: string) {
  const room = await getRoom(code);
  if (!room) return;

  try {
    const sessionTitle = await generateSessionTitle(room.scene?.location || 'the evening');
    const roomKeyMoments = keyMoments.get(code) || [];
    const entries = guestBookEntries.get(code);
    const guestBookMessages = entries ? Array.from(entries.values()) : [];
    const totalGuests = room.participants.length;

    // Set arrival order on stats from arrivalCounters
    const arrivalCount = arrivalCounters.get(code) || 0;
    for (let i = 0; i < room.participants.length; i++) {
      const stats = getOrCreateStats(code, room.participants[i].id);
      if (stats.arrivalOrder === 0) {
        stats.arrivalOrder = i + 1; // fallback sequential order
      }
    }

    for (const participant of room.participants) {
      const stats = getOrCreateStats(code, participant.id);
      const wrappedResult = await generateWrappedNote({
        alias: participant.alias || participant.name,
        traits: [...participant.traits].filter(Boolean),
        stats,
        keyMoments: roomKeyMoments,
      });

      // Compute compatibility (Feature #4)
      let mostAlignedWith: { alias: string; matchScore: number; quip: string } | undefined;
      const compat = computeCompatibility(code, participant.id, room.participants);
      if (compat) {
        const quip = await generateCompatibilityQuip(
          participant.alias || participant.name,
          compat.alias,
          compat.matchScore
        );
        mostAlignedWith = { ...compat, quip };
      }

      namespace.to(code).emit('WRAPPED_READY', {
        stats,
        lorekeeperNote: wrappedResult.lorekeeperNote,
        sessionTitle,
        photos: [],
        profile: participant,
        guestBookEntries: guestBookMessages,
        mostAlignedWith,
        totalGuests,
      });
    }
  } catch (err) {
    logger.error('party', 'Failed to generate wrapped cards', err);
  } finally {
    cleanupRoom(code);
  }
}

function trackVote(roomCode: string, participantId: string, question: string, answer: boolean | null) {
  if (!voteHistory.has(roomCode)) voteHistory.set(roomCode, new Map());
  const roomVotes = voteHistory.get(roomCode)!;
  if (!roomVotes.has(participantId)) roomVotes.set(participantId, new Map());
  roomVotes.get(participantId)!.set(question, answer);
}

function trackDrinkDecision(roomCode: string, participantId: string, cocktailName: string, decision: 'accept' | 'dodge') {
  if (!drinkDecisions.has(roomCode)) drinkDecisions.set(roomCode, new Map());
  const roomDrinks = drinkDecisions.get(roomCode)!;
  if (!roomDrinks.has(participantId)) roomDrinks.set(participantId, new Map());
  roomDrinks.get(participantId)!.set(cocktailName, decision);
}

function computeCompatibility(roomCode: string, participantId: string, participants: { id: string; alias: string; name: string }[]) {
  const roomVotes = voteHistory.get(roomCode);
  const roomDrinks = drinkDecisions.get(roomCode);
  const myVotes = roomVotes?.get(participantId);
  const myDrinks = roomDrinks?.get(participantId);

  let bestMatch = { id: '', alias: '', score: 0, total: 0 };

  for (const other of participants) {
    if (other.id === participantId) continue;

    let matches = 0;
    let total = 0;

    // Compare votes
    const otherVotes = roomVotes?.get(other.id);
    if (myVotes && otherVotes) {
      for (const [question, myAnswer] of myVotes) {
        const otherAnswer = otherVotes.get(question);
        if (otherAnswer !== undefined) {
          total++;
          if (myAnswer === otherAnswer) matches++;
        }
      }
    }

    // Compare drink decisions
    const otherDrinks = roomDrinks?.get(other.id);
    if (myDrinks && otherDrinks) {
      for (const [cocktail, myDecision] of myDrinks) {
        const otherDecision = otherDrinks.get(cocktail);
        if (otherDecision !== undefined) {
          total++;
          if (myDecision === otherDecision) matches++;
        }
      }
    }

    if (total >= 3 && matches / total > bestMatch.score / Math.max(bestMatch.total, 1)) {
      bestMatch = { id: other.id, alias: other.alias || other.name, score: matches, total };
    }
  }

  if (bestMatch.total < 3) return undefined;
  return { alias: bestMatch.alias, matchScore: Math.round((bestMatch.score / bestMatch.total) * 100) };
}

/**
 * Purges all in-memory state for a completed room.
 */
function cleanupRoom(code: string) {
  keyMoments.delete(code);
  participantStats.delete(code);
  confessionVotes.delete(code);
  snapUploads.delete(code);
  arrivalCounters.delete(code);
  guestBookEntries.delete(code);
  toastUsed.delete(code);
  voteHistory.delete(code);
  drinkDecisions.delete(code);
  logger.info('party', `Cleaned up state for room ${code}`);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
