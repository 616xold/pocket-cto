import type {
  ApprovalRecord,
  ProofBundleManifest,
  ReportingReleaseApprovalStatus,
  ReportingReleaseRecordView,
} from "@pocket-cto/domain";
import {
  ReportingReleaseRecordViewSchema,
  isReportReleaseApprovalPayload,
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
  releaseReadiness: ProofBundleManifest["releaseReadiness"];
  storedDraft: boolean;
}): ReportingReleaseRecordView | null {
  if (!input.storedDraft) {
    return null;
  }

  const latestApproval = readLatestReportReleaseApproval(input.approvals);
  return buildReportingReleaseRecordViewFromApproval({
    approval: latestApproval,
    releaseReadiness: input.releaseReadiness,
  });
}

export function buildReportingReleaseRecordViewFromProofBundle(
  input: Pick<
    ProofBundleManifest,
    "evidenceCompleteness" | "releaseReadiness" | "releaseRecord" | "reportKind"
  >,
) {
  if (input.reportKind !== "lender_update") {
    return null;
  }

  const storedDraft =
    input.evidenceCompleteness.presentArtifactKinds.includes("lender_update");

  if (!storedDraft) {
    return null;
  }

  const existing = input.releaseRecord;

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
        input.releaseReadiness?.releaseApprovalStatus ?? "not_requested",
      ),
  });
}

function buildReportingReleaseRecordViewFromApproval(input: {
  approval: ApprovalRecord | null;
  releaseReadiness: ProofBundleManifest["releaseReadiness"];
}) {
  const payload =
    input.approval && isReportReleaseApprovalPayload(input.approval.payload)
      ? input.approval.payload
      : null;
  const existing = payload?.releaseRecord ?? null;

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
        input.releaseReadiness?.releaseApprovalStatus ?? "not_requested",
      ),
  });
}

function buildMissingReleaseRecordSummary(
  releaseApprovalStatus: ReportingReleaseApprovalStatus,
) {
  switch (releaseApprovalStatus) {
    case "approved_for_release":
      return "Release approval is granted, but no external release has been logged yet.";
    case "pending_review":
      return "Release approval is still pending review, so no external release has been logged yet.";
    case "not_approved_for_release":
      return "Release approval was not granted, so no external release has been logged.";
    case "not_requested":
      return "No external release has been logged for this lender update yet.";
  }
}
