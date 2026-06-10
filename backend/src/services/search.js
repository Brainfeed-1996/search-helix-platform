
import { config } from './config.js';
import fs from 'fs/promises';
import { parseQuery } from '../utils/parser.js';
import { computeBm25, freshnessDecay } from '../utils/scoring.js';

export async function searchDocuments({ q, limit }) {
  const filePath = config.indexDir + '/documents.json';
  let docs = {};
  try {
    const raw = await fs.readFile(filePath, 'utf-8');
    docs = JSON.parse(raw).docs || {};
  } catch {}

  const tokens = parseQuery(q);
  const numDocs = Object.keys(docs).length || 1;
  const candidates = [];

  for (const doc of Object.values(docs)) {
    let score = 0;
    const text = ((doc.title || '') + ' ' + (doc.body || '')).toLowerCase();
    for (const token of tokens) {
      const termFreq = text.split(token).length - 1;
      const docFreq = Object.values(docs).filter(d => ((d.title || '') + ' ' + (d.body || '')).toLowerCase().includes(token)).length;
      score += computeBm25(termFreq, text.length, 200, numDocs, docFreq);
    }
    score *= freshnessDecay(doc.updated_at || doc.created_at);
    candidates.push({ id: doc.id, title: doc.title, url: doc.url, snippet: doc.body?.slice(0, 180), score });
  }

  candidates.sort((a, b) => b.score - a.score);
  return candidates.slice(0, limit || 10);
}
