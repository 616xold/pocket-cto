import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import {
  closeTestDatabase,
  createTestDb,
  resetTestDatabase,
} from "../../test/database";
import type { GitHubAppConfigResolution } from "./config";
import { DrizzleGitHubAppRepository } from "./drizzle-repository";
import { GitHubAppNotConfiguredError } from "./errors";
import { GitHubAppService } from "./service";
import { InMemoryInstallationTokenCache } from "./token-cache";

const db = createTestDb();

describe("GitHubAppService", () => {
  const repository = new DrizzleGitHubAppRepository(db);

  beforeEach(async () => {
    await resetTestDatabase();
  });

  afterAll(async () => {
    await closeTestDatabase();
  });

  it("syncs GitHub installations from the client and upserts them durably", async () => {
    const service = new GitHubAppService({
      client: {
        createInstallationAccessToken: vi.fn(),
        listInstallations: vi
          .fn()
          .mockResolvedValueOnce([
            {
              installationId: "12345",
              appId: "98765",
              accountLogin: "616xold",
              accountType: "Organization",
              targetType: "Organization",
              targetId: "6161234",
              suspendedAt: null,
              permissions: {
                metadata: "read",
              },
            },
          ])
          .mockResolvedValueOnce([
            {
              installationId: "12345",
              appId: "98765",
              accountLogin: "616xold",
              accountType: "Organization",
              targetType: "Organization",
              targetId: "6161234",
              suspendedAt: "2026-03-15T10:05:00.000Z",
              permissions: {
                contents: "write",
                metadata: "read",
              },
            },
          ]),
      },
      config: createConfiguredGitHubAppConfig(),
      now: () => new Date("2026-03-15T10:00:00.000Z"),
      repository,
      tokenCache: new InMemoryInstallationTokenCache(),
    });

    const firstSync = await service.syncInstallations();
    const secondSync = await service.syncInstallations();
    const persistedInstallations = await service.listInstallations();

    expect(firstSync.syncedCount).toBe(1);
    expect(secondSync.syncedCount).toBe(1);
    expect(persistedInstallations).toHaveLength(1);
    expect(persistedInstallations[0]).toMatchObject({
      installationId: "12345",
      appId: "98765",
      accountLogin: "616xold",
      accountType: "Organization",
      targetType: "Organization",
      targetId: "6161234",
      suspendedAt: "2026-03-15T10:05:00.000Z",
      permissions: {
        contents: "write",
        metadata: "read",
      },
      lastSyncedAt: "2026-03-15T10:00:00.000Z",
    });
  });

  it("rejects sync when the GitHub App is not configured", async () => {
    const service = new GitHubAppService({
      client: null,
      config: {
        status: "unconfigured",
        missing: ["GITHUB_APP_ID", "GITHUB_APP_PRIVATE_KEY_BASE64"],
      },
      repository,
      tokenCache: new InMemoryInstallationTokenCache(),
    });

    await expect(service.syncInstallations()).rejects.toBeInstanceOf(
      GitHubAppNotConfiguredError,
    );
  });
});

function createConfiguredGitHubAppConfig(): GitHubAppConfigResolution {
  return {
    status: "configured",
    config: {
      apiBaseUrl: "https://api.github.com",
      appId: "98765",
      clientId: null,
      clientSecret: null,
      privateKeyBase64: Buffer.from("unused for mocked client").toString(
        "base64",
      ),
    },
  };
}
