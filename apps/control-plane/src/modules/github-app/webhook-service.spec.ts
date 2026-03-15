import { count } from "drizzle-orm";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import {
  githubInstallations,
  githubWebhookDeliveries,
  missions,
  repositories,
} from "@pocket-cto/db";
import {
  closeTestDatabase,
  createTestDb,
  resetTestDatabase,
} from "../../test/database";
import { DrizzleGitHubAppRepository } from "./drizzle-repository";
import { GitHubAppService } from "./service";
import { InMemoryInstallationTokenCache } from "./token-cache";
import { createGitHubWebhookSignature } from "./webhook-signature";
import { DrizzleGitHubWebhookRepository } from "./webhook-drizzle-repository";
import { GitHubWebhookService } from "./webhook-service";

const db = createTestDb();
const webhookSecret = "db-webhook-secret";

describe("GitHubWebhookService", () => {
  beforeEach(async () => {
    await resetTestDatabase();
  });

  afterAll(async () => {
    await closeTestDatabase();
  });

  it("treats a repeated delivery id as idempotent and does not duplicate side effects", async () => {
    const service = createWebhookService();
    const payload = createInstallationPayload({
      suspended_at: null,
    });

    const first = await ingest(service, {
      deliveryId: "delivery-repeat",
      eventName: "installation",
      payload,
    });
    const second = await ingest(service, {
      deliveryId: "delivery-repeat",
      eventName: "installation",
      payload,
    });

    const [deliveryCount] = await db
      .select({ count: count() })
      .from(githubWebhookDeliveries);
    const [installationCount] = await db
      .select({ count: count() })
      .from(githubInstallations);

    expect(first.duplicate).toBe(false);
    expect(second).toEqual({
      accepted: true,
      duplicate: true,
      deliveryId: "delivery-repeat",
      eventName: "installation",
      action: "created",
      handledAs: "installation_state_updated",
      persistedAt: "2026-03-15T10:00:00.000Z",
    });
    expect(deliveryCount?.count).toBe(1);
    expect(installationCount?.count).toBe(1);
  });

  it("updates persisted installation state from installation events", async () => {
    const service = createWebhookService();

    await ingest(service, {
      deliveryId: "delivery-installation",
      eventName: "installation",
      payload: createInstallationPayload({
        action: "suspend",
        installation: {
          suspended_at: "2026-03-15T09:59:00.000Z",
        },
      }),
    });

    const installationRows = await db.select().from(githubInstallations);
    const deliveryRows = await db.select().from(githubWebhookDeliveries);

    expect(installationRows).toHaveLength(1);
    expect(installationRows[0]).toMatchObject({
      installationId: "12345",
      appId: "98765",
      accountLogin: "616xold",
      accountType: "Organization",
      targetType: "Organization",
      targetId: "6161234",
    });
    expect(installationRows[0]?.suspendedAt?.toISOString()).toBe(
      "2026-03-15T09:59:00.000Z",
    );
    expect(deliveryRows).toHaveLength(1);
    expect(deliveryRows[0]).toMatchObject({
      deliveryId: "delivery-installation",
      eventName: "installation",
      action: "suspend",
      installationId: "12345",
      outcome: "installation_state_updated",
    });
  });

  it("updates persisted repository linkage from installation_repositories events", async () => {
    const service = createWebhookService();

    await ingest(service, {
      deliveryId: "delivery-repos-add",
      eventName: "installation_repositories",
      payload: createInstallationRepositoriesPayload({
        repositories_added: [
          createRepository({
            id: 100,
            full_name: "616xold/pocket-cto",
            default_branch: "main",
            language: "TypeScript",
          }),
          createRepository({
            id: 101,
            full_name: "616xold/pocket-cto-web",
            default_branch: "trunk",
            language: "TypeScript",
          }),
        ],
      }),
    });

    await ingest(service, {
      deliveryId: "delivery-repos-remove",
      eventName: "installation_repositories",
      payload: createInstallationRepositoriesPayload({
        action: "removed",
        repositories_added: [
          createRepository({
            id: 102,
            full_name: "616xold/pocket-cto-worker",
            default_branch: "main",
            language: "TypeScript",
          }),
        ],
        repositories_removed: [
          createRepository({
            id: 100,
            full_name: "616xold/pocket-cto",
          }),
        ],
      }),
    });

    const installationRows = await db.select().from(githubInstallations);
    const repositoryRows = await db
      .select()
      .from(repositories)
      .orderBy(repositories.fullName);

    expect(installationRows).toHaveLength(1);
    expect(repositoryRows).toHaveLength(3);
    expect(repositoryRows.map((row) => row.githubRepositoryId)).toEqual([
      "100",
      "101",
      "102",
    ]);
    expect(repositoryRows.map((row) => row.fullName)).toEqual([
      "616xold/pocket-cto",
      "616xold/pocket-cto-web",
      "616xold/pocket-cto-worker",
    ]);
    expect(repositoryRows.map((row) => row.installationId)).toEqual([
      "12345",
      "12345",
      "12345",
    ]);
    expect(repositoryRows.map((row) => row.isActive)).toEqual([
      false,
      true,
      true,
    ]);
    expect(repositoryRows[0]?.removedFromInstallationAt?.toISOString()).toBe(
      "2026-03-15T10:00:00.000Z",
    );
  });

  it("durably accepts issues and issue_comment envelopes without creating missions", async () => {
    const service = createWebhookService();

    const issueResult = await ingest(service, {
      deliveryId: "delivery-issue",
      eventName: "issues",
      payload: {
        action: "opened",
        installation: {
          id: 12345,
        },
        repository: createRepository({
          id: 100,
          full_name: "616xold/pocket-cto",
          default_branch: "main",
          language: "TypeScript",
        }),
        issue: {
          id: 700,
          number: 42,
        },
      },
    });
    const commentResult = await ingest(service, {
      deliveryId: "delivery-issue-comment",
      eventName: "issue_comment",
      payload: {
        action: "created",
        installation: {
          id: 12345,
        },
        repository: createRepository({
          id: 100,
          full_name: "616xold/pocket-cto",
          default_branch: "main",
          language: "TypeScript",
        }),
        issue: {
          id: 700,
          number: 42,
        },
        comment: {
          id: 900,
        },
      },
    });

    const deliveryRows = await db
      .select()
      .from(githubWebhookDeliveries)
      .orderBy(githubWebhookDeliveries.deliveryId);
    const [missionCount] = await db.select({ count: count() }).from(missions);
    const [installationCount] = await db
      .select({ count: count() })
      .from(githubInstallations);

    expect(issueResult.handledAs).toBe("issue_envelope_recorded");
    expect(commentResult.handledAs).toBe("issue_comment_envelope_recorded");
    expect(deliveryRows).toHaveLength(2);
    expect(deliveryRows.map((row) => row.outcome)).toEqual([
      "issue_envelope_recorded",
      "issue_comment_envelope_recorded",
    ]);
    expect(missionCount?.count).toBe(0);
    expect(installationCount?.count).toBe(0);
  });
});

