import type { NiveauSportif } from "@/types/database";

/** Schéma de mouvement : sert au générateur pour composer des séances équilibrées. */
export type Motif =
  | "squat"
  | "charniere"
  | "fente"
  | "poussee_horizontale"
  | "poussee_verticale"
  | "tirage_horizontal"
  | "tirage_vertical"
  | "gainage"
  | "biceps"
  | "triceps"
  | "epaules_isolation"
  | "mollets"
  | "cardio";

export type Materiel =
  | "poids_du_corps"
  | "halteres"
  | "barre"
  | "banc"
  | "poulie"
  | "machine"
  | "elastique"
  | "barre_traction"
  | "tapis_course"
  | "velo";

export type Exercice = {
  id: string;
  nom: string;
  motifs: readonly Motif[];
  groupe: string;
  secondaires: readonly string[];
  /** Tout le matériel nécessaire. */
  materiel: readonly Materiel[];
  niveau: NiveauSportif;
  mesure: "repetitions" | "duree";
  consignes: readonly string[];
  precautions: readonly string[];
  erreurs: readonly string[];
};

export const LIBELLES_MATERIEL: Record<Materiel, string> = {
  poids_du_corps: "Poids du corps",
  halteres: "Haltères",
  barre: "Barre",
  banc: "Banc",
  poulie: "Poulie",
  machine: "Machine",
  elastique: "Élastique",
  barre_traction: "Barre de traction",
  tapis_course: "Tapis de course",
  velo: "Vélo d’appartement",
};

/** Mouvements qui sollicitent plusieurs articulations (charges plus lourdes, repos plus longs). */
export const MOTIFS_POLYARTICULAIRES: readonly Motif[] = [
  "squat",
  "charniere",
  "fente",
  "poussee_horizontale",
  "poussee_verticale",
  "tirage_horizontal",
  "tirage_vertical",
];

const DOS_DROIT = "Garde le dos neutre et le gainage actif pendant tout le mouvement.";
const DOULEUR = "Arrête en cas de douleur articulaire et demande l’avis d’un professionnel.";

