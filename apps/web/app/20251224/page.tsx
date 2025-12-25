"use client";

import { useState } from "react";

export default function Home() {
  const [value, setValue] = useState("");
  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function send() {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("http://localhost:3001/double", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Erreur API");

      setResult(data.result);
    } catch (e: any) {
      setError(e?.message ?? "Erreur");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: 24, maxWidth: 420 }}>
      <h1>Multiplier par 2</h1>

      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Entre un nombre (ex: 12)"
        style={{ width: "100%", padding: 10, marginTop: 12 }}
      />

      <button
        onClick={send}
        disabled={loading}
        style={{ width: "100%", padding: 10, marginTop: 12 }}
      >
        {loading ? "Calcul..." : "Envoyer"}
      </button>

      {result !== null && (
        <p style={{ marginTop: 12 }}>
          Résultat : <b>{result}</b>
        </p>
      )}

      {error && (
        <p style={{ marginTop: 12, color: "crimson" }}>
          Erreur : {error}
        </p>
      )}
    </main>
  );
}
