"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type ThemeId = "neutral" | "blue" | "green" | "purple" | "orange" | "red" | "pink";

export interface Theme {
  id: ThemeId;
  name: string;
  colors: {
    // Backgrounds
    bg: string; // Background principal
    bgCard: string; // Background de la carte
    bgHover: string; // Background au survol
    
    // Text
    text: string; // Texte principal
    textSecondary: string; // Texte secondaire
    textMuted: string; // Texte atténué
    
    // Borders
    border: string; // Bordure principale
    borderLight: string; // Bordure légère
    
    // Tab active
    tabActiveBg: string; // Background tab active
    tabActiveText: string; // Texte tab active
    tabInactiveText: string; // Texte tab inactive
    tabHoverBg: string; // Background tab au survol
  };
}

const themes: Theme[] = [
  {
    id: "neutral",
    name: "Neutre",
    colors: {
      bg: "#0a0a0a",
      bgCard: "rgba(23, 23, 23, 0.4)",
      bgHover: "rgba(38, 38, 38, 0.6)",
      text: "#fafafa",
      textSecondary: "#a3a3a3",
      textMuted: "#737373",
      border: "#262626",
      borderLight: "#404040",
      tabActiveBg: "#e5e5e5",
      tabActiveText: "#171717",
      tabInactiveText: "#d4d4d4",
      tabHoverBg: "rgba(38, 38, 38, 0.6)",
    },
  },
  {
    id: "blue",
    name: "Bleu",
    colors: {
      bg: "#0a1628",
      bgCard: "rgba(30, 58, 138, 0.4)",
      bgHover: "rgba(37, 99, 235, 0.6)",
      text: "#dbeafe",
      textSecondary: "#93c5fd",
      textMuted: "#60a5fa",
      border: "#1e3a8a",
      borderLight: "#3b82f6",
      tabActiveBg: "#3b82f6",
      tabActiveText: "#0a1628",
      tabInactiveText: "#93c5fd",
      tabHoverBg: "rgba(37, 99, 235, 0.6)",
    },
  },
  {
    id: "green",
    name: "Vert",
    colors: {
      bg: "#0a1f0a",
      bgCard: "rgba(20, 83, 45, 0.4)",
      bgHover: "rgba(34, 197, 94, 0.6)",
      text: "#dcfce7",
      textSecondary: "#86efac",
      textMuted: "#4ade80",
      border: "#166534",
      borderLight: "#22c55e",
      tabActiveBg: "#22c55e",
      tabActiveText: "#0a1f0a",
      tabInactiveText: "#86efac",
      tabHoverBg: "rgba(34, 197, 94, 0.6)",
    },
  },
  {
    id: "purple",
    name: "Violet",
    colors: {
      bg: "#1a0a2e",
      bgCard: "rgba(88, 28, 135, 0.4)",
      bgHover: "rgba(168, 85, 247, 0.6)",
      text: "#f3e8ff",
      textSecondary: "#c4b5fd",
      textMuted: "#a78bfa",
      border: "#581c87",
      borderLight: "#a855f7",
      tabActiveBg: "#a855f7",
      tabActiveText: "#1a0a2e",
      tabInactiveText: "#c4b5fd",
      tabHoverBg: "rgba(168, 85, 247, 0.6)",
    },
  },
  {
    id: "orange",
    name: "Orange",
    colors: {
      bg: "#2a1a0a",
      bgCard: "rgba(154, 52, 18, 0.4)",
      bgHover: "rgba(249, 115, 22, 0.6)",
      text: "#fff7ed",
      textSecondary: "#fed7aa",
      textMuted: "#fdba74",
      border: "#9a3412",
      borderLight: "#f97316",
      tabActiveBg: "#f97316",
      tabActiveText: "#2a1a0a",
      tabInactiveText: "#fed7aa",
      tabHoverBg: "rgba(249, 115, 22, 0.6)",
    },
  },
  {
    id: "red",
    name: "Rouge",
    colors: {
      bg: "#2a0a0a",
      bgCard: "rgba(127, 29, 29, 0.4)",
      bgHover: "rgba(239, 68, 68, 0.6)",
      text: "#fef2f2",
      textSecondary: "#fca5a5",
      textMuted: "#f87171",
      border: "#7f1d1d",
      borderLight: "#ef4444",
      tabActiveBg: "#ef4444",
      tabActiveText: "#2a0a0a",
      tabInactiveText: "#fca5a5",
      tabHoverBg: "rgba(239, 68, 68, 0.6)",
    },
  },
  {
    id: "pink",
    name: "Rose",
    colors: {
      bg: "#2a0a1a",
      bgCard: "rgba(157, 23, 77, 0.4)",
      bgHover: "rgba(236, 72, 153, 0.6)",
      text: "#fdf2f8",
      textSecondary: "#f9a8d4",
      textMuted: "#f472b6",
      border: "#9d174d",
      borderLight: "#ec4899",
      tabActiveBg: "#ec4899",
      tabActiveText: "#2a0a1a",
      tabInactiveText: "#f9a8d4",
      tabHoverBg: "rgba(236, 72, 153, 0.6)",
    },
  },
];

interface ThemeContextType {
  theme: Theme;
  setTheme: (themeId: ThemeId) => void;
  themes: Theme[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeId] = useState<ThemeId>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme");
      if (saved && themes.find((t) => t.id === saved)) {
        return saved as ThemeId;
      }
    }
    return "neutral";
  });

  const theme = themes.find((t) => t.id === themeId) || themes[0];

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("theme", themeId);
      // Appliquer les variables CSS
      const root = document.documentElement;
      Object.entries(theme.colors).forEach(([key, value]) => {
        root.style.setProperty(`--theme-${key}`, value);
      });
    }
  }, [themeId, theme]);

  const setTheme = (id: ThemeId) => {
    setThemeId(id);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

