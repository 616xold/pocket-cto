import { createHash } from "node:crypto";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildApp } from "../apps/control-plane/src/app.ts";
import { createContainer } from "../apps/control-plane/src/bootstrap.ts";
import { closeAllPools } from "../packages/db/src/client.ts";
import { buildRunTag, loadNearestEnvFile } from "./m2-exit-utils.mjs";

const DEFAULT_COMPANY_KEY = "local-cfo-wiki-smoke-company";
const DEFAULT_COMPANY_NAME = "Local CFO Wiki Smoke Company";
const DEFAULT_CREATED_BY = "cfo-wiki-smoke";
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
      note: "Seed snapshot for the packaged CFO Wiki foundation smoke.",
      requestedBy: "cfo_wiki_smoke",
      runTag: input.runTag,
    },
    null,
    2,
  );
  const uploadText = [
    "account_code,account_name,period_end,debit,credit,currency_code,account_type",
    "1000,Cash,2026-03-31,125000.00,0.00,USD,asset",
    "2000,Accounts Payable,2026-03-31,0.00,42000.00,USD,liability",
    "3000,Retained Earnings,2026-03-31,0.00,83000.00,USD,equity",
  ].join("\n");

  return {
    companyKey: input.companyKey,
    companyName: input.companyName,
    createdBy: input.createdBy,
    sourceName: `CFO wiki smoke ${input.runTag}`,
    seed: {
      body: Buffer.from(`${seedText}\n`, "utf8"),
      mediaType: "application/json",
      originalFileName: `cfo-wiki-seed-${input.runTag}.json`,
    },
    upload: {
      body: Buffer.from(`${uploadText}\n`, "utf8"),
      mediaType: "text/csv",
      originalFileName: `trial-balance-${input.runTag}.csv`,
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
  const capturedAt = new Date().toISOString();
  let app = null;

  try {
    const container = await createContainer();
    app = await buildApp({ container });
    app.log.level = "silent";

    const created = await injectJson(app, {
      expectedStatus: 201,
      method: "POST",
      payload: {
        createdBy: fixture.createdBy,
        description: "Packaged CFO Wiki smoke source.",
        kind: "dataset",
        name: fixture.sourceName,
        snapshot: {
          capturedAt,
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
    const sourceId = requireUuid(created?.source?.id, "source id");
    const uploaded = await injectJson(app, {
      expectedStatus: 201,
      headers: {
        "content-type": "application/octet-stream",
      },
      method: "POST",
      payload: fixture.upload.body,
      url: `/sources/${sourceId}/files?${new URLSearchParams({
        capturedAt,
        createdBy: fixture.createdBy,
        mediaType: fixture.upload.mediaType,
        originalFileName: fixture.upload.originalFileName,
      }).toString()}`,
    });
    const sourceFileId = requireUuid(uploaded?.sourceFile?.id, "source file id");
    const synced = await injectJson(app, {
      expectedStatus: 201,
      method: "POST",
      payload: {
        companyName: fixture.companyName,
      },
      url: `/finance-twin/companies/${fixture.companyKey}/source-files/${sourceFileId}/sync`,
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
    const indexPage = await injectJson(app, {
      expectedStatus: 200,
      method: "GET",
      url: `/cfo-wiki/companies/${fixture.companyKey}/index`,
    });
    const periodPageKey =
      compiled?.pageInventory?.find?.((page) => page.pageKind === "period_index")
        ?.pageKey ?? null;
    const periodPage = periodPageKey
      ? await injectJson(app, {
          expectedStatus: 200,
          method: "GET",
          url: `/cfo-wiki/companies/${fixture.companyKey}/pages/${encodeURIComponent(periodPageKey)}`,
        })
      : null;

    console.log(
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          company: {
            companyKey: companySummary.companyKey,
            displayName: companySummary.companyDisplayName,
          },
          source: {
            id: sourceId,
            name: created.source.name,
          },
          sourceFile: {
            id: sourceFileId,
            originalFileName: uploaded.sourceFile.originalFileName,
            checksumSha256: uploaded.sourceFile.checksumSha256,
          },
          syncRun: {
            id: synced.syncRun.id,
            extractorKey: synced.syncRun.extractorKey,
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
            limitations: companySummary.limitations,
          },
          indexPage: {
            pageKey: indexPage.page.pageKey,
            linkCount: indexPage.links.length,
            refCount: indexPage.refs.length,
            latestCompileStatus: indexPage.latestCompileRun?.status ?? null,
          },
          periodPage: periodPage
            ? {
                pageKey: periodPage.page.pageKey,
                linkCount: periodPage.links.length,
                refCount: periodPage.refs.length,
                freshnessSummary: periodPage.freshnessSummary,
              }
            : null,
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

async function writeSeedSnapshot(seed) {
  const directory = await mkdtemp(join(tmpdir(), "pocket-cfo-wiki-smoke-"));
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
