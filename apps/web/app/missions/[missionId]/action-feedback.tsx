import React from "react";
import type { MissionActionState } from "../../../lib/operator-actions";

type ActionFeedbackProps = {
  result: MissionActionState;
};

export function ActionFeedback({ result }: ActionFeedbackProps) {
  if (!result) {
    return null;
  }

  return (
    <p
      aria-live="polite"
      className={`action-feedback ${result.ok ? "success" : "error"}`}
      role={result.ok ? "status" : "alert"}
    >
      {result.message}
    </p>
  );
}
