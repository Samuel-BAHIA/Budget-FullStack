"use client";

import { useDouble } from "../useDouble";
import { DoubleView } from "../DoubleView";

export function RevenusTab() {
  const { value, setValue, result, error, loading, compute } = useDouble();

  return (
    <div>
      <h2 className="text-xl font-semibold">Revenus</h2>
      <p
        className="mt-1 text-sm"
        style={{ color: "var(--theme-textSecondary)" }}
      >
        (Pour l'instant, on garde ton exemple existant ici.)
      </p>

      <div className="mt-6">
        <DoubleView
          value={value}
          onValueChange={setValue}
          onSubmit={compute}
          result={result}
          error={error}
          loading={loading}
        />
      </div>
    </div>
  );
}
