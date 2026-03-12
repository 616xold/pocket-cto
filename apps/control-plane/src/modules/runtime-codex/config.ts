import type { MissionTaskRole } from "@pocket-cto/domain";
import type {
  AskForApproval,
  CodexRuntimeClientOptions,
  SandboxMode,
  SandboxPolicy,
} from "@pocket-cto/codex-runtime";
import type { Env } from "@pocket-cto/config";
import type { RuntimeCodexThreadDefaults } from "./types";
import { resolveTaskApprovalPolicy } from "./approval-policy";

type RuntimeCodexEnv = Pick<
  Env,
  | "CODEX_APP_SERVER_ARGS"
  | "CODEX_APP_SERVER_COMMAND"
  | "CODEX_DEFAULT_APPROVAL_POLICY"
  | "CODEX_DEFAULT_MODEL"
  | "CODEX_DEFAULT_SANDBOX"
  | "CODEX_DEFAULT_SERVICE_NAME"
>;

export function resolveCodexRuntimeClientOptions(
  env: RuntimeCodexEnv,
): CodexRuntimeClientOptions {
  const tokens = [
    ...splitShellWords(env.CODEX_APP_SERVER_COMMAND),
    ...splitShellWords(env.CODEX_APP_SERVER_ARGS),
  ];

  const [command, ...args] = tokens;

  if (!command) {
    throw new Error("CODEX_APP_SERVER_COMMAND resolved to an empty command");
  }

  return {
    command,
    args,
  };
}

export function resolveCodexThreadDefaults(
  env: RuntimeCodexEnv,
  cwd: string,
): RuntimeCodexThreadDefaults {
  return {
    clientInfo: {
      name: "pocket-cto-control-plane",
      title: "Pocket CTO Control Plane",
      version: "0.1.0",
    },
    approvalPolicy: normalizeApprovalPolicy(env.CODEX_DEFAULT_APPROVAL_POLICY),
    cwd,
    model: env.CODEX_DEFAULT_MODEL,
    sandbox: normalizeSandboxMode(env.CODEX_DEFAULT_SANDBOX),
    serviceName: normalizeNullableString(env.CODEX_DEFAULT_SERVICE_NAME),
  };
}

export function buildReadOnlyTurnPolicy(role: MissionTaskRole): {
  approvalPolicy: AskForApproval;
  sandboxPolicy: SandboxPolicy;
} {
  return {
    approvalPolicy: resolveTaskApprovalPolicy({
      role,
      writesWorkspace: false,
    }),
    sandboxPolicy: {
      type: "readOnly",
      access: {
        type: "fullAccess",
      },
      networkAccess: false,
    },
  };
}

export function buildExecutorTurnPolicy(
  role: MissionTaskRole,
  workspaceRoot: string,
): {
  approvalPolicy: AskForApproval;
  sandboxPolicy: SandboxPolicy;
} {
  return {
    approvalPolicy: resolveTaskApprovalPolicy({
      role,
      writesWorkspace: true,
    }),
    sandboxPolicy: {
      type: "workspaceWrite",
      writableRoots: [workspaceRoot],
      readOnlyAccess: {
        type: "fullAccess",
      },
      networkAccess: false,
      excludeTmpdirEnvVar: false,
      excludeSlashTmp: false,
    },
  };
}

export function splitShellWords(input: string) {
  const tokens: string[] = [];
  let current = "";
  let quote: '"' | "'" | null = null;
  let escaping = false;

  for (const character of input.trim()) {
    if (escaping) {
      current += character;
      escaping = false;
      continue;
    }

    if (character === "\\" && quote !== "'") {
      escaping = true;
      continue;
    }

    if (quote) {
      if (character === quote) {
        quote = null;
      } else {
        current += character;
      }
      continue;
    }

    if (character === '"' || character === "'") {
      quote = character;
      continue;
    }

    if (/\s/.test(character)) {
      if (current) {
        tokens.push(current);
        current = "";
      }
      continue;
    }

    current += character;
  }

  if (escaping) {
    throw new Error(`Unterminated escape in command string: ${input}`);
  }

  if (quote) {
    throw new Error(`Unterminated quote in command string: ${input}`);
  }

  if (current) {
    tokens.push(current);
  }

  return tokens;
}

function normalizeApprovalPolicy(value: string): AskForApproval {
  const normalized = value.trim();

  switch (normalized) {
    case "untrusted":
    case "on-failure":
    case "on-request":
    case "never":
      return normalized;
    case "unlessTrusted":
      return "untrusted";
    case "onFailure":
      return "on-failure";
    case "onRequest":
      return "on-request";
    default:
      throw new Error(
        `Unsupported CODEX_DEFAULT_APPROVAL_POLICY: ${value}. Expected one of untrusted, on-failure, on-request, never.`,
      );
  }
}

function normalizeSandboxMode(value: string): SandboxMode {
  const normalized = value.trim();

  switch (normalized) {
    case "read-only":
    case "workspace-write":
    case "danger-full-access":
      return normalized;
    case "readOnly":
      return "read-only";
    case "workspaceWrite":
      return "workspace-write";
    case "dangerFullAccess":
      return "danger-full-access";
    default:
      throw new Error(
        `Unsupported CODEX_DEFAULT_SANDBOX: ${value}. Expected one of read-only, workspace-write, danger-full-access.`,
      );
  }
}

function normalizeNullableString(value: string | null | undefined) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}
