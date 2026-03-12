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

export class CodexAppServerServerRequestRejectedError extends Error {
  readonly code: number;
  readonly data?: unknown;

  constructor(input: {
    code: number;
    data?: unknown;
    message: string;
  }) {
    super(input.message);
    this.name = "CodexAppServerServerRequestRejectedError";
    this.code = input.code;
    this.data = input.data;
  }
}

export function isCodexAppServerServerRequestRejectedError(
  error: unknown,
): error is CodexAppServerServerRequestRejectedError {
  return error instanceof CodexAppServerServerRequestRejectedError;
}
