"use client";

import { EditableSliderRow, sliderGroupStyle } from "../components/EditableSliderRow";
import { EditableTitle } from "../components/EditableTitle";
import type { Person } from "../types/budget";
import type { CSSProperties } from "react";

type Props = {
  persons: Person[];
  activePersonId: number | null;
  onPersonsChange: (updater: (prev: Person[]) => Person[]) => void;
  onDeletePerson: (personId: number) => void;
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

const getPersonLabel = (person: Person) => person.name || `Personne ${person.id}`;

export function PersonTab({
  persons,
  activePersonId,
  onPersonsChange,
  onDeletePerson,
}: Props) {
  const activePerson = activePersonId ? persons.find((p) => p.id === activePersonId) : null;
  const activeTotal = activePerson
    ? activePerson.revenus.reduce((sum, r) => sum + r.montant, 0)
    : 0;
  const revenueHeaderStyle: CSSProperties = {
    display: "grid",
    gridTemplateColumns: "clamp(240px, 26vw, 360px) 1fr auto",
    alignItems: "center",
    padding: "0 16px",
    fontSize: 14,
    color: "var(--theme-tabActiveBg)",
    columnGap: 14,
    marginBottom: 6,
  };
  const revenueTotalBadgeStyle: CSSProperties = {
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 104,
  };

  const handlePersonNameChange = (name: string) => {
    if (!activePerson) return;
    onPersonsChange((prev) =>
      prev.map((p) => (p.id === activePerson.id ? { ...p, name } : p))
    );
  };

  const handleAddRevenue = () => {
    if (!activePerson) return;
    onPersonsChange((prev) =>
      prev.map((p) =>
        p.id === activePerson.id
          ? {
              ...p,
              revenus: [
                ...p.revenus,
                {
                  id: Math.max(0, ...p.revenus.map((r) => r.id)) + 1,
                  name: `Revenu ${p.revenus.length + 1}`,
                  montant: 0,
                },
              ],
            }
          : p
      )
    );
  };

  const handleDeleteRevenue = (revenueId: number) => {
    if (!activePerson) return;
    onPersonsChange((prev) =>
      prev.map((p) =>
        p.id === activePerson.id
          ? { ...p, revenus: p.revenus.filter((r) => r.id !== revenueId) }
          : p
      )
    );
  };

  const handleSaveRevenueLabel = (revenueId: number, nextName: string) => {
    if (!activePerson) return;
    onPersonsChange((prev) =>
      prev.map((p) =>
        p.id === activePerson.id
          ? {
              ...p,
              revenus: p.revenus.map((r) => (r.id === revenueId ? { ...r, name: nextName || r.name } : r)),
            }
          : p
      )
    );
  };

  const handleSaveRevenueValue = (revenueId: number, nextValue: number) => {
    if (!activePerson) return;
    onPersonsChange((prev) =>
      prev.map((p) =>
        p.id === activePerson.id
          ? {
              ...p,
              revenus: p.revenus.map((r) => (r.id === revenueId ? { ...r, montant: nextValue } : r)),
            }
          : p
      )
    );
  };

  if (!activePerson) {
    return (
      <div className="rounded-2xl border p-4" style={{ borderColor: "var(--theme-border)" }}>
        <p className="text-sm" style={{ color: "var(--theme-textSecondary)" }}>
          Selectionne une personne pour gerer ses revenus et son patrimoine.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <EditableTitle
          value={getPersonLabel(activePerson)}
          onChange={handlePersonNameChange}
          ariaLabel="Nom de la personne"
          width="18ch"
        />
        <p className="mt-1 text-sm" style={{ color: "var(--theme-textSecondary)" }}>
          Revenus associés à cette personne.
        </p>
      </div>

      <div className="space-y-1">
        <div className="text-sm font-semibold text-[var(--theme-tabActiveBg)]">Revenus</div>
        <div style={sliderGroupStyle}>
        <div style={revenueHeaderStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontWeight: 700, flex: 1 }}>{`Total des revenus ${getPersonLabel(activePerson)}`}</span>
            <div style={revenueTotalBadgeStyle}>
              <span aria-hidden style={{ position: "absolute", left: 0, width: 16, height: 16 }} />
              <span style={{ textAlign: "center", fontWeight: 700 }}>{formatMontant(activeTotal)}</span>
            </div>
          </div>
          <div
            style={{
              fontSize: 12,
              color: "var(--theme-textSecondary)",
              textAlign: "right",
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            {activePerson.revenus.length === 1 ? "Salaire" : "Revenus multiples"}
          </div>
          <div />
        </div>
          <div className="space-y-0">
            {activePerson.revenus.map((item) => {
              const absValue = Math.max(0, Math.abs(item.montant));
              const maxValue = Math.max(2000, Math.ceil(absValue * 1.5));
              return (
                <EditableSliderRow
                  key={item.id}
                  label={item.name}
                  labelEditable
                  onLabelChange={(next) => handleSaveRevenueLabel(item.id, next)}
                  value={absValue}
                  min={0}
                  max={maxValue}
                  step={10}
                  unitLabel="€/mois"
                  onValueChange={(next) => handleSaveRevenueValue(item.id, next)}
                  onRemove={() => handleDeleteRevenue(item.id)}
                />
              );
            })}
          </div>
          <button
            onClick={handleAddRevenue}
            className="flex items-center gap-3 w-full justify-center text-sm font-semibold transition hover:bg-[var(--theme-bgHover)]"
            style={{
              borderRadius: 18,
              padding: "14px 16px",
              border: "none",
              color: "var(--theme-text)",
              backgroundColor: "transparent",
            }}
          >
            <span
              className="flex h-10 w-10 items-center justify-center rounded-full text-lg"
              style={{
                backgroundColor: "color-mix(in srgb, var(--theme-tabActiveBg) 22%, transparent)",
                color: "var(--theme-tabActiveBg)",
              }}
            >
              +
            </span>
            Ajouter un revenu
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onDeletePerson(activePerson.id)}
        className="w-full rounded-2xl border py-3 text-sm font-semibold transition hover:bg-[var(--theme-bgHover)]"
        style={{ borderColor: "var(--theme-border)", color: "#ef4444" }}
        disabled={persons.length <= 1}
      >
        Supprimer la personne
      </button>
    </div>
  );
}

