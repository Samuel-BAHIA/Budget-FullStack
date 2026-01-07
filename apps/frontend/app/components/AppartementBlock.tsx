"use client";

import type React from "react";
import { useMemo, useState } from "react";
import { MoneyCard } from "./MoneyCard";
import { TrashIcon } from "./icons/TrashIcon";
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

type CardConfig = {
  key: keyof AppartementData["data"];
  label: string;
  value: number;
  setter: (value: number) => void;
  hint?: (value: string | number) => string;
  positive?: boolean;
};

type AppartementBlockProps = {
  appartementNumber: number;
  name?: string;
  type?: AppartementType;
  initialData?: Partial<AppartementData["data"]>;
  onDataChange?: (data: AppartementData["data"], type: AppartementType) => void;
  onNameChange?: (name: string) => void;
  onDelete?: () => void;
  forceType?: AppartementType;
  lockType?: boolean;
};

export function AppartementBlock({
  appartementNumber,
  name,
  type: initialType = "location",
  initialData = {},
  onDataChange,
  onNameChange,
  onDelete,
  forceType,
  lockType = false,
}: AppartementBlockProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [appartementName, setAppartementName] = useState(name || `Appartement ${appartementNumber}`);
  const [type, setType] = useState<AppartementType>(forceType ?? initialType);

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

  const updateAllData = (override?: Partial<AppartementData["data"]>) => {
    if (!onDataChange) return;
    const base = getCurrentData();
    const next = override ? { ...base, ...override } : base;
    onDataChange(next, type);
  };

  const handleSave =
    (setter: (value: number) => void, field: keyof AppartementData["data"]) =>
    async (newValue: string) => {
      const numValue = Number(newValue);
      const safeValue = Number.isFinite(numValue) ? numValue : 0;
      setter(safeValue);
      await new Promise((resolve) => setTimeout(resolve, 300));
      updateAllData({ [field]: safeValue });
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
      ? loyer -
        (impotsRevenu +
          taxeFonciere +
          chargesCopro +
          assurance +
          credit +
          assuranceCredit)
      : -1 * (loyer + assurance + internet + eau + electricite + gaz);

  const formatTotal = (value: number) => {
    const sign = value >= 0 ? "+" : "-";
    return `${sign}${Math.abs(value).toLocaleString("fr-FR")} €`;
  };
  const totalColor = totalDepenses >= 0 ? "#16a34a" : "#ef4444";

  const handleTypeChange = (newType: AppartementType) => {
    if (lockType && forceType) {
      return;
    }
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

  const renderCards = (cards: CardConfig[]) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <MoneyCard
          key={card.key}
          name={card.label}
          value={card.value}
          positive={!!card.positive}
          onSaveValue={handleSave(card.setter, card.key)}
          hintText={card.hint}
          displayPrefix={card.positive ? "+" : "-"}
          displaySuffix="/mois"
          wrapperStyle={card.positive ? positiveWrapperStyle : negativeWrapperStyle}
          allowNameEdit={false}
          allowDelete={false}
        />
      ))}
    </div>
  );

  const proprieteIncomeCards: CardConfig[] = [
    { key: "loyer", label: "Loyer percu", value: loyer, setter: setLoyer, hint: getLoyerHint, positive: true },
    { key: "impotsRevenu", label: "Impots sur revenu", value: impotsRevenu, setter: setImpotsRevenu, hint: getDepenseHint },
  ];

  const proprieteChargesCards: CardConfig[] = [
    { key: "taxeFonciere", label: "Taxe fonciere", value: taxeFonciere, setter: setTaxeFonciere, hint: getDepenseHint },
    { key: "chargesCopro", label: "Charges copro", value: chargesCopro, setter: setChargesCopro, hint: getDepenseHint },
    { key: "assurance", label: "Assurance habitation", value: assurance, setter: setAssurance, hint: getDepenseHint },
  ];

  const proprieteCreditCards: CardConfig[] = [
    { key: "credit", label: "Credit", value: credit, setter: setCredit, hint: getDepenseHint },
    { key: "assuranceCredit", label: "Assurance credit", value: assuranceCredit, setter: setAssuranceCredit, hint: getDepenseHint },
  ];

  const locationCards: CardConfig[] = [
    { key: "loyer", label: "Loyer a charge", value: loyer, setter: setLoyer, hint: getLoyerHint },
    { key: "assurance", label: "Assurance habitation", value: assurance, setter: setAssurance, hint: getDepenseHint },
    { key: "internet", label: "Internet", value: internet, setter: setInternet, hint: getDepenseHint },
    { key: "eau", label: "Eau", value: eau, setter: setEau, hint: getDepenseHint },
    { key: "electricite", label: "Electricite", value: electricite, setter: setElectricite, hint: getDepenseHint },
    { key: "gaz", label: "Gaz", value: gaz, setter: setGaz, hint: getDepenseHint },
  ];

  return (
    <div
      className="rounded-xl border p-6"
      style={{
        borderColor: "var(--theme-border)",
        backgroundColor: "var(--theme-bgCard)",
      }}
    >
      <div
        className="flex flex-wrap items-start justify-between gap-3 -mx-6 -mt-6 px-6 py-4 mb-4"
        style={{
          backgroundColor: "var(--theme-border)",
          borderTopLeftRadius: "12px",
          borderTopRightRadius: "12px",
        }}
      >
        <div className="flex flex-wrap items-center gap-2 min-w-0">
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
            className="bg-transparent text-lg font-semibold outline-none min-w-[180px] flex-1"
            style={{ color: "var(--theme-text)" }}
            placeholder={`Appartement ${appartementNumber}`}
          />
          {!lockType && (
            <select
              value={type}
              onChange={(e) => handleTypeChange(e.target.value as AppartementType)}
              className="rounded-md border px-2 py-1 text-sm w-full sm:w-auto"
              style={{
                borderColor: "var(--theme-border)",
                backgroundColor: "var(--theme-bgCard)",
                color: "var(--theme-text)",
              }}
            >
              <option value="location">Location</option>
              <option value="propriete">Propriete</option>
            </select>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm" style={{ color: "var(--theme-textSecondary)" }}>
              Total
            </p>
            <p className="text-xl font-semibold" style={{ color: totalColor }}>
              {formatTotal(totalDepenses)}
            </p>
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
          {type === "propriete" ? (
            <>
              {renderCards(proprieteIncomeCards)}
              {renderCards(proprieteChargesCards)}
              {renderCards(proprieteCreditCards)}
            </>
          ) : (
            renderCards(locationCards)
          )}
        </div>
      )}
    </div>
  );
}


