import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { basename, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  FINANCE_DISCOVERY_QUESTION_KINDS,
  MonitorKindSchema,
} from "@pocket-cto/domain";
import { buildApp } from "../apps/control-plane/src/app.ts";
import { createContainer } from "../apps/control-plane/src/bootstrap.ts";
import { closeAllPools, getPool } from "../packages/db/src/client.ts";
import { loadEnv } from "../packages/config/src/index.ts";
import { pocketCfoMonitorDemoPack } from "../packages/stack-packs/src/index.ts";
import { loadNearestEnvFile } from "./m2-exit-utils.mjs";

const DEFAULT_CREATED_BY = "monitor-demo-replay-smoke";
const MODULE_PATH = fileURLToPath(import.meta.url);
const SOURCE_REF_PREFIX = "pocket-cfo://monitor-results/";
const EXPECTED_DISCOVERY_FAMILIES = [
  "cash_posture",
  "collections_pressure",
  "payables_pressure",
  "spend_posture",
  "obligation_calendar_review",
  "policy_lookup",
];
const EXPECTED_MONITOR_FAMILIES = [
  "cash_posture",
  "collections_pressure",
  "payables_pressure",
  "policy_covenant_threshold",
];
const REPORT_ARTIFACT_KINDS = [
  "finance_memo",
  "evidence_appendix",
  "board_packet",
  "lender_update",
  "diligence_packet",
];

async function main() {
  loadNearestEnvFile();

  const fixture = await loadFixture();
  const runTag = buildRunTag();
  const capturedAt = new Date().toISOString();
  const pool = getPool(loadEnv().DATABASE_URL);
  let app = null;

  try {
    assertFamiliesUnchanged();
    assertPackMatchesExpectedManifest(fixture.expected);

    const before = await readBoundaryCounts(pool);
    const container = await createContainer();
    app = await buildApp({ container });
    app.log.level = "silent";

    const registered = await registerFixtureSources(app, {
      capturedAt,
      expected: fixture.expected,
      files: fixture.files,
    });
    const syncs = await syncFinanceSources(app, {
      company: fixture.expected.demoCompany,
      registered,
    });

    await bindAndCompilePolicyDocument(app, {
      companyKey: fixture.expected.demoCompany.companyKey,
      registered,
    });

    const monitorRuns = await runExpectedMonitors(app, {
      companyKey: fixture.expected.demoCompany.companyKey,
      runTag,
    });
    const normalizedMonitorResults = normalizeMonitorRuns(monitorRuns);

    assertExpectedMonitorResults(
      fixture.expected.monitorResults,
      normalizedMonitorResults,
    );
    await assertLatestMonitorReads(app, {
      companyKey: fixture.expected.demoCompany.companyKey,
      monitorRuns,
    });

    const afterMonitorRuns = await readBoundaryCounts(pool);
    assertMonitorOnlyBoundaries(before, afterMonitorRuns);

    const cashHandoff = await createAndVerifyCashInvestigation(app, pool, {
      companyKey: fixture.expected.demoCompany.companyKey,
      expected: fixture.expected.cashInvestigationHandoff,
      monitorResult: monitorRuns.cash_posture.monitorResult,
    });

    const nonCashInvestigationsCreated = await assertNoNonCashInvestigations(
      pool,
      monitorRuns,
    );
    const after = await readBoundaryCounts(pool);
    assertAbsenceBoundaries({
      after,
      afterMonitorRuns,
      before,
      expected: fixture.expected.absenceAssertions,
    });
    const familyAbsence = assertFamiliesUnchanged();
    const fixtureSourcesUnchanged = await assertFixtureSourcesUnchanged(
      fixture.files,
    );

    console.log(
      JSON.stringify({
        generatedAt: new Date().toISOString(),
        runTag,
        stackPack: {
          id: pocketCfoMonitorDemoPack.id,
          fixtureDirectory: pocketCfoMonitorDemoPack.fixtureDirectory,
        },
        companyKey: fixture.expected.demoCompany.companyKey,
        sourceFiles: summarizeRegisteredSources(registered, syncs),
        fixtureSourcesUnchanged,
        monitorResults: normalizedMonitorResults,
        cashInvestigationHandoff: cashHandoff,
        absenceAssertions: {
          approvalsCreated: after.approvals !== before.approvals,
          deliveryOutboxEventsCreated: after.outboxEvents !== before.outboxEvents,
          nonCashInvestigationsCreated,
          newDiscoveryFamilyAdded: familyAbsence.newDiscoveryFamilyAdded,
          newMonitorFamilyAdded: familyAbsence.newMonitorFamilyAdded,
          paymentInstructionsCreated:
            after.paymentInstructions !== before.paymentInstructions,
          reportArtifactsCreated:
            after.reportArtifacts !== before.reportArtifacts,
          runtimeCodexThreadsCreated:
            after.taskRuntimeThreads !== before.taskRuntimeThreads,
        },
        discoveryFamilies: FINANCE_DISCOVERY_QUESTION_KINDS,
        monitorFamilies: MonitorKindSchema.options,
      }),
    );
  } finally {
    if (app) {
      await app.close();
    }

    await closeAllPools();
  }
}

