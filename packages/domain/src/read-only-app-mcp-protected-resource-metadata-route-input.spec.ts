import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  FP0123_PROTECTED_RESOURCE_METADATA_ROUTE_INPUT_PLAN_PATH,
  FP0124_PROTECTED_RESOURCE_METADATA_ROUTE_IMPLEMENTATION_PLAN_PATH,
  MCP_PROTECTED_RESOURCE_METADATA_ROUTE_INPUT_SCHEMA_VERSION,
  MCP_ROUTE_INPUT_EXPECTED_MCP_METADATA_ROUTE_PATH,
  McpProtectedResourceMetadataRouteInputEvidenceBundleSchema,
  McpProtectedResourceMetadataRouteInputProofSchema,
  buildMcpProtectedResourceMetadataRouteInputProof,
  buildProtectedResourceMetadataDocument,
  buildProtectedResourceMetadataRouteInputEvidenceBundle,
  deriveProtectedResourceMetadataRoutePathDecision,
  validateProtectedResourceMetadataRouteInputEvidenceBundle,
  validateProtectedResourceMetadataRouteInputEvidenceBundleSemanticCoherence,
  verifyFp0123AbsentOrLocalProtectedResourceMetadataRouteInputContracts,
  verifyFp0123PlanningTextRequiredTopics,
  verifyFp0123ProtectedResourceMetadataRouteInputContractsBoundary,
  verifyFp0124AbsentOrDocsOnlyProtectedResourceMetadataRouteImplementationPlan,
  verifyFp0124PlanningTextRequiredTopics,
  verifyFp0124ProtectedResourceMetadataRouteImplementationPlanBoundary,
  verifyFp0125Absent,
  verifyMcpProtectedResourceMetadataRouteInputDurabilityScan,
  type McpProtectedResourceMetadataRouteInputBuilderInput,
} from "./read-only-app-mcp-protected-resource-metadata";

const repoRoot = fileURLToPath(new URL("../../../", import.meta.url));

function verified(value: boolean): true {
  expect(value).toBe(true);
  return true;
}

const validRouteInput = {
  authorizationServerEvidenceAccepted: true,
  authorizationServers: ["https://auth.canonical-finance-host.com"],
  authenticatedCompanyBindingPrerequisiteAccepted: true,
  bearerMethodsSupported: ["header"],
  canonicalResourceUri: "https://mcp.canonical-finance-host.com/mcp",
  canonicalUriEvidenceAccepted: true,
  mcpUnchangedBehaviorPrerequisiteAccepted: true,
  noTokenLeakageAccepted: true,
  routeImplementationDeferred: true,
  scopesSupported: ["mcp:read", "evidence:read"],
  wwwAuthenticateBehaviorDeferred: true,
} satisfies McpProtectedResourceMetadataRouteInputBuilderInput;

