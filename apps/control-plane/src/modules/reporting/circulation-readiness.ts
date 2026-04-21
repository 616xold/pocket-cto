import type {
  ApprovalRecord,
  ProofBundleManifest,
  ReportCirculationApprovalReportKind,
  ReportingCirculationReadinessView,
} from "@pocket-cto/domain";
import {
  ReportingCirculationReadinessViewSchema,
  readReportCirculationApprovalReportKindLabel,
} from "@pocket-cto/domain";

export function readLatestReportCirculationApproval(
  approvals: ApprovalRecord[],
) {
  return (
    [...approvals]
      .filter((approval) => approval.kind === "report_circulation")
      .sort(
        (left, right) =>
          left.createdAt.localeCompare(right.createdAt) ||
          left.id.localeCompare(right.id),
      )
      .at(-1) ?? null
  );
}

export function buildReportingCirculationReadinessView(input: {
  approvals: ApprovalRecord[];
  reportKind: ReportCirculationApprovalReportKind;
  storedDraft: boolean;
}): ReportingCirculationReadinessView | null {
  if (!input.storedDraft) {
    return null;
  }

  const latestApproval = readLatestReportCirculationApproval(input.approvals);

  if (!latestApproval) {
    return ReportingCirculationReadinessViewSchema.parse({
      approvalId: null,
      approvalStatus: null,
      rationale: null,
      circulationApprovalStatus: "not_requested",
      circulationReady: false,
      requestedAt: null,
      requestedBy: null,
      resolvedAt: null,
      resolvedBy: null,
      summary: buildCirculationReadinessSummary({
        circulationApprovalStatus: "not_requested",
        reportKind: input.reportKind,
        requestedBy: null,
        resolvedBy: null,
      }),
    });
  }

  const circulationApprovalStatus = readCirculationApprovalStatus(
    latestApproval.status,
  );
  const circulationReady =
    circulationApprovalStatus === "approved_for_circulation";

  return ReportingCirculationReadinessViewSchema.parse({
    approvalId: latestApproval.id,
    approvalStatus: latestApproval.status,
    rationale: latestApproval.rationale,
    circulationApprovalStatus,
    circulationReady,
    requestedAt: latestApproval.createdAt,
    requestedBy: latestApproval.requestedBy,
    resolvedAt:
      latestApproval.status === "pending" ? null : latestApproval.updatedAt,
    resolvedBy: latestApproval.resolvedBy,
    summary: buildCirculationReadinessSummary({
      circulationApprovalStatus,
      reportKind: input.reportKind,
      requestedBy: latestApproval.requestedBy,
      resolvedBy: latestApproval.resolvedBy,
    }),
  });
}

export function buildReportingCirculationReadinessViewFromProofBundle(
  input: Pick<
    ProofBundleManifest,
    "circulationReadiness" | "evidenceCompleteness" | "reportKind"
  >,
) {
  if (!isCirculationApprovalReportKind(input.reportKind)) {
    return null;
  }

  const storedDraft =
    input.evidenceCompleteness.presentArtifactKinds.includes(input.reportKind);

  if (!storedDraft) {
    return null;
  }

  const existing = input.circulationReadiness;
  const circulationApprovalStatus =
    existing?.circulationApprovalStatus ?? "not_requested";

  return ReportingCirculationReadinessViewSchema.parse({
    approvalId: existing?.approvalId ?? null,
    approvalStatus: existing?.approvalStatus ?? null,
    rationale: existing?.rationale ?? null,
    circulationApprovalStatus,
    circulationReady: existing?.circulationReady ?? false,
    requestedAt: existing?.requestedAt ?? null,
    requestedBy: existing?.requestedBy ?? null,
    resolvedAt: existing?.resolvedAt ?? null,
    resolvedBy: existing?.resolvedBy ?? null,
    summary: buildCirculationReadinessSummary({
      circulationApprovalStatus,
      reportKind: input.reportKind,
      requestedBy: existing?.requestedBy ?? null,
      resolvedBy: existing?.resolvedBy ?? null,
    }),
  });
}

function isCirculationApprovalReportKind(
  reportKind: ProofBundleManifest["reportKind"],
): reportKind is ReportCirculationApprovalReportKind {
  return reportKind === "board_packet";
}

function readCirculationApprovalStatus(
  approvalStatus: ApprovalRecord["status"],
): ReportingCirculationReadinessView["circulationApprovalStatus"] {
  switch (approvalStatus) {
    case "pending":
      return "pending_review";
    case "approved":
      return "approved_for_circulation";
    case "declined":
    case "cancelled":
    case "expired":
      return "not_approved_for_circulation";
  }
}

function buildCirculationReadinessSummary(input: {
  circulationApprovalStatus: ReportingCirculationReadinessView["circulationApprovalStatus"];
  reportKind: ReportCirculationApprovalReportKind;
  requestedBy: string | null;
  resolvedBy: string | null;
}) {
  const reportLabel = readReportCirculationApprovalReportKindLabel(
    input.reportKind,
  ).toLowerCase();

  switch (input.circulationApprovalStatus) {
    case "pending_review":
      return input.requestedBy
        ? `Circulation approval was requested by ${input.requestedBy}; the stored ${reportLabel} is not yet approved for internal circulation.`
        : `Circulation approval is pending review; the stored ${reportLabel} is not yet approved for internal circulation.`;
    case "approved_for_circulation":
      return input.resolvedBy
        ? `Circulation approval was granted by ${input.resolvedBy}; the stored ${reportLabel} is approved for internal circulation, but no circulation has been logged.`
        : `Circulation approval was granted; the stored ${reportLabel} is approved for internal circulation, but no circulation has been logged.`;
    case "not_approved_for_circulation":
      return input.resolvedBy
        ? `Circulation approval was not granted by ${input.resolvedBy}; the stored ${reportLabel} remains draft-only and circulation-free.`
        : `Circulation approval was not granted; the stored ${reportLabel} remains draft-only and circulation-free.`;
    case "not_requested":
      return `Stored ${reportLabel} exists, but circulation approval has not been requested yet.`;
  }
}
