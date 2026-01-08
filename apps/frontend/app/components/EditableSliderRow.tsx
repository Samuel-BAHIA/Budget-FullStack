"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent, type CSSProperties } from "react";
import { TrashIcon } from "./icons/TrashIcon";

export type EditableSliderRowProps = {
  label: string;
  labelEditable?: boolean;
  onLabelChange?: (next: string) => void;
  value: number;
  min?: number;
  max: number;
  step?: number;
  unitLabel?: string;
  onValueChange?: (next: number) => void;
  onRemove?: () => void;
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

export const sliderGroupStyle: CSSProperties = {
  borderRadius: 20,
  padding: "14px 16px",
  background: "color-mix(in srgb, var(--theme-bgCard) 70%, transparent)",
  boxShadow: "inset 0 0 0 1px color-mix(in srgb, var(--theme-border) 35%, transparent)",
  display: "flex",
  flexDirection: "column",
  gap: 12,
};

export function EditableSliderRow({
  label,
  labelEditable = true,
  onLabelChange,
  value,
  min = 0,
  max,
  step = 10,
  unitLabel = "€/mois",
  onValueChange,
  onRemove,
}: EditableSliderRowProps) {
  const [currentLabel, setCurrentLabel] = useState(label);
  const [isEditingLabel, setIsEditingLabel] = useState(false);

  const [currentValue, setCurrentValue] = useState(() => clamp(value, min, max));
  const [rawInput, setRawInput] = useState<string>(String(clamp(value, min, max)));

  const labelInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setCurrentLabel(label);
  }, [label]);

  useEffect(() => {
    const nextValue = clamp(value, min, max);
    setCurrentValue(nextValue);
    setRawInput(String(nextValue));
  }, [value, min, max]);

  const valueNumber = useMemo(() => {
    const parsed = Number(rawInput.replace(",", "."));
    return Number.isFinite(parsed) ? parsed : NaN;
  }, [rawInput]);

  const commitValue = (next: number) => {
    const v = clamp(Math.round(next / step) * step, min, max);
    setCurrentValue(v);
    setRawInput(String(v));
    onValueChange?.(v);
  };

  const handleSliderChange = (e: ChangeEvent<HTMLInputElement>) => {
    const next = Number(e.target.value);
    setCurrentValue(next);
    setRawInput(String(next));
    onValueChange?.(next);
  };

  const handleValueInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const nextRaw = e.target.value;
    setRawInput(nextRaw);

    const parsed = Number(nextRaw.replace(",", "."));
    if (Number.isFinite(parsed)) {
      setCurrentValue(clamp(parsed, min, max));
    }
  };

  const handleValueInputBlur = () => {
    if (!Number.isFinite(valueNumber)) {
      setRawInput(String(currentValue));
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
    setCurrentLabel(cleaned);
    setIsEditingLabel(false);
    onLabelChange?.(cleaned);
  };

  const ratio = max > min ? (currentValue - min) / (max - min) : 0;
  const infoText = ratio < 0.25 ? "Niveau faible" : ratio < 0.6 ? "Niveau modere" : "Niveau eleve";
  const infoColor = ratio < 0.25 ? "#93c5fd" : ratio < 0.6 ? "#a5b4fc" : "#fbbf24";

  return (
    <div style={styles.row}>
      <div style={styles.left}>
        {labelEditable ? (
          !isEditingLabel ? (
            <button type="button" onClick={startEditLabel} style={styles.labelBtn} title="Renommer">
              <span style={styles.labelText}>{currentLabel}</span>
              <span style={styles.pencil} aria-hidden="true">
                <PencilIcon />
              </span>
            </button>
          ) : (
            <input
              ref={labelInputRef}
              value={currentLabel}
              onChange={(e) => setCurrentLabel(e.target.value)}
              onBlur={() => commitLabel(currentLabel)}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitLabel(currentLabel);
                if (e.key === "Escape") setIsEditingLabel(false);
              }}
              style={styles.labelInput}
              aria-label="Nom du champ"
            />
          )
        ) : (
          <div style={styles.labelStatic}>{currentLabel}</div>
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
          value={Number.isFinite(currentValue) ? currentValue : min}
          onChange={handleSliderChange}
          style={styles.slider}
          aria-label={`${currentLabel} - curseur`}
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
                if (e.key === "Escape") setRawInput(String(currentValue));
              }}
              style={styles.valueInput}
              aria-label={`${currentLabel} - valeur`}
            />
            <span style={styles.unitInline}>{unitLabel}</span>
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
    background: "color-mix(in srgb, var(--theme-bgCard) 85%, transparent)",
    border: "none",
    boxShadow: "0 10px 30px rgba(0,0,0,0.18)",
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
    background: "color-mix(in srgb, var(--theme-bgCard) 70%, transparent)",
    color: "var(--theme-text)",
    cursor: "text",
    width: "100%",
    boxShadow: "inset 0 2px 6px rgba(0,0,0,0.55), inset 0 -1px 2px rgba(255,255,255,0.08)",
  },
  labelStatic: {
    display: "inline-flex",
    alignItems: "center",
    padding: "10px 12px",
    borderRadius: 999,
    border: "none",
    background: "color-mix(in srgb, var(--theme-bgCard) 70%, transparent)",
    color: "var(--theme-text)",
    fontWeight: 600,
    width: "100%",
    boxShadow: "inset 0 2px 6px rgba(0,0,0,0.55), inset 0 -1px 2px rgba(255,255,255,0.08)",
  },
  labelText: { fontWeight: 600 },
  pencil: { opacity: 0.7, fontSize: 14 },
  labelInput: {
    padding: "10px 12px",
    borderRadius: 999,
    border: "1px solid color-mix(in srgb, var(--theme-border) 70%, transparent)",
    background: "color-mix(in srgb, var(--theme-bgCard) 70%, transparent)",
    color: "var(--theme-text)",
    outline: "none",
    width: "100%",
    boxShadow: "inset 0 2px 6px rgba(0,0,0,0.55), inset 0 -1px 2px rgba(255,255,255,0.08)",
  },
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
    background: "color-mix(in srgb, var(--theme-bgCard) 70%, transparent)",
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
  unitInline: {
    fontSize: 11,
    opacity: 0.6,
    textAlign: "center",
    paddingRight: 6,
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
