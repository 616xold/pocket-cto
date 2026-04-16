import { z } from "zod";
import { MissionSourceKindSchema, MissionStatusSchema } from "./mission";
import { MissionTaskRoleSchema, MissionTaskStatusSchema } from "./mission-task";
import { ProofBundleStatusSchema } from "./proof-bundle";
import {
  DiscoveryQuestionKindSchema,
  FinanceDiscoveryFreshnessStateSchema,
  FinancePolicySourceScopeSummarySchema,
} from "./discovery-mission";
import { FinanceCompanyKeySchema } from "./finance-twin";

export const MissionListLatestTaskSchema = z.object({
  id: z.string().uuid(),
  role: MissionTaskRoleSchema,
  sequence: z.number().int().nonnegative(),
  status: MissionTaskStatusSchema,
  updatedAt: z.string(),
});

export const MissionListItemSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  objectiveExcerpt: z.string().min(1),
  companyKey: FinanceCompanyKeySchema.nullable().default(null),
  questionKind: DiscoveryQuestionKindSchema.nullable().default(null),
  policySourceId: z.string().uuid().nullable().default(null),
  policySourceScope: FinancePolicySourceScopeSummarySchema.nullable().default(
    null,
  ),
  answerSummary: z.string().nullable().default(null),
  freshnessState: FinanceDiscoveryFreshnessStateSchema.nullable().default(null),
  status: MissionStatusSchema,
  sourceKind: MissionSourceKindSchema,
  sourceRef: z.string().nullable(),
  primaryRepo: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  latestTask: MissionListLatestTaskSchema.nullable(),
  proofBundleStatus: ProofBundleStatusSchema,
  pendingApprovalCount: z.number().int().nonnegative(),
  pullRequestNumber: z.number().int().positive().nullable(),
  pullRequestUrl: z.string().url().nullable(),
});

export const MissionListFiltersSchema = z.object({
  limit: z.number().int().positive(),
  status: MissionStatusSchema.nullable(),
  sourceKind: MissionSourceKindSchema.nullable(),
});

export const MissionListViewSchema = z.object({
  missions: z.array(MissionListItemSchema),
  filters: MissionListFiltersSchema,
});

export type MissionListLatestTask = z.infer<typeof MissionListLatestTaskSchema>;
export type MissionListItem = z.infer<typeof MissionListItemSchema>;
export type MissionListFilters = z.infer<typeof MissionListFiltersSchema>;
export type MissionListView = z.infer<typeof MissionListViewSchema>;
