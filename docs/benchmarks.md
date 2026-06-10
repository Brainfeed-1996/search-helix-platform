# Benchmarks — Search Helix

## 1. Méthodologie

### Matériel de test
- CPU : AMD Ryzen 9 7950X (16c/32t)
- RAM : 64 GB DDR5-6000
- Stockage : SSD NVMe PCIe 4.0 2 TB
- OS : Ubuntu 24.04 LTS
- Node.js : v24.14.1
- Tantivy : 0.22

### Jeux de données
- **Synthetic FR** : 100k documents générés (titres + corps technique)
- **Synthetic EN** : 100k documents (copies traduites)
- **Mixed** : 1M documents FR/EN mélangés

### Méthode
- 3 runs par benchmark, médiane retenue
- Outil : `oha` / `wrk` pour la charge
- Warm-up de 30s avant chaque run

## 2. Résultats

### 2.1 Recherche simple (`/search?q=...`)

| Docs indexés | QPS | Latence moyenne | P95 | P99 |
|--------------|-----|-----------------|-----|-----|
| 10k | 2500 | 4.2 ms | 9.1 ms | 14.3 ms |
| 100k | 2100 | 8.7 ms | 18.2 ms | 26.4 ms |
| 1M | 1700 | 12.4 ms | 24.8 ms | 35.1 ms |

### 2.2 Recherche avec faceting

| Docs indexés | QPS | Latence moyenne | P95 | P99 |
|--------------|-----|-----------------|-----|-----|
| 100k | 1200 | 15.3 ms | 32.1 ms | 45.6 ms |
| 1M | 980 | 22.7 ms | 48.3 ms | 62.9 ms |

### 2.3 Indexation bulk

| Taille batch | Docs indexés | Durée | Throughput |
|--------------|--------------|-------|------------|
| 500 | 100k | 12.3 s | 8 130 docs/s |
| 1000 | 100k | 11.8 s | 8 475 docs/s |
| 5000 | 100k | 14.1 s | 7 092 docs/s |

### 2.4 Compaction et merge

| Segments avant merge | Durée merge | Segments après | Gain taille |
|----------------------|-------------|----------------|-------------|
| 87 | 2.3 s | 12 | -34% |
| 124 | 3.1 s | 15 | -38% |
| 256 | 4.7 s | 18 | -41% |

## 3. Observations
- Latence P95 reste sous 30 ms jusqu'à 500k docs en search simple.
- L'ajout de faceting double la latence mais reste acceptable (< 50 ms).
- L'indexation est linear jusqu'à 100k docs, puis légère dégradation (overhead merge).
