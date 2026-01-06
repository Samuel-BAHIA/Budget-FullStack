"use client";

import { useEffect, useState } from "react";
import { AppartementBlock } from "../components/AppartementBlock";
import { useBudget } from "../contexts/BudgetContext";

export type AppartementType = "location" | "propriete";

export type AppartementData = {
  id: number;
  name: string;
  type: AppartementType;
  data: {
    loyer: number; // loyer payé ou perçu
    credit: number;
    assuranceCredit: number;
    taxeFonciere: number;
    impotsRevenu: number;
    chargesCopro: number;
    assurance: number;
    internet: number;
    eau: number;
    electricite: number;
    gaz: number;
  };
};

// Icone plus
const PlusIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M10 4V16M4 10H16"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

export function AppartementsTab() {
  const [appartements, setAppartements] = useState<AppartementData[]>([
    {
      id: 1,
      name: "Appartement 1",
      type: "location",
      data: {
        loyer: 800,
        credit: 100,
        assuranceCredit: 20,
        taxeFonciere: 0,
        impotsRevenu: 0,
        chargesCopro: 0,
        assurance: 40,
        internet: 30,
        eau: 50,
        electricite: 60,
        gaz: 45,
      },
    },
  ]);

  const { updateTotal } = useBudget();

  // Fonction pour ajouter un nouvel appartement
  const handleAddAppartement = () => {
    const newId = Math.max(...appartements.map((a) => a.id), 0) + 1;
    const newAppartement: AppartementData = {
      id: newId,
      name: `Appartement ${newId}`,
      type: "location",
      data: {
        loyer: 0,
        credit: 0,
        assuranceCredit: 0,
        taxeFonciere: 0,
        impotsRevenu: 0,
        chargesCopro: 0,
        eau: 0,
        internet: 0,
        assurance: 0,
        electricite: 0,
        gaz: 0,
      },
    };
    setAppartements((prev) => [...prev, newAppartement]);
  };

  // Fonction appellee quand les donnees ou le type d'un appartement changent
  const handleAppartementDataChange = (id: number) => {
    return (data: AppartementData["data"], type: AppartementType) => {
      setAppartements((prev) =>
        prev.map((apt) => (apt.id === id ? { ...apt, data, type } : apt))
      );
      console.log(`Appartement ${id} mis a jour:`, data, type);
    };
  };

  // Fonction appellee quand le nom d'un appartement change
  const handleAppartementNameChange = (id: number) => {
    return (name: string) => {
      setAppartements((prev) =>
        prev.map((apt) => (apt.id === id ? { ...apt, name } : apt))
      );
      console.log(`Nom de l'appartement ${id} mis a jour:`, name);
    };
  };

  // Fonction pour supprimer un appartement
  const handleDeleteAppartement = (id: number) => {
    return () => {
      if (
        confirm(
          "Etes-vous sur de vouloir supprimer cet appartement ? Cette action est irreversible."
        )
      ) {
        setAppartements((prev) => prev.filter((apt) => apt.id !== id));
        console.log(`Appartement ${id} supprime`);
      }
    };
  };

  useEffect(() => {
    const totalAppartements = appartements.reduce((sum, apt) => {
      const d = apt.data;
      if (apt.type === "propriete") {
        // Loyer percu (revenu) - toutes les charges/credits
        return (
          sum +
          (d.loyer -
            (d.impotsRevenu +
              d.taxeFonciere +
              d.chargesCopro +
              d.assurance +
              d.credit +
              d.assuranceCredit))
        );
      }
      // Location : uniquement des depenses
      return sum - (d.loyer + d.assurance + d.internet + d.eau + d.electricite + d.gaz);
    }, 0);

    updateTotal("appartements", totalAppartements);
  }, [appartements, updateTotal]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Appartements</h2>
          <p
            className="mt-2"
            style={{ color: "var(--theme-textSecondary)" }}
          >
            Gere tes appartements achetes ou loues, et leurs informations.
          </p>
        </div>
        <button
          onClick={handleAddAppartement}
          className="flex items-center gap-2 rounded-lg border px-4 py-2 transition"
          style={{
            borderColor: "var(--theme-border)",
            backgroundColor: "var(--theme-bgCard)",
            color: "var(--theme-text)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "var(--theme-bgHover)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "var(--theme-bgCard)";
          }}
        >
          <PlusIcon />
          <span>Ajouter</span>
        </button>
      </div>

      <div className="space-y-6">
        {appartements.map((apt) => (
          <AppartementBlock
            key={apt.id}
            appartementNumber={apt.id}
            name={apt.name}
            type={apt.type}
            initialData={apt.data}
            onDataChange={handleAppartementDataChange(apt.id)}
            onNameChange={handleAppartementNameChange(apt.id)}
            onDelete={handleDeleteAppartement(apt.id)}
          />
        ))}
      </div>
    </div>
  );
}
