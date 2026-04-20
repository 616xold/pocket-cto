import { createHash } from "node:crypto";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildApp } from "../apps/control-plane/src/app.ts";
import {
  createContainer,
  createEmbeddedWorkerContainer,
} from "../apps/control-plane/src/bootstrap.ts";
import { closeAllPools } from "../packages/db/src/client.ts";
import { buildRunTag, loadNearestEnvFile, wait } from "./m2-exit-utils.mjs";

const DEFAULT_COMPANY_KEY = "local-lender-update-release-log-company";
const DEFAULT_COMPANY_NAME = "Local Lender Update Release Log Company";
const DEFAULT_CREATED_BY = "lender-update-release-log-smoke";
const MODULE_PATH = fileURLToPath(import.meta.url);
const POLL_INTERVAL_MS = 250;
const MAX_POLLS = 40;
const QUESTION_KIND = "cash_posture";
const OPERATOR_PROMPT = "What is our current cash posture from stored state?";
const SILENT_LOGGER = { error() {}, info() {} };

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
      note: "Seed snapshot for the packaged F5C4B lender-update release-log smoke.",
      requestedBy: "lender_update_release_log_smoke",
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
    sourceName: `Lender update release log smoke ${input.runTag}`,
    seed: {
      body: Buffer.from(`${seedText}\n`, "utf8"),
      mediaType: "application/json",
      originalFileName: `lender-update-release-log-seed-${input.runTag}.json`,
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
  const fixture = buildFixture({
    ...options,
    primaryAsOfDate: now.toISOString().slice(0, 10),
    runTag,
    secondaryAsOfDate: new Date(now.getTime() - 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10),
  });
  const capturedAt = now.toISOString();
  const seedSnapshot = await writeSeedSnapshot(fixture.seed);
  let embeddedApp = null;
  let apiApp = null;
  let embeddedContainer = null;

  try {
    embeddedContainer = await createEmbeddedWorkerContainer();
    embeddedApp = await buildApp({ container: embeddedContainer });
    embeddedApp.log.level = "silent";

    const sourceId = requireUuid(
      (
        await injectJson(embeddedApp, {
          expectedStatus: 201,
          method: "POST",
          payload: {
            createdBy: fixture.createdBy,
            description: "Packaged F5C4B lender update release-log smoke source.",
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
        })
      )?.source?.id,
      "source id",
    );
    const sourceFileId = requireUuid(
      (
        await injectJson(embeddedApp, {
          expectedStatus: 201,
          headers: { "content-type": "application/octet-stream" },
          method: "POST",
          payload: fixture.upload.body,
          url: `/sources/${sourceId}/files?${new URLSearchParams({
            capturedAt,
            createdBy: fixture.createdBy,
            mediaType: fixture.upload.mediaType,
            originalFileName: fixture.upload.originalFileName,
          }).toString()}`,
        })
      )?.sourceFile?.id,
      "source file id",
    );

    await injectJson(embeddedApp, {
      expectedStatus: 201,
      method: "POST",
      payload: {
        companyName: fixture.companyName,
      },
      url: `/finance-twin/companies/${fixture.companyKey}/source-files/${sourceFileId}/sync`,
    });
    await injectJson(embeddedApp, {
      expectedStatus: 201,
      method: "POST",
      payload: {
        triggeredBy: fixture.createdBy,
      },
      url: `/cfo-wiki/companies/${fixture.companyKey}/compile`,
    });

    const createdDiscoveryMission = await injectJson(embeddedApp, {
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
      app: embeddedApp,
      missionId: createdDiscoveryMission.mission.id,
      worker: embeddedContainer.worker,
    });
    assert(
      discoveryDetail.mission.status === "succeeded" &&
        discoveryDetail.discoveryAnswer !== null &&
        discoveryDetail.proofBundle.status === "ready",
      "Expected one completed discovery mission with a stored answer and ready proof bundle.",
    );

    const createdFinanceMemoMission = await injectJson(embeddedApp, {
      expectedStatus: 201,
      method: "POST",
      payload: {
        requestedBy: fixture.createdBy,
        reportKind: "finance_memo",
        sourceDiscoveryMissionId: discoveryDetail.mission.id,
      },
      url: "/missions/reporting",
    });
    const financeMemoDetail = await pollMissionDetail({
      app: embeddedApp,
      missionId: createdFinanceMemoMission.mission.id,
      worker: embeddedContainer.worker,
    });
    assert(
      financeMemoDetail.mission.status === "succeeded" &&
        financeMemoDetail.reporting?.reportKind === "finance_memo" &&
        financeMemoDetail.reporting?.financeMemo !== null &&
        financeMemoDetail.reporting?.evidenceAppendix !== null,
      "Expected one completed finance-memo reporting mission with stored memo and appendix artifacts.",
    );

    const createdLenderUpdateMission = await injectJson(embeddedApp, {
      expectedStatus: 201,
      method: "POST",
      payload: {
        requestedBy: fixture.createdBy,
        sourceReportingMissionId: financeMemoDetail.mission.id,
      },
      url: "/missions/reporting/lender-updates",
    });
    const lenderUpdateDetail = await pollMissionDetail({
      app: embeddedApp,
      missionId: createdLenderUpdateMission.mission.id,
      worker: embeddedContainer.worker,
    });
    assert(
      lenderUpdateDetail.mission.status === "succeeded" &&
        lenderUpdateDetail.reporting?.reportKind === "lender_update" &&
        lenderUpdateDetail.reporting?.lenderUpdate !== null,
      "Expected one completed lender-update reporting mission with one stored lender_update artifact.",
    );
    assert(
      lenderUpdateDetail.reporting?.releaseReadiness?.releaseApprovalStatus ===
        "not_requested" &&
        lenderUpdateDetail.reporting?.releaseReadiness?.releaseReady === false &&
        lenderUpdateDetail.proofBundle.status === "ready" &&
        lenderUpdateDetail.proofBundle.releaseReadiness?.releaseApprovalStatus ===
          "not_requested",
      "Expected lender-update proof readiness to stay ready while release approval starts as not_requested.",
    );
    assert(
      lenderUpdateDetail.reporting?.publication === null &&
        lenderUpdateDetail.proofBundle.reportPublication === null,
      "Expected no publication or delivery posture before review starts.",
    );
    assert(
      lenderUpdateDetail.tasks.every(
        (task) =>
          task.role === "scout" &&
          task.codexThreadId === null &&
          task.codexTurnId === null,
      ),
      "Expected lender-update compilation to stay scout-only with no runtime thread ids.",
    );

    await embeddedApp.close();
    embeddedApp = null;

    apiApp = await buildApp({ container: await createContainer() });
    apiApp.log.level = "silent";

    const requestedApproval = await injectJson(apiApp, {
      expectedStatus: 201,
      method: "POST",
      payload: {
        requestedBy: fixture.createdBy,
      },
      url: `/missions/${lenderUpdateDetail.mission.id}/reporting/release-approval`,
    });
    assert(
      requestedApproval.created === true &&
        requestedApproval.approvalStatus === "pending" &&
        requestedApproval.releaseApprovalStatus === "pending_review" &&
        requestedApproval.releaseReady === false,
      "Expected the first release-approval request to persist one pending report_release approval.",
    );

    const approvalsBeforeResolution = await injectJson(apiApp, {
      expectedStatus: 200,
      method: "GET",
      url: `/missions/${lenderUpdateDetail.mission.id}/approvals`,
    });
    const pendingApproval =
      approvalsBeforeResolution.approvals.find(
        (approval) => approval.id === requestedApproval.approvalId,
      ) ?? null;
    assert(
      approvalsBeforeResolution.liveControl?.enabled === false &&
        pendingApproval?.kind === "report_release" &&
        pendingApproval?.status === "pending" &&
        pendingApproval?.taskId === null,
      "Expected the release approval to list in api-only mode without any runtime task dependency.",
    );

    const pendingDetail = await injectJson(apiApp, {
      expectedStatus: 200,
      method: "GET",
      url: `/missions/${lenderUpdateDetail.mission.id}`,
    });
    const pendingApprovalCard =
      pendingDetail.approvalCards.find(
        (card) => card.approvalId === requestedApproval.approvalId,
      ) ?? null;
    assert(
      pendingDetail.reporting?.releaseReadiness?.releaseApprovalStatus ===
        "pending_review" &&
        pendingDetail.proofBundle.releaseReadiness?.releaseApprovalStatus ===
          "pending_review" &&
        pendingApprovalCard?.status === "pending" &&
        pendingApprovalCard?.requiresLiveControl === false,
      "Expected mission detail and approval cards to show pending lender-update review without live control.",
    );

    const resolvedApproval = await injectJson(apiApp, {
      expectedStatus: 200,
      method: "POST",
      payload: {
        decision: "accept",
        rationale: "Finance reviewed the stored lender update and approved release posture.",
        resolvedBy: "finance-reviewer",
      },
      url: `/approvals/${requestedApproval.approvalId}/resolve`,
    });
    assert(
      resolvedApproval.liveControl?.enabled === false &&
        resolvedApproval.approval?.status === "approved" &&
        resolvedApproval.approval?.kind === "report_release",
      "Expected report_release resolution to succeed in api-only mode without live continuation.",
    );

    const finalDetail = await injectJson(apiApp, {
      expectedStatus: 200,
      method: "GET",
      url: `/missions/${lenderUpdateDetail.mission.id}`,
    });
    const finalMissionList = await injectJson(apiApp, {
      expectedStatus: 200,
      method: "GET",
      url: "/missions?limit=20",
    });
    const finalApprovalCard =
      finalDetail.approvalCards.find(
        (card) => card.approvalId === requestedApproval.approvalId,
      ) ?? null;
    const listedLenderUpdateMission =
      finalMissionList.missions.find(
        (mission) => mission.id === lenderUpdateDetail.mission.id,
      ) ?? null;
    const replay = await injectJson(apiApp, {
      expectedStatus: 200,
      method: "GET",
      url: `/missions/${lenderUpdateDetail.mission.id}/events`,
    });
    const replayTypes = Array.isArray(replay) ? replay.map((event) => event.type) : [];

    assert(
      finalDetail.mission.status === "succeeded" &&
        finalDetail.reporting?.releaseReadiness?.releaseApprovalStatus ===
          "approved_for_release" &&
        finalDetail.reporting?.releaseReadiness?.releaseReady === true &&
        finalDetail.proofBundle.releaseReadiness?.releaseApprovalStatus ===
          "approved_for_release" &&
        finalDetail.proofBundle.releaseReadiness?.releaseReady === true,
      "Expected the lender-update mission to become approved_for_release while remaining a succeeded reporting mission.",
    );
    assert(
      finalApprovalCard?.status === "approved" &&
        finalApprovalCard?.requiresLiveControl === false &&
        listedLenderUpdateMission?.releaseReadiness?.releaseApprovalStatus ===
          "approved_for_release" &&
        listedLenderUpdateMission?.releaseReadiness?.releaseReady === true,
      "Expected approval cards and mission-list read models to render approved-for-release posture.",
    );
    assert(
      finalDetail.reporting?.publication === null &&
        finalDetail.proofBundle.reportPublication === null &&
        finalDetail.proofBundle.riskSummary.includes("actual delivery") &&
        finalDetail.proofBundle.riskSummary.includes("PDF") &&
        finalDetail.proofBundle.riskSummary.includes("slide") &&
        finalDetail.proofBundle.rollbackSummary.includes(
          "No actual release",
        ),
      `Expected the proof bundle to stay delivery-free, PDF-free, and slide-free even after approval. Received ${JSON.stringify(
        {
          reportingPublication: finalDetail.reporting?.publication ?? null,
          reportPublication: finalDetail.proofBundle.reportPublication ?? null,
          riskSummary: finalDetail.proofBundle.riskSummary,
          rollbackSummary: finalDetail.proofBundle.rollbackSummary,
        },
      )}`,
    );
    assert(
      replayTypes.includes("approval.requested") &&
        replayTypes.includes("approval.resolved"),
      "Expected the lender-update replay to capture approval.requested and approval.resolved.",
    );

    const releaseLoggedAt = new Date(now.getTime() + 10 * 60 * 1000).toISOString();
    const releaseNote =
      "Logged from the packaged F5C4B smoke after external lender delivery.";
    const loggedRelease = await injectJson(apiApp, {
      expectedStatus: 201,
      method: "POST",
      payload: {
        releasedAt: releaseLoggedAt,
        releasedBy: fixture.createdBy,
        releaseChannel: "email",
        releaseNote,
      },
      url: `/missions/${lenderUpdateDetail.mission.id}/reporting/release-log`,
    });
    assert(
      loggedRelease.created === true &&
        loggedRelease.releaseRecord?.released === true &&
        loggedRelease.releaseRecord?.releasedAt === releaseLoggedAt,
      "Expected one external lender-update release log to persist after approval.",
    );

    const releasedDetail = await injectJson(apiApp, {
      expectedStatus: 200,
      method: "GET",
      url: `/missions/${lenderUpdateDetail.mission.id}`,
    });
    const releasedMissionList = await injectJson(apiApp, {
      expectedStatus: 200,
      method: "GET",
      url: "/missions?limit=20",
    });
    const releasedApprovalCard =
      releasedDetail.approvalCards.find(
        (card) => card.approvalId === requestedApproval.approvalId,
      ) ?? null;
    const releasedMissionListItem =
      releasedMissionList.missions.find(
        (mission) => mission.id === lenderUpdateDetail.mission.id,
      ) ?? null;
    const releasedReplay = await injectJson(apiApp, {
      expectedStatus: 200,
      method: "GET",
      url: `/missions/${lenderUpdateDetail.mission.id}/events`,
    });
    const releasedReplayTypes = Array.isArray(releasedReplay)
      ? releasedReplay.map((event) => event.type)
      : [];

    assert(
      releasedDetail.reporting?.releaseReadiness?.releaseApprovalStatus ===
        "approved_for_release" &&
        releasedDetail.reporting?.releaseRecord?.released === true &&
        releasedDetail.reporting?.releaseRecord?.releaseChannel === "email" &&
        releasedDetail.proofBundle.releaseRecord?.released === true &&
        releasedDetail.proofBundle.releaseRecord?.releaseChannel === "email",
      "Expected mission detail and proof bundle read models to show one logged external lender-update release while preserving approved_for_release posture.",
    );
    assert(
      releasedApprovalCard?.status === "approved" &&
        releasedApprovalCard?.requiresLiveControl === false &&
        releasedApprovalCard?.summary?.includes("External lender-update release is logged") &&
        releasedMissionListItem?.releaseRecord?.released === true &&
        releasedMissionListItem?.releaseRecord?.releaseChannel === "email",
      "Expected approval cards and mission-list read models to surface the logged external lender-update release without live control.",
    );
    assert(
      releasedDetail.reporting?.publication === null &&
        releasedDetail.proofBundle.reportPublication === null &&
        releasedDetail.proofBundle.releaseRecord?.released === true &&
        releasedDetail.proofBundle.riskSummary.includes("did not send") &&
        releasedReplayTypes.includes("approval.release_logged"),
      `Expected the logged-release proof bundle to stay delivery-free while replay adds approval.release_logged. Received ${JSON.stringify(
        {
          reportingPublication: releasedDetail.reporting?.publication ?? null,
          reportPublication: releasedDetail.proofBundle.reportPublication ?? null,
          releaseRecord: releasedDetail.proofBundle.releaseRecord ?? null,
          verificationSummary: releasedDetail.proofBundle.verificationSummary,
          riskSummary: releasedDetail.proofBundle.riskSummary,
          replayTail: releasedReplayTypes.slice(-8),
        },
      )}`,
    );

    console.log(
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          mode: "api_only_persisted_report_release_log",
          company: {
            companyKey: fixture.companyKey,
            displayName: fixture.companyName,
          },
          discoveryMission: {
            id: discoveryDetail.mission.id,
            status: discoveryDetail.mission.status,
            proofBundleStatus: discoveryDetail.proofBundle.status,
          },
          financeMemoReportingMission: {
            id: financeMemoDetail.mission.id,
            status: financeMemoDetail.mission.status,
            reportKind: financeMemoDetail.reporting.reportKind,
          },
          lenderUpdateMission: {
            id: lenderUpdateDetail.mission.id,
            status: lenderUpdateDetail.mission.status,
            reportKind: lenderUpdateDetail.reporting.reportKind,
            draftStatus: lenderUpdateDetail.reporting.draftStatus,
            sourceDiscoveryMissionId:
              lenderUpdateDetail.reporting.sourceDiscoveryMissionId,
            sourceReportingMissionId:
              lenderUpdateDetail.reporting.sourceReportingMissionId,
            artifactId: lenderUpdateDetail.reporting.lenderUpdate.artifactId,
          },
          releaseApproval: {
            approvalId: requestedApproval.approvalId,
            listedInApiOnlyMode: approvalsBeforeResolution.liveControl.enabled === false,
            requestedStatus:
              pendingDetail.reporting.releaseReadiness.releaseApprovalStatus,
            resolvedStatus:
              finalDetail.reporting.releaseReadiness.releaseApprovalStatus,
            releaseReady: finalDetail.reporting.releaseReadiness.releaseReady,
            approvalCardRequiresLiveControl:
              finalApprovalCard.requiresLiveControl,
          },
          releaseLog: {
            released: releasedDetail.reporting.releaseRecord.released,
            releasedAt: releasedDetail.reporting.releaseRecord.releasedAt,
            releasedBy: releasedDetail.reporting.releaseRecord.releasedBy,
            releaseChannel: releasedDetail.reporting.releaseRecord.releaseChannel,
            releaseNote: releasedDetail.reporting.releaseRecord.releaseNote,
            approvalCardRequiresLiveControl:
              releasedApprovalCard.requiresLiveControl,
          },
          proofBundle: {
            status: releasedDetail.proofBundle.status,
            verificationSummary: releasedDetail.proofBundle.verificationSummary,
            riskSummary: releasedDetail.proofBundle.riskSummary,
            rollbackSummary: releasedDetail.proofBundle.rollbackSummary,
            reportPublication: releasedDetail.proofBundle.reportPublication,
          },
          replayTail: releasedReplayTypes.slice(-8),
        },
        null,
        2,
      ),
    );
  } finally {
    if (embeddedApp) {
      await embeddedApp.close();
    }

    if (apiApp) {
      await apiApp.close();
    }

    await closeAllPools();
  }
}

async function writeSeedSnapshot(seed) {
  const directory = await mkdtemp(
    join(tmpdir(), "pocket-cfo-lender-update-release-log-smoke-"),
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
