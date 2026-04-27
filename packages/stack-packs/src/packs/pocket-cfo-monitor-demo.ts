import type { PocketCfoDemoStackPack } from "../stack-pack";

export const pocketCfoMonitorDemoPack: PocketCfoDemoStackPack = {
  id: "pocket-cfo-monitor-demo",
  displayName: "Pocket CFO Monitor Demo",
  purpose:
    "Checked-in F6F demo fixture pack for replaying the shipped source-backed monitor stack for one demo company.",
  fixtureDirectory: "packages/testkit/fixtures/f6f-monitor-demo-stack",
  sourceFiles: [
    {
      role: "bank_cash",
      fixturePath: "sources/bank-cash.csv",
      sourceKind: "dataset",
      mediaType: "text/csv",
      expectedExtractorKey: "bank_account_summary_csv",
    },
    {
      role: "receivables_aging",
      fixturePath: "sources/receivables-aging.csv",
      sourceKind: "dataset",
      mediaType: "text/csv",
      expectedExtractorKey: "receivables_aging_csv",
    },
    {
      role: "payables_aging",
      fixturePath: "sources/payables-aging.csv",
      sourceKind: "dataset",
      mediaType: "text/csv",
      expectedExtractorKey: "payables_aging_csv",
    },
    {
      role: "policy_thresholds",
      fixturePath: "sources/policy-thresholds.md",
      sourceKind: "document",
      mediaType: "text/markdown",
      documentRole: "policy_document",
    },
  ],
  monitorFamiliesCovered: [
    "cash_posture",
    "collections_pressure",
    "payables_pressure",
    "policy_covenant_threshold",
  ],
  expectedOutputManifestPath:
    "packages/testkit/fixtures/f6f-monitor-demo-stack/expected-monitor-results.json",
  cashAlertInvestigationHandoffExpected: true,
  limitations: [
    "The pack is a deterministic local demo fixture set, not a broad demo platform.",
    "The pack covers only shipped F6A through F6E monitor families.",
    "The pack does not add monitor families, discovery families, report artifacts, approvals, delivery, runtime-Codex, payment behavior, legal advice, policy advice, or autonomous remediation.",
    "The pack preserves GitHub as optional connector context and does not require GitHub as a Pocket CFO source of truth.",
  ],
  runtimeAndDeliveryBoundary:
    "Replay is source-backed and route-driven only; it remains runtime-free, delivery-free, report-free, approval-free, payment-free, and non-autonomous.",
};
