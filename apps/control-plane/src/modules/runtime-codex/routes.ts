import type { FastifyInstance } from "fastify";
import { LiveControlUnavailableError } from "../../lib/http-errors";
import type { AppContainer } from "../../lib/types";
import {
  interruptTaskBodySchema,
  interruptTaskParamsSchema,
} from "./schema";

export async function registerRuntimeControlRoutes(
  app: FastifyInstance,
  deps: Pick<AppContainer, "operatorControl">,
) {
  app.post("/tasks/:taskId/interrupt", async (request) => {
    const { taskId } = interruptTaskParamsSchema.parse(request.params);
    const body = interruptTaskBodySchema.parse(request.body);

    if (!deps.operatorControl.liveControl.enabled) {
      throw new LiveControlUnavailableError();
    }

    return {
      interrupt: await deps.operatorControl.runtimeControlService.interruptActiveTurn(
        {
          rationale: body.rationale ?? null,
          requestedBy: body.requestedBy,
          taskId,
        },
      ),
      liveControl: deps.operatorControl.liveControl,
    };
  });
}
