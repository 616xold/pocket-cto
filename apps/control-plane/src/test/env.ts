export function createRawEnv(
  overrides: NodeJS.ProcessEnv = {},
): NodeJS.ProcessEnv {
  return {
    ARTIFACT_S3_ACCESS_KEY: "minioadmin",
    ARTIFACT_S3_BUCKET: "pocket-cto-artifacts",
    ARTIFACT_S3_ENDPOINT: "http://localhost:9000",
    ARTIFACT_S3_FORCE_PATH_STYLE: "true",
    ARTIFACT_S3_REGION: "us-east-1",
    ARTIFACT_S3_SECRET_KEY: "minioadmin",
    CONTROL_PLANE_PORT: "4000",
    CONTROL_PLANE_URL: "http://localhost:4000",
    DATABASE_URL: "postgres://postgres:postgres@localhost:5432/pocket_cto",
    NEXT_PUBLIC_CONTROL_PLANE_URL: "http://localhost:4000",
    NODE_ENV: "test",
    PUBLIC_APP_URL: "http://localhost:3000",
    SOURCE_OBJECT_PREFIX: "sources",
    TEST_DATABASE_URL:
      "postgres://postgres:postgres@localhost:5432/pocket_cto_test",
    WEB_PORT: "3000",
    ...overrides,
  };
}
