"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { MoneyCard } from "../components/MoneyCard";
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
        Chaque personne a ses revenus : édite le nom, le salaire, et ajoute d'autres revenus si besoin.
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {person.revenus.map((item) => (
                <MoneyCard
                  key={item.id}
                  name={item.name}
                  value={item.montant}
                  positive
                  onDelete={() => handleDeleteRevenue(person.id, item.id)}
                  onSaveValue={handleSaveValue(person.id, item.id)}
                  onSaveName={handleSaveName(person.id, item.id)}
                  hintText="Revenu"
                  displayPrefix="+"
                  displaySuffix="/mois"
                  wrapperStyle={{
                    backgroundColor: "rgba(34,197,94,0.10)", // vert léger cohérent avec dépenses positives
                    border: "1px solid rgba(34,197,94,0.35)",
                    boxShadow: "0 0 0 1px rgba(34,197,94,0.25)",
                  }}
                />
              ))}
              <button
                onClick={() => handleAddRevenue(person.id)}
                className="w-full rounded-xl border-2 border-dashed p-4 text-sm font-semibold flex flex-col items-center justify-center gap-2 text-center transition hover:border-[var(--theme-borderLight)] hover:bg-[var(--theme-bgHover)]"
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
