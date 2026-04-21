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

const DEFAULT_COMPANY_KEY =
  "local-board-packet-circulation-approval-company";
const DEFAULT_COMPANY_NAME =
  "Local Board Packet Circulation Approval Company";
const DEFAULT_CREATED_BY = "board-packet-circulation-approval-smoke";
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
      note: "Seed snapshot for the packaged F5C4E board-packet circulation-approval smoke.",
      requestedBy: "board_packet_circulation_approval_smoke",
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
    sourceName: `Board packet circulation approval smoke ${input.runTag}`,
    seed: {
      body: Buffer.from(`${seedText}\n`, "utf8"),
      mediaType: "application/json",
      originalFileName: `board-packet-circulation-approval-seed-${input.runTag}.json`,
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

  const options = parseArgs(
    process.argv.slice(2).filter((entry) => entry !== "--"),
  );
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
            description:
              "Packaged F5C4E board packet circulation-approval smoke source.",
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

    const createdBoardPacketMission = await injectJson(embeddedApp, {
      expectedStatus: 201,
      method: "POST",
      payload: {
        requestedBy: fixture.createdBy,
        sourceReportingMissionId: financeMemoDetail.mission.id,
      },
      url: "/missions/reporting/board-packets",
    });
    const boardPacketDetail = await pollMissionDetail({
      app: embeddedApp,
      missionId: createdBoardPacketMission.mission.id,
      worker: embeddedContainer.worker,
    });
    assert(
      boardPacketDetail.mission.status === "succeeded" &&
        boardPacketDetail.reporting?.reportKind === "board_packet" &&
        boardPacketDetail.reporting?.boardPacket !== null,
      "Expected one completed board-packet reporting mission with one stored board_packet artifact.",
    );
    assert(
      boardPacketDetail.reporting?.circulationReadiness
        ?.circulationApprovalStatus === "not_requested" &&
        boardPacketDetail.reporting?.circulationReadiness?.circulationReady ===
          false &&
        boardPacketDetail.proofBundle.status === "ready" &&
        boardPacketDetail.proofBundle.circulationReadiness
          ?.circulationApprovalStatus === "not_requested",
      "Expected board-packet proof readiness to stay ready while circulation approval starts as not_requested.",
    );
    assert(
      boardPacketDetail.reporting?.publication === null &&
        boardPacketDetail.proofBundle.reportPublication === null &&
        boardPacketDetail.reporting?.releaseReadiness === null &&
        boardPacketDetail.proofBundle.releaseReadiness === null &&
        boardPacketDetail.reporting?.releaseRecord === null &&
        boardPacketDetail.proofBundle.releaseRecord === null,
      "Expected no publication, release, or circulation-log posture before board review starts.",
    );
    assert(
      boardPacketDetail.tasks.every(
        (task) =>
          task.role === "scout" &&
          task.codexThreadId === null &&
          task.codexTurnId === null,
      ),
      "Expected board-packet compilation to stay scout-only with no runtime thread ids.",
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
      url: `/missions/${boardPacketDetail.mission.id}/reporting/circulation-approval`,
    });
    assert(
      requestedApproval.created === true &&
        requestedApproval.approvalStatus === "pending" &&
        requestedApproval.circulationApprovalStatus === "pending_review" &&
        requestedApproval.circulationReady === false,
      "Expected the first circulation-approval request to persist one pending report_circulation approval.",
    );

    const approvalsBeforeResolution = await injectJson(apiApp, {
      expectedStatus: 200,
      method: "GET",
      url: `/missions/${boardPacketDetail.mission.id}/approvals`,
    });
    const pendingApproval =
      approvalsBeforeResolution.approvals.find(
        (approval) => approval.id === requestedApproval.approvalId,
      ) ?? null;
    assert(
      approvalsBeforeResolution.liveControl?.enabled === false &&
        pendingApproval?.kind === "report_circulation" &&
        pendingApproval?.status === "pending" &&
        pendingApproval?.taskId === null,
      "Expected the circulation approval to list in api-only mode without any runtime task dependency.",
    );

    const pendingDetail = await injectJson(apiApp, {
      expectedStatus: 200,
      method: "GET",
      url: `/missions/${boardPacketDetail.mission.id}`,
    });
    const pendingApprovalCard =
      pendingDetail.approvalCards.find(
        (card) => card.approvalId === requestedApproval.approvalId,
      ) ?? null;
    assert(
      pendingDetail.reporting?.circulationReadiness
        ?.circulationApprovalStatus === "pending_review" &&
        pendingDetail.proofBundle.circulationReadiness
          ?.circulationApprovalStatus === "pending_review" &&
        pendingApprovalCard?.status === "pending" &&
        pendingApprovalCard?.requiresLiveControl === false,
      "Expected mission detail and approval cards to show pending board-packet review without live control.",
    );

    const resolvedApproval = await injectJson(apiApp, {
      expectedStatus: 200,
      method: "POST",
      payload: {
        decision: "accept",
        rationale:
          "Finance reviewed the stored board packet and approved internal circulation posture.",
        resolvedBy: "finance-reviewer",
      },
      url: `/approvals/${requestedApproval.approvalId}/resolve`,
    });
    assert(
      resolvedApproval.liveControl?.enabled === false &&
        resolvedApproval.approval?.status === "approved" &&
        resolvedApproval.approval?.kind === "report_circulation",
      "Expected report_circulation resolution to succeed in api-only mode without live continuation.",
    );

    const finalDetail = await injectJson(apiApp, {
      expectedStatus: 200,
      method: "GET",
      url: `/missions/${boardPacketDetail.mission.id}`,
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
    const listedBoardPacketMission =
      finalMissionList.missions.find(
        (mission) => mission.id === boardPacketDetail.mission.id,
      ) ?? null;
    const replay = await injectJson(apiApp, {
      expectedStatus: 200,
      method: "GET",
      url: `/missions/${boardPacketDetail.mission.id}/events`,
    });
    const replayTypes = Array.isArray(replay)
      ? replay.map((event) => event.type)
      : [];

    assert(
      finalDetail.mission.status === "succeeded" &&
        finalDetail.reporting?.circulationReadiness
          ?.circulationApprovalStatus === "approved_for_circulation" &&
        finalDetail.reporting?.circulationReadiness?.circulationReady ===
          true &&
        finalDetail.proofBundle.circulationReadiness
          ?.circulationApprovalStatus === "approved_for_circulation" &&
        finalDetail.proofBundle.circulationReadiness?.circulationReady ===
          true,
      "Expected the board-packet mission to become approved_for_circulation while remaining a succeeded reporting mission.",
    );
    assert(
      finalApprovalCard?.status === "approved" &&
        finalApprovalCard?.requiresLiveControl === false &&
        listedBoardPacketMission?.circulationReadiness
          ?.circulationApprovalStatus === "approved_for_circulation" &&
        listedBoardPacketMission?.circulationReadiness?.circulationReady ===
          true,
      "Expected approval cards and mission-list read models to render approved-for-circulation posture.",
    );
    assert(
      finalDetail.reporting?.publication === null &&
        finalDetail.proofBundle.reportPublication === null &&
        finalDetail.reporting?.releaseReadiness === null &&
        finalDetail.proofBundle.releaseReadiness === null &&
        finalDetail.reporting?.releaseRecord === null &&
        finalDetail.proofBundle.releaseRecord === null &&
        finalDetail.proofBundle.riskSummary.includes(
          "approved for internal circulation",
        ) &&
        finalDetail.proofBundle.riskSummary.includes(
          "no circulation has been logged",
        ) &&
        finalDetail.proofBundle.riskSummary.includes("PDF") &&
        finalDetail.proofBundle.riskSummary.includes("slide") &&
        finalDetail.proofBundle.rollbackSummary.includes(
          "No actual circulation",
        ),
      `Expected the proof bundle to stay circulation-log-free, delivery-free, PDF-free, and slide-free even after approval. Received ${JSON.stringify(
        {
          reportingPublication: finalDetail.reporting?.publication ?? null,
          reportPublication: finalDetail.proofBundle.reportPublication ?? null,
          releaseReadiness: finalDetail.proofBundle.releaseReadiness ?? null,
          releaseRecord: finalDetail.proofBundle.releaseRecord ?? null,
          riskSummary: finalDetail.proofBundle.riskSummary,
          rollbackSummary: finalDetail.proofBundle.rollbackSummary,
        },
      )}`,
    );
    assert(
      replayTypes.includes("approval.requested") &&
        replayTypes.includes("approval.resolved") &&
        !replayTypes.includes("approval.release_logged"),
      "Expected the board-packet replay to capture approval.requested and approval.resolved without any circulation-log or release-log event.",
    );

    console.log(
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          mode: "api_only_persisted_report_circulation_approval",
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
          boardPacketMission: {
            id: boardPacketDetail.mission.id,
            status: boardPacketDetail.mission.status,
            reportKind: boardPacketDetail.reporting.reportKind,
            draftStatus: boardPacketDetail.reporting.draftStatus,
            sourceDiscoveryMissionId:
              boardPacketDetail.reporting.sourceDiscoveryMissionId,
            sourceReportingMissionId:
              boardPacketDetail.reporting.sourceReportingMissionId,
            artifactId: boardPacketDetail.reporting.boardPacket.artifactId,
          },
          circulationApproval: {
            approvalId: requestedApproval.approvalId,
            listedInApiOnlyMode:
              approvalsBeforeResolution.liveControl.enabled === false,
            requestedStatus:
              pendingDetail.reporting.circulationReadiness
                .circulationApprovalStatus,
            resolvedStatus:
              finalDetail.reporting.circulationReadiness
                .circulationApprovalStatus,
            circulationReady:
              finalDetail.reporting.circulationReadiness.circulationReady,
            approvalCardRequiresLiveControl:
              finalApprovalCard.requiresLiveControl,
          },
          proofBundle: {
            status: finalDetail.proofBundle.status,
            riskSummary: finalDetail.proofBundle.riskSummary,
            rollbackSummary: finalDetail.proofBundle.rollbackSummary,
            reportPublication: finalDetail.proofBundle.reportPublication,
            releaseReadiness: finalDetail.proofBundle.releaseReadiness,
            releaseRecord: finalDetail.proofBundle.releaseRecord,
          },
          replayTail: replayTypes.slice(-8),
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
    join(tmpdir(), "pocket-cfo-board-packet-circulation-approval-smoke-"),
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
