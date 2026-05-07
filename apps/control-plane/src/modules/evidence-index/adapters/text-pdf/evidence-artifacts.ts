import { createHash } from "node:crypto";
import {
  EvidenceCardSchema,
  EvidenceClaimSchema,
  EvidenceTraceSchema,
  type EvidenceClaim,
  type EvidenceTrace,
  type PrecisionDocumentMap,
  type PrecisionSourceAnchor,
  type TextPdfAdapterFailureCode,
} from "@pocket-cto/domain";
import { dedupeLimitations } from "../../limitations";
import {
  buildNotSourceTruthLimitation,
  TEXT_PDF_FORBIDDEN_ACTIONS,
} from "./boundaries";
import type { TextPdfAdapterSourceInput } from "./types";

export function buildTextPdfEvidence(input: {
  documentMap: PrecisionDocumentMap;
  failureCode: TextPdfAdapterFailureCode | null;
  sourceInput: TextPdfAdapterSourceInput;
}) {
  const sourceAnchors = input.documentMap.sourceAnchors;
  const claim = buildClaim({
    documentMap: input.documentMap,
    failureCode: input.failureCode,
    sourceAnchors,
  });
  const traces = buildTraces({
    cardId: `${claim.id}:card`,
    claim,
    documentMap: input.documentMap,
    sourceAnchors,
    wikiRefs: input.sourceInput.wikiRefs ?? [],
  });
  const card = EvidenceCardSchema.parse({
    claimText: claim.claimText,
    claimType: claim.claimType,
    companyKey: input.documentMap.companyKey,
    confidence: claim.confidence,
    evidence: {
      evidenceTraces: traces,
      financeTwinRefs: [],
      sourceAnchors,
      wikiRefs: input.sourceInput.wikiRefs ?? [],
    },
    extractionMethod: claim.extractionMethod,
    financeTwinRefs: [],
    forbiddenActions: TEXT_PDF_FORBIDDEN_ACTIONS,
    freshness: claim.freshness,
    id: `${claim.id}:card`,
    limitations: claim.limitations,
    permittedNextActions: [
      {
        action: "inspect_source",
        label: "Inspect the immutable policy source and snapshot.",
        targetId: input.documentMap.sourceDocument.sourceId,
      },
      {
        action: "run_existing_source_pack_proof",
        label: "Run the existing policy/covenant source-pack proof.",
        targetId: input.documentMap.sourceDocument.sourceId,
      },
      {
        action: "request_human_review",
        label: "Request human review before using this evidence outside chat.",
        targetId: input.documentMap.sourceDocument.sourceId,
      },
    ],
    sourceAnchors,
    wikiRefs: input.sourceInput.wikiRefs ?? [],
  });

  return { cards: [card], claims: [claim], traces };
}

function buildClaim(input: {
  documentMap: PrecisionDocumentMap;
  failureCode: TextPdfAdapterFailureCode | null;
  sourceAnchors: PrecisionSourceAnchor[];
}): EvidenceClaim {
  const supported =
    input.documentMap.coverageStatus === "supported" ||
    input.documentMap.coverageStatus === "stale";
  const claimType = supported
    ? "text_pdf_document_anchor"
    : "text_pdf_capability_boundary";

  return EvidenceClaimSchema.parse({
    authorityBasis: supported ? "raw_source_anchor" : "limitation_boundary",
    claimText: supported
      ? `Deterministic V2B text-PDF anchors are available for policy source ${input.documentMap.sourceDocument.sourceId}.`
      : `TextPdfAdapter failed closed for source ${input.documentMap.sourceDocument.sourceId}.`,
    claimType,
    companyKey: input.documentMap.companyKey,
    confidence: {
      method: input.documentMap.extractionMethod,
      summary: supported
        ? "Embedded PDF text was extracted locally and bound to source checksum plus page/line locators."
        : "No content claim was emitted because a TextPdfAdapter quality gate failed.",
    },
    extractionMethod: input.documentMap.extractionMethod,
    financeTwinRefs: [],
    freshness: input.documentMap.sourceDocument.freshness,
    id: `${input.documentMap.id}:claim:${claimType}`,
    limitations: dedupeLimitations([
      ...input.documentMap.limitations,
      buildNotSourceTruthLimitation({
        sourceId: input.documentMap.sourceDocument.sourceId,
      }),
    ]),
    sourceAnchorIds: input.sourceAnchors.map((anchor) => anchor.id),
    wikiRefs: [],
  });
}

function buildTraces(input: {
  cardId: string;
  claim: EvidenceClaim;
  documentMap: PrecisionDocumentMap;
  sourceAnchors: PrecisionSourceAnchor[];
  wikiRefs: TextPdfAdapterSourceInput["wikiRefs"];
}): EvidenceTrace[] {
  const traces: EvidenceTrace[] = [];

  for (const anchor of input.sourceAnchors) {
    traces.push(
      trace({
        claimId: input.claim.id,
        companyKey: input.claim.companyKey,
        fromId: input.documentMap.sourceDocument.id,
        fromKind: "source_document",
        relationshipKind: "raw_source_to_anchor",
        sourceAnchorId: anchor.id,
        sourceDocumentId: input.documentMap.sourceDocument.id,
        summary:
          "Raw source metadata and checksum bind a TextPdfAdapter locator.",
        toId: anchor.id,
        toKind: "source_anchor",
      }),
      trace({
        claimId: input.claim.id,
        companyKey: input.claim.companyKey,
        fromId: anchor.id,
        fromKind: "source_anchor",
        relationshipKind: "anchor_to_evidence_claim",
        sourceAnchorId: anchor.id,
        sourceDocumentId: input.documentMap.sourceDocument.id,
        summary:
          "TextPdfAdapter anchor supports the evidence claim without becoming source truth.",
        toId: input.claim.id,
        toKind: "evidence_claim",
      }),
    );
  }

  for (const ref of input.wikiRefs ?? []) {
    traces.push(
      trace({
        claimId: input.claim.id,
        companyKey: input.claim.companyKey,
        fromId: ref.pageKey,
        fromKind: "cfo_wiki_page",
        relationshipKind: "cfo_wiki_ref_to_claim",
        summary: "CFO Wiki ref remains compiled and derived context.",
        toId: input.claim.id,
        toKind: "evidence_claim",
      }),
    );
  }

  traces.push(
    trace({
      claimId: input.claim.id,
      companyKey: input.claim.companyKey,
      fromId: input.claim.id,
      fromKind: "evidence_claim",
      relationshipKind: "claim_to_evidence_card",
      summary:
        "TextPdfAdapter evidence claim is packaged into a human-reviewable EvidenceCard.",
      toId: input.cardId,
      toKind: "evidence_card",
    }),
  );

  return traces;
}

type TraceInput = Omit<
  EvidenceTrace,
  "id" | "limitations" | "sourceAnchorId" | "sourceDocumentId"
> & {
  sourceAnchorId?: string | null;
  sourceDocumentId?: string | null;
};

function trace(input: TraceInput): EvidenceTrace {
  return EvidenceTraceSchema.parse({
    ...input,
    id: `trace:${input.relationshipKind}:${stableDigest(
      `${input.relationshipKind}:${input.fromId}:${input.toId}`,
    )}`,
    limitations: [],
    sourceAnchorId: input.sourceAnchorId ?? null,
    sourceDocumentId: input.sourceDocumentId ?? null,
  });
}

function stableDigest(text: string) {
  return createHash("sha256").update(text).digest("hex").slice(0, 16);
}
