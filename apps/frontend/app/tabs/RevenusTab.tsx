"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent, type CSSProperties } from "react";
import { TrashIcon } from "../components/icons/TrashIcon";
import { useBudget } from "../contexts/BudgetContext";

export type Revenue = { id: number; name: string; montant: number };
export type Person = { id: number; name: string; revenus: Revenue[] };

type Props = {
  persons?: Person[];
  onPersonsChange?: (persons: Person[]) => void;
  activePersonId?: number | null;
};

type EditableSliderRowProps = {
  initialLabel?: string;
  initialValue?: number;
  min?: number;
  max?: number;
  step?: number;
  unitLabel?: string;
  onRemove?: () => void;
  onChange?: (next: { label: string; value: number }) => void;
};

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

const PencilIcon = () => (
  <svg width="14" height="14" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path
      d="M13.6 3.6l2.8 2.8m-1.2-4l1.2 1.2a1.7 1.7 0 010 2.4l-8.9 8.9-3.6.6.6-3.6 8.9-8.9a1.7 1.7 0 012.4 0z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

function EditableSliderRow({
  initialLabel = "Salaire",
  initialValue = 120,
  min = 0,
  max = 5000,
  step = 10,
  unitLabel = "€/mois",
  onRemove,
  onChange,
}: EditableSliderRowProps) {
  const [label, setLabel] = useState(initialLabel);
  const [isEditingLabel, setIsEditingLabel] = useState(false);

  const [value, setValue] = useState(() => clamp(initialValue, min, max));
  const [rawInput, setRawInput] = useState<string>(String(clamp(initialValue, min, max)));

  const labelInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setLabel(initialLabel);
  }, [initialLabel]);

  useEffect(() => {
    const nextValue = clamp(initialValue, min, max);
    setValue(nextValue);
    setRawInput(String(nextValue));
  }, [initialValue, min, max]);

  const valueNumber = useMemo(() => {
    const parsed = Number(rawInput.replace(",", "."));
    return Number.isFinite(parsed) ? parsed : NaN;
  }, [rawInput]);

  const commitValue = (next: number) => {
    const v = clamp(Math.round(next / step) * step, min, max);
    setValue(v);
    setRawInput(String(v));
    onChange?.({ label, value: v });
  };

  const handleSliderChange = (e: ChangeEvent<HTMLInputElement>) => {
    const next = Number(e.target.value);
    setValue(next);
    setRawInput(String(next));
    onChange?.({ label, value: next });
  };

  const handleValueInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const nextRaw = e.target.value;
    setRawInput(nextRaw);

    const parsed = Number(nextRaw.replace(",", "."));
    if (Number.isFinite(parsed)) {
      setValue(clamp(parsed, min, max));
    }
  };

  const handleValueInputBlur = () => {
    if (!Number.isFinite(valueNumber)) {
      setRawInput(String(value));
      return;
    }
    commitValue(valueNumber);
  };

  const startEditLabel = () => {
    setIsEditingLabel(true);
    setTimeout(() => labelInputRef.current?.focus(), 0);
  };

  const commitLabel = (next: string) => {
    const cleaned = next.trim() || "Sans titre";
    setLabel(cleaned);
    setIsEditingLabel(false);
    onChange?.({ label: cleaned, value });
  };

  const ratio = max > min ? (value - min) / (max - min) : 0;
  const infoText = ratio < 0.25 ? "Niveau faible" : ratio < 0.6 ? "Niveau modere" : "Niveau eleve";
  const infoColor = ratio < 0.25 ? "#93c5fd" : ratio < 0.6 ? "#a5b4fc" : "#fbbf24";

  return (
    <div style={styles.row}>
      <div style={styles.left}>
        {!isEditingLabel ? (
          <button type="button" onClick={startEditLabel} style={styles.labelBtn} title="Cliquer pour renommer">
            <span style={styles.labelText}>{label}</span>
            <span style={styles.pencil} aria-hidden="true">
              <PencilIcon />
            </span>
          </button>
        ) : (
          <input
            ref={labelInputRef}
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onBlur={() => commitLabel(label)}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitLabel(label);
              if (e.key === "Escape") setIsEditingLabel(false);
            }}
            style={styles.labelInput}
            aria-label="Nom du champ"
          />
        )}
      </div>

      <div style={styles.middle}>
        <div style={styles.minMaxTop}>
          <span>{min}</span>
          <span>{max}</span>
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={Number.isFinite(value) ? value : min}
          onChange={handleSliderChange}
          style={styles.slider}
          aria-label={`${label} - curseur`}
        />
        <div style={{ ...styles.infoHint, color: infoColor }}>{infoText}</div>
      </div>

      <div style={styles.right}>
        <div style={styles.valueStack}>
          <div style={styles.valueGroup}>
            <input
              type="number"
              inputMode="numeric"
              value={rawInput}
              onChange={handleValueInputChange}
              onBlur={handleValueInputBlur}
              onKeyDown={(e) => {
                if (e.key === "Enter") (e.currentTarget as HTMLInputElement).blur();
                if (e.key === "Escape") setRawInput(String(value));
              }}
              style={styles.valueInput}
              aria-label={`${label} - valeur`}
            />
            <span style={styles.hintTop}>{unitLabel}</span>
          </div>
        </div>

        {onRemove && (
          <button type="button" onClick={onRemove} style={styles.closeBtn} aria-label="Supprimer">
            <TrashIcon />
          </button>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  row: {
    display: "flex",
    gap: 14,
    alignItems: "center",
    padding: "14px 16px",
    borderRadius: 18,
    background: "rgba(10, 25, 45, 0.85)",
    border: "1px solid rgba(120, 170, 255, 0.25)",
    boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
  },
  left: {
    flex: "0 1 clamp(100px, 12vw, 150px)",
    minWidth: 100,
    maxWidth: 150,
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  labelBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 12px",
    borderRadius: 999,
    border: "none",
    background: "rgba(5, 12, 22, 0.6)",
    color: "white",
    cursor: "text",
    width: "100%",
    boxShadow: "inset 0 2px 6px rgba(0,0,0,0.55), inset 0 -1px 2px rgba(255,255,255,0.08)",
  },
  labelText: { fontWeight: 600 },
  pencil: { opacity: 0.7, fontSize: 14 },
  labelInput: {
    padding: "10px 12px",
    borderRadius: 999,
    border: "1px solid rgba(120, 170, 255, 0.45)",
    background: "rgba(5, 12, 22, 0.6)",
    color: "white",
    outline: "none",
    width: "100%",
    boxShadow: "inset 0 2px 6px rgba(0,0,0,0.55), inset 0 -1px 2px rgba(255,255,255,0.08)",
  },
  hintTop: { fontSize: 11, opacity: 0.6, textAlign: "center", width: "100%" },
  infoHint: { fontSize: 11, opacity: 0.7, textAlign: "center", width: "100%" },
  middle: { flex: 1, display: "flex", flexDirection: "column", gap: 6 },
  slider: { width: "100%" },
  minMaxTop: { display: "flex", justifyContent: "space-between", fontSize: 11, opacity: 0.6 },
  right: { display: "flex", alignItems: "center", gap: 10 },
  valueStack: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 },
  valueGroup: {
    display: "flex",
    alignItems: "center",
    borderRadius: 999,
    border: "none",
    background: "rgba(5, 12, 22, 0.6)",
    overflow: "hidden",
    paddingRight: 8,
    boxShadow: "inset 0 2px 6px rgba(0,0,0,0.55), inset 0 -1px 2px rgba(255,255,255,0.08)",
  },
  valueInput: {
    width: 88,
    padding: "10px 12px",
    border: "none",
    outline: "none",
    background: "transparent",
    color: "#7CFFB0",
    fontWeight: 700,
    textAlign: "right",
  },
  unitBadge: {
    padding: "10px 12px",
    background: "rgba(255,255,255,0.06)",
    color: "rgba(255,255,255,0.75)",
    borderLeft: "1px solid rgba(255,255,255,0.08)",
    fontWeight: 600,
    whiteSpace: "nowrap",
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 999,
    color: "rgba(255,255,255,0.85)",
    cursor: "pointer",
    fontSize: 20,
    lineHeight: "20px",
    border: "none",
    background: "transparent",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
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
                className="border-b px-0 py-2 text-lg font-semibold outline-none transition bg-transparent"
                style={{
                  borderColor: "var(--theme-border)",
                  color: "var(--theme-text)",
                  width: "24ch",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "var(--theme-borderLight)";
                  e.currentTarget.style.boxShadow = "none";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "var(--theme-border)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            </div>

            <div className="space-y-3">
              {person.revenus.map((item) => {
                const absValue = Math.max(0, Math.abs(item.montant));
                const maxValue = Math.max(2000, Math.ceil(absValue * 1.5));
                return (
                  <EditableSliderRow
                    key={item.id}
                    initialLabel={item.name}
                    initialValue={absValue}
                    min={0}
                    max={maxValue}
                    step={10}
                    unitLabel="€/mois"
                    onChange={(next) => {
                      handleSaveName(person.id, item.id)(next.label);
                      handleSaveValue(person.id, item.id)(String(next.value));
                    }}
                    onRemove={() => handleDeleteRevenue(person.id, item.id)}
                  />
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



