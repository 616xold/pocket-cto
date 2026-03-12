import type { JsonRpcId } from "@pocket-cto/codex-runtime";
import type { RuntimeCodexApprovalResponse } from "./types";

type PendingApprovalEntry = {
  approvalId: string;
  method: RuntimeCodexApprovalResponse["method"];
  rejectResponse: (error: Error) => void;
  requestId: JsonRpcId;
  requestKey: string;
  resolveResponse: (response: unknown) => void;
  responded: boolean;
  taskId: string;
};

type ActiveTurnSession = {
  approvalsById: Map<string, PendingApprovalEntry>;
  approvalIdByRequestKey: Map<string, string>;
  interrupt(ids: { threadId: string; turnId: string }): Promise<void>;
  taskId: string;
  threadId: string | null;
  turnId: string | null;
};

export type RuntimeLiveApprovalRef = {
  approvalId: string;
  method: RuntimeCodexApprovalResponse["method"];
  requestId: JsonRpcId;
  taskId: string;
};

export class InMemoryRuntimeSessionRegistry {
  private readonly sessions = new Map<string, ActiveTurnSession>();

  hasTaskSession(taskId: string) {
    return this.sessions.has(taskId);
  }

  getActiveTurn(taskId: string) {
    const session = this.sessions.get(taskId);

    if (!session || !session.threadId || !session.turnId) {
      return null;
    }

    return {
      threadId: session.threadId,
      turnId: session.turnId,
    };
  }

  openTaskSession(input: {
    interrupt(ids: { threadId: string; turnId: string }): Promise<void>;
    taskId: string;
    threadId?: string | null;
  }) {
    const existingSession = this.sessions.get(input.taskId);

    if (existingSession) {
      throw new Error(`Task ${input.taskId} already has an active runtime session`);
    }

    this.sessions.set(input.taskId, {
      approvalsById: new Map(),
      approvalIdByRequestKey: new Map(),
      interrupt: input.interrupt,
      taskId: input.taskId,
      threadId: input.threadId ?? null,
      turnId: null,
    });
  }

  updateThreadId(taskId: string, threadId: string) {
    const session = this.getRequiredSession(taskId);
    session.threadId = threadId;
  }

  updateTurnId(taskId: string, turnId: string) {
    const session = this.getRequiredSession(taskId);
    session.turnId = turnId;
  }

  clearResolvedRequest(taskId: string, requestId: JsonRpcId) {
    const session = this.sessions.get(taskId);

    if (!session) {
      return;
    }

    const requestKey = toRequestKey(requestId);
    const approvalId = session.approvalIdByRequestKey.get(requestKey);

    if (!approvalId) {
      return;
    }

    const approval = session.approvalsById.get(approvalId);

    session.approvalsById.delete(approvalId);
    session.approvalIdByRequestKey.delete(requestKey);

    if (approval && !approval.responded) {
      approval.rejectResponse(
        new Error(
          `Server resolved approval request ${approval.requestId} before Pocket CTO stored a response`,
        ),
      );
    }
  }

  awaitApprovalResolution(input: {
    approvalId: string;
    method: RuntimeCodexApprovalResponse["method"];
    requestId: JsonRpcId;
    taskId: string;
  }) {
    const session = this.getRequiredSession(input.taskId);

    if (session.approvalsById.has(input.approvalId)) {
      throw new Error(
        `Approval ${input.approvalId} is already waiting on a live runtime response`,
      );
    }

    const requestKey = toRequestKey(input.requestId);

    if (session.approvalIdByRequestKey.has(requestKey)) {
      throw new Error(
        `Runtime request ${requestKey} is already bound to a live approval session`,
      );
    }

    return new Promise<unknown>((resolve, reject) => {
      const entry: PendingApprovalEntry = {
        approvalId: input.approvalId,
        method: input.method,
        rejectResponse: reject,
        requestId: input.requestId,
        requestKey,
        resolveResponse: resolve,
        responded: false,
        taskId: input.taskId,
      };

      session.approvalsById.set(input.approvalId, entry);
      session.approvalIdByRequestKey.set(requestKey, input.approvalId);
    });
  }

  getPendingApproval(approvalId: string): RuntimeLiveApprovalRef | null {
    const approval = this.findApprovalEntry(approvalId);

    if (!approval) {
      return null;
    }

    return {
      approvalId: approval.approvalId,
      method: approval.method,
      requestId: approval.requestId,
      taskId: approval.taskId,
    };
  }

  listPendingApprovalIdsForTask(taskId: string) {
    const session = this.sessions.get(taskId);

    if (!session) {
      return [];
    }

    return [...session.approvalsById.keys()];
  }

  resolveApproval(input: {
    approvalId: string;
    response: RuntimeCodexApprovalResponse["response"];
  }) {
    const approval = this.findApprovalEntry(input.approvalId);

    if (!approval) {
      throw new Error(
        `Approval ${input.approvalId} is not attached to a live runtime session`,
      );
    }

    if (approval.responded) {
      throw new Error(`Approval ${input.approvalId} was already resolved`);
    }

    approval.responded = true;
    approval.resolveResponse(input.response);
  }

  async interruptTask(taskId: string) {
    const session = this.getRequiredSession(taskId);

    if (!session.threadId || !session.turnId) {
      throw new Error(
        `Task ${taskId} does not have a live thread/turn binding to interrupt`,
      );
    }

    await session.interrupt({
      threadId: session.threadId,
      turnId: session.turnId,
    });

    return {
      threadId: session.threadId,
      turnId: session.turnId,
    };
  }

  closeTaskSession(taskId: string) {
    const session = this.sessions.get(taskId);

    if (!session) {
      return;
    }

    this.sessions.delete(taskId);

    for (const approval of session.approvalsById.values()) {
      if (!approval.responded) {
        approval.rejectResponse(
          new Error(
            `Task ${taskId} live runtime session ended before approval ${approval.approvalId} was resolved`,
          ),
        );
      }
    }
  }

  private findApprovalEntry(approvalId: string) {
    for (const session of this.sessions.values()) {
      const approval = session.approvalsById.get(approvalId);

      if (approval) {
        return approval;
      }
    }

    return null;
  }

  private getRequiredSession(taskId: string) {
    const session = this.sessions.get(taskId);

    if (!session) {
      throw new Error(`Task ${taskId} does not have a live runtime session`);
    }

    return session;
  }
}

function toRequestKey(requestId: JsonRpcId) {
  return `${typeof requestId}:${String(requestId)}`;
}
