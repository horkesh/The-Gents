import { genai, TEXT_MODEL } from './client.js';
import { SYSTEM_INSTRUCTION } from './prompts.js';
import { logger } from '../../utils/logger.js';
import type { WrappedGenerationRequest, WrappedGenerationResult } from '@the-toast/shared';

/**
 * Generates the Lorekeeper's Note for a guest's Wrapped card.
 * A 2-sentence personalized summary of their evening.
 */
export async function generateWrappedNote(
  request: WrappedGenerationRequest
): Promise<WrappedGenerationResult> {
  const { alias, traits, stats, keyMoments } = request;

  const result = await genai.models.generateContent({
    model: TEXT_MODEL,
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: `Write the Lorekeeper's Note for ${alias}'s evening at The Toast.

Their traits: ${traits.join(', ')}
Stats: ${stats.drinksReceived} drinks received (${stats.drinksAccepted} accepted, ${stats.drinksDodged} dodged), ${stats.confessionsParticipated} confessions, spotlighted ${stats.timesSpotlighted} times, appeared in ${stats.snapsAppeared} group photos.
Key moments: ${keyMoments.join('. ')}

Write EXACTLY 2 sentences. The tone should be:
- Witty and affectionate, like a friend recapping the night
- Cinematic and observational, like a narrator closing a chapter
- Never mean, never generic
- Reference specific moments or stats where possible

Return ONLY the 2 sentences, nothing else.`,
          },
        ],
      },
    ],
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.9,
    },
  });

  const lorekeeperNote = result.text?.trim() || `${alias} arrived uncertain and left unforgettable. The evening will remember them longer than they think.`;
  logger.info('gemini/wrapped', `Generated Lorekeeper's Note for ${alias}`);

  return { lorekeeperNote };
}

/**
 * Generates a session title based on the evening's location.
 */
export async function generateSessionTitle(location: string): Promise<string> {
  const result = await genai.models.generateContent({
    model: TEXT_MODEL,
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: `Generate a short, evocative title for this Toast session. The main location was: "${location}".
Format: "The [Location/Theme] Session" (e.g., "The Havana Session", "The Adriatic Session").
Return ONLY the title, nothing else.`,
          },
        ],
      },
    ],
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.8,
    },
  });

  return result.text?.trim() || 'The Evening Session';
}

/**
 * Generates a vibe shift narration.
 */
export async function generateVibeNarration(
  oldVibe: string,
  newVibe: string
): Promise<string> {
  const result = await genai.models.generateContent({
    model: TEXT_MODEL,
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: `The vibe just shifted from "${oldVibe}" to "${newVibe}" at The Toast cocktail party.
Write a single cinematic transition line (max 12 words).
Think: a narrator describing a scene change in a film.
Examples: "The lights dim. Someone changed the record." or "The room exhales. Something just shifted."
Return ONLY the line, nothing else.`,
          },
        ],
      },
    ],
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 1.0,
    },
  });

  return result.text?.trim() || 'The room shifts. Something just changed.';
}
