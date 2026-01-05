"use client";

import { useEffect, useState } from "react";
import { EditableValueEuro } from "../components/EditableValueEuro";
import { useBudget } from "../contexts/BudgetContext";

export function DepensesVariablesTab() {
  const [courses, setCourses] = useState(450);
  const [carburant, setCarburant] = useState(120);
  const [entretienVoiture, setEntretienVoiture] = useState(70);
  const [sante, setSante] = useState(150);
  const [autres, setAutres] = useState(100);
  const { updateTotal } = useBudget();

  const editableWrapperStyle: React.CSSProperties = {
    backgroundColor: "color-mix(in srgb, var(--theme-bgCard) 82%, white)",
    border: "1px solid color-mix(in srgb, var(--theme-border) 75%, white)",
  };

  const getDepenseHint = (value: string | number) => {
    const numValue = Number(value);
    if (numValue === 0) return "Aucune depense definie";
    if (numValue < 100) return "Depense faible";
    if (numValue < 300) return "Depense moderee";
    return "Depense elevee";
  };

  const handleSave =
    (setter: (value: number) => void) => async (newValue: string) => {
      const numValue = Number(newValue);
      setter(Number.isFinite(numValue) ? numValue : 0);
      await new Promise((resolve) => setTimeout(resolve, 200));
    };

  useEffect(() => {
    const total =
      courses +
      carburant +
      entretienVoiture +
      sante +
      autres;
    updateTotal("depensesVariables", total);
  }, [courses, carburant, entretienVoiture, sante, autres, updateTotal]);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Depenses variables</h2>
      <p
        className="mt-2"
        style={{ color: "var(--theme-textSecondary)" }}
      >
        Quotidien, voiture et autres depenses variables.
      </p>

      <div className="mt-6 space-y-8">
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Quotidien</h3>
          <div className="grid grid-cols-4 gap-4">
            <div className="rounded-xl p-2" style={editableWrapperStyle}>
              <EditableValueEuro
                label="Courses"
                value={courses}
                onSave={handleSave(setCourses)}
                hintText={getDepenseHint}
              />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Voitures</h3>
          <div className="grid grid-cols-4 gap-4">
            <div className="rounded-xl p-2" style={editableWrapperStyle}>
              <EditableValueEuro
                label="Carburant"
                value={carburant}
                onSave={handleSave(setCarburant)}
                hintText={getDepenseHint}
              />
            </div>
            <div className="rounded-xl p-2" style={editableWrapperStyle}>
              <EditableValueEuro
                label="Entretien voiture"
                value={entretienVoiture}
                onSave={handleSave(setEntretienVoiture)}
                hintText={getDepenseHint}
              />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Autres</h3>
          <div className="grid grid-cols-4 gap-4">
            <div className="rounded-xl p-2" style={editableWrapperStyle}>
              <EditableValueEuro
                label="Sante"
                value={sante}
                onSave={handleSave(setSante)}
                hintText={getDepenseHint}
              />
            </div>
            <div className="rounded-xl p-2" style={editableWrapperStyle}>
              <EditableValueEuro
                label="Autres"
                value={autres}
                onSave={handleSave(setAutres)}
                hintText={getDepenseHint}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
