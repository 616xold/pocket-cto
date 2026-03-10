import type { ReplayEventType } from "@pocket-cto/domain";
import { MissionNotFoundError } from "../../lib/http-errors";
import type { PersistenceSession } from "../../lib/persistence";
import type { MissionRepository } from "../missions/repository";
import type { ReplayRepository } from "./repository";

export class ReplayService {
  constructor(
    private readonly repository: ReplayRepository,
    private readonly missionRepository: Pick<MissionRepository, "getMissionById">,
  ) {}

  async append(
    input: {
      missionId: string;
      taskId?: string | null;
      type: ReplayEventType;
      actor?: string;
      payload?: Record<string, unknown>;
    },
    session?: PersistenceSession,
  ) {
    return this.repository.append(
      {
        id: crypto.randomUUID(),
        missionId: input.missionId,
        taskId: input.taskId ?? null,
        type: input.type,
        actor: input.actor ?? "system",
        occurredAt: new Date().toISOString(),
        payload: input.payload ?? {},
      },
      session,
    );
  }

  async listByMissionId(missionId: string) {
    return this.repository.listByMissionId(missionId);
  }

  async taskHasEventType(
    taskId: string,
    type: ReplayEventType,
    session?: PersistenceSession,
  ) {
    return this.repository.hasTaskEventType(taskId, type, session);
  }

  async getMissionEvents(missionId: string) {
    const mission = await this.missionRepository.getMissionById(missionId);

    if (!mission) {
      throw new MissionNotFoundError(missionId);
    }

    return this.repository.listByMissionId(missionId);
  }
}
