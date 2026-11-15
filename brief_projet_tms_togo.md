# Projet : Prototype TMS (Transport Management System) "Front-End Only"

## 1. Contexte et Objectif
Il s'agit d'un prototype interactif (Proof of Concept) destiné à convaincre la directrice d'une entreprise de transport routier et de transit basée au Togo. 
L'objectif n'est pas d'avoir un backend fonctionnel, mais de proposer une interface ultra-réaliste, moderne et luxueuse, utilisant des données mockées (state local). 

La cliente doit se projeter instantanément. Le design doit respirer la fiabilité et la haute technologie, tout en résolvant ses problèmes locaux. Utilise ma stack habituelle pour l'UI et la navigation.

## 2. Le Problème Métier à Résoudre
L'entreprise de transport gère une flotte de camions effectuant des trajets depuis le Port de Lomé vers l'intérieur du pays ou l'hinterland (Burkina Faso, Mali). 
Leur plus gros point de douleur ("pain point") est la **fuite de trésorerie** :
- Vol de carburant non détecté.
- Frais de route (péages, douanes, police) mal justifiés par les chauffeurs.
- Difficulté à savoir si un voyage précis a été rentable ou déficitaire une fois toutes les charges déduites.

## 3. Contexte des Données Mockées (Crucial pour le réalisme)
- **Devise :** FCFA (Francs CFA). Formater les montants proprement (ex: 1 500 000 FCFA).
- **Villes/Trajets fréquents :** Port de Lomé, Cinkassé, Dapaong, Ouagadougou, Bamako, Niamey.
- **Plaques d'immatriculation (Togo) :** Format TG-1234-A, TG-8899-B.
- **Noms de chauffeurs locaux :** Koffi, Kossi, Abdoulaye, Messan.
- **Catégories de dépenses :** Carburant, Frais de Douane, Péage, Entretien, Frais de route (police/escorte).

## 4. Les 3 Vues Principales à Implémenter

### A. Le Dashboard (Vue d'ensemble et Rentabilité)
C'est la vue d'atterrissage. Elle doit rassurer et donner le contrôle.
- **Cartes KPI (chiffres clés) :**
  - Chiffre d'Affaires (Mois en cours) : ex. 18 500 000 FCFA.
  - Dépenses totales (Mois en cours) : ex. 12 200 000 FCFA.
  - Marge Nette : Calculée et mise en évidence.
  - Flotte active : 8/12 camions en route.
- **Graphique :** Un beau chart montrant la comparaison Revenus vs Dépenses sur les 4 dernières semaines.
- **Tableau rapide :** "Derniers voyages terminés" avec un badge d'état financier (Vert = Rentable, Rouge = Déficitaire).

### B. Gestion des Voyages (Le cœur du réacteur)
Un tableau riche listant les missions en cours.
- **Colonnes requises :** 
  - ID Voyage (ex: VOY-2026-042)
  - Trajet (ex: Lomé -> Ouagadougou)
  - Camion assigné & Chauffeur
  - Montant Facturé au client
  - Dépenses accumulées (en temps réel)
  - Statut : En chargement, En route, Frontière, Terminé.
- **Interaction :** Au clic sur un voyage, afficher un volet latéral (ou modal) détaillant les reçus de dépenses soumis par le chauffeur.

### C. La fonctionnalité "Wow" : L'Assistant Logistique IA
C'est l'argument de vente principal (high-ticket). L'IA ne doit pas être un simple chatbot passif, mais un **agent proactif** qui audite l'entreprise.
- **UI :** Un widget flottant ou un panneau latéral très moderne (avec un léger effet de glow).
- **Comportement simulé :** L'assistant affiche des alertes pré-générées pour prouver qu'il surveille les "fuites d'argent".
- **Messages mockés à afficher dès le chargement :**
  1. 💬 *"👋 Bonjour, j'ai terminé l'analyse des clôtures de la semaine."*
  2. 🚨 *"⚠️ Alerte Rentabilité : Le camion TG-5521 (Chauffeur: Koffi) a consommé 15% de carburant en plus que sa moyenne historique sur le trajet Lomé-Ouagadougou. Voulez-vous que je bloque sa prochaine avance sur frais de route ?"*
  3. 💡 *"📈 Optimisation : 3 camions sont actuellement en attente à la frontière de Cinkassé depuis plus de 24h. Le manque à gagner est estimé à 450 000 FCFA."*
- **Interaction :** Prévoir un input basique. Si l'utilisateur tape quelque chose, l'IA répond "Analyse de la requête en cours..." après un petit délai.

## 5. Directives UI/UX Globales
- Pas de base de données, gère tout l'état avec des hooks React standard et des constantes pour les fausses données.
- Utilise des composants UI propres, des ombres douces, des couleurs sémantiques (vert pour les gains, rouge pour les alertes/pertes, violet/bleu profond pour l'IA).
- L'interface doit paraître complexe et complète ("Enterprise grade"), mais rester lisible.