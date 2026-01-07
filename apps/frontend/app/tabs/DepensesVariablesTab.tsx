"use client";

import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { MoneyCard } from "../components/MoneyCard";
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

  const editableWrapperStyle: React.CSSProperties = useMemo(
    () => ({
      backgroundColor: "color-mix(in srgb, var(--theme-bgCard) 82%, white)",
      border: "1px solid color-mix(in srgb, var(--theme-border) 75%, white)",
    }),
    []
  );
  const negativeWrapperStyle: React.CSSProperties = useMemo(
    () => ({
      ...editableWrapperStyle,
      backgroundColor: "rgba(239,68,68,0.08)",
      borderColor: "rgba(239,68,68,0.35)",
    }),
    [editableWrapperStyle]
  );

  const getDepenseHint = (value: string | number) => {
    const numValue = Number(value);
    if (numValue === 0) return "Aucune depense definie";
    if (numValue < 100) return "Depense faible";
    if (numValue < 300) return "Depense moderee";
    return "Depense elevee";
  };

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
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <MoneyCard
              key={item.id}
              name={item.name}
              value={item.montant}
              positive={false}
              onDelete={() => handleDelete(section, item.id)}
              onSaveValue={handleSaveMontant(section, item.id)}
              onSaveName={handleSaveName(section, item.id)}
              hintText={getDepenseHint}
              displayPrefix="-"
              displaySuffix="/mois"
              wrapperStyle={negativeWrapperStyle}
            />
          ))}
          <button
            onClick={() => handleAdd(section)}
            className="w-full rounded-xl border-2 border-dashed p-4 text-sm font-semibold flex flex-col items-center justify-center gap-2 text-center transition hover:border-[var(--theme-borderLight)] hover:bg-[var(--theme-bgHover)]"
            style={{
              borderColor: "rgba(239,68,68,0.35)",
              color: "var(--theme-danger, #ef4444)",
              backgroundColor: "rgba(239,68,68,0.08)",
            }}
            aria-label={`Ajouter ${setterLabel}`}
          >
            <span
              className="flex h-10 w-10 items-center justify-center rounded-full text-lg"
              style={{ backgroundColor: "rgba(239,68,68,0.12)", color: "var(--theme-danger, #ef4444)" }}
            >
              +
            </span>
            Ajouter
          </button>
        </div>
      </div>
    );
  };

  const sectionsToRender: { title: string; key: SectionKey; items: Expense[]; hint: string }[] = [
    { title: "Quotidien", key: "quotidien", items: quotidien, hint: "une depense quotidienne" },
    { title: "Voitures", key: "voitures", items: voitures, hint: "une depense voiture" },
    { title: "Autres", key: "autres", items: autres, hint: "une depense autre" },
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
        {sectionsToRender.map((section) =>
          renderSection(section.title, section.key, section.items, section.hint)
        )}
      </div>
    </div>
  );
}
