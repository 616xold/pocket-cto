import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const moduleDirectory = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(moduleDirectory, "../../../../../");

export function getRepoRoot() {
  return repoRoot;
}

export function getEvalsRoot() {
  return join(repoRoot, "evals");
}

export function getEvalDatasetPath(target: "planner" | "executor" | "compiler") {
  return join(getEvalsRoot(), "datasets", `${target}.json`);
}

export function getEvalRubricPath() {
  return join(getEvalsRoot(), "rubrics", "quality-rubric.md");
}

export function getEvalResultsDirectory() {
  return join(getEvalsRoot(), "results");
}
