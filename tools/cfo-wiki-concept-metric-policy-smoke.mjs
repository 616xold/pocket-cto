import { createHash } from "node:crypto";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { join, resolve } from "node:path";
import { buildApp } from "../apps/control-plane/src/app.ts";
import { createContainer } from "../apps/control-plane/src/bootstrap.ts";
import { closeAllPools } from "../packages/db/src/client.ts";
import { buildRunTag, loadNearestEnvFile } from "./m2-exit-utils.mjs";

const DEFAULT_COMPANY_KEY = "local-cfo-wiki-knowledge-pages-company";
const DEFAULT_COMPANY_NAME = "Local CFO Wiki Knowledge Pages Company";
const DEFAULT_CREATED_BY = "cfo-wiki-concept-metric-policy-smoke";
const MODULE_PATH = fileURLToPath(import.meta.url);

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
      note: "Seed snapshot for the packaged CFO Wiki F3D knowledge-page smoke.",
      requestedBy: "cfo_wiki_concept_metric_policy_smoke",
      runTag: input.runTag,
    },
    null,
    2,
  );
  const financeUpload = [
    "account_name,bank,last4,statement_balance,available_balance,current_balance,currency,as_of",
    "Operating Checking,First National,1234,1200.00,1000.00,,USD,2026-04-10",
    "Treasury Sweep,First National,9012,,400.00,,USD,2026-04-11",
  ].join("\n");

  return {
    companyKey: `${input.companyKey}-${input.runTag.toLowerCase()}`,
    companyName: `${input.companyName} ${input.runTag}`,
    createdBy: input.createdBy,
    financeSourceName: `CFO wiki knowledge seed ${input.runTag}`,
    supportedPolicyName: `Travel and expense policy ${input.runTag}`,
    unsupportedPolicyName: `Security policy link ${input.runTag}`,
    seed: {
      body: Buffer.from(`${seedText}\n`, "utf8"),
      mediaType: "application/json",
      originalFileName: `cfo-wiki-knowledge-pages-seed-${input.runTag}.json`,
    },
    financeUpload: {
      body: Buffer.from(`${financeUpload}\n`, "utf8"),
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
  const fixture = buildFixture({
    ...options,
    runTag,
  });
  const seedSnapshot = await writeSeedSnapshot(fixture.seed);
  const financeCapturedAt = new Date("2026-04-01T12:00:00.000Z").toISOString();
  const supportedPolicyCapturedAt = new Date("2026-04-08T12:00:00.000Z").toISOString();
  const unsupportedPolicyCapturedAt = new Date("2026-04-09T12:00:00.000Z").toISOString();
  let app = null;

  try {
    const container = await createContainer();
    app = await buildApp({ container });
    app.log.level = "error";

    const financeSource = await injectJson(app, {
      expectedStatus: 201,
      method: "POST",
      payload: {
        createdBy: fixture.createdBy,
        description: "Packaged CFO Wiki F3D smoke finance source.",
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
    const financeSourceId = requireUuid(financeSource?.source?.id, "finance source id");
    const financeUpload = await injectJson(app, {
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
      financeUpload?.sourceFile?.id,
      "finance source file id",
    );
    const synced = await injectJson(app, {
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

    const compiled = await injectJson(app, {
      expectedStatus: 201,
      method: "POST",
      payload: {
        triggeredBy: fixture.createdBy,
      },
      url: `/cfo-wiki/companies/${fixture.companyKey}/compile`,
    });
    const companySummary = await injectJson(app, {
      expectedStatus: 200,
      method: "GET",
      url: `/cfo-wiki/companies/${fixture.companyKey}`,
    });
    const companySources = await injectJson(app, {
      expectedStatus: 200,
      method: "GET",
      url: `/cfo-wiki/companies/${fixture.companyKey}/sources`,
    });
    const cashConcept = await injectJson(app, {
      expectedStatus: 200,
      method: "GET",
      url: `/cfo-wiki/companies/${fixture.companyKey}/pages/${encodeURIComponent("concepts/cash")}`,
    });
    const cashMetric = await injectJson(app, {
      expectedStatus: 200,
      method: "GET",
      url: `/cfo-wiki/companies/${fixture.companyKey}/pages/${encodeURIComponent("metrics/cash-posture")}`,
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
      compiled.pageCountsByKind.concept === 6,
      "Expected the fixed F3D concept registry to compile six pages.",
    );
    assert(
      compiled.pageCountsByKind.metric_definition === 7,
      "Expected the fixed F3D metric-definition registry to compile seven pages.",
    );
    assert(
      compiled.pageCountsByKind.policy === 2,
      "Expected two explicit policy pages from the bound policy-document sources.",
    );
    assert(
      compiled.changedPageKeys.includes("concepts/cash") &&
        compiled.changedPageKeys.includes("metrics/cash-posture") &&
        compiled.changedPageKeys.includes(supportedPolicyPageKey),
      "Expected the compile to include concept, metric-definition, and policy page keys in the changed page set.",
    );
    assert(
      companySummary.pageCountsByKind.concept === 6 &&
        companySummary.pageCountsByKind.metric_definition === 7 &&
        companySummary.pageCountsByKind.policy === 2,
      "Expected the company summary page-kind counts to include the new F3D families.",
    );
    assert(
      cashConcept.page.pageKind === "concept" &&
        cashConcept.page.markdownBody.includes("## Related Metric Definitions"),
      "Expected the cash concept page to be route-backed and render related metric definitions.",
    );
    assert(
      cashMetric.page.pageKind === "metric_definition" &&
        cashMetric.page.markdownBody.includes(
          "Route-backed read: `/finance-twin/companies/:companyKey/cash-posture`",
        ),
      "Expected the cash-posture metric-definition page to stay definition-first and route-backed.",
    );
    assert(
      policyCorpus.freshnessSummary.state === "mixed",
      "Expected the policy-corpus concept page freshness to reflect mixed supported and missing policy coverage.",
    );
    assert(
      supportedPolicyPage.page.pageKind === "policy" &&
        supportedPolicyPage.freshnessSummary.state === "fresh" &&
        supportedPolicyPage.page.markdownBody.includes(
          "Extraction support status: `extracted`",
        ),
      "Expected the supported policy page to compile from the extracted markdown source.",
    );
    assert(
      unsupportedPolicyPage.page.pageKind === "policy" &&
        unsupportedPolicyPage.freshnessSummary.state === "missing" &&
        unsupportedPolicyPage.page.markdownBody.includes("## Policy Gap"),
      "Expected the unsupported policy page to stay visible as a gap rather than fake policy prose.",
    );
    assert(
      companySources.sourceCount === 2 &&
        companySources.sources.some(
          (entry) => entry.latestExtract?.extractStatus === "extracted",
        ) &&
        companySources.sources.some(
          (entry) => entry.latestExtract?.extractStatus === "unsupported",
        ),
      "Expected the company source list to expose both extracted and unsupported policy-document coverage.",
    );

    console.log(
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          company: {
            companyKey: companySummary.companyKey,
            displayName: companySummary.companyDisplayName,
          },
          financeSync: {
            sourceId: financeSourceId,
            sourceFileId: financeSourceFileId,
            syncRunId: synced.syncRun.id,
            status: synced.syncRun.status,
          },
          compileRun: {
            id: compiled.compileRun.id,
            status: compiled.compileRun.status,
            changedPageKeys: compiled.changedPageKeys,
          },
          companySummary: {
            pageCount: companySummary.pageCount,
            pageCountsByKind: companySummary.pageCountsByKind,
            freshnessSummary: companySummary.freshnessSummary,
          },
          companySources: {
            sourceCount: companySources.sourceCount,
            sources: companySources.sources.map((entry) => ({
              sourceId: entry.source.id,
              latestSnapshotVersion: entry.latestSnapshot?.version ?? null,
              latestExtractStatus: entry.latestExtract?.extractStatus ?? null,
              latestDocumentKind: entry.latestExtract?.documentKind ?? null,
            })),
          },
          pages: {
            cashConcept: summarizePage(cashConcept),
            cashMetric: summarizePage(cashMetric),
            policyCorpus: summarizePage(policyCorpus),
            supportedPolicy: summarizePage(supportedPolicyPage),
            unsupportedPolicy: summarizePage(unsupportedPolicyPage),
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

async function createDocumentSource(app, input) {
  const seedBody = Buffer.from(
    `knowledge-page smoke seed for ${input.sourceName}\n`,
    "utf8",
  );

  return injectJson(app, {
    expectedStatus: 201,
    method: "POST",
    payload: {
      createdBy: input.createdBy,
      description: `Packaged CFO Wiki F3D policy source for ${input.sourceName}.`,
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

function summarizePage(pageView) {
  return {
    pageKey: pageView.page.pageKey,
    pageKind: pageView.page.pageKind,
    temporalStatus: pageView.page.temporalStatus,
    freshnessSummary: pageView.freshnessSummary,
    limitationCount: pageView.limitations.length,
    linkCount: pageView.links.length,
    backlinkCount: pageView.backlinks.length,
    refCount: pageView.refs.length,
  };
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function writeSeedSnapshot(seed) {
  const directory = await mkdtemp(
    join(tmpdir(), "pocket-cfo-wiki-knowledge-pages-smoke-"),
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

function requireUuid(value, label) {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`${label} missing from response`);
  }

  return value;
}

if (process.argv[1] && resolve(process.argv[1]) === MODULE_PATH) {
  await main();
}
