"use client";

import { useState } from "react";
import { EditableValueEuro } from "../components/EditableValueEuro";

export function DepensesFixesTab() {
  // Exemple d'utilisation du composant EditableValueEuro
  const [loyer, setLoyer] = useState(800);

  // Fonction pour le texte indicatif dynamique
  const getLoyerHint = (value: string | number) => {
    const numValue = Number(value);
    if (numValue === 0) {
      return "Aucun loyer défini";
    } else if (numValue < 500) {
      return "Loyer très bas";
    } else if (numValue < 1000) {
      return "Loyer modéré";
    } else {
      return "Loyer élevé";
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Dépenses fixes</h2>
      <p
        className="mt-2"
        style={{ color: "var(--theme-textSecondary)" }}
      >
        Gérez vos dépenses fixes mensuelles
      </p>

      <div className="mt-6 space-y-4">
        {/* Exemple d'utilisation du composant EditableValueEuro */}
        <EditableValueEuro
          label="Loyer mensuel"
          value={loyer}
          onSave={async (newValue) => {
            // Simuler une mise à jour asynchrone (remplacez par votre appel API)
            await new Promise((resolve) => setTimeout(resolve, 300));
            const newLoyer = Number(newValue);
            setLoyer(newLoyer);
            
            // Ici vous pouvez mettre à jour toutes les données dépendantes
            // Par exemple, recalculer le bilan, les totaux, etc.
            console.log("Loyer mis à jour:", newLoyer);
            // TODO: Appeler votre fonction de mise à jour globale ici
            // updateAllData({ loyer: newLoyer });
          }}
          hintText={getLoyerHint}
        />
      </div>
    </div>
  );
}
