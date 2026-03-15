import { describe, expect, it } from "vitest";
import { loadEnv } from "@pocket-cto/config";
import { createRawEnv } from "../../test/env";
import {
  resolveGitHubAppConfig,
  resolveGitHubWebhookConfig,
} from "./config";
import { GitHubAppConfigurationError } from "./errors";

describe("resolveGitHubAppConfig", () => {
  it("reports missing GitHub App credentials when env is unset", () => {
    const resolution = resolveGitHubAppConfig(loadEnv(createRawEnv()));

    expect(resolution).toEqual({
      status: "unconfigured",
      missing: ["GITHUB_APP_ID", "GITHUB_APP_PRIVATE_KEY_BASE64"],
    });
  });

  it("returns a configured GitHub App shape when required env is present", () => {
    const resolution = resolveGitHubAppConfig(
      loadEnv(
        createRawEnv({
          GITHUB_APP_ID: "12345",
          GITHUB_APP_PRIVATE_KEY_BASE64: Buffer.from("fake private key").toString(
            "base64",
          ),
          GITHUB_CLIENT_ID: "client-id",
          GITHUB_CLIENT_SECRET: "client-secret",
        }),
      ),
    );

    expect(resolution).toEqual({
      status: "configured",
      config: {
        apiBaseUrl: "https://api.github.com",
        appId: "12345",
        clientId: "client-id",
        clientSecret: "client-secret",
        privateKeyBase64: Buffer.from("fake private key").toString("base64"),
      },
    });
  });

  it("rejects a non-numeric GitHub App id when the required env is present", () => {
    expect(() =>
      resolveGitHubAppConfig(
        loadEnv(
          createRawEnv({
            GITHUB_APP_ID: "not-a-number",
            GITHUB_APP_PRIVATE_KEY_BASE64: Buffer.from(
              "fake private key",
            ).toString("base64"),
          }),
        ),
      ),
    ).toThrow(GitHubAppConfigurationError);
  });
});

describe("resolveGitHubWebhookConfig", () => {
  it("reports a missing webhook secret when env is unset", () => {
    const resolution = resolveGitHubWebhookConfig(loadEnv(createRawEnv()));

    expect(resolution).toEqual({
      status: "unconfigured",
      missing: ["GITHUB_WEBHOOK_SECRET"],
    });
  });

  it("returns a configured webhook shape when the secret is present", () => {
    const resolution = resolveGitHubWebhookConfig(
      loadEnv(
        createRawEnv({
          GITHUB_WEBHOOK_SECRET: "webhook-secret",
        }),
      ),
    );

    expect(resolution).toEqual({
      status: "configured",
      config: {
        secret: "webhook-secret",
      },
    });
  });
});
