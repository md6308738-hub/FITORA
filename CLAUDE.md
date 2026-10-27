# FITORA — Contexte du projet pour Claude Code

Plateforme SaaS de coaching sportif, nutrition et bien-être. Marché de lancement : Sénégal (Afrique francophone ensuite). Langue de l’interface : français.
Le cahier des charges complet est dans `docs/cahier-des-charges.md` : s’y référer avant toute décision fonctionnelle.

## Stack technique
- Next.js (App Router) + React + TypeScript en mode strict
- Tailwind CSS, composants accessibles (Radix UI / shadcn/ui)
- Supabase : authentification, PostgreSQL, stockage privé
- Validation des formulaires : React Hook Form + Zod (côté client ET côté serveur)
- Graphiques : Recharts
- Tests : Vitest (unitaires), Playwright (parcours complets)

## Identité visuelle
- Thème clair ; jetons définis dans `src/app/globals.css` (`@theme`), à utiliser plutôt que des couleurs en dur
- Bleu `#0A45BD` (boutons, éléments interactifs, éléments actifs, accents), texte sur le bleu `#FFFFFF`
- Surfaces blanches `#FFFFFF`, fond `#F5F7FB`, surfaces secondaires `#F2F4F8`, bordures `#E1E6EF`
- Texte : `#0F172A` (principal), `#475467` (secondaire), `#5D6676` (métadonnées)
- Erreur `#B42318`, avertissement `#B54708`
- Page vitrine : photo réelle sous licence libre (sources dans `docs/credits-medias.md`), voile sombre uniquement pour la lisibilité du texte
- Animations discrètes uniquement (apparition courte), désactivées si `prefers-reduced-motion`
- Polices : Manrope (titres), Inter (texte)
- Cartes : rayon 16–18 px, bordure fine, pas d’ombre lourde
- Interdit : dégradés décoratifs, effets lumineux, emoji dans l’interface, illustrations génériques
- Zones tactiles ≥ 44 px, contraste texte ≥ 4,5:1
- Navigation (cahier des charges § 5.1) : barre latérale sur ordinateur, barre en bas sur mobile (Accueil, Entraînement [programmes + séance], Nutrition, Progrès [mesures + objectifs], Santé) + Profil

## Organisation du code
```
src/
  app/            routes Next.js (pages, layouts, server actions)
  components/ui/  composants génériques réutilisables
  components/     composants métier par module
  lib/            client Supabase, utilitaires, calculs déterministes
  lib/calculs/    progression, calories, statistiques (fonctions pures testées)
  types/          types partagés
supabase/
  migrations/     migrations SQL versionnées
docs/
```

## Règles de développement
- Les règles métier vivent côté serveur, jamais uniquement dans le frontend.
- Toute table Supabase a la sécurité par ligne (RLS) activée, avec des politiques testées.
- Aucune clé secrète dans le frontend ni dans le dépôt (`.env.local` ignoré par Git, `.env.example` fourni).
- Les calculs (calories, progression, statistiques) sont des fonctions pures, testées, jamais laissés à l’IA.
- Les graphiques et bilans n’utilisent que des données réellement enregistrées ; les données manquantes sont signalées.
- Les calories et besoins nutritionnels sont toujours présentés comme des estimations.
- Aucun diagnostic médical, aucune promesse de résultat physique garanti.
- Aucun bouton purement décoratif : chaque action affichée doit fonctionner.
- Chaque écran gère les états de chargement, d’erreur et de liste vide.

## Définition de « terminé »
Une fonctionnalité est terminée seulement si : interface finalisée, règles métier implémentées, données persistées, contrôles d’accès appliqués, états de chargement/erreur gérés, tests passants, documentation à jour.

## Plan par phases
1. Fondations : authentification, profil, questionnaire initial, navigation responsive, tableau de bord, schéma de base de données, RLS
2. Entraînement : bibliothèque d’exercices, générateur de programmes, calendrier, suivi des séances, historique
3. Nutrition et progression : catalogue alimentaire, plans de repas, mensurations, graphiques, bilans
4. Santé et coach IA
5. Monétisation : offres gratuite / Premium, paiements
6. Espace coachs et salles de sport

Phase en cours : **Phase 1 — Fondations**

## Méthode de travail
- Avant une tâche importante : proposer un plan court, puis attendre validation.
- Travailler par petites étapes, une fonctionnalité à la fois, avec un commit Git par étape.
- Après chaque étape : lancer `npm run lint`, `npm run typecheck` et les tests.
- Expliquer brièvement en français ce qui a été fait et ce qui reste à faire.
