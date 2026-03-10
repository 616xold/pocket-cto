export class CodexAppServerRequestError extends Error {
  readonly code: number;
  readonly data?: unknown;
  readonly method: string;

  constructor(input: {
    code: number;
    data?: unknown;
    message: string;
    method: string;
  }) {
    super(
      `Codex app server ${input.method} failed (${input.code}): ${input.message}`,
    );
    this.name = "CodexAppServerRequestError";
    this.code = input.code;
    this.data = input.data;
    this.method = input.method;
  }
}

export function isCodexAppServerRequestError(
  error: unknown,
): error is CodexAppServerRequestError {
  return error instanceof CodexAppServerRequestError;
}
