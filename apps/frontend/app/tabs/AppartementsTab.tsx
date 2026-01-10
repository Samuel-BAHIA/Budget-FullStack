"use client";

import { useEffect, useState } from "react";
import { AppartementBlock } from "../components/AppartementBlock";
import { EditableSliderRow, sliderGroupStyle } from "../components/EditableSliderRow";
import { EditableTitle } from "../components/EditableTitle";
import { useBudget } from "../contexts/BudgetContext";

export type AppartementType = "location" | "propriete";

export type AppartementData = {
  id: number;
  name: string;
  type: AppartementType;
  data: {
    loyer: number;
    credit: number;
    assuranceCredit: number;
    taxeFonciere: number;
    impotsRevenu: number;
    chargesCopro: number;
    assurance: number;
    internet: number;
    eau: number;
    electricite: number;
    gaz: number;
  };
};

type ValueCard = {
  key: keyof AppartementData["data"];
  label: string;
  value: number;
  positive?: boolean;
};

type Props = {
  appartements?: AppartementData[];
  onAppartementsChange?: (appartements: AppartementData[]) => void;
  forceType?: AppartementType;
  lockType?: boolean;
  title?: string;
  description?: string;
  addLabel?: string;
  disableBudgetUpdate?: boolean;
  onTotalChange?: (total: number) => void;
  activeOnlyId?: number | null;
  carouselMode?: boolean;
  cardsPerPage?: number;
};

const PlusIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M10 4V16M4 10H16"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const defaultAppartement = (id: number): AppartementData => ({
  id,
  name: `Appartement ${id}`,
  type: "location",
  data: {
    loyer: 800,
    credit: 100,
    assuranceCredit: 20,
    taxeFonciere: 0,
    impotsRevenu: 0,
    chargesCopro: 0,
    assurance: 40,
    internet: 30,
    eau: 50,
    electricite: 60,
    gaz: 45,
  },
});

