"use client";

import React, { useEffect, useMemo, useState, type ReactNode } from "react";
import { RevenusTab } from "./tabs/RevenusTab";
import { PersonTab } from "./tabs/PersonTab";
import type { Person } from "./types/budget";
import { DepensesVariablesTab } from "./tabs/DepensesVariablesTab";
import { DepensesFixesTab } from "./tabs/DepensesFixesTab";
import { AppartementsTab, type AppartementData } from "./tabs/AppartementsTab";
import { BilanTab } from "./tabs/BilanTab";
import { useBudget } from "./contexts/BudgetContext";
import { TrashIcon } from "./components/icons/TrashIcon";
import { PersonIcon, PersonPlusIcon } from "./components/icons/PersonIcon";
import { HomeIcon } from "./components/icons/HomeIcon";
import { useTheme } from "./contexts/ThemeContext";

type MainTabId = "revenus" | "personne" | "depenses" | "patrimoine" | "bilan";
type DepenseTab = "overview" | "variables" | "fixes" | "locations";
type VariableSection = "quotidien" | "voitures" | "autres";
type FixeSection = "abonnements" | "voiture" | "autres";
type SidebarStyle = "app" | "dashboard";
type EntitySelection = { type: "person"; id: number } | { type: "household" };

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

const truncateName = (value: string) => (value.length > 6 ? `${value.slice(0, 6)}...` : value);

const getPersonInitial = (name: string) => {
  const trimmed = name.trim();
  if (!trimmed) return "P";
  return trimmed[0].toUpperCase();
};

const personColors = ["#2563eb", "#0ea5e9", "#8b5cf6", "#ec4899", "#fcd34d", "#10b981", "#063a79"];
const getPersonColor = (index: number) => personColors[index % personColors.length];

