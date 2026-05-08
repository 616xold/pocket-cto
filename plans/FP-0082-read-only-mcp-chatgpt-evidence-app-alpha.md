# FP-0082 - Read-only MCP / ChatGPT Evidence App Alpha

## Purpose / Big Picture

Status: shipped V2C local/internal read-only evidence-tool contract implementation record, created 2026-05-07T22:28:15Z and implemented 2026-05-08T12:27:41Z.

Exact slice: `V2C-read-only-mcp-chatgpt-evidence-app-alpha`.

This Finance Plan began as the docs-and-plan record for the next safe V2C scope after the shipped V2A EvidenceIndex/document-map foundation and shipped V2B document precision adapter foundation. It now closes as the shipped local/internal read-only evidence-tool contract implementation record. The shipped implementation adds pure domain contracts, a plain control-plane read-only bounded context over existing EvidenceIndex/TextPdfAdapter artifacts, focused specs, and `tools/read-only-evidence-app-proof.mjs`.

The implementation remains local/internal proof only. It does not add UI, app routes, web API routes, control-plane routes, schema, migrations, package scripts, smoke aliases, eval datasets, fixtures, MCP server code, ChatGPT App code, Apps SDK code, OpenAI API integration, OpenAI vector/file-search integration, OCR, vector search, PageIndex integration, provider integration, certification, deployment, external communications, source mutation, finance writes, generated advice, runtime-Codex finance output, or autonomous action.

V2C is justified by a narrow gap left after V2A/V2B: Pocket CFO now has a deterministic read-only EvidenceIndex layer, SourceAnchors, DocumentMaps, EvidenceCards, SourceCoverageMatrix, CapabilityBoundaries, and one TextPdfAdapter candidate, but agents and humans do not yet share a stable read-only evidence contract for searching and fetching those artifacts. The next implementation should create that contract before any UI, LLM orchestration, public app submission, or remote deployment work.

The V2C authority model is unchanged:

- raw sources remain authoritative for document claims
- the Finance Twin remains authoritative for structured finance facts
- the CFO Wiki remains compiled and derived
- EvidenceIndex remains the read-only anchor, trace, card, coverage, and limitation layer
- model output, ChatGPT App output, MCP output, and runtime-Codex output must not become source truth

Decision: repo truth supports the shipped local/internal implementation. FP-0081/V2B is shipped and merged into `origin/main`; active docs support FP-0081 as shipped; V2A and V2B proof tools exist and pass; EvidenceIndex and TextPdfAdapter implementations exist; README/CODEX_README/PROJECT_STATE/V2_BOUNDARY exist and are linked; no FP-0083 exists; and V2C can ship as read-only, local/internal-first, proof-command-first contract work without starting public MCP/App behavior.

Official OpenAI docs were reviewed only in the original docs-and-plan pass as future platform/security context. They do not override repo source truth. No external web/search research was used in the 2026-05-08 implementation thread.

## Progress

