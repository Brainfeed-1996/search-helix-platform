
import { Router } from 'express';
import { indexDocuments, getStats } from '../services/index.js';

export const router = Router();

router.post('/', async (req, res, next) => {
  try {
    const docs = Array.isArray(req.body?.documents) ? req.body.documents : [];
    const result = await indexDocuments(docs);
    res.status(202).json(result);
  } catch (err) {
    next(err);
  }
});

router.get('/stats', async (req, res, next) => {
  try {
    res.json(await getStats());
  } catch (err) {
    next(err);
  }
});
