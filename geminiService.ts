
import { GoogleGenAI, Type } from "@google/genai";
import { SYSTEM_INSTRUCTION } from './constants';

// Always use process.env.API_KEY directly as per guidelines
export const hasApiKey = () => !!process.env.API_KEY;

/**
 * Generates a guest profile based on a name and a selfie.
 */
export async function generateProfile(name: string, imageBase64: string) {
  // Create a new GoogleGenAI instance right before the call
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: imageBase64
            }
          },
          {
            text: `Analyze this selfie for a "virtual cocktail party" persona. 
            The user's name is ${name}.
            Generate a JSON object with:
            - alias: A cool, noir-style nickname (e.g., Velvet, Ember).
            - traits: Array of 3 personality adjectives inferred from the photo.
            - dossier: A 1-sentence witty observation about them.
            - description: A visual description to generate a stylized portrait (cinematic, warm lighting, editorial style).`
          }
        ]
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            alias: { type: Type.STRING },
            traits: { type: Type.ARRAY, items: { type: Type.STRING } },
            dossier: { type: Type.STRING },
            description: { type: Type.STRING }
          },
          required: ["alias", "traits", "dossier", "description"]
        }
      }
    });

    // Access text property directly (not as a method)
    return JSON.parse(response.text || '{}');
  } catch (e) {
    console.error("Profile Gen Error", e);
    // Graceful fallback for demo purposes
    return {
      alias: "Midnight " + name,
      traits: ["Enigmatic", "Charming", "Bold"],
      dossier: "A mystery wrapped in an enigma, arriving with style.",
      description: "A stylized cinematic portrait."
    };
  }
}

/**
 * Generates a cinematic scene description.
 */
export async function generateScene(act: string, vibe: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a cinematic scene description for Act: ${act} with Vibe: ${vibe}.
      Return JSON with:
      - title: Short evocative name.
      - description: Max 25 words. Atmospheric.
      - imagePrompt: A prompt to generate the background image.`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            imagePrompt: { type: Type.STRING }
          },
          required: ["title", "description", "imagePrompt"]
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (e) {
    console.error("Scene Gen Error", e);
    return { description: "A quiet moment of reflection.", title: "The Shadows", imagePrompt: "" };
  }
}

/**
 * Generates an evocative cocktail name and story.
 */
export async function generateCocktail(scene: string, recipientName?: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = recipientName 
    ? `Create a custom cocktail for ${recipientName} in this scene: ${scene}.`
    : `Create a signature group cocktail for this scene: ${scene}.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt + ` Return JSON: { name, story, recipe }.`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            story: { type: Type.STRING },
            recipe: { type: Type.STRING }
          },
          required: ["name", "story", "recipe"]
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (e) {
    console.error("Cocktail Gen Error", e);
    return { name: "Midnight Whisper", story: "A blend of secrets and moonlight.", recipe: "Gin, Tonic, Blackberry" };
  }
}

/**
 * Generates a playful confession prompt.
 */
export async function generateConfessionPrompt(act: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a playful "Confession" YES/NO question for Act: ${act}. 
      Return JSON: { question, commentary }.`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            commentary: { type: Type.STRING }
          },
          required: ["question", "commentary"]
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (e) {
    console.error("Confession Gen Error", e);
    return { question: "Have you ever told a secret you were sworn to keep?", commentary: "Trust is a delicate thing." };
  }
}

/**
 * Generates a summary note for the final 'Wrapped' screen.
 */
export async function generateWrappedNote(participantName: string, stats: any) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Write a witty 2-sentence note for ${participantName} based on stats: ${JSON.stringify(stats)}. Do not use Markdown.`,
            config: {
                systemInstruction: SYSTEM_INSTRUCTION,
            }
        });
        // Access text property directly
        return response.text?.trim() || "A night of elegance and mystery that won't soon be forgotten.";
    } catch (e) {
        console.error("Wrapped Note Gen Error", e);
        return "You were a captivating presence in tonight's ensemble.";
    }
}