export function AppartementsTab({
  appartements: externalAppartements,
  onAppartementsChange,
  forceType,
  lockType,
  title,
  description,
  addLabel,
  disableBudgetUpdate = false,
  onTotalChange,
  activeOnlyId,
  carouselMode = false,
  cardsPerPage = 3,
}: Props) {
  const [internalAppartements, setInternalAppartements] = useState<AppartementData[]>([
    defaultAppartement(1),
  ]);
  const appartements = externalAppartements ?? internalAppartements;
  const showAll = forceType === "propriete";
  const setAppartements = (
    updater: AppartementData[] | ((prev: AppartementData[]) => AppartementData[])
  ) => {
    const next =
      typeof updater === "function"
        ? (updater as (prev: AppartementData[]) => AppartementData[])(appartements)
        : updater;
    if (externalAppartements && onAppartementsChange) {
      onAppartementsChange(next);
    } else {
      setInternalAppartements(next);
    }
  };

  const { updateTotal } = useBudget();

  const handleAppartementDataChange = (id: number) => {
    return (data: AppartementData["data"], type: AppartementType) => {
      setAppartements((prev) =>
        prev.map((apt) => (apt.id === id ? { ...apt, data, type } : apt))
      );
    };
  };

  const handleAppartementNameChange = (id: number) => {
    return (name: string) => {
      setAppartements((prev) =>
        prev.map((apt) => (apt.id === id ? { ...apt, name } : apt))
      );
    };
  };

  const handleAddAppartement = () => {
    const nextId = Math.max(0, ...appartements.map((a) => a.id)) + 1;
    const base = defaultAppartement(nextId);
    const newApp = forceType ? { ...base, type: forceType } : base;
    setAppartements((prev) => [...prev, newApp]);
  };

  const handleDeleteAppartement = (id: number) => {
    return () => {
      if (
        confirm(
          "Etes-vous sur de vouloir supprimer cet appartement ? Cette action est irreversible."
        )
      ) {
        setAppartements((prev) => prev.filter((apt) => apt.id !== id));
      }
    };
  };

  useEffect(() => {
    const totalAppartements = appartements.reduce((sum, apt) => {
      const d = apt.data;
      if (apt.type === "propriete") {
        return (
          sum +
          (d.loyer -
            (d.impotsRevenu +
              d.taxeFonciere +
              d.chargesCopro +
              d.assurance +
              d.credit +
              d.assuranceCredit))
        );
      }
      return sum - (d.loyer + d.assurance + d.internet + d.eau + d.electricite + d.gaz);
    }, 0);

    if (!disableBudgetUpdate) {
      updateTotal("appartements", totalAppartements);
    }
    if (onTotalChange) {
      onTotalChange(totalAppartements);
    }
  }, [appartements, updateTotal, disableBudgetUpdate, onTotalChange]);

  const locationCardConfigs = (apt: AppartementData): ValueCard[] => [
    { key: "loyer", label: "Loyer", value: apt.data.loyer },
    { key: "assurance", label: "Assurance habitation", value: apt.data.assurance },
    { key: "internet", label: "Internet", value: apt.data.internet },
    { key: "eau", label: "Eau", value: apt.data.eau },
    { key: "electricite", label: "Electricite", value: apt.data.electricite },
    { key: "gaz", label: "Gaz", value: apt.data.gaz },
  ];

  const proprieteCardConfigs = (apt: AppartementData): ValueCard[] => [
    { key: "loyer", label: "Loyer percu", value: apt.data.loyer, positive: true },
    { key: "impotsRevenu", label: "Impots sur revenu", value: apt.data.impotsRevenu },
    { key: "taxeFonciere", label: "Taxe fonciere", value: apt.data.taxeFonciere },
    { key: "chargesCopro", label: "Charges copro", value: apt.data.chargesCopro },
    { key: "assurance", label: "Assurance habitation", value: apt.data.assurance },
    { key: "credit", label: "Credit", value: apt.data.credit },
    { key: "assuranceCredit", label: "Assurance credit", value: apt.data.assuranceCredit },
  ];

  const handleSaveField =
    (aptId: number, field: keyof AppartementData["data"]) => async (newValue: string) => {
      const numValue = Number(newValue);
      const safeValue = Number.isFinite(numValue) ? numValue : 0;
      setAppartements((prev) =>
        prev.map((apt) =>
          apt.id === aptId ? { ...apt, data: { ...apt.data, [field]: safeValue } } : apt
        )
      );
      await new Promise((resolve) => setTimeout(resolve, 200));
    };

  const calcAppartementTotal = (apt: AppartementData) => {
    const d = apt.data;
    if (apt.type === "propriete") {
      return d.loyer - (d.impotsRevenu + d.taxeFonciere + d.chargesCopro + d.assurance + d.credit + d.assuranceCredit);
    }
    return -(d.loyer + d.assurance + d.internet + d.eau + d.electricite + d.gaz);
  };

  const renderCarousel = () => {
    const target =
      (activeOnlyId ? appartements.find((a) => a.id === activeOnlyId) : appartements[0]) ??
      null;
    if (!target) return null;
    const cards = locationCardConfigs(target);
    if (!cards.length) return null;

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-semibold">Charges de {target.name}</span>
        </div>
        <div style={sliderGroupStyle}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "clamp(240px, 26vw, 360px) 1fr auto",
              alignItems: "center",
              padding: "0 16px",
              fontSize: 14,
              color: "var(--theme-tabActiveBg)",
              columnGap: 14,
              marginBottom: 6,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontWeight: 700, flex: 1 }}>TOTAL LOCATION :</span>
              <div
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 104,
                }}
              >
                <span aria-hidden style={{ position: "absolute", left: 0, width: 16, height: 16 }} />
                <span style={{ textAlign: "center", fontWeight: 700 }}>
                  {calcAppartementTotal(target).toLocaleString("fr-FR")}€
                </span>
              </div>
            </div>
            <div />
            <div />
          </div>
          {cards.map((card) => {
            const absValue = Math.max(0, Math.abs(card.value || 0));
            const maxValue = Math.max(2000, Math.ceil(absValue * 1.5));
            return (
              <EditableSliderRow
                key={card.key}
                label={card.label}
                labelEditable={false}
                value={absValue}
                min={0}
                max={maxValue}
                step={10}
                unitLabel="€/mois"
                onValueChange={(next) => handleSaveField(target.id, card.key)(String(next))}
              />
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">
            {(() => {
              const baseTitle = title ?? "Appartements";
              const activeName = activeOnlyId ? appartements.find((a) => a.id === activeOnlyId)?.name : null;
              return (
                <span className="flex items-center gap-2">
                  <span>{baseTitle}</span>
                  {activeName && (
                    <>
                      <span style={{ opacity: 0.6 }}>{">"}</span>
                      <span>{activeName}</span>
                    </>
                  )}
                </span>
              );
            })()}
          </h2>
          <p className="mt-2" style={{ color: "var(--theme-textSecondary)" }}>
            {description ??
              "Gere tes appartements achetes ou loues, et leurs informations."}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {forceType === "propriete" && !carouselMode ? (
          (activeOnlyId ? appartements.filter((a) => a.id === activeOnlyId) : appartements).map((apt) => (
            <div key={apt.id} className="space-y-3">
              <EditableTitle
                value={apt.name}
                onChange={(next) => handleAppartementNameChange(apt.id)(next)}
                ariaLabel="Nom de la propriete"
              />
              <div style={sliderGroupStyle}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "clamp(240px, 26vw, 360px) 1fr auto",
                    alignItems: "center",
                    padding: "0 16px",
                    fontSize: 14,
                    color: "var(--theme-tabActiveBg)",
                    columnGap: 14,
                    marginBottom: 6,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontWeight: 700, flex: 1 }}>TOTAL PROPRIETE :</span>
                    <div
                      style={{
                        position: "relative",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 104,
                      }}
                    >
                      <span aria-hidden style={{ position: "absolute", left: 0, width: 16, height: 16 }} />
                      <span style={{ textAlign: "center", fontWeight: 700 }}>
                        {calcAppartementTotal(apt).toLocaleString("fr-FR")}€
                      </span>
                    </div>
                  </div>
                  <div />
                  <div />
                </div>
                {proprieteCardConfigs(apt).map((card) => {
                  const absValue = Math.max(0, Math.abs(card.value || 0));
                  const maxValue = Math.max(2000, Math.ceil(absValue * 1.5));
                  return (
                    <EditableSliderRow
                      key={card.key}
                      label={card.label}
                      labelEditable={false}
                      value={absValue}
                      min={0}
                      max={maxValue}
                      step={10}
                      unitLabel="€/mois"
                      onValueChange={(next) => handleSaveField(apt.id, card.key)(String(next))}
                    />
                  );
                })}
              </div>
            </div>
          ))
        ) : carouselMode ? (
          renderCarousel()
        ) : (
          ((showAll ? appartements : activeOnlyId ? appartements.filter((a) => a.id === activeOnlyId) : appartements)).map((apt) => (
            <AppartementBlock
              key={apt.id}
              appartementNumber={apt.id}
              name={apt.name}
              type={forceType ?? apt.type}
              initialData={apt.data}
              forceType={forceType}
              lockType={lockType}
              onDataChange={handleAppartementDataChange(apt.id)}
              onNameChange={handleAppartementNameChange(apt.id)}
              onDelete={handleDeleteAppartement(apt.id)}
            />
          ))
        )}
        {!carouselMode && !(forceType === "propriete") && (
          <button
            onClick={handleAddAppartement}
            className="w-full text-sm font-semibold flex items-center justify-center gap-3 transition hover:bg-[var(--theme-bgHover)]"
            style={{
              borderRadius: 18,
              padding: "14px 16px",
              border: "none",
              color: "var(--theme-text)",
              backgroundColor: "transparent",
            }}
          >
            <PlusIcon />
            {addLabel ?? "Ajouter un appartement"}
          </button>
        )}
      </div>
    </div>
  );
}