export const CATALOGUE: readonly Exercice[] = [
  // --- Squat ---
  {
    id: "squat-poids-du-corps", nom: "Squat au poids du corps", motifs: ["squat"], groupe: "Quadriceps",
    secondaires: ["Fessiers", "Ischio-jambiers"], materiel: ["poids_du_corps"], niveau: "debutant", mesure: "repetitions",
    consignes: ["Pieds largeur d’épaules, pointes légèrement ouvertes.", "Descends en poussant les hanches en arrière, genoux dans l’axe des pieds.", "Remonte en poussant dans le sol, talons au sol."],
    precautions: [DOS_DROIT], erreurs: ["Genoux qui rentrent vers l’intérieur.", "Talons qui décollent."],
  },
  {
    id: "goblet-squat", nom: "Goblet squat", motifs: ["squat"], groupe: "Quadriceps",
    secondaires: ["Fessiers", "Gainage"], materiel: ["halteres"], niveau: "debutant", mesure: "repetitions",
    consignes: ["Tiens un haltère verticalement contre la poitrine.", "Descends entre tes jambes, coudes à l’intérieur des genoux.", "Remonte buste droit."],
    precautions: [DOS_DROIT], erreurs: ["Buste qui s’effondre vers l’avant."],
  },
  {
    id: "squat-barre", nom: "Squat à la barre", motifs: ["squat"], groupe: "Quadriceps",
    secondaires: ["Fessiers", "Lombaires"], materiel: ["barre"], niveau: "intermediaire", mesure: "repetitions",
    consignes: ["Barre posée sur le haut du dos, mains serrées sur la barre.", "Inspire, gaine, descends au moins à la parallèle si ta mobilité le permet.", "Remonte en gardant la poitrine haute."],
    precautions: [DOS_DROIT, "Utilise les sécurités de la cage à squat."], erreurs: ["Dos qui s’arrondit en bas du mouvement.", "Charge trop lourde au détriment de l’amplitude."],
  },
  {
    id: "presse-a-cuisses", nom: "Presse à cuisses", motifs: ["squat"], groupe: "Quadriceps",
    secondaires: ["Fessiers"], materiel: ["machine"], niveau: "debutant", mesure: "repetitions",
    consignes: ["Dos et bassin plaqués contre le dossier.", "Descends la plateforme jusqu’à environ 90° aux genoux.", "Pousse sans verrouiller les genoux en haut."],
    precautions: ["Ne décolle jamais le bas du dos du siège."], erreurs: ["Genoux verrouillés en extension."],
  },
  {
    id: "squat-saute", nom: "Squat sauté", motifs: ["squat", "cardio"], groupe: "Quadriceps",
    secondaires: ["Fessiers", "Mollets"], materiel: ["poids_du_corps"], niveau: "intermediaire", mesure: "repetitions",
    consignes: ["Descends en squat contrôlé.", "Saute en poussant fort dans le sol.", "Réceptionne-toi en douceur, genoux fléchis."],
    precautions: ["À éviter en cas de douleur aux genoux ou aux chevilles."], erreurs: ["Réception jambes tendues."],
  },
  // --- Charnière de hanche ---
  {
    id: "souleve-de-terre-roumain-halteres", nom: "Soulevé de terre roumain aux haltères", motifs: ["charniere"], groupe: "Ischio-jambiers",
    secondaires: ["Fessiers", "Lombaires"], materiel: ["halteres"], niveau: "debutant", mesure: "repetitions",
    consignes: ["Debout, haltères devant les cuisses, genoux légèrement fléchis.", "Bascule le buste en reculant les hanches, haltères le long des jambes.", "Remonte en serrant les fessiers."],
    precautions: [DOS_DROIT], erreurs: ["Dos arrondi.", "Flexion excessive des genoux (le mouvement devient un squat)."],
  },
  {
    id: "souleve-de-terre-barre", nom: "Soulevé de terre à la barre", motifs: ["charniere"], groupe: "Chaîne postérieure",
    secondaires: ["Dos", "Avant-bras"], materiel: ["barre"], niveau: "intermediaire", mesure: "repetitions",
    consignes: ["Barre au-dessus du milieu des pieds, prise juste à l’extérieur des jambes.", "Gaine, épaules au-dessus de la barre, pousse le sol avec les jambes.", "Termine debout, hanches verrouillées, sans cambrer."],
    precautions: [DOS_DROIT, "Commence léger pour maîtriser la technique."], erreurs: ["Barre qui s’éloigne des jambes.", "Hyperextension en fin de mouvement."],
  },
  {
    id: "hip-thrust", nom: "Hip thrust", motifs: ["charniere"], groupe: "Fessiers",
    secondaires: ["Ischio-jambiers"], materiel: ["barre", "banc"], niveau: "intermediaire", mesure: "repetitions",
    consignes: ["Haut du dos appuyé sur le banc, barre sur les hanches (avec protection).", "Monte les hanches jusqu’à l’alignement épaules-genoux.", "Marque une pause en haut, redescends lentement."],
    precautions: ["Utilise un coussin sous la barre."], erreurs: ["Cambrure du bas du dos en haut."],
  },
  {
    id: "pont-fessier", nom: "Pont fessier", motifs: ["charniere"], groupe: "Fessiers",
    secondaires: ["Ischio-jambiers", "Gainage"], materiel: ["poids_du_corps"], niveau: "debutant", mesure: "repetitions",
    consignes: ["Allongé sur le dos, pieds à plat près des fessiers.", "Monte le bassin en serrant les fessiers.", "Redescends sans poser complètement les fessiers."],
    precautions: [], erreurs: ["Pousser avec le bas du dos au lieu des fessiers."],
  },
  // --- Fentes ---
  {
    id: "fentes-avant", nom: "Fentes avant", motifs: ["fente"], groupe: "Quadriceps",
    secondaires: ["Fessiers"], materiel: ["poids_du_corps"], niveau: "debutant", mesure: "repetitions",
    consignes: ["Fais un grand pas en avant.", "Descends jusqu’à ce que le genou arrière frôle le sol.", "Reviens en poussant sur la jambe avant."],
    precautions: ["Garde le genou avant dans l’axe du pied."], erreurs: ["Pas trop court, genou qui dépasse beaucoup."],
  },
  {
    id: "fentes-marchees-halteres", nom: "Fentes marchées aux haltères", motifs: ["fente"], groupe: "Quadriceps",
    secondaires: ["Fessiers", "Gainage"], materiel: ["halteres"], niveau: "intermediaire", mesure: "repetitions",
    consignes: ["Un haltère dans chaque main, bras le long du corps.", "Avance en fente, alterne les jambes à chaque pas.", "Buste droit, regard devant."],
    precautions: ["Prévois assez d’espace dégagé."], erreurs: ["Buste penché vers l’avant."],
  },
  {
    id: "squat-bulgare", nom: "Squat bulgare", motifs: ["fente"], groupe: "Quadriceps",
    secondaires: ["Fessiers"], materiel: ["halteres", "banc"], niveau: "intermediaire", mesure: "repetitions",
    consignes: ["Pied arrière posé sur un banc.", "Descends verticalement sur la jambe avant.", "Remonte en poussant dans le talon avant."],
    precautions: ["Commence sans charge pour trouver l’équilibre."], erreurs: ["Pied avant trop proche du banc."],
  },
  // --- Poussée horizontale ---
  {
    id: "pompes-genoux", nom: "Pompes sur les genoux", motifs: ["poussee_horizontale"], groupe: "Pectoraux",
    secondaires: ["Triceps", "Épaules"], materiel: ["poids_du_corps"], niveau: "debutant", mesure: "repetitions",
    consignes: ["Mains un peu plus larges que les épaules, genoux au sol.", "Descends la poitrine vers le sol, corps aligné des genoux à la tête.", "Pousse pour remonter."],
    precautions: [], erreurs: ["Fesses en l’air."],
  },
  {
    id: "pompes", nom: "Pompes", motifs: ["poussee_horizontale"], groupe: "Pectoraux",
    secondaires: ["Triceps", "Épaules", "Gainage"], materiel: ["poids_du_corps"], niveau: "intermediaire", mesure: "repetitions",
    consignes: ["Corps gainé en planche, mains sous les épaules.", "Descends jusqu’à frôler le sol, coudes à environ 45°.", "Remonte en gardant l’alignement."],
    precautions: [], erreurs: ["Bassin qui s’affaisse.", "Coudes écartés à 90°."],
  },
  {
    id: "developpe-couche-halteres", nom: "Développé couché aux haltères", motifs: ["poussee_horizontale"], groupe: "Pectoraux",
    secondaires: ["Triceps", "Épaules"], materiel: ["halteres", "banc"], niveau: "debutant", mesure: "repetitions",
    consignes: ["Allongé sur le banc, pieds au sol, omoplates serrées.", "Descends les haltères au niveau de la poitrine.", "Pousse vers le haut sans claquer les haltères."],
    precautions: ["Descends les haltères sur les cuisses avant de te relever."], erreurs: ["Fesses qui décollent du banc."],
  },
  {
    id: "developpe-sol-halteres", nom: "Développé au sol aux haltères", motifs: ["poussee_horizontale"], groupe: "Pectoraux",
    secondaires: ["Triceps"], materiel: ["halteres"], niveau: "debutant", mesure: "repetitions",
    consignes: ["Allongé au sol, genoux fléchis, haltères au-dessus de la poitrine.", "Descends jusqu’à ce que les coudes touchent le sol.", "Pousse vers le haut."],
    precautions: [], erreurs: ["Coudes qui rebondissent sur le sol."],
  },
  {
    id: "developpe-couche-barre", nom: "Développé couché à la barre", motifs: ["poussee_horizontale"], groupe: "Pectoraux",
    secondaires: ["Triceps", "Épaules"], materiel: ["barre", "banc"], niveau: "intermediaire", mesure: "repetitions",
    consignes: ["Yeux sous la barre, omoplates serrées, pieds ancrés.", "Descends la barre sur le bas des pectoraux.", "Pousse en ligne légèrement oblique vers les épaules."],
    precautions: ["Travaille avec un partenaire ou des sécurités."], erreurs: ["Rebond de la barre sur la poitrine."],
  },
  {
    id: "pompes-declinees", nom: "Pompes déclinées", motifs: ["poussee_horizontale"], groupe: "Pectoraux",
    secondaires: ["Épaules", "Triceps"], materiel: ["poids_du_corps"], niveau: "avance", mesure: "repetitions",
    consignes: ["Pieds surélevés sur un support stable.", "Descends la poitrine vers le sol en restant gainé.", "Remonte sans cambrer."],
    precautions: [], erreurs: ["Bassin qui s’affaisse."],
  },
  // --- Poussée verticale ---
  {
    id: "developpe-militaire-halteres", nom: "Développé épaules aux haltères", motifs: ["poussee_verticale"], groupe: "Épaules",
    secondaires: ["Triceps"], materiel: ["halteres"], niveau: "debutant", mesure: "repetitions",
    consignes: ["Haltères à hauteur des épaules, paumes vers l’avant.", "Pousse au-dessus de la tête sans cambrer.", "Redescends lentement."],
    precautions: [DOS_DROIT], erreurs: ["Cambrure excessive du bas du dos."],
  },
  {
    id: "developpe-militaire-barre", nom: "Développé militaire à la barre", motifs: ["poussee_verticale"], groupe: "Épaules",
    secondaires: ["Triceps", "Gainage"], materiel: ["barre"], niveau: "intermediaire", mesure: "repetitions",
    consignes: ["Barre sur le haut de la poitrine, fessiers serrés.", "Pousse la barre au-dessus de la tête, tête qui passe sous la barre.", "Redescends sous contrôle."],
    precautions: [DOS_DROIT], erreurs: ["Pousser avec les jambes (devient un push-press)."],
  },
  {
    id: "pompes-pike", nom: "Pompes piquées", motifs: ["poussee_verticale"], groupe: "Épaules",
    secondaires: ["Triceps"], materiel: ["poids_du_corps"], niveau: "intermediaire", mesure: "repetitions",
    consignes: ["Position en V inversé, hanches hautes.", "Descends la tête vers le sol entre les mains.", "Pousse pour revenir."],
    precautions: [], erreurs: ["Coudes trop écartés."],
  },
  {
    id: "developpe-epaules-elastique", nom: "Développé épaules à l’élastique", motifs: ["poussee_verticale"], groupe: "Épaules",
    secondaires: ["Triceps"], materiel: ["elastique"], niveau: "debutant", mesure: "repetitions",
    consignes: ["Élastique sous les pieds, poignées aux épaules.", "Pousse au-dessus de la tête.", "Redescends lentement."],
    precautions: ["Vérifie l’état de l’élastique avant usage."], erreurs: ["Cambrure du bas du dos."],
  },
  // --- Tirage horizontal ---
  {
    id: "rowing-haltere-un-bras", nom: "Rowing haltère un bras", motifs: ["tirage_horizontal"], groupe: "Dos",
    secondaires: ["Biceps", "Arrière d’épaules"], materiel: ["halteres"], niveau: "debutant", mesure: "repetitions",
    consignes: ["Main et genou en appui (banc ou chaise), dos plat.", "Tire l’haltère vers la hanche, coude près du corps.", "Redescends bras tendu."],
    precautions: [DOS_DROIT], erreurs: ["Rotation du buste pour tirer."],
  },
  {
    id: "rowing-barre", nom: "Rowing à la barre", motifs: ["tirage_horizontal"], groupe: "Dos",
    secondaires: ["Biceps", "Lombaires"], materiel: ["barre"], niveau: "intermediaire", mesure: "repetitions",
    consignes: ["Buste penché à environ 45°, dos plat.", "Tire la barre vers le nombril.", "Redescends sous contrôle."],
    precautions: [DOS_DROIT], erreurs: ["Élan avec le buste."],
  },
  {
    id: "tirage-poulie-basse", nom: "Tirage horizontal à la poulie", motifs: ["tirage_horizontal"], groupe: "Dos",
    secondaires: ["Biceps"], materiel: ["poulie"], niveau: "debutant", mesure: "repetitions",
    consignes: ["Assis, pieds calés, dos droit.", "Tire la poignée vers le ventre en serrant les omoplates.", "Reviens bras tendus sans arrondir le dos."],
    precautions: [], erreurs: ["Se pencher en arrière pour tirer."],
  },
  {
    id: "rowing-elastique", nom: "Rowing à l’élastique", motifs: ["tirage_horizontal"], groupe: "Dos",
    secondaires: ["Biceps"], materiel: ["elastique"], niveau: "debutant", mesure: "repetitions",
    consignes: ["Élastique fixé devant toi à hauteur du ventre.", "Tire en serrant les omoplates.", "Reviens lentement."],
    precautions: ["Vérifie l’ancrage de l’élastique."], erreurs: ["Épaules qui montent vers les oreilles."],
  },
  {
    id: "superman", nom: "Superman", motifs: ["tirage_horizontal", "tirage_vertical"], groupe: "Lombaires",
    secondaires: ["Dos", "Fessiers"], materiel: ["poids_du_corps"], niveau: "debutant", mesure: "repetitions",
    consignes: ["Allongé sur le ventre, bras tendus devant.", "Décolle bras et jambes en serrant les omoplates.", "Tiens une seconde puis redescends."],
    precautions: ["Mouvement lent et contrôlé, sans à-coups."], erreurs: ["Cou en hyperextension."],
  },
  // --- Tirage vertical ---
  {
    id: "tractions", nom: "Tractions", motifs: ["tirage_vertical"], groupe: "Dos",
    secondaires: ["Biceps", "Avant-bras"], materiel: ["barre_traction"], niveau: "intermediaire", mesure: "repetitions",
    consignes: ["Suspendu, mains un peu plus larges que les épaules.", "Tire jusqu’à passer le menton au-dessus de la barre.", "Redescends bras tendus sous contrôle."],
    precautions: [], erreurs: ["Balancer le corps pour monter."],
  },
  {
    id: "tractions-assistees-elastique", nom: "Tractions assistées à l’élastique", motifs: ["tirage_vertical"], groupe: "Dos",
    secondaires: ["Biceps"], materiel: ["barre_traction", "elastique"], niveau: "debutant", mesure: "repetitions",
    consignes: ["Élastique accroché à la barre, un pied ou un genou dedans.", "Tire jusqu’au menton au-dessus de la barre.", "Redescends lentement."],
    precautions: ["Vérifie la fixation de l’élastique."], erreurs: ["Amplitude incomplète."],
  },
  {
    id: "tirage-vertical-poulie", nom: "Tirage vertical à la poulie", motifs: ["tirage_vertical"], groupe: "Dos",
    secondaires: ["Biceps"], materiel: ["poulie"], niveau: "debutant", mesure: "repetitions",
    consignes: ["Assis, cuisses calées, prise large.", "Tire la barre vers le haut de la poitrine.", "Remonte bras tendus sous contrôle."],
    precautions: ["Ne tire pas la barre derrière la nuque."], erreurs: ["Se pencher fortement en arrière."],
  },
  {
    id: "tirage-vertical-elastique", nom: "Tirage vertical à l’élastique", motifs: ["tirage_vertical"], groupe: "Dos",
    secondaires: ["Biceps"], materiel: ["elastique"], niveau: "debutant", mesure: "repetitions",
    consignes: ["Élastique fixé en hauteur.", "Tire les mains vers les épaules en abaissant les coudes.", "Reviens lentement."],
    precautions: ["Vérifie l’ancrage de l’élastique."], erreurs: ["Épaules qui montent."],
  },
  // --- Gainage ---
  {
    id: "planche", nom: "Planche", motifs: ["gainage"], groupe: "Abdominaux",
    secondaires: ["Épaules"], materiel: ["poids_du_corps"], niveau: "debutant", mesure: "duree",
    consignes: ["Appui sur les avant-bras et les pointes de pieds.", "Corps aligné de la tête aux talons.", "Respire calmement pendant toute la durée."],
    precautions: [], erreurs: ["Bassin trop haut ou qui s’affaisse."],
  },
  {
    id: "planche-laterale", nom: "Planche latérale", motifs: ["gainage"], groupe: "Obliques",
    secondaires: ["Épaules"], materiel: ["poids_du_corps"], niveau: "debutant", mesure: "duree",
    consignes: ["Sur le côté, appui sur un avant-bras.", "Monte le bassin pour aligner le corps.", "Change de côté à mi-temps."],
    precautions: [], erreurs: ["Bassin qui tombe."],
  },
  {
    id: "crunch", nom: "Crunch", motifs: ["gainage"], groupe: "Abdominaux",
    secondaires: [], materiel: ["poids_du_corps"], niveau: "debutant", mesure: "repetitions",
    consignes: ["Allongé, genoux fléchis, mains aux tempes.", "Enroule le haut du dos en expirant.", "Redescends lentement."],
    precautions: ["Ne tire pas sur la nuque."], erreurs: ["Monter avec l’élan des bras."],
  },
  {
    id: "releve-de-jambes", nom: "Relevé de jambes allongé", motifs: ["gainage"], groupe: "Abdominaux",
    secondaires: ["Fléchisseurs de hanche"], materiel: ["poids_du_corps"], niveau: "intermediaire", mesure: "repetitions",
    consignes: ["Allongé, mains sous les fessiers.", "Monte les jambes tendues à la verticale.", "Redescends sans toucher le sol, bas du dos plaqué."],
    precautions: ["Plie les genoux si le bas du dos décolle."], erreurs: ["Bas du dos qui se cambre."],
  },
  {
    id: "mountain-climbers", nom: "Mountain climbers", motifs: ["gainage", "cardio"], groupe: "Abdominaux",
    secondaires: ["Épaules", "Cardio"], materiel: ["poids_du_corps"], niveau: "debutant", mesure: "duree",
    consignes: ["Position de pompe, bras tendus.", "Ramène les genoux vers la poitrine en alternance, rapidement.", "Garde les hanches basses."],
    precautions: [], erreurs: ["Hanches trop hautes."],
  },
  // --- Bras et épaules (isolation) ---
  {
    id: "curl-halteres", nom: "Curl biceps aux haltères", motifs: ["biceps"], groupe: "Biceps",
    secondaires: ["Avant-bras"], materiel: ["halteres"], niveau: "debutant", mesure: "repetitions",
    consignes: ["Debout ou assis, bras le long du corps.", "Fléchis les coudes en tournant les paumes vers le haut.", "Redescends lentement sans balancer."],
    precautions: [], erreurs: ["Élan du buste.", "Coudes qui avancent."],
  },
  {
    id: "curl-marteau", nom: "Curl marteau", motifs: ["biceps"], groupe: "Biceps",
    secondaires: ["Avant-bras"], materiel: ["halteres"], niveau: "debutant", mesure: "repetitions",
    consignes: ["Prise neutre, pouces vers le haut.", "Fléchis les coudes, bras collés au corps.", "Redescends sous contrôle."],
    precautions: [], erreurs: ["Balancer les haltères."],
  },
  {
    id: "curl-barre", nom: "Curl à la barre", motifs: ["biceps"], groupe: "Biceps",
    secondaires: ["Avant-bras"], materiel: ["barre"], niveau: "debutant", mesure: "repetitions",
    consignes: ["Prise en supination, largeur d’épaules.", "Monte la barre en gardant les coudes fixes.", "Redescends lentement."],
    precautions: [], erreurs: ["Cambrer pour monter la charge."],
  },
  {
    id: "curl-elastique", nom: "Curl à l’élastique", motifs: ["biceps"], groupe: "Biceps",
    secondaires: [], materiel: ["elastique"], niveau: "debutant", mesure: "repetitions",
    consignes: ["Élastique sous les pieds.", "Fléchis les coudes, paumes vers le haut.", "Reviens lentement."],
    precautions: [], erreurs: ["Coudes qui s’écartent du corps."],
  },
  {
    id: "extension-triceps-halteres", nom: "Extension triceps à l’haltère", motifs: ["triceps"], groupe: "Triceps",
    secondaires: [], materiel: ["halteres"], niveau: "debutant", mesure: "repetitions",
    consignes: ["Haltère tenu à deux mains au-dessus de la tête.", "Descends derrière la tête en pliant les coudes.", "Remonte en tendant les bras."],
    precautions: ["Commence léger : mouvement exigeant pour les coudes."], erreurs: ["Coudes très écartés."],
  },
  {
    id: "triceps-poulie", nom: "Extension triceps à la poulie", motifs: ["triceps"], groupe: "Triceps",
    secondaires: [], materiel: ["poulie"], niveau: "debutant", mesure: "repetitions",
    consignes: ["Face à la poulie haute, coudes collés au corps.", "Tends les bras vers le bas.", "Remonte jusqu’à 90°."],
    precautions: [], erreurs: ["Coudes qui bougent."],
  },
  {
    id: "dips-banc", nom: "Dips sur banc", motifs: ["triceps"], groupe: "Triceps",
    secondaires: ["Pectoraux", "Épaules"], materiel: ["poids_du_corps"], niveau: "debutant", mesure: "repetitions",
    consignes: ["Mains sur un banc ou une chaise stable derrière toi.", "Descends en pliant les coudes jusqu’à 90°.", "Remonte en poussant."],
    precautions: ["À éviter en cas de douleur à l’avant de l’épaule."], erreurs: ["Descendre trop bas."],
  },
  {
    id: "pompes-diamant", nom: "Pompes diamant", motifs: ["triceps"], groupe: "Triceps",
    secondaires: ["Pectoraux"], materiel: ["poids_du_corps"], niveau: "intermediaire", mesure: "repetitions",
    consignes: ["Mains rapprochées formant un losange sous la poitrine.", "Descends coudes près du corps.", "Remonte gainé."],
    precautions: [], erreurs: ["Bassin qui s’affaisse."],
  },
  {
    id: "elevations-laterales", nom: "Élévations latérales", motifs: ["epaules_isolation"], groupe: "Épaules",
    secondaires: [], materiel: ["halteres"], niveau: "debutant", mesure: "repetitions",
    consignes: ["Haltères le long du corps, coudes légèrement fléchis.", "Monte les bras sur les côtés jusqu’à l’horizontale.", "Redescends lentement."],
    precautions: [], erreurs: ["Monter au-dessus des épaules avec élan."],
  },
  {
    id: "elevations-laterales-elastique", nom: "Élévations latérales à l’élastique", motifs: ["epaules_isolation"], groupe: "Épaules",
    secondaires: [], materiel: ["elastique"], niveau: "debutant", mesure: "repetitions",
    consignes: ["Élastique sous les pieds.", "Monte les bras sur les côtés.", "Reviens lentement."],
    precautions: [], erreurs: ["Hausser les épaules."],
  },
  {
    id: "oiseau-halteres", nom: "Oiseau aux haltères", motifs: ["epaules_isolation"], groupe: "Arrière d’épaules",
    secondaires: ["Haut du dos"], materiel: ["halteres"], niveau: "debutant", mesure: "repetitions",
    consignes: ["Buste penché, dos plat.", "Écarte les bras sur les côtés.", "Redescends sous contrôle."],
    precautions: [DOS_DROIT], erreurs: ["Charge trop lourde."],
  },
  {
    id: "mollets-debout", nom: "Extensions des mollets debout", motifs: ["mollets"], groupe: "Mollets",
    secondaires: [], materiel: ["poids_du_corps"], niveau: "debutant", mesure: "repetitions",
    consignes: ["Debout sur le bord d’une marche.", "Monte sur la pointe des pieds.", "Redescends lentement sous le niveau de la marche."],
    precautions: ["Tiens-toi à un appui stable."], erreurs: ["Mouvement trop rapide."],
  },
  // --- Cardio ---
  {
    id: "jumping-jacks", nom: "Jumping jacks", motifs: ["cardio"], groupe: "Cardio",
    secondaires: [], materiel: ["poids_du_corps"], niveau: "debutant", mesure: "duree",
    consignes: ["Saute en écartant bras et jambes.", "Reviens pieds joints, bras le long du corps.", "Garde un rythme régulier."],
    precautions: [DOULEUR], erreurs: ["Réception sur les talons."],
  },
  {
    id: "burpees", nom: "Burpees", motifs: ["cardio"], groupe: "Cardio",
    secondaires: ["Corps entier"], materiel: ["poids_du_corps"], niveau: "intermediaire", mesure: "duree",
    consignes: ["Descends en squat, mains au sol.", "Lance les pieds en arrière en planche, puis ramène-les.", "Remonte et saute bras en l’air."],
    precautions: [DOULEUR], erreurs: ["Dos qui s’affaisse en planche."],
  },
  {
    id: "tapis-de-course", nom: "Tapis de course", motifs: ["cardio"], groupe: "Cardio",
    secondaires: [], materiel: ["tapis_course"], niveau: "debutant", mesure: "duree",
    consignes: ["Commence par 2 minutes de marche.", "Cours à une allure où tu peux encore parler.", "Termine par 2 minutes de marche."],
    precautions: ["Utilise la clé de sécurité du tapis."], erreurs: ["Se tenir aux poignées en courant."],
  },
  {
    id: "velo-stationnaire", nom: "Vélo d’appartement", motifs: ["cardio"], groupe: "Cardio",
    secondaires: ["Quadriceps"], materiel: ["velo"], niveau: "debutant", mesure: "duree",
    consignes: ["Règle la selle : jambe presque tendue en bas.", "Pédale à cadence régulière.", "Augmente la résistance progressivement."],
    precautions: [], erreurs: ["Selle trop basse."],
  },
];

const PAR_ID = new Map(CATALOGUE.map((exercice) => [exercice.id, exercice]));

export function trouverExercice(id: string): Exercice | undefined {
  return PAR_ID.get(id);
}

export const IDS_EXERCICES = CATALOGUE.map((exercice) => exercice.id);

/** Exercices de remplacement : mêmes schémas de mouvement, autre matériel ou niveau. */
export function alternatives(exercice: Exercice): Exercice[] {
  return CATALOGUE.filter(
    (autre) => autre.id !== exercice.id && autre.motifs.some((motif) => exercice.motifs.includes(motif)),
  );
}

export const ORDRE_NIVEAU: Record<NiveauSportif, number> = { debutant: 0, intermediaire: 1, avance: 2 };
