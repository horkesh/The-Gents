import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { config } from './config.js';
import { roomRoutes } from './routes/rooms.js';
import { profileRoutes } from './routes/profiles.js';
import { healthRoutes } from './routes/health.js';
import { setupSocketHandler } from './socket/handler.js';
import type { ClientToServerEvents, ServerToClientEvents } from '@the-toast/shared';

const app = express();
const httpServer = createServer(app);

const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin: config.clientUrl,
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors({ origin: config.clientUrl }));
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api', healthRoutes);
app.use('/api', roomRoutes);
app.use('/api', profileRoutes);

// Socket.io
const partyNamespace = io.of('/party');
setupSocketHandler(partyNamespace);

httpServer.listen(config.port, () => {
  console.log(`[The Toast] Server running on port ${config.port}`);
});

export { io, partyNamespace };
