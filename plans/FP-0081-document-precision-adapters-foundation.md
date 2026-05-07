# FP-0081 - Document Precision Adapters Foundation

## Purpose / Big Picture

The target phase is `V2B`, and the exact slice is `V2B-document-precision-adapters-foundation`.

The user-visible goal is narrow: after shipped FP-0080/V2A, Pocket CFO needs an implementation-ready plan for one deterministic document precision adapter over EvidenceIndex. V2B is not generic document AI, not broad RAG, not OCR, not vector search, not PageIndex, and not an LLM orchestration layer.

This master-plan slice is docs-and-plan only. It creates the active FP-0081 plan, refreshes only directly stale active docs, and does not implement V2B. The future implementation candidate is one deterministic `TextPdfAdapter` for a narrow policy/covenant text-PDF source family only if quality gates prove that anchors can be generated without weakening raw source authority. If those gates fail, the implementation thread must stop or narrow to markdown/plain-text table-boundary hardening instead.

FP-0080 remains the shipped first V2A EvidenceIndex and document-map foundation record. FP-0079 remains shipped F12, FP-0078 remains shipped F11, FP-0077 remains shipped F10, FP-0076 remains shipped F9, FP-0075 remains shipped F8, FP-0074 remains shipped F7, and FP-0050 through FP-0073 remain shipped F6 records.

GitHub connector product work is explicitly out of scope. Routine git, `gh`, push, and PR operations for this repository do not invoke GitHub Connector Guard.

No external web research was used to create this plan. Repo source truth came from current code, current active docs, shipped Finance Plans, and this active Finance Plan.

## Progress

- [x] 2026-05-07T19:30:01Z - Invoked the Pocket CFO operator skills required for this slice: Finance Plan Orchestrator, Modular Architecture Guard, Source Provenance Guard, CFO Wiki Maintainer, Evidence Bundle Auditor, F6 Monitoring Semantics Guard, Validation Ladder Composer, and Pocket CFO Handoff Auditor.
- [x] 2026-05-07T19:30:01Z - Completed preflight against fetched `origin/main`; branch, clean worktree, GitHub auth/repo access, Docker Postgres/MinIO availability, shipped FP-0080 on `origin/main`, local FP-0080, missing FP-0081, missing FP-0082, and existing V2A proof command all supported V2B planning.
- [x] 2026-05-07T19:30:01Z - Read the active documentation spine, shipped FP-0080 and FP-0079 records, roadmap, package metadata, ops/eval docs, EvidenceIndex domain/control-plane implementation, source, wiki, Finance Twin, evidence, and source-pack proof boundaries needed for a docs-only V2B plan.
- [x] 2026-05-07T19:30:01Z - Completed the required repository search pass for FP-0081, FP-0082, V2B, document precision, precision adapters, PDF, OCR, vector, PageIndex, MCP, ChatGPT App, provider integration, certification, deployment, external communications, generated prose, source mutation, finance writes, autonomous behavior, `pocket-cto`, `@pocket-cto`, GitHub-first, and engineering-first wording.
- [x] 2026-05-07T19:30:01Z - Ran `pnpm exec tsx tools/evidence-index-foundation-proof.mjs`; the shipped V2A proof passed before FP-0081 was created.
- [x] 2026-05-07T19:30:01Z - Decided V2B is safe to plan as one deterministic precision-adapter foundation over EvidenceIndex because the shipped V2A substrate exists and no provider, certification, MCP, ChatGPT App, iOS, OpenClaw, deployment, external communications, package rename, GitHub deletion, engineering-twin deletion, source mutation, finance write, or autonomous action is required.
- [x] 2026-05-07T19:30:01Z - Created this FP-0081 active implementation-ready contract for the next V2B implementation thread, while keeping this master-plan thread docs-and-plan only.
- [x] 2026-05-07T19:33:07Z - Refreshed directly stale active docs so they point to FP-0081 as the active V2B implementation-ready plan without claiming V2B implementation has shipped.
- [x] 2026-05-07T19:41:17Z - Ran the full 37-command docs-and-plan validation ladder serially; all commands passed, including `pnpm ci:repro:current`, with logs under `/tmp/pocket-cfo-v2b-planning-validation.8gHUW5PSsX`.

## Surprises & Discoveries

FP-0080 is present locally and on fetched `origin/main`, and the current branch started clean at the same commit as `origin/main`.

