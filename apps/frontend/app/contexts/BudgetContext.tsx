"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface BudgetData {
  revenus: number;
  depensesFixes: number;
  depensesVariables: number;
  appartements: number;
}

interface BudgetContextType {
  totals: BudgetData;
  updateTotal: (category: keyof BudgetData, value: number) => void;
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export function BudgetProvider({ children }: { children: ReactNode }) {
  const [totals, setTotals] = useState<BudgetData>({
    revenus: 0,
    depensesFixes: 0,
    depensesVariables: 0,
    appartements: 0,
  });

  const updateTotal = (category: keyof BudgetData, value: number) => {
    setTotals((prev) => ({
      ...prev,
      [category]: value,
    }));
  };

  return (
    <BudgetContext.Provider value={{ totals, updateTotal }}>
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

