-- FITORA — mensurations, objectifs, nutrition, journal de santé, consentement.
-- Catalogue d'aliments versionné dans le code (src/lib/nutrition/aliments.ts).
-- RLS : chaque utilisateur n'accède qu'à ses propres lignes.

-- ---------------------------------------------------------------------------
-- Consentement aux données de santé (cahier des charges § 12.4)
-- ---------------------------------------------------------------------------
alter table public.profils
  add column if not exists consentement_sante_le timestamptz,
  add column if not exists consentement_sante_version smallint;

-- ---------------------------------------------------------------------------
-- Mensurations
-- ---------------------------------------------------------------------------
do $$ begin
  create type public.type_mensuration as enum (
    'tour_de_taille', 'hanches', 'poitrine', 'bras', 'cuisse', 'masse_grasse'
  );
exception when duplicate_object then null;
end $$;

create table if not exists public.mensurations (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  mesure_le date not null,
  type public.type_mensuration not null,
  valeur numeric(5, 1) not null check (valeur > 0 and valeur < 400),
  unique (user_id, mesure_le, type)
);
create index if not exists mensurations_user on public.mensurations (user_id, type, mesure_le);

-- ---------------------------------------------------------------------------
-- Objectifs personnels
-- ---------------------------------------------------------------------------
do $$ begin
  create type public.type_objectif as enum ('poids', 'seances_semaine', 'hydratation', 'pas');
exception when duplicate_object then null;
end $$;
do $$ begin
  create type public.statut_objectif as enum ('en_cours', 'atteint', 'abandonne');
exception when duplicate_object then null;
end $$;

create table if not exists public.objectifs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  type public.type_objectif not null,
  cible numeric(7, 1) not null check (cible > 0),
  debut_le date not null default current_date,
  echeance_le date,
  statut public.statut_objectif not null default 'en_cours',
  cree_le timestamptz not null default now(),
  check (echeance_le is null or echeance_le >= debut_le)
);
create index if not exists objectifs_user on public.objectifs (user_id, statut);

-- ---------------------------------------------------------------------------
-- Nutrition : journal des repas et plans de repas
-- ---------------------------------------------------------------------------
do $$ begin
  create type public.moment_repas as enum ('petit_dejeuner', 'dejeuner', 'diner', 'collation');
exception when duplicate_object then null;
end $$;

create table if not exists public.repas_entrees (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  consomme_le date not null,
  moment public.moment_repas not null,
  aliment_id text not null check (aliment_id ~ '^[a-z0-9-]{2,60}$'),
  quantite_g numeric(6, 1) not null check (quantite_g > 0 and quantite_g <= 3000),
  cree_le timestamptz not null default now()
);
create index if not exists repas_user_jour on public.repas_entrees (user_id, consomme_le);

create table if not exists public.plans_repas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  kcal_cible smallint not null check (kcal_cible between 800 and 6000),
  variante smallint not null default 0,
  -- Plan de 7 jours généré par des règles déterministes (structure validée côté serveur).
  contenu jsonb not null,
  cree_le timestamptz not null default now()
);
create index if not exists plans_repas_user on public.plans_repas (user_id, cree_le desc);

-- ---------------------------------------------------------------------------
-- Journal de santé et de récupération (une entrée par jour)
-- ---------------------------------------------------------------------------
create table if not exists public.journal_sante (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  jour date not null,
  sommeil_min smallint check (sommeil_min between 0 and 1440),
  qualite_sommeil smallint check (qualite_sommeil between 1 and 5),
  fatigue smallint check (fatigue between 1 and 5),
  pas integer check (pas between 0 and 100000),
  douleur_zone text check (char_length(douleur_zone) <= 60),
  douleur_intensite smallint check (douleur_intensite between 0 and 10),
  note text check (char_length(note) <= 500),
  source text not null default 'manuel' check (source in ('manuel')),
  modifie_le timestamptz not null default now(),
  unique (user_id, jour)
);
create index if not exists journal_sante_user on public.journal_sante (user_id, jour);

-- ---------------------------------------------------------------------------
-- Sécurité par ligne
-- ---------------------------------------------------------------------------
alter table public.mensurations enable row level security;
alter table public.objectifs enable row level security;
alter table public.repas_entrees enable row level security;
alter table public.plans_repas enable row level security;
alter table public.journal_sante enable row level security;

drop policy if exists "mensurations : les siennes" on public.mensurations;
create policy "mensurations : les siennes" on public.mensurations for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "objectifs : les siens" on public.objectifs;
create policy "objectifs : les siens" on public.objectifs for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "repas_entrees : les siennes" on public.repas_entrees;
create policy "repas_entrees : les siennes" on public.repas_entrees for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "plans_repas : les siens" on public.plans_repas;
create policy "plans_repas : les siens" on public.plans_repas for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- Données de santé : écriture seulement après consentement explicite.
drop policy if exists "journal_sante : lecture des siennes" on public.journal_sante;
create policy "journal_sante : lecture des siennes" on public.journal_sante for select to authenticated
  using ((select auth.uid()) = user_id);
drop policy if exists "journal_sante : suppression des siennes" on public.journal_sante;
create policy "journal_sante : suppression des siennes" on public.journal_sante for delete to authenticated
  using ((select auth.uid()) = user_id);
drop policy if exists "journal_sante : écriture avec consentement" on public.journal_sante;
create policy "journal_sante : écriture avec consentement" on public.journal_sante for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (select 1 from public.profils p where p.id = (select auth.uid()) and p.consentement_sante_le is not null)
  );
drop policy if exists "journal_sante : modification avec consentement" on public.journal_sante;
create policy "journal_sante : modification avec consentement" on public.journal_sante for update to authenticated
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and exists (select 1 from public.profils p where p.id = (select auth.uid()) and p.consentement_sante_le is not null)
  );

revoke all on public.mensurations, public.objectifs, public.repas_entrees, public.plans_repas,
  public.journal_sante from anon;
grant select, insert, update, delete on public.mensurations, public.objectifs, public.repas_entrees,
  public.plans_repas, public.journal_sante to authenticated;
