import type { Env } from "@pocket-cto/config";
import { z } from "zod";
import { GitHubAppConfigurationError } from "./errors";

const GitHubAppRequiredEnvSchema = z.object({
  GITHUB_APP_ID: z
    .string()
    .trim()
    .regex(/^\d+$/, "GITHUB_APP_ID must be numeric."),
  GITHUB_APP_PRIVATE_KEY_BASE64: z.string().trim().min(1),
  GITHUB_CLIENT_ID: z.string().trim().min(1).optional(),
  GITHUB_CLIENT_SECRET: z.string().trim().min(1).optional(),
});

const GitHubWebhookRequiredEnvSchema = z.object({
  GITHUB_WEBHOOK_SECRET: z.string().trim().min(1),
});

export const GITHUB_API_BASE_URL = "https://api.github.com";

export type GitHubAppConfig = {
  apiBaseUrl: string;
  appId: string;
  clientId: string | null;
  clientSecret: string | null;
  privateKeyBase64: string;
};

export type GitHubAppConfigResolution =
  | {
      status: "configured";
      config: GitHubAppConfig;
    }
  | {
      status: "unconfigured";
      missing: Array<"GITHUB_APP_ID" | "GITHUB_APP_PRIVATE_KEY_BASE64">;
    };

export type GitHubWebhookConfig = {
  secret: string;
};

export type GitHubWebhookConfigResolution =
  | {
      status: "configured";
      config: GitHubWebhookConfig;
    }
  | {
      status: "unconfigured";
      missing: ["GITHUB_WEBHOOK_SECRET"];
    };

type GitHubAppEnv = Pick<
  Env,
  | "GITHUB_APP_ID"
  | "GITHUB_APP_PRIVATE_KEY_BASE64"
  | "GITHUB_CLIENT_ID"
  | "GITHUB_CLIENT_SECRET"
>;

type GitHubWebhookEnv = Pick<Env, "GITHUB_WEBHOOK_SECRET">;

export function resolveGitHubAppConfig(
  env: GitHubAppEnv,
): GitHubAppConfigResolution {
  const normalized = {
    GITHUB_APP_ID: normalizeOptional(env.GITHUB_APP_ID),
    GITHUB_APP_PRIVATE_KEY_BASE64: normalizeOptional(
      env.GITHUB_APP_PRIVATE_KEY_BASE64,
    ),
    GITHUB_CLIENT_ID: normalizeOptional(env.GITHUB_CLIENT_ID),
    GITHUB_CLIENT_SECRET: normalizeOptional(env.GITHUB_CLIENT_SECRET),
  };

  const missing: Array<"GITHUB_APP_ID" | "GITHUB_APP_PRIVATE_KEY_BASE64"> = [];

  if (!normalized.GITHUB_APP_ID) {
    missing.push("GITHUB_APP_ID");
  }

  if (!normalized.GITHUB_APP_PRIVATE_KEY_BASE64) {
    missing.push("GITHUB_APP_PRIVATE_KEY_BASE64");
  }

  if (missing.length > 0) {
    return {
      status: "unconfigured",
      missing,
    };
  }

  try {
    const parsed = GitHubAppRequiredEnvSchema.parse(normalized);

    return {
      status: "configured",
      config: {
        apiBaseUrl: GITHUB_API_BASE_URL,
        appId: parsed.GITHUB_APP_ID,
        clientId: parsed.GITHUB_CLIENT_ID ?? null,
        clientSecret: parsed.GITHUB_CLIENT_SECRET ?? null,
        privateKeyBase64: parsed.GITHUB_APP_PRIVATE_KEY_BASE64,
      },
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new GitHubAppConfigurationError(
        "Invalid GitHub App configuration",
        error.issues[0]?.message ?? null,
      );
    }

    throw error;
  }
}

export function resolveGitHubWebhookConfig(
  env: GitHubWebhookEnv,
): GitHubWebhookConfigResolution {
  const normalized = normalizeOptional(env.GITHUB_WEBHOOK_SECRET);

  if (!normalized) {
    return {
      status: "unconfigured",
      missing: ["GITHUB_WEBHOOK_SECRET"],
    };
  }

  try {
    const parsed = GitHubWebhookRequiredEnvSchema.parse({
      GITHUB_WEBHOOK_SECRET: normalized,
    });

    return {
      status: "configured",
      config: {
        secret: parsed.GITHUB_WEBHOOK_SECRET,
      },
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new GitHubAppConfigurationError(
        "Invalid GitHub webhook configuration",
        error.issues[0]?.message ?? null,
      );
    }

    throw error;
  }
}

function normalizeOptional(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}
