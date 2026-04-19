import { createHash } from "node:crypto";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildApp } from "../apps/control-plane/src/app.ts";
import { createEmbeddedWorkerContainer } from "../apps/control-plane/src/bootstrap.ts";
import { closeAllPools } from "../packages/db/src/client.ts";
import { buildRunTag, loadNearestEnvFile, wait } from "./m2-exit-utils.mjs";

const DEFAULT_COMPANY_KEY = "local-lender-update-company";
const DEFAULT_COMPANY_NAME = "Local Lender Update Company";
const DEFAULT_CREATED_BY = "lender-update-smoke";
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
      note: "Seed snapshot for the packaged F5C2 lender update smoke.",
      requestedBy: "lender_update_smoke",
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
    sourceName: `Lender update smoke ${input.runTag}`,
    seed: {
      body: Buffer.from(`${seedText}\n`, "utf8"),
      mediaType: "application/json",
      originalFileName: `lender-update-seed-${input.runTag}.json`,
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
        description: "Packaged F5C2 lender update smoke source.",
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
      "Expected the source reporting proof bundle to be ready before lender-update creation starts.",
    );

    const createdLenderUpdateMission = await injectJson(app, {
      expectedStatus: 201,
      method: "POST",
      payload: {
        requestedBy: fixture.createdBy,
        sourceReportingMissionId: reportingDetail.mission.id,
      },
      url: "/missions/reporting/lender-updates",
    });
    const lenderUpdateDetail = await pollMissionDetail({
      app,
      missionId: createdLenderUpdateMission.mission.id,
      worker: container.worker,
    });
    const missionList = await injectJson(app, {
      expectedStatus: 200,
      method: "GET",
      url: "/missions?limit=20",
    });
    const lenderUpdateArtifact =
      lenderUpdateDetail.artifacts.find((artifact) => artifact.kind === "lender_update") ??
      null;
    const lenderUpdateProofBundleArtifact =
      lenderUpdateDetail.artifacts.find(
        (artifact) => artifact.kind === "proof_bundle_manifest",
      ) ?? null;
    const listedLenderUpdateMission =
      missionList.missions.find((mission) => mission.id === lenderUpdateDetail.mission.id) ??
      null;

    assert(
      lenderUpdateDetail.mission.type === "reporting" &&
        lenderUpdateDetail.mission.sourceKind === "manual_reporting" &&
        lenderUpdateDetail.mission.status === "succeeded",
      "Expected the lender-update mission to stay inside the reporting family and succeed.",
    );
    assert(
      lenderUpdateDetail.discoveryAnswer === null,
      "Expected lender-update mission detail to avoid surfacing a discovery answer payload directly.",
    );
    assert(
      lenderUpdateDetail.mission.spec.deliverables.sort().join(",") ===
        ["lender_update", "proof_bundle"].sort().join(","),
      "Expected the lender-update mission contract to persist only lender_update and proof_bundle deliverables in F5C2.",
    );
    assert(
      lenderUpdateDetail.mission.spec.constraints.mustNot.some((entry) =>
        entry.includes("codex runtime"),
      ) &&
        lenderUpdateDetail.mission.spec.constraints.mustNot.some((entry) =>
          entry.includes("diligence packets"),
        ),
      "Expected the lender-update mission contract to stay runtime-free and diligence-free in F5C2.",
    );
    assert(
      lenderUpdateDetail.reporting?.reportKind === "lender_update" &&
        lenderUpdateDetail.reporting?.draftStatus === "draft_only",
      "Expected the lender-update reporting view to expose draft-only lender_update posture.",
    );
    assert(
      lenderUpdateDetail.reporting?.sourceDiscoveryMissionId ===
        discoveryDetail.mission.id &&
        lenderUpdateDetail.reporting?.sourceReportingMissionId ===
          reportingDetail.mission.id,
      "Expected the lender-update reporting view to retain source discovery and source reporting lineage.",
    );
    assert(
      lenderUpdateDetail.reporting?.lenderUpdate !== null &&
        lenderUpdateDetail.reporting?.financeMemo === null &&
        lenderUpdateDetail.reporting?.evidenceAppendix === null,
      "Expected the lender-update mission to persist one lender_update artifact and reuse source memo plus appendix linkage rather than re-persisting memo or appendix artifacts.",
    );
    assert(
      lenderUpdateArtifact !== null && lenderUpdateProofBundleArtifact !== null,
      "Expected the lender-update mission artifacts to include lender_update and proof_bundle_manifest.",
    );
    assert(
      lenderUpdateDetail.artifacts.map((artifact) => artifact.kind).sort().join(",") ===
        ["lender_update", "proof_bundle_manifest"].sort().join(","),
      "Expected the lender-update mission to persist exactly one draft lender_update artifact plus the proof bundle manifest.",
    );
    assert(
      lenderUpdateDetail.reporting?.lenderUpdate?.sourceFinanceMemo.artifactId ===
        financeMemoArtifact.id &&
        lenderUpdateDetail.reporting?.lenderUpdate?.sourceEvidenceAppendix
          .artifactId === evidenceAppendixArtifact.id,
      "Expected the lender-update artifact to link back to the stored finance memo and evidence appendix artifacts from the completed source reporting mission.",
    );
    assert(
      lenderUpdateDetail.reporting?.lenderUpdate?.bodyMarkdown.includes(
        reportingDetail.reporting.financeMemo.bodyMarkdown,
      ) &&
        lenderUpdateDetail.reporting?.lenderUpdate?.bodyMarkdown.includes(
          reportingDetail.reporting.evidenceAppendix.appendixSummary,
        ),
      "Expected the lender-update markdown body to compile deterministically from the stored source finance memo and evidence appendix evidence only.",
    );
    assert(
      lenderUpdateDetail.reporting?.publication === null &&
        lenderUpdateDetail.proofBundle.reportPublication === null,
      "Expected the lender-update path to stay draft-only and release-free with no filed or export publication posture.",
    );
    assert(
      lenderUpdateDetail.proofBundle.reportKind === "lender_update" &&
        lenderUpdateDetail.proofBundle.sourceDiscoveryMissionId ===
          discoveryDetail.mission.id &&
        lenderUpdateDetail.proofBundle.sourceReportingMissionId ===
          reportingDetail.mission.id &&
        lenderUpdateDetail.proofBundle.appendixPresent === true,
      "Expected the lender-update proof bundle to expose report kind, source lineage, and linked appendix posture explicitly.",
    );
    assert(
      lenderUpdateDetail.proofBundle.status === "ready" &&
        lenderUpdateDetail.proofBundle.evidenceCompleteness.status === "complete" &&
        lenderUpdateDetail.proofBundle.evidenceCompleteness.expectedArtifactKinds.join(
          ",",
        ) === "lender_update" &&
        lenderUpdateDetail.proofBundle.evidenceCompleteness.presentArtifactKinds.join(
          ",",
        ) === "lender_update",
      "Expected proof readiness for the lender-update mission to depend on the persisted lender_update artifact only.",
    );
    assert(
      lenderUpdateDetail.proofBundle.validationSummary.includes(
        "without running the Codex runtime",
      ) &&
        lenderUpdateDetail.proofBundle.riskSummary.includes(
          "does not add approval, release, diligence, PDF, or slide workflow in F5C2",
        ),
      "Expected the lender-update proof bundle to stay runtime-free, approval-free, release-free, diligence-free, and export-free in F5C2.",
    );
    assert(
      lenderUpdateDetail.tasks.length === 1 &&
        lenderUpdateDetail.tasks.every(
          (task) =>
            task.role === "scout" &&
            task.codexThreadId === null &&
            task.codexTurnId === null,
        ),
      "Expected the lender-update path to stay scout-only and avoid runtime-codex threads.",
    );
    assert(
      listedLenderUpdateMission !== null,
      "Expected the lender-update mission to appear in the mission list.",
    );
    assert(
      listedLenderUpdateMission?.reportKind === "lender_update" &&
        listedLenderUpdateMission?.reportPublication === null &&
        listedLenderUpdateMission?.sourceDiscoveryMissionId ===
          discoveryDetail.mission.id &&
        listedLenderUpdateMission?.sourceReportingMissionId ===
          reportingDetail.mission.id,
      "Expected the mission list read model to expose lender-update lineage truthfully without inventing publication posture.",
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
          lenderUpdateMission: {
            id: lenderUpdateDetail.mission.id,
            status: lenderUpdateDetail.mission.status,
            sourceDiscoveryMissionId:
              lenderUpdateDetail.reporting.sourceDiscoveryMissionId,
            sourceReportingMissionId:
              lenderUpdateDetail.reporting.sourceReportingMissionId,
            reportKind: lenderUpdateDetail.reporting.reportKind,
            draftStatus: lenderUpdateDetail.reporting.draftStatus,
            proofBundleStatus: lenderUpdateDetail.proofBundle.status,
            lenderUpdateArtifactId: lenderUpdateArtifact.id,
            proofBundleArtifactId: lenderUpdateProofBundleArtifact.id,
          },
          lenderUpdateView: {
            updateSummary:
              lenderUpdateDetail.reporting.lenderUpdate.updateSummary,
            freshnessSummary:
              lenderUpdateDetail.reporting.lenderUpdate.freshnessSummary,
            limitationsSummary:
              lenderUpdateDetail.reporting.lenderUpdate.limitationsSummary,
            sourceFinanceMemo:
              lenderUpdateDetail.reporting.lenderUpdate.sourceFinanceMemo,
            sourceEvidenceAppendix:
              lenderUpdateDetail.reporting.lenderUpdate.sourceEvidenceAppendix,
            relatedRoutePaths: lenderUpdateDetail.reporting.relatedRoutePaths,
            relatedWikiPageKeys:
              lenderUpdateDetail.reporting.relatedWikiPageKeys,
          },
          lenderUpdateProofBundle: {
            reportKind: lenderUpdateDetail.proofBundle.reportKind,
            sourceDiscoveryMissionId:
              lenderUpdateDetail.proofBundle.sourceDiscoveryMissionId,
            sourceReportingMissionId:
              lenderUpdateDetail.proofBundle.sourceReportingMissionId,
            expectedArtifactKinds:
              lenderUpdateDetail.proofBundle.evidenceCompleteness
                .expectedArtifactKinds,
            presentArtifactKinds:
              lenderUpdateDetail.proofBundle.evidenceCompleteness
                .presentArtifactKinds,
            riskSummary: lenderUpdateDetail.proofBundle.riskSummary,
            validationSummary:
              lenderUpdateDetail.proofBundle.validationSummary,
          },
          missionList: {
            reportKind: listedLenderUpdateMission.reportKind,
            sourceDiscoveryMissionId:
              listedLenderUpdateMission.sourceDiscoveryMissionId,
            sourceReportingMissionId:
              listedLenderUpdateMission.sourceReportingMissionId,
            reportPublication: listedLenderUpdateMission.reportPublication,
            proofBundleStatus: listedLenderUpdateMission.proofBundleStatus,
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
    join(tmpdir(), "pocket-cfo-lender-update-smoke-"),
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
