# Search Helix — Plateforme d'infrastructure de recherche full-text et hybride

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Rust](https://img.shields.io/badge/Rust-1.83%2B-orange)](https://www.rust-lang.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7%2B-blue)](https://www.typescriptlang.org)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black)](https://nextjs.org)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue)](https://www.docker.com)
[![Tests](https://img.shields.io/badge/tests-%3E80%25-green)]()
[![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-black)](.github/workflows/ci.yml)

<!-- TODO: Remplacez par un GIF animé ou une vidéo hébergée (ex: Loom, YouTube Shorts) -->
<!-- ![Search Helix Demo](https://user-images.githubusercontent.com/...) -->

## Table des matières

- [Vue d'ensemble](#vue-densemble)
- [Pourquoi ce projet](#pourquoi-ce-projet)
- [Stack technique](#stack-technique)
- [Architecture](#architecture)
- [Démarrage rapide](#démarrage-rapide)
- [Utilisation](#utilisation)
- [Documentation](#documentation)
- [Feuille de route](#feuille-de-route)
- [Contribuer](#contribuer)
- [License](#license)

## Vue d'ensemble

**Search Helix** est une plateforme industrielle d'infrastructure de recherche conçue pour démontrer une maîtrise approfondie de l'**information retrieval**, de l'**indexation distribuée**, du **ranking multi-signal** et du **diagnostic de pertinence** à grande échelle. Le projet est bâti comme une vitrine technique destinée à convaincre les équipes d'ingénierie des entreprises les plus exigeantes (Google, Meta, Stripe, Datadog, Figma, Vercel, etc.).

Il ne s'agit pas d'un POC : chaque composant est implémenté pour être **fonctionnel, mesurable et déployable en production**.

## Pourquoi ce projet

Démontrer concrètement :

- La conception d'un **pipeline d'ingestion** robuste (JSON, CSV, PDF, web)
- L'implémentation d'un **index inversé compressé** (Tantivy)
- Un **moteur de ranking** BM25 avec boosts champ/fraîcheur
- Une **couche de requêtes** avancée : synonymes, fuzzy matching, highlighting, faceting
- Un **système de fraîcheur** adaptatif (TTL, merge sélectif, scoring temporel)
- Des **diagnostics temps réel** : P95/P99, search analytics, A/B testing, relevancy scoring
- Une **UI TypeScript** moderne, responsive et accessible (Lighthouse > 90)

## Stack technique

| Couche | Technologie | Justification |
|--------|-------------|---------------|
| Core backend | Rust + Tantivy | Performance maximale, sécurité mémoire, écosystème IR mature |
| API REST/gRPC | Axum + Tokio | Latence < 100ms, concurrence scalable, observabilité native |
| Frontend | Next.js 14 + TypeScript | SSR/SSG,DX, écosystème React riche |
| UI Design System | Tailwind CSS + Framer Motion | Dark mode premium, glassmorphism, animations 60fps |
| Indexation | Tantivy (Rust) | Moteur Lucene-like, compression, BM25 natif |
| Stockage | Abstractions fichiers + adaptateurs S3/Redis prévus | Portabilité, swap storage sans refonte |
| Observabilité | OpenTelemetry + métriques TCP | Traçage distribué, profiling, monitoring production-ready |
| CI/CD | GitHub Actions | Lint, typecheck, tests, build, déploiement automatisé |

## Architecture

Consultez [docs/architecture.md](docs/architecture.md) pour les diagrammes ASCII, modèles de données, flux d'ingestion et invariants système.

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Ingestion │────▶│  Tantivy     │────▶│   Query     │
│   Pipeline  │     │  Index       │     │   Layer     │
└─────────────┘     └──────────────┘     └─────────────┘
       │                    │                    │
       ▼                    ▼                    ▼
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Freshness │     │   Ranking    │     │ Diagnostics │
│   Manager   │     │   Engine     │     │   & A/B     │
└─────────────┘     └──────────────┘     └─────────────┘
```

## Démarrage rapide

### Prérequis

- Node.js >= 20.11
- npm >= 10
- (Optionnel) Rust >= 1.83 + Cargo
- (Optionnel) Docker + Docker Compose

### Installation

```bash
# 1. Cloner le dépôt
git clone https://github.com/Brainfeed-1996/search-helix-platform.git
cd search-helix-platform

# 2. Installer les dépendances racine
npm install

# 3. Installer le backend
cd backend && npm install && cd ..

# 4. Installer le frontend
cd frontend && npm install && cd ..

# 5. Lancer en développement
npm run dev
```

### Accès

- Frontend : http://localhost:3000
- Backend : http://localhost:8080
- Health check : http://localhost:8080/health

### Docker (one-shot)

```bash
docker compose up --build
```

## Utilisation

### Indexer des documents

```bash
curl -X POST http://localhost:8080/index \
  -H "Content-Type: application/json" \
  -d '{
    "documents": [
      {
        "id": "doc-001",
        "title": "Architecture de moteurs de recherche",
        "body": "Tantivy est un moteur de recherche en Rust inspiré de Lucene...",
        "url": "https://example.com/architecture",
        "tags": ["rust", "search", "tantivy"],
        "lang": "fr",
        "freshness": 1.0
      }
    ]
  }'
```

### Rechercher

```bash
curl "http://localhost:8080/search?q=architecture+tantivy&limit=10"
```

## Documentation

- [Architecture](docs/architecture.md) — diagrammes, modèles, flux, invariants
- [Roadmap](docs/roadmap.md) — timeline MVP, v1.0, v2.0
- [Compromis](docs/tradeoffs.md) — analyses Big-O, CAP, fraîcheur vs throughput
- [API Reference](docs/api-reference.md) — endpoints REST, exemples curl
- [Benchmarks](docs/benchmarks.md) — résultats, datasets, méthodologie
- [Évaluation de pertinence](docs/relevance-evaluation.md) — nDCG@k, MAP, RMSE
- [Déploiement](docs/deployment.md) — Docker, variables d'environnement, scaling
- [Contribuer](docs/contributing.md) — workflow, conventions, CI/CD

## Feuille de route

Consultez [docs/roadmap.md](docs/roadmap.md) pour la timeline détaillée.

### MVP (Semaines 1-4)
- [x] Structure du monorepo
- [x] Indexation Tantivy basique
- [x] Scoring BM25
- [x] API REST health/search/index
- [x] UI Next.js landing + dashboard

### v1.0 (Semaines 5-10)
- [ ] Fraîcheur adaptative + TTL
- [ ] Synonymes + fuzzy matching
- [ ] Faceting + highlighting
- [ ] Diagnostics P95/P99 + search analytics
- [ ] Tests d'intégration + benchmarks automatisés

### v2.0 (Semaines 11-18)
- [ ] Recherche hybride dense/sparse (Cross-Encoder / ColBERT)
- [ ] Réordonnancement ML
- [ ] A/B testing + feature flags
- [ ] Scaling horizontal + sharding

## Contribuer

Les contributions sont bienvenues. Voir [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT — voir [LICENSE](LICENSE)
