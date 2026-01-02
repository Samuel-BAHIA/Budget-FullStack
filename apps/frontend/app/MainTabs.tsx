"use client";

import { useState } from "react";
import { RevenusTab } from "./tabs/RevenusTab";
import { DepensesFixesTab } from "./tabs/DepensesFixesTab";
import { DepensesVariablesTab } from "./tabs/DepensesVariablesTab";
import { BilanTab } from "./tabs/BilanTab";

type TabId = "revenus" | "fixes" | "variables" | "bilan";

const tabs: { id: TabId; label: string }[] = [
  { id: "revenus", label: "Revenus" },
  { id: "fixes", label: "Dépenses fixes" },
  { id: "variables", label: "Dépenses variables" },
  { id: "bilan", label: "Bilan" },
];

export function MainTabs() {
  const [active, setActive] = useState<TabId>("revenus");

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-50">
      {/* Header */}
      <div className="mx-auto max-w-5xl px-6 pt-10">
        <h1 className="text-3xl font-semibold tracking-tight">Budget</h1>
        <p className="mt-2 text-neutral-400">
          Gère tes revenus et dépenses, et visualise ton bilan.
        </p>
      </div>

      {/* Card */}
      <div className="mx-auto mt-8 max-w-5xl px-6 pb-10">
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 shadow-sm backdrop-blur">
          {/* Tabs bar */}
          <div className="border-b border-neutral-800 px-2">
            <div
              role="tablist"
              aria-label="Sections budget"
              className="flex gap-2 overflow-x-auto py-2"
            >
              {tabs.map((t) => {
                const isActive = active === t.id;
                return (
                  <button
                    key={t.id}
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActive(t.id)}
                    className={[
                      "whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium transition",
                      "border",
                      isActive
                        ? "border-neutral-200 bg-neutral-200 text-neutral-900"
                        : "border-transparent bg-transparent text-neutral-300 hover:bg-neutral-800/60 hover:text-neutral-50",
                    ].join(" ")}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {active === "revenus" && <RevenusTab />}
            {active === "fixes" && <DepensesFixesTab />}
            {active === "variables" && <DepensesVariablesTab />}
            {active === "bilan" && <BilanTab />}
          </div>
        </div>
      </div>
    </main>
  );
}
