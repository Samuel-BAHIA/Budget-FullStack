"use client";

import { useState } from "react";
import { RevenusTab } from "./tabs/RevenusTab";
import { DepensesFixesTab } from "./tabs/DepensesFixesTab";
import { DepensesVariablesTab } from "./tabs/DepensesVariablesTab";
import { BilanTab } from "./tabs/BilanTab";
import { ThemeSelector } from "./components/ThemeSelector";

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
    <main
      className="min-h-screen"
      style={{
        backgroundColor: "var(--theme-bg)",
        color: "var(--theme-text)",
      }}
    >
      {/* Header */}
      <div className="mx-auto max-w-5xl px-6 pt-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Budget</h1>
            <p
              className="mt-2"
              style={{ color: "var(--theme-textSecondary)" }}
            >
              Gère tes revenus et dépenses, et visualise ton bilan.
            </p>
          </div>
          <ThemeSelector />
        </div>
      </div>

      {/* Card */}
      <div className="mx-auto mt-8 max-w-5xl px-6 pb-10">
        <div
          className="rounded-2xl border shadow-sm backdrop-blur"
          style={{
            borderColor: "var(--theme-border)",
            backgroundColor: "var(--theme-bgCard)",
          }}
        >
          {/* Tabs bar */}
          <div
            className="border-b px-2"
            style={{ borderColor: "var(--theme-border)" }}
          >
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
                      "whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium transition border",
                    ].join(" ")}
                    style={
                      isActive
                        ? {
                            borderColor: "var(--theme-tabActiveBg)",
                            backgroundColor: "var(--theme-tabActiveBg)",
                            color: "var(--theme-tabActiveText)",
                          }
                        : {
                            borderColor: "transparent",
                            backgroundColor: "transparent",
                            color: "var(--theme-tabInactiveText)",
                          }
                    }
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor =
                          "var(--theme-tabHoverBg)";
                        e.currentTarget.style.color = "var(--theme-text)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.color = "var(--theme-tabInactiveText)";
                      }
                    }}
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
