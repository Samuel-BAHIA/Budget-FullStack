"use client";

import { useTheme } from "../contexts/ThemeContext";

export function ThemeSelector() {
  const { theme, setTheme, themes } = useTheme();

  return (
    <div className="flex items-center gap-2">
      <label
        className="text-sm"
        style={{ color: "var(--theme-textSecondary)" }}
      >
        Thème:
      </label>
      <select
        value={theme.id}
        onChange={(e) => setTheme(e.target.value as typeof theme.id)}
        className="rounded-lg border px-3 py-1.5 text-sm outline-none transition"
        style={{
          backgroundColor: "var(--theme-bgCard)",
          color: "var(--theme-text)",
          borderColor: "var(--theme-border)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "var(--theme-bgHover)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "var(--theme-bgCard)";
        }}
        onFocus={(e) => {
          e.currentTarget.style.boxShadow = "0 0 0 2px var(--theme-borderLight)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        {themes.map((t) => (
          <option key={t.id} value={t.id} style={{ backgroundColor: "var(--theme-bgCard)", color: "var(--theme-text)" }}>
            {t.name}
          </option>
        ))}
      </select>
    </div>
  );
}

