"use client";

import { useMemo } from "react";
import type { Person } from "../types/budget";

const formatMontant = (value: number) => {
  const sign = value > 0 ? "+" : value < 0 ? "-" : "";
  const abs = Math.abs(value).toLocaleString("fr-FR");
  return `${sign}${abs} \u20ac`;
};

const amountColor = (value: number) => {
  if (value > 0) return "#22c55e";
  if (value < 0) return "#ef4444";
  return "var(--theme-textSecondary)";
};

type Props = {
  persons: Person[];
  activePersonId?: number | null;
};

export function RevenusTab({ persons, activePersonId }: Props) {
  const personSummaries = useMemo(
    () =>
      persons.map((person) => ({
        id: person.id,
        name: person.name || `Personne ${person.id}`,
        total: person.revenus.reduce((sum, r) => sum + r.montant, 0),
      })),
    [persons]
  );

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold">Revenus</h2>
        <p className="mt-1 text-sm" style={{ color: "var(--theme-textSecondary)" }}>
          Bilan rapide des revenus mensuels de chaque personne.
        </p>
      </div>

      <div className="space-y-3">
        {personSummaries.map((person) => {
          const isActive = activePersonId === person.id;
          return (
            <div
              key={person.id}
              className="flex items-center justify-between rounded-2xl border px-4 py-3 transition"
              style={{
                borderColor: isActive ? "var(--theme-tabActiveBg)" : "var(--theme-border)",
                backgroundColor: isActive ? "var(--theme-bgHover)" : "var(--theme-bgCard)",
              }}
            >
              <div>
                <div className="text-sm font-semibold">{person.name}</div>
                <div className="text-xs" style={{ color: "var(--theme-textSecondary)" }}>
                  Revenus totaux
                </div>
              </div>
              <span className="text-lg font-semibold" style={{ color: amountColor(person.total) }}>
                {formatMontant(person.total)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
