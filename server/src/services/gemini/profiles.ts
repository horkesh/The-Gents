import { genai, TEXT_MODEL, IMAGE_MODEL } from './client.js';
import { SYSTEM_INSTRUCTION, PORTRAIT_STYLE } from './prompts.js';
import { logger } from '../../utils/logger.js';
import type { ProfileGenerationResult } from '@the-toast/shared';

/**
 * Generates a guest's party identity from their photo.
 * Returns: stylized portrait, cocktail alias, 3 traits, dossier line.
 */
export async function generateProfile(
  photoBase64: string,
  name: string,
  role: string
): Promise<ProfileGenerationResult> {
  // Step 1: Generate text profile (alias, traits, dossier)
  const textResult = await genai.models.generateContent({
    model: TEXT_MODEL,
    contents: [
      {
        role: 'user',
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: photoBase64,
            },
          },
          {
            text: `This is ${name}, a ${role === 'guest' ? 'guest' : 'host'} at The Toast cocktail party.

Analyze their photo and generate their party persona. Return ONLY valid JSON:
{
  "alias": "a single evocative cocktail alias (one word, e.g. Velvet, Ember, Midnight)",
  "traits": ["trait1", "trait2", "trait3"],
  "dossier": "A one-line dossier entry (max 12 words). Witty, observational, cinematic."
}

The alias should feel like a name whispered at a bar. Traits should be personality descriptors inferred from the photo. The dossier should read like a spy file entry — dry, intriguing.`,
          },
        ],
      },
    ],
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.9,
    },
  });

  let alias = 'Unknown';
  let traits: [string, string, string] = ['mysterious', 'intriguing', 'present'];
  let dossier = 'Arrived without introduction. Noted.';

  try {
    const text = textResult.text || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      alias = parsed.alias || alias;
      traits = [
        parsed.traits?.[0] || traits[0],
        parsed.traits?.[1] || traits[1],
        parsed.traits?.[2] || traits[2],
      ];
      dossier = parsed.dossier || dossier;
    }
  } catch (err) {
    logger.error('gemini/profiles', 'Failed to parse text profile', err);
  }

  // Step 2: Generate stylized portrait
  let portraitBase64 = '';
  try {
    const imageResult = await genai.models.generateContent({
      model: IMAGE_MODEL,
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: photoBase64,
              },
            },
            {
              text: `Create a stylized portrait of this person for an exclusive cocktail party invitation. ${PORTRAIT_STYLE} Keep their recognizable features but elevate to an editorial style. Portrait crop, warm tones.`,
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
          portraitBase64 = part.inlineData.data || '';
          break;
        }
      }
    }
  } catch (err) {
    logger.error('gemini/profiles', 'Failed to generate portrait', err);
  }

  logger.info('gemini/profiles', `Generated profile for ${name}: alias="${alias}"`);

  return { portraitBase64, alias, traits, dossier };
}
