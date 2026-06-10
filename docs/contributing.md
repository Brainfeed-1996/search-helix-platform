# Contributing — Search Helix

Merci de vouloir contribuer à Search Helix. Ce document définit les règles pour maintenir la qualité et la cohérence du projet.

## 1. Workflow Git

### Branches
- `main` : production, toujours déployable
- `develop` : intégration continue
- `feature/*` : fonctionnalités isolées
- `fix/*` : corrections de bugs
- `docs/*` : documentation

### Conventional Commits
Format : `<type>(<scope>): <description>`

Types autorisés :
- `feat` : nouvelle fonctionnalité
- `fix` : correction de bug
- `docs` : documentation uniquement
- `refactor` : refactoring sans changement de comportement
- `perf` : amélioration des performances
- `test` : ajout/modification de tests
- `chore` : maintenance (deps, config)

Exemples :
```
feat(ranking): implement BM25 with freshness boost
fix(index): handle empty document body gracefully
docs(api): add curl examples for /search endpoint
```

## 2. Standards de code

### Backend (Rust)
- Formatage : `cargo fmt`
- Lint : `cargo clippy -- -D warnings`
- Tests : `cargo test --all-features`
- Couverture cible : > 80%

### Frontend (TypeScript/Next.js)
- Linter : ESLint + Prettier
- Tests : Vitest
- Typecheck : `tsc --noEmit`
- Accessibility : respect des normes WCAG 2.1 AA

## 3. Pull Requests

### Checklist avant ouverture
- [ ] `npm run lint` passe
- [ ] `npm run typecheck` passe
- [ ] `npm test` passe
- [ ] La documentation est à jour
- [ ] Un test d'intégration couvre le cas nominal

### Template
```markdown
## Résumé
<!-- 1-2 phrases -->

## Contexte
<!-- Pourquoi ce changement ? -->

## Changes
- 
- 

## Tests
<!-- Comment avez-vous testé ? -->

## Screenshots (si applicable)
```

## 4. Revue de code
- Au minimum 1 approbateur
- Les comments doivent être respectueux et constructifs
- Si un reviewer demande un changement, l'auteur doit valider explicitement

## 5. CI/CD
Chaque PR déclenche :
1. Lint (Rust + TS)
2. Typecheck
3. Tests unitaires + intégration
4. Build backend + frontend
5. (Optionnel) Benchmark automatique

## 6. Reporting de bugs
Merci d'utiliser le template GitHub Issues avec :
- Version de l'application
- Logs pertinents
- Étapes de reproduction
