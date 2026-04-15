import { afterEach, describe, expect, it } from "vitest";
import type { FastifyInstance } from "fastify";
import {
  FINANCE_DISCOVERY_STORED_STATE_QUESTION_KINDS,
  type ProofBundleManifest,
  ProofBundleManifestSchema,
} from "@pocket-cto/domain";
import { buildApp } from "./app";
import { createInMemoryContainer } from "./bootstrap";
import type { AppContainer } from "./lib/types";
import {
  ApprovalNotFoundError,
  ApprovalNotPendingError,
} from "./modules/approvals/errors";
import {
  GitHubInstallationNotFoundError,
  GitHubIssueIntakeNonIssueDeliveryError,
  GitHubRepositoryNotFoundError,
} from "./modules/github-app/errors";
import { RuntimeActiveTurnNotFoundError } from "./modules/runtime-codex/errors";

const unknownMissionId = "11111111-1111-4111-8111-111111111111";
const unknownApprovalId = "22222222-2222-4222-8222-222222222222";
const unknownTaskId = "33333333-3333-4333-8333-333333333333";

describe("control-plane app", () => {
  const apps: FastifyInstance[] = [];

  afterEach(async () => {
    await Promise.all(apps.splice(0).map((app) => app.close()));
  });

  it("POST /missions/text returns 201 with mission, tasks, and a proof bundle placeholder", async () => {
    const app = await createTestApp(apps);

    const response = await app.inject({
      method: "POST",
      url: "/missions/text",
      payload: {
        primaryRepo: "acme/web",
        text: "Implement passkeys for sign-in",
        requestedBy: "operator",
      },
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toMatchObject({
      mission: {
        type: "build",
        status: "queued",
        title: "Implement passkeys for sign-in",
        objective: "Implement passkeys for sign-in",
        sourceKind: "manual_text",
        createdBy: "operator",
        primaryRepo: "acme/web",
        spec: {
          repos: ["acme/web"],
        },
      },
      tasks: [
        { role: "planner", sequence: 0, status: "pending" },
        {
          role: "executor",
          sequence: 1,
          status: "pending",
        },
      ],
      proofBundle: {
        status: "placeholder",
        objective: "Implement passkeys for sign-in",
        changeSummary: "",
        verificationSummary: "",
        riskSummary: "",
        rollbackSummary: "",
        decisionTrace: [],
        artifactIds: [],
        replayEventCount: 0,
      },
    });
  });

  it("POST /missions/text returns 400 for an invalid body", async () => {
    const app = await createTestApp(apps);

    const response = await app.inject({
      method: "POST",
      url: "/missions/text",
      payload: {
        text: "",
      },
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({
      error: {
        code: "invalid_request",
        message: "Invalid request",
        details: [
          {
            path: "text",
            message: "String must contain at least 1 character(s)",
          },
        ],
      },
    });
  });

  it("POST /missions/analysis returns 201 with one scout task and a finance discovery proof placeholder for every supported family", async () => {
    const app = await createTestApp(apps);

    for (const questionKind of FINANCE_DISCOVERY_STORED_STATE_QUESTION_KINDS) {
      const response = await app.inject({
        method: "POST",
        url: "/missions/analysis",
        payload: {
          companyKey: "acme",
          questionKind,
          operatorPrompt: `Review ${questionKind} from stored state.`,
          requestedBy: "operator",
        },
      });

      expect(response.statusCode).toBe(201);
      expect(response.json()).toMatchObject({
        mission: {
          type: "discovery",
          status: "queued",
          sourceKind: "manual_discovery",
          createdBy: "operator",
          primaryRepo: null,
          spec: {
            repos: [],
            constraints: {
              allowedPaths: [],
            },
            input: {
              discoveryQuestion: {
                companyKey: "acme",
                questionKind,
                operatorPrompt: `Review ${questionKind} from stored state.`,
              },
            },
          },
        },
        tasks: [{ role: "scout", sequence: 0, status: "pending" }],
        proofBundle: {
          status: "placeholder",
          companyKey: "acme",
          questionKind,
          evidenceCompleteness: {
            expectedArtifactKinds: ["discovery_answer"],
            missingArtifactKinds: ["discovery_answer"],
          },
        },
      });
    }
  });

  it("POST /missions/discovery remains a finance-shaped alias to /missions/analysis", async () => {
    const app = await createTestApp(apps);

    const response = await app.inject({
      method: "POST",
      url: "/missions/discovery",
      payload: {
        companyKey: "acme",
        questionKind: "cash_posture",
        operatorPrompt: "Review cash posture from stored state.",
        requestedBy: "operator",
      },
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toMatchObject({
      mission: {
        type: "discovery",
        status: "queued",
        sourceKind: "manual_discovery",
        createdBy: "operator",
        primaryRepo: null,
        spec: {
          input: {
            discoveryQuestion: {
              companyKey: "acme",
              questionKind: "cash_posture",
              operatorPrompt: "Review cash posture from stored state.",
            },
          },
        },
      },
      tasks: [{ role: "scout", sequence: 0, status: "pending" }],
      proofBundle: {
        status: "placeholder",
        companyKey: "acme",
        questionKind: "cash_posture",
      },
    });
  });

  it("POST /missions/analysis accepts policy lookup only with explicit bound policy source scope", async () => {
    const { app, companyKey, policySourceId } =
      await createPolicyLookupTestApp(apps);

    const response = await app.inject({
      method: "POST",
      url: "/missions/analysis",
      payload: {
        companyKey,
        questionKind: "policy_lookup",
        policySourceId,
        operatorPrompt: "Review the scoped travel policy from stored state.",
        requestedBy: "operator",
      },
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toMatchObject({
      mission: {
        type: "discovery",
        status: "queued",
        sourceKind: "manual_discovery",
        spec: {
          input: {
            discoveryQuestion: {
              companyKey,
              questionKind: "policy_lookup",
              policySourceId,
              operatorPrompt:
                "Review the scoped travel policy from stored state.",
            },
          },
        },
      },
      tasks: [{ role: "scout", sequence: 0, status: "pending" }],
      proofBundle: {
        status: "placeholder",
        companyKey,
        questionKind: "policy_lookup",
        policySourceId,
      },
    });
  });

  it("POST /missions/analysis rejects policy lookup when policySourceId is missing", async () => {
    const app = await createTestApp(apps);

    const response = await app.inject({
      method: "POST",
      url: "/missions/analysis",
      payload: {
        companyKey: "acme",
        questionKind: "policy_lookup",
        requestedBy: "operator",
      },
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({
      error: {
        code: "invalid_request",
        message: "Invalid request",
        details: [
          {
            path: "policySourceId",
            message: "Required",
          },
        ],
      },
    });
  });

  it("POST /missions/analysis rejects unknown or non-policy_document policy sources clearly", async () => {
    const { app, companyKey, nonPolicySourceId } =
      await createPolicyLookupTestApp(apps);

    const missingResponse = await app.inject({
      method: "POST",
      url: "/missions/analysis",
      payload: {
        companyKey,
        questionKind: "policy_lookup",
        policySourceId: "99999999-9999-4999-8999-999999999999",
        requestedBy: "operator",
      },
    });
    const wrongRoleResponse = await app.inject({
      method: "POST",
      url: "/missions/analysis",
      payload: {
        companyKey,
        questionKind: "policy_lookup",
        policySourceId: nonPolicySourceId,
        requestedBy: "operator",
      },
    });

    expect(missingResponse.statusCode).toBe(400);
    expect(missingResponse.json()).toEqual({
      error: {
        code: "invalid_request",
        message: "Invalid request",
        details: [
          {
            path: "policySourceId",
            message: `Policy source 99999999-9999-4999-8999-999999999999 is not bound for company ${companyKey}.`,
          },
        ],
      },
    });
    expect(wrongRoleResponse.statusCode).toBe(400);
    expect(wrongRoleResponse.json()).toEqual({
      error: {
        code: "invalid_request",
        message: "Invalid request",
        details: [
          {
            path: "policySourceId",
            message: `Policy source ${nonPolicySourceId} is bound for company ${companyKey}, but not as a \`policy_document\`.`,
          },
        ],
      },
    });
  });

  it("POST /missions/discovery rejects the legacy repo-scoped engineering payload truthfully", async () => {
    const app = await createTestApp(apps);

    const response = await app.inject({
      method: "POST",
      url: "/missions/discovery",
      payload: {
        repoFullName: "616xold/pocket-cfo",
        questionKind: "auth_change",
        changedPaths: ["apps/control-plane/src/modules/github-app/auth.ts"],
        requestedBy: "operator",
      },
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({
      error: {
        code: "invalid_request",
        message: "Invalid request",
        details: [
          {
            path: "companyKey",
            message: "Required",
          },
          {
            path: "questionKind",
            message:
              "Invalid enum value. Expected 'cash_posture' | 'collections_pressure' | 'payables_pressure' | 'spend_posture' | 'obligation_calendar_review' | 'policy_lookup', received 'auth_change'",
          },
          {
            path: "request",
            message:
              "Unrecognized key(s) in object: 'repoFullName', 'changedPaths'",
          },
        ],
      },
    });
  });

  it("POST /sources registers a source with its first snapshot and GET /sources surfaces the registry summary", async () => {
    const app = await createTestApp(apps);

    const createResponse = await app.inject({
      method: "POST",
      url: "/sources",
      payload: {
        kind: "document",
        name: "March board deck",
        createdBy: "finance-operator",
        snapshot: {
          originalFileName: "march-board-deck.pdf",
          mediaType: "application/pdf",
          sizeBytes: 4096,
          checksumSha256:
            "cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc",
          storageKind: "external_url",
          storageRef: "https://example.com/board/march-board-deck.pdf",
          capturedAt: "2026-04-06T23:50:00.000Z",
        },
      },
    });

    expect(createResponse.statusCode).toBe(201);
    expect(createResponse.json()).toMatchObject({
      source: {
        kind: "document",
        originKind: "manual",
        name: "March board deck",
        createdBy: "finance-operator",
      },
      snapshots: [
        {
          version: 1,
          originalFileName: "march-board-deck.pdf",
          mediaType: "application/pdf",
          sizeBytes: 4096,
          checksumSha256:
            "cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc",
          storageKind: "external_url",
          storageRef: "https://example.com/board/march-board-deck.pdf",
          ingestStatus: "registered",
        },
      ],
    });

    const created = createResponse.json() as {
      source: { id: string };
      snapshots: Array<{ id: string }>;
    };

    const [listResponse, detailResponse] = await Promise.all([
      app.inject({
        method: "GET",
        url: "/sources",
      }),
      app.inject({
        method: "GET",
        url: `/sources/${created.source.id}`,
      }),
    ]);

    expect(listResponse.statusCode).toBe(200);
    expect(listResponse.json()).toMatchObject({
      limit: 20,
      sourceCount: 1,
      sources: [
        {
          id: created.source.id,
          snapshotCount: 1,
          latestSnapshot: {
            id: created.snapshots[0]?.id,
            version: 1,
          },
        },
      ],
    });
    expect(detailResponse.statusCode).toBe(200);
    expect(detailResponse.json()).toMatchObject({
      source: {
        id: created.source.id,
      },
      snapshots: [
        {
          id: created.snapshots[0]?.id,
        },
      ],
    });
  });

  it("POST /sources/:sourceId/files stores raw bytes and exposes source-file provenance views", async () => {
    const app = await createTestApp(apps);

    const createResponse = await app.inject({
      method: "POST",
      url: "/sources",
      payload: {
        kind: "document",
        name: "April board deck",
        createdBy: "finance-operator",
        snapshot: {
          originalFileName: "april-board-deck-link.txt",
          mediaType: "text/plain",
          sizeBytes: 20,
          checksumSha256:
            "dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd",
          storageKind: "external_url",
          storageRef: "https://example.com/board/april-link.txt",
          capturedAt: "2026-04-08T00:00:00.000Z",
        },
      },
    });
    const created = createResponse.json() as { source: { id: string } };

    const uploadResponse = await app.inject({
      method: "POST",
      url: `/sources/${created.source.id}/files?originalFileName=april-board-deck.pdf&mediaType=application%2Fpdf&createdBy=finance-operator&capturedAt=2026-04-08T00:05:00.000Z`,
      headers: {
        "content-type": "application/octet-stream",
      },
      payload: Buffer.from("april board deck pdf bytes"),
    });

    expect(uploadResponse.statusCode).toBe(201);
    expect(uploadResponse.json()).toMatchObject({
      sourceFile: {
        sourceId: created.source.id,
        originalFileName: "april-board-deck.pdf",
        mediaType: "application/pdf",
        sizeBytes: 26,
        storageKind: "object_store",
        createdBy: "finance-operator",
      },
      snapshot: {
        sourceId: created.source.id,
        version: 2,
        originalFileName: "april-board-deck.pdf",
        mediaType: "application/pdf",
        sizeBytes: 26,
        storageKind: "object_store",
        ingestStatus: "registered",
      },
      provenanceRecords: [
        {
          sourceId: created.source.id,
          kind: "source_file_registered",
          recordedBy: "finance-operator",
        },
      ],
    });

    const uploaded = uploadResponse.json() as {
      sourceFile: { id: string };
      snapshot: { id: string };
    };
    const [fileListResponse, fileDetailResponse, sourceDetailResponse] =
      await Promise.all([
        app.inject({
          method: "GET",
          url: `/sources/${created.source.id}/files`,
        }),
        app.inject({
          method: "GET",
          url: `/sources/files/${uploaded.sourceFile.id}`,
        }),
        app.inject({
          method: "GET",
          url: `/sources/${created.source.id}`,
        }),
      ]);

    expect(fileListResponse.statusCode).toBe(200);
    expect(fileListResponse.json()).toMatchObject({
      sourceId: created.source.id,
      fileCount: 1,
      files: [
        {
          id: uploaded.sourceFile.id,
          snapshotVersion: 2,
        },
      ],
    });
    expect(fileDetailResponse.statusCode).toBe(200);
    expect(fileDetailResponse.json()).toMatchObject({
      sourceFile: {
        id: uploaded.sourceFile.id,
      },
      snapshot: {
        id: uploaded.snapshot.id,
        version: 2,
      },
      provenanceRecords: [
        {
          sourceFileId: uploaded.sourceFile.id,
        },
      ],
    });
    expect(sourceDetailResponse.statusCode).toBe(200);
    const sourceDetail = sourceDetailResponse.json() as {
      snapshots: Array<{
        id: string;
        version: number;
        originalFileName: string;
      }>;
    };

    expect(sourceDetail.snapshots[0]).toMatchObject({
      id: uploaded.snapshot.id,
      version: 2,
      originalFileName: "april-board-deck.pdf",
    });
    expect(sourceDetail.snapshots.map((snapshot) => snapshot.version)).toEqual([
      2, 1,
    ]);
  });

  it("GET /sources/:sourceId returns 404 for an unknown source", async () => {
    const app = await createTestApp(apps);

    const response = await app.inject({
      method: "GET",
      url: "/sources/11111111-1111-4111-8111-111111111111",
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({
      error: {
        code: "source_not_found",
        message: "Source not found",
      },
    });
  });

  it("GET /sources/files/:sourceFileId returns 404 for an unknown source file", async () => {
    const app = await createTestApp(apps);

    const response = await app.inject({
      method: "GET",
      url: "/sources/files/11111111-1111-4111-8111-111111111111",
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({
      error: {
        code: "source_file_not_found",
        message: "Source file not found",
      },
    });
  });

  it("POST /sources/files/:sourceFileId/ingest creates durable ingest-run receipt views", async () => {
    const app = await createTestApp(apps);

    const createResponse = await app.inject({
      method: "POST",
      url: "/sources",
      payload: {
        kind: "dataset",
        name: "Cash flow export",
        createdBy: "finance-operator",
        snapshot: {
          originalFileName: "cash-flow-export.txt",
          mediaType: "text/plain",
          sizeBytes: 20,
          checksumSha256:
            "abababababababababababababababababababababababababababababababab",
          storageKind: "external_url",
          storageRef: "https://example.com/cash-flow.txt",
          capturedAt: "2026-04-08T00:00:00.000Z",
        },
      },
    });
    const created = createResponse.json() as { source: { id: string } };
    const uploadResponse = await app.inject({
      method: "POST",
      url: `/sources/${created.source.id}/files?originalFileName=cash-flow.csv&mediaType=text%2Fcsv&createdBy=finance-operator&capturedAt=2026-04-08T00:05:00.000Z`,
      headers: {
        "content-type": "application/octet-stream",
      },
      payload: Buffer.from("name,amount\ncash,10\nrunway,12\n"),
    });
    const uploaded = uploadResponse.json() as {
      sourceFile: { id: string };
      snapshot: { id: string };
    };

    const ingestResponse = await app.inject({
      method: "POST",
      url: `/sources/files/${uploaded.sourceFile.id}/ingest`,
    });

    expect(ingestResponse.statusCode).toBe(201);
    expect(ingestResponse.json()).toMatchObject({
      ingestRun: {
        sourceId: created.source.id,
        sourceFileId: uploaded.sourceFile.id,
        sourceSnapshotId: uploaded.snapshot.id,
        status: "ready",
        parserSelection: {
          parserKey: "csv_tabular",
          matchedBy: "media_type",
        },
        warningCount: 0,
        errorCount: 0,
        receiptSummary: {
          kind: "csv_tabular",
          columnCount: 2,
          header: ["name", "amount"],
          rowCount: 2,
        },
      },
    });

    const ingested = ingestResponse.json() as {
      ingestRun: { id: string };
    };
    const [listResponse, detailResponse] = await Promise.all([
      app.inject({
        method: "GET",
        url: `/sources/files/${uploaded.sourceFile.id}/ingest-runs`,
      }),
      app.inject({
        method: "GET",
        url: `/sources/ingest-runs/${ingested.ingestRun.id}`,
      }),
    ]);

    expect(listResponse.statusCode).toBe(200);
    expect(listResponse.json()).toMatchObject({
      sourceFileId: uploaded.sourceFile.id,
      runCount: 1,
      ingestRuns: [
        {
          id: ingested.ingestRun.id,
          status: "ready",
        },
      ],
    });
    expect(detailResponse.statusCode).toBe(200);
    expect(detailResponse.json()).toMatchObject({
      ingestRun: {
        id: ingested.ingestRun.id,
        status: "ready",
      },
    });
  });

  it("GET /sources/ingest-runs/:ingestRunId returns 404 for an unknown ingest run", async () => {
    const app = await createTestApp(apps);

    const response = await app.inject({
      method: "GET",
      url: "/sources/ingest-runs/11111111-1111-4111-8111-111111111111",
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({
      error: {
        code: "source_ingest_run_not_found",
        message: "Source ingest run not found",
      },
    });
  });

  it("POST /finance-twin/companies/:companyKey/source-files/:sourceFileId/sync persists a finance summary route", async () => {
    const app = await createTestApp(apps);

    const createResponse = await app.inject({
      method: "POST",
      url: "/sources",
      payload: {
        kind: "dataset",
        name: "Trial balance export",
        createdBy: "finance-operator",
        snapshot: {
          originalFileName: "trial-balance-link.txt",
          mediaType: "text/plain",
          sizeBytes: 18,
          checksumSha256:
            "efefefefefefefefefefefefefefefefefefefefefefefefefefefefefefefef",
          storageKind: "external_url",
          storageRef: "https://example.com/trial-balance",
          capturedAt: "2026-04-09T00:00:00.000Z",
        },
      },
    });
    const created = createResponse.json() as { source: { id: string } };
    const uploadResponse = await app.inject({
      method: "POST",
      url: `/sources/${created.source.id}/files?originalFileName=trial-balance.csv&mediaType=text%2Fcsv&createdBy=finance-operator&capturedAt=2026-04-09T00:05:00.000Z`,
      headers: {
        "content-type": "application/octet-stream",
      },
      payload: Buffer.from(
        [
          "account_code,account_name,period_end,debit,credit,currency_code,account_type",
          "1000,Cash,2026-03-31,125000.00,0.00,USD,asset",
          "2000,Accounts Payable,2026-03-31,0.00,42000.00,USD,liability",
        ].join("\n"),
      ),
    });
    const uploaded = uploadResponse.json() as {
      sourceFile: { id: string };
    };

    const syncResponse = await app.inject({
      method: "POST",
      url: `/finance-twin/companies/acme/source-files/${uploaded.sourceFile.id}/sync`,
      payload: {
        companyName: "Acme Holdings",
      },
    });

    expect(syncResponse.statusCode).toBe(201);
    expect(syncResponse.json()).toMatchObject({
      company: {
        companyKey: "acme",
        displayName: "Acme Holdings",
      },
      syncRun: {
        extractorKey: "trial_balance_csv",
        status: "succeeded",
      },
      companyTotals: {
        ledgerAccountCount: 2,
      },
      latestSuccessfulSlices: {
        trialBalance: {
          coverage: {
            lineCount: 2,
            lineageCount: 5,
          },
          summary: {
            totalDebitAmount: "125000.00",
            totalCreditAmount: "42000.00",
            totalNetAmount: "83000.00",
          },
        },
      },
    });

    const [summaryResponse, accountCatalogResponse] = await Promise.all([
      app.inject({
        method: "GET",
        url: "/finance-twin/companies/acme/summary",
      }),
      app.inject({
        method: "GET",
        url: "/finance-twin/companies/acme/account-catalog",
      }),
    ]);

    expect(summaryResponse.statusCode).toBe(200);
    expect(summaryResponse.json()).toMatchObject({
      company: {
        companyKey: "acme",
      },
      latestAttemptedSyncRun: {
        sourceFileId: uploaded.sourceFile.id,
        status: "succeeded",
      },
      freshness: {
        overall: {
          state: "missing",
        },
        trialBalance: {
          state: "fresh",
        },
        chartOfAccounts: {
          state: "missing",
        },
      },
      latestSuccessfulSlices: {
        trialBalance: {
          coverage: {
            lineCount: 2,
          },
        },
        chartOfAccounts: {
          coverage: {
            accountCatalogEntryCount: 0,
          },
        },
      },
    });
    expect(accountCatalogResponse.statusCode).toBe(200);
    expect(accountCatalogResponse.json()).toMatchObject({
      company: {
        companyKey: "acme",
      },
      latestAttemptedSyncRun: null,
      latestSuccessfulSlice: {
        coverage: {
          accountCatalogEntryCount: 0,
          lineageCount: 0,
        },
      },
      freshness: {
        state: "missing",
      },
      accounts: [],
    });
  });

  it("GET /finance-twin/companies/:companyKey/summary returns 404 for an unknown company", async () => {
    const app = await createTestApp(apps);

    const response = await app.inject({
      method: "GET",
      url: "/finance-twin/companies/missing-company/summary",
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({
      error: {
        code: "finance_company_not_found",
        message: "Finance company not found",
      },
    });
  });

  it("POST /finance-twin/companies/:companyKey/source-files/:sourceFileId/sync persists a latest general-ledger read route", async () => {
    const app = await createTestApp(apps);

    const createResponse = await app.inject({
      method: "POST",
      url: "/sources",
      payload: {
        kind: "dataset",
        name: "General ledger export",
        createdBy: "finance-operator",
        snapshot: {
          originalFileName: "general-ledger-link.txt",
          mediaType: "text/plain",
          sizeBytes: 18,
          checksumSha256:
            "f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0",
          storageKind: "external_url",
          storageRef: "https://example.com/general-ledger",
          capturedAt: "2026-04-11T00:00:00.000Z",
        },
      },
    });
    const created = createResponse.json() as { source: { id: string } };
    const uploadResponse = await app.inject({
      method: "POST",
      url: `/sources/${created.source.id}/files?originalFileName=general-ledger.csv&mediaType=text%2Fcsv&createdBy=finance-operator&capturedAt=2026-04-11T00:05:00.000Z`,
      headers: {
        "content-type": "application/octet-stream",
      },
      payload: Buffer.from(
        [
          "journal_id,transaction_date,period_start,period_end,period_key,account_code,account_name,debit,credit,currency_code,memo",
          "J-100,2026-03-31,2026-03-01,2026-03-31,2026-03,1000,Cash,100.00,0.00,USD,Seed funding received",
          "J-100,2026-03-31,2026-03-01,2026-03-31,2026-03,3000,Common Stock,0.00,100.00,USD,Seed funding received",
        ].join("\n"),
      ),
    });
    const uploaded = uploadResponse.json() as {
      sourceFile: { id: string };
    };

    const syncResponse = await app.inject({
      method: "POST",
      url: `/finance-twin/companies/acme/source-files/${uploaded.sourceFile.id}/sync`,
      payload: {
        companyName: "Acme Holdings",
      },
    });

    expect(syncResponse.statusCode).toBe(201);
    expect(syncResponse.json()).toMatchObject({
      syncRun: {
        extractorKey: "general_ledger_csv",
        status: "succeeded",
      },
      latestSuccessfulSlices: {
        generalLedger: {
          coverage: {
            journalEntryCount: 1,
            journalLineCount: 2,
            lineageCount: 5,
          },
        },
      },
    });

    const generalLedgerResponse = await app.inject({
      method: "GET",
      url: "/finance-twin/companies/acme/general-ledger",
    });

    expect(generalLedgerResponse.statusCode).toBe(200);
    expect(generalLedgerResponse.json()).toMatchObject({
      company: {
        companyKey: "acme",
        displayName: "Acme Holdings",
      },
      latestAttemptedSyncRun: {
        sourceFileId: uploaded.sourceFile.id,
        extractorKey: "general_ledger_csv",
      },
      latestSuccessfulSlice: {
        coverage: {
          journalEntryCount: 1,
          journalLineCount: 2,
          lineageCount: 5,
        },
        periodContext: {
          basis: "source_declared_period",
          sourceDeclaredPeriod: {
            contextKind: "period_window",
            periodKey: "2026-03",
            periodStart: "2026-03-01",
            periodEnd: "2026-03-31",
            asOf: null,
          },
        },
      },
      freshness: {
        state: "fresh",
      },
      entries: [
        {
          journalEntry: {
            externalEntryId: "J-100",
            transactionDate: "2026-03-31",
          },
          lines: [
            {
              ledgerAccount: {
                accountCode: "1000",
                accountName: "Cash",
              },
            },
            {
              ledgerAccount: {
                accountCode: "3000",
                accountName: "Common Stock",
              },
            },
          ],
        },
      ],
    });
  });

  it("GET /finance-twin/companies/:companyKey/receivables-aging and /collections-posture return truthful persisted receivables reads", async () => {
    const app = await createTestApp(apps);

    const createResponse = await app.inject({
      method: "POST",
      url: "/sources",
      payload: {
        kind: "dataset",
        name: "Receivables aging export",
        createdBy: "finance-operator",
        snapshot: {
          originalFileName: "receivables-aging-link.txt",
          mediaType: "text/plain",
          sizeBytes: 18,
          checksumSha256:
            "ababcdcdababcdcdababcdcdababcdcdababcdcdababcdcdababcdcdababcdcd",
          storageKind: "external_url",
          storageRef: "https://example.com/receivables-aging",
          capturedAt: "2026-04-12T00:00:00.000Z",
        },
      },
    });
    const created = createResponse.json() as { source: { id: string } };
    const uploadResponse = await app.inject({
      method: "POST",
      url: `/sources/${created.source.id}/files?originalFileName=receivables-aging.csv&mediaType=text%2Fcsv&createdBy=finance-operator&capturedAt=2026-04-12T00:05:00.000Z`,
      headers: {
        "content-type": "application/octet-stream",
      },
      payload: Buffer.from(
        [
          "customer_name,customer_id,currency,as_of,current,31_60,past_due,total",
          "Alpha Co,C-100,USD,2026-04-30,100.00,20.00,20.00,120.00",
          "Alpha Co,C-100,USD,2026-04-30,100.00,20.00,20.00,120.00",
          "Beta Co,C-200,USD,,,,80.00,80.00",
          "Gamma Co,C-300,EUR,2026-04-29,50.00,,,50.00",
        ].join("\n"),
      ),
    });
    const uploaded = uploadResponse.json() as { sourceFile: { id: string } };

    const syncResponse = await app.inject({
      method: "POST",
      url: `/finance-twin/companies/acme/source-files/${uploaded.sourceFile.id}/sync`,
      payload: {
        companyName: "Acme Holdings",
      },
    });

    expect(syncResponse.statusCode).toBe(201);
    expect(syncResponse.json()).toMatchObject({
      syncRun: {
        extractorKey: "receivables_aging_csv",
        status: "succeeded",
      },
    });

    const receivablesAgingResponse = await app.inject({
      method: "GET",
      url: "/finance-twin/companies/acme/receivables-aging",
    });
    const collectionsPostureResponse = await app.inject({
      method: "GET",
      url: "/finance-twin/companies/acme/collections-posture",
    });

    expect(receivablesAgingResponse.statusCode).toBe(200);
    expect(receivablesAgingResponse.json()).toMatchObject({
      company: {
        companyKey: "acme",
        displayName: "Acme Holdings",
      },
      latestSuccessfulSlice: {
        coverage: {
          customerCount: 3,
          rowCount: 3,
          lineageTargetCounts: {
            customerCount: 3,
            receivablesAgingRowCount: 3,
          },
        },
        summary: {
          reportedBucketKeys: ["current", "31_60", "past_due", "total"],
        },
      },
      customerCount: 3,
    });
    expect(collectionsPostureResponse.statusCode).toBe(200);
    expect(collectionsPostureResponse.json()).toMatchObject({
      company: {
        companyKey: "acme",
      },
      coverageSummary: {
        customerCount: 3,
        rowCount: 3,
        currencyBucketCount: 2,
      },
      currencyBuckets: [
        {
          currency: "EUR",
          totalReceivables: "50.00",
          currentBucketTotal: "50.00",
          pastDueBucketTotal: "0.00",
        },
        {
          currency: "USD",
          totalReceivables: "200.00",
          currentBucketTotal: "100.00",
          pastDueBucketTotal: "100.00",
        },
      ],
      diagnostics: [
        "One or more persisted receivables-aging rows do not include an explicit as-of date.",
        "One or more collections-posture currency buckets include both dated and undated customer aging rows.",
      ],
      limitations: expect.arrayContaining([
        "Collections posture stays grouped by reported currency only; this route does not perform FX conversion or emit one company-wide receivables total.",
      ]),
    });
  });

  it("GET /finance-twin/companies/:companyKey/payables-aging and /payables-posture return truthful persisted payables reads", async () => {
    const app = await createTestApp(apps);

    const createResponse = await app.inject({
      method: "POST",
      url: "/sources",
      payload: {
        kind: "dataset",
        name: "Payables aging export",
        createdBy: "finance-operator",
        snapshot: {
          originalFileName: "payables-aging-link.txt",
          mediaType: "text/plain",
          sizeBytes: 18,
          checksumSha256:
            "cdabefcdabefcdabefcdabefcdabefcdabefcdabefcdabefcdabefcdabefcdab",
          storageKind: "external_url",
          storageRef: "https://example.com/payables-aging",
          capturedAt: "2026-04-12T00:00:00.000Z",
        },
      },
    });
    const created = createResponse.json() as { source: { id: string } };
    const uploadResponse = await app.inject({
      method: "POST",
      url: `/sources/${created.source.id}/files?originalFileName=payables-aging.csv&mediaType=text%2Fcsv&createdBy=finance-operator&capturedAt=2026-04-12T00:05:00.000Z`,
      headers: {
        "content-type": "application/octet-stream",
      },
      payload: Buffer.from(
        [
          "vendor_name,vendor_id,currency,as_of,current,31_60,past_due,total",
          "Paper Supply Co,V-100,USD,2026-04-30,100.00,20.00,,120.00",
          "Paper Supply Co,V-100,USD,2026-04-30,100.00,20.00,,120.00",
          "Cloud Hosting,V-200,USD,,,,80.00,80.00",
          "Office Lease,V-300,EUR,2026-04-29,50.00,,,50.00",
        ].join("\n"),
      ),
    });
    const uploaded = uploadResponse.json() as { sourceFile: { id: string } };

    const syncResponse = await app.inject({
      method: "POST",
      url: `/finance-twin/companies/acme/source-files/${uploaded.sourceFile.id}/sync`,
      payload: {
        companyName: "Acme Holdings",
      },
    });

    expect(syncResponse.statusCode).toBe(201);
    expect(syncResponse.json()).toMatchObject({
      syncRun: {
        extractorKey: "payables_aging_csv",
        status: "succeeded",
      },
    });

    const payablesAgingResponse = await app.inject({
      method: "GET",
      url: "/finance-twin/companies/acme/payables-aging",
    });
    const payablesPostureResponse = await app.inject({
      method: "GET",
      url: "/finance-twin/companies/acme/payables-posture",
    });

    expect(payablesAgingResponse.statusCode).toBe(200);
    expect(payablesAgingResponse.json()).toMatchObject({
      company: {
        companyKey: "acme",
        displayName: "Acme Holdings",
      },
      latestSuccessfulSlice: {
        coverage: {
          vendorCount: 3,
          rowCount: 3,
          lineageTargetCounts: {
            vendorCount: 3,
            payablesAgingRowCount: 3,
          },
        },
        summary: {
          reportedBucketKeys: ["current", "31_60", "past_due", "total"],
        },
      },
      vendorCount: 3,
    });
    expect(payablesPostureResponse.statusCode).toBe(200);
    expect(payablesPostureResponse.json()).toMatchObject({
      company: {
        companyKey: "acme",
      },
      coverageSummary: {
        vendorCount: 3,
        rowCount: 3,
        currencyBucketCount: 2,
      },
      currencyBuckets: [
        {
          currency: "EUR",
          totalPayables: "50.00",
          currentBucketTotal: "50.00",
          pastDueBucketTotal: "0.00",
        },
        {
          currency: "USD",
          totalPayables: "200.00",
          currentBucketTotal: "100.00",
          pastDueBucketTotal: "100.00",
        },
      ],
      diagnostics: [
        "One or more persisted payables-aging rows do not include an explicit as-of date.",
        "One or more payables-posture currency buckets include both dated and undated vendor aging rows.",
        "The latest successful payables-aging slice mixes explicit past_due totals and detailed overdue bucket rows; exact bucket totals stay source-labeled while the convenience pastDueBucketTotal uses only non-overlapping row-level bases.",
      ],
      limitations: expect.arrayContaining([
        "Payables posture stays grouped by reported currency only; this route does not perform FX conversion or emit one company-wide payables total.",
      ]),
    });
  });

  it("GET /finance-twin/companies/:companyKey/contracts and /obligation-calendar return truthful persisted contract reads", async () => {
    const app = await createTestApp(apps);

    const createResponse = await app.inject({
      method: "POST",
      url: "/sources",
      payload: {
        kind: "dataset",
        name: "Contract metadata export",
        createdBy: "finance-operator",
        snapshot: {
          originalFileName: "contract-metadata-link.txt",
          mediaType: "text/plain",
          sizeBytes: 18,
          checksumSha256:
            "1234123412341234123412341234123412341234123412341234123412341234",
          storageKind: "external_url",
          storageRef: "https://example.com/contracts",
          capturedAt: "2026-04-12T00:00:00.000Z",
        },
      },
    });
    const created = createResponse.json() as { source: { id: string } };
    const uploadResponse = await app.inject({
      method: "POST",
      url: `/sources/${created.source.id}/files?originalFileName=contract-metadata.csv&mediaType=text%2Fcsv&createdBy=finance-operator&capturedAt=2026-04-12T00:05:00.000Z`,
      headers: {
        "content-type": "application/octet-stream",
      },
      payload: Buffer.from(
        [
          "contract_id,contract_name,counterparty,contract_type,status,renewal_date,notice_deadline,next_payment_date,payment_amount,amount,currency,as_of,end_date,auto_renew",
          "C-100,Master Services Agreement,Acme Customer,msa,active,2026-11-01,2026-10-01,2026-05-15,500.00,12000.00,USD,2026-04-30,2026-12-31,true",
          "C-100,Master Services Agreement,Acme Customer,msa,active,2026-11-01,2026-10-01,2026-05-15,500.00,12000.00,USD,2026-04-30,2026-12-31,true",
          "L-200,Office Lease,Landlord LLC,lease,active,,,2026-06-01,,24000.00,EUR,2026-04-29,2027-01-31,false",
          "S-300,Support Agreement,Service Partner,services,active,,,2026-05-20,250.00,3000.00,GBP,2026-04-28,,true",
          "NDA-1,NDA,Partner Co,confidentiality,draft,,,,,,GBP,,,",
        ].join("\n"),
      ),
    });
    const uploaded = uploadResponse.json() as { sourceFile: { id: string } };

    const syncResponse = await app.inject({
      method: "POST",
      url: `/finance-twin/companies/acme/source-files/${uploaded.sourceFile.id}/sync`,
      payload: {
        companyName: "Acme Holdings",
      },
    });

    expect(syncResponse.statusCode).toBe(201);
    expect(syncResponse.json()).toMatchObject({
      syncRun: {
        extractorKey: "contract_metadata_csv",
        status: "succeeded",
      },
    });

    const contractsResponse = await app.inject({
      method: "GET",
      url: "/finance-twin/companies/acme/contracts",
    });
    const obligationCalendarResponse = await app.inject({
      method: "GET",
      url: "/finance-twin/companies/acme/obligation-calendar",
    });

    expect(contractsResponse.statusCode).toBe(200);
    expect(contractsResponse.json()).toMatchObject({
      company: {
        companyKey: "acme",
        displayName: "Acme Holdings",
      },
      latestSuccessfulSlice: {
        coverage: {
          contractCount: 4,
          obligationCount: 7,
          lineageTargetCounts: {
            contractCount: 4,
            contractObligationCount: 7,
          },
        },
      },
      contractCount: 4,
    });
    expect(obligationCalendarResponse.statusCode).toBe(200);
    expect(obligationCalendarResponse.json()).toMatchObject({
      company: {
        companyKey: "acme",
      },
      coverageSummary: {
        contractCount: 4,
        obligationCount: 7,
        currencyBucketCount: 3,
      },
      currencyBuckets: [
        {
          currency: null,
          obligationCount: 5,
        },
        {
          currency: "GBP",
          obligationCount: 1,
          explicitAmountTotal: "250.00",
        },
        {
          currency: "USD",
          obligationCount: 1,
          explicitAmountTotal: "500.00",
        },
      ],
      diagnostics: [
        "One or more persisted contracts do not include an explicit observation date.",
        "One or more explicit contract obligations do not include an explicit amount.",
        "One or more contracts report a generic amount alongside next_payment_date, so the obligation calendar leaves that scheduled-payment amount null unless payment_amount is explicit.",
        "One or more persisted contracts include a generic end_date field that remains labeled as end_date rather than being upgraded into expiration semantics.",
      ],
      limitations: expect.arrayContaining([
        "Obligation amounts stay grouped by reported currency only; this route does not perform FX conversion or emit one company-wide obligation total.",
      ]),
    });
  });

  it("GET /finance-twin/companies/:companyKey/spend-items and /spend-posture return truthful persisted spend reads", async () => {
    const app = await createTestApp(apps);

    const createResponse = await app.inject({
      method: "POST",
      url: "/sources",
      payload: {
        kind: "dataset",
        name: "Card expense export",
        createdBy: "finance-operator",
        snapshot: {
          originalFileName: "card-expense-link.txt",
          mediaType: "text/plain",
          sizeBytes: 20,
          checksumSha256:
            "7890789078907890789078907890789078907890789078907890789078907890",
          storageKind: "external_url",
          storageRef: "https://example.com/card-expense",
          capturedAt: "2026-04-12T00:00:00.000Z",
        },
      },
    });
    const created = createResponse.json() as { source: { id: string } };
    const uploadResponse = await app.inject({
      method: "POST",
      url: `/sources/${created.source.id}/files?originalFileName=card-expense.csv&mediaType=text%2Fcsv&createdBy=finance-operator&capturedAt=2026-04-12T00:05:00.000Z`,
      headers: {
        "content-type": "application/octet-stream",
      },
      payload: Buffer.from(
        [
          "transaction_id,merchant,vendor,employee,card_name,card_last4,category,memo,amount,posted_amount,transaction_amount,currency,transaction_date,posted_date,expense_date,status,state,reimbursable,pending",
          "TX-100,Delta Air,,Alex Jones,Corporate Travel,1234,travel,Flight to NYC,500.00,505.00,495.00,USD,2026-04-01,2026-04-03,,submitted,in_review,true,false",
          "TX-100,Delta Air,,Alex Jones,Corporate Travel,1234,travel,Flight to NYC,500.00,505.00,495.00,USD,2026-04-01,2026-04-03,,submitted,in_review,true,false",
          ",Coffee House,,Alex Jones,Team Card,9876,meals,Team coffee,12.50,,,USD,2026-04-01,,,pending,,false,true",
          "TX-200,Restaurant,,Alex Jones,Team Card,9876,meals,Client dinner,,40.00,39.00,USD,2026-04-02,2026-04-04,,submitted,posted,false,false",
          "EX-300,,Hilton Hotels,,,,travel,Conference stay,200.00,,,EUR,,2026-04-05,2026-04-04,submitted,,false,false",
          "TX-400,Office Depot,,Alex Jones,Office Card,4567,office,Supplies,30.00,,,,,,,,false,false",
        ].join("\n"),
      ),
    });
    const uploaded = uploadResponse.json() as { sourceFile: { id: string } };

    const syncResponse = await app.inject({
      method: "POST",
      url: `/finance-twin/companies/acme/source-files/${uploaded.sourceFile.id}/sync`,
      payload: {
        companyName: "Acme Holdings",
      },
    });

    expect(syncResponse.statusCode).toBe(201);
    expect(syncResponse.json()).toMatchObject({
      syncRun: {
        extractorKey: "card_expense_csv",
        status: "succeeded",
      },
    });

    const spendItemsResponse = await app.inject({
      method: "GET",
      url: "/finance-twin/companies/acme/spend-items",
    });
    const spendPostureResponse = await app.inject({
      method: "GET",
      url: "/finance-twin/companies/acme/spend-posture",
    });

    expect(spendItemsResponse.statusCode).toBe(200);
    expect(spendItemsResponse.json()).toMatchObject({
      company: {
        companyKey: "acme",
        displayName: "Acme Holdings",
      },
      latestSuccessfulSlice: {
        coverage: {
          rowCount: 5,
          lineageTargetCounts: {
            spendRowCount: 5,
          },
        },
        summary: {
          rowCount: 5,
          datedRowCount: 4,
          undatedRowCount: 1,
        },
      },
      rowCount: 5,
      diagnostics: expect.arrayContaining([
        "One or more persisted spend rows do not include an explicit row identity, so those rows remain separate line-backed records and are not deduped heuristically.",
      ]),
    });
    expect(spendPostureResponse.statusCode).toBe(200);
    expect(spendPostureResponse.json()).toMatchObject({
      company: {
        companyKey: "acme",
      },
      coverageSummary: {
        rowCount: 5,
        currencyBucketCount: 3,
        datedRowCount: 4,
        undatedRowCount: 1,
      },
      currencyBuckets: [
        {
          currency: null,
          reportedAmountTotal: "30.00",
          rowCount: 1,
        },
        {
          currency: "EUR",
          reportedAmountTotal: "200.00",
          rowCount: 1,
        },
        {
          currency: "USD",
          reportedAmountTotal: "512.50",
          postedAmountTotal: "545.00",
          transactionAmountTotal: "534.00",
          rowCount: 3,
          mixedPostedDates: true,
          mixedTransactionDates: true,
        },
      ],
      diagnostics: expect.arrayContaining([
        "One or more persisted spend rows are grouped into an unknown-currency bucket because the source did not include a currency code.",
        "One or more persisted spend rows do not include any explicit source date.",
        "One or more spend-posture currency buckets span multiple explicit posted dates.",
        "One or more spend-posture currency buckets span multiple explicit transaction dates.",
      ]),
      limitations: expect.arrayContaining([
        "Spend posture stays grouped by reported currency only; this route does not perform FX conversion or emit one company-wide spend total.",
      ]),
    });
  });

  it("GET /finance-twin/companies/:companyKey/snapshot and lineage expose cross-slice alignment and drill-through", async () => {
    const app = await createTestApp(apps);

    async function createFinanceSourceFile(input: {
      capturedAt: string;
      checksumSha256: string;
      fileBody: Buffer;
      fileName: string;
      linkName: string;
      name: string;
      storageRef: string;
    }) {
      const createResponse = await app.inject({
        method: "POST",
        url: "/sources",
        payload: {
          kind: "dataset",
          name: input.name,
          createdBy: "finance-operator",
          snapshot: {
            originalFileName: input.linkName,
            mediaType: "text/plain",
            sizeBytes: 18,
            checksumSha256: input.checksumSha256,
            storageKind: "external_url",
            storageRef: input.storageRef,
            capturedAt: input.capturedAt,
          },
        },
      });
      const created = createResponse.json() as { source: { id: string } };
      const uploadResponse = await app.inject({
        method: "POST",
        url: `/sources/${created.source.id}/files?${new URLSearchParams({
          originalFileName: input.fileName,
          mediaType: "text/csv",
          createdBy: "finance-operator",
          capturedAt: input.capturedAt,
        }).toString()}`,
        headers: {
          "content-type": "application/octet-stream",
        },
        payload: input.fileBody,
      });

      return uploadResponse.json() as {
        sourceFile: { id: string };
      };
    }

    const chartFile = await createFinanceSourceFile({
      capturedAt: "2026-04-11T00:00:00.000Z",
      checksumSha256:
        "1010101010101010101010101010101010101010101010101010101010101010",
      fileName: "chart-of-accounts.csv",
      linkName: "chart-of-accounts-link.txt",
      name: "Chart of accounts export",
      storageRef: "https://example.com/chart-of-accounts",
      fileBody: Buffer.from(
        [
          "account_code,account_name,account_type,detail_type,parent_account_code,is_active,description",
          "1000,Cash,asset,current_asset,,true,Operating cash",
          "1100,Petty Cash,asset,current_asset,1000,false,Small cash drawer",
          "2000,Accounts Payable,liability,current_liability,,true,Supplier balances",
        ].join("\n"),
      ),
    });
    const trialBalanceFile = await createFinanceSourceFile({
      capturedAt: "2026-04-11T00:05:00.000Z",
      checksumSha256:
        "2020202020202020202020202020202020202020202020202020202020202020",
      fileName: "trial-balance.csv",
      linkName: "trial-balance-link.txt",
      name: "Trial balance export",
      storageRef: "https://example.com/trial-balance",
      fileBody: Buffer.from(
        [
          "account_code,account_name,period_end,debit,credit,currency_code,account_type",
          "1000,Cash,2026-03-31,100.00,0.00,USD,asset",
          "2000,Accounts Payable,2026-03-31,0.00,40.00,USD,liability",
          "3000,Retained Earnings,2026-03-31,0.00,60.00,USD,equity",
        ].join("\n"),
      ),
    });
    const generalLedgerFile = await createFinanceSourceFile({
      capturedAt: "2026-04-11T00:10:00.000Z",
      checksumSha256:
        "3030303030303030303030303030303030303030303030303030303030303030",
      fileName: "general-ledger.csv",
      linkName: "general-ledger-link.txt",
      name: "General ledger export",
      storageRef: "https://example.com/general-ledger",
      fileBody: Buffer.from(
        [
          "journal_id,transaction_date,account_code,account_name,account_type,debit,credit,currency_code,memo",
          "J-100,2026-04-01,1100,Petty Cash,asset,25.00,0.00,USD,Fund the petty cash drawer",
          "J-100,2026-04-01,1000,Cash,asset,0.00,25.00,USD,Fund the petty cash drawer",
          "J-101,2026-04-02,1000,Cash,asset,50.00,0.00,USD,Customer receipt",
          "J-101,2026-04-02,4000,Revenue,revenue,0.00,50.00,USD,Customer receipt",
        ].join("\n"),
      ),
    });

    const chartSyncResponse = await app.inject({
      method: "POST",
      url: `/finance-twin/companies/acme/source-files/${chartFile.sourceFile.id}/sync`,
      payload: {
        companyName: "Acme Holdings",
      },
    });
    const trialBalanceSyncResponse = await app.inject({
      method: "POST",
      url: `/finance-twin/companies/acme/source-files/${trialBalanceFile.sourceFile.id}/sync`,
      payload: {},
    });
    const generalLedgerSyncResponse = await app.inject({
      method: "POST",
      url: `/finance-twin/companies/acme/source-files/${generalLedgerFile.sourceFile.id}/sync`,
      payload: {},
    });
    const chartSync = chartSyncResponse.json() as { syncRun: { id: string } };
    const trialBalanceSync = trialBalanceSyncResponse.json() as {
      syncRun: { id: string };
    };
    const generalLedgerSync = generalLedgerSyncResponse.json() as {
      syncRun: { id: string };
    };

    const snapshotResponse = await app.inject({
      method: "GET",
      url: "/finance-twin/companies/acme/snapshot",
    });

    expect(snapshotResponse.statusCode).toBe(200);
    expect(snapshotResponse.json()).toMatchObject({
      company: {
        companyKey: "acme",
        displayName: "Acme Holdings",
      },
      sliceAlignment: {
        state: "mixed",
        distinctSourceCount: 3,
        distinctSyncRunCount: 3,
        distinctSourceSnapshotCount: 3,
        sameSource: false,
        sameSyncRun: false,
        sameSourceSnapshot: false,
      },
      coverageSummary: {
        accountRowCount: 5,
        chartOfAccountsAccountCount: 3,
        trialBalanceAccountCount: 3,
        generalLedgerActiveAccountCount: 3,
        inactiveWithGeneralLedgerActivityCount: 1,
      },
      latestSuccessfulSlices: {
        chartOfAccounts: {
          coverage: {
            lineageTargetCounts: {
              ledgerAccountCount: 3,
              accountCatalogEntryCount: 3,
            },
          },
        },
        trialBalance: {
          coverage: {
            lineageTargetCounts: {
              reportingPeriodCount: 1,
              ledgerAccountCount: 3,
              trialBalanceLineCount: 3,
            },
          },
        },
        generalLedger: {
          coverage: {
            lineageTargetCounts: {
              ledgerAccountCount: 3,
              journalEntryCount: 2,
              journalLineCount: 4,
            },
          },
        },
      },
      limitations: [
        "The current finance-twin surface covers deterministic trial-balance CSV, chart-of-accounts CSV, general-ledger CSV, bank-account-summary CSV, receivables-aging CSV, payables-aging CSV, contract-metadata CSV, and card-expense CSV extraction, plus additive summary, snapshot, bank-account inventory, cash-posture, receivables-aging, collections-posture, payables-aging, payables-posture, contract inventory, obligation-calendar, spend-item inventory, spend-posture, reconciliation, account-bridge, balance-bridge-prerequisites, period-context, source-backed general-ledger balance-proof, and balance-proof lineage drill read models.",
        "CFO Wiki, finance discovery answers, reports, monitoring, and close/control flows are not implemented in this slice.",
        "Do not treat this company snapshot as one coherent close package because the latest successful slices are mixed across different registered sources.",
      ],
    });

    const snapshot = snapshotResponse.json() as {
      accounts: Array<{
        activityLineageRef: {
          ledgerAccountId: string;
          syncRunId: string;
        } | null;
        ledgerAccount: { accountCode: string; id: string };
        lineageTargets: {
          chartOfAccountsEntry: { targetId: string; syncRunId: string } | null;
          trialBalanceLine: { targetId: string; syncRunId: string } | null;
        };
      }>;
    };
    const cashRow = snapshot.accounts.find(
      (account) => account.ledgerAccount.accountCode === "1000",
    );

    expect(cashRow).toBeDefined();
    expect(cashRow).toMatchObject({
      lineageTargets: {
        chartOfAccountsEntry: {
          syncRunId: chartSync.syncRun.id,
        },
        trialBalanceLine: {
          syncRunId: trialBalanceSync.syncRun.id,
        },
      },
      activityLineageRef: {
        ledgerAccountId: cashRow?.ledgerAccount.id,
        syncRunId: generalLedgerSync.syncRun.id,
      },
    });

    const activityLineageResponse = await app.inject({
      method: "GET",
      url: `/finance-twin/companies/acme/general-ledger/accounts/${cashRow?.ledgerAccount.id ?? ""}/lineage?${new URLSearchParams(
        {
          syncRunId: generalLedgerSync.syncRun.id,
        },
      ).toString()}`,
    });

    expect(activityLineageResponse.statusCode).toBe(200);
    expect(activityLineageResponse.json()).toMatchObject({
      target: {
        ledgerAccountId: cashRow?.ledgerAccount.id,
        syncRunId: generalLedgerSync.syncRun.id,
      },
      recordCount: 2,
      journalEntryCount: 2,
      journalLineCount: 2,
    });
    expect(
      (activityLineageResponse.json() as { records: unknown[] }).records,
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          journalEntryLineage: {
            targetKind: "journal_entry",
            syncRunId: generalLedgerSync.syncRun.id,
            targetId: expect.any(String),
          },
          journalLineLineage: {
            targetKind: "journal_line",
            syncRunId: generalLedgerSync.syncRun.id,
            targetId: expect.any(String),
          },
        }),
      ]),
    );

    const activityLineage = activityLineageResponse.json() as {
      records: Array<{
        journalLineLineage: { targetId: string; syncRunId: string };
      }>;
    };
    const journalLineLineageResponse = await app.inject({
      method: "GET",
      url: `/finance-twin/companies/acme/lineage/journal_line/${activityLineage.records[0]?.journalLineLineage.targetId ?? ""}?${new URLSearchParams(
        {
          syncRunId: generalLedgerSync.syncRun.id,
        },
      ).toString()}`,
    });

    expect(journalLineLineageResponse.statusCode).toBe(200);
    expect(journalLineLineageResponse.json()).toMatchObject({
      target: {
        targetKind: "journal_line",
        syncRunId: generalLedgerSync.syncRun.id,
      },
      recordCount: 1,
      records: [
        {
          syncRun: {
            extractorKey: "general_ledger_csv",
            id: generalLedgerSync.syncRun.id,
          },
          sourceFile: {
            originalFileName: "general-ledger.csv",
          },
        },
      ],
    });
  });

  it("GET /finance-twin/companies/:companyKey/reconciliation/trial-balance-vs-general-ledger returns a truthful readiness view", async () => {
    const app = await createTestApp(apps);
    const createSourceResponse = await app.inject({
      method: "POST",
      url: "/sources",
      payload: {
        kind: "dataset",
        name: "March close package",
        createdBy: "finance-operator",
        snapshot: {
          originalFileName: "march-close-package-link.txt",
          mediaType: "text/plain",
          sizeBytes: 18,
          checksumSha256:
            "f222222222222222222222222222222222222222222222222222222222222222",
          storageKind: "external_url",
          storageRef: "https://example.com/march-close-package",
          capturedAt: "2026-04-11T00:00:00.000Z",
        },
      },
    });

    expect(createSourceResponse.statusCode).toBe(201);

    const source = createSourceResponse.json() as {
      source: { id: string };
    };
    const trialBalanceFile = await app.inject({
      method: "POST",
      url: `/sources/${source.source.id}/files?originalFileName=trial-balance.csv&mediaType=text%2Fcsv&createdBy=finance-operator&capturedAt=2026-04-11T00:05:00.000Z`,
      headers: {
        "content-type": "application/octet-stream",
      },
      payload: Buffer.from(
        [
          "account_code,account_name,period_start,period_end,debit,credit,currency_code,account_type",
          "1000,Cash,2026-03-01,2026-03-31,120.00,0.00,USD,asset",
          "2000,Accounts Payable,2026-03-01,2026-03-31,0.00,120.00,USD,liability",
        ].join("\n"),
      ),
    });
    const generalLedgerFile = await app.inject({
      method: "POST",
      url: `/sources/${source.source.id}/files?originalFileName=general-ledger.csv&mediaType=text%2Fcsv&createdBy=finance-operator&capturedAt=2026-04-11T00:10:00.000Z`,
      headers: {
        "content-type": "application/octet-stream",
      },
      payload: Buffer.from(
        [
          "journal_id,transaction_date,account_code,account_name,account_type,debit,credit,currency_code,memo",
          "J-100,2026-03-15,1000,Cash,asset,120.00,0.00,USD,Customer receipt",
          "J-100,2026-03-15,2000,Accounts Payable,liability,0.00,120.00,USD,Customer receipt",
        ].join("\n"),
      ),
    });

    expect(trialBalanceFile.statusCode).toBe(201);
    expect(generalLedgerFile.statusCode).toBe(201);

    const trialBalance = trialBalanceFile.json() as {
      sourceFile: { id: string };
    };
    const generalLedger = generalLedgerFile.json() as {
      sourceFile: { id: string };
    };

    const trialBalanceSyncResponse = await app.inject({
      method: "POST",
      url: `/finance-twin/companies/acme/source-files/${trialBalance.sourceFile.id}/sync`,
      payload: {
        companyName: "Acme Holdings",
      },
    });
    const generalLedgerSyncResponse = await app.inject({
      method: "POST",
      url: `/finance-twin/companies/acme/source-files/${generalLedger.sourceFile.id}/sync`,
      payload: {},
    });

    expect(trialBalanceSyncResponse.statusCode).toBe(201);
    expect(generalLedgerSyncResponse.statusCode).toBe(201);

    const reconciliationResponse = await app.inject({
      method: "GET",
      url: "/finance-twin/companies/acme/reconciliation/trial-balance-vs-general-ledger",
    });

    expect(reconciliationResponse.statusCode).toBe(200);
    expect(reconciliationResponse.json()).toMatchObject({
      company: {
        companyKey: "acme",
        displayName: "Acme Holdings",
      },
      sliceAlignment: {
        state: "shared_source",
        distinctSourceCount: 1,
        distinctSyncRunCount: 2,
        distinctSourceSnapshotCount: 2,
        sameSource: true,
        sameSyncRun: false,
        sameSourceSnapshot: false,
      },
      comparability: {
        state: "coverage_only",
        basis: "activity_window_only",
        windowRelation: "subset",
        reasonCode: "activity_window_subset",
        trialBalanceWindow: {
          periodStart: "2026-03-01",
          periodEnd: "2026-03-31",
        },
        sourceDeclaredGeneralLedgerPeriod: null,
        generalLedgerWindow: {
          earliestEntryDate: "2026-03-15",
          latestEntryDate: "2026-03-15",
        },
        sameSource: true,
      },
      coverageSummary: {
        accountRowCount: 2,
        presentInTrialBalanceCount: 2,
        presentInGeneralLedgerCount: 2,
        overlapCount: 2,
        trialBalanceOnlyCount: 0,
        generalLedgerOnlyCount: 0,
      },
      diagnostics: [
        "The latest successful trial-balance and general-ledger slices share one registered source, but span different uploaded file snapshots and sync runs. Under the current per-file upload flow, sameSourceSnapshot and sameSyncRun are diagnostic fields rather than expected positive comparison signals.",
      ],
      limitations: [
        "The current finance-twin surface covers deterministic trial-balance CSV, chart-of-accounts CSV, general-ledger CSV, bank-account-summary CSV, receivables-aging CSV, payables-aging CSV, contract-metadata CSV, and card-expense CSV extraction, plus additive summary, snapshot, bank-account inventory, cash-posture, receivables-aging, collections-posture, payables-aging, payables-posture, contract inventory, obligation-calendar, spend-item inventory, spend-posture, reconciliation, account-bridge, balance-bridge-prerequisites, period-context, source-backed general-ledger balance-proof, and balance-proof lineage drill read models.",
        "CFO Wiki, finance discovery answers, reports, monitoring, and close/control flows are not implemented in this slice.",
        "This route does not compute a balance variance because trial-balance ending balances are not equivalent to general-ledger activity totals.",
        "The observed general-ledger activity window fits inside the latest trial-balance reporting window, but the general-ledger slice does not include explicit source-declared period context.",
      ],
    });
  });

  it("GET /finance-twin/companies/:companyKey/reconciliation/trial-balance-vs-general-ledger/account-bridge returns matched-period bridge readiness and chart diagnostics", async () => {
    const app = await createTestApp(apps);
    const createSourceResponse = await app.inject({
      method: "POST",
      url: "/sources",
      payload: {
        kind: "dataset",
        name: "March close package with bridge diagnostics",
        createdBy: "finance-operator",
        snapshot: {
          originalFileName: "march-close-package-link.txt",
          mediaType: "text/plain",
          sizeBytes: 18,
          checksumSha256:
            "f333333333333333333333333333333333333333333333333333333333333333",
          storageKind: "external_url",
          storageRef: "https://example.com/march-close-package-bridge",
          capturedAt: "2026-04-11T00:00:00.000Z",
        },
      },
    });

    expect(createSourceResponse.statusCode).toBe(201);

    const source = createSourceResponse.json() as {
      source: { id: string };
    };
    const chartFileResponse = await app.inject({
      method: "POST",
      url: `/sources/${source.source.id}/files?originalFileName=chart-of-accounts.csv&mediaType=text%2Fcsv&createdBy=finance-operator&capturedAt=2026-04-11T00:02:00.000Z`,
      headers: {
        "content-type": "application/octet-stream",
      },
      payload: Buffer.from(
        [
          "account_code,account_name,account_type,detail_type,parent_account_code,is_active,description",
          "1000,Cash,asset,current_asset,,true,Operating cash",
          "2000,Accounts Payable,liability,current_liability,,true,Supplier balances",
          "3000,Archived Clearing,liability,current_liability,,false,Legacy clearing account",
        ].join("\n"),
      ),
    });
    const trialBalanceFileResponse = await app.inject({
      method: "POST",
      url: `/sources/${source.source.id}/files?originalFileName=trial-balance.csv&mediaType=text%2Fcsv&createdBy=finance-operator&capturedAt=2026-04-11T00:05:00.000Z`,
      headers: {
        "content-type": "application/octet-stream",
      },
      payload: Buffer.from(
        [
          "account_code,account_name,period_start,period_end,debit,credit,currency_code,account_type",
          "1000,Cash,2026-03-01,2026-03-31,120.00,0.00,USD,asset",
          "2000,Accounts Payable,2026-03-01,2026-03-31,0.00,90.00,USD,liability",
          "4000,Deferred Revenue,2026-03-01,2026-03-31,0.00,30.00,USD,liability",
        ].join("\n"),
      ),
    });
    const generalLedgerFileResponse = await app.inject({
      method: "POST",
      url: `/sources/${source.source.id}/files?originalFileName=general-ledger.csv&mediaType=text%2Fcsv&createdBy=finance-operator&capturedAt=2026-04-11T00:10:00.000Z`,
      headers: {
        "content-type": "application/octet-stream",
      },
      payload: Buffer.from(
        [
          "journal_id,transaction_date,period_start,period_end,period_key,account_code,account_name,account_type,debit,credit,currency_code,memo",
          "J-100,2026-03-15,2026-03-01,2026-03-31,2026-03,1000,Cash,asset,120.00,0.00,USD,Customer receipt",
          "J-100,2026-03-15,2026-03-01,2026-03-31,2026-03,3000,Archived Clearing,liability,0.00,50.00,USD,Customer receipt",
          "J-100,2026-03-15,2026-03-01,2026-03-31,2026-03,5000,Product Revenue,income,0.00,70.00,USD,Customer receipt",
        ].join("\n"),
      ),
    });

    expect(chartFileResponse.statusCode).toBe(201);
    expect(trialBalanceFileResponse.statusCode).toBe(201);
    expect(generalLedgerFileResponse.statusCode).toBe(201);

    const chartFile = chartFileResponse.json() as {
      sourceFile: { id: string };
    };
    const trialBalanceFile = trialBalanceFileResponse.json() as {
      sourceFile: { id: string };
    };
    const generalLedgerFile = generalLedgerFileResponse.json() as {
      sourceFile: { id: string };
    };

    const chartSyncResponse = await app.inject({
      method: "POST",
      url: `/finance-twin/companies/acme/source-files/${chartFile.sourceFile.id}/sync`,
      payload: {
        companyName: "Acme Holdings",
      },
    });
    const trialBalanceSyncResponse = await app.inject({
      method: "POST",
      url: `/finance-twin/companies/acme/source-files/${trialBalanceFile.sourceFile.id}/sync`,
      payload: {},
    });
    const generalLedgerSyncResponse = await app.inject({
      method: "POST",
      url: `/finance-twin/companies/acme/source-files/${generalLedgerFile.sourceFile.id}/sync`,
      payload: {},
    });

    expect(chartSyncResponse.statusCode).toBe(201);
    expect(trialBalanceSyncResponse.statusCode).toBe(201);
    expect(generalLedgerSyncResponse.statusCode).toBe(201);

    const generalLedgerSync = generalLedgerSyncResponse.json() as {
      syncRun: { id: string };
    };
    const accountBridgeResponse = await app.inject({
      method: "GET",
      url: "/finance-twin/companies/acme/reconciliation/trial-balance-vs-general-ledger/account-bridge",
    });

    expect(accountBridgeResponse.statusCode).toBe(200);

    const accountBridge = accountBridgeResponse.json() as {
      accounts: Array<{
        ledgerAccount: { accountCode: string; id: string };
        presentInChartOfAccounts: boolean;
        presentInTrialBalance: boolean;
        presentInGeneralLedger: boolean;
        trialBalanceOnly: boolean;
        generalLedgerOnly: boolean;
        missingFromChartOfAccounts: boolean;
        inactiveWithGeneralLedgerActivity: boolean;
        activityLineageRef: {
          ledgerAccountId: string;
          syncRunId: string;
        } | null;
      }>;
      limitations: string[];
    };
    const archivedClearingRow = accountBridge.accounts.find(
      (account) => account.ledgerAccount.accountCode === "3000",
    );
    const deferredRevenueRow = accountBridge.accounts.find(
      (account) => account.ledgerAccount.accountCode === "4000",
    );
    const productRevenueRow = accountBridge.accounts.find(
      (account) => account.ledgerAccount.accountCode === "5000",
    );

    expect(accountBridge).toMatchObject({
      company: {
        companyKey: "acme",
        displayName: "Acme Holdings",
      },
      bridgeReadiness: {
        state: "matched_period_ready",
        reasonCode: "account_bridge_matched_period_ready",
        basis: "source_declared_period",
        windowRelation: "exact_match",
        sameSource: true,
        sameSourceSnapshot: false,
        sameSyncRun: false,
        sharedSourceId: source.source.id,
      },
      coverageSummary: {
        accountRowCount: 5,
        presentInChartOfAccountsCount: 3,
        presentInTrialBalanceCount: 3,
        presentInGeneralLedgerCount: 3,
        overlapCount: 1,
        trialBalanceOnlyCount: 2,
        generalLedgerOnlyCount: 2,
        missingFromChartOfAccountsCount: 2,
        inactiveWithGeneralLedgerActivityCount: 1,
      },
      diagnostics: [
        "The latest successful trial-balance and general-ledger slices share one registered source, but span different uploaded file snapshots and sync runs. Under the current per-file upload flow, sameSourceSnapshot and sameSyncRun are diagnostic fields rather than expected positive comparison signals.",
      ],
      limitations: [
        "The current finance-twin surface covers deterministic trial-balance CSV, chart-of-accounts CSV, general-ledger CSV, bank-account-summary CSV, receivables-aging CSV, payables-aging CSV, contract-metadata CSV, and card-expense CSV extraction, plus additive summary, snapshot, bank-account inventory, cash-posture, receivables-aging, collections-posture, payables-aging, payables-posture, contract inventory, obligation-calendar, spend-item inventory, spend-posture, reconciliation, account-bridge, balance-bridge-prerequisites, period-context, source-backed general-ledger balance-proof, and balance-proof lineage drill read models.",
        "CFO Wiki, finance discovery answers, reports, monitoring, and close/control flows are not implemented in this slice.",
        "This route does not compute a direct account balance bridge or variance because trial-balance ending balances are not equivalent to general-ledger activity totals.",
      ],
    });
    expect(archivedClearingRow).toMatchObject({
      presentInChartOfAccounts: true,
      presentInTrialBalance: false,
      presentInGeneralLedger: true,
      generalLedgerOnly: true,
      inactiveWithGeneralLedgerActivity: true,
      activityLineageRef: {
        ledgerAccountId: archivedClearingRow?.ledgerAccount.id,
        syncRunId: generalLedgerSync.syncRun.id,
      },
    });
    expect(deferredRevenueRow).toMatchObject({
      presentInChartOfAccounts: false,
      presentInTrialBalance: true,
      presentInGeneralLedger: false,
      trialBalanceOnly: true,
      missingFromChartOfAccounts: true,
    });
    expect(productRevenueRow).toMatchObject({
      presentInChartOfAccounts: false,
      presentInTrialBalance: false,
      presentInGeneralLedger: true,
      generalLedgerOnly: true,
      missingFromChartOfAccounts: true,
      activityLineageRef: {
        ledgerAccountId: productRevenueRow?.ledgerAccount.id,
        syncRunId: generalLedgerSync.syncRun.id,
      },
    });

    const balanceBridgeResponse = await app.inject({
      method: "GET",
      url: "/finance-twin/companies/acme/reconciliation/trial-balance-vs-general-ledger/balance-bridge-prerequisites",
    });

    expect(balanceBridgeResponse.statusCode).toBe(200);

    const balanceBridge = balanceBridgeResponse.json() as {
      accounts: Array<{
        blockedReasonCode: string | null;
        balanceBridgePrereqReady: boolean;
        generalLedgerBalanceProof: {
          endingBalanceEvidencePresent: boolean;
          openingBalanceEvidencePresent: boolean;
          proofBasis: string;
        };
        ledgerAccount: { accountCode: string };
        matchedPeriodAccountBridgeReady: boolean;
      }>;
    };

    expect(balanceBridge).toMatchObject({
      accountBridgeReadiness: {
        state: "matched_period_ready",
        reasonCode: "account_bridge_matched_period_ready",
      },
      balanceBridgePrerequisites: {
        state: "not_prereq_ready",
        reasonCode: "balance_bridge_missing_balance_proof",
        basis: "source_declared_period",
        windowRelation: "exact_match",
        prerequisites: {
          hasSuccessfulTrialBalanceSlice: true,
          hasSuccessfulGeneralLedgerSlice: true,
          matchedPeriodAccountBridgeReady: true,
          anySourceBackedGeneralLedgerBalanceProof: false,
        },
      },
      coverageSummary: {
        matchedPeriodAccountBridgeReadyCount: 1,
        accountsWithOpeningBalanceProofCount: 0,
        accountsWithEndingBalanceProofCount: 0,
        accountsBlockedByMissingOverlapCount: 4,
        accountsBlockedByMissingBalanceProofCount: 1,
        prereqReadyAccountCount: 0,
      },
      diagnostics: [
        "The latest successful trial-balance and general-ledger slices share one registered source, but span different uploaded file snapshots and sync runs. Under the current per-file upload flow, sameSourceSnapshot and sameSyncRun are diagnostic fields rather than expected positive comparison signals.",
      ],
      limitations: [
        "The current finance-twin surface covers deterministic trial-balance CSV, chart-of-accounts CSV, general-ledger CSV, bank-account-summary CSV, receivables-aging CSV, payables-aging CSV, contract-metadata CSV, and card-expense CSV extraction, plus additive summary, snapshot, bank-account inventory, cash-posture, receivables-aging, collections-posture, payables-aging, payables-posture, contract inventory, obligation-calendar, spend-item inventory, spend-posture, reconciliation, account-bridge, balance-bridge-prerequisites, period-context, source-backed general-ledger balance-proof, and balance-proof lineage drill read models.",
        "CFO Wiki, finance discovery answers, reports, monitoring, and close/control flows are not implemented in this slice.",
        "This route does not compute a direct balance bridge or variance because trial-balance ending balances are not equivalent to general-ledger activity totals, and general-ledger activity totals do not prove opening or ending balances.",
        "Matched-period account overlap exists, but none of those accounts include source-backed general-ledger opening-balance or ending-balance proof in the persisted Finance Twin state, so this route stops at blocked prerequisites rather than inventing a balance bridge.",
      ],
    });
    expect(
      balanceBridge.accounts.find(
        (account) => account.ledgerAccount.accountCode === "1000",
      ),
    ).toMatchObject({
      matchedPeriodAccountBridgeReady: true,
      balanceBridgePrereqReady: false,
      blockedReasonCode: "balance_bridge_missing_balance_proof",
      generalLedgerBalanceProof: {
        proofBasis: "activity_only_no_balance_proof",
        openingBalanceEvidencePresent: false,
        endingBalanceEvidencePresent: false,
      },
    });
    expect(
      balanceBridge.accounts.find(
        (account) => account.ledgerAccount.accountCode === "4000",
      ),
    ).toMatchObject({
      matchedPeriodAccountBridgeReady: false,
      balanceBridgePrereqReady: false,
      blockedReasonCode: "balance_bridge_missing_general_ledger_overlap",
    });
    expect(
      balanceBridge.accounts.find(
        (account) => account.ledgerAccount.accountCode === "5000",
      ),
    ).toMatchObject({
      matchedPeriodAccountBridgeReady: false,
      balanceBridgePrereqReady: false,
      blockedReasonCode: "balance_bridge_missing_trial_balance_overlap",
    });
  });

  it("GET /finance-twin/companies/:companyKey/general-ledger/accounts/:ledgerAccountId/balance-proof returns persisted proof and lineage without guessing target ids", async () => {
    const app = await createTestApp(apps);
    const createSourceResponse = await app.inject({
      method: "POST",
      url: "/sources",
      payload: {
        kind: "dataset",
        name: "March close package with explicit balance proof",
        createdBy: "finance-operator",
        snapshot: {
          originalFileName: "march-close-package-link.txt",
          mediaType: "text/plain",
          sizeBytes: 18,
          checksumSha256:
            "abababababababababababababababababababababababababababababababab",
          storageKind: "external_url",
          storageRef: "https://example.com/march-close-package-balance-proof",
          capturedAt: "2026-04-12T00:00:00.000Z",
        },
      },
    });
    const created = createSourceResponse.json() as { source: { id: string } };

    async function uploadFinanceFile(input: {
      capturedAt: string;
      originalFileName: string;
      uploadText: string;
    }) {
      const response = await app.inject({
        method: "POST",
        url: `/sources/${created.source.id}/files?${new URLSearchParams({
          capturedAt: input.capturedAt,
          createdBy: "finance-operator",
          mediaType: "text/csv",
          originalFileName: input.originalFileName,
        }).toString()}`,
        headers: {
          "content-type": "application/octet-stream",
        },
        payload: Buffer.from(`${input.uploadText}\n`, "utf8"),
      });

      expect(response.statusCode).toBe(201);
      return response.json() as { sourceFile: { id: string } };
    }

    const chartFile = await uploadFinanceFile({
      capturedAt: "2026-04-12T00:02:00.000Z",
      originalFileName: "chart-of-accounts.csv",
      uploadText: [
        "account_code,account_name,account_type,detail_type,parent_account_code,is_active,description",
        "1000,Cash,asset,current_asset,,true,Operating cash",
        "2000,Accounts Payable,liability,current_liability,,true,Supplier balances",
      ].join("\n"),
    });
    const trialBalanceFile = await uploadFinanceFile({
      capturedAt: "2026-04-12T00:05:00.000Z",
      originalFileName: "trial-balance.csv",
      uploadText: [
        "account_code,account_name,period_start,period_end,debit,credit,currency_code,account_type",
        "1000,Cash,2026-03-01,2026-03-31,150.00,0.00,USD,asset",
        "2000,Accounts Payable,2026-03-01,2026-03-31,0.00,150.00,USD,liability",
      ].join("\n"),
    });
    const generalLedgerFile = await uploadFinanceFile({
      capturedAt: "2026-04-12T00:10:00.000Z",
      originalFileName: "general-ledger.csv",
      uploadText: [
        "journal_id,transaction_date,period_start,period_end,period_key,account_code,account_name,account_type,debit,credit,opening_balance,closing_balance,currency_code,memo",
        "J-100,2026-03-15,2026-03-01,2026-03-31,2026-03,1000,Cash,asset,150.00,0.00,30.00,180.00,USD,Customer receipt",
        "J-100,2026-03-15,2026-03-01,2026-03-31,2026-03,5000,Product Revenue,income,0.00,150.00,,,USD,Customer receipt",
      ].join("\n"),
    });

    await app.inject({
      method: "POST",
      url: `/finance-twin/companies/acme/source-files/${chartFile.sourceFile.id}/sync`,
      payload: {
        companyName: "Acme Holdings",
      },
    });
    await app.inject({
      method: "POST",
      url: `/finance-twin/companies/acme/source-files/${trialBalanceFile.sourceFile.id}/sync`,
      payload: {},
    });
    const generalLedgerSyncResponse = await app.inject({
      method: "POST",
      url: `/finance-twin/companies/acme/source-files/${generalLedgerFile.sourceFile.id}/sync`,
      payload: {},
    });
    expect(generalLedgerSyncResponse.statusCode).toBe(201);
    const generalLedgerSync = generalLedgerSyncResponse.json() as {
      syncRun: { id: string };
    };

    const balanceBridgeResponse = await app.inject({
      method: "GET",
      url: "/finance-twin/companies/acme/reconciliation/trial-balance-vs-general-ledger/balance-bridge-prerequisites",
    });
    expect(balanceBridgeResponse.statusCode).toBe(200);
    const balanceBridge = balanceBridgeResponse.json() as {
      accounts: Array<{
        balanceProofLineageRef: {
          syncRunId: string;
          targetId: string;
          targetKind: string;
        } | null;
        ledgerAccount: { accountCode: string; id: string };
      }>;
    };
    const cashRow = balanceBridge.accounts.find(
      (account) => account.ledgerAccount.accountCode === "1000",
    );

    expect(cashRow?.balanceProofLineageRef).toMatchObject({
      targetKind: "general_ledger_balance_proof",
      syncRunId: generalLedgerSync.syncRun.id,
      targetId: expect.any(String),
    });

    const balanceProofResponse = await app.inject({
      method: "GET",
      url: `/finance-twin/companies/acme/general-ledger/accounts/${cashRow?.ledgerAccount.id ?? ""}/balance-proof`,
    });

    expect(balanceProofResponse.statusCode).toBe(200);
    expect(balanceProofResponse.json()).toMatchObject({
      target: {
        ledgerAccountId: cashRow?.ledgerAccount.id,
        syncRunId: generalLedgerSync.syncRun.id,
      },
      proof: {
        record: {
          ledgerAccountId: cashRow?.ledgerAccount.id,
          openingBalanceAmount: "30.00",
          endingBalanceAmount: "180.00",
          openingBalanceSourceColumn: "opening_balance",
          endingBalanceSourceColumn: "closing_balance",
        },
        balanceProof: {
          proofBasis: "source_backed_balance_field",
          proofSource:
            "Opening balance came from the explicit opening_balance column on row 2. Ending balance came from the explicit closing_balance column on row 2.",
          reasonCode: "source_backed_opening_and_ending_balance_proof",
        },
        lineageRef: cashRow?.balanceProofLineageRef,
      },
      lineage: {
        target: cashRow?.balanceProofLineageRef,
        recordCount: 1,
        records: [
          {
            syncRun: {
              extractorKey: "general_ledger_csv",
              id: generalLedgerSync.syncRun.id,
            },
            sourceFile: {
              originalFileName: "general-ledger.csv",
            },
          },
        ],
      },
      diagnostics: [],
      limitations: expect.arrayContaining([
        "This route returns persisted balance-proof rows and lineage only; it does not compute a balance bridge or variance.",
      ]),
    });

    const balanceProof = balanceProofResponse.json() as {
      proof: {
        lineageRef: {
          syncRunId: string;
          targetId: string;
        };
      } | null;
    };
    const proofLineageResponse = await app.inject({
      method: "GET",
      url: `/finance-twin/companies/acme/lineage/general_ledger_balance_proof/${balanceProof.proof?.lineageRef.targetId ?? ""}?${new URLSearchParams(
        {
          syncRunId: balanceProof.proof?.lineageRef.syncRunId ?? "",
        },
      ).toString()}`,
    });

    expect(proofLineageResponse.statusCode).toBe(200);
    expect(proofLineageResponse.json()).toMatchObject({
      target: {
        targetKind: "general_ledger_balance_proof",
        targetId: balanceProof.proof?.lineageRef.targetId,
        syncRunId: balanceProof.proof?.lineageRef.syncRunId,
      },
      recordCount: 1,
      records: [
        {
          syncRun: {
            extractorKey: "general_ledger_csv",
            id: generalLedgerSync.syncRun.id,
          },
          sourceFile: {
            originalFileName: "general-ledger.csv",
          },
        },
      ],
    });
  });

  it("GET /missions returns newest-first mission summaries with the list contract", async () => {
    const app = await createTestApp(apps);
    const older = await createMission(app, {
      text: "First mission summary",
      requestedBy: "operator",
    });
    const newer = await createMission(app, {
      requestedBy: "operator",
      sourceKind: "github_issue",
      sourceRef: "https://github.com/acme/web/issues/19",
      text: "Second mission summary",
    });

    const response = await app.inject({
      method: "GET",
      url: "/missions",
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      filters: {
        limit: 20,
        sourceKind: null,
        status: null,
      },
      missions: [
        {
          id: newer.mission.id,
          latestTask: {
            role: "executor",
            sequence: 1,
            status: "pending",
          },
          objectiveExcerpt: "Second mission summary",
          pendingApprovalCount: 0,
          proofBundleStatus: "placeholder",
          sourceKind: "github_issue",
          sourceRef: "https://github.com/acme/web/issues/19",
          status: "queued",
          title: "Second mission summary",
        },
        {
          id: older.mission.id,
          latestTask: {
            role: "executor",
            sequence: 1,
            status: "pending",
          },
          objectiveExcerpt: "First mission summary",
          pendingApprovalCount: 0,
          proofBundleStatus: "placeholder",
          sourceKind: "manual_text",
          sourceRef: null,
          status: "queued",
          title: "First mission summary",
        },
      ],
    });
  });

  it("GET /missions/:missionId returns mission metadata, approvals, artifacts, and the proof bundle placeholder", async () => {
    const app = await createTestApp(apps);
    const created = await createMission(app);

    const response = await app.inject({
      method: "GET",
      url: `/missions/${created.mission.id}`,
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      mission: {
        id: created.mission.id,
        status: "queued",
        title: "Implement passkeys for sign-in",
      },
      tasks: [
        { sequence: 0, role: "planner" },
        { sequence: 1, role: "executor" },
      ],
      proofBundle: {
        missionId: created.mission.id,
        status: "placeholder",
      },
      approvals: [],
      approvalCards: [],
      artifacts: [
        {
          kind: "proof_bundle_manifest",
        },
      ],
      liveControl: {
        enabled: false,
        limitation: "single_process_only",
        mode: "api_only",
      },
    });
  });

  it("GET /missions/:missionId returns summary-shaped approvals and artifacts in the mission detail read model", async () => {
    const app = await createStubApp(apps, {
      missionService: {
        async createDiscovery() {
          throw new Error("create should not be called");
        },
        async createFromText() {
          throw new Error("create should not be called");
        },
        async getMissionDetail() {
          return {
            mission: {
              createdAt: "2026-03-14T10:00:00.000Z",
              createdBy: "operator",
              id: unknownMissionId,
              objective: "Ship passkeys without breaking email login.",
              primaryRepo: "web",
              sourceKind: "manual_text",
              sourceRef: null,
              spec: {
                acceptance: ["Ship passkeys without breaking email login."],
                constraints: {
                  allowedPaths: [],
                  mustNot: [],
                },
                deliverables: [
                  "Updated mission detail route with approvals and artifacts.",
                ],
                evidenceRequirements: ["approval ledger", "artifact ledger"],
                objective: "Ship passkeys without breaking email login.",
                repos: ["web"],
                riskBudget: {
                  allowNetwork: false,
                  maxCostUsd: 5,
                  maxWallClockMinutes: 30,
                  requiresHumanApprovalFor: [],
                  sandboxMode: "patch-only",
                },
                title: "Implement passkeys for sign-in",
                type: "build",
              },
              status: "running",
              title: "Implement passkeys for sign-in",
              type: "build",
              updatedAt: "2026-03-14T10:05:00.000Z",
            },
            tasks: [
              {
                attemptCount: 1,
                codexThreadId: "thread_live_1",
                codexTurnId: "turn_live_1",
                createdAt: "2026-03-14T10:00:00.000Z",
                dependsOnTaskId: null,
                id: unknownTaskId,
                missionId: unknownMissionId,
                role: "executor",
                sequence: 1,
                status: "running",
                summary: "Applying runtime diff summary placeholders",
                updatedAt: "2026-03-14T10:05:00.000Z",
                workspaceId: null,
              },
            ],
            proofBundle: {
              ...buildProofBundleFixture({
                artifactIds: ["77777777-7777-4777-8777-777777777777"],
                artifacts: [
                  {
                    id: "77777777-7777-4777-8777-777777777777",
                    kind: "diff_summary",
                  },
                ],
                changeSummary:
                  "Updated the mission detail read model for approvals and artifacts.",
                decisionTrace: [
                  "Executor task 1 produced diff_summary artifact 77777777-7777-4777-8777-777777777777.",
                ],
                evidenceCompleteness: {
                  status: "partial",
                  expectedArtifactKinds: [
                    "plan",
                    "diff_summary",
                    "test_report",
                    "pr_link",
                  ],
                  presentArtifactKinds: ["diff_summary"],
                  missingArtifactKinds: ["plan", "test_report", "pr_link"],
                  notes: [
                    "Planner evidence is missing.",
                    "Validation evidence is missing.",
                    "GitHub pull request evidence is missing.",
                  ],
                },
                latestApproval: {
                  createdAt: "2026-03-14T10:01:00.000Z",
                  id: "44444444-4444-4444-8444-444444444444",
                  kind: "file_change",
                  rationale: null,
                  requestedBy: "system",
                  resolvedBy: null,
                  status: "pending",
                  updatedAt: "2026-03-14T10:01:00.000Z",
                },
                replayEventCount: 12,
                riskSummary:
                  "Action controls still require embedded-worker mode.",
                status: "incomplete",
                timestamps: {
                  missionCreatedAt: "2026-03-14T10:00:00.000Z",
                  latestPlannerEvidenceAt: null,
                  latestExecutorEvidenceAt: "2026-03-14T10:04:00.000Z",
                  latestPullRequestAt: null,
                  latestApprovalAt: "2026-03-14T10:01:00.000Z",
                  latestArtifactAt: "2026-03-14T10:04:00.000Z",
                },
                validationSummary:
                  "Pending local executor validation evidence.",
                verificationSummary:
                  "A runtime approval is still pending, so the proof bundle is not final yet.",
              }),
            },
            approvals: [
              {
                createdAt: "2026-03-14T10:01:00.000Z",
                id: "44444444-4444-4444-8444-444444444444",
                kind: "file_change",
                rationale: null,
                requestedBy: "system",
                resolvedBy: null,
                status: "pending",
                updatedAt: "2026-03-14T10:01:00.000Z",
              },
            ],
            approvalCards: [
              {
                actionHint:
                  "Review the requested file-edit scope, then approve only if this task should change those files.",
                approvalId: "44444444-4444-4444-8444-444444444444",
                kind: "file_change",
                requestedAt: "2026-03-14T10:01:00.000Z",
                requestedBy: "system",
                repoContext: {
                  repoLabel: "web",
                  branchName: null,
                  pullRequestNumber: null,
                  pullRequestUrl: null,
                },
                resolutionSummary: null,
                resolvedAt: null,
                resolvedBy: null,
                status: "pending",
                summary:
                  "Allow file edits in the task workspace. Why it matters: the runtime needs workspace write access to continue.",
                task: {
                  id: unknownTaskId,
                  label: "Task 1 · executor",
                  role: "executor",
                  sequence: 1,
                },
                title: "Approve workspace file changes",
              },
            ],
            artifacts: [
              {
                createdAt: "2026-03-14T10:00:00.000Z",
                id: "66666666-6666-4666-8666-666666666666",
                kind: "proof_bundle_manifest",
                summary: "Proof bundle ready with 2 linked artifacts.",
                taskId: null,
                uri: "pocket-cto://missions/11111111-1111-4111-8111-111111111111/proof-bundle-manifest",
              },
              {
                createdAt: "2026-03-14T10:04:00.000Z",
                id: "77777777-7777-4777-8777-777777777777",
                kind: "diff_summary",
                summary:
                  "Workspace changes touched apps/web and apps/control-plane.",
                taskId: unknownTaskId,
                uri: "pocket-cto://missions/11111111-1111-4111-8111-111111111111/tasks/33333333-3333-4333-8333-333333333333/diff-summary",
              },
            ],
            discoveryAnswer: null,
            liveControl: {
              enabled: false,
              limitation: "single_process_only",
              mode: "api_only",
            },
          };
        },
      },
      operatorControl: {
        approvalService: {
          async listMissionApprovals() {
            return [];
          },
          async resolveApproval() {
            throw new Error("resolve should not be called");
          },
        },
        liveControl: {
          enabled: true,
          limitation: "single_process_only",
          mode: "embedded_worker",
        },
        runtimeControlService: {
          async interruptActiveTurn() {
            throw new Error("interrupt should not be called");
          },
        },
      },
    });

    const response = await app.inject({
      method: "GET",
      url: `/missions/${unknownMissionId}`,
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      mission: {
        createdAt: "2026-03-14T10:00:00.000Z",
        createdBy: "operator",
        id: unknownMissionId,
        objective: "Ship passkeys without breaking email login.",
        primaryRepo: "web",
        sourceKind: "manual_text",
        sourceRef: null,
        spec: {
          acceptance: ["Ship passkeys without breaking email login."],
          constraints: {
            allowedPaths: [],
            mustNot: [],
          },
          deliverables: [
            "Updated mission detail route with approvals and artifacts.",
          ],
          evidenceRequirements: ["approval ledger", "artifact ledger"],
          objective: "Ship passkeys without breaking email login.",
          repos: ["web"],
          riskBudget: {
            allowNetwork: false,
            maxCostUsd: 5,
            maxWallClockMinutes: 30,
            requiresHumanApprovalFor: [],
            sandboxMode: "patch-only",
          },
          title: "Implement passkeys for sign-in",
          type: "build",
        },
        status: "running",
        title: "Implement passkeys for sign-in",
        type: "build",
        updatedAt: "2026-03-14T10:05:00.000Z",
      },
      tasks: [
        {
          attemptCount: 1,
          codexThreadId: "thread_live_1",
          codexTurnId: "turn_live_1",
          createdAt: "2026-03-14T10:00:00.000Z",
          dependsOnTaskId: null,
          id: unknownTaskId,
          missionId: unknownMissionId,
          role: "executor",
          sequence: 1,
          status: "running",
          summary: "Applying runtime diff summary placeholders",
          updatedAt: "2026-03-14T10:05:00.000Z",
          workspaceId: null,
        },
      ],
      proofBundle: {
        ...buildProofBundleFixture({
          artifactIds: ["77777777-7777-4777-8777-777777777777"],
          artifacts: [
            {
              id: "77777777-7777-4777-8777-777777777777",
              kind: "diff_summary",
            },
          ],
          changeSummary:
            "Updated the mission detail read model for approvals and artifacts.",
          decisionTrace: [
            "Executor task 1 produced diff_summary artifact 77777777-7777-4777-8777-777777777777.",
          ],
          evidenceCompleteness: {
            status: "partial",
            expectedArtifactKinds: [
              "plan",
              "diff_summary",
              "test_report",
              "pr_link",
            ],
            presentArtifactKinds: ["diff_summary"],
            missingArtifactKinds: ["plan", "test_report", "pr_link"],
            notes: [
              "Planner evidence is missing.",
              "Validation evidence is missing.",
              "GitHub pull request evidence is missing.",
            ],
          },
          latestApproval: {
            createdAt: "2026-03-14T10:01:00.000Z",
            id: "44444444-4444-4444-8444-444444444444",
            kind: "file_change",
            rationale: null,
            requestedBy: "system",
            resolvedBy: null,
            status: "pending",
            updatedAt: "2026-03-14T10:01:00.000Z",
          },
          replayEventCount: 12,
          riskSummary: "Action controls still require embedded-worker mode.",
          status: "incomplete",
          timestamps: {
            missionCreatedAt: "2026-03-14T10:00:00.000Z",
            latestPlannerEvidenceAt: null,
            latestExecutorEvidenceAt: "2026-03-14T10:04:00.000Z",
            latestPullRequestAt: null,
            latestApprovalAt: "2026-03-14T10:01:00.000Z",
            latestArtifactAt: "2026-03-14T10:04:00.000Z",
          },
          validationSummary: "Pending local executor validation evidence.",
          verificationSummary:
            "A runtime approval is still pending, so the proof bundle is not final yet.",
        }),
      },
      approvals: [
        {
          createdAt: "2026-03-14T10:01:00.000Z",
          id: "44444444-4444-4444-8444-444444444444",
          kind: "file_change",
          rationale: null,
          requestedBy: "system",
          resolvedBy: null,
          status: "pending",
          updatedAt: "2026-03-14T10:01:00.000Z",
        },
      ],
      approvalCards: [
        {
          actionHint:
            "Review the requested file-edit scope, then approve only if this task should change those files.",
          approvalId: "44444444-4444-4444-8444-444444444444",
          kind: "file_change",
          requestedAt: "2026-03-14T10:01:00.000Z",
          requestedBy: "system",
          repoContext: {
            repoLabel: "web",
            branchName: null,
            pullRequestNumber: null,
            pullRequestUrl: null,
          },
          resolutionSummary: null,
          resolvedAt: null,
          resolvedBy: null,
          status: "pending",
          summary:
            "Allow file edits in the task workspace. Why it matters: the runtime needs workspace write access to continue.",
          task: {
            id: unknownTaskId,
            label: "Task 1 · executor",
            role: "executor",
            sequence: 1,
          },
          title: "Approve workspace file changes",
        },
      ],
      artifacts: [
        {
          createdAt: "2026-03-14T10:00:00.000Z",
          id: "66666666-6666-4666-8666-666666666666",
          kind: "proof_bundle_manifest",
          summary: "Proof bundle ready with 2 linked artifacts.",
          taskId: null,
          uri: "pocket-cto://missions/11111111-1111-4111-8111-111111111111/proof-bundle-manifest",
        },
        {
          createdAt: "2026-03-14T10:04:00.000Z",
          id: "77777777-7777-4777-8777-777777777777",
          kind: "diff_summary",
          summary: "Workspace changes touched apps/web and apps/control-plane.",
          taskId: unknownTaskId,
          uri: "pocket-cto://missions/11111111-1111-4111-8111-111111111111/tasks/33333333-3333-4333-8333-333333333333/diff-summary",
        },
      ],
      discoveryAnswer: null,
      liveControl: {
        enabled: true,
        limitation: "single_process_only",
        mode: "embedded_worker",
      },
    });
  });

  it("GET /missions/:missionId returns 400 for an invalid mission id", async () => {
    const app = await createTestApp(apps);

    const response = await app.inject({
      method: "GET",
      url: "/missions/not-a-uuid",
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({
      error: {
        code: "invalid_request",
        message: "Invalid request",
        details: [
          {
            path: "missionId",
            message: "Invalid uuid",
          },
        ],
      },
    });
  });

  it("GET /missions/:missionId returns 404 for an unknown mission id", async () => {
    const app = await createTestApp(apps);

    const response = await app.inject({
      method: "GET",
      url: `/missions/${unknownMissionId}`,
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({
      error: {
        code: "mission_not_found",
        message: "Mission not found",
      },
    });
  });

  it("GET /github/installations returns 503 when the GitHub App is unconfigured", async () => {
    const app = await createTestApp(apps);

    const response = await app.inject({
      method: "GET",
      url: "/github/installations",
    });

    expect(response.statusCode).toBe(503);
    expect(response.json()).toEqual({
      error: {
        code: "github_app_not_configured",
        message: "GitHub App credentials are not configured",
        details: [
          {
            path: "GITHUB_APP_ID",
            message: "Missing required GitHub App env var",
          },
          {
            path: "GITHUB_APP_PRIVATE_KEY_BASE64",
            message: "Missing required GitHub App env var",
          },
        ],
      },
    });
  });

  it("GET /github/installations returns persisted installation summaries when configured", async () => {
    const app = await createStubApp(apps, {
      githubAppService: {
        async listInstallations() {
          return [
            {
              id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
              installationId: "12345",
              appId: "98765",
              accountLogin: "616xold",
              accountType: "Organization",
              targetType: "Organization",
              targetId: "6161234",
              suspendedAt: null,
              permissions: {
                metadata: "read",
              },
              lastSyncedAt: "2026-03-15T10:00:00.000Z",
              createdAt: "2026-03-15T10:00:00.000Z",
              updatedAt: "2026-03-15T10:00:00.000Z",
            },
          ];
        },
        async syncInstallations() {
          throw new Error("sync should not be called");
        },
      },
    });

    const response = await app.inject({
      method: "GET",
      url: "/github/installations",
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      installations: [
        {
          id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
          installationId: "12345",
          appId: "98765",
          accountLogin: "616xold",
          accountType: "Organization",
          targetType: "Organization",
          targetId: "6161234",
          suspendedAt: null,
          permissions: {
            metadata: "read",
          },
          lastSyncedAt: "2026-03-15T10:00:00.000Z",
          createdAt: "2026-03-15T10:00:00.000Z",
          updatedAt: "2026-03-15T10:00:00.000Z",
        },
      ],
    });
  });

  it("POST /github/installations/sync returns 503 when the GitHub App is unconfigured", async () => {
    const app = await createTestApp(apps);

    const response = await app.inject({
      method: "POST",
      url: "/github/installations/sync",
    });

    expect(response.statusCode).toBe(503);
    expect(response.json()).toEqual({
      error: {
        code: "github_app_not_configured",
        message: "GitHub App credentials are not configured",
        details: [
          {
            path: "GITHUB_APP_ID",
            message: "Missing required GitHub App env var",
          },
          {
            path: "GITHUB_APP_PRIVATE_KEY_BASE64",
            message: "Missing required GitHub App env var",
          },
        ],
      },
    });
  });

  it("POST /github/installations/sync delegates to the GitHub App service when configured", async () => {
    const app = await createStubApp(apps, {
      githubAppService: {
        async listInstallations() {
          return [];
        },
        async syncInstallations() {
          return {
            installations: [
              {
                id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
                installationId: "12345",
                appId: "98765",
                accountLogin: "616xold",
                accountType: "Organization",
                targetType: "Organization",
                targetId: "6161234",
                suspendedAt: null,
                permissions: {
                  metadata: "read",
                },
                lastSyncedAt: "2026-03-15T10:00:00.000Z",
                createdAt: "2026-03-15T10:00:00.000Z",
                updatedAt: "2026-03-15T10:00:00.000Z",
              },
            ],
            syncedAt: "2026-03-15T10:00:00.000Z",
            syncedCount: 1,
          };
        },
      },
    });

    const response = await app.inject({
      method: "POST",
      url: "/github/installations/sync",
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      installations: [
        {
          id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
          installationId: "12345",
          appId: "98765",
          accountLogin: "616xold",
          accountType: "Organization",
          targetType: "Organization",
          targetId: "6161234",
          suspendedAt: null,
          permissions: {
            metadata: "read",
          },
          lastSyncedAt: "2026-03-15T10:00:00.000Z",
          createdAt: "2026-03-15T10:00:00.000Z",
          updatedAt: "2026-03-15T10:00:00.000Z",
        },
      ],
      syncedAt: "2026-03-15T10:00:00.000Z",
      syncedCount: 1,
    });
  });

  it("GET /github/repositories returns 503 when the GitHub App is unconfigured", async () => {
    const app = await createTestApp(apps);

    const response = await app.inject({
      method: "GET",
      url: "/github/repositories",
    });

    expect(response.statusCode).toBe(503);
    expect(response.json()).toEqual({
      error: {
        code: "github_app_not_configured",
        message: "GitHub App credentials are not configured",
        details: [
          {
            path: "GITHUB_APP_ID",
            message: "Missing required GitHub App env var",
          },
          {
            path: "GITHUB_APP_PRIVATE_KEY_BASE64",
            message: "Missing required GitHub App env var",
          },
        ],
      },
    });
  });

  it("GET /github/intake/issues returns summary-shaped issue intake items", async () => {
    const app = await createStubApp(apps, {
      githubIssueIntakeService: {
        async listIssues() {
          return {
            issues: [
              {
                deliveryId: "delivery-issue-42",
                repoFullName: "acme/web",
                issueNumber: 42,
                issueTitle: "Ship issue intake",
                issueState: "open",
                senderLogin: "octo-operator",
                sourceRef: "https://github.com/acme/web/issues/42",
                receivedAt: "2026-03-16T01:55:00.000Z",
                commentCount: 2,
                hasCommentActivity: true,
                isBound: true,
                boundMissionId: unknownMissionId,
                boundMissionStatus: "queued",
              },
            ],
          };
        },
      },
    });

    const response = await app.inject({
      method: "GET",
      url: "/github/intake/issues",
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      issues: [
        {
          deliveryId: "delivery-issue-42",
          repoFullName: "acme/web",
          issueNumber: 42,
          issueTitle: "Ship issue intake",
          issueState: "open",
          senderLogin: "octo-operator",
          sourceRef: "https://github.com/acme/web/issues/42",
          receivedAt: "2026-03-16T01:55:00.000Z",
          commentCount: 2,
          hasCommentActivity: true,
          isBound: true,
          boundMissionId: unknownMissionId,
          boundMissionStatus: "queued",
        },
      ],
    });
  });

  it("POST /github/intake/issues/:deliveryId/create-mission returns an explicit conflict for non-issue deliveries", async () => {
    const app = await createStubApp(apps, {
      githubIssueIntakeService: {
        async createMissionFromDelivery(deliveryId: string) {
          throw new GitHubIssueIntakeNonIssueDeliveryError(
            deliveryId,
            "issue_comment",
            "issue_comment_envelope_recorded",
          );
        },
      },
    });

    const response = await app.inject({
      method: "POST",
      url: "/github/intake/issues/delivery-comment/create-mission",
    });

    expect(response.statusCode).toBe(409);
    expect(response.json()).toEqual({
      error: {
        code: "github_issue_intake_non_issue_delivery",
        message: "GitHub delivery is not a persisted issues envelope",
      },
    });
  });

  it("GET /github/repositories returns repository summaries when configured", async () => {
    const app = await createStubApp(apps, {
      githubAppService: {
        async listRepositories() {
          return {
            repositories: [
              {
                id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
                installationId: "12345",
                githubRepositoryId: "100",
                fullName: "616xold/pocket-cto",
                ownerLogin: "616xold",
                name: "pocket-cto",
                defaultBranch: "main",
                visibility: "private",
                archived: false,
                disabled: false,
                isActive: true,
                language: "TypeScript",
                lastSyncedAt: "2026-03-15T10:00:00.000Z",
                removedFromInstallationAt: null,
                updatedAt: "2026-03-15T10:00:00.000Z",
              },
            ],
          };
        },
      },
    });

    const response = await app.inject({
      method: "GET",
      url: "/github/repositories",
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      repositories: [
        {
          id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
          installationId: "12345",
          githubRepositoryId: "100",
          fullName: "616xold/pocket-cto",
          ownerLogin: "616xold",
          name: "pocket-cto",
          defaultBranch: "main",
          visibility: "private",
          archived: false,
          disabled: false,
          isActive: true,
          language: "TypeScript",
          lastSyncedAt: "2026-03-15T10:00:00.000Z",
          removedFromInstallationAt: null,
          updatedAt: "2026-03-15T10:00:00.000Z",
        },
      ],
    });
  });

  it("GET /github/repositories/:owner/:repo returns one repository with write readiness", async () => {
    const app = await createStubApp(apps, {
      githubAppService: {
        async getRepository() {
          return {
            repository: {
              id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
              installationId: "12345",
              githubRepositoryId: "100",
              fullName: "616xold/pocket-cto",
              ownerLogin: "616xold",
              name: "pocket-cto",
              defaultBranch: "main",
              visibility: "private",
              archived: true,
              disabled: false,
              isActive: true,
              language: "TypeScript",
              lastSyncedAt: "2026-03-15T10:00:00.000Z",
              removedFromInstallationAt: null,
              updatedAt: "2026-03-15T10:00:00.000Z",
            },
            writeReadiness: {
              ready: false,
              failureCode: "archived",
            },
          };
        },
      },
    });

    const response = await app.inject({
      method: "GET",
      url: "/github/repositories/616xold/pocket-cto",
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      repository: {
        id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
        installationId: "12345",
        githubRepositoryId: "100",
        fullName: "616xold/pocket-cto",
        ownerLogin: "616xold",
        name: "pocket-cto",
        defaultBranch: "main",
        visibility: "private",
        archived: true,
        disabled: false,
        isActive: true,
        language: "TypeScript",
        lastSyncedAt: "2026-03-15T10:00:00.000Z",
        removedFromInstallationAt: null,
        updatedAt: "2026-03-15T10:00:00.000Z",
      },
      writeReadiness: {
        ready: false,
        failureCode: "archived",
      },
    });
  });

  it("GET /github/repositories/:owner/:repo returns 404 for an unknown repository", async () => {
    const app = await createStubApp(apps, {
      githubAppService: {
        async getRepository() {
          throw new GitHubRepositoryNotFoundError("616xold/missing");
        },
      },
    });

    const response = await app.inject({
      method: "GET",
      url: "/github/repositories/616xold/missing",
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({
      error: {
        code: "github_repository_not_found",
        message: "GitHub repository not found",
      },
    });
  });

  it("GET /github/installations/:installationId/repositories returns 404 for an unknown installation", async () => {
    const app = await createStubApp(apps, {
      githubAppService: {
        async listInstallationRepositories() {
          throw new GitHubInstallationNotFoundError("99999");
        },
      },
    });

    const response = await app.inject({
      method: "GET",
      url: "/github/installations/99999/repositories",
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({
      error: {
        code: "github_installation_not_found",
        message: "GitHub installation not found",
      },
    });
  });

  it("GET /github/installations/:installationId/repositories returns installation-scoped repository summaries", async () => {
    const app = await createStubApp(apps, {
      githubAppService: {
        async listInstallationRepositories() {
          return {
            installation: {
              id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
              installationId: "12345",
              appId: "98765",
              accountLogin: "616xold",
              accountType: "Organization",
              targetType: "Organization",
              targetId: "6161234",
              suspendedAt: null,
              permissions: {
                metadata: "read",
              },
              lastSyncedAt: "2026-03-15T10:00:00.000Z",
              createdAt: "2026-03-15T10:00:00.000Z",
              updatedAt: "2026-03-15T10:00:00.000Z",
            },
            repositories: [
              {
                id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
                installationId: "12345",
                githubRepositoryId: "100",
                fullName: "616xold/pocket-cto",
                ownerLogin: "616xold",
                name: "pocket-cto",
                defaultBranch: "main",
                visibility: "private",
                archived: false,
                disabled: false,
                isActive: true,
                language: "TypeScript",
                lastSyncedAt: "2026-03-15T10:00:00.000Z",
                removedFromInstallationAt: null,
                updatedAt: "2026-03-15T10:00:00.000Z",
              },
            ],
          };
        },
      },
    });

    const response = await app.inject({
      method: "GET",
      url: "/github/installations/12345/repositories",
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      installation: {
        id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
        installationId: "12345",
        appId: "98765",
        accountLogin: "616xold",
        accountType: "Organization",
        targetType: "Organization",
        targetId: "6161234",
        suspendedAt: null,
        permissions: {
          metadata: "read",
        },
        lastSyncedAt: "2026-03-15T10:00:00.000Z",
        createdAt: "2026-03-15T10:00:00.000Z",
        updatedAt: "2026-03-15T10:00:00.000Z",
      },
      repositories: [
        {
          id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
          installationId: "12345",
          githubRepositoryId: "100",
          fullName: "616xold/pocket-cto",
          ownerLogin: "616xold",
          name: "pocket-cto",
          defaultBranch: "main",
          visibility: "private",
          archived: false,
          disabled: false,
          isActive: true,
          language: "TypeScript",
          lastSyncedAt: "2026-03-15T10:00:00.000Z",
          removedFromInstallationAt: null,
          updatedAt: "2026-03-15T10:00:00.000Z",
        },
      ],
    });
  });

  it("POST /github/repositories/sync returns 503 when the GitHub App is unconfigured", async () => {
    const app = await createTestApp(apps);

    const response = await app.inject({
      method: "POST",
      url: "/github/repositories/sync",
    });

    expect(response.statusCode).toBe(503);
    expect(response.json()).toEqual({
      error: {
        code: "github_app_not_configured",
        message: "GitHub App credentials are not configured",
        details: [
          {
            path: "GITHUB_APP_ID",
            message: "Missing required GitHub App env var",
          },
          {
            path: "GITHUB_APP_PRIVATE_KEY_BASE64",
            message: "Missing required GitHub App env var",
          },
        ],
      },
    });
  });

  it("POST /github/installations/:installationId/repositories/sync delegates to the GitHub App service when configured", async () => {
    const app = await createStubApp(apps, {
      githubAppService: {
        async syncInstallationRepositories() {
          return {
            installation: {
              id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
              installationId: "12345",
              appId: "98765",
              accountLogin: "616xold",
              accountType: "Organization",
              targetType: "Organization",
              targetId: "6161234",
              suspendedAt: null,
              permissions: {
                metadata: "read",
              },
              lastSyncedAt: "2026-03-15T09:00:00.000Z",
              createdAt: "2026-03-15T09:00:00.000Z",
              updatedAt: "2026-03-15T09:00:00.000Z",
            },
            syncedAt: "2026-03-15T10:00:00.000Z",
            syncedRepositoryCount: 1,
            activeRepositoryCount: 1,
            inactiveRepositoryCount: 0,
          };
        },
      },
    });

    const response = await app.inject({
      method: "POST",
      url: "/github/installations/12345/repositories/sync",
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      installation: {
        id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
        installationId: "12345",
        appId: "98765",
        accountLogin: "616xold",
        accountType: "Organization",
        targetType: "Organization",
        targetId: "6161234",
        suspendedAt: null,
        permissions: {
          metadata: "read",
        },
        lastSyncedAt: "2026-03-15T09:00:00.000Z",
        createdAt: "2026-03-15T09:00:00.000Z",
        updatedAt: "2026-03-15T09:00:00.000Z",
      },
      syncedAt: "2026-03-15T10:00:00.000Z",
      syncedRepositoryCount: 1,
      activeRepositoryCount: 1,
      inactiveRepositoryCount: 0,
    });
  });

  it("GET /missions/:missionId/events returns ordered replay events", async () => {
    const app = await createTestApp(apps);
    const created = await createMission(app);

    const response = await app.inject({
      method: "GET",
      url: `/missions/${created.mission.id}/events`,
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject([
      { sequence: 1, type: "mission.created" },
      { sequence: 2, type: "task.created" },
      { sequence: 3, type: "task.created" },
      {
        sequence: 4,
        type: "mission.status_changed",
        payload: {
          from: "planned",
          to: "queued",
          reason: "tasks_materialized",
        },
      },
      { sequence: 5, type: "artifact.created" },
    ]);
  });

  it("GET /missions/:missionId/events returns 400 for an invalid mission id", async () => {
    const app = await createTestApp(apps);

    const response = await app.inject({
      method: "GET",
      url: "/missions/not-a-uuid/events",
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({
      error: {
        code: "invalid_request",
        message: "Invalid request",
        details: [
          {
            path: "missionId",
            message: "Invalid uuid",
          },
        ],
      },
    });
  });

  it("GET /missions/:missionId/events returns 404 for an unknown mission id", async () => {
    const app = await createTestApp(apps);

    const response = await app.inject({
      method: "GET",
      url: `/missions/${unknownMissionId}/events`,
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({
      error: {
        code: "mission_not_found",
        message: "Mission not found",
      },
    });
  });

  it("GET /missions/:missionId/approvals lists approvals and reports that API-only mode cannot control live turns", async () => {
    const app = await createStubApp(apps, {
      operatorControl: {
        approvalService: {
          async listMissionApprovals() {
            return [
              {
                createdAt: "2026-03-14T10:00:00.000Z",
                id: "44444444-4444-4444-8444-444444444444",
                kind: "file_change",
                missionId: unknownMissionId,
                payload: {
                  requestId: "approval_file_change_1",
                  requestMethod: "item/fileChange/requestApproval",
                },
                rationale: null,
                requestedBy: "system",
                resolvedBy: null,
                status: "pending",
                taskId: unknownTaskId,
                updatedAt: "2026-03-14T10:00:00.000Z",
              },
            ];
          },
          async resolveApproval() {
            throw new Error("resolve should not be called");
          },
        },
        liveControl: {
          enabled: false,
          limitation: "single_process_only",
          mode: "api_only",
        },
        runtimeControlService: {
          async interruptActiveTurn() {
            throw new Error("interrupt should not be called");
          },
        },
      },
    });

    const response = await app.inject({
      method: "GET",
      url: `/missions/${unknownMissionId}/approvals`,
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      approvals: [
        {
          createdAt: "2026-03-14T10:00:00.000Z",
          id: "44444444-4444-4444-8444-444444444444",
          kind: "file_change",
          missionId: unknownMissionId,
          payload: {
            requestId: "approval_file_change_1",
            requestMethod: "item/fileChange/requestApproval",
          },
          rationale: null,
          requestedBy: "system",
          resolvedBy: null,
          status: "pending",
          taskId: unknownTaskId,
          updatedAt: "2026-03-14T10:00:00.000Z",
        },
      ],
      liveControl: {
        enabled: false,
        limitation: "single_process_only",
        mode: "api_only",
      },
    });
  });

  it("POST /approvals/:approvalId/resolve returns 501 when live control is unavailable in this process", async () => {
    const app = await createTestApp(apps);

    const response = await app.inject({
      method: "POST",
      url: `/approvals/${unknownApprovalId}/resolve`,
      payload: {
        decision: "accept",
        resolvedBy: "operator",
      },
    });

    expect(response.statusCode).toBe(501);
    expect(response.json()).toEqual({
      error: {
        code: "live_control_unavailable",
        message:
          "Live approval and interrupt control is unavailable in this process",
      },
    });
  });

  it("POST /approvals/:approvalId/resolve uses the embedded control surface when live control is enabled", async () => {
    const app = await createStubApp(apps, {
      operatorControl: {
        approvalService: {
          async listMissionApprovals() {
            return [];
          },
          async resolveApproval(input) {
            return {
              createdAt: "2026-03-14T10:00:00.000Z",
              id: input.approvalId,
              kind: "file_change",
              missionId: unknownMissionId,
              payload: {
                resolution: {
                  decision: input.decision,
                },
              },
              rationale: input.rationale ?? null,
              requestedBy: "system",
              resolvedBy: input.resolvedBy,
              status: "approved",
              taskId: unknownTaskId,
              updatedAt: "2026-03-14T10:05:00.000Z",
            };
          },
        },
        liveControl: {
          enabled: true,
          limitation: "single_process_only",
          mode: "embedded_worker",
        },
        runtimeControlService: {
          async interruptActiveTurn() {
            throw new Error("interrupt should not be called");
          },
        },
      },
    });

    const response = await app.inject({
      method: "POST",
      url: `/approvals/${unknownApprovalId}/resolve`,
      payload: {
        decision: "accept",
        rationale: "Looks safe",
        resolvedBy: "operator",
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      approval: {
        createdAt: "2026-03-14T10:00:00.000Z",
        id: unknownApprovalId,
        kind: "file_change",
        missionId: unknownMissionId,
        payload: {
          resolution: {
            decision: "accept",
          },
        },
        rationale: "Looks safe",
        requestedBy: "system",
        resolvedBy: "operator",
        status: "approved",
        taskId: unknownTaskId,
        updatedAt: "2026-03-14T10:05:00.000Z",
      },
      liveControl: {
        enabled: true,
        limitation: "single_process_only",
        mode: "embedded_worker",
      },
    });
  });

  it("POST /approvals/:approvalId/resolve returns 404 when the approval does not exist", async () => {
    const app = await createStubApp(apps, {
      operatorControl: {
        approvalService: {
          async listMissionApprovals() {
            return [];
          },
          async resolveApproval() {
            throw new ApprovalNotFoundError(unknownApprovalId);
          },
        },
        liveControl: {
          enabled: true,
          limitation: "single_process_only",
          mode: "embedded_worker",
        },
        runtimeControlService: {
          async interruptActiveTurn() {
            throw new Error("interrupt should not be called");
          },
        },
      },
    });

    const response = await app.inject({
      method: "POST",
      url: `/approvals/${unknownApprovalId}/resolve`,
      payload: {
        decision: "accept",
        resolvedBy: "operator",
      },
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({
      error: {
        code: "approval_not_found",
        message: "Approval not found",
      },
    });
  });

  it("POST /approvals/:approvalId/resolve returns 409 when the approval is no longer pending", async () => {
    const app = await createStubApp(apps, {
      operatorControl: {
        approvalService: {
          async listMissionApprovals() {
            return [];
          },
          async resolveApproval() {
            throw new ApprovalNotPendingError(unknownApprovalId, "approved");
          },
        },
        liveControl: {
          enabled: true,
          limitation: "single_process_only",
          mode: "embedded_worker",
        },
        runtimeControlService: {
          async interruptActiveTurn() {
            throw new Error("interrupt should not be called");
          },
        },
      },
    });

    const response = await app.inject({
      method: "POST",
      url: `/approvals/${unknownApprovalId}/resolve`,
      payload: {
        decision: "accept",
        resolvedBy: "operator",
      },
    });

    expect(response.statusCode).toBe(409);
    expect(response.json()).toEqual({
      error: {
        code: "approval_conflict",
        message: `Approval ${unknownApprovalId} is already approved`,
      },
    });
  });

  it("POST /tasks/:taskId/interrupt returns 501 when live control is unavailable in this process", async () => {
    const app = await createTestApp(apps);

    const response = await app.inject({
      method: "POST",
      url: `/tasks/${unknownTaskId}/interrupt`,
      payload: {
        requestedBy: "operator",
      },
    });

    expect(response.statusCode).toBe(501);
    expect(response.json()).toEqual({
      error: {
        code: "live_control_unavailable",
        message:
          "Live approval and interrupt control is unavailable in this process",
      },
    });
  });

  it("POST /tasks/:taskId/interrupt uses the embedded control surface when live control is enabled", async () => {
    const app = await createStubApp(apps, {
      operatorControl: {
        approvalService: {
          async listMissionApprovals() {
            return [];
          },
          async resolveApproval() {
            throw new Error("resolve should not be called");
          },
        },
        liveControl: {
          enabled: true,
          limitation: "single_process_only",
          mode: "embedded_worker",
        },
        runtimeControlService: {
          async interruptActiveTurn(input) {
            return {
              cancelledApprovals: [],
              taskId: input.taskId,
              threadId: "thread_fake_123",
              turnId: "turn_fake_123",
            };
          },
        },
      },
    });

    const response = await app.inject({
      method: "POST",
      url: `/tasks/${unknownTaskId}/interrupt`,
      payload: {
        rationale: "Stop this turn",
        requestedBy: "operator",
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      interrupt: {
        cancelledApprovals: [],
        taskId: unknownTaskId,
        threadId: "thread_fake_123",
        turnId: "turn_fake_123",
      },
      liveControl: {
        enabled: true,
        limitation: "single_process_only",
        mode: "embedded_worker",
      },
    });
  });

  it("POST /tasks/:taskId/interrupt returns 409 when the task has no active live turn", async () => {
    const app = await createStubApp(apps, {
      operatorControl: {
        approvalService: {
          async listMissionApprovals() {
            return [];
          },
          async resolveApproval() {
            throw new Error("resolve should not be called");
          },
        },
        liveControl: {
          enabled: true,
          limitation: "single_process_only",
          mode: "embedded_worker",
        },
        runtimeControlService: {
          async interruptActiveTurn() {
            throw new RuntimeActiveTurnNotFoundError(unknownTaskId);
          },
        },
      },
    });

    const response = await app.inject({
      method: "POST",
      url: `/tasks/${unknownTaskId}/interrupt`,
      payload: {
        requestedBy: "operator",
      },
    });

    expect(response.statusCode).toBe(409);
    expect(response.json()).toEqual({
      error: {
        code: "task_conflict",
        message: `Task ${unknownTaskId} has no active live turn to interrupt`,
      },
    });
  });
});

async function createTestApp(apps: FastifyInstance[]) {
  const app = await buildApp({
    container: createInMemoryContainer(),
  });
  apps.push(app);
  return app;
}

async function createPolicyLookupTestApp(apps: FastifyInstance[]) {
  const container = createInMemoryContainer();
  const companyKey = "acme";

  await seedPolicyLookupCompany(container, companyKey);
  const policySource = await createBoundDocumentSource(container, {
    companyKey,
    createdBy: "finance-operator",
    documentRole: "policy_document",
    markdownBody: [
      "# Travel and Expense Policy",
      "",
      "## Scope",
      "Employees must submit travel expenses within 30 days.",
    ].join("\n"),
    sourceName: "Travel policy",
  });
  const nonPolicySource = await createBoundDocumentSource(container, {
    companyKey,
    createdBy: "finance-operator",
    documentRole: "general_document",
    markdownBody: [
      "# Operating Memo",
      "",
      "This is a general memo, not a policy document.",
    ].join("\n"),
    sourceName: "Operating memo",
  });
  const app = await buildApp({ container });

  apps.push(app);

  return {
    app,
    companyKey,
    nonPolicySourceId: nonPolicySource.source.id,
    policySourceId: policySource.source.id,
  };
}

async function createStubApp(
  apps: FastifyInstance[],
  overrides: {
    financeTwinService?: Partial<AppContainer["financeTwinService"]>;
    githubAppService?: Partial<AppContainer["githubAppService"]>;
    githubIssueIntakeService?: Partial<
      AppContainer["githubIssueIntakeService"]
    >;
    githubWebhookService?: Partial<AppContainer["githubWebhookService"]>;
    missionService?: Partial<AppContainer["missionService"]>;
    operatorControl?: Partial<AppContainer["operatorControl"]>;
    replayService?: Partial<AppContainer["replayService"]>;
    sourceService?: Partial<AppContainer["sourceService"]>;
    twinService?: Partial<AppContainer["twinService"]>;
  },
) {
  const base = createInMemoryContainer();
  const app = await buildApp({
    container: {
      ...base,
      ...overrides,
      financeTwinService: {
        ...base.financeTwinService,
        ...overrides.financeTwinService,
      },
      githubAppService: {
        ...base.githubAppService,
        ...overrides.githubAppService,
      },
      githubIssueIntakeService: {
        ...base.githubIssueIntakeService,
        ...overrides.githubIssueIntakeService,
      },
      githubWebhookService: {
        ...base.githubWebhookService,
        ...overrides.githubWebhookService,
      },
      missionService: {
        ...base.missionService,
        ...overrides.missionService,
      },
      operatorControl: {
        ...base.operatorControl,
        ...overrides.operatorControl,
      },
      replayService: {
        ...base.replayService,
        ...overrides.replayService,
      },
      sourceService: {
        ...base.sourceService,
        ...overrides.sourceService,
      },
      twinService: {
        ...base.twinService,
        ...overrides.twinService,
      },
    },
  });
  apps.push(app);
  return app;
}

async function seedPolicyLookupCompany(
  container: AppContainer,
  companyKey: string,
) {
  const created = await container.sourceService.createSource({
    kind: "dataset",
    originKind: "manual",
    name: "Policy lookup seed bank summary",
    createdBy: "finance-operator",
    snapshot: {
      originalFileName: "policy-lookup-seed-link.txt",
      mediaType: "text/plain",
      sizeBytes: 16,
      checksumSha256:
        "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      ingestStatus: "registered",
      storageKind: "external_url",
      storageRef: "https://example.com/policy-lookup-seed",
    },
  });
  const registered = await container.sourceService.registerSourceFile(
    created.source.id,
    {
      originalFileName: "policy-lookup-bank-summary.csv",
      mediaType: "text/csv",
      createdBy: "finance-operator",
    },
    Buffer.from(
      [
        "account_name,bank,last4,statement_balance,available_balance,current_balance,currency,as_of",
        "Operating Checking,First National,1234,1000.00,900.00,,USD,2026-04-15",
      ].join("\n"),
      "utf8",
    ),
  );

  await container.financeTwinService.syncCompanySourceFile(
    companyKey,
    registered.sourceFile.id,
    {
      companyName: "Acme Holdings",
    },
  );
}

async function createBoundDocumentSource(
  container: AppContainer,
  input: {
    companyKey: string;
    createdBy: string;
    documentRole: "general_document" | "policy_document";
    markdownBody: string;
    sourceName: string;
  },
) {
  const created = await container.sourceService.createSource({
    kind: "document",
    originKind: "manual",
    name: input.sourceName,
    createdBy: input.createdBy,
    snapshot: {
      originalFileName: `${input.sourceName.toLowerCase().replaceAll(" ", "-")}-link.txt`,
      mediaType: "text/plain",
      sizeBytes: 16,
      checksumSha256:
        "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
      ingestStatus: "registered",
      storageKind: "external_url",
      storageRef: `https://example.com/${encodeURIComponent(input.sourceName)}`,
    },
  });

  await container.sourceService.registerSourceFile(
    created.source.id,
    {
      originalFileName: `${input.sourceName.toLowerCase().replaceAll(" ", "-")}.md`,
      mediaType: "text/markdown",
      createdBy: input.createdBy,
    },
    Buffer.from(`${input.markdownBody}\n`, "utf8"),
  );

  await container.cfoWikiService.bindCompanySource(
    input.companyKey,
    created.source.id,
    {
      boundBy: input.createdBy,
      documentRole: input.documentRole,
      includeInCompile: true,
    },
  );

  return created;
}

async function createMission(
  app: FastifyInstance,
  payload?: {
    requestedBy?: string;
    sourceKind?: string;
    sourceRef?: string;
    text?: string;
  },
) {
  const response = await app.inject({
    method: "POST",
    url: "/missions/text",
    payload: {
      requestedBy: payload?.requestedBy ?? "operator",
      sourceKind: payload?.sourceKind,
      sourceRef: payload?.sourceRef,
      text: payload?.text ?? "Implement passkeys for sign-in",
    },
  });

  expect(response.statusCode).toBe(201);

  return response.json() as {
    mission: {
      id: string;
    };
  };
}

function buildProofBundleFixture(
  overrides: Partial<ProofBundleManifest> = {},
): ProofBundleManifest {
  return ProofBundleManifestSchema.parse({
    missionId: unknownMissionId,
    missionTitle: "Implement passkeys for sign-in",
    objective: "Ship passkeys without breaking email login.",
    companyKey: null,
    questionKind: null,
    answerSummary: "",
    freshnessState: null,
    freshnessSummary: "",
    limitationsSummary: "",
    relatedRoutePaths: [],
    relatedWikiPageKeys: [],
    targetRepoFullName: null,
    branchName: null,
    pullRequestNumber: null,
    pullRequestUrl: null,
    changeSummary: "",
    validationSummary: "",
    verificationSummary: "",
    riskSummary: "",
    rollbackSummary: "",
    latestApproval: null,
    evidenceCompleteness: {
      status: "missing",
      expectedArtifactKinds: ["plan", "diff_summary", "test_report", "pr_link"],
      presentArtifactKinds: [],
      missingArtifactKinds: ["plan", "diff_summary", "test_report", "pr_link"],
      notes: [
        "Planner evidence is missing.",
        "Change-summary evidence is missing.",
        "Validation evidence is missing.",
        "GitHub pull request evidence is missing.",
      ],
      ...overrides.evidenceCompleteness,
    },
    decisionTrace: [],
    artifactIds: [],
    artifacts: [],
    replayEventCount: 0,
    timestamps: {
      missionCreatedAt: "2026-03-14T10:00:00.000Z",
      latestPlannerEvidenceAt: null,
      latestExecutorEvidenceAt: null,
      latestPullRequestAt: null,
      latestApprovalAt: null,
      latestArtifactAt: null,
      ...overrides.timestamps,
    },
    status: "placeholder",
    ...overrides,
  });
}
