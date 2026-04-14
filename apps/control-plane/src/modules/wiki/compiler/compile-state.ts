import type {
  CfoWikiFreshnessSummary,
  FinanceCompanyRecord,
  FinanceFreshnessSummary,
  FinanceReportingPeriodRecord,
  FinanceTwinSyncRunRecord,
  SourceFileRecord,
  SourceRecord,
  SourceSnapshotRecord,
} from "@pocket-cto/domain";
import { buildFinanceSliceFreshnessSummary } from "../../finance-twin/freshness";
import type { FinanceTwinRepository } from "../../finance-twin/repository";
import type { SourceRepository } from "../../sources/repository";
import type { SourceFileStorage } from "../../sources/storage";
import type { CfoWikiRepository } from "../repository";
import {
  WIKI_SLICE_DESCRIPTORS,
  type WikiCompileState,
  type WikiSliceState,
} from "./page-registry";
import { resolveCompiledDocumentSources } from "./document-state";

const SOURCE_COVERAGE_LIMITATION =
  "Source coverage is derived only from Finance Twin sync runs linked to this company because the F1 source registry is authoritative but not company-keyed yet.";
const DETERMINISTIC_F3_LIMITATION =
  "F3 pages remain deterministic compiler-owned artifacts. They do not call runtime-codex, use freeform LLM synthesis, or treat generated prose as a source of truth.";
const DOCUMENT_BINDING_LIMITATION =
  "F3 document-derived pages compile only for sources explicitly bound to the company inside the wiki bounded context; unbound document sources are excluded.";
const DOCUMENT_EXTRACTION_LIMITATION =
  "F3 document-derived pages currently support deterministic markdown and plain-text extraction from stored raw bytes. Unsupported PDFs, scans, image-only files, or unreadable documents remain visible as gaps instead of synthesized digests.";
const KNOWLEDGE_REGISTRY_LIMITATION =
  "F3D concept and metric-definition pages come only from fixed code-owned registries; unsupported finance areas stay absent rather than being inferred heuristically.";
const POLICY_SCOPE_LIMITATION =
  "F3D policy pages compile only from explicit `policy_document` bindings and stored deterministic extracts; they do not infer policy scope from filenames or vague document names.";

type LoadedSourceInventoryRecord = {
  source: SourceRecord;
  snapshot: SourceSnapshotRecord;
  sourceFile: SourceFileRecord;
};

export async function loadWikiCompileState(input: {
  company: FinanceCompanyRecord;
  financeTwinRepository: Pick<
    FinanceTwinRepository,
    | "countLedgerAccountsByCompanyId"
    | "countReportingPeriodsByCompanyId"
    | "getLatestSuccessfulSyncRunByCompanyIdAndExtractorKey"
    | "getLatestSyncRunByCompanyIdAndExtractorKey"
    | "getReportingPeriodById"
    | "listReportingPeriodsByCompanyId"
  >;
  now: Date;
  priorCompletedRuns: WikiCompileState["priorCompletedRuns"];
  sourceFileStorage: Pick<SourceFileStorage, "read">;
  sourceRepository: Pick<
    SourceRepository,
    | "getSnapshotById"
    | "getSourceById"
    | "getSourceFileById"
    | "listSnapshotsBySourceId"
    | "listSourceFilesBySourceId"
  >;
  wikiRepository: Pick<
    CfoWikiRepository,
    "listDocumentExtractsByCompanyId" | "listSourceBindingsByCompanyId"
  >;
}): Promise<WikiCompileState> {
  const [
    ledgerAccountCount,
    reportingPeriodCount,
    reportingPeriods,
    slices,
    compiledDocumentSources,
  ] =
    await Promise.all([
      input.financeTwinRepository.countLedgerAccountsByCompanyId(
        input.company.id,
      ),
      input.financeTwinRepository.countReportingPeriodsByCompanyId(
        input.company.id,
      ),
      input.financeTwinRepository.listReportingPeriodsByCompanyId(input.company.id),
      Promise.all(
        WIKI_SLICE_DESCRIPTORS.map(async (descriptor) =>
          loadWikiSliceState({
            companyId: input.company.id,
            descriptor,
            financeTwinRepository: input.financeTwinRepository,
            now: input.now,
            sourceRepository: input.sourceRepository,
          }),
        ),
      ),
      resolveCompiledDocumentSources({
        companyId: input.company.id,
        now: input.now,
        sourceFileStorage: input.sourceFileStorage,
        sourceRepository: input.sourceRepository,
        wikiRepository: input.wikiRepository,
      }),
    ]);

  const overallFreshnessSummary = buildOverallFreshnessSummary(slices);
  const generalLimitations = buildGeneralLimitations({
    compiledDocumentSources,
    overallFreshnessSummary,
    reportingPeriods,
    slices,
  });

  return {
    company: input.company,
    companyTotals: {
      ledgerAccountCount,
      reportingPeriodCount,
    },
    compiledDocumentSources,
    derivedSourceCoverageLimitation: SOURCE_COVERAGE_LIMITATION,
    generalLimitations,
    overallFreshnessSummary,
    priorCompletedRuns: input.priorCompletedRuns,
    reportingPeriods,
    slices,
  };
}

