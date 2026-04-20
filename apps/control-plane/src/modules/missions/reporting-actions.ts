import type {
  ExportReportingMissionMarkdownInput,
  FileReportingMissionArtifactsInput,
  RequestReportReleaseApprovalResult,
  RequestReportReleaseApprovalInput,
} from "@pocket-cto/domain";
import type { ProofBundleAssemblyService } from "../evidence/proof-bundle-assembly";
import type { ApprovalService } from "../approvals/service";
import type { ReportingService } from "../reporting/service";

export class MissionReportingActionsService {
  constructor(
    private readonly deps: {
      proofBundleAssembly: Pick<ProofBundleAssemblyService, "refreshProofBundle">;
      approvalService: Pick<ApprovalService, "requestReportReleaseApproval">;
      reportingService: Pick<
        ReportingService,
        | "exportMarkdownBundle"
        | "fileDraftArtifacts"
        | "prepareLenderUpdateReleaseApproval"
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
      await this.deps.reportingService.prepareLenderUpdateReleaseApproval(missionId);
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
}

function readFiledPageKeys(input: {
  filedEvidenceAppendix: { pageKey: string } | null;
  filedMemo: { pageKey: string } | null;
}) {
  return [input.filedMemo?.pageKey, input.filedEvidenceAppendix?.pageKey].filter(
    (value): value is string => Boolean(value),
  );
}
