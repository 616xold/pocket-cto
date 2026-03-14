import {
  createEvalDoctorReport,
  formatEvalDoctorReport,
} from "../modules/evals";

const report = createEvalDoctorReport();

process.stdout.write(formatEvalDoctorReport(report));
