import type { FastifyInstance } from "fastify";
import { ZodError } from "zod";
import {
  ApprovalContinuationLostError,
  ApprovalNotFoundError,
  ApprovalNotPendingError,
} from "../modules/approvals/errors";
import {
  GitHubAppConfigurationError,
  GitHubInstallationNotFoundError,
  GitHubAppNotConfiguredError,
  GitHubAppRequestError,
  GitHubRepositoryArchivedError,
  GitHubRepositoryDisabledError,
  GitHubRepositoryInactiveError,
  GitHubRepositoryInstallationUnavailableError,
  GitHubRepositoryNotFoundError,
  GitHubIssueIntakeNonIssueDeliveryError,
  GitHubWebhookBadSignatureError,
  GitHubWebhookDeliveryNotFoundError,
  GitHubWebhookMissingDeliveryIdError,
  GitHubWebhookMissingEventNameError,
  GitHubWebhookMissingSignatureError,
  GitHubWebhookNotConfiguredError,
  GitHubWebhookPayloadParseError,
} from "../modules/github-app/errors";
import {
  RuntimeActiveTurnNotFoundError,
  RuntimeInterruptDeliveryError,
  RuntimeTaskNotFoundError,
} from "../modules/runtime-codex/errors";
import { TwinSourceUnavailableError } from "../modules/twin/errors";

export type ApiErrorCode =
  | "invalid_request"
  | "approval_conflict"
  | "approval_not_found"
  | "github_app_invalid_configuration"
  | "github_app_not_configured"
  | "github_app_request_failed"
  | "github_installation_not_found"
  | "github_issue_intake_non_issue_delivery"
  | "github_repository_archived"
  | "github_repository_disabled"
  | "github_repository_inactive"
  | "github_repository_installation_unavailable"
  | "github_repository_not_found"
  | "github_webhook_bad_signature"
  | "github_webhook_delivery_not_found"
  | "github_webhook_missing_delivery_id"
  | "github_webhook_missing_event_name"
  | "github_webhook_missing_signature"
  | "github_webhook_not_configured"
  | "live_control_unavailable"
  | "mission_not_found"
  | "internal_error"
  | "task_conflict"
  | "task_not_found"
  | "twin_source_unavailable";

export type ApiErrorDetail = {
  path: string;
  message: string;
};

export type ApiErrorResponse = {
  error: {
    code: ApiErrorCode;
    message: string;
    details?: ApiErrorDetail[];
  };
};

type ErrorMapping = {
  statusCode: number;
  body: ApiErrorResponse;
};

export class AppHttpError extends Error {
  readonly statusCode: number;
  readonly body: ApiErrorResponse;

  constructor(
    statusCode: number,
    body: ApiErrorResponse,
  ) {
    super(body.error.message);
    this.name = "AppHttpError";
    this.statusCode = statusCode;
    this.body = body;
  }
}

export class MissionNotFoundError extends AppHttpError {
  readonly missionId: string;

  constructor(missionId: string) {
    super(404, {
      error: {
        code: "mission_not_found",
        message: "Mission not found",
      },
    });
    this.name = "MissionNotFoundError";
    this.missionId = missionId;
  }
}

export class LiveControlUnavailableError extends AppHttpError {
  constructor() {
    super(501, {
      error: {
        code: "live_control_unavailable",
        message:
          "Live approval and interrupt control is unavailable in this process",
      },
    });
    this.name = "LiveControlUnavailableError";
  }
}

export function registerHttpErrorHandler(app: FastifyInstance) {
  app.setErrorHandler((error, request, reply) => {
    const mapped = mapHttpError(error);

    if (mapped.statusCode >= 500) {
      request.log.error({ err: error }, "Request failed");
    } else {
      request.log.warn(
        {
          err: error,
          statusCode: mapped.statusCode,
          errorCode: mapped.body.error.code,
        },
        mapped.body.error.message,
      );
    }

    void reply.code(mapped.statusCode).send(mapped.body);
  });
}

