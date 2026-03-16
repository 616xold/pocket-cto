import { createHmac } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";

export const DEFAULT_CONTROL_PLANE_URL = "http://localhost:4000";
export const DEFAULT_POLL_INTERVAL_MS = 2_000;
export const DEFAULT_TIMEOUT_MS = 8 * 60 * 1000;

export function asError(error, fallbackMessage) {
  return error instanceof Error ? error : new Error(fallbackMessage);
}

export function buildRunTag() {
  return new Date().toISOString().replace(/[-:.TZ]/gu, "").slice(0, 14);
}

export function createWebhookSignature(secret, rawBody) {
  return `sha256=${createHmac("sha256", secret).update(rawBody).digest("hex")}`;
}

export async function expectOkJson(url, description) {
  const response = await fetch(url, { headers: { accept: "application/json" } });
  const body = await response.text();

  if (!response.ok) {
    throw new Error(`${description} failed with ${response.status}: ${body}`);
  }

  return body ? JSON.parse(body) : null;
}

export function loadNearestEnvFile() {
  for (let current = process.cwd(); current !== dirname(current); current = dirname(current)) {
    const envPath = join(current, ".env");

    if (!existsSync(envPath)) {
      continue;
    }

    const lines = readFileSync(envPath, "utf8").split(/\r?\n/u);

    for (const line of lines) {
      if (!line || line.trim().startsWith("#")) {
        continue;
      }

      const index = line.indexOf("=");
      if (index <= 0) {
        continue;
      }

      const key = line.slice(0, index).trim();
      if (!key || process.env[key]) {
        continue;
      }

      process.env[key] = line.slice(index + 1);
    }

    return;
  }
}

export function parseArgs(argv) {
  const parsed = {};

  for (let index = 0; index < argv.length; index += 1) {
    const entry = argv[index];

    if (!entry?.startsWith("--")) {
      throw new Error(`Unexpected argument: ${entry}`);
    }

    const [rawKey, inlineValue] = entry.slice(2).split("=", 2);
    const key = rawKey.replace(/-([a-z])/gu, (_, letter) => letter.toUpperCase());
    const nextValue = inlineValue ?? argv[index + 1];

    if (nextValue === undefined) {
      throw new Error(`Missing value for --${rawKey}`);
    }

    if (inlineValue === undefined) {
      index += 1;
    }

    parsed[key] = nextValue;
  }

  return parsed;
}

export async function postJson(url, body) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const text = await response.text();

  if (!response.ok) {
    throw new Error(`POST ${url} failed with ${response.status}: ${text}`);
  }

  return text ? JSON.parse(text) : null;
}

export async function postJsonRaw(url, input) {
  const response = await fetch(url, {
    method: "POST",
    headers: input.headers,
    body: input.body,
  });
  const text = await response.text();

  if (!response.ok) {
    throw new Error(`POST ${url} failed with ${response.status}: ${text}`);
  }

  return text ? JSON.parse(text) : null;
}

export function readPositiveInteger(value, label) {
  const parsed = Number.parseInt(value, 10);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${label} must be a positive integer.`);
  }

  return parsed;
}

export function requireString(value, description) {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`${description} missing from response`);
  }

  return value;
}

export function stripTrailingSlash(value) {
  return value.replace(/\/+$/u, "");
}

export function wait(ms) {
  return new Promise((resolvePromise) => setTimeout(resolvePromise, ms));
}
