import { genai, IMAGE_MODEL } from './client.js';
import { COMPOSITE_STYLE } from './prompts.js';
import { logger } from '../../utils/logger.js';
import type { CompositeGenerationRequest } from '@the-toast/shared';

/**
 * Generates an artistic composite group photo from individual selfies.
 * Uses Gemini image generation with the scene backdrop as context.
 */
export async function generateComposite(
  request: CompositeGenerationRequest
): Promise<string> {
  const { selfies, sceneDescription, sceneBackdropBase64 } = request;

  const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [];

  // Include scene backdrop if available
  if (sceneBackdropBase64) {
    parts.push({
      inlineData: {
        mimeType: 'image/png',
        data: sceneBackdropBase64,
      },
    });
  }

  // Include all selfies
  for (const selfie of selfies) {
    parts.push({
      inlineData: {
        mimeType: 'image/jpeg',
        data: selfie,
      },
    });
  }

  parts.push({
    text: `Create an artistic group composite photo for The Toast cocktail party.
Scene: ${sceneDescription}.
There are ${selfies.length} people in this group. Composite them naturally into the scene backdrop.
${COMPOSITE_STYLE}
Make it feel candid — friends caught mid-laugh at a dinner party. Wide landscape format.`,
  });

  const result = await genai.models.generateContent({
    model: IMAGE_MODEL,
    contents: [
      {
        role: 'user',
        parts,
      },
    ],
    config: {
      responseModalities: ['image', 'text'],
      temperature: 0.8,
    },
  });

  if (result.candidates?.[0]?.content?.parts) {
    for (const part of result.candidates[0].content.parts) {
      if (part.inlineData) {
        logger.info('gemini/composite', `Generated composite with ${selfies.length} selfies`);
        return part.inlineData.data || '';
      }
    }
  }

  throw new Error('No image returned from Gemini composite generation');
}