function mapHttpError(error: unknown): ErrorMapping {
  if (error instanceof AppHttpError) {
    return {
      statusCode: error.statusCode,
      body: error.body,
    };
  }

  if (error instanceof ZodError) {
    return {
      statusCode: 400,
      body: {
        error: {
          code: "invalid_request",
          message: "Invalid request",
          details: error.issues.map((issue) => ({
            path: formatIssuePath(issue.path),
            message: issue.message,
          })),
        },
      },
    };
  }

  if (hasStatusCode(error) && error.statusCode === 400) {
    return {
      statusCode: 400,
      body: {
        error: {
          code: "invalid_request",
          message: "Invalid request",
          details: [
            {
              path: "request",
              message: error.message,
            },
          ],
        },
      },
    };
  }

  if (error instanceof ApprovalNotFoundError) {
    return {
      statusCode: 404,
      body: {
        error: {
          code: "approval_not_found",
          message: "Approval not found",
        },
      },
    };
  }

  if (
    error instanceof ApprovalNotPendingError ||
    error instanceof ApprovalContinuationLostError
  ) {
    return {
      statusCode: 409,
      body: {
        error: {
          code: "approval_conflict",
          message: error.message,
        },
      },
    };
  }

  if (error instanceof GitHubAppNotConfiguredError) {
    return {
      statusCode: 503,
      body: {
        error: {
          code: "github_app_not_configured",
          message: error.message,
          details: error.missing.map((variableName) => ({
            path: variableName,
            message: "Missing required GitHub App env var",
          })),
        },
      },
    };
  }

  if (error instanceof GitHubAppConfigurationError) {
    return {
      statusCode: 500,
      body: {
        error: {
          code: "github_app_invalid_configuration",
          message: error.message,
        },
      },
    };
  }

  if (error instanceof GitHubAppRequestError) {
    return {
      statusCode: 502,
      body: {
        error: {
          code: "github_app_request_failed",
          message: "GitHub App request failed",
          details: [
            {
              path: "github",
              message: error.message,
            },
          ],
        },
      },
    };
  }

  if (error instanceof GitHubInstallationNotFoundError) {
    return {
      statusCode: 404,
      body: {
        error: {
          code: "github_installation_not_found",
          message: error.message,
        },
      },
    };
  }

  if (error instanceof GitHubIssueIntakeNonIssueDeliveryError) {
    return {
      statusCode: 409,
      body: {
        error: {
          code: "github_issue_intake_non_issue_delivery",
          message: error.message,
        },
      },
    };
  }

  if (error instanceof GitHubRepositoryNotFoundError) {
    return {
      statusCode: 404,
      body: {
        error: {
          code: "github_repository_not_found",
          message: error.message,
        },
      },
    };
  }

  if (error instanceof GitHubRepositoryInactiveError) {
    return {
      statusCode: 409,
      body: {
        error: {
          code: "github_repository_inactive",
          message: error.message,
        },
      },
    };
  }

  if (error instanceof GitHubRepositoryArchivedError) {
    return {
      statusCode: 409,
      body: {
        error: {
          code: "github_repository_archived",
          message: error.message,
        },
      },
    };
  }

  if (error instanceof GitHubRepositoryDisabledError) {
    return {
      statusCode: 409,
      body: {
        error: {
          code: "github_repository_disabled",
          message: error.message,
        },
      },
    };
  }

  if (error instanceof GitHubRepositoryInstallationUnavailableError) {
    return {
      statusCode: 409,
      body: {
        error: {
          code: "github_repository_installation_unavailable",
          message: error.message,
        },
      },
    };
  }

  if (error instanceof TwinSourceUnavailableError) {
    return {
      statusCode: 409,
      body: {
        error: {
          code: "twin_source_unavailable",
          message: "Twin source repository is unavailable",
          details: [
            {
              path: "repoFullName",
              message: `Requested repo: ${error.requestedRepoFullName}`,
            },
            {
              path: "sourcePath",
              message: `Checked source path: ${error.sourcePath}`,
            },
            {
              path: "reason",
              message: error.reason,
            },
            ...(error.actualRepoFullName
              ? [
                  {
                    path: "actualRepoFullName",
                    message: `Resolved local repo: ${error.actualRepoFullName}`,
                  },
                ]
              : []),
          ],
        },
      },
    };
  }

  if (error instanceof GitHubWebhookNotConfiguredError) {
    return {
      statusCode: 503,
      body: {
        error: {
          code: "github_webhook_not_configured",
          message: error.message,
          details: error.missing.map((variableName) => ({
            path: variableName,
            message: "Missing required GitHub webhook env var",
          })),
        },
      },
    };
  }

  if (error instanceof GitHubWebhookMissingSignatureError) {
    return {
      statusCode: 400,
      body: {
        error: {
          code: "github_webhook_missing_signature",
          message: error.message,
        },
      },
    };
  }

  if (error instanceof GitHubWebhookBadSignatureError) {
    return {
      statusCode: 401,
      body: {
        error: {
          code: "github_webhook_bad_signature",
          message: error.message,
        },
      },
    };
  }

  if (error instanceof GitHubWebhookDeliveryNotFoundError) {
    return {
      statusCode: 404,
      body: {
        error: {
          code: "github_webhook_delivery_not_found",
          message: error.message,
        },
      },
    };
  }

  if (error instanceof GitHubWebhookMissingDeliveryIdError) {
    return {
      statusCode: 400,
      body: {
        error: {
          code: "github_webhook_missing_delivery_id",
          message: error.message,
        },
      },
    };
  }

  if (error instanceof GitHubWebhookMissingEventNameError) {
    return {
      statusCode: 400,
      body: {
        error: {
          code: "github_webhook_missing_event_name",
          message: error.message,
        },
      },
    };
  }

  if (error instanceof GitHubWebhookPayloadParseError) {
    return {
      statusCode: 400,
      body: {
        error: {
          code: "invalid_request",
          message: "Invalid request",
          details: [
            {
              path: "body",
              message: error.message,
            },
          ],
        },
      },
    };
  }

  if (error instanceof RuntimeTaskNotFoundError) {
    return {
      statusCode: 404,
      body: {
        error: {
          code: "task_not_found",
          message: "Task not found",
        },
      },
    };
  }

  if (
    error instanceof RuntimeActiveTurnNotFoundError ||
    error instanceof RuntimeInterruptDeliveryError
  ) {
    return {
      statusCode: 409,
      body: {
        error: {
          code: "task_conflict",
          message: error.message,
        },
      },
    };
  }

  return {
    statusCode: 500,
    body: {
      error: {
        code: "internal_error",
        message: "Internal server error",
      },
    },
  };
}

function formatIssuePath(path: Array<string | number>) {
  if (path.length === 0) {
    return "request";
  }

  return path.map(String).join(".");
}

function hasStatusCode(
  error: unknown,
): error is { statusCode: number; message: string } {
  return (
    typeof error === "object" &&
    error !== null &&
    "statusCode" in error &&
    typeof error.statusCode === "number" &&
    "message" in error &&
    typeof error.message === "string"
  );
}
