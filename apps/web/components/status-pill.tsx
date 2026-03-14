import React from "react";

type StatusPillProps = {
  label: string;
  tone?: "default" | "good" | "warn";
};

export function StatusPill({ label, tone = "default" }: StatusPillProps) {
  const className = tone === "default" ? "pill" : `pill ${tone}`;
  return <span className={className}>{label}</span>;
}
