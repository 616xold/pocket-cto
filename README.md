# Pocket CFO

Pocket CFO is an evidence-native finance cockpit that turns raw company exports and documents into a persisted Finance Twin, a compiled CFO Wiki, and proof-backed answers a human can review outside chat.

## Problem And Niche

Small-company finance work often lives in fragile spreadsheets, email attachments, bank exports, board materials, policy docs, and half-remembered context. The hard part is not making an assistant sound finance-fluent. The hard part is keeping evidence, freshness, limitations, and review boundaries intact while answering real operating questions.

Pocket CFO is aimed at a single finance operator or founder who needs a local, auditable system for:

- registering raw finance source truth
- deriving deterministic structured finance state
- compiling readable finance knowledge pages
- answering supported finance questions with provenance
- producing durable proof, memo, packet, monitoring, and readiness artifacts without pretending those are external actions

## Hero Demo Story

A founder drops a bundle of bank-account summaries, receivables aging, payables aging, ledger exports, policy documents, board materials, and lender documents into Pocket CFO.

Pocket CFO registers each raw file with checksum and provenance, syncs supported CSVs into the Finance Twin, compiles the CFO Wiki, runs deterministic discovery and monitor paths, and returns a source-backed answer such as cash posture or collections pressure with freshness, limitations, related wiki pages, and proof references. A human can then inspect the evidence bundle before using any conclusion elsewhere.

## Shipped Today

The current v1 repository is shipped at the proof and handoff layer, not as a public hosted deployment.

Shipped capabilities include:

- Source Registry for immutable raw source registration, snapshots, checksums, and provenance.
- Finance Twin reads for account catalogs, general ledger state, trial-balance and reconciliation posture, cash, receivables, payables, spend, contracts, obligations, and source-backed balance proof.
- CFO Wiki compilation for company, period, source coverage, source digest, concept, metric-definition, policy, lint, export, and filed artifact pages.
- Mission Engine support for typed finance discovery, reporting, packets, review/readiness posture, and deterministic monitor handoffs.
- Evidence and proof bundles that expose source lineage, freshness or missing-source posture, limitations, and absence boundaries.
- Operator UI read-only truthfulness polish from F9, without backend runtime expansion.
- Source-pack proof commands for bank/card, receivables/payables, contract/obligation, ledger/reconciliation, policy/covenant documents, and board/lender documents.
- Fixed shipped monitor families: `cash_posture`, `collections_pressure`, `payables_pressure`, and `policy_covenant_threshold`.
- Fixed shipped discovery families: `cash_posture`, `collections_pressure`, `payables_pressure`, `spend_posture`, `obligation_calendar_review`, and `policy_lookup`.

For the phase ledger and exact shipped records, see [docs/PROJECT_STATE.md](docs/PROJECT_STATE.md).

## What Pocket CFO Is Not

Pocket CFO is not:

- a generic finance chatbot
- an autonomous accountant
- a bank, payment, accounting, tax, legal, or assurance agent
- a multi-tenant SaaS product in the current boundary
- a provider-integration or external-delivery system
- a certification, sign-off, close-complete, legal-opinion, or audit-opinion engine
- a system where an LLM answer becomes source truth

## Quick Local Setup

Requirements: Node/pnpm, Docker, and the local Postgres plus S3-compatible object storage services from this repo.

```bash
cp .env.example .env
docker compose up -d
pnpm install
pnpm db:generate
pnpm db:migrate
pnpm dev
```

Use [docs/ops/local-dev.md](docs/ops/local-dev.md) for the current local operating pattern and [docs/ops/self-host-baseline.md](docs/ops/self-host-baseline.md) for the local-only self-host boundary.

## Core Validation

