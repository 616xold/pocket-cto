import { and, eq, sql } from "drizzle-orm";
import {
  missions,
  type Db,
  type DbTransaction,
  replayEvents,
} from "@pocket-cto/db";
import {
  getDbExecutor as getSessionExecutor,
  type PersistenceSession,
} from "../../lib/persistence";
import type { ReplayRepository, ReplayEventAppend } from "./repository";
import { mapReplayEventRow } from "./repository-mappers";

export class DrizzleReplayRepository implements ReplayRepository {
  constructor(private readonly db: Db) {}

  async append(event: ReplayEventAppend, session?: PersistenceSession) {
    const executor = getSessionExecutor(session);
    if (executor) {
      return this.appendWithinExecutor(event, executor);
    }

    return this.db.transaction(async (tx: DbTransaction) =>
      this.appendWithinExecutor(event, tx),
    );
  }

  async listByMissionId(missionId: string, session?: PersistenceSession) {
    const executor = getSessionExecutor(session) ?? this.db;
    const events = await executor
      .select()
      .from(replayEvents)
      .where(eq(replayEvents.missionId, missionId))
      .orderBy(replayEvents.sequence);

    return events.map(mapReplayEventRow);
  }

  async hasTaskEventType(
    taskId: string,
    type: ReplayEventAppend["type"],
    session?: PersistenceSession,
  ) {
    const executor = getSessionExecutor(session) ?? this.db;
    const [event] = await executor
      .select({
        id: replayEvents.id,
      })
      .from(replayEvents)
      .where(and(eq(replayEvents.taskId, taskId), eq(replayEvents.type, type)))
      .limit(1);

    return event !== undefined;
  }

  private async appendWithinExecutor(
    event: ReplayEventAppend,
    executor: Db | DbTransaction,
  ) {
    const [updatedMission] = await executor
      .update(missions)
      .set({
        replayCursor: sql`${missions.replayCursor} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(missions.id, event.missionId))
      .returning({
        replayCursor: missions.replayCursor,
      });

    if (!updatedMission) {
      throw new Error(`Mission ${event.missionId} not found for replay append`);
    }

    const [storedEvent] = await executor
      .insert(replayEvents)
      .values({
        id: event.id,
        missionId: event.missionId,
        taskId: event.taskId,
        sequence: updatedMission.replayCursor,
        type: event.type,
        actor: event.actor,
        occurredAt: event.occurredAt,
        payload: event.payload,
      })
      .returning();

    return mapReplayEventRow(
      getRequiredRow(storedEvent, "Replay insert did not return a row"),
    );
  }
}

function getRequiredRow<T>(row: T | undefined, message: string): T {
  if (!row) {
    throw new Error(message);
  }

  return row;
}
