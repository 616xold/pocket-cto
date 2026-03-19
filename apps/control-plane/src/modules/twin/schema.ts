import { z } from "zod";
import {
  TwinRepositoryFreshnessViewSchema,
  TwinRepositoryCiSummarySchema,
  TwinRepositoryDocSectionsViewSchema,
  TwinRepositoryDocsSyncResultSchema,
  TwinRepositoryDocsViewSchema,
  TwinEdgeListViewSchema,
  TwinEntityListViewSchema,
  TwinRepositoryMetadataSummarySchema,
  TwinRepositoryRunbooksSyncResultSchema,
  TwinRepositoryRunbooksViewSchema,
  TwinRepositoryOwnersViewSchema,
  TwinRepositoryOwnershipRulesViewSchema,
  TwinRepositoryOwnershipSummarySchema,
  TwinRepositoryTestSuiteSyncResultSchema,
  TwinRepositoryTestSuitesViewSchema,
  TwinRepositoryWorkflowSyncResultSchema,
  TwinRepositoryWorkflowsViewSchema,
  TwinSyncRunListViewSchema,
} from "@pocket-cto/domain";

export const TwinRepositoryParamsSchema = z.object({
  owner: z.string().min(1),
  repo: z.string().min(1),
});

export function parseTwinRepositoryParams(params: unknown) {
  return TwinRepositoryParamsSchema.parse(params);
}

export {
  TwinRepositoryCiSummarySchema,
  TwinRepositoryDocSectionsViewSchema,
  TwinRepositoryDocsSyncResultSchema,
  TwinRepositoryDocsViewSchema,
  TwinEdgeListViewSchema,
  TwinEntityListViewSchema,
  TwinRepositoryFreshnessViewSchema,
  TwinRepositoryMetadataSummarySchema,
  TwinRepositoryRunbooksSyncResultSchema,
  TwinRepositoryRunbooksViewSchema,
  TwinRepositoryOwnersViewSchema,
  TwinRepositoryOwnershipRulesViewSchema,
  TwinRepositoryOwnershipSummarySchema,
  TwinRepositoryTestSuiteSyncResultSchema,
  TwinRepositoryTestSuitesViewSchema,
  TwinRepositoryWorkflowSyncResultSchema,
  TwinRepositoryWorkflowsViewSchema,
  TwinSyncRunListViewSchema,
};
