import { createHash } from "node:crypto";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildApp } from "../apps/control-plane/src/app.ts";
import { createEmbeddedWorkerContainer } from "../apps/control-plane/src/bootstrap.ts";
import { closeAllPools } from "../packages/db/src/client.ts";
import { buildRunTag, loadNearestEnvFile, wait } from "./m2-exit-utils.mjs";

const DEFAULT_COMPANY_KEY = "local-finance-policy-lookup-company";
const DEFAULT_COMPANY_NAME = "Local Finance Policy Lookup Company";
const DEFAULT_CREATED_BY = "finance-policy-lookup-smoke";
const MODULE_PATH = fileURLToPath(import.meta.url);
const POLL_INTERVAL_MS = 250;
const MAX_POLLS = 40;
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
      note: "Seed snapshot for the packaged F4C1 finance-policy-lookup smoke.",
      requestedBy: "finance_policy_lookup_smoke",
      runTag: input.runTag,
    },
    null,
    2,
  );
  const bankSummaryText = [
    "account_name,bank,last4,statement_balance,available_balance,current_balance,currency,as_of",
    `Operating Checking,First National,1234,1200.00,1000.00,,USD,${input.primaryAsOfDate}`,
    `Treasury Sweep,First National,9012,,400.00,,USD,${input.secondaryAsOfDate}`,
  ].join("\n");

  return {
    companyKey: `${input.companyKey}-${input.runTag.toLowerCase()}`,
    companyName: `${input.companyName} ${input.runTag}`,
    createdBy: input.createdBy,
    financeSourceName: `Policy lookup finance seed ${input.runTag}`,
    supportedPolicyName: `Travel and expense policy ${input.runTag}`,
    unsupportedPolicyName: `Security policy link ${input.runTag}`,
    seed: {
      body: Buffer.from(`${seedText}\n`, "utf8"),
      mediaType: "application/json",
      originalFileName: `finance-policy-lookup-seed-${input.runTag}.json`,
    },
    financeUpload: {
      body: Buffer.from(`${bankSummaryText}\n`, "utf8"),
      mediaType: "text/csv",
      originalFileName: `bank-account-summary-${input.runTag}.csv`,
    },
    supportedPolicyUpload: {
      body: Buffer.from(
        [
          "# Travel and Expense Policy",
          "",
          "Employees must submit card spend within five business days.",
          "",
          "## Approval Thresholds",
          "",
          "- CFO approval is required for spend above $5,000.",
        ].join("\n"),
        "utf8",
      ),
      mediaType: "text/markdown",
      originalFileName: `travel-policy-${input.runTag}.md`,
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
  const seedSnapshot = await writeSeedSnapshot(fixture.seed);
  const financeCapturedAt = now.toISOString();
  const supportedPolicyCapturedAt = new Date(
    now.getTime() + 60_000,
  ).toISOString();
  const unsupportedPolicyCapturedAt = new Date(
    now.getTime() + 120_000,
  ).toISOString();
  let app = null;
  let container = null;

  try {
    container = await createEmbeddedWorkerContainer();
    app = await buildApp({ container });
    app.log.level = "silent";

    const createdFinanceSource = await injectJson(app, {
      expectedStatus: 201,
      method: "POST",
      payload: {
        createdBy: fixture.createdBy,
        description: "Packaged F4C1 policy-lookup smoke finance source.",
        kind: "dataset",
        name: fixture.financeSourceName,
        snapshot: {
          capturedAt: financeCapturedAt,
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
    const financeSourceId = requireUuid(
      createdFinanceSource?.source?.id,
      "finance source id",
    );
    const uploadedFinanceSource = await injectJson(app, {
      expectedStatus: 201,
      headers: {
        "content-type": "application/octet-stream",
      },
      method: "POST",
      payload: fixture.financeUpload.body,
      url: `/sources/${financeSourceId}/files?${new URLSearchParams({
        capturedAt: financeCapturedAt,
        createdBy: fixture.createdBy,
        mediaType: fixture.financeUpload.mediaType,
        originalFileName: fixture.financeUpload.originalFileName,
      }).toString()}`,
    });
    const financeSourceFileId = requireUuid(
      uploadedFinanceSource?.sourceFile?.id,
      "finance source file id",
    );
    const financeSync = await injectJson(app, {
      expectedStatus: 201,
      method: "POST",
      payload: {
        companyName: fixture.companyName,
      },
      url: `/finance-twin/companies/${fixture.companyKey}/source-files/${financeSourceFileId}/sync`,
    });

    const supportedPolicy = await createDocumentSource(app, {
      capturedAt: supportedPolicyCapturedAt,
      createdBy: fixture.createdBy,
      originalFileName: `travel-policy-link-${runTag}.txt`,
      sourceName: fixture.supportedPolicyName,
      storageRef: `https://example.com/${fixture.companyKey}/travel-policy/${runTag}`,
    });
    await registerDocumentFile(app, supportedPolicy.id, {
      body: fixture.supportedPolicyUpload.body,
      capturedAt: supportedPolicyCapturedAt,
      createdBy: fixture.createdBy,
      mediaType: fixture.supportedPolicyUpload.mediaType,
      originalFileName: fixture.supportedPolicyUpload.originalFileName,
    });

    const unsupportedPolicy = await createDocumentSource(app, {
      capturedAt: unsupportedPolicyCapturedAt,
      createdBy: fixture.createdBy,
      originalFileName: `security-policy-link-${runTag}.txt`,
      sourceName: fixture.unsupportedPolicyName,
      storageRef: `https://example.com/${fixture.companyKey}/security-policy/${runTag}`,
    });

    await injectJson(app, {
      expectedStatus: 201,
      method: "POST",
      payload: {
        boundBy: fixture.createdBy,
        documentRole: "policy_document",
      },
      url: `/cfo-wiki/companies/${fixture.companyKey}/sources/${supportedPolicy.id}/bind`,
    });
    await injectJson(app, {
      expectedStatus: 201,
      method: "POST",
      payload: {
        boundBy: fixture.createdBy,
        documentRole: "policy_document",
      },
      url: `/cfo-wiki/companies/${fixture.companyKey}/sources/${unsupportedPolicy.id}/bind`,
    });

    const wikiCompile = await injectJson(app, {
      expectedStatus: 201,
      method: "POST",
      payload: {
        triggeredBy: fixture.createdBy,
      },
      url: `/cfo-wiki/companies/${fixture.companyKey}/compile`,
    });
    const companySources = await injectJson(app, {
      expectedStatus: 200,
      method: "GET",
      url: `/cfo-wiki/companies/${fixture.companyKey}/sources`,
    });
    const policyCorpus = await injectJson(app, {
      expectedStatus: 200,
      method: "GET",
      url: `/cfo-wiki/companies/${fixture.companyKey}/pages/${encodeURIComponent("concepts/policy-corpus")}`,
    });
    const supportedPolicyPageKey = `policies/${supportedPolicy.id}`;
    const unsupportedPolicyPageKey = `policies/${unsupportedPolicy.id}`;
    const supportedPolicyPage = await injectJson(app, {
      expectedStatus: 200,
      method: "GET",
      url: `/cfo-wiki/companies/${fixture.companyKey}/pages/${encodeURIComponent(supportedPolicyPageKey)}`,
    });
    const unsupportedPolicyPage = await injectJson(app, {
      expectedStatus: 200,
      method: "GET",
      url: `/cfo-wiki/companies/${fixture.companyKey}/pages/${encodeURIComponent(unsupportedPolicyPageKey)}`,
    });

    assert(
      wikiCompile.changedPageKeys.includes(supportedPolicyPageKey) &&
        wikiCompile.changedPageKeys.includes(unsupportedPolicyPageKey) &&
        wikiCompile.changedPageKeys.includes("concepts/policy-corpus"),
      "Expected the CFO Wiki compile to include both scoped policy pages and the policy-corpus concept page.",
    );
    assert(
      companySources.sourceCount === 2 &&
        companySources.sources.some(
          (entry) => entry.latestExtract?.extractStatus === "extracted",
        ) &&
        companySources.sources.some(
          (entry) => entry.latestExtract?.extractStatus === "unsupported",
        ),
      "Expected the bound-source list to expose both extracted and unsupported policy-document coverage.",
    );
    assert(
      supportedPolicyPage.freshnessSummary.state === "fresh" &&
        supportedPolicyPage.page.pageKind === "policy",
      "Expected the supported policy page to compile as a fresh policy page.",
    );
    assert(
      unsupportedPolicyPage.freshnessSummary.state === "missing" &&
        unsupportedPolicyPage.page.markdownBody.includes("## Policy Gap"),
      "Expected the unsupported policy page to stay visible as a policy gap.",
    );
    assert(
      policyCorpus.page.pageKey === "concepts/policy-corpus",
      "Expected the policy-corpus concept page to be readable before mission execution.",
    );

    const supportedMission = await injectJson(app, {
      expectedStatus: 201,
      method: "POST",
      payload: {
        companyKey: fixture.companyKey,
        operatorPrompt: "Which approval thresholds apply to travel spend?",
        policySourceId: supportedPolicy.id,
        questionKind: "policy_lookup",
        requestedBy: fixture.createdBy,
      },
      url: "/missions/analysis",
    });
    const supportedDetail = await pollMissionDetail({
      app,
      missionId: supportedMission.mission.id,
      worker: container.worker,
    });

    const unsupportedMission = await injectJson(app, {
      expectedStatus: 201,
      method: "POST",
      payload: {
        companyKey: fixture.companyKey,
        operatorPrompt: "What can I review from the security policy scope?",
        policySourceId: unsupportedPolicy.id,
        questionKind: "policy_lookup",
        requestedBy: fixture.createdBy,
      },
      url: "/missions/analysis",
    });
    const unsupportedDetail = await pollMissionDetail({
      app,
      missionId: unsupportedMission.mission.id,
      worker: container.worker,
    });
    const missionList = await injectJson(app, {
      expectedStatus: 200,
      method: "GET",
      url: "/missions?limit=20",
    });

    const supportedAnswer = supportedDetail.discoveryAnswer;
    const unsupportedAnswer = unsupportedDetail.discoveryAnswer;
    const supportedMissionListItem =
      missionList.missions.find((mission) => mission.id === supportedDetail.mission.id) ??
      null;
    const unsupportedMissionListItem =
      missionList.missions.find((mission) => mission.id === unsupportedDetail.mission.id) ??
      null;

    assert(
      supportedDetail.mission.status === "succeeded" &&
        supportedDetail.mission.type === "discovery",
      "Expected the supported policy lookup mission to succeed as a discovery mission.",
    );
    assert(
      supportedAnswer?.questionKind === "policy_lookup" &&
        supportedAnswer?.policySourceId === supportedPolicy.id,
      "Expected the supported discovery answer to retain explicit policy source scope.",
    );
    assert(
      supportedAnswer?.relatedRoutes.some(
        (route) =>
          route.routePath ===
          `/cfo-wiki/companies/${fixture.companyKey}/pages/${encodeURIComponent(supportedPolicyPageKey)}`,
      ) &&
        supportedAnswer?.relatedWikiPages.some(
          (page) => page.pageKey === supportedPolicyPageKey,
        ) &&
        supportedAnswer?.relatedWikiPages.some(
          (page) => page.pageKey === "concepts/policy-corpus",
        ),
      "Expected the supported answer to retain scoped policy routes plus the policy-corpus boundary page.",
    );
    assert(
      supportedDetail.proofBundle.questionKind === "policy_lookup" &&
        supportedDetail.proofBundle.policySourceId === supportedPolicy.id,
      "Expected the supported proof bundle to retain explicit policy scope.",
    );

    assert(
      unsupportedDetail.mission.status === "succeeded",
      "Expected the unsupported policy lookup mission to persist a truthful limited answer rather than fail outright.",
    );
    assert(
      unsupportedAnswer?.questionKind === "policy_lookup" &&
        unsupportedAnswer?.policySourceId === unsupportedPolicy.id,
      "Expected the unsupported discovery answer to retain explicit policy source scope.",
    );
    assert(
      unsupportedAnswer?.freshnessPosture.state === "missing",
      "Expected the unsupported policy answer freshness posture to stay explicitly missing.",
    );
    assert(
      unsupportedAnswer?.limitations.some((entry) =>
        entry.includes("unsupported deterministic extract"),
      ),
      "Expected the unsupported policy answer to expose the unsupported extract posture as a visible limitation.",
    );
    assert(
      unsupportedDetail.proofBundle.policySourceId === unsupportedPolicy.id &&
        unsupportedDetail.proofBundle.questionKind === "policy_lookup",
      "Expected the unsupported proof bundle to retain explicit policy source scope.",
    );

    assert(
      supportedMissionListItem?.questionKind === "policy_lookup" &&
        supportedMissionListItem.policySourceId === supportedPolicy.id &&
        unsupportedMissionListItem?.questionKind === "policy_lookup" &&
        unsupportedMissionListItem.policySourceId === unsupportedPolicy.id,
      "Expected the mission-list read model to retain explicit policy source scope for both policy lookup missions.",
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
            sourceId: financeSourceId,
            sourceFileId: financeSourceFileId,
            syncRunId: financeSync.syncRun.id,
            status: financeSync.syncRun.status,
          },
          wikiCompile: {
            compileRunId: wikiCompile.compileRun.id,
            status: wikiCompile.compileRun.status,
            changedPageKeys: wikiCompile.changedPageKeys,
          },
          companySources: {
            sourceCount: companySources.sourceCount,
            sources: companySources.sources.map((entry) => ({
              latestExtractStatus: entry.latestExtract?.extractStatus ?? null,
              latestSnapshotVersion: entry.latestSnapshot?.version ?? null,
              sourceId: entry.source.id,
            })),
          },
          supportedMission: summarizePolicyMission(supportedDetail),
          unsupportedMission: summarizePolicyMission(unsupportedDetail),
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

function summarizePolicyMission(detail) {
  return {
    answerSummary: detail.discoveryAnswer?.answerSummary ?? null,
    freshnessPosture: detail.discoveryAnswer?.freshnessPosture ?? null,
    missionId: detail.mission.id,
    policySourceId: detail.discoveryAnswer?.policySourceId ?? null,
    proofBundle: {
      policySourceId: detail.proofBundle.policySourceId,
      questionKind: detail.proofBundle.questionKind,
      status: detail.proofBundle.status,
    },
    relatedRoutes: detail.discoveryAnswer?.relatedRoutes ?? [],
    relatedWikiPages: detail.discoveryAnswer?.relatedWikiPages ?? [],
    status: detail.mission.status,
  };
}

async function writeSeedSnapshot(seed) {
  const directory = await mkdtemp(
    join(tmpdir(), "pocket-cfo-finance-policy-lookup-smoke-"),
  );
  const storageRef = join(directory, seed.originalFileName);

  await writeFile(storageRef, seed.body);

  return {
    checksumSha256: createHash("sha256").update(seed.body).digest("hex"),
    storageRef,
  };
}

async function createDocumentSource(app, input) {
  const seedBody = Buffer.from(
    `policy lookup smoke seed for ${input.sourceName}\n`,
    "utf8",
  );

  return injectJson(app, {
    expectedStatus: 201,
    method: "POST",
    payload: {
      createdBy: input.createdBy,
      description: `Packaged F4C1 policy source for ${input.sourceName}.`,
      kind: "document",
      name: input.sourceName,
      snapshot: {
        capturedAt: input.capturedAt,
        checksumSha256: createHash("sha256").update(seedBody).digest("hex"),
        mediaType: "text/plain",
        originalFileName: input.originalFileName,
        sizeBytes: seedBody.byteLength,
        storageKind: "external_url",
        storageRef: input.storageRef,
      },
    },
    url: "/sources",
  }).then((response) => ({
    id: requireUuid(response?.source?.id, "document source id"),
  }));
}

async function registerDocumentFile(app, sourceId, input) {
  return injectJson(app, {
    expectedStatus: 201,
    headers: {
      "content-type": "application/octet-stream",
    },
    method: "POST",
    payload: input.body,
    url: `/sources/${sourceId}/files?${new URLSearchParams({
      capturedAt: input.capturedAt,
      createdBy: input.createdBy,
      mediaType: input.mediaType,
      originalFileName: input.originalFileName,
    }).toString()}`,
  });
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
