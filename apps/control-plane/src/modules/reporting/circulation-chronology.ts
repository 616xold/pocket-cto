import type {
  ApprovalRecord,
  ProofBundleManifest,
  ReportCirculationApprovalCirculationCorrection,
  ReportCirculationApprovalCirculationRecord,
  ReportCirculationApprovalReportKind,
  ReportingCirculationChronologyView,
  ReportingCirculationCorrectionView,
  ReportingCirculationEffectiveRecordView,
} from "@pocket-cto/domain";
import {
  ReportingCirculationChronologyViewSchema,
  ReportingCirculationCorrectionViewSchema,
  ReportingCirculationEffectiveRecordViewSchema,
  isReportCirculationApprovalPayload,
} from "@pocket-cto/domain";
import { readLatestReportCirculationApproval } from "./circulation-readiness";

export function buildLoggedCirculationCorrectionSummary(input: {
  correctedAt: string;
  correctedBy: string;
  correctionReason: string;
  circulatedAt: string | null;
  circulatedBy: string | null;
  circulationChannel: string | null;
  circulationNote: string | null;
}) {
  const correctedValues = [
    input.circulatedAt ? `circulatedAt -> ${input.circulatedAt}` : null,
    input.circulatedBy ? `circulatedBy -> ${input.circulatedBy}` : null,
    input.circulationChannel
      ? `circulationChannel -> ${input.circulationChannel}`
      : null,
    input.circulationNote
      ? `circulationNote -> ${input.circulationNote}`
      : null,
  ].filter((value): value is string => Boolean(value));
  const correctedValuesSummary =
    correctedValues.length > 0
      ? ` Corrected values: ${correctedValues.join("; ")}.`
      : "";

  return `Circulation record correction was appended by ${input.correctedBy} at ${input.correctedAt}.${correctedValuesSummary} Reason: ${ensureSentencePunctuation(input.correctionReason)}`;
}

export function buildReportingCirculationChronologyView(input: {
  approvals: ApprovalRecord[];
  reportKind: ReportCirculationApprovalReportKind;
  storedDraft: boolean;
}): ReportingCirculationChronologyView | null {
  if (!input.storedDraft) {
    return null;
  }

  return buildReportingCirculationChronologyViewFromApprovalRecord(
    readLatestReportCirculationApproval(input.approvals),
  );
}

export function buildReportingCirculationChronologyViewFromApprovalRecord(
  approval: ApprovalRecord | null,
) {
  const payload =
    approval && isReportCirculationApprovalPayload(approval.payload)
      ? approval.payload
      : null;
  const originalRecord = payload?.circulationRecord ?? null;

  if (!originalRecord) {
    return null;
  }

  const originalEffectiveRecord = buildOriginalEffectiveRecordView({
    approvalId: approval?.id ?? null,
    circulationRecord: originalRecord,
  });
  const corrections = buildDerivedCorrectionViews({
    approvalId: approval?.id ?? null,
    corrections: payload?.circulationCorrections ?? [],
    originalRecord,
  });
  const latestCorrection = corrections.at(-1) ?? null;
  const correctionCount = corrections.length;

  return ReportingCirculationChronologyViewSchema.parse({
    correctionCount,
    corrections,
    effectiveRecord:
      latestCorrection?.effectiveRecord ?? originalEffectiveRecord,
    hasCorrections: correctionCount > 0,
    latestCorrection,
    latestCorrectionSummary: latestCorrection?.summary ?? null,
    summary: buildChronologySummary({
      correctionCount,
      latestCorrection,
    }),
  });
}

export function buildReportingCirculationChronologyViewFromProofBundle(
  input: Pick<
    ProofBundleManifest,
    | "circulationChronology"
    | "circulationRecord"
    | "evidenceCompleteness"
    | "reportKind"
  >,
) {
  if (!isCirculationChronologyReportKind(input.reportKind)) {
    return null;
  }

  const storedDraft = input.evidenceCompleteness.presentArtifactKinds.includes(
    input.reportKind,
  );

  if (!storedDraft) {
    return null;
  }

  if (input.circulationChronology) {
    return ReportingCirculationChronologyViewSchema.parse(
      input.circulationChronology,
    );
  }

  if (!input.circulationRecord?.circulated) {
    return null;
  }

  const effectiveRecord = buildOriginalEffectiveRecordView({
    approvalId: input.circulationRecord.approvalId,
    circulationRecord: {
      circulatedAt: input.circulationRecord.circulatedAt!,
      circulatedBy: input.circulationRecord.circulatedBy!,
      circulationChannel: input.circulationRecord.circulationChannel!,
      circulationNote: input.circulationRecord.circulationNote,
      summary: input.circulationRecord.summary,
    },
  });

  return ReportingCirculationChronologyViewSchema.parse({
    correctionCount: 0,
    corrections: [],
    effectiveRecord,
    hasCorrections: false,
    latestCorrection: null,
    latestCorrectionSummary: null,
    summary:
      "The original circulation record remains the current effective circulation fact. No corrections have been appended.",
  });
}

