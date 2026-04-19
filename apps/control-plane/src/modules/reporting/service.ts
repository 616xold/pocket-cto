import type {
  ExportReportingMissionMarkdownInput,
  FileReportingMissionArtifactsInput,
  MissionRecord,
  ReportingMissionInput,
  ReportingMissionView,
} from "@pocket-cto/domain";
import {
  CfoWikiExportRunRecordSchema,
  CfoWikiPageRecordSchema,
  ExportReportingMissionMarkdownInputSchema,
  FileReportingMissionArtifactsInputSchema,
  ReportingFiledArtifactsResultSchema,
  ReportingMarkdownExportResultSchema,
  ReportingMissionInputSchema,
  isFinanceDiscoveryAnswerArtifactMetadata,
  readReportingMissionReportKindLabel,
} from "@pocket-cto/domain";
import { AppHttpError, MissionNotFoundError } from "../../lib/http-errors";
import type { CfoWikiServicePort } from "../../lib/types";
import { readMissionDiscoveryAnswer } from "../missions/discovery-answer-view";
import type { MissionRepository } from "../missions/repository";
import { compileBoardPacketArtifacts } from "./board-packet";
import { compileDiligencePacketArtifacts } from "./diligence-packet";
import { compileFinanceMemoArtifacts } from "./formatter";
import { compileLenderUpdateArtifacts } from "./lender-update";
import {
  buildReportingFiledPageKey,
  buildReportingFiledPageProvenanceSummary,
  buildReportingFiledPageTitle,
  buildReportingPublicationView,
} from "./publication";
import { readMissionReportingView } from "./artifact";
import type {
  CompiledReportingArtifacts,
  DiscoveryReportingSourceBundle,
  SourceReportingBundle,
} from "./types";

export class ReportingService {
  constructor(
    private readonly deps: {
      missionRepository: Pick<
        MissionRepository,
        "getMissionById" | "getProofBundleByMissionId" | "listArtifactsByMissionId"
      >;
      cfoWikiService?: Pick<
        CfoWikiServicePort,
        | "createFiledPage"
        | "exportCompanyWiki"
        | "getPage"
        | "listCompanyExports"
        | "listFiledPages"
      >;
    },
  ) {}

  async compileDraftReport(mission: MissionRecord): Promise<CompiledReportingArtifacts> {
    const reportingRequest = readReportingMissionInput(mission);

    if (reportingRequest.reportKind === "board_packet") {
      const source = await this.loadSourceReportingBundle(reportingRequest);
      return compileBoardPacketArtifacts(source);
    }

    if (reportingRequest.reportKind === "lender_update") {
      const source = await this.loadSourceReportingBundle(reportingRequest);
      return compileLenderUpdateArtifacts(source);
    }

    if (reportingRequest.reportKind === "diligence_packet") {
      const source = await this.loadSourceReportingBundle(reportingRequest);
      return compileDiligencePacketArtifacts(source);
    }

    const source = await this.loadDiscoverySourceBundle(reportingRequest);
    return compileFinanceMemoArtifacts(source);
  }

