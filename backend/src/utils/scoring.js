
export function computeBm25(termFreq, docLen, avgDocLen, numDocs, docFreq) {
  const k1 = 1.2;
  const b = 0.75;
  if (numDocs === 0 || avgDocLen < 1) return 0;
  const idf = Math.log(((numDocs - docFreq + 0.5) / (docFreq + 0.5)) + 1);
  const tf = (termFreq * (k1 + 1)) / (termFreq + k1 * (1 - b + b * (docLen / avgDocLen)));
  return idf * tf;
}

export function freshnessDecay(updatedAt, maxAgeMs = 365 * 24 * 60 * 60 * 1000) {
  const age = Date.now() - new Date(updatedAt).getTime();
  if (age <= 0) return 1;
  const ageNorm = Math.min(age / maxAgeMs, 1);
  return 1 / (1 + ageNorm);
}
