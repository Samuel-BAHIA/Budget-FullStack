"use client";

import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { MoneyCard } from "../components/MoneyCard";
import { useBudget } from "../contexts/BudgetContext";

type Expense = { id: number; name: string; montant: number };
type SectionKey = "abonnements" | "voiture";

export function DepensesFixesTab() {
  const [abonnements, setAbonnements] = useState<Expense[]>([
    { id: 1, name: "Telephone", montant: 80 },
    { id: 2, name: "Netflix", montant: 20 },
  ]);
  const [voiture, setVoiture] = useState<Expense[]>([
    { id: 1, name: "Credit voiture", montant: 300 },
    { id: 2, name: "Assurances voiture", montant: 170 },
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
    if (numValue < 50) return "Depense faible";
    if (numValue < 150) return "Depense moderee";
    return "Depense elevee";
  };

  const handleSaveMontant =
    (section: SectionKey, id: number) => async (newValue: string) => {
      const numValue = Number(newValue);
      const setter = section === "abonnements" ? setAbonnements : setVoiture;
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
    const setter = section === "abonnements" ? setAbonnements : setVoiture;
    setter((prev) =>
      prev.map((item) => (item.id === id ? { ...item, name: newName || item.name } : item))
    );
  };

  const handleDelete = (section: SectionKey, id: number) => {
    const setter = section === "abonnements" ? setAbonnements : setVoiture;
    setter((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAdd = (section: SectionKey) => {
    const setter = section === "abonnements" ? setAbonnements : setVoiture;
    const prefix = section === "abonnements" ? "Abonnement" : "Depense";
    setter((prev) => {
      const nextId = Math.max(0, ...prev.map((a) => a.id)) + 1;
      return [...prev, { id: nextId, name: `${prefix} ${nextId}`, montant: 0 }];
    });
  };

  useEffect(() => {
    const total =
      abonnements.reduce((sum, item) => sum + item.montant, 0) +
      voiture.reduce((sum, item) => sum + item.montant, 0);
    updateTotal("depensesFixes", total);
  }, [abonnements, voiture, updateTotal]);

  const renderSection = (title: string, section: SectionKey, items: Expense[]) => {
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
        {renderSection("Abonnements", "abonnements", abonnements)}
        {renderSection("Voiture", "voiture", voiture)}
      </div>
    </div>
  );
}
