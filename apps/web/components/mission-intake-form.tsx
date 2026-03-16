import React from "react";
import { submitMissionTextIntake } from "../app/missions/actions";
import { getWebOperatorIdentity } from "../lib/operator-identity";

type MissionIntakeFormProps = {
  buttonLabel?: string;
  helperText?: string;
};

export function MissionIntakeForm({
  buttonLabel = "Create mission",
  helperText = "This reuses the existing text-intake backend and redirects into the mission detail flow.",
}: MissionIntakeFormProps) {
  const operatorIdentity = getWebOperatorIdentity();

  return (
    <form action={submitMissionTextIntake} className="mission-intake-form">
      <label className="field-label" htmlFor="mission-text">
        Describe the mission
      </label>
      <textarea
        className="text-area"
        id="mission-text"
        name="text"
        placeholder="Implement passkeys without breaking email login."
        required
        rows={5}
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
