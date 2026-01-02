"use client";

import { EditableValue } from "./EditableValue";

type EditableValueEuroProps = Omit<
  React.ComponentProps<typeof EditableValue>,
  "formatValue" | "formatInput" | "parseValue" | "inputType"
> & {
  hintText?: string | ((value: string | number) => string);
};

/**
 * Composant spécialisé pour les valeurs monétaires en euros.
 * Pré-configuré avec le formatage monétaire, mais permet de personnaliser le hintText.
 */
export function EditableValueEuro({
  hintText,
  ...props
}: EditableValueEuroProps) {
  // Fonction de formatage pour l'affichage (ajoute le symbole €)
  const formatMontant = (value: string | number) => {
    return `${Number(value).toLocaleString("fr-FR")} €`;
  };

  // Fonction de formatage pour l'input (enlève les caractères non numériques)
  const formatMontantInput = (value: string | number) => {
    return String(value).replace(/[^\d]/g, "");
  };

  // Fonction de parsing pour convertir l'input en nombre
  const parseMontant = (input: string) => {
    return Number(input.replace(/[^\d]/g, "")) || 0;
  };

  return (
    <EditableValue
      {...props}
      formatValue={formatMontant}
      formatInput={formatMontantInput}
      parseValue={parseMontant}
      inputType="number"
      hintText={hintText}
    />
  );
}

