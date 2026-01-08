"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";

type SliderRowProps = {
  label: string;
  labelEditable?: boolean;
  onLabelChange?: (next: string) => void;
  labelPlaceholder?: string;
  value: number;
  min?: number;
  max: number;
  step?: number;
  unit?: string;
  tone?: "positive" | "negative" | "neutral";
  amountLabel?: string;
  showMinMax?: boolean;
  onValueChange: (next: number) => void;
  actions?: ReactNode;
  layout?: "default" | "withActions";
};

const PencilIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M13.6 3.6l2.8 2.8m-1.2-4l1.2 1.2a1.7 1.7 0 010 2.4l-8.9 8.9-3.6.6.6-3.6 8.9-8.9a1.7 1.7 0 012.4 0z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function SliderRow({
  label,
  labelEditable = false,
  onLabelChange,
  labelPlaceholder = "Nom (cliquez pour modifier)",
  value,
  min = 0,
  max,
  step = 10,
  unit = "€/mois",
  tone = "neutral",
  amountLabel = "Montant",
  showMinMax = true,
  onValueChange,
  actions,
  layout = "default",
}: SliderRowProps) {
  const safeValue = useMemo(() => {
    const numeric = Number.isFinite(value) ? value : min;
    return clamp(numeric, min, max);
  }, [value, min, max]);

  const [inputValue, setInputValue] = useState<string>(String(safeValue));
  const [isEditing, setIsEditing] = useState(false);
  const [isSliding, setIsSliding] = useState(false);

  useEffect(() => {
    if (!isEditing) {
      setInputValue(String(safeValue));
    }
  }, [safeValue, isEditing]);

  const percent = max > min ? Math.round(((safeValue - min) / (max - min)) * 100) : 0;

  const toneColor =
    tone === "positive" ? "#16a34a" : tone === "negative" ? "#ef4444" : "var(--theme-text)";

  const commit = (raw: string | number) => {
    const next = typeof raw === "number" ? raw : Number(raw);
    if (!Number.isFinite(next)) {
      setInputValue(String(safeValue));
      setIsEditing(false);
      return;
    }
    const clamped = clamp(next, min, max);
    setInputValue(String(clamped));
    setIsEditing(false);
    onValueChange(clamped);
  };

  const handleBlur = () => {
    if (inputValue.trim() === "") {
      setInputValue(String(safeValue));
      setIsEditing(false);
      return;
    }
    commit(inputValue);
  };

  const containerClass =
    layout === "withActions"
      ? "grid gap-3 rounded-xl border px-3 py-3 md:grid-cols-[minmax(160px,220px)_1fr_auto_auto] md:items-center"
      : "grid gap-3 rounded-xl border px-3 py-3 md:grid-cols-[minmax(140px,220px)_1fr_auto] md:items-center";

  return (
    <div className={containerClass} style={{ borderColor: "var(--theme-border)" }}>
      {labelEditable ? (
        <div className="group relative min-w-0">
          <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-sm text-[var(--theme-textMuted)] opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100">
            <PencilIcon />
          </span>
          <input
            type="text"
            value={label}
            onChange={(e) => onLabelChange?.(e.target.value)}
            className="w-full min-w-0 rounded-full border px-3 py-1 pl-7 text-sm font-semibold outline-none transition"
            style={{
              borderColor: "var(--theme-border)",
              backgroundColor: "color-mix(in srgb, var(--theme-bgCard) 70%, transparent)",
              color: "var(--theme-text)",
            }}
            placeholder={labelPlaceholder}
            aria-label="Modifier le titre"
            title="Cliquer pour renommer"
          />
        </div>
      ) : (
        <span
          className="min-w-0 text-sm font-semibold"
          style={{
            color: "var(--theme-text)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
          title={label}
        >
          {label}
        </span>
      )}

      <div className="space-y-1">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={safeValue}
          onChange={(e) => commit(Number(e.target.value))}
          onPointerDown={() => setIsSliding(true)}
          onPointerUp={() => setIsSliding(false)}
          className="budget-slider flex-1"
          style={{ ["--slider-progress" as any]: `${percent}%` }}
          aria-label={`Ajuster ${label}`}
        />
        {showMinMax && (
          <div className="flex items-center justify-between text-[11px]" style={{ color: "var(--theme-textMuted)" }}>
            <span>{min.toLocaleString("fr-FR")}</span>
            <span>{max.toLocaleString("fr-FR")}</span>
          </div>
        )}
      </div>

      <div className="flex flex-col items-end gap-1">
        <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--theme-textMuted)" }}>
          {amountLabel}
        </span>
        <div className="flex items-center justify-end gap-2">
          <input
            type="number"
            min={min}
            max={max}
            step={step}
            value={inputValue}
            onFocus={() => setIsEditing(true)}
            onChange={(e) => setInputValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                if (inputValue.trim() === "") {
                  setInputValue(String(safeValue));
                  setIsEditing(false);
                } else {
                  commit(inputValue);
                }
              }
            }}
            className="w-28 rounded-full border px-3 py-1 text-sm font-semibold text-right outline-none transition"
            style={{
              borderColor: "var(--theme-border)",
              backgroundColor: "color-mix(in srgb, var(--theme-bgCard) 70%, transparent)",
              color: toneColor,
              boxShadow: isSliding ? `0 0 0 2px color-mix(in srgb, ${toneColor} 30%, transparent)` : "none",
            }}
            aria-label={`Valeur ${label}`}
          />
          <span
            className="rounded-full border px-2 py-1 text-xs font-semibold uppercase tracking-wide"
            style={{
              borderColor: "var(--theme-border)",
              color: toneColor,
              backgroundColor: "color-mix(in srgb, var(--theme-bgCard) 70%, transparent)",
              opacity: 0.85,
            }}
            aria-hidden="true"
          >
            {unit}
          </span>
        </div>
      </div>

      {actions ? <div className="flex items-center justify-end">{actions}</div> : null}
    </div>
  );
}
