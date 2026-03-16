import Fastify from "fastify";
import { registerHttpErrorHandler } from "./lib/http-errors";
import { createLogger } from "./lib/logger";
import { registerHealthRoutes } from "./modules/health/routes";
import { registerGitHubAppRoutes } from "./modules/github-app/routes";
import { registerGitHubIssueIntakeRoutes } from "./modules/github-app/issue-intake-routes";
import { registerGitHubWebhookRoutes } from "./modules/github-app/webhook-routes";
import { registerMissionRoutes } from "./modules/missions/routes";
import { registerReplayRoutes } from "./modules/replay/routes";
import { registerApprovalRoutes } from "./modules/approvals/routes";
import { createServerContainer } from "./bootstrap";
import type { AppContainer } from "./lib/types";
import { registerRuntimeControlRoutes } from "./modules/runtime-codex/routes";
import { registerTwinRoutes } from "./modules/twin/routes";

export async function buildApp(options?: { container?: AppContainer }) {
  const logger = createLogger();
  const app = Fastify({ logger });
  const container = options?.container ?? (await createServerContainer());

  registerHttpErrorHandler(app);

  await registerHealthRoutes(app);
  await registerGitHubAppRoutes(app, {
    githubAppService: container.githubAppService,
  });
  await registerGitHubWebhookRoutes(app, {
    githubWebhookService: container.githubWebhookService,
  });
  await registerGitHubIssueIntakeRoutes(app, {
    githubIssueIntakeService: container.githubIssueIntakeService,
  });
  await registerTwinRoutes(app, {
    twinService: container.twinService,
  });
  await registerMissionRoutes(app, {
    liveControl: container.operatorControl.liveControl,
    missionService: container.missionService,
  });
  await registerReplayRoutes(app, {
    replayService: container.replayService,
  });
  await registerApprovalRoutes(app, {
    operatorControl: container.operatorControl,
  });
  await registerRuntimeControlRoutes(app, {
    operatorControl: container.operatorControl,
  });

  return app;
}