async function loadFixture() {
  const fixtureRoot = resolve(pocketCfoMonitorDemoPack.fixtureDirectory);
  const expected = JSON.parse(
    await readFile(join(fixtureRoot, "expected-monitor-results.json"), "utf8"),
  );
  const files = new Map();

  for (const sourceFile of expected.sourceFiles) {
    const absolutePath = join(fixtureRoot, sourceFile.path);
    const body = await readFile(absolutePath);

    files.set(sourceFile.role, {
      absolutePath,
      body,
      checksumSha256: createHash("sha256").update(body).digest("hex"),
      descriptor: sourceFile,
    });
  }

  return { expected, files, fixtureRoot };
}

function assertPackMatchesExpectedManifest(expected) {
  if (
    pocketCfoMonitorDemoPack.expectedOutputManifestPath !==
    "packages/testkit/fixtures/f6f-monitor-demo-stack/expected-monitor-results.json"
  ) {
    throw new Error("Stack-pack expected output manifest path drifted");
  }

  const packRoles = pocketCfoMonitorDemoPack.sourceFiles
    .map((sourceFile) => sourceFile.role)
    .sort();
  const expectedRoles = expected.sourceFiles
    .map((sourceFile) => sourceFile.role)
    .sort();

  if (JSON.stringify(packRoles) !== JSON.stringify(expectedRoles)) {
    throw new Error(
      `Stack-pack source roles do not match fixture manifest: ${packRoles.join(", ")} vs ${expectedRoles.join(", ")}`,
    );
  }

  if (
    JSON.stringify(pocketCfoMonitorDemoPack.monitorFamiliesCovered) !==
    JSON.stringify(EXPECTED_MONITOR_FAMILIES)
  ) {
    throw new Error("Stack-pack monitor family list drifted");
  }
}

async function registerFixtureSources(app, input) {
  const registered = {};

  for (const sourceFile of input.expected.sourceFiles) {
    const file = input.files.get(sourceFile.role);

    if (!file) {
      throw new Error(`Missing fixture file for role ${sourceFile.role}`);
    }

    const created = await injectJson(app, {
      expectedStatus: 201,
      method: "POST",
      payload: {
        createdBy: DEFAULT_CREATED_BY,
        description: `F6F monitor demo replay source for ${sourceFile.role}.`,
        kind: sourceFile.sourceKind,
        name: `F6F ${sourceFile.role} ${input.expected.demoCompany.companyKey}`,
        snapshot: {
          capturedAt: input.capturedAt,
          checksumSha256: file.checksumSha256,
          mediaType: sourceFile.mediaType,
          originalFileName: basename(sourceFile.path),
          sizeBytes: file.body.byteLength,
          storageKind: "local_path",
          storageRef: file.absolutePath,
        },
      },
      url: "/sources",
    });
    const sourceId = requireString(created?.source?.id, "source id");
    const uploaded = await injectJson(app, {
      expectedStatus: 201,
      headers: {
        "content-type": "application/octet-stream",
      },
      method: "POST",
      payload: file.body,
      url: `/sources/${sourceId}/files?${new URLSearchParams({
        capturedAt: input.capturedAt,
        createdBy: DEFAULT_CREATED_BY,
        mediaType: sourceFile.mediaType,
        originalFileName: basename(sourceFile.path),
      }).toString()}`,
    });

    registered[sourceFile.role] = {
      checksumSha256: file.checksumSha256,
      descriptor: sourceFile,
      source: created.source,
      sourceFile: uploaded.sourceFile,
    };
  }

  return registered;
}

