import { readdirSync, readFileSync } from "node:fs";
import {
  AppProofSchema,
  buildReadOnlyChatGptAppMcpProof,
} from "../packages/domain/src/index.ts";

const scriptNames = Object.keys(
  JSON.parse(readFileSync("package.json", "utf8")).scripts ?? {},
);

const noPackageScriptsAdded = !scriptNames.some((name) =>
  /v2g|read-only.*app.*mcp|chatgpt.*app.*mcp|app-mcp/u.test(name),
);
const noSmokeAliasesAdded = !scriptNames.some((name) =>
  /^smoke:.*(v2g|chatgpt|app.*mcp|mcp.*app)/u.test(name),
);
const fp0088Absent = !readdirSync("plans").some((name) =>
  /^FP-0088/u.test(name),
);

function fp0087DocsOnlyBoundaryVerified() {
  const fp0087Files = readdirSync("plans").filter((name) =>
    /^FP-0087/u.test(name),
  );
  if (
    fp0087Files.length !== 1 ||
    fp0087Files[0] !== "FP-0087-read-only-chatgpt-app-mcp-master-plan.md"
  ) {
    return false;
  }

  const planText = readFileSync(`plans/${fp0087Files[0]}`, "utf8");
  const lower = planText.toLowerCase();
  return [
    "v2g",
    "read-only",
    "chatgpt app/mcp",
    "no app submission",
    "no openai api/model calls",
    "source mutation",
    "finance writes",
    "autonomous action",
  ].every((requiredText) => lower.includes(requiredText));
}

const proof = AppProofSchema.parse(
  buildReadOnlyChatGptAppMcpProof({
    fp0087DocsOnlyBoundaryVerified: fp0087DocsOnlyBoundaryVerified(),
    fp0088Absent,
    noPackageScriptsAdded,
    noSmokeAliasesAdded,
  }),
);

console.log(JSON.stringify(proof, null, 2));