export function MainTabs() {
  const Collapsible = ({ open, children }: { open: boolean; children: ReactNode }) => (
    <div
      style={{
        maxHeight: open ? 1200 : 0,
        opacity: open ? 1 : 0,
        overflow: "hidden",
        transition: "max-height 420ms ease, opacity 260ms ease",
        pointerEvents: open ? "auto" : "none",
      }}
    >
      <div style={{ paddingTop: open ? 6 : 0 }}>{children}</div>
    </div>
  );
  const { totals, updateTotal, updateRevenusParPersonnes } = useBudget();
  const { theme, setTheme, themes } = useTheme();
  const [sidebarStyle, setSidebarStyle] = useState<SidebarStyle>("app");
  const [activeTab, setActiveTab] = useState<MainTabId>("revenus");
  const [activeDepenseTab, setActiveDepenseTab] = useState<DepenseTab>("overview");
  const [showDepensesChildren, setShowDepensesChildren] = useState(false);
  const [showVariablesChildren, setShowVariablesChildren] = useState(false);
  const [showFixesChildren, setShowFixesChildren] = useState(false);
  const [showLocationsChildren, setShowLocationsChildren] = useState(false);
  const [activeVariableSection, setActiveVariableSection] = useState<VariableSection | null>(null);
  const [activeFixeSection, setActiveFixeSection] = useState<FixeSection | null>(null);
  const [persons, setPersons] = useState<Person[]>([
    {
      id: 1,
      name: "Personne 1",
      revenus: [
        { id: 1, name: "Salaire 1", montant: 1800 },
        { id: 2, name: "Salaire 2", montant: 1200 },
      ],
    },
    {
      id: 2,
      name: "Personne 2",
      revenus: [{ id: 1, name: "Revenu principal", montant: 1200 }],
    },
  ]);
  const [activePersonId, setActivePersonId] = useState<number | null>(1);
  const [selectedEntity, setSelectedEntity] = useState<EntitySelection>({ type: "person", id: 1 });
  const initialEntityKey = "person-1";
  const initialEntityLocations: Record<string, AppartementData[]> = {
    "person-1": [
      {
        id: 1,
        name: "Location Personne 1",
        type: "location",
        data: {
          loyer: 760,
          credit: 0,
          assuranceCredit: 0,
          taxeFonciere: 0,
          impotsRevenu: 0,
          chargesCopro: 0,
          assurance: 20,
          internet: 30,
          eau: 20,
          electricite: 35,
          gaz: 0,
        },
      },
    ],
    "person-2": [],
    household: [
      {
        id: 1,
        name: "Location Foyer",
        type: "location",
        data: {
          loyer: 980,
          credit: 0,
          assuranceCredit: 0,
          taxeFonciere: 0,
          impotsRevenu: 0,
          chargesCopro: 0,
          assurance: 30,
          internet: 40,
          eau: 35,
          electricite: 110,
          gaz: 0,
        },
      },
    ],
  };
  const [entityLocations, setEntityLocations] = useState(initialEntityLocations);
  const initialEntityVariables: Record<string, { quotidien: number; voitures: number; autres: number }> = {
    "person-1": { quotidien: 0, voitures: 0, autres: 0 },
    "person-2": { quotidien: 0, voitures: 0, autres: 0 },
    household: { quotidien: 450, voitures: 190, autres: 250 },
  };
  const initialEntityFixes: Record<string, { abonnements: number; voiture: number; autres: number }> = {
    "person-1": { abonnements: 0, voiture: 300, autres: 0 },
    "person-2": { abonnements: 0, voiture: 0, autres: 0 },
    household: { abonnements: 100, voiture: 470, autres: 0 },
  };
  const [entityVariablesTotals, setEntityVariablesTotals] = useState(initialEntityVariables);
  const [entityFixesTotals, setEntityFixesTotals] = useState(initialEntityFixes);
  const [variablesSectionTotals, setVariablesSectionTotals] = useState(initialEntityVariables[initialEntityKey]);
  const [fixesSectionTotals, setFixesSectionTotals] = useState(initialEntityFixes[initialEntityKey]);
  const [activeLocationId, setActiveLocationId] = useState<number | null>(
    initialEntityLocations[initialEntityKey][0]?.id ?? null
  );
  const [patrimoine, setPatrimoine] = useState<AppartementData[]>([defaultProperty(1)]);
  const [activePatrimoineId, setActivePatrimoineId] = useState<number | null>(1);
  const [showPatrimoineChildren, setShowPatrimoineChildren] = useState(false);
  const entityKey = selectedEntity.type === "household" ? "household" : `person-${selectedEntity.id}`;
  const activeLocations = entityLocations[entityKey] ?? [];
  useEffect(() => {
    const nextVariables = entityVariablesTotals[entityKey] ?? initialEntityVariables[initialEntityKey];
    const nextFixes = entityFixesTotals[entityKey] ?? initialEntityFixes[initialEntityKey];
    setVariablesSectionTotals(nextVariables);
    setFixesSectionTotals(nextFixes);
  }, [entityKey, entityFixesTotals, entityVariablesTotals]);
  useEffect(() => {
    setActiveLocationId((prev) => {
      if (activeLocations.some((loc) => loc.id === prev)) return prev;
      return activeLocations[0]?.id ?? null;
    });
  }, [activeLocations]);

  useEffect(() => {
    const total = persons.reduce(
      (sum, person) => sum + person.revenus.reduce((s, r) => s + r.montant, 0),
      0
    );
    const breakdown = persons.map((person) => ({
      name: person.name || `Personne ${person.id}`,
      montant: person.revenus.reduce((s, r) => s + r.montant, 0),
    }));
    updateTotal("revenus", total);
    updateRevenusParPersonnes(breakdown);
  }, [persons, updateRevenusParPersonnes, updateTotal]);

  useEffect(() => {
    if (persons.length === 0) return;
    if (persons.length === 1) {
      const only = persons[0];
      if (selectedEntity.type !== "person" || selectedEntity.id !== only.id) {
        setSelectedEntity({ type: "person", id: only.id });
      }
      if (activePersonId !== only.id) setActivePersonId(only.id);
      return;
    }

    if (selectedEntity.type === "person") {
      const exists = persons.some((p) => p.id === selectedEntity.id);
      if (!exists) {
        const fallback = persons[0];
        setSelectedEntity({ type: "person", id: fallback.id });
        setActivePersonId(fallback.id);
        setActiveTab("personne");
      }
    }
  }, [persons, selectedEntity, activePersonId]);

  const revenusTotal = useMemo(
    () => persons.reduce((sum, p) => sum + p.revenus.reduce((s, r) => s + r.montant, 0), 0),
    [persons]
  );
  const hasMultiplePersons = persons.length > 1;
  const isHouseholdActive = selectedEntity.type === "household";

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
    () => activeLocations.reduce((sum, loc) => sum + calcAppartementTotal(loc), 0),
    [activeLocations]
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
      if (typeof value !== "number") return labelColor;
      if (!isChild) return amountColor(value);
      return "color-mix(in srgb, var(--theme-tabActiveBg) 35%, var(--theme-textSecondary))";
    };
    return (
      <div
        role="button"
        tabIndex={0}
        aria-pressed={active}
        onClick={onClick}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onClick();
          }
        }}
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
      </div>
    );
  };

  const goToRevenusOverview = () => {
    setActiveTab("revenus");
    setActivePersonId(null);
    setShowDepensesChildren(false);
    setShowVariablesChildren(false);
    setShowFixesChildren(false);
    setShowLocationsChildren(false);
    setShowPatrimoineChildren(false);
  };

  const selectPersonEntity = (personId: number) => {
    setSelectedEntity({ type: "person", id: personId });
    setActivePersonId(personId);
    setActiveTab("personne");
  };

  const selectHouseholdEntity = () => {
    if (persons.length < 2) return;
    setSelectedEntity({ type: "household" });
    setActivePersonId(null);
    setActiveTab("revenus");
  };

  const goToPersonOverview = (personId: number) => {
    setActiveTab("personne");
    setActivePersonId(personId);
    setShowDepensesChildren(false);
    setShowVariablesChildren(false);
    setShowFixesChildren(false);
    setShowLocationsChildren(false);
    setShowPatrimoineChildren(false);
  };

  const goToDepensesOverview = () => {
    setActiveTab("depenses");
    setActiveDepenseTab("overview");
    setShowDepensesChildren(true);
    setShowVariablesChildren(false);
    setShowFixesChildren(false);
    setShowLocationsChildren(false);
    setShowPatrimoineChildren(false);
    setActiveVariableSection(null);
    setActiveFixeSection(null);
  };

  const goToVariablesOverview = () => {
    setActiveTab("depenses");
    setActiveDepenseTab("variables");
    setShowDepensesChildren(true);
    setShowVariablesChildren(true);
    setShowFixesChildren(false);
    setShowLocationsChildren(false);
    setShowPatrimoineChildren(false);
    setActiveVariableSection(null);
  };

  const goToVariableSection = (section: VariableSection) => {
    setActiveTab("depenses");
    setActiveDepenseTab("variables");
    setShowDepensesChildren(true);
    setShowVariablesChildren(true);
    setShowFixesChildren(false);
    setShowLocationsChildren(false);
    setShowPatrimoineChildren(false);
    setActiveVariableSection(section);
  };

  const goToFixesOverview = () => {
    setActiveTab("depenses");
    setActiveDepenseTab("fixes");
    setShowDepensesChildren(true);
    setShowFixesChildren(true);
    setShowVariablesChildren(false);
    setShowLocationsChildren(false);
    setShowPatrimoineChildren(false);
    setActiveFixeSection(null);
  };

  const goToFixeSection = (section: FixeSection) => {
    setActiveTab("depenses");
    setActiveDepenseTab("fixes");
    setShowDepensesChildren(true);
    setShowFixesChildren(true);
    setShowVariablesChildren(false);
    setShowLocationsChildren(false);
    setShowPatrimoineChildren(false);
    setActiveFixeSection(section);
  };

  const goToLocationsOverview = () => {
    setActiveTab("depenses");
    setActiveDepenseTab("locations");
    setShowDepensesChildren(true);
    setShowLocationsChildren(true);
    setShowVariablesChildren(false);
    setShowFixesChildren(false);
    setShowPatrimoineChildren(false);
    setActiveLocationId(null);
  };

  const goToPatrimoineOverview = () => {
    setActiveTab("patrimoine");
    setShowPatrimoineChildren(true);
    setActivePatrimoineId(null);
    setShowDepensesChildren(false);
    setShowVariablesChildren(false);
    setShowFixesChildren(false);
    setShowLocationsChildren(false);
  };

  const goToBilan = () => {
    setActiveTab("bilan");
    setShowDepensesChildren(false);
    setShowVariablesChildren(false);
    setShowFixesChildren(false);
    setShowLocationsChildren(false);
    setShowPatrimoineChildren(false);
  };

  const updateEntityLocations = (updater: (current: AppartementData[]) => AppartementData[]) => {
    setEntityLocations((prev) => {
      const current = prev[entityKey] ?? [];
      const next = updater(current);
      return { ...prev, [entityKey]: next };
    });
  };

  const persistVariablesTotals = (next: typeof variablesSectionTotals) => {
    setEntityVariablesTotals((prev) => ({ ...prev, [entityKey]: next }));
    setVariablesSectionTotals(next);
  };

  const persistFixesTotals = (next: typeof fixesSectionTotals) => {
    setEntityFixesTotals((prev) => ({ ...prev, [entityKey]: next }));
    setFixesSectionTotals(next);
  };

  const handleMainTabClick = (tab: MainTabId) => {
    if (tab === "depenses") {
      if (sidebarStyle === "app" && activeTab === "depenses") {
        const next = !showDepensesChildren;
        setShowDepensesChildren(next);
        if (!next) {
          setShowVariablesChildren(false);
          setShowFixesChildren(false);
          setShowLocationsChildren(false);
        }
        return;
      }
      goToDepensesOverview();
    } else if (tab === "revenus") {
      goToRevenusOverview();
    } else if (tab === "patrimoine") {
      if (sidebarStyle === "app" && activeTab === "patrimoine") {
        setShowPatrimoineChildren((prev) => !prev);
        return;
      }
      goToPatrimoineOverview();
    } else {
      goToBilan();
    }
  };

  const handleDepenseTabClick = (tab: DepenseTab) => {
    if (tab === "variables") {
      if (sidebarStyle === "app" && activeDepenseTab === "variables") {
        setShowVariablesChildren((prev) => !prev);
        setShowFixesChildren(false);
        setShowLocationsChildren(false);
        return;
      }
      goToVariablesOverview();
    } else if (tab === "fixes") {
      if (sidebarStyle === "app" && activeDepenseTab === "fixes") {
        setShowFixesChildren((prev) => !prev);
        setShowVariablesChildren(false);
        setShowLocationsChildren(false);
        return;
      }
      goToFixesOverview();
    } else if (tab === "locations") {
      if (sidebarStyle === "app" && activeDepenseTab === "locations") {
        setShowLocationsChildren((prev) => !prev);
        setShowVariablesChildren(false);
        setShowFixesChildren(false);
        return;
      }
      goToLocationsOverview();
    } else {
      goToDepensesOverview();
    }
  };

  const handleVariableChildClick = (section: VariableSection) => {
    goToVariableSection(section);
  };

  const handleFixeChildClick = (section: FixeSection) => {
    goToFixeSection(section);
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
    let nextId = 0;
    updateEntityLocations((prev) => {
      nextId = Math.max(0, ...prev.map((a) => a.id)) + 1;
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
      return [...prev, next];
    });
    if (nextId) setActiveLocationId(nextId);
    setActiveTab("depenses");
    setActiveDepenseTab("locations");
    setShowDepensesChildren(true);
    setShowLocationsChildren(true);
    setShowVariablesChildren(false);
    setShowFixesChildren(false);
  };

  const handleLocationsChange = (next: AppartementData[]) => {
    setEntityLocations((prev) => ({ ...prev, [entityKey]: next }));
    if (activeLocationId !== null && !next.find((a) => a.id === activeLocationId)) {
      setActiveLocationId(next[0]?.id ?? null);
    }
  };

  const updatePersons = (updater: (prev: Person[]) => Person[]) => {
    setPersons((prev) => {
      const next = updater(prev);
      if (selectedEntity.type === "person") {
        const exists = next.some((p) => p.id === selectedEntity.id);
        if (!exists && next.length > 0) {
          const fallback = next[0];
          setSelectedEntity({ type: "person", id: fallback.id });
          setActivePersonId(fallback.id);
          setActiveTab("personne");
        }
      }
      if (selectedEntity.type === "household" && next.length < 2 && next.length > 0) {
        const fallback = next[0];
        setSelectedEntity({ type: "person", id: fallback.id });
        setActivePersonId(fallback.id);
        setActiveTab("personne");
      }
      if (activePersonId !== null && !next.find((p) => p.id === activePersonId)) {
        setActivePersonId(next[0]?.id ?? null);
      }
      return next;
    });
  };

  const handleAddPerson = () => {
    let nextId = 0;
    updatePersons((prev) => {
      nextId = Math.max(0, ...prev.map((p) => p.id)) + 1;
      return [...prev, { id: nextId, name: `Personne ${nextId}`, revenus: [{ id: 1, name: "Revenu 1", montant: 0 }] }];
    });
    if (nextId) selectPersonEntity(nextId);
  };

  const handleDeletePersonSide = (personId: number) => {
    updatePersons((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((p) => p.id !== personId);
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
    if (activeTab === "personne")
      return (
        <PersonTab
          persons={persons}
          activePersonId={activePersonId}
          onPersonsChange={updatePersons}
          onDeletePerson={handleDeletePersonSide}
        />
      );
    if (activeTab === "revenus")
      return <RevenusTab persons={persons} activePersonId={activePersonId} />;
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
          activeOnlyId={activePatrimoineId ?? undefined}
        />
      );
    if (activeDepenseTab === "overview")
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Depenses</h2>
              <p className="mt-2" style={{ color: "var(--theme-textSecondary)" }}>
                Vue d'ensemble des depenses variables, fixes et locations.
              </p>
            </div>
            <span className="text-lg font-semibold" style={{ color: amountColor(-depensesTotal) }}>
              {formatMontant(-depensesTotal)}
            </span>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <button
              type="button"
              onClick={goToVariablesOverview}
              className="rounded-xl border p-4 text-left transition hover:bg-[var(--theme-bgHover)]"
              style={{
                borderColor: "var(--theme-border)",
                backgroundColor: "var(--theme-bgCard)",
                color: "var(--theme-text)",
              }}
            >
              <div className="text-sm font-semibold">Variables</div>
              <div className="mt-2 text-lg font-semibold" style={{ color: amountColor(-depensesVariablesTotal) }}>
                {formatMontant(-depensesVariablesTotal)}
              </div>
            </button>
            <button
              type="button"
              onClick={goToFixesOverview}
              className="rounded-xl border p-4 text-left transition hover:bg-[var(--theme-bgHover)]"
              style={{
                borderColor: "var(--theme-border)",
                backgroundColor: "var(--theme-bgCard)",
                color: "var(--theme-text)",
              }}
            >
              <div className="text-sm font-semibold">Fixes</div>
              <div className="mt-2 text-lg font-semibold" style={{ color: amountColor(-depensesFixesTotal) }}>
                {formatMontant(-depensesFixesTotal)}
              </div>
            </button>
            <button
              type="button"
              onClick={goToLocationsOverview}
              className="rounded-xl border p-4 text-left transition hover:bg-[var(--theme-bgHover)]"
              style={{
                borderColor: "var(--theme-border)",
                backgroundColor: "var(--theme-bgCard)",
                color: "var(--theme-text)",
              }}
            >
              <div className="text-sm font-semibold">Locations</div>
              <div className="mt-2 text-lg font-semibold" style={{ color: amountColor(-Math.abs(locationsTotal)) }}>
                {formatMontant(-Math.abs(locationsTotal))}
              </div>
            </button>
          </div>
        </div>
      );
    if (activeDepenseTab === "variables")
      return (
        <DepensesVariablesTab
          activeSection={activeVariableSection ?? undefined}
          onSectionTotalsChange={persistVariablesTotals}
        />
      );
    if (activeDepenseTab === "fixes")
      return (
        <DepensesFixesTab
          activeSection={activeFixeSection ?? undefined}
          onSectionTotalsChange={persistFixesTotals}
        />
      );
    return (
        <AppartementsTab
          appartements={activeLocations}
          onAppartementsChange={handleLocationsChange}
          forceType="location"
          lockType
          title="Locations"
          description="Gere tes locations et leurs charges."
          addLabel="Ajouter une location"
          activeOnlyId={activeLocationId ?? undefined}
          carouselMode
          cardsPerPage={3}
        />
    );
  };

  const breadcrumbs = (() => {
    const items: { label: string; onClick?: () => void }[] = [];
    if (activeTab === "revenus") {
      items.push({ label: "Revenus", onClick: goToRevenusOverview });
      if (activePersonId !== null) {
        const person = persons.find((p) => p.id === activePersonId);
        if (person) items.push({ label: person.name || `Personne ${person.id}` });
      }
      return items;
    }
    if (activeTab === "depenses") {
      items.push({ label: "Depenses", onClick: goToDepensesOverview });
      if (activeDepenseTab === "variables") {
        items.push({ label: "Variables", onClick: goToVariablesOverview });
        if (activeVariableSection) {
          const label =
            activeVariableSection === "quotidien"
              ? "Quotidien"
              : activeVariableSection === "voitures"
                ? "Voiture"
                : "Autres";
          items.push({ label, onClick: () => goToVariableSection(activeVariableSection) });
        }
      } else if (activeDepenseTab === "fixes") {
        items.push({ label: "Fixes", onClick: goToFixesOverview });
        if (activeFixeSection) {
          const label =
            activeFixeSection === "abonnements"
              ? "Abonnements"
              : activeFixeSection === "voiture"
                ? "Voiture"
                : "Autres";
          items.push({ label, onClick: () => goToFixeSection(activeFixeSection) });
        }
      } else if (activeDepenseTab === "locations") {
        items.push({ label: "Locations", onClick: goToLocationsOverview });
        if (activeLocationId !== null) {
          const location = activeLocations.find((l) => l.id === activeLocationId);
          if (location) items.push({ label: location.name });
        }
      }
      return items;
    }
    if (activeTab === "patrimoine") {
      items.push({ label: "Patrimoine", onClick: goToPatrimoineOverview });
      if (activePatrimoineId !== null) {
        const prop = patrimoine.find((p) => p.id === activePatrimoineId);
        if (prop) items.push({ label: prop.name });
      }
      return items;
    }
    items.push({ label: "Bilan" });
    return items;
  })();

  const clickableBreadcrumbs = breadcrumbs.filter((crumb) => Boolean(crumb.onClick));

  
  const renderSidebarApp = () => (
    <div className="p-3 lg:p-4 flex flex-col gap-2">
      <div className="p-3 lg:p-4 flex flex-col gap-2">
        {renderNavButton({
          label: "Revenus",
          active: activeTab === "revenus",
          onClick: () => handleMainTabClick("revenus"),
          total: revenusTotal,
        })}
        <div className="flex flex-col gap-1">
          {renderNavButton({
            label: "Depenses",
            active: activeTab === "depenses",
            onClick: () => handleMainTabClick("depenses"),
            total: -depensesTotal,
            caret: showDepensesChildren ? "open" : "closed",
          })}
          <Collapsible open={activeTab === "depenses" && showDepensesChildren}>
            <div className="ml-1 border-l pl-3 space-y-1" style={{ borderColor: "var(--theme-border)" }}>
              {renderNavButton({
                label: "Variables",
                active: activeDepenseTab === "variables",
                onClick: () => handleDepenseTabClick("variables"),
                total: -depensesVariablesTotal,
                caret: showVariablesChildren ? "open" : "closed",
                level: 1,
              })}
              <Collapsible open={showVariablesChildren}>
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
              </Collapsible>
              {renderNavButton({
                label: "Fixes",
                active: activeDepenseTab === "fixes",
                onClick: () => handleDepenseTabClick("fixes"),
                total: -depensesFixesTotal,
                caret: showFixesChildren ? "open" : "closed",
                level: 1,
              })}
              <Collapsible open={showFixesChildren}>
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
              </Collapsible>
              {renderNavButton({
                label: "Locations",
                active: activeDepenseTab === "locations",
                onClick: () => handleDepenseTabClick("locations"),
                total: -Math.abs(locationsTotal),
                caret: showLocationsChildren ? "open" : "closed",
                level: 1,
              })}
              <Collapsible open={showLocationsChildren}>
                <div className="ml-3 border-l pl-3 space-y-1" style={{ borderColor: "var(--theme-border)" }}>
                  {activeLocations.map((loc) => (
                    <React.Fragment key={loc.id}>
                      {renderNavButton({
                        label: loc.name,
                        active: activeDepenseTab === "locations" && activeLocationId === loc.id,
                        onClick: () => handleLocationClick(loc),
                        level: 2,
                        muted: true,
                        total: calcAppartementTotal(loc),
                          onDelete: () => {
                            updateEntityLocations((prev) => {
                              if (prev.length <= 1) return prev;
                              const next = prev.filter((a) => a.id !== loc.id);
                              if (activeLocationId === loc.id) {
                                setActiveLocationId(next[0]?.id ?? null);
                              }
                              return next;
                            });
                          },
                        deleteDisabled: activeLocations.length <= 1,
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
              </Collapsible>
            </div>
          </Collapsible>
        </div>
        {renderNavButton({
          label: "Patrimoine",
          active: activeTab === "patrimoine",
          onClick: () => handleMainTabClick("patrimoine"),
          total: patrimoineTotal,
          caret: showPatrimoineChildren ? "open" : "closed",
        })}
        <Collapsible open={activeTab === "patrimoine" && showPatrimoineChildren}>
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
        </Collapsible>
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
    </div>
  );
  const renderSidebarDashboard = () => (
    <div className="p-3 lg:p-4 space-y-4">
      <div
        className="rounded-2xl border p-3 space-y-3"
        style={{ backgroundColor: "var(--theme-bg)", borderColor: "var(--theme-border)" }}
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.22em]">Revenus</div>
            <div className="text-xs" style={{ color: "var(--theme-textSecondary)" }}>
              Synthèse des revenus par personne
            </div>
          </div>
          <button
            type="button"
            onClick={goToRevenusOverview}
            className="text-xs font-semibold transition hover:text-[var(--theme-text)]"
            style={{ color: "var(--theme-textSecondary)" }}
          >
            Ouvrir
          </button>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span style={{ color: "var(--theme-textSecondary)" }}>Total</span>
          <span style={{ color: amountColor(revenusTotal), fontWeight: 700 }}>{formatMontant(revenusTotal)}</span>
        </div>
      </div>

      <div
        className="rounded-2xl border p-3 space-y-3"
        style={{ backgroundColor: "var(--theme-bg)", borderColor: "var(--theme-border)" }}
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.22em]">Depenses</div>
            <div className="text-xs" style={{ color: "var(--theme-textSecondary)" }}>
              Variables, fixes, locations
            </div>
          </div>
          <button
            type="button"
            onClick={goToDepensesOverview}
            className="text-xs font-semibold transition hover:text-[var(--theme-text)]"
            style={{ color: "var(--theme-textSecondary)" }}
          >
            Ouvrir
          </button>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span style={{ color: "var(--theme-textSecondary)" }}>Total</span>
          <span style={{ color: amountColor(-depensesTotal), fontWeight: 700 }}>{formatMontant(-depensesTotal)}</span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={goToVariablesOverview}
              className="text-sm font-semibold transition hover:text-[var(--theme-text)]"
              style={{ color: activeDepenseTab === "variables" ? "var(--theme-text)" : "var(--theme-textSecondary)" }}
            >
              Variables
            </button>
            <span className="text-sm font-semibold" style={{ color: amountColor(-depensesVariablesTotal) }}>
              {formatMontant(-depensesVariablesTotal)}
            </span>
          </div>
          <div className="ml-2 space-y-1">
            {renderNavButton({
              label: "Quotidien",
              active: activeDepenseTab === "variables" && activeVariableSection === "quotidien",
              onClick: () => goToVariableSection("quotidien"),
              level: 2,
              muted: true,
              total: -variablesSectionTotals.quotidien,
            })}
            {renderNavButton({
              label: "Voiture",
              active: activeDepenseTab === "variables" && activeVariableSection === "voitures",
              onClick: () => goToVariableSection("voitures"),
              level: 2,
              muted: true,
              total: -variablesSectionTotals.voitures,
            })}
            {renderNavButton({
              label: "Autres",
              active: activeDepenseTab === "variables" && activeVariableSection === "autres",
              onClick: () => goToVariableSection("autres"),
              level: 2,
              muted: true,
              total: -variablesSectionTotals.autres,
            })}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={goToFixesOverview}
              className="text-sm font-semibold transition hover:text-[var(--theme-text)]"
              style={{ color: activeDepenseTab === "fixes" ? "var(--theme-text)" : "var(--theme-textSecondary)" }}
            >
              Fixes
            </button>
            <span className="text-sm font-semibold" style={{ color: amountColor(-depensesFixesTotal) }}>
              {formatMontant(-depensesFixesTotal)}
            </span>
          </div>
          <div className="ml-2 space-y-1">
            {renderNavButton({
              label: "Abonnements",
              active: activeDepenseTab === "fixes" && activeFixeSection === "abonnements",
              onClick: () => goToFixeSection("abonnements"),
              level: 2,
              muted: true,
              total: -fixesSectionTotals.abonnements,
            })}
            {renderNavButton({
              label: "Voiture",
              active: activeDepenseTab === "fixes" && activeFixeSection === "voiture",
              onClick: () => goToFixeSection("voiture"),
              level: 2,
              muted: true,
              total: -fixesSectionTotals.voiture,
            })}
            {renderNavButton({
              label: "Autres",
              active: activeDepenseTab === "fixes" && activeFixeSection === "autres",
              onClick: () => goToFixeSection("autres"),
              level: 2,
              muted: true,
              total: -fixesSectionTotals.autres,
            })}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={goToLocationsOverview}
              className="text-sm font-semibold transition hover:text-[var(--theme-text)]"
              style={{ color: activeDepenseTab === "locations" ? "var(--theme-text)" : "var(--theme-textSecondary)" }}
            >
              Locations
            </button>
            <span className="text-sm font-semibold" style={{ color: amountColor(-Math.abs(locationsTotal)) }}>
              {formatMontant(-Math.abs(locationsTotal))}
            </span>
          </div>
          <div className="ml-2 space-y-1">
            {activeLocations.map((loc) => (
              <React.Fragment key={loc.id}>
                {renderNavButton({
                  label: loc.name,
                  active: activeDepenseTab === "locations" && activeLocationId === loc.id,
                  onClick: () => handleLocationClick(loc),
                  level: 2,
                  muted: true,
                  total: calcAppartementTotal(loc),
                        onDelete: () => {
                          updateEntityLocations((prev) => {
                            if (prev.length <= 1) return prev;
                            const next = prev.filter((a) => a.id !== loc.id);
                            if (activeLocationId === loc.id) {
                              setActiveLocationId(next[0]?.id ?? null);
                            }
                            return next;
                          });
                        },
                  deleteDisabled: activeLocations.length <= 1,
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
        </div>
      </div>

      <div
        className="rounded-2xl border p-3 space-y-3"
        style={{ backgroundColor: "var(--theme-bg)", borderColor: "var(--theme-border)" }}
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.22em]">Patrimoine</div>
            <div className="text-xs" style={{ color: "var(--theme-textSecondary)" }}>
              Propriete et performances
            </div>
          </div>
          <button
            type="button"
            onClick={goToPatrimoineOverview}
            className="text-xs font-semibold transition hover:text-[var(--theme-text)]"
            style={{ color: "var(--theme-textSecondary)" }}
          >
            Ouvrir
          </button>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span style={{ color: "var(--theme-textSecondary)" }}>Total</span>
          <span style={{ color: amountColor(patrimoineTotal), fontWeight: 700 }}>{formatMontant(patrimoineTotal)}</span>
        </div>
        <div className="space-y-1">
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
      </div>

      <div
        className="rounded-2xl border p-3 space-y-2"
        style={{ backgroundColor: "var(--theme-bg)", borderColor: "var(--theme-border)" }}
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.22em]">Bilan</div>
            <div className="text-xs" style={{ color: "var(--theme-textSecondary)" }}>
              Synthese globale
            </div>
          </div>
          <button
            type="button"
            onClick={goToBilan}
            className="text-xs font-semibold transition hover:text-[var(--theme-text)]"
            style={{ color: "var(--theme-textSecondary)" }}
          >
            Ouvrir
          </button>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span style={{ color: "var(--theme-textSecondary)" }}>Solde</span>
          <span style={{ color: amountColor(bilanTotal), fontWeight: 700 }}>{formatMontant(bilanTotal)}</span>
        </div>
      </div>
    </div>
  );
  const renderEntitySelector = () => {
    const selectedPerson =
      selectedEntity.type === "person" ? persons.find((p) => p.id === selectedEntity.id) : null;
    const label =
      selectedEntity.type === "household"
        ? "Vue foyer"
        : selectedPerson
        ? selectedPerson.name || `Personne ${selectedPerson.id}`
        : "Personne";
    const entityButtonClass = "flex h-10 w-10 items-center justify-center rounded-full border transition";
    const entityButtonStyle = (isActive: boolean) => ({
      borderColor: isActive
        ? "var(--theme-tabActiveBg)"
        : "color-mix(in srgb, var(--theme-border) 70%, transparent)",
      color: isActive ? "var(--theme-tabActiveBg)" : "var(--theme-textSecondary)",
      backgroundColor: isActive
        ? "color-mix(in srgb, var(--theme-tabActiveBg) 20%, transparent)"
        : "transparent",
    });

    return (
      <div
        className="rounded-2xl border bg-[var(--theme-bgCard)] p-4"
        style={{ borderColor: "var(--theme-border)" }}
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.22em]" style={{ color: "var(--theme-textSecondary)" }}>
              Entités
            </div>
            <div className="text-sm" style={{ color: "var(--theme-textSecondary)" }}>
              {label}
            </div>
          </div>
          <button
            type="button"
            onClick={handleAddPerson}
            className={entityButtonClass}
            style={{
              borderColor: "color-mix(in srgb, var(--theme-border) 70%, transparent)",
              color: "var(--theme-tabActiveBg)",
              backgroundColor: "var(--theme-bgCard)",
            }}
            aria-label="Ajouter une personne"
          >
            <PersonPlusIcon size={18} stroke="var(--theme-tabActiveBg)" />
          </button>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {hasMultiplePersons && (
            <button
              type="button"
              onClick={selectHouseholdEntity}
              className={entityButtonClass}
              style={entityButtonStyle(isHouseholdActive)}
              aria-label="Sélectionner la vue foyer"
            >
              <HomeIcon size={18} stroke="currentColor" />
            </button>
          )}
          {persons.map((person) => {
            const isActive = selectedEntity.type === "person" && selectedEntity.id === person.id;
            return (
              <button
                key={person.id}
                type="button"
                onClick={() => selectPersonEntity(person.id)}
                className={entityButtonClass}
                style={entityButtonStyle(isActive)}
                aria-label={`Sélectionner ${person.name || `Personne ${person.id}`}`}
              >
                <PersonIcon size={18} stroke="currentColor" fill={isActive ? "currentColor" : "none"} />
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-xs" style={{ color: "var(--theme-textSecondary)" }}>
          Clique sur une icône pour changer la vue affichée.
        </p>
      </div>
    );
  };

return (
    <div className="min-h-screen bg-[var(--theme-bg)] text-[var(--theme-text)]">
      <div className="mx-auto max-w-7xl px-4 py-6 lg:py-8">
        <div className="mb-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-lg font-semibold">Budget AI</h1>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm" style={{ color: "var(--theme-textSecondary)" }}>
                  ThSme
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
              <div className="flex items-center gap-2">
                <span className="text-sm" style={{ color: "var(--theme-textSecondary)" }}>
                  Menu
                </span>
                <select
                  value={sidebarStyle}
                  onChange={(e) => setSidebarStyle(e.target.value as SidebarStyle)}
                  className="rounded-md border px-2 py-1 text-sm"
                  style={{
                    borderColor: "var(--theme-border)",
                    backgroundColor: "var(--theme-bgCard)",
                    color: "var(--theme-text)",
                  }}
                >
                  <option value="app">Menu app</option>
                  <option value="dashboard">Menu dashboard</option>
                </select>
              </div>
            </div>
          </div>
          {renderEntitySelector()}
        </div>

        <div className="grid gap-6 lg:grid-cols-[280px,1fr] lg:gap-8">
          <aside
            className="rounded-2xl border shadow-sm"
            style={{ backgroundColor: "var(--theme-bgCard)", borderColor: "var(--theme-border)" }}
          >
            {sidebarStyle === "app" ? renderSidebarApp() : renderSidebarDashboard()}
          </aside>

          <main className="space-y-6 p-3 sm:p-4 md:p-6">
            {clickableBreadcrumbs.length > 0 && (
              <nav
                aria-label="Fil d'ariane"
                className="flex flex-wrap items-center gap-2 text-sm font-semibold"
                style={{ color: "var(--theme-textSecondary)" }}
              >
                {clickableBreadcrumbs.map((crumb, index) => (
                  <span key={`${crumb.label}-${index}`} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={crumb.onClick}
                      className="transition hover:text-[var(--theme-text)]"
                      style={{
                        background: "transparent",
                        border: "none",
                        padding: 0,
                        cursor: "pointer",
                        color: "inherit",
                      }}
                    >
                      {crumb.label}
                    </button>
                    {index < clickableBreadcrumbs.length - 1 && (
                      <span style={{ opacity: 0.5 }}>{">"}</span>
                    )}
                  </span>
                ))}
              </nav>
            )}
            {renderContent()}
          </main>
        </div>
      </div>
    </div>
  );
}

