# Pocket CFO Project State

This file carries the shipped-state ledger that no longer belongs in the root README.

## Current State Summary

Pocket CFO v1/F12 is shipped at the proof, handoff, and manual UI/demo-readiness audit layer, not as a public hosted deployment.

FP-0078 records the F11 public repo hygiene and V2 transition slice. It rewrites the public documentation surface, splits Codex/operator guidance from the human README, records current project state here, and frames V2 boundaries. It adds no product runtime behavior.

FP-0079 records the F12 manual UI/demo-readiness audit. It adds `docs/qa/v1-ui-demo-readiness-audit.md`, records the screenshot-capture limitation, applies only direct read-only UI copy corrections, and adds no product runtime behavior.

FP-0080 is the shipped first V2A EvidenceIndex and document-map foundation record. It adds shared domain contracts, a native deterministic read-only control-plane anchor/trace layer, focused specs, and a direct proof command while preserving raw sources as authoritative for document claims, Finance Twin as authoritative for structured facts, and CFO Wiki as compiled/derived.

FP-0081 is the shipped V2B document precision adapters foundation record. It adds one deterministic policy/covenant TextPdfAdapter over EvidenceIndex, focused specs, a direct proof command, and the local/offline `pdfjs-dist` dependency, with OCR, vector/file search, PageIndex, MCP/ChatGPT App, provider integration, certification, UI, deployment, external communications, source mutation, finance writes, generated prose, and autonomous action still future-only.

FP-0082 is the shipped V2C local/internal read-only evidence-tool contract record. It adds pure domain contracts for the evidence-tool envelope, local read-only search/fetch/inspect functions under the EvidenceIndex boundary, focused specs, and `tools/read-only-evidence-app-proof.mjs`, while keeping public MCP server deployment, ChatGPT App, Apps SDK UI, OAuth, app submission, UI, routes, schema, migrations, package scripts, fixtures, OpenAI API/vector/file-search integration, OCR, PageIndex, provider integration, certification, delivery, report release, source mutation, finance writes, generated prose, LLM orchestration, runtime-Codex finance output, and autonomous action future-only.

FP-0083 is the shipped OSS demo/self-host/security baseline documentation record. It adds `SECURITY.md`, `PRIVACY.md`, `CONTRIBUTING.md`, finance-data and read-only-agent threat models, demo-data policy, local demo operator journey, and local-only self-host baseline docs without adding code, UI, routes, schema, migrations, package scripts, smoke aliases, eval datasets, fixtures, sample data, provider integration, public app behavior, deployment, source mutation, finance writes, generated product prose, LLM orchestration, runtime-Codex finance output, or autonomous action.

FP-0084 is the shipped V2D read-only Evidence Atlas UI foundation record. It adds one local `apps/web` route at `/evidence-atlas`, modular atlas components, a web-only atlas read-model helper, and focused specs for source coverage, evidence timeline, document map, evidence card, answer anatomy, unsupported/missing/stale states, bounded/cited excerpts, and capability-boundary posture. It adds no backend route, web API route, schema, migrations, package scripts, fixtures, sample data, public app, MCP, OpenAI vector/file-search, source mutation, finance write, generated product prose, LLM orchestration, runtime-Codex finance output, or autonomous action.

FP-0085 is the shipped V2E local/internal proof-only bounded LLM orchestration foundation record. It adds pure domain contracts, one proof-only control-plane bounded context, a deterministic QueryPlanner over the fixed read-only V2C tool allowlist, deterministic evidence selection handoff from synthetic in-memory V2C responses, schema-constrained bounded evidence summaries, missing-citation refusal, unsupported-evidence refusal, unsafe-action refusal, local proof audit events, `tools/bounded-llm-orchestration-proof.mjs`, and deterministic EvidenceFaithfulnessGrade, MissingCitationGrade, and UnsafeActionRefusalGrade posture. It adds no OpenAI API calls, model calls, vector/file-search, OCR, PageIndex, public ChatGPT App/MCP, Apps SDK UI, OAuth, app submission, routes, UI, schema, migrations, package scripts, smoke aliases, eval datasets, fixtures, sample data, provider behavior, certification, delivery, deployment, external communications, source mutation, finance writes, generated advice, runtime-Codex finance output, or autonomous action.

FP-0086 is the shipped V2F docs/proof-only benchmark/community manifest foundation record. It ships SafeDemoDataPolicy first, SyntheticFinanceSourcePolicy, BenchmarkPrivacyBoundary, BenchmarkNoRuntimeBoundary, exact read-only BenchmarkTask taxonomy, BenchmarkCase placeholder rules, CommunityPackManifest, ContributorChallenge, ArchitectureMap, BenchmarkProof, focused specs, and `tools/benchmark-community-pack-proof.mjs`. It adds no UI, routes, schema, migrations, package scripts, smoke aliases, eval datasets, fixtures, sample data, source packs, source-pack mutations, OpenAI API/model calls, public ChatGPT App/MCP, Apps SDK UI, OAuth, app submission, provider behavior, certification, delivery, deployment, external communications, finance writes, generated advice, runtime-Codex finance output, or autonomous action.

