import type {
  ApprovalRecord,
  ProofBundleManifest,
  ReportCirculationApprovalReportKind,
  ReportingCirculationApprovalStatus,
  ReportingCirculationRecordView,
} from "@pocket-cto/domain";
import {
  ReportingCirculationRecordViewSchema,
  isReportCirculationApprovalPayload,
  readReportCirculationApprovalReportKindLabel,
} from "@pocket-cto/domain";
import { readLatestReportCirculationApproval } from "./circulation-readiness";

export function buildLoggedCirculationRecordSummary(input: {
  circulatedAt: string;
  circulatedBy: string;
  circulationChannel: string;
  circulationNote: string | null;
}) {
  const note = input.circulationNote
    ? ` Circulation note: ${ensureSentencePunctuation(input.circulationNote)}`
    : "";
  return `External circulation was logged by ${input.circulatedBy} at ${input.circulatedAt} via ${input.circulationChannel}.${note}`;
}

export function buildReportingCirculationRecordView(input: {
  approvals: ApprovalRecord[];
  reportKind: ReportCirculationApprovalReportKind;
  circulationReadiness: ProofBundleManifest["circulationReadiness"];
  storedDraft: boolean;
}): ReportingCirculationRecordView | null {
  if (!input.storedDraft) {
    return null;
  }

  const latestApproval = readLatestReportCirculationApproval(input.approvals);
  return buildReportingCirculationRecordViewFromApproval({
    approval: latestApproval,
    circulationReadiness: input.circulationReadiness,
    reportKind: input.reportKind,
  });
}

export function buildReportingCirculationRecordViewFromProofBundle(
  input: Pick<
    ProofBundleManifest,
    | "circulationReadiness"
    | "circulationRecord"
    | "evidenceCompleteness"
    | "reportKind"
  >,
) {
  if (!isCirculationRecordReportKind(input.reportKind)) {
    return null;
  }

  const storedDraft =
    input.evidenceCompleteness.presentArtifactKinds.includes(input.reportKind);

  if (!storedDraft) {
    return null;
  }

  const existing = input.circulationRecord;
  const circulationApprovalStatus =
    input.circulationReadiness?.circulationApprovalStatus ?? "not_requested";

  if (!existing && circulationApprovalStatus === "not_requested") {
    return null;
  }

  return ReportingCirculationRecordViewSchema.parse({
    circulated: existing?.circulated ?? false,
    circulatedAt: existing?.circulatedAt ?? null,
    circulatedBy: existing?.circulatedBy ?? null,
    circulationChannel: existing?.circulationChannel ?? null,
    circulationNote: existing?.circulationNote ?? null,
    approvalId: existing?.approvalId ?? null,
    summary:
      existing?.summary ??
      buildMissingCirculationRecordSummary(
        input.reportKind,
        circulationApprovalStatus,
      ),
  });
}

function buildReportingCirculationRecordViewFromApproval(input: {
  approval: ApprovalRecord | null;
  circulationReadiness: ProofBundleManifest["circulationReadiness"];
  reportKind: ReportCirculationApprovalReportKind;
}) {
  const payload =
    input.approval && isReportCirculationApprovalPayload(input.approval.payload)
      ? input.approval.payload
      : null;
  const existing = payload?.circulationRecord ?? null;
  const circulationApprovalStatus =
    input.circulationReadiness?.circulationApprovalStatus ?? "not_requested";

  if (!existing && circulationApprovalStatus === "not_requested") {
    return null;
  }

  return ReportingCirculationRecordViewSchema.parse({
    circulated: existing !== null,
    circulatedAt: existing?.circulatedAt ?? null,
    circulatedBy: existing?.circulatedBy ?? null,
    circulationChannel: existing?.circulationChannel ?? null,
    circulationNote: existing?.circulationNote ?? null,
    approvalId: existing ? input.approval?.id ?? null : null,
    summary:
      existing?.summary ??
      buildMissingCirculationRecordSummary(
        payload?.reportKind ?? input.reportKind,
        circulationApprovalStatus,
      ),
  });
}

function buildMissingCirculationRecordSummary(
  reportKind: ReportCirculationApprovalReportKind,
  circulationApprovalStatus: ReportingCirculationApprovalStatus,
) {
  const reportLabel = readReportCirculationApprovalReportKindLabel(
    reportKind,
  ).toLowerCase();

  switch (circulationApprovalStatus) {
    case "approved_for_circulation":
      return "Circulation approval is granted, but no external circulation has been logged yet.";
    case "pending_review":
      return "Circulation approval is still pending review, so no external circulation has been logged yet.";
    case "not_approved_for_circulation":
      return "Circulation approval was not granted, so no external circulation has been logged.";
    case "not_requested":
      return `No external circulation has been logged for this ${reportLabel} yet.`;
  }
}

function isCirculationRecordReportKind(
  reportKind: ProofBundleManifest["reportKind"],
): reportKind is ReportCirculationApprovalReportKind {
  return reportKind === "board_packet";
}

function ensureSentencePunctuation(value: string) {
  const trimmed = value.trimEnd();
  return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
}
