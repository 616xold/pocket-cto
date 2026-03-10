import type { ReplayEvent, ReplayEventType } from "@pocket-cto/domain";
import type { PersistenceSession } from "../../lib/persistence";

export type ReplayEventAppend = Omit<ReplayEvent, "sequence">;

export interface ReplayRepository {
  append(
    event: ReplayEventAppend,
    session?: PersistenceSession,
  ): Promise<ReplayEvent>;

  listByMissionId(
    missionId: string,
    session?: PersistenceSession,
  ): Promise<ReplayEvent[]>;

  hasTaskEventType(
    taskId: string,
    type: ReplayEventType,
    session?: PersistenceSession,
  ): Promise<boolean>;
}

export class InMemoryReplayRepository implements ReplayRepository {
  private readonly events = new Map<string, ReplayEvent[]>();
  private readonly missionSequences = new Map<string, number>();

  async append(event: ReplayEventAppend): Promise<ReplayEvent> {
    const currentSequence = this.missionSequences.get(event.missionId) ?? 0;
    const nextSequence = currentSequence + 1;
    const storedEvent: ReplayEvent = {
      ...event,
      sequence: nextSequence,
    };

    const existingEvents = this.events.get(event.missionId) ?? [];
    existingEvents.push(storedEvent);

    this.missionSequences.set(event.missionId, nextSequence);
    this.events.set(event.missionId, existingEvents);

    return storedEvent;
  }

  async listByMissionId(missionId: string): Promise<ReplayEvent[]> {
    const events = this.events.get(missionId) ?? [];
    return [...events].sort((left, right) => left.sequence - right.sequence);
  }

  async hasTaskEventType(
    taskId: string,
    type: ReplayEventType,
  ): Promise<boolean> {
    for (const events of this.events.values()) {
      if (events.some((event) => event.taskId === taskId && event.type === type)) {
        return true;
      }
    }

    return false;
  }
}
