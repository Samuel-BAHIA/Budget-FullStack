"use client";

import { useEffect, useState } from "react";
import { TrashIcon } from "../components/icons/TrashIcon";
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

  const handleDeletePerson = (personId: number) => {
    setPersons((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((p) => p.id !== personId);
    });
  };

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
      <h2 className="text-xl font-semibold">Revenus</h2>
      <p
        className="mt-1 text-sm"
        style={{ color: "var(--theme-textSecondary)" }}
      >
        Chaque personne a ses revenus : edite le nom, le salaire, et ajoute d'autres revenus si besoin.
      </p>

      <div className="space-y-6">
        {(activePersonId ? persons.filter((p) => p.id === activePersonId) : persons).map((person) => (
          <div key={person.id} className="space-y-3">
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={person.name}
                onChange={(e) => handlePersonNameChange(person.id, e.target.value)}
                className="min-w-[180px] flex-1 rounded-md border px-3 py-2 text-lg font-semibold outline-none transition bg-transparent"
                style={{
                  borderColor: "var(--theme-border)",
                  color: "var(--theme-text)",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "var(--theme-borderLight)";
                  e.currentTarget.style.boxShadow = "0 0 0 2px var(--theme-borderLight)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "var(--theme-border)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
              <button
                onClick={() => handleDeletePerson(person.id)}
                disabled={persons.length <= 1}
                className="rounded-md px-2 py-2 text-sm transition flex items-center justify-center"
                style={{
                  border: "1px solid transparent",
                  backgroundColor: "transparent",
                  color: persons.length <= 1 ? "var(--theme-textSecondary)" : "var(--theme-textSecondary)",
                  cursor: persons.length <= 1 ? "not-allowed" : "pointer",
                }}
                onMouseEnter={(e) => {
                  if (persons.length <= 1) return;
                  e.currentTarget.style.color = "#ef4444";
                }}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--theme-textSecondary)")}
                title="Supprimer la personne"
                aria-label="Supprimer la personne"
              >
                <TrashIcon />
              </button>
            </div>

            <div className="space-y-3">
              {person.revenus.map((item) => {
                const maxValue = Math.max(2000, Math.ceil(Math.abs(item.montant) * 1.5));
                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 rounded-lg border px-3 py-2"
                    style={{ borderColor: "var(--theme-border)" }}
                  >
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => handleSaveName(person.id, item.id)(e.target.value)}
                      className="w-48 rounded-md border px-2 py-1 text-sm font-semibold outline-none"
                      style={{
                        borderColor: "var(--theme-border)",
                        backgroundColor: "var(--theme-bgCard)",
                        color: "var(--theme-text)",
                      }}
                    />
                    <input
                      type="range"
                      min={0}
                      max={maxValue}
                      step={10}
                      value={Math.max(0, item.montant)}
                      onChange={(e) => handleSaveValue(person.id, item.id)(e.target.value)}
                      className="flex-1 accent-[var(--theme-tabActiveBg)]"
                      aria-label={`Ajuster ${item.name}`}
                    />
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min={0}
                        step={10}
                        value={Math.max(0, item.montant)}
                        onChange={(e) => handleSaveValue(person.id, item.id)(e.target.value)}
                        className="w-24 rounded-md border px-2 py-1 text-sm font-semibold text-right outline-none"
                        style={{
                          borderColor: "var(--theme-border)",
                          backgroundColor: "var(--theme-bgCard)",
                          color: "#16a34a",
                        }}
                      />
                      <span className="text-sm font-semibold" style={{ color: "#16a34a" }}>
                        €/mois
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteRevenue(person.id, item.id)}
                      className="rounded-md px-2 py-1 text-sm transition hover:bg-[var(--theme-bgHover)]"
                      style={{ color: "var(--theme-textSecondary)" }}
                      aria-label="Supprimer le revenu"
                      title="Supprimer le revenu"
                    >
                      ×
                    </button>
                  </div>
                );
              })}
              <button
                onClick={() => handleAddRevenue(person.id)}
                className="flex items-center gap-3 rounded-lg border-2 border-dashed px-3 py-2 w-full justify-center text-sm font-semibold transition hover:border-[var(--theme-borderLight)] hover:bg-[var(--theme-bgHover)]"
                style={{
                  borderColor: "rgba(34,197,94,0.35)",
                  color: "var(--theme-success, #22c55e)",
                  backgroundColor: "rgba(34,197,94,0.12)",
                }}
              >
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-full text-lg"
                  style={{ backgroundColor: "rgba(34,197,94,0.16)", color: "var(--theme-success, #22c55e)" }}
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
