/**
 * Types de la base Supabase, alignés sur supabase/migrations.
 * À régénérer avec `supabase gen types typescript` une fois la CLI configurée.
 */

export type Sexe = "femme" | "homme" | "autre";
export type ObjectifPrincipal =
  | "prise_de_masse"
  | "perte_de_poids"
  | "force"
  | "endurance"
  | "maintien";
export type NiveauSportif = "debutant" | "intermediaire" | "avance";
export type MaterielDisponible = "salle" | "domicile" | "aucun";
export type BudgetAlimentaire = "serre" | "moyen" | "confortable";
export type NiveauActivite =
  | "sedentaire"
  | "leger"
  | "modere"
  | "eleve"
  | "tres_eleve";
export type Activite = "musculation" | "fitness" | "cardio" | "domicile";
export type RestrictionAlimentaire =
  | "vegetarien"
  | "vegan"
  | "halal"
  | "sans_gluten"
  | "sans_lactose";

export type Profil = {
  id: string;
  prenom: string;
  nom: string;
  age: number | null;
  sexe: Sexe | null;
  taille_cm: number | null;
  objectif: ObjectifPrincipal | null;
  poids_objectif_kg: number | null;
  niveau: NiveauSportif | null;
  activites: Activite[];
  jours_par_semaine: number | null;
  duree_seance_min: number | null;
  materiel: MaterielDisponible | null;
  experience: string | null;
  exercices_preferes: string | null;
  restrictions_alimentaires: RestrictionAlimentaire[];
  allergies: string | null;
  budget_alimentaire: BudgetAlimentaire | null;
  aliments_preferes: string | null;
  sommeil_heures: number | null;
  niveau_activite: NiveauActivite | null;
  blessures: string | null;
  onboarding_etape: number;
  onboarding_termine_le: string | null;
  consentement_sante_le: string | null;
  consentement_sante_version: number | null;
  cree_le: string;
  modifie_le: string;
};

export type Pesee = {
  id: number;
  user_id: string;
  mesure_le: string;
  poids_kg: number;
  cree_le: string;
};

export type PriseEau = {
  id: number;
  user_id: string;
  jour: string;
  quantite_ml: number;
  cree_le: string;
};

export type StatutProgramme = "propose" | "actif" | "archive";
export type StatutSeance = "en_cours" | "terminee" | "annulee";

export type Programme = {
  id: string;
  user_id: string;
  titre: string;
  objectif: ObjectifPrincipal;
  niveau: NiveauSportif;
  jours_par_semaine: number;
  duree_seance_min: number;
  statut: StatutProgramme;
  variante: number;
  cree_le: string;
  active_le: string | null;
};

export type ProgrammeSeance = {
  id: string;
  programme_id: string;
  user_id: string;
  ordre: number;
  nom: string;
  jour_semaine: number;
};

export type ProgrammeExercice = {
  id: string;
  seance_id: string;
  user_id: string;
  ordre: number;
  exercice_id: string;
  series: number;
  reps_min: number | null;
  reps_max: number | null;
  duree_sec: number | null;
  repos_sec: number;
};

export type Seance = {
  id: string;
  user_id: string;
  programme_seance_id: string | null;
  nom: string;
  commencee_le: string;
  terminee_le: string | null;
  statut: StatutSeance;
  notes: string | null;
};

export type SerieRealisee = {
  id: number;
  seance_id: string;
  user_id: string;
  exercice_id: string;
  numero: number;
  charge_kg: number | null;
  repetitions: number | null;
  duree_sec: number | null;
  enregistree_le: string;
};

export type TypeMensuration = "tour_de_taille" | "hanches" | "poitrine" | "bras" | "cuisse" | "masse_grasse";
export type TypeObjectif = "poids" | "seances_semaine" | "hydratation" | "pas";
export type StatutObjectif = "en_cours" | "atteint" | "abandonne";
export type MomentRepas = "petit_dejeuner" | "dejeuner" | "diner" | "collation";

export type Mensuration = { id: number; user_id: string; mesure_le: string; type: TypeMensuration; valeur: number };

export type Objectif = {
  id: string;
  user_id: string;
  type: TypeObjectif;
  cible: number;
  debut_le: string;
  echeance_le: string | null;
  statut: StatutObjectif;
  cree_le: string;
};

export type RepasEntree = {
  id: number;
  user_id: string;
  consomme_le: string;
  moment: MomentRepas;
  aliment_id: string;
  quantite_g: number;
  cree_le: string;
};

