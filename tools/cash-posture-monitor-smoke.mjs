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

const DEFAULT_CREATED_BY = "cash-posture-monitor-smoke";
const MODULE_PATH = fileURLToPath(import.meta.url);

function buildFixture(input) {
  const runTag = input.runTag.toLowerCase();

  return {
    createdBy: DEFAULT_CREATED_BY,
    missingSourceCompany: {
      companyKey: `local-cash-monitor-missing-${runTag}`,
      companyName: `Local Cash Monitor Missing ${input.runTag}`,
      sourceName: `Cash monitor trial balance ${input.runTag}`,
      upload: {
        mediaType: "text/csv",
        originalFileName: `cash-monitor-trial-balance-${input.runTag}.csv`,
        text: [
          "account_code,account_name,period_end,debit,credit,currency_code,account_type",
          "1000,Cash,2026-04-30,1200.00,0.00,USD,asset",
          "2000,Accounts Payable,2026-04-30,0.00,1200.00,USD,liability",
        ].join("\n"),
      },
    },
    cleanCompany: {
      companyKey: `local-cash-monitor-clean-${runTag}`,
      companyName: `Local Cash Monitor Clean ${input.runTag}`,
      sourceName: `Cash monitor bank summary ${input.runTag}`,
      upload: {
        mediaType: "text/csv",
        originalFileName: `cash-monitor-bank-summary-${input.runTag}.csv`,
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
            note: "Seed snapshot for the packaged F6A cash-posture monitor smoke.",
            requestedBy: "cash_posture_monitor_smoke",
            runTag: input.runTag,
          },
          null,
          2,
        )}\n`,
        "utf8",
      ),
      mediaType: "application/json",
      originalFileName: `cash-posture-monitor-seed-${input.runTag}.json`,
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
    const missingRun = await runCashMonitor(app, {
      companyKey: fixture.missingSourceCompany.companyKey,
      runKey: `missing-${runTag}`,
    });

    assertAlertResult(missingRun, {
      companyKey: fixture.missingSourceCompany.companyKey,
      expectedConditionKinds: ["missing_source", "coverage_gap"],
      expectedProofStates: [
        "limited_by_missing_source",
        "limited_by_coverage_gap",
      ],
      expectedSeverity: "critical",
      expectedStatus: "alert",
    });

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

    const latestClean = await injectJson(app, {
      expectedStatus: 200,
      method: "GET",
      url: `/monitoring/companies/${fixture.cleanCompany.companyKey}/cash-posture/latest`,
    });

    if (latestClean.monitorResult?.id !== cleanRun.monitorResult.id) {
      throw new Error("Latest monitor read did not return the persisted clean result");
    }

    const after = await readBoundaryCounts(pool);
    assertBoundaryCounts(before, after);

    console.log(
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          discoveryFamilies: FINANCE_DISCOVERY_QUESTION_KINDS,
          missingSourceScenario: {
            companyKey: fixture.missingSourceCompany.companyKey,
            syncRun: {
              id: missingSourceSync.syncRun.id,
              extractorKey: missingSourceSync.syncRun.extractorKey,
              status: missingSourceSync.syncRun.status,
            },
            monitorResult: summarizeMonitorResult(missingRun.monitorResult),
            alertCard: missingRun.alertCard,
          },
          cleanScenario: {
            companyKey: fixture.cleanCompany.companyKey,
            syncRun: {
              id: cleanSync.syncRun.id,
              extractorKey: cleanSync.syncRun.extractorKey,
              status: cleanSync.syncRun.status,
            },
            monitorResult: summarizeMonitorResult(cleanRun.monitorResult),
            alertCard: cleanRun.alertCard,
          },
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

async function syncCompanyFixture(app, input) {
  const created = await injectJson(app, {
    expectedStatus: 201,
    method: "POST",
    payload: {
      createdBy: input.createdBy,
      description: "Packaged F6A cash-posture monitor smoke source.",
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

function assertAlertResult(run, input) {
  if (run.monitorResult.companyKey !== input.companyKey) {
    throw new Error("Monitor result companyKey did not match scenario");
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
        `Expected monitor condition ${expectedConditionKind}, received ${conditionKinds.join(", ")}`,
      );
    }
  }

  if (!input.expectedProofStates.includes(run.monitorResult.proofBundlePosture.state)) {
    throw new Error(
      `Unexpected proof posture ${run.monitorResult.proofBundlePosture.state}`,
    );
  }

  assertRequiredMonitorPosture(run.monitorResult);

  if (!run.alertCard) {
    throw new Error("Alerting monitor result did not include an alert card");
  }

  if (run.alertCard.companyKey !== input.companyKey) {
    throw new Error("Alert card companyKey did not match scenario");
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

  if (run.monitorResult.sourceLineageRefs.length === 0) {
    throw new Error("Clean monitor result did not include source lineage refs");
  }

  if (run.monitorResult.proofBundlePosture.state !== "source_backed") {
    throw new Error(
      `Clean monitor proof posture was ${run.monitorResult.proofBundlePosture.state}`,
    );
  }

  assertRequiredMonitorPosture(run.monitorResult);
}

function assertRequiredMonitorPosture(result) {
  if (!result.sourceFreshnessPosture?.summary) {
    throw new Error("Monitor result is missing source freshness posture");
  }

  if (!Array.isArray(result.limitations) || result.limitations.length === 0) {
    throw new Error("Monitor result is missing limitations");
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
    throw new Error("Monitor result crossed an F6A runtime or action boundary");
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

  if (JSON.stringify(FINANCE_DISCOVERY_QUESTION_KINDS) !== JSON.stringify(expectedFamilies)) {
    throw new Error(
      `Discovery family list changed: ${FINANCE_DISCOVERY_QUESTION_KINDS.join(", ")}`,
    );
  }
}

async function readBoundaryCounts(pool) {
  const [
    artifactCount,
    missionCount,
    taskWithRuntimeThreadCount,
    outboxCount,
  ] = await Promise.all([
    readCount(pool, "artifacts"),
    readCount(pool, "missions"),
    readRuntimeThreadCount(pool),
    readCount(pool, "outbox_events"),
  ]);

  return {
    artifacts: artifactCount,
    missions: missionCount,
    taskRuntimeThreads: taskWithRuntimeThreadCount,
    outboxEvents: outboxCount,
  };
}

async function readCount(pool, tableName) {
  const result = await pool.query(`select count(*)::int as count from ${tableName}`);
  return Number(result.rows[0]?.count ?? 0);
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
        `F6A monitor changed ${key}: before=${before[key]}, after=${after[key]}`,
      );
    }
  }
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
  const directory = await mkdtemp(join(tmpdir(), "pocket-cfo-cash-monitor-"));
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
