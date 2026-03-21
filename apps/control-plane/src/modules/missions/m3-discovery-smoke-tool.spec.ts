import { describe, expect, it } from "vitest";
import {
  buildIsolatedDatabaseConfig,
  parseSmokeArgs,
} from "../../../../../tools/m3-discovery-mission-smoke.mjs";

describe("M3 discovery smoke helper", () => {
  it("parses isolation flags and de-duplicates changed paths", () => {
    expect(
      parseSmokeArgs([
        "--repo-full-name",
        "616xold/pocket-cto",
        "--changed-path",
        "apps/control-plane/src/modules/github-app/auth.ts",
        "--changed-path",
        "apps/control-plane/src/modules/github-app/auth.ts",
        "--isolate-db",
        "--db-name-prefix",
        "Pocket CTO Smoke",
        "--keep-db-on-failure",
      ]),
    ).toEqual({
      changedPaths: ["apps/control-plane/src/modules/github-app/auth.ts"],
      dbNamePrefix: "Pocket CTO Smoke",
      isolateDb: true,
      keepDbOnFailure: true,
      repoFullName: "616xold/pocket-cto",
      requestedBy: "m3-discovery-smoke",
      sourceRepoRoot: null,
    });
  });

  it("builds a fresh database pair with a dedicated *_test suffix", () => {
    const config = buildIsolatedDatabaseConfig({
      baseDatabaseUrl: "postgres://postgres:postgres@localhost:5432/pocket_cto",
      baseTestDatabaseUrl:
        "postgres://postgres:postgres@localhost:5432/pocket_cto_test",
      dbNamePrefix: "Pocket CTO Smoke",
      uniqueSuffix: "20260321_abcd1234",
    });

    expect(config.databaseName).toBe("pocket_cto_smoke_20260321_abcd1234");
    expect(config.testDatabaseName).toBe(
      "pocket_cto_smoke_20260321_abcd1234_test",
    );
    expect(new URL(config.databaseUrl).pathname).toBe(
      "/pocket_cto_smoke_20260321_abcd1234",
    );
    expect(new URL(config.testDatabaseUrl).pathname).toBe(
      "/pocket_cto_smoke_20260321_abcd1234_test",
    );
    expect(new URL(config.adminDatabaseUrl).pathname).toBe("/postgres");
    expect(new URL(config.adminTestDatabaseUrl).pathname).toBe("/postgres");
  });
});
