# FITORA

Coaching sportif, nutrition et suivi de santé. Next.js 16 (App Router), TypeScript strict, Tailwind CSS v4, Supabase.

## Démarrer

1. `npm install`
2. Créer un projet sur [supabase.com](https://supabase.com), puis :
   - copier `.env.example` en `.env.local` et renseigner l'URL du projet et la clé publique
     (Project Settings → API) ;
   - exécuter `supabase/migrations/*.sql` dans l'éditeur SQL (ou `supabase db push`) ;
   - Authentication → URL Configuration : ajouter `http://localhost:3000/auth/confirm`
     aux URL de redirection.
3. `npm run dev` puis ouvrir http://localhost:3000

## Scripts

| Commande | Rôle |
| --- | --- |
| `npm run dev` | serveur de développement |
| `npm run lint` | ESLint |
| `npm run typecheck` | génération des types de routes + `tsc` |
| `npm test` | tests unitaires (Vitest) |
| `npm run test:e2e` | parcours complets (Playwright) — le parcours inscription → questionnaire → accueil nécessite Supabase configuré et la confirmation par email désactivée |
| `npm run build` | build de production |

## Organisation

Voir `CLAUDE.md`. Les calculs (besoins caloriques, progression, statistiques) sont des fonctions pures testées dans `src/lib/calculs/`. Chaque table a la sécurité par ligne (RLS) activée : un utilisateur n'accède qu'à ses propres données.
