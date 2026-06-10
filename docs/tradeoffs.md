# Trade-offs — Search Helix

## 1. Pertinence vs Latence

### Problème
Améliorer le ranking demande des calculs supplémentaires (boosts, fuzzy matching, ML), ce qui augmente la latence par requête.

### Décision
- **Path critique** : `/search` repose sur BM25 + boosts fixes (O(1) par terme). Latence cible < 50 ms.
- **Path avancé** : fuzzy matching + ML activables via query params. Latence cible < 120 ms (top-100 rerank).

### Mathématiques
Latence totale ≈ Σ (coût_token + coût_boost + coût_fetch)
- BM25 seul : ~15 ms
- Avec fuzzy + faceting : ~45 ms
- Avec cross-encoder top-100 : ~95 ms

## 2. Fraîcheur vs Throughput

### Problème
Maintenir un index à jour en temps réel réduit le débit d'indexation et complique les merges.

### Décision
- **TTL configurable** : 30j par défaut
- **Commit** : tous les 500 docs ou 100 ms (priorité fraîcheur)
- **Flush** : asynchrone toutes les 30s (priorité throughput)
- **Merge** : sélectif (100 segments ou 5 GB)

### Formule de fraîcheur
f(updated_at) = 1 / (1 + age_norm)
avec age_norm = min(age_days / 365, 1)

## 3. Stockage fichier vs Distribué

### Problème
Un stockage fichier limite le scaling horizontal mais simplifie l'exploitation.

### Décision
- **MVP** : stockage fichier (`./data/index`)
- **Abstraction** : trait `StorageBackend` permettant de migrer vers S3/Redis sans réécriture
- **Coût de migration** : < 2 semaines d'ingénierie

### Hypothèse CAP
- CP pendant l'écriture (atomicité via Tantivy)
- Disponibilité élevée en lecture (segments immuables)