  async readPublicationFacts(input: {
    artifacts: Awaited<ReturnType<MissionRepository["listArtifactsByMissionId"]>>;
    mission: MissionRecord;
    proofBundle: Awaited<ReturnType<MissionRepository["getProofBundleByMissionId"]>>;
  }) {
    const proofBundle = input.proofBundle;

    if (!proofBundle) {
      return null;
    }

    const reporting = readMissionReportingView({
      artifacts: input.artifacts,
      proofBundle,
    });

    if (!reporting) {
      return null;
    }

    if (reporting.reportKind !== "finance_memo") {
      return null;
    }

    if (!reporting.companyKey) {
      return {
        filedEvidenceAppendix: null,
        filedMemo: null,
        latestMarkdownExport: null,
        publication: buildReportingPublicationView({
          filedEvidenceAppendix: null,
          filedMemo: null,
          latestMarkdownExport: null,
          storedDraft: Boolean(reporting.financeMemo && reporting.evidenceAppendix),
        }),
      };
    }

    const cfoWikiService = this.requireCfoWikiService();
    const [filedPages, exports] = await Promise.all([
      cfoWikiService.listFiledPages(reporting.companyKey),
      cfoWikiService.listCompanyExports(reporting.companyKey),
    ]);
    const memoPageKey = buildReportingFiledPageKey({
      artifactKind: "finance_memo",
      missionId: input.mission.id,
    });
    const appendixPageKey = buildReportingFiledPageKey({
      artifactKind: "evidence_appendix",
      missionId: input.mission.id,
    });
    const [filedMemo, filedEvidenceAppendix] = await Promise.all([
      filedPages.pages.some((page) => page.pageKey === memoPageKey)
        ? cfoWikiService
            .getPage(reporting.companyKey, memoPageKey)
            .then((view) => parsePageRecord(view.page))
        : Promise.resolve(null),
      filedPages.pages.some((page) => page.pageKey === appendixPageKey)
        ? cfoWikiService
            .getPage(reporting.companyKey, appendixPageKey)
            .then((view) => parsePageRecord(view.page))
        : Promise.resolve(null),
    ]);
    const latestExport = [...exports.exports].sort((left, right) => {
      const leftTimestamp = left.completedAt ?? left.updatedAt ?? left.createdAt;
      const rightTimestamp =
        right.completedAt ?? right.updatedAt ?? right.createdAt;
      return (
        rightTimestamp.localeCompare(leftTimestamp) ||
        right.id.localeCompare(left.id)
      );
    })[0];
    const latestMarkdownExport = latestExport
      ? parseExportRunRecord(latestExport)
      : null;

    return {
      filedEvidenceAppendix,
      filedMemo,
      latestMarkdownExport,
      publication: buildReportingPublicationView({
        filedEvidenceAppendix,
        filedMemo,
        latestMarkdownExport,
        storedDraft: Boolean(reporting.financeMemo && reporting.evidenceAppendix),
      }),
    };
  }

  async fileDraftArtifacts(
    missionId: string,
    rawInput: FileReportingMissionArtifactsInput,
  ) {
    const request = FileReportingMissionArtifactsInputSchema.parse(rawInput);
    const context = await this.loadReportingMissionContext(missionId);
    const reporting = requireStoredReportingView(context);
    const companyKey = requireCompanyKey(reporting, missionId);
    const publicationFacts = await this.readPublicationFacts(context);
    const cfoWikiService = this.requireCfoWikiService();
    const filings = [
      {
        artifactKind: "finance_memo" as const,
        bodyMarkdown: reporting.financeMemo.bodyMarkdown,
      },
      {
        artifactKind: "evidence_appendix" as const,
        bodyMarkdown: reporting.evidenceAppendix.bodyMarkdown,
      },
    ];

    for (const filing of filings) {
      const pageKey = buildReportingFiledPageKey({
        artifactKind: filing.artifactKind,
        missionId,
      });
      const alreadyFiled =
        filing.artifactKind === "finance_memo"
          ? publicationFacts?.publication.filedMemo?.pageKey === pageKey
          : publicationFacts?.publication.filedEvidenceAppendix?.pageKey ===
            pageKey;

      if (alreadyFiled) {
        continue;
      }

      await cfoWikiService.createFiledPage(companyKey, {
        filedBy: request.filedBy,
        markdownBody: filing.bodyMarkdown,
        pageKey,
        provenanceSummary: buildReportingFiledPageProvenanceSummary({
          artifactKind: filing.artifactKind,
          reportingMissionId: missionId,
          sourceDiscoveryMissionId: reporting.sourceDiscoveryMissionId,
        }),
        title: buildReportingFiledPageTitle({
          artifactKind: filing.artifactKind,
          companyKey,
          missionId,
        }),
      });
    }

    const nextPublication = await this.readPublicationFacts(context);

    return ReportingFiledArtifactsResultSchema.parse({
      missionId,
      companyKey,
      publication: nextPublication?.publication ?? publicationFacts?.publication,
    });
  }

