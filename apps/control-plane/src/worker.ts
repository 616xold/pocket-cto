import { closeAllPools } from "@pocket-cto/db";
import { loadEnv } from "@pocket-cto/config";
import { createWorkerContainer } from "./bootstrap";
import { createProcessLogger } from "./lib/logger";

async function main(argv = process.argv.slice(2)) {
  const env = loadEnv();
  const runOnce = env.WORKER_RUN_ONCE || argv.includes("--once");
  const log = createProcessLogger();
  const abortController = new AbortController();
  const handleSignal = (signal: NodeJS.Signals) => {
    log.info(
      {
        event: "worker.signal",
        signal,
      },
      "Worker shutdown requested",
    );
    abortController.abort();
  };
  process.on("SIGINT", handleSignal);
  process.on("SIGTERM", handleSignal);

  try {
    const container = await createWorkerContainer();
    log.info(
      {
        controlMode: container.liveControl.mode,
        event: "worker.startup",
        pollIntervalMs: env.WORKER_POLL_INTERVAL_MS,
        runOnce,
      },
      "Standalone worker started",
    );

    await container.worker.run({
      log,
      pollIntervalMs: env.WORKER_POLL_INTERVAL_MS,
      runOnce,
      signal: abortController.signal,
    });
  } finally {
    process.off("SIGINT", handleSignal);
    process.off("SIGTERM", handleSignal);
    await closeAllPools();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
