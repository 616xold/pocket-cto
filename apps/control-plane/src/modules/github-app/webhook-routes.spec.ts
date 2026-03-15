import { afterEach, describe, expect, it } from "vitest";
import Fastify, { type FastifyInstance } from "fastify";
import { registerHttpErrorHandler } from "../../lib/http-errors";
import { InMemoryGitHubAppRepository } from "./repository";
import { GitHubAppService } from "./service";
import { InMemoryInstallationTokenCache } from "./token-cache";
import { createGitHubWebhookSignature } from "./webhook-signature";
import { registerGitHubWebhookRoutes } from "./webhook-routes";
import { InMemoryGitHubWebhookRepository } from "./webhook-repository";
import { GitHubWebhookService } from "./webhook-service";

const webhookSecret = "test-webhook-secret";
const basePayload = {
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
      metadata: "read",
    },
  },
};

describe("GitHub webhook routes", () => {
  const apps: FastifyInstance[] = [];

  afterEach(async () => {
    await Promise.all(apps.splice(0).map((app) => app.close()));
  });

  it("accepts a valid signed delivery", async () => {
    const app = await createWebhookApp(apps, {
      secret: webhookSecret,
    });
    const rawBody = Buffer.from(JSON.stringify(basePayload));

    const response = await app.inject({
      method: "POST",
      url: "/github/webhooks",
      headers: {
        "content-type": "application/json",
        "x-github-delivery": "delivery-valid",
        "x-github-event": "installation",
        "x-hub-signature-256": createGitHubWebhookSignature(
          webhookSecret,
          rawBody,
        ),
      },
      payload: rawBody,
    });

    expect(response.statusCode).toBe(202);
    expect(response.json()).toEqual({
      accepted: true,
      duplicate: false,
      deliveryId: "delivery-valid",
      eventName: "installation",
      action: "created",
      handledAs: "installation_state_updated",
      persistedAt: "2026-03-15T10:00:00.000Z",
    });
  });

  it("rejects an invalid signature", async () => {
    const app = await createWebhookApp(apps, {
      secret: webhookSecret,
    });

    const response = await app.inject({
      method: "POST",
      url: "/github/webhooks",
      headers: {
        "content-type": "application/json",
        "x-github-delivery": "delivery-bad-signature",
        "x-github-event": "installation",
        "x-hub-signature-256": "sha256=not-valid",
      },
      payload: JSON.stringify(basePayload),
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({
      error: {
        code: "github_webhook_bad_signature",
        message: "GitHub webhook signature is invalid",
      },
    });
  });

  it("returns a machine-readable error when the signature header is missing", async () => {
    const app = await createWebhookApp(apps, {
      secret: webhookSecret,
    });

    const response = await app.inject({
      method: "POST",
      url: "/github/webhooks",
      headers: {
        "content-type": "application/json",
        "x-github-delivery": "delivery-missing-signature",
        "x-github-event": "installation",
      },
      payload: JSON.stringify(basePayload),
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({
      error: {
        code: "github_webhook_missing_signature",
        message: "GitHub webhook signature header is missing",
      },
    });
  });

  it("returns a machine-readable error when the delivery id header is missing", async () => {
    const app = await createWebhookApp(apps, {
      secret: webhookSecret,
    });
    const rawBody = Buffer.from(JSON.stringify(basePayload));

    const response = await app.inject({
      method: "POST",
      url: "/github/webhooks",
      headers: {
        "content-type": "application/json",
        "x-github-event": "installation",
        "x-hub-signature-256": createGitHubWebhookSignature(
          webhookSecret,
          rawBody,
        ),
      },
      payload: rawBody,
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({
      error: {
        code: "github_webhook_missing_delivery_id",
        message: "GitHub delivery id header is missing",
      },
    });
  });

  it("returns a machine-readable error when the event header is missing", async () => {
    const app = await createWebhookApp(apps, {
      secret: webhookSecret,
    });
    const rawBody = Buffer.from(JSON.stringify(basePayload));

    const response = await app.inject({
      method: "POST",
      url: "/github/webhooks",
      headers: {
        "content-type": "application/json",
        "x-github-delivery": "delivery-missing-event",
        "x-hub-signature-256": createGitHubWebhookSignature(
          webhookSecret,
          rawBody,
        ),
      },
      payload: rawBody,
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({
      error: {
        code: "github_webhook_missing_event_name",
        message: "GitHub event name header is missing",
      },
    });
  });

  it("returns a duplicate success shape when GitHub redelivers the same delivery id", async () => {
    const app = await createWebhookApp(apps, {
      secret: webhookSecret,
    });
    const rawBody = Buffer.from(JSON.stringify(basePayload));
    const headers = {
      "content-type": "application/json",
      "x-github-delivery": "delivery-duplicate",
      "x-github-event": "installation",
      "x-hub-signature-256": createGitHubWebhookSignature(
        webhookSecret,
        rawBody,
      ),
    };

    const first = await app.inject({
      method: "POST",
      url: "/github/webhooks",
      headers,
      payload: rawBody,
    });
    const second = await app.inject({
      method: "POST",
      url: "/github/webhooks",
      headers,
      payload: rawBody,
    });

    expect(first.statusCode).toBe(202);
    expect(second.statusCode).toBe(200);
    expect(second.json()).toEqual({
      accepted: true,
      duplicate: true,
      deliveryId: "delivery-duplicate",
      eventName: "installation",
      action: "created",
      handledAs: "installation_state_updated",
      persistedAt: "2026-03-15T10:00:00.000Z",
    });
  });

  it("returns 503 when webhook ingress is not configured", async () => {
    const app = await createWebhookApp(apps, {
      secret: null,
    });

    const response = await app.inject({
      method: "POST",
      url: "/github/webhooks",
      headers: {
        "content-type": "application/json",
        "x-github-delivery": "delivery-unconfigured",
        "x-github-event": "installation",
        "x-hub-signature-256": "sha256=unused",
      },
      payload: JSON.stringify(basePayload),
    });

    expect(response.statusCode).toBe(503);
    expect(response.json()).toEqual({
      error: {
        code: "github_webhook_not_configured",
        message: "GitHub webhook ingress is not configured",
        details: [
          {
            path: "GITHUB_WEBHOOK_SECRET",
            message: "Missing required GitHub webhook env var",
          },
        ],
      },
    });
  });

  it("lists compact delivery summaries for persisted issue envelopes", async () => {
    const app = await createWebhookApp(apps, {
      secret: webhookSecret,
    });

    await postSignedDelivery(app, {
      deliveryId: "delivery-issue",
      eventName: "issues",
      payload: createIssuePayload(),
    });
    await postSignedDelivery(app, {
      deliveryId: "delivery-comment",
      eventName: "issue_comment",
      payload: createIssueCommentPayload(),
    });

    const response = await app.inject({
      method: "GET",
      url: "/github/webhooks/deliveries",
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      deliveries: expect.arrayContaining([
        expect.objectContaining({
          deliveryId: "delivery-issue",
          eventName: "issues",
          action: "opened",
          installationId: "12345",
          handledAs: "issue_envelope_recorded",
          persistedAt: "2026-03-15T10:00:00.000Z",
          payloadPreview: {
            repositoryFullName: "616xold/pocket-cto",
            issueId: "700",
            issueNumber: 42,
          },
        }),
        expect.objectContaining({
          deliveryId: "delivery-comment",
          eventName: "issue_comment",
          action: "created",
          installationId: "12345",
          handledAs: "issue_comment_envelope_recorded",
          persistedAt: "2026-03-15T10:00:00.000Z",
          payloadPreview: {
            repositoryFullName: "616xold/pocket-cto",
            issueNumber: 42,
            commentId: "900",
          },
        }),
      ]),
    });
  });

  it("returns a single compact delivery summary by delivery id", async () => {
    const app = await createWebhookApp(apps, {
      secret: webhookSecret,
    });

    await postSignedDelivery(app, {
      deliveryId: "delivery-detail",
      eventName: "issue_comment",
      payload: createIssueCommentPayload(),
    });

    const response = await app.inject({
      method: "GET",
      url: "/github/webhooks/deliveries/delivery-detail",
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      delivery: expect.objectContaining({
        deliveryId: "delivery-detail",
        eventName: "issue_comment",
        action: "created",
        installationId: "12345",
        handledAs: "issue_comment_envelope_recorded",
        persistedAt: "2026-03-15T10:00:00.000Z",
        payloadPreview: {
          repositoryFullName: "616xold/pocket-cto",
          issueNumber: 42,
          commentId: "900",
        },
      }),
    });
  });

  it("returns 404 when a delivery id is not found", async () => {
    const app = await createWebhookApp(apps, {
      secret: webhookSecret,
    });

    const response = await app.inject({
      method: "GET",
      url: "/github/webhooks/deliveries/missing-delivery",
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({
      error: {
        code: "github_webhook_delivery_not_found",
        message: "GitHub webhook delivery not found",
      },
    });
  });

  it("filters delivery summaries by event, handledAs outcome, and installation id", async () => {
    const app = await createWebhookApp(apps, {
      secret: webhookSecret,
    });

    await postSignedDelivery(app, {
      deliveryId: "delivery-installation",
      eventName: "installation",
      payload: basePayload,
    });
    await postSignedDelivery(app, {
      deliveryId: "delivery-issue-filtered",
      eventName: "issues",
      payload: createIssuePayload(),
    });
    await postSignedDelivery(app, {
      deliveryId: "delivery-issue-other-installation",
      eventName: "issues",
      payload: createIssuePayload({
        installation: {
          id: 99999,
        },
      }),
    });

    const response = await app.inject({
      method: "GET",
      url: "/github/webhooks/deliveries?eventName=issues&handledAs=issue_envelope_recorded&installationId=12345",
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      deliveries: [
        expect.objectContaining({
          deliveryId: "delivery-issue-filtered",
          eventName: "issues",
          handledAs: "issue_envelope_recorded",
          installationId: "12345",
        }),
      ],
    });
  });
});

async function postSignedDelivery(
  app: FastifyInstance,
  input: {
    deliveryId: string;
    eventName: string;
    payload: Record<string, unknown>;
  },
) {
  const rawBody = Buffer.from(JSON.stringify(input.payload));

  const response = await app.inject({
    method: "POST",
    url: "/github/webhooks",
    headers: {
      "content-type": "application/json",
      "x-github-delivery": input.deliveryId,
      "x-github-event": input.eventName,
      "x-hub-signature-256": createGitHubWebhookSignature(
        webhookSecret,
        rawBody,
      ),
    },
    payload: rawBody,
  });

  expect(response.statusCode).toBe(202);
}

function createIssuePayload(
  overrides: Partial<Record<string, unknown>> = {},
) {
  return {
    action: "opened",
    installation: {
      id: 12345,
      ...(overrides.installation as Record<string, unknown> | undefined),
    },
    repository: createRepository(),
    issue: {
      id: 700,
      number: 42,
      ...(overrides.issue as Record<string, unknown> | undefined),
    },
    ...overrides,
  };
}

function createIssueCommentPayload(
  overrides: Partial<Record<string, unknown>> = {},
) {
  return {
    ...createIssuePayload(overrides),
    action: "created",
    comment: {
      id: 900,
      ...(overrides.comment as Record<string, unknown> | undefined),
    },
  };
}

function createRepository(
  overrides: Partial<Record<string, unknown>> = {},
) {
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

async function createWebhookApp(
  apps: FastifyInstance[],
  options: {
    secret: string | null;
  },
) {
  const app = Fastify();
  const githubAppService = new GitHubAppService({
    client: null,
    config: {
      status: "unconfigured",
      missing: ["GITHUB_APP_ID", "GITHUB_APP_PRIVATE_KEY_BASE64"],
    },
    repository: new InMemoryGitHubAppRepository(),
    tokenCache: new InMemoryInstallationTokenCache(),
  });
  const githubWebhookService = new GitHubWebhookService({
    config: options.secret
      ? {
          status: "configured",
          config: {
            secret: options.secret,
          },
        }
      : {
          status: "unconfigured",
          missing: ["GITHUB_WEBHOOK_SECRET"],
        },
    githubAppService,
    now: () => new Date("2026-03-15T10:00:00.000Z"),
    repository: new InMemoryGitHubWebhookRepository(),
  });

  registerHttpErrorHandler(app);
  await registerGitHubWebhookRoutes(app, {
    githubWebhookService,
  });

  apps.push(app);
  return app;
}
