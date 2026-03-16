import { readdir, readFile, stat } from "node:fs/promises";
import { join } from "node:path";

export type DiscoveredPackageManifest = {
  hasWorkspaces: boolean;
  packageName: string | null;
  path: string;
  private: boolean | null;
  scriptNames: string[];
};

export type DiscoveredRootReadme = {
  lineCount: number;
  path: string;
  sizeBytes: number;
};

export type DiscoveredWorkspaceDirectory = {
  classification: string;
  label: string;
  path: string;
};

const ignoredDirectoryNames = new Set([
  ".git",
  ".next",
  ".turbo",
  "build",
  "coverage",
  "dist",
  "node_modules",
  "out",
]);

const workspaceDirectoryDefinitions = [
  {
    classification: "application_group",
    label: "Applications",
    path: "apps",
  },
  {
    classification: "package_group",
    label: "Packages",
    path: "packages",
  },
  {
    classification: "documentation",
    label: "Documentation",
    path: "docs",
  },
  {
    classification: "infrastructure",
    label: "Infrastructure",
    path: "infra",
  },
  {
    classification: "tooling",
    label: "Tools",
    path: "tools",
  },
] as const;

export async function discoverWorkspaceDirectories(repoRoot: string) {
  const rootEntries = await readdir(repoRoot, {
    withFileTypes: true,
  });

  return workspaceDirectoryDefinitions.filter((definition) =>
    rootEntries.some(
      (entry) => entry.isDirectory() && entry.name === definition.path,
    ),
  );
}

export async function discoverPackageManifests(
  repoRoot: string,
): Promise<DiscoveredPackageManifest[]> {
  const manifestPaths: string[] = [];

  await walkRepository(repoRoot, "", manifestPaths);

  return Promise.all(
    manifestPaths.sort((left, right) => left.localeCompare(right)).map(async (path) => {
      const raw = await readFile(join(repoRoot, path), "utf8");
      let manifest: unknown;

      try {
        manifest = JSON.parse(raw);
      } catch (error) {
        throw new Error(
          `Package manifest ${path} is not valid JSON: ${String(error)}`,
        );
      }

      const typedManifest = asObject(manifest);
      const scripts = asObject(typedManifest.scripts);

      return {
        hasWorkspaces:
          Array.isArray(typedManifest.workspaces) ||
          isPlainObject(typedManifest.workspaces),
        packageName:
          typeof typedManifest.name === "string" ? typedManifest.name : null,
        path,
        private:
          typeof typedManifest.private === "boolean"
            ? typedManifest.private
            : null,
        scriptNames: Object.keys(scripts).sort((left, right) =>
          left.localeCompare(right),
        ),
      };
    }),
  );
}

export async function readRootReadme(
  repoRoot: string,
): Promise<DiscoveredRootReadme | null> {
  const rootEntries = await readdir(repoRoot, {
    withFileTypes: true,
  });
  const readmeEntry = rootEntries
    .filter((entry) => entry.isFile() && /^readme(?:\.[^/]+)?$/i.test(entry.name))
    .sort((left, right) => left.name.localeCompare(right.name))[0];

  if (!readmeEntry) {
    return null;
  }

  const path = readmeEntry.name;
  const [content, fileStats] = await Promise.all([
    readFile(join(repoRoot, path), "utf8"),
    stat(join(repoRoot, path)),
  ]);

  return {
    lineCount: countLines(content),
    path,
    sizeBytes: fileStats.size,
  };
}

async function walkRepository(
  repoRoot: string,
  relativeDirectory: string,
  manifestPaths: string[],
) {
  const directoryPath = relativeDirectory
    ? join(repoRoot, relativeDirectory)
    : repoRoot;
  const entries = await readdir(directoryPath, {
    withFileTypes: true,
  });

  for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
    const relativePath = relativeDirectory
      ? `${relativeDirectory}/${entry.name}`
      : entry.name;

    if (entry.isDirectory()) {
      if (ignoredDirectoryNames.has(entry.name)) {
        continue;
      }

      await walkRepository(repoRoot, relativePath, manifestPaths);
      continue;
    }

    if (entry.isFile() && entry.name === "package.json") {
      manifestPaths.push(relativePath);
    }
  }
}

function asObject(value: unknown) {
  return isPlainObject(value) ? value : {};
}

function countLines(content: string) {
  if (content.length === 0) {
    return 0;
  }

  return content.split(/\r?\n/).length;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
