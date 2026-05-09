import { z } from "zod";

export const BENCHMARK_COMMUNITY_SCHEMA_VERSION =
  "v2f.benchmark-community.v1";

export const SensitiveFinanceDataCategorySchema = z.enum([
  "customer_data",
  "vendor_data",
  "payroll_data",
  "tax_data",
  "bank_data",
  "legal_data",
  "board_data",
  "lender_data",
]);

export const PrivateArtifactCategorySchema = z.enum([
  "credentials",
  "tokens",
  "secrets",
  "oauth_material",
  "provider_credentials",
  "api_keys",
  "object_store_dumps",
  "database_dumps",
  "private_screenshots",
  "private_finance_source_text",
]);

export const SAFE_DEMO_DATA_POLICY_FORBIDDEN_FINANCE_DATA = [
  "customer_data",
  "vendor_data",
  "payroll_data",
  "tax_data",
  "bank_data",
  "legal_data",
  "board_data",
  "lender_data",
] as const satisfies readonly z.infer<typeof SensitiveFinanceDataCategorySchema>[];

export const SAFE_DEMO_DATA_POLICY_FORBIDDEN_PRIVATE_ARTIFACTS = [
  "credentials",
  "tokens",
  "secrets",
  "oauth_material",
  "provider_credentials",
  "api_keys",
  "object_store_dumps",
  "database_dumps",
  "private_screenshots",
  "private_finance_source_text",
] as const satisfies readonly z.infer<typeof PrivateArtifactCategorySchema>[];

export const SafeDemoDataPolicySchema = z.object({
  schemaVersion: z.literal(BENCHMARK_COMMUNITY_SCHEMA_VERSION),
  policyName: z.literal("SafeDemoDataPolicy"),
  firstGate: z.literal(true),
  forbidsRealCompanyData: z.literal(true),
  forbidsLightlyAnonymizedRealFinanceData: z.literal(true),
  forbidsCheckedInSensitiveFinanceData: z.literal(true),
  forbiddenFinanceData: z.array(SensitiveFinanceDataCategorySchema).min(8),
  forbiddenPrivateArtifacts: z.array(PrivateArtifactCategorySchema).min(10),
  requiresSyntheticOnlyBeforeFutureCase: z.literal(true),
  requiresClearSyntheticLabel: z.literal(true),
  requiresReviewBeforeAnyFutureDataFile: z.literal(true),
  noDataFilesCreatedByPolicy: z.literal(true),
});

export const SyntheticFinanceSourcePolicySchema = z.object({
  schemaVersion: z.literal(BENCHMARK_COMMUNITY_SCHEMA_VERSION),
  policyName: z.literal("SyntheticFinanceSourcePolicy"),
  gatedBySafeDemoDataPolicyFirst: z.literal(true),
  requiresInventedCompanyFacts: z.literal(true),
  requiresInventedSourceFacts: z.literal(true),
  requiresClearSyntheticLabeling: z.literal(true),
  forbidsRealCompanyDerivedData: z.literal(true),
  forbidsLightlyAnonymizedRealFinanceData: z.literal(true),
  forbidsSourcePackDerivedPrivateData: z.literal(true),
  noFutureSampleDemoBenchmarkCaseWithoutPolicy: z.literal(true),
});

export const BenchmarkPrivacyBoundarySchema = z.object({
  schemaVersion: z.literal(BENCHMARK_COMMUNITY_SCHEMA_VERSION),
  noRealCompanyData: z.literal(true),
  noLightlyAnonymizedRealFinanceData: z.literal(true),
  noPrivateCustomerVendorPayrollTaxBankLegalBoardLenderData: z.literal(true),
  noCredentialsTokensSecretsOauthProviderKeys: z.literal(true),
  noObjectStoreOrDatabaseDumps: z.literal(true),
  noPrivateScreenshots: z.literal(true),
  noPrivateFinanceSourceText: z.literal(true),
  benchmarkArtifactsAreNotSourceTruth: z.literal(true),
});

export type SensitiveFinanceDataCategory = z.infer<
  typeof SensitiveFinanceDataCategorySchema
>;
export type PrivateArtifactCategory = z.infer<
  typeof PrivateArtifactCategorySchema
>;
export type SafeDemoDataPolicy = z.infer<typeof SafeDemoDataPolicySchema>;
export type SyntheticFinanceSourcePolicy = z.infer<
  typeof SyntheticFinanceSourcePolicySchema
>;
export type BenchmarkPrivacyBoundary = z.infer<
  typeof BenchmarkPrivacyBoundarySchema
>;
