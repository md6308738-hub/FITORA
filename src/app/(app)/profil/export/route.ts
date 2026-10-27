import { exigerUtilisateur } from "@/lib/data/session";
import { jourLocal } from "@/lib/dates";

const TABLES = [
  "pesees",
  "prises_eau",
  "mensurations",
  "objectifs",
  "programmes",
  "programme_seances",
  "programme_exercices",
  "seances",
  "series_realisees",
  "repas_entrees",
  "plans_repas",
  "journal_sante",
] as const;

/** Export de toutes les données personnelles au format JSON (cahier des charges § 6.1 et § 21.3). */
export async function GET() {
  const { supabase, userId } = await exigerUtilisateur();
  const [{ data: utilisateur }, { data: profil }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from("profils").select("*").eq("id", userId).single(),
  ]);

  const donnees: Record<string, unknown> = {};
  for (const table of TABLES) {
    const { data } = await supabase.from(table).select("*").eq("user_id", userId);
    donnees[table] = data ?? [];
  }

  const exportation = {
    format: "fitora-export-v1",
    exporte_le: new Date().toISOString(),
    compte: { id: userId, email: utilisateur.user?.email ?? null, cree_le: utilisateur.user?.created_at ?? null },
    profil,
    ...donnees,
  };

  return new Response(JSON.stringify(exportation, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="fitora-mes-donnees-${jourLocal()}.json"`,
      "Cache-Control": "no-store",
    },
  });
}
