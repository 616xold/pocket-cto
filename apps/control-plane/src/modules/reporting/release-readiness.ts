import type {
  ApprovalRecord,
  ProofBundleManifest,
  ReportingReleaseReadinessView,
} from "@pocket-cto/domain";
import { ReportingReleaseReadinessViewSchema } from "@pocket-cto/domain";

export function readLatestReportReleaseApproval(approvals: ApprovalRecord[]) {
  return (
    [...approvals]
      .filter((approval) => approval.kind === "report_release")
      .sort(
        (left, right) =>
          left.createdAt.localeCompare(right.createdAt) ||
          left.id.localeCompare(right.id),
      )
      .at(-1) ?? null
  );
}

export function buildReportingReleaseReadinessView(input: {
  approvals: ApprovalRecord[];
  storedDraft: boolean;
}): ReportingReleaseReadinessView | null {
  if (!input.storedDraft) {
    return null;
  }

  const latestApproval = readLatestReportReleaseApproval(input.approvals);

  if (!latestApproval) {
    return ReportingReleaseReadinessViewSchema.parse({
      approvalId: null,
      approvalStatus: null,
      rationale: null,
      releaseApprovalStatus: "not_requested",
      releaseReady: false,
      requestedAt: null,
      requestedBy: null,
      resolvedAt: null,
      resolvedBy: null,
      summary:
        "Stored lender update exists, but release approval has not been requested yet.",
    });
  }

  const releaseApprovalStatus = readReleaseApprovalStatus(latestApproval.status);
  const releaseReady = releaseApprovalStatus === "approved_for_release";

  return ReportingReleaseReadinessViewSchema.parse({
    approvalId: latestApproval.id,
    approvalStatus: latestApproval.status,
    rationale: latestApproval.rationale,
    releaseApprovalStatus,
    releaseReady,
    requestedAt: latestApproval.createdAt,
    requestedBy: latestApproval.requestedBy,
    resolvedAt: latestApproval.status === "pending" ? null : latestApproval.updatedAt,
    resolvedBy: latestApproval.resolvedBy,
    summary: buildReleaseReadinessSummary({
      releaseApprovalStatus,
      requestedBy: latestApproval.requestedBy,
      resolvedBy: latestApproval.resolvedBy,
    }),
  });
}

export function buildReportingReleaseReadinessViewFromProofBundle(
  input: Pick<
    ProofBundleManifest,
    "evidenceCompleteness" | "releaseReadiness" | "reportKind"
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

  const existing = input.releaseReadiness;
  const releaseApprovalStatus = existing?.releaseApprovalStatus ?? "not_requested";

  return ReportingReleaseReadinessViewSchema.parse({
    approvalId: existing?.approvalId ?? null,
    approvalStatus: existing?.approvalStatus ?? null,
    rationale: existing?.rationale ?? null,
    releaseApprovalStatus,
    releaseReady: existing?.releaseReady ?? false,
    requestedAt: existing?.requestedAt ?? null,
    requestedBy: existing?.requestedBy ?? null,
    resolvedAt: existing?.resolvedAt ?? null,
    resolvedBy: existing?.resolvedBy ?? null,
    summary: buildReleaseReadinessSummary({
      releaseApprovalStatus,
      requestedBy: existing?.requestedBy ?? null,
      resolvedBy: existing?.resolvedBy ?? null,
    }),
  });
}

function readReleaseApprovalStatus(
  approvalStatus: ApprovalRecord["status"],
): ReportingReleaseReadinessView["releaseApprovalStatus"] {
  switch (approvalStatus) {
    case "pending":
      return "pending_review";
    case "approved":
      return "approved_for_release";
    case "declined":
    case "cancelled":
    case "expired":
      return "not_approved_for_release";
  }
}

function buildReleaseReadinessSummary(input: {
  releaseApprovalStatus: ReportingReleaseReadinessView["releaseApprovalStatus"];
  requestedBy: string | null;
  resolvedBy: string | null;
}) {
  switch (input.releaseApprovalStatus) {
    case "pending_review":
      return input.requestedBy
        ? `Release approval was requested by ${input.requestedBy}; the stored lender update is not yet approved for release.`
        : "Release approval is pending review; the stored lender update is not yet approved for release.";
    case "approved_for_release":
      return input.resolvedBy
        ? `Release approval was granted by ${input.resolvedBy}; the stored lender update is approved for release, but no delivery has been recorded.`
        : "Release approval was granted; the stored lender update is approved for release, but no delivery has been recorded.";
    case "not_approved_for_release":
      return input.resolvedBy
        ? `Release approval was not granted by ${input.resolvedBy}; the stored lender update remains draft-only and delivery-free.`
        : "Release approval was not granted; the stored lender update remains draft-only and delivery-free.";
    case "not_requested":
      return "Stored lender update exists, but release approval has not been requested yet.";
  }
}
