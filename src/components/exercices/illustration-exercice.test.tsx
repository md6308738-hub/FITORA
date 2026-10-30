import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CATALOGUE } from "@/lib/exercices/catalogue";

import { CarteMuscles, IllustrationExercice } from "./illustration-exercice";

describe("IllustrationExercice", () => {
  it("fournit un schéma accessible pour chaque exercice du catalogue", () => {
    render(
      <div>
        {CATALOGUE.map((exercice) => (
          <div key={exercice.id}>
            <IllustrationExercice exercice={exercice} />
            <CarteMuscles exercice={exercice} />
          </div>
        ))}
      </div>,
    );

    expect(screen.getAllByRole("img")).toHaveLength(CATALOGUE.length * 2);
    for (const exercice of CATALOGUE) {
      const nomVisuel = exercice.id === "developpe-couche-halteres"
        ? "Guide du développé couché aux haltères : quatre étapes illustrées, angles de vue, muscles sollicités et conseils d’exécution"
        : `Schéma simplifié de ${exercice.nom}, montrant la position de départ et le mouvement`;
      expect(screen.getByRole("img", { name: nomVisuel })).toBeInTheDocument();
      expect(
        screen.getAllByRole("img", {
          name: `Groupes musculaires ciblés : ${[exercice.groupe, ...exercice.secondaires].join(", ")}`,
        }).length,
      ).toBeGreaterThan(0);
    }
  });
});
