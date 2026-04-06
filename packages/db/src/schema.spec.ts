import { describe, expect, it } from "vitest";
import { missionTasks, missions, sourceSnapshots, sources } from "./schema";

describe("db schema exports", () => {
  it("exposes core tables", () => {
    expect(missions).toBeDefined();
    expect(missionTasks).toBeDefined();
    expect(sources).toBeDefined();
    expect(sourceSnapshots).toBeDefined();
  });
});
