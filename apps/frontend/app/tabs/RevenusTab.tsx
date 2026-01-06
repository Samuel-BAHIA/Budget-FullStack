"use client";

import { useEffect, useMemo, useState } from "react";
import { EditableValueEuro } from "../components/EditableValueEuro";
import { useBudget } from "../contexts/BudgetContext";

type Revenue = { id: number; name: string; montant: number };
type Person = { id: number; name: string; revenus: Revenue[] };

const EditIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M11.333 2.00001C11.5084 1.82445 11.7163 1.68506 11.9447 1.58989C12.1731 1.49472 12.4173 1.44556 12.664 1.44556C12.9107 1.44556 13.1549 1.49472 13.3833 1.58989C13.6117 1.68506 13.8196 1.82445 13.995 2.00001C14.1706 2.17545 14.31 2.38335 14.4051 2.61176C14.5003 2.84017 14.5495 3.08435 14.5495 3.33101C14.5495 3.57767 14.5003 3.82185 14.4051 4.05026C14.31 4.27867 14.1706 4.48657 13.995 4.66201L5.32833 13.3287L1.33333 14.662L2.66666 10.667L11.333 2.00001Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CheckIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M13.3333 4L6 11.3333L2.66667 8"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CancelIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 4L4 12M4 4L12 12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const TrashIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M3.75 4.5H12.25M6.75 4.5V3C6.75 2.58579 7.08579 2.25 7.5 2.25H8.5C8.91421 2.25 9.25 2.58579 9.25 3V4.5M4.5 4.5V13C4.5 13.4142 4.83579 13.75 5.25 13.75H10.75C11.1642 13.75 11.5 13.4142 11.5 13V4.5M6.5 7.5V11M9.5 7.5V11"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export function RevenusTab() {
  const [persons, setPersons] = useState<Person[]>([
    {
      id: 1,
      name: "Personne 1",
      revenus: [{ id: 1, name: "Salaire", montant: 0 }],
    },
  ]);
  const [editingTitle, setEditingTitle] = useState<{ personId: number; revenueId: number } | null>(null);
  const [titleDraft, setTitleDraft] = useState("");
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

  const handleEditTitle = (personId: number, revenueId: number, current: string) => {
    setEditingTitle({ personId, revenueId });
    setTitleDraft(current);
  };

  const handleSaveTitle = () => {
    if (!editingTitle) return;
    const { personId, revenueId } = editingTitle;
    setPersons((prev) =>
      prev.map((p) =>
        p.id === personId
          ? {
              ...p,
              revenus: p.revenus.map((r) =>
                r.id === revenueId ? { ...r, name: titleDraft || r.name } : r
              ),
            }
          : p
      )
    );
    setEditingTitle(null);
    setTitleDraft("");
  };

  const handleCancelTitle = () => {
    setEditingTitle(null);
    setTitleDraft("");
  };

  const handleDeleteRevenue = (personId: number, revenueId: number) => {
    setPersons((prev) =>
      prev.map((p) =>
        p.id === personId ? { ...p, revenus: p.revenus.filter((r) => r.id !== revenueId) } : p
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

  const handleAddPerson = () => {
    setPersons((prev) => {
      const nextId = Math.max(0, ...prev.map((p) => p.id)) + 1;
      return [
        ...prev,
        {
          id: nextId,
          name: `Personne ${nextId}`,
          revenus: [{ id: 1, name: "Revenu 1", montant: 0 }],
        },
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
            <div className="flex flex-wrap items-center gap-3 justify-between">
              <div className="flex flex-wrap items-center gap-3 min-w-0 flex-1">
                <input
                  type="text"
                  value={person.name}
                  onChange={(e) => handlePersonNameChange(person.id, e.target.value)}
                  className="min-w-[180px] flex-1 rounded-md border px-3 py-2 text-sm font-semibold outline-none transition"
                  style={{
                    borderColor: "var(--theme-border)",
                    backgroundColor: "var(--theme-bgCard)",
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
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <span style={{ color: "var(--theme-textSecondary)" }}>Total</span>
                  <span style={{ color: "#22c55e" }}>
                    +
                    {person.revenus
                      .reduce((s, r) => s + r.montant, 0)
                      .toLocaleString("fr-FR")}{" "}
                    €
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleAddRevenue(person.id)}
                  className="rounded-md border px-3 py-2 text-sm transition"
                  style={{
                    borderColor: "var(--theme-border)",
                    backgroundColor: "var(--theme-bgCard)",
                    color: "var(--theme-text)",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--theme-bgHover)")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--theme-bgCard)")}
                >
                  + Ajouter un revenu
                </button>
                <button
                  onClick={() => handleDeletePerson(person.id)}
                  className="rounded-md border px-3 py-2 text-sm transition hover:bg-red-500/15"
                  style={{
                    borderColor: "var(--theme-border)",
                    backgroundColor: "var(--theme-bgCard)",
                    color: "var(--theme-textSecondary)",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.12)")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--theme-bgCard)")}
                >
                  Supprimer
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {person.revenus.map((item) => {
                const isEditing = editingTitle?.personId === person.id && editingTitle.revenueId === item.id;
                return (
                  <div key={item.id} className="rounded-xl p-3 space-y-3" style={positiveWrapperStyle}>
                    <div className="flex items-center justify-between gap-2">
                      {isEditing ? (
                        <>
                          <input
                            type="text"
                            value={titleDraft}
                            onChange={(e) => setTitleDraft(e.target.value)}
                            className="flex-1 rounded-md border px-3 py-2 text-sm font-semibold outline-none transition"
                            style={{
                              borderColor: "var(--theme-border)",
                              backgroundColor: "var(--theme-bgCard)",
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
                            onClick={handleSaveTitle}
                            className="rounded-md p-2 transition"
                            style={{
                              backgroundColor: "var(--theme-tabActiveBg)",
                              color: "var(--theme-tabActiveText)",
                            }}
                            title="Valider"
                          >
                            <CheckIcon />
                          </button>
                          <button
                            onClick={handleCancelTitle}
                            className="rounded-md p-2 transition"
                            style={{
                              backgroundColor: "var(--theme-bgHover)",
                              color: "var(--theme-text)",
                            }}
                            title="Annuler"
                          >
                            <CancelIcon />
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="flex-1 text-base font-semibold">{item.name}</span>
                          <button
                            onClick={() => handleEditTitle(person.id, item.id, item.name)}
                            className="rounded-md p-2 transition hover:bg-[var(--theme-bgHover)]"
                            style={{ color: "var(--theme-textSecondary)" }}
                            title="Modifier le nom"
                          >
                            <EditIcon />
                          </button>
                          <button
                            onClick={() => handleDeleteRevenue(person.id, item.id)}
                            className="rounded-md p-2 transition hover:bg-red-500/15"
                            style={{ color: "var(--theme-textSecondary)" }}
                            title="Supprimer"
                          >
                            <TrashIcon />
                          </button>
                        </>
                      )}
                    </div>
                    <EditableValueEuro
                      value={item.montant}
                      onSave={handleSaveMontant(person.id, item.id)}
                      hintText={getHint}
                      displayPrefix="+"
                      displaySuffix="/mois"
                    />
                  </div>
                );
              })}
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
