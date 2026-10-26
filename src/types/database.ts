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
    };
    CompositeTypes: Record<string, never>;
  };
};
