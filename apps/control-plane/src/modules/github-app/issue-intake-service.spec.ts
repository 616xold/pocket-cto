import { count, eq } from "drizzle-orm";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import {
  githubIssueMissionBindings,
  missions,
} from "@pocket-cto/db";
import { closeTestDatabase, createTestDb, resetTestDatabase } from "../../test/database";
import { EvidenceService } from "../evidence/service";
import { DrizzleMissionRepository } from "../missions/drizzle-repository";
import { StubMissionCompiler } from "../missions/compiler";
import { MissionService } from "../missions/service";
import { DrizzleReplayRepository } from "../replay/drizzle-repository";
import { ReplayService } from "../replay/service";
import { DrizzleGitHubAppRepository } from "./drizzle-repository";
import { GitHubIssueIntakeNonIssueDeliveryError } from "./errors";
import { DrizzleGitHubIssueIntakeRepository } from "./issue-intake-drizzle-repository";
import { GitHubIssueIntakeService } from "./issue-intake-service";
import { InMemoryInstallationTokenCache } from "./token-cache";
import { createGitHubWebhookSignature } from "./webhook-signature";
import { DrizzleGitHubWebhookRepository } from "./webhook-drizzle-repository";
import { GitHubWebhookService } from "./webhook-service";
import { GitHubAppService } from "./service";

const db = createTestDb();
const webhookSecret = "db-issue-intake-webhook-secret";

describe("GitHubIssueIntakeService", () => {
  beforeEach(async () => {
    await resetTestDatabase();
  });

  afterAll(async () => {
    await closeTestDatabase();
  });

  it("lists actionable issue summaries from persisted issue envelopes and comment activity", async () => {
    const webhookService = createWebhookService();
    const intakeService = createIssueIntakeService();

    await ingest(webhookService, {
      deliveryId: "delivery-issue-42",
      eventName: "issues",
      payload: createIssuePayload({
        issue: {
          comments: 2,
          id: 700,
          number: 42,
          title: "Ship GitHub issue intake",
        },
      }),
    });
    await ingest(webhookService, {
      deliveryId: "delivery-issue-comment-42",
      eventName: "issue_comment",
      payload: createIssueCommentPayload({
        comment: {
          id: 900,
        },
        issue: {
          comments: 2,
          id: 700,
          number: 42,
          title: "Ship GitHub issue intake",
        },
      }),
    });

    const summary = await intakeService.listIssues();

    expect(summary.issues).toHaveLength(1);
    expect(summary.issues[0]).toMatchObject({
      deliveryId: "delivery-issue-42",
      repoFullName: "616xold/pocket-cto",
      issueNumber: 42,
      issueTitle: "Ship GitHub issue intake",
      issueState: "open",
      senderLogin: "octo-operator",
      sourceRef: "https://github.com/616xold/pocket-cto/issues/42",
      commentCount: 2,
      hasCommentActivity: true,
      isBound: false,
      boundMissionId: null,
      boundMissionStatus: null,
    });
  });

  it("rejects non-issue deliveries explicitly when asked to create a mission", async () => {
    const webhookService = createWebhookService();
    const intakeService = createIssueIntakeService();

    await ingest(webhookService, {
      deliveryId: "delivery-issue-comment-only",
      eventName: "issue_comment",
      payload: createIssueCommentPayload({
        comment: {
          id: 901,
        },
        issue: {
          comments: 1,
          id: 701,
          number: 43,
          title: "Comment-only envelope",
        },
      }),
    });

    await expect(
      intakeService.createMissionFromDelivery("delivery-issue-comment-only"),
    ).rejects.toBeInstanceOf(GitHubIssueIntakeNonIssueDeliveryError);
  });

  it("creates a mission from a persisted issue delivery with truthful source and repo context", async () => {
    const webhookService = createWebhookService();
    const intakeService = createIssueIntakeService();

    await ingest(webhookService, {
      deliveryId: "delivery-issue-create",
      eventName: "issues",
      payload: createIssuePayload({
        issue: {
          body: "Take the already-stored GitHub issue envelope and create one build mission from it.",
          comments: 0,
          id: 702,
          number: 44,
          title: "Create a mission from a GitHub issue",
        },
        repository: createRepository({
          full_name: "616xold/pocket-cto",
        }),
      }),
    });

    const created = await intakeService.createMissionFromDelivery(
      "delivery-issue-create",
    );
    const [missionRow] = await db
      .select()
      .from(missions)
      .where(eq(missions.id, created.mission.id))
      .limit(1);
    const bindingRows = await db.select().from(githubIssueMissionBindings);

    expect(created.outcome).toBe("created");
    expect(created.mission.sourceKind).toBe("github_issue");
    expect(created.mission.sourceRef).toBe(
      "https://github.com/616xold/pocket-cto/issues/44",
    );
    expect(created.mission.primaryRepo).toBe("616xold/pocket-cto");
    expect(created.mission.spec.repos).toEqual(["616xold/pocket-cto"]);
    expect(created.mission.title).toBe("Create a mission from a GitHub issue");
    expect(created.mission.objective).toContain(
      "Take the already-stored GitHub issue envelope",
    );
    expect(missionRow).toMatchObject({
      id: created.mission.id,
      sourceKind: "github_issue",
      sourceRef: "https://github.com/616xold/pocket-cto/issues/44",
      primaryRepo: "616xold/pocket-cto",
    });
    expect(bindingRows).toHaveLength(1);
    expect(bindingRows[0]).toMatchObject({
      repoFullName: "616xold/pocket-cto",
      issueNumber: 44,
      issueId: "702",
      latestSourceDeliveryId: "delivery-issue-create",
      missionId: created.mission.id,
    });
  });

  it("returns the same mission for repeated create attempts on the same issue identity", async () => {
    const webhookService = createWebhookService();
    const intakeService = createIssueIntakeService();

    await ingest(webhookService, {
      deliveryId: "delivery-issue-opened",
      eventName: "issues",
      payload: createIssuePayload({
        action: "opened",
        issue: {
          body: "First envelope for the issue.",
          comments: 0,
          id: 703,
          number: 45,
          title: "Idempotent issue mission",
        },
      }),
    });
    await ingest(webhookService, {
      deliveryId: "delivery-issue-edited",
      eventName: "issues",
      payload: createIssuePayload({
        action: "edited",
        issue: {
          body: "Edited envelope for the same issue.",
          comments: 1,
          id: 703,
          number: 45,
          title: "Idempotent issue mission",
        },
      }),
    });

    const first = await intakeService.createMissionFromDelivery(
      "delivery-issue-opened",
    );
    const second = await intakeService.createMissionFromDelivery(
      "delivery-issue-edited",
    );
    const [bindingCount] = await db
      .select({ count: count() })
      .from(githubIssueMissionBindings);
    const [missionCount] = await db.select({ count: count() }).from(missions);
    const [bindingRow] = await db
      .select()
      .from(githubIssueMissionBindings)
      .where(eq(githubIssueMissionBindings.issueId, "703"))
      .limit(1);

    expect(first.outcome).toBe("created");
    expect(second.outcome).toBe("already_bound");
    expect(second.mission.id).toBe(first.mission.id);
    expect(bindingCount?.count).toBe(1);
    expect(missionCount?.count).toBe(1);
    expect(bindingRow).toMatchObject({
      issueId: "703",
      missionId: first.mission.id,
      latestSourceDeliveryId: "delivery-issue-edited",
    });
  });
});

