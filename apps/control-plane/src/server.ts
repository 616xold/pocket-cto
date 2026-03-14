import { closeAllPools } from "@pocket-cto/db";
import { buildApp } from "./app";
import { createServerContainer } from "./bootstrap";
import { getEnv } from "./lib/env";
import { createProcessLogger } from "./lib/logger";
import type { EmbeddedWorkerContainer, ServerContainer } from "./lib/types";

async function main() {
  const env = getEnv();
  const log = createProcessLogger();
  const abortController = new AbortController();
  const container = await createServerContainer({
    env,
  });
  const app = await buildApp({ container });
  const controlMode = container.operatorControl.liveControl.mode;
  let shuttingDown = false;

  const shutdown = async (signal: NodeJS.Signals | "embedded-worker-error") => {
    if (shuttingDown) {
      return;
    }

    shuttingDown = true;
    log.info(
      {
        controlMode,
        event: "server.shutdown",
        signal,
      },
      "Control-plane shutdown requested",
    );
    abortController.abort();
    process.off("SIGINT", handleSignal);
    process.off("SIGTERM", handleSignal);
    await app.close();
    await closeAllPools();
  };

  const handleSignal = (signal: NodeJS.Signals) => {
    void shutdown(signal);
  };

  process.on("SIGINT", handleSignal);
  process.on("SIGTERM", handleSignal);

  if (hasEmbeddedWorker(container)) {
    void container.worker
      .run({
        log,
        pollIntervalMs: env.WORKER_POLL_INTERVAL_MS,
        runOnce: false,
        signal: abortController.signal,
      })
      .catch(async (error: unknown) => {
        log.error({ err: error }, "Embedded worker failed");
        await shutdown("embedded-worker-error");
      });
  }

  await app.listen({
    host: "0.0.0.0",
    port: env.CONTROL_PLANE_PORT,
  });
  log.info(
    {
      controlMode,
      event: "control_plane.startup",
      port: env.CONTROL_PLANE_PORT,
    },
    "Control-plane started",
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

function hasEmbeddedWorker(
  container: ServerContainer,
): container is EmbeddedWorkerContainer {
  return "worker" in container;
}
