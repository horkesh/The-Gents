import type { SessionContext, ParticipantSummary } from '@the-toast/shared';
import type { RoomState } from '@the-toast/shared';

/**
 * Assembles a compact session context for Gemini API calls.
 * Target: under 500 tokens of context per call.
 */
export function assembleContext(room: RoomState): SessionContext {
  const participantSummaries: ParticipantSummary[] = room.participants
    .filter((p) => p.connected)
    .map((p) => ({
      alias: p.alias || p.name,
      traits: [...p.traits].filter(Boolean),
      role: p.role,
    }));

  const recentEvents = room.events
    .slice(-10)
    .map((e) => e.message);

  return {
    act: room.act,
    sceneDescription: room.scene?.description || '',
    sceneLocation: room.scene?.location || '',
    vibe: { ...room.vibe },
    participantSummaries,
    recentEvents,
    usedPrompts: [], // tracked separately per session
  };
}

/**
 * Formats the context into a concise string for inclusion in prompts.
 */
export function formatContextForPrompt(ctx: SessionContext): string {
  const parts: string[] = [];

  parts.push(`Act ${ctx.act}. Vibe: ${ctx.vibe.energy} (${ctx.vibe.mood}).`);

  if (ctx.sceneDescription) {
    parts.push(`Scene: ${ctx.sceneDescription}`);
  }

  if (ctx.participantSummaries.length > 0) {
    const guests = ctx.participantSummaries
      .map((p) => `${p.alias} (${p.role})`)
      .join(', ');
    parts.push(`Present: ${guests}`);
  }

  if (ctx.recentEvents.length > 0) {
    parts.push(`Recent: ${ctx.recentEvents.slice(-3).join('. ')}`);
  }

  return parts.join(' ');
}