`tools/evidence-index-foundation-proof.mjs` exists and passed before this plan was created. The proof already verifies deterministic document maps, source anchors, evidence claims, evidence traces, evidence cards, source coverage matrix posture, and fail-closed unsupported posture for PDF, scan, image-only, OCR, vector, PageIndex, table, and figure boundaries.

No FP-0081 plan file existed before this slice. No FP-0082 plan file existed, and FP-0082 must not be created in this slice.

The existing EvidenceIndex contracts already include extraction-method and limitation vocabulary for supported markdown/plain text, unsupported PDF, unsupported scan, unsupported image-only, unsupported table, unsupported figure, unsupported graphics, unsupported ambiguous layout, unsupported OCR-only, unsupported vector-only, unsupported PageIndex-only, and unsupported LLM-generated posture. V2B should extend that shape instead of creating a separate evidence contract.

The CFO Wiki domain currently names `pdf_text` as a document kind, but the active control-plane document extractor supports deterministic markdown and plain text only. PDF ingest currently falls back to metadata/no-structured-parser posture. That is a useful reason to plan V2B, but not permission to implement broad PDF extraction.

Table and figure detection already exists as placeholder/unsupported posture in the V2A text structure path. It does not provide safe semantic table extraction. V2B must keep tables fail-closed unless a later plan proves row, cell, merged-cell, layout, and numeric ambiguity handling.

`pocket-cto` and `@pocket-cto` hits are valid internal scaffolding. They must not be renamed in V2B planning or implementation.

GitHub-first and engineering-first hits are either historical reference, active docs that explicitly demote those scopes, or isolated existing connector/twin scaffolding. No product behavior leak requires a smaller corrective slice.

No web/browser research was used. If a future implementation thread considers a deterministic PDF/text extraction library, it should inspect official/current library documentation and record external sources in this plan before choosing a dependency.

The first validation harness attempt used `status` as a zsh variable name and stopped before reporting command results because `status` is read-only in zsh. That was a wrapper failure, not a product failure. The unchanged validation ladder was rerun with the wrapper variable renamed and passed all 37 commands.

## Decision Log

Decision: V2B is safe to plan now.
Rationale: FP-0080/V2A is merged and shipped, active docs support FP-0080 as shipped, the V2A proof command exists and passes, EvidenceIndex domain/control-plane implementation exists, no unfinished FP-0081 or later plan exists, and the work can remain docs-and-plan only in this master-plan slice.

Decision: V2B is exactly `V2B-document-precision-adapters-foundation`.
Rationale: one narrow deterministic precision adapter is safer than mixing document precision with generic document AI, OCR, vector recall, PageIndex, MCP, ChatGPT App, UI, provider integration, certification, deployment, or external communications.

Decision: the first precision target should be policy/covenant documents.
Rationale: shipped finance-discovery and monitoring already include `policy_lookup` and `policy_covenant_threshold`, and the source-pack proof spine already includes `tools/policy-covenant-document-source-pack-proof.mjs`. Policy/covenant documents are a narrower first target than board/lender packets and are easier to fail closed when precision is missing.

Decision: plan `TextPdfAdapter` as the first candidate, but do not assume it will pass implementation gates.
Rationale: text-PDF support is the smallest useful post-V2A precision gap if a deterministic text layer can be extracted with page/line or section locators. The future implementation must prove this with official library docs, a safe synthetic fixture if explicitly permitted, repeatable extraction, checksum binding, and fail-closed behavior before any claim is emitted.

Decision: if text-PDF extraction cannot be proven safely, narrow the implementation to markdown/plain-text table-boundary hardening.
Rationale: V2B must not force PDF support when anchors cannot be made deterministic. A smaller corrective slice is better than broad, weak extraction.

Decision: tables remain fail-closed in the first implementation.
Rationale: deterministic table extraction is only safe if rows/cells can be anchored and merged cells, ambiguous layout, scans, images, and numeric ambiguity fail closed. This plan does not approve first-implementation table extraction.

Decision: OCR remains future-only.
Rationale: OCR needs a named source family, golden fixtures, quality thresholds, privacy posture, and fail-closed behavior. FP-0081 does not approve OCR implementation.

Decision: vector/file search remains future-only.
Rationale: OpenAI vector stores, OpenAI file search, and any vector recall adapter may later help recall candidate passages, but they must never become source truth and must not feed claims without EvidenceIndex anchor validation.

