import Image from "next/image";

import { trouverExercice, type Exercice } from "@/lib/exercices/catalogue";

type Visuel =
  | "squat"
  | "charniere"
  | "fente"
  | "poussee-horizontale"
  | "poussee-verticale"
  | "tirage-horizontal"
  | "tirage-vertical"
  | "gainage"
  | "gainage-lateral"
  | "crunch"
  | "releve-jambes"
  | "superman"
  | "dips"
  | "curl"
  | "triceps"
  | "epaules"
  | "mollets"
  | "cardio"
  | "jumping-jacks"
  | "mountain-climbers"
  | "burpees"
  | "running"
  | "cycling";

type Segments = readonly [number, number, number, number][];

const POSES: Record<Visuel, readonly [Segments, Segments]> = {
  squat: [
    [[145, 70, 145, 115], [145, 84, 125, 98], [145, 84, 165, 98], [145, 115, 130, 140], [145, 115, 160, 140], [130, 140, 125, 165], [160, 140, 165, 165]],
    [[145, 78, 145, 112], [145, 88, 125, 102], [145, 88, 165, 102], [145, 112, 120, 118], [145, 112, 170, 118], [120, 118, 112, 145], [170, 118, 178, 145]],
  ],
  charniere: [
    [[145, 70, 145, 115], [145, 84, 125, 100], [145, 84, 165, 100], [145, 115, 130, 140], [145, 115, 160, 140], [130, 140, 125, 165], [160, 140, 165, 165]],
    [[145, 82, 170, 108], [145, 90, 125, 104], [145, 90, 190, 118], [170, 108, 158, 130], [170, 108, 182, 134], [158, 130, 145, 160], [182, 134, 194, 162]],
  ],
  fente: [
    [[145, 70, 145, 115], [145, 84, 125, 100], [145, 84, 165, 100], [145, 115, 130, 140], [145, 115, 160, 140], [130, 140, 125, 165], [160, 140, 165, 165]],
    [[145, 75, 145, 112], [145, 85, 125, 100], [145, 85, 165, 100], [145, 112, 125, 128], [145, 112, 175, 125], [125, 128, 120, 158], [175, 125, 188, 155]],
  ],
  "poussee-horizontale": [
    [[90, 95, 155, 95], [112, 95, 112, 120], [112, 120, 128, 132], [128, 132, 145, 128], [145, 128, 165, 120], [165, 120, 185, 112], [185, 112, 208, 112]],
    [[90, 95, 155, 95], [112, 95, 112, 120], [112, 120, 132, 132], [132, 132, 145, 128], [145, 128, 165, 120], [165, 120, 185, 112], [185, 112, 208, 112]],
  ],
  "poussee-verticale": [
    [[145, 70, 145, 115], [145, 84, 125, 100], [125, 100, 120, 120], [145, 84, 165, 100], [165, 100, 170, 120], [145, 115, 130, 140], [145, 115, 160, 140], [130, 140, 125, 165], [160, 140, 165, 165]],
    [[145, 70, 145, 115], [145, 84, 128, 68], [128, 68, 128, 47], [145, 84, 162, 68], [162, 68, 162, 47], [145, 115, 130, 140], [145, 115, 160, 140], [130, 140, 125, 165], [160, 140, 165, 165]],
  ],
  "tirage-horizontal": [
    [[145, 82, 170, 108], [145, 90, 125, 104], [145, 90, 190, 118], [170, 108, 158, 130], [170, 108, 182, 134], [158, 130, 145, 160], [182, 134, 194, 162]],
    [[145, 82, 170, 108], [145, 90, 125, 104], [145, 90, 165, 100], [170, 108, 158, 130], [170, 108, 145, 112], [158, 130, 145, 160], [145, 112, 134, 142], [134, 142, 128, 165]],
  ],
  "tirage-vertical": [
    [[145, 78, 145, 125], [145, 88, 118, 58], [118, 58, 112, 40], [145, 88, 172, 58], [172, 58, 178, 40], [145, 125, 130, 150], [145, 125, 160, 150], [130, 150, 125, 170], [160, 150, 165, 170]],
    [[145, 78, 145, 118], [145, 88, 125, 80], [125, 80, 120, 62], [145, 88, 165, 80], [165, 80, 170, 62], [145, 118, 130, 145], [145, 118, 160, 145], [130, 145, 125, 165], [160, 145, 165, 165]],
  ],
  gainage: [
    [[75, 106, 130, 106], [130, 106, 180, 106], [180, 106, 215, 106], [115, 106, 100, 128], [100, 128, 100, 145], [180, 106, 205, 126], [205, 126, 220, 145]],
    [[75, 106, 130, 106], [130, 106, 180, 106], [180, 106, 215, 106], [115, 106, 100, 128], [100, 128, 100, 145], [180, 106, 205, 126], [205, 126, 220, 145]],
  ],
  "gainage-lateral": [
    [[112, 108, 155, 108], [155, 108, 195, 108], [195, 108, 220, 108], [130, 108, 118, 130], [118, 130, 118, 145], [195, 108, 205, 132], [205, 132, 220, 145]],
    [[112, 108, 155, 108], [155, 108, 195, 108], [195, 108, 220, 108], [130, 108, 118, 130], [118, 130, 118, 145], [195, 108, 205, 132], [205, 132, 220, 145]],
  ],
  crunch: [
    [[90, 125, 155, 125], [155, 125, 180, 125], [180, 125, 205, 125], [135, 125, 125, 105], [125, 105, 110, 108], [180, 125, 190, 105], [190, 105, 205, 108]],
    [[90, 125, 140, 105], [140, 105, 180, 125], [180, 125, 205, 125], [130, 108, 122, 92], [122, 92, 110, 98], [180, 125, 190, 105], [190, 105, 205, 108]],
  ],
  "releve-jambes": [
    [[86, 126, 145, 126], [145, 126, 185, 126], [185, 126, 208, 126], [132, 126, 130, 146], [130, 146, 122, 158], [180, 126, 190, 105], [190, 105, 204, 100]],
    [[86, 126, 145, 126], [145, 126, 185, 126], [185, 126, 208, 126], [132, 126, 130, 146], [130, 146, 122, 158], [180, 126, 170, 82], [170, 82, 176, 55]],
  ],
  superman: [
    [[78, 111, 130, 111], [130, 111, 174, 111], [174, 111, 210, 111], [96, 111, 80, 95], [80, 95, 70, 88], [96, 111, 80, 128], [80, 128, 70, 136], [174, 111, 202, 130], [202, 130, 216, 138]],
    [[78, 105, 130, 105], [130, 105, 174, 105], [174, 105, 210, 105], [96, 105, 77, 80], [77, 80, 67, 75], [96, 105, 77, 130], [77, 130, 67, 138], [174, 105, 202, 82], [202, 82, 216, 75]],
  ],
  dips: [
    [[140, 70, 140, 108], [140, 80, 120, 100], [120, 100, 120, 128], [140, 80, 160, 100], [160, 100, 160, 128], [140, 108, 125, 132], [140, 108, 160, 132], [125, 132, 120, 150], [160, 132, 165, 150]],
    [[140, 75, 140, 112], [140, 84, 120, 100], [120, 100, 130, 118], [140, 84, 160, 100], [160, 100, 150, 118], [140, 112, 125, 135], [140, 112, 160, 135], [125, 135, 120, 153], [160, 135, 165, 153]],
  ],
  curl: [
    [[145, 70, 145, 115], [145, 84, 125, 100], [125, 100, 125, 130], [145, 84, 165, 100], [165, 100, 165, 130], [145, 115, 130, 140], [145, 115, 160, 140], [130, 140, 125, 165], [160, 140, 165, 165]],
    [[145, 70, 145, 115], [145, 84, 125, 100], [125, 100, 132, 78], [145, 84, 165, 100], [165, 100, 158, 78], [145, 115, 130, 140], [145, 115, 160, 140], [130, 140, 125, 165], [160, 140, 165, 165]],
  ],
  triceps: [
    [[145, 70, 145, 115], [145, 84, 128, 66], [128, 66, 128, 48], [145, 84, 162, 66], [162, 66, 162, 48], [145, 115, 130, 140], [145, 115, 160, 140], [130, 140, 125, 165], [160, 140, 165, 165]],
    [[145, 70, 145, 115], [145, 84, 128, 66], [128, 66, 120, 42], [145, 84, 162, 66], [162, 66, 170, 42], [145, 115, 130, 140], [145, 115, 160, 140], [130, 140, 125, 165], [160, 140, 165, 165]],
  ],
  epaules: [
    [[145, 70, 145, 115], [145, 84, 125, 100], [125, 100, 120, 120], [145, 84, 165, 100], [165, 100, 170, 120], [145, 115, 130, 140], [145, 115, 160, 140], [130, 140, 125, 165], [160, 140, 165, 165]],
    [[145, 70, 145, 115], [145, 84, 112, 82], [112, 82, 105, 64], [145, 84, 178, 82], [178, 82, 185, 64], [145, 115, 130, 140], [145, 115, 160, 140], [130, 140, 125, 165], [160, 140, 165, 165]],
  ],
  mollets: [
    [[145, 70, 145, 115], [145, 84, 125, 100], [145, 84, 165, 100], [145, 115, 130, 140], [145, 115, 160, 140], [130, 140, 125, 165], [160, 140, 165, 165]],
    [[145, 65, 145, 112], [145, 80, 125, 96], [145, 80, 165, 96], [145, 112, 130, 135], [145, 112, 160, 135], [130, 135, 125, 158], [160, 135, 165, 158]],
  ],
  cardio: [
    [[145, 70, 145, 115], [145, 84, 125, 100], [145, 84, 165, 100], [145, 115, 130, 140], [145, 115, 160, 140], [130, 140, 125, 165], [160, 140, 165, 165]],
    [[145, 68, 145, 108], [145, 82, 120, 94], [145, 82, 168, 72], [145, 108, 126, 132], [145, 108, 166, 120], [126, 132, 110, 153], [166, 120, 185, 140]],
  ],
  "jumping-jacks": [
    [[145, 70, 145, 115], [145, 84, 125, 100], [125, 100, 120, 120], [145, 84, 165, 100], [165, 100, 170, 120], [145, 115, 130, 140], [145, 115, 160, 140], [130, 140, 125, 165], [160, 140, 165, 165]],
    [[145, 70, 145, 115], [145, 84, 112, 62], [112, 62, 105, 45], [145, 84, 178, 62], [178, 62, 185, 45], [145, 115, 120, 140], [145, 115, 170, 140], [120, 140, 108, 160], [170, 140, 182, 160]],
  ],
  "mountain-climbers": [
    [[78, 105, 130, 105], [130, 105, 175, 105], [175, 105, 210, 105], [112, 105, 100, 130], [100, 130, 100, 148], [175, 105, 195, 128], [195, 128, 210, 148]],
    [[78, 105, 130, 105], [130, 105, 175, 105], [175, 105, 210, 105], [112, 105, 100, 130], [100, 130, 100, 148], [175, 105, 150, 122], [150, 122, 145, 145], [150, 122, 210, 148]],
  ],
  burpees: [
    [[145, 70, 145, 115], [145, 84, 125, 100], [145, 84, 165, 100], [145, 115, 130, 140], [145, 115, 160, 140], [130, 140, 125, 165], [160, 140, 165, 165]],
    [[78, 105, 130, 105], [130, 105, 175, 105], [175, 105, 210, 105], [112, 105, 100, 130], [100, 130, 100, 148], [175, 105, 195, 128], [195, 128, 210, 148]],
  ],
  running: [
    [[145, 70, 145, 112], [145, 84, 122, 96], [122, 96, 110, 112], [145, 84, 168, 96], [168, 96, 180, 112], [145, 112, 128, 136], [128, 136, 108, 148], [145, 112, 166, 132], [166, 132, 184, 144]],
    [[145, 68, 145, 108], [145, 82, 125, 65], [125, 65, 110, 54], [145, 82, 168, 94], [168, 94, 182, 108], [145, 108, 162, 132], [162, 132, 183, 142], [145, 108, 125, 132], [125, 132, 107, 145]],
  ],
  cycling: [
    [[112, 72, 145, 104], [145, 104, 170, 126], [145, 82, 126, 102], [126, 102, 110, 116], [145, 82, 168, 95], [168, 95, 180, 111], [145, 104, 130, 132], [130, 132, 110, 145], [145, 104, 169, 130], [169, 130, 190, 140]],
    [[112, 72, 145, 104], [145, 104, 170, 126], [145, 82, 126, 102], [126, 102, 110, 116], [145, 82, 168, 95], [168, 95, 180, 111], [145, 104, 142, 128], [142, 128, 110, 145], [145, 104, 158, 130], [158, 130, 190, 140]],
  ],
};

