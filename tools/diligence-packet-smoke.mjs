import { createHash } from "node:crypto";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildApp } from "../apps/control-plane/src/app.ts";
import { createEmbeddedWorkerContainer } from "../apps/control-plane/src/bootstrap.ts";
import { closeAllPools } from "../packages/db/src/client.ts";
import { buildRunTag, loadNearestEnvFile, wait } from "./m2-exit-utils.mjs";

const DEFAULT_COMPANY_KEY = "local-diligence-packet-company";
const DEFAULT_COMPANY_NAME = "Local Diligence Packet Company";
const DEFAULT_CREATED_BY = "diligence-packet-smoke";
const MODULE_PATH = fileURLToPath(import.meta.url);
const POLL_INTERVAL_MS = 250;
const MAX_POLLS = 40;
const QUESTION_KIND = "cash_posture";
const OPERATOR_PROMPT = "What is our current cash posture from stored state?";
const SILENT_LOGGER = {
  error() {},
  info() {},
};

function parseArgs(argv) {
  const options = {
    companyKey: DEFAULT_COMPANY_KEY,
    companyName: DEFAULT_COMPANY_NAME,
    createdBy: DEFAULT_CREATED_BY,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const entry = argv[index];

    if (!entry?.startsWith("--")) {
      throw new Error(`Unexpected argument: ${entry}`);
    }

    const [rawFlag, inlineValue] = entry.slice(2).split("=", 2);
    const value = inlineValue ?? argv[index + 1];

    if (inlineValue === undefined) {
      index += 1;
    }

    if (value === undefined) {
      throw new Error(`Missing value for --${rawFlag}`);
    }

    switch (rawFlag) {
      case "company-key":
        options.companyKey = value;
        break;
      case "company-name":
        options.companyName = value;
        break;
      case "created-by":
        options.createdBy = value;
        break;
      default:
        throw new Error(`Unexpected argument: --${rawFlag}`);
    }
  }

  return options;
}

function buildFixture(input) {
  const seedText = JSON.stringify(
    {
      createdBy: input.createdBy,
      note: "Seed snapshot for the packaged F5C3 diligence packet smoke.",
      requestedBy: "diligence_packet_smoke",
      runTag: input.runTag,
    },
    null,
    2,
  );
  const uploadText = [
    "account_name,bank,last4,statement_balance,available_balance,current_balance,currency,as_of",
    `Operating Checking,First National,1234,1200.00,1000.00,,USD,${input.primaryAsOfDate}`,
    "Payroll Reserve,First National,5678,,,250.00,USD,",
    `Treasury Sweep,First National,9012,,400.00,,USD,${input.secondaryAsOfDate}`,
    `Euro Operating,Euro Bank,9999,300.00,,,EUR,${input.primaryAsOfDate}`,
  ].join("\n");

  return {
    createdBy: input.createdBy,
    companyKey: `${input.companyKey}-${input.runTag.toLowerCase()}`,
    companyName: `${input.companyName} ${input.runTag}`,
    sourceName: `Diligence packet smoke ${input.runTag}`,
    seed: {
      body: Buffer.from(`${seedText}\n`, "utf8"),
      mediaType: "application/json",
      originalFileName: `diligence-packet-seed-${input.runTag}.json`,
    },
    upload: {
      body: Buffer.from(`${uploadText}\n`, "utf8"),
      mediaType: "text/csv",
      originalFileName: `bank-account-summary-${input.runTag}.csv`,
    },
  };
}

