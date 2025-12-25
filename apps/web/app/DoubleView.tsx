"use client";

type Props = {
  value: string;
  onValueChange: (v: string) => void;
  onSubmit: () => void;
  result: number | null;
  error: string | null;
  loading: boolean;
};

export function DoubleView({
  value,
  onValueChange,
  onSubmit,
  result,
  error,
  loading,
}: Props) {
  return (
    <main style={{ padding: 24, maxWidth: 420 }}>
      <h1>Multiplier par 2</h1>

      <input
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        placeholder="Entre un nombre (ex: 12)"
        style={{ width: "100%", padding: 10, marginTop: 12 }}
      />

      <button
        onClick={onSubmit}
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
