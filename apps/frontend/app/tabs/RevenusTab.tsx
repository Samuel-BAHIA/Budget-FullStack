"use client";

import { useEffect, useState } from "react";
import { EditableSliderRow, sliderGroupStyle } from "../components/EditableSliderRow";
import { EditableTitle } from "../components/EditableTitle";
import { useBudget } from "../contexts/BudgetContext";

export type Revenue = { id: number; name: string; montant: number };
export type Person = { id: number; name: string; revenus: Revenue[] };

type Props = {
  persons?: Person[];
  onPersonsChange?: (persons: Person[]) => void;
  activePersonId?: number | null;
};

export function RevenusTab({ persons: externalPersons, onPersonsChange, activePersonId }: Props) {
  const [internalPersons, setInternalPersons] = useState<Person[]>([
    { id: 1, name: "Personne 1", revenus: [{ id: 1, name: "Salaire", montant: 0 }] },
  ]);
  const persons = externalPersons ?? internalPersons;
  const setPersons = (updater: Person[] | ((prev: Person[]) => Person[])) => {
    const next = typeof updater === "function" ? (updater as (prev: Person[]) => Person[])(persons) : updater;
    if (externalPersons && onPersonsChange) {
      onPersonsChange(next);
    } else {
      setInternalPersons(next);
    }
  };
  const { updateTotal, updateRevenusParPersonnes } = useBudget();

  const handlePersonNameChange = (personId: number, name: string) => {
    setPersons((prev) => prev.map((p) => (p.id === personId ? { ...p, name } : p)));
  };

  const handleAddRevenue = (personId: number) => {
    setPersons((prev) =>
      prev.map((p) =>
        p.id === personId
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

  const handleDeleteRevenue = (personId: number, revenueId: number) => {
    setPersons((prev) =>
      prev.map((p) =>
        p.id === personId ? { ...p, revenus: p.revenus.filter((r) => r.id !== revenueId) } : p
      )
    );
  };

  const handleSaveValue =
    (personId: number, revenueId: number) => async (newValue: string) => {
      const numValue = Number(newValue);
      setPersons((prev) =>
        prev.map((p) =>
          p.id === personId
            ? {
                ...p,
                revenus: p.revenus.map((r) =>
                  r.id === revenueId ? { ...r, montant: Number.isFinite(numValue) ? numValue : 0 } : r
                ),
              }
            : p
        )
      );
      await new Promise((resolve) => setTimeout(resolve, 200));
    };

  const handleSaveName = (personId: number, revenueId: number) => (newName: string) => {
    setPersons((prev) =>
      prev.map((p) =>
        p.id === personId
          ? {
              ...p,
              revenus: p.revenus.map((r) => (r.id === revenueId ? { ...r, name: newName || r.name } : r)),
            }
          : p
      )
    );
  };

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

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">
        {activePersonId
          ? (() => {
              const activePerson = persons.find((p) => p.id === activePersonId);
              if (!activePerson) return "Revenus";
              return (
                <span className="flex items-center gap-2">
                  <span>Revenus</span>
                  <span style={{ opacity: 0.6 }}>{">"}</span>
                  <EditableTitle
                    value={activePerson.name}
                    onChange={(next) => handlePersonNameChange(activePerson.id, next)}
                    ariaLabel="Nom de la personne"
                    width="18ch"
                  />
                </span>
              );
            })()
          : "Revenus"}
      </h2>
      <p
        className="mt-1 text-sm"
        style={{ color: "var(--theme-textSecondary)" }}
      >
        Chaque personne a ses revenus : edite le nom, le salaire, et ajoute d'autres revenus si besoin.
      </p>

      <div className="space-y-6">
        {(activePersonId ? persons.filter((p) => p.id === activePersonId) : persons).map((person) => (
          <div key={person.id} className="space-y-3">
            <div style={sliderGroupStyle}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "clamp(240px, 26vw, 360px) 1fr auto",
                  alignItems: "center",
                  padding: "0 16px",
                  fontSize: 14,
                  color: "var(--theme-tabActiveBg)",
                  columnGap: 14,
                  marginBottom: 6,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontWeight: 700, flex: 1 }}>Total revenus {person.name.toUpperCase()}</span>
                  <div
                    style={{
                      position: "relative",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 104,
                    }}
                  >
                    <span aria-hidden style={{ position: "absolute", left: 0, width: 16, height: 16 }} />
                    <span style={{ textAlign: "center", fontWeight: 700 }}>
                      {person.revenus.reduce((sum, r) => sum + r.montant, 0).toLocaleString("fr-FR")}€
                    </span>
                  </div>
                </div>
                <div />
                <div />
              </div>
              <div className="space-y-0">
                {person.revenus.map((item) => {
                  const absValue = Math.max(0, Math.abs(item.montant));
                  const maxValue = Math.max(2000, Math.ceil(absValue * 1.5));
                  return (
                    <EditableSliderRow
                      key={item.id}
                      label={item.name}
                      labelEditable
                      onLabelChange={handleSaveName(person.id, item.id)}
                      value={absValue}
                      min={0}
                      max={maxValue}
                      step={10}
                      unitLabel="€/mois"
                      onValueChange={(next) => handleSaveValue(person.id, item.id)(String(next))}
                      onRemove={() => handleDeleteRevenue(person.id, item.id)}
                    />
                  );
                })}
              </div>
              <button
                onClick={() => handleAddRevenue(person.id)}
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
        ))}
      </div>
    </div>
  );
}