Decision: PageIndex remains future-only inspiration only.
Rationale: PageIndex-like navigation may inspire section, table, and figure map design, but FP-0081 does not approve a PageIndex dependency, cloud adapter, vectorless retrieval integration, or PageIndex-backed claims.

Decision: no LLM orchestration belongs in V2B.
Rationale: V2B must not add runtime LLM classification, summarization, generated answers, generated advice, generated product prose, or runtime-Codex finance output.

Decision: MCP and ChatGPT App remain V2C or later.
Rationale: read-only agent tools should consume EvidenceIndex and precision-adapter outputs only after V2B proof. FP-0081 does not expose write tools or agent runtime behavior.

Decision: no UI belongs in the first V2B implementation.
Rationale: the first proof should be a direct command and focused specs. Evidence Atlas UI remains V2D or later.

Decision: no DB schema/migration is expected for the first V2B implementation.
Rationale: the V2A foundation is derived/read-only and in-memory for proof. The first V2B adapter should stay derived/in-memory unless direct proof cannot preserve adapter provenance, version, freshness, and limitations without additive persistence.

Decision: no package scripts, smoke aliases, eval datasets, fixture files, or implementation scaffolding are added in this master-plan thread.
Rationale: this thread is docs-and-plan only. A future implementation thread may add a direct proof command, focused specs, and a tiny synthetic fixture only if this plan is updated to permit it explicitly and no real/private data is used.

Decision: preserve the authority model.
Rationale: raw sources, source snapshots, source files, checksums, storage refs, and provenance remain authoritative for document claims; Finance Twin remains authoritative for structured facts; CFO Wiki remains compiled/derived; EvidenceIndex remains a read-only anchor/trace layer.

Decision: do not invoke GitHub Connector Guard.
Rationale: this slice does not touch GitHub connector product behavior. Existing GitHub modules remain isolated and are not deleted.

## Context and Orientation

Current shipped plan truth:

- FP-0080 is the shipped first V2A EvidenceIndex/document-map foundation record.
- FP-0079 is the shipped F12 manual UI/demo-readiness audit record.
- FP-0078 is the shipped F11 public repo hygiene and V2 transition record.
- FP-0077 is the shipped F10/v1 public launch handoff record.
- FP-0076 is the shipped F9 read-only product UI truthfulness polish record.
- FP-0075 is the shipped F8 future-scope triage record.
- FP-0074 is the shipped F7 launch-readiness record.
- FP-0050 through FP-0073 remain shipped F6 records.

Shipped monitor families remain exactly:

- `cash_posture`
- `collections_pressure`
- `payables_pressure`
- `policy_covenant_threshold`

Shipped finance-discovery families remain exactly:

- `cash_posture`
- `collections_pressure`
- `payables_pressure`
- `spend_posture`
- `obligation_calendar_review`
- `policy_lookup`

Internal package scope remains `@pocket-cto/*`, and the root package name remains `pocket-cto`. FP-0081 must preserve those names.

GitHub modules and engineering-twin modules remain valid internal/historical scaffolding. FP-0081 must not delete them.

The current authority model is:

- raw sources, source files, source snapshots, checksums, storage refs, and provenance are authoritative for document claims
- Finance Twin persisted state is authoritative for structured finance facts
- CFO Wiki pages, source digest pages, filed pages, and exports are compiled or filed derived artifacts
- EvidenceIndex is a read-only anchor, trace, card, coverage, boundary, freshness, limitation, and permitted-next-action layer
- mission outputs, reports, readiness, monitoring, and proof bundles are derived and must show provenance, freshness, limitations, and absence boundaries

The exact post-V2A gap that justifies V2B now is document precision for supported source families that currently fail closed. V2A proved a native EvidenceIndex over deterministic markdown/plain text and already-supported source text. It intentionally failed closed on PDFs, scans, image-only files, OCR-only content, vector-only hits, tables, figures, graphics, and ambiguous layout. A narrow policy/covenant text-PDF adapter is the smallest useful next proof if it can preserve SourceAnchor precision.

## Plan of Work

The master-plan thread may touch only:

- `plans/FP-0081-document-precision-adapters-foundation.md`
- directly stale active docs allowed by the slice, such as `README.md`, `START_HERE.md`, `docs/ACTIVE_DOCS.md`, `docs/PROJECT_STATE.md`, `docs/V2_BOUNDARY.md`, and `plans/ROADMAP.md`

