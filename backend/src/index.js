
import express from 'express';
import cors from 'cors';
import compression from 'compression';
import { config } from './services/config.js';
import { router as indexRouter } from './routes/index.js';
import { router as searchRouter } from './routes/search.js';
import notFound from './middleware/notFound.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '2mb' }));

app.use('/index', indexRouter);
app.use('/search', searchRouter);
app.use(notFound);
app.use(errorHandler);

const server = app.listen(config.port, config.host, () => {
  console.log('Search Helix API -> http://' + config.host + ':' + config.port);
});

export default server;