const VISUEL_PAR_EXERCICE: Record<string, Visuel> = {
  "presse-a-cuisses": "squat",
  "squat-bulgare": "fente",
  "fentes-marchees-halteres": "fente",
  "developpe-couche-halteres": "poussee-horizontale",
  "developpe-sol-halteres": "poussee-horizontale",
  "developpe-couche-barre": "poussee-horizontale",
  "pompes-declinees": "poussee-horizontale",
  "pompes-genoux": "poussee-horizontale",
  pompes: "poussee-horizontale",
  "developpe-militaire-halteres": "poussee-verticale",
  "developpe-militaire-barre": "poussee-verticale",
  "pompes-pike": "poussee-verticale",
  "developpe-epaules-elastique": "poussee-verticale",
  "rowing-haltere-un-bras": "tirage-horizontal",
  "rowing-barre": "tirage-horizontal",
  "tirage-poulie-basse": "tirage-horizontal",
  "rowing-elastique": "tirage-horizontal",
  superman: "superman",
  tractions: "tirage-vertical",
  "tractions-assistees-elastique": "tirage-vertical",
  "tirage-vertical-poulie": "tirage-vertical",
  "tirage-vertical-elastique": "tirage-vertical",
  "planche-laterale": "gainage-lateral",
  crunch: "crunch",
  "releve-de-jambes": "releve-jambes",
  "mountain-climbers": "mountain-climbers",
  burpees: "burpees",
  "jumping-jacks": "jumping-jacks",
  "tapis-de-course": "running",
  "velo-stationnaire": "cycling",
  "dips-banc": "dips",
  "curl-halteres": "curl",
  "curl-marteau": "curl",
  "curl-barre": "curl",
  "curl-elastique": "curl",
  "extension-triceps-halteres": "triceps",
  "triceps-poulie": "triceps",
  "pompes-diamant": "poussee-horizontale",
  "elevations-laterales": "epaules",
  "elevations-laterales-elastique": "epaules",
  "oiseau-halteres": "epaules",
  "mollets-debout": "mollets",
};

