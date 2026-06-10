# Roadmap — Search Helix

> Dernière mise à jour : 2026-06-10  
> Statut : MVP en cours d'implémentation

## Philosophie de la roadmap

La roadmap de Search Helix est structurée autour de trois axes stratégiques :

1. **Qualité de recherche mesurable** — chaque livraison s'accompagne de métriques de pertinence (nDCG@k, MAP, RMSE) et de performance (latence P95/P99, throughput).
2. **Extensibilité industrielle** — l'architecture est conçue pour absorber des charges croissantes sans réécriture majeure (abstractions de stockage, moteurs de ranking pluggables, couches d'indexation modulaires).
3. **Transparence démonstrative** — le code, les tests et la documentation sont exposés publiquement pour servir de preuve technique dans un contexte de recrutement.

## Vue d'ensemble par version

| Version | Objectif principal | Livraison cible | Metric cible |
|---------|-------------------|-----------------|--------------|
| **MVP** | Squelette fonctionnel indexation + recherche | Semaine 4 | `/search` < 50ms @ 10k docs |
| **v1.0** | Pertinence production-ready | Semaine 10 | nDCG@10 > 0.85 |
| **v2.0** | Recherche hybride + ML | Semaine 18 | nDCG@10 > 0.92 |
| **v3.0** | Scaling distribué | Semestre 2 | 10M docs, P95 < 100ms |

---

## Phase 0 — Fondations (Semaines 1-2)

### Objectifs
- Disposer d'un monorepo propre, typé, testé et prêt à être montré en entretien.
- Disposer d'un environnement de développement reproductible (scripts de setup, Docker Compose, CI).

