-- FITORA — programmes d'entraînement et séances réalisées.
-- Le catalogue d'exercices est versionné dans le code (src/lib/exercices/catalogue.ts) ;
-- les tables n'en stockent que l'identifiant, validé côté serveur.
-- RLS : chaque utilisateur n'accède qu'à ses propres lignes.

create type public.statut_programme as enum ('propose', 'actif', 'archive');
create type public.statut_seance as enum ('en_cours', 'terminee', 'annulee');

-- ---------------------------------------------------------------------------
-- Programmes
-- ---------------------------------------------------------------------------
create table public.programmes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  titre text not null check (char_length(titre) between 1 and 80),
  objectif public.objectif_principal not null,
  niveau public.niveau_sportif not null,
  jours_par_semaine smallint not null check (jours_par_semaine between 1 and 7),
  duree_seance_min smallint not null check (duree_seance_min between 15 and 180),
  statut public.statut_programme not null default 'propose',
  variante smallint not null default 0,
  cree_le timestamptz not null default now(),
  active_le timestamptz
);

-- Un seul programme actif par utilisateur.
create unique index programmes_un_actif on public.programmes (user_id) where statut = 'actif';
create index programmes_user on public.programmes (user_id, cree_le desc);

create table public.programme_seances (
  id uuid primary key default gen_random_uuid(),
  programme_id uuid not null references public.programmes (id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  ordre smallint not null check (ordre >= 1),
  nom text not null check (char_length(nom) between 1 and 60),
  jour_semaine smallint not null check (jour_semaine between 1 and 7),
  unique (programme_id, ordre)
);

create index programme_seances_programme on public.programme_seances (programme_id);

create table public.programme_exercices (
  id uuid primary key default gen_random_uuid(),
  seance_id uuid not null references public.programme_seances (id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  ordre smallint not null check (ordre >= 1),
  exercice_id text not null check (exercice_id ~ '^[a-z0-9-]{2,60}$'),
  series smallint not null check (series between 1 and 10),
  reps_min smallint check (reps_min between 1 and 50),
  reps_max smallint check (reps_max between 1 and 50),
  duree_sec smallint check (duree_sec between 10 and 3600),
  repos_sec smallint not null check (repos_sec between 0 and 600),
  unique (seance_id, ordre),
  check ((reps_min is not null and reps_max is not null and reps_min <= reps_max) or duree_sec is not null)
);

create index programme_exercices_seance on public.programme_exercices (seance_id);

-- ---------------------------------------------------------------------------
-- Séances réalisées et séries
-- ---------------------------------------------------------------------------
create table public.seances (
  -- Identifiant généré par le client : une nouvelle tentative ne crée pas de doublon.
  id uuid primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  programme_seance_id uuid references public.programme_seances (id) on delete set null,
  nom text not null check (char_length(nom) between 1 and 60),
  commencee_le timestamptz not null default now(),
  terminee_le timestamptz,
  statut public.statut_seance not null default 'en_cours',
  notes text check (char_length(notes) <= 1000)
);

-- Une seule séance en cours à la fois.
create unique index seances_une_en_cours on public.seances (user_id) where statut = 'en_cours';
create index seances_user on public.seances (user_id, commencee_le desc);

create table public.series_realisees (
  id bigint generated always as identity primary key,
  seance_id uuid not null references public.seances (id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  exercice_id text not null check (exercice_id ~ '^[a-z0-9-]{2,60}$'),
  numero smallint not null check (numero between 1 and 20),
  charge_kg numeric(5, 1) check (charge_kg between 0 and 500),
  repetitions smallint check (repetitions between 0 and 100),
  duree_sec smallint check (duree_sec between 0 and 3600),
  enregistree_le timestamptz not null default now(),
  -- Ré-enregistrer une série la corrige au lieu de la dupliquer.
  unique (seance_id, exercice_id, numero)
);

create index series_user_exercice on public.series_realisees (user_id, exercice_id, enregistree_le desc);

-- ---------------------------------------------------------------------------
-- Sécurité par ligne
-- ---------------------------------------------------------------------------
alter table public.programmes enable row level security;
alter table public.programme_seances enable row level security;
alter table public.programme_exercices enable row level security;
alter table public.seances enable row level security;
alter table public.series_realisees enable row level security;

create policy "programmes : les siens" on public.programmes for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- Les lignes enfants doivent aussi appartenir au même utilisateur que leur parent.
create policy "programme_seances : les siennes" on public.programme_seances for all to authenticated
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and exists (select 1 from public.programmes p where p.id = programme_id and p.user_id = (select auth.uid()))
  );

create policy "programme_exercices : les siens" on public.programme_exercices for all to authenticated
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and exists (select 1 from public.programme_seances s where s.id = seance_id and s.user_id = (select auth.uid()))
  );

create policy "seances : les siennes" on public.seances for all to authenticated
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and (
      programme_seance_id is null
      or exists (select 1 from public.programme_seances s where s.id = programme_seance_id and s.user_id = (select auth.uid()))
    )
  );

create policy "series_realisees : les siennes" on public.series_realisees for all to authenticated
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and exists (select 1 from public.seances s where s.id = seance_id and s.user_id = (select auth.uid()))
  );

revoke all on public.programmes, public.programme_seances, public.programme_exercices,
  public.seances, public.series_realisees from anon;
grant select, insert, update, delete on public.programmes, public.programme_seances,
  public.programme_exercices, public.seances, public.series_realisees to authenticated;
