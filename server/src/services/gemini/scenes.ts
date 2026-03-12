import { genai, TEXT_MODEL, IMAGE_MODEL } from './client.js';
import { SYSTEM_INSTRUCTION, BACKDROP_STYLE } from './prompts.js';
import { SCENE_POOLS } from '@the-toast/shared';
import { logger } from '../../utils/logger.js';
import type { SceneGenerationResult } from '@the-toast/shared';
import type { ActNumber, VibeState } from '@the-toast/shared';

/**
 * Generates a scene for a given act — description + backdrop image.
 * Uses the curated scene pool as a seed, then Gemini embellishes.
 */
export async function generateScene(
  act: ActNumber,
  vibe: VibeState,
  baseLocation: string | null,
  previousScene: string | null
): Promise<SceneGenerationResult> {
  const actKey = act as keyof typeof SCENE_POOLS;
  const pool = SCENE_POOLS[actKey] || SCENE_POOLS[1];
  const seed = pool[Math.floor(Math.random() * pool.length)];

  const continuityNote = baseLocation
    ? `The base location is: "${baseLocation}". Maintain scene continuity — evolve the setting, don't jump to a new place.`
    : `This is the opening scene. Establish a memorable location.`;

  const previousNote = previousScene
    ? `Previous scene: "${previousScene}". The new scene should feel like a natural progression.`
    : '';

  // Generate scene description
  const textResult = await genai.models.generateContent({
    model: TEXT_MODEL,
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: `Generate a scene for Act ${act} of The Toast cocktail party.
Seed location: "${seed}"
Vibe: ${vibe.energy} (${vibe.mood})
${continuityNote}
${previousNote}

Return ONLY valid JSON:
{
  "description": "A cinematic scene description (max 25 words). Atmospheric, sensory, evocative.",
  "location": "The specific location name (e.g., 'the Adriatic terrace', 'the Havana jazz club')"
}`,
          },
        ],
      },
    ],
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.9,
    },
  });

  let description = seed;
  let location = seed;

  try {
    const text = textResult.text || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      description = parsed.description || description;
      location = parsed.location || location;
    }
  } catch (err) {
    logger.error('gemini/scenes', 'Failed to parse scene text', err);
  }

  // Generate backdrop image
  let backdropBase64 = '';
  try {
    const imageResult = await genai.models.generateContent({
      model: IMAGE_MODEL,
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `Generate a cinematic backdrop image for this scene: "${description}". ${BACKDROP_STYLE} Wide establishing shot, 16:9 aspect ratio. No people. Moody, atmospheric, evocative. The kind of place where interesting things happen after midnight.`,
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
          backdropBase64 = part.inlineData.data || '';
          break;
        }
      }
    }
  } catch (err) {
    logger.error('gemini/scenes', 'Failed to generate backdrop', err);
  }

  logger.info('gemini/scenes', `Generated scene for Act ${act}: "${description}"`);

  return { description, backdropBase64, location };
}
