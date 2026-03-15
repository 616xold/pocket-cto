import { describe, expect, it, vi } from "vitest";
import { InMemoryInstallationTokenCache } from "./token-cache";

describe("InMemoryInstallationTokenCache", () => {
  it("reuses a cached token until it is inside the refresh safety margin", async () => {
    let nowMs = Date.parse("2026-03-15T10:00:00.000Z");
    const cache = new InMemoryInstallationTokenCache({
      now: () => nowMs,
      refreshSkewMs: 30_000,
    });
    const mintToken = vi.fn(async () => ({
      installationId: "12345",
      token: "token-1",
      expiresAt: "2026-03-15T10:05:00.000Z",
      permissions: {
        metadata: "read",
      },
    }));

    const firstToken = await cache.getOrCreate("12345", mintToken);
    nowMs = Date.parse("2026-03-15T10:04:00.000Z");
    const secondToken = await cache.getOrCreate("12345", mintToken);

    expect(firstToken).toEqual(secondToken);
    expect(mintToken).toHaveBeenCalledTimes(1);
  });

  it("refreshes a token once it is inside the refresh safety margin", async () => {
    let nowMs = Date.parse("2026-03-15T10:00:00.000Z");
    const cache = new InMemoryInstallationTokenCache({
      now: () => nowMs,
      refreshSkewMs: 30_000,
    });
    const mintToken = vi
      .fn()
      .mockResolvedValueOnce({
        installationId: "12345",
        token: "token-1",
        expiresAt: "2026-03-15T10:01:00.000Z",
        permissions: {
          metadata: "read",
        },
      })
      .mockResolvedValueOnce({
        installationId: "12345",
        token: "token-2",
        expiresAt: "2026-03-15T10:10:00.000Z",
        permissions: {
          metadata: "read",
        },
      });

    await cache.getOrCreate("12345", mintToken);
    nowMs = Date.parse("2026-03-15T10:00:31.000Z");
    const refreshedToken = await cache.getOrCreate("12345", mintToken);

    expect(refreshedToken.token).toBe("token-2");
    expect(mintToken).toHaveBeenCalledTimes(2);
  });
});
