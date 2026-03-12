import { Router, type Router as RouterType } from 'express';
import { createRoom, getRoom } from '../services/room.js';

export const roomRoutes: RouterType = Router();

roomRoutes.post('/rooms', async (req, res) => {
  try {
    const { hostId, hostRole } = req.body;
    if (!hostId || !hostRole) {
      res.status(400).json({ error: 'hostId and hostRole are required' });
      return;
    }
    const room = await createRoom(hostId, hostRole);
    res.json(room);
  } catch (err) {
    console.error('[rooms] Failed to create room:', err);
    res.status(500).json({ error: 'Failed to create room' });
  }
});

roomRoutes.get('/rooms/:code', async (req, res) => {
  try {
    const room = await getRoom(req.params.code);
    if (!room) {
      res.status(404).json({ error: 'Room not found' });
      return;
    }
    res.json(room);
  } catch (err) {
    console.error('[rooms] Failed to get room:', err);
    res.status(500).json({ error: 'Failed to get room' });
  }
});
