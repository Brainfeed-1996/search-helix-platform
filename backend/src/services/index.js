
import fs from 'fs/promises';
import { config } from './config.js';

export async function indexDocuments(documents) {
  await fs.mkdir(config.indexDir, { recursive: true });
  const filePath = config.indexDir + '/documents.json';
  let store = { docs: {}, stats: { docCount: 0, termCount: 0 } };
  try {
    const raw = await fs.readFile(filePath, 'utf-8');
    store = JSON.parse(raw);
  } catch {}

  for (const doc of documents) {
    store.docs[doc.id] = doc;
  }

  store.stats.docCount = Object.keys(store.docs).length;
  store.stats.termCount = Array.from(new Set(Object.values(store.docs).flatMap(d => (d.body || '').split(/W+/)))).length;

  await fs.writeFile(filePath, JSON.stringify(store, null, 2), 'utf-8');
  return { indexed: documents.length, total: store.stats.docCount };
}

export async function getStats() {
  const filePath = config.indexDir + '/documents.json';
  try {
    const raw = await fs.readFile(filePath, 'utf-8');
    const store = JSON.parse(raw);
    return store.stats || { docCount: 0, termCount: 0 };
  } catch {
    return { docCount: 0, termCount: 0 };
  }
}
