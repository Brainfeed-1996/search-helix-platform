# Architecture — Search Helix

> Vue d'ensemble architecturale détaillée de la plateforme Search Helix.

## 1. Principes directeurs

L'architecture de Search Helix repose sur cinq principes non-négociables :

1. **Séparation des responsabilités** — chaque module a une raison d'être unique et des interfaces claires.
2. **Performance par défaut** — pas de "on optimisera plus tard" ; les chemins critiques sont conçus pour la latence et le throughput.
3. **Observabilité native** — le tracing, les métriques et les logs sont intégrés dès la conception.
4. **Extensibilité sans couture** — les abstractions (stockage, ranking, parsing) permettent de remplacer un sous-système sans réécrire l'application.
5. **Qualité mesurable** — chaque brique expose des métriques de qualité (pertinence, latence, fraîcheur).

---

## 2. Vue d'ensemble système

```
                      ┌─────────────────┐
                      │  Ingestion API  │
                      └────────┬────────┘
                               │ REST/gRPC
                      ┌────────▼────────┐
                      │ Ingest Service  │
                      │  - Parser       │
                      │  - Normalizer   │
                      │  - Stemmer      │
                      └────────┬────────┘
                               │
                      ┌────────▼────────┐
                      │  Tantivy Index  │
                      │  (Inverted Index)│
                      └────────┬────────┘
                               │
               ┌───────────────┼───────────────┐
               │               │               │
      ┌────────▼──────┐ ┌─────▼─────┐ ┌───────▼────────┐
      │ Query Parser  │ │ Ranking   │ │  Freshness     │
      │ + Analyzer    │ │ Engine    │ │  Manager       │
      └────────┬──────┘ └─────┬─────┘ └───────┬────────┘
               │               │               │
               │          ┌────▼─────┐         │
               │          │ WAND/BM25│         │
               │          └────┬─────┘         │
               │               │               │
               └───────────────┼───────────────┘
                               │
                      ┌────────▼────────┐
                      │  Search Results │
                      │  + Snippets     │
                      └────────┬────────┘
                               │
                      ┌────────▼────────┐
                      │  Diagnostics    │
                      │  - Latency      │
                      │  - Analytics    │
                      │  - A/B Testing  │
                      └─────────────────┘
```

---

## 3. Modèles de données

### 3.1 Document (modèle canonique)

```typescript
interface Document {
  id: string;                    // UUID v4, unique globalement
  title: string;                 // Titre indexé avec boost ×1.5
  body: string;                  // Corps de texte principal
  url?: string;                  // URL source (optionnelle)
  tags: string[];                // Tags indexés avec boost ×2.0
  lang?: "fr" | "en" | "mul";   // Langue (affecte le stemmer)
  freshness: number;             // Score [0..1] de fraîcheur manuel
  created_at: ISO8601;           // Timestamp de création
  updated_at: ISO8601;           // Timestamp de dernière mise à jour
  metadata: Record<string, any>; // Métadonnées arbitraires
}
```

### 3.2 QueryRequest

```typescript
interface QueryRequest {
  q: string;                     // Requête texte brut
  limit?: number;                // Nombre de résultats (défaut: 10)
  offset?: number;               // Pagination (défaut: 0)
  fields?: string[];             // Champs à interroger (title, body, tags)
  filters?: Record<string, any>; // Filtres (lang, tag, date range)
  sort?: "relevance" | "date";   // Tri
  facets?: boolean;              // Retourner les facettes
  highlight?: boolean;           // Activer le highlighting
  spellcheck?: boolean;          // Activer la correction orthographique
  session_id?: string;           // ID de session pour l'A/B testing
}
```

### 3.3 SearchResult

```typescript
interface SearchResult {
  id: string;
  score: number;                 // Score composite BM25 + boosts
  title: string;
  snippet: string;               // Extrait avec highlighting
  url?: string;
  highlights: string[];          // Terms matchés pour le surlignage
  facets?: Record<string, any>;  // Facettes agrégées
  explanation?: string;          // Explication du score (debug)
}
```

---

## 4. Flux d'ingestion

### 4.1 Pipeline pas-à-pas

```
1. Réception HTTP POST /index
   ↓
2. Validation du schéma (Zod)
   ↓
3. Détection du format source (JSON natif, CSV, PDF, HTML)
   ↓
4. Parsing + extraction de texte
   ↓
5. Normalisation
   - Tokenisation ASCII lowercase
   - Suppression stopwords (FR/EN)
   - Stemming (Porter/Snowball)
   - Nettoyage HTML/PDF artifacts
   ↓
6. Enrichissement
   - Calcul du vocabulaire
   - Détection de langue (lang)
   - Attribution de fraîcheur initiale
   ↓
7. Écriture Tantivy
   - open_or_create sur le dossier d'index
   - upsert par document (delete + insert)
   - commit tous les 500 docs ou 100ms
   ↓
8. Flush asynchrone (toutes les 30s)
   ↓
9. Mise à jour des métriques (doc_count, term_count, avg_doc_len)
   ↓
10. Retour HTTP 202 Accepted + stats
```

### 4.2 Gestion de la fraîcheur

- **TTL par document** : 30 jours par défaut (configurable)
- **Scoring temporel** : `freshness_decay(updated_at) = 1 / (1 + age_norm)`
- **Merge sélectif** : déclenché tous les 100 segments ou 5 GB
- **Indexation incrémentale** : pas de réindexation complète à chaque mise à jour

