import React, { type ReactNode } from "react";
import type { ReadOnlyAppMcpHeadingLevel } from "./ids";
import {
  bodyStyle,
  colors,
  headingStyle,
  labelStyle,
  listStyle,
  panelStyle,
  stackStyle,
} from "./styles";

type SectionHeadingProps = {
  eyebrow?: string;
  headingLevel?: ReadOnlyAppMcpHeadingLevel;
  id: string;
  summary?: string;
  title: string;
};

export function SectionHeading({
  eyebrow,
  headingLevel = 2,
  id,
  summary,
  title,
}: SectionHeadingProps) {
  const HeadingTag = readHeadingTag(headingLevel);

  return (
    <div style={stackStyle}>
      {eyebrow ? <p style={labelStyle}>{eyebrow}</p> : null}
      <HeadingTag id={id} style={headingStyle}>
        {title}
      </HeadingTag>
      {summary ? <p style={bodyStyle}>{summary}</p> : null}
    </div>
  );
}

type ReadOnlyPanelProps = {
  children: ReactNode;
  labelledBy: string;
};

export function ReadOnlyPanel({ children, labelledBy }: ReadOnlyPanelProps) {
  return (
    <section
      aria-labelledby={labelledBy}
      data-panel-tier="panel"
      data-spacing="14"
      style={panelStyle}
    >
      {children}
    </section>
  );
}

type EmptyNoteProps = {
  children: ReactNode;
};

export function EmptyNote({ children }: EmptyNoteProps) {
  return (
    <p
      style={{
        ...bodyStyle,
        background: colors.soft,
        border: `1px solid ${colors.line}`,
        borderRadius: 8,
        padding: 12,
      }}
    >
      {children}
    </p>
  );
}

type ReadOnlyListProps<T> = {
  emptyLabel: string;
  items: readonly T[];
  renderItem: (item: T, index: number) => ReactNode;
};

export function ReadOnlyList<T>({
  emptyLabel,
  items,
  renderItem,
}: ReadOnlyListProps<T>) {
  if (items.length === 0) {
    return <EmptyNote>{emptyLabel}</EmptyNote>;
  }

  return (
    <ul style={listStyle}>
      {items.map((item, index) => (
        <li key={index}>{renderItem(item, index)}</li>
      ))}
    </ul>
  );
}

function readHeadingTag(headingLevel: ReadOnlyAppMcpHeadingLevel) {
  return `h${headingLevel}` as "h2" | "h3" | "h4" | "h5" | "h6";
}
