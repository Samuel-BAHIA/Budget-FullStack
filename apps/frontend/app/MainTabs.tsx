"use client";

import React, { useMemo, useState } from "react";
import { RevenusTab } from "./tabs/RevenusTab";
import { DepensesVariablesTab } from "./tabs/DepensesVariablesTab";
import { DepensesFixesTab } from "./tabs/DepensesFixesTab";
import { AppartementsTab } from "./tabs/AppartementsTab";
import { BilanTab } from "./tabs/BilanTab";
import { useBudget } from "./contexts/BudgetContext";

type MainTabId = "revenus" | "depenses" | "bilan";
type DepenseTab = "variables" | "fixes" | "appartements";
type VariableSection = "quotidien" | "voitures" | "autres";
type FixeSection = "abonnements" | "voiture" | "autres";

type NavButtonProps = {
  label: string;
  active?: boolean;
  onClick: () => void;
  total?: number;
  caret?: "open" | "closed";
  level?: number;
  muted?: boolean;
};

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

export function MainTabs() {
  const { totals } = useBudget();
  const [activeTab, setActiveTab] = useState<MainTabId>("revenus");
  const [activeDepenseTab, setActiveDepenseTab] = useState<DepenseTab>("variables");
  const [showDepensesChildren, setShowDepensesChildren] = useState(false);
  const [showVariablesChildren, setShowVariablesChildren] = useState(false);
  const [showFixesChildren, setShowFixesChildren] = useState(false);
  const [activeVariableSection, setActiveVariableSection] = useState<VariableSection>("quotidien");
  const [activeFixeSection, setActiveFixeSection] = useState<FixeSection>("abonnements");

  const depensesTotal = useMemo(
    () => totals.depensesFixes + totals.depensesVariables + Math.min(0, totals.appartements),
    [totals]
  );
  const bilanTotal = useMemo(
    () => totals.revenus + totals.appartements - totals.depensesFixes - totals.depensesVariables,
    [totals]
  );

  const renderNavButton = ({
    label,
    active,
    onClick,
    total,
    caret,
    level = 0,
    muted,
  }: NavButtonProps) => {
    const paddingLeft = 12 + level * 12;
    return (
      <button
        type="button"
        onClick={onClick}
        className={`w-full rounded-xl border text-left transition flex items-center justify-between gap-3`}
        style={{
          padding: "10px 12px",
          paddingLeft,
          backgroundColor: active ? "var(--theme-tabActiveBg)" : "transparent",
          color: active
            ? "var(--theme-tabActiveText)"
            : muted
            ? "var(--theme-textSecondary)"
            : "var(--theme-tabInactiveText)",
          borderColor: active ? "var(--theme-tabActiveBg)" : "transparent",
          boxShadow: active ? "inset 0 0 0 1px var(--theme-tabActiveBg)" : "none",
        }}
      >
        <span className="flex items-center gap-2">
          {caret && (
            <span className="text-sm" aria-hidden>
              {caret === "open" ? "\u25be" : "\u25b8"}
            </span>
          )}
          <span className="font-semibold">{label}</span>
        </span>
        {typeof total === "number" && (
          <span className="text-sm font-semibold" style={{ color: amountColor(total) }}>
            {formatMontant(total)}
          </span>
        )}
      </button>
    );
  };

  const handleMainTabClick = (tab: MainTabId) => {
    if (tab === "depenses") {
      if (activeTab === "depenses") {
        const next = !showDepensesChildren;
        setShowDepensesChildren(next);
        if (!next) {
          setShowVariablesChildren(false);
          setShowFixesChildren(false);
        }
      } else {
        setActiveTab("depenses");
        setShowDepensesChildren(true);
        setShowVariablesChildren(true);
        setActiveDepenseTab("variables");
      }
    } else {
      setActiveTab(tab);
      setShowDepensesChildren(false);
      setShowVariablesChildren(false);
      setShowFixesChildren(false);
    }
  };

  const handleDepenseTabClick = (tab: DepenseTab) => {
    setActiveTab("depenses");
    setActiveDepenseTab(tab);
    setShowDepensesChildren(true);

    if (tab === "variables") {
      setShowVariablesChildren((prev) => (activeDepenseTab === "variables" ? !prev : true));
      setShowFixesChildren(false);
    } else if (tab === "fixes") {
      setShowFixesChildren((prev) => (activeDepenseTab === "fixes" ? !prev : true));
      setShowVariablesChildren(false);
    } else {
      setShowVariablesChildren(false);
      setShowFixesChildren(false);
    }
  };

  const handleVariableChildClick = (section: VariableSection) => {
    setActiveTab("depenses");
    setActiveDepenseTab("variables");
    setShowDepensesChildren(true);
    setShowVariablesChildren(true);
    setShowFixesChildren(false);
    setActiveVariableSection(section);
  };

  const handleFixeChildClick = (section: FixeSection) => {
    setActiveTab("depenses");
    setActiveDepenseTab("fixes");
    setShowDepensesChildren(true);
    setShowFixesChildren(true);
    setShowVariablesChildren(false);
    setActiveFixeSection(section);
  };

  const renderContent = () => {
    if (activeTab === "revenus") return <RevenusTab />;
    if (activeTab === "bilan") return <BilanTab />;
    if (activeDepenseTab === "variables")
      return <DepensesVariablesTab activeSection={activeVariableSection} />;
    if (activeDepenseTab === "fixes")
      return <DepensesFixesTab activeSection={activeFixeSection} />;
    return <AppartementsTab />;
  };

  return (
    <div className="min-h-screen bg-[var(--theme-bg)] text-[var(--theme-text)]">
      <div className="mx-auto max-w-7xl px-4 py-6 lg:py-8">
        <div className="grid gap-6 lg:grid-cols-[280px,1fr] lg:gap-8">
          <aside
            className="rounded-2xl border shadow-sm"
            style={{ backgroundColor: "var(--theme-bgCard)", borderColor: "var(--theme-border)" }}
          >
            <div className="p-3 lg:p-4 flex flex-col gap-2">
              {renderNavButton({
                label: "Revenus",
                active: activeTab === "revenus",
                onClick: () => handleMainTabClick("revenus"),
                total: totals.revenus,
              })}

              <div className="flex flex-col gap-1">
                {renderNavButton({
                  label: "Depenses",
                  active: activeTab === "depenses",
                  onClick: () => handleMainTabClick("depenses"),
                  total: depensesTotal,
                  caret: showDepensesChildren ? "open" : "closed",
                })}

                {activeTab === "depenses" && showDepensesChildren && (
                  <div className="ml-1 border-l pl-3 space-y-1" style={{ borderColor: "var(--theme-border)" }}>
                    {renderNavButton({
                      label: "Variables",
                      active: activeDepenseTab === "variables",
                      onClick: () => handleDepenseTabClick("variables"),
                      total: totals.depensesVariables,
                      caret: showVariablesChildren ? "open" : "closed",
                      level: 1,
                    })}

                    {showVariablesChildren && (
                      <div className="ml-3 border-l pl-3 space-y-1" style={{ borderColor: "var(--theme-border)" }}>
                        {renderNavButton({
                          label: "Quotidien",
                          active: activeDepenseTab === "variables" && activeVariableSection === "quotidien",
                          onClick: () => handleVariableChildClick("quotidien"),
                          level: 2,
                          muted: true,
                        })}
                        {renderNavButton({
                          label: "Voiture",
                          active: activeDepenseTab === "variables" && activeVariableSection === "voitures",
                          onClick: () => handleVariableChildClick("voitures"),
                          level: 2,
                          muted: true,
                        })}
                        {renderNavButton({
                          label: "Autres",
                          active: activeDepenseTab === "variables" && activeVariableSection === "autres",
                          onClick: () => handleVariableChildClick("autres"),
                          level: 2,
                          muted: true,
                        })}
                      </div>
                    )}

                    {renderNavButton({
                      label: "Fixes",
                      active: activeDepenseTab === "fixes",
                      onClick: () => handleDepenseTabClick("fixes"),
                      total: totals.depensesFixes,
                      caret: showFixesChildren ? "open" : "closed",
                      level: 1,
                    })}

                    {showFixesChildren && (
                      <div className="ml-3 border-l pl-3 space-y-1" style={{ borderColor: "var(--theme-border)" }}>
                        {renderNavButton({
                          label: "Abonnements",
                          active: activeDepenseTab === "fixes" && activeFixeSection === "abonnements",
                          onClick: () => handleFixeChildClick("abonnements"),
                          level: 2,
                          muted: true,
                        })}
                        {renderNavButton({
                          label: "Voiture",
                          active: activeDepenseTab === "fixes" && activeFixeSection === "voiture",
                          onClick: () => handleFixeChildClick("voiture"),
                          level: 2,
                          muted: true,
                        })}
                        {renderNavButton({
                          label: "Autres",
                          active: activeDepenseTab === "fixes" && activeFixeSection === "autres",
                          onClick: () => handleFixeChildClick("autres"),
                          level: 2,
                          muted: true,
                        })}
                      </div>
                    )}

                    {renderNavButton({
                      label: "Appartements",
                      active: activeDepenseTab === "appartements",
                      onClick: () => handleDepenseTabClick("appartements"),
                      total: totals.appartements,
                      level: 1,
                    })}
                  </div>
                )}
              </div>

              {renderNavButton({
                label: "Bilan",
                active: activeTab === "bilan",
                onClick: () => handleMainTabClick("bilan"),
                total: bilanTotal,
              })}
            </div>
          </aside>

          <main className="space-y-6 p-3 sm:p-4 md:p-6">
            {renderContent()}
          </main>
        </div>
      </div>
    </div>
  );
}

