"use client";

import React from "react";
import type { FinanceDiscoveryQuestionKind } from "@pocket-cto/domain";
import {
  FINANCE_DISCOVERY_QUESTION_KINDS,
  readFinanceDiscoveryQuestionKindLabel,
} from "@pocket-cto/domain";
import { submitDiscoveryMissionIntake } from "../app/missions/actions";
import { getWebOperatorIdentity } from "../lib/operator-identity";

type DiscoveryMissionIntakeFormProps = {
  buttonLabel?: string;
  helperText?: string;
  initialQuestionKind?: FinanceDiscoveryQuestionKind | "";
};

export function DiscoveryMissionIntakeForm({
  buttonLabel = "Create finance analysis mission",
  helperText = "This submits the typed finance-analysis payload and redirects into mission detail after creation.",
  initialQuestionKind = "",
}: DiscoveryMissionIntakeFormProps) {
  const operatorIdentity = getWebOperatorIdentity();
  const [questionKind, setQuestionKind] =
    React.useState<FinanceDiscoveryQuestionKind | "">(initialQuestionKind);
  const policyLookupSelected = questionKind === "policy_lookup";

  return (
    <form action={submitDiscoveryMissionIntake} className="mission-intake-form">
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
        id="discovery-question-kind"
        name="questionKind"
        onChange={(event) =>
          setQuestionKind(event.currentTarget.value as FinanceDiscoveryQuestionKind)
        }
        required
        value={questionKind}
      >
        <option value="" disabled>
          Choose a finance question kind
        </option>
        {FINANCE_DISCOVERY_QUESTION_KINDS.map((supportedQuestionKind) => (
          <option key={supportedQuestionKind} value={supportedQuestionKind}>
            {readFinanceDiscoveryQuestionKindLabel(supportedQuestionKind)}
          </option>
        ))}
      </select>

      {policyLookupSelected ? (
        <>
          <label className="field-label" htmlFor="discovery-policy-source-id">
            Policy source id
          </label>
          <input
            className="field-control"
            id="discovery-policy-source-id"
            name="policySourceId"
            placeholder="00000000-0000-0000-0000-000000000000"
            required
            type="text"
          />
          <p className="muted" style={{ marginTop: 8 }}>
            Required for <code>policy_lookup</code>. Use the exact bound source
            id for the company&apos;s <code>policy_document</code> binding.
          </p>
        </>
      ) : null}

      <label className="field-label" htmlFor="discovery-operator-prompt">
        Operator prompt
      </label>
      <textarea
        className="text-area"
        id="discovery-operator-prompt"
        name="operatorPrompt"
        placeholder={
          policyLookupSelected
            ? "Which scoped policy page should I review from stored state, and what limitations or extract gaps remain visible?"
            : "What finance posture should I review from stored state, and which evidence gaps matter most?"
        }
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
