"use client";

import { useMemo, useState } from "react";
import { useBudget } from "../contexts/BudgetContext";

type Slice = {
  label: string;
  value: number;
  color: string;
  percent?: number;
  start?: number;
  end?: number;
  width?: number;
  midAngle?: number;
};

const formatMontant = (
  value: number,
  sign: "positive" | "negative" | "none" = "none"
) => {
  const formatted = `${value.toLocaleString("fr-FR")} \u20ac`;
  if (sign === "positive") return `+${formatted}`;
  if (sign === "negative") return `-${formatted}`;
  return formatted;
};

export function BilanTab() {
  const { totals } = useBudget();

  const slicesRaw = useMemo<Slice[]>(() => {
    const greenPalette = ["#15803d", "#16a34a", "#22c55e", "#4ade80", "#86efac", "#a7f3d0"] as const;
    const colorForIndex = (idx: number): string => greenPalette[idx % greenPalette.length] ?? greenPalette[0];

    const personSlices =
      totals.revenusParPersonnes && totals.revenusParPersonnes.length
        ? totals.revenusParPersonnes.map((p, idx) => ({
            label: p.name || `Personne ${idx + 1}`,
            value: Math.max(0, p.montant),
            color: colorForIndex(idx),
          }))
        : [{ label: "Revenus (personnes)", value: Math.max(0, totals.revenus), color: colorForIndex(0) }];

    const slices: Slice[] = [
      ...personSlices,
      {
        label: "Appartements",
        value: Math.abs(totals.appartements),
        color: totals.appartements >= 0 ? "#15803d" : "#b91c1c",
      },
      { label: "Depenses fixes", value: Math.max(0, totals.depensesFixes), color: "#ef4444" },
      { label: "Depenses variables", value: Math.max(0, totals.depensesVariables), color: "#f87171" },
    ].filter((s) => s.value > 0);

    return slices;
  }, [totals]);

  const totalSlices = slicesRaw.reduce((sum, s) => sum + s.value, 0);

  const pieGlobal = useMemo(() => {
    if (totalSlices === 0) return { total: 0, slices: [] as Slice[], gradient: "" };
    let cursor = 0;
    const slices: Slice[] = slicesRaw.map((s) => {
      const ratio = s.value / totalSlices;
      const start = cursor;
      const end = cursor + ratio * 360;
      cursor = end;
      return { ...s, percent: Math.round(ratio * 100), start, end, midAngle: (start + end) / 2 };
    });
    const gradient = slices.map((s) => `${s.color} ${s.start}deg ${s.end}deg`).join(", ");
    return { total: totalSlices, slices, gradient };
  }, [slicesRaw, totalSlices]);

  const personSlicesMini = useMemo<Slice[]>(() => {
    const greenPalette = ["#15803d", "#16a34a", "#22c55e", "#4ade80", "#86efac", "#a7f3d0"] as const;
    const colorForIndex = (idx: number): string => greenPalette[idx % greenPalette.length] ?? greenPalette[0];

    return totals.revenusParPersonnes && totals.revenusParPersonnes.length
      ? totals.revenusParPersonnes.map((p, idx) => ({
          label: p.name || `Personne ${idx + 1}`,
          value: Math.max(0, p.montant),
          color: colorForIndex(idx),
        }))
      : [{ label: "Revenus (personnes)", value: Math.max(0, totals.revenus), color: colorForIndex(0) }];
  }, [totals]);

  const depensesFixesPos = Math.max(0, totals.depensesFixes);
  const depensesVariablesPos = Math.max(0, totals.depensesVariables);
  const appartPos = Math.max(0, totals.appartements);
  const appartNeg = Math.max(0, -totals.appartements);
  const revenusPos = Math.max(0, totals.revenus);

  const totalDepenses = depensesFixesPos + depensesVariablesPos + appartNeg;
  const totalRevenus = revenusPos + appartPos;
  const totalGlobal = Math.max(totalDepenses + totalRevenus, 1);
  const totalMix = totalGlobal;

  const slides = useMemo(
    () => [
      {
        title: "Camembert detaille",
        content: (
          <div className="flex items-center justify-center">
            <div
              className="h-40 w-40 sm:h-48 sm:w-48 rounded-full border"
              style={{
                borderColor: "var(--theme-border)",
                background:
                  pieGlobal.total === 0 ? "var(--theme-border)" : `conic-gradient(${pieGlobal.gradient})`,
              }}
            />
          </div>
        ),
      },
      {
        title: "Radial bars",
        content: (
          <div className="relative h-44 w-44 mx-auto">
            <svg viewBox="0 0 200 200" className="h-full w-full">
              {slicesRaw.slice(0, 6).map((s, idx) => {
                const radius = 80 - idx * 10;
                const circumference = 2 * Math.PI * radius;
                const dash = (s.value / Math.max(totalSlices, 1)) * circumference;
                return (
                  <circle
                    key={s.label}
                    cx="100"
                    cy="100"
                    r={radius}
                    fill="transparent"
                    stroke={s.color}
                    strokeWidth="8"
                    strokeDasharray={`${dash} ${circumference}`}
                    strokeDashoffset={-0.25 * circumference}
                    strokeLinecap="round"
                    opacity={0.85}
                  />
                );
              })}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-xs text-center px-2">
              Proportions par anneaux
            </div>
          </div>
        ),
      },
      {
        title: "Small multiples (donuts par personne)",
        content: (
          <div className="flex flex-wrap gap-3">
            {personSlicesMini.map((p) => (
              <div key={p.label} className="flex flex-col items-center gap-1">
                <div
                  className="h-16 w-16 rounded-full"
                  style={{
                    background: `conic-gradient(${p.color} ${(p.value / Math.max(totalSlices, 1)) * 360}deg, var(--theme-border) 0)`,
                    border: "1px solid var(--theme-border)",
                  }}
                />
                <span className="text-[11px]" style={{ color: "var(--theme-textSecondary)" }}>
                  {p.label}
                </span>
              </div>
            ))}
          </div>
        ),
      },
      {
        title: "Bandes empilees",
        content: (
          <div className="space-y-1">
            <div className="text-[11px]" style={{ color: "var(--theme-textSecondary)" }}>
              Vue en deux lignes (positif / negatif)
            </div>
            <div className="space-y-1">
              <div className="h-3 rounded-full overflow-hidden flex bg-[var(--theme-border)]/30">
                <div className="h-full bg-emerald-500" style={{ width: `${(revenusPos / totalMix) * 100}%` }} />
                <div className="h-full bg-emerald-600" style={{ width: `${(appartPos / totalMix) * 100}%` }} />
              </div>
              <div className="h-3 rounded-full overflow-hidden flex bg-[var(--theme-border)]/30">
                <div className="h-full bg-rose-500" style={{ width: `${(depensesFixesPos / totalMix) * 100}%` }} />
                <div className="h-full bg-rose-400" style={{ width: `${(depensesVariablesPos / totalMix) * 100}%` }} />
                <div className="h-full bg-amber-500" style={{ width: `${(appartNeg / totalMix) * 100}%` }} />
              </div>
            </div>
            <div className="flex gap-2 text-[11px] flex-wrap">
              <span className="text-emerald-700">Revenus</span>
              <span className="text-emerald-600">Appart (+)</span>
              <span className="text-rose-600">Depenses fixes</span>
              <span className="text-rose-500">Depenses variables</span>
              <span className="text-amber-600">Appart (-)</span>
            </div>
          </div>
        ),
      },
    ],
    [pieGlobal, slicesRaw, totalSlices, personSlicesMini, revenusPos, appartPos, depensesFixesPos, depensesVariablesPos, appartNeg, totalMix]
  );

  const [activeSlide, setActiveSlide] = useState(0);
  const slide = slides[activeSlide] ?? slides[0];

  const legendSlices = pieGlobal.slices;
  const signForSlice = (s: Slice): "positive" | "negative" | "none" => {
    if (s.label.startsWith("Depenses")) return "negative";
    if (s.label === "Appartements") return totals.appartements < 0 ? "negative" : "positive";
    return "positive";
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Revenus par personnes et depenses detaillees</h2>

      <div
        className="rounded-2xl border p-4 space-y-6"
        style={{ borderColor: "var(--theme-border)", backgroundColor: "var(--theme-bgCard)" }}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-semibold">Repartition des Depenses/Revenus (treemap)</span>
          </div>
          <div
            className="relative w-full h-40 rounded-lg overflow-hidden border"
            style={{ borderColor: "var(--theme-border)" }}
          >
            <div className="absolute inset-0 flex flex-wrap">
              {slicesRaw.map((s) => (
                <div
                  key={s.label}
                  className="flex items-center justify-center text-[11px] font-semibold"
                  style={{
                    flexBasis: `${Math.max((s.value / Math.max(totalSlices, 1)) * 100, 8)}%`,
                    minWidth: "60px",
                    minHeight: "40px",
                    backgroundColor: s.color,
                    color: "#0b0b0b",
                    opacity: 0.9,
                    border: "1px solid rgba(0,0,0,0.08)",
                  }}
                >
                  {s.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <span className="font-semibold">Legende</span>
            <div className="space-y-1 text-sm">
              {legendSlices.map((s) => (
                <div key={s.label} className="flex items-center gap-2">
                  <span className="inline-block h-3 w-3 rounded-sm" style={{ backgroundColor: s.color }} />
                  <span className="w-48" style={{ color: "var(--theme-textSecondary)" }}>
                    {s.label}
                  </span>
                  <span className="font-medium">
                    {formatMontant(s.value, signForSlice(s))} ({s.percent}%)
                  </span>
                </div>
              ))}
              {legendSlices.length === 0 && (
                <p className="text-xs" style={{ color: "var(--theme-textSecondary)" }}>
                  Ajoute des montants pour voir les diagrammes.
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-semibold">Visualisations (carrousel)</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="px-2 py-1 rounded border text-sm"
                style={{ borderColor: "var(--theme-border)" }}
                onClick={() => setActiveSlide((s) => (s - 1 + slides.length) % slides.length)}
              >
                {"<"}
              </button>
              <span className="text-sm" style={{ color: "var(--theme-textSecondary)" }}>
                {slide.title} ({activeSlide + 1}/{slides.length})
              </span>
              <button
                type="button"
                className="px-2 py-1 rounded border text-sm"
                style={{ borderColor: "var(--theme-border)" }}
                onClick={() => setActiveSlide((s) => (s + 1) % slides.length)}
              >
                {">"}
              </button>
            </div>
          </div>

          <div className="rounded-xl border p-4 min-h-[220px]" style={{ borderColor: "var(--theme-border)" }}>
            {slide.content}
          </div>

          <div className="flex flex-wrap gap-2">
            {slides.map((s, idx) => (
              <button
                key={s.title}
                type="button"
                onClick={() => setActiveSlide(idx)}
                className={`px-3 py-1 rounded-full border text-xs ${idx === activeSlide ? "font-semibold" : ""}`}
                style={{
                  borderColor: "var(--theme-border)",
                  backgroundColor: idx === activeSlide ? "var(--theme-border)" : "transparent",
                }}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
