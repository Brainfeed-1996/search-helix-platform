export function tokenize(text) {
 if (!text) return [];
 return text
  .toLowerCase()
  .replace(/[^a-z0-9\\u00C0-\\u024F]+/g, ' ')
  .split('\\s+')
  .filter(Boolean);
}

export function removeStopwords(tokens) {
 const stop = new Set(['le','la','les','un','une','des','de','du','au','aux','et','ou','mais','donc','or','ni','car','the','a','an','is','are','was','were','in','on','at']);
 return tokens.filter(t => !stop.has(t));
}

export function parseQuery(text) {
 const tokens = removeStopwords(tokenize(text));
 return tokens.slice(0, 32);
}
