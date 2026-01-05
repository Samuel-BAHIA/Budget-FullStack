"use client";

import { useEffect, useState } from "react";
import { EditableValueEuro } from "../components/EditableValueEuro";
import { useBudget } from "../contexts/BudgetContext";

export function DepensesFixesTab() {
  const [telephone, setTelephone] = useState(80);
  const [netflix, setNetflix] = useState(20);
  const [creditVoiture, setCreditVoiture] = useState(300);
  const [assurancesVoiture, setAssurancesVoiture] = useState(170);
  const { updateTotal } = useBudget();

  const editableWrapperStyle: React.CSSProperties = {
    backgroundColor: "color-mix(in srgb, var(--theme-bgCard) 82%, white)",
    border: "1px solid color-mix(in srgb, var(--theme-border) 75%, white)",
  };

  const getDepenseHint = (value: string | number) => {
    const numValue = Number(value);
    if (numValue === 0) return "Aucune depense definie";
    if (numValue < 50) return "Depense faible";
    if (numValue < 150) return "Depense moderee";
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
      telephone + netflix + creditVoiture + assurancesVoiture;
    updateTotal("depensesFixes", total);
  }, [telephone, netflix, creditVoiture, assurancesVoiture, updateTotal]);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Depenses fixes</h2>
      <p
        className="mt-2"
        style={{ color: "var(--theme-textSecondary)" }}
      >
        Gere tes abonnements et autres depenses fixes mensuelles.
      </p>

      <div className="mt-6 space-y-8">
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Abonnements</h3>
          <div className="grid grid-cols-4 gap-4">
            <div className="rounded-xl p-2" style={editableWrapperStyle}>
              <EditableValueEuro
                label="Telephone"
                value={telephone}
                onSave={handleSave(setTelephone)}
                hintText={getDepenseHint}
              />
            </div>
            <div className="rounded-xl p-2" style={editableWrapperStyle}>
              <EditableValueEuro
                label="Netflix"
                value={netflix}
                onSave={handleSave(setNetflix)}
                hintText={getDepenseHint}
              />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Voiture</h3>
          <div className="grid grid-cols-4 gap-4">
            <div className="rounded-xl p-2" style={editableWrapperStyle}>
              <EditableValueEuro
                label="Credit voiture"
                value={creditVoiture}
                onSave={handleSave(setCreditVoiture)}
                hintText={getDepenseHint}
              />
            </div>
            <div className="rounded-xl p-2" style={editableWrapperStyle}>
              <EditableValueEuro
                label="Assurances voiture"
                value={assurancesVoiture}
                onSave={handleSave(setAssurancesVoiture)}
                hintText={getDepenseHint}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
