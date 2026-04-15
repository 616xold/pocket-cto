import { createHash } from "node:crypto";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildApp } from "../apps/control-plane/src/app.ts";
import { createEmbeddedWorkerContainer } from "../apps/control-plane/src/bootstrap.ts";
import { closeAllPools } from "../packages/db/src/client.ts";
import { buildRunTag, loadNearestEnvFile, wait } from "./m2-exit-utils.mjs";

const DEFAULT_COMPANY_KEY = "local-fd-supported-families";
const DEFAULT_COMPANY_NAME = "Local Finance Discovery Supported Families Company";
const DEFAULT_CREATED_BY = "finance-discovery-supported-families-smoke";
const MODULE_PATH = fileURLToPath(import.meta.url);
const POLL_INTERVAL_MS = 250;
const MAX_POLLS = 40;
const SILENT_LOGGER = {
  error() {},
  info() {},
};

const SUPPORTED_FAMILY_CASES = [
  {
    questionKind: "cash_posture",
    operatorPrompt: "What is our current cash posture from stored state?",
    relatedRouteSuffixes: ["cash-posture", "bank-accounts"],
    relatedWikiPageKeys: [
      "metrics/cash-posture",
      "concepts/cash",
      "company/overview",
    ],
    summaryIncludes: "Stored cash posture",
  },
  {
    questionKind: "collections_pressure",
    operatorPrompt: "Where does stored state show collections pressure right now?",
    relatedRouteSuffixes: ["collections-posture", "receivables-aging"],
    relatedWikiPageKeys: [
      "metrics/collections-posture",
      "metrics/receivables-aging",
      "concepts/receivables",
      "company/overview",
    ],
    summaryIncludes: "Stored collections pressure",
  },
  {
    questionKind: "payables_pressure",
    operatorPrompt: "Where does stored state show payables pressure right now?",
    relatedRouteSuffixes: ["payables-posture", "payables-aging"],
    relatedWikiPageKeys: [
      "metrics/payables-posture",
      "metrics/payables-aging",
      "concepts/payables",
      "company/overview",
    ],
    summaryIncludes: "Stored payables pressure",
  },
  {
    questionKind: "spend_posture",
    operatorPrompt: "What does stored state show about current spend posture?",
    relatedRouteSuffixes: ["spend-posture", "spend-items"],
    relatedWikiPageKeys: [
      "metrics/spend-posture",
      "concepts/spend",
      "company/overview",
    ],
    summaryIncludes: "Stored spend posture",
  },
  {
    questionKind: "obligation_calendar_review",
    operatorPrompt: "What upcoming obligations are visible from stored contract state?",
    relatedRouteSuffixes: ["obligation-calendar", "contracts"],
    relatedWikiPageKeys: [
      "metrics/obligation-calendar",
      "concepts/contract-obligations",
      "company/overview",
    ],
    summaryIncludes: "Stored obligation calendar review",
  },
];

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
  const runTag = input.runTag.toLowerCase();
  const maxBaseLength = 64 - runTag.length - 1;
  const companyKey = `${input.companyKey.slice(0, maxBaseLength)}-${runTag}`;
  const companyName = `${input.companyName} ${input.runTag}`;

  return {
    capturedAt: input.capturedAt,
    companyKey,
    companyName,
    createdBy: input.createdBy,
    runTag: input.runTag,
    sourceFixtures: [
      {
        description: "Packaged F4B cash-posture source.",
        kind: "dataset",
        name: `Supported families bank summary ${input.runTag}`,
        seed: {
          note: "Seed snapshot for the packaged F4B supported-families cash-posture source.",
          originalFileName: `finance-discovery-supported-families-bank-summary-seed-${input.runTag}.json`,
          requestedBy: "finance_discovery_supported_families_cash_posture_smoke",
        },
        upload: {
          mediaType: "text/csv",
          originalFileName: `bank-account-summary-${input.runTag}.csv`,
          text: [
            "account_name,bank,last4,statement_balance,available_balance,current_balance,currency,as_of",
            `Operating Checking,First National,1234,1200.00,1000.00,,USD,${input.primaryAsOfDate}`,
            "Payroll Reserve,First National,5678,,,250.00,USD,",
            `Treasury Sweep,First National,9012,,400.00,,USD,${input.secondaryAsOfDate}`,
            `Euro Operating,Euro Bank,9999,300.00,,,EUR,${input.primaryAsOfDate}`,
          ].join("\n"),
        },
      },
      {
        description: "Packaged F4B collections-pressure source.",
        kind: "dataset",
        name: `Supported families receivables aging ${input.runTag}`,
        seed: {
          note: "Seed snapshot for the packaged F4B supported-families collections-pressure source.",
          originalFileName: `finance-discovery-supported-families-receivables-seed-${input.runTag}.json`,
          requestedBy:
            "finance_discovery_supported_families_collections_pressure_smoke",
        },
        upload: {
          mediaType: "text/csv",
          originalFileName: `receivables-aging-${input.runTag}.csv`,
          text: [
            "customer_name,customer_id,currency,as_of,current,31_60,past_due,total",
            "Alpha Co,C-100,USD,2026-04-30,100.00,20.00,20.00,120.00",
            "Alpha Co,C-100,USD,2026-04-30,100.00,20.00,20.00,120.00",
            "Beta Co,C-200,USD,,,,80.00,80.00",
            "Gamma Co,C-300,EUR,2026-04-29,50.00,,,50.00",
          ].join("\n"),
        },
      },
      {
        description: "Packaged F4B payables-pressure source.",
        kind: "dataset",
        name: `Supported families payables aging ${input.runTag}`,
        seed: {
          note: "Seed snapshot for the packaged F4B supported-families payables-pressure source.",
          originalFileName: `finance-discovery-supported-families-payables-seed-${input.runTag}.json`,
          requestedBy:
            "finance_discovery_supported_families_payables_pressure_smoke",
        },
        upload: {
          mediaType: "text/csv",
          originalFileName: `payables-aging-${input.runTag}.csv`,
          text: [
            "vendor_name,vendor_id,currency,as_of,current,31_60,past_due,total",
            "Paper Supply Co,V-100,USD,2026-04-30,100.00,20.00,,120.00",
            "Paper Supply Co,V-100,USD,2026-04-30,100.00,20.00,,120.00",
            "Cloud Hosting,V-200,USD,,,,80.00,80.00",
            "Office Lease,V-300,EUR,2026-04-29,50.00,,,50.00",
          ].join("\n"),
        },
      },
      {
        description: "Packaged F4B spend-posture source.",
        kind: "dataset",
        name: `Supported families card expense ${input.runTag}`,
        seed: {
          note: "Seed snapshot for the packaged F4B supported-families spend-posture source.",
          originalFileName: `finance-discovery-supported-families-spend-seed-${input.runTag}.json`,
          requestedBy: "finance_discovery_supported_families_spend_posture_smoke",
        },
        upload: {
          mediaType: "text/csv",
          originalFileName: `card-expense-${input.runTag}.csv`,
          text: [
            "transaction_id,merchant,vendor,employee,card_name,card_last4,category,memo,amount,posted_amount,transaction_amount,currency,transaction_date,posted_date,expense_date,status,state,reimbursable,pending",
            "TX-100,Delta Air,,Alex Jones,Corporate Travel,1234,travel,Flight to NYC,500.00,505.00,495.00,USD,2026-04-01,2026-04-03,,submitted,in_review,true,false",
            "TX-100,Delta Air,,Alex Jones,Corporate Travel,1234,travel,Flight to NYC,500.00,505.00,495.00,USD,2026-04-01,2026-04-03,,submitted,in_review,true,false",
            ",Coffee House,,Alex Jones,Team Card,9876,meals,Team coffee,12.50,,,USD,2026-04-01,,,pending,,false,true",
            "TX-200,Restaurant,,Alex Jones,Team Card,9876,meals,Client dinner,,40.00,39.00,USD,2026-04-02,2026-04-04,,submitted,posted,false,false",
            "EX-300,,Hilton Hotels,,,,travel,Conference stay,200.00,,,EUR,,2026-04-05,2026-04-04,submitted,,false,false",
            "TX-400,Office Depot,,Alex Jones,Office Card,4567,office,Supplies,30.00,,,,,,,,false,false",
          ].join("\n"),
        },
      },
      {
        description: "Packaged F4B obligation-calendar source.",
        kind: "dataset",
        name: `Supported families contract metadata ${input.runTag}`,
        seed: {
          note: "Seed snapshot for the packaged F4B supported-families obligation-calendar source.",
          originalFileName: `finance-discovery-supported-families-contracts-seed-${input.runTag}.json`,
          requestedBy:
            "finance_discovery_supported_families_obligation_calendar_smoke",
        },
        upload: {
          mediaType: "text/csv",
          originalFileName: `contract-metadata-${input.runTag}.csv`,
          text: [
            "contract_id,contract_name,counterparty,contract_type,status,renewal_date,notice_deadline,next_payment_date,payment_amount,amount,currency,as_of,end_date,auto_renew",
            "C-100,Master Services Agreement,Acme Customer,msa,active,2026-11-01,2026-10-01,2026-05-15,500.00,12000.00,USD,2026-04-30,2026-12-31,true",
            "C-100,Master Services Agreement,Acme Customer,msa,active,2026-11-01,2026-10-01,2026-05-15,500.00,12000.00,USD,2026-04-30,2026-12-31,true",
            "L-200,Office Lease,Landlord LLC,lease,active,,,2026-06-01,,24000.00,EUR,2026-04-29,2027-01-31,false",
            "S-300,Support Agreement,Service Partner,services,active,,,2026-05-20,250.00,3000.00,GBP,2026-04-28,,true",
            "NDA-1,NDA,Partner Co,confidentiality,draft,,,,,,GBP,,,",
          ].join("\n"),
        },
      },
    ],
  };
}

