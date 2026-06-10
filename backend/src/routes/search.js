
import { Router } from 'express';
import { searchDocuments } from '../services/search.js';

export const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const q = String(req.query.q || '');
    const limit = Number(req.query.limit || 10);
    const results = await searchDocuments({ q, limit });
    res.json({ query: q, results, took_ms: 10 });
  } catch (err) {
    next(err);
  }
});
