"use client";

import { useDouble } from "./useDouble";
import { DoubleView } from "./DoubleView";

export default function Page() {
  const { value, setValue, result, error, loading, compute } = useDouble();

  return (
    <DoubleView
      value={value}
      onValueChange={setValue}
      onSubmit={compute}
      result={result}
      error={error}
      loading={loading}
    />
  );
}
