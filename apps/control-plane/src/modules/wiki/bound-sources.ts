import type {
  CfoWikiDocumentExtractRecord,
  CfoWikiSourceBindingRecord,
  SourceFileRecord,
  SourceKind,
  SourceRecord,
  SourceSnapshotRecord,
} from "@pocket-cto/domain";
import type { CfoWikiRepository } from "./repository";
import type { SourceRepository } from "../sources/repository";

export type BoundSourceSummary = {
  binding: CfoWikiSourceBindingRecord;
  latestExtract: CfoWikiDocumentExtractRecord | null;
  latestSnapshot: SourceSnapshotRecord | null;
  latestSourceFile: SourceFileRecord | null;
  limitations: string[];
  source: SourceRecord;
};

export async function loadBoundSourceSummaries(input: {
  companyId: string;
  sourceRepository: Pick<
    SourceRepository,
    "getSourceById" | "listSnapshotsBySourceId" | "listSourceFilesBySourceId"
  >;
  wikiRepository: Pick<
    CfoWikiRepository,
    "listDocumentExtractsByCompanyId" | "listSourceBindingsByCompanyId"
  >;
}): Promise<BoundSourceSummary[]> {
  const [bindings, extracts] = await Promise.all([
    input.wikiRepository.listSourceBindingsByCompanyId(input.companyId),
    input.wikiRepository.listDocumentExtractsByCompanyId(input.companyId),
  ]);
  const extractBySnapshotId = new Map(
    extracts.map((extract) => [extract.sourceSnapshotId, extract] as const),
  );

  return Promise.all(
    bindings.map(async (binding) => {
      const source = await input.sourceRepository.getSourceById(binding.sourceId);

      if (!source) {
        throw new Error(
          `CFO Wiki source binding ${binding.id} references missing source ${binding.sourceId}`,
        );
      }

      const [snapshots, sourceFiles] = await Promise.all([
        input.sourceRepository.listSnapshotsBySourceId(binding.sourceId),
        input.sourceRepository.listSourceFilesBySourceId(binding.sourceId),
      ]);
      const latestSnapshot = snapshots[0] ?? null;
      const sourceFileBySnapshotId = new Map(
        sourceFiles.map((sourceFile) => [sourceFile.sourceSnapshotId, sourceFile] as const),
      );
      const latestSourceFile = latestSnapshot
        ? (sourceFileBySnapshotId.get(latestSnapshot.id) ?? null)
        : null;
      const latestExtract = latestSnapshot
        ? (extractBySnapshotId.get(latestSnapshot.id) ?? null)
        : null;

      return {
        binding,
        latestExtract,
        latestSnapshot,
        latestSourceFile,
        limitations: buildBoundSourceLimitations({
          binding,
          latestExtract,
          latestSnapshot,
          latestSourceFile,
          sourceKind: source.kind,
        }),
        source,
      };
    }),
  );
}

export function buildBoundSourceListLimitations(sourceCount: number) {
  const limitations = [
    "Company-scoped wiki document bindings are explicit and manual across F3B and F3D; the compiler does not infer company scope from filenames, creators, or source names.",
    "F3 document-derived pages currently support deterministic markdown and plain-text extraction only; unsupported PDFs, scans, and unreadable files remain visible as gaps.",
  ];

  if (sourceCount === 0) {
    limitations.push(
      "No company-scoped wiki document bindings are stored for this company yet.",
    );
  }

  return limitations;
}

function buildBoundSourceLimitations(input: {
  binding: CfoWikiSourceBindingRecord;
  latestExtract: CfoWikiDocumentExtractRecord | null;
  latestSnapshot: SourceSnapshotRecord | null;
  latestSourceFile: SourceFileRecord | null;
  sourceKind: SourceKind;
}) {
  const limitations: string[] = [];

  if (input.sourceKind !== "document") {
    limitations.push(
      "This source is not a `document` source kind, so it cannot compile into CFO Wiki document-derived pages truthfully.",
    );
  }

  if (!input.binding.includeInCompile) {
    limitations.push(
      "This binding is stored but currently excluded from compile by `includeInCompile=false`.",
    );
  }

  if (!input.latestSnapshot) {
    limitations.push("No source snapshot is stored for this binding yet.");
  }

  if (!input.latestSourceFile) {
    limitations.push(
      "The latest snapshot has no stored raw source file linked yet, so F3B cannot extract bytes from it.",
    );
  }

  if (!input.latestExtract) {
    limitations.push(
      "No persisted document extract exists yet for the latest snapshot.",
    );
  }

  if (input.latestExtract?.extractStatus === "unsupported") {
    limitations.push(
      input.latestExtract.warnings[0] ??
        "The latest snapshot remains unsupported for deterministic extraction in this F3B slice.",
    );
  }

  if (input.latestExtract?.extractStatus === "failed") {
    limitations.push(
      input.latestExtract.errorSummary ??
        "Deterministic extraction failed for the latest snapshot.",
    );
  }

  return [...new Set(limitations)];
}
