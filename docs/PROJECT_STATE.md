# Pocket CFO Project State

This file carries the shipped-state ledger that no longer belongs in the root README.

## Current State Summary

Pocket CFO v1/F12 is shipped at the proof, handoff, and manual UI/demo-readiness audit layer, not as a public hosted deployment.

FP-0078 records the F11 public repo hygiene and V2 transition slice. It rewrites the public documentation surface, splits Codex/operator guidance from the human README, records current project state here, and frames V2 boundaries. It adds no product runtime behavior.

FP-0079 records the F12 manual UI/demo-readiness audit. It adds `docs/qa/v1-ui-demo-readiness-audit.md`, records the screenshot-capture limitation, applies only direct read-only UI copy corrections, and adds no product runtime behavior.

FP-0080 is the shipped first V2A EvidenceIndex and document-map foundation record. It adds shared domain contracts, a native deterministic read-only control-plane anchor/trace layer, focused specs, and a direct proof command while preserving raw sources as authoritative for document claims, Finance Twin as authoritative for structured facts, and CFO Wiki as compiled/derived.

FP-0081 is the active V2B document precision adapters foundation plan. It is docs-and-plan only as created and narrows the next implementation candidate to one deterministic policy/covenant text-PDF adapter over EvidenceIndex, with OCR, vector/file search, PageIndex, MCP/ChatGPT App, provider integration, certification, UI, deployment, external communications, source mutation, finance writes, generated prose, and autonomous action still future-only.

## Shipped Architecture Summary

The shipped system is organized around:

- Source Registry for immutable raw files, snapshots, checksums, source roles, provenance, and ingest status.
- Finance Twin for deterministic structured finance state, lineage, freshness posture, and read models.
- CFO Wiki for compiler-owned markdown pages derived from raw-source metadata, deterministic document extracts, and Finance Twin state.
- Mission Engine for typed finance discovery, reporting, monitoring, close/control, readiness, and proof-backed handoffs.
- Evidence/proof layer for answer artifacts, evidence sections, proof bundles, freshness, limitations, and absence boundaries.
- Operator UI for read-only source, mission, wiki, proof, and safety-boundary posture.
- Codex runtime seam for bounded transport and operator/coding support, not source truth.

## Shipped Phases

- **F1 source registry/raw ingest**: immutable file-first source registration, snapshots, checksums, provenance, and ingest posture.
- **F2 Finance Twin breadth**: deterministic trial balance, chart of accounts, general ledger, company snapshots, reconciliation posture, account bridge/prerequisite/balance proof lineage, bank accounts, receivables, payables, contracts, obligations, card expense, spend, and related read models.
- **F3 CFO Wiki**: compiler-owned company/period/source coverage pages, source digest pages, lint/export/filed artifacts, concept pages, metric-definition pages, and policy pages from explicit bindings.
- **F4 discovery**: deterministic typed finance-discovery missions with proof-backed answer artifacts for the fixed shipped families.
- **F5 reporting/packets/approval/release/circulation posture**: draft finance memo, evidence appendix, board packet, lender update, diligence packet, review/readiness, release/circulation logging posture, and correction chronology without system delivery.
- **F6 monitoring/controls/source packs/safety boundaries**: four deterministic monitor families, manual alert handoffs where shipped, close/control checklist, operator readiness, acknowledgement readiness, delivery-readiness boundary, provider boundary, certification boundary, human-confirmation boundary, certification safety, and source-pack proofs.
- **F7 launch-readiness docs**: docs-and-validation-only launch-readiness and active-doc hardening.
- **F8 future-scope triage**: docs-and-validation-only future-scope and roadmap hardening.
- **F9 read-only UI truthfulness polish**: app/web navigation, copy, warning, and status-surface truthfulness only.
- **F10 v1 public launch handoff**: docs-and-validation-only shipped handoff record, with no public deployment or external communications.
- **F11 public repo hygiene and V2 transition**: docs-only README split, active-doc freshness, V2 boundary framing, and stale public wording cleanup.
- **F12 manual UI/demo-readiness audit**: manual app/web route audit, safety-boundary audit, evidence UX audit, screenshot limitation record, and direct read-only copy fixes only.
- **V2A EvidenceIndex and document-map foundation**: shipped through FP-0080 as read-only EvidenceIndex contracts, deterministic document maps, source anchors, evidence cards, source coverage posture, focused specs, and a direct proof command.

