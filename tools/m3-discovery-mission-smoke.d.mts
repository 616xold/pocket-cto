export interface DiscoverySmokeArgs {
  changedPaths: string[];
  dbNamePrefix: string;
  isolateDb: boolean;
  keepDbOnFailure: boolean;
  repoFullName: string | null;
  requestedBy: string;
  sourceRepoRoot: string | null;
}

export interface IsolatedDatabaseConfigInput {
  baseDatabaseUrl: string;
  baseTestDatabaseUrl?: string | null;
  dbNamePrefix: string;
  uniqueSuffix?: string;
}

export interface IsolatedDatabaseConfig {
  adminDatabaseUrl: string;
  adminTestDatabaseUrl: string;
  databaseName: string;
  databaseUrl: string;
  testDatabaseName: string;
  testDatabaseUrl: string;
}

export function parseSmokeArgs(argv: string[]): DiscoverySmokeArgs;

export function buildIsolatedDatabaseConfig(
  input: IsolatedDatabaseConfigInput,
): IsolatedDatabaseConfig;
