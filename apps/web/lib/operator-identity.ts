const DEFAULT_OPERATOR_NAME = "Local web operator";

export function getWebOperatorIdentity() {
  const configured = process.env.POCKET_CTO_WEB_OPERATOR_NAME?.trim();

  if (configured && configured.length > 0) {
    return configured;
  }

  return DEFAULT_OPERATOR_NAME;
}
