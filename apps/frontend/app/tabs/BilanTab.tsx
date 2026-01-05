"use client";

import { useMemo } from "react";
import { useBudget } from "../contexts/BudgetContext";

const formatMontant = (
  value: number,
  sign: "positive" | "negative" | "none" = "none"
) => {
  const formatted = `${value.toLocaleString("fr-FR")} €`;
  if (sign === "positive") return `+${formatted}`;
  if (sign === "negative") return `-${formatted}`;
  return formatted;
};

export function BilanTab() {
  const { totals } = useBudget();

  const data = useMemo(() => {
    const depensesTotales =
      totals.depensesFixes + totals.depensesVariables + totals.appartements;
    const net = totals.revenus - depensesTotales;

    return {
      revenus: totals.revenus,
      depenses: {
        fixes: totals.depensesFixes,
        variables: totals.depensesVariables,
        appartements: totals.appartements,
        total: depensesTotales,
      },
      net,
    };
  }, [totals]);

  const graphMax = Math.max(
    data.revenus,
    data.depenses.total,
    Math.abs(data.net),
    1
  );

  const barStyle = (value: number, color: string) => ({
    width: `${Math.min(100, (value / graphMax) * 100)}%`,
    backgroundColor: color,
  });

  const depensesParts = [
    { label: "Fixes", value: data.depenses.fixes },
    { label: "Variables", value: data.depenses.variables },
    { label: "Appartements", value: data.depenses.appartements },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Bilan</h2>
      <p
        className="mt-2 text-sm"
        style={{ color: "var(--theme-textSecondary)" }}
      >
        Synthese revenus / depenses avec total global et barres visuelles.
      </p>

      <div
        className="rounded-2xl border p-4 space-y-6"
        style={{
          borderColor: "var(--theme-border)",
          backgroundColor: "var(--theme-bgCard)",
        }}
      >
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold">Revenus</span>
            <span style={{ color: "#22c55e" }}>
              {formatMontant(data.revenus, "positive")}
            </span>
          </div>
          <div className="h-2 rounded-full bg-[var(--theme-border)]/40">
            <div
              className="h-2 rounded-full"
              style={barStyle(data.revenus, "rgba(34,197,94,0.7)")}
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold">Depenses</span>
            <span style={{ color: "#ef4444" }}>
              {formatMontant(data.depenses.total, "negative")}
            </span>
          </div>
          <div className="h-2 rounded-full bg-[var(--theme-border)]/40">
            <div
              className="h-2 rounded-full"
              style={barStyle(data.depenses.total, "rgba(239,68,68,0.65)")}
            />
          </div>
          <div className="space-y-1 text-sm">
            {depensesParts.map((p) => (
              <div key={p.label} className="flex items-center gap-3">
                <span className="w-28" style={{ color: "var(--theme-textSecondary)" }}>
                  {p.label}
                </span>
                <div className="flex-1 h-2 rounded-full bg-[var(--theme-border)]/30">
                  <div
                    className="h-2 rounded-full"
                    style={barStyle(p.value, "rgba(239,68,68,0.45)")}
                  />
                </div>
                <span style={{ color: "#ef4444" }}>
                  {formatMontant(p.value, "negative")}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold">Total global</span>
            <span
              className="text-lg font-semibold"
              style={{ color: data.net >= 0 ? "#22c55e" : "#ef4444" }}
            >
              {formatMontant(Math.abs(data.net), data.net >= 0 ? "positive" : "negative")}
            </span>
          </div>
          <div className="h-2 rounded-full bg-[var(--theme-border)]/40">
            <div
              className="h-2 rounded-full"
              style={barStyle(Math.abs(data.net), data.net >= 0 ? "rgba(34,197,94,0.65)" : "rgba(239,68,68,0.65)")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