  async exportMarkdownBundle(
    missionId: string,
    rawInput: ExportReportingMissionMarkdownInput,
  ) {
    const request = ExportReportingMissionMarkdownInputSchema.parse(rawInput);
    const context = await this.loadReportingMissionContext(missionId);
    const reporting = requireStoredReportingView(context);
    const companyKey = requireCompanyKey(reporting, missionId);
    const publicationFacts = await this.readPublicationFacts(context);

    if (
      !publicationFacts?.publication.filedMemo ||
      !publicationFacts.publication.filedEvidenceAppendix
    ) {
      throw invalidRequest(
        "missionId",
        `Reporting mission ${missionId} must file both the draft memo and evidence appendix into the CFO Wiki before markdown export can run.`,
      );
    }

    await this.requireCfoWikiService().exportCompanyWiki(companyKey, {
      triggeredBy: request.triggeredBy,
    });
    const nextPublication = await this.readPublicationFacts(context);

    return ReportingMarkdownExportResultSchema.parse({
      missionId,
      companyKey,
      publication: nextPublication?.publication ?? publicationFacts.publication,
    });
  }

  private async loadDiscoverySourceBundle(
    reportingRequest: ReportingMissionInput,
  ): Promise<DiscoveryReportingSourceBundle> {
    const sourceDiscoveryMission =
      await this.deps.missionRepository.getMissionById(
        reportingRequest.sourceDiscoveryMissionId,
      );

    if (!sourceDiscoveryMission) {
      throw new Error(
        `Source discovery mission ${reportingRequest.sourceDiscoveryMissionId} is missing.`,
      );
    }

    if (sourceDiscoveryMission.type !== "discovery") {
      throw new Error(
        `Source mission ${sourceDiscoveryMission.id} is ${sourceDiscoveryMission.type}, not discovery.`,
      );
    }

    if (sourceDiscoveryMission.status !== "succeeded") {
      throw new Error(
        `Source discovery mission ${sourceDiscoveryMission.id} must be succeeded before reporting compilation.`,
      );
    }

    const artifacts = await this.deps.missionRepository.listArtifactsByMissionId(
      sourceDiscoveryMission.id,
    );
    const discoveryAnswer = readMissionDiscoveryAnswer(artifacts);

    if (!discoveryAnswer) {
      throw new Error(
        `Source discovery mission ${sourceDiscoveryMission.id} has no stored discovery answer artifact.`,
      );
    }

    if (!isFinanceDiscoveryAnswerArtifactMetadata(discoveryAnswer)) {
      throw new Error(
        `Source discovery mission ${sourceDiscoveryMission.id} has a non-finance discovery answer that F5A reporting cannot compile.`,
      );
    }

    const discoveryAnswerArtifact = artifacts.find(
      (artifact) => artifact.kind === "discovery_answer",
    );

    if (!discoveryAnswerArtifact) {
      throw new Error(
        `Source discovery mission ${sourceDiscoveryMission.id} is missing a discovery answer artifact row.`,
      );
    }

    const sourceProofBundle =
      await this.deps.missionRepository.getProofBundleByMissionId(
        sourceDiscoveryMission.id,
      );
    const sourceProofBundleArtifact =
      [...artifacts]
        .filter((artifact) => artifact.kind === "proof_bundle_manifest")
        .sort(
          (left, right) =>
            right.createdAt.localeCompare(left.createdAt) ||
            right.id.localeCompare(left.id),
        )[0] ?? null;

    return {
      discoveryAnswer,
      discoveryAnswerArtifactId: discoveryAnswerArtifact.id,
      sourceDiscoveryMission,
      sourceProofBundle,
      sourceProofBundleArtifactId: sourceProofBundleArtifact?.id ?? null,
    };
  }

