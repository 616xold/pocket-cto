import { z } from "zod";
import {
  ArchitectureMapSchema,
  BenchmarkNoRuntimeBoundarySchema,
  ContributorChallengeSchema,
} from "./benchmark-community-boundary";
import {
  BENCHMARK_COMMUNITY_SCHEMA_VERSION,
  BenchmarkPrivacyBoundarySchema,
  SafeDemoDataPolicySchema,
  SyntheticFinanceSourcePolicySchema,
} from "./benchmark-community-policy";
import { BenchmarkTaskKindSchema } from "./benchmark-community-tasks";

export const BenchmarkCaseSchema = z.object({
  schemaVersion: z.literal(BENCHMARK_COMMUNITY_SCHEMA_VERSION),
  placeholderOnly: z.literal(true),
  noBenchmarkCasesCheckedIn: z.literal(true),
  noDatasetFile: z.literal(true),
  noFixtureFile: z.literal(true),
  noSampleDataFile: z.literal(true),
  futureCaseRequiresSafeDemoDataPolicy: z.literal(true),
  futureCaseRequiresSyntheticFinanceSourcePolicy: z.literal(true),
});

export const CommunityPackManifestSchema = z.object({
  schemaVersion: z.literal(BENCHMARK_COMMUNITY_SCHEMA_VERSION),
  manifestKind: z.literal("CommunityPackManifest"),
  owningFinancePlan: z.literal("FP-0086"),
  describesFutureCommunityPackOnly: z.literal(true),
  dataFiles: z.array(z.never()).length(0),
  sourcePackFiles: z.array(z.never()).length(0),
  evalDatasetFiles: z.array(z.never()).length(0),
  fixtureFiles: z.array(z.never()).length(0),
  safeDemoDataPolicy: SafeDemoDataPolicySchema,
  syntheticFinanceSourcePolicy: SyntheticFinanceSourcePolicySchema,
  allowedTaskKinds: z.array(BenchmarkTaskKindSchema).length(8),
  benchmarkCase: BenchmarkCaseSchema,
  privacyBoundary: BenchmarkPrivacyBoundarySchema,
  noRuntimeBoundary: BenchmarkNoRuntimeBoundarySchema,
  contributorChallenge: ContributorChallengeSchema,
  architectureMap: ArchitectureMapSchema,
  validationPosture: z.object({
    directProofCommandOnly: z.literal(true),
    noPackageScriptOrSmokeAlias: z.literal(true),
    inMemorySyntheticExamplesOnly: z.literal(true),
  }),
});

export type BenchmarkCase = z.infer<typeof BenchmarkCaseSchema>;
export type CommunityPackManifest = z.infer<typeof CommunityPackManifestSchema>;
