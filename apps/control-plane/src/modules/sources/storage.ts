import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import type { Env } from "@pocket-cto/config";
import type { SourceSnapshotStorageKind } from "@pocket-cto/domain";

type SourceFileStorageConfig = Pick<
  Env,
  | "ARTIFACT_S3_ACCESS_KEY"
  | "ARTIFACT_S3_BUCKET"
  | "ARTIFACT_S3_ENDPOINT"
  | "ARTIFACT_S3_FORCE_PATH_STYLE"
  | "ARTIFACT_S3_REGION"
  | "ARTIFACT_S3_SECRET_KEY"
  | "SOURCE_OBJECT_PREFIX"
>;

export type SourceFileStorageWriteInput = {
  sourceId: string;
  originalFileName: string;
  mediaType: string;
  checksumSha256: string;
  body: Buffer;
};

export type StoredSourceFile = {
  storageKind: Extract<SourceSnapshotStorageKind, "object_store">;
  storageRef: string;
};

export interface SourceFileStorage {
  write(input: SourceFileStorageWriteInput): Promise<StoredSourceFile>;
}

export class S3SourceFileStorage implements SourceFileStorage {
  private readonly bucket: string;
  private readonly prefix: string;
  private readonly client: S3Client;

  constructor(
    config: SourceFileStorageConfig,
    client?: S3Client,
  ) {
    this.bucket = config.ARTIFACT_S3_BUCKET;
    this.prefix = normalizeObjectPrefix(config.SOURCE_OBJECT_PREFIX);
    this.client =
      client ??
      new S3Client({
        credentials: {
          accessKeyId: config.ARTIFACT_S3_ACCESS_KEY,
          secretAccessKey: config.ARTIFACT_S3_SECRET_KEY,
        },
        endpoint: config.ARTIFACT_S3_ENDPOINT,
        forcePathStyle: config.ARTIFACT_S3_FORCE_PATH_STYLE,
        region: config.ARTIFACT_S3_REGION,
      });
  }

  async write(input: SourceFileStorageWriteInput): Promise<StoredSourceFile> {
    const key = buildSourceObjectKey({
      checksumSha256: input.checksumSha256,
      originalFileName: input.originalFileName,
      prefix: this.prefix,
      sourceId: input.sourceId,
    });

    await this.client.send(
      new PutObjectCommand({
        Body: input.body,
        Bucket: this.bucket,
        ContentType: input.mediaType,
        Key: key,
      }),
    );

    return {
      storageKind: "object_store",
      storageRef: formatS3StorageRef(this.bucket, key),
    };
  }
}

export class InMemorySourceFileStorage implements SourceFileStorage {
  private readonly objects = new Map<string, Buffer>();
  private readonly bucket: string;
  private readonly prefix: string;

  constructor(input?: { bucket?: string; prefix?: string }) {
    this.bucket = input?.bucket ?? "in-memory-source-files";
    this.prefix = normalizeObjectPrefix(input?.prefix ?? "sources");
  }

  async write(input: SourceFileStorageWriteInput): Promise<StoredSourceFile> {
    const key = buildSourceObjectKey({
      checksumSha256: input.checksumSha256,
      originalFileName: input.originalFileName,
      prefix: this.prefix,
      sourceId: input.sourceId,
    });
    const storageRef = formatS3StorageRef(this.bucket, key);

    this.objects.set(storageRef, Buffer.from(input.body));

    return {
      storageKind: "object_store",
      storageRef,
    };
  }

  read(storageRef: string) {
    return this.objects.get(storageRef) ?? null;
  }
}

export function buildSourceObjectKey(input: {
  prefix: string;
  sourceId: string;
  checksumSha256: string;
  originalFileName: string;
}) {
  return [
    normalizeObjectPrefix(input.prefix),
    input.sourceId,
    input.checksumSha256,
    encodeURIComponent(input.originalFileName),
  ].join("/");
}

function formatS3StorageRef(bucket: string, key: string) {
  return `s3://${bucket}/${key}`;
}

function normalizeObjectPrefix(prefix: string) {
  return prefix.replace(/^\/+|\/+$/g, "") || "sources";
}
