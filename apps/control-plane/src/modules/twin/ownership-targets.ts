import type {
  TwinEntity,
  TwinRepositoryMetadataDirectory,
  TwinRepositoryMetadataManifest,
} from "@pocket-cto/domain";
import type { TwinEntityRecord } from "./types";

type TwinEntityLike = Pick<
  TwinEntityRecord | TwinEntity,
  "id" | "kind" | "payload" | "stableKey" | "title"
>;

export type OwnershipDirectoryTarget = TwinRepositoryMetadataDirectory & {
  entityId: string;
  kind: "workspace_directory";
  stableKey: string;
};

export type OwnershipManifestTarget = TwinRepositoryMetadataManifest & {
  entityId: string;
  kind: "package_manifest";
  stableKey: string;
};

export type OwnershipTarget =
  | OwnershipDirectoryTarget
  | OwnershipManifestTarget;

export function readOwnershipTargets(entities: TwinEntityLike[]): OwnershipTarget[] {
  const targets: OwnershipTarget[] = [];

  for (const entity of entities) {
    if (entity.kind === "workspace_directory") {
      targets.push(readDirectoryTarget(entity));
      continue;
    }

    if (entity.kind === "package_manifest") {
      targets.push(readManifestTarget(entity));
    }
  }

  return targets.sort((left, right) => {
      return (
        left.path.localeCompare(right.path) ||
        left.kind.localeCompare(right.kind) ||
        left.stableKey.localeCompare(right.stableKey)
      );
    });
}

export function splitOwnershipTargets(targets: OwnershipTarget[]) {
  return {
    directories: targets.filter(
      (target): target is OwnershipDirectoryTarget =>
        target.kind === "workspace_directory",
    ),
    manifests: targets.filter(
      (target): target is OwnershipManifestTarget =>
        target.kind === "package_manifest",
    ),
  };
}

function readDirectoryTarget(entity: TwinEntityLike): OwnershipDirectoryTarget {
  return {
    entityId: entity.id,
    kind: "workspace_directory",
    stableKey: entity.stableKey,
    path: readString(entity.payload, "path") ?? entity.stableKey,
    label: readString(entity.payload, "label") ?? entity.title,
    classification:
      readString(entity.payload, "classification") ?? "workspace_group",
  };
}

function readManifestTarget(entity: TwinEntityLike): OwnershipManifestTarget {
  return {
    entityId: entity.id,
    kind: "package_manifest",
    stableKey: entity.stableKey,
    path: readString(entity.payload, "path") ?? entity.stableKey,
    packageName: readNullableString(entity.payload, "packageName"),
    private: readNullableBoolean(entity.payload, "private"),
    hasWorkspaces: readBoolean(entity.payload, "hasWorkspaces") ?? false,
    scriptNames: readStringArray(entity.payload, "scriptNames"),
  };
}

function readBoolean(
  payload: Record<string, unknown>,
  key: string,
) {
  const value = payload[key];
  return typeof value === "boolean" ? value : null;
}

function readNullableBoolean(
  payload: Record<string, unknown>,
  key: string,
) {
  const value = payload[key];
  return typeof value === "boolean" ? value : null;
}

function readNullableString(
  payload: Record<string, unknown>,
  key: string,
) {
  const value = payload[key];
  return typeof value === "string" && value.length > 0 ? value : null;
}

function readString(
  payload: Record<string, unknown>,
  key: string,
) {
  return readNullableString(payload, key);
}

function readStringArray(
  payload: Record<string, unknown>,
  key: string,
) {
  const value = payload[key];

  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is string => typeof item === "string" && item.length > 0)
    .sort((left, right) => left.localeCompare(right));
}
