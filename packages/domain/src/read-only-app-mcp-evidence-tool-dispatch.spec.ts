import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  EVIDENCE_TOOL_DISPATCH_ARGUMENT_SCHEMAS_BY_TOOL,
  EVIDENCE_TOOL_DISPATCH_REFUSAL_REASONS,
  EVIDENCE_TOOL_DISPATCH_RESPONSE_REQUIRED_FIELDS,
  FP0108_EVIDENCE_TOOL_DISPATCH_PLAN_PATH,
  FP0109_EVIDENCE_DISPATCH_ADAPTER_PLAN_PATH,
  FP0110_DEFAULT_LOCAL_EVIDENCE_DISPATCH_ENABLEMENT_PLAN_PATH,
  FP0111_DEFAULT_LOCAL_EVIDENCE_DISPATCH_WIRING_PLAN_PATH,
  MCP_TOOL_ALLOWLIST,
  EvidenceToolDispatchAllowlistBoundarySchema,
  EvidenceToolDispatchProofSchema,
  EvidenceToolNoFinanceWriteBoundarySchema,
  EvidenceToolNoOpenAiModelBoundarySchema,
  EvidenceToolNoProviderExternalCallBoundarySchema,
  EvidenceToolNoRawDumpBoundarySchema,
  EvidenceToolResponseEnvelopeBoundarySchema,
  buildEvidenceToolDispatchAllowlistBoundary,
  buildEvidenceToolDispatchContracts,
  buildEvidenceToolDispatchProof,
} from "./read-only-app-mcp";
import type { McpToolName } from "./read-only-app-mcp";

const repoRoot = fileURLToPath(new URL("../../../", import.meta.url));