async function main() {
  loadNearestEnvFile();

  const options = parseArgs(process.argv.slice(2).filter((entry) => entry !== "--"));
  const runTag = buildRunTag();
  const now = new Date();
  const primaryAsOfDate = now.toISOString().slice(0, 10);
  const secondaryAsOfDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  const fixture = buildFixture({
    ...options,
    primaryAsOfDate,
    runTag,
    secondaryAsOfDate,
  });
  const capturedAt = now.toISOString();
  const seedSnapshot = await writeSeedSnapshot(fixture.seed);
  let app = null;
  let container = null;

  try {
    container = await createEmbeddedWorkerContainer();
    app = await buildApp({ container });
    app.log.level = "silent";

    const createdSource = await injectJson(app, {
      expectedStatus: 201,
      method: "POST",
      payload: {
        createdBy: fixture.createdBy,
        description: "Packaged F5C3 diligence packet smoke source.",
        kind: "dataset",
        name: fixture.sourceName,
        snapshot: {
          capturedAt,
          checksumSha256: seedSnapshot.checksumSha256,
          mediaType: fixture.seed.mediaType,
          originalFileName: fixture.seed.originalFileName,
          sizeBytes: fixture.seed.body.byteLength,
          storageKind: "local_path",
          storageRef: seedSnapshot.storageRef,
        },
      },
      url: "/sources",
    });
    const sourceId = requireUuid(createdSource?.source?.id, "source id");
    const uploaded = await injectJson(app, {
      expectedStatus: 201,
      headers: {
        "content-type": "application/octet-stream",
      },
      method: "POST",
      payload: fixture.upload.body,
      url: `/sources/${sourceId}/files?${new URLSearchParams({
        capturedAt,
        createdBy: fixture.createdBy,
        mediaType: fixture.upload.mediaType,
        originalFileName: fixture.upload.originalFileName,
      }).toString()}`,
    });
    const sourceFileId = requireUuid(uploaded?.sourceFile?.id, "source file id");
    const financeSync = await injectJson(app, {
      expectedStatus: 201,
      method: "POST",
      payload: {
        companyName: fixture.companyName,
      },
      url: `/finance-twin/companies/${fixture.companyKey}/source-files/${sourceFileId}/sync`,
    });
    const wikiCompile = await injectJson(app, {
      expectedStatus: 201,
      method: "POST",
      payload: {
        triggeredBy: fixture.createdBy,
      },
      url: `/cfo-wiki/companies/${fixture.companyKey}/compile`,
    });

    const [bankAccounts, cashPosture, cashMetricPage, cashConceptPage, companyOverview] =
      await Promise.all([
        injectJson(app, {
          expectedStatus: 200,
          method: "GET",
          url: `/finance-twin/companies/${fixture.companyKey}/bank-accounts`,
        }),
        injectJson(app, {
          expectedStatus: 200,
          method: "GET",
          url: `/finance-twin/companies/${fixture.companyKey}/cash-posture`,
        }),
        injectJson(app, {
          expectedStatus: 200,
          method: "GET",
          url: `/cfo-wiki/companies/${fixture.companyKey}/pages/${encodeURIComponent("metrics/cash-posture")}`,
        }),
        injectJson(app, {
          expectedStatus: 200,
          method: "GET",
          url: `/cfo-wiki/companies/${fixture.companyKey}/pages/${encodeURIComponent("concepts/cash")}`,
        }),
        injectJson(app, {
          expectedStatus: 200,
          method: "GET",
          url: `/cfo-wiki/companies/${fixture.companyKey}/pages/${encodeURIComponent("company/overview")}`,
        }),
      ]);

    assert(
      bankAccounts.accountCount === 4,
      `Expected four persisted bank accounts, received ${bankAccounts.accountCount}.`,
    );
    assert(
      cashPosture.currencyBuckets.some((bucket) => bucket.currency === "USD"),
      "Expected cash posture to include a USD currency bucket.",
    );
    assert(
      wikiCompile.changedPageKeys.includes("metrics/cash-posture") &&
        wikiCompile.changedPageKeys.includes("concepts/cash") &&
        wikiCompile.changedPageKeys.includes("company/overview"),
      "Expected the CFO Wiki compile to include the cash-posture, cash concept, and company overview pages.",
    );
    assert(
      cashMetricPage.page.pageKey === "metrics/cash-posture" &&
        cashConceptPage.page.pageKey === "concepts/cash" &&
        companyOverview.page.pageKey === "company/overview",
      "Expected the related CFO Wiki pages to be readable before mission execution.",
    );

    const createdDiscoveryMission = await injectJson(app, {
      expectedStatus: 201,
      method: "POST",
      payload: {
        companyKey: fixture.companyKey,
        operatorPrompt: OPERATOR_PROMPT,
        questionKind: QUESTION_KIND,
        requestedBy: fixture.createdBy,
      },
      url: "/missions/analysis",
    });
    const discoveryDetail = await pollMissionDetail({
      app,
      missionId: createdDiscoveryMission.mission.id,
      worker: container.worker,
    });
    const sourceDiscoveryAnswer = discoveryDetail.discoveryAnswer;
    const sourceDiscoveryAnswerArtifact =
      discoveryDetail.artifacts.find((artifact) => artifact.kind === "discovery_answer") ??
      null;
    const sourceProofBundleArtifact =
      discoveryDetail.artifacts.find(
        (artifact) => artifact.kind === "proof_bundle_manifest",
      ) ?? null;

    assert(
      discoveryDetail.mission.type === "discovery" &&
        discoveryDetail.mission.status === "succeeded",
      "Expected the source discovery mission to succeed before reporting starts.",
    );
    assert(
      sourceDiscoveryAnswer !== null,
      "Expected the source discovery mission to persist a finance discovery answer.",
    );
    assert(
      sourceDiscoveryAnswerArtifact !== null && sourceProofBundleArtifact !== null,
      "Expected the source discovery mission to persist discovery_answer and proof_bundle_manifest artifacts.",
    );
    assert(
      discoveryDetail.proofBundle.status === "ready",
      "Expected the source discovery proof bundle to be ready before reporting starts.",
    );

    const createdReportingMission = await injectJson(app, {
      expectedStatus: 201,
      method: "POST",
      payload: {
        requestedBy: fixture.createdBy,
        reportKind: "finance_memo",
        sourceDiscoveryMissionId: discoveryDetail.mission.id,
      },
      url: "/missions/reporting",
    });
    const reportingDetail = await pollMissionDetail({
      app,
      missionId: createdReportingMission.mission.id,
      worker: container.worker,
    });
    const financeMemoArtifact =
      reportingDetail.artifacts.find((artifact) => artifact.kind === "finance_memo") ??
      null;
    const evidenceAppendixArtifact =
      reportingDetail.artifacts.find(
        (artifact) => artifact.kind === "evidence_appendix",
      ) ?? null;
    const reportingProofBundleArtifact =
      reportingDetail.artifacts.find(
        (artifact) => artifact.kind === "proof_bundle_manifest",
      ) ?? null;

    assert(
      reportingDetail.mission.type === "reporting" &&
        reportingDetail.mission.status === "succeeded",
      "Expected the source reporting mission to be a succeeded reporting mission.",
    );
    assert(
      reportingDetail.reporting?.reportKind === "finance_memo" &&
        reportingDetail.reporting.financeMemo !== null &&
        reportingDetail.reporting.evidenceAppendix !== null,
      "Expected the source reporting mission to persist finance_memo and evidence_appendix artifacts.",
    );
    assert(
      financeMemoArtifact !== null &&
        evidenceAppendixArtifact !== null &&
        reportingProofBundleArtifact !== null,
      "Expected the source reporting mission artifacts to include finance_memo, evidence_appendix, and proof_bundle_manifest.",
    );
    assert(
      reportingDetail.proofBundle.status === "ready",
      "Expected the source reporting proof bundle to be ready before diligence-packet creation starts.",
    );

    const createdDiligencePacketMission = await injectJson(app, {
      expectedStatus: 201,
      method: "POST",
      payload: {
        requestedBy: fixture.createdBy,
        sourceReportingMissionId: reportingDetail.mission.id,
      },
      url: "/missions/reporting/diligence-packets",
    });
    const diligencePacketDetail = await pollMissionDetail({
      app,
      missionId: createdDiligencePacketMission.mission.id,
      worker: container.worker,
    });
    const missionList = await injectJson(app, {
      expectedStatus: 200,
      method: "GET",
      url: "/missions?limit=20",
    });
    const diligencePacketArtifact =
      diligencePacketDetail.artifacts.find(
        (artifact) => artifact.kind === "diligence_packet",
      ) ?? null;
    const diligencePacketProofBundleArtifact =
      diligencePacketDetail.artifacts.find(
        (artifact) => artifact.kind === "proof_bundle_manifest",
      ) ?? null;
    const listedDiligencePacketMission =
      missionList.missions.find(
        (mission) => mission.id === diligencePacketDetail.mission.id,
      ) ?? null;

    assert(
      diligencePacketDetail.mission.type === "reporting" &&
        diligencePacketDetail.mission.sourceKind === "manual_reporting" &&
        diligencePacketDetail.mission.status === "succeeded",
      "Expected the diligence-packet mission to stay inside the reporting family and succeed.",
    );
    assert(
      diligencePacketDetail.discoveryAnswer === null,
      "Expected diligence-packet mission detail to avoid surfacing a discovery answer payload directly.",
    );
    assert(
      diligencePacketDetail.mission.spec.deliverables.sort().join(",") ===
        ["diligence_packet", "proof_bundle"].sort().join(","),
      "Expected the diligence-packet mission contract to persist only diligence_packet and proof_bundle deliverables in F5C3.",
    );
    assert(
      diligencePacketDetail.mission.spec.constraints.mustNot.some((entry) =>
        entry.includes("codex runtime"),
      ) &&
        diligencePacketDetail.mission.spec.constraints.mustNot.some((entry) =>
          entry.includes("filing"),
        ) &&
        diligencePacketDetail.mission.spec.constraints.mustNot.some((entry) =>
          entry.includes("PDF export"),
        ),
      "Expected the diligence-packet mission contract to stay runtime-free, release-free, and export-free in F5C3.",
    );
    assert(
      diligencePacketDetail.reporting?.reportKind === "diligence_packet" &&
        diligencePacketDetail.reporting?.draftStatus === "draft_only",
      "Expected the diligence-packet reporting view to expose draft-only diligence_packet posture.",
    );
    assert(
      diligencePacketDetail.reporting?.sourceDiscoveryMissionId ===
        discoveryDetail.mission.id &&
        diligencePacketDetail.reporting?.sourceReportingMissionId ===
          reportingDetail.mission.id,
      "Expected the diligence-packet reporting view to retain source discovery and source reporting lineage.",
    );
    assert(
      diligencePacketDetail.reporting?.diligencePacket !== null &&
        diligencePacketDetail.reporting?.financeMemo === null &&
        diligencePacketDetail.reporting?.evidenceAppendix === null,
      "Expected the diligence-packet mission to persist one diligence_packet artifact and reuse source memo plus appendix linkage rather than re-persisting memo or appendix artifacts.",
    );
    assert(
      diligencePacketArtifact !== null &&
        diligencePacketProofBundleArtifact !== null,
      "Expected the diligence-packet mission artifacts to include diligence_packet and proof_bundle_manifest.",
    );
    assert(
      diligencePacketDetail.artifacts
        .map((artifact) => artifact.kind)
        .sort()
        .join(",") ===
        ["diligence_packet", "proof_bundle_manifest"].sort().join(","),
      "Expected the diligence-packet mission to persist exactly one draft diligence_packet artifact plus the proof bundle manifest.",
    );
    assert(
      diligencePacketDetail.reporting?.diligencePacket?.sourceFinanceMemo
        .artifactId === financeMemoArtifact.id &&
        diligencePacketDetail.reporting?.diligencePacket?.sourceEvidenceAppendix
          .artifactId === evidenceAppendixArtifact.id,
      "Expected the diligence-packet artifact to link back to the stored finance memo and evidence appendix artifacts from the completed source reporting mission.",
    );
    assert(
      diligencePacketDetail.reporting?.diligencePacket?.bodyMarkdown.includes(
        reportingDetail.reporting.financeMemo.bodyMarkdown,
      ) &&
        diligencePacketDetail.reporting?.diligencePacket?.bodyMarkdown.includes(
          reportingDetail.reporting.evidenceAppendix.appendixSummary,
        ),
      "Expected the diligence-packet markdown body to compile deterministically from the stored source finance memo and evidence appendix evidence only.",
    );
    assert(
      diligencePacketDetail.reporting?.publication === null &&
        diligencePacketDetail.proofBundle.reportPublication === null,
      "Expected the diligence-packet path to stay draft-only and release-free with no filed or export publication posture.",
    );
    assert(
      diligencePacketDetail.proofBundle.reportKind === "diligence_packet" &&
        diligencePacketDetail.proofBundle.sourceDiscoveryMissionId ===
          discoveryDetail.mission.id &&
        diligencePacketDetail.proofBundle.sourceReportingMissionId ===
          reportingDetail.mission.id &&
        diligencePacketDetail.proofBundle.appendixPresent === true,
      "Expected the diligence-packet proof bundle to expose report kind, source lineage, and linked appendix posture explicitly.",
    );
    assert(
      diligencePacketDetail.proofBundle.status === "ready" &&
        diligencePacketDetail.proofBundle.evidenceCompleteness.status ===
          "complete" &&
        diligencePacketDetail.proofBundle.evidenceCompleteness.expectedArtifactKinds.join(
          ",",
        ) === "diligence_packet" &&
        diligencePacketDetail.proofBundle.evidenceCompleteness.presentArtifactKinds.join(
          ",",
        ) === "diligence_packet",
      "Expected proof readiness for the diligence-packet mission to depend on the persisted diligence_packet artifact only.",
    );
    assert(
      diligencePacketDetail.proofBundle.validationSummary.includes(
        "without running the Codex runtime",
      ) &&
        diligencePacketDetail.proofBundle.riskSummary.includes(
          "does not add approval, release, PDF, or slide workflow in F5C3",
        ),
      "Expected the diligence-packet proof bundle to stay runtime-free, approval-free, release-free, and export-free in F5C3.",
    );
    assert(
      diligencePacketDetail.tasks.length === 1 &&
        diligencePacketDetail.tasks.every(
          (task) =>
            task.role === "scout" &&
            task.codexThreadId === null &&
            task.codexTurnId === null,
        ),
      "Expected the diligence-packet path to stay scout-only and avoid runtime-codex threads.",
    );
    assert(
      listedDiligencePacketMission !== null,
      "Expected the diligence-packet mission to appear in the mission list.",
    );
    assert(
      listedDiligencePacketMission?.reportKind === "diligence_packet" &&
        listedDiligencePacketMission?.reportPublication === null &&
        listedDiligencePacketMission?.sourceDiscoveryMissionId ===
          discoveryDetail.mission.id &&
        listedDiligencePacketMission?.sourceReportingMissionId ===
          reportingDetail.mission.id,
      "Expected the mission list read model to expose diligence-packet lineage truthfully without inventing publication posture.",
    );

    console.log(
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          company: {
            companyKey: fixture.companyKey,
            displayName: fixture.companyName,
          },
          financeSync: {
            sourceId,
            sourceFileId,
            syncRunId: financeSync.syncRun.id,
            status: financeSync.syncRun.status,
          },
          wikiCompile: {
            compileRunId: wikiCompile.compileRun.id,
            status: wikiCompile.compileRun.status,
            changedPageKeys: wikiCompile.changedPageKeys,
          },
          discoveryMission: {
            id: discoveryDetail.mission.id,
            status: discoveryDetail.mission.status,
            questionKind: sourceDiscoveryAnswer.questionKind,
            proofBundleStatus: discoveryDetail.proofBundle.status,
            discoveryAnswerArtifactId: sourceDiscoveryAnswerArtifact.id,
            proofBundleArtifactId: sourceProofBundleArtifact.id,
          },
          financeMemoReportingMission: {
            id: reportingDetail.mission.id,
            status: reportingDetail.mission.status,
            sourceDiscoveryMissionId:
              reportingDetail.reporting.sourceDiscoveryMissionId,
            reportKind: reportingDetail.reporting.reportKind,
            proofBundleStatus: reportingDetail.proofBundle.status,
            financeMemoArtifactId: financeMemoArtifact.id,
            evidenceAppendixArtifactId: evidenceAppendixArtifact.id,
            proofBundleArtifactId: reportingProofBundleArtifact.id,
          },
          diligencePacketMission: {
            id: diligencePacketDetail.mission.id,
            status: diligencePacketDetail.mission.status,
            sourceDiscoveryMissionId:
              diligencePacketDetail.reporting.sourceDiscoveryMissionId,
            sourceReportingMissionId:
              diligencePacketDetail.reporting.sourceReportingMissionId,
            reportKind: diligencePacketDetail.reporting.reportKind,
            draftStatus: diligencePacketDetail.reporting.draftStatus,
            proofBundleStatus: diligencePacketDetail.proofBundle.status,
            diligencePacketArtifactId: diligencePacketArtifact.id,
            proofBundleArtifactId: diligencePacketProofBundleArtifact.id,
          },
          diligencePacketView: {
            packetSummary:
              diligencePacketDetail.reporting.diligencePacket.packetSummary,
            freshnessSummary:
              diligencePacketDetail.reporting.diligencePacket.freshnessSummary,
            limitationsSummary:
              diligencePacketDetail.reporting.diligencePacket
                .limitationsSummary,
            sourceFinanceMemo:
              diligencePacketDetail.reporting.diligencePacket.sourceFinanceMemo,
            sourceEvidenceAppendix:
              diligencePacketDetail.reporting.diligencePacket
                .sourceEvidenceAppendix,
            relatedRoutePaths: diligencePacketDetail.reporting.relatedRoutePaths,
            relatedWikiPageKeys:
              diligencePacketDetail.reporting.relatedWikiPageKeys,
          },
          diligencePacketProofBundle: {
            reportKind: diligencePacketDetail.proofBundle.reportKind,
            sourceDiscoveryMissionId:
              diligencePacketDetail.proofBundle.sourceDiscoveryMissionId,
            sourceReportingMissionId:
              diligencePacketDetail.proofBundle.sourceReportingMissionId,
            expectedArtifactKinds:
              diligencePacketDetail.proofBundle.evidenceCompleteness
                .expectedArtifactKinds,
            presentArtifactKinds:
              diligencePacketDetail.proofBundle.evidenceCompleteness
                .presentArtifactKinds,
            riskSummary: diligencePacketDetail.proofBundle.riskSummary,
            validationSummary:
              diligencePacketDetail.proofBundle.validationSummary,
          },
          missionList: {
            reportKind: listedDiligencePacketMission.reportKind,
            sourceDiscoveryMissionId:
              listedDiligencePacketMission.sourceDiscoveryMissionId,
            sourceReportingMissionId:
              listedDiligencePacketMission.sourceReportingMissionId,
            reportPublication: listedDiligencePacketMission.reportPublication,
            proofBundleStatus:
              listedDiligencePacketMission.proofBundleStatus,
          },
        },
        null,
        2,
      ),
    );
  } finally {
    if (app) {
      await app.close();
    }

    await closeAllPools();
  }
}

