"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface PersonRevenue {
  name: string;
  montant: number;
}

interface BudgetData {
  revenus: number;
  depensesFixes: number;
  depensesVariables: number;
  appartements: number;
  revenusParPersonnes: PersonRevenue[];
}

interface BudgetContextType {
  totals: BudgetData;
  updateTotal: (category: "revenus" | "depensesFixes" | "depensesVariables" | "appartements", value: number) => void;
  updateRevenusParPersonnes: (revenus: PersonRevenue[]) => void;
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export function BudgetProvider({ children }: { children: ReactNode }) {
  const [totals, setTotals] = useState<BudgetData>({
    revenus: 0,
    depensesFixes: 0,
    depensesVariables: 0,
    appartements: 0,
    revenusParPersonnes: [],
  });

  const updateTotal = (category: keyof BudgetData, value: number) => {
    setTotals((prev) => {
      if (prev[category] === value) return prev;
      return {
        ...prev,
        [category]: value,
      };
    });
  };

  const updateRevenusParPersonnes = (revenus: PersonRevenue[]) => {
    setTotals((prev) => {
      const sameLength = prev.revenusParPersonnes.length === revenus.length;
      const sameContent =
        sameLength &&
        prev.revenusParPersonnes.every((p, idx) => p.name === revenus[idx].name && p.montant === revenus[idx].montant);
      if (sameContent) return prev;
      return { ...prev, revenusParPersonnes: revenus };
    });
  };

  return (
    <BudgetContext.Provider value={{ totals, updateTotal, updateRevenusParPersonnes }}>
      {children}
    </BudgetContext.Provider>
  );
}

export function useBudget() {
  const context = useContext(BudgetContext);
  if (context === undefined) {
    throw new Error("useBudget must be used within a BudgetProvider");
  }
  return context;
}
