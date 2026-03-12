import { genai, TEXT_MODEL, IMAGE_MODEL } from './client.js';
import { SYSTEM_INSTRUCTION, COCKTAIL_STYLE } from './prompts.js';
import { formatContextForPrompt } from './context.js';
import { logger } from '../../utils/logger.js';
import type { CocktailGenerationResult, SessionContext } from '@the-toast/shared';

/**
 * Generates a cocktail — name, story, and photorealistic image.
 */
export async function generateCocktail(
  context: SessionContext,
  targetAlias?: string
): Promise<CocktailGenerationResult> {
  const contextStr = formatContextForPrompt(context);
  const targetNote = targetAlias
    ? `This drink is being sent to ${targetAlias}. Make it feel personal.`
    : 'This is a group round — the drink should suit the mood of the room.';

  // Generate cocktail text
  const textResult = await genai.models.generateContent({
    model: TEXT_MODEL,
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: `Create a cocktail for The Toast party.
Context: ${contextStr}
${targetNote}

Return ONLY valid JSON:
{
  "name": "An evocative, original cocktail name (never a real cocktail name). 2-3 words max.",
  "story": "A one-line backstory for this drink (max 15 words). Witty, evocative, mysterious."
}`,
          },
        ],
      },
    ],
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 1.0,
    },
  });

  let name = 'The Unnamed';
  let story = 'Some things are better left to the imagination.';

  try {
    const text = textResult.text || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      name = parsed.name || name;
      story = parsed.story || story;
    }
  } catch (err) {
    logger.error('gemini/cocktails', 'Failed to parse cocktail text', err);
  }

  // Generate cocktail image
  let imageBase64 = '';
  try {
    const imageResult = await genai.models.generateContent({
      model: IMAGE_MODEL,
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `Generate a photorealistic cocktail image for a drink called "${name}". Story: "${story}". ${COCKTAIL_STYLE} The drink should look unique and artisanal. Square format.`,
            },
          ],
        },
      ],
      config: {
        responseModalities: ['image', 'text'],
        temperature: 0.8,
      },
    });

    if (imageResult.candidates?.[0]?.content?.parts) {
      for (const part of imageResult.candidates[0].content.parts) {
        if (part.inlineData) {
          imageBase64 = part.inlineData.data || '';
          break;
        }
      }
    }
  } catch (err) {
    logger.error('gemini/cocktails', 'Failed to generate cocktail image', err);
  }

  logger.info('gemini/cocktails', `Generated cocktail: "${name}"`);

  return { name, story, imageBase64 };
}
