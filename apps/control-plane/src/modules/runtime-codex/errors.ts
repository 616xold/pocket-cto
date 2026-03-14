export class RuntimeTaskNotFoundError extends Error {
  constructor(readonly taskId: string) {
    super(`Task ${taskId} was not found`);
    this.name = "RuntimeTaskNotFoundError";
  }
}

export class RuntimeActiveTurnNotFoundError extends Error {
  constructor(readonly taskId: string) {
    super(`Task ${taskId} has no active live turn to interrupt`);
    this.name = "RuntimeActiveTurnNotFoundError";
  }
}

export class RuntimeInterruptDeliveryError extends Error {
  constructor(
    readonly taskId: string,
    message: string,
  ) {
    super(message);
    this.name = "RuntimeInterruptDeliveryError";
  }
}

export class UnsupportedPermissionsApprovalError extends Error {
  constructor() {
    super(
      "Pocket CTO M1.6 does not support runtime permissions approval requests; the turn will fail truthfully instead of faking a continuation",
    );
    this.name = "UnsupportedPermissionsApprovalError";
  }
}