FP-0087 is the shipped V2G local proof-only read-only ChatGPT App/MCP contract and MCP descriptor/response-envelope foundation record. It adds pure domain contracts, focused specs, typed V2F boundary hardening, `tools/read-only-chatgpt-app-mcp-proof.mjs`, and `tools/read-only-mcp-descriptor-response-envelope-proof.mjs` for read-only app/MCP plans, exact allowlists, local proof-only MCP descriptors, strict descriptor input/output schemas, app/MCP response envelopes, forbidden tools, refusal/privacy/no-runtime/deferred boundaries, proof posture, and threat-model questions without adding public app implementation, MCP server runtime, endpoints, Apps SDK iframe/UI, OAuth, app submission, schema, migrations, package scripts, smoke aliases, eval datasets, fixtures, sample data, public demo data, source-pack behavior, OpenAI API/model calls, hosted tools, vector/file-search integration, OCR, PageIndex, provider behavior, certification, delivery, deployment, external communications, source mutation, finance writes, generated advice, runtime-Codex finance output, or autonomous action.

FP-0088 is the shipped V2H premium read-only ChatGPT App/MCP UI and security readiness master plan. It is docs-and-plan plus proof-gate compatibility only: it defines future premium UI and app/MCP security readiness requirements and lets V2F/V2G proof gates accept exactly that docs-only successor while still rejecting runtime/public-app scope.

FP-0089 is the shipped V2I premium read-only ChatGPT App/MCP UI design-system readiness master plan. It is docs-and-plan plus proof-gate compatibility only: it defines future design tokens, component taxonomy, evidence hierarchy, accessibility requirements, refusal-state grammar, interaction rules, copy style, and future design QA gates while keeping UI implementation, Apps SDK iframe/UI, endpoints, OAuth, remote MCP, app submission, source mutation, finance writes, generated product prose, runtime-Codex finance output, and autonomous action out of scope.

FP-0090 is the active V2J premium read-only ChatGPT App/MCP UI implementation readiness master plan. It is docs-and-plan plus proof-gate compatibility only: it defines the future local/proof-only/read-only UI implementation boundary, primary states, screenshot review, accessibility acceptance, evidence hierarchy acceptance, and no-action-control rules while keeping UI code, Apps SDK iframe/UI, public app implementation, endpoints, OAuth, remote MCP, app submission, source mutation, finance writes, generated product prose, runtime-Codex finance output, and autonomous action out of scope.

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
- **V2B document precision adapters foundation**: shipped through FP-0081 as one deterministic policy/covenant TextPdfAdapter over EvidenceIndex with source-anchor metadata, adapter provenance, direct proof/spec coverage, and fail-closed unsupported posture.
- **V2C read-only evidence-tool contract**: shipped through FP-0082 as one local/internal read-only evidence-tool contract and direct proof over existing EvidenceIndex/TextPdfAdapter outputs, with no public MCP/App deployment or write/action tools.
- **OSS demo/self-host/security baseline**: shipped through FP-0083 as documentation-only security, privacy, contribution, demo-data, local-demo, self-host, finance-data threat-model, and read-only-agent threat-model baseline.
- **V2D Evidence Atlas UI foundation**: shipped through FP-0084 as one read-only local operator UI route and modular atlas component foundation.
- **V2E bounded LLM orchestration foundation**: shipped through FP-0085 as a local/internal proof-only planning/refusal/validation contract over fixed read-only V2C tools.
- **V2F benchmark/community pack foundation**: shipped through FP-0086 as a docs/proof-only SafeDemoDataPolicy-first benchmark/community manifest contract foundation with no datasets or runtime behavior.
- **V2G read-only ChatGPT App/MCP contract and descriptor/envelope foundation**: shipped through FP-0087 as a local proof-only typed contract and direct-proof record with no public app implementation.
- **V2H premium read-only ChatGPT App/MCP UI and security readiness**: shipped through FP-0088 as a docs-and-plan plus proof-gate compatibility record with no UI, endpoints, remote MCP, OAuth, app submission, OpenAI API/model calls, data files, package scripts, source mutation, finance writes, generated product prose, runtime-Codex finance output, or autonomous action.
- **V2I premium read-only ChatGPT App/MCP UI design-system readiness**: shipped through FP-0089 as a docs-and-plan plus proof-gate compatibility record with no UI, endpoints, remote MCP, OAuth, app submission, OpenAI API/model calls, data files, package scripts, source mutation, finance writes, generated product prose, runtime-Codex finance output, or autonomous action.