describe("FP-0108 evidence tool dispatch contracts", () => {
  it("preserves the exact V2G allowlist and rejects drift", () => {
    const allowlist = buildEvidenceToolDispatchAllowlistBoundary();

    expect(allowlist.exactV2gToolAllowlist).toEqual([
      "search_evidence",
      "fetch_evidence_card",
      "fetch_source_anchor",
      "fetch_document_map",
      "fetch_source_coverage",
      "fetch_company_posture",
      "fetch_capability_boundaries",
    ]);
    expect(allowlist.dynamicToolsAllowed).toBe(false);
    expect(allowlist.writeActionToolsAllowed).toBe(false);
    expect(
      EvidenceToolDispatchAllowlistBoundarySchema.safeParse({
        ...allowlist,
        exactV2gToolAllowlist: [...MCP_TOOL_ALLOWLIST, "send_report"],
      }).success,
    ).toBe(false);
  });

  it("defines exact argument schemas for every future evidence tool", () => {
    const validArguments: Record<McpToolName, Record<string, unknown>> = {
      fetch_capability_boundaries: { companyKey: "acme" },
      fetch_company_posture: { companyKey: "acme", periodKey: "2026-04" },
      fetch_document_map: { companyKey: "acme", documentMapId: "map-1" },
      fetch_evidence_card: { companyKey: "acme", evidenceCardId: "card-1" },
      fetch_source_anchor: { companyKey: "acme", sourceAnchorId: "anchor-1" },
      fetch_source_coverage: { companyKey: "acme", sourceId: "source-1" },
      search_evidence: { companyKey: "acme", limit: 3, query: "cash" },
    };
    const missingRequired: Record<McpToolName, Record<string, unknown>> = {
      fetch_capability_boundaries: {},
      fetch_company_posture: {},
      fetch_document_map: { companyKey: "acme" },
      fetch_evidence_card: { companyKey: "acme" },
      fetch_source_anchor: { companyKey: "acme" },
      fetch_source_coverage: { companyKey: "acme" },
      search_evidence: { companyKey: "acme" },
    };

    for (const toolName of MCP_TOOL_ALLOWLIST) {
      const schema = EVIDENCE_TOOL_DISPATCH_ARGUMENT_SCHEMAS_BY_TOOL[toolName];

      expect(schema.safeParse(validArguments[toolName]).success).toBe(true);
      expect(schema.safeParse(missingRequired[toolName]).success).toBe(false);
      expect(
        schema.safeParse({
          ...validArguments[toolName],
          sourceMutation: true,
        }).success,
      ).toBe(false);
    }

    expect(
      EVIDENCE_TOOL_DISPATCH_ARGUMENT_SCHEMAS_BY_TOOL.search_evidence.safeParse(
        {
          companyKey: "acme",
          limit: 26,
          query: "cash",
        },
      ).success,
    ).toBe(false);
    expect(
      EVIDENCE_TOOL_DISPATCH_ARGUMENT_SCHEMAS_BY_TOOL.fetch_company_posture.safeParse(
        {
          companyKey: "acme",
        },
      ).success,
    ).toBe(true);
  });

  it("requires structured evidence response envelope fields on every contract", () => {
    for (const contract of buildEvidenceToolDispatchContracts()) {
      expect(contract.responseEnvelopeBoundary.requiredFields).toEqual([
        ...EVIDENCE_TOOL_DISPATCH_RESPONSE_REQUIRED_FIELDS,
      ]);
      expect(contract.responseEnvelopeBoundary.structuredContentRequired).toBe(
        true,
      );
      expect(contract.responseEnvelopeBoundary.evidenceRequiredForSuccess).toBe(
        true,
      );
      expect(
        contract.responseEnvelopeBoundary.sourceAnchorsRequiredForSuccess,
      ).toBe(true);
      expect(contract.responseEnvelopeBoundary.capabilityBoundaryRequired).toBe(
        true,
      );
      expect(
        EvidenceToolResponseEnvelopeBoundarySchema.safeParse({
          ...contract.responseEnvelopeBoundary,
          requiredFields:
            contract.responseEnvelopeBoundary.requiredFields.slice(1),
        }).success,
      ).toBe(false);
    }
  });

  it("fails closed for missing evidence, citations, unsupported, stale, and conflicting evidence", () => {
    const proof = buildEvidenceToolDispatchProof();

    expect(proof.freshnessBoundaryVerified).toBe(true);
    expect(proof.refusalEnvelopeBoundaryVerified).toBe(true);
    expect(EVIDENCE_TOOL_DISPATCH_REFUSAL_REASONS).toEqual(
      expect.arrayContaining([
        "missing_evidence",
        "missing_citation",
        "unsupported_evidence",
        "stale_evidence",
        "conflicting_evidence",
        "company_key_mismatch",
        "unsupported_argument",
        "prompt_injection",
      ]),
    );
    expect(
      EvidenceToolDispatchProofSchema.safeParse({
        ...proof,
        freshnessBoundaryVerified: false,
      }).success,
    ).toBe(false);
  });

  it("forbids raw full-file dumps, generated advice, source mutation, and finance writes", () => {
    const contract = firstDispatchContract();

    expect(contract.noRawDumpBoundary.rawFullFileDumpAllowed).toBe(false);
    expect(contract.noRawDumpBoundary.boundedCitedExcerptsOnly).toBe(true);
    expect(contract.noFinanceWriteBoundary.generatedFinanceAdviceAllowed).toBe(
      false,
    );
    expect(contract.noMutationBoundary.sourceMutationAllowed).toBe(false);
    expect(contract.noFinanceWriteBoundary.financeWriteAllowed).toBe(false);
    expect(
      EvidenceToolNoRawDumpBoundarySchema.safeParse({
        ...contract.noRawDumpBoundary,
        rawFullFileDumpAllowed: true,
      }).success,
    ).toBe(false);
    expect(
      EvidenceToolNoFinanceWriteBoundarySchema.safeParse({
        ...contract.noFinanceWriteBoundary,
        generatedFinanceAdviceAllowed: true,
      }).success,
    ).toBe(false);
  });

  it("forbids provider, external, OpenAI API, and model calls by contract", () => {
    const contract = firstDispatchContract();

    expect(contract.noProviderExternalCallBoundary.providerCallsAllowed).toBe(
      false,
    );
    expect(
      contract.noProviderExternalCallBoundary.externalCommunicationsAllowed,
    ).toBe(false);
    expect(contract.noOpenAiModelBoundary.openAiApiCallsAllowed).toBe(false);
    expect(contract.noOpenAiModelBoundary.modelCallsAllowed).toBe(false);
    expect(contract.noOpenAiModelBoundary.openAiClientOrKeyUsageAllowed).toBe(
      false,
    );
    expect(
      EvidenceToolNoProviderExternalCallBoundarySchema.safeParse({
        ...contract.noProviderExternalCallBoundary,
        providerCallsAllowed: true,
      }).success,
    ).toBe(false);
    expect(
      EvidenceToolNoOpenAiModelBoundarySchema.safeParse({
        ...contract.noOpenAiModelBoundary,
        modelCallsAllowed: true,
      }).success,
    ).toBe(false);
  });

  it("keeps route adapter dispatch fail-closed and runtime absent", () => {
    const proof = buildEvidenceToolDispatchProof();
    const serviceSource = readFileSync(
      join(
        repoRoot,
        "apps/control-plane/src/modules/read-only-app-mcp-endpoint/service.ts",
      ),
      "utf8",
    );

    expect(proof.routeAdapterToolsCallStillFailClosed).toBe(true);
    expect(proof.noDispatchRuntimeImplemented).toBe(true);
    expect(serviceSource).toContain("formatToolDispatchRefusalResult");
    expect(serviceSource).not.toContain("ReadOnlyEvidenceToolService");
  });

  it("accepts exactly FP-0108 through FP-0111 while rejecting FP-0112", () => {
    const repoPaths = repoFilePaths();
    const fp0108Hits = repoPaths.filter((path) => /(^|\/)FP-0108/u.test(path));
    const fp0109Hits = repoPaths.filter((path) => /(^|\/)FP-0109/u.test(path));
    const fp0110Hits = repoPaths.filter((path) => /(^|\/)FP-0110/u.test(path));
    const fp0111Hits = repoPaths.filter((path) => /(^|\/)FP-0111/u.test(path));
    const fp0112Hits = repoPaths.filter((path) => /(^|\/)FP-0112/u.test(path));
    const proof = buildEvidenceToolDispatchProof({
      fp0108BoundaryVerified:
        fp0108Hits.length === 1 &&
        fp0108Hits[0] === FP0108_EVIDENCE_TOOL_DISPATCH_PLAN_PATH &&
        existsSync(join(repoRoot, FP0108_EVIDENCE_TOOL_DISPATCH_PLAN_PATH)),
      fp0109BoundaryVerified:
        fp0109Hits.length === 1 &&
        fp0109Hits[0] === FP0109_EVIDENCE_DISPATCH_ADAPTER_PLAN_PATH &&
        existsSync(join(repoRoot, FP0109_EVIDENCE_DISPATCH_ADAPTER_PLAN_PATH)),
      fp0108DispatchContractsStillVerified: fp0108Hits.length === 1,
      fp0109AdapterBoundaryStillVerified: fp0109Hits.length === 1,
      fp0110AbsentOrDocsOnlyDefaultLocalDispatchEnablementPlanVerified:
        fp0110Hits.length === 1 &&
        fp0110Hits[0] ===
          FP0110_DEFAULT_LOCAL_EVIDENCE_DISPATCH_ENABLEMENT_PLAN_PATH &&
        fp0110PlanBoundaryVerified(),
      fp0111DefaultLocalEvidenceDispatchWiringBoundaryVerified:
        fp0111Hits.length === 1 &&
        fp0111Hits[0] ===
          FP0111_DEFAULT_LOCAL_EVIDENCE_DISPATCH_WIRING_PLAN_PATH &&
        fp0111PlanBoundaryVerified(),
      fp0112Absent: fp0112Hits.length === 0,
    });

    expect(fp0108Hits).toEqual([FP0108_EVIDENCE_TOOL_DISPATCH_PLAN_PATH]);
    expect(fp0109Hits).toEqual([FP0109_EVIDENCE_DISPATCH_ADAPTER_PLAN_PATH]);
    expect(fp0110Hits).toEqual([
      FP0110_DEFAULT_LOCAL_EVIDENCE_DISPATCH_ENABLEMENT_PLAN_PATH,
    ]);
    expect(fp0111Hits).toEqual([
      FP0111_DEFAULT_LOCAL_EVIDENCE_DISPATCH_WIRING_PLAN_PATH,
    ]);
    expect(fp0112Hits).toEqual([]);
    expect(proof.fp0108BoundaryVerified).toBe(true);
    expect(proof.fp0109BoundaryVerified).toBe(true);
    expect(
      proof.fp0110AbsentOrDocsOnlyDefaultLocalDispatchEnablementPlanVerified,
    ).toBe(true);
    expect(
      proof.fp0111DefaultLocalEvidenceDispatchWiringBoundaryVerified,
    ).toBe(true);
    expect(proof.fp0112Absent).toBe(true);
    expect(proof.fp0108DispatchContractsStillVerified).toBe(true);
    expect(proof.fp0109AdapterBoundaryStillVerified).toBe(true);
    expect(
      EvidenceToolDispatchProofSchema.safeParse({
        ...proof,
        fp0110AbsentOrDocsOnlyDefaultLocalDispatchEnablementPlanVerified: false,
      }).success,
    ).toBe(false);
    expect(
      EvidenceToolDispatchProofSchema.safeParse({
        ...proof,
        fp0111DefaultLocalEvidenceDispatchWiringBoundaryVerified: false,
      }).success,
    ).toBe(false);
    expect(
      EvidenceToolDispatchProofSchema.safeParse({
        ...proof,
        fp0112Absent: false,
      }).success,
    ).toBe(false);
  });

  it("proves FP-0110 is planning only and opens no route, data, auth, public-app, or finance-write scope", () => {
    const proof = buildEvidenceToolDispatchProof();

    expect(proof.defaultLocalEvidenceDispatchEnablementPlanBoundaryVerified).toBe(
      true,
    );
    expect(proof.noRouteBehaviorChangeFromFp0110).toBe(true);
    expect(proof.noDefaultDispatchRuntimeFromFp0110).toBe(true);
    expect(proof.noDbQueriesFromFp0110).toBe(true);
    expect(proof.noSchemaMigrationsFromFp0110).toBe(true);
    expect(proof.noOauthTokenSessionFromFp0110).toBe(true);
    expect(proof.noRemoteMcpDeploymentFromFp0110).toBe(true);
    expect(proof.noAppsSdkResourceFromFp0110).toBe(true);
    expect(proof.noOpenAiApiCallsFromFp0110).toBe(true);
    expect(proof.noSourceMutationFinanceWriteFromFp0110).toBe(true);
    expect(fp0110PlanBoundaryVerified()).toBe(true);
    expect(
      EvidenceToolDispatchProofSchema.safeParse({
        ...proof,
        noDefaultDispatchRuntimeFromFp0110: false,
      }).success,
    ).toBe(false);
  });
});