function visuelDe(exercice: Exercice): Visuel {
  const visuel = VISUEL_PAR_EXERCICE[exercice.id];
  if (visuel) return visuel;
  if (exercice.motifs.includes("squat")) return "squat";
  if (exercice.motifs.includes("charniere")) return "charniere";
  if (exercice.motifs.includes("fente")) return "fente";
  if (exercice.motifs.includes("poussee_horizontale")) return "poussee-horizontale";
  if (exercice.motifs.includes("poussee_verticale")) return "poussee-verticale";
  if (exercice.motifs.includes("tirage_horizontal")) return "tirage-horizontal";
  if (exercice.motifs.includes("tirage_vertical")) return "tirage-vertical";
  if (exercice.motifs.includes("gainage")) return "gainage";
  if (exercice.motifs.includes("biceps")) return "curl";
  if (exercice.motifs.includes("triceps")) return "triceps";
  if (exercice.motifs.includes("epaules_isolation")) return "epaules";
  if (exercice.motifs.includes("mollets")) return "mollets";
  return "cardio";
}

function Silhouette({ segments, decalage, compact = false }: { segments: Segments; decalage: number; compact?: boolean }) {
  const tete = segments[0];
  return (
    <g transform={`translate(${decalage} ${compact ? 15 : 0}) ${compact ? "scale(.55)" : ""}`} fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx={tete?.[0]} cy={tete?.[1] !== undefined ? tete[1] - 16 : 54} r="9" fill="currentColor" stroke="none" />
      {segments.map(([x1, y1, x2, y2], index) => (
        <line key={`${x1}-${y1}-${x2}-${y2}-${index}`} x1={x1} y1={y1} x2={x2} y2={y2} />
      ))}
    </g>
  );
}

