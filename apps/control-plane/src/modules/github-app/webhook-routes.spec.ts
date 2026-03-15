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
});

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
