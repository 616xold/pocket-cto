import type { CSSProperties } from "react";
import type { ReadOnlyAppMcpTone } from "./types";

export const colors = {
  background: "#f7f8f5",
  danger: "#8c3330",
  dangerSoft: "#fff1ee",
  fresh: "#216e4e",
  freshSoft: "#eef8f1",
  ink: "#17201d",
  line: "#d9dfd8",
  muted: "#66736f",
  panel: "#ffffff",
  proof: "#5d517b",
  proofSoft: "#f4f1fb",
  shadow: "rgba(20, 31, 27, 0.08)",
  soft: "#eef4f1",
  warning: "#8a5a12",
  warningSoft: "#fff6df",
} as const;

export const shellStyle: CSSProperties = {
  background: colors.background,
  border: `1px solid ${colors.line}`,
  borderRadius: 8,
  boxShadow: `0 18px 50px ${colors.shadow}`,
  color: colors.ink,
  display: "grid",
  gap: 18,
  margin: "0 auto",
  maxWidth: 1040,
  padding: 20,
};

export const panelStyle: CSSProperties = {
  background: colors.panel,
  border: `1px solid ${colors.line}`,
  borderRadius: 8,
  display: "grid",
  gap: 14,
  padding: 18,
};

export const compactPanelStyle: CSSProperties = {
  ...panelStyle,
  gap: 10,
  padding: 14,
};

export const twoColumnGridStyle: CSSProperties = {
  display: "grid",
  gap: 14,
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
};

export const stackStyle: CSSProperties = {
  display: "grid",
  gap: 10,
};

export const listStyle: CSSProperties = {
  display: "grid",
  gap: 10,
  listStyle: "none",
  margin: 0,
  padding: 0,
};

export const labelStyle: CSSProperties = {
  color: colors.muted,
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: 0,
  margin: 0,
  textTransform: "uppercase",
};

export const headingStyle: CSSProperties = {
  color: colors.ink,
  fontSize: 18,
  lineHeight: 1.2,
  margin: 0,
};

export const bodyStyle: CSSProperties = {
  color: colors.muted,
  fontSize: 14,
  lineHeight: 1.6,
  margin: 0,
};

export const strongBodyStyle: CSSProperties = {
  ...bodyStyle,
  color: colors.ink,
};

export function toneColors(tone: ReadOnlyAppMcpTone) {
  if (tone === "fresh") {
    return { border: colors.fresh, soft: colors.freshSoft, text: colors.fresh };
  }
  if (tone === "warning") {
    return {
      border: colors.warning,
      soft: colors.warningSoft,
      text: colors.warning,
    };
  }
  if (tone === "danger") {
    return { border: colors.danger, soft: colors.dangerSoft, text: colors.danger };
  }
  if (tone === "proof") {
    return { border: colors.proof, soft: colors.proofSoft, text: colors.proof };
  }
  return { border: colors.line, soft: colors.soft, text: colors.ink };
}

export function badgeStyle(tone: ReadOnlyAppMcpTone): CSSProperties {
  const toneColor = toneColors(tone);
  return {
    alignItems: "center",
    background: toneColor.soft,
    border: `1px solid ${toneColor.border}`,
    borderRadius: 999,
    color: toneColor.text,
    display: "inline-flex",
    fontSize: 12,
    fontWeight: 700,
    lineHeight: 1.2,
    padding: "6px 10px",
    whiteSpace: "normal",
  };
}
