import {
  FinanceDiscoveryQualityCommandError,
  formatFinanceDiscoveryQualityReport,
  runFinanceDiscoveryQualityCommand,
} from "../modules/evals";

try {
  const result = await runFinanceDiscoveryQualityCommand();
  process.stdout.write(formatFinanceDiscoveryQualityReport(result));
} catch (error) {
  if (error instanceof FinanceDiscoveryQualityCommandError) {
    process.stdout.write(formatFinanceDiscoveryQualityReport(error.result));
    process.exitCode = 1;
  } else {
    throw error;
  }
}
