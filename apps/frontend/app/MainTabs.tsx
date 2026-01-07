"use client";

import { useState } from "react";
import { RevenusTab } from "./tabs/RevenusTab";
import { DepensesFixesTab } from "./tabs/DepensesFixesTab";
import { DepensesVariablesTab } from "./tabs/DepensesVariablesTab";
import { BilanTab } from "./tabs/BilanTab";
import { AppartementsTab } from "./tabs/AppartementsTab";
import { ThemeSelector } from "./components/ThemeSelector";
import { useBudget } from "./contexts/BudgetContext";

const BalanceIcon = ({ color = "#fbbf24" }: { color?: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12 4v2m0 0 5 9m-5-9-5 9m10 0H7m10 0a3 3 0 1 0 6 0m-6 0a3 3 0 1 1-6 0m-4 0a3 3 0 1 1-6 0m6 0H3m9 0v4m-3 0h6"
      stroke={color}
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

type TabId = "revenus" | "depenses" | "bilan";
type DepenseSubId = "variables" | "fixes" | "appartements";

const tabs: { id: TabId; label: string }[] = [
  { id: "revenus", label: "Revenus" },
  { id: "depenses", label: "Depenses" },
  { id: "bilan", label: "Bilan" },
];

const depenseSubTabs: { id: DepenseSubId; label: string }[] = [
  { id: "variables", label: "Depenses variables" },
  { id: "fixes", label: "Depenses fixes" },
  { id: "appartements", label: "Appartements" },
];

const formatMontant = (
  value: number,
  sign: "positive" | "negative" | "none" = "none"
) => {
  const formatted = `${value.toLocaleString("fr-FR")} \u20ac`;
  if (sign === "positive") return `+${formatted}`;
  if (sign === "negative") return `-${formatted}`;
  return formatted;
};

export function MainTabs() {
  const [active, setActive] = useState<TabId>("revenus");
  const [activeDepense, setActiveDepense] = useState<DepenseSubId>("variables");
  const { totals } = useBudget();

  const subTotal = (sub: DepenseSubId) =>
    sub === "variables" ? totals.depensesVariables : sub === "fixes" ? totals.depensesFixes : totals.appartements;

  return (
    <main
      className="min-h-screen"
      style={{
        backgroundColor: "var(--theme-bg)",
        color: "var(--theme-text)",
      }}
    >
      <div className="mx-auto max-w-5xl px-6 pt-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Budget</h1>
            <p className="mt-2" style={{ color: "var(--theme-textSecondary)" }}>
              Gere tes revenus et depenses, et visualise ton bilan.
            </p>
          </div>
          <ThemeSelector />
        </div>
      </div>

      <div className="mx-auto mt-8 max-w-6xl px-6 pb-10">
        <div
          className="rounded-2xl border shadow-sm backdrop-blur"
          style={{
            borderColor: "var(--theme-border)",
            backgroundColor: "var(--theme-bgCard)",
          }}
        >
          <div className="flex flex-col md:flex-row">
            {/* Sidebar principal */}
            <div
              className="md:w-60 border-b md:border-b-0 md:border-r"
              style={{ borderColor: "var(--theme-border)", backgroundColor: "var(--theme-bg)" }}
            >
              <div className="p-3 space-y-2" role="tablist" aria-label="Sections budget">
                {tabs.map((t) => {
                  const isActive = active === t.id;

                  let total = 0;
                  let totalColor = "var(--theme-tabInactiveText)";
                  let bgHover = "var(--theme-tabHoverBg)";
                  let activeBg = "var(--theme-tabActiveBg)";
                  let activeText = "var(--theme-tabActiveText)";
                  let inactiveText = "var(--theme-tabInactiveText)";
                  let icon: React.ReactNode = null;
                  let sign: "positive" | "negative" | "none" = "none";

                  if (t.id === "revenus") {
                    total = totals.revenus;
                    totalColor = "var(--theme-success, #22c55e)";
                    bgHover = "rgba(34,197,94,0.12)";
                    activeBg = "rgba(34,197,94,0.18)";
                    activeText = "#ffffff";
                    inactiveText = "var(--theme-tabInactiveText)";
                    sign = "positive";
                  } else if (t.id === "depenses") {
                    total = totals.depensesFixes + totals.depensesVariables + totals.appartements;
                    const isPositive = total >= 0;
                    totalColor = isPositive ? "var(--theme-success, #22c55e)" : "var(--theme-danger, #ef4444)";
                    bgHover = isPositive ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)";
                    activeBg = isPositive ? "rgba(34,197,94,0.18)" : "rgba(239,68,68,0.18)";
                    activeText = "#ffffff";
                    sign = isPositive ? "positive" : "negative";
                  } else if (t.id === "bilan") {
                    total = totals.revenus - totals.depensesFixes - totals.depensesVariables + totals.appartements;
                    const isPositive = total >= 0;
                    totalColor = isPositive ? "var(--theme-success, #22c55e)" : "var(--theme-danger, #ef4444)";
                    bgHover = isPositive ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)";
                    activeBg = isPositive ? "rgba(34,197,94,0.18)" : "rgba(239,68,68,0.18)";
                    activeText = "#ffffff";
                    inactiveText = "var(--theme-tabInactiveText)";
                    sign = isPositive ? "positive" : "negative";
                    icon = <BalanceIcon color="#fbbf24" />;
                  }

                  return (
                    <button
                      key={t.id}
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => setActive(t.id)}
                      className="w-full text-left rounded-xl px-3 py-3 text-sm font-medium transition border"
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
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {icon && <span className="inline-flex align-middle">{icon}</span>}
                          <span>{t.label}</span>
                        </div>
                        <span style={{ color: totalColor }}>{formatMontant(Math.abs(total), sign)}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Contenu principal */}
            <div className="flex-1 p-6 space-y-4">
              <div hidden={active !== "revenus"} aria-hidden={active !== "revenus"}>
                <RevenusTab />
              </div>

              <div hidden={active !== "depenses"} aria-hidden={active !== "depenses"} className="space-y-4">
                <div
                  className="flex gap-3 flex-wrap md:flex-nowrap overflow-x-auto pb-1 px-2 py-2 rounded-xl"
                  style={{ backgroundColor: "var(--theme-bgCard)" }}
                >
                  {depenseSubTabs.map((sub) => {
                    const isSubActive = activeDepense === sub.id;
                    const isAppart = sub.id === "appartements";
                    const isPositive = sub.id === "appartements" ? totals.appartements >= 0 : false;
                    const color =
                      sub.id === "variables" || sub.id === "fixes"
                        ? "var(--theme-danger, #ef4444)"
                        : isPositive
                        ? "var(--theme-success, #22c55e)"
                        : "var(--theme-danger, #ef4444)";

                    const amount = subTotal(sub.id);

                    return (
                      <button
                        key={sub.id}
                        onClick={() => setActiveDepense(sub.id)}
                        className="relative rounded-2xl px-4 py-3 text-xs sm:text-sm whitespace-nowrap shadow-sm transition"
                        style={{
                          backgroundColor: isSubActive ? `${color}22` : "var(--theme-bgCard)",
                          color: isSubActive ? color : "var(--theme-text)",
                          minWidth: "180px",
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold"
                            style={{ backgroundColor: `${color}22`, color }}
                          >
                            {sub.id === "variables" ? "V" : sub.id === "fixes" ? "F" : "A"}
                          </span>
                          <div className="flex flex-col items-start">
                            <span className="text-sm font-semibold">{sub.label}</span>
                            <span className="text-[11px]" style={{ color }}>
                              {formatMontant(Math.abs(amount), sub.id === "appartements" ? (isPositive ? "positive" : "negative") : "negative")}
                            </span>
                          </div>
                        </div>
                        {isSubActive && (
                          <span
                            className="absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl"
                            style={{ backgroundColor: color, opacity: 0.65 }}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>

                <div hidden={activeDepense !== "variables"} aria-hidden={activeDepense !== "variables"}>
                  <DepensesVariablesTab />
                </div>
                <div hidden={activeDepense !== "fixes"} aria-hidden={activeDepense !== "fixes"}>
                  <DepensesFixesTab />
                </div>
                <div hidden={activeDepense !== "appartements"} aria-hidden={activeDepense !== "appartements"}>
                  <AppartementsTab />
                </div>
              </div>

              <div hidden={active !== "bilan"} aria-hidden={active !== "bilan"}>
                <BilanTab />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
