"use client";

import React, { useState } from "react";
import { TrashIcon } from "./icons/TrashIcon";
import { EditableValueEuro } from "./EditableValueEuro";

type MoneyCardProps = {
  name: string;
  value: number;
  positive?: boolean;
  onDelete?: () => void;
  onSaveValue: (newValue: string) => void | Promise<void>;
  onSaveName?: (newName: string) => void;
  hintText?: string | ((value: string | number) => string);
  displayPrefix: string;
  displaySuffix?: string;
  wrapperStyle?: React.CSSProperties;
  allowNameEdit?: boolean;
  allowDelete?: boolean;
};

export function MoneyCard({
  name,
  value,
  positive = true,
  onDelete,
  onSaveValue,
  onSaveName,
  hintText,
  displayPrefix,
  displaySuffix,
  wrapperStyle,
  allowNameEdit = true,
  allowDelete = true,
}: MoneyCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(name);
  const canEditName = allowNameEdit && !!onSaveName;
  const showDelete = allowDelete && !!onDelete;

  const titleColor = "#ffffff";
  const valueColor = positive ? "#22c55e" : "#ef4444";
  const iconColor = positive ? "#16a34a" : "#b91c1c";
  const headerBgColor =
    typeof wrapperStyle?.borderColor === "string"
      ? (wrapperStyle.borderColor as string)
      : positive
      ? "#22c55e"
      : "#ef4444";

  const handleSaveName = () => {
    if (!onSaveName) return;
    onSaveName(draft || name);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setDraft(name);
    setIsEditing(false);
  };

  return (
    <div className="rounded-xl p-3 space-y-3" style={wrapperStyle}>
      <div
        className="flex flex-wrap items-start gap-2 px-3 py-1 -mx-3 -mt-3 rounded-t-xl"
        style={{ backgroundColor: headerBgColor }}
      >
        {showDelete && (
          <button
            onClick={onDelete}
            className="flex h-8 w-8 items-center justify-center rounded-md transition"
            title="Supprimer"
            style={{
              backgroundColor: "transparent",
              marginTop: "-8px",
              marginLeft: "-8px",
              color: iconColor,
            }}
          >
            <TrashIcon />
          </button>
        )}
        <div className="flex flex-1 items-start justify-between gap-2">
          {canEditName && isEditing ? (
            <>
              <input
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                className="flex-1 rounded-md border px-3 py-2 text-sm font-semibold outline-none transition ml-2"
                style={{
                  borderColor: "var(--theme-border)",
                  backgroundColor: "var(--theme-bgCard)",
                  color: "var(--theme-text)",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "var(--theme-borderLight)";
                  e.currentTarget.style.boxShadow = "0 0 0 2px var(--theme-borderLight)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "var(--theme-border)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
              <div className="flex flex-col sm:flex-col-reverse items-end gap-1">
                <button
                  onClick={handleSaveName}
                className="rounded-md px-3 py-2 text-sm font-semibold transition"
                style={{
                  backgroundColor: "var(--theme-tabActiveBg)",
                  color: "var(--theme-tabActiveText)",
                }}
                title="Valider"
              >
                  ✓
                </button>
                <button
                  onClick={handleCancel}
                  className="rounded-md px-3 py-2 text-sm font-semibold transition"
                  style={{
                    backgroundColor: "var(--theme-bgHover)",
                    color: "var(--theme-text)",
                  }}
                  title="Annuler"
                >
                  ✕
                </button>
              </div>
            </>
          ) : canEditName ? (
            <>
              <span
                className="flex-1 text-base font-semibold ml-2 self-center text-center"
                style={{
                  color: titleColor,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
                title={name}
              >
                {name}
              </span>
              <div className="flex flex-col sm:flex-col-reverse items-end gap-1">
                <button
                  onClick={() => setIsEditing(true)}
                  className="rounded-md px-3 py-2 text-sm font-semibold transition hover:bg-[var(--theme-bgHover)]"
                  style={{ color: "#ffffff", transform: "scaleX(-1)" }}
                  title="Modifier le nom"
                >
                  ✎
                </button>
              </div>
            </>
          ) : (
            <span
              className="flex-1 text-base font-semibold ml-2 self-center text-center"
              style={{
                color: titleColor,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
              title={name}
            >
              {name}
            </span>
          )}
        </div>
      </div>
      <EditableValueEuro
        value={value}
        onSave={onSaveValue}
        hintText={hintText}
        displayPrefix={displayPrefix}
        displaySuffix={displaySuffix}
        valueColor={valueColor}
        valueClassName="ml-2 text-center"
        editIconColor={valueColor}
      />
    </div>
  );
}
