import React from "react";
import type { FinancePolicySourceScopeSummary } from "@pocket-cto/domain";

type PolicySourceScopeFieldsProps = {
  fallbackPolicySourceId?: string | null;
  scope: FinancePolicySourceScopeSummary | null;
};

export function PolicySourceScopeFields({
  fallbackPolicySourceId = null,
  scope,
}: PolicySourceScopeFieldsProps) {
  const policySourceId = scope?.policySourceId ?? fallbackPolicySourceId ?? null;

  if (!policySourceId) {
    return null;
  }

  return (
    <>
      <div>
        <dt>Policy source</dt>
        <dd>{policySourceId}</dd>
      </div>
      {scope?.sourceName ? (
        <div>
          <dt>Source name</dt>
          <dd>{scope.sourceName}</dd>
        </div>
      ) : null}
      {scope?.documentRole ? (
        <div>
          <dt>Document role</dt>
          <dd>{humanizeLabel(scope.documentRole)}</dd>
        </div>
      ) : null}
      {typeof scope?.includeInCompile === "boolean" ? (
        <div>
          <dt>Included in compile</dt>
          <dd>{scope.includeInCompile ? "Yes" : "No"}</dd>
        </div>
      ) : null}
      {scope?.latestExtractStatus ? (
        <div>
          <dt>Latest extract</dt>
          <dd>{humanizeLabel(scope.latestExtractStatus)}</dd>
        </div>
      ) : null}
      {typeof scope?.latestSnapshotVersion === "number" ? (
        <div>
          <dt>Latest snapshot</dt>
          <dd>v{scope.latestSnapshotVersion}</dd>
        </div>
      ) : null}
    </>
  );
}

function humanizeLabel(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
