import express from 'express';
import cors from 'cors';
import compression from 'compression';
import { config } from './services/config.js';
import { router as healthRouter } from './routes/health.js';
import { router as indexRouter } from './routes/index.js';
import { router as searchRouter } from './routes/search.js';

export function createApp() {
  const app = express();
  app.use(cors({ origin: true, credentials: true }));
  app.use(compression());
  app.use(express.json({ limit: '2mb' }));

  app.use('/health', healthRouter);
  app.use('/index', indexRouter);
  app.use('/search', searchRouter);

  app.use((req, res) => {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: `Route introuvable: ${req.method} ${req.path}` } });
  });

  return app;
}

export async function start() {
  const app = createApp();
  const server = app.listen(config.port, config.host, () => {
    console.log(`Search Helix API -> http://${config.host}:${config.port}`);
  });
  return server;
}

export default createApp;