## Latest Shipped V2 Plan

- **V2I premium read-only ChatGPT App/MCP UI design-system readiness**: shipped through FP-0089.

## Active V2 Plan

- FP-0090 is active as a docs-only premium UI implementation readiness and proof-gate compatibility plan. Actual UI code, public app implementation, remote MCP deployment, Apps SDK UI, OAuth, app submission, provider/certification/delivery/deployment, and V2G expansion beyond the shipped local proof-only contracts and descriptor/envelope foundation still require a later named Finance Plan.

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
- deeper PDF/OCR/vector search beyond the shipped narrow FP-0081 text-PDF precision-adapter candidate
- EvidenceIndex or precision-adapter expansion outside the shipped FP-0081 first V2B contract
- V2E expansion beyond the shipped FP-0085 local/internal proof-only bounded LLM orchestration foundation
- public ChatGPT App/MCP deployment beyond the shipped local/internal FP-0082 contract
- FP-0090 implementation beyond docs-only premium UI implementation readiness and proof-gate compatibility
- FP-0089 implementation beyond shipped docs-only premium UI design-system readiness and proof-gate compatibility
- FP-0088 implementation beyond shipped docs-only premium UI/security readiness and proof-gate compatibility
- V2G expansion beyond the shipped FP-0087 local proof-only contract and descriptor/envelope boundary
- V2D expansion outside the shipped FP-0084 read-only Evidence Atlas UI foundation boundary
- V2F expansion beyond the shipped FP-0086 docs/proof-only benchmark/community manifest foundation
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

Do not rename packages, imports, root `package.json`, database names, service names, or scripts without a dedicated future plan. Do not delete GitHub or engineering-twin modules in F12, V2A, V2B, V2C, or OSS baseline work.

## Plan Records

Use plan records for details rather than copying every shipped slice into the README.

Key records:

- [FP-0078 F11 public repo hygiene and V2 transition](../plans/FP-0078-public-repo-hygiene-and-v2-transition.md)
- [FP-0079 F12 manual UI/demo-readiness audit](../plans/FP-0079-manual-ui-demo-readiness-audit.md)
- [FP-0080 V2A EvidenceIndex and document-map foundation](../plans/FP-0080-evidence-index-and-document-map-foundation.md)
- [FP-0081 V2B document precision adapters foundation](../plans/FP-0081-document-precision-adapters-foundation.md)
- [FP-0082 V2C read-only MCP/ChatGPT Evidence App alpha](../plans/FP-0082-read-only-mcp-chatgpt-evidence-app-alpha.md)
- [FP-0083 OSS demo/self-host/security baseline](../plans/FP-0083-oss-demo-self-host-security-baseline.md)
- [FP-0084 V2D Evidence Atlas UI foundation](../plans/FP-0084-evidence-atlas-ui-foundation.md)
- [FP-0085 V2E bounded LLM orchestration foundation](../plans/FP-0085-bounded-llm-orchestration-foundation.md)
- [FP-0086 V2F benchmark/community pack foundation](../plans/FP-0086-benchmark-community-pack-foundation.md)
- [FP-0087 V2G read-only ChatGPT App/MCP master plan](../plans/FP-0087-read-only-chatgpt-app-mcp-master-plan.md)
- [FP-0088 V2H premium read-only ChatGPT App/MCP UI and security readiness master plan](../plans/FP-0088-read-only-chatgpt-app-mcp-premium-ui-security-master-plan.md)
- [FP-0089 V2I premium read-only ChatGPT App/MCP UI design-system readiness master plan](../plans/FP-0089-read-only-chatgpt-app-mcp-premium-ui-design-system-master-plan.md)
- [FP-0090 V2J premium read-only ChatGPT App/MCP UI implementation readiness master plan](../plans/FP-0090-read-only-chatgpt-app-mcp-premium-ui-implementation-master-plan.md)
- [FP-0077 F10 v1 public launch handoff](../plans/FP-0077-v1-public-launch-handoff.md)
- [FP-0076 F9 product UI launch polish](../plans/FP-0076-product-ui-launch-polish-foundation.md)
- [FP-0075 F8 future-scope triage](../plans/FP-0075-v1-future-scope-triage-and-roadmap-hardening.md)
- [FP-0074 F7 launch readiness](../plans/FP-0074-v1-launch-readiness-and-active-doc-hardening.md)
- [FP-0073 F6Z final F6/v1 exit audit and handoff](../plans/FP-0073-final-f6-v1-exit-audit-and-handoff.md)
- [ROADMAP](../plans/ROADMAP.md)

FP-0050 through FP-0073 remain shipped F6 records. Older F4 and F5 records remain shipped history unless a future plan names a concrete gap.
