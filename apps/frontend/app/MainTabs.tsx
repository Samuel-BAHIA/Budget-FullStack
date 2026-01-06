"use client";

import { useState } from "react";
import { RevenusTab } from "./tabs/RevenusTab";
import { DepensesFixesTab } from "./tabs/DepensesFixesTab";
import { DepensesVariablesTab } from "./tabs/DepensesVariablesTab";
import { BilanTab } from "./tabs/BilanTab";
import { AppartementsTab } from "./tabs/AppartementsTab";
import { TestTab } from "./tabs/TestTab";
import { ThemeSelector } from "./components/ThemeSelector";
import { useBudget } from "./contexts/BudgetContext";

type TabId = "revenus" | "fixes" | "variables" | "bilan" | "appartements" | "test";

const tabs: { id: TabId; label: string }[] = [
  { id: "revenus", label: "Revenus" },
  { id: "fixes", label: "Depenses fixes" },
  { id: "variables", label: "Depenses variables" },
  { id: "appartements", label: "Appartements" },
  { id: "bilan", label: "Bilan" },
  { id: "test", label: "Test" },
];

// Fonction pour formater le montant avec signe
const formatMontant = (
  value: number,
  sign: "positive" | "negative" | "none" = "none"
) => {
  const formatted = `${value.toLocaleString("fr-FR")} €`;
  if (sign === "positive") return `+${formatted}`;
  if (sign === "negative") return `-${formatted}`;
  return formatted;
};

export function MainTabs() {
  const [active, setActive] = useState<TabId>("revenus");
  const { totals } = useBudget();

  return (
    <main
      className="min-h-screen"
      style={{
        backgroundColor: "var(--theme-bg)",
        color: "var(--theme-text)",
      }}
    >
      {/* Header */}
      <div className="mx-auto max-w-5xl px-6 pt-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Budget</h1>
            <p
              className="mt-2"
              style={{ color: "var(--theme-textSecondary)" }}
            >
              Gere tes revenus et depenses, et visualise ton bilan.
            </p>
          </div>
          <ThemeSelector />
        </div>
      </div>

      {/* Card */}
      <div className="mx-auto mt-8 max-w-5xl px-6 pb-10">
        <div
          className="rounded-2xl border shadow-sm backdrop-blur"
          style={{
            borderColor: "var(--theme-border)",
            backgroundColor: "var(--theme-bgCard)",
          }}
        >
          {/* Tabs bar */}
          <div
            className="border-b px-2"
            style={{ borderColor: "var(--theme-border)" }}
          >
            <div
              role="tablist"
              aria-label="Sections budget"
              className="flex gap-2 overflow-x-auto py-2"
            >
              {tabs.map((t) => {
                const isActive = active === t.id;

                // Determiner le total et la couleur selon l'onglet
                let total = 0;
                let totalColor = "var(--theme-tabInactiveText)";
                let bgHover = "var(--theme-tabHoverBg)";
                let activeBg = "var(--theme-tabActiveBg)";
                let activeText = "var(--theme-tabActiveText)";
                let inactiveText = "var(--theme-tabInactiveText)";
                let sign: "positive" | "negative" | "none" = "none";

                if (t.id === "revenus") {
                  total = totals.revenus;
                  totalColor = "var(--theme-success, #22c55e)";
                  bgHover = "rgba(34,197,94,0.12)";
                  activeBg = "rgba(34,197,94,0.18)";
                  activeText = "#0f5132";
                  inactiveText = "var(--theme-tabInactiveText)";
                  sign = "positive";
                } else if (t.id === "fixes") {
                  total = totals.depensesFixes;
                  totalColor = "var(--theme-danger, #ef4444)";
                  bgHover = "rgba(239,68,68,0.12)";
                  activeBg = "rgba(239,68,68,0.18)";
                  activeText = "#7f1d1d";
                  inactiveText = "var(--theme-tabInactiveText)";
                  sign = "negative";
                } else if (t.id === "variables") {
                  total = totals.depensesVariables;
                  totalColor = "var(--theme-danger, #ef4444)";
                  bgHover = "rgba(239,68,68,0.12)";
                  activeBg = "rgba(239,68,68,0.18)";
                  activeText = "#7f1d1d";
                  inactiveText = "var(--theme-tabInactiveText)";
                  sign = "negative";
                } else if (t.id === "appartements") {
                  total = totals.appartements;
                  const isPositive = total >= 0;
                  totalColor = isPositive ? "var(--theme-success, #22c55e)" : "var(--theme-danger, #ef4444)";
                  sign = isPositive ? "positive" : "negative";
                } else if (t.id === "bilan") {
                  total =
                    totals.revenus -
                    totals.depensesFixes -
                    totals.depensesVariables +
                    totals.appartements;
                  const isPositive = total >= 0;
                  totalColor = isPositive ? "var(--theme-success, #22c55e)" : "var(--theme-danger, #ef4444)";
                  bgHover = isPositive ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)";
                  activeBg = isPositive ? "rgba(34,197,94,0.18)" : "rgba(239,68,68,0.18)";
                  activeText = isPositive ? "#0f5132" : "#7f1d1d";
                  inactiveText = "var(--theme-tabInactiveText)";
                  sign = isPositive ? "positive" : "negative";
                }

                return (
                  <button
                    key={t.id}
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActive(t.id)}
                    className={[
                      "whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium transition border",
                    ].join(" ")}
                    style={
                      isActive
                        ? {
                            borderColor: activeBg,
                            backgroundColor: activeBg,
                            color: activeText,
                          }
                        : {
                            borderColor: "transparent",
                            backgroundColor: "transparent",
                            color: inactiveText,
                          }
                    }
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = bgHover;
                        e.currentTarget.style.color = "var(--theme-text)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.color = inactiveText;
                      }
                    }}
                  >
                    {t.label}
                    {(t.id === "revenus" ||
                      t.id === "fixes" ||
                      t.id === "variables" ||
                      t.id === "appartements" ||
                      t.id === "bilan") && (
                      <span
                        className="ml-2"
                        style={{ color: totalColor }}
                      >
                        ({formatMontant(Math.abs(total), sign)})
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div hidden={active !== "revenus"} aria-hidden={active !== "revenus"}>
              <RevenusTab />
            </div>
            <div hidden={active !== "fixes"} aria-hidden={active !== "fixes"}>
              <DepensesFixesTab />
            </div>
            <div hidden={active !== "variables"} aria-hidden={active !== "variables"}>
              <DepensesVariablesTab />
            </div>
            <div hidden={active !== "appartements"} aria-hidden={active !== "appartements"}>
              <AppartementsTab />
            </div>
            <div hidden={active !== "bilan"} aria-hidden={active !== "bilan"}>
              <BilanTab />
            </div>
            <div hidden={active !== "test"} aria-hidden={active !== "test"}>
              <TestTab />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
