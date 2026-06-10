#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const OUT = path.resolve(process.argv[2] || 'backend/data/seeder-dump.json');
const COUNT = Number(process.argv[3] || '100000');

fs.mkdirSync(path.dirname(OUT), { recursive: true });

const subjects = [
  'Plateforme API Search Helix',
  'Benchmarks Tantivy BM25',
  'Indexation streaming temps reel',
  'Diagnostic de pertinence',
  'Ranking et fraicheur adaptative',
  'Architecture multi-tenant scalable'
];
const suffixes = [
  'pour infrastructure de recherche',
  'de moteur de recherche hybride',
  'de scoring et de diagnostic',
  'avec stemming FR et EN'
];

const out = [];
for (let i = 0; i < COUNT; i++) {
  out.push({
    id: `doc-${String(i).padStart(7, '0')}`,
    title: subjects[i % subjects.length] + ' ' + suffixes[i % suffixes.length],
    body: 'Contenu demonstratif indexe dans Search Helix. Comporte des termes techniques autour de l information retrieval, Tantivy, BM25, ranking, diagnostics et ingestion.',
    url: `https://example.com/article/${i}`,
    tags: ['search', 'helix', 'index'],
    lang: i % 3 === 0 ? 'en' : 'fr',
    freshness: Math.random(),
    created_at: new Date(Date.now() - i * 60000).toISOString(),
    updated_at: new Date(Date.now() - i * 30000).toISOString(),
    metadata: { source: 'seeder' }
  });
}

fs.writeFileSync(OUT, JSON.stringify(out, null, 2), 'utf8');
console.log(`Seeder OK -> ${COUNT} documents dans ${OUT}`);
