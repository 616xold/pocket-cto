import React from "react";
import { FINANCE_DISCOVERY_QUESTION_KINDS } from "@pocket-cto/domain";
import { submitDiscoveryMissionIntake } from "../app/missions/actions";
import { getWebOperatorIdentity } from "../lib/operator-identity";

type DiscoveryMissionIntakeFormProps = {
  buttonLabel?: string;
  helperText?: string;
};

export function DiscoveryMissionIntakeForm({
  buttonLabel = "Create finance analysis mission",
  helperText = "This submits the typed finance-analysis payload and redirects into mission detail after creation.",
}: DiscoveryMissionIntakeFormProps) {
  const operatorIdentity = getWebOperatorIdentity();

  return (
    <form
      action={submitDiscoveryMissionIntake}
      className="mission-intake-form"
    >
      <label className="field-label" htmlFor="discovery-company-key">
        Company key
      </label>
      <input
        className="field-control"
        id="discovery-company-key"
        name="companyKey"
        placeholder="acme"
        required
        type="text"
      />

      <label className="field-label" htmlFor="discovery-question-kind">
        Question kind
      </label>
      <select
        className="field-control"
        defaultValue="cash_posture"
        id="discovery-question-kind"
        name="questionKind"
      >
        {FINANCE_DISCOVERY_QUESTION_KINDS.map((questionKind) => (
          <option key={questionKind} value={questionKind}>
            {questionKind}
          </option>
        ))}
      </select>

      <label className="field-label" htmlFor="discovery-operator-prompt">
        Operator prompt
      </label>
      <textarea
        className="text-area"
        id="discovery-operator-prompt"
        name="operatorPrompt"
        placeholder="What is our current cash posture and what evidence gaps should I keep in mind?"
        rows={3}
      />

      <input type="hidden" name="requestedBy" value={operatorIdentity} />
      <p className="muted" style={{ marginBottom: 0 }}>
        Created as <code>{operatorIdentity}</code>. {helperText}
      </p>

      <div className="button-row" style={{ marginTop: 16 }}>
        <button className="button primary" type="submit">
          {buttonLabel}
        </button>
      </div>
    </form>
  );
}