## Fixed Shipped Monitor Families

The shipped monitor families are fixed at:

- `cash_posture`
- `collections_pressure`
- `payables_pressure`
- `policy_covenant_threshold`

Do not add monitor families without a future Finance Plan.

## Fixed Shipped Discovery Families

The shipped discovery families are fixed at:

- `cash_posture`
- `collections_pressure`
- `payables_pressure`
- `spend_posture`
- `obligation_calendar_review`
- `policy_lookup`

Do not add discovery families without a future Finance Plan and deterministic source support.

## Shipped Source-Pack Proof Commands

The shipped direct source-pack proofs are:

```bash
pnpm exec tsx tools/board-lender-document-source-pack-proof.mjs
pnpm exec tsx tools/policy-covenant-document-source-pack-proof.mjs
pnpm exec tsx tools/ledger-reconciliation-source-pack-proof.mjs
pnpm exec tsx tools/bank-card-source-pack-proof.mjs
pnpm exec tsx tools/receivables-payables-source-pack-proof.mjs
pnpm exec tsx tools/contract-obligation-source-pack-proof.mjs
```

They use existing source registry, Finance Twin, CFO Wiki, and proof routes only. They are not product runtime feature expansion.

## Future-Only Tracks

These tracks remain future-only until a later Finance Plan names exact scope and validation:

- F6V provider integration
- F6X actual certification
- deeper PDF/OCR/vector search beyond the narrow FP-0081 text-PDF precision-adapter candidate
- EvidenceIndex or precision-adapter expansion outside the active FP-0081 first V2B contract
- ChatGPT App/MCP
- iOS
- OpenClaw
- deployment/external communications
- multi-tenant SaaS
- autonomous finance actions

Roadmap text alone does not authorize implementation.

## Internal Scaffolding Note

The repo still contains historical/internal scaffolding names:

- package scope `@pocket-cto/*`
- root package name `pocket-cto`
- GitHub modules
- engineering-twin modules
- Pocket CTO archive and historical plan material

Do not rename packages, imports, root `package.json`, database names, service names, or scripts without a dedicated future plan. Do not delete GitHub or engineering-twin modules in F12, V2A, or V2B planning.

## Plan Records

Use plan records for details rather than copying every shipped slice into the README.

Key records:

- [FP-0078 F11 public repo hygiene and V2 transition](../plans/FP-0078-public-repo-hygiene-and-v2-transition.md)
- [FP-0079 F12 manual UI/demo-readiness audit](../plans/FP-0079-manual-ui-demo-readiness-audit.md)
- [FP-0080 V2A EvidenceIndex and document-map foundation](../plans/FP-0080-evidence-index-and-document-map-foundation.md)
- [FP-0081 V2B document precision adapters foundation](../plans/FP-0081-document-precision-adapters-foundation.md)
- [FP-0077 F10 v1 public launch handoff](../plans/FP-0077-v1-public-launch-handoff.md)
- [FP-0076 F9 product UI launch polish](../plans/FP-0076-product-ui-launch-polish-foundation.md)
- [FP-0075 F8 future-scope triage](../plans/FP-0075-v1-future-scope-triage-and-roadmap-hardening.md)
- [FP-0074 F7 launch readiness](../plans/FP-0074-v1-launch-readiness-and-active-doc-hardening.md)
- [FP-0073 F6Z final F6/v1 exit audit and handoff](../plans/FP-0073-final-f6-v1-exit-audit-and-handoff.md)
- [ROADMAP](../plans/ROADMAP.md)

FP-0050 through FP-0073 remain shipped F6 records. Older F4 and F5 records remain shipped history unless a future plan names a concrete gap.
