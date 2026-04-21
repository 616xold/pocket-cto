import type {
  ExportReportingMissionMarkdownInput,
  FileReportingMissionArtifactsInput,
  RecordReportingReleaseLogInput,
  RecordReportingReleaseLogResult,
  RequestReportReleaseApprovalResult,
  RequestReportReleaseApprovalInput,
} from "@pocket-cto/domain";
import { RecordReportingReleaseLogResultSchema } from "@pocket-cto/domain";
import type { ProofBundleAssemblyService } from "../evidence/proof-bundle-assembly";
import type { ApprovalService } from "../approvals/service";
import { readReportReleaseApprovalPayload } from "../approvals/payload";
import type { ReportingService } from "../reporting/service";

export class MissionReportingActionsService {
  constructor(
    private readonly deps: {
      proofBundleAssembly: Pick<
        ProofBundleAssemblyService,
        "refreshProofBundle"
      >;
      approvalService: Pick<
        ApprovalService,
        "recordReportReleaseLog" | "requestReportReleaseApproval"
      >;
      reportingService: Pick<
        ReportingService,
        | "exportMarkdownBundle"
        | "fileDraftArtifacts"
        | "prepareLenderUpdateReleaseLog"
        | "prepareReportReleaseApproval"
      >;
    },
  ) {}

  async exportMarkdownBundle(
    missionId: string,
    input: ExportReportingMissionMarkdownInput,
  ) {
    const exported = await this.deps.reportingService.exportMarkdownBundle(
      missionId,
      input,
    );

    await this.deps.proofBundleAssembly.refreshProofBundle({
      details: {
        reportExportRunId:
          exported.publication.latestMarkdownExport?.exportRunId ?? null,
        reportFiledPageKeys: readFiledPageKeys(exported.publication),
        reportPublicationSummary: exported.publication.summary,
      },
      missionId,
      trigger: "reporting_export",
    });

    return exported;
  }

  async fileDraftArtifacts(
    missionId: string,
    input: FileReportingMissionArtifactsInput,
  ) {
    const filed = await this.deps.reportingService.fileDraftArtifacts(
      missionId,
      input,
    );

    await this.deps.proofBundleAssembly.refreshProofBundle({
      details: {
        reportFiledPageKeys: readFiledPageKeys(filed.publication),
        reportPublicationSummary: filed.publication.summary,
      },
      missionId,
      trigger: "reporting_filed_artifacts",
    });

    return filed;
  }

  async requestReleaseApproval(
    missionId: string,
    input: RequestReportReleaseApprovalInput,
  ): Promise<RequestReportReleaseApprovalResult> {
    const payload =
      await this.deps.reportingService.prepareReportReleaseApproval(missionId);
    const request =
      await this.deps.approvalService.requestReportReleaseApproval({
        missionId,
        payload,
        requestedBy: input.requestedBy,
      });

    if (request.created) {
      await this.deps.proofBundleAssembly.refreshProofBundle({
        missionId,
        trigger: "approval_requested",
      });
    }

    return {
      missionId,
      approvalId: request.approval.id,
      created: request.created,
      approvalStatus: request.approval.status,
      releaseApprovalStatus:
        request.approval.status === "approved"
          ? "approved_for_release"
          : request.approval.status === "pending"
            ? "pending_review"
            : "not_approved_for_release",
      releaseReady: request.approval.status === "approved",
    };
  }

  async recordReleaseLog(
    missionId: string,
    input: RecordReportingReleaseLogInput,
  ): Promise<RecordReportingReleaseLogResult> {
    const prepared =
      await this.deps.reportingService.prepareLenderUpdateReleaseLog(
        missionId,
        input,
      );
    const recorded = await this.deps.approvalService.recordReportReleaseLog({
      approvalId: prepared.approvalId,
      releaseRecord: prepared.releaseRecord,
    });

    if (recorded.created) {
      await this.deps.proofBundleAssembly.refreshProofBundle({
        missionId,
        trigger: "release_logged",
      });
    }

    const payload = readReportReleaseApprovalPayload(recorded.approval);
    const releaseRecord = payload.releaseRecord;

    if (!releaseRecord) {
      throw new Error(
        `Approval ${recorded.approval.id} is missing its persisted release record after release logging.`,
      );
    }

    return RecordReportingReleaseLogResultSchema.parse({
      missionId,
      approvalId: recorded.approval.id,
      created: recorded.created,
      releaseRecord: {
        released: true,
        releasedAt: releaseRecord.releasedAt,
        releasedBy: releaseRecord.releasedBy,
        releaseChannel: releaseRecord.releaseChannel,
        releaseNote: releaseRecord.releaseNote,
        approvalId: recorded.approval.id,
        summary: releaseRecord.summary,
      },
    });
  }
}

function readFiledPageKeys(input: {
  filedEvidenceAppendix: { pageKey: string } | null;
  filedMemo: { pageKey: string } | null;
}) {
  return [
    input.filedMemo?.pageKey,
    input.filedEvidenceAppendix?.pageKey,
  ].filter((value): value is string => Boolean(value));
}
