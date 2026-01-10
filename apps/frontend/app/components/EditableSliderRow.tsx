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
  background: "transparent",
  boxShadow: "none",
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
  const valueInputRef = useRef<HTMLInputElement | null>(null);

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
      const clamped = clamp(parsed, min, max);
      setCurrentValue(clamped);
      onValueChange?.(clamped);
    }
  };

  const handleValueInputBlur = () => {
    if (!Number.isFinite(valueNumber)) {
      setRawInput(String(currentValue));
      return;
    }
    const clamped = clamp(valueNumber, min, max);
    setCurrentValue(clamped);
    setRawInput(String(clamped));
    onValueChange?.(clamped);
  };

  const startEditLabel = () => {
    setIsEditingLabel(true);
    setTimeout(() => labelInputRef.current?.focus(), 0);
  };

  const commitLabel = (next: string) => {
    const cleaned = next.trim() || "Sans titre";
    setCurrentLabel(cleaned);
    setIsEditingLabel(false);
    setIsLabelFocused(false);
    setIsLabelHovered(false);
    onLabelChange?.(cleaned);
  };

  const ratio = max > min ? (currentValue - min) / (max - min) : 0;
  const infoText = ratio < 0.25 ? "Niveau faible" : ratio < 0.6 ? "Niveau modere" : "Niveau eleve";
  const infoColor = ratio < 0.25 ? "#93c5fd" : ratio < 0.6 ? "#a5b4fc" : "#fbbf24";

  return (
    <div style={styles.row}>
      <div style={styles.left}>
        <div style={styles.titleRow}>
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
                  onBlur={() => {
                    setIsLabelFocused(false);
                    setIsLabelHovered(false);
                    commitLabel(currentLabel);
                  }}
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
        <div
          style={styles.valueGroup}
          onMouseEnter={() => setIsValueHovered(true)}
          onMouseLeave={() => setIsValueHovered(false)}
        >
          <button
            type="button"
            onClick={() => valueInputRef.current?.focus()}
            style={
              isValueFocused
                ? styles.valueEditBtnConfirm
                : isValueHovered
                  ? styles.valueEditBtnActive
                  : styles.valueEditBtn
            }
            aria-label="Modifier la valeur"
          >
            {isValueFocused ? <CheckIcon /> : <PencilIcon />}
          </button>
          <div
            style={
              isValueFocused
                ? { ...styles.valueField, boxShadow: "inset 0 2px 6px rgba(0,0,0,0.55), inset 0 -1px 2px rgba(255,255,255,0.08)" }
                : styles.valueField
            }
          >
            <input
              ref={valueInputRef}
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
          </div>
        </div>
        </div>
      </div>

      <div style={styles.middle}>
        <div style={styles.minMaxRow}>
          <span>{min === 0 ? "" : min}</span>
          <div style={{ ...styles.infoHint, color: infoColor }}>{infoText}</div>
          <span>{max}</span>
        </div>
        <div style={styles.sliderRow}>
          <span style={styles.unitInline}>{unitLabel}</span>
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
        </div>
      </div>

      <div style={styles.right}>
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
    alignItems: "stretch",
    padding: "0 16px",
    borderRadius: 18,
    background: "var(--theme-bgCard)",
    border: "none",
    boxShadow: "0 0 0 1px color-mix(in srgb, var(--theme-border) 70%, transparent), 0 10px 24px rgba(0,0,0,0.35)",
  },
  left: {
    flex: "0 1 clamp(240px, 26vw, 360px)",
    minWidth: 220,
    maxWidth: 360,
    display: "flex",
    flexDirection: "column",
    gap: 6,
    overflow: "hidden",
    alignSelf: "stretch",
  },
  titleRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    width: "100%",
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
    flex: 1,
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
    flex: 1,
    boxShadow: "none",
  },
  labelStaticText: {
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    flex: 1,
    minWidth: 0,
    textAlign: "left",
  },
  labelText: {
    fontWeight: 600,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    flex: 1,
    minWidth: 0,
    padding: "10px 12px",
    textAlign: "left",
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
    textAlign: "left",
    color: "#FDE047",
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
    color: "#FDE047",
    width: 16,
    height: 16,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  },
  valueEditBtn: {
    opacity: 0.15,
    fontSize: 14,
    transform: "scaleX(-1)",
    transition: "opacity 160ms ease",
    color: "#7CFFB0",
    width: 16,
    height: 16,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    border: "none",
    background: "transparent",
    padding: 0,
    cursor: "text",
  },
  valueEditBtnActive: {
    opacity: 0.75,
    fontSize: 14,
    transform: "scaleX(-1)",
    transition: "opacity 160ms ease",
    color: "#FDE047",
    width: 16,
    height: 16,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    border: "none",
    background: "transparent",
    padding: 0,
    cursor: "text",
  },
  valueEditBtnConfirm: {
    opacity: 0.9,
    fontSize: 14,
    transform: "none",
    transition: "opacity 160ms ease",
    color: "#7CFFB0",
    width: 16,
    height: 16,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    border: "none",
    background: "transparent",
    padding: 0,
    cursor: "text",
  },
  labelEditRow: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    flex: 1,
    minWidth: 0,
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
    textAlign: "left",
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
  middle: { flex: 1, display: "flex", flexDirection: "column", gap: 0, alignSelf: "stretch" },
  slider: { width: "100%" },
  minMaxRow: { display: "grid", gridTemplateColumns: "auto 1fr auto", alignItems: "center", fontSize: 11, opacity: 0.6 },
  sliderRow: { display: "grid", gridTemplateColumns: "auto 1fr", alignItems: "center", columnGap: 8 },
  right: { display: "flex", alignItems: "center", gap: 10, alignSelf: "stretch" },
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
    flexShrink: 0,
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
    color: "#FDE047",
    fontWeight: 700,
    textAlign: "center",
  },
  unitInline: {
    fontSize: 11,
    opacity: 0.6,
    textAlign: "right",
    paddingRight: 0,
    whiteSpace: "nowrap",
    color: "var(--theme-textSecondary)",
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

