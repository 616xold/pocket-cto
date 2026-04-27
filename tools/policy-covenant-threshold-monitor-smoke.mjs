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

const DEFAULT_CREATED_BY = "policy-covenant-threshold-monitor-smoke";
const MODULE_PATH = fileURLToPath(import.meta.url);

function buildFixture(input) {
  const runTag = input.runTag.toLowerCase();

  return {
    createdBy: DEFAULT_CREATED_BY,
    companies: {
      missingPolicy: buildCompanyFixture({
        companyKey: `local-policy-monitor-missing-${runTag}`,
        companyName: `Local Policy Monitor Missing ${input.runTag}`,
        pastDueSharePercent: 20,
      }),
      noGrammar: buildCompanyFixture({
        companyKey: `local-policy-monitor-no-grammar-${runTag}`,
        companyName: `Local Policy Monitor No Grammar ${input.runTag}`,
        pastDueSharePercent: 20,
        policyText: [
          "# Collections Policy",
          "",
          "Operators should review overdue balances during close.",
        ].join("\n"),
      }),
      breach: buildCompanyFixture({
        companyKey: `local-policy-monitor-breach-${runTag}`,
        companyName: `Local Policy Monitor Breach ${input.runTag}`,
        pastDueSharePercent: 60,
        policyText:
          "Pocket CFO threshold: collections_past_due_share <= 50 percent",
      }),
      unsupportedMetric: buildCompanyFixture({
        companyKey: `local-policy-monitor-metric-${runTag}`,
        companyName: `Local Policy Monitor Metric ${input.runTag}`,
        pastDueSharePercent: 60,
        policyText:
          "Pocket CFO threshold: covenant_leverage_ratio <= 50 percent",
      }),
      unsupportedUnit: buildCompanyFixture({
        companyKey: `local-policy-monitor-unit-${runTag}`,
        companyName: `Local Policy Monitor Unit ${input.runTag}`,
        pastDueSharePercent: 60,
        policyText:
          "Pocket CFO threshold: collections_past_due_share <= 50 dollars",
      }),
      clean: buildCompanyFixture({
        companyKey: `local-policy-monitor-clean-${runTag}`,
        companyName: `Local Policy Monitor Clean ${input.runTag}`,
        pastDueSharePercent: 20,
        policyText:
          "Pocket CFO threshold: collections_past_due_share <= 50 percent",
      }),
    },
    seed: {
      body: Buffer.from(
        `${JSON.stringify(
          {
            createdBy: DEFAULT_CREATED_BY,
            note: "Seed snapshot for the packaged F6E policy/covenant threshold monitor smoke.",
            requestedBy: "policy_covenant_threshold_monitor_smoke",
            runTag: input.runTag,
          },
          null,
          2,
        )}\n`,
        "utf8",
      ),
      mediaType: "application/json",
      originalFileName: `policy-covenant-monitor-seed-${input.runTag}.json`,
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

    const missingSync = await syncCollectionsCompany(app, {
      capturedAt,
      company: fixture.companies.missingPolicy,
      createdBy: fixture.createdBy,
      seed: fixture.seed,
      seedSnapshot,
    });
    const missingRun = await runPolicyMonitor(app, {
      companyKey: fixture.companies.missingPolicy.companyKey,
      runKey: `missing-policy-${runTag}`,
    });
    assertAlertResult(missingRun, {
      companyKey: fixture.companies.missingPolicy.companyKey,
      expectedConditionKinds: ["missing_source"],
      expectedProofStates: ["limited_by_missing_source"],
      expectedSeverity: "critical",
      requireAlertCard: true,
    });

    const noGrammar = await preparePolicyScenario(app, {
      capturedAt,
      company: fixture.companies.noGrammar,
      createdBy: fixture.createdBy,
      seed: fixture.seed,
      seedSnapshot,
    });
    const noGrammarRun = await runPolicyMonitor(app, {
      companyKey: fixture.companies.noGrammar.companyKey,
      runKey: `no-grammar-${runTag}`,
    });
    assertAlertResult(noGrammarRun, {
      companyKey: fixture.companies.noGrammar.companyKey,
      expectedConditionKinds: ["coverage_gap"],
      expectedProofStates: ["limited_by_coverage_gap"],
      expectedSeverity: "warning",
      forbidConditionKinds: ["threshold_breach", "threshold_approaching"],
      requireAlertCard: true,
      requireSourceLineage: true,
    });

    const breach = await preparePolicyScenario(app, {
      capturedAt,
      company: fixture.companies.breach,
      createdBy: fixture.createdBy,
      seed: fixture.seed,
      seedSnapshot,
    });
    const breachRun = await runPolicyMonitor(app, {
      companyKey: fixture.companies.breach.companyKey,
      runKey: `breach-${runTag}`,
    });
    const breachRetry = await runPolicyMonitor(app, {
      companyKey: fixture.companies.breach.companyKey,
      runKey: `breach-${runTag}`,
    });
    assertIdempotentRetry(breachRun, breachRetry);
    assertAlertResult(breachRetry, {
      companyKey: fixture.companies.breach.companyKey,
      expectedConditionKinds: ["threshold_breach"],
      expectedProofStates: ["source_backed"],
      expectedSeverity: "critical",
      requireAlertCard: true,
      requireComparableActualLineage: true,
      requireSourceLineage: true,
      requireThresholdLineage: true,
    });
    assertNoForbiddenAdviceOrActionText(breachRetry);

    const unsupportedMetric = await preparePolicyScenario(app, {
      capturedAt,
      company: fixture.companies.unsupportedMetric,
      createdBy: fixture.createdBy,
      seed: fixture.seed,
      seedSnapshot,
    });
    const unsupportedMetricRun = await runPolicyMonitor(app, {
      companyKey: fixture.companies.unsupportedMetric.companyKey,
      runKey: `unsupported-metric-${runTag}`,
    });
    assertAlertResult(unsupportedMetricRun, {
      companyKey: fixture.companies.unsupportedMetric.companyKey,
      expectedConditionKinds: ["data_quality_gap"],
      expectedProofStates: ["limited_by_data_quality_gap"],
      expectedSeverity: "warning",
      forbidConditionKinds: ["threshold_breach", "threshold_approaching"],
      requireAlertCard: true,
      requireSourceLineage: true,
    });

    const unsupportedUnit = await preparePolicyScenario(app, {
      capturedAt,
      company: fixture.companies.unsupportedUnit,
      createdBy: fixture.createdBy,
      seed: fixture.seed,
      seedSnapshot,
    });
    const unsupportedUnitRun = await runPolicyMonitor(app, {
      companyKey: fixture.companies.unsupportedUnit.companyKey,
      runKey: `unsupported-unit-${runTag}`,
    });
    assertAlertResult(unsupportedUnitRun, {
      companyKey: fixture.companies.unsupportedUnit.companyKey,
      expectedConditionKinds: ["data_quality_gap"],
      expectedProofStates: ["limited_by_data_quality_gap"],
      expectedSeverity: "warning",
      forbidConditionKinds: ["threshold_breach", "threshold_approaching"],
      requireAlertCard: true,
      requireSourceLineage: true,
    });

    const clean = await preparePolicyScenario(app, {
      capturedAt,
      company: fixture.companies.clean,
      createdBy: fixture.createdBy,
      seed: fixture.seed,
      seedSnapshot,
    });
    const cleanRun = await runPolicyMonitor(app, {
      companyKey: fixture.companies.clean.companyKey,
      runKey: `clean-${runTag}`,
    });
    assertNoAlertResult(cleanRun, fixture.companies.clean.companyKey);

    const latestBreach = await injectJson(app, {
      expectedStatus: 200,
      method: "GET",
      url: `/monitoring/companies/${fixture.companies.breach.companyKey}/policy-covenant-threshold/latest`,
    });

    if (latestBreach.monitorResult?.id !== breachRun.monitorResult.id) {
      throw new Error(
        "Latest policy/covenant monitor read did not return the persisted result",
      );
    }

    const after = await readBoundaryCounts(pool);
    assertBoundaryCounts(before, after);

    console.log(
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          discoveryFamilies: FINANCE_DISCOVERY_QUESTION_KINDS,
          idempotentRunKeyPreserved:
            breachRun.monitorResult.id === breachRetry.monitorResult.id,
          preservedBoundaries: after,
          scenarios: {
            missingPolicy: summarizeScenario(missingSync, missingRun),
            noGrammar: summarizeScenario(noGrammar.sync, noGrammarRun),
            breach: summarizeScenario(breach.sync, breachRetry),
            unsupportedMetric: summarizeScenario(
              unsupportedMetric.sync,
              unsupportedMetricRun,
            ),
            unsupportedUnit: summarizeScenario(
              unsupportedUnit.sync,
              unsupportedUnitRun,
            ),
            clean: summarizeScenario(clean.sync, cleanRun),
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

function buildCompanyFixture(input) {
  const pastDue = input.pastDueSharePercent.toFixed(2);
  const current = (100 - input.pastDueSharePercent).toFixed(2);

  return {
    companyKey: input.companyKey,
    companyName: input.companyName,
    financeSourceName: `${input.companyName} receivables source`,
    policySourceName: `${input.companyName} policy source`,
    policyText: input.policyText ?? null,
    receivablesUpload: {
      mediaType: "text/csv",
      originalFileName: `${input.companyKey}-receivables.csv`,
      text: [
        "customer_name,customer_id,currency,as_of,current,past_due,total",
        `Acme Customer,C-100,USD,2026-04-26,${current},${pastDue},100.00`,
      ].join("\n"),
    },
  };
}

async function preparePolicyScenario(app, input) {
  const sync = await syncCollectionsCompany(app, input);
  const policy = await createPolicyDocument(app, {
    capturedAt: input.capturedAt,
    company: input.company,
    createdBy: input.createdBy,
  });

  await injectJson(app, {
    expectedStatus: 201,
    method: "POST",
    payload: {
      boundBy: input.createdBy,
      documentRole: "policy_document",
    },
    url: `/cfo-wiki/companies/${input.company.companyKey}/sources/${policy.sourceId}/bind`,
  });
  await injectJson(app, {
    expectedStatus: 201,
    method: "POST",
    payload: {
      triggeredBy: input.createdBy,
    },
    url: `/cfo-wiki/companies/${input.company.companyKey}/compile`,
  });

  return { policy, sync };
}

async function syncCollectionsCompany(app, input) {
  const created = await injectJson(app, {
    expectedStatus: 201,
    method: "POST",
    payload: {
      createdBy: input.createdBy,
      description: "Packaged F6E policy/covenant monitor receivables source.",
      kind: "dataset",
      name: input.company.financeSourceName,
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
    payload: Buffer.from(`${input.company.receivablesUpload.text}\n`, "utf8"),
    url: `/sources/${sourceId}/files?${new URLSearchParams({
      capturedAt: input.capturedAt,
      createdBy: input.createdBy,
      mediaType: input.company.receivablesUpload.mediaType,
      originalFileName: input.company.receivablesUpload.originalFileName,
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

async function createPolicyDocument(app, input) {
  const seedBody = Buffer.from(
    `policy covenant threshold smoke seed for ${input.company.policySourceName}\n`,
    "utf8",
  );
  const created = await injectJson(app, {
    expectedStatus: 201,
    method: "POST",
    payload: {
      createdBy: input.createdBy,
      description: "Packaged F6E policy/covenant monitor policy source.",
      kind: "document",
      name: input.company.policySourceName,
      snapshot: {
        capturedAt: input.capturedAt,
        checksumSha256: createHash("sha256").update(seedBody).digest("hex"),
        mediaType: "text/plain",
        originalFileName: `${input.company.companyKey}-policy-seed.txt`,
        sizeBytes: seedBody.byteLength,
        storageKind: "external_url",
        storageRef: `https://example.com/${input.company.companyKey}/policy`,
      },
    },
    url: "/sources",
  });
  const sourceId = requireId(created?.source?.id, "policy source id");

  await injectJson(app, {
    expectedStatus: 201,
    headers: {
      "content-type": "application/octet-stream",
    },
    method: "POST",
    payload: Buffer.from(`${input.company.policyText}\n`, "utf8"),
    url: `/sources/${sourceId}/files?${new URLSearchParams({
      capturedAt: input.capturedAt,
      createdBy: input.createdBy,
      mediaType: "text/markdown",
      originalFileName: `${input.company.companyKey}-policy.md`,
    }).toString()}`,
  });

  return { sourceId };
}

async function runPolicyMonitor(app, input) {
  return injectJson(app, {
    expectedStatus: 201,
    method: "POST",
    payload: {
      runKey: input.runKey,
      triggeredBy: DEFAULT_CREATED_BY,
    },
    url: `/monitoring/companies/${input.companyKey}/policy-covenant-threshold/run`,
  });
}

function assertAlertResult(run, input) {
  if (run.monitorResult.companyKey !== input.companyKey) {
    throw new Error("Monitor result companyKey did not match scenario");
  }

  if (
    run.monitorResult.monitorKind !== "policy_covenant_threshold" ||
    run.monitorResult.status !== "alert" ||
    run.monitorResult.severity !== input.expectedSeverity
  ) {
    throw new Error(
      `Unexpected policy/covenant alert posture: ${JSON.stringify(run.monitorResult)}`,
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

  if (!input.expectedProofStates.includes(run.monitorResult.proofBundlePosture.state)) {
    throw new Error(
      `Unexpected proof posture ${run.monitorResult.proofBundlePosture.state}`,
    );
  }

  assertRequiredMonitorPosture(run.monitorResult);

  if (input.requireAlertCard && !run.alertCard) {
    throw new Error("Alerting policy/covenant monitor result did not include an alert card");
  }

  if (run.alertCard?.monitorKind !== "policy_covenant_threshold") {
    throw new Error("Policy/covenant alert card did not preserve monitorKind");
  }

  if (run.alertCard?.companyKey !== input.companyKey) {
    throw new Error("Alert card companyKey did not match scenario");
  }

  if (
    run.alertCard &&
    run.alertCard.sourceLineageRefs.length !==
      run.monitorResult.sourceLineageRefs.length
  ) {
    throw new Error("Alert card did not carry source lineage refs");
  }

  if (input.requireSourceLineage && run.monitorResult.sourceLineageRefs.length === 0) {
    throw new Error("Source-backed policy/covenant alert did not include lineage refs");
  }

  if (
    input.requireThresholdLineage &&
    !run.monitorResult.sourceLineageRefs.some(
      (ref) => ref.lineageKind === "policy_threshold_fact",
    )
  ) {
    throw new Error("Policy/covenant alert did not include threshold fact lineage");
  }

  if (
    input.requireComparableActualLineage &&
    !run.monitorResult.sourceLineageRefs.some(
      (ref) => ref.lineageKind === "finance_twin_actual",
    )
  ) {
    throw new Error("Policy/covenant alert did not include comparable actual lineage");
  }
}

function assertNoAlertResult(run, companyKey) {
  if (run.monitorResult.companyKey !== companyKey) {
    throw new Error("Monitor result companyKey did not match clean scenario");
  }

  if (
    run.monitorResult.monitorKind !== "policy_covenant_threshold" ||
    run.monitorResult.status !== "no_alert" ||
    run.monitorResult.severity !== "none" ||
    run.alertCard !== null ||
    run.monitorResult.alertCard !== null
  ) {
    throw new Error(
      `Expected a non-alerting clean policy/covenant monitor result, received ${JSON.stringify(run)}`,
    );
  }

  if (run.monitorResult.sourceLineageRefs.length === 0) {
    throw new Error("Clean policy/covenant monitor result did not include lineage refs");
  }

  if (run.monitorResult.proofBundlePosture.state !== "source_backed") {
    throw new Error(
      `Clean policy/covenant proof posture was ${run.monitorResult.proofBundlePosture.state}`,
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
    throw new Error("Monitor result is missing deterministic severity rationale");
  }

  if (
    result.runtimeBoundary?.runtimeCodexUsed !== false ||
    result.runtimeBoundary?.deliveryActionUsed !== false ||
    result.runtimeBoundary?.investigationMissionCreated !== false ||
    result.runtimeBoundary?.autonomousFinanceActionUsed !== false
  ) {
    throw new Error("Monitor result crossed an F6E runtime or action boundary");
  }
}

function assertIdempotentRetry(first, second) {
  if (first.monitorResult.id !== second.monitorResult.id) {
    throw new Error("Repeated policy/covenant monitor runKey created a duplicate result");
  }

  if (first.monitorResult.createdAt !== second.monitorResult.createdAt) {
    throw new Error("Repeated policy/covenant monitor runKey changed createdAt");
  }
}

function assertNoForbiddenAdviceOrActionText(run) {
  const text = JSON.stringify(run).toLowerCase();
  const forbiddenPhrases = [
    "legal advice",
    "policy advice",
    "payment instruction",
    "vendor-payment recommendation",
    "autonomous remediation",
  ];

  for (const phrase of forbiddenPhrases) {
    if (text.includes(phrase)) {
      throw new Error(`Policy/covenant monitor emitted forbidden phrase: ${phrase}`);
    }
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
    approvalCount,
    artifactCount,
    missionCount,
    outboxCount,
    taskWithRuntimeThreadCount,
  ] = await Promise.all([
    readCount(pool, "approvals"),
    readCount(pool, "artifacts"),
    readCount(pool, "missions"),
    readCount(pool, "outbox_events"),
    readRuntimeThreadCount(pool),
  ]);

  return {
    approvals: approvalCount,
    artifacts: artifactCount,
    missions: missionCount,
    outboxEvents: outboxCount,
    taskRuntimeThreads: taskWithRuntimeThreadCount,
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
        `F6E policy/covenant monitor changed ${key}: before=${before[key]}, after=${after[key]}`,
      );
    }
  }
}

function summarizeScenario(sync, run) {
  return {
    alertCard: run.alertCard,
    monitorResult: summarizeMonitorResult(run.monitorResult),
    syncRun: {
      extractorKey: sync.syncRun.extractorKey,
      id: sync.syncRun.id,
      status: sync.syncRun.status,
    },
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
    replayPosture: result.replayPosture,
    runtimeBoundary: result.runtimeBoundary,
    severity: result.severity,
    sourceLineageCount: result.sourceLineageRefs.length,
    status: result.status,
  };
}

async function writeSeedSnapshot(seed) {
  const directory = await mkdtemp(join(tmpdir(), "pocket-cfo-policy-monitor-"));
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