The master-plan thread must not add code, UI, routes, schema, migrations, package scripts, smoke aliases, eval datasets, fixtures, implementation scaffolding, monitor families, discovery families, runtime behavior, source-pack behavior, provider behavior, certification behavior, report/delivery behavior, source mutation, finance writes, generated prose, autonomous action, or FP-0082.

The future V2B implementation candidate should prefer extending the existing EvidenceIndex bounded context:

- possible adapter context: `apps/control-plane/src/modules/evidence-index/adapters/**`
- possible alternate bounded context only if proven necessary: `apps/control-plane/src/modules/document-precision/**`
- possible domain additions: `packages/domain/src/evidence-index-precision*.ts`
- possible direct proof command: `tools/document-precision-foundation-proof.mjs`
- possible focused specs for domain contracts, adapter gating, fail-closed behavior, and proof output
- possible tiny synthetic fixture only if this plan is updated to permit it explicitly, the fixture contains no real/private data, and no source-pack behavior changes are made

The future implementation must produce or extend these EvidenceIndex outputs through existing contracts:

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

The future implementation must preserve:

- source id
- snapshot id
- source file id
- source kind
- document role
- media type
- storage ref
- checksum
- captured time
- extraction time
- extraction method
- adapter name
- adapter version
- page, line, section, or text-range locator
- freshness posture
- limitation posture
- provenance chain

## Concrete Steps

The next implementation thread should follow this sequence.

1. Re-run preflight, confirm FP-0081 is the only active V2B plan, and re-run `pnpm exec tsx tools/evidence-index-foundation-proof.mjs`.
2. Inspect current EvidenceIndex domain/control-plane contracts and confirm no package-scope rename, schema migration, route, UI, or source-pack behavior is needed.
3. If considering a PDF library, inspect official/current documentation for deterministic local text extraction and record the external source in this plan. Do not use web findings to override repo truth.
4. Define precision domain additions only if existing EvidenceIndex contracts cannot express adapter provenance, version, quality gates, failure modes, and unsupported-region posture.
5. Implement the smallest adapter interface inside the EvidenceIndex boundary unless the plan is updated to justify `document-precision` as a new bounded context.
6. Implement `TextPdfAdapter` only for deterministic text-layer PDFs with policy/covenant document role and explicit source bindings.
7. Build anchor validation that binds every emitted anchor to source id, snapshot id, source file id, checksum, storage ref when available, extraction method, adapter version, page/line/section locator, freshness, and limitations.
8. Preserve fail-closed behavior for scans, image-only PDFs, encrypted/password PDFs, missing text layer, ambiguous layout, OCR-only content, vector-only recall, PageIndex-only hits, tables, figures, graphics, and numeric ambiguity.
9. Add focused specs and `tools/document-precision-foundation-proof.mjs` only if implementation starts. Do not add a package script or smoke alias unless a later plan explicitly approves it.
10. Refresh active docs only where they become directly stale, then run the validation ladder.

Concept definitions for FP-0081:

