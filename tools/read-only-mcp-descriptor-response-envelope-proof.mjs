import { readdirSync, readFileSync } from "node:fs";
import {
  AppMcpDescriptorEnvelopeProofSchema,
  buildAppMcpDescriptorEnvelopeProof,
} from "../packages/domain/src/index.ts";

const scriptNames = Object.keys(
  JSON.parse(readFileSync("package.json", "utf8")).scripts ?? {},
);

const noPackageScriptsAdded = !scriptNames.some((name) =>
  /v2g|read-only.*mcp.*descriptor|descriptor.*envelope|app.*mcp/u.test(name),
);
const noSmokeAliasesAdded = !scriptNames.some((name) =>
  /^smoke:.*(v2g|mcp.*descriptor|descriptor.*envelope|app.*mcp)/u.test(name),
);
const fp0088Absent = !readdirSync("plans").some((name) =>
  /^FP-0088/u.test(name),
);

const proof = AppMcpDescriptorEnvelopeProofSchema.parse(
  buildAppMcpDescriptorEnvelopeProof({
    fp0088Absent,
    noPackageScriptsAdded,
    noSmokeAliasesAdded,
  }),
);

console.log(JSON.stringify(proof, null, 2));
