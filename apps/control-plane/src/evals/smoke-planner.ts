import { formatEvalRunSummary, runPlannerSmokeCommand } from "../modules/evals";

const summary = await runPlannerSmokeCommand({
  argv: process.argv.slice(2),
});

process.stdout.write(formatEvalRunSummary(summary));