### Livrables techniques
- **Monorepo** : structure `backend/`, `frontend/`, `docs/`, `scripts/`, `tests/`
- **Langages** : Rust (backend), TypeScript (frontend)
- **Build** : `Cargo.toml`, `package.json` racine avec workspaces, scripts `dev`, `build`, `test`, `lint`
- **CI/CD** : GitHub Actions avec jobs `lint`, `test`, `build`
- **Docker** : `Dockerfile.backend`, `Dockerfile.frontend`, `docker-compose.yml`
- **Scripts** : `scripts/setup.sh` (Unix), `scripts/setup.ps1` (Windows), `scripts/seed.js` (peuplement d'index)
- **Git** : `.gitignore` strict, conventional commits, branches `main` / `develop` / `feature/*`

### Critères d'acceptation
- `npm run lint` passe sans erreur
- `npm run test` couvre > 60% du code上古
- `docker compose up` démarre backend + frontend en < 2min
- Le README permet à un ingénieur externe de lancer le projet en < 10min

---

## Phase 1 — MVP : Indexation + Recherche (Semaines 3-6)

### 1.1 Pipeline d'ingestion (Semaines 3-4)

#### Entrées supportées
- **JSON** : documents structurés avec champs `id`, `title`, `body`, `url`, `tags`, `lang`, `freshness`, `created_at`, `updated_at`
- **CSV** : détection automatique du séparateur, mapping de colonnes, gestion des valeurs manquantes
- **PDF** : extraction via `pdf-extract`, tokenisation, préservation de la structure de paragraphe
- **Web** : crawling HTTP(S) avec `reqwest`, respect de `robots.txt`, throttling, extraction `<title>` + `<body>`

#### Pipeline d'indexation Tantivy
```
Document brut
    │
    ▼
[Parser + Normalizer]
    │  - Tokenisation ASCII lowercase
    │  - Suppression stopwords FR/EN
    │  - Stemming (Porter pour EN, Snowball FR)
    │  - Préservation de la casse pour les champs titre/URL
    ▼
[Vocabulary Manager]
    │  - Comptage de fréquences (term_freq, doc_freq)
    │  - Gestion de la mémoire (FST compressé)
    ▼
[Tantivy Index Writer]
    │  - `merge_segments = true` (stratégie par taille)
    │  - `commit_every = 500 documents` ou `100ms`
    ▼
[Index Segment] ──▶ [Merger] ──▶ [Index final]
```

#### Implémentations clés
- **`indexing.rs`** : module Tantivy avec `open_or_create`, `upsert`, `delete`, `flush`, `close`
- **Gestion de la fraîcheur** : TTL par document (`freshness` = 0..1), pondération dynamique
- **Persistance** : stockage fichiers (`./data/index`), abstraction `StorageBackend` pour futur S3/Redis

#### Tests
- Tests unitaires du parser multi-format (proptest)
- Test d'intégration : indexer 100k docs, vérifier `doc_count`, `term_count`
- Benchmark : 100k docs en < 30s (matériel : CPU 8c, 32 GB RAM, SSD NVMe)

---

### 1.2 Moteur de ranking (Semaines 4-5)

#### BM25 (Best Matching 25)
Implémentation fidèle à la spécification Lucene :

```
IDF(t) = ln( (N - df(t) + 0.5) / (df(t) + 0.5) + 1 )

TF(t,d) = (tf(t,d) * (k1 + 1)) / (tf(t,d) + k1 * (1 - b + b * (|d| / avgdl)))
```

Où :
- `N` = nombre total de documents dans l'index
- `df(t)` = nombre de documents contenant le terme `t`
- `tf(t,d)` = fréquence du terme `t` dans le document `d`
- `|d|` = longueur du document `d` (en tokens)
- `avgdl` = longueur moyenne des documents du corpus
- `k1 = 1.2` (paramètre de saturation TF)
- `b = 0.75` (paramètre de normalisation de longueur)

#### Boosts
| Boost | Facteur | Description |
|-------|---------|-------------|
| `title_boost` | ×1.5 | Les termes dans le titre comptent 1.5× plus |
| `tag_boost` | ×2.0 | Correspondance sur un tag = double poids |
| `freshness_boost` | ×0.7..1.0 | Linéaire entre document frais (1.0) et vieux d'1 an (0.7) |

#### Architecture du ranking
```
Query tokens ──▶ BM25 scorer ──▶ Boosts ──▶ Normalisation ──▶ Top-K
                  │
                  ├─ WAND (Weak AND) pour l'early termination
                  └─ Block-Max WAND pour le ranking approximatif top-K
```

#### Tests unitaires
- Corpus de test fixe (100 docs, requêtes golden set)
- Vérification que `rank("voiture")` place `doc-001` (qui contient "voiture" dans le titre) avant `doc-002` (qui contient "voiture" dans le corps)
- Rejeu de benchmarks publiques (Robust04, MS MARCO) pour comparaison

---

### 1.3 Couche de requêtes (Semaines 5-6)

#### QueryAnalyzer
1. **Tokénisation** : lowercase ASCII, suppression des caractères non-alphanumériques
2. **Stopwords** : liste FR (`le`, `la`, `les`, `de`, `du`, `des`, `un`, `une`, `et`, `ou`...) + EN (`the`, `a`, `an`, `is`, `in`, `on`...)
3. **Synonymes** : dictionnaire statique extensible (ex: `voiture ↔ automobile ↔ véhicule`)
4. **Expansion** : union des tokens originaux + synonymes
5. **Fuzzy matching** : distance de Levenshtein (seuil 2), alimentée par le vocabulaire de l'index

#### Faceting
- Agrégation par `tags` (terme exact)
- Agrégation par `lang` (fr / en / multilingual)
- Filtrage dynamique sans réindexation

#### Highlighting
- Extraction de `snippet` avec contexte autour des termes matchés
- Limitation à 180 caractères avec ellipsis

#### Tests
- Golden set de 50 requêtes avec résultats attendus
- Couverture > 85% sur `query.rs`

---

## Phase 2 — v1.0 : Pertinence Production-Ready (Semaines 7-12)

### 2.1 Fraîcheur adaptative (Semaine 7)

#### Objectif
Maintenir la pertinence des résultats sans réindexation complète lors de mises à jour fréquentes.

#### Stratégies
- **TTL par document** : 30 jours par défaut, configurable
- **Scoring temporel** : fonction exponentielle décroissante `f(t) = e^(-λ * age_days)`
- **Merge sélectif** : tous les 100 segments ou 5 GB, pour éviter la fragmentation
- **Indexation incrémentale** : commit tous les 100ms ou 500 docs, flush toutes les 30s

#### Métriques
- Fraîcheur moyenne pondérée > 0.7 sur un dataset de 1M docs
- Overhead d'indexation < 5% vs indexation batch classique

---

### 2.2 Diagnostics et observabilité (Semaines 8-10)

#### Search Analytics
- Traçage de chaque requête (`query_id`, `query`, `processing_ms`, `result_count`, `timestamp`)
- Stockage Sled (embeddé, synchrone) pour faible latence d'écriture

#### Métriques de latence
- Calcul P50, P95, P99 à la volée sur fenêtre glissante de 5min
- Export vers OpenTelemetry (OTLP gRPC) pour intégration Prometheus/Grafana

#### A/B Testing intégré
- Buckets hashés (`session_id` → bucket_id)
- Comparaison de deux configurations de ranking (ex: BM25 vs BM25+ML)
- Métriques : CTR (click-through rate), nDCG@10 par bucket

#### Dashboard temps réel
- Recharts : sparklines latence, histogrammes de scores, diagrammes de type "query throughput"
- Rafraîchissement : 1s via WebSocket (axum `ws` feature)

#### Tests
- Simulation de charge : 1000 req/s pendant 10min, stabilité P95 < 100ms
- Validation de l'A/B testing : split 50/50, χ² test sur les buckets

---

### 2.3 Évaluation de pertinence (Semaines 10-12)

#### Packs de test
- **Pack FR** : actualité, technique, juridique (100 requêtes, jugements humains)
- **Pack EN** : documentation produit, e-commerce (100 requêtes)
- **Pack multilingue** : FR/EN mélangés (50 requêtes)

#### Métriques calculées
- **nDCG@k** (k = 1, 3, 5, 10) : normalisé sur les gains de pertinence
- **MAP** (Mean Average Precision) : précision moyenne par requête
- **RMSE** sur les scores de pertinence

#### Cibles v1.0
| Métrique | Cible | Baseline (BM25 seul) |
|----------|-------|----------------------|
| nDCG@10 | > 0.85 | ~0.72 |
| MAP | > 0.78 | ~0.65 |
| P95 latence | < 50ms | < 45ms |

---

## Phase 3 — v2.0 : Recherche Hybride + ML (Semaines 13-18)

### 3.1 Recherche hybride sparse/dense (Semaines 13-15)

#### Composants
- **Sparse retriever** : BM25 Tantivy (déjà implémenté)
- **Dense retriever** : embeddings pré-calculés (ex: `intfloat/multilingual-e5-small`)
- **Fusion** : Reciprocal Rank Fusion (RRF) ou Linear Fusion avec poids appris

#### Architecture
```
Query ──▶ Tokenizer ──▶ Sparse (BM25) ──┐
                                          ├─▶ RRF/Linear ──▶ Top-K final
Query ──▶ Embedder ──▶ Dense (ANN) ─────┘
```

#### Contraintes
- Embeddings stockés dans un fichier plat + index Faites (HNSW)
- Latence totale < 100ms (génération d'embedding incluse)

---

### 3.2 Réordonnancement ML (Semaines 15-17)

#### Cross-Encoder léger
- Modèle pré-entraîné (ex: `cross-encoder/ms-marco-MiniLM-L-6-v2`)
- Réordonnancement du top-100 BM25 vers top-20
- Inférence via ONNX Runtime (Rust `ort` crate)

#### Gain attendu
- nDCG@10 : +5 à +10 points vs BM25 seul

---

### 3.3 A/B Testing & Feature Flags (Semaine 18)

- Système de flags dynamiques (pourcentage de trafic, rollout progressif)
- Intégration avec le module de diagnostics existant
- Interface d'administration pour lancer des experiments sans déployer

---

## Phase 4 — v3.0 : Scaling Distribué (Semestre 2)

### 4.1 Architecture distribuée

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Ingest Node │────▶│  Index Node │────▶│  Query Node │
│   (Writer)   │     │   (Shard 0) │     │   (Router)  │
└─────────────┘     └─────────────┘     └─────────────┘
                          ▲                  ▲
                          │                  │
                    ┌─────────────┐    ┌─────────────┐
                    │  Index Node │    │  Cache Node │
                    │   (Shard 1) │    │   (Redis)   │
                    └─────────────┘    └─────────────┘
```

### 4.2 Sharding
- Sharding par `lang` (fr / en / multilingue) ou par hash de `id`
- Réplication asynchrone entre shards
- Rééquilibrage automatique lors de l'ajout de nœuds

### 4.3 Cache distribué
- Redis pour les requêtes fréquentes (cache de résultats)
- TTL adaptatif selon la fraîcheur des documents
- Invalidation sur mise à jour d'index

### 4.4 Cibles
- 10M documents indexés
- 1000 req/s soutenues
- P95 latence < 100ms
- Disponibilité 99.9%

---

## Phase 5 — Écosystème et Plateformisation (Semestre 2 bis)

### 5.1 SDKs
- **Python** : client d'indexation et de recherche
- **Go** : client léger pour microservices
- **CLI** : `search-helix` en Rust pour l'administration

### 5.2 Connecteurs
- **WordPress / Shopify** : plugins de synchronisation d'index
- **Elasticsearch / OpenSearch** : connecteur de migration
- **S3 / GCS / Azure Blob** : stockage objet natif

### 5.3 Observabilité avancée
- Alerting PagerDuty / Slack sur anomalies de latence
- Traces distribuées Jaeger / Grafana Tempo
- profiling des requêtes lentes (> 200ms)

---

## Annexe : Indicateurs de suivi

### Health metrics (checkées chaque sprint)

| Indicateur | Fréquence | Responsable | Seuil d'alerte |
|-----------|-----------|-------------|----------------|
| P95 latence recherche | Continue | Backend | > 100ms |
| Taux d'erreur 5xx | Continue | Backend | > 0.1% |
| Temps d'indexation 100k docs | Par release | Backend | > 30s |
| Coverage tests | Par PR | Tous | < 80% |
| Lighthouse score frontend | Par release | Frontend | < 90 |
| nDCG@10 | Par release | ML/IR | < 0.80 |

### Definition of Done (DoD)

Une story est considérée comme terminée lorsque :

1. Le code est implémenté et reviewé (≥ 1 reviewer)
2. Les tests unitaires passent (couverture maintenue)
3. Les tests d'intégration passent
4. La documentation est à jour (`.md` concernés)
5. Le CI passe (lint + typecheck + test + build)
6. La feature est déployable via `docker compose up`

---

## Notes de version

### MVP (actuel)
- Indexation Tantivy basique
- BM25 + boosts
- API REST `/health`, `/search`, `/index`, `/index/stats`
- UI Next.js landing page + dashboard
- Documentation FR splitée

### v1.0 (à venir)
- Fraîcheur adaptative + TTL
- Synonymes + fuzzy matching
- Faceting + highlighting
- Diagnostics temps réel + A/B testing

### v2.0 (à venir)
- Recherche hybride sparse/dense
- Cross-Encoder réordonnancement
- Feature flags + experiments
- Scaling horizontal + sharding
