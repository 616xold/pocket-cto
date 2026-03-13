import { describe, expect, it } from "vitest";
import {
  loadCompilerEvalDataset,
  loadExecutorEvalDataset,
  loadPlannerEvalDataset,
} from "./dataset";

describe("eval datasets", () => {
  it("loads the checked-in planner, executor, and compiler datasets", async () => {
    const [planner, executor, compiler] = await Promise.all([
      loadPlannerEvalDataset(),
      loadExecutorEvalDataset(),
      loadCompilerEvalDataset(),
    ]);

    expect(planner).toHaveLength(2);
    expect(planner[0]?.id).toBe("planner-passkeys-readonly");
    expect(executor).toHaveLength(2);
    expect(executor[0]?.id).toBe("executor-passkeys-final-report");
    expect(compiler).toHaveLength(2);
    expect(compiler[0]?.dryRunOutput.type).toBe("build");
  });
});
