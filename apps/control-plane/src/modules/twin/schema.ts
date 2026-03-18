import { z } from "zod";
import {
  TwinEdgeListViewSchema,
  TwinEntityListViewSchema,
  TwinRepositoryOwnersViewSchema,
  TwinRepositoryOwnershipRulesViewSchema,
  TwinRepositoryOwnershipSummarySchema,
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
  TwinEdgeListViewSchema,
  TwinEntityListViewSchema,
  TwinRepositoryOwnersViewSchema,
  TwinRepositoryOwnershipRulesViewSchema,
  TwinRepositoryOwnershipSummarySchema,
  TwinSyncRunListViewSchema,
};
