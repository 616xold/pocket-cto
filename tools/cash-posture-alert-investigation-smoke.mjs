import { createHash } from "node:crypto";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { FINANCE_DISCOVERY_QUESTION_KINDS } from "@pocket-cto/domain";
import { buildApp } from "../apps/control-plane/src/app.ts";
import { createContainer } from "../apps/control-plane/src/bootstrap.ts";
import { closeAllPools, getPool } from "../packages/db/src/client.ts";
import { loadEnv } from "../packages/config/src/index.ts";
import { buildRunTag, loadNearestEnvFile } from "./m2-exit-utils.mjs";

const DEFAULT_CREATED_BY = "cash-posture-alert-investigation-smoke";
const MODULE_PATH = fileURLToPath(import.meta.url);
const SOURCE_REF_PREFIX = "pocket-cfo://monitor-results/";
const REPORT_ARTIFACT_KINDS = new Set([
  "finance_memo",
  "evidence_appendix",
  "board_packet",
  "lender_update",
  "diligence_packet",
  "report_release",
  "report_circulation",
]);

function buildFixture(input) {
  const runTag = input.runTag.toLowerCase();

  return {
    createdBy: DEFAULT_CREATED_BY,
    missingSourceCompany: {
      companyKey: `local-alert-investigation-missing-${runTag}`,
      companyName: `Local Alert Investigation Missing ${input.runTag}`,
      sourceName: `Alert investigation trial balance ${input.runTag}`,
      upload: {
        mediaType: "text/csv",
        originalFileName: `alert-investigation-trial-balance-${input.runTag}.csv`,
        text: [
          "account_code,account_name,period_end,debit,credit,currency_code,account_type",
          "1000,Cash,2026-04-30,1200.00,0.00,USD,asset",
          "2000,Accounts Payable,2026-04-30,0.00,1200.00,USD,liability",
        ].join("\n"),
      },
    },
    cleanCompany: {
      companyKey: `local-alert-investigation-clean-${runTag}`,
      companyName: `Local Alert Investigation Clean ${input.runTag}`,
      sourceName: `Alert investigation bank summary ${input.runTag}`,
      upload: {
        mediaType: "text/csv",
        originalFileName: `alert-investigation-bank-summary-${input.runTag}.csv`,
        text: [
          "account_name,bank,last4,statement_balance,currency,as_of",
          "Operating Checking,First National,1234,1200.00,USD,2026-04-26",
        ].join("\n"),
      },
    },
    seed: {
      body: Buffer.from(
        `${JSON.stringify(
          {
            createdBy: DEFAULT_CREATED_BY,
            note: "Seed snapshot for the packaged F6B alert investigation smoke.",
            requestedBy: "cash_posture_alert_investigation_smoke",
            runTag: input.runTag,
          },
          null,
          2,
        )}\n`,
        "utf8",
      ),
      mediaType: "application/json",
      originalFileName: `cash-posture-alert-investigation-seed-${input.runTag}.json`,
    },
  };
}