function createIssueIntakeService() {
  const missionRepository = new DrizzleMissionRepository(db);
  const replayService = new ReplayService(
    new DrizzleReplayRepository(db),
    missionRepository,
  );
  const missionService = new MissionService(
    new StubMissionCompiler(),
    missionRepository,
    replayService,
    new EvidenceService(),
  );

  return new GitHubIssueIntakeService({
    bindingRepository: new DrizzleGitHubIssueIntakeRepository(db),
    missionRepository,
    missionService,
    webhookRepository: new DrizzleGitHubWebhookRepository(db),
  });
}

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
      now: () => new Date("2026-03-16T01:55:00.000Z"),
      repository: githubAppRepository,
      tokenCache: new InMemoryInstallationTokenCache(),
    }),
    now: () => new Date("2026-03-16T01:55:00.000Z"),
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

function createIssuePayload(
  overrides: Partial<Record<string, unknown>> = {},
) {
  const issueOverrides = readNestedRecord(overrides, "issue");
  const repositoryOverrides = readNestedRecord(overrides, "repository");
  const senderOverrides = readNestedRecord(overrides, "sender");
  const { issue: _issue, repository: _repository, sender: _sender, ...rest } =
    overrides;
  const repository = createRepository({
    full_name: "616xold/pocket-cto",
    ...repositoryOverrides,
  });
  const issueNumber =
    typeof issueOverrides.number === "number" ? issueOverrides.number : 42;
  const issueHtmlUrl =
    typeof issueOverrides.html_url === "string"
      ? issueOverrides.html_url
      : `https://github.com/${repository.full_name}/issues/${issueNumber}`;

  return {
    action: "opened",
    installation: {
      id: 12345,
    },
    repository,
    sender: {
      login: "octo-operator",
      ...senderOverrides,
    },
    issue: {
      id: 700,
      node_id: "I_kwDOIssue700",
      number: issueNumber,
      title: "Ship GitHub issue intake",
      body: "Turn the stored GitHub issue envelope into a build mission.",
      state: "open",
      html_url: issueHtmlUrl,
      comments: 0,
      ...issueOverrides,
    },
    ...rest,
  };
}

function createIssueCommentPayload(
  overrides: Partial<Record<string, unknown>> = {},
) {
  const commentOverrides = readNestedRecord(overrides, "comment");
  const issueOverrides = readNestedRecord(overrides, "issue");
  const { comment: _comment, issue: _issue, ...rest } = overrides;

  return {
    ...createIssuePayload(rest),
    comment: {
      id: 900,
      node_id: "IC_kwDOComment900",
      ...commentOverrides,
    },
    issue: {
      ...createIssuePayload(rest).issue,
      ...issueOverrides,
    },
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

function readNestedRecord(
  input: Partial<Record<string, unknown>>,
  key: string,
): Record<string, unknown> {
  const value = input[key];

  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}
