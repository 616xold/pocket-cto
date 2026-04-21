import { z } from "zod";
import {
  CreateBoardPacketMissionInputSchema,
  CreateDiligencePacketMissionInputSchema,
  CreateLenderUpdateMissionInputSchema,
  CreateMissionFromTextInputSchema,
  ExportReportingMissionMarkdownInputSchema,
  CreateReportingMissionInputSchema,
  FileReportingMissionArtifactsInputSchema,
  FINANCE_DISCOVERY_QUESTION_KINDS,
  MissionSourceKindSchema,
  MissionStatusSchema,
  RecordReportingReleaseLogInputSchema,
  RequestReportCirculationApprovalInputSchema,
  RequestReportReleaseApprovalInputSchema,
} from "@pocket-cto/domain";

const createFinanceMissionQuestionInputSchema = z
  .object({
    companyKey: z.string().trim().min(1),
    operatorPrompt: z.string().trim().min(1).optional(),
    policySourceId: z.string().uuid().optional(),
    questionKind: z.enum(FINANCE_DISCOVERY_QUESTION_KINDS),
    requestedBy: z.string().trim().min(1).default("operator"),
  })
  .strict()
  .superRefine((input, ctx) => {
    if (input.questionKind === "policy_lookup" && !input.policySourceId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Required",
        path: ["policySourceId"],
      });
    }
  })
  .transform((input) =>
    input.questionKind === "policy_lookup"
      ? input
      : {
          companyKey: input.companyKey,
          operatorPrompt: input.operatorPrompt,
          questionKind: input.questionKind,
          requestedBy: input.requestedBy,
        },
  );

export const createDiscoveryMissionSchema =
  createFinanceMissionQuestionInputSchema;
export const createAnalysisMissionSchema =
  createFinanceMissionQuestionInputSchema;
export const createReportingMissionSchema = CreateReportingMissionInputSchema;
export const createBoardPacketMissionSchema =
  CreateBoardPacketMissionInputSchema;
export const createDiligencePacketMissionSchema =
  CreateDiligencePacketMissionInputSchema;
export const createLenderUpdateMissionSchema =
  CreateLenderUpdateMissionInputSchema;
export const createMissionFromTextSchema = CreateMissionFromTextInputSchema;

export const missionIdParamsSchema = z.object({
  missionId: z.string().uuid(),
});

export const fileReportingMissionArtifactsSchema =
  FileReportingMissionArtifactsInputSchema;

export const exportReportingMissionMarkdownSchema =
  ExportReportingMissionMarkdownInputSchema;

export const requestReportingReleaseApprovalSchema =
  RequestReportReleaseApprovalInputSchema;

export const requestReportingCirculationApprovalSchema =
  RequestReportCirculationApprovalInputSchema;

export const recordReportingReleaseLogSchema =
  RecordReportingReleaseLogInputSchema;

export const listMissionsQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(50).default(20),
  sourceKind: MissionSourceKindSchema.optional(),
  status: MissionStatusSchema.optional(),
});
