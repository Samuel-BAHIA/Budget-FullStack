"use client";

import { useState } from "react";
import { EditableValueEuro } from "./EditableValueEuro";

// Icône de chevron vers le bas
const ChevronDownIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M5 7.5L10 12.5L15 7.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Icône de chevron vers la droite
const ChevronRightIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M7.5 5L12.5 10L7.5 15"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Icône de suppression (poubelle)
const TrashIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M3.75 4.5H14.25M6.75 4.5V3C6.75 2.58579 7.08579 2.25 7.5 2.25H10.5C10.9142 2.25 11.25 2.58579 11.25 3V4.5M4.5 4.5V15C4.5 15.4142 4.83579 15.75 5.25 15.75H12.75C13.1642 15.75 13.5 15.4142 13.5 15V4.5M7.5 8.25V12.75M10.5 8.25V12.75"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

type AppartementBlockProps = {
  appartementNumber: number;
  name?: string;
  initialData?: {
    loyer?: number;
    eau?: number;
    internet?: number;
    assurance?: number;
    electricite?: number;
    gaz?: number;
  };
  onDataChange?: (data: {
    loyer: number;
    eau: number;
    internet: number;
    assurance: number;
    electricite: number;
    gaz: number;
  }) => void;
  onNameChange?: (name: string) => void;
  onDelete?: () => void;
};

export function AppartementBlock({
  appartementNumber,
  name,
  initialData = {},
  onDataChange,
  onNameChange,
  onDelete,
}: AppartementBlockProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [appartementName, setAppartementName] = useState(
    name || `Appartement ${appartementNumber}`
  );
  const [loyer, setLoyer] = useState(initialData.loyer || 0);
  const [eau, setEau] = useState(initialData.eau || 0);
  const [internet, setInternet] = useState(initialData.internet || 0);
  const [assurance, setAssurance] = useState(initialData.assurance || 0);
  const [electricite, setElectricite] = useState(initialData.electricite || 0);
  const [gaz, setGaz] = useState(initialData.gaz || 0);

  // Fonction pour mettre à jour toutes les données
  const updateAllData = () => {
    if (onDataChange) {
      onDataChange({
        loyer,
        eau,
        internet,
        assurance,
        electricite,
        gaz,
      });
    }
  };

  // Fonction générique pour mettre à jour une valeur et déclencher la mise à jour globale
  const handleSave = (
    newValue: string,
    setter: (value: number) => void
  ) => {
    return async () => {
      const numValue = Number(newValue);
      setter(numValue);
      // Simuler une mise à jour asynchrone (remplacez par votre appel API)
      await new Promise((resolve) => setTimeout(resolve, 300));
      updateAllData();
    };
  };

  // Fonction pour le texte indicatif du loyer
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

  // Fonction générique pour les autres dépenses
  const getDepenseHint = (value: string | number) => {
    const numValue = Number(value);
    if (numValue === 0) {
      return "Aucune dépense définie";
    } else if (numValue < 50) {
      return "Dépense faible";
    } else if (numValue < 100) {
      return "Dépense modérée";
    } else {
      return "Dépense élevée";
    }
  };

  // Calcul du total des dépenses
  const totalDepenses = loyer + eau + electricite + gaz + assurance + internet;

  // Fonction de formatage pour le total
  const formatTotal = (value: number) => {
    return `${value.toLocaleString("fr-FR")} €`;
  };

  return (
    <div
      className="rounded-xl border p-6"
      style={{
        borderColor: "var(--theme-border)",
        backgroundColor: "var(--theme-bgCard)",
      }}
    >
      {/* En-tête avec titre, bouton dérouler et total */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="rounded-md p-1 transition hover:bg-[var(--theme-bgHover)]"
            style={{ color: "var(--theme-textSecondary)" }}
            title={isExpanded ? "Réduire" : "Dérouler"}
            aria-label={isExpanded ? "Réduire" : "Dérouler"}
          >
            {isExpanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
          </button>
          <input
            type="text"
            value={appartementName}
            onChange={(e) => {
              const newName = e.target.value;
              setAppartementName(newName);
              if (onNameChange) {
                onNameChange(newName);
              }
            }}
            className="bg-transparent text-lg font-semibold outline-none"
            style={{ color: "var(--theme-text)" }}
            placeholder={`Appartement ${appartementNumber}`}
          />
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p
              className="text-sm"
              style={{ color: "var(--theme-textSecondary)" }}
            >
              Total
            </p>
            <p className="text-xl font-semibold">{formatTotal(totalDepenses)}</p>
          </div>
          {onDelete && (
            <button
              onClick={onDelete}
              className="rounded-md p-1.5 transition hover:bg-red-500/20"
              style={{ color: "var(--theme-textSecondary)" }}
              title="Supprimer"
              aria-label="Supprimer"
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#ef4444";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--theme-textSecondary)";
              }}
            >
              <TrashIcon />
            </button>
          )}
        </div>
      </div>

      {/* Contenu déroulable : sous-dépenses */}
      {isExpanded && (
        <div className="space-y-4">
          {/* Ligne horizontale : Loyer, Assurance, Internet */}
          <div className="grid grid-cols-3 gap-4">
            <EditableValueEuro
              label="Loyer"
              value={loyer}
              onSave={handleSave(setLoyer)}
              hintText={getLoyerHint}
            />

            <EditableValueEuro
              label="Assurance"
              value={assurance}
              onSave={handleSave(setAssurance)}
              hintText={getDepenseHint}
            />

            <EditableValueEuro
              label="Internet"
              value={internet}
              onSave={handleSave(setInternet)}
              hintText={getDepenseHint}
            />
          </div>

          {/* Ligne horizontale : Eau, Électricité, Gaz */}
          <div className="grid grid-cols-3 gap-4">
            <EditableValueEuro
              label="Eau"
              value={eau}
              onSave={handleSave(setEau)}
              hintText={getDepenseHint}
            />

            <EditableValueEuro
              label="Électricité"
              value={electricite}
              onSave={handleSave(setElectricite)}
              hintText={getDepenseHint}
            />

            <EditableValueEuro
              label="Gaz"
              value={gaz}
              onSave={handleSave(setGaz)}
              hintText={getDepenseHint}
            />
          </div>
        </div>
      )}
    </div>
  );
}

