export type ReadOnlyAppMcpFreshnessState =
  | "fresh"
  | "stale"
  | "unsupported"
  | "missing";

export type ReadOnlyAppMcpTone =
  | "neutral"
  | "fresh"
  | "warning"
  | "danger"
  | "proof";

export type ReadOnlyAppMcpFreshness = {
  checkedAt: string;
  failClosedIfStale: boolean;
  state: ReadOnlyAppMcpFreshnessState;
  summary: string;
};

export type ReadOnlyAppMcpLimitation = {
  code: string;
  severity: "info" | "warning" | "blocking";
  summary: string;
};

export type ReadOnlyAppMcpCitation = {
  boundedExcerptOnly: boolean;
  citationId: string;
  locator: string;
  sourceAnchorId: string;
  summary: string;
};

export type ReadOnlyAppMcpSourceAnchor = {
  checksumSha256?: string;
  locator: string;
  sourceAnchorId: string;
  sourceId: string;
  summary: string;
  title: string;
};

export type ReadOnlyAppMcpEvidenceCard = {
  citations: ReadOnlyAppMcpCitation[];
  evidenceCardId: string;
  freshness: ReadOnlyAppMcpFreshness;
  limitations: ReadOnlyAppMcpLimitation[];
  sourceAnchorIds: string[];
  summary: string;
  title: string;
};

export type ReadOnlyAppMcpPermittedNextAction = {
  action: "request_human_review";
  label: string;
  summary: string;
};

export type ReadOnlyAppMcpForbiddenAction = {
  action: string;
  reason: string;
};

export type ReadOnlyAppMcpBoundary = {
  items: string[];
  summary: string;
  title: string;
};

export type ReadOnlyAppMcpAnswer = {
  evidenceCount: number;
  freshness: ReadOnlyAppMcpFreshness;
  statusLabel: string;
  summary: string;
  title: string;
};

export type ReadOnlyAppMcpRefusalReason =
  | "missing_citation"
  | "unsupported_evidence"
  | "stale_evidence"
  | "prompt_injection"
  | "data_exfiltration"
  | "raw_full_file_dump_request"
  | "unsafe_action";

export type ReadOnlyAppMcpRefusal = {
  freshness: ReadOnlyAppMcpFreshness;
  reason: ReadOnlyAppMcpRefusalReason;
  summary: string;
  title: string;
};
