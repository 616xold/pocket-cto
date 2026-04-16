"use client";

import React from "react";
import type { FinanceDiscoveryQuestionKind } from "@pocket-cto/domain";
import {
  FINANCE_DISCOVERY_QUESTION_KINDS,
  readFinanceDiscoveryQuestionKindLabel,
} from "@pocket-cto/domain";
import { submitDiscoveryMissionIntake } from "../app/missions/actions";
import { getCfoWikiCompanySourceList } from "../lib/api";
import { getWebOperatorIdentity } from "../lib/operator-identity";
import {
  buildPolicySourceOptions,
  isPolicySourceSelectorDisabled,
  readPolicySourceSelectorPlaceholder,
  type PolicySourceOption,
  type PolicySourceSelectorStatus,
} from "./policy-source-selector";

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
  const [companyKey, setCompanyKey] = React.useState("");
  const [questionKind, setQuestionKind] =
    React.useState<FinanceDiscoveryQuestionKind | "">(initialQuestionKind);
  const [policySourceId, setPolicySourceId] = React.useState("");
  const [policySourceOptions, setPolicySourceOptions] = React.useState<
    PolicySourceOption[]
  >([]);
  const [policySourceStatus, setPolicySourceStatus] =
    React.useState<PolicySourceSelectorStatus>("idle");
  const policyLookupSelected = questionKind === "policy_lookup";
  const deferredCompanyKey = React.useDeferredValue(companyKey.trim());

  React.useEffect(() => {
    if (!policyLookupSelected) {
      setPolicySourceId("");
      setPolicySourceOptions([]);
      setPolicySourceStatus("idle");
      return;
    }

    if (!deferredCompanyKey) {
      setPolicySourceId("");
      setPolicySourceOptions([]);
      setPolicySourceStatus("idle");
      return;
    }

    let cancelled = false;
    setPolicySourceStatus("loading");

    void getCfoWikiCompanySourceList(deferredCompanyKey)
      .then((sourceList) => {
        if (cancelled) {
          return;
        }

        if (sourceList === null) {
          setPolicySourceId("");
          setPolicySourceOptions([]);
          setPolicySourceStatus("error");
          return;
        }

        const options = buildPolicySourceOptions(sourceList);
        setPolicySourceOptions(options);
        setPolicySourceStatus(options.length > 0 ? "ready" : "empty");
        setPolicySourceId((current) =>
          options.some((option) => option.policySourceId === current)
            ? current
            : "",
        );
      })
      .catch(() => {
        if (cancelled) {
          return;
        }

        setPolicySourceId("");
        setPolicySourceOptions([]);
        setPolicySourceStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [deferredCompanyKey, policyLookupSelected]);

  const policySourceSelectorDisabled = isPolicySourceSelectorDisabled({
    companyKey: deferredCompanyKey,
    status: policySourceStatus,
  });
  const policySourcePlaceholder = readPolicySourceSelectorPlaceholder({
    companyKey: deferredCompanyKey,
    status: policySourceStatus,
  });
  const selectedPolicySource =
    policySourceOptions.find(
      (option) => option.policySourceId === policySourceId,
    ) ?? null;
  const policyLookupSubmitBlocked =
    policyLookupSelected && (policySourceSelectorDisabled || !policySourceId);

  return (
    <form action={submitDiscoveryMissionIntake} className="mission-intake-form">
      <label className="field-label" htmlFor="discovery-company-key">
        Company key
      </label>
      <input
        className="field-control"
        id="discovery-company-key"
        name="companyKey"
        onChange={(event) => setCompanyKey(event.currentTarget.value)}
        placeholder="acme"
        required
        type="text"
        value={companyKey}
      />

      <label className="field-label" htmlFor="discovery-question-kind">
        Question kind
      </label>
      <select
        className="field-control"
        id="discovery-question-kind"
        name="questionKind"
        onChange={(event) => {
          const nextQuestionKind =
            event.currentTarget.value as FinanceDiscoveryQuestionKind;
          setQuestionKind(nextQuestionKind);
        }}
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
            Policy source
          </label>
          <select
            className="field-control"
            id="discovery-policy-source-id"
            name="policySourceId"
            disabled={policySourceSelectorDisabled}
            onChange={(event) => setPolicySourceId(event.currentTarget.value)}
            required={!policySourceSelectorDisabled}
            value={policySourceId}
          >
            <option value="" disabled>
              {policySourcePlaceholder}
            </option>
            {policySourceOptions.map((option) => (
              <option
                key={option.policySourceId}
                value={option.policySourceId}
              >
                {option.label}
              </option>
            ))}
          </select>
          <p className="muted" style={{ marginTop: 8 }}>
            Required for <code>policy_lookup</code>. Only sources already bound
            as <code>policy_document</code> appear here, and submission still
            sends the explicit <code>policySourceId</code> contract.
          </p>
          {selectedPolicySource ? (
            <p className="muted" style={{ marginTop: 8 }}>
              Selected scope:{" "}
              <code>
                {selectedPolicySource.scope.sourceName ??
                  selectedPolicySource.policySourceId}
              </code>{" "}
              · <code>{selectedPolicySource.policySourceId}</code>
            </p>
          ) : null}
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
        <button
          className="button primary"
          disabled={policyLookupSubmitBlocked}
          type="submit"
        >
          {buttonLabel}
        </button>
      </div>
    </form>
  );
}
