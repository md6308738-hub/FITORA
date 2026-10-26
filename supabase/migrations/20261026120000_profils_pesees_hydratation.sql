-- MOVA — profils utilisateurs, pesées et hydratation.
-- Chaque table a la sécurité par ligne (RLS) activée : un utilisateur
-- n'accède qu'à ses propres lignes.

-- ---------------------------------------------------------------------------
-- Types
-- ---------------------------------------------------------------------------
create type public.sexe as enum ('femme', 'homme', 'autre');
create type public.objectif_principal as enum (
  'prise_de_masse', 'perte_de_poids', 'force', 'endurance', 'maintien'
);
create type public.niveau_sportif as enum ('debutant', 'intermediaire', 'avance');
create type public.materiel_disponible as enum ('salle', 'domicile', 'aucun');
create type public.budget_alimentaire as enum ('serre', 'moyen', 'confortable');
create type public.niveau_activite as enum (
  'sedentaire', 'leger', 'modere', 'eleve', 'tres_eleve'
);

-- ---------------------------------------------------------------------------
-- Profils
-- ---------------------------------------------------------------------------
create table public.profils (
  id uuid primary key references auth.users (id) on delete cascade,
  prenom text not null check (char_length(prenom) between 1 and 50),
  nom text not null check (char_length(nom) between 1 and 50),

  -- Questionnaire de démarrage
  age smallint check (age between 14 and 100),
  sexe public.sexe,
  taille_cm smallint check (taille_cm between 120 and 230),
  objectif public.objectif_principal,
  poids_objectif_kg numeric(5, 1) check (poids_objectif_kg between 30 and 300),
  niveau public.niveau_sportif,
  activites text[] not null default '{}'
    check (activites <@ array['musculation', 'fitness', 'cardio', 'domicile']),
  jours_par_semaine smallint check (jours_par_semaine between 1 and 7),
  duree_seance_min smallint check (duree_seance_min between 15 and 180),
  materiel public.materiel_disponible,
  experience text check (char_length(experience) <= 500),
  exercices_preferes text check (char_length(exercices_preferes) <= 500),
  restrictions_alimentaires text[] not null default '{}'
    check (restrictions_alimentaires <@ array[
      'vegetarien', 'vegan', 'halal', 'sans_gluten', 'sans_lactose'
    ]),
  allergies text check (char_length(allergies) <= 500),
  budget_alimentaire public.budget_alimentaire,
  aliments_preferes text check (char_length(aliments_preferes) <= 500),
  sommeil_heures numeric(3, 1) check (sommeil_heures between 3 and 14),
  niveau_activite public.niveau_activite,
  blessures text check (char_length(blessures) <= 500),

  -- Avancement du questionnaire : nombre d'étapes validées.
  onboarding_etape smallint not null default 0 check (onboarding_etape >= 0),
  onboarding_termine_le timestamptz,

  cree_le timestamptz not null default now(),
  modifie_le timestamptz not null default now()
);

alter table public.profils enable row level security;

create policy "profils : lecture de son propre profil"
  on public.profils for select to authenticated
  using ((select auth.uid()) = id);

create policy "profils : modification de son propre profil"
  on public.profils for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Pas de politique insert/delete : le profil est créé par le déclencheur
-- ci-dessous et supprimé en cascade avec le compte.

create function public.maj_modifie_le()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.modifie_le = now();
  return new;
end;
$$;

create trigger profils_modifie_le
  before update on public.profils
  for each row execute function public.maj_modifie_le();

-- Création automatique du profil à l'inscription (prénom et nom transmis
-- dans les métadonnées de l'inscription).
create function public.creer_profil_utilisateur()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profils (id, prenom, nom)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'prenom'), ''), 'Utilisateur'),
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'nom'), ''), '-')
  );
  return new;
end;
$$;

create trigger creer_profil_a_l_inscription
  after insert on auth.users
  for each row execute function public.creer_profil_utilisateur();

-- ---------------------------------------------------------------------------
-- Pesées (une par jour et par utilisateur)
-- ---------------------------------------------------------------------------
create table public.pesees (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid()
    references auth.users (id) on delete cascade,
  mesure_le date not null,
  poids_kg numeric(5, 1) not null check (poids_kg between 30 and 300),
  cree_le timestamptz not null default now(),
  unique (user_id, mesure_le)
);

create index pesees_user_date on public.pesees (user_id, mesure_le);

alter table public.pesees enable row level security;

create policy "pesees : lecture des siennes"
  on public.pesees for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "pesees : ajout des siennes"
  on public.pesees for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "pesees : modification des siennes"
  on public.pesees for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "pesees : suppression des siennes"
  on public.pesees for delete to authenticated
  using ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------------------
-- Hydratation (chaque prise est une ligne)
-- ---------------------------------------------------------------------------
create table public.prises_eau (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid()
    references auth.users (id) on delete cascade,
  jour date not null,
  quantite_ml smallint not null check (quantite_ml between 50 and 2000),
  cree_le timestamptz not null default now()
);

create index prises_eau_user_jour on public.prises_eau (user_id, jour);

alter table public.prises_eau enable row level security;

create policy "prises_eau : lecture des siennes"
  on public.prises_eau for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "prises_eau : ajout des siennes"
  on public.prises_eau for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "prises_eau : suppression des siennes"
  on public.prises_eau for delete to authenticated
  using ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------------------
-- Droits : uniquement les utilisateurs connectés, jamais les anonymes.
-- ---------------------------------------------------------------------------
revoke all on public.profils, public.pesees, public.prises_eau from anon;
grant select, update on public.profils to authenticated;
grant select, insert, update, delete on public.pesees to authenticated;
grant select, insert, delete on public.prises_eau to authenticated;
