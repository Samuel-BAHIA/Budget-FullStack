"use client";

import React, { useMemo, useState } from "react";
import { DepensesVariablesTab } from "./tabs/DepensesVariablesTab";
import { DepensesFixesTab } from "./tabs/DepensesFixesTab";
import { AppartementsTab } from "./tabs/AppartementsTab";
import type { AppartementData } from "./tabs/AppartementsTab";
import { RevenusTab, type Person } from "./tabs/RevenusTab";
import { TrashIcon } from "./components/icons/TrashIcon";
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
  onDelete?: () => void;
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
  const [showRevenusChildren, setShowRevenusChildren] = useState(false);
  const [activeDepenseTab, setActiveDepenseTab] = useState<DepenseTab>("variables");
  const [showDepensesChildren, setShowDepensesChildren] = useState(false);
  const [showVariablesChildren, setShowVariablesChildren] = useState(false);
  const [showFixesChildren, setShowFixesChildren] = useState(false);
  const [showAppartChildren, setShowAppartChildren] = useState(false);
  const [activeVariableSection, setActiveVariableSection] = useState<VariableSection>("quotidien");
  const [activeFixeSection, setActiveFixeSection] = useState<FixeSection>("abonnements");
  const [persons, setPersons] = useState<Person[]>([
    { id: 1, name: "Personne 1", revenus: [{ id: 1, name: "Salaire", montant: 0 }] },
  ]);
  const [activePersonId, setActivePersonId] = useState<number | null>(1);
  const [appartements, setAppartements] = useState<AppartementData[]>(() => [
    {
      id: 1,
      name: "Appartement 1",
      type: "location",
      data: {
        loyer: 800,
        credit: 100,
        assuranceCredit: 20,
        taxeFonciere: 0,
        impotsRevenu: 0,
        chargesCopro: 0,
        assurance: 40,
        internet: 30,
        eau: 50,
        electricite: 60,
        gaz: 45,
      },
    },
  ]);
  const [activeAppartementId, setActiveAppartementId] = useState<number | null>(1);

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
  onDelete,
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
        {onDelete && (
          <span
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="inline-flex items-center rounded-md px-1.5 py-1 text-xs"
            style={{ color: "#ef4444" }}
            aria-label="Supprimer"
            role="button"
          >
            <TrashIcon />
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
          setShowAppartChildren(false);
        }
      } else {
        setActiveTab("depenses");
        setShowDepensesChildren(true);
        setShowVariablesChildren(true);
        setActiveDepenseTab("variables");
      }
    } else {
      setActiveTab(tab);
      setShowRevenusChildren(tab === "revenus" ? !showRevenusChildren : false);
      setShowDepensesChildren(false);
      setShowVariablesChildren(false);
      setShowFixesChildren(false);
      setShowAppartChildren(false);
    }
  };

  const handleDepenseTabClick = (tab: DepenseTab) => {
    setActiveTab("depenses");
    setActiveDepenseTab(tab);
    setShowDepensesChildren(true);

    if (tab === "variables") {
      setShowVariablesChildren((prev) => (activeDepenseTab === "variables" ? !prev : true));
      setShowFixesChildren(false);
      setShowAppartChildren(false);
    } else if (tab === "fixes") {
      setShowFixesChildren((prev) => (activeDepenseTab === "fixes" ? !prev : true));
      setShowVariablesChildren(false);
      setShowAppartChildren(false);
    } else {
      setShowVariablesChildren(false);
      setShowFixesChildren(false);
      setShowAppartChildren((prev) => (activeDepenseTab === "appartements" ? !prev : true));
    }
  };

  const handleVariableChildClick = (section: VariableSection) => {
    setActiveTab("depenses");
    setActiveDepenseTab("variables");
    setShowDepensesChildren(true);
    setShowVariablesChildren(true);
    setShowFixesChildren(false);
    setShowAppartChildren(false);
    setActiveVariableSection(section);
  };

  const handleFixeChildClick = (section: FixeSection) => {
    setActiveTab("depenses");
    setActiveDepenseTab("fixes");
    setShowDepensesChildren(true);
    setShowFixesChildren(true);
    setShowVariablesChildren(false);
    setShowAppartChildren(false);
    setActiveFixeSection(section);
  };

  const handleAppartementClick = (item: AppartementData) => {
    setActiveTab("depenses");
    setActiveDepenseTab("appartements");
    setShowDepensesChildren(true);
    setShowAppartChildren(true);
    setShowVariablesChildren(false);
    setShowFixesChildren(false);
    setActiveAppartementId(item.id);
  };

  const handleAddAppartement = () => {
    setAppartements((prev) => {
      const nextId = Math.max(0, ...prev.map((a) => a.id)) + 1;
      const next: AppartementData = {
        id: nextId,
        name: `Appartement ${nextId}`,
        type: "location",
        data: {
          loyer: 0,
          credit: 0,
          assuranceCredit: 0,
          taxeFonciere: 0,
          impotsRevenu: 0,
          chargesCopro: 0,
          assurance: 0,
          internet: 0,
          eau: 0,
          electricite: 0,
          gaz: 0,
        },
      };
      setActiveAppartementId(nextId);
      return [...prev, next];
    });
    setActiveTab("depenses");
    setActiveDepenseTab("appartements");
    setShowDepensesChildren(true);
    setShowAppartChildren(true);
    setShowVariablesChildren(false);
    setShowFixesChildren(false);
  };

  const handleAppartementsChange = (next: AppartementData[]) => {
    setAppartements(next);
    if (activeAppartementId !== null && !next.find((a) => a.id === activeAppartementId)) {
      setActiveAppartementId(next[0]?.id ?? null);
    }
  };

  const handlePersonsChange = (next: Person[]) => {
    setPersons(next);
    if (activePersonId !== null && !next.find((p) => p.id === activePersonId)) {
      setActivePersonId(next[0]?.id ?? null);
    }
  };

  const activeAppartement = appartements.find((apt) => apt.id === activeAppartementId) ?? appartements[0];
  const personTotal = (p: Person) => p.revenus.reduce((s, r) => s + r.montant, 0);
  const revenusPersons = persons.map((p) => ({
    id: p.id,
    name: p.name || `Personne ${p.id}`,
    montant: personTotal(p),
  }));
  const calcAppartementTotal = (apt: AppartementData) => {
    const d = apt.data;
    if (apt.type === "propriete") {
      return (
        d.loyer -
        (d.impotsRevenu + d.taxeFonciere + d.chargesCopro + d.assurance + d.credit + d.assuranceCredit)
      );
    }
    return -(d.loyer + d.assurance + d.internet + d.eau + d.electricite + d.gaz);
  };

  const renderContent = () => {
    if (activeTab === "revenus") return <RevenusTab persons={persons} onPersonsChange={handlePersonsChange} />;
    if (activeTab === "bilan") return <BilanTab />;
    if (activeDepenseTab === "variables")
      return <DepensesVariablesTab activeSection={activeVariableSection} />;
    if (activeDepenseTab === "fixes")
      return <DepensesFixesTab activeSection={activeFixeSection} />;
    return (
      <AppartementsTab
        appartements={appartements}
        onAppartementsChange={handleAppartementsChange}
      />
    );
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
                onClick: () => {
                  if (activeTab === "revenus") {
                    setShowRevenusChildren((prev) => !prev);
                  } else {
                    handleMainTabClick("revenus");
                    setShowRevenusChildren(true);
                  }
                  setShowDepensesChildren(false);
                  setShowVariablesChildren(false);
                  setShowFixesChildren(false);
                  setShowAppartChildren(false);
                },
                total: totals.revenus,
                caret: showRevenusChildren ? "open" : "closed",
              })}

              {activeTab === "revenus" && showRevenusChildren && (
                <div className="ml-1 border-l pl-3 space-y-1" style={{ borderColor: "var(--theme-border)" }}>
                  {revenusPersons.map((person) => (
                    <React.Fragment key={person.id}>
                      {renderNavButton({
                        label: person.name,
                        active: activePersonId === person.id,
                        onClick: () => {
                          setActivePersonId(person.id);
                          setActiveTab("revenus");
                          setShowRevenusChildren(true);
                        },
                        level: 1,
                        muted: true,
                        total: person.montant,
                        onDelete: () => {
                          setPersons((prev) => {
                            const next = prev.filter((p) => p.id !== person.id);
                            if (next.length === 0) {
                              return [{ id: 1, name: "Personne 1", revenus: [{ id: 1, name: "Salaire", montant: 0 }] }];
                            }
                            if (activePersonId === person.id) {
                              setActivePersonId(next[0].id);
                            }
                            return next;
                          });
                        },
                      })}
                    </React.Fragment>
                  ))}
                  <button
                    type="button"
                    className="w-full text-left rounded-lg px-3 py-2 text-sm font-semibold transition"
                    style={{
                      color: "var(--theme-textSecondary)",
                      backgroundColor: "transparent",
                    }}
                    onClick={() => {
                      setPersons((prev) => {
                        const nextId = Math.max(0, ...prev.map((p) => p.id)) + 1;
                        const next = [
                          ...prev,
                          { id: nextId, name: `Personne ${nextId}`, revenus: [{ id: 1, name: "Revenu 1", montant: 0 }] },
                        ];
                        setActivePersonId(nextId);
                        return next;
                      });
                      setActiveTab("revenus");
                      setShowRevenusChildren(true);
                    }}
                  >
                    + Ajouter
                  </button>
                </div>
              )}

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
                          total: totals.depensesVariables,
                        })}
                        {renderNavButton({
                          label: "Voiture",
                          active: activeDepenseTab === "variables" && activeVariableSection === "voitures",
                          onClick: () => handleVariableChildClick("voitures"),
                          level: 2,
                          muted: true,
                          total: totals.depensesVariables,
                        })}
                        {renderNavButton({
                          label: "Autres",
                          active: activeDepenseTab === "variables" && activeVariableSection === "autres",
                          onClick: () => handleVariableChildClick("autres"),
                          level: 2,
                          muted: true,
                          total: totals.depensesVariables,
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
                          total: totals.depensesFixes,
                        })}
                        {renderNavButton({
                          label: "Voiture",
                          active: activeDepenseTab === "fixes" && activeFixeSection === "voiture",
                          onClick: () => handleFixeChildClick("voiture"),
                          level: 2,
                          muted: true,
                          total: totals.depensesFixes,
                        })}
                        {renderNavButton({
                          label: "Autres",
                          active: activeDepenseTab === "fixes" && activeFixeSection === "autres",
                          onClick: () => handleFixeChildClick("autres"),
                          level: 2,
                          muted: true,
                          total: totals.depensesFixes,
                        })}
                      </div>
                    )}

                    {renderNavButton({
                      label: "Appartements",
                      active: activeDepenseTab === "appartements",
                      onClick: () => handleDepenseTabClick("appartements"),
                      total: totals.appartements,
                      caret: showAppartChildren ? "open" : "closed",
                      level: 1,
                    })}

                    {showAppartChildren && (
                      <div className="ml-3 border-l pl-3 space-y-1" style={{ borderColor: "var(--theme-border)" }}>
                        {appartements.map((apt) => (
                          <React.Fragment key={apt.id ? `apt-${apt.id}` : apt.name}>
                            {renderNavButton({
                              label: apt.name,
                              active: activeDepenseTab === "appartements" && activeAppartement?.id === apt.id,
                              onClick: () => handleAppartementClick(apt),
                              level: 2,
                              muted: true,
                              total: calcAppartementTotal(apt),
                              onDelete: () => {
                                setAppartements((prev) => {
                                  const next = prev.filter((a) => a.id !== apt.id);
                                  if (activeAppartementId === apt.id) {
                                    setActiveAppartementId(next[0]?.id ?? null);
                                  }
                                  return next;
                                });
                              },
                            })}
                          </React.Fragment>
                        ))}
                        <button
                          type="button"
                          onClick={handleAddAppartement}
                          className="w-full text-left rounded-lg px-3 py-2 text-sm font-semibold transition"
                          style={{
                            color: "var(--theme-textSecondary)",
                            backgroundColor: "transparent",
                          }}
                        >
                          + Ajouter un appartement
                        </button>
                      </div>
                    )}
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

