"use client";

import { useMemo } from "react";
import { useBudget } from "../contexts/BudgetContext";

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

  const data = useMemo(() => {
    const appartNet = totals.appartements;
    const depensesTotales = totals.depensesFixes + totals.depensesVariables;
    const net = totals.revenus - depensesTotales + appartNet;

    return {
      revenus: totals.revenus,
      appartements: appartNet,
      depenses: {
        fixes: totals.depensesFixes,
        variables: totals.depensesVariables,
        total: depensesTotales,
      },
      net,
    };
  }, [totals]);

  const graphMax = Math.max(data.revenus, data.depenses.total, Math.abs(data.appartements), Math.abs(data.net), 1);

  const barStyle = (value: number, color: string) => ({
    width: `${Math.min(100, (value / graphMax) * 100)}%`,
    backgroundColor: color,
  });

  const depensesParts = [
    { label: "Fixes", value: data.depenses.fixes, sign: "negative" as const, color: "rgba(239,68,68,0.45)" },
    { label: "Variables", value: data.depenses.variables, sign: "negative" as const, color: "rgba(239,68,68,0.45)" },
  ];

  const pieData = useMemo(() => {
    const absRevenus = Math.abs(data.revenus);
    const absFixes = Math.abs(data.depenses.fixes);
    const absVariables = Math.abs(data.depenses.variables);
    const absApparts = Math.abs(data.appartements);
    const total = absRevenus + absFixes + absVariables + absApparts;
    if (total === 0) {
      return { total, slices: [], gradient: "" };
    }

    let cursor = 0;
    const makeSlice = (value: number, color: string, label: string) => {
      const angle = (value / total) * 360;
      const start = cursor;
      const end = cursor + angle;
      cursor = end;
      return {
        label,
        value,
        percent: Math.round((value / total) * 100),
        color,
        start,
        end,
      };
    };

    const slices = [
      makeSlice(absRevenus, "#22c55e", "Revenus"), // vert principal
      makeSlice(absFixes, "#ef4444", "Depenses fixes"), // rouge vif
      makeSlice(absVariables, "#f87171", "Depenses variables"), // rouge clair
      makeSlice(
        absApparts,
        data.appartements >= 0 ? "#16a34a" : "#b91c1c", // vert fonce si positif, rouge sombre si negatif
        "Appartements"
      ),
    ];

    const gapDeg = slices.filter((s) => s.value > 0).length > 1 ? 1.5 : 0;
    const gradientParts: string[] = [];

    slices.forEach((s) => {
      if (s.value <= 0) return;
      const endGap = Math.max(s.start, s.end - gapDeg);
      gradientParts.push(`${s.color} ${s.start}deg ${endGap}deg`);
      if (gapDeg > 0) {
        gradientParts.push(`var(--theme-bgCard) ${endGap}deg ${s.end}deg`);
      }
    });

    const gradient = gradientParts.join(", ");

    return { total, slices, gradient };
  }, [data]);

  const pieLabels = useMemo(() => {
    const radius = 70;
    return pieData.slices
      .filter((s) => s.value > 0 && s.percent > 0)
      .map((s) => {
        const angleRad = ((s.start + s.end) / 2) * (Math.PI / 180);
        const x = Math.cos(angleRad) * radius;
        const y = Math.sin(angleRad) * radius;
        return { ...s, x, y };
      });
  }, [pieData]);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Bilan</h2>
      <p
        className="mt-2 text-sm"
        style={{ color: "var(--theme-textSecondary)" }}
      >
        Synthese revenus / depenses avec total global et barres visuelles.
      </p>

      <div
        className="rounded-2xl border p-4 space-y-6"
        style={{
          borderColor: "var(--theme-border)",
          backgroundColor: "var(--theme-bgCard)",
        }}
      >
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold">Revenus</span>
            <span style={{ color: "#22c55e" }}>
              {formatMontant(data.revenus, "positive")}
            </span>
          </div>
          <div className="h-2 rounded-full bg-[var(--theme-border)]/40">
            <div
              className="h-2 rounded-full"
              style={barStyle(data.revenus, "rgba(34,197,94,0.7)")}
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold">Depenses</span>
            <span style={{ color: "#ef4444" }}>
              {formatMontant(data.depenses.total, "negative")}
            </span>
          </div>
          <div className="h-2 rounded-full bg-[var(--theme-border)]/40">
            <div
              className="h-2 rounded-full"
              style={barStyle(data.depenses.total, "rgba(239,68,68,0.65)")}
            />
          </div>
          <div className="space-y-1 text-sm">
            {depensesParts.map((p) => (
              <div key={p.label} className="flex items-center gap-3">
                <span className="w-28" style={{ color: "var(--theme-textSecondary)" }}>
                  {p.label}
                </span>
                <div className="flex-1 h-2 rounded-full bg-[var(--theme-border)]/30">
                  <div
                    className="h-2 rounded-full"
                    style={barStyle(Math.abs(p.value), p.color)}
                  />
                </div>
                <span style={{ color: p.sign === "positive" ? "#22c55e" : "#ef4444" }}>
                  {formatMontant(Math.abs(p.value), p.sign)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold">Appartements</span>
            <span style={{ color: data.appartements >= 0 ? "#22c55e" : "#ef4444" }}>
              {formatMontant(Math.abs(data.appartements), data.appartements >= 0 ? "positive" : "negative")}
            </span>
          </div>
          <div className="h-2 rounded-full bg-[var(--theme-border)]/40">
            <div
              className="h-2 rounded-full"
              style={barStyle(
                Math.abs(data.appartements),
                data.appartements >= 0 ? "rgba(34,197,94,0.65)" : "rgba(239,68,68,0.65)"
              )}
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold">Diagramme global</span>
            <span style={{ color: "var(--theme-textSecondary)" }}>
              Base: {pieData.total.toLocaleString("fr-FR")} €
            </span>
          </div>
          <div className="flex flex-wrap gap-6 items-center">
            <div
              aria-label="Repartition revenus / depenses / appartements"
              className="relative h-48 w-48 rounded-full border"
              style={{
                borderColor: "var(--theme-border)",
                background: pieData.total === 0 ? "var(--theme-border)" : `conic-gradient(${pieData.gradient})`,
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
              {pieData.slices.map((s) => (
                <div key={s.label} className="flex items-center gap-2">
                  <span
                    className="inline-block h-3 w-3 rounded-sm"
                    style={{ backgroundColor: s.color }}
                  />
                  <span className="w-28" style={{ color: "var(--theme-textSecondary)" }}>
                    {s.label}
                  </span>
                  <span className="font-medium">
                    {s.value.toLocaleString("fr-FR")} € ({s.percent}%)
                  </span>
                </div>
              ))}
              {pieData.total === 0 && (
                <p className="text-xs" style={{ color: "var(--theme-textSecondary)" }}>
                  Ajoute des montants pour voir le diagramme.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold">Total global</span>
            <span
              className="text-lg font-semibold"
              style={{ color: data.net >= 0 ? "#22c55e" : "#ef4444" }}
            >
              {formatMontant(Math.abs(data.net), data.net >= 0 ? "positive" : "negative")}
            </span>
          </div>
          <div className="h-2 rounded-full bg-[var(--theme-border)]/40">
            <div
              className="h-2 rounded-full"
              style={barStyle(Math.abs(data.net), data.net >= 0 ? "rgba(34,197,94,0.65)" : "rgba(239,68,68,0.65)")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
