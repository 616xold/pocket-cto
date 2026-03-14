import { formatEvalRunSummary, runExecutorSmokeCommand } from "../modules/evals";

const summary = await runExecutorSmokeCommand({
  argv: process.argv.slice(2),
});

process.stdout.write(formatEvalRunSummary(summary));