async function main() {
  loadNearestEnvFile();
  const runTag = buildRunTag();
  const fixture = buildFixture({ runTag });
  const seedSnapshot = await writeSeedSnapshot(fixture.seed);
  const capturedAt = new Date().toISOString();
  const pool = getPool(loadEnv().DATABASE_URL);
  let app = null;

  try {
    assertDiscoveryFamilies();

    const before = await readBoundaryCounts(pool);
    const container = await createContainer();
    app = await buildApp({ container });
    app.log.level = "silent";

    const missingSourceSync = await syncCompanyFixture(app, {
      capturedAt,
      company: fixture.missingSourceCompany,
      createdBy: fixture.createdBy,
      seed: fixture.seed,
      seedSnapshot,
    });
    const alertRun = await runCashMonitor(app, {
      companyKey: fixture.missingSourceCompany.companyKey,
      runKey: `alert-${runTag}`,
    });

    assertAlertResult(alertRun, {
      companyKey: fixture.missingSourceCompany.companyKey,
      expectedConditionKinds: ["missing_source", "coverage_gap"],
      expectedProofStates: [
        "limited_by_missing_source",
        "limited_by_coverage_gap",
      ],
      expectedSeverity: "critical",
      expectedStatus: "alert",
    });

    const latestAlert = await injectJson(app, {
      expectedStatus: 200,
      method: "GET",
      url: `/monitoring/companies/${fixture.missingSourceCompany.companyKey}/cash-posture/latest`,
    });

    if (latestAlert.monitorResult?.id !== alertRun.monitorResult.id) {
      throw new Error("Latest alert monitor read did not return the persisted result");
    }

    const cleanSync = await syncCompanyFixture(app, {
      capturedAt,
      company: fixture.cleanCompany,
      createdBy: fixture.createdBy,
      seed: fixture.seed,
      seedSnapshot,
    });
    const cleanRun = await runCashMonitor(app, {
      companyKey: fixture.cleanCompany.companyKey,
      runKey: `clean-${runTag}`,
    });

    assertNoAlertResult(cleanRun, fixture.cleanCompany.companyKey);

    const afterMonitorRuns = await readBoundaryCounts(pool);
    assertMonitorOnlyBoundaryCounts(before, afterMonitorRuns);

    const created = await createOrOpenInvestigation(app, {
      companyKey: fixture.missingSourceCompany.companyKey,
      expectedStatus: 201,
      monitorResultId: alertRun.monitorResult.id,
    });
    const opened = await createOrOpenInvestigation(app, {
      companyKey: fixture.missingSourceCompany.companyKey,
      expectedStatus: 200,
      monitorResultId: alertRun.monitorResult.id,
    });

    assertCreatedAndOpenedSameMission(created, opened);
    assertMissionCreationResponse(created, alertRun.monitorResult);

    const detail = await injectJson(app, {
      expectedStatus: 200,
      method: "GET",
      url: `/missions/${created.mission.id}`,
    });
    const missionList = await injectJson(app, {
      expectedStatus: 200,
      method: "GET",
      url: "/missions?sourceKind=alert&limit=10",
    });
    const listedMission =
      missionList.missions.find((mission) => mission.id === created.mission.id) ??
      null;

    assertMissionDetail(detail, alertRun.monitorResult);

    if (!listedMission) {
      throw new Error("Alert investigation mission was missing from mission list");
    }

    assertMissionListItem(listedMission, alertRun.monitorResult);

    await assertNoAlertRejected(app, pool, cleanRun.monitorResult);
    await assertNoRuntimeDeliveryReportApprovalOrOutbox(pool, {
      before,
      missionId: created.mission.id,
      monitorRunsBoundary: afterMonitorRuns,
    });

    console.log(
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          discoveryFamilies: FINANCE_DISCOVERY_QUESTION_KINDS,
          alertScenario: {
            companyKey: fixture.missingSourceCompany.companyKey,
            syncRun: summarizeSyncRun(missingSourceSync.syncRun),
            monitorResult: summarizeMonitorResult(alertRun.monitorResult),
            mission: summarizeMission(created, detail, listedMission),
          },
          cleanScenario: {
            companyKey: fixture.cleanCompany.companyKey,
            syncRun: summarizeSyncRun(cleanSync.syncRun),
            monitorResult: summarizeMonitorResult(cleanRun.monitorResult),
            investigationCreationRejected: true,
          },
          preservedBoundaries: await readBoundaryCounts(pool),
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

async function syncCompanyFixture(app, input) {
  const created = await injectJson(app, {
    expectedStatus: 201,
    method: "POST",
    payload: {
      createdBy: input.createdBy,
      description: "Packaged F6B cash-posture alert investigation smoke source.",
      kind: "dataset",
      name: input.company.sourceName,
      snapshot: {
        capturedAt: input.capturedAt,
        checksumSha256: input.seedSnapshot.checksumSha256,
        mediaType: input.seed.mediaType,
        originalFileName: input.seed.originalFileName,
        sizeBytes: input.seed.body.byteLength,
        storageKind: "local_path",
        storageRef: input.seedSnapshot.storageRef,
      },
    },
    url: "/sources",
  });
  const sourceId = requireId(created?.source?.id, "source id");
  const uploaded = await injectJson(app, {
    expectedStatus: 201,
    headers: {
      "content-type": "application/octet-stream",
    },
    method: "POST",
    payload: Buffer.from(`${input.company.upload.text}\n`, "utf8"),
    url: `/sources/${sourceId}/files?${new URLSearchParams({
      capturedAt: input.capturedAt,
      createdBy: input.createdBy,
      mediaType: input.company.upload.mediaType,
      originalFileName: input.company.upload.originalFileName,
    }).toString()}`,
  });
  const sourceFileId = requireId(uploaded?.sourceFile?.id, "source file id");

  return injectJson(app, {
    expectedStatus: 201,
    method: "POST",
    payload: {
      companyName: input.company.companyName,
    },
    url: `/finance-twin/companies/${input.company.companyKey}/source-files/${sourceFileId}/sync`,
  });
}

async function runCashMonitor(app, input) {
  return injectJson(app, {
    expectedStatus: 201,
    method: "POST",
    payload: {
      runKey: input.runKey,
      triggeredBy: DEFAULT_CREATED_BY,
    },
    url: `/monitoring/companies/${input.companyKey}/cash-posture/run`,
  });
}

async function createOrOpenInvestigation(app, input) {
  return injectJson(app, {
    expectedStatus: input.expectedStatus,
    method: "POST",
    payload: {
      companyKey: input.companyKey,
      monitorResultId: input.monitorResultId,
      requestedBy: DEFAULT_CREATED_BY,
    },
    url: "/missions/monitoring-investigations",
  });
}

async function assertNoAlertRejected(app, pool, monitorResult) {
  const response = await app.inject({
    method: "POST",
    payload: {
      companyKey: monitorResult.companyKey,
      monitorResultId: monitorResult.id,
      requestedBy: DEFAULT_CREATED_BY,
    },
    url: "/missions/monitoring-investigations",
  });

  if (response.statusCode !== 400) {
    throw new Error(
      `Expected no_alert investigation creation to fail with 400, received ${response.statusCode}: ${response.body}`,
    );
  }

  const sourceMissionCount = await readScalar(
    pool,
    "select count(*)::int as count from missions where source_kind = 'alert' and source_ref = $1",
    [`${SOURCE_REF_PREFIX}${monitorResult.id}`],
  );

  if (sourceMissionCount !== 0) {
    throw new Error("no_alert monitor result created an alert investigation mission");
  }
}

function assertAlertResult(run, input) {
  if (run.monitorResult.companyKey !== input.companyKey) {
    throw new Error("Monitor result companyKey did not match alert scenario");
  }

  if (
    run.monitorResult.status !== input.expectedStatus ||
    run.monitorResult.severity !== input.expectedSeverity
  ) {
    throw new Error(
      `Unexpected alert posture: ${JSON.stringify(run.monitorResult)}`,
    );
  }

  const conditionKinds = run.monitorResult.conditions.map(
    (condition) => condition.kind,
  );

  for (const expectedConditionKind of input.expectedConditionKinds) {
    if (!conditionKinds.includes(expectedConditionKind)) {
      throw new Error(
        `Expected condition ${expectedConditionKind}, received ${conditionKinds.join(", ")}`,
      );
    }
  }

  if (
    !input.expectedProofStates.includes(
      run.monitorResult.proofBundlePosture.state,
    )
  ) {
    throw new Error(
      `Unexpected proof posture ${run.monitorResult.proofBundlePosture.state}`,
    );
  }

  assertRequiredMonitorPosture(run.monitorResult);

  if (!run.alertCard) {
    throw new Error("Alerting monitor result did not include an alert card");
  }
}

function assertNoAlertResult(run, companyKey) {
  if (run.monitorResult.companyKey !== companyKey) {
    throw new Error("Monitor result companyKey did not match clean scenario");
  }

  if (
    run.monitorResult.status !== "no_alert" ||
    run.monitorResult.severity !== "none" ||
    run.alertCard !== null
  ) {
    throw new Error(
      `Expected a non-alerting clean monitor result, received ${JSON.stringify(run)}`,
    );
  }

  assertRequiredMonitorPosture(run.monitorResult);
}

function assertRequiredMonitorPosture(result) {
  if (!result.sourceFreshnessPosture?.summary) {
    throw new Error("Monitor result is missing source freshness posture");
  }

  if (!result.sourceLineageRefs || !Array.isArray(result.sourceLineageRefs)) {
    throw new Error("Monitor result is missing source lineage refs");
  }

  if (!Array.isArray(result.limitations) || result.limitations.length === 0) {
    throw new Error("Monitor result is missing limitations");
  }

  if (!result.proofBundlePosture?.summary) {
    throw new Error("Monitor result is missing proof posture");
  }

  if (!result.humanReviewNextStep) {
    throw new Error("Monitor result is missing a human-review next step");
  }

  if (!result.deterministicSeverityRationale) {
    throw new Error("Monitor result is missing deterministic severity rationale");
  }

  if (
    result.runtimeBoundary?.runtimeCodexUsed !== false ||
    result.runtimeBoundary?.deliveryActionUsed !== false ||
    result.runtimeBoundary?.investigationMissionCreated !== false ||
    result.runtimeBoundary?.autonomousFinanceActionUsed !== false
  ) {
    throw new Error("Monitor result crossed an F6 runtime or action boundary");
  }
}

function assertCreatedAndOpenedSameMission(created, opened) {
  if (created.created !== true) {
    throw new Error("First alert investigation request did not report created=true");
  }

  if (opened.created !== false) {
    throw new Error("Repeated alert investigation request did not report created=false");
  }

  if (created.mission.id !== opened.mission.id) {
    throw new Error("Repeated alert investigation request created a duplicate mission");
  }
}

function assertMissionCreationResponse(created, monitorResult) {
  const seed = created.proofBundle?.monitorInvestigation;

  if (created.mission.type !== "discovery") {
    throw new Error("Alert investigation mission did not use discovery umbrella type");
  }

  if (created.mission.status !== "succeeded") {
    throw new Error("Alert investigation mission was not a ready handoff record");
  }

  if (created.mission.sourceKind !== "alert") {
    throw new Error("Alert investigation mission did not use sourceKind alert");
  }

  if (created.mission.sourceRef !== `${SOURCE_REF_PREFIX}${monitorResult.id}`) {
    throw new Error("Alert investigation mission sourceRef did not target monitor result");
  }

  if (created.tasks.length !== 0) {
    throw new Error("Alert investigation mission created runnable tasks");
  }

  assertMonitorInvestigationSeed(seed, monitorResult);
}

function assertMissionDetail(detail, monitorResult) {
  assertMonitorInvestigationSeed(detail.monitorInvestigation, monitorResult);
  assertMonitorInvestigationSeed(
    detail.proofBundle.monitorInvestigation,
    monitorResult,
  );

  if (detail.tasks.length !== 0) {
    throw new Error("Alert investigation mission detail included runnable tasks");
  }

  if (detail.discoveryAnswer !== null || detail.reporting !== null) {
    throw new Error("Alert investigation detail looked like generated analysis or a report");
  }

  if (detail.approvals.length !== 0 || detail.approvalCards.length !== 0) {
    throw new Error("Alert investigation detail created approvals");
  }

  const artifactKinds = detail.artifacts.map((artifact) => artifact.kind);

  if (
    artifactKinds.length !== 1 ||
    artifactKinds[0] !== "proof_bundle_manifest"
  ) {
    throw new Error(
      `Expected only proof_bundle_manifest artifact, received ${artifactKinds.join(", ")}`,
    );
  }
}

function assertMissionListItem(listedMission, monitorResult) {
  assertMonitorInvestigationSeed(
    listedMission.monitorInvestigation,
    monitorResult,
  );

  if (listedMission.latestTask !== null) {
    throw new Error("Alert investigation list item included a runnable task");
  }

  if (
    listedMission.reportKind !== null ||
    listedMission.answerSummary !== null ||
    listedMission.pendingApprovalCount !== 0
  ) {
    throw new Error("Alert investigation list item mixed in report, answer, or approval posture");
  }
}

function assertMonitorInvestigationSeed(seed, monitorResult) {
  if (!seed) {
    throw new Error("Alert investigation seed was missing");
  }

  const sourceRef = `${SOURCE_REF_PREFIX}${monitorResult.id}`;

  if (
    seed.monitorResultId !== monitorResult.id ||
    seed.companyKey !== monitorResult.companyKey ||
    seed.monitorKind !== "cash_posture" ||
    seed.monitorResultStatus !== "alert" ||
    seed.alertSeverity !== monitorResult.severity ||
    seed.sourceRef !== sourceRef
  ) {
    throw new Error(
      `Alert investigation seed did not preserve monitor identity: ${JSON.stringify(seed)}`,
    );
  }

  if (
    JSON.stringify(seed.conditions) !== JSON.stringify(monitorResult.conditions) ||
    JSON.stringify(seed.sourceLineageRefs) !==
      JSON.stringify(monitorResult.sourceLineageRefs) ||
    JSON.stringify(seed.sourceFreshnessPosture) !==
      JSON.stringify(monitorResult.sourceFreshnessPosture) ||
    JSON.stringify(seed.proofBundlePosture) !==
      JSON.stringify(monitorResult.proofBundlePosture)
  ) {
    throw new Error("Alert investigation seed did not preserve monitor posture");
  }

  if (
    seed.conditionSummaries.length === 0 ||
    seed.sourceLineageSummary.length === 0 ||
    seed.limitations.length === 0 ||
    seed.humanReviewNextStep.length === 0
  ) {
    throw new Error("Alert investigation seed is missing summary posture");
  }

  if (
    seed.runtimeBoundary.monitorRerunUsed !== false ||
    seed.runtimeBoundary.runtimeCodexUsed !== false ||
    seed.runtimeBoundary.deliveryActionUsed !== false ||
    seed.runtimeBoundary.scheduledAutomationUsed !== false ||
    seed.runtimeBoundary.reportArtifactCreated !== false ||
    seed.runtimeBoundary.approvalCreated !== false ||
    seed.runtimeBoundary.autonomousFinanceActionUsed !== false
  ) {
    throw new Error("Alert investigation crossed a runtime, delivery, or finance action boundary");
  }
}

async function assertNoRuntimeDeliveryReportApprovalOrOutbox(pool, input) {
  const [
    missionTaskCount,
    missionRuntimeThreadCount,
    approvalCount,
    outboxCount,
    missionOutboxCount,
    artifactKinds,
    replayTypes,
    alertSourceMissionCount,
  ] = await Promise.all([
    readScalar(
      pool,
      "select count(*)::int as count from mission_tasks where mission_id = $1",
      [input.missionId],
    ),
    readScalar(
      pool,
      "select count(*)::int as count from mission_tasks where mission_id = $1 and codex_thread_id is not null",
      [input.missionId],
    ),
    readScalar(
      pool,
      "select count(*)::int as count from approvals where mission_id = $1",
      [input.missionId],
    ),
    readScalar(pool, "select count(*)::int as count from outbox_events", []),
    readScalar(
      pool,
      "select count(*)::int as count from outbox_events where mission_id = $1",
      [input.missionId],
    ),
    readColumn(pool, "select kind from artifacts where mission_id = $1", [
      input.missionId,
    ]),
    readColumn(pool, "select type from replay_events where mission_id = $1", [
      input.missionId,
    ]),
    readScalar(
      pool,
      "select count(*)::int as count from missions where source_kind = 'alert' and id = $1",
      [input.missionId],
    ),
  ]);

  if (missionTaskCount !== 0 || missionRuntimeThreadCount !== 0) {
    throw new Error("Alert investigation created runtime mission tasks");
  }

  if (approvalCount !== 0) {
    throw new Error("Alert investigation created approvals");
  }

  if (
    outboxCount !== input.monitorRunsBoundary.outboxEvents ||
    missionOutboxCount !== 0
  ) {
    throw new Error("Alert investigation created outbox or delivery events");
  }

  const reportArtifacts = artifactKinds.filter((kind) =>
    REPORT_ARTIFACT_KINDS.has(kind),
  );

  if (reportArtifacts.length > 0) {
    throw new Error(
      `Alert investigation created report artifacts: ${reportArtifacts.join(", ")}`,
    );
  }

  if (artifactKinds.length !== 1 || artifactKinds[0] !== "proof_bundle_manifest") {
    throw new Error(
      `Alert investigation created unexpected artifacts: ${artifactKinds.join(", ")}`,
    );
  }

  if (replayTypes.some((type) => type.startsWith("runtime."))) {
    throw new Error(
      `Alert investigation created runtime replay events: ${replayTypes.join(", ")}`,
    );
  }

  if (alertSourceMissionCount !== 1) {
    throw new Error("Alert investigation mission source lookup was not unique");
  }

  const after = await readBoundaryCounts(pool);

  if (after.missions !== input.monitorRunsBoundary.missions + 1) {
    throw new Error("Alert investigation did not create exactly one mission");
  }

  if (after.artifacts !== input.monitorRunsBoundary.artifacts + 1) {
    throw new Error("Alert investigation did not create exactly one proof artifact");
  }

  if (after.approvals !== input.before.approvals) {
    throw new Error("Alert investigation changed approval count");
  }

  if (after.outboxEvents !== input.before.outboxEvents) {
    throw new Error("Alert investigation changed outbox count");
  }

  if (after.taskRuntimeThreads !== input.before.taskRuntimeThreads) {
    throw new Error("Alert investigation created runtime-Codex threads");
  }
}

function assertDiscoveryFamilies() {
  const expectedFamilies = [
    "cash_posture",
    "collections_pressure",
    "payables_pressure",
    "spend_posture",
    "obligation_calendar_review",
    "policy_lookup",
  ];

  if (
    JSON.stringify(FINANCE_DISCOVERY_QUESTION_KINDS) !==
    JSON.stringify(expectedFamilies)
  ) {
    throw new Error(
      `Discovery family list changed: ${FINANCE_DISCOVERY_QUESTION_KINDS.join(", ")}`,
    );
  }
}

async function readBoundaryCounts(pool) {
  const [
    approvalCount,
    artifactCount,
    missionCount,
    taskWithRuntimeThreadCount,
    outboxCount,
  ] = await Promise.all([
    readScalar(pool, "select count(*)::int as count from approvals", []),
    readScalar(pool, "select count(*)::int as count from artifacts", []),
    readScalar(pool, "select count(*)::int as count from missions", []),
    readScalar(
      pool,
      "select count(*)::int as count from mission_tasks where codex_thread_id is not null",
      [],
    ),
    readScalar(pool, "select count(*)::int as count from outbox_events", []),
  ]);

  return {
    approvals: approvalCount,
    artifacts: artifactCount,
    missions: missionCount,
    taskRuntimeThreads: taskWithRuntimeThreadCount,
    outboxEvents: outboxCount,
  };
}

function assertMonitorOnlyBoundaryCounts(before, after) {
  for (const key of Object.keys(before)) {
    if (before[key] !== after[key]) {
      throw new Error(
        `F6A monitor run changed ${key}: before=${before[key]}, after=${after[key]}`,
      );
    }
  }
}

async function readScalar(pool, query, values) {
  const result = await pool.query(query, values);
  return Number(result.rows[0]?.count ?? 0);
}

async function readColumn(pool, query, values) {
  const result = await pool.query(query, values);
  return result.rows.map((row) => Object.values(row)[0]);
}

function summarizeSyncRun(syncRun) {
  return {
    extractorKey: syncRun.extractorKey,
    id: syncRun.id,
    status: syncRun.status,
  };
}

function summarizeMonitorResult(result) {
  return {
    conditionKinds: result.conditions.map((condition) => condition.kind),
    freshnessState: result.sourceFreshnessPosture.state,
    humanReviewNextStep: result.humanReviewNextStep,
    id: result.id,
    limitations: result.limitations,
    monitorKind: result.monitorKind,
    proofBundlePosture: result.proofBundlePosture,
    runtimeBoundary: result.runtimeBoundary,
    severity: result.severity,
    sourceLineageCount: result.sourceLineageRefs.length,
    status: result.status,
  };
}

function summarizeMission(created, detail, listedMission) {
  return {
    created: created.created,
    id: created.mission.id,
    listProofBundleStatus: listedMission.proofBundleStatus,
    monitorResultId: detail.monitorInvestigation.monitorResultId,
    proofBundleStatus: detail.proofBundle.status,
    sourceKind: created.mission.sourceKind,
    sourceRef: created.mission.sourceRef,
    status: created.mission.status,
    taskCount: detail.tasks.length,
    type: created.mission.type,
  };
}

async function writeSeedSnapshot(seed) {
  const directory = await mkdtemp(join(tmpdir(), "pocket-cfo-alert-investigation-"));
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

function requireId(value, label) {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`${label} missing from response`);
  }

  return value;
}

if (process.argv[1] && resolve(process.argv[1]) === MODULE_PATH) {
  await main();
}
