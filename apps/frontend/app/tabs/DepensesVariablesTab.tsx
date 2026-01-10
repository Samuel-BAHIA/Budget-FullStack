"use client";

import { useEffect, useState } from "react";
import { EditableSliderRow, sliderGroupStyle } from "../components/EditableSliderRow";
import { useBudget } from "../contexts/BudgetContext";

type Expense = { id: number; name: string; montant: number };
type SectionKey = "quotidien" | "voitures" | "autres";

type Props = {
  activeSection?: SectionKey;
  onSectionTotalsChange?: (totals: Record<SectionKey, number>) => void;
};

export function DepensesVariablesTab({ activeSection, onSectionTotalsChange }: Props) {
  const [quotidien, setQuotidien] = useState<Expense[]>([{ id: 1, name: "Courses", montant: 450 }]);
  const [voitures, setVoitures] = useState<Expense[]>([
    { id: 1, name: "Carburant", montant: 120 },
    { id: 2, name: "Entretien voiture", montant: 70 },
  ]);
  const [autres, setAutres] = useState<Expense[]>([
    { id: 1, name: "Sante", montant: 150 },
    { id: 2, name: "Autres", montant: 100 },
  ]);
  const { updateTotal } = useBudget();

  const handleSaveMontant =
    (section: SectionKey, id: number) => async (newValue: string) => {
      const numValue = Number(newValue);
      const setter = section === "quotidien" ? setQuotidien : section === "voitures" ? setVoitures : setAutres;
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
    const setter = section === "quotidien" ? setQuotidien : section === "voitures" ? setVoitures : setAutres;
    setter((prev) =>
      prev.map((item) => (item.id === id ? { ...item, name: newName || item.name } : item))
    );
  };

  const handleDelete = (section: SectionKey, id: number) => {
    const setter = section === "quotidien" ? setQuotidien : section === "voitures" ? setVoitures : setAutres;
    setter((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAdd = (section: SectionKey) => {
    const setter = section === "quotidien" ? setQuotidien : section === "voitures" ? setVoitures : setAutres;
    const prefix = section === "quotidien" ? "Depense" : section === "voitures" ? "Voiture" : "Autre";
    setter((prev) => {
      const nextId = Math.max(0, ...prev.map((a) => a.id)) + 1;
      return [...prev, { id: nextId, name: `${prefix} ${nextId}`, montant: 0 }];
    });
  };

  useEffect(() => {
    const totalsBySection: Record<SectionKey, number> = {
      quotidien: quotidien.reduce((sum, item) => sum + item.montant, 0),
      voitures: voitures.reduce((sum, item) => sum + item.montant, 0),
      autres: autres.reduce((sum, item) => sum + item.montant, 0),
    };
    const total = totalsBySection.quotidien + totalsBySection.voitures + totalsBySection.autres;
    updateTotal("depensesVariables", total);
    if (onSectionTotalsChange) {
      onSectionTotalsChange(totalsBySection);
    }
  }, [quotidien, voitures, autres, updateTotal, onSectionTotalsChange]);

  const renderSection = (title: string, section: SectionKey, items: Expense[], setterLabel: string) => {
    const totalSection = items.reduce((sum, item) => sum + item.montant, 0);
    const totalLabel = section === "voitures" ? "TOTAL VOITURE :" : `TOTAL ${title.toUpperCase()} :`;
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
            aria-label={`Ajouter ${setterLabel}`}
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
    { title: "Quotidien", key: "quotidien" as SectionKey, items: quotidien, hint: "une depense quotidienne" },
    { title: "Voitures", key: "voitures" as SectionKey, items: voitures, hint: "une depense voiture" },
    { title: "Autres", key: "autres" as SectionKey, items: autres, hint: "une depense autre" },
  ].filter((s) => !activeSection || s.key === activeSection);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Depenses variables</h2>
      <p
        className="mt-2"
        style={{ color: "var(--theme-textSecondary)" }}
      >
        Quotidien, voiture et autres depenses variables.
      </p>

      <div className="mt-6 space-y-8">
        {sectionsToRender.map((section) => (
          <div key={section.key}>
            {renderSection(section.title, section.key, section.items, section.hint)}
          </div>
        ))}
      </div>
    </div>
  );
}


