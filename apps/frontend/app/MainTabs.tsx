"use client";

import React, { useMemo, useState } from "react";
import { RevenusTab, type Person } from "./tabs/RevenusTab";
import { DepensesVariablesTab } from "./tabs/DepensesVariablesTab";
import { DepensesFixesTab } from "./tabs/DepensesFixesTab";
import { AppartementsTab, type AppartementData } from "./tabs/AppartementsTab";
import { BilanTab } from "./tabs/BilanTab";
import { useBudget } from "./contexts/BudgetContext";
import { TrashIcon } from "./components/icons/TrashIcon";
import { useTheme } from "./contexts/ThemeContext";

type MainTabId = "revenus" | "depenses" | "patrimoine" | "bilan";
type DepenseTab = "variables" | "fixes" | "locations";
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
  deleteDisabled?: boolean;
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

const defaultProperty = (id: number): AppartementData => ({
  id,
  name: `Propriete ${id}`,
  type: "propriete",
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
});

export function MainTabs() {
  const { totals } = useBudget();
  const { theme, setTheme, themes } = useTheme();
  const [activeTab, setActiveTab] = useState<MainTabId>("revenus");
  const [showRevenusChildren, setShowRevenusChildren] = useState(false);
  const [activeDepenseTab, setActiveDepenseTab] = useState<DepenseTab>("variables");
  const [showDepensesChildren, setShowDepensesChildren] = useState(false);
  const [showVariablesChildren, setShowVariablesChildren] = useState(false);
  const [showFixesChildren, setShowFixesChildren] = useState(false);
  const [showLocationsChildren, setShowLocationsChildren] = useState(false);
  const [activeVariableSection, setActiveVariableSection] = useState<VariableSection>("quotidien");
  const [activeFixeSection, setActiveFixeSection] = useState<FixeSection>("abonnements");
  const [persons, setPersons] = useState<Person[]>([
    { id: 1, name: "Personne 1", revenus: [{ id: 1, name: "Salaire", montant: 0 }] },
  ]);
  const [activePersonId, setActivePersonId] = useState<number | null>(1);
  const [locations, setLocations] = useState<AppartementData[]>([{
    id: 1,
    name: "Location 1",
    type: "location",
    data: {
      loyer: 800,
      credit: 0,
      assuranceCredit: 0,
      taxeFonciere: 0,
      impotsRevenu: 0,
      chargesCopro: 0,
      assurance: 40,
      internet: 30,
      eau: 50,
      electricite: 60,
      gaz: 45,
    },
  }]);
  const [activeLocationId, setActiveLocationId] = useState<number | null>(1);
  const [patrimoine, setPatrimoine] = useState<AppartementData[]>([defaultProperty(1)]);
  const [activePatrimoineId, setActivePatrimoineId] = useState<number | null>(1);
  const [showPatrimoineChildren, setShowPatrimoineChildren] = useState(false);
  const [variablesSectionTotals, setVariablesSectionTotals] = useState<{ quotidien: number; voitures: number; autres: number }>({
    quotidien: 450,
    voitures: 190,
    autres: 250,
  });
  const [fixesSectionTotals, setFixesSectionTotals] = useState<{ abonnements: number; voiture: number; autres: number }>({
    abonnements: 100,
    voiture: 470,
    autres: 120,
  });

  const revenusTotal = useMemo(
    () => persons.reduce((sum, p) => sum + p.revenus.reduce((s, r) => s + r.montant, 0), 0),
    [persons]
  );

  const depensesVariablesTotal = useMemo(
    () => variablesSectionTotals.quotidien + variablesSectionTotals.voitures + variablesSectionTotals.autres,
    [variablesSectionTotals]
  );

  const depensesFixesTotal = useMemo(
    () => fixesSectionTotals.abonnements + fixesSectionTotals.voiture + fixesSectionTotals.autres,
    [fixesSectionTotals]
  );

  const calcAppartementTotal = (apt: AppartementData) => {
    const d = apt.data;
    if (apt.type === "propriete") {
      return d.loyer - (d.impotsRevenu + d.taxeFonciere + d.chargesCopro + d.assurance + d.credit + d.assuranceCredit);
    }
    return -(d.loyer + d.assurance + d.internet + d.eau + d.electricite + d.gaz);
  };

  const locationsTotal = useMemo(
    () => locations.reduce((sum, loc) => sum + calcAppartementTotal(loc), 0),
    [locations]
  );

  const patrimoineTotal = useMemo(
    () => patrimoine.reduce((sum, prop) => sum + calcAppartementTotal(prop), 0),
    [patrimoine]
  );

  const depensesTotal = useMemo(
    () => depensesFixesTotal + depensesVariablesTotal + Math.abs(locationsTotal),
    [depensesFixesTotal, depensesVariablesTotal, locationsTotal]
  );

  const bilanTotal = useMemo(
    () =>
      revenusTotal -
      depensesFixesTotal -
      depensesVariablesTotal -
      Math.abs(locationsTotal) +
      patrimoineTotal,
    [revenusTotal, depensesFixesTotal, depensesVariablesTotal, locationsTotal, patrimoineTotal]
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
    deleteDisabled,
  }: NavButtonProps) => {
    const paddingLeft = 12 + level * 12;
    const isChild = level > 0;
    const fontSize = level === 0 ? "16px" : level === 1 ? "14px" : "12px";
    const labelColor = (() => {
      if (active) return "var(--theme-tabActiveText)";
      if (level === 0) return "var(--theme-tabInactiveText)";
      if (level === 1) return "color-mix(in srgb, var(--theme-borderLight) 25%, var(--theme-textSecondary) 75%)";
      return "color-mix(in srgb, var(--theme-textSecondary) 85%, var(--theme-text) 15%)";
    })();
    const totalFontSize = level === 0 ? "15px" : level === 1 ? "13px" : "11px";
    const totalFontWeight = level === 0 ? 800 : level === 1 ? 700 : 600;
    const totalColor = (value?: number) => {
      if (typeof value !== "number") return textColor;
      const base = amountColor(value);
      if (!isChild) return base;
      return `color-mix(in srgb, ${base} 55%, var(--theme-textSecondary))`;
    };
    return (
      <button
        type="button"
        onClick={onClick}
        className="w-full rounded-xl border text-left transition flex items-center justify-between gap-3"
        style={{
          padding: "10px 12px",
          paddingLeft,
          backgroundColor: active
            ? isChild
              ? "color-mix(in srgb, var(--theme-tabActiveBg) 35%, var(--theme-bg))"
              : "var(--theme-tabActiveBg)"
            : "transparent",
          color: labelColor,
          borderColor: active
            ? isChild
              ? "color-mix(in srgb, var(--theme-tabActiveBg) 65%, var(--theme-border))"
              : "var(--theme-tabActiveBg)"
            : "transparent",
          boxShadow: active
            ? isChild
              ? "0 0 0 1px color-mix(in srgb, var(--theme-tabActiveBg) 50%, var(--theme-borderLight))"
              : "inset 0 0 0 1px var(--theme-tabActiveBg)"
            : "none",
          fontSize,
        }}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {onDelete && (
            <button
              type="button"
              onClick={(e) => {
                if (deleteDisabled) return;
                e.stopPropagation();
                onDelete();
              }}
              className="rounded-md p-1 transition hover:bg-[var(--theme-bgHover)]"
              style={{ color: deleteDisabled ? "var(--theme-textSecondary)" : "#ef4444", cursor: deleteDisabled ? "not-allowed" : "pointer" }}
              aria-label="Supprimer"
            >
              <TrashIcon />
            </button>
          )}
          {caret && (
            <span className="text-sm" aria-hidden>
              {caret === "open" ? "\u25be" : "\u25b8"}
            </span>
          )}
          <span
            className="font-semibold block truncate"
            style={{ whiteSpace: "nowrap" }}
            title={label}
          >
            {label}
          </span>
        </div>
        {typeof total === "number" && (
          <span
            className="text-sm font-semibold"
            style={{ color: totalColor(total), fontSize: totalFontSize, fontWeight: totalFontWeight }}
          >
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
          setShowLocationsChildren(false);
        }
      } else {
        setActiveTab("depenses");
        setShowDepensesChildren(true);
        setShowVariablesChildren(true);
        setActiveDepenseTab("variables");
      }
    } else if (tab === "revenus") {
      if (activeTab === "revenus") {
        setShowRevenusChildren((prev) => !prev);
      } else {
        setActiveTab("revenus");
        setShowRevenusChildren(true);
      }
      setShowDepensesChildren(false);
      setShowVariablesChildren(false);
      setShowFixesChildren(false);
      setShowLocationsChildren(false);
      setShowPatrimoineChildren(false);
    } else if (tab === "patrimoine") {
      if (activeTab === "patrimoine") {
        setShowPatrimoineChildren((prev) => !prev);
      } else {
        setActiveTab("patrimoine");
        setShowPatrimoineChildren(true);
      }
      setShowDepensesChildren(false);
      setShowVariablesChildren(false);
      setShowFixesChildren(false);
      setShowLocationsChildren(false);
      setShowRevenusChildren(false);
    } else {
      setActiveTab(tab);
      setShowDepensesChildren(false);
      setShowVariablesChildren(false);
      setShowFixesChildren(false);
      setShowLocationsChildren(false);
      setShowRevenusChildren(false);
      setShowPatrimoineChildren(false);
    }
  };

  const handleDepenseTabClick = (tab: DepenseTab) => {
    setActiveTab("depenses");
    setActiveDepenseTab(tab);
    setShowDepensesChildren(true);

    if (tab === "variables") {
      setShowVariablesChildren((prev) => (activeDepenseTab === "variables" ? !prev : true));
      setShowFixesChildren(false);
      setShowLocationsChildren(false);
    } else if (tab === "fixes") {
      setShowFixesChildren((prev) => (activeDepenseTab === "fixes" ? !prev : true));
      setShowVariablesChildren(false);
      setShowLocationsChildren(false);
    } else {
      setShowVariablesChildren(false);
      setShowFixesChildren(false);
      setShowLocationsChildren((prev) => (activeDepenseTab === "locations" ? !prev : true));
    }
  };

  const handleVariableChildClick = (section: VariableSection) => {
    setActiveTab("depenses");
    setActiveDepenseTab("variables");
    setShowDepensesChildren(true);
    setShowVariablesChildren(true);
    setShowFixesChildren(false);
    setShowLocationsChildren(false);
    setActiveVariableSection(section);
  };

  const handleFixeChildClick = (section: FixeSection) => {
    setActiveTab("depenses");
    setActiveDepenseTab("fixes");
    setShowDepensesChildren(true);
    setShowFixesChildren(true);
    setShowVariablesChildren(false);
    setShowLocationsChildren(false);
    setActiveFixeSection(section);
  };

  const handleLocationClick = (item: AppartementData) => {
    setActiveTab("depenses");
    setActiveDepenseTab("locations");
    setShowDepensesChildren(true);
    setShowLocationsChildren(true);
    setShowVariablesChildren(false);
    setShowFixesChildren(false);
    setActiveLocationId(item.id);
  };

  const handleAddLocation = () => {
    setLocations((prev) => {
      const nextId = Math.max(0, ...prev.map((a) => a.id)) + 1;
      const next: AppartementData = {
        id: nextId,
        name: `Location ${nextId}`,
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
      setActiveLocationId(nextId);
      return [...prev, next];
    });
    setActiveTab("depenses");
    setActiveDepenseTab("locations");
    setShowDepensesChildren(true);
    setShowLocationsChildren(true);
    setShowVariablesChildren(false);
    setShowFixesChildren(false);
  };

  const handleLocationsChange = (next: AppartementData[]) => {
    setLocations(next);
    if (activeLocationId !== null && !next.find((a) => a.id === activeLocationId)) {
      setActiveLocationId(next[0]?.id ?? null);
    }
  };

  const handlePersonsChange = (next: Person[]) => {
    setPersons(next);
    if (activePersonId !== null && !next.find((p) => p.id === activePersonId)) {
      setActivePersonId(next[0]?.id ?? null);
    }
  };

  const handleAddPerson = () => {
    setPersons((prev) => {
      const nextId = Math.max(0, ...prev.map((p) => p.id)) + 1;
      const next = [...prev, { id: nextId, name: `Personne ${nextId}`, revenus: [{ id: 1, name: "Revenu 1", montant: 0 }] }];
      setActivePersonId(nextId);
      return next;
    });
    setActiveTab("revenus");
    setShowRevenusChildren(true);
  };

  const handleDeletePersonSide = (personId: number) => {
    setPersons((prev) => {
      if (prev.length <= 1) return prev;
      const next = prev.filter((p) => p.id !== personId);
      if (activePersonId === personId) {
        setActivePersonId(next[0]?.id ?? null);
      }
      return next;
    });
  };

  const handleAddPatrimoine = () => {
    setPatrimoine((prev) => {
      const nextId = Math.max(0, ...prev.map((p) => p.id)) + 1;
      const next = [...prev, defaultProperty(nextId)];
      setActivePatrimoineId(nextId);
      return next;
    });
    setActiveTab("patrimoine");
    setShowPatrimoineChildren(true);
  };

  const handleDeletePatrimoine = (id: number) => {
    setPatrimoine((prev) => {
      const next = prev.filter((p) => p.id !== id);
      if (activePatrimoineId === id) {
        setActivePatrimoineId(next[0]?.id ?? null);
      }
      return next;
    });
  };

  const renderContent = () => {
    if (activeTab === "revenus")
      return <RevenusTab persons={persons} onPersonsChange={handlePersonsChange} activePersonId={activePersonId} />;
    if (activeTab === "bilan") return <BilanTab />;
    if (activeTab === "patrimoine")
      return (
        <AppartementsTab
          appartements={patrimoine}
          onAppartementsChange={setPatrimoine}
          forceType="propriete"
          lockType
          title="Patrimoine"
          description="Suivi de tes proprietes (revenus et charges)."
          disableBudgetUpdate
        />
      );
    if (activeDepenseTab === "variables")
      return (
        <DepensesVariablesTab
          activeSection={activeVariableSection}
          onSectionTotalsChange={setVariablesSectionTotals}
        />
      );
    if (activeDepenseTab === "fixes")
      return (
        <DepensesFixesTab
          activeSection={activeFixeSection}
          onSectionTotalsChange={setFixesSectionTotals}
        />
      );
    return (
      <AppartementsTab
        appartements={locations}
        onAppartementsChange={handleLocationsChange}
        forceType="location"
        lockType
        title="Locations"
        description="Gere tes locations et leurs charges."
        addLabel="Ajouter une location"
        activeOnlyId={activeLocationId}
        carouselMode
        cardsPerPage={3}
      />
    );
  };

  const personTotal = (p: Person) => p.revenus.reduce((s, r) => s + r.montant, 0);
  const revenusPersons = persons.map((p) => ({
    id: p.id,
    name: p.name || `Personne ${p.id}`,
    montant: personTotal(p),
  }));

  return (
    <div className="min-h-screen bg-[var(--theme-bg)] text-[var(--theme-text)]">
      <div className="mx-auto max-w-7xl px-4 py-6 lg:py-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-lg font-semibold">Budget AI</h1>
          <div className="flex items-center gap-2">
            <span className="text-sm" style={{ color: "var(--theme-textSecondary)" }}>
              Thème
            </span>
            <select
              value={theme.id}
              onChange={(e) => setTheme(e.target.value as any)}
              className="rounded-md border px-2 py-1 text-sm"
              style={{
                borderColor: "var(--theme-border)",
                backgroundColor: "var(--theme-bgCard)",
                color: "var(--theme-text)",
              }}
            >
              {themes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>

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
                total: revenusTotal,
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
                        onDelete: () => handleDeletePersonSide(person.id),
                        deleteDisabled: persons.length <= 1,
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
                    onClick={handleAddPerson}
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
                  total: -depensesTotal,
                  caret: showDepensesChildren ? "open" : "closed",
                })}

                {activeTab === "depenses" && showDepensesChildren && (
                  <div className="ml-1 border-l pl-3 space-y-1" style={{ borderColor: "var(--theme-border)" }}>
                    {renderNavButton({
                      label: "Variables",
                      active: activeDepenseTab === "variables",
                      onClick: () => handleDepenseTabClick("variables"),
                      total: -depensesVariablesTotal,
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
                          total: -variablesSectionTotals.quotidien,
                        })}
                        {renderNavButton({
                          label: "Voiture",
                          active: activeDepenseTab === "variables" && activeVariableSection === "voitures",
                          onClick: () => handleVariableChildClick("voitures"),
                          level: 2,
                          muted: true,
                          total: -variablesSectionTotals.voitures,
                        })}
                        {renderNavButton({
                          label: "Autres",
                          active: activeDepenseTab === "variables" && activeVariableSection === "autres",
                          onClick: () => handleVariableChildClick("autres"),
                          level: 2,
                          muted: true,
                          total: -variablesSectionTotals.autres,
                        })}
                      </div>
                    )}

                    {renderNavButton({
                      label: "Fixes",
                      active: activeDepenseTab === "fixes",
                      onClick: () => handleDepenseTabClick("fixes"),
                      total: -depensesFixesTotal,
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
                          total: -fixesSectionTotals.abonnements,
                        })}
                        {renderNavButton({
                          label: "Voiture",
                          active: activeDepenseTab === "fixes" && activeFixeSection === "voiture",
                          onClick: () => handleFixeChildClick("voiture"),
                          level: 2,
                          muted: true,
                          total: -fixesSectionTotals.voiture,
                        })}
                        {renderNavButton({
                          label: "Autres",
                          active: activeDepenseTab === "fixes" && activeFixeSection === "autres",
                          onClick: () => handleFixeChildClick("autres"),
                          level: 2,
                          muted: true,
                          total: -fixesSectionTotals.autres,
                        })}
                      </div>
                    )}

                    {renderNavButton({
                      label: "Locations",
                      active: activeDepenseTab === "locations",
                      onClick: () => handleDepenseTabClick("locations"),
                      total: -Math.abs(locationsTotal),
                      caret: showLocationsChildren ? "open" : "closed",
                      level: 1,
                    })}

                    {showLocationsChildren && (
                      <div className="ml-3 border-l pl-3 space-y-1" style={{ borderColor: "var(--theme-border)" }}>
                        {locations.map((loc) => (
                          <React.Fragment key={loc.id}>
                            {renderNavButton({
                              label: loc.name,
                              active: activeDepenseTab === "locations" && activeLocationId === loc.id,
                              onClick: () => handleLocationClick(loc),
                              level: 2,
                              muted: true,
                              total: calcAppartementTotal(loc),
                              onDelete: () => {
                                setLocations((prev) => {
                                  if (prev.length <= 1) return prev;
                                  const next = prev.filter((a) => a.id !== loc.id);
                                  if (activeLocationId === loc.id) {
                                    setActiveLocationId(next[0]?.id ?? null);
                                  }
                                  return next;
                                });
                              },
                              deleteDisabled: locations.length <= 1,
                            })}
                          </React.Fragment>
                        ))}
                        <button
                          type="button"
                          onClick={handleAddLocation}
                          className="w-full text-left rounded-lg px-3 py-2 text-sm font-semibold transition"
                          style={{
                            color: "var(--theme-textSecondary)",
                            backgroundColor: "transparent",
                          }}
                        >
                          + Ajouter une location
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {renderNavButton({
                label: "Patrimoine",
                active: activeTab === "patrimoine",
                onClick: () => handleMainTabClick("patrimoine"),
                total: patrimoineTotal,
                caret: showPatrimoineChildren ? "open" : "closed",
              })}

              {activeTab === "patrimoine" && showPatrimoineChildren && (
                <div className="ml-1 border-l pl-3 space-y-1" style={{ borderColor: "var(--theme-border)" }}>
                  {patrimoine.map((prop) => (
                    <React.Fragment key={prop.id}>
                      {renderNavButton({
                        label: prop.name,
                        active: activePatrimoineId === prop.id,
                        onClick: () => {
                          setActivePatrimoineId(prop.id);
                          setActiveTab("patrimoine");
                          setShowPatrimoineChildren(true);
                        },
                        level: 1,
                        muted: true,
                        total: calcAppartementTotal(prop),
                        onDelete: () => handleDeletePatrimoine(prop.id),
                        deleteDisabled: patrimoine.length <= 1,
                      })}
                    </React.Fragment>
                  ))}
                  <button
                    type="button"
                    onClick={handleAddPatrimoine}
                    className="w-full text-left rounded-lg px-3 py-2 text-sm font-semibold transition"
                    style={{
                      color: "var(--theme-textSecondary)",
                      backgroundColor: "transparent",
                    }}
                  >
                    + Ajouter une propriete
                  </button>
                </div>
              )}

              <div
                className="mb-2 h-px w-full"
                style={{ backgroundColor: "color-mix(in srgb, var(--theme-border) 70%, transparent)" }}
                aria-hidden
              />
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

