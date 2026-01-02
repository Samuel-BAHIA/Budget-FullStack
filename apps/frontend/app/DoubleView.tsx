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
    <div style={{ backgroundColor: "var(--theme-bg)", color: "var(--theme-text)" }}>
      <div className="mx-auto max-w-md p-6">
        <h1 className="text-3xl font-semibold tracking-tight">Multiplier par 2</h1>

        <div className="mt-6 space-y-3">
          <input
            value={value}
            onChange={(e) => onValueChange(e.target.value)}
            placeholder="Entre un nombre (ex: 12)"
            className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2"
            style={{
              borderColor: "var(--theme-border)",
              backgroundColor: "var(--theme-bgCard)",
              color: "var(--theme-text)",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "var(--theme-borderLight)";
              e.currentTarget.style.boxShadow = "0 0 0 2px var(--theme-borderLight)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "var(--theme-border)";
              e.currentTarget.style.boxShadow = "none";
            }}
          />

          <button
            onClick={onSubmit}
            disabled={loading}
            className="w-full rounded-md px-3 py-2 font-medium disabled:opacity-60 transition"
            style={{
              backgroundColor: "var(--theme-tabActiveBg)",
              color: "var(--theme-tabActiveText)",
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.opacity = "0.9";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = loading ? "0.6" : "1";
            }}
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
    </div>
  );
}
