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

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Bilan</h2>
      <p
        className="mt-2 text-sm"
        style={{ color: "var(--theme-textSecondary)" }}
      >
        Synthese revenus / depenses avec total global.
      </p>

      <div
        className="rounded-2xl border p-4 space-y-4"
        style={{
          borderColor: "var(--theme-border)",
          backgroundColor: "var(--theme-bgCard)",
        }}
      >
        <div>
          <div className="font-semibold">Revenus</div>
          <div className="ml-4 mt-1 text-sm">
            <div className="flex items-center gap-2">
              <span>Totaux</span>
              <span style={{ color: "#22c55e" }}>
                {formatMontant(data.revenus, "positive")}
              </span>
            </div>
          </div>
        </div>

        <div>
          <div className="font-semibold">Depenses</div>
          <div className="ml-4 mt-1 space-y-1 text-sm">
            <div className="flex items-center gap-2">
              <span>Fixes</span>
              <span style={{ color: "#ef4444" }}>
                {formatMontant(data.depenses.fixes, "negative")}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span>Variables</span>
              <span style={{ color: "#ef4444" }}>
                {formatMontant(data.depenses.variables, "negative")}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span>Appartements</span>
              <span style={{ color: "#ef4444" }}>
                {formatMontant(data.depenses.appartements, "negative")}
              </span>
            </div>
            <div className="flex items-center gap-2 font-semibold">
              <span>Total depenses</span>
              <span style={{ color: "#ef4444" }}>
                {formatMontant(data.depenses.total, "negative")}
              </span>
            </div>
          </div>
        </div>

        <div
          className="flex items-center justify-between border-t pt-3"
          style={{ borderColor: "var(--theme-border)" }}
        >
          <span className="text-lg font-semibold">Total global</span>
          <span
            className="text-lg font-semibold"
            style={{ color: data.net >= 0 ? "#22c55e" : "#ef4444" }}
          >
            {formatMontant(
              Math.abs(data.net),
              data.net >= 0 ? "positive" : "negative"
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
