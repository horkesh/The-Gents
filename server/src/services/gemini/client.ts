import { GoogleGenAI } from '@google/genai';
import { config } from '../../config.js';

export const genai = new GoogleGenAI({ apiKey: config.gemini.apiKey });

export const TEXT_MODEL = 'gemini-2.5-flash';
export const IMAGE_MODEL = 'gemini-2.5-flash-preview-image-generation';