function repoFilePaths() {
  const results: string[] = [];
  const skippedDirectories = new Set([
    ".git",
    ".next",
    ".turbo",
    "coverage",
    "dist",
    "node_modules",
  ]);

  function walk(directory: string, prefix = "") {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      if (entry.isDirectory() && skippedDirectories.has(entry.name)) continue;
      const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;
      const absolutePath = join(directory, entry.name);
      if (entry.isDirectory()) {
        walk(absolutePath, relativePath);
      } else {
        results.push(relativePath);
      }
    }
  }

  walk(repoRoot);
  return results.sort();
}

function firstDispatchContract() {
  const contract = buildEvidenceToolDispatchContracts()[0];
  if (!contract) {
    throw new Error("Expected at least one FP-0108 dispatch contract.");
  }

  return contract;
}

function fp0110PlanBoundaryVerified() {
  const planPath = join(
    repoRoot,
    FP0110_DEFAULT_LOCAL_EVIDENCE_DISPATCH_ENABLEMENT_PLAN_PATH,
  );
  if (!existsSync(planPath)) return false;

  const normalized = readFileSync(planPath, "utf8")
    .toLowerCase()
    .replace(/`/gu, "");

  return [
    "docs-and-plan plus proof-gate compatibility",
    "not default dispatch runtime enablement",
    "not route expansion",
    "not a new endpoint",
    "not db query implementation",
    "not schema or migration work",
    "not oauth implementation",
    "not token/session implementation",
    "not remote mcp deployment",
    "not apps sdk iframe/resource implementation",
    "not public chatgpt app implementation",
    "not app submission",
    "not openai api/model integration",
    "not source mutation",
    "not a finance write",
    "explicit dependency injection remains required",
    "route registration may not construct the dispatcher by default",
    "fp-0111 remains absent",
  ].every((text) => normalized.includes(text));
}

function fp0111PlanBoundaryVerified() {
  const planPath = join(
    repoRoot,
    FP0111_DEFAULT_LOCAL_EVIDENCE_DISPATCH_WIRING_PLAN_PATH,
  );
  if (!existsSync(planPath)) return false;

  const normalized = readFileSync(planPath, "utf8")
    .toLowerCase()
    .replace(/`/gu, "");

  return [
    "local-only",
    "read-only",
    "explicit-dependency wiring only",
    "explicit app construction input",
    "not route expansion",
    "not a new endpoint",
    "not db query implementation",
    "not schema or migration work",
    "not oauth implementation",
    "not token/session implementation",
    "not remote mcp deployment",
    "not apps sdk iframe/resource implementation",
    "not public chatgpt app implementation",
    "not app submission",
    "not openai api/model integration",
    "not source mutation",
    "not a finance write",
    "not generated finance advice",
    "not autonomous action",
    "default buildapp() remains fail-closed",
    "no fp-0112",
  ].every((text) => normalized.includes(text));
}
