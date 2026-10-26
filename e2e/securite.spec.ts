import { expect, test } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

import {
  clientConnecte,
  creerUtilisateurConfirme,
  supabaseConfigure,
  supprimerUtilisateur,
} from "./outils/supabase";

/** Isolation des données entre comptes (sécurité par ligne), testée directement sur la base. */
test.skip(!supabaseConfigure, "Supabase n'est pas configuré (.env.local).");
// Test de base de données : inutile de le répéter pour chaque appareil.
test.skip(({ isMobile }) => isMobile, "Exécuté une seule fois.");

test("un utilisateur n'accède jamais aux données d'un autre", async () => {
  const awa = await creerUtilisateurConfirme("Awa", "Ndiaye");
  const moussa = await creerUtilisateurConfirme("Moussa", "Diop");
  try {
    const clientAwa = await clientConnecte(awa.email);
    const clientMoussa = await clientConnecte(moussa.email);

    // Awa enregistre ses données.
    expect((await clientAwa.from("pesees").insert({ mesure_le: "2026-10-26", poids_kg: 70 })).error).toBeNull();
    expect((await clientAwa.from("prises_eau").insert({ jour: "2026-10-26", quantite_ml: 250 })).error).toBeNull();

    // Chacun ne voit que son propre profil.
    const profilsVus = await clientMoussa.from("profils").select("id");
    expect(profilsVus.data?.map((p) => p.id)).toEqual([moussa.id]);

    // Moussa ne voit aucune donnée d'Awa.
    expect((await clientMoussa.from("pesees").select("*")).data).toEqual([]);
    expect((await clientMoussa.from("prises_eau").select("*")).data).toEqual([]);

    // Moussa ne peut ni modifier le profil d'Awa, ni supprimer ses pesées.
    const modification = await clientMoussa.from("profils").update({ prenom: "Pirate" }).eq("id", awa.id).select();
    expect(modification.data).toEqual([]);
    const suppression = await clientMoussa.from("pesees").delete().eq("user_id", awa.id).select();
    expect(suppression.data).toEqual([]);

    // Moussa ne peut pas écrire au nom d'Awa.
    const usurpation = await clientMoussa
      .from("pesees")
      .insert({ user_id: awa.id, mesure_le: "2026-10-25", poids_kg: 120 });
    expect(usurpation.error).not.toBeNull();

    // Les données d'Awa sont intactes.
    const peseesAwa = await clientAwa.from("pesees").select("poids_kg");
    expect(peseesAwa.data).toEqual([{ poids_kg: 70 }]);
    const profilAwa = await clientAwa.from("profils").select("prenom").single();
    expect(profilAwa.data?.prenom).toBe("Awa");

    // Programmes et séances : invisibles et non modifiables par un autre compte.
    const programme = await clientAwa
      .from("programmes")
      .insert({ titre: "Test", objectif: "force", niveau: "debutant", jours_par_semaine: 3, duree_seance_min: 45 })
      .select("id")
      .single();
    expect(programme.error).toBeNull();
    const seanceType = await clientAwa
      .from("programme_seances")
      .insert({ programme_id: programme.data?.id ?? "", ordre: 1, nom: "A", jour_semaine: 1 })
      .select("id")
      .single();
    expect(seanceType.error).toBeNull();
    expect((await clientMoussa.from("programmes").select("*")).data).toEqual([]);
    // Moussa ne peut pas rattacher une séance au programme d'Awa.
    const intrusion = await clientMoussa
      .from("programme_seances")
      .insert({ programme_id: programme.data?.id ?? "", ordre: 2, nom: "Intrus", jour_semaine: 2 });
    expect(intrusion.error).not.toBeNull();
    const seanceVolee = await clientMoussa
      .from("seances")
      .insert({ id: crypto.randomUUID(), programme_seance_id: seanceType.data?.id ?? null, nom: "Intrus" });
    expect(seanceVolee.error).not.toBeNull();

    // Un visiteur anonyme n'a aucun accès.
    const anonyme = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "",
    );
    expect((await anonyme.from("profils").select("*")).error).not.toBeNull();
    expect((await anonyme.from("pesees").select("*")).error).not.toBeNull();
    expect((await anonyme.from("programmes").select("*")).error).not.toBeNull();
    expect((await anonyme.from("seances").select("*")).error).not.toBeNull();
  } finally {
    await supprimerUtilisateur(awa.id);
    await supprimerUtilisateur(moussa.id);
  }
});
