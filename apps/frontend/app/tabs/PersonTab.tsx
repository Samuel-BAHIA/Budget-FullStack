"use client";

import { EditableSliderRow, sliderGroupStyle } from "../components/EditableSliderRow";
import { EditableTitle } from "../components/EditableTitle";
import type { Person } from "../types/budget";

type Props = {
  persons: Person[];
  activePersonId: number | null;
  onPersonsChange: (updater: (prev: Person[]) => Person[]) => void;
  onDeletePerson: (personId: number) => void;
  patrimoineTotal: number;
  onManagePatrimoine: () => void;
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
  patrimoineTotal,
  onManagePatrimoine,
}: Props) {
  const activePerson = activePersonId ? persons.find((p) => p.id === activePersonId) : null;
  const activeTotal = activePerson
    ? activePerson.revenus.reduce((sum, r) => sum + r.montant, 0)
    : 0;

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
          Reviens et patrimoine associes a cette personne.
        </p>
      </div>

      <div className="space-y-1">
        <div className="text-sm font-semibold text-[var(--theme-tabActiveBg)]">Revenus</div>
        <div
          className="rounded-2xl border bg-[var(--theme-bgCard)] p-4"
          style={{ borderColor: "var(--theme-border)" }}
        >
          <div style={sliderGroupStyle}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-xs" style={{ color: "var(--theme-textSecondary)" }}>
                  Total per person
                </div>
                <div className="text-lg font-semibold" style={{ color: amountColor(activeTotal) }}>
                  {formatMontant(activeTotal)}
                </div>
              </div>
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
              + Ajouter un revenu
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-[var(--theme-tabActiveBg)]">Patrimoine</div>
            <div className="text-xs" style={{ color: "var(--theme-textSecondary)" }}>
              Gestion des biens li?s a la personne.
            </div>
          </div>
          <button
            type="button"
            onClick={onManagePatrimoine}
            className="text-xs font-semibold transition hover:text-[var(--theme-text)]"
            style={{ color: "var(--theme-textSecondary)" }}
          >
            Ouvrir
          </button>
        </div>
        <div className="flex items-center justify-between rounded-2xl border px-4 py-3"
            style={{ borderColor: "var(--theme-border)" }}>
          <span className="text-sm" style={{ color: "var(--theme-textSecondary)" }}>
            Total patrimoine
          </span>
          <span className="text-lg font-semibold" style={{ color: amountColor(patrimoineTotal) }}>
            {formatMontant(patrimoineTotal)}
          </span>
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

