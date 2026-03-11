import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { z } from "zod";

export const EnvSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  CONTROL_PLANE_PORT: z.coerce.number().int().positive().default(4000),
  WEB_PORT: z.coerce.number().int().positive().default(3000),
  PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  CONTROL_PLANE_URL: z.string().url().default("http://localhost:4000"),
  DATABASE_URL: z.string().min(1),
  TEST_DATABASE_URL: z.string().min(1).optional(),
  ARTIFACT_S3_ENDPOINT: z.string().min(1),
  ARTIFACT_S3_REGION: z.string().default("us-east-1"),
  ARTIFACT_S3_BUCKET: z.string().min(1),
  ARTIFACT_S3_ACCESS_KEY: z.string().min(1),
  ARTIFACT_S3_SECRET_KEY: z.string().min(1),
  ARTIFACT_S3_FORCE_PATH_STYLE: z.coerce.boolean().default(true),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MISSION_COMPILER_MODEL: z.string().default("gpt-5-mini"),
  OPENAI_SUMMARY_MODEL: z.string().default("gpt-5-mini"),
  OPENAI_REASONING_MODEL: z.string().default("gpt-5"),
  CODEX_APP_SERVER_COMMAND: z.string().default("codex"),
  CODEX_APP_SERVER_ARGS: z.string().default("app-server"),
  CODEX_DEFAULT_MODEL: z.string().default("gpt-5.2-codex"),
  CODEX_DEFAULT_APPROVAL_POLICY: z.string().default("untrusted"),
  CODEX_DEFAULT_SANDBOX: z.string().default("workspace-write"),
  CODEX_DEFAULT_SERVICE_NAME: z
    .string()
    .default("pocket-cto-control-plane"),
  WORKSPACE_ROOT: z.string().default(""),
  POCKET_CTO_SOURCE_REPO_ROOT: z.string().optional(),
  WORKER_RUN_ONCE: z.coerce.boolean().default(false),
  WORKER_POLL_INTERVAL_MS: z.coerce.number().int().positive().default(30_000),
  GITHUB_APP_ID: z.string().optional(),
  GITHUB_APP_PRIVATE_KEY_BASE64: z.string().optional(),
  GITHUB_WEBHOOK_SECRET: z.string().optional(),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  OTEL_EXPORTER_OTLP_ENDPOINT: z.string().optional(),
  PWA_VAPID_PUBLIC_KEY: z.string().optional(),
  PWA_VAPID_PRIVATE_KEY: z.string().optional(),
});

export type Env = z.infer<typeof EnvSchema>;

export function loadEnv(raw: NodeJS.ProcessEnv = process.env): Env {
  if (raw === process.env) {
    loadNearestEnvFile();
  }

  return EnvSchema.parse(raw);
}

function loadNearestEnvFile() {
  if (typeof process.loadEnvFile !== "function") {
    return;
  }

  let currentDirectory = process.cwd();

  while (true) {
    const envPath = join(currentDirectory, ".env");
    if (existsSync(envPath)) {
      process.loadEnvFile(envPath);
      return;
    }

    const parentDirectory = dirname(currentDirectory);
    if (parentDirectory === currentDirectory) {
      return;
    }

    currentDirectory = parentDirectory;
  }
}

export * from "./test-db";
