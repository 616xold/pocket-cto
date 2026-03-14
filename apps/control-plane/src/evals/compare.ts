import { formatEvalCompareReport, runEvalCompareCommand } from "../modules/evals";

const report = await runEvalCompareCommand(process.argv.slice(2));

process.stdout.write(formatEvalCompareReport(report));