async function loadWikiSliceState(input: {
  companyId: string;
  descriptor: WikiSliceState["descriptor"];
  financeTwinRepository: Pick<
    FinanceTwinRepository,
    | "getLatestSuccessfulSyncRunByCompanyIdAndExtractorKey"
    | "getLatestSyncRunByCompanyIdAndExtractorKey"
    | "getReportingPeriodById"
  >;
  now: Date;
  sourceRepository: Pick<
    SourceRepository,
    "getSnapshotById" | "getSourceById" | "getSourceFileById"
  >;
}): Promise<WikiSliceState> {
  const [latestAttemptedRun, latestSuccessfulRun] = await Promise.all([
    input.financeTwinRepository.getLatestSyncRunByCompanyIdAndExtractorKey(
      input.companyId,
      input.descriptor.extractorKey,
    ),
    input.financeTwinRepository.getLatestSuccessfulSyncRunByCompanyIdAndExtractorKey(
      input.companyId,
      input.descriptor.extractorKey,
    ),
  ]);
  const periodRun = latestSuccessfulRun ?? latestAttemptedRun;
  const [reportingPeriod, latestAttemptedSource, latestSuccessfulSource] =
    await Promise.all([
      periodRun?.reportingPeriodId
        ? requireReportingPeriod(
            input.financeTwinRepository,
            periodRun.reportingPeriodId,
          )
        : Promise.resolve(null),
      loadSourceInventoryRecord(latestAttemptedRun, input.sourceRepository),
      loadSourceInventoryRecord(latestSuccessfulRun, input.sourceRepository),
    ]);

  return {
    descriptor: input.descriptor,
    freshness: buildFinanceSliceFreshnessSummary({
      latestRun: latestAttemptedRun,
      latestSuccessfulRun,
      now: input.now,
      sliceLabel: input.descriptor.pageLabel,
    }),
    latestAttemptedRun,
    latestAttemptedSource,
    latestSuccessfulRun,
    latestSuccessfulSource,
    reportingPeriod,
  };
}

async function requireReportingPeriod(
  repository: Pick<FinanceTwinRepository, "getReportingPeriodById">,
  reportingPeriodId: string,
) {
  const reportingPeriod = await repository.getReportingPeriodById(
    reportingPeriodId,
  );

  if (!reportingPeriod) {
    throw new Error(
      `Finance reporting period ${reportingPeriodId} referenced by the CFO Wiki compile was not found`,
    );
  }

  return reportingPeriod;
}

async function loadSourceInventoryRecord(
  syncRun: FinanceTwinSyncRunRecord | null,
  repository: Pick<
    SourceRepository,
    "getSnapshotById" | "getSourceById" | "getSourceFileById"
  >,
): Promise<LoadedSourceInventoryRecord | null> {
  if (!syncRun) {
    return null;
  }

  const [source, snapshot, sourceFile] = await Promise.all([
    repository.getSourceById(syncRun.sourceId),
    repository.getSnapshotById(syncRun.sourceSnapshotId),
    repository.getSourceFileById(syncRun.sourceFileId),
  ]);

  if (!source || !snapshot || !sourceFile) {
    throw new Error(
      `Finance twin sync run ${syncRun.id} references missing source inventory records`,
    );
  }

  return {
    source,
    snapshot,
    sourceFile,
  };
}