async function syncFinanceSources(app, input) {
  const syncs = {};

  for (const role of ["bank_cash", "receivables_aging", "payables_aging"]) {
    const registered = input.registered[role];

    if (!registered) {
      throw new Error(`Missing registered source for ${role}`);
    }

    const synced = await injectJson(app, {
      expectedStatus: 201,
      method: "POST",
      payload: {
        companyName: input.company.companyName,
      },
      url: `/finance-twin/companies/${input.company.companyKey}/source-files/${registered.sourceFile.id}/sync`,
    });

    const expectedExtractorKey = registered.descriptor.expectedExtractorKey;
    if (synced.syncRun?.extractorKey !== expectedExtractorKey) {
      throw new Error(
        `${role} synced with ${synced.syncRun?.extractorKey}, expected ${expectedExtractorKey}`,
      );
    }

    syncs[role] = synced.syncRun;
  }

  return syncs;
}

async function bindAndCompilePolicyDocument(app, input) {
  const policy = input.registered.policy_thresholds;

  if (!policy) {
    throw new Error("Missing registered policy threshold source");
  }

  await excludePreviousPolicyBindings(app, {
    companyKey: input.companyKey,
    currentPolicySourceId: policy.source.id,
  });
  await injectJson(app, {
    expectedStatus: 201,
    method: "POST",
    payload: {
      boundBy: DEFAULT_CREATED_BY,
      documentRole: "policy_document",
      includeInCompile: true,
    },
    url: `/cfo-wiki/companies/${input.companyKey}/sources/${policy.source.id}/bind`,
  });
  await injectJson(app, {
    expectedStatus: 201,
    method: "POST",
    payload: {
      triggeredBy: DEFAULT_CREATED_BY,
    },
    url: `/cfo-wiki/companies/${input.companyKey}/compile`,
  });
}

async function excludePreviousPolicyBindings(app, input) {
  const sourceList = await injectJson(app, {
    expectedStatus: 200,
    method: "GET",
    url: `/cfo-wiki/companies/${input.companyKey}/sources`,
  });

  for (const source of sourceList.sources ?? []) {
    if (
      source.source.id === input.currentPolicySourceId ||
      source.binding.documentRole !== "policy_document" ||
      source.binding.includeInCompile !== true
    ) {
      continue;
    }

    await injectJson(app, {
      expectedStatus: 201,
      method: "POST",
      payload: {
        boundBy: DEFAULT_CREATED_BY,
        documentRole: "policy_document",
        includeInCompile: false,
      },
      url: `/cfo-wiki/companies/${input.companyKey}/sources/${source.source.id}/bind`,
    });
  }
}

async function runExpectedMonitors(app, input) {
  return {
    cash_posture: await runMonitor(app, {
      companyKey: input.companyKey,
      monitorPath: "cash-posture",
      runKey: `f6f-cash-posture-${input.runTag}`,
    }),
    collections_pressure: await runMonitor(app, {
      companyKey: input.companyKey,
      monitorPath: "collections-pressure",
      runKey: `f6f-collections-pressure-${input.runTag}`,
    }),
    payables_pressure: await runMonitor(app, {
      companyKey: input.companyKey,
      monitorPath: "payables-pressure",
      runKey: `f6f-payables-pressure-${input.runTag}`,
    }),
    policy_covenant_threshold: await runMonitor(app, {
      companyKey: input.companyKey,
      monitorPath: "policy-covenant-threshold",
      runKey: `f6f-policy-covenant-threshold-${input.runTag}`,
    }),
  };
}

async function runMonitor(app, input) {
  return injectJson(app, {
    expectedStatus: 201,
    method: "POST",
    payload: {
      runKey: input.runKey,
      triggeredBy: DEFAULT_CREATED_BY,
    },
    url: `/monitoring/companies/${input.companyKey}/${input.monitorPath}/run`,
  });
}

function normalizeMonitorRuns(runs) {
  return Object.fromEntries(
    Object.entries(runs).map(([monitorKind, run]) => [
      monitorKind,
      normalizeMonitorResult(run),
    ]),
  );
}

function normalizeMonitorResult(run) {
  const result = run.monitorResult;

  return {
    monitorKind: result.monitorKind,
    status: result.status,
    severity: result.severity,
    conditionKinds: result.conditions.map((condition) => condition.kind),
    proofBundlePostureState: result.proofBundlePosture.state,
    sourceFreshnessState: result.sourceFreshnessPosture.state,
    alertCardExpected: run.alertCard !== null,
    sourceLineageExpected: result.sourceLineageRefs.length > 0,
    humanReviewNextStepExpected:
      typeof result.humanReviewNextStep === "string" &&
      result.humanReviewNextStep.length > 0,
    runtimeBoundary: {
      runtimeCodexUsed: result.runtimeBoundary.runtimeCodexUsed,
      deliveryActionUsed: result.runtimeBoundary.deliveryActionUsed,
      investigationMissionCreated:
        result.runtimeBoundary.investigationMissionCreated,
      autonomousFinanceActionUsed:
        result.runtimeBoundary.autonomousFinanceActionUsed,
    },
  };
}

