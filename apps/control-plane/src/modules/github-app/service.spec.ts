import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { repositories } from "@pocket-cto/db";
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
const defaultTokenExpiry = "2026-03-15T11:00:00.000Z";

describe("GitHubAppService", () => {
  const repository = new DrizzleGitHubAppRepository(db);

  beforeEach(async () => {
    await resetTestDatabase();
  });

  afterAll(async () => {
    await closeTestDatabase();
  });

  it("syncs one installation and persists repository registry rows durably", async () => {
    await repository.upsertInstallation(
      createInstallationSnapshot({
        installationId: "12345",
      }),
    );

    const service = new GitHubAppService({
      client: {
        createInstallationAccessToken: vi
          .fn()
          .mockResolvedValue(createInstallationAccessToken("12345")),
        listInstallationRepositories: vi.fn().mockResolvedValue([
          createRepositorySnapshot({
            githubRepositoryId: "100",
            fullName: "616xold/pocket-cto",
            ownerLogin: "616xold",
            name: "pocket-cto",
            defaultBranch: "main",
            isPrivate: true,
          }),
        ]),
        listInstallations: vi.fn(),
      },
      config: createConfiguredGitHubAppConfig(),
      now: () => new Date("2026-03-15T10:00:00.000Z"),
      repository,
      tokenCache: new InMemoryInstallationTokenCache(),
    });

    const result = await service.syncInstallationRepositories("12345");
    const listed = await service.listInstallationRepositories("12345");
    const [row] = await db.select().from(repositories);

    expect(result).toMatchObject({
      installation: {
        installationId: "12345",
        accountLogin: "616xold",
      },
      syncedAt: "2026-03-15T10:00:00.000Z",
      syncedRepositoryCount: 1,
      activeRepositoryCount: 1,
      inactiveRepositoryCount: 0,
    });
    expect(listed.repositories).toEqual([
      expect.objectContaining({
        installationId: "12345",
        githubRepositoryId: "100",
        fullName: "616xold/pocket-cto",
        ownerLogin: "616xold",
        name: "pocket-cto",
        defaultBranch: "main",
        visibility: "private",
        archived: false,
        disabled: false,
        isActive: true,
        lastSyncedAt: "2026-03-15T10:00:00.000Z",
        removedFromInstallationAt: null,
      }),
    ]);
    expect(row).toMatchObject({
      installationId: "12345",
      githubRepositoryId: "100",
      fullName: "616xold/pocket-cto",
      ownerLogin: "616xold",
      name: "pocket-cto",
      defaultBranch: "main",
      isPrivate: true,
      archived: false,
      disabled: false,
      isActive: true,
    });
    expect(row?.lastSyncedAt?.toISOString()).toBe("2026-03-15T10:00:00.000Z");
  });

  it("syncs repositories for all persisted installations", async () => {
    await repository.upsertInstallation(
      createInstallationSnapshot({
        installationId: "12345",
        accountLogin: "616xold",
      }),
    );
    await repository.upsertInstallation(
      createInstallationSnapshot({
        installationId: "67890",
        accountLogin: "pocket-cto",
        targetId: "67890",
      }),
    );

    const service = new GitHubAppService({
      client: {
        createInstallationAccessToken: vi
          .fn()
          .mockImplementation(async (installationId: string) =>
            createInstallationAccessToken(installationId),
          ),
        listInstallationRepositories: vi
          .fn()
          .mockImplementation(async (installationAccessToken: string) => {
            if (installationAccessToken === "token-12345") {
              return [
                createRepositorySnapshot({
                  githubRepositoryId: "100",
                  fullName: "616xold/pocket-cto",
                  ownerLogin: "616xold",
                  name: "pocket-cto",
                }),
                createRepositorySnapshot({
                  githubRepositoryId: "101",
                  fullName: "616xold/pocket-cto-web",
                  ownerLogin: "616xold",
                  name: "pocket-cto-web",
                }),
              ];
            }

            return [
              createRepositorySnapshot({
                githubRepositoryId: "200",
                fullName: "pocket-cto/control-plane",
                ownerLogin: "pocket-cto",
                name: "control-plane",
                defaultBranch: "trunk",
                isPrivate: true,
              }),
            ];
          }),
        listInstallations: vi.fn(),
      },
      config: createConfiguredGitHubAppConfig(),
      now: () => new Date("2026-03-15T10:00:00.000Z"),
      repository,
      tokenCache: new InMemoryInstallationTokenCache(),
    });

    const result = await service.syncRepositories();
    const listed = await service.listRepositories();

    expect(result.syncedInstallationCount).toBe(2);
    expect(result.syncedRepositoryCount).toBe(3);
    expect(result.installations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          installation: expect.objectContaining({
            installationId: "12345",
            accountLogin: "616xold",
          }),
          syncedRepositoryCount: 2,
          activeRepositoryCount: 2,
          inactiveRepositoryCount: 0,
        }),
        expect.objectContaining({
          installation: expect.objectContaining({
            installationId: "67890",
            accountLogin: "pocket-cto",
          }),
          syncedRepositoryCount: 1,
          activeRepositoryCount: 1,
          inactiveRepositoryCount: 0,
        }),
      ]),
    );
    expect(listed.repositories).toHaveLength(3);
  });

  it("marks repositories inactive when a sync no longer sees them", async () => {
    await repository.upsertInstallation(
      createInstallationSnapshot({
        installationId: "12345",
      }),
    );
    await repository.upsertInstallationRepositories({
      installationId: "12345",
      lastSyncedAt: "2026-03-15T09:55:00.000Z",
      repositories: [
        createRepositorySnapshot({
          githubRepositoryId: "100",
          fullName: "616xold/pocket-cto",
          ownerLogin: "616xold",
          name: "pocket-cto",
        }),
        createRepositorySnapshot({
          githubRepositoryId: "101",
          fullName: "616xold/pocket-cto-web",
          ownerLogin: "616xold",
          name: "pocket-cto-web",
        }),
      ],
    });

    const service = new GitHubAppService({
      client: {
        createInstallationAccessToken: vi
          .fn()
          .mockResolvedValue(createInstallationAccessToken("12345")),
        listInstallationRepositories: vi.fn().mockResolvedValue([
          createRepositorySnapshot({
            githubRepositoryId: "101",
            fullName: "616xold/pocket-cto-web",
            ownerLogin: "616xold",
            name: "pocket-cto-web",
          }),
        ]),
        listInstallations: vi.fn(),
      },
      config: createConfiguredGitHubAppConfig(),
      now: () => new Date("2026-03-15T10:00:00.000Z"),
      repository,
      tokenCache: new InMemoryInstallationTokenCache(),
    });

    const result = await service.syncInstallationRepositories("12345");
    const listed = await service.listInstallationRepositories("12345");

    expect(result).toMatchObject({
      syncedRepositoryCount: 1,
      activeRepositoryCount: 1,
      inactiveRepositoryCount: 1,
    });
    expect(listed.repositories).toEqual([
      expect.objectContaining({
        githubRepositoryId: "101",
        isActive: true,
        removedFromInstallationAt: null,
      }),
      expect.objectContaining({
        githubRepositoryId: "100",
        isActive: false,
        removedFromInstallationAt: "2026-03-15T10:00:00.000Z",
        lastSyncedAt: "2026-03-15T10:00:00.000Z",
      }),
    ]);
  });

  it("rejects repository sync when the GitHub App is not configured", async () => {
    const service = new GitHubAppService({
      client: null,
      config: {
        status: "unconfigured",
        missing: ["GITHUB_APP_ID", "GITHUB_APP_PRIVATE_KEY_BASE64"],
      },
      repository,
      tokenCache: new InMemoryInstallationTokenCache(),
    });

    await expect(
      service.syncInstallationRepositories("12345"),
    ).rejects.toBeInstanceOf(GitHubAppNotConfiguredError);
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

function createInstallationAccessToken(installationId: string) {
  return {
    installationId,
    token: `token-${installationId}`,
    expiresAt: defaultTokenExpiry,
    permissions: {
      metadata: "read",
    },
  };
}

function createInstallationSnapshot(
  overrides: Partial<{
    installationId: string;
    appId: string;
    accountLogin: string;
    accountType: string;
    targetId: string;
    targetType: string;
  }> = {},
) {
  return {
    installationId: overrides.installationId ?? "12345",
    appId: overrides.appId ?? "98765",
    accountLogin: overrides.accountLogin ?? "616xold",
    accountType: overrides.accountType ?? "Organization",
    targetType: overrides.targetType ?? "Organization",
    targetId: overrides.targetId ?? "6161234",
    suspendedAt: null,
    permissions: {
      metadata: "read",
    },
  };
}

function createRepositorySnapshot(
  overrides: Partial<{
    githubRepositoryId: string;
    fullName: string;
    ownerLogin: string;
    name: string;
    defaultBranch: string;
    isPrivate: boolean;
    archived: boolean;
    disabled: boolean;
    language: string | null;
  }> = {},
) {
  return {
    githubRepositoryId: overrides.githubRepositoryId ?? "100",
    fullName: overrides.fullName ?? "616xold/pocket-cto",
    ownerLogin: overrides.ownerLogin ?? "616xold",
    name: overrides.name ?? "pocket-cto",
    defaultBranch: overrides.defaultBranch ?? "main",
    isPrivate: overrides.isPrivate ?? false,
    archived: overrides.archived ?? false,
    disabled: overrides.disabled ?? false,
    language: overrides.language ?? "TypeScript",
  };
}