---

## 5. Flux de requête

```
1. Réception GET /search?q=...
   ↓
2. QueryAnalyzer.analyze(q)
   - Tokenisation + stopwords
   - Synonymes + expansion
   - Détection de langue
   ↓
3. Tantivy QueryParser
   - Construction de la requête Boolean/Boosting
   - Application des filtres (lang, tags, date)
   ↓
4. WAND Scorer (BM25)
   - Early termination pour performance
   - Calcul IDF + TF normalisé
   ↓
5. Application des boosts
   - title_boost ×1.5
   - tag_boost ×2.0
   - freshness_boost ×0.7..1.0
   ↓
6. Tri par score composite décroissant
   ↓
7. Faceting (si demandé)
   - Agrégation par tag, par langue
   ↓
8. Highlighting
   - Extraction de snippets avec contexte
   ↓
9. Diagnostic (toujours actif)
   - Enregistrement de la trace de requête
   - Mesure de latence P95/P99
   ↓
10. Retour JSON { query, results, took_ms, facets }
```

---

## 6. Sous-systèmes principaux

### 6.1 IngestService (backend/src/services/index.ts)

Responsabilités :
- Réception et validation des documents
- Orchestration du parsing multi-format
- Écriture atomique dans Tantivy
- Gestion des erreurs et retry

Interfaces :
```typescript
interface IngestService {
  indexDocuments(docs: Document[]): Promise<IndexResult>;
  deleteDocument(id: string): Promise<void>;
  flush(): Promise<void>;
  getStats(): Promise<IndexStats>;
}
```

### 6.2 SearchService (backend/src/services/search.ts)

Responsabilités :
- Analyse de requête (tokenization, synonymes, fuzzy)
- Exécution de la recherche Tantivy
- Calcul des scores BM25 + boosts
- Formatage des résultats

```typescript
interface SearchService {
  search(req: QueryRequest): Promise<SearchResult[]>;
  suggest(query: string): Promise<string[]>;
  explain(query: string, docId: string): Promise<ScoreExplanation>;
}
```

### 6.3 RankingEngine (backend/ranking.rs)

Responsabilités :
- Calcul BM25 avec paramètres k1=1.2, b=0.75
- Application des boosts champ/fraîcheur
- WAND/Block-Max WAND pour performance
- Normalisation des scores

### 6.4 FreshnessManager (backend/freshness.rs)

Responsabilités :
- Gestion des TTL par document
- Calcul du score de fraîcheur
- Planification des merges sélectifs
- Nettoyage des documents expirés

---

## 7. Invariants système

Ces règles ne doivent jamais être violées :

1. **Idempotence** : `POST /index` avec le même `id` ne crée pas de doublon
2. **Atomicité** : un commit Tantivy est atomique (tous les docs d'un batch sont visibles ou aucun)
3. **Ordre des résultats** : pour une requête donnée sans changement d'index, l'ordre des résultats est stable
4. **Isolation** : les lectures ne bloquent pas les écritures (MVCC via Tantivy)
5. **Traçabilité** : toute requête est tracée avec son `query_id` et sa latence
6. **Pas de données sensibles** : aucun secret n'est logué (pas de tokens, pas de clés API)

---

## 8. Choix techniques justifiés

### 8.1 Pourquoi Tantivy ?

- Moteur Lucene-like en Rust : sécurité mémoire, performance native
- Index inversé compressé (FST + Variable Bytes)
- BM25 implémenté et optimisé dans la bibliothèque
- Pas de dépendance JVM (contrairement à Lucene/Elasticsearch)

### 8.2 Pourquoi Rust pour le backend ?

- Latence P95 < 50ms sur des corpus de taille moyenne
- Coût de déploiement minimal (binaire statique)
-Écosystème IR mature : `tantivy`, `levenshtein`, `regex`, `unicode-normalization`

### 8.3 Pourquoi Next.js pour le frontend ?

- SSR/SSG pour le SEO de la landing page
- App Router pour le dashboard avec RSC
- Écosystème React riche : Recharts (graphiques), Framer Motion (animations)
- DX exceptionnelle : hot reload, type safety TypeScript

### 8.4 Pourquoi un stockage fichier d'abord ?

- Simplicité de déploiement (pas de service externe requis pour le MVP)
- Performance LBA acceptable pour des corpus < 10M docs
- Abstraction `StorageBackend` permettant de migrer vers S3/Redis sans réécriture

---

## 9. Performances cibles

| Opération | Charge | Latence cible | Throughput cible |
|-----------|--------|---------------|------------------|
| `/search` simple | 1 doc | < 50ms | > 1000 req/s |
| `/search` avec facets | 1 doc | < 80ms | > 500 req/s |
| `/index` bulk | 100k docs | < 30s | > 3000 docs/s |
| `/index/stats` | 1 req | < 5ms | > 2000 req/s |

---

## 10. Sécurité

- **CORS** : configurable, désactivé par défaut en production
- **Rate limiting** : 100 req/s par IP (à venir v1.0)
- **Validation** : schémas Zod côté frontend, validation stricte côté backend
- **Secrets** : uniquement via variables d'environnement, jamais en dur
- **Logs** : sanitized (pas de PII, pas de secrets)