  private async loadSourceReportingBundle(
    reportingRequest: ReportingMissionInput,
  ): Promise<SourceReportingBundle> {
    const sourceReportingMissionId = reportingRequest.sourceReportingMissionId;
    const reportKindLabel = readReportingMissionReportKindLabel(
      reportingRequest.reportKind,
    );

    if (!sourceReportingMissionId) {
      throw new Error(
        `${reportKindLabel} reporting requires a source reporting mission.`,
      );
    }

    const sourceReportingMission =
      await this.deps.missionRepository.getMissionById(sourceReportingMissionId);

    if (!sourceReportingMission) {
      throw new Error(
        `Source reporting mission ${sourceReportingMissionId} is missing.`,
      );
    }

    if (sourceReportingMission.type !== "reporting") {
      throw new Error(
        `Source mission ${sourceReportingMission.id} is ${sourceReportingMission.type}, not reporting.`,
      );
    }

    if (sourceReportingMission.status !== "succeeded") {
      throw new Error(
        `Source reporting mission ${sourceReportingMission.id} must be succeeded before ${reportKindLabel.toLowerCase()} compilation.`,
      );
    }

    const [artifacts, sourceProofBundle] = await Promise.all([
      this.deps.missionRepository.listArtifactsByMissionId(sourceReportingMission.id),
      this.deps.missionRepository.getProofBundleByMissionId(sourceReportingMission.id),
    ]);

    if (!sourceProofBundle) {
      throw new Error(
        `Source reporting mission ${sourceReportingMission.id} is missing a proof bundle.`,
      );
    }

    const sourceReportingView = readMissionReportingView({
      artifacts,
      proofBundle: sourceProofBundle,
    });

    if (!sourceReportingView) {
      throw new Error(
        `Source reporting mission ${sourceReportingMission.id} has no persisted reporting view.`,
      );
    }

    if (sourceReportingView.reportKind !== "finance_memo") {
      throw new Error(
        `Source reporting mission ${sourceReportingMission.id} has report kind ${sourceReportingView.reportKind}, not finance_memo.`,
      );
    }

    if (!sourceReportingView.financeMemo || !sourceReportingView.evidenceAppendix) {
      throw new Error(
        `Source reporting mission ${sourceReportingMission.id} must store both finance_memo and evidence_appendix artifacts before ${reportKindLabel.toLowerCase()} compilation.`,
      );
    }

    const sourceFinanceMemoArtifactId = readLatestArtifactId(
      artifacts,
      "finance_memo",
    );
    const sourceEvidenceAppendixArtifactId = readLatestArtifactId(
      artifacts,
      "evidence_appendix",
    );

    if (!sourceFinanceMemoArtifactId || !sourceEvidenceAppendixArtifactId) {
      throw new Error(
        `Source reporting mission ${sourceReportingMission.id} is missing stored source artifact rows required for ${reportKindLabel.toLowerCase()} compilation.`,
      );
    }

    return {
      sourceEvidenceAppendixArtifactId,
      sourceFinanceMemoArtifactId,
      sourceProofBundle,
      sourceReportingMission,
      sourceReportingView: {
        ...sourceReportingView,
        evidenceAppendix: sourceReportingView.evidenceAppendix,
        financeMemo: sourceReportingView.financeMemo,
      },
    };
  }

