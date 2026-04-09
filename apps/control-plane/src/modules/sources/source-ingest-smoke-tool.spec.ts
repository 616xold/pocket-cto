import { describe, expect, it } from "vitest";
import {
  buildSourceSmokeFixture,
  parseSourceSmokeArgs,
} from "../../../../../tools/source-ingest-smoke.mjs";

describe("source ingest smoke helper", () => {
  it("parses additive root smoke defaults", () => {
    expect(parseSourceSmokeArgs([])).toEqual({
      createdBy: "finance-source-smoke",
      mode: "registry",
      sourceKind: "dataset",
      sourceName: null,
    });
  });

  it("accepts ingest mode and a custom source name", () => {
    expect(
      parseSourceSmokeArgs([
        "--mode",
        "ingest",
        "--created-by",
        "finance-operator",
        "--source-kind",
        "spreadsheet",
        "--source-name",
        "April cash flow smoke",
      ]),
    ).toEqual({
      createdBy: "finance-operator",
      mode: "ingest",
      sourceKind: "spreadsheet",
      sourceName: "April cash flow smoke",
    });
  });

  it("builds finance-era smoke fixture defaults around a CSV upload", () => {
    const fixture = buildSourceSmokeFixture({
      createdBy: "finance-source-smoke",
      mode: "ingest",
      runTag: "20260409T123609Z",
      sourceKind: "dataset",
      sourceName: null,
    });

    expect(fixture.sourceName).toBe(
      "Finance source smoke 20260409T123609Z",
    );
    expect(fixture.seed.originalFileName).toBe(
      "source-smoke-seed-20260409T123609Z.json",
    );
    expect(fixture.seed.mediaType).toBe("application/json");
    expect(fixture.upload.originalFileName).toBe(
      "cash-flow-smoke-20260409T123609Z.csv",
    );
    expect(fixture.upload.mediaType).toBe("text/csv");
    expect(fixture.upload.body.toString("utf8")).toContain("cash_usd");
    expect(JSON.parse(fixture.seed.body.toString("utf8"))).toMatchObject({
      mode: "ingest",
      requestedBy: "packaged_source_smoke",
      sourceKind: "dataset",
    });
  });
});
