"use client";

import { useState, useRef, useEffect } from "react";

type EditableValueProps = {
  value: string | number;
  onSave: (newValue: string) => void | Promise<void>;
  label?: string;
  formatValue?: (value: string | number) => string;
  formatInput?: (value: string | number) => string;
  parseValue?: (input: string) => string | number;
  hintText?: string | ((value: string | number) => string);
  inputType?: "text" | "number" | "email" | "tel";
  className?: string;
  disabled?: boolean;
};

// Icône de modification (crayon)
const EditIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M11.333 2.00001C11.5084 1.82445 11.7163 1.68506 11.9447 1.58989C12.1731 1.49472 12.4173 1.44556 12.664 1.44556C12.9107 1.44556 13.1549 1.49472 13.3833 1.58989C13.6117 1.68506 13.8196 1.82445 13.995 2.00001C14.1706 2.17545 14.31 2.38335 14.4051 2.61176C14.5003 2.84017 14.5495 3.08435 14.5495 3.33101C14.5495 3.57767 14.5003 3.82185 14.4051 4.05026C14.31 4.27867 14.1706 4.48657 13.995 4.66201L5.32833 13.3287L1.33333 14.662L2.66666 10.667L11.333 2.00001Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Icône de validation (check)
const CheckIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M13.3333 4L6 11.3333L2.66667 8"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Icône d'annulation (X)
const CancelIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 4L4 12M4 4L12 12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export function EditableValue({
  value,
  onSave,
  label,
  formatValue = (v) => String(v),
  formatInput = (v) => String(v),
  parseValue = (v) => v,
  hintText,
  inputType = "text",
  className = "",
  disabled = false,
}: EditableValueProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(formatInput(value));
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus sur l'input quand on passe en mode édition
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Mettre à jour editValue quand value change (depuis l'extérieur)
  useEffect(() => {
    if (!isEditing) {
      setEditValue(formatInput(value));
    }
  }, [value, formatInput, isEditing]);

  const handleEdit = () => {
    if (disabled) return;
    setEditValue(formatInput(value));
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditValue(formatInput(value));
    setIsEditing(false);
  };

  const handleSave = async () => {
    const parsedValue = parseValue(editValue);
    setIsSaving(true);
    try {
      await onSave(String(parsedValue));
      setIsEditing(false);
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      // On reste en mode édition en cas d'erreur
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  const displayValue = formatValue(value);
  const hint = typeof hintText === "function" ? hintText(value) : hintText;

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label
          className="block text-sm font-medium"
          style={{ color: "var(--theme-textSecondary)" }}
        >
          {label}
        </label>
      )}

      <div className="flex items-center gap-2">
        {isEditing ? (
          <>
            <input
              ref={inputRef}
              type={inputType}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isSaving}
              className="flex-1 rounded-md border px-3 py-2 text-sm outline-none transition"
              style={{
                borderColor: "var(--theme-border)",
                backgroundColor: "var(--theme-bgCard)",
                color: "var(--theme-text)",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "var(--theme-borderLight)";
                e.currentTarget.style.boxShadow =
                  "0 0 0 2px var(--theme-borderLight)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "var(--theme-border)";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="rounded-md p-2 transition disabled:opacity-50"
              style={{
                backgroundColor: "var(--theme-tabActiveBg)",
                color: "var(--theme-tabActiveText)",
              }}
              title="Valider"
            >
              <CheckIcon />
            </button>
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="rounded-md p-2 transition disabled:opacity-50"
              style={{
                backgroundColor: "var(--theme-bgHover)",
                color: "var(--theme-text)",
              }}
              title="Annuler"
            >
              <CancelIcon />
            </button>
          </>
        ) : (
          <>
            <span className="flex-1 text-lg font-medium">{displayValue}</span>
            {!disabled && (
              <button
                onClick={handleEdit}
                className="rounded-md p-2 transition hover:bg-[var(--theme-bgHover)]"
                style={{ color: "var(--theme-textSecondary)" }}
                title="Modifier"
              >
                <EditIcon />
              </button>
            )}
          </>
        )}
      </div>

      {hint && (
        <p
          className="text-xs"
          style={{ color: "var(--theme-textMuted)" }}
        >
          {hint}
        </p>
      )}
    </div>
  );
}