- `PrecisionAdapter`: a deterministic, read-only EvidenceIndex extension that attempts one bounded extraction method for one source family and either emits validated EvidenceIndex artifacts or fails closed.
- `TextPdfAdapter`: the first candidate PrecisionAdapter. It may extract embedded text from a narrow policy/covenant PDF only when it can bind text spans to page/line or section locators and original source checksums without OCR, vector recall, or LLM interpretation.
- `TableAdapter`: a future-only adapter candidate for table structures. It must not be implemented until row/cell anchors, merged-cell posture, layout ambiguity, numeric ambiguity, and fail-closed quality gates are proven.
- `OcrAdapter`: a future-only adapter candidate for OCR text. It requires a named source family, golden fixtures, privacy posture, quality thresholds, and explicit fail-closed behavior before any plan may implement it.
- `VectorRecallAdapter`: a future-only recall adapter candidate. It may surface candidate passages only after deterministic anchors exist and must never become source truth or emit claims without EvidenceIndex anchor validation.
- `PageIndexAdapter`: a future-only navigation or map inspiration candidate. It must not add a PageIndex dependency or PageIndex-backed claim path in FP-0081.
- `PrecisionCapabilityBoundary`: a structured statement of what a PrecisionAdapter supports, rejects, and requires, including unsupported media, unsupported layout, freshness, provenance, and permitted next actions.
- `PrecisionExtractionMethod`: an explicit method posture such as `text_pdf_deterministic` or an unsupported method code. It must be recorded on anchors, claims, traces, coverage, and cards.
- `PrecisionQualityGate`: a deterministic acceptance check that must pass before the adapter emits claims, such as checksum match, repeatable extraction, valid page/line locator, no OCR fallback, no table semantic claim, and no numeric ambiguity.
- `GoldenDocumentFixturePolicy`: the rule for future safe fixtures. Use only tiny synthetic documents with no real/private data, checked-in only if the plan explicitly permits them, and designed to prove positive and fail-closed paths.
- `AnchorValidation`: the process that proves every emitted anchor points back to immutable source metadata and an inspectable locator without inventing authority.
- `UnsupportedRegion`: a source region that the adapter can locate but cannot safely interpret, such as a table, figure, graphic, merged cell, scan, image, or ambiguous layout block.
- `AmbiguousLayout`: any layout condition where reading order, section ownership, page context, or spatial relation cannot be determined deterministically.
- `NumericAmbiguity`: any numeric expression whose unit, sign, period, row/column header, currency, or source context is not deterministic enough to emit a claim.
- `AdapterProvenance`: adapter name, version, library or method, configuration, proof time, and source metadata required to reproduce or audit extraction.
- `AdapterVersion`: a stable version string or hash for the adapter logic and method posture that is recorded on derived artifacts.
- `AdapterFailureMode`: a typed fail-closed result such as unsupported media type, no text layer, encrypted PDF, checksum mismatch, ambiguous layout, unsupported table, unsupported figure, numeric ambiguity, extraction error, or unsupported dependency.

Planning questions answered:

- What exact gap from F12/V2A justifies V2B now? V2A proved EvidenceIndex for deterministic markdown/plain text and already-supported source text, but intentionally fails closed on text-PDF and higher-precision document regions. Policy/covenant text-PDF precision is the smallest useful next gap.
- Which source family should be first? Policy/covenant documents first, because `policy_lookup`, `policy_covenant_threshold`, and the policy/covenant source-pack proof already exist. Board/lender documents remain later.
- Is text-PDF extraction safe enough for first implementation? It is safe enough to plan, not safe enough to assume. The implementation must prove deterministic embedded text extraction before emitting claims. If it cannot, narrow to markdown/plain-text table-boundary hardening.
- What media types are in scope? Existing `text/markdown` and `text/plain` remain the baseline. The first precision target may add `application/pdf` only for PDFs with an embedded text layer. Scans, images, OCR, vector-only recall, PageIndex-only hits, tables, figures, and graphics remain unsupported.
- What document roles are in scope? `policy_document` is the first precision role. `board_material`, `lender_document`, and `general_document` remain possible later roles, not first implementation targets unless the plan is updated.
- What must remain unsupported? Scans, image-only files, encrypted/password PDFs, PDFs without deterministic text, ambiguous layout, OCR-only content, vector-only content, PageIndex-only navigation, tables, figures, graphics, merged cells, numeric ambiguity, generated prose, LLM interpretation, provider/certification/delivery behavior, source mutation, finance writes, and autonomous action.
- How will the adapter produce SourceAnchors without weakening raw source authority? It must attach anchors to immutable source id, snapshot id, source file id, checksum, storage ref, media type, document role, extraction method, adapter version, freshness posture, limitations, and page/line/section locator. The raw source remains authority; the anchor is only an inspectable pointer.
- How will provenance be preserved? Every artifact must carry adapter name/version, extraction method, source metadata, source checksum, snapshot/file identifiers, storage reference where available, proof time, freshness posture, limitation posture, and failure mode when applicable.
- What quality gates prove an extracted anchor is safe? Checksum match, deterministic repeatability, supported media and document role, embedded text layer present, valid page/line or section locator, nonempty text span, stable reading order for the emitted region, no OCR fallback, no vector/PageIndex fallback, no LLM interpretation, no table semantic claim, no numeric ambiguity, and explicit unsupported-region output for skipped regions.
- What conditions force fail-closed? Unsupported media, no source binding, missing snapshot/file/extract, checksum mismatch, encrypted/password PDF, no embedded text layer, scan/image-only content, ambiguous reading order, table/figure/graphic region, merged cells, numeric ambiguity, extraction error, unsupported library behavior, stale or missing source posture where the claim would be misleading, and any request to mutate sources or write finance state.
- How will table-like content be handled? It remains an `UnsupportedRegion` and `CapabilityBoundary` in first implementation. The adapter may locate that a table-like region exists only if safe, but it must not emit row/cell claims.
- How will numeric ambiguity be handled? Numeric content inside ambiguous text, tables, headings, footnotes, or unknown units/currencies/periods must produce `NumericAmbiguity` limitations and fail closed for claims.
- What direct proof command should prove V2B? `tools/document-precision-foundation-proof.mjs`, added only in the future implementation thread.
- How will the proof command prove absent behaviors? It must assert no OCR, vector, PageIndex, LLM, provider, certification, delivery, source mutation, finance write, route, UI, schema/migration, package script, smoke alias, eval dataset, source-pack behavior, generated prose, or autonomous behavior was added. It should report runtime boundary flags the same way V2A proof does.
- Are DB schema/migrations needed? No by default. The first adapter should remain derived/in-memory unless direct proof shows additive persistence is required to preserve adapter provenance and repeatability.
- What active-doc updates are needed after V2B planning? Active docs should point to FP-0081 as the active V2B implementation-ready plan, while keeping V2B implementation blocked until this plan is executed and keeping V2C/later tracks future-only.
- What should V2C/MCP consume later? Read-only EvidenceIndex artifacts: SourceAnchors, DocumentMaps, EvidenceCards, SourceCoverageMatrix, CapabilityBoundaries, FreshnessPosture, LimitationPosture, and PermittedNextAction fields. V2C must not expose write tools.

