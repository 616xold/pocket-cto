import React from "react";
import { submitDiscoveryMissionIntake } from "../app/missions/actions";
import { getWebOperatorIdentity } from "../lib/operator-identity";

type DiscoveryMissionIntakeFormProps = {
  buttonLabel?: string;
  helperText?: string;
};

export function DiscoveryMissionIntakeForm({
  buttonLabel = "Create discovery mission",
  helperText = "This calls the existing typed discovery backend and redirects into mission detail after creation.",
}: DiscoveryMissionIntakeFormProps) {
  const operatorIdentity = getWebOperatorIdentity();

  return (
    <form
      action={submitDiscoveryMissionIntake}
      className="mission-intake-form"
    >
      <label className="field-label" htmlFor="discovery-repo-full-name">
        Repo full name
      </label>
      <input
        className="field-control"
        id="discovery-repo-full-name"
        name="repoFullName"
        placeholder="616xold/pocket-cto"
        required
        type="text"
      />

      <label className="field-label" htmlFor="discovery-question-kind">
        Question kind
      </label>
      <select
        className="field-control"
        defaultValue="auth_change"
        id="discovery-question-kind"
        name="questionKind"
      >
        <option value="auth_change">auth_change</option>
      </select>

      <label className="field-label" htmlFor="discovery-changed-paths">
        Changed paths
      </label>
      <textarea
        className="text-area"
        id="discovery-changed-paths"
        name="changedPaths"
        placeholder="apps/control-plane/src/modules/github-app/auth.ts"
        required
        rows={4}
      />

      <input type="hidden" name="requestedBy" value={operatorIdentity} />
      <p className="muted" style={{ marginBottom: 0 }}>
        Created as <code>{operatorIdentity}</code>. {helperText} Use one
        repo-relative path per line.
      </p>

      <div className="button-row" style={{ marginTop: 16 }}>
        <button className="button primary" type="submit">
          {buttonLabel}
        </button>
      </div>
    </form>
  );
}
