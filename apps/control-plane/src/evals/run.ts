import { runEvalCommand } from "../modules/evals";

const summary = await runEvalCommand(process.argv.slice(2));

process.stdout.write(`Eval run ${summary.runLabel}\n`);
process.stdout.write(`Samples: ${summary.samples}\n`);
process.stdout.write(`Average score: ${summary.averageOverallScore}\n`);
process.stdout.write(`Results: ${summary.outputPath}\n`);
