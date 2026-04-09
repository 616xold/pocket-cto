import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

const getControlPlaneHealth = vi.fn();
const getSourceList = vi.fn();

vi.mock("../../lib/api", () => ({
  getControlPlaneHealth,
  getSourceList,
}));

vi.mock("../../components/source-registration-form", () => ({
  SourceRegistrationForm() {
    return <div>source-registration-form</div>;
  },
}));

describe("SourcesPage", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders source inventory with the manual registration form", async () => {
    getControlPlaneHealth.mockResolvedValue({
      ok: true,
      service: "control-plane",
      now: "2026-04-09T11:00:00.000Z",
    });
    getSourceList.mockResolvedValue({
      limit: 20,
      sourceCount: 1,
      sources: [
        {
          createdAt: "2026-04-09T10:00:00.000Z",
          createdBy: "finance-operator",
          description: "Monthly close pack exports.",
          id: "11111111-1111-4111-8111-111111111111",
          kind: "document",
          latestSnapshot: {
            capturedAt: "2026-04-09T10:05:00.000Z",
            checksumSha256:
              "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
            createdAt: "2026-04-09T10:05:00.000Z",
            id: "22222222-2222-4222-8222-222222222222",
            ingestErrorSummary: null,
            ingestStatus: "registered",
            mediaType: "application/pdf",
            originalFileName: "close-pack.pdf",
            sizeBytes: 8192,
            sourceId: "11111111-1111-4111-8111-111111111111",
            storageKind: "external_url",
            storageRef: "https://example.com/close-pack.pdf",
            updatedAt: "2026-04-09T10:05:00.000Z",
            version: 1,
          },
          name: "Close pack",
          originKind: "manual",
          snapshotCount: 1,
          updatedAt: "2026-04-09T10:05:00.000Z",
        },
      ],
    });

    const mod = await import("./page");
    const html = renderToStaticMarkup(await mod.default());

    expect(getControlPlaneHealth).toHaveBeenCalledOnce();
    expect(getSourceList).toHaveBeenCalledWith({ limit: 20 });
    expect(html).toContain("source-registration-form");
    expect(html).toContain("Close pack");
    expect(html).toContain("Current F1 boundary");
    expect(html).toContain("Register source truth");
  });
});
