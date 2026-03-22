import { z } from "zod";
import { evalBackends, type EvalBackend } from "./types";

export const evalCommandTargetSchema = z.enum([
  "planner",
  "executor",
  "compiler",
  "all",
]);
export const evalBackendSchema = z.enum(evalBackends);

export type EvalCommandTarget = z.infer<typeof evalCommandTargetSchema>;

export type EvalCliArgs = {
  backend: EvalBackend | null;
  dryRun: boolean;
  limit: number | null;
  target: EvalCommandTarget;
  withReference: boolean;
};

export function parseEvalCliArgs(argv: string[]): EvalCliArgs {
  const [targetArg, ...flags] = argv;
  const target = evalCommandTargetSchema.catch("all").parse(targetArg ?? "all");
  let backend: EvalBackend | null = null;
  let dryRun = false;
  let withReference = false;
  let limit: number | null = null;

  for (let index = 0; index < flags.length; index += 1) {
    const flag = flags[index];

    if (flag === "--dry-run") {
      dryRun = true;
      continue;
    }

    if (flag === "--backend") {
      const nextValue = flags[index + 1];

      if (!nextValue) {
        throw new Error(
          `Missing backend after --backend. Expected one of ${evalBackends.join(", ")}.`,
        );
      }

      backend = evalBackendSchema.parse(nextValue);
      index += 1;
      continue;
    }

    if (flag === "--") {
      continue;
    }

    if (flag === "--with-reference") {
      withReference = true;
      continue;
    }

    if (flag === "--limit") {
      const nextValue = flags[index + 1];

      if (!nextValue) {
        throw new Error("Missing numeric value after --limit.");
      }

      const parsedLimit = Number.parseInt(nextValue, 10);

      if (!Number.isFinite(parsedLimit) || parsedLimit < 1) {
        throw new Error("--limit must be a positive integer.");
      }

      limit = parsedLimit;
      index += 1;
      continue;
    }

    throw new Error(`Unknown eval flag: ${flag}`);
  }

  return {
    backend,
    dryRun,
    limit,
    target,
    withReference,
  };
}

export function expandEvalTargets(
  target: EvalCommandTarget,
): Array<"planner" | "executor" | "compiler"> {
  return target === "all" ? ["planner", "executor", "compiler"] : [target];
}
