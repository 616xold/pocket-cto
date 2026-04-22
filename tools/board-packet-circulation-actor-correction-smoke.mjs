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

const DEFAULT_COMPANY_KEY = "local-board-circ-actor-correction";
const DEFAULT_COMPANY_NAME =
  "Local Board Packet Circulation Actor Correction Company";
const DEFAULT_CREATED_BY = "board-packet-circulation-actor-correction-smoke";
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
      note: "Seed snapshot for the packaged F5C4H board-packet circulation-actor-correction smoke.",
      requestedBy: "board_packet_circulation_actor_correction_smoke",
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
    companyKey: `${input.companyKey}-${input.runTag.toLowerCase()}`,
    companyName: `${input.companyName} ${input.runTag}`,
    createdBy: input.createdBy,
    seed: {
      body: Buffer.from(`${seedText}\n`, "utf8"),
      mediaType: "application/json",
      originalFileName: `board-packet-circulation-actor-correction-seed-${input.runTag}.json`,
    },
    sourceName: `Board packet circulation actor correction smoke ${input.runTag}`,
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
              "Packaged F5C4H board packet circulation-actor-correction smoke source.",
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
      "Expected one completed finance-memo mission with stored memo and appendix artifacts.",
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
      "Expected one completed board-packet mission with one stored board_packet artifact.",
    );
    assert(
      boardPacketDetail.reporting?.circulationReadiness
        ?.circulationApprovalStatus === "not_requested" &&
        boardPacketDetail.proofBundle.circulationReadiness
          ?.circulationApprovalStatus === "not_requested" &&
        boardPacketDetail.reporting?.circulationRecord === null &&
        boardPacketDetail.proofBundle.circulationRecord === null &&
        boardPacketDetail.reporting?.circulationChronology === null &&
        boardPacketDetail.proofBundle.circulationChronology === null,
      "Expected board-packet proof readiness to stay ready before approval, logging, or correction chronology.",
    );
    assert(
      boardPacketDetail.tasks.every(
        (task) =>
          task.role === "scout" &&
          task.codexThreadId === null &&
          task.codexTurnId === null,
      ),
      "Expected board-packet compilation to stay runtime-free with scout-only tasks.",
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
        requestedApproval.circulationApprovalStatus === "pending_review",
      "Expected one persisted pending report_circulation approval.",
    );

    const pendingDetail = await injectJson(apiApp, {
      expectedStatus: 200,
      method: "GET",
      url: `/missions/${boardPacketDetail.mission.id}`,
    });
    assert(
      pendingDetail.reporting?.circulationReadiness
        ?.circulationApprovalStatus === "pending_review" &&
        pendingDetail.approvalCards.some(
          (card) =>
            card.approvalId === requestedApproval.approvalId &&
            card.status === "pending" &&
            card.requiresLiveControl === false,
        ),
      "Expected pending circulation approval posture in mission detail without live control.",
    );

    await injectJson(apiApp, {
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

    const approvedDetail = await injectJson(apiApp, {
      expectedStatus: 200,
      method: "GET",
      url: `/missions/${boardPacketDetail.mission.id}`,
    });
    assert(
      approvedDetail.reporting?.circulationReadiness
        ?.circulationApprovalStatus === "approved_for_circulation" &&
        approvedDetail.reporting?.circulationRecord?.circulated === false &&
        approvedDetail.proofBundle.circulationReadiness
          ?.circulationApprovalStatus === "approved_for_circulation" &&
        approvedDetail.proofBundle.circulationRecord?.circulated === false,
      "Expected approved_for_circulation posture before any external circulation log is recorded.",
    );

    const circulatedAt = new Date(now.getTime() + 10 * 60 * 1000).toISOString();
    const circulationNote =
      "Logged from the packaged F5C4H smoke after external board circulation.";
    const loggedCirculation = await injectJson(apiApp, {
      expectedStatus: 201,
      method: "POST",
      payload: {
        circulatedAt,
        circulatedBy: fixture.createdBy,
        circulationChannel: "email",
        circulationNote,
      },
      url: `/missions/${boardPacketDetail.mission.id}/reporting/circulation-log`,
    });
    assert(
      loggedCirculation.created === true &&
        loggedCirculation.circulationRecord?.circulated === true &&
        loggedCirculation.circulationRecord?.circulatedAt === circulatedAt,
      "Expected one external board-packet circulation log to persist after approval.",
    );

    const loggedDetail = await injectJson(apiApp, {
      expectedStatus: 200,
      method: "GET",
      url: `/missions/${boardPacketDetail.mission.id}`,
    });
    assert(
      loggedDetail.reporting?.circulationRecord?.circulated === true &&
        loggedDetail.reporting?.circulationRecord?.circulatedAt ===
          circulatedAt &&
        loggedDetail.reporting?.circulationChronology?.correctionCount === 0 &&
        loggedDetail.proofBundle.circulationChronology?.correctionCount === 0,
      "Expected the first circulation log to persist while chronology remains correction-free.",
    );

    const correctedAt = new Date(now.getTime() + 20 * 60 * 1000).toISOString();
    const correctedCirculatedBy = "board-chair@example.com";
    const correctionReason =
      "Updated the operator attribution after board office review";
    const correctionKey = `board-packet-actor-correction-${runTag.toLowerCase()}`;
    const correctedCirculation = await injectJson(apiApp, {
      expectedStatus: 201,
      method: "POST",
      payload: {
        correctionKey,
        correctedAt,
        correctedBy: fixture.createdBy,
        correctionReason,
        circulatedBy: correctedCirculatedBy,
      },
      url: `/missions/${boardPacketDetail.mission.id}/reporting/circulation-log-correction`,
    });
    assert(
      correctedCirculation.created === true &&
        correctedCirculation.circulationRecord?.circulatedBy ===
          fixture.createdBy &&
        correctedCirculation.circulationChronology?.correctionCount === 1 &&
        correctedCirculation.circulationChronology?.effectiveRecord
          ?.circulatedBy === correctedCirculatedBy,
      "Expected one append-only actor correction to preserve the original record while updating the effective chronology.",
    );

    const correctedDetail = await injectJson(apiApp, {
      expectedStatus: 200,
      method: "GET",
      url: `/missions/${boardPacketDetail.mission.id}`,
    });
    const correctedMissionList = await injectJson(apiApp, {
      expectedStatus: 200,
      method: "GET",
      url: "/missions?limit=20",
    });
    const correctedReplay = await injectJson(apiApp, {
      expectedStatus: 200,
      method: "GET",
      url: `/missions/${boardPacketDetail.mission.id}/events`,
    });
    const correctedReplayTypes = Array.isArray(correctedReplay)
      ? correctedReplay.map((event) => event.type)
      : [];
    const correctedApprovalCard =
      correctedDetail.approvalCards.find(
        (card) => card.approvalId === requestedApproval.approvalId,
      ) ?? null;
    const correctedMissionListItem =
      correctedMissionList.missions.find(
        (mission) => mission.id === boardPacketDetail.mission.id,
      ) ?? null;

    assert(
      correctedDetail.reporting?.circulationRecord?.circulatedAt ===
        circulatedAt &&
        correctedDetail.reporting?.circulationRecord?.circulatedBy ===
          fixture.createdBy &&
        correctedDetail.reporting?.circulationRecord?.circulationChannel ===
          "email" &&
        correctedDetail.proofBundle.circulationRecord?.circulatedAt ===
          circulatedAt &&
        correctedDetail.proofBundle.circulationRecord?.circulatedBy ===
          fixture.createdBy,
      "Expected the original circulation record to remain immutable after actor correction logging.",
    );
    assert(
      correctedDetail.reporting?.circulationChronology?.correctionCount === 1 &&
        correctedDetail.reporting?.circulationChronology?.hasCorrections ===
          true &&
        correctedDetail.reporting?.circulationChronology?.effectiveRecord
          ?.source === "latest_correction" &&
        correctedDetail.reporting?.circulationChronology?.effectiveRecord
          ?.circulatedAt === circulatedAt &&
        correctedDetail.reporting?.circulationChronology?.effectiveRecord
          ?.circulatedBy === correctedCirculatedBy &&
        correctedDetail.reporting?.circulationChronology?.effectiveRecord
          ?.circulationChannel === "email" &&
        correctedDetail.reporting?.circulationChronology?.effectiveRecord
          ?.circulationNote === circulationNote &&
        correctedDetail.proofBundle.circulationChronology?.correctionCount ===
          1 &&
        correctedDetail.proofBundle.circulationChronology?.effectiveRecord
          ?.circulatedBy === correctedCirculatedBy &&
        correctedDetail.reporting?.circulationChronology?.latestCorrection
          ?.circulatedBy === correctedCirculatedBy,
      "Expected mission detail and proof bundle read models to expose original record plus corrected effective actor chronology.",
    );
    assert(
      correctedApprovalCard?.title?.includes("circulation corrected") &&
        correctedApprovalCard?.summary?.includes("append-only correction") &&
        correctedMissionListItem?.circulationRecord?.circulatedBy ===
          fixture.createdBy &&
        correctedMissionListItem?.circulationChronology?.effectiveRecord
          ?.circulatedBy === correctedCirculatedBy &&
        correctedMissionListItem?.circulationChronology?.correctionCount ===
          1 &&
        correctedMissionListItem?.circulationChronology?.summary?.includes(
          "1 circulation correction has been appended",
        ),
      "Expected approval cards and mission-list read models to surface board-circulation actor-correction chronology.",
    );
    assert(
      correctedDetail.reporting?.publication === null &&
        correctedDetail.proofBundle.reportPublication === null &&
        correctedDetail.reporting?.releaseReadiness === null &&
        correctedDetail.proofBundle.releaseReadiness === null &&
        correctedDetail.reporting?.releaseRecord === null &&
        correctedDetail.proofBundle.releaseRecord === null &&
        correctedDetail.proofBundle.riskSummary.includes("did not send") &&
        correctedDetail.proofBundle.riskSummary.includes("PDF") &&
        correctedDetail.proofBundle.riskSummary.includes("slides"),
      "Expected the corrected board-packet chronology path to remain delivery-free, PDF-free, and slide-free.",
    );
    assert(
      correctedReplayTypes.includes("approval.requested") &&
        correctedReplayTypes.includes("approval.resolved") &&
        correctedReplayTypes.includes("approval.circulation_logged") &&
        correctedReplayTypes.includes("approval.circulation_log_corrected") &&
        !correctedReplayTypes.includes("approval.release_logged"),
      "Expected replay to include circulation logging and correction events only on the existing report_circulation seam.",
    );

    console.log(
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          mode: "api_only_persisted_report_circulation_actor_correction",
          company: {
            companyKey: fixture.companyKey,
            displayName: fixture.companyName,
          },
          discoveryMission: {
            id: discoveryDetail.mission.id,
            proofBundleStatus: discoveryDetail.proofBundle.status,
            status: discoveryDetail.mission.status,
          },
          financeMemoReportingMission: {
            id: financeMemoDetail.mission.id,
            reportKind: financeMemoDetail.reporting.reportKind,
            status: financeMemoDetail.mission.status,
          },
          boardPacketMission: {
            artifactId: boardPacketDetail.reporting.boardPacket.artifactId,
            draftStatus: boardPacketDetail.reporting.draftStatus,
            id: boardPacketDetail.mission.id,
            reportKind: boardPacketDetail.reporting.reportKind,
            sourceDiscoveryMissionId:
              boardPacketDetail.reporting.sourceDiscoveryMissionId,
            sourceReportingMissionId:
              boardPacketDetail.reporting.sourceReportingMissionId,
            status: boardPacketDetail.mission.status,
          },
          circulationApproval: {
            approvalId: requestedApproval.approvalId,
            resolvedStatus:
              correctedDetail.reporting.circulationReadiness
                .circulationApprovalStatus,
            correctionCardTitle: correctedApprovalCard?.title ?? null,
          },
          originalCirculationLog: {
            circulatedAt:
              correctedDetail.reporting.circulationRecord.circulatedAt,
            circulatedBy:
              correctedDetail.reporting.circulationRecord.circulatedBy,
            circulationChannel:
              correctedDetail.reporting.circulationRecord.circulationChannel,
            circulationNote:
              correctedDetail.reporting.circulationRecord.circulationNote,
          },
          actorCorrection: {
            correctionCount:
              correctedDetail.reporting.circulationChronology.correctionCount,
            effectiveRecord:
              correctedDetail.reporting.circulationChronology.effectiveRecord,
            latestCorrection:
              correctedDetail.reporting.circulationChronology.latestCorrection,
            summary: correctedDetail.reporting.circulationChronology.summary,
          },
          proofBundle: {
            circulationChronology:
              correctedDetail.proofBundle.circulationChronology,
            circulationRecord: correctedDetail.proofBundle.circulationRecord,
            releaseReadiness: correctedDetail.proofBundle.releaseReadiness,
            releaseRecord: correctedDetail.proofBundle.releaseRecord,
            reportPublication: correctedDetail.proofBundle.reportPublication,
            riskSummary: correctedDetail.proofBundle.riskSummary,
            rollbackSummary: correctedDetail.proofBundle.rollbackSummary,
            status: correctedDetail.proofBundle.status,
          },
          replayTail: correctedReplayTypes.slice(-10),
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
    join(
      tmpdir(),
      "pocket-cfo-board-packet-circulation-actor-correction-smoke-",
    ),
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
