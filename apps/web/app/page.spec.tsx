import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

const getControlPlaneHealth = vi.fn();
const getMissionList = vi.fn();
const getSourceList = vi.fn();

vi.mock("../lib/api", () => ({
  getControlPlaneHealth,
  getMissionList,
  getSourceList,
}));

describe("HomePage", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders finance-first source inventory and keeps missions secondary", async () => {
    getControlPlaneHealth.mockResolvedValue({
      ok: true,
      service: "control-plane",
      now: "2026-04-09T11:00:00.000Z",
    });
    getSourceList.mockResolvedValue({
      limit: 4,
      sourceCount: 1,
      sources: [
        {
          createdAt: "2026-04-09T10:00:00.000Z",
          createdBy: "finance-operator",
          description: "April board package from the portal export.",
          id: "11111111-1111-4111-8111-111111111111",
          kind: "document",
          latestSnapshot: {
            capturedAt: "2026-04-09T10:15:00.000Z",
            checksumSha256:
              "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
            createdAt: "2026-04-09T10:15:00.000Z",
            id: "22222222-2222-4222-8222-222222222222",
            ingestErrorSummary: null,
            ingestStatus: "ready",
            mediaType: "application/pdf",
            originalFileName: "board-pack-april.pdf",
            sizeBytes: 4096,
            sourceId: "11111111-1111-4111-8111-111111111111",
            storageKind: "object_store",
            storageRef: "sources/board-pack-april.pdf",
            updatedAt: "2026-04-09T10:20:00.000Z",
            version: 2,
          },
          name: "Board package",
          originKind: "manual",
          snapshotCount: 2,
          updatedAt: "2026-04-09T10:20:00.000Z",
        },
      ],
    });
    getMissionList.mockResolvedValue({
      filters: {
        limit: 4,
        sourceKind: null,
        status: null,
      },
      missions: [
        {
          createdAt: "2026-04-09T09:50:00.000Z",
          id: "33333333-3333-4333-8333-333333333333",
          latestTask: null,
          objectiveExcerpt: "Review the uploaded board package for open items.",
          pendingApprovalCount: 0,
          primaryRepo: null,
          proofBundleStatus: "placeholder",
          pullRequestNumber: null,
          pullRequestUrl: null,
          sourceKind: "manual_text",
          sourceRef: null,
          status: "queued",
          title: "Review board package open items",
          updatedAt: "2026-04-09T09:55:00.000Z",
        },
      ],
    });

    const mod = await import("./page");
    const html = renderToStaticMarkup(await mod.default());

    expect(getControlPlaneHealth).toHaveBeenCalledOnce();
    expect(getSourceList).toHaveBeenCalledWith({ limit: 4 });
    expect(getMissionList).toHaveBeenCalledWith({ limit: 4 });
    expect(html).toContain("Operator home for source-first finance evidence intake.");
    expect(html).toContain("Board package");
    expect(html).toContain("Review board package open items");
    expect(html).toContain("View all sources");
    expect(html).toContain("GitHub as a legacy connector");
  });
});
