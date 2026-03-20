import { posix } from "node:path";
import type {
  TwinRepositoryMetadataDirectory,
  TwinRepositoryMetadataManifest,
} from "@pocket-cto/domain";

export function collectDirectoryMatches(
  changedPaths: string[],
  directories: TwinRepositoryMetadataDirectory[],
) {
  return directories
    .map((directory) => ({
      ...directory,
      matchedChangedPaths: changedPaths.filter((changedPath) =>
        isSameOrNestedPath(changedPath, directory.path),
      ),
    }))
    .filter((directory) => directory.matchedChangedPaths.length > 0)
    .sort((left, right) => left.path.localeCompare(right.path));
}

export function collectPrimaryManifestMatches(
  changedPaths: string[],
  manifests: TwinRepositoryMetadataManifest[],
) {
  const matchedPathsByManifest = new Map<string, Set<string>>();

  for (const changedPath of changedPaths) {
    const manifest = findNearestManifest(changedPath, manifests);

    if (!manifest) {
      continue;
    }

    const existing = matchedPathsByManifest.get(manifest.path) ?? new Set<string>();
    existing.add(changedPath);
    matchedPathsByManifest.set(manifest.path, existing);
  }

  return manifests
    .filter((manifest) => matchedPathsByManifest.has(manifest.path))
    .map((manifest) => ({
      ...manifest,
      matchedChangedPaths: [...(matchedPathsByManifest.get(manifest.path) ?? [])],
    }))
    .sort((left, right) => left.path.localeCompare(right.path));
}

export function normalizeChangedPaths(paths: string[]) {
  return [...new Set(paths.map(normalizeRepoRelativePath))];
}

function findNearestManifest(
  changedPath: string,
  manifests: TwinRepositoryMetadataManifest[],
) {
  return [...manifests]
    .filter((manifest) => matchesManifest(changedPath, manifest.path))
    .sort((left, right) => {
      return (
        compareManifestSpecificity(right.path, left.path) ||
        left.path.localeCompare(right.path)
      );
    })[0] ?? null;
}

function compareManifestSpecificity(leftPath: string, rightPath: string) {
  const leftDir = manifestDirectory(leftPath);
  const rightDir = manifestDirectory(rightPath);

  return (
    leftDir.split("/").filter(Boolean).length -
    rightDir.split("/").filter(Boolean).length
  );
}

function matchesManifest(changedPath: string, manifestPath: string) {
  if (changedPath === manifestPath) {
    return true;
  }

  const directory = manifestDirectory(manifestPath);
  return directory.length === 0 || isSameOrNestedPath(changedPath, directory);
}

function manifestDirectory(manifestPath: string) {
  const directory = posix.dirname(normalizeRepoRelativePath(manifestPath));
  return directory === "." ? "" : directory;
}

function normalizeRepoRelativePath(path: string) {
  const normalized = posix.normalize(path.trim().replaceAll("\\", "/"));
  return normalized.startsWith("./") ? normalized.slice(2) : normalized;
}

function isSameOrNestedPath(changedPath: string, targetPath: string) {
  const normalizedChangedPath = normalizeRepoRelativePath(changedPath);
  const normalizedTargetPath = normalizeRepoRelativePath(targetPath);

  return (
    normalizedChangedPath === normalizedTargetPath ||
    normalizedChangedPath.startsWith(`${normalizedTargetPath}/`)
  );
}
