import { Router, type Router as RouterType } from 'express';
import { getDailyRoomToken } from '../services/daily.js';
import { logger } from '../utils/logger.js';

export const dailyRoutes: RouterType = Router();

dailyRoutes.post('/daily/token', async (req, res) => {
  try {
    const { roomName, participantId } = req.body;
    if (!roomName || !participantId) {
      res.status(400).json({ error: 'roomName and participantId are required' });
      return;
    }

    const token = await getDailyRoomToken(roomName, participantId);
    if (!token) {
      res.status(503).json({ error: 'Video service not available' });
      return;
    }

    res.json({ token });
  } catch (err) {
    logger.error('daily', 'Failed to generate token', err);
    res.status(500).json({ error: 'Failed to generate token' });
  }
});