function createWebhookService() {
  const githubAppRepository = new DrizzleGitHubAppRepository(db);

  return new GitHubWebhookService({
    config: {
      status: "configured",
      config: {
        secret: webhookSecret,
      },
    },
    githubAppService: new GitHubAppService({
      client: null,
      config: {
        status: "unconfigured",
        missing: ["GITHUB_APP_ID", "GITHUB_APP_PRIVATE_KEY_BASE64"],
      },
      now: () => new Date("2026-03-15T10:00:00.000Z"),
      repository: githubAppRepository,
      tokenCache: new InMemoryInstallationTokenCache(),
    }),
    now: () => new Date("2026-03-15T10:00:00.000Z"),
    repository: new DrizzleGitHubWebhookRepository(db),
  });
}

async function ingest(
  service: GitHubWebhookService,
  input: {
    deliveryId: string;
    eventName: string;
    payload: Record<string, unknown>;
  },
) {
  const rawBody = Buffer.from(JSON.stringify(input.payload));

  return service.ingest({
    deliveryId: input.deliveryId,
    eventName: input.eventName,
    signature: createGitHubWebhookSignature(webhookSecret, rawBody),
    rawBody,
  });
}

function createInstallationPayload(
  overrides: Partial<Record<string, unknown>> = {},
) {
  const installationOverrideCandidate = overrides.installation;
  const installationOverrides =
    installationOverrideCandidate &&
    typeof installationOverrideCandidate === "object" &&
    !Array.isArray(installationOverrideCandidate)
      ? installationOverrideCandidate
      : {};
  const { installation: _installation, ...restOverrides } = overrides;

  return {
    action: "created",
    installation: {
      id: 12345,
      app_id: 98765,
      target_id: 6161234,
      target_type: "Organization",
      account: {
        id: 6161234,
        login: "616xold",
        type: "Organization",
      },
      suspended_at: null,
      permissions: {
        contents: "write",
        metadata: "read",
      },
      ...installationOverrides,
    },
    ...restOverrides,
  };
}

function createInstallationRepositoriesPayload(
  overrides: Partial<Record<string, unknown>> = {},
) {
  return {
    action: "added",
    installation: {
      id: 12345,
      app_id: 98765,
      target_id: 6161234,
      target_type: "Organization",
      account: {
        id: 6161234,
        login: "616xold",
        type: "Organization",
      },
      suspended_at: null,
      permissions: {
        contents: "write",
        metadata: "read",
      },
    },
    repositories_added: [],
    repositories_removed: [],
    ...overrides,
  };
}

function createRepository(overrides: Partial<Record<string, unknown>>) {
  const fullName =
    typeof overrides.full_name === "string" ? overrides.full_name : "616xold/pocket-cto";
  const [ownerLogin = "616xold", name = "pocket-cto"] = fullName.split("/");

  return {
    id: 100,
    full_name: fullName,
    name,
    owner: {
      login: ownerLogin,
    },
    default_branch: "main",
    private: false,
    archived: false,
    disabled: false,
    language: "TypeScript",
    ...overrides,
  };
}
