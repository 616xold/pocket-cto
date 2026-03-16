import { z } from "zod";
import { MissionRecordSchema, MissionStatusSchema } from "./mission";

export const GitHubIssueIntakeItemSchema = z.object({
  deliveryId: z.string().min(1),
  repoFullName: z.string().min(1),
  issueNumber: z.number().int().positive(),
  issueTitle: z.string().min(1),
  issueState: z.string().min(1),
  senderLogin: z.string().min(1).nullable(),
  sourceRef: z.string().url(),
  receivedAt: z.string().datetime({ offset: true }),
  commentCount: z.number().int().nonnegative().nullable(),
  hasCommentActivity: z.boolean(),
  isBound: z.boolean(),
  boundMissionId: z.string().uuid().nullable(),
  boundMissionStatus: MissionStatusSchema.nullable(),
});

export const GitHubIssueIntakeListViewSchema = z.object({
  issues: z.array(GitHubIssueIntakeItemSchema),
});

export const GitHubIssueMissionBindingSummarySchema = z.object({
  issueId: z.string().min(1),
  issueNodeId: z.string().min(1).nullable(),
  latestSourceDeliveryId: z.string().min(1),
  missionId: z.string().uuid(),
  repoFullName: z.string().min(1),
  issueNumber: z.number().int().positive(),
  sourceRef: z.string().url(),
});

export const GitHubIssueMissionCreateOutcomeSchema = z.enum([
  "created",
  "already_bound",
]);

export const GitHubIssueMissionCreateResultSchema = z.object({
  outcome: GitHubIssueMissionCreateOutcomeSchema,
  mission: MissionRecordSchema,
  binding: GitHubIssueMissionBindingSummarySchema,
});

export type GitHubIssueIntakeItem = z.infer<typeof GitHubIssueIntakeItemSchema>;
export type GitHubIssueIntakeListView = z.infer<
  typeof GitHubIssueIntakeListViewSchema
>;
export type GitHubIssueMissionBindingSummary = z.infer<
  typeof GitHubIssueMissionBindingSummarySchema
>;
export type GitHubIssueMissionCreateOutcome = z.infer<
  typeof GitHubIssueMissionCreateOutcomeSchema
>;
export type GitHubIssueMissionCreateResult = z.infer<
  typeof GitHubIssueMissionCreateResultSchema
>;
