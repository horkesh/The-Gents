import { genai, TEXT_MODEL } from './client.js';
import { SYSTEM_INSTRUCTION } from './prompts.js';
import { formatContextForPrompt } from './context.js';
import { logger } from '../../utils/logger.js';
import type { SessionContext } from '@the-toast/shared';

/**
 * Generates a confession prompt — provocative but party-appropriate.
 */
export async function generateConfession(
  context: SessionContext
): Promise<string> {
  const contextStr = formatContextForPrompt(context);
  const usedPromptsNote = context.usedPrompts.length > 0
    ? `Already used prompts (do NOT repeat these): ${context.usedPrompts.join('; ')}`
    : '';

  const result = await genai.models.generateContent({
    model: TEXT_MODEL,
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: `Generate a confession prompt for The Toast party.
Context: ${contextStr}
${usedPromptsNote}

The prompt should be a "have you ever..." style question that is:
- Provocative but never crude, sexual, or uncomfortable
- The kind of thing that makes people laugh and then get quiet
- Specific enough to be interesting, universal enough that some people will say yes

Return ONLY the question text, nothing else. No JSON. No quotes. Just the question.`,
          },
        ],
      },
    ],
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 1.0,
    },
  });

  const question = result.text?.trim() || 'Have you ever pretended to like a cocktail to seem sophisticated?';
  logger.info('gemini/confessions', `Generated confession: "${question}"`);
  return question;
}

/**
 * Generates commentary on a confession result.
 */
export async function generateConfessionCommentary(
  question: string,
  yesCount: number,
  noCount: number,
  mysteryCount: number,
  total: number,
  context: SessionContext
): Promise<string> {
  const mysteryNote = mysteryCount > 0
    ? `\n${mysteryCount} refused to answer — reference this mystery if it's interesting.`
    : '';

  const result = await genai.models.generateContent({
    model: TEXT_MODEL,
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: `The confession question was: "${question}"
Result: ${yesCount} said YES, ${noCount} said NO${mysteryCount > 0 ? `, ${mysteryCount} refused to answer` : ''}. Total: ${total}.
Vibe: ${context.vibe.energy}${mysteryNote}

Generate a single witty, observational commentary line about this result (max 15 words).
Think: a bartender who's seen everything making a dry observation.
Return ONLY the commentary text, nothing else.`,
          },
        ],
      },
    ],
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.9,
    },
  });

  return result.text?.trim() || 'Interesting. The room just got a little more honest.';
}
