"use client";

import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { MoneyCard } from "../components/MoneyCard";
import { TrashIcon } from "../components/icons/TrashIcon";
import { useBudget } from "../contexts/BudgetContext";

type Revenue = { id: number; name: string; montant: number };
type Person = { id: number; name: string; revenus: Revenue[] };

export function RevenusTab() {
  const [persons, setPersons] = useState<Person[]>([
    { id: 1, name: "Personne 1", revenus: [{ id: 1, name: "Salaire", montant: 0 }] },
  ]);
  const { updateTotal } = useBudget();

  const editableWrapperStyle: React.CSSProperties = useMemo(
    () => ({
      backgroundColor: "color-mix(in srgb, var(--theme-bgCard) 82%, white)",
      border: "1px solid color-mix(in srgb, var(--theme-border) 75%, white)",
    }),
    []
  );
  const positiveWrapperStyle: React.CSSProperties = useMemo(
    () => ({
      ...editableWrapperStyle,
      backgroundColor: "rgba(34,197,94,0.10)",
      borderColor: "rgba(34,197,94,0.35)",
    }),
    [editableWrapperStyle]
  );

  const getHint = (value: string | number) => {
    const numValue = Number(value);
    if (numValue === 0) return "Aucun revenu defini";
    if (numValue < 1000) return "Revenu faible";
    if (numValue < 4000) return "Revenu moyen";
    return "Revenu eleve";
  };

  const handleSaveMontant =
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

  const handleAddPerson = () => {
    setPersons((prev) => {
      const nextId = Math.max(0, ...prev.map((p) => p.id)) + 1;
      return [
        ...prev,
        { id: nextId, name: `Personne ${nextId}`, revenus: [{ id: 1, name: "Revenu 1", montant: 0 }] },
      ];
    });
  };

  const handleDeletePerson = (personId: number) => {
    setPersons((prev) => prev.filter((p) => p.id !== personId));
  };

  const handlePersonNameChange = (personId: number, name: string) => {
    setPersons((prev) => prev.map((p) => (p.id === personId ? { ...p, name } : p)));
  };

  useEffect(() => {
    const total = persons.reduce(
      (sum, person) => sum + person.revenus.reduce((s, r) => s + r.montant, 0),
      0
    );
    updateTotal("revenus", total);
  }, [persons, updateTotal]);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Revenus</h2>
      <p
        className="mt-1 text-sm"
        style={{ color: "var(--theme-textSecondary)" }}
      >
        Ajoute tes revenus (salaires, primes, etc.).
      </p>

      <div className="space-y-5">
        {persons.map((person) => (
          <div
            key={person.id}
            className="rounded-2xl border p-4 space-y-3"
            style={{ borderColor: "var(--theme-border)", backgroundColor: "var(--theme-bgCard)" }}
          >
            <div
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 -mx-4 -mt-4 px-4 py-3"
              style={{
                backgroundColor: "var(--theme-border)",
                borderTopLeftRadius: "16px",
                borderTopRightRadius: "16px",
              }}
            >
              <div className="flex flex-wrap items-start sm:items-center gap-3 min-w-0 flex-1">
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
                <div className="flex items-center gap-2 font-semibold flex-wrap">
                  <span className="text-sm" style={{ color: "var(--theme-textSecondary)" }}>
                    Total
                  </span>
                  <span className="text-xl font-semibold" style={{ color: "#22c55e" }}>
                    +
                    {person.revenus.reduce((s, r) => s + r.montant, 0).toLocaleString("fr-FR")} ?
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto sm:justify-end">
                <button
                  onClick={() => handleDeletePerson(person.id)}
                  className="rounded-md px-2 py-2 text-sm transition w-full sm:w-auto flex items-center justify-center"
                  style={{
                    border: "1px solid transparent",
                    backgroundColor: "transparent",
                    color: "var(--theme-textSecondary)",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--theme-textSecondary)")}
                  title="Supprimer la personne"
                  aria-label="Supprimer la personne"
                >
                  <TrashIcon />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {person.revenus.map((item) => (
                <MoneyCard
                  key={item.id}
                  name={item.name}
                  value={item.montant}
                  positive
                  onDelete={() => handleDeleteRevenue(person.id, item.id)}
                  onSaveValue={handleSaveMontant(person.id, item.id)}
                  onSaveName={handleSaveName(person.id, item.id)}
                  hintText={getHint}
                  displayPrefix="+"
                  displaySuffix="/mois"
                  wrapperStyle={positiveWrapperStyle}
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

        <button
          onClick={handleAddPerson}
          className="w-full rounded-xl border-2 border-dashed p-4 text-sm font-semibold flex flex-col items-center justify-center gap-2 text-center transition hover:border-[var(--theme-borderLight)] hover:bg-[var(--theme-bgHover)]"
          style={{
            borderColor: "var(--theme-border)",
            color: "var(--theme-textSecondary)",
            backgroundColor: "color-mix(in srgb, var(--theme-bgCard) 85%, white)",
          }}
        >
          <span
            className="flex h-10 w-10 items-center justify-center rounded-full text-lg"
            style={{ backgroundColor: "var(--theme-bgCard)", color: "var(--theme-text)" }}
          >
            +
          </span>
          Ajouter une personne
        </button>
      </div>
    </div>
  );
}
