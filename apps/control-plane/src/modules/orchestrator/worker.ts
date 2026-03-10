import { setTimeout as delay } from "node:timers/promises";
import type {
  MissionTaskStatus,
  TaskStatusChangeReason,
} from "@pocket-cto/domain";
import type { OrchestratorService } from "./service";

export type WorkerLogger = {
  error(payload: unknown, message: string): void;
  info(payload: unknown, message: string): void;
};

export type WorkerRunOptions = {
  log: WorkerLogger;
  pollIntervalMs: number;
  runOnce: boolean;
  signal?: AbortSignal;
};

export class OrchestratorWorker {
  constructor(private readonly orchestratorService: OrchestratorService) {}

  async tick() {
    return this.orchestratorService.tick();
  }

  async run(options: WorkerRunOptions) {
    if (options.runOnce) {
      return this.runTick(options.log);
    }

    while (!options.signal?.aborted) {
      await this.runTick(options.log);

      try {
        await delay(options.pollIntervalMs, undefined, {
          signal: options.signal,
        });
      } catch (error) {
        if (isAbortError(error)) {
          return;
        }

        throw error;
      }
    }
  }

  async transitionTaskStatus(input: {
    reason: TaskStatusChangeReason;
    taskId: string;
    to: MissionTaskStatus;
  }) {
    return this.orchestratorService.transitionTaskStatus(input);
  }

  private async runTick(log: WorkerLogger) {
    try {
      const result = await this.orchestratorService.tick();

      if (result.kind === "idle") {
        log.info(
          {
            event: "worker.tick",
            outcome: "idle",
          },
          "Worker tick idle",
        );
        return result;
      }

      if (result.kind === "runtime_failed") {
        log.error(
          {
            err: result.error,
            event: "worker.tick",
            missionId: result.task.missionId,
            outcome: "runtime_failed",
            role: result.task.role,
            sequence: result.task.sequence,
            stage: result.stage,
            taskId: result.task.id,
          },
          "Worker failed during Codex runtime processing",
        );
        return result;
      }

      log.info(
        {
          codexThreadId: result.task.codexThreadId,
          codexTurnId: result.turn.turnId,
          event: "worker.tick",
          outcome: "turn_completed",
          finalStatus: result.task.status,
          firstItemType: result.turn.firstItemType,
          lastItemType: result.turn.lastItemType,
          missionId: result.task.missionId,
          recoveryStrategy: result.turn.recoveryStrategy,
          role: result.task.role,
          sequence: result.task.sequence,
          taskId: result.task.id,
          turnStatus: result.turn.status,
        },
        "Worker completed Codex turn",
      );

      return result;
    } catch (error) {
      log.error(
        {
          err: error,
          event: "worker.tick",
          outcome: "error",
        },
        "Worker tick failed",
      );
      throw error;
    }
  }
}

function isAbortError(error: unknown) {
  return error instanceof Error && error.name === "AbortError";
}