async function main() {
  loadNearestEnvFile();

  const options = parseArgs(process.argv.slice(2).filter((entry) => entry !== "--"));
  const runTag = buildRunTag();
  const now = new Date();
  const fixture = buildFixture({
    ...options,
    capturedAt: now.toISOString(),
    primaryAsOfDate: now.toISOString().slice(0, 10),
    runTag,
    secondaryAsOfDate: new Date(now.getTime() - 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10),
  });
  let app = null;
  let container = null;

  try {
    container = await createEmbeddedWorkerContainer();
    app = await buildApp({ container });
    app.log.level = "silent";

    const sourceRuns = [];

    for (const sourceFixture of fixture.sourceFixtures) {
      sourceRuns.push(await createAndSyncSource(app, fixture, sourceFixture));
    }

    const wikiCompile = await injectJson(app, {
      expectedStatus: 201,
      method: "POST",
      payload: {
        triggeredBy: fixture.createdBy,
      },
      url: `/cfo-wiki/companies/${fixture.companyKey}/compile`,
    });

    const twinState = await verifyTwinState(app, fixture.companyKey);
    const wikiPages = await verifyWikiPages(
      app,
      fixture.companyKey,
      wikiCompile.changedPageKeys,
    );
    const missionResults = [];

    for (const familyCase of SUPPORTED_FAMILY_CASES) {
      const createdMission = await injectJson(app, {
        expectedStatus: 201,
        method: "POST",
        payload: {
          companyKey: fixture.companyKey,
          operatorPrompt: familyCase.operatorPrompt,
          questionKind: familyCase.questionKind,
          requestedBy: fixture.createdBy,
        },
        url: "/missions/analysis",
      });
      const detail = await pollMissionDetail({
        app,
        missionId: createdMission.mission.id,
        worker: container.worker,
      });
      const list = await injectJson(app, {
        expectedStatus: 200,
        method: "GET",
        url: "/missions?limit=20",
      });

      missionResults.push(
        assertSupportedFamilyResult({
          companyKey: fixture.companyKey,
          detail,
          expected: familyCase,
          list,
        }),
      );
    }

    console.log(
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          company: {
            companyKey: fixture.companyKey,
            displayName: fixture.companyName,
          },
          sourceRuns,
          wikiCompile: {
            compileRunId: wikiCompile.compileRun.id,
            status: wikiCompile.compileRun.status,
            changedPageKeys: wikiCompile.changedPageKeys,
          },
          twinState,
          wikiPages,
          missionResults,
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

async function createAndSyncSource(app, fixture, sourceFixture) {
  const seedText = JSON.stringify(
    {
      createdBy: fixture.createdBy,
      note: sourceFixture.seed.note,
      requestedBy: sourceFixture.seed.requestedBy,
      runTag: fixture.runTag,
    },
    null,
    2,
  );
  const seed = {
    body: Buffer.from(`${seedText}\n`, "utf8"),
    mediaType: "application/json",
    originalFileName: sourceFixture.seed.originalFileName,
  };
  const upload = {
    body: Buffer.from(`${sourceFixture.upload.text}\n`, "utf8"),
    mediaType: sourceFixture.upload.mediaType,
    originalFileName: sourceFixture.upload.originalFileName,
  };
  const seedSnapshot = await writeSeedSnapshot(seed);
  const created = await injectJson(app, {
    expectedStatus: 201,
    method: "POST",
    payload: {
      createdBy: fixture.createdBy,
      description: sourceFixture.description,
      kind: sourceFixture.kind,
      name: sourceFixture.name,
      snapshot: {
        capturedAt: fixture.capturedAt,
        checksumSha256: seedSnapshot.checksumSha256,
        mediaType: seed.mediaType,
        originalFileName: seed.originalFileName,
        sizeBytes: seed.body.byteLength,
        storageKind: "local_path",
        storageRef: seedSnapshot.storageRef,
      },
    },
    url: "/sources",
  });
  const sourceId = requireUuid(created?.source?.id, "source id");
  const uploaded = await injectJson(app, {
    expectedStatus: 201,
    headers: {
      "content-type": "application/octet-stream",
    },
    method: "POST",
    payload: upload.body,
    url: `/sources/${sourceId}/files?${new URLSearchParams({
      capturedAt: fixture.capturedAt,
      createdBy: fixture.createdBy,
      mediaType: upload.mediaType,
      originalFileName: upload.originalFileName,
    }).toString()}`,
  });
  const sourceFileId = requireUuid(uploaded?.sourceFile?.id, "source file id");
  const sync = await injectJson(app, {
    expectedStatus: 201,
    method: "POST",
    payload: {
      companyName: fixture.companyName,
    },
    url: `/finance-twin/companies/${fixture.companyKey}/source-files/${sourceFileId}/sync`,
  });

  return {
    name: sourceFixture.name,
    sourceFileId,
    sourceId,
    syncRunId: sync.syncRun.id,
    syncStatus: sync.syncRun.status,
  };
}

async function verifyTwinState(app, companyKey) {
  const [
    bankAccounts,
    cashPosture,
    receivablesAging,
    collectionsPosture,
    payablesAging,
    payablesPosture,
    spendItems,
    spendPosture,
    contracts,
    obligationCalendar,
  ] = await Promise.all([
    injectJson(app, {
      expectedStatus: 200,
      method: "GET",
      url: `/finance-twin/companies/${companyKey}/bank-accounts`,
    }),
    injectJson(app, {
      expectedStatus: 200,
      method: "GET",
      url: `/finance-twin/companies/${companyKey}/cash-posture`,
    }),
    injectJson(app, {
      expectedStatus: 200,
      method: "GET",
      url: `/finance-twin/companies/${companyKey}/receivables-aging`,
    }),
    injectJson(app, {
      expectedStatus: 200,
      method: "GET",
      url: `/finance-twin/companies/${companyKey}/collections-posture`,
    }),
    injectJson(app, {
      expectedStatus: 200,
      method: "GET",
      url: `/finance-twin/companies/${companyKey}/payables-aging`,
    }),
    injectJson(app, {
      expectedStatus: 200,
      method: "GET",
      url: `/finance-twin/companies/${companyKey}/payables-posture`,
    }),
    injectJson(app, {
      expectedStatus: 200,
      method: "GET",
      url: `/finance-twin/companies/${companyKey}/spend-items`,
    }),
    injectJson(app, {
      expectedStatus: 200,
      method: "GET",
      url: `/finance-twin/companies/${companyKey}/spend-posture`,
    }),
    injectJson(app, {
      expectedStatus: 200,
      method: "GET",
      url: `/finance-twin/companies/${companyKey}/contracts`,
    }),
    injectJson(app, {
      expectedStatus: 200,
      method: "GET",
      url: `/finance-twin/companies/${companyKey}/obligation-calendar`,
    }),
  ]);

  assert(bankAccounts.accountCount === 4, "Expected four persisted bank accounts.");
  assert(
    cashPosture.currencyBuckets.some((bucket) => bucket.currency === "USD"),
    "Expected cash posture to include a USD bucket.",
  );
  assert(
    receivablesAging.customerCount === 3,
    `Expected three persisted receivables-aging customers, received ${receivablesAging.customerCount}.`,
  );
  assert(
    collectionsPosture.currencyBuckets.some(
      (bucket) =>
        bucket.currency === "USD" &&
        bucket.totalReceivables === "200.00" &&
        bucket.pastDueBucketTotal === "100.00",
    ),
    "Expected a USD collections-posture bucket with persisted totals.",
  );
  assert(
    payablesAging.vendorCount === 3,
    `Expected three persisted payables-aging vendors, received ${payablesAging.vendorCount}.`,
  );
  assert(
    payablesPosture.currencyBuckets.some(
      (bucket) =>
        bucket.currency === "USD" &&
        bucket.totalPayables === "200.00" &&
        bucket.pastDueBucketTotal === "100.00",
    ),
    "Expected a USD payables-posture bucket with persisted totals.",
  );
  assert(spendItems.rowCount === 5, "Expected five persisted spend rows.");
  assert(
    spendPosture.currencyBuckets.some(
      (bucket) =>
        bucket.currency === "USD" && bucket.postedAmountTotal === "545.00",
    ),
    "Expected a USD spend-posture bucket with persisted posted totals.",
  );
  assert(
    spendPosture.currencyBuckets.some(
      (bucket) => bucket.currency === null && bucket.reportedAmountTotal === "30.00",
    ),
    "Expected an unknown-currency spend-posture bucket for incomplete source rows.",
  );
  assert(contracts.contractCount === 4, "Expected four persisted contracts.");
  assert(
    obligationCalendar.currencyBuckets.some(
      (bucket) => bucket.currency === "USD" && bucket.explicitAmountTotal === "500.00",
    ) &&
      obligationCalendar.currencyBuckets.some(
        (bucket) => bucket.currency === "GBP" && bucket.explicitAmountTotal === "250.00",
      ),
    "Expected obligation calendar buckets for the persisted USD and GBP obligations.",
  );

  return {
    bankAccounts: {
      accountCount: bankAccounts.accountCount,
    },
    cashPosture: {
      currencyBucketCount: cashPosture.currencyBuckets.length,
      freshnessState: cashPosture.freshness.state,
    },
    collectionsPosture: {
      currencyBucketCount: collectionsPosture.currencyBuckets.length,
      freshnessState: collectionsPosture.freshness.state,
      rowCount: collectionsPosture.coverageSummary.rowCount,
    },
    contracts: {
      contractCount: contracts.contractCount,
      freshnessState: contracts.freshness.state,
    },
    obligationCalendar: {
      freshnessState: obligationCalendar.freshness.state,
      obligationCount: obligationCalendar.coverageSummary.obligationCount,
    },
    payablesPosture: {
      freshnessState: payablesPosture.freshness.state,
      rowCount: payablesPosture.coverageSummary.rowCount,
    },
    receivablesAging: {
      customerCount: receivablesAging.customerCount,
    },
    spendPosture: {
      freshnessState: spendPosture.freshness.state,
      rowCount: spendPosture.coverageSummary.rowCount,
    },
  };
}

async function verifyWikiPages(app, companyKey, changedPageKeys) {
  const expectedPageKeys = Array.from(
    new Set(
      SUPPORTED_FAMILY_CASES.flatMap((familyCase) => familyCase.relatedWikiPageKeys),
    ),
  );

  for (const pageKey of expectedPageKeys) {
    assert(
      changedPageKeys.includes(pageKey),
      `Expected CFO Wiki compile to include ${pageKey}.`,
    );
  }

  const pages = await Promise.all(
    expectedPageKeys.map((pageKey) =>
      injectJson(app, {
        expectedStatus: 200,
        method: "GET",
        url: `/cfo-wiki/companies/${companyKey}/pages/${encodeURIComponent(pageKey)}`,
      }),
    ),
  );

  for (const [index, page] of pages.entries()) {
    assert(
      page.page.pageKey === expectedPageKeys[index],
      `Expected readable CFO Wiki page ${expectedPageKeys[index]}.`,
    );
  }

  return pages.map((page) => ({
    pageKey: page.page.pageKey,
    title: page.page.title,
    freshnessState: page.freshnessSummary.state,
  }));
}

function assertSupportedFamilyResult(input) {
  const discoveryAnswer = input.detail.discoveryAnswer;
  const discoveryAnswerArtifact =
    input.detail.artifacts.find((artifact) => artifact.kind === "discovery_answer") ??
    null;
  const proofBundleArtifact =
    input.detail.artifacts.find(
      (artifact) => artifact.kind === "proof_bundle_manifest",
    ) ?? null;
  const listedMission =
    input.list.missions.find((mission) => mission.id === input.detail.mission.id) ??
    null;

  assert(
    input.detail.mission.type === "discovery",
    `Expected ${input.expected.questionKind} to run as a discovery mission.`,
  );
  assert(
    input.detail.mission.primaryRepo === null,
    `Expected ${input.expected.questionKind} to avoid repo assumptions.`,
  );
  assert(
    input.detail.mission.status === "succeeded",
    `Expected ${input.expected.questionKind} mission to succeed.`,
  );
  assert(discoveryAnswer !== null, "Expected a persisted finance discovery answer.");
  assert(
    discoveryAnswer.source === "stored_finance_twin_and_cfo_wiki",
    `Expected ${input.expected.questionKind} answer to use stored Finance Twin and CFO Wiki state.`,
  );
  assert(
    discoveryAnswer.companyKey === input.companyKey &&
      discoveryAnswer.questionKind === input.expected.questionKind,
    `Expected ${input.expected.questionKind} answer to retain company and question scope.`,
  );
  assert(
    discoveryAnswer.answerSummary.includes(input.expected.summaryIncludes),
    `Expected ${input.expected.questionKind} summary to include ${input.expected.summaryIncludes}.`,
  );
  assert(
    discoveryAnswer.freshnessPosture.state === "fresh",
    `Expected ${input.expected.questionKind} freshness posture to be fresh.`,
  );
  assert(
    discoveryAnswer.limitations.length > 0,
    `Expected ${input.expected.questionKind} answer to expose visible limitations.`,
  );
  assert(
    JSON.stringify(readRouteSuffixes(discoveryAnswer.relatedRoutes)) ===
      JSON.stringify(input.expected.relatedRouteSuffixes),
    `Unexpected related routes for ${input.expected.questionKind}.`,
  );
  assert(
    JSON.stringify(discoveryAnswer.relatedWikiPages.map((page) => page.pageKey)) ===
      JSON.stringify(input.expected.relatedWikiPageKeys),
    `Unexpected related wiki pages for ${input.expected.questionKind}.`,
  );
  assert(
    discoveryAnswer.evidenceSections.length >=
      input.expected.relatedRouteSuffixes.length +
        input.expected.relatedWikiPageKeys.length,
    `Expected ${input.expected.questionKind} to emit route-backed and wiki-backed evidence sections.`,
  );
  assert(
    discoveryAnswer.bodyMarkdown.includes("## Freshness posture") &&
      discoveryAnswer.bodyMarkdown.includes("## Limitations") &&
      discoveryAnswer.bodyMarkdown.includes("## Evidence sections"),
    `Expected ${input.expected.questionKind} markdown body to expose freshness, limitations, and evidence sections.`,
  );
  assert(
    discoveryAnswer.structuredData.questionKind === input.expected.questionKind &&
      discoveryAnswer.structuredData.companyKey === input.companyKey,
    `Expected ${input.expected.questionKind} structured data to retain scope.`,
  );
  assert(
    input.detail.proofBundle.companyKey === input.companyKey &&
      input.detail.proofBundle.questionKind === input.expected.questionKind,
    `Expected ${input.expected.questionKind} proof bundle to retain finance scope.`,
  );
  assert(
    input.detail.proofBundle.targetRepoFullName === null &&
      input.detail.proofBundle.branchName === null &&
      input.detail.proofBundle.pullRequestNumber === null &&
      input.detail.proofBundle.pullRequestUrl === null,
    `Expected ${input.expected.questionKind} proof bundle to avoid repo and PR assumptions.`,
  );
  assert(
    JSON.stringify(readRouteSuffixesFromPaths(input.detail.proofBundle.relatedRoutePaths)) ===
      JSON.stringify(input.expected.relatedRouteSuffixes),
    `Unexpected proof-bundle routes for ${input.expected.questionKind}.`,
  );
  assert(
    JSON.stringify(input.detail.proofBundle.relatedWikiPageKeys) ===
      JSON.stringify(input.expected.relatedWikiPageKeys),
    `Unexpected proof-bundle wiki pages for ${input.expected.questionKind}.`,
  );
  assert(
    input.detail.proofBundle.answerSummary.length > 0 &&
      input.detail.proofBundle.freshnessSummary.length > 0 &&
      input.detail.proofBundle.limitationsSummary.length > 0,
    `Expected ${input.expected.questionKind} proof bundle to retain answer, freshness, and limitations summaries.`,
  );
  assert(
    input.detail.proofBundle.status === "ready",
    `Expected ${input.expected.questionKind} proof bundle to be ready.`,
  );
  assert(
    discoveryAnswerArtifact !== null && proofBundleArtifact !== null,
    `Expected ${input.expected.questionKind} discovery-answer and proof-bundle artifacts.`,
  );
  assert(
    listedMission !== null,
    `Expected ${input.expected.questionKind} mission to appear in the mission list.`,
  );
  assert(
    listedMission.companyKey === input.companyKey &&
      listedMission.questionKind === input.expected.questionKind &&
      typeof listedMission.answerSummary === "string" &&
      listedMission.answerSummary.length > 0 &&
      listedMission.freshnessState === "fresh",
    `Expected ${input.expected.questionKind} mission list surface to retain scope and freshness.`,
  );

  return {
    answerSummary: discoveryAnswer.answerSummary,
    discoveryAnswerArtifactId: discoveryAnswerArtifact.id,
    freshnessState: discoveryAnswer.freshnessPosture.state,
    missionId: input.detail.mission.id,
    proofBundleArtifactId: proofBundleArtifact.id,
    proofBundleStatus: input.detail.proofBundle.status,
    questionKind: input.expected.questionKind,
    relatedRouteSuffixes: readRouteSuffixes(discoveryAnswer.relatedRoutes),
    relatedWikiPageKeys: discoveryAnswer.relatedWikiPages.map((page) => page.pageKey),
  };
}

async function writeSeedSnapshot(seed) {
  const directory = await mkdtemp(
    join(tmpdir(), "pocket-cfo-finance-discovery-supported-families-smoke-"),
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

function readRouteSuffixes(routes) {
  return routes.map((route) => route.routePath.split("/").pop());
}

function readRouteSuffixesFromPaths(routePaths) {
  return routePaths.map((routePath) => routePath.split("/").pop());
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
