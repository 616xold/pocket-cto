import { readdir, readFile, stat } from "node:fs/promises";
import { join } from "node:path";

export type DiscoveredWorkflowFile = {
  content: string;
  lineCount: number;
  modifiedAt: string | null;
  path: string;
  sizeBytes: number;
};

const workflowDirectoryPath = ".github/workflows";

export async function discoverWorkflowFiles(
  repoRoot: string,
): Promise<DiscoveredWorkflowFile[]> {
  const discoveredPaths: string[] = [];

  try {
    await walkWorkflowDirectory(
      join(repoRoot, workflowDirectoryPath),
      workflowDirectoryPath,
      discoveredPaths,
    );
  } catch (error) {
    if (isMissingDirectoryError(error)) {
      return [];
    }

    throw error;
  }

  return Promise.all(
    discoveredPaths
      .sort((left, right) => left.localeCompare(right))
      .map(async (path) => {
        const absolutePath = join(repoRoot, path);
        const [content, fileStats] = await Promise.all([
          readFile(absolutePath, "utf8"),
          stat(absolutePath),
        ]);

        return {
          content,
          lineCount: countLines(content),
          modifiedAt: fileStats.mtime ? fileStats.mtime.toISOString() : null,
          path,
          sizeBytes: fileStats.size,
        };
      }),
  );
}

async function walkWorkflowDirectory(
  absoluteDirectory: string,
  relativeDirectory: string,
  discoveredPaths: string[],
) {
  const entries = await readdir(absoluteDirectory, {
    withFileTypes: true,
  });

  for (const entry of entries.sort((left, right) =>
    left.name.localeCompare(right.name),
  )) {
    const relativePath = `${relativeDirectory}/${entry.name}`;

    if (entry.isDirectory()) {
      await walkWorkflowDirectory(
        join(absoluteDirectory, entry.name),
        relativePath,
        discoveredPaths,
      );
      continue;
    }

    if (entry.isFile() && /\.ya?ml$/i.test(entry.name)) {
      discoveredPaths.push(relativePath);
    }
  }
}

function countLines(content: string) {
  if (content.length === 0) {
    return 0;
  }

  return content.split(/\r?\n/).length;
}

function isMissingDirectoryError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "ENOENT"
  );
}
