import { z } from "zod";
import { CfoWikiDocumentRoleSchema } from "./cfo-wiki";
import { FinanceCompanyKeySchema } from "./finance-twin";
import {
  SourceChecksumSha256Schema,
  SourceKindSchema,
  SourceSnapshotStorageKindSchema,
} from "./source-registry";
import {
  EvidenceIndexCoverageStatusSchema,
  EvidenceIndexExtractionMethodSchema,
  EvidenceIndexFreshnessPostureSchema,
  EvidenceIndexIdSchema,
  EvidenceIndexLifecycleStatusSchema,
  EvidenceIndexLimitationPostureSchema,
  EvidenceIndexLocatorSchema,
} from "./evidence-index-common";

export const EvidenceIndexSourceDocumentSchema = z.object({
  id: EvidenceIndexIdSchema,
  companyKey: FinanceCompanyKeySchema,
  sourceId: z.string().uuid(),
  sourceSnapshotId: z.string().uuid().nullable(),
  sourceFileId: z.string().uuid().nullable(),
  sourceKind: SourceKindSchema,
  documentRole: CfoWikiDocumentRoleSchema.nullable(),
  mediaType: z.string().min(1).nullable(),
  checksumSha256: SourceChecksumSha256Schema.nullable(),
  storageKind: SourceSnapshotStorageKindSchema.nullable(),
  storageRef: z.string().min(1).nullable(),
  capturedAt: z.string().datetime({ offset: true }).nullable(),
  extractionMethod: EvidenceIndexExtractionMethodSchema,
  freshness: EvidenceIndexFreshnessPostureSchema,
  lifecycleStatus: EvidenceIndexLifecycleStatusSchema,
  limitations: z.array(EvidenceIndexLimitationPostureSchema),
});

export const SourceAnchorSchema = z.object({
  id: EvidenceIndexIdSchema,
  companyKey: FinanceCompanyKeySchema,
  sourceDocumentId: EvidenceIndexIdSchema,
  sourceId: z.string().uuid(),
  sourceSnapshotId: z.string().uuid().nullable(),
  sourceFileId: z.string().uuid().nullable(),
  checksumSha256: SourceChecksumSha256Schema.nullable(),
  storageKind: SourceSnapshotStorageKindSchema.nullable(),
  storageRef: z.string().min(1).nullable(),
  mediaType: z.string().min(1).nullable().optional(),
  documentRole: CfoWikiDocumentRoleSchema.nullable().optional(),
  extractionMethod: EvidenceIndexExtractionMethodSchema,
  adapterName: z.string().min(1).optional(),
  adapterVersion: z.string().min(1).optional(),
  pageLocator: z
    .object({
      pageNumber: z.number().int().positive(),
      pageLabel: z.string().min(1).nullable().default(null),
    })
    .nullable()
    .optional(),
  textRangeLocator: z
    .object({
      pageNumber: z.number().int().positive(),
      startLine: z.number().int().positive(),
      endLine: z.number().int().positive(),
      startTextOffset: z.number().int().nonnegative(),
      endTextOffset: z.number().int().nonnegative(),
    })
    .nullable()
    .optional(),
  locator: EvidenceIndexLocatorSchema,
  freshness: EvidenceIndexFreshnessPostureSchema,
  lifecycleStatus: EvidenceIndexLifecycleStatusSchema,
  limitations: z.array(EvidenceIndexLimitationPostureSchema),
});

export const EvidenceIndexSourcePageSchema = z.object({
  id: EvidenceIndexIdSchema,
  label: z.string().min(1),
  order: z.number().int().nonnegative(),
  anchorId: EvidenceIndexIdSchema,
  locator: EvidenceIndexLocatorSchema,
  limitations: z.array(EvidenceIndexLimitationPostureSchema),
});

export const EvidenceIndexSourceSectionSchema = z.object({
  id: EvidenceIndexIdSchema,
  title: z.string().min(1).nullable(),
  order: z.number().int().nonnegative(),
  anchorId: EvidenceIndexIdSchema,
  startLine: z.number().int().positive(),
  endLine: z.number().int().positive(),
  excerpt: z.string().min(1),
  limitations: z.array(EvidenceIndexLimitationPostureSchema),
});

export const EvidenceIndexUnsupportedRegionSchema = z.object({
  id: EvidenceIndexIdSchema,
  regionKind: z.enum(["table", "figure"]),
  order: z.number().int().nonnegative(),
  anchorId: EvidenceIndexIdSchema,
  extractionMethod: EvidenceIndexExtractionMethodSchema,
  limitations: z.array(EvidenceIndexLimitationPostureSchema).min(1),
});

export const DocumentMapSchema = z.object({
  id: EvidenceIndexIdSchema,
  companyKey: FinanceCompanyKeySchema,
  sourceDocument: EvidenceIndexSourceDocumentSchema,
  sourcePages: z.array(EvidenceIndexSourcePageSchema),
  sourceSections: z.array(EvidenceIndexSourceSectionSchema),
  sourceTables: z.array(EvidenceIndexUnsupportedRegionSchema),
  sourceFigures: z.array(EvidenceIndexUnsupportedRegionSchema),
  sourceAnchors: z.array(SourceAnchorSchema),
  extractionMethod: EvidenceIndexExtractionMethodSchema,
  coverageStatus: EvidenceIndexCoverageStatusSchema,
  limitations: z.array(EvidenceIndexLimitationPostureSchema),
});

export type EvidenceIndexSourceDocument = z.infer<
  typeof EvidenceIndexSourceDocumentSchema
>;
export type SourceAnchor = z.infer<typeof SourceAnchorSchema>;
export type EvidenceIndexSourceSection = z.infer<
  typeof EvidenceIndexSourceSectionSchema
>;
export type EvidenceIndexUnsupportedRegion = z.infer<
  typeof EvidenceIndexUnsupportedRegionSchema
>;
export type DocumentMap = z.infer<typeof DocumentMapSchema>;
