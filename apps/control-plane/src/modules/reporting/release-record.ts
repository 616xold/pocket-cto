import type {
  ApprovalRecord,
  ProofBundleManifest,
  ReportReleaseApprovalReportKind,
  ReportingReleaseApprovalStatus,
  ReportingReleaseRecordView,
} from "@pocket-cto/domain";
import {
  ReportingReleaseRecordViewSchema,
  isReportReleaseApprovalPayload,
  readReportReleaseApprovalReportKindLabel,
} from "@pocket-cto/domain";
import { readLatestReportReleaseApproval } from "./release-readiness";

export function buildLoggedReleaseRecordSummary(input: {
  releaseChannel: string;
  releaseNote: string | null;
  releasedAt: string;
  releasedBy: string;
}) {
  const note = input.releaseNote ? ` Release note: ${input.releaseNote}.` : "";
  return `External release was logged by ${input.releasedBy} at ${input.releasedAt} via ${input.releaseChannel}.${note}`;
}

export function buildReportingReleaseRecordView(input: {
  approvals: ApprovalRecord[];
  reportKind: ReportReleaseApprovalReportKind;
  releaseReadiness: ProofBundleManifest["releaseReadiness"];
  storedDraft: boolean;
}): ReportingReleaseRecordView | null {
  if (!input.storedDraft) {
    return null;
  }

  const latestApproval = readLatestReportReleaseApproval(input.approvals);
  return buildReportingReleaseRecordViewFromApproval({
    approval: latestApproval,
    reportKind: input.reportKind,
    releaseReadiness: input.releaseReadiness,
  });
}

export function buildReportingReleaseRecordViewFromProofBundle(
  input: Pick<
    ProofBundleManifest,
    "evidenceCompleteness" | "releaseReadiness" | "releaseRecord" | "reportKind"
  >,
) {
  if (!isReleaseRecordReportKind(input.reportKind)) {
    return null;
  }

  const storedDraft =
    input.evidenceCompleteness.presentArtifactKinds.includes(input.reportKind);

  if (!storedDraft) {
    return null;
  }

  const existing = input.releaseRecord;
  const releaseApprovalStatus =
    input.releaseReadiness?.releaseApprovalStatus ?? "not_requested";

  if (!existing && releaseApprovalStatus === "not_requested") {
    return null;
  }

  return ReportingReleaseRecordViewSchema.parse({
    released: existing?.released ?? false,
    releasedAt: existing?.releasedAt ?? null,
    releasedBy: existing?.releasedBy ?? null,
    releaseChannel: existing?.releaseChannel ?? null,
    releaseNote: existing?.releaseNote ?? null,
    approvalId: existing?.approvalId ?? null,
    summary:
      existing?.summary ??
      buildMissingReleaseRecordSummary(
        input.reportKind,
        releaseApprovalStatus,
      ),
  });
}

function buildReportingReleaseRecordViewFromApproval(input: {
  approval: ApprovalRecord | null;
  reportKind: ReportReleaseApprovalReportKind;
  releaseReadiness: ProofBundleManifest["releaseReadiness"];
}) {
  const payload =
    input.approval && isReportReleaseApprovalPayload(input.approval.payload)
      ? input.approval.payload
      : null;
  const existing = payload?.releaseRecord ?? null;
  const releaseApprovalStatus =
    input.releaseReadiness?.releaseApprovalStatus ?? "not_requested";

  if (!existing && releaseApprovalStatus === "not_requested") {
    return null;
  }

  return ReportingReleaseRecordViewSchema.parse({
    released: existing !== null,
    releasedAt: existing?.releasedAt ?? null,
    releasedBy: existing?.releasedBy ?? null,
    releaseChannel: existing?.releaseChannel ?? null,
    releaseNote: existing?.releaseNote ?? null,
    approvalId: existing ? input.approval?.id ?? null : null,
    summary:
      existing?.summary ??
      buildMissingReleaseRecordSummary(
        payload?.reportKind ?? input.reportKind,
        releaseApprovalStatus,
      ),
  });
}

function buildMissingReleaseRecordSummary(
  reportKind: ReportReleaseApprovalReportKind,
  releaseApprovalStatus: ReportingReleaseApprovalStatus,
) {
  const reportLabel = readReportReleaseApprovalReportKindLabel(
    reportKind,
  ).toLowerCase();

  switch (releaseApprovalStatus) {
    case "approved_for_release":
      return "Release approval is granted, but no external release has been logged yet.";
    case "pending_review":
      return "Release approval is still pending review, so no external release has been logged yet.";
    case "not_approved_for_release":
      return "Release approval was not granted, so no external release has been logged.";
    case "not_requested":
      return `No external release has been logged for this ${reportLabel} yet.`;
  }
}

function isReleaseRecordReportKind(
  reportKind: ProofBundleManifest["reportKind"],
): reportKind is ReportReleaseApprovalReportKind {
  return (
    reportKind === "lender_update" || reportKind === "diligence_packet"
  );
}