function buildGeneralLimitations(input: {
  compiledDocumentSources: WikiCompileState["compiledDocumentSources"];
  overallFreshnessSummary: CfoWikiFreshnessSummary;
  reportingPeriods: FinanceReportingPeriodRecord[];
  slices: WikiSliceState[];
}) {
  const limitations = [
    DETERMINISTIC_F3_LIMITATION,
    DOCUMENT_BINDING_LIMITATION,
    DOCUMENT_EXTRACTION_LIMITATION,
    KNOWLEDGE_REGISTRY_LIMITATION,
    POLICY_SCOPE_LIMITATION,
    SOURCE_COVERAGE_LIMITATION,
  ];

  if (input.reportingPeriods.length === 0) {
    limitations.push(
      "No Finance Twin reporting periods are stored yet, so the CFO Wiki compiler cannot compile any period index pages for this company.",
    );
  }

  if (input.slices.every((slice) => slice.latestSuccessfulRun === null)) {
    limitations.push(
      "No Finance Twin slice has completed successfully for this company yet, so the wiki surfaces missing coverage instead of synthesized facts.",
    );
  }

  const failedSlices = input.slices.filter(
    (slice) => slice.latestAttemptedRun?.status === "failed",
  );

  if (failedSlices.length > 0) {
    limitations.push(
      `Latest sync failures remain visible for: ${failedSlices
        .map((slice) => slice.descriptor.pageLabel)
        .join(", ")}.`,
    );
  }

  const missingAttemptedSlices = input.slices.filter(
    (slice) => slice.latestAttemptedRun === null,
  );

  if (missingAttemptedSlices.length > 0) {
    limitations.push(
      `No sync attempt has been recorded yet for: ${missingAttemptedSlices
        .map((slice) => slice.descriptor.pageLabel)
        .join(", ")}.`,
    );
  }

  if (input.overallFreshnessSummary.state === "mixed") {
    limitations.push(
      "Freshness is mixed across supported finance slices, so page summaries may combine fresh, stale, failed, and missing coverage.",
    );
  }

  if (input.compiledDocumentSources.length === 0) {
    limitations.push(
      "No company-scoped wiki document bindings are currently included in compile for this company, so source digest and policy pages are absent.",
    );
  }

  return [...new Set(limitations)];
}

function buildOverallFreshnessSummary(
  slices: WikiSliceState[],
): CfoWikiFreshnessSummary {
  const counts = new Map<FinanceFreshnessSummary["state"], number>();

  for (const slice of slices) {
    counts.set(
      slice.freshness.state,
      (counts.get(slice.freshness.state) ?? 0) + 1,
    );
  }

  const activeStates: FinanceFreshnessSummary["state"][] = [...counts.entries()]
    .filter(([, count]) => count > 0)
    .map(([state]) => state);
  const onlyState = activeStates.length === 1 ? activeStates[0]! : null;
  const state =
    onlyState === null ? ("mixed" as const) : toWikiFreshnessState(onlyState);
  const summary = [...counts.entries()]
    .filter(([, count]) => count > 0)
    .map(([freshnessState, count]) => `${count} ${freshnessState}`)
    .join(", ");

  return {
    state,
    summary:
      summary.length > 0
        ? `The CFO Wiki compiler supports ${slices.length} finance slices; current coverage is ${summary}.`
        : "The CFO Wiki compiler has not observed any supported finance slice state for this company yet.",
  };
}

function toWikiFreshnessState(
  state: FinanceFreshnessSummary["state"],
): CfoWikiFreshnessSummary["state"] {
  switch (state) {
    case "fresh":
      return "fresh";
    case "stale":
      return "stale";
    case "missing":
      return "missing";
    case "failed":
      return "failed";
  }
}
