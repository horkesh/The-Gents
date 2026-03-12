import { Router, type Router as RouterType } from 'express';
import multer from 'multer';
import { generateProfile } from '../services/gemini/profiles.js';

export const profileRoutes: RouterType = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});

profileRoutes.post('/profiles/generate', upload.single('photo'), async (req, res) => {
  try {
    const { name, role } = req.body;
    if (!name || !role) {
      res.status(400).json({ error: 'name and role are required' });
      return;
    }

    if (!req.file) {
      res.status(400).json({ error: 'photo is required' });
      return;
    }

    const photoBase64 = req.file.buffer.toString('base64');
    const result = await generateProfile(photoBase64, name, role);

    res.json({
      alias: result.alias,
      traits: result.traits,
      dossier: result.dossier,
      portraitBase64: result.portraitBase64,
    });
  } catch (err) {
    console.error('[profiles] Failed to generate profile:', err);
    res.status(500).json({ error: 'Failed to generate profile' });
  }
});
