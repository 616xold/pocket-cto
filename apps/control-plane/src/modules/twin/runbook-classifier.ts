import type { ParsedDocumentationFile } from "./docs-parser";

export type ClassifiedRunbookDocument = {
  classificationReason:
    | "docs_ops_path"
    | "readme_operational_heading"
    | "start_here_root"
    | "workflow_root";
  file: ParsedDocumentationFile;
};

const operationalReadmeHeadingPattern =
  /\b(local development|bootstrap|quality gates|commands|ops|runbook|smoke|validation|rollback|troubleshooting)\b/i;

export function classifyRunbookDocuments(
  files: ParsedDocumentationFile[],
): ClassifiedRunbookDocument[] {
  return files
    .map((file) => {
      const classificationReason = classifyRunbookDocument(file);

      return classificationReason
        ? {
            classificationReason,
            file,
          }
        : null;
    })
    .filter(
      (candidate): candidate is ClassifiedRunbookDocument => candidate !== null,
    )
    .sort((left, right) => left.file.path.localeCompare(right.file.path));
}

function classifyRunbookDocument(
  file: ParsedDocumentationFile,
): ClassifiedRunbookDocument["classificationReason"] | null {
  if (file.path.startsWith("docs/ops/")) {
    return "docs_ops_path";
  }

  if (file.path === "WORKFLOW.md") {
    return "workflow_root";
  }

  if (file.path === "START_HERE.md") {
    return "start_here_root";
  }

  if (
    file.path === "README.md" &&
    file.sections.some(
      (section) =>
        operationalReadmeHeadingPattern.test(section.headingText) ||
        operationalReadmeHeadingPattern.test(section.headingPath),
    )
  ) {
    return "readme_operational_heading";
  }

  return null;
}