function buildDerivedCorrectionViews(input: {
  approvalId: string | null;
  corrections: ReportCirculationApprovalCirculationCorrection[];
  originalRecord: ReportCirculationApprovalCirculationRecord;
}) {
  let currentEffective = buildOriginalEffectiveRecordView({
    approvalId: input.approvalId,
    circulationRecord: input.originalRecord,
  });

  return input.corrections.map((correction) => {
    currentEffective = buildCorrectedEffectiveRecordView({
      approvalId: input.approvalId,
      correction,
      currentEffective,
    });

    return ReportingCirculationCorrectionViewSchema.parse({
      correctionKey: correction.correctionKey,
      correctedAt: correction.correctedAt,
      correctedBy: correction.correctedBy,
      correctionReason: correction.correctionReason,
      circulatedAt: correction.circulatedAt,
      circulatedBy: correction.circulatedBy,
      circulationChannel: correction.circulationChannel,
      circulationNote: correction.circulationNote,
      effectiveRecord: currentEffective,
      summary: correction.summary,
    });
  });
}

function buildOriginalEffectiveRecordView(input: {
  approvalId: string | null;
  circulationRecord: ReportCirculationApprovalCirculationRecord;
}) {
  return ReportingCirculationEffectiveRecordViewSchema.parse({
    source: "original_record",
    circulated: true,
    circulatedAt: input.circulationRecord.circulatedAt,
    circulatedBy: input.circulationRecord.circulatedBy,
    circulationChannel: input.circulationRecord.circulationChannel,
    circulationNote: input.circulationRecord.circulationNote,
    approvalId: input.approvalId,
    summary: buildEffectiveRecordSummary({
      circulationChannel: input.circulationRecord.circulationChannel,
      circulationNote: input.circulationRecord.circulationNote,
      circulatedAt: input.circulationRecord.circulatedAt,
      circulatedBy: input.circulationRecord.circulatedBy,
      correctedAt: null,
      correctedBy: null,
      source: "original_record",
    }),
  });
}

function buildCorrectedEffectiveRecordView(input: {
  approvalId: string | null;
  correction: ReportCirculationApprovalCirculationCorrection;
  currentEffective: ReportingCirculationEffectiveRecordView;
}) {
  return ReportingCirculationEffectiveRecordViewSchema.parse({
    source: "latest_correction",
    circulated: true,
    circulatedAt:
      input.correction.circulatedAt ?? input.currentEffective.circulatedAt,
    circulatedBy:
      input.correction.circulatedBy ?? input.currentEffective.circulatedBy,
    circulationChannel:
      input.correction.circulationChannel ??
      input.currentEffective.circulationChannel,
    circulationNote:
      input.correction.circulationNote ??
      input.currentEffective.circulationNote,
    approvalId: input.approvalId,
    summary: buildEffectiveRecordSummary({
      circulationChannel:
        input.correction.circulationChannel ??
        input.currentEffective.circulationChannel,
      circulationNote:
        input.correction.circulationNote ??
        input.currentEffective.circulationNote,
      circulatedAt:
        input.correction.circulatedAt ?? input.currentEffective.circulatedAt,
      circulatedBy:
        input.correction.circulatedBy ?? input.currentEffective.circulatedBy,
      correctedAt: input.correction.correctedAt,
      correctedBy: input.correction.correctedBy,
      source: "latest_correction",
    }),
  });
}

function buildChronologySummary(input: {
  correctionCount: number;
  latestCorrection: ReportingCirculationCorrectionView | null;
}) {
  if (input.correctionCount === 0) {
    return "The original circulation record remains the current effective circulation fact. No corrections have been appended.";
  }

  if (input.latestCorrection) {
    return `${input.correctionCount} circulation correction${input.correctionCount === 1 ? "" : "s"} ${input.correctionCount === 1 ? "has" : "have"} been appended. The latest effective circulation fact reflects the correction logged by ${input.latestCorrection.correctedBy} at ${input.latestCorrection.correctedAt}.`;
  }

  return `${input.correctionCount} circulation correction${input.correctionCount === 1 ? "" : "s"} ${input.correctionCount === 1 ? "has" : "have"} been appended.`;
}

function buildEffectiveRecordSummary(input: {
  circulationChannel: string | null;
  circulationNote: string | null;
  circulatedAt: string | null;
  circulatedBy: string | null;
  correctedAt: string | null;
  correctedBy: string | null;
  source: ReportingCirculationEffectiveRecordView["source"];
}) {
  const note = input.circulationNote
    ? ` Effective note: ${ensureSentencePunctuation(input.circulationNote)}`
    : "";

  if (input.source === "latest_correction") {
    return `Current effective circulation reflects the latest correction logged by ${input.correctedBy ?? "the operator"} at ${input.correctedAt ?? "an unknown time"}: circulated by ${input.circulatedBy ?? "an unknown operator"} at ${input.circulatedAt ?? "an unknown time"} via ${input.circulationChannel ?? "an unknown channel"}.${note}`;
  }

  return `Current effective circulation matches the original record: circulated by ${input.circulatedBy ?? "an unknown operator"} at ${input.circulatedAt ?? "an unknown time"} via ${input.circulationChannel ?? "an unknown channel"}.${note}`;
}

function isCirculationChronologyReportKind(
  reportKind: ProofBundleManifest["reportKind"],
): reportKind is ReportCirculationApprovalReportKind {
  return reportKind === "board_packet";
}

function ensureSentencePunctuation(value: string) {
  const trimmed = value.trimEnd();
  return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
}
