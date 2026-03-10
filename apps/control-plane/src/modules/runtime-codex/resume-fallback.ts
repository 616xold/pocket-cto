import {
  isCodexAppServerRequestError,
} from "@pocket-cto/codex-runtime";
import type { CodexAppServerRequestError } from "@pocket-cto/codex-runtime";

export const preFirstTurnReplacementReason = "resume_unavailable" as const;

export function isResumeUnavailableError(
  error: unknown,
): error is CodexAppServerRequestError {
  return (
    isCodexAppServerRequestError(error) &&
    error.method === "thread/resume" &&
    /no rollout found/i.test(error.message)
  );
}

export function isDirectTurnStartThreadMissingError(
  error: unknown,
): error is CodexAppServerRequestError {
  return (
    isCodexAppServerRequestError(error) &&
    error.method === "turn/start" &&
    /thread not found/i.test(error.message)
  );
}
