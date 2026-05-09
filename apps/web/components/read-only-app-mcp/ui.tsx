import React, { type ReactNode } from "react";
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
  id: string;
  summary?: string;
  title: string;
};

export function SectionHeading({
  eyebrow,
  id,
  summary,
  title,
}: SectionHeadingProps) {
  return (
    <div style={stackStyle}>
      {eyebrow ? <p style={labelStyle}>{eyebrow}</p> : null}
      <h2 id={id} style={headingStyle}>
        {title}
      </h2>
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
    <section aria-labelledby={labelledBy} style={panelStyle}>
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
