import { Router, type Router as RouterType } from 'express';

export const healthRoutes: RouterType = Router();

healthRoutes.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'the-toast' });
});
