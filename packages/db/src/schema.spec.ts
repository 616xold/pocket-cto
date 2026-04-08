import { describe, expect, it } from "vitest";
import {
  missionTasks,
  missions,
  provenanceRecords,
  sourceFiles,
  sourceSnapshots,
  sources,
} from "./schema";

describe("db schema exports", () => {
  it("exposes core tables", () => {
    expect(missions).toBeDefined();
    expect(missionTasks).toBeDefined();
    expect(sources).toBeDefined();
    expect(sourceSnapshots).toBeDefined();
    expect(sourceFiles).toBeDefined();
    expect(provenanceRecords).toBeDefined();
  });
});
