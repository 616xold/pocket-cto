import { createHash } from "node:crypto";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { buildApp } from "../apps/control-plane/src/app.ts";
import { createContainer } from "../apps/control-plane/src/bootstrap.ts";
import { closeAllPools } from "../packages/db/src/client.ts";
import { buildRunTag, loadNearestEnvFile } from "./m2-exit-utils.mjs";

const DEFAULT_COMPANY_KEY = "local-cfo-wiki-lint-export-company";
const DEFAULT_COMPANY_NAME = "Local CFO Wiki Lint Export Company";
const DEFAULT_CREATED_BY = "cfo-wiki-lint-export-smoke";

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
      note: "Seed snapshot for the packaged CFO Wiki lint/export smoke.",
      requestedBy: "cfo_wiki_lint_export_smoke",
      runTag: input.runTag,
    },
    null,
    2,
  );
  const financeUpload = [
    "account_code,account_name,period_end,debit,credit,currency_code,account_type",
    "1000,Cash,2026-03-31,125000.00,0.00,USD,asset",
    "2000,Accounts Payable,2026-03-31,0.00,42000.00,USD,liability",
    "3000,Retained Earnings,2026-03-31,0.00,83000.00,USD,equity",
  ].join("\n");

  return {
    companyKey: `${input.companyKey}-${input.runTag.toLowerCase()}`,
    companyName: `${input.companyName} ${input.runTag}`,
    createdBy: input.createdBy,
    financeSourceName: `CFO wiki lint seed ${input.runTag}`,
    markdownSourceName: `Board deck ${input.runTag}`,
    pdfSourceName: `Unsupported packet ${input.runTag}`,
    seed: {
      body: Buffer.from(`${seedText}\n`, "utf8"),
      mediaType: "application/json",
      originalFileName: `cfo-wiki-lint-export-seed-${input.runTag}.json`,
    },
    financeUpload: {
      body: Buffer.from(`${financeUpload}\n`, "utf8"),
      mediaType: "text/csv",
      originalFileName: `trial-balance-${input.runTag}.csv`,
    },
    markdownUpload: {
      body: Buffer.from(
        [
          "# April board deck",
          "",
          "Revenue grew 20% month over month.",
          "",
          "## Highlights",
          "",
          "- Cash remained above the covenant minimum.",
          "- Collections improved after the April follow-up sprint.",
          "",
        ].join("\n"),
        "utf8",
      ),
      mediaType: "text/markdown",
      originalFileName: `board-deck-${input.runTag}.md`,
    },
    pdfUpload: {
      body: Buffer.from(
        [
          "%PDF-1.4",
          "% deterministic unsupported smoke fixture",
          "1 0 obj<</Type/Catalog>>endobj",
        ].join("\n"),
        "utf8",
      ),
      mediaType: "application/pdf",
      originalFileName: `unsupported-packet-${input.runTag}.pdf`,
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
  const markdownCapturedAt = new Date("2026-04-08T12:00:00.000Z").toISOString();
  const pdfCapturedAt = new Date("2026-04-09T12:00:00.000Z").toISOString();
  let app = null;

  try {
    const container = await createContainer();
    app = await buildApp({ container });
    app.log.level = "silent";

    const financeSource = await injectJson(app, {
      expectedStatus: 201,
      method: "POST",
      payload: {
        createdBy: fixture.createdBy,
        description: "Packaged CFO Wiki lint/export finance source.",
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

    const markdownSource = await createDocumentSource(app, {
      capturedAt: markdownCapturedAt,
      createdBy: fixture.createdBy,
      originalFileName: `board-deck-link-${runTag}.txt`,
      sourceName: fixture.markdownSourceName,
      storageRef: `https://example.com/${fixture.companyKey}/board-deck/${runTag}`,
    });
    await registerDocumentFile(app, markdownSource.id, {
      body: fixture.markdownUpload.body,
      capturedAt: markdownCapturedAt,
      createdBy: fixture.createdBy,
      mediaType: fixture.markdownUpload.mediaType,
      originalFileName: fixture.markdownUpload.originalFileName,
    });

    const pdfSource = await createDocumentSource(app, {
      capturedAt: pdfCapturedAt,
      createdBy: fixture.createdBy,
      originalFileName: `unsupported-packet-link-${runTag}.txt`,
      sourceName: fixture.pdfSourceName,
      storageRef: `https://example.com/${fixture.companyKey}/unsupported-packet/${runTag}`,
    });
    await registerDocumentFile(app, pdfSource.id, {
      body: fixture.pdfUpload.body,
      capturedAt: pdfCapturedAt,
      createdBy: fixture.createdBy,
      mediaType: fixture.pdfUpload.mediaType,
      originalFileName: fixture.pdfUpload.originalFileName,
    });

    await injectJson(app, {
      expectedStatus: 201,
      method: "POST",
      payload: {
        boundBy: fixture.createdBy,
        documentRole: "board_material",
      },
      url: `/cfo-wiki/companies/${fixture.companyKey}/sources/${markdownSource.id}/bind`,
    });
    await injectJson(app, {
      expectedStatus: 201,
      method: "POST",
      payload: {
        boundBy: fixture.createdBy,
        documentRole: "lender_document",
      },
      url: `/cfo-wiki/companies/${fixture.companyKey}/sources/${pdfSource.id}/bind`,
    });

    const initialCompile = await injectJson(app, {
      expectedStatus: 201,
      method: "POST",
      payload: {
        triggeredBy: fixture.createdBy,
      },
      url: `/cfo-wiki/companies/${fixture.companyKey}/compile`,
    });
    const filedPage = await injectJson(app, {
      expectedStatus: 201,
      method: "POST",
      payload: {
        title: "Board deck notes",
        markdownBody:
          "Collections backlog remains 3 items while the close checklist is still manual.",
        filedBy: fixture.createdBy,
        provenanceSummary: "Filed after operator review of the April board deck.",
      },
      url: `/cfo-wiki/companies/${fixture.companyKey}/filed-pages`,
    });
    const recompiled = await injectJson(app, {
      expectedStatus: 201,
      method: "POST",
      payload: {
        triggeredBy: fixture.createdBy,
      },
      url: `/cfo-wiki/companies/${fixture.companyKey}/compile`,
    });

    const filedPageKey = filedPage?.page?.pageKey ?? null;
    assert(filedPageKey === "filed/board-deck-notes", "Expected a deterministic filed page key.");

    const filedPages = await injectJson(app, {
      expectedStatus: 200,
      method: "GET",
      url: `/cfo-wiki/companies/${fixture.companyKey}/filed-pages`,
    });
    const preservedFiledPage = await injectJson(app, {
      expectedStatus: 200,
      method: "GET",
      url: `/cfo-wiki/companies/${fixture.companyKey}/pages/${encodeURIComponent(filedPageKey)}`,
    });
    const linted = await injectJson(app, {
      expectedStatus: 201,
      method: "POST",
      payload: {
        triggeredBy: fixture.createdBy,
      },
      url: `/cfo-wiki/companies/${fixture.companyKey}/lint`,
    });
    const latestLint = await injectJson(app, {
      expectedStatus: 200,
      method: "GET",
      url: `/cfo-wiki/companies/${fixture.companyKey}/lint`,
    });
    const exported = await injectJson(app, {
      expectedStatus: 201,
      method: "POST",
      payload: {
        triggeredBy: fixture.createdBy,
      },
      url: `/cfo-wiki/companies/${fixture.companyKey}/export`,
    });
    const exportsList = await injectJson(app, {
      expectedStatus: 200,
      method: "GET",
      url: `/cfo-wiki/companies/${fixture.companyKey}/exports`,
    });
    const exportDetail = await injectJson(app, {
      expectedStatus: 200,
      method: "GET",
      url: `/cfo-wiki/companies/${fixture.companyKey}/exports/${exported.exportRun.id}`,
    });
    const companySummary = await injectJson(app, {
      expectedStatus: 200,
      method: "GET",
      url: `/cfo-wiki/companies/${fixture.companyKey}`,
    });

    const findingKinds = linted.findings.map((finding) => finding.findingKind);
    const exportedPaths = exported.exportRun.files.map((file) => file.path);

    assert(
      recompiled.pageCountsByKind.filed_artifact === 1,
      "Expected the second compile to preserve the filed artifact page.",
    );
    assert(
      preservedFiledPage.page.ownershipKind === "filed_artifact",
      "Expected filed artifact ownership to stay explicit on the preserved page.",
    );
    assert(
      filedPages.pageCount === 1,
      "Expected the filed-pages list to surface the filed artifact page.",
    );
    assert(
      findingKinds.includes("missing_refs"),
      "Expected lint to flag the filed page for missing refs.",
    );
    assert(
      findingKinds.includes("uncited_numeric_claim"),
      "Expected lint to flag the filed page's numeric claim without refs.",
    );
    assert(
      findingKinds.includes("unsupported_document_gap"),
      "Expected lint to surface the unsupported PDF document gap.",
    );
    assert(
      latestLint.latestLintRun?.id === linted.latestLintRun?.id,
      "Expected GET /lint to return the latest persisted lint run.",
    );
    assert(
      exported.exportRun.manifest?.bundleRootPath === `${fixture.companyKey}-cfo-wiki`,
      "Expected export manifest bundle root to be deterministic from the company key.",
    );
    assert(
      exportedPaths.includes("manifest.json") &&
        exportedPaths.includes("filed/board-deck-notes.md"),
      "Expected export output to include both manifest metadata and the filed markdown page.",
    );
    assert(
      exportsList.exportCount === 1,
      "Expected the export list route to persist and list the export run.",
    );
    assert(
      exportDetail.exportRun.id === exported.exportRun.id,
      "Expected the export detail route to return the persisted export run.",
    );
    assert(
      companySummary.pageCountsByKind.filed_artifact === 1,
      "Expected the company summary to include the filed artifact count.",
    );

    console.log(
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          company: {
            companyKey: companySummary.companyKey,
            displayName: companySummary.companyDisplayName,
          },
          syncRun: {
            id: synced.syncRun.id,
            status: synced.syncRun.status,
          },
          compileRuns: [
            {
              id: initialCompile.compileRun.id,
              status: initialCompile.compileRun.status,
            },
            {
              id: recompiled.compileRun.id,
              status: recompiled.compileRun.status,
            },
          ],
          filedPage: {
            pageKey: preservedFiledPage.page.pageKey,
            ownershipKind: preservedFiledPage.page.ownershipKind,
            filedBy: preservedFiledPage.page.filedMetadata?.filedBy ?? null,
          },
          lint: {
            runId: linted.latestLintRun?.id ?? null,
            findingCount: linted.findingCount,
            findingCountsByKind: linted.findingCountsByKind,
          },
          export: {
            runId: exported.exportRun.id,
            bundleRootPath: exported.exportRun.bundleRootPath,
            pageCount: exported.exportRun.pageCount,
            fileCount: exported.exportRun.fileCount,
            paths: exportedPaths,
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
  const response = await injectJson(app, {
    expectedStatus: 201,
    method: "POST",
    payload: {
      createdBy: input.createdBy,
      description: "Packaged CFO Wiki lint/export document source.",
      kind: "document",
      name: input.sourceName,
      snapshot: {
        capturedAt: input.capturedAt,
        checksumSha256:
          "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
        mediaType: "text/plain",
        originalFileName: input.originalFileName,
        sizeBytes: 32,
        storageKind: "external_url",
        storageRef: input.storageRef,
      },
    },
    url: "/sources",
  });

  return {
    id: requireUuid(response?.source?.id, "document source id"),
  };
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

async function writeSeedSnapshot(seed) {
  const directory = await mkdtemp(join(tmpdir(), "pocket-cfo-wiki-lint-export-"));
  const storageRef = join(directory, seed.originalFileName);

  await writeFile(storageRef, seed.body);

  return {
    checksumSha256: createHash("sha256").update(seed.body).digest("hex"),
    storageRef,
  };
}

async function injectJson(app, input) {
  const response = await app.inject({
    method: input.method,
    url: input.url,
    headers: input.headers,
    payload: input.payload,
  });

  assert(
    response.statusCode === input.expectedStatus,
    [
      `Expected ${input.method} ${input.url} to return ${input.expectedStatus}.`,
      `Received ${response.statusCode}.`,
      response.body,
    ].join(" "),
  );

  return response.json();
}

function requireUuid(value, label) {
  assert(
    typeof value === "string" &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        value,
      ),
    `Expected ${label} to be a UUID.`,
  );

  return value;
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
