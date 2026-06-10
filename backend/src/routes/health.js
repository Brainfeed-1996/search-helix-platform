import { Router } from 'express';

export const router = Router();

router.get('/live', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.get('/ready', (req, res) => {
  res.json({ status: 'ready', checks: { index: true, storage: true } });
});
