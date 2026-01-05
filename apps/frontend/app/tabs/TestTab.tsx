"use client";

import { useDouble } from "../useDouble";
import { DoubleView } from "../DoubleView";

export function TestTab() {
  const { value, setValue, result, error, loading, compute } = useDouble();

  return (
    <div>
      <h2 className="text-xl font-semibold">Test</h2>
      <p
        className="mt-1 text-sm"
        style={{ color: "var(--theme-textSecondary)" }}
      >
        Calcul du double d&apos;un nombre pour faire des essais rapides.
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
