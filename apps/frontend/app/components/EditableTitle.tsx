"use client";

import { useRef, useState, type CSSProperties } from "react";

type EditableTitleProps = {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  ariaLabel?: string;
  width?: string | number;
};

const PencilIcon = () => (
  <svg width="14" height="14" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path
      d="M13.6 3.6l2.8 2.8m-1.2-4l1.2 1.2a1.7 1.7 0 010 2.4l-8.9 8.9-3.6.6.6-3.6 8.9-8.9a1.7 1.7 0 012.4 0z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M5 10l3.5 3.5L15 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export function EditableTitle({ value, onChange, placeholder, ariaLabel, width = "24ch" }: EditableTitleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const startEdit = () => {
    setIsEditing(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const stopEdit = () => {
    setIsEditing(false);
    setIsFocused(false);
    setIsHovered(false);
  };

  return (
    <div style={{ ...styles.root, width }}>
      {!isEditing ? (
        <button
          type="button"
          onClick={startEdit}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={styles.button}
          title={value}
          aria-label={ariaLabel ?? "Modifier le titre"}
        >
          <span style={isHovered ? styles.iconActive : styles.icon} aria-hidden="true">
            <PencilIcon />
          </span>
          <div style={styles.field}>
            <span style={isHovered ? styles.textHover : styles.text}>{value || placeholder}</span>
          </div>
        </button>
      ) : (
        <div
          style={styles.editRow}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <span style={isFocused || isHovered ? styles.confirmIconActive : styles.confirmIcon} aria-hidden="true">
            <CheckIcon />
          </span>
          <div
            style={
              isFocused
                ? { ...styles.editField, boxShadow: "inset 0 2px 6px rgba(0,0,0,0.55), inset 0 -1px 2px rgba(255,255,255,0.08)" }
                : styles.editField
            }
          >
            <input
              ref={inputRef}
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={stopEdit}
              onKeyDown={(e) => {
                if (e.key === "Enter") stopEdit();
                if (e.key === "Escape") stopEdit();
              }}
              style={styles.input}
              aria-label={ariaLabel ?? "Modifier le titre"}
              placeholder={placeholder}
            />
          </div>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  root: {
    display: "flex",
    alignItems: "center",
  },
  button: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: 0,
    borderRadius: 999,
    border: "1px solid transparent",
    background: "transparent",
    color: "var(--theme-text)",
    cursor: "text",
    width: "100%",
    minWidth: 0,
    boxSizing: "border-box",
  },
  field: {
    display: "flex",
    alignItems: "center",
    flex: 1,
    borderRadius: 999,
    border: "1px solid transparent",
    background: "transparent",
    boxShadow: "none",
    minWidth: 0,
    boxSizing: "border-box",
  },
  text: {
    fontWeight: 600,
    fontSize: 18,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    flex: 1,
    minWidth: 0,
    padding: "10px 12px",
    textAlign: "left",
    color: "var(--theme-text)",
  },
  textHover: {
    fontWeight: 600,
    fontSize: 18,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    flex: 1,
    minWidth: 0,
    padding: "10px 12px",
    textAlign: "left",
    color: "#FDE047",
  },
  icon: {
    opacity: 0.15,
    fontSize: 14,
    transform: "scaleX(-1)",
    transition: "opacity 160ms ease",
    color: "var(--theme-text)",
    width: 16,
    height: 16,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  },
  iconActive: {
    opacity: 0.75,
    fontSize: 14,
    transform: "scaleX(-1)",
    transition: "opacity 160ms ease",
    color: "#FDE047",
    width: 16,
    height: 16,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  },
  editRow: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    width: "100%",
  },
  editField: {
    display: "flex",
    alignItems: "center",
    flex: 1,
    borderRadius: 999,
    border: "1px solid transparent",
    background: "transparent",
    boxShadow: "none",
    minWidth: 0,
    boxSizing: "border-box",
  },
  input: {
    padding: "10px 12px",
    borderRadius: 999,
    border: "none",
    background: "transparent",
    color: "var(--theme-text)",
    outline: "none",
    width: "100%",
    fontSize: 18,
    textAlign: "left",
    boxShadow: "none",
  },
  confirmIcon: {
    opacity: 0.25,
    fontSize: 14,
    transform: "none",
    transition: "opacity 160ms ease",
    color: "#7CFFB0",
    width: 16,
    height: 16,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    pointerEvents: "none",
  },
  confirmIconActive: {
    opacity: 0.85,
    fontSize: 14,
    transform: "none",
    transition: "opacity 160ms ease",
    color: "#7CFFB0",
    width: 16,
    height: 16,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    pointerEvents: "none",
  },
};
