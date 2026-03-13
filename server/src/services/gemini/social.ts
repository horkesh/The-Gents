import { genai, TEXT_MODEL } from './client.js';
import { SYSTEM_INSTRUCTION, SPOTLIGHT_ROAST_PROMPT, COMPATIBILITY_QUIP_PROMPT, TOAST_SPEECH_PROMPT } from './prompts.js';
import { logger } from '../../utils/logger.js';

/**
 * Generates a spotlight roast — affectionate, never mean.
 */
export async function generateSpotlightRoast(
  alias: string,
  traits: string[],
  dossier: string
): Promise<string> {
  const result = await genai.models.generateContent({
    model: TEXT_MODEL,
    contents: [
      {
        role: 'user',
        parts: [{ text: SPOTLIGHT_ROAST_PROMPT(alias, traits, dossier) }],
      },
    ],
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 1.0,
    },
  });

  const roast = result.text?.trim() || `${alias}. Enough said.`;
  logger.info('gemini/social', `Generated spotlight roast for ${alias}`);
  return roast;
}

/**
 * Generates a compatibility quip for two aligned guests.
 */
export async function generateCompatibilityQuip(
  alias1: string,
  alias2: string,
  matchPercent: number
): Promise<string> {
  const result = await genai.models.generateContent({
    model: TEXT_MODEL,
    contents: [
      {
        role: 'user',
        parts: [{ text: COMPATIBILITY_QUIP_PROMPT(alias1, alias2, matchPercent) }],
      },
    ],
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.9,
    },
  });

  return result.text?.trim() || 'Suspicious.';
}

/**
 * Generates the toast speech — the defining moment of the evening.
 */
export async function generateToastSpeech(
  keyMoments: string[],
  participantAliases: string[]
): Promise<string> {
  const result = await genai.models.generateContent({
    model: TEXT_MODEL,
    contents: [
      {
        role: 'user',
        parts: [{ text: TOAST_SPEECH_PROMPT(keyMoments, participantAliases) }],
      },
    ],
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.9,
    },
  });

  return result.text?.trim() || 'To the evening, to the company, to the choices that brought us here. Cheers.';
}
