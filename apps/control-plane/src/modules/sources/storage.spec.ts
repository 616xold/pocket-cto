import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { loadEnv } from "@pocket-cto/config";
import { afterAll, describe, expect, it } from "vitest";
import { createRawEnv } from "../../test/env";
import { S3SourceFileStorage } from "./storage";

const env = loadEnv(
  createRawEnv({
    SOURCE_OBJECT_PREFIX: "sources-storage-spec",
  }),
);
const client = new S3Client({
  credentials: {
    accessKeyId: env.ARTIFACT_S3_ACCESS_KEY,
    secretAccessKey: env.ARTIFACT_S3_SECRET_KEY,
  },
  endpoint: env.ARTIFACT_S3_ENDPOINT,
  forcePathStyle: env.ARTIFACT_S3_FORCE_PATH_STYLE,
  region: env.ARTIFACT_S3_REGION,
});

describe("S3SourceFileStorage", () => {
  afterAll(() => {
    client.destroy();
  });

  it("writes source bytes to object storage with deterministic storage refs", async () => {
    const storage = new S3SourceFileStorage(env, client);
    const result = await storage.write({
      sourceId: "11111111-1111-4111-8111-111111111111",
      originalFileName: "april-board-deck.pdf",
      mediaType: "application/pdf",
      checksumSha256:
        "eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
      body: Buffer.from("april board deck pdf bytes"),
    });

    expect(result).toEqual({
      storageKind: "object_store",
      storageRef:
        "s3://pocket-cto-artifacts/sources-storage-spec/11111111-1111-4111-8111-111111111111/eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee/april-board-deck.pdf",
    });

    const objectLocation = parseS3StorageRef(result.storageRef);
    const response = await client.send(
      new GetObjectCommand({
        Bucket: objectLocation.bucket,
        Key: objectLocation.key,
      }),
    );

    expect(await response.Body?.transformToString()).toBe(
      "april board deck pdf bytes",
    );
    expect(response.ContentType).toBe("application/pdf");
  });
});

function parseS3StorageRef(storageRef: string) {
  const match = /^s3:\/\/([^/]+)\/(.+)$/u.exec(storageRef);

  if (!match?.[1] || !match[2]) {
    throw new Error(`Invalid S3 storage ref: ${storageRef}`);
  }

  return {
    bucket: match[1],
    key: match[2],
  };
}
