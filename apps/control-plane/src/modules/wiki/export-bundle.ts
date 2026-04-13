import { createHash } from "node:crypto";
import type {
  CfoWikiExportFile,
  CfoWikiExportManifest,
  CfoWikiPageRecord,
  FinanceCompanyRecord,
} from "@pocket-cto/domain";
import { buildCfoWikiMarkdownPath } from "@pocket-cto/domain";

export function buildCfoWikiExportBundle(input: {
  company: FinanceCompanyRecord;
  exportedAt: string;
  limitations: string[];
  pages: CfoWikiPageRecord[];
}) {
  const pages = [...input.pages].sort((left, right) =>
    left.pageKey.localeCompare(right.pageKey),
  );
  const bundleRootPath = `${input.company.companyKey}-cfo-wiki`;
  const manifest: CfoWikiExportManifest = {
    bundleRootPath,
    generatedAt: input.exportedAt,
    companyKey: input.company.companyKey,
    companyDisplayName: input.company.displayName,
    indexPath: buildCfoWikiMarkdownPath("index"),
    logPath: buildCfoWikiMarkdownPath("log"),
    pageCount: pages.length,
    fileCount: pages.length + 1,
    limitations: input.limitations,
    pages: pages.map((page) => ({
      pageKey: page.pageKey,
      markdownPath: buildCfoWikiMarkdownPath(page.pageKey),
      pageKind: page.pageKind,
      ownershipKind: page.ownershipKind,
      temporalStatus: page.temporalStatus,
      title: page.title,
    })),
  };
  const manifestBody = `${JSON.stringify(manifest, null, 2)}\n`;
  const files: CfoWikiExportFile[] = [
    buildFile("manifest.json", "application/json", manifestBody),
    ...pages.map((page) =>
      buildFile(
        buildCfoWikiMarkdownPath(page.pageKey),
        "text/markdown",
        ensureTrailingNewline(page.markdownBody),
      ),
    ),
  ];

  return {
    bundleRootPath,
    fileCount: files.length,
    files: files.sort((left, right) => left.path.localeCompare(right.path)),
    manifest: {
      ...manifest,
      fileCount: files.length,
    },
    pageCount: pages.length,
  };
}

function buildFile(
  path: string,
  contentType: CfoWikiExportFile["contentType"],
  body: string,
): CfoWikiExportFile {
  return {
    path,
    contentType,
    sha256: createHash("sha256").update(body).digest("hex"),
    sizeBytes: Buffer.byteLength(body, "utf8"),
    body,
  };
}

function ensureTrailingNewline(value: string) {
  return value.endsWith("\n") ? value : `${value}\n`;
}
