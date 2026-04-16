import type {
  CfoWikiBoundSourceSummary,
  CfoWikiCompanySourceListView,
  FinancePolicySourceScopeSummary,
} from "@pocket-cto/domain";

export type PolicySourceSelectorStatus =
  | "idle"
  | "loading"
  | "ready"
  | "empty"
  | "error";

export type PolicySourceOption = {
  label: string;
  policySourceId: string;
  scope: FinancePolicySourceScopeSummary;
};

export function buildPolicySourceOptions(
  sourceList: CfoWikiCompanySourceListView | null,
): PolicySourceOption[] {
  return (sourceList?.sources ?? [])
    .filter((entry) => entry.binding.documentRole === "policy_document")
    .sort(
      (left, right) =>
        left.source.name.localeCompare(right.source.name) ||
        left.source.id.localeCompare(right.source.id),
    )
    .map((entry) => {
      const scope = buildPolicySourceScope(entry);
      return {
        label: buildPolicySourceOptionLabel(scope),
        policySourceId: entry.source.id,
        scope,
      };
    });
}

export function readPolicySourceSelectorPlaceholder(input: {
  companyKey: string;
  status: PolicySourceSelectorStatus;
}) {
  const companyKey = input.companyKey.trim();

  if (!companyKey) {
    return "Enter a company key to load bound policy documents";
  }

  switch (input.status) {
    case "loading":
      return "Loading bound policy documents...";
    case "empty":
      return "No bound policy documents found for this company";
    case "error":
      return "Could not load bound policy documents for this company";
    case "ready":
      return "Choose a bound policy document";
    default:
      return "Load bound policy documents for this company";
  }
}

export function isPolicySourceSelectorDisabled(input: {
  companyKey: string;
  status: PolicySourceSelectorStatus;
}) {
  if (!input.companyKey.trim()) {
    return true;
  }

  return input.status !== "ready";
}

function buildPolicySourceScope(
  source: CfoWikiBoundSourceSummary,
): FinancePolicySourceScopeSummary {
  return {
    policySourceId: source.source.id,
    sourceName: source.source.name,
    documentRole: source.binding.documentRole,
    includeInCompile: source.binding.includeInCompile,
    latestExtractStatus: source.latestExtract?.extractStatus ?? null,
    latestSnapshotVersion: source.latestSnapshot?.version ?? null,
  };
}

function buildPolicySourceOptionLabel(scope: FinancePolicySourceScopeSummary) {
  const labelParts = [scope.sourceName ?? scope.policySourceId];

  if (scope.latestExtractStatus) {
    labelParts.push(`extract ${humanizeLabel(scope.latestExtractStatus)}`);
  }

  if (typeof scope.latestSnapshotVersion === "number") {
    labelParts.push(`snapshot v${scope.latestSnapshotVersion}`);
  }

  return labelParts.join(" · ");
}

function humanizeLabel(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
