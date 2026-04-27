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

const DEFAULT_CREATED_BY = "payables-pressure-monitor-smoke";
const MODULE_PATH = fileURLToPath(import.meta.url);

function buildFixture(input) {
  const runTag = input.runTag.toLowerCase();

  return {
    createdBy: DEFAULT_CREATED_BY,
    companies: {
      missing: buildCompanyFixture({
        companyKey: `local-payables-monitor-missing-${runTag}`,
        companyName: `Local Payables Monitor Missing ${input.runTag}`,
        originalFileName: `payables-monitor-trial-balance-${input.runTag}.csv`,
        sourceName: `Payables monitor missing ${input.runTag}`,
        text: [
          "account_code,account_name,period_end,debit,credit,currency_code,account_type",
          "1000,Cash,2026-04-30,1200.00,0.00,USD,asset",
          "2000,Accounts Payable,2026-04-30,0.00,1200.00,USD,liability",
        ].join("\n"),
      }),
      staleDataQuality: buildCompanyFixture({
        companyKey: `local-payables-monitor-stale-dq-${runTag}`,
        companyName: `Local Payables Monitor Stale DQ ${input.runTag}`,
        originalFileName: `payables-monitor-stale-dq-${input.runTag}.csv`,
        sourceName: `Payables monitor stale data quality ${input.runTag}`,
        text: [
          "vendor_name,vendor_id,currency,as_of,current,past_due,total",
          "Paper Supply Co,V-100,USD,2026-04-24,80.00,20.00,100.00",
          "Cloud Hosting,V-200,USD,,80.00,20.00,100.00",
        ].join("\n"),
      }),
      coverageGap: buildCompanyFixture({
        companyKey: `local-payables-monitor-coverage-${runTag}`,
        companyName: `Local Payables Monitor Coverage ${input.runTag}`,
        originalFileName: `payables-monitor-coverage-${input.runTag}.csv`,
        sourceName: `Payables monitor coverage ${input.runTag}`,
        text: [
          "vendor_name,vendor_id,currency,as_of,over_90",
          "Partial Vendor,V-300,USD,2026-04-26,25.00",
        ].join("\n"),
      }),
      overdue: buildCompanyFixture({
        companyKey: `local-payables-monitor-overdue-${runTag}`,
        companyName: `Local Payables Monitor Overdue ${input.runTag}`,
        originalFileName: `payables-monitor-overdue-${input.runTag}.csv`,
        sourceName: `Payables monitor overdue ${input.runTag}`,
        text: [
          "vendor_name,vendor_id,currency,as_of,current,past_due,total",
          "Delta Vendor,V-400,USD,2026-04-26,20.00,80.00,100.00",
        ].join("\n"),
      }),
      conflictingBasis: buildCompanyFixture({
        companyKey: `local-payables-monitor-conflict-${runTag}`,
        companyName: `Local Payables Monitor Conflict ${input.runTag}`,
        originalFileName: `payables-monitor-conflict-${input.runTag}.csv`,
        sourceName: `Payables monitor conflict ${input.runTag}`,
        text: [
          "vendor_name,vendor_id,currency,as_of,current,31_60,past_due,total",
          "Conflict Vendor,V-450,USD,2026-04-26,20.00,40.00,80.00,100.00",
        ].join("\n"),
      }),
      clean: buildCompanyFixture({
        companyKey: `local-payables-monitor-clean-${runTag}`,
        companyName: `Local Payables Monitor Clean ${input.runTag}`,
        originalFileName: `payables-monitor-clean-${input.runTag}.csv`,
        sourceName: `Payables monitor clean ${input.runTag}`,
        text: [
          "vendor_name,vendor_id,currency,as_of,current,past_due,total",
          "Clean Vendor,V-500,USD,2026-04-26,100.00,0.00,100.00",
        ].join("\n"),
      }),
    },
    seed: {
      body: Buffer.from(
        `${JSON.stringify(
          {
            createdBy: DEFAULT_CREATED_BY,
            note: "Seed snapshot for the packaged F6D payables-pressure monitor smoke.",
            requestedBy: "payables_pressure_monitor_smoke",
            runTag: input.runTag,
          },
          null,
          2,
        )}\n`,
        "utf8",
      ),
      mediaType: "application/json",
      originalFileName: `payables-pressure-monitor-seed-${input.runTag}.json`,
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

    const missingSync = await syncCompanyFixture(app, {
      capturedAt,
      company: fixture.companies.missing,
      createdBy: fixture.createdBy,
      seed: fixture.seed,
      seedSnapshot,
    });
    const missingRun = await runPayablesMonitor(app, {
      companyKey: fixture.companies.missing.companyKey,
      runKey: `missing-${runTag}`,
    });
    assertAlertResult(missingRun, {
      companyKey: fixture.companies.missing.companyKey,
      expectedConditionKinds: ["missing_source", "coverage_gap"],
      expectedProofStates: [
        "limited_by_missing_source",
        "limited_by_coverage_gap",
      ],
      expectedSeverity: "critical",
    });

    const staleSync = await syncCompanyFixture(app, {
      capturedAt,
      company: fixture.companies.staleDataQuality,
      createdBy: fixture.createdBy,
      seed: fixture.seed,
      seedSnapshot,
    });
    await markSyncRunStale(pool, staleSync.syncRun.id);
    const staleRun = await runPayablesMonitor(app, {
      companyKey: fixture.companies.staleDataQuality.companyKey,
      runKey: `stale-data-quality-${runTag}`,
    });
    assertAlertResult(staleRun, {
      companyKey: fixture.companies.staleDataQuality.companyKey,
      expectedConditionKinds: ["stale_source", "data_quality_gap"],
      expectedProofStates: [
        "limited_by_stale_source",
        "limited_by_data_quality_gap",
      ],
      expectedSeverity: "warning",
      requireSourceLineage: true,
    });

    const coverageSync = await syncCompanyFixture(app, {
      capturedAt,
      company: fixture.companies.coverageGap,
      createdBy: fixture.createdBy,
      seed: fixture.seed,
      seedSnapshot,
    });
    const coverageRun = await runPayablesMonitor(app, {
      companyKey: fixture.companies.coverageGap.companyKey,
      runKey: `coverage-${runTag}`,
    });
    assertAlertResult(coverageRun, {
      companyKey: fixture.companies.coverageGap.companyKey,
      expectedConditionKinds: ["coverage_gap", "data_quality_gap"],
      expectedProofStates: [
        "limited_by_coverage_gap",
        "limited_by_data_quality_gap",
      ],
      expectedSeverity: "warning",
      forbidConditionKinds: ["overdue_concentration"],
      requireSourceLineage: true,
    });

    const overdueSync = await syncCompanyFixture(app, {
      capturedAt,
      company: fixture.companies.overdue,
      createdBy: fixture.createdBy,
      seed: fixture.seed,
      seedSnapshot,
    });
    const overdueRun = await runPayablesMonitor(app, {
      companyKey: fixture.companies.overdue.companyKey,
      runKey: `overdue-${runTag}`,
    });
    const overdueRetry = await runPayablesMonitor(app, {
      companyKey: fixture.companies.overdue.companyKey,
      runKey: `overdue-${runTag}`,
    });
    assertIdempotentRetry(overdueRun, overdueRetry);
    assertAlertResult(overdueRetry, {
      companyKey: fixture.companies.overdue.companyKey,
      expectedConditionKinds: ["overdue_concentration"],
      expectedProofStates: ["source_backed"],
      expectedSeverity: "critical",
      requireSourceLineage: true,
    });

    const conflictSync = await syncCompanyFixture(app, {
      capturedAt,
      company: fixture.companies.conflictingBasis,
      createdBy: fixture.createdBy,
      seed: fixture.seed,
      seedSnapshot,
    });
    const conflictRun = await runPayablesMonitor(app, {
      companyKey: fixture.companies.conflictingBasis.companyKey,
      runKey: `conflict-${runTag}`,
    });
    assertAlertResult(conflictRun, {
      companyKey: fixture.companies.conflictingBasis.companyKey,
      expectedConditionKinds: ["coverage_gap", "data_quality_gap"],
      expectedProofStates: [
        "limited_by_coverage_gap",
        "limited_by_data_quality_gap",
      ],
      expectedSeverity: "warning",
      forbidConditionKinds: ["overdue_concentration"],
      requireSourceLineage: true,
    });

    const cleanSync = await syncCompanyFixture(app, {
      capturedAt,
      company: fixture.companies.clean,
      createdBy: fixture.createdBy,
      seed: fixture.seed,
      seedSnapshot,
    });
    const cleanRun = await runPayablesMonitor(app, {
      companyKey: fixture.companies.clean.companyKey,
      runKey: `clean-${runTag}`,
    });
    assertNoAlertResult(cleanRun, fixture.companies.clean.companyKey);

    const latestOverdue = await injectJson(app, {
      expectedStatus: 200,
      method: "GET",
      url: `/monitoring/companies/${fixture.companies.overdue.companyKey}/payables-pressure/latest`,
    });

    if (latestOverdue.monitorResult?.id !== overdueRun.monitorResult.id) {
      throw new Error(
        "Latest payables monitor read did not return the persisted result",
      );
    }

    const after = await readBoundaryCounts(pool);
    assertBoundaryCounts(before, after);
    assertDiscoveryFamilies();

    console.log(
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          discoveryFamilies: FINANCE_DISCOVERY_QUESTION_KINDS,
          scenarios: {
            missing: summarizeScenario(missingSync, missingRun),
            staleDataQuality: summarizeScenario(staleSync, staleRun),
            coverageGap: summarizeScenario(coverageSync, coverageRun),
            overdue: summarizeScenario(overdueSync, overdueRetry),
            conflictingBasis: summarizeScenario(conflictSync, conflictRun),
            clean: summarizeScenario(cleanSync, cleanRun),
          },
          idempotentRunKeyPreserved:
            overdueRun.monitorResult.id === overdueRetry.monitorResult.id,
          preservedBoundaries: after,
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

function buildCompanyFixture(input) {
  return {
    companyKey: input.companyKey,
    companyName: input.companyName,
    sourceName: input.sourceName,
    upload: {
      mediaType: "text/csv",
      originalFileName: input.originalFileName,
      text: input.text,
    },
  };
}

async function syncCompanyFixture(app, input) {
  const created = await injectJson(app, {
    expectedStatus: 201,
    method: "POST",
    payload: {
      createdBy: input.createdBy,
      description: "Packaged F6D payables-pressure monitor smoke source.",
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

async function runPayablesMonitor(app, input) {
  return injectJson(app, {
    expectedStatus: 201,
    method: "POST",
    payload: {
      runKey: input.runKey,
      triggeredBy: DEFAULT_CREATED_BY,
    },
    url: `/monitoring/companies/${input.companyKey}/payables-pressure/run`,
  });
}

async function markSyncRunStale(pool, syncRunId) {
  const completedAt = new Date(Date.now() - 72 * 60 * 60 * 1000);
  const startedAt = new Date(completedAt.getTime() - 60 * 1000);

  await pool.query(
    "update finance_twin_sync_runs set started_at = $1, completed_at = $2, created_at = $1 where id = $3",
    [startedAt.toISOString(), completedAt.toISOString(), syncRunId],
  );
}

function assertAlertResult(run, input) {
  if (run.monitorResult.companyKey !== input.companyKey) {
    throw new Error("Monitor result companyKey did not match scenario");
  }

  if (
    run.monitorResult.monitorKind !== "payables_pressure" ||
    run.monitorResult.status !== "alert" ||
    run.monitorResult.severity !== input.expectedSeverity
  ) {
    throw new Error(
      `Unexpected payables alert posture: ${JSON.stringify(run.monitorResult)}`,
    );
  }

  const conditionKinds = run.monitorResult.conditions.map(
    (condition) => condition.kind,
  );

  for (const expectedConditionKind of input.expectedConditionKinds) {
    if (!conditionKinds.includes(expectedConditionKind)) {
      throw new Error(
        `Expected monitor condition ${expectedConditionKind}, received ${conditionKinds.join(", ")}`,
      );
    }
  }

  for (const forbiddenKind of input.forbidConditionKinds ?? []) {
    if (conditionKinds.includes(forbiddenKind)) {
      throw new Error(
        `Forbidden monitor condition ${forbiddenKind} was present in ${conditionKinds.join(", ")}`,
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
    throw new Error(
      "Alerting payables monitor result did not include an alert card",
    );
  }

  if (run.alertCard.monitorKind !== "payables_pressure") {
    throw new Error("Payables alert card did not preserve monitorKind");
  }

  if (run.alertCard.companyKey !== input.companyKey) {
    throw new Error("Alert card companyKey did not match scenario");
  }

  if (!run.alertCard.sourceFreshnessPosture?.summary) {
    throw new Error("Alert card is missing source freshness posture");
  }

  if (!run.alertCard.sourceLineageSummary) {
    throw new Error("Alert card is missing source lineage summary");
  }

  if (
    run.alertCard.sourceLineageRefs.length !==
    run.monitorResult.sourceLineageRefs.length
  ) {
    throw new Error("Alert card did not carry source lineage refs");
  }

  if (
    input.requireSourceLineage &&
    run.monitorResult.sourceLineageRefs.length === 0
  ) {
    throw new Error(
      "Source-backed payables alert did not include lineage refs",
    );
  }

  if (
    !run.alertCard.deterministicSeverityRationale ||
    !run.alertCard.proofBundlePosture?.summary ||
    !run.alertCard.humanReviewNextStep ||
    !Array.isArray(run.alertCard.limitations) ||
    run.alertCard.limitations.length === 0
  ) {
    throw new Error(
      "Alert card is missing F6D proof, limitation, or review posture",
    );
  }
}

function assertNoAlertResult(run, companyKey) {
  if (run.monitorResult.companyKey !== companyKey) {
    throw new Error("Monitor result companyKey did not match clean scenario");
  }

  if (
    run.monitorResult.monitorKind !== "payables_pressure" ||
    run.monitorResult.status !== "no_alert" ||
    run.monitorResult.severity !== "none" ||
    run.alertCard !== null ||
    run.monitorResult.alertCard !== null
  ) {
    throw new Error(
      `Expected a non-alerting clean payables monitor result, received ${JSON.stringify(run)}`,
    );
  }

  if (run.monitorResult.sourceLineageRefs.length === 0) {
    throw new Error(
      "Clean payables monitor result did not include source lineage refs",
    );
  }

  if (run.monitorResult.proofBundlePosture.state !== "source_backed") {
    throw new Error(
      `Clean payables proof posture was ${run.monitorResult.proofBundlePosture.state}`,
    );
  }

  assertRequiredMonitorPosture(run.monitorResult);
}

function assertRequiredMonitorPosture(result) {
  if (!result.sourceFreshnessPosture?.summary) {
    throw new Error("Monitor result is missing source freshness posture");
  }

  if (!Array.isArray(result.sourceLineageRefs)) {
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
    throw new Error(
      "Monitor result is missing deterministic severity rationale",
    );
  }

  if (
    result.runtimeBoundary?.runtimeCodexUsed !== false ||
    result.runtimeBoundary?.deliveryActionUsed !== false ||
    result.runtimeBoundary?.investigationMissionCreated !== false ||
    result.runtimeBoundary?.autonomousFinanceActionUsed !== false
  ) {
    throw new Error("Monitor result crossed an F6D runtime or action boundary");
  }
}

function assertIdempotentRetry(first, second) {
  if (first.monitorResult.id !== second.monitorResult.id) {
    throw new Error(
      "Repeated payables monitor runKey created a duplicate result",
    );
  }

  if (first.monitorResult.createdAt !== second.monitorResult.createdAt) {
    throw new Error("Repeated payables monitor runKey changed createdAt");
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
    outboxCount,
    paymentInstructionCount,
    taskWithRuntimeThreadCount,
  ] = await Promise.all([
    readCount(pool, "approvals"),
    readCount(pool, "artifacts"),
    readCount(pool, "missions"),
    readCount(pool, "outbox_events"),
    readOptionalCount(pool, "payment_instructions"),
    readRuntimeThreadCount(pool),
  ]);

  return {
    approvals: approvalCount,
    artifacts: artifactCount,
    missions: missionCount,
    outboxEvents: outboxCount,
    paymentInstructions: paymentInstructionCount,
    taskRuntimeThreads: taskWithRuntimeThreadCount,
  };
}

async function readCount(pool, tableName) {
  const result = await pool.query(
    `select count(*)::int as count from ${tableName}`,
  );
  return Number(result.rows[0]?.count ?? 0);
}

async function readOptionalCount(pool, tableName) {
  const exists = await pool.query("select to_regclass($1) as table_name", [
    `public.${tableName}`,
  ]);

  if (!exists.rows[0]?.table_name) {
    return 0;
  }

  return readCount(pool, tableName);
}

async function readRuntimeThreadCount(pool) {
  const result = await pool.query(
    "select count(*)::int as count from mission_tasks where codex_thread_id is not null",
  );
  return Number(result.rows[0]?.count ?? 0);
}

function assertBoundaryCounts(before, after) {
  for (const key of Object.keys(before)) {
    if (before[key] !== after[key]) {
      throw new Error(
        `F6D payables monitor changed ${key}: before=${before[key]}, after=${after[key]}`,
      );
    }
  }
}

function summarizeScenario(sync, run) {
  return {
    syncRun: {
      id: sync.syncRun.id,
      extractorKey: sync.syncRun.extractorKey,
      status: sync.syncRun.status,
    },
    monitorResult: summarizeMonitorResult(run.monitorResult),
    alertCard: run.alertCard,
  };
}

function summarizeMonitorResult(result) {
  return {
    id: result.id,
    monitorKind: result.monitorKind,
    status: result.status,
    severity: result.severity,
    conditionKinds: result.conditions.map((condition) => condition.kind),
    freshnessState: result.sourceFreshnessPosture.state,
    sourceLineageCount: result.sourceLineageRefs.length,
    proofBundlePosture: result.proofBundlePosture,
    replayPosture: result.replayPosture,
    runtimeBoundary: result.runtimeBoundary,
    limitations: result.limitations,
    humanReviewNextStep: result.humanReviewNextStep,
  };
}

async function writeSeedSnapshot(seed) {
  const directory = await mkdtemp(
    join(tmpdir(), "pocket-cfo-payables-monitor-"),
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

function requireId(value, label) {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`${label} missing from response`);
  }

  return value;
}

if (process.argv[1] && resolve(process.argv[1]) === MODULE_PATH) {
  await main();
}
