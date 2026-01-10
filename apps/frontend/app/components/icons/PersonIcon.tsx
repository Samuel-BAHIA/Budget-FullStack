"use client";

import React from "react";

type IconProps = {
  size?: number;
  stroke?: string;
  fill?: string;
};

export function PersonIcon({ size = 20, stroke = "currentColor", fill = "none" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" fill={fill} />
      <path d="M5 20c0-2.5 2.7-4.5 7-4.5s7 2 7 4.5" />
    </svg>
  );
}

export function PersonPlusIcon({ size = 20, stroke = "currentColor", fill = "currentColor" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" fill="none" />
      <path d="M5 20c0-2.5 2.7-4.5 7-4.5s7 2 7 4.5" />
      <path d="M17 8h4M19 6v4" stroke={stroke} fill="none" />
    </svg>
  );
}
