"use client";

import { useCallback, useState } from "react";
import { postDouble } from "./api/double";

const DEFAULT_API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export function useDouble(apiUrl = DEFAULT_API_URL) {
  const [value, setValue] = useState("");
  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const compute = useCallback(async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const { result } = await postDouble(apiUrl, value);
      setResult(result);
    } catch (e: any) {
      setError(e?.message ?? "Erreur");
    } finally {
      setLoading(false);
    }
  }, [apiUrl, value]);

  return { value, setValue, result, error, loading, compute };
}
