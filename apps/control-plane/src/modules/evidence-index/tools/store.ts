import type {
  DocumentMap,
  EvidenceCard,
  EvidenceIndexLimitationPosture,
  EvidenceReference,
  SourceAnchor,
  SourceCoverageMatrix,
  TextPdfAdapterResult,
} from "@pocket-cto/domain";
import type { EvidenceIndexFoundation } from "../types";

export type EvidenceToolArtifactStoreInput = {
  cfoWikiRefs?: EvidenceReference[];
  evidenceIndexFoundations: EvidenceIndexFoundation[];
  financeTwinRefs?: EvidenceReference[];
  missionAnswerRefs?: EvidenceReference[];
  proofBundleRefs?: EvidenceReference[];
  textPdfResults?: TextPdfAdapterResult[];
};

export type EvidenceToolArtifactStore = {
  cfoWikiRefs: EvidenceReference[];
  documentMaps: DocumentMap[];
  evidenceCards: EvidenceCard[];
  financeTwinRefs: EvidenceReference[];
  missionAnswerRefs: EvidenceReference[];
  proofBundleRefs: EvidenceReference[];
  sourceAnchors: SourceAnchor[];
  sourceCoverageMatrices: SourceCoverageMatrix[];
  capabilityBoundaries: EvidenceIndexLimitationPosture[];
};

export function buildEvidenceToolArtifactStore(
  input: EvidenceToolArtifactStoreInput,
): EvidenceToolArtifactStore {
  const textPdfResults = input.textPdfResults ?? [];
  const sourceCoverageMatrices = [
    ...input.evidenceIndexFoundations.map(
      (foundation) => foundation.sourceCoverageMatrix,
    ),
    ...textPdfResults.map((result) => result.sourceCoverageMatrix),
  ];
  const capabilityBoundaries = sourceCoverageMatrices.flatMap(
    (matrix) => matrix.capabilityBoundaries,
  );

  return {
    capabilityBoundaries: dedupeLimitations(capabilityBoundaries),
    cfoWikiRefs: input.cfoWikiRefs ?? [],
    documentMaps: [
      ...input.evidenceIndexFoundations.flatMap(
        (foundation) => foundation.documentMaps,
      ),
      ...textPdfResults.map((result) => result.documentMap),
    ],
    evidenceCards: [
      ...input.evidenceIndexFoundations.flatMap(
        (foundation) => foundation.evidenceCards,
      ),
      ...textPdfResults.flatMap((result) => result.evidenceCards),
    ],
    financeTwinRefs: input.financeTwinRefs ?? [],
    missionAnswerRefs: input.missionAnswerRefs ?? [],
    proofBundleRefs: input.proofBundleRefs ?? [],
    sourceAnchors: [
      ...input.evidenceIndexFoundations.flatMap(
        (foundation) => foundation.sourceAnchors,
      ),
      ...textPdfResults.flatMap((result) => result.sourceAnchors),
    ],
    sourceCoverageMatrices,
  };
}

function dedupeLimitations(limitations: EvidenceIndexLimitationPosture[]) {
  const seen = new Set<string>();
  return limitations.filter((limitation) => {
    const key = `${limitation.code}:${limitation.summary}`;

    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
