import type { ApprovalRecord, ApprovalStatus } from "@pocket-cto/domain";

export class ApprovalNotFoundError extends Error {
  constructor(readonly approvalId: string) {
    super(`Approval ${approvalId} was not found`);
    this.name = "ApprovalNotFoundError";
  }
}

export class ApprovalNotPendingError extends Error {
  constructor(
    readonly approvalId: string,
    readonly status: ApprovalStatus,
  ) {
    super(`Approval ${approvalId} is already ${status}`);
    this.name = "ApprovalNotPendingError";
  }
}

export class ApprovalContinuationLostError extends Error {
  constructor(
    readonly approval: ApprovalRecord,
    message: string,
  ) {
    super(message);
    this.name = "ApprovalContinuationLostError";
  }
}
