"use client";

import { useMemo } from "react";
import { useBudget } from "../contexts/BudgetContext";

type Slice = { label: string; value: number; color: string; percent?: number; start?: number; end?: number; width?: number };

const formatMontant = (
  value: number,
  sign: "positive" | "negative" | "none" = "none"
) => {
  const formatted = `${value.toLocaleString("fr-FR")} €`;
  if (sign === "positive") return `+${formatted}`;
  if (sign === "negative") return `-${formatted}`;
  return formatted;
};

export function BilanTab() {
  const { totals } = useBudget();

  const slicesRaw = useMemo<Slice[]>(() => {
    const greenPalette = ["#15803d", "#16a34a", "#22c55e", "#4ade80", "#86efac", "#a7f3d0"];
    const colorForIndex = (idx: number) => greenPalette[idx % greenPalette.length];

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

  const barSlices = totalSlices
    ? slicesRaw.map((s) => ({ ...s, width: (s.value / totalSlices) * 100 }))
    : [];

  const pieGlobal = useMemo(() => {
    if (totalSlices === 0) return { total: 0, slices: [] as Slice[], gradient: "" };
    let cursor = 0;
    const slices: Slice[] = slicesRaw.map((s) => {
      const ratio = s.value / totalSlices;
      const start = cursor;
      const end = cursor + ratio * 360;
      cursor = end;
      return { ...s, percent: Math.round(ratio * 100), start, end };
    });
    const gradient = slices.map((s) => `${s.color} ${s.start}deg ${s.end}deg`).join(", ");
    return { total: totalSlices, slices, gradient };
  }, [slicesRaw, totalSlices]);

  const pieLabels = useMemo(() => {
    const radius = 55; // plus proche du centre pour limiter les chevauchements
    return pieGlobal.slices.map((s) => {
      const angleRad = ((s.start! + s.end!) / 2) * (Math.PI / 180);
      const x = Math.cos(angleRad) * radius;
      const y = Math.sin(angleRad) * radius;
      return { ...s, x, y };
    });
  }, [pieGlobal]);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Revenus par personnes et dépenses détaillées</h2>

      <div
        className="rounded-2xl border p-4 space-y-6"
        style={{ borderColor: "var(--theme-border)", backgroundColor: "var(--theme-bgCard)" }}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-semibold">Vue globale (tous les montants = 100%)</span>
          </div>
          <div className="h-4 rounded-full bg-[var(--theme-border)]/30 overflow-hidden flex">
            {barSlices.map((s) => (
              <div
                key={s.label}
                className="h-full"
                style={{ width: `${s.width}%`, backgroundColor: s.color }}
                title={`${s.label} ${formatMontant(s.value, s.label.startsWith("Depenses") ? "negative" : "positive")}`}
              />
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold">Répartition détaillée</span>
            <span style={{ color: "var(--theme-textSecondary)" }}>
              Base: {pieGlobal.total.toLocaleString("fr-FR")} €
            </span>
          </div>
          <div className="flex flex-wrap gap-6 items-center">
            <div
              className="relative h-40 w-40 sm:h-48 sm:w-48 rounded-full border"
              style={{
                borderColor: "var(--theme-border)",
                background:
                  pieGlobal.total === 0 ? "var(--theme-border)" : `conic-gradient(${pieGlobal.gradient})`,
              }}
            >
              {pieLabels.map((s) => (
                <span
                  key={s.label}
                  className="absolute text-[11px] font-semibold px-1.5 py-0.5 rounded-md shadow-sm"
                  style={{
                    left: "50%",
                    top: "50%",
                    transform: `translate(${s.x}px, ${s.y}px) translate(-50%, -50%)`,
                    backgroundColor: "rgba(0,0,0,0.55)",
                    color: "white",
                    border: "1px solid rgba(255,255,255,0.2)",
                    minWidth: "32px",
                    textAlign: "center",
                  }}
                >
                  {s.percent}%
                </span>
              ))}
            </div>
            <div className="space-y-2 text-sm">
              {pieGlobal.slices.map((s) => (
                <div key={s.label} className="flex items-center gap-2">
                  <span className="inline-block h-3 w-3 rounded-sm" style={{ backgroundColor: s.color }} />
                  <span className="w-40" style={{ color: "var(--theme-textSecondary)" }}>
                    {s.label}
                  </span>
                  <span className="font-medium">
                    {s.value.toLocaleString("fr-FR")} € ({s.percent}%)
                  </span>
                </div>
              ))}
              {pieGlobal.total === 0 && (
                <p className="text-xs" style={{ color: "var(--theme-textSecondary)" }}>
                  Ajoute des montants pour voir le diagramme.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
