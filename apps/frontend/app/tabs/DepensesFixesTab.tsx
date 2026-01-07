"use client";

import { useEffect, useState } from "react";
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
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        <div className="space-y-3">
          {items.map((item) => {
            const maxValue = Math.max(2000, Math.ceil(Math.abs(item.montant) * 1.5));
            return (
              <div
                key={item.id}
                className="flex items-center gap-3 rounded-lg border px-3 py-2"
                style={{ borderColor: "var(--theme-border)" }}
              >
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => handleSaveName(section, item.id)(e.target.value)}
                  className="w-48 rounded-md border px-2 py-1 text-sm font-semibold outline-none"
                  style={{
                    borderColor: "var(--theme-border)",
                    backgroundColor: "var(--theme-bgCard)",
                    color: "var(--theme-text)",
                  }}
                />
                <input
                  type="range"
                  min={0}
                  max={maxValue}
                  step={10}
                  value={Math.max(0, item.montant)}
                  onChange={(e) => handleSaveMontant(section, item.id)(e.target.value)}
                  className="flex-1 accent-[var(--theme-tabActiveBg)]"
                  aria-label={`Ajuster ${item.name}`}
                />
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={0}
                    step={10}
                    value={Math.max(0, item.montant)}
                    onChange={(e) => handleSaveMontant(section, item.id)(e.target.value)}
                    className="w-24 rounded-md border px-2 py-1 text-sm font-semibold text-right outline-none"
                    style={{
                      borderColor: "var(--theme-border)",
                      backgroundColor: "var(--theme-bgCard)",
                      color: "#ef4444",
                    }}
                  />
                  <span className="text-sm font-semibold" style={{ color: "#ef4444" }}>
                    €/mois
                  </span>
                </div>
                <button
                  onClick={() => handleDelete(section, item.id)}
                  className="rounded-md px-2 py-1 text-sm transition hover:bg-[var(--theme-bgHover)]"
                  style={{ color: "var(--theme-textSecondary)" }}
                  aria-label="Supprimer"
                  title="Supprimer"
                >
                  ×
                </button>
              </div>
            );
          })}
          <button
            onClick={() => handleAdd(section)}
            className="flex items-center gap-3 rounded-lg border-2 border-dashed px-3 py-2 w-full justify-center text-sm font-semibold transition hover:border-[var(--theme-borderLight)] hover:bg-[var(--theme-bgHover)]"
            style={{
              borderColor: "rgba(239,68,68,0.35)",
              color: "var(--theme-danger, #ef4444)",
              backgroundColor: "rgba(239,68,68,0.08)",
            }}
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

  const sectionsToRender: { title: string; key: SectionKey; items: Expense[] }[] = [
    { title: "Abonnements", key: "abonnements", items: abonnements },
    { title: "Voiture", key: "voiture", items: voiture },
    { title: "Autres", key: "autres", items: autres },
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

