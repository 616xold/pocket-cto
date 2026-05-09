import React from "react";
import {
  bodyStyle,
  colors,
  compactPanelStyle,
  strongBodyStyle,
} from "./styles";
import type { ReadOnlyAppMcpEvidenceCard } from "./types";
import { EmptyNote, ReadOnlyList, ReadOnlyPanel, SectionHeading } from "./ui";

type EvidenceCardStackProps = {
  cards: ReadOnlyAppMcpEvidenceCard[];
};

export function EvidenceCardStack({ cards }: EvidenceCardStackProps) {
  return (
    <ReadOnlyPanel labelledBy="read-only-evidence-cards-title">
      <SectionHeading
        eyebrow="Evidence cards"
        id="read-only-evidence-cards-title"
        summary="Cards summarize bounded, cited evidence. They are review surfaces, not source truth."
        title="Evidence card stack"
      />
      <ReadOnlyList
        emptyLabel="No evidence cards are available for this envelope."
        items={cards}
        renderItem={(card) => <EvidenceCardRow card={card} />}
      />
    </ReadOnlyPanel>
  );
}

function EvidenceCardRow({ card }: { card: ReadOnlyAppMcpEvidenceCard }) {
  return (
    <article aria-labelledby={`${card.evidenceCardId}-title`} style={compactPanelStyle}>
      <div
        style={{
          alignItems: "start",
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
          justifyContent: "space-between",
        }}
      >
        <div>
          <h3 id={`${card.evidenceCardId}-title`} style={strongBodyStyle}>
            {card.title}
          </h3>
          <p style={bodyStyle}>{card.summary}</p>
        </div>
      </div>
      {card.sourceAnchorIds.length > 0 ? (
        <p style={bodyStyle}>
          Source anchors:{" "}
          {card.sourceAnchorIds.map((sourceAnchorId) => (
            <code key={sourceAnchorId} style={{ color: colors.ink }}>
              {sourceAnchorId}{" "}
            </code>
          ))}
        </p>
      ) : (
        <EmptyNote>No source anchors are attached to this card.</EmptyNote>
      )}
      <p style={bodyStyle}>Citations: {card.citations.length}</p>
      <p style={bodyStyle}>Limitations: {card.limitations.length}</p>
    </article>
  );
}