function assertExpectedMonitorResults(expectedResults, actualResults) {
  for (const monitorKind of EXPECTED_MONITOR_FAMILIES) {
    const expected = expectedResults[monitorKind];
    const actual = actualResults[monitorKind];

    if (!expected || !actual) {
      throw new Error(`Missing expected or actual monitor result for ${monitorKind}`);
    }

    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      throw new Error(
        `Normalized ${monitorKind} result did not match expected fixture:\nexpected=${JSON.stringify(expected)}\nactual=${JSON.stringify(actual)}`,
      );
    }
  }
}

async function assertLatestMonitorReads(app, input) {
  for (const [monitorKind, run] of Object.entries(input.monitorRuns)) {
    const monitorPath = monitorKindToPath(monitorKind);
    const latest = await injectJson(app, {
      expectedStatus: 200,
      method: "GET",
      url: `/monitoring/companies/${input.companyKey}/${monitorPath}/latest`,
    });

    if (latest.monitorResult?.id !== run.monitorResult.id) {
      throw new Error(`${monitorKind} latest read did not return the replay run`);
    }
  }
}

async function createAndVerifyCashInvestigation(app, pool, input) {
  if (!input.expected.expected) {
    return { expected: false };
  }

  if (
    input.monitorResult.monitorKind !== input.expected.monitorKind ||
    input.monitorResult.status !== "alert"
  ) {
    throw new Error("Expected cash monitor result was not alerting for handoff");
  }

  const created = await createOrOpenInvestigation(app, {
    companyKey: input.companyKey,
    expectedStatus: 201,
    monitorResultId: input.monitorResult.id,
  });
  const opened = await createOrOpenInvestigation(app, {
    companyKey: input.companyKey,
    expectedStatus: 200,
    monitorResultId: input.monitorResult.id,
  });

  if (created.created !== true || opened.created !== false) {
    throw new Error("Cash investigation handoff did not preserve create/open posture");
  }

  if (created.mission.id !== opened.mission.id) {
    throw new Error("Cash investigation retry opened a different mission");
  }

  const detail = await injectJson(app, {
    expectedStatus: 200,
    method: "GET",
    url: `/missions/${created.mission.id}`,
  });
  const sourceRef = `${input.expected.sourceRefPrefix}${input.monitorResult.id}`;

  if (
    created.mission.sourceKind !== input.expected.sourceKind ||
    created.mission.sourceRef !== sourceRef ||
    detail.monitorInvestigation?.monitorResultId !== input.monitorResult.id ||
    detail.tasks.length !== 0
  ) {
    throw new Error("Cash investigation handoff did not preserve source shape");
  }

  const sourceMissionCount = await readScalar(
    pool,
    "select count(*)::int as count from missions where source_kind = 'alert' and source_ref = $1",
    [sourceRef],
  );

  if (sourceMissionCount !== 1) {
    throw new Error("Cash investigation handoff was not unique by sourceRef");
  }

  return {
    created: created.created,
    idempotentOpen: opened.created === false,
    monitorResultLinked: detail.monitorInvestigation.monitorResultId === input.monitorResult.id,
    sourceKind: created.mission.sourceKind,
    sourceRefShape: created.mission.sourceRef.startsWith(SOURCE_REF_PREFIX),
    taskless: detail.tasks.length === 0,
  };
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

async function assertNoNonCashInvestigations(pool, monitorRuns) {
  for (const monitorKind of [
    "collections_pressure",
    "payables_pressure",
    "policy_covenant_threshold",
  ]) {
    const monitorResult = monitorRuns[monitorKind].monitorResult;
    const count = await readScalar(
      pool,
      "select count(*)::int as count from missions where source_kind = 'alert' and source_ref = $1",
      [`${SOURCE_REF_PREFIX}${monitorResult.id}`],
    );

    if (count !== 0) {
      throw new Error(`${monitorKind} created an investigation mission`);
    }
  }

  return false;
}

async function assertFixtureSourcesUnchanged(files) {
  for (const [role, file] of files.entries()) {
    const currentBody = await readFile(file.absolutePath);
    const currentChecksumSha256 = createHash("sha256")
      .update(currentBody)
      .digest("hex");

    if (currentChecksumSha256 !== file.checksumSha256) {
      throw new Error(`Fixture source changed during replay: ${role}`);
    }
  }

  return true;
}

function assertMonitorOnlyBoundaries(before, afterMonitorRuns) {
  const keys = [
    "approvals",
    "missions",
    "outboxEvents",
    "paymentInstructions",
    "reportArtifacts",
    "taskRuntimeThreads",
  ];

  for (const key of keys) {
    if (before[key] !== afterMonitorRuns[key]) {
      throw new Error(
        `Monitor replay changed ${key}: before=${before[key]}, after=${afterMonitorRuns[key]}`,
      );
    }
  }
}

function assertAbsenceBoundaries(input) {
  const { after, afterMonitorRuns, before, expected } = input;

  if (!expected) {
    throw new Error("Missing absence assertions in expected fixture manifest");
  }

  const checks = [
    ["approvalsCreated", after.approvals === before.approvals],
    ["deliveryOutboxEventsCreated", after.outboxEvents === before.outboxEvents],
    [
      "paymentInstructionsCreated",
      after.paymentInstructions === before.paymentInstructions,
    ],
    ["reportArtifactsCreated", after.reportArtifacts === before.reportArtifacts],
    [
      "runtimeCodexThreadsCreated",
      after.taskRuntimeThreads === before.taskRuntimeThreads,
    ],
  ];

  for (const [key, passed] of checks) {
    if (expected[key] !== false || !passed) {
      throw new Error(`F6F absence boundary failed: ${key}`);
    }
  }

  if (after.missions !== afterMonitorRuns.missions + 1) {
    throw new Error("Cash handoff did not create exactly one investigation mission");
  }
}

async function readBoundaryCounts(pool) {
  const [
    approvals,
    missions,
    outboxEvents,
    paymentInstructions,
    reportArtifacts,
    taskRuntimeThreads,
  ] = await Promise.all([
    readScalar(pool, "select count(*)::int as count from approvals", []),
    readScalar(pool, "select count(*)::int as count from missions", []),
    readScalar(pool, "select count(*)::int as count from outbox_events", []),
    readOptionalCount(pool, "payment_instructions"),
    readReportArtifactCount(pool),
    readScalar(
      pool,
      "select count(*)::int as count from mission_tasks where codex_thread_id is not null",
      [],
    ),
  ]);

  return {
    approvals,
    missions,
    outboxEvents,
    paymentInstructions,
    reportArtifacts,
    taskRuntimeThreads,
  };
}

async function readReportArtifactCount(pool) {
  const result = await pool.query(
    "select count(*)::int as count from artifacts where kind = any($1::artifact_kind[])",
    [REPORT_ARTIFACT_KINDS],
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

  return readScalar(pool, `select count(*)::int as count from ${tableName}`, []);
}

async function readScalar(pool, query, values) {
  const result = await pool.query(query, values);

  return Number(result.rows[0]?.count ?? 0);
}

function assertFamiliesUnchanged() {
  if (
    JSON.stringify(FINANCE_DISCOVERY_QUESTION_KINDS) !==
    JSON.stringify(EXPECTED_DISCOVERY_FAMILIES)
  ) {
    throw new Error(
      `Discovery family list changed: ${FINANCE_DISCOVERY_QUESTION_KINDS.join(", ")}`,
    );
  }

  if (
    JSON.stringify(MonitorKindSchema.options) !==
    JSON.stringify(EXPECTED_MONITOR_FAMILIES)
  ) {
    throw new Error(
      `Monitor family list changed: ${MonitorKindSchema.options.join(", ")}`,
    );
  }

  return {
    newDiscoveryFamilyAdded: false,
    newMonitorFamilyAdded: false,
  };
}

function summarizeRegisteredSources(registered, syncs) {
  return Object.fromEntries(
    Object.entries(registered).map(([role, value]) => [
      role,
      {
        checksumSha256: value.checksumSha256,
        sourceFilePresent: Boolean(value.sourceFile?.id),
        sourceKind: value.descriptor.sourceKind,
        syncExtractorKey: syncs[role]?.extractorKey ?? null,
      },
    ]),
  );
}

function monitorKindToPath(monitorKind) {
  switch (monitorKind) {
    case "cash_posture":
      return "cash-posture";
    case "collections_pressure":
      return "collections-pressure";
    case "payables_pressure":
      return "payables-pressure";
    case "policy_covenant_threshold":
      return "policy-covenant-threshold";
    default:
      throw new Error(`Unsupported monitor kind: ${monitorKind}`);
  }
}

function buildRunTag() {
  return new Date().toISOString().replace(/[-:.TZ]/gu, "").slice(0, 17);
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

function requireString(value, label) {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`${label} missing from response`);
  }

  return value;
}

if (process.argv[1] && resolve(process.argv[1]) === MODULE_PATH) {
  await main();
}
