import { readdir, readFile, stat } from "node:fs/promises";
import { join } from "node:path";

export type DiscoveredDocumentationFile = {
  content: string;
  lineCount: number;
  modifiedAt: string | null;
  path: string;
  sizeBytes: number;
};

const rootDocumentationFiles = [
  "README.md",
  "START_HERE.md",
  "WORKFLOW.md",
  "AGENTS.md",
] as const;

const docsDirectoryPath = "docs";

const excludedDocsDirectorySegments = new Set([
  "eval-results",
  "evals",
  "smoke-results",
]);

export async function discoverDocumentationFiles(
  repoRoot: string,
): Promise<DiscoveredDocumentationFile[]> {
  const discoveredPaths = new Set<string>();

  for (const path of rootDocumentationFiles) {
    const file = await readDocumentationFile(repoRoot, path);

    if (file) {
      discoveredPaths.add(file.path);
    }
  }

  try {
    await walkDocsDirectory(
      join(repoRoot, docsDirectoryPath),
      docsDirectoryPath,
      discoveredPaths,
    );
  } catch (error) {
    if (!isMissingPathError(error)) {
      throw error;
    }
  }

  return Promise.all(
    [...discoveredPaths]
      .sort((left, right) => left.localeCompare(right))
      .map(async (path) => {
        const file = await readDocumentationFile(repoRoot, path);

        if (!file) {
          throw new Error(`Documentation file ${path} disappeared during discovery`);
        }

        return file;
      }),
  );
}

async function readDocumentationFile(repoRoot: string, path: string) {
  const absolutePath = join(repoRoot, path);

  try {
    const fileStats = await stat(absolutePath);

    if (!fileStats.isFile()) {
      return null;
    }

    const content = await readFile(absolutePath, "utf8");

    return {
      content,
      lineCount: countLines(content),
      modifiedAt: fileStats.mtime ? fileStats.mtime.toISOString() : null,
      path,
      sizeBytes: fileStats.size,
    };
  } catch (error) {
    if (isMissingPathError(error)) {
      return null;
    }

    throw error;
  }
}

async function walkDocsDirectory(
  absoluteDirectory: string,
  relativeDirectory: string,
  discoveredPaths: Set<string>,
) {
  const entries = await readdir(absoluteDirectory, {
    withFileTypes: true,
  });

  for (const entry of entries.sort((left, right) =>
    left.name.localeCompare(right.name),
  )) {
    const relativePath = `${relativeDirectory}/${entry.name}`;

    if (entry.isDirectory()) {
      if (excludedDocsDirectorySegments.has(entry.name)) {
        continue;
      }

      await walkDocsDirectory(
        join(absoluteDirectory, entry.name),
        relativePath,
        discoveredPaths,
      );
      continue;
    }

    if (entry.isFile() && /\.md$/i.test(entry.name)) {
      discoveredPaths.add(relativePath);
    }
  }
}

function countLines(content: string) {
  if (content.length === 0) {
    return 0;
  }

  return content.split(/\r?\n/).length;
}

function isMissingPathError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "ENOENT"
  );
}
