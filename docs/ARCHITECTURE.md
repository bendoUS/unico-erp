# Architecture

Ce document décrit comment le produit est organisé et les choix techniques retenus.
Le nom affiché du produit vient de `packages/brand/brand.json` (aujourd'hui « Unico »).

## 1. Organisation du dépôt

```
apps/
  web/       ERP (Next.js). Installable (PWA), fonctionne hors réseau.
  landing/   Site de présentation (Next.js), déployé à part.
  mobile/    App iOS et Android (Expo, React Native).
packages/
  brand/     Nom, slogan, identifiant d'app, couleurs, WhatsApp.
docs/        Documentation, dont le brief d'origine.
```

Un seul `npm install` à la racine installe tout (workspaces npm).

| Commande | Effet |
|---|---|
| `npm run dev` | ERP sur http://localhost:3210 |
| `npm run dev:landing` | Landing sur http://localhost:3211 |
| `npm run dev:mobile` | App mobile (Expo Go ou simulateur) |
| `npm run build` | Compile l'ERP et la landing |

## 2. Renommer le produit

Modifier `packages/brand/brand.json`, rien d'autre. Le menu, les titres de pages, la landing,
le lien WhatsApp et la configuration de l'app mobile lisent ce fichier.

Exception : `appId` (identifiant iOS et Android) ne peut plus changer une fois l'app publiée
sur un store. Il faut le fixer avant la première publication.

## 3. Hors réseau puis synchronisation

Objectif : pendant une coupure, on continue à saisir (voyages, dépenses, reçus, factures).
Au retour du réseau, tout part vers le serveur et les données des autres arrivent.

### Choix

- **Base centrale : Supabase, offre gratuite.** Postgres, comptes utilisateurs, stockage des
  photos de reçus. Limite à connaître : un projet gratuit est mis en pause après une semaine
  sans activité. À surveiller avant la mise en production.
- **Synchronisation : PowerSync Open Edition, auto-hébergé.** Gratuit, mais il faut une machine
  allumée en permanence pour le faire tourner (conteneur Docker). Options : une VM gratuite
  Oracle Cloud « Always Free », ou un petit VPS (environ 5 $ par mois). Licence FSL : usage
  libre pour notre produit, interdiction de revendre PowerSync lui-même.
- **Sur chaque appareil : une base SQLite locale.** Dans le navigateur (web, PWA) comme sur
  mobile. L'interface lit et écrit toujours en local, donc elle reste rapide et marche sans
  réseau.

### Fonctionnement

1. Chaque écriture va d'abord dans la base locale, puis dans une file d'envoi.
2. Quand le réseau revient, la file est envoyée à notre API, qui valide et écrit dans Postgres.
3. PowerSync renvoie à chaque appareil les données qui le concernent (selon son rôle).

### Règles

- Identifiants générés sur l'appareil (UUID), jamais par le serveur, pour créer hors ligne.
- Conflits : la dernière modification gagne, champ par champ. Exceptions validées côté serveur :
  numéros de factures (attribués au moment de la synchronisation), montants déjà encaissés,
  plaques (permission spéciale).
- Photos de reçus : gardées sur l'appareil, envoyées au retour du réseau.
- Un bandeau indique l'état : « Hors ligne, 3 modifications en attente ».

## 4. Installation sur ordinateur

- **Maintenant : PWA.** Sur Windows (Edge, Chrome) et Mac (Chrome, Edge, Safari « Ajouter au
  Dock »), l'ERP s'installe comme une application, avec son icône, et marche hors réseau.
  Aucune compilation.
- **Ensuite : vrais installateurs `.exe` et `.dmg` avec Tauri.**
  - `.dmg` (Mac) : compilé sur le Mac, gratuit.
  - `.exe` (Windows) : compilé par GitHub Actions sur une machine Windows dans le cloud.
    Gratuit si le dépôt est public. Dépôt privé : inclus dans le quota mensuel gratuit de
    GitHub (largement suffisant pour quelques compilations par semaine).
  - Pour éviter l'alerte « éditeur inconnu » de Windows, il faudra un jour un certificat de
    signature de code (payant).

## 5. Mobile

- **Android en priorité.**
  - Développement et compilation possibles sur le Mac, gratuitement (Android Studio).
  - Distribution directe d'un fichier `.apk` aux clients possible sans store.
  - Google Play : compte développeur à 25 $, payé une seule fois.
- **iOS ensuite.**
  - Publication possible depuis le compte Apple Developer d'un tiers.
  - Transfert ultérieur vers notre propre compte possible depuis App Store Connect (« Transférer
    l'app »), sans retirer l'app du store, en gardant notes et avis. Conditions : l'app doit
    avoir au moins une version validée, aucune version en attente de validation, et les deux
    comptes doivent avoir accepté les contrats Apple en cours.
  - L'identifiant `appId` doit être réservé sur le compte qui publie : à choisir définitivement
    avant.
- Compilations dans le cloud possibles avec EAS Build (Expo), qui a une offre gratuite limitée.

## 6. Déploiement web (Vercel)

Deux projets Vercel sur le même dépôt GitHub :

| Projet | Root Directory | Variables |
|---|---|---|
| ERP | `apps/web` | (aucune pour l'instant) |
| Landing | `apps/landing` | `NEXT_PUBLIC_APP_URL` = adresse publique de l'ERP |

## 7. À traiter

- `npm audit` signale une faille critique dans `maplibre-gl` (carte). La mise à jour change de
  version majeure : à faire et tester séparément.
- Les données de l'ERP sont encore des données de démonstration en mémoire. Prochaine étape :
  schéma Postgres, puis branchement de la base locale et de la synchronisation.
