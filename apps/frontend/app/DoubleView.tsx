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
    <main className="min-h-screen bg-neutral-950 text-neutral-50">
      <div className="mx-auto max-w-md p-6">
        <h1 className="text-3xl font-semibold tracking-tight">Multiplier par 2</h1>

        <div className="mt-6 space-y-3">
          <input
            value={value}
            onChange={(e) => onValueChange(e.target.value)}
            placeholder="Entre un nombre (ex: 12)"
            className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 outline-none focus:ring-2 focus:ring-neutral-500"
          />

          <button
            onClick={onSubmit}
            disabled={loading}
            className="w-full rounded-md bg-neutral-200 px-3 py-2 font-medium text-neutral-900 disabled:opacity-60"
          >
            {loading ? "Calcul..." : "Envoyer"}
          </button>

          {result !== null && (
            <p className="text-lg">
              Résultat : <span className="font-semibold">{result}</span>
            </p>
          )}

          {error && (
            <p className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-red-200">
              Erreur : {error}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
