import type { ApprovalRecord } from "@pocket-cto/domain";
import type { MissionRepository } from "../missions/repository";
import type { ReplayService } from "../replay/service";
import { buildRuntimeTurnInterruptRequestedPayload } from "./events";
import type { InMemoryRuntimeSessionRegistry } from "./live-session-registry";
import type { ApprovalService } from "../approvals/service";

export type InterruptActiveTurnInput = {
  rationale?: string | null;
  requestedBy: string;
  taskId: string;
};

export type InterruptActiveTurnResult = {
  cancelledApprovals: ApprovalRecord[];
  taskId: string;
  threadId: string;
  turnId: string;
};

export class RuntimeControlService {
  constructor(
    private readonly missionRepository: Pick<MissionRepository, "getTaskById">,
    private readonly replayService: Pick<ReplayService, "append">,
    private readonly approvalService: Pick<
      ApprovalService,
      "cancelPendingApprovalsForTask"
    >,
    private readonly liveSessionRegistry: Pick<
      InMemoryRuntimeSessionRegistry,
      "getActiveTurn" | "interruptTask"
    >,
  ) {}

  async interruptActiveTurn(
    input: InterruptActiveTurnInput,
  ): Promise<InterruptActiveTurnResult> {
    const task = await this.missionRepository.getTaskById(input.taskId);

    if (!task) {
      throw new Error(`Task ${input.taskId} was not found`);
    }

    const activeTurn = this.liveSessionRegistry.getActiveTurn(input.taskId);

    if (!activeTurn) {
      throw new Error(`Task ${input.taskId} has no active live turn to interrupt`);
    }

    const cancelledApprovals =
      await this.approvalService.cancelPendingApprovalsForTask({
        rationale: input.rationale ?? null,
        resolvedBy: input.requestedBy,
        taskId: input.taskId,
      });

    await this.replayService.append({
      actor: input.requestedBy,
      missionId: task.missionId,
      taskId: task.id,
      type: "runtime.turn_interrupt_requested",
      payload: buildRuntimeTurnInterruptRequestedPayload({
        missionId: task.missionId,
        rationale: input.rationale ?? null,
        requestedBy: input.requestedBy,
        taskId: task.id,
        threadId: activeTurn.threadId,
        turnId: activeTurn.turnId,
      }),
    });

    await this.liveSessionRegistry.interruptTask(input.taskId);

    return {
      cancelledApprovals,
      taskId: task.id,
      threadId: activeTurn.threadId,
      turnId: activeTurn.turnId,
    };
  }
}