function Equipement({ visuel, decalage, compact = false }: { visuel: Visuel; decalage: number; compact?: boolean }) {
  if (["poussee-horizontale", "tirage-horizontal", "tirage-vertical"].includes(visuel)) {
    return (
      <g transform={`translate(${decalage} ${compact ? 15 : 0}) ${compact ? "scale(.55)" : ""}`} fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round">
        <path d="M52 157H238" opacity=".28" />
        {visuel === "poussee-horizontale" ? <path d="M83 135H202M92 129V141M198 129V141" /> : null}
        {visuel === "tirage-vertical" ? <path d="M103 35V54M187 35V54M103 35H187" /> : null}
        {visuel === "tirage-horizontal" ? <path d="M205 118H239M232 111V125" /> : null}
      </g>
    );
  }
  return <g transform={`translate(${decalage} ${compact ? 15 : 0}) ${compact ? "scale(.55)" : ""}`} stroke="currentColor" strokeWidth="3" opacity=".22"><path d="M52 166H238" /></g>;
}

/** Schéma vectoriel original, simplifié et non substitutif aux consignes détaillées. */
export function IllustrationExercice({ exercice, compact = false }: { exercice: Exercice; compact?: boolean }) {
  if (exercice.id === "developpe-couche-halteres") {
    return (
      <figure className={`overflow-hidden rounded-xl border border-border bg-surface-raised ${compact ? "relative h-28" : ""}`}>
        <div className={`relative w-full ${compact ? "h-full" : "aspect-[3/2]"}`}>
          <Image
            src="/images/exercices/Guide%20du%20d%C3%A9velopp%C3%A9%20couch%C3%A9%20aux%20halt%C3%A8res%20(1).png"
            alt="Guide du développé couché aux haltères : quatre étapes illustrées, angles de vue, muscles sollicités et conseils d’exécution"
            fill
            sizes={compact ? "(min-width: 640px) 112px, 88px" : "(min-width: 1024px) 70vw, 100vw"}
            className="object-contain"
          />
        </div>
        <figcaption className={`text-xs text-text-meta ${compact ? "absolute inset-x-0 bottom-0 bg-text/75 px-2 py-1 text-center text-white" : "px-3 py-2"}`}>
          {compact ? "Guide illustré" : "Guide illustré : étapes, muscles sollicités et conseils d’exécution."}
        </figcaption>
      </figure>
    );
  }

  const visuel = visuelDe(exercice);
  const [depart, mouvement] = POSES[visuel];

  return (
    <figure className={`overflow-hidden rounded-xl border border-border bg-surface-raised ${compact ? "relative h-28" : ""}`}>
      <svg
        viewBox={compact ? "0 0 320 145" : "0 0 620 205"}
        role="img"
        aria-label={`Schéma simplifié de ${exercice.nom}, montrant la position de départ et le mouvement`}
        className={`block w-full text-primary ${compact ? "h-full" : "h-auto"}`}
      >
        {compact ? (
          <>
            <rect x="1" y="1" width="153" height="143" rx="14" fill="currentColor" opacity=".045" />
            <rect x="166" y="1" width="153" height="143" rx="14" fill="currentColor" opacity=".075" />
            <Equipement visuel={visuel} decalage={0} compact />
            <Silhouette segments={depart} decalage={0} compact />
            <path d="M149 72L160 72M155 67L160 72L155 77" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <Equipement visuel={visuel} decalage={-16} compact />
            <Silhouette segments={mouvement} decalage={-16} compact />
          </>
        ) : (
          <>
            <rect x="1" y="1" width="298" height="203" rx="16" fill="currentColor" opacity=".045" />
            <rect x="321" y="1" width="298" height="203" rx="16" fill="currentColor" opacity=".075" />
            <text x="20" y="27" className="fill-text-meta" fontSize="12" fontWeight="600">DÉPART</text>
            <text x="340" y="27" className="fill-text-meta" fontSize="12" fontWeight="600">MOUVEMENT</text>
            <Equipement visuel={visuel} decalage={0} />
            <Silhouette segments={depart} decalage={0} />
            <path d="M295 91L312 91M305 84L312 91L305 98" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            <Equipement visuel={visuel} decalage={320} />
            <Silhouette segments={mouvement} decalage={320} />
          </>
        )}
      </svg>
      <figcaption className={`text-xs text-text-meta ${compact ? "absolute inset-x-0 bottom-0 bg-text/75 px-2 py-1 text-center text-white" : "px-3 py-2"}`}>
        {compact ? "Schéma du mouvement" : "Schéma simplifié : suis les consignes et les précautions ci-dessous."}
      </figcaption>
    </figure>
  );
}

