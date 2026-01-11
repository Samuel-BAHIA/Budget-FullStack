"use client";

type IconProps = {
  size?: number;
  stroke?: string;
  fill?: string;
};

export function HomeIcon({ size = 20, stroke = "currentColor", fill = "none" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 11l9-7 9 7" />
      <path d="M5 10v10h14V10" />
      <path d="M9 21V14h6v7" />
    </svg>
  );
}