describe("FP-0123 protected-resource metadata route-input evidence contracts", () => {
  it("accepts exactly one FP-0124 docs-only route implementation plan while FP-0125 remains absent", () => {
    const repoPaths = repoFilePaths();
    const planText = safeRead(
      FP0123_PROTECTED_RESOURCE_METADATA_ROUTE_INPUT_PLAN_PATH,
    );
    const fp0124PlanText = safeRead(
      FP0124_PROTECTED_RESOURCE_METADATA_ROUTE_IMPLEMENTATION_PLAN_PATH,
    );
    const fp0123Hits = repoPaths.filter((path) => /(^|\/)FP-0123/u.test(path));
    const fp0124Hits = repoPaths.filter((path) => /(^|\/)FP-0124/u.test(path));
    const proof = buildMcpProtectedResourceMetadataRouteInputProof({
      fp0123BoundaryVerified: verified(
        verifyFp0123ProtectedResourceMetadataRouteInputContractsBoundary({
          planText,
          repoPaths,
        }),
      ),
      fp0124AbsentOrDocsOnlyProtectedResourceMetadataRouteImplementationPlanVerified:
        verified(
          verifyFp0124AbsentOrDocsOnlyProtectedResourceMetadataRouteImplementationPlan(
            {
              planText: fp0124PlanText,
              repoPaths,
            },
          ),
        ),
      fp0125Absent: verified(verifyFp0125Absent(repoPaths)),
      protectedResourceMetadataRouteImplementationPlanBoundaryVerified:
        verified(
          verifyFp0124ProtectedResourceMetadataRouteImplementationPlanBoundary({
            planText: fp0124PlanText,
            repoPaths,
          }),
        ),
    });

    expect(fp0123Hits).toEqual([
      FP0123_PROTECTED_RESOURCE_METADATA_ROUTE_INPUT_PLAN_PATH,
    ]);
    expect(fp0124Hits).toEqual([
      FP0124_PROTECTED_RESOURCE_METADATA_ROUTE_IMPLEMENTATION_PLAN_PATH,
    ]);
    expect(
      verifyFp0123AbsentOrLocalProtectedResourceMetadataRouteInputContracts({
        planText,
        repoPaths,
      }),
    ).toBe(true);
    expect(
      Object.values(verifyFp0123PlanningTextRequiredTopics(planText)).every(
        Boolean,
      ),
    ).toBe(true);
    expect(
      Object.values(
        verifyFp0124PlanningTextRequiredTopics(fp0124PlanText),
      ).every(Boolean),
    ).toBe(true);
    expect(proof.localProofOnly).toBe(true);
    expect(proof.routeInputEvidenceContractsVerified).toBe(true);
    expect(proof.fp0123BoundaryVerified).toBe(true);
    expect(proof.fp0124AbsentOrDocsOnlyProtectedResourceMetadataRouteImplementationPlanVerified).toBe(true);
    expect(proof.fp0125Absent).toBe(true);
  });

  it("keeps FP-0124 docs-and-plan/proof-gate only with no route, auth, deployment, public, data, provider, source, or finance scope", () => {
    const planText = safeRead(
      FP0124_PROTECTED_RESOURCE_METADATA_ROUTE_IMPLEMENTATION_PLAN_PATH,
    ).toLowerCase();
    const proof = buildMcpProtectedResourceMetadataRouteInputProof();

    expect(planText).toContain("docs-and-plan plus proof-gate compatibility");
    expect(planText).toContain("does not implement the route");
    expect(planText).toContain("does not add route paths");
    expect(planText).toContain("does not register a protected-resource metadata endpoint");
    expect(planText).toContain("route-input evidence bundle");
    expect(planText).toContain("canonical uri evidence");
    expect(planText).toContain("authorization server evidence");
    expect(planText).toContain("builder output");
    expect(planText).toContain("no-token-leakage");
    expect(planText).toContain("authenticated company binding");
    expect(planText).toContain("/mcp unchanged");
    expect(planText).toContain("www-authenticate");
    expect(proof.noRouteBehaviorChangeFromFp0124).toBe(true);
    expect(proof.noNewRoutePathFromFp0124).toBe(true);
    expect(proof.noProtectedResourceMetadataRouteFromFp0124).toBe(true);
    expect(proof.noWwwAuthenticateRouteBehaviorFromFp0124).toBe(true);
    expect(proof.noOauthImplementationFromFp0124).toBe(true);
    expect(proof.noTokenSessionImplementationFromFp0124).toBe(true);
    expect(proof.noAuthMiddlewareImplementationFromFp0124).toBe(true);
    expect(proof.noRemoteMcpDeploymentFromFp0124).toBe(true);
    expect(proof.noDeploymentConfigFromFp0124).toBe(true);
    expect(proof.noAppsSdkResourceFromFp0124).toBe(true);
    expect(proof.noAppSubmissionFromFp0124).toBe(true);
    expect(proof.noDbQueriesFromFp0124).toBe(true);
    expect(proof.noSchemaMigrationsFromFp0124).toBe(true);
    expect(proof.noPackageScriptsFromFp0124).toBe(true);
    expect(proof.noOpenAiApiCallsFromFp0124).toBe(true);
    expect(proof.noProviderExternalCallsFromFp0124).toBe(true);
    expect(proof.noSourceMutationFinanceWriteFromFp0124).toBe(true);
    expect(proof.noPublicAssetsSubmissionArtifactsFromFp0124).toBe(true);
    expect(proof.noListingCopyGeneratedPublicProseFromFp0124).toBe(true);
  });

  it("builds a route-input bundle only from accepted canonical URI, auth-server, and FP-0122 builder evidence", () => {
    const builderOutput = buildProtectedResourceMetadataDocument({
      authorizationServers: validRouteInput.authorizationServers,
      bearerMethodsSupported: validRouteInput.bearerMethodsSupported,
      canonicalResourceUri: validRouteInput.canonicalResourceUri,
      scopesSupported: validRouteInput.scopesSupported,
    });
    const bundle = buildProtectedResourceMetadataRouteInputEvidenceBundle({
      ...validRouteInput,
      builderOutput,
    });

    expect(bundle.routeInputEvidenceBundleOnly).toBe(true);
    expect(bundle.canonicalUriEvidence).toMatchObject({
      accepted: true,
      canonicalResourceUri: validRouteInput.canonicalResourceUri,
      credentialFree: true,
    });
    expect(bundle.authorizationServerEvidence).toMatchObject({
      accepted: true,
      authorizationServers: validRouteInput.authorizationServers,
      credentialFree: true,
    });
    expect(bundle.builderOutput).toMatchObject({
      accepted: true,
      builderInputAccepted: true,
      builderOutputValid: true,
      routeRegistered: false,
      routeResponseContractOnly: true,
    });
    expect(
      McpProtectedResourceMetadataRouteInputEvidenceBundleSchema.safeParse(
        bundle,
      ).success,
    ).toBe(true);
  });

  it("proves route-input evidence bundle semantic coherence beyond schema validity", () => {
    const bundle =
      buildProtectedResourceMetadataRouteInputEvidenceBundle(validRouteInput);
    const coherence =
      validateProtectedResourceMetadataRouteInputEvidenceBundleSemanticCoherence(
        bundle,
      );

    expect(bundle.schemaVersion).toBe(
      MCP_PROTECTED_RESOURCE_METADATA_ROUTE_INPUT_SCHEMA_VERSION,
    );
    expect(coherence).toMatchObject({
      accepted: true,
      metadataDocumentAuthorizationServersMatchEvidence: true,
      metadataDocumentBearerMethodsRemainHeaderOnly: true,
      metadataDocumentResourceMatchesCanonicalUriEvidence: true,
      metadataDocumentScopesRemainReadOnly: true,
      pathDecisionCanonicalUriMatchesEvidence: true,
      pathDecisionMetadataUrlMatchesEvidence: true,
      routeInputEvidenceSchemaVersionVerified: true,
      routeInputEvidenceSemanticCoherenceVerified: true,
      routePathMatchesPathDecision: true,
    });
  });

  it("rejects schema-valid but semantically incoherent route-input evidence", () => {
    const bundle =
      buildProtectedResourceMetadataRouteInputEvidenceBundle(validRouteInput);
    const incoherentBundle =
      McpProtectedResourceMetadataRouteInputEvidenceBundleSchema.parse({
        ...bundle,
        builderOutput: {
          ...bundle.builderOutput,
          document: {
            ...bundle.builderOutput.document,
            resource: "https://mcp.canonical-finance-host.com/other",
          },
        },
      });
    const coherence =
      validateProtectedResourceMetadataRouteInputEvidenceBundleSemanticCoherence(
        incoherentBundle,
      );

    expect(coherence.accepted).toBe(false);
    expect(coherence.routeInputEvidenceSemanticCoherenceVerified).toBe(false);
    expect(coherence.metadataDocumentResourceMatchesCanonicalUriEvidence).toBe(
      false,
    );
    expect(coherence.rejectionReasons).toContain(
      "metadata_document_resource_mismatch",
    );
  });

  it("fails closed for unsafe route-input evidence candidates", () => {
    const rejectedInputs = [
      {
        expectedReason: "canonical_uri_evidence_unaccepted",
        patch: { canonicalUriEvidenceAccepted: false },
      },
      {
        expectedReason: "canonical_uri_evidence_unaccepted",
        patch: {
          canonicalResourceUri: "https://your-mcp.example.com/mcp",
        },
      },
      {
        expectedReason: "canonical_uri_evidence_unaccepted",
        patch: {
          canonicalResourceUri:
            "https://user:pass@mcp.canonical-finance-host.com/mcp",
        },
      },
      {
        expectedReason: "input_shape_invalid",
        patch: { authorizationServers: [] },
      },
      {
        expectedReason: "authorization_server_evidence_unaccepted",
        patch: {
          authorizationServers: [
            "https://user:pass@auth.canonical-finance-host.com",
          ],
        },
      },
      {
        expectedReason: "authorization_server_evidence_unaccepted",
        patch: { scopesSupported: ["finance:write"] },
      },
      {
        expectedReason: "authorization_server_evidence_unaccepted",
        patch: { bearerMethodsSupported: ["query"] },
      },
      {
        expectedReason: "token_or_private_material_detected",
        patch: { noTokenLeakageAccepted: false },
      },
      {
        expectedReason: "company_binding_prerequisite_missing",
        patch: { authenticatedCompanyBindingPrerequisiteAccepted: false },
      },
      {
        expectedReason: "mcp_unchanged_prerequisite_missing",
        patch: { mcpUnchangedBehaviorPrerequisiteAccepted: false },
      },
    ] as const;

    for (const { expectedReason, patch } of rejectedInputs) {
      const validation =
        validateProtectedResourceMetadataRouteInputEvidenceBundle({
          ...validRouteInput,
          ...patch,
        });

      expect(validation.accepted, JSON.stringify(patch)).toBe(false);
      expect(validation.rejectionReasons).toContain(expectedReason);
    }
  });

  it("fails closed for invalid FP-0122 builder output evidence", () => {
    const validation =
      validateProtectedResourceMetadataRouteInputEvidenceBundle({
        ...validRouteInput,
        builderOutput: {
          authorization_servers: validRouteInput.authorizationServers,
          bearer_methods_supported: ["header"],
          resource: validRouteInput.canonicalResourceUri,
          scopes_supported: ["mcp:read", "finance:write"],
        },
      });

    expect(validation.accepted).toBe(false);
    expect(validation.rejectionReasons).toContain("builder_output_unaccepted");
  });

  it("derives the RFC 9728 route path decision for a /mcp canonical resource", () => {
    const decision = deriveProtectedResourceMetadataRoutePathDecision({
      canonicalResourceUri: validRouteInput.canonicalResourceUri,
    });

    expect(decision.metadataRoutePath).toBe(
      MCP_ROUTE_INPUT_EXPECTED_MCP_METADATA_ROUTE_PATH,
    );
    expect(decision.metadataUrl).toBe(
      "https://mcp.canonical-finance-host.com/.well-known/oauth-protected-resource/mcp",
    );
    expect(decision.routeImplementationDeferred).toBe(true);
  });

  it("keeps route implementation deferred and registers no protected-resource metadata or WWW-Authenticate route behavior", () => {
    const routeSource = safeRead(
      "apps/control-plane/src/modules/read-only-app-mcp-endpoint/routes.ts",
    );
    const changedRouteFiles = changedFilePaths().filter((path) =>
      /^apps\/control-plane\/src\/modules\/read-only-app-mcp-endpoint\/(?:routes|service|formatter|schema|evidence-dispatcher)\.ts$/u.test(
        path,
      ),
    );
    const proof = buildMcpProtectedResourceMetadataRouteInputProof();

    expect(changedRouteFiles).toEqual([]);
    expect(routeSource.match(/app\.post\("\/mcp"/gu)?.length).toBe(1);
    expect(routeSource.match(/app\.get\("\/mcp"/gu)?.length).toBe(1);
    expect(routeSource).not.toMatch(
      /oauth-protected-resource|resource_metadata|www-authenticate/iu,
    );
    expect(proof.noRouteBehaviorChange).toBe(true);
    expect(proof.noNewRoutePath).toBe(true);
    expect(proof.noProtectedResourceMetadataRouteImplementation).toBe(true);
    expect(proof.noWwwAuthenticateRouteBehaviorImplementation).toBe(true);
  });

  it("proves no DB, schema, package, data, asset, provider, OpenAI, source, finance-write, or autonomous-action scope exists", () => {
    const changedPaths = changedFilePaths();
    const proof = buildMcpProtectedResourceMetadataRouteInputProof();

    expect(changedPaths.some((path) => /^packages\/db\//u.test(path))).toBe(
      false,
    );
    expect(
      changedPaths.some((path) => /(?:^|\/)migrations?\//iu.test(path)),
    ).toBe(false);
    expect(changedPaths.some((path) => /\/?package\.json$/u.test(path))).toBe(
      false,
    );
    expect(
      changedPaths.some((path) =>
        /(?:^|\/)(?:fixtures|samples|sample-data|datasets|source-packs?|public-demo-data)(?:\/|$)/iu.test(
          path,
        ),
      ),
    ).toBe(false);
    expect(
      changedPaths.some((path) =>
        /\.(?:png|jpe?g|gif|webp|svg|ico|avif|mp4|mov|pdf)$/iu.test(path),
      ),
    ).toBe(false);
    expect(proof.noOpenAiApiCalls).toBe(true);
    expect(proof.noModelCalls).toBe(true);
    expect(proof.noProviderCalls).toBe(true);
    expect(proof.noExternalCommunications).toBe(true);
    expect(proof.noSourceMutation).toBe(true);
    expect(proof.noFinanceWrite).toBe(true);
    expect(proof.noAutonomousAction).toBe(true);
  });

  it("passes durable route-input repository inventory for current repo truth", () => {
    const scan = routeInputDurabilityScan();

    expect(scan.routeInputBranchDiffScopeVerified).toBe(true);
    expect(scan.routeInputRepositoryInventoryVerified).toBe(true);
    expect(scan.routeInputNoRouteRuntimeRepositoryInventoryVerified).toBe(true);
    expect(
      scan.routeInputNoProtectedResourceMetadataRouteRepositoryInventoryVerified,
    ).toBe(true);
    expect(scan.routeInputNoWwwAuthenticateRepositoryInventoryVerified).toBe(
      true,
    );
    expect(scan.routeInputNoAuthRuntimeRepositoryInventoryVerified).toBe(true);
    expect(
      scan.routeInputNoDeploymentPublicAssetRepositoryInventoryVerified,
    ).toBe(true);
    expect(scan.routeInputNoOpenAiSourceScanVerified).toBe(true);
    expect(scan.fp0123PostmergeProofDurabilityVerified).toBe(true);
  });

  it("rejects simulated committed protected-resource metadata route path drift", () => {
    const badPath =
      "apps/web/app/.well-known/oauth-protected-resource/mcp/route.ts";
    const scan = routeInputDurabilityScan({
      branchDiffPaths: [badPath],
      repoPaths: [...repoFilePaths(), badPath],
    });

    expect(scan.routeInputBranchDiffScopeVerified).toBe(false);
    expect(scan.routeInputNoRouteRuntimeRepositoryInventoryVerified).toBe(
      false,
    );
    expect(
      scan.routeInputNoProtectedResourceMetadataRouteRepositoryInventoryVerified,
    ).toBe(false);
    expect(scan.fp0123PostmergeProofDurabilityVerified).toBe(false);
  });

  it("rejects simulated committed WWW-Authenticate route behavior path and source drift", () => {
    const badPath =
      "apps/control-plane/src/modules/read-only-app-mcp-endpoint/www-authenticate/routes.ts";
    const pathScan = routeInputDurabilityScan({
      branchDiffPaths: [badPath],
      repoPaths: [...repoFilePaths(), badPath],
    });
    const sourceScan = routeInputDurabilityScan({
      branchDiffPaths: [
        "packages/domain/src/read-only-app-mcp-protected-resource-metadata-route-input-proof.ts",
      ],
      sourceTextByPath: {
        "apps/control-plane/src/modules/read-only-app-mcp-endpoint/routes.ts":
          'reply.header("WWW-Authenticate", "Bearer resource_metadata=https://example.test/.well-known/oauth-protected-resource/mcp");',
      },
    });

    expect(
      pathScan.routeInputNoWwwAuthenticateRepositoryInventoryVerified,
    ).toBe(false);
    expect(
      sourceScan.routeInputNoWwwAuthenticateRepositoryInventoryVerified,
    ).toBe(false);
    expect(sourceScan.fp0123PostmergeProofDurabilityVerified).toBe(false);
  });

  it("rejects simulated committed OAuth, token/session, and auth middleware drift", () => {
    const scan = routeInputDurabilityScan({
      branchDiffPaths: [
        "apps/control-plane/src/modules/read-only-app-mcp-endpoint/oauth-callback.ts",
        "apps/control-plane/src/modules/read-only-app-mcp-endpoint/token-store.ts",
        "apps/control-plane/src/modules/read-only-app-mcp-endpoint/auth-middleware.ts",
      ],
      repoPaths: [
        ...repoFilePaths(),
        "apps/control-plane/src/modules/read-only-app-mcp-endpoint/oauth-callback.ts",
        "apps/control-plane/src/modules/read-only-app-mcp-endpoint/token-store.ts",
        "apps/control-plane/src/modules/read-only-app-mcp-endpoint/auth-middleware.ts",
      ],
      sourceTextByPath: {
        "apps/control-plane/src/modules/read-only-app-mcp-endpoint/oauth-callback.ts":
          "oauthCallback(); tokenExchange(); routeGuard(); setCookie();",
      },
    });

    expect(scan.routeInputNoAuthRuntimeRepositoryInventoryVerified).toBe(false);
    expect(scan.routeInputRepositoryInventoryVerified).toBe(false);
    expect(scan.fp0123PostmergeProofDurabilityVerified).toBe(false);
  });

  it("rejects simulated committed deployment config, public asset, listing, submission, and package script drift", () => {
    const deploymentScan = routeInputDurabilityScan({
      branchDiffPaths: ["vercel.json"],
      repoPaths: [...repoFilePaths(), "vercel.json"],
    });
    const publicAssetScan = routeInputDurabilityScan({
      branchDiffPaths: [
        "app-submission/listing-copy.md",
        "apps/web/public/submission-screenshot.png",
      ],
      repoPaths: [
        ...repoFilePaths(),
        "app-submission/listing-copy.md",
        "apps/web/public/submission-screenshot.png",
      ],
    });
    const packageScriptScan = routeInputDurabilityScan({
      branchDiffPaths: ["package.json"],
      repoPaths: repoFilePaths(),
    });

    expect(
      deploymentScan.routeInputNoDeploymentPublicAssetRepositoryInventoryVerified,
    ).toBe(false);
    expect(
      publicAssetScan.routeInputNoDeploymentPublicAssetRepositoryInventoryVerified,
    ).toBe(false);
    expect(packageScriptScan.noPackageScriptsAdded).toBe(false);
    expect(packageScriptScan.routeInputBranchDiffScopeVerified).toBe(false);
    expect(packageScriptScan.fp0123PostmergeProofDurabilityVerified).toBe(
      false,
    );
  });

  it("rejects simulated committed OpenAI import, API, model, client, and key executable drift while allowing absence language", () => {
    const openAiSourceScan = routeInputDurabilityScan({
      branchDiffPaths: [
        "packages/domain/src/read-only-app-mcp-protected-resource-metadata-route-input-proof.ts",
      ],
      sourceTextByPath: {
        "packages/domain/src/read-only-app-mcp-protected-resource-metadata-route-input-proof.ts":
          "import OpenAI from 'openai'; const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY }); await client.responses.create({ model: 'gpt-4.1', input: 'x' });",
      },
    });
    const absenceLanguageScan = routeInputDurabilityScan({
      branchDiffPaths: [
        "packages/domain/src/read-only-app-mcp-protected-resource-metadata-route-input-proof.ts",
      ],
      sourceTextByPath: {
        "packages/domain/src/read-only-app-mcp-protected-resource-metadata-route-input-proof.ts":
          "// no OpenAI API key, no model calls, no chat.completions, no api.openai.com usage",
      },
    });

    expect(openAiSourceScan.routeInputNoOpenAiSourceScanVerified).toBe(false);
    expect(
      openAiSourceScan.forbiddenOpenAiSourceMatches.length,
    ).toBeGreaterThan(0);
    expect(openAiSourceScan.fp0123PostmergeProofDurabilityVerified).toBe(false);
    expect(absenceLanguageScan.routeInputNoOpenAiSourceScanVerified).toBe(true);
    expect(absenceLanguageScan.fp0123PostmergeProofDurabilityVerified).toBe(
      true,
    );
  });

  it("keeps FP-0122, FP-0121, FP-0120, FP-0118, FP-0117, FP-0107, FP-0106, and FP-0100 boundaries intact", () => {
    const proof = buildMcpProtectedResourceMetadataRouteInputProof();

    expect(
      proof.fp0122ProtectedResourceMetadataBuilderBoundaryStillVerified,
    ).toBe(true);
    expect(
      proof.fp0121ProtectedResourceMetadataRoutePlanningBoundaryStillVerified,
    ).toBe(true);
    expect(proof.fp0120CanonicalResourceAuthServerBoundaryStillVerified).toBe(
      true,
    );
    expect(proof.fp0118ProtectedResourceMetadataBoundaryStillVerified).toBe(
      true,
    );
    expect(proof.fp0117OauthImplementationSequencingBoundaryStillVerified).toBe(
      true,
    );
    expect(proof.fp0107RouteAdapterBoundaryStillVerified).toBe(true);
    expect(proof.fp0106ProtocolEnvelopeBoundaryStillVerified).toBe(true);
    expect(proof.fp0100PublicSecurityBoundaryStillVerified).toBe(true);
    expect(
      McpProtectedResourceMetadataRouteInputProofSchema.safeParse({
        ...proof,
        fp0124AbsentOrDocsOnlyProtectedResourceMetadataRouteImplementationPlanVerified: false,
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
      if (entry.isDirectory()) walk(absolutePath, relativePath);
      else results.push(relativePath);
    }
  }

  walk(repoRoot);
  return results.sort();
}

function safeRead(relativePath: string) {
  return readFileSync(join(repoRoot, relativePath), "utf8");
}

function changedFilePaths() {
  return execFileSync("git", ["status", "--short", "--untracked-files=all"], {
    cwd: repoRoot,
    encoding: "utf8",
  })
    .split("\n")
    .filter((line) => line.trim())
    .map((line) =>
      line
        .replace(/^.. /u, "")
        .replace(/.* -> /u, "")
        .trim(),
    )
    .sort();
}

function routeInputDurabilityScan(
  patch: Partial<
    Parameters<
      typeof verifyMcpProtectedResourceMetadataRouteInputDurabilityScan
    >[0]
  > = {},
) {
  return verifyMcpProtectedResourceMetadataRouteInputDurabilityScan({
    branchDiffPaths: [],
    dirtyPaths: [],
    repoPaths: repoFilePaths(),
    routeSourceText: safeRead(
      "apps/control-plane/src/modules/read-only-app-mcp-endpoint/routes.ts",
    ),
    sourceTextByPath: {
      "apps/control-plane/src/modules/read-only-app-mcp-endpoint/routes.ts":
        safeRead(
          "apps/control-plane/src/modules/read-only-app-mcp-endpoint/routes.ts",
        ),
    },
    ...patch,
  });
}
