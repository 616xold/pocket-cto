import Fastify from "fastify";
import { registerHttpErrorHandler } from "./lib/http-errors";
import { createLogger } from "./lib/logger";
import { registerHealthRoutes } from "./modules/health/routes";
import { registerFinanceTwinRoutes } from "./modules/finance-twin/routes";
import { registerGitHubAppRoutes } from "./modules/github-app/routes";
import { registerGitHubIssueIntakeRoutes } from "./modules/github-app/issue-intake-routes";
import { registerGitHubWebhookRoutes } from "./modules/github-app/webhook-routes";
import { registerMissionRoutes } from "./modules/missions/routes";
import { registerMonitoringRoutes } from "./modules/monitoring/routes";
import { registerReplayRoutes } from "./modules/replay/routes";
import { registerApprovalRoutes } from "./modules/approvals/routes";
import { registerCfoWikiRoutes } from "./modules/wiki/routes";
import { createServerContainer } from "./bootstrap";
import type { AppContainer } from "./lib/types";
import { registerRuntimeControlRoutes } from "./modules/runtime-codex/routes";
import { registerSourceRoutes } from "./modules/sources/routes";
import { registerTwinRoutes } from "./modules/twin/routes";

export async function buildApp(options?: { container?: AppContainer }) {
  const logger = createLogger();
  const app = Fastify({ logger });
  const container = options?.container ?? (await createServerContainer());

  registerHttpErrorHandler(app);

  await registerHealthRoutes(app);
  await registerFinanceTwinRoutes(app, {
    financeTwinService: container.financeTwinService,
  });
  await registerCfoWikiRoutes(app, {
    cfoWikiService: container.cfoWikiService,
  });
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
    missionReportingActionsService: container.missionReportingActionsService,
    missionService: container.missionService,
  });
  if (container.monitoringService) {
    await registerMonitoringRoutes(app, {
      monitoringService: container.monitoringService,
    });
  }
  await registerReplayRoutes(app, {
    replayService: container.replayService,
  });
  await registerSourceRoutes(app, {
    sourceService: container.sourceService,
  });
  await registerApprovalRoutes(app, {
    operatorControl: container.operatorControl,
  });
  await registerRuntimeControlRoutes(app, {
    operatorControl: container.operatorControl,
  });

  return app;
}
