"use client";

import { useEffect, useState } from "react";
import { AppartementBlock } from "../components/AppartementBlock";
import { useBudget } from "../contexts/BudgetContext";

type AppartementData = {
  id: number;
  name: string;
  data: {
    loyer: number;
    credit: number;
    assuranceCredit: number;
    assurance: number;
    internet: number;
    eau: number;
    electricite: number;
    gaz: number;
  };
};


// Icône plus
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
      data: {
        loyer: 800,
        credit: 100,
        assuranceCredit: 20,
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
      data: {
        loyer: 0,
        credit: 0,
        assuranceCredit: 0,
        eau: 0,
        internet: 0,
        assurance: 0,
        electricite: 0,
        gaz: 0,
      },
    };
    setAppartements((prev) => [...prev, newAppartement]);
  };

  // Fonction appelée quand les données d'un appartement changent
  const handleAppartementDataChange = (id: number) => {
    return (data: {
      loyer: number;
      credit: number;
      assuranceCredit: number;
      eau: number;
      internet: number;
      assurance: number;
      electricite: number;
      gaz: number;
    }) => {
      setAppartements((prev) =>
        prev.map((apt) => (apt.id === id ? { ...apt, data } : apt))
      );
      console.log(`Appartement ${id} mis à jour:`, data);
      // TODO: Appeler votre fonction de mise à jour globale ici
      // updateAllData({ appartement: id, ...data });
    };
  };

  // Fonction appelée quand le nom d'un appartement change
  const handleAppartementNameChange = (id: number) => {
    return (name: string) => {
      setAppartements((prev) =>
        prev.map((apt) => (apt.id === id ? { ...apt, name } : apt))
      );
      console.log(`Nom de l'appartement ${id} mis à jour:`, name);
    };
  };

  // Fonction pour supprimer un appartement
  const handleDeleteAppartement = (id: number) => {
    return () => {
      if (
        confirm(
          "Êtes-vous sûr de vouloir supprimer cet appartement ? Cette action est irréversible."
        )
      ) {
        setAppartements((prev) => prev.filter((apt) => apt.id !== id));
        console.log(`Appartement ${id} supprimé`);
      }
    };
  };

  useEffect(() => {
    const totalAppartements = appartements.reduce((sum, apt) => {
      const d = apt.data;
      return (
        sum +
        d.loyer +
        d.credit +
        d.assuranceCredit +
        d.assurance +
        d.internet +
        d.eau +
        d.electricite +
        d.gaz
      );
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
            Gérez vos appartements et leurs informations.
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

