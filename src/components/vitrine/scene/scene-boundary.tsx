"use client";

import { Component, type ReactNode } from "react";

type Props = { children: ReactNode; onErreur: () => void };

/** Si la scène 3D échoue (ressource, pilote graphique), la page reste utilisable : on bascule sur la photo. */
export class SceneBoundary extends Component<Props, { erreur: boolean }> {
  override state = { erreur: false };

  static getDerivedStateFromError() {
    return { erreur: true };
  }

  override componentDidCatch(erreur: unknown) {
    console.warn("Scène 3D indisponible, affichage de la photo de secours.", erreur);
    this.props.onErreur();
  }

  override render() {
    return this.state.erreur ? null : this.props.children;
  }
}
