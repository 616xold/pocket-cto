import { createHash } from "node:crypto";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { readFreshnessLabel } from "../packages/domain/src/index.ts";
import { buildApp } from "../apps/control-plane/src/app.ts";
import { createEmbeddedWorkerContainer } from "../apps/control-plane/src/bootstrap.ts";
import {
  renderDiscoveryAnswerCardMarkup,
  renderMissionCardMarkup,
  renderMissionListCardMarkup,
} from "../apps/web/components/discovery-quality-render.tsx";
import { closeAllPools } from "../packages/db/src/client.ts";
import { buildRunTag, loadNearestEnvFile, wait } from "./m2-exit-utils.mjs";

const DEFAULT_COMPANY_KEY = "local-finance-discovery-quality";
const DEFAULT_COMPANY_NAME = "Local Finance Discovery Quality Company";
const DEFAULT_CREATED_BY = "finance-discovery-quality-hardening-smoke";
const POLL_INTERVAL_MS = 250;
const MAX_POLLS = 40;
const SILENT_LOGGER = {
  error() {},
  info() {},
};

const STORED_STATE_CASES = [
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
        description: "Packaged F4C2 quality smoke bank summary source.",
        kind: "dataset",
        name: `Discovery quality bank summary ${input.runTag}`,
        seed: {
          note: "Seed snapshot for the packaged F4C2 discovery-quality cash-posture source.",
          originalFileName: `finance-discovery-quality-bank-summary-seed-${input.runTag}.json`,
          requestedBy: "finance_discovery_quality_cash_posture_smoke",
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
        description: "Packaged F4C2 quality smoke receivables-aging source.",
        kind: "dataset",
        name: `Discovery quality receivables aging ${input.runTag}`,
        seed: {
          note: "Seed snapshot for the packaged F4C2 discovery-quality collections-pressure source.",
          originalFileName: `finance-discovery-quality-receivables-seed-${input.runTag}.json`,
          requestedBy: "finance_discovery_quality_collections_pressure_smoke",
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
        description: "Packaged F4C2 quality smoke payables-aging source.",
        kind: "dataset",
        name: `Discovery quality payables aging ${input.runTag}`,
        seed: {
          note: "Seed snapshot for the packaged F4C2 discovery-quality payables-pressure source.",
          originalFileName: `finance-discovery-quality-payables-seed-${input.runTag}.json`,
          requestedBy: "finance_discovery_quality_payables_pressure_smoke",
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
        description: "Packaged F4C2 quality smoke card-expense source.",
        kind: "dataset",
        name: `Discovery quality card expense ${input.runTag}`,
        seed: {
          note: "Seed snapshot for the packaged F4C2 discovery-quality spend-posture source.",
          originalFileName: `finance-discovery-quality-spend-seed-${input.runTag}.json`,
          requestedBy: "finance_discovery_quality_spend_posture_smoke",
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
        description: "Packaged F4C2 quality smoke contract-metadata source.",
        kind: "dataset",
        name: `Discovery quality contract metadata ${input.runTag}`,
        seed: {
          note: "Seed snapshot for the packaged F4C2 discovery-quality obligation-calendar source.",
          originalFileName: `finance-discovery-quality-contracts-seed-${input.runTag}.json`,
          requestedBy: "finance_discovery_quality_obligation_calendar_smoke",
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
    supportedPolicyName: `Travel and expense policy ${input.runTag}`,
    unsupportedPolicyName: `Security policy link ${input.runTag}`,
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
  const now = new Date();
  const fixture = buildFixture({
    ...options,
    capturedAt: now.toISOString(),
    primaryAsOfDate: now.toISOString().slice(0, 10),
    runTag: buildRunTag(),
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

    const supportedPolicy = await createDocumentSource(app, {
      capturedAt: new Date(now.getTime() + 60_000).toISOString(),
      createdBy: fixture.createdBy,
      originalFileName: `travel-policy-link-${fixture.runTag}.txt`,
      sourceName: fixture.supportedPolicyName,
      storageRef: `https://example.com/${fixture.companyKey}/travel-policy/${fixture.runTag}`,
    });
    await registerDocumentFile(app, supportedPolicy.id, {
      body: fixture.supportedPolicyUpload.body,
      capturedAt: new Date(now.getTime() + 60_000).toISOString(),
      createdBy: fixture.createdBy,
      mediaType: fixture.supportedPolicyUpload.mediaType,
      originalFileName: fixture.supportedPolicyUpload.originalFileName,
    });

    const unsupportedPolicy = await createDocumentSource(app, {
      capturedAt: new Date(now.getTime() + 120_000).toISOString(),
      createdBy: fixture.createdBy,
      originalFileName: `security-policy-link-${fixture.runTag}.txt`,
      sourceName: fixture.unsupportedPolicyName,
      storageRef: `https://example.com/${fixture.companyKey}/security-policy/${fixture.runTag}`,
    });

    await bindPolicySource(app, fixture.companyKey, supportedPolicy.id, fixture.createdBy);
    await bindPolicySource(
      app,
      fixture.companyKey,
      unsupportedPolicy.id,
      fixture.createdBy,
    );

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

    assert(
      companySources.sources.some(
        (entry) =>
          entry.source.id === supportedPolicy.id &&
          entry.latestExtract?.extractStatus === "extracted",
      ),
      "Expected the supported policy binding to expose extracted deterministic policy coverage.",
    );
    assert(
      companySources.sources.some(
        (entry) =>
          entry.source.id === unsupportedPolicy.id &&
          entry.latestExtract?.extractStatus === "unsupported",
      ),
      "Expected the unsupported policy binding to expose unsupported deterministic policy coverage.",
    );
    const supportedPolicySource = requireCompanySourceEntry(
      companySources,
      supportedPolicy.id,
    );
    const unsupportedPolicySource = requireCompanySourceEntry(
      companySources,
      unsupportedPolicy.id,
    );

    const details = [];
    for (const missionCase of STORED_STATE_CASES) {
      const createdMission = await injectJson(app, {
        expectedStatus: 201,
        method: "POST",
        payload: {
          companyKey: fixture.companyKey,
          operatorPrompt: missionCase.operatorPrompt,
          questionKind: missionCase.questionKind,
          requestedBy: fixture.createdBy,
        },
        url: "/missions/analysis",
      });

      details.push({
        kind: missionCase.questionKind,
        detail: await pollMissionDetail({
          app,
          missionId: createdMission.mission.id,
          worker: container.worker,
        }),
        expected: missionCase,
      });
    }

    const supportedPolicyMission = await injectJson(app, {
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
    const supportedPolicyDetail = await pollMissionDetail({
      app,
      missionId: supportedPolicyMission.mission.id,
      worker: container.worker,
    });

    const unsupportedPolicyMission = await injectJson(app, {
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
    const unsupportedPolicyDetail = await pollMissionDetail({
      app,
      missionId: unsupportedPolicyMission.mission.id,
      worker: container.worker,
    });

    const missionList = await injectJson(app, {
      expectedStatus: 200,
      method: "GET",
      url: "/missions?limit=20",
    });

    const storedStateResults = details.map(({ detail, expected }) =>
      assertStoredStateMissionResult({
        companyKey: fixture.companyKey,
        detail,
        expected,
        listItem: requireMissionListItem(missionList, detail.mission.id),
      }),
    );
    const supportedPolicyResult = assertPolicyMissionResult({
      companyKey: fixture.companyKey,
      detail: supportedPolicyDetail,
      expectedExtractLabel: humanizeExtractStatus(
        supportedPolicySource.latestExtract?.extractStatus ?? null,
      ),
      expectedSnapshotVersion:
        supportedPolicySource.latestSnapshot?.version ?? null,
      expectedSourceId: supportedPolicy.id,
      listItem: requireMissionListItem(missionList, supportedPolicyDetail.mission.id),
      sourceName: fixture.supportedPolicyName,
      unsupported: false,
    });
    const unsupportedPolicyResult = assertPolicyMissionResult({
      companyKey: fixture.companyKey,
      detail: unsupportedPolicyDetail,
      expectedExtractLabel: humanizeExtractStatus(
        unsupportedPolicySource.latestExtract?.extractStatus ?? null,
      ),
      expectedSnapshotVersion:
        unsupportedPolicySource.latestSnapshot?.version ?? null,
      expectedSourceId: unsupportedPolicy.id,
      listItem: requireMissionListItem(
        missionList,
        unsupportedPolicyDetail.mission.id,
      ),
      sourceName: fixture.unsupportedPolicyName,
      unsupported: true,
    });

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
          companySources: companySources.sources.map((entry) => ({
            sourceId: entry.source.id,
            sourceName: entry.source.name,
            documentRole: entry.binding.documentRole,
            includeInCompile: entry.binding.includeInCompile,
            latestExtractStatus: entry.latestExtract?.extractStatus ?? null,
            latestSnapshotVersion: entry.latestSnapshot?.version ?? null,
          })),
          storedStateResults,
          supportedPolicyResult,
          unsupportedPolicyResult,
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

async function createDocumentSource(app, input) {
  const seedBody = Buffer.from(
    `policy discovery quality smoke seed for ${input.sourceName}\n`,
    "utf8",
  );

  return injectJson(app, {
    expectedStatus: 201,
    method: "POST",
    payload: {
      createdBy: input.createdBy,
      description: `Packaged F4C2 policy source for ${input.sourceName}.`,
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

async function bindPolicySource(app, companyKey, sourceId, createdBy) {
  return injectJson(app, {
    expectedStatus: 201,
    method: "POST",
    payload: {
      boundBy: createdBy,
      documentRole: "policy_document",
    },
    url: `/cfo-wiki/companies/${companyKey}/sources/${sourceId}/bind`,
  });
}

function assertStoredStateMissionResult(input) {
  const answer = input.detail.discoveryAnswer;
  assert(answer !== null, `Expected ${input.expected.questionKind} discovery answer.`);
  assert(
    answer.questionKind === input.expected.questionKind,
    `Expected ${input.expected.questionKind} answer question kind to round-trip.`,
  );
  assert(
    answer.answerSummary.includes(input.expected.summaryIncludes),
    `Expected ${input.expected.questionKind} answer summary to mention "${input.expected.summaryIncludes}".`,
  );
  assert(
    answer.limitations.length > 0,
    `Expected ${input.expected.questionKind} answer to keep visible limitations.`,
  );
  assert(
    answer.relatedRoutes.length > 0 && answer.relatedWikiPages.length > 0,
    `Expected ${input.expected.questionKind} answer to keep related route and wiki evidence.`,
  );
  assert(
    input.detail.proofBundle.status === "ready",
    `Expected ${input.expected.questionKind} proof bundle to reach ready status.`,
  );
  assert(
    input.detail.proofBundle.relatedRoutePaths.length > 0 &&
      input.detail.proofBundle.relatedWikiPageKeys.length > 0,
    `Expected ${input.expected.questionKind} proof bundle to keep route and wiki evidence.`,
  );
  assert(
    input.expected.relatedRouteSuffixes.every((suffix) =>
      answer.relatedRoutes.some((route) => route.routePath.endsWith(suffix)),
    ),
    `Expected ${input.expected.questionKind} answer routes to include ${input.expected.relatedRouteSuffixes.join(", ")}.`,
  );
  assert(
    input.expected.relatedWikiPageKeys.every((pageKey) =>
      answer.relatedWikiPages.some((page) => page.pageKey === pageKey),
    ),
    `Expected ${input.expected.questionKind} related wiki pages to include the shipped baseline.`,
  );

  const discoveryMarkup = renderDiscoveryAnswerCardMarkup({
    answer,
    mission: input.detail.mission,
  });
  const missionMarkup = renderMissionCardMarkup({
    approvalCards: input.detail.approvalCards,
    artifacts: input.detail.artifacts,
    discoveryAnswer: input.detail.discoveryAnswer,
    liveControl: input.detail.liveControl,
    mission: input.detail.mission,
    proofBundle: input.detail.proofBundle,
    tasks: input.detail.tasks,
  });
  const missionListMarkup = renderMissionListCardMarkup({
    mission: input.listItem,
  });

  assertHumanFreshnessLabel(discoveryMarkup, answer.freshnessPosture.state, input.expected.questionKind);
  assertHumanFreshnessLabel(missionMarkup, input.detail.proofBundle.freshnessState, input.expected.questionKind);
  assertHumanFreshnessLabel(
    missionListMarkup,
    input.listItem.freshnessState,
    `${input.expected.questionKind} mission list`,
  );
  assert(
    discoveryMarkup.includes("Limitations"),
    `Expected ${input.expected.questionKind} discovery card to render visible limitations.`,
  );

  return {
    answerSummary: answer.answerSummary,
    freshness: answer.freshnessPosture,
    missionId: input.detail.mission.id,
    proofBundleStatus: input.detail.proofBundle.status,
    questionKind: input.expected.questionKind,
  };
}

function assertPolicyMissionResult(input) {
  const answer = input.detail.discoveryAnswer;
  assert(answer !== null, "Expected policy lookup discovery answer.");
  assert(
    answer.questionKind === "policy_lookup" &&
      answer.policySourceId === input.expectedSourceId,
    "Expected policy lookup answer to retain explicit source scope.",
  );
  assert(
    answer.policySourceScope?.sourceName === input.sourceName,
    "Expected policy lookup answer to surface the bound source name.",
  );
  assert(
    answer.policySourceScope?.documentRole === "policy_document" &&
      answer.policySourceScope?.includeInCompile === true,
    "Expected policy lookup answer to surface explicit policy-document scope.",
  );
  assert(
    answer.policySourceScope?.latestSnapshotVersion ===
      input.expectedSnapshotVersion,
    `Expected policy lookup answer to surface latest snapshot version ${input.expectedSnapshotVersion}.`,
  );
  assert(
    input.detail.proofBundle.policySourceScope?.sourceName === input.sourceName &&
      input.detail.proofBundle.policySourceScope?.latestExtractStatus ===
        answer.policySourceScope?.latestExtractStatus,
    "Expected proof bundle policy scope summary to match the answer scope summary.",
  );
  assert(
    input.listItem.policySourceScope?.sourceName === input.sourceName,
    "Expected mission list policy scope summary to match the answer scope summary.",
  );
  assert(
    input.detail.proofBundle.relatedRoutePaths.length > 0 &&
      input.detail.proofBundle.relatedWikiPageKeys.length > 0,
    "Expected policy proof bundle to preserve related route and wiki evidence.",
  );

  if (input.unsupported) {
    assert(
      answer.freshnessPosture.state === "missing",
      "Expected unsupported policy mission freshness to stay explicitly missing.",
    );
    assert(
      answer.limitations.some((entry) =>
        entry.includes("unsupported deterministic extract"),
      ),
      "Expected unsupported policy mission to keep the unsupported extract limitation visible.",
    );
  } else {
    assert(
      answer.freshnessPosture.state === "fresh",
      "Expected supported policy mission freshness to stay fresh.",
    );
  }

  const discoveryMarkup = renderDiscoveryAnswerCardMarkup({
    answer,
    mission: input.detail.mission,
  });
  const missionMarkup = renderMissionCardMarkup({
    approvalCards: input.detail.approvalCards,
    artifacts: input.detail.artifacts,
    discoveryAnswer: input.detail.discoveryAnswer,
    liveControl: input.detail.liveControl,
    mission: input.detail.mission,
    proofBundle: input.detail.proofBundle,
    tasks: input.detail.tasks,
  });
  const missionListMarkup = renderMissionListCardMarkup({
    mission: input.listItem,
  });
  for (const markup of [discoveryMarkup, missionMarkup, missionListMarkup]) {
    assert(markup.includes(input.expectedSourceId), "Expected rendered policy scope to keep the source id visible.");
    assert(markup.includes(input.sourceName), "Expected rendered policy scope to keep the source name visible.");
    assert(markup.includes("Policy Document"), "Expected rendered policy scope to humanize the document role.");
    assert(markup.includes(input.expectedExtractLabel), "Expected rendered policy scope to humanize the extract posture.");
    if (input.expectedSnapshotVersion !== null) {
      assert(
        markup.includes(`v${input.expectedSnapshotVersion}`),
        "Expected rendered policy scope to keep the latest snapshot version visible.",
      );
    }
  }

  assertHumanFreshnessLabel(discoveryMarkup, answer.freshnessPosture.state, "policy_lookup");
  assertHumanFreshnessLabel(missionMarkup, input.detail.proofBundle.freshnessState, "policy_lookup");
  assertHumanFreshnessLabel(
    missionListMarkup,
    input.listItem.freshnessState,
    "policy_lookup mission list",
  );

  return {
    answerSummary: answer.answerSummary,
    freshness: answer.freshnessPosture,
    missionId: input.detail.mission.id,
    policySourceScope: input.detail.proofBundle.policySourceScope,
    proofBundleStatus: input.detail.proofBundle.status,
    unsupported: input.unsupported,
  };
}

function assertHumanFreshnessLabel(markup, state, label) {
  const freshnessLabel = readFreshnessLabel(state);
  assert(
    markup.includes(freshnessLabel),
    `Expected ${label} rendering to include human-readable freshness label "${freshnessLabel}".`,
  );
  if (state) {
    assert(
      !markup.includes(`>${state}<`),
      `Expected ${label} rendering to avoid raw freshness enum "${state}".`,
    );
  }
}

function requireMissionListItem(list, missionId) {
  const mission =
    list.missions.find((candidate) => candidate.id === missionId) ?? null;

  if (!mission) {
    throw new Error(`Mission ${missionId} was not present in the mission list.`);
  }

  return mission;
}

function requireCompanySourceEntry(list, sourceId) {
  const entry =
    list.sources.find((candidate) => candidate.source.id === sourceId) ?? null;

  if (!entry) {
    throw new Error(`Company source ${sourceId} was not present in the source list.`);
  }

  return entry;
}

function humanizeExtractStatus(status) {
  if (typeof status !== "string" || status.length === 0) {
    return "Not available";
  }

  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

async function writeSeedSnapshot(seed) {
  const directory = await mkdtemp(
    join(tmpdir(), "pocket-cfo-finance-discovery-quality-smoke-"),
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

    if (detail.mission.status === "succeeded") {
      return detail;
    }

    if (detail.mission.status === "failed" || detail.mission.status === "cancelled") {
      throw new Error(
        `Mission ${input.missionId} ended with status ${detail.mission.status}.`,
      );
    }

    await wait(POLL_INTERVAL_MS);
  }

  throw new Error(`Timed out waiting for mission ${input.missionId}.`);
}

function requireUuid(value, label) {
  if (typeof value === "string" && /^[0-9a-f-]{36}$/i.test(value)) {
    return value;
  }

  throw new Error(`Missing ${label}.`);
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

await main();