  private async loadReportingMissionContext(missionId: string) {
    const mission = await this.deps.missionRepository.getMissionById(missionId);

    if (!mission) {
      throw new MissionNotFoundError(missionId);
    }

    if (mission.type !== "reporting") {
      throw invalidRequest(
        "missionId",
        `Mission ${missionId} is ${mission.type}, not a reporting mission.`,
      );
    }

    if (mission.status !== "succeeded") {
      throw invalidRequest(
        "missionId",
        `Reporting mission ${missionId} must have status \`succeeded\` before filing or export can run.`,
      );
    }

    const [artifacts, proofBundle] = await Promise.all([
      this.deps.missionRepository.listArtifactsByMissionId(missionId),
      this.deps.missionRepository.getProofBundleByMissionId(missionId),
    ]);

    if (!proofBundle) {
      throw new Error(`Reporting mission ${missionId} is missing a proof bundle.`);
    }

    return {
      artifacts,
      mission,
      proofBundle,
    };
  }

  private requireCfoWikiService() {
    if (!this.deps.cfoWikiService) {
      throw new Error("Reporting publication actions require the CFO Wiki service.");
    }

    return this.deps.cfoWikiService;
  }
}

function readReportingMissionInput(mission: MissionRecord) {
  const parsed = ReportingMissionInputSchema.safeParse(
    mission.spec.input?.reportingRequest,
  );

  if (!parsed.success) {
    throw new Error(`Reporting mission ${mission.id} is missing reporting input.`);
  }

  return parsed.data;
}

function requireStoredReportingView(input: {
  artifacts: Awaited<ReturnType<MissionRepository["listArtifactsByMissionId"]>>;
  proofBundle: Awaited<ReturnType<MissionRepository["getProofBundleByMissionId"]>>;
}): ReportingMissionView & {
  evidenceAppendix: NonNullable<ReportingMissionView["evidenceAppendix"]>;
  financeMemo: NonNullable<ReportingMissionView["financeMemo"]>;
} {
  if (!input.proofBundle) {
    throw invalidRequest(
      "missionId",
      "The reporting mission does not yet have a persisted proof bundle required for filing and export.",
    );
  }

  const reporting = readMissionReportingView({
    artifacts: input.artifacts,
    proofBundle: input.proofBundle,
  });

    if (!reporting?.financeMemo || !reporting.evidenceAppendix) {
      if (
        reporting?.reportKind === "board_packet" ||
        reporting?.reportKind === "lender_update" ||
        reporting?.reportKind === "diligence_packet"
      ) {
        throw invalidRequest(
          "missionId",
        "Specialized reporting stays draft-only in F5C and cannot file or export through the finance-memo publication path.",
      );
    }

    throw invalidRequest(
      "missionId",
      "The reporting mission does not yet have both stored draft artifacts required for filing and export.",
    );
  }

  return {
    ...reporting,
    evidenceAppendix: reporting.evidenceAppendix,
    financeMemo: reporting.financeMemo,
  };
}

function requireCompanyKey(
  reporting: ReturnType<typeof requireStoredReportingView>,
  missionId: string,
) {
  if (!reporting.companyKey) {
    throw invalidRequest(
      "missionId",
      `Reporting mission ${missionId} has no company scope, so it cannot file into the CFO Wiki or trigger markdown export.`,
    );
  }

  return reporting.companyKey;
}

function invalidRequest(path: string, message: string) {
  return new AppHttpError(400, {
    error: {
      code: "invalid_request",
      message: "Invalid request",
      details: [
        {
          path,
          message,
        },
      ],
    },
  });
}

function parsePageRecord(page: unknown) {
  return CfoWikiPageRecordSchema.parse(page);
}

function parseExportRunRecord(
  exportRun: unknown,
) {
  return CfoWikiExportRunRecordSchema.parse(exportRun);
}

function readLatestArtifactId(
  artifacts: Awaited<ReturnType<MissionRepository["listArtifactsByMissionId"]>>,
  kind: Awaited<
    ReturnType<MissionRepository["listArtifactsByMissionId"]>
  >[number]["kind"],
) {
  return (
    [...artifacts]
      .filter((artifact) => artifact.kind === kind)
      .sort(
        (left, right) =>
          right.createdAt.localeCompare(left.createdAt) ||
          right.id.localeCompare(left.id),
      )[0]?.id ?? null
  );
}
