"use client";

import { useEffect, useMemo, useState } from "react";
import { EditableValueEuro } from "../components/EditableValueEuro";
import { useBudget } from "../contexts/BudgetContext";

type Expense = { id: number; name: string; montant: number };
type SectionKey = "quotidien" | "voitures" | "autres";

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

export function DepensesVariablesTab() {
  const [quotidien, setQuotidien] = useState<Expense[]>([
    { id: 1, name: "Courses", montant: 450 },
  ]);
  const [voitures, setVoitures] = useState<Expense[]>([
    { id: 1, name: "Carburant", montant: 120 },
    { id: 2, name: "Entretien voiture", montant: 70 },
  ]);
  const [autres, setAutres] = useState<Expense[]>([
    { id: 1, name: "Sante", montant: 150 },
    { id: 2, name: "Autres", montant: 100 },
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
    if (numValue < 100) return "Depense faible";
    if (numValue < 300) return "Depense moderee";
    return "Depense elevee";
  };

  const handleSaveMontant =
    (section: SectionKey, id: number) => async (newValue: string) => {
      const numValue = Number(newValue);
      const setter =
        section === "quotidien"
          ? setQuotidien
          : section === "voitures"
          ? setVoitures
          : setAutres;
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
    const setter =
      section === "quotidien"
        ? setQuotidien
        : section === "voitures"
        ? setVoitures
        : setAutres;
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
    const setter =
      section === "quotidien"
        ? setQuotidien
        : section === "voitures"
        ? setVoitures
        : setAutres;
    setter((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAdd = (section: SectionKey) => {
    const setter =
      section === "quotidien"
        ? setQuotidien
        : section === "voitures"
        ? setVoitures
        : setAutres;
    const prefix =
      section === "quotidien"
        ? "Depense"
        : section === "voitures"
        ? "Voiture"
        : "Autre";
    setter((prev) => {
      const nextId = Math.max(0, ...prev.map((a) => a.id)) + 1;
      return [...prev, { id: nextId, name: `${prefix} ${nextId}`, montant: 0 }];
    });
  };

  useEffect(() => {
    const total =
      quotidien.reduce((sum, item) => sum + item.montant, 0) +
      voitures.reduce((sum, item) => sum + item.montant, 0) +
      autres.reduce((sum, item) => sum + item.montant, 0);
    updateTotal("depensesVariables", total);
  }, [quotidien, voitures, autres, updateTotal]);

  const renderSection = (
    title: string,
    section: SectionKey,
    items: Expense[],
    setterLabel: string
  ) => {
    const isSectionEditing = (id: number) =>
      editingTitle?.section === section && editingTitle.id === id;

    return (
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button
            onClick={() => handleAdd(section)}
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
            aria-label={`Ajouter ${setterLabel}`}
          >
            <span style={{ fontWeight: 700 }}>+</span> Ajouter
          </button>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {items.map((item) => (
            <div key={item.id} className="rounded-xl p-3 space-y-3" style={negativeWrapperStyle}>
              <div className="flex items-center justify-between gap-2">
                {isSectionEditing(item.id) ? (
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
                      onClick={() => handleEditTitle(section, item.id, item.name)}
                      className="rounded-md p-2 transition hover:bg-[var(--theme-bgHover)]"
                      style={{ color: "var(--theme-textSecondary)" }}
                      title="Modifier le nom"
                    >
                      <EditIcon />
                    </button>
                    <button
                      onClick={() => handleDelete(section, item.id)}
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
                  onSave={handleSaveMontant(section, item.id)}
                  hintText={getDepenseHint}
                  displayPrefix="-"
                  displaySuffix="/mois"
                />
              </div>
            ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Depenses variables</h2>
      <p
        className="mt-2"
        style={{ color: "var(--theme-textSecondary)" }}
      >
        Quotidien, voiture et autres depenses variables.
      </p>

      <div className="mt-6 space-y-8">
        {renderSection("Quotidien", "quotidien", quotidien, "une depense quotidienne")}
        {renderSection("Voitures", "voitures", voitures, "une depense voiture")}
        {renderSection("Autres", "autres", autres, "une depense autre")}
      </div>
    </div>
  );
}