## Validation and Acceptance

Docs-and-plan validation for this master-plan slice must run serially:

```bash
pnpm exec tsx tools/evidence-index-foundation-proof.mjs
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
pnpm --filter @pocket-cto/domain exec vitest run src/cfo-wiki.spec.ts src/source-registry.spec.ts src/finance-twin.spec.ts src/monitoring.spec.ts src/close-control.spec.ts src/close-control-certification-safety.spec.ts src/external-delivery-human-confirmation-boundary.spec.ts src/close-control-certification-boundary.spec.ts src/external-provider-boundary.spec.ts src/close-control-review-summary.spec.ts src/delivery-readiness.spec.ts src/proof-bundle.spec.ts src/evidence-index.spec.ts
zsh -lc "cd apps/control-plane && pnpm exec vitest run src/modules/evidence-index/**/*.spec.ts src/modules/wiki/**/*.spec.ts src/modules/sources/**/*.spec.ts src/modules/finance-twin/**/*.spec.ts src/modules/finance-discovery/**/*.spec.ts src/modules/monitoring/**/*.spec.ts src/modules/close-control/**/*.spec.ts src/modules/close-control-certification-safety/**/*.spec.ts src/modules/external-delivery-human-confirmation-boundary/**/*.spec.ts src/modules/close-control-certification-boundary/**/*.spec.ts src/modules/external-provider-boundary/**/*.spec.ts src/modules/close-control-review-summary/**/*.spec.ts src/modules/delivery-readiness/**/*.spec.ts src/modules/missions/**/*.spec.ts src/modules/approvals/**/*.spec.ts src/modules/evidence/**/*.spec.ts src/modules/reporting/**/*.spec.ts src/app.spec.ts"
pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/twin/workflow-sync.spec.ts src/modules/twin/test-suite-sync.spec.ts src/modules/twin/codeowners-discovery.spec.ts
pnpm lint
pnpm typecheck
pnpm test
pnpm ci:repro:current
```

Acceptance for this master-plan slice:

- FP-0081 exists and is the only new active Finance Plan.
- FP-0082 does not exist.
- FP-0081 is docs-and-plan only and implementation-ready.
- FP-0081 narrows V2B to one deterministic precision adapter candidate over EvidenceIndex.
- FP-0081 records policy/covenant text-PDF as the first candidate only under strict quality gates.
- FP-0081 records OCR, vector/file search, PageIndex, MCP/ChatGPT App, iOS, OpenClaw, deployment, provider integration, certification, package-scope rename, GitHub module deletion, engineering-twin deletion, source mutation, finance writes, generated prose, and autonomous action as future-only or out of scope.
- Active docs are updated only where directly stale.
- Validation passes, including `pnpm ci:repro:current`.

