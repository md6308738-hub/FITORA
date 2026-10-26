import { NOMS_JOURS } from "@/lib/calculs/planning";

type Prescription = {
  series: number;
  reps_min: number | null;
  reps_max: number | null;
  duree_sec: number | null;
  repos_sec: number;
};

function duree(secondes: number): string {
  return secondes >= 120 ? `${Math.round(secondes / 60)} min` : `${secondes} s`;
}

/** « 4 × 6–10 · repos 2 min », « 3 × 45 s · repos 30 s », « 15 min ». */
export function formaterPrescription(p: Prescription): string {
  const volume =
    p.duree_sec !== null
      ? p.series > 1
        ? `${p.series} × ${duree(p.duree_sec)}`
        : duree(p.duree_sec)
      : `${p.series} × ${p.reps_min === p.reps_max ? p.reps_min : `${p.reps_min}–${p.reps_max}`}`;
  return p.repos_sec > 0 ? `${volume} · repos ${duree(p.repos_sec)}` : volume;
}

export function nomJour(jour: number): string {
  const nom = NOMS_JOURS[jour] ?? "";
  return nom.charAt(0).toUpperCase() + nom.slice(1);
}
