# API Reference — Search Helix

Base URL : `http://localhost:8080`
Content-Type : `application/json`

## 1. Health

### `GET /health`
Retourne l'état de santé de l'API.

Réponse 200 :
```json
{
  "status": "ok",
  "version": "0.1.0",
  "timestamp": "2026-06-10T15:30:00Z"
}
```

## 2. Search

### `GET /search?q=<query>&limit=<n>`
Recherche plein-texte avec BM25 + boosts.

Paramètres :
- `q` (string, requis) : requête texte
- `limit` (int, optionnel, défaut 10) : nombre de résultats
- `offset` (int, optionnel, défaut 0) : pagination
- `facets` (bool, optionnel) : retourner les facettes
- `highlight` (bool, optionnel) : surligner les termes matchés

Exemple curl :
```bash
curl "http://localhost:8080/search?q=architecture+tantivy&limit=5&facets=true"
```

Réponse 200 :
```json
{
  "query": "architecture tantivy",
  "results": [
    {
      "id": "doc-001",
      "score": 12.34,
      "title": "Architecture de moteurs de recherche",
      "snippet": "...architecture... tantivy...",
      "url": "https://example.com/architecture",
      "highlights": ["architecture", "tantivy"]
    }
  ],
  "took_ms": 18,
  "facets": {
    "lang": { "fr": 45, "en": 12 },
    "tags": { "rust": 30, "search": 25 }
  }
}
```

## 3. Indexation

### `POST /index`
Indexe un batch de documents.

 Corps :
```json
{
  "documents": [
    {
      "id": "doc-001",
      "title": "Titre",
      "body": "Corps du document",
      "url": "https://...",
      "tags": ["rust", "search"],
      "lang": "fr",
      "freshness": 1.0,
      "created_at": "2026-06-10T00:00:00Z",
      "updated_at": "2026-06-10T00:00:00Z",
      "metadata": {}
    }
  ]
}
```

Réponse 202 :
```json
{
  "indexed": 1,
  "total": 1001,
  "took_ms": 12
}
```

### `GET /index/stats`
Statistiques de l'index.

Réponse 200 :
```json
{
  "doc_count": 1000,
  "term_count": 15234,
  "size_bytes": 2048000,
  "last_indexed": "2026-06-10T15:28:00Z",
  "avg_latency_ms": 4.2,
  "p95_latency_ms": 12.1,
  "p99_latency_ms": 18.7
}
```

## 4. Codes d'erreur

| Code | Signification |
|------|---------------|
| `INVALID_REQUEST` | Corps de requête mal formé |
| `NOT_FOUND` | Document ou ressource inexistante |
| `INDEX_ERROR` | Erreur d'écriture dans Tantivy |
| `INTERNAL` | Erreur serveur non prévue |
