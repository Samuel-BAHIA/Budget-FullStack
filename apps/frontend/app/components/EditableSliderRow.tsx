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

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M5 10l3.5 3.5L15 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const sliderGroupStyle: CSSProperties = {
  borderRadius: 20,
  padding: "14px 16px",
  background: "color-mix(in srgb, var(--theme-bgCard) 70%, transparent)",
  boxShadow: "inset 0 0 0 1px color-mix(in srgb, var(--theme-border) 35%, transparent)",
  display: "flex",
  flexDirection: "column",
  gap: 0,
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
  const [isLabelFocused, setIsLabelFocused] = useState(false);
  const [isLabelHovered, setIsLabelHovered] = useState(false);
  const [isValueFocused, setIsValueFocused] = useState(false);
  const [isValueHovered, setIsValueHovered] = useState(false);

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
            <button
              type="button"
              onClick={startEditLabel}
              onMouseEnter={() => setIsLabelHovered(true)}
              onMouseLeave={() => setIsLabelHovered(false)}
              style={styles.labelBtn}
              title={currentLabel}
              aria-label="Renommer"
            >
              <span style={isLabelHovered ? styles.pencilActive : styles.pencil} aria-hidden="true">
                <PencilIcon />
              </span>
              <div style={styles.labelField}>
                <span style={isLabelHovered ? styles.labelTextHover : styles.labelText}>{currentLabel}</span>
              </div>
            </button>
          ) : (
            <div style={styles.labelEditRow}>
              <span style={isLabelFocused || isLabelHovered ? styles.labelEditPencilActive : styles.labelEditPencil} aria-hidden="true">
                <CheckIcon />
              </span>
              <div
                style={
                  isLabelFocused
                    ? { ...styles.labelField, boxShadow: "inset 0 2px 6px rgba(0,0,0,0.55), inset 0 -1px 2px rgba(255,255,255,0.08)" }
                    : styles.labelField
                }
              >
                <input
                  ref={labelInputRef}
                  value={currentLabel}
                  onChange={(e) => setCurrentLabel(e.target.value)}
                  onFocus={() => setIsLabelFocused(true)}
                  onBlur={() => commitLabel(currentLabel)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") commitLabel(currentLabel);
                    if (e.key === "Escape") setIsEditingLabel(false);
                  }}
                  style={isLabelFocused ? { ...styles.labelInput, color: "#B7FFD1" } : styles.labelInput}
                  aria-label="Nom du champ"
                />
              </div>
            </div>
          )
        ) : (
          <div style={styles.labelStatic} title={currentLabel}>
            <span style={styles.labelStaticText}>{currentLabel}</span>
          </div>
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
          <div
            style={styles.valueGroup}
            onMouseEnter={() => setIsValueHovered(true)}
            onMouseLeave={() => setIsValueHovered(false)}
          >
            <span style={isValueFocused || isValueHovered ? styles.pencilActive : styles.pencil} aria-hidden="true">
              <PencilIcon />
            </span>
            <div
              style={
                isValueFocused
                  ? { ...styles.valueField, boxShadow: "inset 0 2px 6px rgba(0,0,0,0.55), inset 0 -1px 2px rgba(255,255,255,0.08)" }
                  : styles.valueField
              }
            >
              <input
                type="number"
                inputMode="numeric"
                value={rawInput}
                onChange={handleValueInputChange}
                onFocus={() => setIsValueFocused(true)}
                onBlur={(e) => {
                  setIsValueFocused(false);
                  handleValueInputBlur();
                }}
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
    background: "transparent",
    border: "none",
    boxShadow: "none",
  },
  left: {
    flex: "0 1 clamp(100px, 12vw, 150px)",
    minWidth: 100,
    maxWidth: 150,
    display: "flex",
    flexDirection: "column",
    gap: 6,
    overflow: "hidden",
  },
  labelBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: 0,
    borderRadius: 999,
    border: "1px solid transparent",
    background: "transparent",
    color: "var(--theme-text)",
    cursor: "text",
    width: "100%",
    minWidth: 0,
    boxSizing: "border-box",
    boxShadow: "none",
  },
  labelStatic: {
    display: "inline-flex",
    alignItems: "center",
    padding: "10px 12px",
    borderRadius: 999,
    border: "none",
    background: "transparent",
    color: "var(--theme-text)",
    fontWeight: 600,
    minWidth: 0,
    width: "100%",
    boxShadow: "none",
  },
  labelStaticText: {
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    flex: 1,
    minWidth: 0,
  },
  labelText: {
    fontWeight: 600,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    flex: 1,
    minWidth: 0,
    padding: "10px 12px",
    textAlign: "center",
    color: "var(--theme-text)",
  },
  labelTextHover: {
    fontWeight: 600,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    flex: 1,
    minWidth: 0,
    padding: "10px 12px",
    textAlign: "center",
    color: "#7CFFB0",
  },
  pencil: {
    opacity: 0.15,
    fontSize: 14,
    transform: "scaleX(-1)",
    transition: "opacity 160ms ease",
    color: "var(--theme-text)",
    width: 16,
    height: 16,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  },
  pencilActive: {
    opacity: 0.75,
    fontSize: 14,
    transform: "scaleX(-1)",
    transition: "opacity 160ms ease",
    color: "#7CFFB0",
    width: 16,
    height: 16,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  },
  labelEditRow: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    width: "100%",
  },
  labelField: {
    display: "flex",
    alignItems: "center",
    flex: 1,
    borderRadius: 999,
    border: "1px solid transparent",
    background: "transparent",
    boxShadow: "none",
    minWidth: 0,
    boxSizing: "border-box",
  },
  labelInput: {
    padding: "10px 12px",
    borderRadius: 999,
    border: "none",
    background: "transparent",
    color: "#7CFFB0",
    outline: "none",
    width: "100%",
    textAlign: "center",
    boxShadow: "none",
  },
  labelEditPencil: {
    opacity: 0.15,
    fontSize: 14,
    transform: "none",
    color: "#7CFFB0",
    pointerEvents: "none",
  },
  labelEditPencilActive: {
    opacity: 0.75,
    fontSize: 14,
    transform: "none",
    color: "#7CFFB0",
    pointerEvents: "none",
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
    gap: 6,
    borderRadius: 999,
    border: "none",
    background: "transparent",
    overflow: "hidden",
    paddingRight: 8,
    boxShadow: "none",
  },
  valueField: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    border: "none",
    background: "transparent",
    paddingRight: 8,
    boxShadow: "none",
  },
  valueInput: {
    width: 88,
    padding: "10px 12px",
    border: "none",
    outline: "none",
    background: "transparent",
    color: "#7CFFB0",
    fontWeight: 700,
    textAlign: "center",
  },
  unitInline: {
    fontSize: 11,
    opacity: 0.6,
    textAlign: "right",
    paddingRight: 0,
    whiteSpace: "nowrap",
    color: "#7CFFB0",
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

