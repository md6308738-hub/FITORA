/** Fuseau de référence de l'application (marché de lancement : Sénégal). */
export const FUSEAU_APPLICATION = "Africa/Dakar";

/** Date du jour au format AAAA-MM-JJ dans le fuseau de l'application. */
export function jourLocal(date: Date = new Date(), fuseau = FUSEAU_APPLICATION): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: fuseau,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/** Jour de la semaine ISO (1 = lundi … 7 = dimanche) dans le fuseau de l'application. */
export function jourSemaine(date: Date = new Date(), fuseau = FUSEAU_APPLICATION): number {
  const court = new Intl.DateTimeFormat("en-US", { timeZone: fuseau, weekday: "short" }).format(date);
  return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(court) + 1;
}

/** Ajoute (ou retire) des jours à une date AAAA-MM-JJ. */
export function decalerJour(jour: string, nombreDeJours: number): string {
  const date = new Date(`${jour}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + nombreDeJours);
  return date.toISOString().slice(0, 10);
}

/** Nombre de jours entre deux dates AAAA-MM-JJ. */
export function joursEntre(debut: string, fin: string): number {
  const ms = Date.parse(`${fin}T12:00:00Z`) - Date.parse(`${debut}T12:00:00Z`);
  return Math.round(ms / 86_400_000);
}

export function formaterDateCourte(jour: string): string {
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", timeZone: "UTC" }).format(
    new Date(`${jour}T12:00:00Z`),
  );
}