## Idempotence and Recovery

This master-plan slice is safe to re-run because it only adds or refreshes docs. If validation fails, classify whether the failure is a docs typo, stale active-doc pointer, local service problem, wrapper failure, or real product regression before changing scope.

If FP-0081 already exists on a rerun, do not create a duplicate. Inspect and update the existing active FP-0081 only if it is the intended plan. If FP-0082 exists unexpectedly, stop and report the conflict.

If a future implementation cannot prove deterministic text-PDF extraction, do not force V2B. Record the failure mode and recommend the smallest safer corrective slice: markdown/plain-text table-boundary hardening over EvidenceIndex, or a docs-only adapter research slice that records official library findings without implementation.

Rollback for this master-plan slice is a docs-only revert of FP-0081 and the active-doc pointers if the safety decision is invalidated before merge. Do not revert user work or unrelated files.

## Artifacts and Notes

Artifacts created or refreshed by this master-plan slice:

- `plans/FP-0081-document-precision-adapters-foundation.md`
- directly stale active docs that need to point at FP-0081 as the active V2B implementation-ready plan

Artifacts planned but not implemented in this thread:

- `apps/control-plane/src/modules/evidence-index/adapters/**`
- `apps/control-plane/src/modules/document-precision/**` only if later proven necessary
- `packages/domain/src/evidence-index-precision*.ts`
- `tools/document-precision-foundation-proof.mjs`
- focused specs
- a tiny synthetic fixture only if the future implementation plan explicitly permits it and no real/private data is used

Artifacts explicitly not created:

- FP-0082
- code
- UI
- routes
- schema/migrations
- package scripts
- smoke aliases
- eval datasets
- fixture files
- implementation scaffolding
- source-pack behavior
- provider integration
- certification
- delivery/external communications
- generated product prose
- source mutation
- finance writes
- autonomous action

Replay and evidence-bundle implications:

This master-plan slice creates no replay events because it does not mutate mission state, raw sources, Finance Twin facts, CFO Wiki pages, reports, approvals, providers, delivery records, certification state, or product runtime behavior. The future V2B implementation should remain read-only/derived and should create no replay events unless it introduces durable product state, in which case the plan must name the event and proof-bundle behavior explicitly.

## Interfaces and Dependencies

Primary internal interfaces:

- `packages/domain/src/evidence-index*.ts`
- `packages/domain/src/index.ts`
- `apps/control-plane/src/modules/evidence-index/**`
- `apps/control-plane/src/modules/sources/**`
- `apps/control-plane/src/modules/wiki/**`
- `apps/control-plane/src/modules/finance-twin/**`
- `apps/control-plane/src/modules/evidence/**`
- `tools/evidence-index-foundation-proof.mjs`
- `tools/*source-pack-proof*.mjs`

No new environment variables are planned.

No DB migration is planned by default.

No routes are planned by default.

No package scripts or smoke aliases are planned.

No OpenAI vector store, OpenAI file search, MCP, ChatGPT App, PageIndex, OCR, provider, certification, delivery, deployment, iOS, OpenClaw, or external communication dependency is planned.

If a future implementation chooses a deterministic PDF/text extraction library, it must use official/current documentation, record the source in this plan, and prove the dependency does not add cloud processing, OCR fallback, vector recall, LLM interpretation, source mutation, finance writes, or external delivery behavior.

## Outcomes & Retrospective

FP-0081 is the active V2B implementation-ready plan, not a shipped implementation record.

The docs-and-plan slice passed the full requested validation ladder on 2026-05-07, including the V2A proof, all source-pack proofs, CFO Wiki/Finance Twin/monitoring/close-control smokes, web/domain/control-plane specs, `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm ci:repro:current`.

The recommended next step after this docs-and-plan slice merges is to start the V2B implementation only through FP-0081 and only for the narrow policy/covenant `TextPdfAdapter` candidate. If deterministic text-PDF quality gates cannot be proven early, the implementation thread should stop and recommend a narrower V2A correction for markdown/plain-text table-boundary hardening rather than broadening scope.

V2C MCP/ChatGPT App, F6V provider integration, F6X certification, OCR, vector/file search, PageIndex, OpenAI vector store/file-search adapters, iOS, OpenClaw, deployment/external communications, package-scope rename, GitHub module deletion, engineering-twin deletion, and later work remain future-plan-only.