export type PlanRepas = {
  id: string;
  user_id: string;
  kcal_cible: number;
  variante: number;
  contenu: unknown;
  cree_le: string;
};

export type JournalSante = {
  id: number;
  user_id: string;
  jour: string;
  sommeil_min: number | null;
  qualite_sommeil: number | null;
  fatigue: number | null;
  pas: number | null;
  douleur_zone: string | null;
  douleur_intensite: number | null;
  note: string | null;
  source: "manuel";
  modifie_le: string;
};

/** Colonnes générées par la base, facultatives à l'insertion. */
type Insertion<T, Auto extends keyof T> = Omit<T, Auto> & Partial<Pick<T, Auto>>;

type ProfilModifiable = Partial<
  Omit<Profil, "id" | "cree_le" | "modifie_le">
>;

export type Database = {
  public: {
    Tables: {
      profils: {
        Row: Profil;
        Insert: never;
        Update: ProfilModifiable;
        Relationships: [];
      };
      pesees: {
        Row: Pesee;
        Insert: { mesure_le: string; poids_kg: number; user_id?: string };
        Update: { mesure_le?: string; poids_kg?: number };
        Relationships: [];
      };
      prises_eau: {
        Row: PriseEau;
        Insert: { jour: string; quantite_ml: number; user_id?: string };
        Update: never;
        Relationships: [];
      };
      programmes: {
        Row: Programme;
        Insert: Insertion<Programme, "id" | "user_id" | "statut" | "variante" | "cree_le" | "active_le">;
        Update: Partial<Omit<Programme, "id" | "user_id">>;
        Relationships: [];
      };
      programme_seances: {
        Row: ProgrammeSeance;
        Insert: Insertion<ProgrammeSeance, "id" | "user_id">;
        Update: Partial<Pick<ProgrammeSeance, "jour_semaine" | "nom">>;
        Relationships: [];
      };
      programme_exercices: {
        Row: ProgrammeExercice;
        Insert: Insertion<ProgrammeExercice, "id" | "user_id">;
        Update: Partial<Omit<ProgrammeExercice, "id" | "user_id" | "seance_id">>;
        Relationships: [];
      };
      seances: {
        Row: Seance;
        Insert: Insertion<Seance, "user_id" | "commencee_le" | "terminee_le" | "statut" | "notes">;
        Update: Partial<Pick<Seance, "terminee_le" | "statut" | "notes">>;
        Relationships: [];
      };
      series_realisees: {
        Row: SerieRealisee;
        Insert: Insertion<SerieRealisee, "id" | "user_id" | "enregistree_le">;
        Update: Partial<Pick<SerieRealisee, "charge_kg" | "repetitions" | "duree_sec">>;
        Relationships: [];
      };
      mensurations: {
        Row: Mensuration;
        Insert: Insertion<Mensuration, "id" | "user_id">;
        Update: Partial<Pick<Mensuration, "valeur">>;
        Relationships: [];
      };
      objectifs: {
        Row: Objectif;
        Insert: Insertion<Objectif, "id" | "user_id" | "debut_le" | "echeance_le" | "statut" | "cree_le">;
        Update: Partial<Pick<Objectif, "cible" | "echeance_le" | "statut">>;
        Relationships: [];
      };
      repas_entrees: {
        Row: RepasEntree;
        Insert: Insertion<RepasEntree, "id" | "user_id" | "cree_le">;
        Update: Partial<Pick<RepasEntree, "quantite_g" | "moment">>;
        Relationships: [];
      };
      plans_repas: {
        Row: PlanRepas;
        Insert: Insertion<PlanRepas, "id" | "user_id" | "variante" | "cree_le">;
        Update: never;
        Relationships: [];
      };
      journal_sante: {
        Row: JournalSante;
        Insert: Insertion<JournalSante, "id" | "user_id" | "source" | "modifie_le">;
        Update: Partial<Omit<JournalSante, "id" | "user_id" | "jour" | "source">>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      sexe: Sexe;
      objectif_principal: ObjectifPrincipal;
      niveau_sportif: NiveauSportif;
      materiel_disponible: MaterielDisponible;
      budget_alimentaire: BudgetAlimentaire;
      niveau_activite: NiveauActivite;
      statut_programme: StatutProgramme;
      statut_seance: StatutSeance;
      type_mensuration: TypeMensuration;
      type_objectif: TypeObjectif;
      statut_objectif: StatutObjectif;
      moment_repas: MomentRepas;
    };
    CompositeTypes: Record<string, never>;
  };
};