const ZONES_MUSCULAIRES: Record<string, readonly string[]> = {
  Quadriceps: ["cuisses"],
  "Ischio-jambiers": ["ischios"],
  Fessiers: ["fessiers"],
  Pectoraux: ["pectoraux"],
  Dos: ["dos"],
  "Chaîne postérieure": ["dos", "ischios", "fessiers"],
  Lombaires: ["dos"],
  "Corps entier": ["dos", "epaules", "pectoraux", "bras", "abdos", "cuisses", "mollets"],
  Épaules: ["epaules"],
  "Arrière d’épaules": ["epaules", "dos"],
  Biceps: ["bras"],
  Triceps: ["bras"],
  Abdominaux: ["abdos"],
  Obliques: ["abdos"],
  Gainage: ["abdos"],
  "Avant-bras": ["bras"],
  "Fléchisseurs de hanche": ["abdos", "cuisses"],
  Mollets: ["mollets"],
  Cardio: ["epaules", "pectoraux", "bras", "abdos", "cuisses", "mollets"],
};

/** Carte anatomique vectorielle des groupes sollicités (repère général, non médical). */
export function CarteMuscles({ exercice, compact = false }: { exercice: Exercice; compact?: boolean }) {
  const zones = new Set(exercice.secondaires.flatMap((groupe) => ZONES_MUSCULAIRES[groupe] ?? []));
  for (const zone of ZONES_MUSCULAIRES[exercice.groupe] ?? []) zones.add(zone);
  const muscle = (zone: string) => zones.has(zone);
  const actif = "var(--color-error)";
  const inactif = "#d8dee8";

  return (
    <svg
      viewBox="0 0 80 128"
      role="img"
      aria-label={`Groupes musculaires ciblés : ${[exercice.groupe, ...exercice.secondaires].join(", ")}`}
      className={`shrink-0 ${compact ? "h-20 w-10" : "h-24 w-14"}`}
    >
      <circle cx="40" cy="13" r="8" fill={inactif} />
      <path d="M31 24Q40 20 49 24L54 51 49 67 31 67 26 51Z" fill={inactif} />
      <path d="M27 27L18 31 11 54 16 56 26 43M53 27L62 31 69 54 64 56 54 43" fill="none" stroke={inactif} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M34 65L27 91 25 119M46 65L53 91 55 119" fill="none" stroke={inactif} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
      <ellipse cx="40" cy="39" rx="12" ry="8" fill={muscle("pectoraux") ? actif : "transparent"} />
      <ellipse cx="31" cy="29" rx="7" ry="5" fill={muscle("epaules") ? actif : "transparent"} />
      <ellipse cx="49" cy="29" rx="7" ry="5" fill={muscle("epaules") ? actif : "transparent"} />
      <ellipse cx="16" cy="44" rx="5" ry="10" fill={muscle("bras") ? actif : "transparent"} />
      <ellipse cx="64" cy="44" rx="5" ry="10" fill={muscle("bras") ? actif : "transparent"} />
      <ellipse cx="40" cy="55" rx="8" ry="10" fill={muscle("abdos") ? actif : "transparent"} />
      <ellipse cx="30" cy="78" rx="6" ry="15" fill={muscle("cuisses") ? actif : "transparent"} />
      <ellipse cx="50" cy="78" rx="6" ry="15" fill={muscle("cuisses") ? actif : "transparent"} />
      <ellipse cx="30" cy="93" rx="5" ry="11" fill={muscle("ischios") || muscle("fessiers") ? actif : "transparent"} />
      <ellipse cx="50" cy="93" rx="5" ry="11" fill={muscle("ischios") || muscle("fessiers") ? actif : "transparent"} />
      <ellipse cx="29" cy="112" rx="4" ry="8" fill={muscle("mollets") ? actif : "transparent"} />
      <ellipse cx="51" cy="112" rx="4" ry="8" fill={muscle("mollets") ? actif : "transparent"} />
      {muscle("fessiers") ? <path d="M31 62Q40 57 49 62L46 72 34 72Z" fill={actif} /> : null}
      {muscle("dos") ? <path d="M33 31L40 28 47 31 45 52 40 56 35 52Z" fill={actif} /> : null}
    </svg>
  );
}

export function IllustrationExerciceParId({ exerciceId }: { exerciceId: string }) {
  const exercice = trouverExercice(exerciceId);
  return exercice ? <IllustrationExercice exercice={exercice} /> : null;
}
