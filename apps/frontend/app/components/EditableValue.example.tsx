"use client";

/**
 * Exemple d'utilisation du composant EditableValue
 * 
 * Ce fichier montre différents cas d'usage du composant EditableValue.
 * Vous pouvez supprimer ce fichier une fois que vous avez compris comment l'utiliser.
 */

import { useState } from "react";
import { EditableValue } from "./EditableValue";

export function EditableValueExample() {
  // Exemple 1: Valeur simple (texte)
  const [nom, setNom] = useState("John Doe");

  // Exemple 2: Valeur numérique avec formatage
  const [montant, setMontant] = useState(1500);

  // Exemple 3: Avec texte indicatif statique
  const [email, setEmail] = useState("user@example.com");

  // Exemple 4: Avec texte indicatif dynamique (fonction)
  const [revenu, setRevenu] = useState(3000);

  // Fonction pour calculer le texte indicatif basé sur la valeur
  const getRevenuHint = (value: string | number) => {
    const numValue = Number(value);
    if (numValue < 1000) {
      return "Revenu très faible";
    } else if (numValue < 2000) {
      return "Revenu modeste";
    } else if (numValue < 5000) {
      return "Revenu confortable";
    } else {
      return "Revenu élevé";
    }
  };

  // Fonction de formatage pour l'affichage (ajoute le symbole €)
  const formatMontant = (value: string | number) => {
    return `${Number(value).toLocaleString("fr-FR")} €`;
  };

  // Fonction de formatage pour l'input (enlève le symbole €)
  const formatMontantInput = (value: string | number) => {
    return String(value).replace(/[^\d]/g, "");
  };

  // Fonction de parsing pour convertir l'input en nombre
  const parseMontant = (input: string) => {
    return Number(input.replace(/[^\d]/g, "")) || 0;
  };

  return (
    <div className="space-y-6 p-6">
      <h2 className="text-2xl font-semibold">Exemples d'utilisation</h2>

      {/* Exemple 1: Texte simple */}
      <EditableValue
        label="Nom"
        value={nom}
        onSave={async (newValue) => {
          // Simuler une mise à jour asynchrone
          await new Promise((resolve) => setTimeout(resolve, 500));
          setNom(newValue);
          // Ici vous pouvez appeler votre API pour mettre à jour les données
          console.log("Nom mis à jour:", newValue);
        }}
        hintText="Votre nom complet"
      />

      {/* Exemple 2: Montant avec formatage */}
      <EditableValue
        label="Montant mensuel"
        value={montant}
        onSave={async (newValue) => {
          await new Promise((resolve) => setTimeout(resolve, 500));
          setMontant(Number(newValue));
          console.log("Montant mis à jour:", newValue);
        }}
        formatValue={formatMontant}
        formatInput={formatMontantInput}
        parseValue={parseMontant}
        inputType="number"
        hintText="Montant en euros"
      />

      {/* Exemple 3: Email avec texte indicatif statique */}
      <EditableValue
        label="Email"
        value={email}
        onSave={async (newValue) => {
          await new Promise((resolve) => setTimeout(resolve, 500));
          setEmail(newValue);
          console.log("Email mis à jour:", newValue);
        }}
        inputType="email"
        hintText="Votre adresse email principale"
      />

      {/* Exemple 4: Revenu avec texte indicatif dynamique */}
      <EditableValue
        label="Revenu mensuel"
        value={revenu}
        onSave={async (newValue) => {
          await new Promise((resolve) => setTimeout(resolve, 500));
          setRevenu(Number(newValue));
          console.log("Revenu mis à jour:", newValue);
          // Ici vous pouvez mettre à jour toutes les données dépendantes
          // Par exemple, recalculer le bilan, les dépenses, etc.
        }}
        formatValue={formatMontant}
        formatInput={formatMontantInput}
        parseValue={parseMontant}
        inputType="number"
        hintText={getRevenuHint}
      />
    </div>
  );
}

