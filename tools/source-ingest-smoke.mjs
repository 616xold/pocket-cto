import { createHash } from "node:crypto";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildApp } from "../apps/control-plane/src/app.ts";
import { createContainer } from "../apps/control-plane/src/bootstrap.ts";
import { closeAllPools } from "../packages/db/src/client.ts";
import { buildRunTag, loadNearestEnvFile } from "./m2-exit-utils.mjs";

const VALID_MODES = new Set(["registry", "ingest"]);
const VALID_SOURCE_KINDS = new Set([
  "document",
  "spreadsheet",
  "dataset",
  "image",
  "archive",
  "other",
]);
const DEFAULT_CREATED_BY = "finance-source-smoke";
const DEFAULT_MODE = "registry";
const DEFAULT_SOURCE_KIND = "dataset";
const MODULE_PATH = fileURLToPath(import.meta.url);

export function parseSourceSmokeArgs(argv) {
  const options = {
    createdBy: DEFAULT_CREATED_BY,
    mode: DEFAULT_MODE,
    sourceKind: DEFAULT_SOURCE_KIND,
    sourceName: null,
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
      case "created-by":
        options.createdBy = value;
        break;
      case "mode":
        options.mode = value;
        break;
      case "source-kind":
        options.sourceKind = value;
        break;
      case "source-name":
        options.sourceName = value;
        break;
      default:
        throw new Error(`Unexpected argument: --${rawFlag}`);
    }
  }

  if (!VALID_MODES.has(options.mode)) {
    throw new Error(
      `--mode must be one of: ${Array.from(VALID_MODES).join(", ")}`,
    );
  }

  if (!VALID_SOURCE_KINDS.has(options.sourceKind)) {
    throw new Error(
      `--source-kind must be one of: ${Array.from(VALID_SOURCE_KINDS).join(", ")}`,
    );
  }

  return options;
}

export function buildSourceSmokeFixture(input) {
  const sourceName = input.sourceName ?? `Finance source smoke ${input.runTag}`;
  const uploadBodyText = [
    "period,cash_usd,runway_months",
    "2026-03,125000,14",
    "2026-04,118500,13",
  ].join("\n");
  const seedManifestText = JSON.stringify(
    {
      createdBy: input.createdBy,
      mode: input.mode,
      note: "Seed snapshot used to establish the source registry record before raw file upload.",
      requestedBy: "packaged_source_smoke",
      runTag: input.runTag,
      sourceKind: input.sourceKind,
      sourceName,
    },
    null,
    2,
  );

  return {
    createdBy: input.createdBy,
    mode: input.mode,
    runTag: input.runTag,
    sourceKind: input.sourceKind,
    sourceName,
    seed: {
      body: Buffer.from(`${seedManifestText}\n`, "utf8"),
      mediaType: "application/json",
      originalFileName: `source-smoke-seed-${input.runTag}.json`,
    },
    upload: {
      body: Buffer.from(`${uploadBodyText}\n`, "utf8"),
      mediaType: "text/csv",
      originalFileName: `cash-flow-smoke-${input.runTag}.csv`,
    },
  };
}

async function main() {
  loadNearestEnvFile();

  const options = parseSourceSmokeArgs(
    process.argv.slice(2).filter((entry) => entry !== "--"),
  );
  const runTag = buildRunTag();
  const fixture = buildSourceSmokeFixture({
    ...options,
    runTag,
  });
  const seedSnapshot = await writeSeedSnapshot(fixture.seed);
  const sourceCapturedAt = new Date().toISOString();
  const uploadCapturedAt = new Date().toISOString();
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
        description: "Packaged finance source smoke for the current F1 backend.",
        kind: fixture.sourceKind,
        name: fixture.sourceName,
        snapshot: {
          capturedAt: sourceCapturedAt,
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
        capturedAt: uploadCapturedAt,
        createdBy: fixture.createdBy,
        mediaType: fixture.upload.mediaType,
        originalFileName: fixture.upload.originalFileName,
      }).toString()}`,
    });

    const sourceFileId = requireUuid(
      uploaded?.sourceFile?.id,
      "source file id",
    );
    let ingestRunSummary = {
      performed: false,
      status: "not_requested",
    };

    if (fixture.mode === "ingest") {
      const ingested = await injectJson(app, {
        expectedStatus: 201,
        method: "POST",
        url: `/sources/files/${sourceFileId}/ingest`,
      });

      ingestRunSummary = {
        id: requireUuid(ingested?.ingestRun?.id, "ingest run id"),
        parserKey: ingested?.ingestRun?.parserSelection?.parserKey ?? null,
        performed: true,
        receiptKind: ingested?.ingestRun?.receiptSummary?.kind ?? null,
        status: ingested?.ingestRun?.status ?? null,
      };
    }

    const sourceDetail = await injectJson(app, {
      expectedStatus: 200,
      method: "GET",
      url: `/sources/${sourceId}`,
    });
    const latestSnapshot = sourceDetail?.snapshots?.[0];

    console.log(
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          ingest: ingestRunSummary,
          mode: fixture.mode,
          seedSnapshot: {
            checksumSha256: seedSnapshot.checksumSha256,
            originalFileName: fixture.seed.originalFileName,
            storageKind: "local_path",
            storageRef: seedSnapshot.storageRef,
          },
          source: {
            id: sourceId,
            kind: created.source.kind,
            latestSnapshotVersion: latestSnapshot?.version ?? uploaded.snapshot.version,
            name: created.source.name,
          },
          sourceFile: {
            checksumSha256: uploaded.sourceFile.checksumSha256,
            id: sourceFileId,
            originalFileName: uploaded.sourceFile.originalFileName,
            storageKind: uploaded.sourceFile.storageKind,
            storageRef: uploaded.sourceFile.storageRef,
          },
          latestSnapshot: {
            id: requireUuid(
              latestSnapshot?.id ?? uploaded?.snapshot?.id,
              "snapshot id",
            ),
            ingestStatus:
              latestSnapshot?.ingestStatus ?? uploaded.snapshot.ingestStatus,
            version: latestSnapshot?.version ?? uploaded.snapshot.version,
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

async function writeSeedSnapshot(seed) {
  const directory = await mkdtemp(join(tmpdir(), "pocket-cfo-source-smoke-"));
  const storageRef = join(directory, seed.originalFileName);

  await writeFile(storageRef, seed.body);

  return {
    checksumSha256: createHash("sha256")
      .update(seed.body)
      .digest("hex"),
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