The broad repo gates are:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm ci:repro:current
```

The core finance proof spine also includes the direct source-pack proofs:

```bash
pnpm exec tsx tools/board-lender-document-source-pack-proof.mjs
pnpm exec tsx tools/policy-covenant-document-source-pack-proof.mjs
pnpm exec tsx tools/ledger-reconciliation-source-pack-proof.mjs
pnpm exec tsx tools/bank-card-source-pack-proof.mjs
pnpm exec tsx tools/receivables-payables-source-pack-proof.mjs
pnpm exec tsx tools/contract-obligation-source-pack-proof.mjs
```

See the active Finance Plan and [docs/PROJECT_STATE.md](docs/PROJECT_STATE.md) for the full validation ladder that belongs to a given slice.

## Architecture Overview

Pocket CFO is organized around six product planes:

- **Source Registry**: raw uploads, snapshots, checksums, source roles, provenance, and immutable source artifacts.
- **Finance Twin**: deterministic structured finance facts, lineage, freshness posture, and company-scoped read models.
- **CFO Wiki**: compiler-owned markdown knowledge pages derived from source inventory, deterministic document extracts, and Finance Twin state.
- **Mission Engine**: typed discovery, reporting, monitoring, close/control, and readiness workflows with replay-aware state transitions.
- **Evidence/proof layer**: answer artifacts, proof bundles, evidence sections, limitations, freshness posture, and absence boundaries.
- **Operator UI**: read-only operator surfaces for source, mission, wiki, evidence, and safety-boundary posture.

The Codex runtime seam is bounded: it is an operator/coding seam for session transport, draft assistance where a future plan permits it, and developer workflow. It is not the source of finance truth and does not authorize autonomous finance actions.

## Current Boundaries

The current product boundary is intentionally narrow:

- one company
- one operator and one trust boundary
- file-first/manual export default
- raw sources are authoritative for document claims
- the Finance Twin is authoritative for structured finance facts
- the CFO Wiki is compiled and derived
- no autonomous bank, accounting, tax, legal, provider, delivery, certification, payment, or customer-contact actions
- no package-scope rename yet; internal packages remain `@pocket-cto/*` and the root package name remains `pocket-cto`

## V2 Roadmap Summary

F11 closed public repo hygiene and V2 transition framing. F12 closed the manual UI/demo-readiness audit in [docs/qa/v1-ui-demo-readiness-audit.md](docs/qa/v1-ui-demo-readiness-audit.md) without starting V2 implementation.

[FP-0080](plans/FP-0080-evidence-index-and-document-map-foundation.md) is the shipped first V2A EvidenceIndex and document-map foundation record. It adds a native deterministic read-only anchor/trace layer for supported markdown/plain-text source text, evidence cards, source coverage posture, and a direct proof command without adding UI, routes, schema, migrations, package scripts, fixture files, OCR, vector search, PageIndex, MCP, ChatGPT App, provider behavior, certification, delivery, source mutation, finance writes, generated product prose, or autonomous action.

Current V2 sequence after the shipped FP-0083 baseline:

- V2B document precision adapters foundation through [FP-0081](plans/FP-0081-document-precision-adapters-foundation.md), shipped as one narrow deterministic TextPdfAdapter candidate over EvidenceIndex for policy/covenant text-PDF sources under strict fail-closed quality gates
- V2C read-only agent/MCP/ChatGPT Evidence App alpha through [FP-0082](plans/FP-0082-read-only-mcp-chatgpt-evidence-app-alpha.md), shipped as a local/internal read-only evidence-tool contract and direct proof over existing EvidenceIndex/TextPdfAdapter outputs, with no public MCP server, ChatGPT App, Apps SDK UI, routes, schema, migrations, package scripts, fixtures, OpenAI API/file-search/vector integration, OCR, PageIndex, provider behavior, certification, delivery, report release, source mutation, finance writes, generated product prose, runtime-Codex finance output, or autonomous action
- OSS demo/self-host/security baseline through [FP-0083](plans/FP-0083-oss-demo-self-host-security-baseline.md), shipped as docs-only `SECURITY.md`, `PRIVACY.md`, `CONTRIBUTING.md`, demo-data policy, local demo journey, self-host guidance, and finance-data/read-only-agent threat models before public app or deployment work
- V2D Evidence Atlas UI, future-plan-only
- V2E bounded LLM orchestration, future-plan-only
- V2F benchmark/community pack, future-plan-only
- V2G optional distribution tracks, future-plan-only

Any V2B expansion beyond FP-0081, V2C expansion beyond the shipped local/internal contract, V2D UI, V2E LLM orchestration, V2F community packs, public ChatGPT App/MCP deployment, and later tracks remain future-plan-only. See [docs/V2_BOUNDARY.md](docs/V2_BOUNDARY.md).

## Screenshots And Demo Audit

The F12 manual UI/demo-readiness audit is recorded in [docs/qa/v1-ui-demo-readiness-audit.md](docs/qa/v1-ui-demo-readiness-audit.md). Screenshot artifacts were not invented; the audit records the local browser screenshot-capture limitation and the remaining public demo polish needs.

## For Codex Operators

Codex/operator workflow guidance lives in [CODEX_README.md](CODEX_README.md). The active guidance order is tracked in [docs/ACTIVE_DOCS.md](docs/ACTIVE_DOCS.md).

## Contribution, Security, And Privacy

Contribution, security, and privacy policies are formalized in [CONTRIBUTING.md](CONTRIBUTING.md), [SECURITY.md](SECURITY.md), and [PRIVACY.md](PRIVACY.md). Demo and self-host guidance lives in [docs/demo/local-demo-operator-journey.md](docs/demo/local-demo-operator-journey.md), [docs/demo/demo-data-policy.md](docs/demo/demo-data-policy.md), and [docs/ops/self-host-baseline.md](docs/ops/self-host-baseline.md).

Finance-data privacy warning: do not commit real company exports, bank data, payroll data, customer/vendor lists, tax records, legal materials, credentials, or private board/lender materials. Use synthetic, fixture, or explicitly approved data only.

## License

Apache-2.0. See [LICENSE](LICENSE).
