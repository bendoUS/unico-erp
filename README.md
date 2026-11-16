# ERP transport et transit

Monorepo du produit (nom provisoire : voir `packages/brand/brand.json`).

- `apps/web` : l'ERP (Next.js), installable et prévu pour fonctionner hors réseau
- `apps/landing` : le site de présentation
- `apps/mobile` : l'app iOS et Android (Expo)
- `packages/brand` : nom et identité du produit, à modifier à un seul endroit

```bash
npm install          # une fois, à la racine
npm run dev          # ERP : http://localhost:3210
npm run dev:landing  # landing : http://localhost:3211
npm run dev:mobile   # app mobile
```

Choix techniques, hors ligne, déploiement : [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).