- [x] Invoked the requested `pocket-cfo-codex-operator` skills before work: Finance Plan Orchestrator, Modular Architecture Guard, Source Provenance Guard, CFO Wiki Maintainer, Evidence Bundle Auditor, F6 Monitoring Semantics Guard, Validation Ladder Composer, and Pocket CFO Handoff Auditor.
- [x] Confirmed GitHub Connector Guard is not in scope because this slice does not touch GitHub connector product behavior.
- [x] Ran preflight against fetched `origin/main`.
- [x] Confirmed the original docs-and-plan branch was `codex/v2c-read-only-mcp-chatgpt-evidence-app-master-plan-local-v1`.
- [x] Confirmed initial working tree was clean.
- [x] Confirmed local Postgres and object storage services were available through `docker compose ps`.
- [x] Confirmed FP-0081 exists and FP-0082/FP-0083 did not exist before this slice.
- [x] Confirmed `tools/evidence-index-foundation-proof.mjs` and `tools/document-precision-foundation-proof.mjs` exist.
- [x] Ran the V2B proof before writing: `pnpm exec tsx tools/document-precision-foundation-proof.mjs`.
- [x] Ran the V2A proof before writing: `pnpm exec tsx tools/evidence-index-foundation-proof.mjs`.
- [x] Read the required active docs, shipped V2A/V2B plans, package manifests, EvidenceIndex/TextPdfAdapter sources, neighboring source/wiki/finance-twin/evidence/reporting/approval/outbox modules, and source-pack proof tools.
- [x] Searched for FP-0082, FP-0083, V2C, MCP, ChatGPT App, Apps SDK, Evidence App, planned tool names, source coverage, capability boundaries, write/action/liability terms, future adapter terms, runtime-Codex/generated prose terms, and internal scaffolding terms.
- [x] Reviewed official OpenAI MCP, Apps SDK, ChatGPT developer mode/custom MCP, Codex network, and retrieval/vector/file-search docs as future platform/security context only.
- [x] Created this active V2C planning record.
- [x] Updated only active-facing docs that became stale once FP-0082 existed.
- [x] Ran the full validation ladder named in this plan. All commands passed; log root: `/tmp/pocket-cfo-v2c-validation-20260507T223125Z`.
- [x] Ran final commit-candidate hygiene after the validation closeout edit. `git diff --check`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm ci:repro:current` passed; log root: `/tmp/pocket-cfo-v2c-final-validation-20260507T223652Z`.
- [x] Committed, pushed, and opened PR #228 for the docs-and-plan-only V2C slice.
- [x] 2026-05-08T12:27:41Z - Implementation-thread preflight passed against fetched `origin/main`; current branch is `codex/v2c-read-only-evidence-tool-contract-local-v1`, worktree started clean, GitHub auth/repo access worked, Docker Postgres/MinIO were available, FP-0082 existed on `origin/main`, FP-0083 was absent, and the V2A/V2B proof commands existed.
- [x] 2026-05-08T12:27:41Z - Re-invoked the requested Pocket CFO operator skills for implementation. GitHub Connector Guard was not invoked because GitHub connector product behavior is out of scope.
- [x] 2026-05-08T12:27:41Z - Re-ran `pnpm exec tsx tools/document-precision-foundation-proof.mjs` and `pnpm exec tsx tools/evidence-index-foundation-proof.mjs` before adding V2C implementation code; both passed.
- [x] 2026-05-08T12:27:41Z - Implemented V2C domain contracts for `EvidenceSearchResult`, `EvidenceFetchResult`, `EvidenceToolResponse`, source/document/coverage/posture/boundary fetches, `ToolSafetyBoundary`, `ReadOnlyToolManifest`, `AgentQueryAuditEvent`, prompt-injection/excerpt/citation/redaction policies, app modes, permissions, and forbidden actions.
- [x] 2026-05-08T12:27:41Z - Implemented a local/internal read-only control-plane evidence-tool service under `apps/control-plane/src/modules/evidence-index/tools/**` over existing EvidenceIndex and TextPdfAdapter artifacts, with no route registration, no DB schema, no migration, no UI, no package script, no fixture, no MCP server, and no Apps SDK/ChatGPT App implementation.
- [x] 2026-05-08T12:27:41Z - Added `tools/read-only-evidence-app-proof.mjs` as the direct machine-readable V2C proof command. It proves manifest/read-only/no-write-tool posture, every candidate tool, response envelope posture, citation/excerpt/redaction/audit behavior, prompt-injection-as-data handling, TextPdfAdapter provenance preservation, read-only Finance Twin/CFO Wiki/proof refs, fail-closed missing/stale evidence, and absence boundaries.
- [x] 2026-05-08T12:27:41Z - Added focused domain and control-plane specs for the read-only evidence-tool contract and local service behavior.
- [x] 2026-05-08T12:27:41Z - Ran the full 41-command V2C validation ladder before closeout docs; all commands passed, including `pnpm ci:repro:current`; log root: `/tmp/pocket-cfo-v2c-validation-20260508T122741Z`.
- [x] 2026-05-08T13:38:41Z - Ran final minimum validation after closeout docs: `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm ci:repro:current` all passed.
- [x] 2026-05-08T12:54:27Z - QA correction hardened V2C `fetch_document_map` excerpts and `fetch_capability_boundaries` unknown-action handling. Focused V2C/V2A/V2B proofs, focused specs, and the 35-command QA ladder passed; log root: `/tmp/pocket-cfo-v2c-qa-20260508T125048Z`.
- [x] 2026-05-08T12:54:55Z - Final QA correction validation passed on the patched tree: `tools/read-only-evidence-app-proof.mjs`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm ci:repro:current`; log root: `/tmp/pocket-cfo-v2c-qa-final-20260508T125455Z`.

## Surprises & Discoveries

- `FP-0082` appeared only as future/absent language in prior shipped V2B records and docs. There was no existing FP-0082 file.
- No FP-0083 was present. This plan must not create one.
- `Apps SDK`, `search_evidence`, `fetch_evidence_card`, `fetch_source_anchor`, and `fetch_document_map` were not existing repo concepts in the original docs-and-plan pass. Only the read-only tool names shipped in the local/internal V2C implementation; Apps SDK remains future-only.
- Many `Evidence App` hits were unrelated `evidence appendix` wording or archived Pocket CTO material. They are not active product behavior.
- Provider, certification, delivery, report release, payment, legal advice, audit opinion, source mutation, finance write, autonomous, runtime-Codex, and generated-prose hits were active safety boundaries, shipped proof assertions, historical references, or existing approval/reporting seams. They were not behavior leaks requiring a V2B corrective slice.
- `pocket-cto` and `@pocket-cto/*` hits remain valid internal scaffolding. This plan preserves them.
- GitHub-first and engineering-first language is archived or actively demoted by current Pocket CFO docs. This plan does not touch GitHub product connector behavior.
- Official OpenAI developer-mode guidance reinforces that read-only MCP tools should carry explicit read-only annotations where platform surfaces support them, and that developer mode is powerful enough to expose write tools. V2C must avoid registering write tools at all.
- Official OpenAI MCP safety guidance reinforces prompt-injection, exfiltration, URL/domain, approval, and logging concerns. V2C must treat source excerpts and tool outputs as untrusted data, keep tools local/internal first, and define audit and excerpt policies before implementation.
- The implementation-thread keyword sweep classified current hits as shipped V2A/V2B concept language, planned V2C read-only tool language, valid internal scaffolding that must not be renamed, archived history that must stay reference-only, future-only planning language, or existing safety-boundary seams. No behavior leak required stopping before V2C implementation.
- No external web/search was used in the implementation thread. Repo source truth came from current code, current active docs, shipped Finance Plans, and FP-0082.
- The root-form command `pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/evidence-index/**/*.spec.ts` hit zsh `no matches found` before repo commands executed. The equivalent plan pattern run from `apps/control-plane` passed, so this was a shell wrapper issue, not a product failure.
- TextPdfAdapter provenance needed to remain visible through `DocumentMapFetch`. The V2C fetch contract therefore accepts the precision document-map shape as well as the base document-map shape.
- V2C QA found two narrow contract-hardening gaps: `DocumentMapFetch` could return unsanitized source-section excerpts from the existing DocumentMap artifact, and unknown requested actions in capability-boundary inspection did not fail closed. Both were corrected inside the V2C evidence-tool slice.

## Decision Log

- 2026-05-07T22:28:15Z - Safe-to-plan verdict: create FP-0082 because shipped V2B/FP-0081 and shipped V2A/FP-0080 provide enough read-only EvidenceIndex substrate for a contract-only V2C plan.
- 2026-05-07T22:28:15Z - V2C is not write-tool MCP. It may plan only read-only search/fetch/inspect tools.
- 2026-05-07T22:28:15Z - V2C is not public ChatGPT App implementation. The ChatGPT Evidence App alpha remains a future public app candidate beyond the shipped local/internal contract.
- 2026-05-07T22:28:15Z - V2C is not LLM orchestration. Bounded LLM navigation/summarization remains V2E or later.
- 2026-05-07T22:28:15Z - The same evidence contract must serve humans and agents. There must not be an agent-only truth layer.
- 2026-05-07T22:28:15Z - First implementation should start as a read-only evidence-tool contract and local/internal proof over existing EvidenceIndex outputs. A local MCP wrapper remains future-only and needs a later named plan.
- 2026-05-07T22:28:15Z - Public ChatGPT App submission, remote deployment, OAuth, and external app publishing should wait for an OSS/self-host/security/privacy/contribution/threat-model baseline.
- 2026-05-07T22:28:15Z - Internal/local V2C implementation can start before the OSS baseline only if it remains local proof or internal developer mode, uses synthetic/approved local data, exposes no write tools, and does not become public app submission or deployment.
- 2026-05-07T22:28:15Z - No DB schema or migration should be planned for the first V2C implementation. Query audit can start as structured local logs or proof output unless a later plan proves additive persistence is necessary.
- 2026-05-07T22:28:15Z - Tool naming will use Pocket CFO explicit candidate names in this plan. If official ChatGPT/App platform requirements later require conventional `search`/`fetch` entry points for a data-app surface, the implementation plan may add aliases while preserving the internal evidence contract.
- 2026-05-07T22:36:29Z - Full validation ladder passed on the docs-and-plan diff before commit. Validation log root: `/tmp/pocket-cfo-v2c-validation-20260507T223125Z`.
- 2026-05-07T22:36:52Z - Final commit-candidate hygiene passed after validation closeout text was added. Final validation log root: `/tmp/pocket-cfo-v2c-final-validation-20260507T223652Z`.
- 2026-05-07T22:49:54Z - QA correction updated this plan's closeout state to reflect that the V2C docs-and-plan-only slice was committed, pushed, and opened as PR #228. This correction remains docs-only and does not change V2C scope.
- 2026-05-08T12:27:41Z - V2C implementation ships as a local/internal read-only evidence-tool contract, not as a public MCP server, ChatGPT App, Apps SDK UI, remote endpoint, OAuth surface, app submission, or deployment.
- 2026-05-08T12:27:41Z - The implementation surface is domain contracts plus `apps/control-plane/src/modules/evidence-index/tools/**` plus a direct proof command. No routes, schema, migrations, package scripts, smoke aliases, eval datasets, fixtures, UI, app routes, or web API routes are added.
- 2026-05-08T12:27:41Z - Query audit is proof-output/local structured response data only. No DB audit persistence, mission state transition, replay event, source mutation, Finance Twin write, CFO Wiki compile/write, report release, provider call, delivery, certification, payment, generated product prose, LLM orchestration, runtime-Codex finance output, or autonomous action is added.
- 2026-05-08T12:27:41Z - The read-only tool manifest registers only `search_evidence`, `fetch_evidence_card`, `fetch_source_anchor`, `fetch_document_map`, `fetch_source_coverage`, `fetch_company_posture`, and `fetch_capability_boundaries`. Generic platform aliases such as `search`/`fetch` remain future-only until a public platform plan proves the need.
- 2026-05-08T12:27:41Z - Source excerpts are bounded, cited, redacted, and treated as untrusted data. Prompt-injection text inside synthetic source excerpts is returned only as data and never followed.
- 2026-05-08T12:27:41Z - Full pre-closeout validation passed on the implementation tree. Validation log root: `/tmp/pocket-cfo-v2c-validation-20260508T122741Z`.
- 2026-05-08T12:54:27Z - V2C QA correction keeps `DocumentMapFetch` source-section excerpts within the V2C redaction/excerpt policy and treats any unknown requested action as blocked unless it is a registered read-only evidence tool. No routes, schema, migrations, UI, scripts, fixtures, provider calls, finance writes, LLM, runtime-Codex, or autonomous behavior were added.

## Context and Orientation

Shipped V2A through FP-0080 created the EvidenceIndex/document-map foundation. The current substrate includes:

- `SourceAnchor`
- `DocumentMap`
- `EvidenceClaim`
- `EvidenceTrace`
- `EvidenceCard`
- `SourceCoverageMatrix`
- `CapabilityBoundary`
- `FreshnessPosture`
- `LimitationPosture`
- `PermittedNextAction`

Shipped V2B through FP-0081 added one deterministic `TextPdfAdapter` candidate over EvidenceIndex for narrow policy/covenant text-PDF sources. V2B also added `tools/document-precision-foundation-proof.mjs` and kept `pdfjs-dist` scoped to the control-plane TextPdfAdapter/proof/spec path. V2B did not add UI, routes, schema, migrations, package scripts, smoke aliases, eval datasets, source-pack fixtures, provider integration, certification, delivery, deployment, external communications, ChatGPT App, MCP, Apps SDK implementation, OpenAI vector/file-search integration, OCR, vector search, PageIndex, iOS, OpenClaw, source mutation, finance writes, generated product prose, runtime-Codex finance output, or autonomous action.

V2C shipped from the existing EvidenceIndex and TextPdfAdapter outputs. It does not reinterpret raw documents directly, call providers, certify anything, release reports, mutate source truth, or generate finance advice.

The active product boundary remains one company, one trust boundary, file-first/manual export default, raw-source authority for document claims, Finance Twin authority for structured facts, CFO Wiki as compiled/derived knowledge, and evidence/freshness/limitations/permitted-next-action fields on mission-facing outputs.

## Plan of Work

This implementation closeout is complete when:

- the active Finance Plan remains `plans/FP-0082-read-only-mcp-chatgpt-evidence-app-alpha.md`
- no FP-0083 exists
- active-facing docs no longer describe V2C as docs-only or wholly future-only
- V2C scope is narrowed to a read-only agent-and-human evidence contract
- the candidate read-only tools and response shapes are implemented locally and proven directly
- forbidden tool actions are explicit
- prompt-injection, exfiltration, excerpt, citation, redaction, permission, and audit policies are represented in the contract and proof
- OSS/self-host baseline gating is answered
- official OpenAI docs used for platform/security context are recorded
- full validation ladder passes

The shipped implementation stayed narrow. It builds the smallest local/internal proof that a human or future agent can search and fetch existing EvidenceIndex artifacts with provenance, freshness, limitations, and permitted-next-action fields intact.

## Concrete Steps

1. Preserve the original docs-and-plan scope as historical context.
2. Update this FP-0082 record and directly stale active docs after implementation.
3. Preserve shipped FP-0081 and FP-0080 records.
4. Preserve internal `@pocket-cto/*` package scope and root `pocket-cto` package name.
5. Preserve GitHub and engineering-twin modules as internal/historical scaffolding.
6. Create only the local/internal read-only evidence-tool contract, local service, direct proof, and focused specs named by this plan.
7. Ship the V2C read-only tool surface:
   - `search_evidence`
   - `fetch_evidence_card`
   - `fetch_source_anchor`
   - `fetch_document_map`
   - `fetch_source_coverage`
   - `fetch_company_posture`
   - `fetch_capability_boundaries`
8. Treat possible future platform aliases as implementation-time compatibility details:
   - `search` may map to `search_evidence` if a ChatGPT/App surface requires or benefits from a generic search entry point.
   - `fetch` may map to `fetch_evidence_card` or a typed fetch dispatcher if a ChatGPT/App surface requires or benefits from a generic fetch entry point.
9. Require every local V2C tool function to return the shared `EvidenceToolResponse` contract.
10. Require every tool descriptor to be read-only in behavior.
11. Require no write tools to be registered, not merely hidden.
12. Require the direct proof to show:
    - no registered write tools
    - all candidate tools are read-only
    - responses carry citations, freshness, limitations, capability boundaries, permitted-next-actions, and forbidden actions
    - source excerpts are bounded and cited
    - stale/missing/unsupported evidence fails closed
    - prompt-injection strings inside source excerpts are treated as data
    - no provider, delivery, certification, payment, finance-write, source-mutation, generated-advice, runtime-Codex finance-output, OCR/vector/PageIndex/OpenAI-file-search, or autonomous behavior appears

## Validation and Acceptance

Implementation validation requires:

- the V2A and V2B proofs pass before writing and after edits
- the V2C proof command passes
- focused domain/control-plane specs for the evidence-tool contract pass
- DB-backed source-pack smokes pass serially
- CFO Wiki, Finance Twin, monitoring, close-control, delivery-readiness, operator-readiness, supported-family, web, domain, control-plane, lint, typecheck, test, and reproducibility gates pass
- final diff contains no implementation files outside the allowed V2C contract/proof/spec/docs scope
- `FP-0082` exists and `FP-0083` does not

Required commands:

```bash
pnpm exec tsx tools/document-precision-foundation-proof.mjs
pnpm exec tsx tools/evidence-index-foundation-proof.mjs
pnpm exec tsx tools/read-only-evidence-app-proof.mjs
pnpm --filter @pocket-cto/domain exec vitest run src/evidence-index.spec.ts src/evidence-tool.spec.ts
zsh -lc "cd apps/control-plane && pnpm exec vitest run src/modules/evidence-index/**/*.spec.ts"
pnpm exec tsx tools/board-lender-document-source-pack-proof.mjs
pnpm exec tsx tools/policy-covenant-document-source-pack-proof.mjs
pnpm exec tsx tools/ledger-reconciliation-source-pack-proof.mjs
pnpm exec tsx tools/bank-card-source-pack-proof.mjs
pnpm exec tsx tools/receivables-payables-source-pack-proof.mjs
pnpm exec tsx tools/contract-obligation-source-pack-proof.mjs
pnpm smoke:cfo-wiki-foundation:local
pnpm smoke:cfo-wiki-document-pages:local
pnpm smoke:cfo-wiki-lint-export:local
pnpm smoke:cfo-wiki-concept-metric-policy:local
pnpm smoke:finance-twin-account-catalog:local
pnpm smoke:finance-twin-general-ledger:local
pnpm smoke:finance-twin:local
pnpm smoke:finance-twin-reconciliation:local
pnpm smoke:finance-twin-account-bridge:local
pnpm smoke:finance-twin-balance-bridge-prerequisites:local
pnpm smoke:finance-twin-balance-proof-lineage:local
pnpm smoke:finance-twin-period-context:local
pnpm smoke:finance-twin-source-backed-balance-proof:local
pnpm smoke:finance-policy-lookup:local
pnpm smoke:policy-covenant-threshold-monitor:local
pnpm smoke:close-control-checklist:local
pnpm smoke:delivery-readiness:local
pnpm smoke:operator-readiness:local
pnpm smoke:close-control-acknowledgement:local
pnpm smoke:monitor-demo-replay:local
pnpm smoke:finance-discovery-supported-families:local
pnpm --filter @pocket-cto/web exec vitest run
pnpm --filter @pocket-cto/web typecheck
pnpm --filter @pocket-cto/domain exec vitest run src/cfo-wiki.spec.ts src/source-registry.spec.ts src/finance-twin.spec.ts src/monitoring.spec.ts src/close-control.spec.ts src/close-control-certification-safety.spec.ts src/external-delivery-human-confirmation-boundary.spec.ts src/close-control-certification-boundary.spec.ts src/external-provider-boundary.spec.ts src/close-control-review-summary.spec.ts src/delivery-readiness.spec.ts src/proof-bundle.spec.ts src/evidence-index.spec.ts src/evidence-tool.spec.ts
zsh -lc "cd apps/control-plane && pnpm exec vitest run src/modules/evidence-index/**/*.spec.ts src/modules/wiki/**/*.spec.ts src/modules/sources/**/*.spec.ts src/modules/finance-twin/**/*.spec.ts src/modules/finance-discovery/**/*.spec.ts src/modules/monitoring/**/*.spec.ts src/modules/close-control/**/*.spec.ts src/modules/close-control-certification-safety/**/*.spec.ts src/modules/external-delivery-human-confirmation-boundary/**/*.spec.ts src/modules/close-control-certification-boundary/**/*.spec.ts src/modules/external-provider-boundary/**/*.spec.ts src/modules/close-control-review-summary/**/*.spec.ts src/modules/delivery-readiness/**/*.spec.ts src/modules/missions/**/*.spec.ts src/modules/approvals/**/*.spec.ts src/modules/evidence/**/*.spec.ts src/modules/reporting/**/*.spec.ts src/app.spec.ts"
pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/twin/workflow-sync.spec.ts src/modules/twin/test-suite-sync.spec.ts src/modules/twin/codeowners-discovery.spec.ts
pnpm lint
pnpm typecheck
pnpm test
pnpm ci:repro:current
```

Acceptance for the shipped V2C implementation:

- the first implementation exposes only read-only evidence search/fetch/inspect behavior
- all tool responses cite SourceAnchors or explain why no source-backed result exists
- unsupported, missing, stale, partial, inferred, or conflicting evidence is explicit
- CapabilityBoundaries prevent writes/actions by design
- no finance advice is generated from tool output alone
- no raw source is mutated
- no Finance Twin write occurs
- no provider, delivery, certification, payment, report-release, legal, audit, customer-contact, accounting, bank, tax, source-mutation, generated-prose, or autonomous action is exposed

## Idempotence and Recovery

This implementation slice is idempotent:

- rerunning the preflight should keep the branch on `codex/v2c-read-only-evidence-tool-contract-local-v1`
- rerunning V2A/V2B proofs should not mutate raw source fixtures
- rerunning DB-backed smokes should use existing local reset/proof patterns and not create new source-pack behavior
- rerunning this plan should not create FP-0083
- if validation fails, do not widen scope; record the exact failure and choose the smallest corrective slice
- if FP-0082 is already present in a future thread, update that plan rather than creating a duplicate

Recovery paths:

- If the shipped V2A/V2B proofs fail, hold V2C and create a narrow V2A/V2B correction plan.
- If active docs contradict shipped FP-0081, hold V2C and create a docs-only correction plan.
- If official platform requirements force write-capable behavior, hold V2C and do not implement MCP/App behavior.
- If OSS/security/privacy/self-hosting gaps become blockers for public exposure, create a separate OSS demo/self-host baseline plan before any public ChatGPT App alpha, deployment, or app submission.

## Artifacts and Notes

Shipped artifacts in the implementation thread:

- `plans/FP-0082-read-only-mcp-chatgpt-evidence-app-alpha.md`
- `packages/domain/src/evidence-tool*.ts`
- `packages/domain/src/index.ts`
- `apps/control-plane/src/modules/evidence-index/tools/**`
- `apps/control-plane/src/modules/evidence-index/index.ts`
- `tools/read-only-evidence-app-proof.mjs`
- focused specs for the read-only evidence contract and no-write boundaries
- active-facing docs updated only where directly stale because V2C is now shipped as local/internal read-only evidence-tool contract and direct proof

Future-only artifacts not implemented here:

- `apps/control-plane/src/modules/evidence-app/**`
- `apps/control-plane/src/modules/mcp/**`
- `packages/domain/src/evidence-app*.ts`
- `tools/mcp-evidence-tools-proof.mjs`
- `docs/security/read-only-agent-threat-model.md`
- `docs/qa/read-only-evidence-app-contract.md`

Forbidden artifacts still absent:

- product runtime code outside the allowed V2C contract/proof/spec scope, UI, routes, schema, migrations, package scripts, smoke aliases, eval datasets, fixtures, monitor families, discovery families, MCP server code, ChatGPT App code, Apps SDK code, OpenAI API code, OpenAI vector/file-search code, OCR/vector/PageIndex code, iOS, OpenClaw, deployment, external communications, provider jobs, provider credentials, delivery, notification, approval, report-release, report-circulation behavior, certification, close-complete behavior, accounting writes, bank writes, tax filings, legal advice, payment behavior, source mutation, finance writes, generated product prose, runtime-Codex finance output, and autonomous action

Official OpenAI docs used as future platform/security context only:

- OpenAI MCP and connectors docs: `https://platform.openai.com/docs/mcp/` and `https://platform.openai.com/docs/guides/tools-remote-mcp`
  - Used to understand MCP tool listing/calling, allowed-tool filtering, approval posture, remote-server trust, prompt-injection, URL/domain, logging, exfiltration, and data-residency concerns.
- OpenAI Apps SDK docs: `https://developers.openai.com/apps-sdk/`
  - Used to classify ChatGPT Evidence App alpha as a future Apps SDK/MCP app surface, not as implementation work in this thread.
- OpenAI ChatGPT developer mode/custom MCP app docs: `https://platform.openai.com/docs/guides/developer-mode`
  - Used to confirm local/internal developer-mode testing is separate from public app publication, developer mode can expose both read and write tools, and read-only annotations matter where supported.
- OpenAI Codex internet/network docs: `https://developers.openai.com/codex/cloud/internet-access`
  - Used to record that platform network access is a developer execution concern only and must not become source truth for finance evidence.
- OpenAI retrieval/vector/file-search docs: `https://platform.openai.com/docs/guides/retrieval`
  - Used only as future-boundary context. OpenAI vector stores/file-search remain out of V2C implementation scope.

No web or browser research was used to override repo source truth.

No external web/search research was used in the 2026-05-08 implementation thread. The official OpenAI sources listed above remain historical future-boundary context from the original docs-and-plan pass.

## Interfaces and Dependencies

### Shipped Local Conceptual Model

`EvidenceSearchResult`:

- A lightweight search hit over existing EvidenceIndex artifacts.
- Includes a stable result id, result kind, title, matched fields, cited SourceAnchor ids, optional EvidenceCard id, freshness posture, limitation posture, capability-boundary summary, score or deterministic rank, and permitted next actions.
- Must not include uncited finance conclusions or unbounded source text.

`EvidenceFetchResult`:

- A typed fetch wrapper for one exact evidence artifact.
- Includes the fetched artifact, citations, freshness, limitations, capability boundaries, permitted next actions, forbidden actions, excerpt policy result, and unsupported/missing reason when relevant.

`EvidenceToolResponse<T>`:

- The required response envelope for every shipped local V2C tool function.
- Shipped fields: `schemaVersion`, `toolName`, `appMode`, `companyKey`, `ok`, `result`, `evidence`, `freshness`, `limitations`, `capabilityBoundaries`, `permittedNextActions`, `forbiddenActions`, `citations`, `redactions`, `audit`, and `unsupportedReason`.
- Must be readable by humans and agents without creating a separate agent-only truth layer.

`SourceAnchorFetch`:

- Fetches one existing `SourceAnchor` by id.
- Returns source id, snapshot id, file id, checksum, storage key, media type, document role, extraction method, adapter provenance where relevant, locator, freshness, lifecycle, limitations, and safe excerpts only when allowed.

`DocumentMapFetch`:

- Fetches an existing `DocumentMap` by id or source id.
- Returns sections, page/line/range locators, mapped anchors, extraction method, adapter provenance where relevant, freshness, and limitations.

`SourceCoverageFetch`:

- Fetches SourceCoverageMatrix entries for a company, source, mission family, or evidence query.
- Returns coverage status, missing/stale/unsupported/not-indexed reasons, capability boundaries, and permitted next actions.

`CompanyPostureFetch`:

- Fetches read-only company evidence posture assembled from existing EvidenceIndex, Finance Twin summaries, CFO Wiki references, mission answers, and proof bundles.
- It may summarize posture only as structured fields and limitation/freshness states, not as generated CFO advice.

`CapabilityBoundaryFetch`:

- Fetches forbidden actions and boundary reasons for a company, source, artifact, or candidate tool.
- Must expose no hidden write affordance.

`ToolSafetyBoundary`:

- A shipped safety object that names read-only status, allowed source families, forbidden action families, excerpt limits, citation requirements, redaction posture, prompt-injection handling, approval posture, and logging/audit expectations.

`ReadOnlyToolManifest`:

- A shipped manifest for the first implementation that lists only read-only tools, their descriptions, read-only posture, allowed artifacts, forbidden actions, and direct proof expectations.

`AgentQueryAuditEvent`:

- A shipped audit record for local/internal tool calls.
- Fields should include timestamp, app mode, tool name, normalized query, company key, artifact ids touched, SourceAnchor ids returned, excerpt byte/character counts, redaction summary, unsupported/missing/stale posture, and whether any forbidden request was blocked.
- First implementation uses structured local proof-output response data, not a DB migration. Additive persistence remains future-only unless a later plan proves it necessary.

`PromptInjectionBoundary`:

- A shipped policy that labels raw source text and source excerpts as untrusted data.
- Tools must not follow instructions found inside source documents, evidence excerpts, wiki pages, or fetched artifacts.
- The direct proof includes a prompt-injection string inside synthetic source text and proves the tool returns it only as cited data.

`ExcerptPolicy`:

- A shipped policy for bounded source excerpts.
- Default: return small, cited snippets from existing SourceAnchors/TextPdfAdapter ranges only, with source id, snapshot id, checksum, locator, extraction method, and freshness.
- Do not return full raw files, unbounded document text, credentials, secrets, external URLs without allowed-domain checks, OCR-derived text, vector-derived text, or inferred content.

`CitationPolicy`:

- Every positive tool result should cite SourceAnchors and/or existing EvidenceCards.
- Missing/unsupported/stale results should cite the relevant coverage entry or source inventory posture when possible.
- Tool responses must distinguish raw-source citations, Finance Twin references, CFO Wiki references, mission answer references, and proof-bundle references.

`RedactionPolicy`:

- Shipped handling for secrets, credentials, tokens, bank account identifiers, private customer/vendor/payroll/tax/legal data, and sensitive board/lender details.
- First implementation defaults to conservative truncation/redaction and approved synthetic/local proof data.

`AppMode`:

- `local_proof`: direct local proof over existing EvidenceIndex outputs and synthetic/approved data.
- `internal_developer_mode`: local/internal MCP testing only, no public app submission, no deployment, no OAuth/provider credentials unless a later plan permits them.
- `future_chatgpt_app_alpha`: future Apps SDK/ChatGPT App surface after security/privacy/self-hosting and publication gates are handled.

`ToolPermission`:

- `read_search`: may search read-only indexed evidence.
- `read_fetch`: may fetch one read-only indexed artifact.
- `read_inspect`: may inspect coverage, posture, boundaries, freshness, and limitations.
- No write permission exists in V2C.

`ForbiddenToolAction`:

- `create`, `update`, `delete`, `send`, `release_report`, `circulate_report`, `certify`, `attest`, `sign_off`, `mark_close_complete`, `approve`, `pay`, `move_money`, `write_accounting_record`, `write_bank_record`, `file_tax`, `give_legal_advice`, `give_audit_opinion`, `call_provider`, `create_provider_job`, `contact_customer`, `contact_vendor`, `mutate_source`, `write_finance_twin_fact`, `run_ocr`, `run_vector_search`, `use_openai_file_search`, `use_page_index`, `generate_finance_advice`, `generate_external_communication`, `use_runtime_codex_as_finance_output`, and `take_autonomous_action`.

### Shipped Tools

`search_evidence`:

- Input: company key, query text, optional artifact/source/mission filters, freshness preference, limit, and include-excerpts flag.
- Output: `EvidenceToolResponse<EvidenceSearchResult[]>`.
- Must return empty/unsupported/stale results explicitly rather than inventing answers.

`fetch_evidence_card`:

- Input: company key and EvidenceCard id.
- Output: `EvidenceToolResponse<EvidenceFetchResult<EvidenceCard>>`.

`fetch_source_anchor`:

- Input: company key and SourceAnchor id.
- Output: `EvidenceToolResponse<SourceAnchorFetch>`.

`fetch_document_map`:

- Input: company key and DocumentMap id or source id.
- Output: `EvidenceToolResponse<DocumentMapFetch>`.

`fetch_source_coverage`:

- Input: company key plus optional source, mission family, or artifact filters.
- Output: `EvidenceToolResponse<SourceCoverageFetch>`.

`fetch_company_posture`:

- Input: company key and optional period/source-family filters.
- Output: `EvidenceToolResponse<CompanyPostureFetch>`.

`fetch_capability_boundaries`:

- Input: company key plus optional artifact/tool/action filters.
- Output: `EvidenceToolResponse<CapabilityBoundaryFetch>`.

### Required Planning Answers

What exact gap from V2A/V2B justifies V2C now?

- V2A/V2B shipped deterministic evidence artifacts, but no shared read-only agent/human tool contract existed for discovering and fetching those artifacts. V2C now makes the evidence substrate navigable locally without widening authority or action boundaries.

Is V2C planning safe before OSS demo/self-host baseline is complete?

- Yes for this docs-and-plan record and the shipped local/internal read-only proof. No for public ChatGPT App submission, remote deployment, OAuth-backed app publication, or public demo distribution. An OSS demo/self-host/security/privacy/contribution/threat-model baseline should precede any public app alpha or deployment.

Which artifacts should a read-only MCP/App expose first?

- Existing EvidenceIndex outputs first: EvidenceCards, SourceAnchors, DocumentMaps, SourceCoverageMatrix, CapabilityBoundaries, FreshnessPosture, LimitationPosture, PermittedNextAction, and TextPdfAdapter provenance where relevant. Finance Twin summaries, CFO Wiki pages, mission answers, and proof bundles may appear only as cited read-only references through the same envelope.

Should the first implementation be a local read-only MCP server, a plain control-plane read-only service, or a docs-only contract?

- The shipped implementation is a plain read-only evidence-tool contract/service and direct proof under the EvidenceIndex boundary. It is not a local MCP server. A future MCP wrapper must remain a thin read-only adapter over this contract and needs a later named plan.

Which tools are allowed in the first V2C implementation?

- Only `search_evidence`, `fetch_evidence_card`, `fetch_source_anchor`, `fetch_document_map`, `fetch_source_coverage`, `fetch_company_posture`, and `fetch_capability_boundaries` shipped. Platform-compatible aliases remain future-only and must map to these exact behaviors if a later plan adds them.

Which tools are explicitly forbidden?

- Any create/update/delete/send/certify/report-release/payment/provider/customer-contact/source-mutation/finance-write/legal/audit/advice/generation/autonomous tool. Approval, delivery, report-release, wiki-compile/export/file/bind, source upload/ingest/sync, Finance Twin sync/write, OCR/vector/PageIndex/OpenAI-file-search, LLM summarization, generated advice, and runtime-Codex finance output tools are also forbidden in V2C.

What response schema should every tool return?

- Every tool returns `EvidenceToolResponse<T>` with the fields listed in the conceptual model.

How will tools expose evidence/freshness/limitations/permitted-next-action fields?

- Those fields are first-class envelope fields, not prose footnotes. They should derive from existing EvidenceIndex, SourceCoverageMatrix, Finance Twin, CFO Wiki, mission answer, and proof-bundle state.

How will tool responses cite SourceAnchors and avoid freeform finance advice?

- Positive results must carry SourceAnchor and/or EvidenceCard ids, locators, checksums, source snapshots, freshness, and limitation posture. Tool descriptions and schemas must say they return cited evidence artifacts only and do not answer finance questions as advice.

What source excerpts are safe to return?

- Short, bounded, cited excerpts already represented by SourceAnchors/TextPdfAdapter ranges are safe when not redacted by policy. Full files, credentials, secrets, unbounded pages, inferred text, OCR/vector-derived text, and external URL content are not safe by default.

How will unsupported/missing/stale evidence appear?

- As structured `unsupportedReason`, `freshness`, `limitations`, `capabilityBoundaries`, and empty or partial `result` values. Tools must fail closed and never fill gaps with generated prose.

How will CapabilityBoundaries block writes/actions?

- Write/action capabilities are absent from the manifest, forbidden action families are returned explicitly, and direct proof must assert that no write tools are registered.

How will prompt injection and exfiltration risks be handled?

- Source text is untrusted data; tool outputs are bounded and cited; hidden instructions in sources are never followed; secrets are redacted; external URL fetching is absent; and query/output audit records capture what was shared.

How will query audit logging work without creating product finance behavior?

- First implementation emits structured local proof-output audit events inside every `EvidenceToolResponse`. It creates no mission state changes, finance facts, replay events, or DB writes. Additive audit persistence remains future-only.

Should any DB schema/migration be planned?

- No. V2C stayed derived/in-memory/proof-output only. Additive audit persistence can be planned later only if a later plan proves a real need.

How will future ChatGPT App / Apps SDK consume the read-only MCP tools?

- A future ChatGPT App should consume the same read-only MCP tools and `EvidenceToolResponse` contract. Apps SDK UI/resources, iframe UI, OAuth, publishing, and deployment remain later work.

What official OpenAI docs were used, and how do they affect the design?

- See Artifacts and Notes. They affect future platform posture only: read-only annotations, local developer mode separation, remote MCP trust risks, approval/filtering, prompt injection, exfiltration, URL/domain, logging, and file-search/vector-store future boundaries.

What should V2D Evidence Atlas consume later from V2C?

- V2D should consume the same read-only search/fetch responses, SourceAnchor locators, DocumentMaps, coverage, posture, citation, limitation, redaction, and boundary fields. It should not create a separate UI truth layer.

What should V2E bounded LLM orchestration wait for?

- V2E should wait for this stable V2C read-only contract to receive QA, plus any later security/privacy baseline needed for broader exposure. Excerpt/citation/redaction policies, prompt-injection proof, audit-event shape, no-write manifest proof, and missing/stale/unsupported handling now exist locally.

## Outcomes & Retrospective

Implementation outcome:

- V2C shipped a local/internal read-only evidence-tool contract and direct proof only.
- FP-0082 is the shipped V2C local read-only evidence-tool contract record after implementation.
- The shipped tool contract includes `EvidenceSearchResult`, `EvidenceFetchResult`, `EvidenceToolResponse`, `SourceAnchorFetch`, `DocumentMapFetch`, `SourceCoverageFetch`, `CompanyPostureFetch`, `CapabilityBoundaryFetch`, `ToolSafetyBoundary`, `ReadOnlyToolManifest`, `AgentQueryAuditEvent`, `PromptInjectionBoundary`, `ExcerptPolicy`, `CitationPolicy`, `RedactionPolicy`, `AppMode`, `ToolPermission`, and `ForbiddenToolAction`.
- The shipped local functions are `search_evidence`, `fetch_evidence_card`, `fetch_source_anchor`, `fetch_document_map`, `fetch_source_coverage`, `fetch_company_posture`, and `fetch_capability_boundaries`.
- Raw sources remain authoritative for document claims, Finance Twin remains authoritative for structured facts, CFO Wiki remains compiled/derived, and EvidenceIndex remains the read-only anchor/trace/card/coverage/limitation layer.
- Public ChatGPT App alpha, Apps SDK implementation, remote MCP deployment, OAuth, app submission, external deployment, and external communications remain future-only.
- V2D Evidence Atlas UI and V2E bounded LLM orchestration remain future-only.
- F6V/F6X/OCR/vector/PageIndex/OpenAI file-search/iOS/OpenClaw remain future-only.
- No FP-0083 was created.
- No UI, routes, schema, migration, package script, smoke alias, eval dataset, fixture, provider integration, certification, delivery, report release, payment, source mutation, finance write, generated product prose, LLM orchestration, runtime-Codex finance output, or autonomous action was added.

Closeout:

- Pre-closeout validation status: passed. The full 41-command V2C implementation validation ladder completed successfully, including `pnpm ci:repro:current`; log root: `/tmp/pocket-cfo-v2c-validation-20260508T122741Z`.
- Final validation after closeout docs: passed. `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm ci:repro:current` all passed on the final closeout tree.
- QA correction status: one narrow V2C contract-only hardening correction was applied after implementation QA. It bounded/redacted returned DocumentMap source-section excerpts and made capability-boundary inspection fail closed for unknown requested actions.
- Commit/push/PR status: PR #229 carries the V2C implementation branch; the QA correction is validated for one additional fix commit on that branch.
- Remaining work: no further V2C correction is needed after the green QA hardening pass. The next new planning track should be OSS demo/self-host/security/privacy baseline before any public ChatGPT App alpha, remote MCP deployment, OAuth-backed publication, app submission, or public demo distribution.
