import { createHash } from "node:crypto";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  FINANCE_DISCOVERY_QUESTION_KINDS,
  MonitorKindSchema,
} from "@pocket-cto/domain";
import { buildApp } from "../apps/control-plane/src/app.ts";
import { createContainer } from "../apps/control-plane/src/bootstrap.ts";
import { loadEnv } from "../packages/config/src/index.ts";
import { closeAllPools, getPool } from "../packages/db/src/client.ts";
import { pocketCfoMonitorDemoPack } from "../packages/stack-packs/src/index.ts";
import { buildRunTag, loadNearestEnvFile } from "./m2-exit-utils.mjs";

const DEFAULT_CREATED_BY = "collections-pressure-alert-investigation-smoke";
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
const FORBIDDEN_ACTION_PHRASES = [
  "contact customers",
  "customer-contact",
  "collect payment",
  "send notice",
  "recover cash",
  "collection instruction",
  "payment instruction",
  "vendor-payment recommendation",
  "legal advice",
  "policy advice",
  "autonomous remediation",
];

async function main() {
  loadNearestEnvFile();

  const runTag = buildRunTag();
  const capturedAt = new Date().toISOString();
  const fixture = await loadDemoFixture();
  const cleanCollectionsCompany = buildCleanCollectionsCompany(runTag);
  const cleanSeed = buildCleanCollectionsSeed(runTag);
  const cleanSeedSnapshot = await writeSeedSnapshot(cleanSeed);
  const pool = getPool(loadEnv().DATABASE_URL);
  let app = null;

  try {
    const familyAbsence = assertFamiliesUnchanged();
    const before = await readBoundaryCounts(pool);
    const container = await createContainer();
    app = await buildApp({ container });
    app.log.level = "silent";

    const registered = await registerDemoSources(app, {
      capturedAt,
      expected: fixture.expected,
      files: fixture.files,
    });
    await syncFinanceSources(app, {
      company: fixture.expected.demoCompany,
      registered,
    });
    await bindAndCompilePolicyDocument(app, {
      companyKey: fixture.expected.demoCompany.companyKey,
      registered,
    });

    const monitorRuns = await runDemoMonitors(app, {
      companyKey: fixture.expected.demoCompany.companyKey,
      runTag,
    });
    assertAlertingDemoMonitor(monitorRuns.cash_posture, "cash_posture");
    assertAlertingDemoMonitor(
      monitorRuns.collections_pressure,
      "collections_pressure",
    );
    assertAlertingDemoMonitor(
      monitorRuns.payables_pressure,
      "payables_pressure",
    );
    assertAlertingDemoMonitor(
      monitorRuns.policy_covenant_threshold,
      "policy_covenant_threshold",
    );

    await syncCompanyFixture(app, {
      capturedAt,
      company: cleanCollectionsCompany,
      createdBy: DEFAULT_CREATED_BY,
      seed: cleanSeed,
      seedSnapshot: cleanSeedSnapshot,
    });
    const cleanCollectionsRun = await runMonitor(app, {
      companyKey: cleanCollectionsCompany.companyKey,
      monitorPath: "collections-pressure",
      runKey: `f6g-clean-collections-${runTag}`,
    });
    assertNoAlertCollectionsRun(cleanCollectionsRun);

    const afterMonitorRuns = await readBoundaryCounts(pool);
    assertMonitorOnlyBoundaryCounts(before, afterMonitorRuns);

    const collectionsHandoff = await createAndVerifyInvestigation(app, pool, {
      companyKey: fixture.expected.demoCompany.companyKey,
      expectedMonitorKind: "collections_pressure",
      monitorResult: monitorRuns.collections_pressure.monitorResult,
    });
    const cashHandoff = await createAndVerifyInvestigation(app, pool, {
      companyKey: fixture.expected.demoCompany.companyKey,
      expectedMonitorKind: "cash_posture",
      monitorResult: monitorRuns.cash_posture.monitorResult,
    });

    await assertRejectedInvestigation(app, pool, {
      companyKey: cleanCollectionsCompany.companyKey,
      monitorResult: cleanCollectionsRun.monitorResult,
      reason: "no_alert collections",
    });
    await assertRejectedInvestigation(app, pool, {
      companyKey: fixture.expected.demoCompany.companyKey,
      monitorResult: monitorRuns.payables_pressure.monitorResult,
      reason: "payables alert",
    });
    await assertRejectedInvestigation(app, pool, {
      companyKey: fixture.expected.demoCompany.companyKey,
      monitorResult: monitorRuns.policy_covenant_threshold.monitorResult,
      reason: "policy/covenant alert",
    });

    const after = await readBoundaryCounts(pool);
    assertHandoffBoundaries({
      after,
      afterMonitorRuns,
      before,
      expectedMissionCount: 2,
    });

    console.log(
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          runTag,
          discoveryFamilies: FINANCE_DISCOVERY_QUESTION_KINDS,
          monitorFamilies: MonitorKindSchema.options,
          familyAbsence,
          collectionsAlertScenario: collectionsHandoff,
          cashAlertScenario: cashHandoff,
          rejectedScenarios: {
            noAlertCollectionsRejected: true,
            payablesAlertRejected: true,
            policyCovenantAlertRejected: true,
          },
          absenceAssertions: {
            approvalsCreated: after.approvals !== before.approvals,
            collectionInstructionsCreated:
              after.collectionInstructions !== before.collectionInstructions,
            customerContactInstructionsCreated:
              after.customerContactInstructions !==
              before.customerContactInstructions,
            deliveryOutboxEventsCreated:
              after.outboxEvents !== before.outboxEvents,
            paymentInstructionsCreated:
              after.paymentInstructions !== before.paymentInstructions,
            reportArtifactsCreated:
              after.reportArtifacts !== before.reportArtifacts,
            runtimeCodexThreadsCreated:
              after.taskRuntimeThreads !== before.taskRuntimeThreads,
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

async function loadDemoFixture() {
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

  return { expected, files };
}

async function registerDemoSources(app, input) {
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
        description: `F6G collections alert investigation source for ${sourceFile.role}.`,
        kind: sourceFile.sourceKind,
        name: `F6G ${sourceFile.role} ${input.expected.demoCompany.companyKey}`,
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
      descriptor: sourceFile,
      source: created.source,
      sourceFile: uploaded.sourceFile,
    };
  }

  return registered;
}

async function syncFinanceSources(app, input) {
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

    if (
      synced.syncRun?.extractorKey !==
      registered.descriptor.expectedExtractorKey
    ) {
      throw new Error(
        `${role} synced with ${synced.syncRun?.extractorKey}, expected ${registered.descriptor.expectedExtractorKey}`,
      );
    }
  }
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

async function runDemoMonitors(app, input) {
  return {
    cash_posture: await runMonitor(app, {
      companyKey: input.companyKey,
      monitorPath: "cash-posture",
      runKey: `f6g-cash-posture-${input.runTag}`,
    }),
    collections_pressure: await runMonitor(app, {
      companyKey: input.companyKey,
      monitorPath: "collections-pressure",
      runKey: `f6g-collections-pressure-${input.runTag}`,
    }),
    payables_pressure: await runMonitor(app, {
      companyKey: input.companyKey,
      monitorPath: "payables-pressure",
      runKey: `f6g-payables-pressure-${input.runTag}`,
    }),
    policy_covenant_threshold: await runMonitor(app, {
      companyKey: input.companyKey,
      monitorPath: "policy-covenant-threshold",
      runKey: `f6g-policy-covenant-threshold-${input.runTag}`,
    }),
  };
}

async function syncCompanyFixture(app, input) {
  const created = await injectJson(app, {
    expectedStatus: 201,
    method: "POST",
    payload: {
      createdBy: input.createdBy,
      description: "Packaged F6G clean collections no-alert source.",
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
  const sourceId = requireString(created?.source?.id, "source id");
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
  const sourceFileId = requireString(
    uploaded?.sourceFile?.id,
    "source file id",
  );

  return injectJson(app, {
    expectedStatus: 201,
    method: "POST",
    payload: {
      companyName: input.company.companyName,
    },
    url: `/finance-twin/companies/${input.company.companyKey}/source-files/${sourceFileId}/sync`,
  });
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

async function createAndVerifyInvestigation(app, pool, input) {
  if (
    input.monitorResult.monitorKind !== input.expectedMonitorKind ||
    input.monitorResult.status !== "alert"
  ) {
    throw new Error(
      `${input.expectedMonitorKind} monitor result was not alerting for handoff`,
    );
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
    throw new Error(`${input.expectedMonitorKind} handoff was not idempotent`);
  }

  if (created.mission.id !== opened.mission.id) {
    throw new Error(`${input.expectedMonitorKind} handoff opened a duplicate`);
  }

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
  const sourceRef = `${SOURCE_REF_PREFIX}${input.monitorResult.id}`;

  assertMissionResponse(created, detail, listedMission, {
    expectedMonitorKind: input.expectedMonitorKind,
    monitorResult: input.monitorResult,
    sourceRef,
  });
  assertNoForbiddenActionPhrases(detail);

  const sourceMissionCount = await readScalar(
    pool,
    "select count(*)::int as count from missions where source_kind = 'alert' and source_ref = $1",
    [sourceRef],
  );

  if (sourceMissionCount !== 1) {
    throw new Error(`${input.expectedMonitorKind} sourceRef was not unique`);
  }

  return {
    idempotentOpen: opened.created === false,
    missionId: created.mission.id,
    monitorKind: detail.monitorInvestigation.monitorKind,
    monitorResultId: detail.monitorInvestigation.monitorResultId,
    sourceFreshnessPosture: detail.monitorInvestigation.sourceFreshnessPosture,
    sourceLineageSummary: detail.monitorInvestigation.sourceLineageSummary,
    conditionSummaries: detail.monitorInvestigation.conditionSummaries,
    limitations: detail.monitorInvestigation.limitations,
    proofBundlePosture: detail.monitorInvestigation.proofBundlePosture,
    runtimeBoundary: detail.monitorInvestigation.runtimeBoundary,
    humanReviewNextStep: detail.monitorInvestigation.humanReviewNextStep,
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

function assertMissionResponse(created, detail, listedMission, input) {
  if (created.mission.type !== "discovery") {
    throw new Error(
      "Alert handoff mission did not use discovery umbrella type",
    );
  }

  if (
    created.mission.status !== "succeeded" ||
    created.mission.sourceKind !== "alert" ||
    created.mission.sourceRef !== input.sourceRef ||
    created.tasks.length !== 0 ||
    detail.tasks.length !== 0
  ) {
    throw new Error(
      "Alert handoff mission did not preserve taskless source shape",
    );
  }

  if (!listedMission) {
    throw new Error("Alert handoff mission was missing from mission list");
  }

  assertMonitorInvestigationSeed(
    created.proofBundle?.monitorInvestigation,
    input,
  );
  assertMonitorInvestigationSeed(detail.monitorInvestigation, input);
  assertMonitorInvestigationSeed(
    detail.proofBundle.monitorInvestigation,
    input,
  );
  assertMonitorInvestigationSeed(listedMission.monitorInvestigation, input);

  if (detail.discoveryAnswer !== null || detail.reporting !== null) {
    throw new Error(
      "Alert handoff mission created analysis prose or a report view",
    );
  }

  if (detail.approvals.length !== 0 || detail.approvalCards.length !== 0) {
    throw new Error("Alert handoff mission created approvals");
  }

  const artifactKinds = detail.artifacts.map((artifact) => artifact.kind);
  if (
    artifactKinds.length !== 1 ||
    artifactKinds[0] !== "proof_bundle_manifest"
  ) {
    throw new Error(
      `Alert handoff created unexpected artifacts: ${artifactKinds.join(", ")}`,
    );
  }

  if (
    listedMission.latestTask !== null ||
    listedMission.reportKind !== null ||
    listedMission.answerSummary !== null ||
    listedMission.pendingApprovalCount !== 0
  ) {
    throw new Error(
      "Alert handoff list item mixed in runtime, report, or answer posture",
    );
  }
}

function assertMonitorInvestigationSeed(seed, input) {
  if (!seed) {
    throw new Error("Alert handoff seed was missing");
  }

  if (
    seed.monitorResultId !== input.monitorResult.id ||
    seed.companyKey !== input.monitorResult.companyKey ||
    seed.monitorKind !== input.expectedMonitorKind ||
    seed.monitorResultStatus !== "alert" ||
    seed.alertSeverity !== input.monitorResult.severity ||
    seed.sourceRef !== input.sourceRef
  ) {
    throw new Error(
      `Alert handoff seed identity drifted: ${JSON.stringify(seed)}`,
    );
  }

  if (
    JSON.stringify(seed.conditions) !==
      JSON.stringify(input.monitorResult.conditions) ||
    JSON.stringify(seed.conditionSummaries) !==
      JSON.stringify(input.monitorResult.alertCard.conditionSummaries) ||
    JSON.stringify(seed.sourceLineageRefs) !==
      JSON.stringify(input.monitorResult.sourceLineageRefs) ||
    JSON.stringify(seed.sourceFreshnessPosture) !==
      JSON.stringify(input.monitorResult.sourceFreshnessPosture) ||
    JSON.stringify(seed.proofBundlePosture) !==
      JSON.stringify(input.monitorResult.proofBundlePosture)
  ) {
    throw new Error("Alert handoff seed did not preserve source posture");
  }

  if (
    seed.deterministicSeverityRationale.length === 0 ||
    seed.conditionSummaries.length === 0 ||
    seed.sourceLineageSummary.length === 0 ||
    seed.limitations.length === 0 ||
    seed.humanReviewNextStep.length === 0
  ) {
    throw new Error("Alert handoff seed is missing required review posture");
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
    throw new Error("Alert handoff crossed a runtime or action boundary");
  }
}

async function assertRejectedInvestigation(app, pool, input) {
  const response = await app.inject({
    method: "POST",
    payload: {
      companyKey: input.companyKey,
      monitorResultId: input.monitorResult.id,
      requestedBy: DEFAULT_CREATED_BY,
    },
    url: "/missions/monitoring-investigations",
  });

  if (response.statusCode !== 400) {
    throw new Error(
      `Expected ${input.reason} handoff to fail with 400, received ${response.statusCode}: ${response.body}`,
    );
  }

  const sourceMissionCount = await readScalar(
    pool,
    "select count(*)::int as count from missions where source_kind = 'alert' and source_ref = $1",
    [`${SOURCE_REF_PREFIX}${input.monitorResult.id}`],
  );

  if (sourceMissionCount !== 0) {
    throw new Error(`${input.reason} handoff created an alert mission`);
  }
}

function assertAlertingDemoMonitor(run, monitorKind) {
  if (
    run.monitorResult.monitorKind !== monitorKind ||
    run.monitorResult.status !== "alert" ||
    run.alertCard === null
  ) {
    throw new Error(
      `${monitorKind} demo monitor did not produce an alert card`,
    );
  }

  assertRequiredMonitorPosture(run.monitorResult);
}

function assertNoAlertCollectionsRun(run) {
  if (
    run.monitorResult.monitorKind !== "collections_pressure" ||
    run.monitorResult.status !== "no_alert" ||
    run.monitorResult.severity !== "none" ||
    run.alertCard !== null
  ) {
    throw new Error(
      `Expected clean collections run to be no_alert, received ${JSON.stringify(run)}`,
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
    throw new Error("Monitor result is missing human-review next step");
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
    throw new Error("Monitor result crossed a runtime or action boundary");
  }
}

function assertNoForbiddenActionPhrases(value) {
  const serialized = JSON.stringify(value).toLowerCase();

  for (const phrase of FORBIDDEN_ACTION_PHRASES) {
    if (serialized.includes(phrase)) {
      throw new Error(`Forbidden action phrase appeared in handoff: ${phrase}`);
    }
  }
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

function assertMonitorOnlyBoundaryCounts(before, afterMonitorRuns) {
  for (const key of Object.keys(before)) {
    if (before[key] !== afterMonitorRuns[key]) {
      throw new Error(
        `Monitor setup changed ${key}: before=${before[key]}, after=${afterMonitorRuns[key]}`,
      );
    }
  }
}

function assertHandoffBoundaries(input) {
  const { after, afterMonitorRuns, before, expectedMissionCount } = input;

  if (after.missions !== afterMonitorRuns.missions + expectedMissionCount) {
    throw new Error("Alert handoffs did not create exactly two missions");
  }

  if (after.artifacts !== afterMonitorRuns.artifacts + expectedMissionCount) {
    throw new Error(
      "Alert handoffs did not create exactly two proof artifacts",
    );
  }

  for (const key of [
    "approvals",
    "collectionInstructions",
    "customerContactInstructions",
    "outboxEvents",
    "paymentInstructions",
    "reportArtifacts",
    "taskRuntimeThreads",
  ]) {
    if (after[key] !== before[key]) {
      throw new Error(
        `Alert handoffs crossed boundary ${key}: before=${before[key]}, after=${after[key]}`,
      );
    }
  }
}

async function readBoundaryCounts(pool) {
  const [
    approvals,
    artifacts,
    collectionInstructions,
    customerContactInstructions,
    missions,
    outboxEvents,
    paymentInstructions,
    reportArtifacts,
    taskRuntimeThreads,
  ] = await Promise.all([
    readScalar(pool, "select count(*)::int as count from approvals", []),
    readScalar(pool, "select count(*)::int as count from artifacts", []),
    readOptionalCount(pool, "collection_instructions"),
    readOptionalCount(pool, "customer_contact_instructions"),
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
    artifacts,
    collectionInstructions,
    customerContactInstructions,
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

  return readScalar(
    pool,
    `select count(*)::int as count from ${tableName}`,
    [],
  );
}

async function readScalar(pool, query, values) {
  const result = await pool.query(query, values);

  return Number(result.rows[0]?.count ?? 0);
}

function buildCleanCollectionsCompany(runTag) {
  return {
    companyKey: `local-f6g-collections-clean-${runTag.toLowerCase()}`,
    companyName: `Local F6G Collections Clean ${runTag}`,
    sourceName: `F6G clean collections ${runTag}`,
    upload: {
      mediaType: "text/csv",
      originalFileName: `f6g-clean-collections-${runTag}.csv`,
      text: [
        "customer_name,customer_id,currency,as_of,current,past_due,total",
        "Clean Co,C-500,USD,2026-04-26,100.00,0.00,100.00",
      ].join("\n"),
    },
  };
}

function buildCleanCollectionsSeed(runTag) {
  return {
    body: Buffer.from(
      `${JSON.stringify(
        {
          createdBy: DEFAULT_CREATED_BY,
          note: "Seed snapshot for the packaged F6G clean collections no-alert proof.",
          runTag,
        },
        null,
        2,
      )}\n`,
      "utf8",
    ),
    mediaType: "application/json",
    originalFileName: `collections-pressure-alert-investigation-seed-${runTag}.json`,
  };
}

async function writeSeedSnapshot(seed) {
  const directory = await mkdtemp(
    join(tmpdir(), "pocket-cfo-collections-alert-investigation-"),
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

function requireString(value, label) {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`${label} missing from response`);
  }

  return value;
}

if (process.argv[1] && resolve(process.argv[1]) === MODULE_PATH) {
  await main();
}
