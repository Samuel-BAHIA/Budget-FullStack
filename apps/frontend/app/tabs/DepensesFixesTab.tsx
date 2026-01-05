"use client";

import { useEffect, useMemo, useState } from "react";
import { EditableValueEuro } from "../components/EditableValueEuro";
import { useBudget } from "../contexts/BudgetContext";

type Expense = { id: number; name: string; montant: number };
type SectionKey = "abonnements" | "voiture";

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

export function DepensesFixesTab() {
  const [abonnements, setAbonnements] = useState<Expense[]>([
    { id: 1, name: "Telephone", montant: 80 },
    { id: 2, name: "Netflix", montant: 20 },
  ]);
  const [voiture, setVoiture] = useState<Expense[]>([
    { id: 1, name: "Credit voiture", montant: 300 },
    { id: 2, name: "Assurances voiture", montant: 170 },
  ]);
  const [editingTitle, setEditingTitle] = useState<{
    section: SectionKey;
    id: number;
  } | null>(null);
  const [titleDraft, setTitleDraft] = useState("");
  const { updateTotal } = useBudget();

  const editableWrapperStyle: React.CSSProperties = useMemo(
    () => ({
      backgroundColor: "color-mix(in srgb, var(--theme-bgCard) 82%, white)",
      border: "1px solid color-mix(in srgb, var(--theme-border) 75%, white)",
    }),
    []
  );
  const negativeWrapperStyle: React.CSSProperties = useMemo(
    () => ({
      ...editableWrapperStyle,
      backgroundColor: "rgba(239,68,68,0.08)",
      borderColor: "rgba(239,68,68,0.35)",
    }),
    [editableWrapperStyle]
  );

  const getDepenseHint = (value: string | number) => {
    const numValue = Number(value);
    if (numValue === 0) return "Aucune depense definie";
    if (numValue < 50) return "Depense faible";
    if (numValue < 150) return "Depense moderee";
    return "Depense elevee";
  };

  const handleSaveMontant =
    (section: SectionKey, id: number) => async (newValue: string) => {
      const numValue = Number(newValue);
      const setter = section === "abonnements" ? setAbonnements : setVoiture;
      setter((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, montant: Number.isFinite(numValue) ? numValue : 0 }
            : item
        )
      );
      await new Promise((resolve) => setTimeout(resolve, 200));
    };

  const handleEditTitle = (section: SectionKey, id: number, current: string) => {
    setEditingTitle({ section, id });
    setTitleDraft(current);
  };

  const handleSaveTitle = () => {
    if (!editingTitle) return;
    const { section, id } = editingTitle;
    const setter = section === "abonnements" ? setAbonnements : setVoiture;
    setter((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, name: titleDraft || item.name } : item
      )
    );
    setEditingTitle(null);
    setTitleDraft("");
  };

  const handleCancelTitle = () => {
    setEditingTitle(null);
    setTitleDraft("");
  };

  const handleDelete = (section: SectionKey, id: number) => {
    const setter = section === "abonnements" ? setAbonnements : setVoiture;
    setter((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAdd = (section: SectionKey) => {
    const setter = section === "abonnements" ? setAbonnements : setVoiture;
    const prefix = section === "abonnements" ? "Abonnement" : "Depense";
    setter((prev) => {
      const nextId = Math.max(0, ...prev.map((a) => a.id)) + 1;
      return [...prev, { id: nextId, name: `${prefix} ${nextId}`, montant: 0 }];
    });
  };

  useEffect(() => {
    const total =
      abonnements.reduce((sum, item) => sum + item.montant, 0) +
      voiture.reduce((sum, item) => sum + item.montant, 0);
    updateTotal("depensesFixes", total);
  }, [abonnements, voiture, updateTotal]);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Depenses fixes</h2>
      <p
        className="mt-2"
        style={{ color: "var(--theme-textSecondary)" }}
      >
        Gere tes abonnements et autres depenses fixes mensuelles.
      </p>

      <div className="mt-6 space-y-8">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold">Abonnements</h3>
            <button
              onClick={() => handleAdd("abonnements")}
              className="flex items-center gap-1 rounded-md border px-2 py-1 text-sm transition"
              style={{
                borderColor: "var(--theme-border)",
                backgroundColor: "var(--theme-bgCard)",
                color: "var(--theme-text)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--theme-bgHover)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "var(--theme-bgCard)";
              }}
            >
              <span style={{ fontWeight: 700 }}>+</span> Ajouter
            </button>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {abonnements.map((abo) => (
              <div key={abo.id} className="rounded-xl p-3 space-y-3" style={negativeWrapperStyle}>
                <div className="flex items-center justify-between gap-2">
                  {editingTitle?.section === "abonnements" && editingTitle.id === abo.id ? (
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
                          e.currentTarget.style.boxShadow =
                            "0 0 0 2px var(--theme-borderLight)";
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
                      <span className="flex-1 text-base font-semibold">{abo.name}</span>
                      <button
                        onClick={() => handleEditTitle("abonnements", abo.id, abo.name)}
                        className="rounded-md p-2 transition hover:bg-[var(--theme-bgHover)]"
                        style={{ color: "var(--theme-textSecondary)" }}
                        title="Modifier le nom"
                      >
                        <EditIcon />
                      </button>
                      <button
                        onClick={() => handleDelete("abonnements", abo.id)}
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
                  value={abo.montant}
                  onSave={handleSaveMontant("abonnements", abo.id)}
                  hintText={getDepenseHint}
                  displayPrefix="-"
                  displaySuffix="/mois"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold">Voiture</h3>
            <button
              onClick={() => handleAdd("voiture")}
              className="flex items-center gap-1 rounded-md border px-2 py-1 text-sm transition"
              style={{
                borderColor: "var(--theme-border)",
                backgroundColor: "var(--theme-bgCard)",
                color: "var(--theme-text)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--theme-bgHover)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "var(--theme-bgCard)";
              }}
            >
              <span style={{ fontWeight: 700 }}>+</span> Ajouter
            </button>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {voiture.map((item) => (
                <div key={item.id} className="rounded-xl p-3 space-y-3" style={negativeWrapperStyle}>
                <div className="flex items-center justify-between gap-2">
                  {editingTitle?.section === "voiture" && editingTitle.id === item.id ? (
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
                          e.currentTarget.style.boxShadow =
                            "0 0 0 2px var(--theme-borderLight)";
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
                        onClick={() => handleEditTitle("voiture", item.id, item.name)}
                        className="rounded-md p-2 transition hover:bg-[var(--theme-bgHover)]"
                        style={{ color: "var(--theme-textSecondary)" }}
                        title="Modifier le nom"
                      >
                        <EditIcon />
                      </button>
                      <button
                        onClick={() => handleDelete("voiture", item.id)}
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
                  onSave={handleSaveMontant("voiture", item.id)}
                  hintText={getDepenseHint}
                  displayPrefix="-"
                  displaySuffix="/mois"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
