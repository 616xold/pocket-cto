import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

const getControlPlaneHealth = vi.fn();
const getSourceList = vi.fn();

vi.mock("../../lib/api", () => ({
  getControlPlaneHealth,
  getSourceList,
}));

describe("EvidenceAtlasPage", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders a read-only atlas foundation without adding action controls", async () => {
    getControlPlaneHealth.mockResolvedValue({
      ok: true,
      service: "control-plane",
      now: "2026-05-08T18:00:00.000Z",
    });
    getSourceList.mockResolvedValue({
      limit: 20,
      sourceCount: 1,
      sources: [
        {
          createdAt: "2026-05-08T17:00:00.000Z",
          createdBy: "finance-operator",
          description: "Registered source record only.",
          id: "11111111-1111-4111-8111-111111111111",
          kind: "document",
          latestSnapshot: null,
          name: "Policy source",
          originKind: "manual",
          snapshotCount: 0,
          updatedAt: "2026-05-08T17:00:00.000Z",
        },
      ],
    });

    const mod = await import("./page");
    const html = renderToStaticMarkup(
      await mod.default({
        searchParams: Promise.resolve({ companyKey: " acme " }),
      }),
    );

    expect(getControlPlaneHealth).toHaveBeenCalledOnce();
    expect(getSourceList).toHaveBeenCalledWith({ limit: 20 });
    expect(html).toContain(
      "Read-only evidence inspection for local route context acme.",
    );
    expect(html).toContain(
      "not checked-in sample company data",
    );
    expect(html).toContain("Displayed source records");
    expect(html).toContain("not a total source inventory count");
    expect(html).toContain("Source Coverage Matrix");
    expect(html).toContain("Evidence timeline");
    expect(html).toContain("Document map");
    expect(html).toContain("Evidence card detail");
    expect(html).toContain("Answer anatomy");
    expect(html).toContain("Capability boundary");
    expect(html).toContain("Live EvidenceIndex route");
    expect(html).toContain("not registered");
    expect(html).toContain("upload_source");
    expect(html).toContain("provider_call");
    expect(html).toContain("take_autonomous_action");
    expect(html).not.toContain("<form");
    expect(html).not.toContain("<button");
  });
});
