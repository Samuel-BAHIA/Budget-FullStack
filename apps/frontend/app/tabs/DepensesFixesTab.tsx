"use client";

import { useEffect, useState } from "react";
import { EditableSliderRow, sliderGroupStyle } from "../components/EditableSliderRow";
import { useBudget } from "../contexts/BudgetContext";

type Expense = { id: number; name: string; montant: number };
type SectionKey = "abonnements" | "voiture" | "autres";

type Props = {
  activeSection?: SectionKey;
  onSectionTotalsChange?: (totals: Record<SectionKey, number>) => void;
};

export function DepensesFixesTab({ activeSection, onSectionTotalsChange }: Props) {
  const [abonnements, setAbonnements] = useState<Expense[]>([
    { id: 1, name: "Telephone", montant: 80 },
    { id: 2, name: "Netflix", montant: 20 },
  ]);
  const [voiture, setVoiture] = useState<Expense[]>([
    { id: 1, name: "Credit voiture", montant: 300 },
    { id: 2, name: "Assurances voiture", montant: 170 },
  ]);
  const [autres, setAutres] = useState<Expense[]>([{ id: 1, name: "Impots locaux", montant: 120 }]);
  const { updateTotal } = useBudget();

  const setterFor = (section: SectionKey) =>
    section === "abonnements" ? setAbonnements : section === "voiture" ? setVoiture : setAutres;

  const handleSaveMontant =
    (section: SectionKey, id: number) => async (newValue: string) => {
      const numValue = Number(newValue);
      const setter = setterFor(section);
      setter((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, montant: Number.isFinite(numValue) ? numValue : 0 }
            : item
        )
      );
      await new Promise((resolve) => setTimeout(resolve, 200));
    };

  const handleSaveName = (section: SectionKey, id: number) => (newName: string) => {
    const setter = setterFor(section);
    setter((prev) =>
      prev.map((item) => (item.id === id ? { ...item, name: newName || item.name } : item))
    );
  };

  const handleDelete = (section: SectionKey, id: number) => {
    const setter = setterFor(section);
    setter((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAdd = (section: SectionKey) => {
    const setter = setterFor(section);
    const prefix =
      section === "abonnements" ? "Abonnement" : section === "voiture" ? "Depense voiture" : "Autre depense";
    setter((prev) => {
      const nextId = Math.max(0, ...prev.map((a) => a.id)) + 1;
      return [...prev, { id: nextId, name: `${prefix} ${nextId}`, montant: 0 }];
    });
  };

  useEffect(() => {
    const totalsBySection: Record<SectionKey, number> = {
      abonnements: abonnements.reduce((sum, item) => sum + item.montant, 0),
      voiture: voiture.reduce((sum, item) => sum + item.montant, 0),
      autres: autres.reduce((sum, item) => sum + item.montant, 0),
    };
    const total = totalsBySection.abonnements + totalsBySection.voiture + totalsBySection.autres;
    updateTotal("depensesFixes", total);
    if (onSectionTotalsChange) {
      onSectionTotalsChange(totalsBySection);
    }
  }, [abonnements, voiture, autres, updateTotal, onSectionTotalsChange]);

  const renderSection = (title: string, section: SectionKey, items: Expense[]) => {
    const totalSection = items.reduce((sum, item) => sum + item.montant, 0);
    const totalLabel = section === "voiture" ? "TOTAL VOITURE :" : `TOTAL ${title.toUpperCase()} :`;
    return (
      <div className="space-y-3">
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
              <span style={{ fontWeight: 700, flex: 1 }}>{totalLabel}</span>
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
                  {totalSection.toLocaleString("fr-FR")}€
                </span>
              </div>
            </div>
            <div />
            <div />
          </div>
          {items.map((item) => {
            const absValue = Math.max(0, Math.abs(item.montant));
            const maxValue = Math.max(2000, Math.ceil(absValue * 1.5));
            return (
              <EditableSliderRow
                key={item.id}
                label={item.name}
                labelEditable
                onLabelChange={handleSaveName(section, item.id)}
                value={absValue}
                min={0}
                max={maxValue}
                step={10}
                unitLabel="€/mois"
                onValueChange={(next) => handleSaveMontant(section, item.id)(String(next))}
                onRemove={() => handleDelete(section, item.id)}
              />
            );
          })}
          <button
            onClick={() => handleAdd(section)}
            className="flex items-center gap-3 w-full justify-center text-sm font-semibold transition hover:bg-[var(--theme-bgHover)]"
            style={{
              borderRadius: 18,
              padding: "14px 16px",
              border: "none",
              color: "var(--theme-text)",
              backgroundColor: "transparent",
            }}
          >
            <span
              className="flex h-10 w-10 items-center justify-center rounded-full text-lg"
              style={{
                backgroundColor: "color-mix(in srgb, var(--theme-tabActiveBg) 22%, transparent)",
                color: "var(--theme-tabActiveBg)",
              }}
            >
              +
            </span>
            Ajouter
          </button>
        </div>
      </div>
    );
  };

  const sectionsToRender = [
    { title: "Abonnements", key: "abonnements" as SectionKey, items: abonnements },
    { title: "Voiture", key: "voiture" as SectionKey, items: voiture },
    { title: "Autres", key: "autres" as SectionKey, items: autres },
  ].filter((s) => !activeSection || s.key === activeSection);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Depenses fixes</h2>
      <p
        className="mt-2"
        style={{ color: "var(--theme-textSecondary)" }}
      >
        Gere tes abonnements et autres depenses fixes mensuelles.
      </p>

      <div className="mt-6 space-y-8">
        {sectionsToRender.map((section) => renderSection(section.title, section.key, section.items))}
      </div>
    </div>
  );
}


