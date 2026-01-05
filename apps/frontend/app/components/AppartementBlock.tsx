"use client";

import { useMemo, useState } from "react";
import { EditableValueEuro } from "./EditableValueEuro";
import type { AppartementData, AppartementType } from "../tabs/AppartementsTab";

// Icones
const ChevronDownIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7.5 5L12.5 10L7.5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const TrashIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
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
  type?: AppartementType;
  initialData?: Partial<AppartementData["data"]>;
  onDataChange?: (data: AppartementData["data"], type: AppartementType) => void;
  onNameChange?: (name: string) => void;
  onDelete?: () => void;
};

export function AppartementBlock({
  appartementNumber,
  name,
  type: initialType = "location",
  initialData = {},
  onDataChange,
  onNameChange,
  onDelete,
}: AppartementBlockProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [appartementName, setAppartementName] = useState(name || `Appartement ${appartementNumber}`);
  const [type, setType] = useState<AppartementType>(initialType);

  const [loyer, setLoyer] = useState(initialData.loyer || 0);
  const [credit, setCredit] = useState(initialData.credit || 0);
  const [assuranceCredit, setAssuranceCredit] = useState(initialData.assuranceCredit || 0);
  const [taxeFonciere, setTaxeFonciere] = useState(initialData.taxeFonciere || 0);
  const [impotsRevenu, setImpotsRevenu] = useState(initialData.impotsRevenu || 0);
  const [chargesCopro, setChargesCopro] = useState(initialData.chargesCopro || 0);
  const [assurance, setAssurance] = useState(initialData.assurance || 0);
  const [internet, setInternet] = useState(initialData.internet || 0);
  const [eau, setEau] = useState(initialData.eau || 0);
  const [electricite, setElectricite] = useState(initialData.electricite || 0);
  const [gaz, setGaz] = useState(initialData.gaz || 0);

  const editableWrapperStyle: React.CSSProperties = {
    backgroundColor: "color-mix(in srgb, var(--theme-bgCard) 82%, white)",
    border: "1px solid color-mix(in srgb, var(--theme-border) 75%, white)",
  };

  const positiveWrapperStyle = useMemo(
    () => ({
      ...editableWrapperStyle,
      backgroundColor: "rgba(34,197,94,0.10)",
      borderColor: "rgba(34,197,94,0.35)",
    }),
    []
  );

  const negativeWrapperStyle = useMemo(
    () => ({
      ...editableWrapperStyle,
      backgroundColor: "rgba(239,68,68,0.08)",
      borderColor: "rgba(239,68,68,0.35)",
    }),
    []
  );

  const getCurrentData = (): AppartementData["data"] => ({
    loyer,
    credit,
    assuranceCredit,
    taxeFonciere,
    impotsRevenu,
    assurance,
    chargesCopro,
    internet,
    eau,
    electricite,
    gaz,
  });

  const updateAllData = () => {
    if (!onDataChange) return;
    onDataChange(getCurrentData(), type);
  };

  const handleSave = (setter: (value: number) => void) => async (newValue: string) => {
    const numValue = Number(newValue);
    setter(Number.isFinite(numValue) ? numValue : 0);
    await new Promise((resolve) => setTimeout(resolve, 300));
    updateAllData();
  };

  const getLoyerHint = (value: string | number) => {
    const numValue = Number(value);
    if (numValue === 0) return "Aucun loyer defini";
    if (numValue < 500) return "Loyer tres bas";
    if (numValue < 1000) return "Loyer modere";
    return "Loyer eleve";
  };

  const getDepenseHint = (value: string | number) => {
    const numValue = Number(value);
    if (numValue === 0) return "Aucune depense definie";
    if (numValue < 50) return "Depense faible";
    if (numValue < 100) return "Depense moderee";
    return "Depense elevee";
  };

  const totalDepenses =
    type === "propriete"
      ? loyer +
        impotsRevenu +
        taxeFonciere +
        chargesCopro +
        assurance +
        credit +
        assuranceCredit
      : loyer + assurance + internet + eau + electricite + gaz;

  const formatTotal = (value: number) => `${value.toLocaleString("fr-FR")} €`;

  const handleTypeChange = (newType: AppartementType) => {
    const nextValues = getCurrentData();
    if (newType === "location") {
      nextValues.credit = 0;
      nextValues.assuranceCredit = 0;
      nextValues.taxeFonciere = 0;
      nextValues.impotsRevenu = 0;
      nextValues.chargesCopro = 0;
    } else {
      nextValues.loyer = 0;
      nextValues.internet = 0;
      nextValues.eau = 0;
      nextValues.electricite = 0;
      nextValues.gaz = 0;
    }

    setType(newType);
    setCredit(nextValues.credit);
    setAssuranceCredit(nextValues.assuranceCredit);
    setTaxeFonciere(nextValues.taxeFonciere);
    setImpotsRevenu(nextValues.impotsRevenu);
    setChargesCopro(nextValues.chargesCopro);
    setLoyer(nextValues.loyer);
    setInternet(nextValues.internet);
    setEau(nextValues.eau);
    setElectricite(nextValues.electricite);
    setGaz(nextValues.gaz);

    onDataChange?.(nextValues, newType);
  };

  return (
    <div
      className="rounded-xl border p-6"
      style={{
        borderColor: "var(--theme-border)",
        backgroundColor: "var(--theme-bgCard)",
      }}
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="rounded-md p-1 transition hover:bg-[var(--theme-bgHover)]"
            style={{ color: "var(--theme-textSecondary)" }}
            title={isExpanded ? "Reduire" : "Derouler"}
            aria-label={isExpanded ? "Reduire" : "Derouler"}
          >
            {isExpanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
          </button>
          <input
            type="text"
            value={appartementName}
            onChange={(e) => {
              const newName = e.target.value;
              setAppartementName(newName);
              onNameChange?.(newName);
            }}
            className="bg-transparent text-lg font-semibold outline-none"
            style={{ color: "var(--theme-text)" }}
            placeholder={`Appartement ${appartementNumber}`}
          />
          <select
            value={type}
            onChange={(e) => handleTypeChange(e.target.value as AppartementType)}
            className="rounded-md border px-2 py-1 text-sm"
            style={{
              borderColor: "var(--theme-border)",
              backgroundColor: "var(--theme-bgCard)",
              color: "var(--theme-text)",
            }}
          >
            <option value="location">Location</option>
            <option value="propriete">Propriete</option>
          </select>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm" style={{ color: "var(--theme-textSecondary)" }}>
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
              onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--theme-textSecondary)")}
            >
              <TrashIcon />
            </button>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-4">
          {/* Ligne revenus */}
          <div className="grid grid-cols-4 gap-4">
            <div className="rounded-xl p-2" style={type === "propriete" ? positiveWrapperStyle : negativeWrapperStyle}>
              <EditableValueEuro
                label={type === "propriete" ? "Loyer percu" : "Loyer a charge"}
                value={loyer}
                onSave={handleSave(setLoyer)}
                hintText={getLoyerHint}
                displaySuffix="/mois"
              />
            </div>
            {type === "propriete" && (
              <div className="rounded-xl p-2" style={negativeWrapperStyle}>
                <EditableValueEuro
                  label="Impots sur revenu"
                  value={impotsRevenu}
                  onSave={handleSave(setImpotsRevenu)}
                  hintText={getDepenseHint}
                  displaySuffix="/mois"
                />
              </div>
            )}
          </div>

          {/* Ligne charges */}
          {type === "propriete" && (
            <div className="grid grid-cols-4 gap-4">
              <div className="rounded-xl p-2" style={negativeWrapperStyle}>
                <EditableValueEuro
                  label="Taxe fonciere"
                  value={taxeFonciere}
                  onSave={handleSave(setTaxeFonciere)}
                  hintText={getDepenseHint}
                  displaySuffix="/mois"
                />
              </div>
              <div className="rounded-xl p-2" style={negativeWrapperStyle}>
                <EditableValueEuro
                  label="Charges copro"
                  value={chargesCopro}
                  onSave={handleSave(setChargesCopro)}
                  hintText={getDepenseHint}
                  displaySuffix="/mois"
                />
              </div>
              <div className="rounded-xl p-2" style={negativeWrapperStyle}>
                <EditableValueEuro
                  label="Assurance habitation"
                  value={assurance}
                  onSave={handleSave(setAssurance)}
                  hintText={getDepenseHint}
                  displaySuffix="/mois"
                />
              </div>
            </div>
          )}

          {type === "location" && (
            <>
              <div className="grid grid-cols-4 gap-4">
                <div className="rounded-xl p-2" style={negativeWrapperStyle}>
                  <EditableValueEuro
                    label="Assurance habitation"
                    value={assurance}
                    onSave={handleSave(setAssurance)}
                    hintText={getDepenseHint}
                    displaySuffix="/mois"
                  />
                </div>
                <div className="rounded-xl p-2" style={negativeWrapperStyle}>
                  <EditableValueEuro
                    label="Internet"
                    value={internet}
                    onSave={handleSave(setInternet)}
                    hintText={getDepenseHint}
                    displaySuffix="/mois"
                  />
                </div>
                <div className="rounded-xl p-2" style={negativeWrapperStyle}>
                  <EditableValueEuro
                    label="Eau"
                    value={eau}
                    onSave={handleSave(setEau)}
                    hintText={getDepenseHint}
                    displaySuffix="/mois"
                  />
                </div>
                <div className="rounded-xl p-2" style={negativeWrapperStyle}>
                  <EditableValueEuro
                    label="Electricite"
                    value={electricite}
                    onSave={handleSave(setElectricite)}
                    hintText={getDepenseHint}
                    displaySuffix="/mois"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div className="rounded-xl p-2" style={negativeWrapperStyle}>
                  <EditableValueEuro
                    label="Gaz"
                    value={gaz}
                    onSave={handleSave(setGaz)}
                    hintText={getDepenseHint}
                    displaySuffix="/mois"
                  />
                </div>
              </div>
            </>
          )}

          {/* Ligne credit */}
          {type === "propriete" && (
            <div className="grid grid-cols-4 gap-4">
              <div className="rounded-xl p-2" style={negativeWrapperStyle}>
                <EditableValueEuro
                  label="Credit"
                  value={credit}
                  onSave={handleSave(setCredit)}
                  hintText={getDepenseHint}
                  displaySuffix="/mois"
                />
              </div>
              <div className="rounded-xl p-2" style={negativeWrapperStyle}>
                <EditableValueEuro
                  label="Assurance credit"
                  value={assuranceCredit}
                  onSave={handleSave(setAssuranceCredit)}
                  hintText={getDepenseHint}
                  displaySuffix="/mois"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
