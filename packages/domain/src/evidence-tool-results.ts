import { z } from "zod";
import { DocumentMapSchema, SourceAnchorSchema } from "./evidence-index-document";
import { PrecisionDocumentMapSchema } from "./evidence-index-precision";
import { EvidenceCardSchema } from "./evidence-index-card";
import { SourceCoverageMatrixSchema } from "./evidence-index-coverage";
import {
  EvidenceIndexFreshnessPostureSchema,
  EvidenceIndexIdSchema,
  EvidenceIndexLimitationPostureSchema,
  PermittedNextActionSchema,
} from "./evidence-index-common";
import {
  EvidenceToolCitationSchema,
  ForbiddenToolActionSchema,
  RedactionRecordSchema,
} from "./evidence-tool-common";

export const SafeSourceExcerptSchema = z.object({
  sourceAnchorId: EvidenceIndexIdSchema,
  text: z.string(),
  characterCount: z.number().int().nonnegative(),
  truncated: z.boolean(),
  redactions: z.array(RedactionRecordSchema),
  citation: EvidenceToolCitationSchema,
});

export const EvidenceSearchResultSchema = z.object({
  id: z.string().min(1),
  resultKind: z.enum([
    "evidence_card",
    "source_anchor",
    "document_map",
    "source_coverage",
    "capability_boundary",
  ]),
  title: z.string().min(1),
  matchedFields: z.array(z.string().min(1)),
  evidenceCardId: EvidenceIndexIdSchema.nullable().default(null),
  documentMapId: EvidenceIndexIdSchema.nullable().default(null),
  sourceAnchorIds: z.array(EvidenceIndexIdSchema),
  safeExcerpts: z.array(SafeSourceExcerptSchema),
  freshness: EvidenceIndexFreshnessPostureSchema,
  limitations: z.array(EvidenceIndexLimitationPostureSchema),
  capabilityBoundarySummary: z.string().min(1).nullable().default(null),
  rank: z.number().int().positive(),
  permittedNextActions: z.array(PermittedNextActionSchema),
});

export const EvidenceFetchResultSchema = z.object({
  artifactKind: z.enum([
    "evidence_card",
    "source_anchor",
    "document_map",
    "source_coverage",
    "company_posture",
    "capability_boundaries",
  ]),
  artifactId: z.string().min(1),
  artifact: z.unknown(),
  citations: z.array(EvidenceToolCitationSchema),
  freshness: EvidenceIndexFreshnessPostureSchema,
  limitations: z.array(EvidenceIndexLimitationPostureSchema),
  capabilityBoundaries: z.array(EvidenceIndexLimitationPostureSchema),
  permittedNextActions: z.array(PermittedNextActionSchema),
  forbiddenActions: z.array(ForbiddenToolActionSchema),
  unsupportedReason: z.string().min(1).nullable().default(null),
});

export const SourceAnchorFetchSchema = z.object({
  sourceAnchor: SourceAnchorSchema,
  safeExcerpt: SafeSourceExcerptSchema.nullable(),
  citation: EvidenceToolCitationSchema,
});

export const DocumentMapFetchSchema = z.object({
  documentMap: z.union([PrecisionDocumentMapSchema, DocumentMapSchema]),
  safeExcerpts: z.array(SafeSourceExcerptSchema),
  citations: z.array(EvidenceToolCitationSchema),
});

export const SourceCoverageFetchSchema = z.object({
  sourceCoverageMatrix: SourceCoverageMatrixSchema,
  citations: z.array(EvidenceToolCitationSchema),
});

export const EvidenceReferenceSchema = z.object({
  refKind: z.enum([
    "finance_twin_ref",
    "cfo_wiki_ref",
    "mission_answer_ref",
    "proof_bundle_ref",
  ]),
  id: z.string().min(1),
  summary: z.string().min(1),
  routePath: z.string().min(1).nullable().default(null),
  readOnly: z.literal(true),
});

export const CompanyPostureFetchSchema = z.object({
  companyKey: z.string().min(1),
  evidenceCardCount: z.number().int().nonnegative(),
  sourceAnchorCount: z.number().int().nonnegative(),
  documentMapCount: z.number().int().nonnegative(),
  sourceCoverageEntryCount: z.number().int().nonnegative(),
  financeTwinRefs: z.array(EvidenceReferenceSchema),
  cfoWikiRefs: z.array(EvidenceReferenceSchema),
  missionAnswerRefs: z.array(EvidenceReferenceSchema),
  proofBundleRefs: z.array(EvidenceReferenceSchema),
});

export const CapabilityBoundaryFetchSchema = z.object({
  readOnlyToolsOnly: z.literal(true),
  noWriteToolsRegistered: z.literal(true),
  requestedAction: z.string().min(1).nullable().default(null),
  requestedActionAllowed: z.boolean(),
  forbiddenActions: z.array(ForbiddenToolActionSchema),
  capabilityBoundaries: z.array(EvidenceIndexLimitationPostureSchema),
  citations: z.array(EvidenceToolCitationSchema),
});

export type SafeSourceExcerpt = z.infer<typeof SafeSourceExcerptSchema>;
export type EvidenceSearchResult = z.infer<
  typeof EvidenceSearchResultSchema
>;
export type EvidenceFetchResult<T> = Omit<
  z.infer<typeof EvidenceFetchResultSchema>,
  "artifact"
> & {
  artifact: T;
};
export type SourceAnchorFetch = z.infer<typeof SourceAnchorFetchSchema>;
export type DocumentMapFetch = z.infer<typeof DocumentMapFetchSchema>;
export type SourceCoverageFetch = z.infer<typeof SourceCoverageFetchSchema>;
export type EvidenceReference = z.infer<typeof EvidenceReferenceSchema>;
export type CompanyPostureFetch = z.infer<typeof CompanyPostureFetchSchema>;
export type CapabilityBoundaryFetch = z.infer<
  typeof CapabilityBoundaryFetchSchema
>;

export const EvidenceCardFetchSchema = EvidenceFetchResultSchema.extend({
  artifact: EvidenceCardSchema,
});