async function writeSeedSnapshot(seed) {
  const directory = await mkdtemp(
    join(tmpdir(), "pocket-cfo-diligence-packet-smoke-"),
  );
  const storageRef = join(directory, seed.originalFileName);

  await writeFile(storageRef, seed.body);

  return {
    checksumSha256: createHash("sha256").update(seed.body).digest("hex"),
    storageRef,
  };
}

async function injectJson(app, input) {
  const response = await app.inject({
    headers: input.headers,
    method: input.method,
    payload: input.payload,
    url: input.url,
  });

  if (response.statusCode !== input.expectedStatus) {
    throw new Error(
      `${input.method} ${input.url} failed with ${response.statusCode}: ${response.body}`,
    );
  }

  return response.body ? response.json() : null;
}

async function pollMissionDetail(input) {
  for (let attempt = 0; attempt < MAX_POLLS; attempt += 1) {
    await input.worker.run({
      log: SILENT_LOGGER,
      pollIntervalMs: 1,
      runOnce: true,
    });

    const detail = await injectJson(input.app, {
      expectedStatus: 200,
      method: "GET",
      url: `/missions/${input.missionId}`,
    });

    if (
      isTerminalMissionStatus(detail.mission.status) &&
      detail.tasks.every((task) => isTerminalTaskStatus(task.status))
    ) {
      return detail;
    }

    await wait(POLL_INTERVAL_MS);
  }

  throw new Error(
    `Mission ${input.missionId} did not reach a terminal state within ${MAX_POLLS} polls.`,
  );
}

function isTerminalMissionStatus(status) {
  return ["succeeded", "failed", "cancelled"].includes(status);
}

function isTerminalTaskStatus(status) {
  return ["succeeded", "failed", "cancelled"].includes(status);
}

function requireUuid(value, label) {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`${label} missing from response`);
  }

  return value;
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

if (process.argv[1] && resolve(process.argv[1]) === MODULE_PATH) {
  await main();
}
