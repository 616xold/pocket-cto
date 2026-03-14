import { formatEvalRunSummary, runEvalCommand } from "../modules/evals";

const summary = await runEvalCommand(process.argv.slice(2));

process.stdout.write(formatEvalRunSummary(summary));
