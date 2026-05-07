# FP-0079 - F12 Manual UI/Demo-Readiness Audit

## Purpose / Big Picture

F12 is a manual UI/demo-readiness audit after shipped F11/FP-0078 public repo hygiene and V2 transition work.

This plan creates the implementation-ready contract for exactly one future slice: `F12-manual-ui-demo-readiness-audit`. The slice is docs-and-plan only in this master-plan thread. It must not add product runtime behavior, code, UI implementation, routes, schema, migrations, package scripts, smoke aliases, eval datasets, fixtures, implementation scaffolding, package-scope renames, GitHub module deletion, engineering-twin deletion, provider integration, certification, delivery, deployment, external communications, EvidenceIndex, PDF/OCR/vector search, ChatGPT App/MCP, iOS, OpenClaw, source mutation, finance writes, generated product prose, or autonomous action.

The future F12 implementation should audit the existing app/web operator surface and demo story, produce a durable QA artifact, and patch only direct read-only copy/layout defects if the audit proves them.

## Progress

- [x] 2026-05-07T16:15:26Z - Loaded the Pocket CFO plugin skills required for this planning slice: Finance Plan Orchestrator, Modular Architecture Guard, Source Provenance Guard, CFO Wiki Maintainer, Evidence Bundle Auditor, F6 Monitoring Semantics Guard, Validation Ladder Composer, and Pocket CFO Handoff Auditor.
- [x] 2026-05-07T16:15:26Z - Completed preflight against fetched `origin/main`; branch, GitHub auth, Docker services, FP-0078 presence, no FP-0079, and no FP-0080 all supported planning F12.
- [x] 2026-05-07T16:15:26Z - Read active docs, shipped FP-0076 through FP-0078 records, roadmap, package metadata, and app/web source surfaces required for F12 planning.
- [x] 2026-05-07T16:15:26Z - Completed required repository searches and classified findings.
- [x] 2026-05-07T16:15:26Z - Decided F12 is safe to plan as a docs-and-plan-only manual UI/demo-readiness audit.
- [x] 2026-05-07T16:21:06Z - Ran the validation ladder named in this plan; all 36 commands passed, including `pnpm ci:repro:current`.
- [x] 2026-05-07T16:21:06Z - Prepared the repo-doc portion of this planning slice for the single commit, push, PR, and final response from the master-plan thread.
- [x] 2026-05-07T16:27:07Z - QA corrected stale closeout wording after confirming the planning commit, pushed branch, and PR exist; no scope, artifact, or implementation contract changed.

## Surprises & Discoveries

- FP-0078 is present locally and on fetched `origin/main`, and the current branch starts from the same commit as `origin/main`.
- `README.md`, `CODEX_README.md`, `docs/PROJECT_STATE.md`, and `docs/V2_BOUNDARY.md` exist and are linked by active docs.
- No existing `FP-0079` or `FP-0080` plan file was found before this slice.
- Active web routes already expose source-first, read-only boundary copy across home, sources, monitoring, close/control, acknowledgement readiness, operator readiness, and delivery readiness surfaces.
- Active public/demo surfaces still include audit targets that should be inspected in F12 implementation, including the legacy `demo-mission` passkeys fallback, the text mission intake placeholder, legacy GitHub/repo/proof wording reachable from non-finance mission paths, and report release/circulation labels that must be checked for demo clarity against the no-send/no-delivery boundary.
- `pocket-cto` and `@pocket-cto` hits are valid internal scaffolding that must not be renamed in F12.
- Archived Pocket CTO and older engineering-first material remains reference-only and must not override current Pocket CFO docs, code reality, or this plan.
- Future-only language for EvidenceIndex, provider integration, actual certification, PDF/OCR/vector search, ChatGPT App/MCP, iOS, OpenClaw, deployment, external communications, source mutation, finance writes, and autonomous action remains intentional.
- No behavior leak was found during planning that requires a smaller corrective slice instead of FP-0079. If F12 implementation finds one, it must stop and recommend the smallest corrective plan rather than broaden F12.
- Validation passed with the log root recorded under Artifacts and Notes.

## Decision Log

- F12 is safe to plan because FP-0078/F11 is shipped, active docs support FP-0078 as shipped, F11 public docs exist and are linked, no unfinished FP-0079 or later plan exists, and this planning slice can remain docs-and-plan only.
- F12 is not V2A EvidenceIndex. EvidenceIndex and document maps remain future-only until F12 closes and a later V2A plan names exact scope.
- F12 is not product feature work. It audits the existing app/web operator surface and demo story; it must not invent new product capabilities.
- F12 is not provider integration, certification, delivery, deployment, or external communications. F6V, F6X, delivery, provider sends, public launch external communications, and deployment remain future-only.
- F12 is not PDF/OCR/vector work, ChatGPT App/MCP, iOS, or OpenClaw. Those tracks may be named only as later candidates and must not be implemented here.
- F12 may use Codex's local browser only to inspect local app routes and capture screenshots where possible. If browser screenshots are unavailable, the implementation must record that limitation and produce a markdown QA report from route inspection, tests, and local app output.
- F12 implementation must create `docs/qa/v1-ui-demo-readiness-audit.md`.
- F12 implementation may create optional `docs/qa/screenshots/*.png` or equivalent local screenshot artifacts if local browser capture is available and safe.
- F12 implementation may patch only minimal direct read-only copy/navigation/layout defects if the audit proves them.
- F12 implementation must embed any tiny post-F11 doc freshness correction in the F12 slice instead of creating a standalone F11 polish branch.
- This plan does not invoke GitHub Connector Guard because F12 does not touch GitHub connector product behavior.
- Do not create FP-0080 from this slice.
- The validation ladder passed, so this planning slice is ready for one docs-only commit and PR.

## Context and Orientation

Current shipped plan truth:

- FP-0078 is the shipped F11 public repo hygiene and V2 transition record.
- FP-0077 is the shipped F10/v1 public launch handoff record.
- FP-0076 is the shipped F9 read-only product UI launch-polish record.
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

Active source truth comes from raw source evidence, source snapshots, checksums, provenance, freshness posture, derived Finance Twin state, CFO Wiki pages, current code, active docs, and this active Finance Plan. Chat context and generated prose are not source truth.

Internal `pocket-cto` and `@pocket-cto/*` package scope remains scaffolding and must not be renamed. GitHub modules and engineering-twin modules remain in place unless a dedicated future plan names their replacement.

## Plan of Work

F12 implementation should run as one manual UI/demo-readiness audit slice. It should inspect the existing app/web product surface against F11 public docs and V2 boundaries, record demo readiness gaps, and create one durable QA report.

The implementation slice must not add product behavior. It may only patch direct read-only copy/navigation/layout defects if the audit proves they are stale, confusing, or unsafe for the demo-readiness story.

F12 must answer whether a human can understand the product from the README and running UI, follow a demo journey from sources to evidence/readiness posture, and see the relevant source/freshness/limitation/proof boundaries without mistaking Pocket CFO for a provider, certification, delivery, payment, legal, or autonomous finance system.

## Concrete Steps

1. Re-run preflight on the F12 implementation branch/thread:
   - confirm the current branch is the intended F12 branch
   - confirm the repo is clean before work
   - confirm Docker Postgres and object storage are available
   - confirm FP-0079 is the active unfinished plan
   - confirm FP-0080 does not exist
2. Re-read the active docs and this plan before inspecting the UI:
   - `README.md`
   - `CODEX_README.md`
   - `START_HERE.md`
   - `docs/ACTIVE_DOCS.md`
   - `docs/PROJECT_STATE.md`
   - `docs/V2_BOUNDARY.md`
   - `PLANS.md`
   - `plans/ROADMAP.md`
   - this plan
3. Follow the README-linked local setup path and record whether it is enough for a human to start the local app.
4. Inspect and document at least these app/web surfaces:
   - home page
   - sources list
   - source detail
   - source file list
   - mission/discovery surfaces
   - monitoring page
   - monitoring alert card
   - close/control checklist
   - acknowledgement readiness
   - operator readiness
   - delivery readiness page/card
   - CFO Wiki routes if present
   - reporting/packet/readiness routes if present
   - empty states
   - navigation labels
   - warning/status copy
   - source/freshness/limitations/proof labels
   - mobile or narrow viewport behavior if Codex browser can support it
   - PWA/readability posture if discoverable
   - absence of provider/certification/delivery/report-release/payment/legal/advice/autonomous affordances
   - screenshot/demo-readiness gaps
5. Use Codex's local browser for local route inspection and screenshots if available. Do not use web search to override repository source truth.
6. Create `docs/qa/v1-ui-demo-readiness-audit.md` with:
   - scope and date
   - environment and routes inspected
   - screenshot availability and paths if screenshots were captured
   - direct answers to the required audit questions below
   - table of findings with severity, route, evidence, recommendation, and whether a direct read-only copy/layout patch is allowed
   - explicit limitations and any uninspected surfaces
7. Optionally create `docs/qa/screenshots/*.png` or equivalent local screenshot artifacts if local browser capture is available and safe.
8. Patch only direct read-only copy/navigation/layout defects if the audit proves them. Allowed examples are stale F11 doc lines, stale placeholders, confusing demo labels, misleading empty states, or copy that implies behavior Pocket CFO does not perform.
9. Stop and recommend the smallest safer corrective slice if any finding requires runtime behavior, route/schema changes, provider/certification/delivery behavior, source mutation, finance writes, action expansion, new datasets/fixtures/smokes/scripts, package-scope rename, GitHub module deletion, engineering-twin deletion, V2A, or FP-0080.
10. Update this plan's Progress, Surprises & Discoveries, Decision Log, and Outcomes & Retrospective before closeout.

Required F12 audit questions:

- Can a human understand the product from README and the running UI?
- Can a human follow a demo journey from sources to evidence/readiness posture?
- Are the app labels consistent with F11 docs and V2_BOUNDARY?
- Does any UI imply provider calls, external delivery, certification, report release, legal/audit opinion, payment instruction, finance write, customer contact, or autonomous action?
- Are source/freshness/limitation/proof states visible enough?
- Are empty states truthful and helpful?
- Are there broken links, stale labels, confusing warnings, or unreadable dense panels?
- Is there a stable screenshot path for the future public README/demo?
- Is a future OSS demo seed/self-host baseline needed before V2A?

## Validation and Acceptance

This planning slice is accepted only if:

- `plans/FP-0079-manual-ui-demo-readiness-audit.md` exists as the only new active Finance Plan.
- FP-0080 does not exist.
- Any active-doc updates are limited to directly stale F12 handoff pointers.
- No code, UI implementation, routes, schema, migrations, package scripts, smoke aliases, eval datasets, fixtures, implementation scaffolding, source-pack fixtures, proof tools, package-scope renames, GitHub module deletion, engineering-twin deletion, product runtime behavior, provider behavior, certification, delivery, deployment, external communications, source mutation, finance writes, generated product prose, or autonomous action changes are made.
- Validation is green before commit.

Future F12 implementation is accepted only if:

- `docs/qa/v1-ui-demo-readiness-audit.md` exists.
- Optional screenshot artifacts are present only if local browser capture is available and safe.
- The report answers every required audit question.
- Any UI/doc changes are minimal direct read-only copy/navigation/layout fixes proven by the audit.
- No real company data is used.
- No public deployment or external communication is performed.
- FP-0080 is not created.

Run these validations serially for this planning slice:

```bash
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
pnpm --filter @pocket-cto/domain exec vitest run src/cfo-wiki.spec.ts src/source-registry.spec.ts src/finance-twin.spec.ts src/monitoring.spec.ts src/close-control.spec.ts src/close-control-certification-safety.spec.ts src/external-delivery-human-confirmation-boundary.spec.ts src/close-control-certification-boundary.spec.ts src/external-provider-boundary.spec.ts src/close-control-review-summary.spec.ts src/delivery-readiness.spec.ts src/proof-bundle.spec.ts
zsh -lc "cd apps/control-plane && pnpm exec vitest run src/modules/wiki/**/*.spec.ts src/modules/sources/**/*.spec.ts src/modules/finance-twin/**/*.spec.ts src/modules/finance-discovery/**/*.spec.ts src/modules/monitoring/**/*.spec.ts src/modules/close-control/**/*.spec.ts src/modules/close-control-certification-safety/**/*.spec.ts src/modules/external-delivery-human-confirmation-boundary/**/*.spec.ts src/modules/close-control-certification-boundary/**/*.spec.ts src/modules/external-provider-boundary/**/*.spec.ts src/modules/close-control-review-summary/**/*.spec.ts src/modules/delivery-readiness/**/*.spec.ts src/modules/missions/**/*.spec.ts src/modules/approvals/**/*.spec.ts src/modules/evidence/**/*.spec.ts src/modules/reporting/**/*.spec.ts src/app.spec.ts"
pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/twin/workflow-sync.spec.ts src/modules/twin/test-suite-sync.spec.ts src/modules/twin/codeowners-discovery.spec.ts
pnpm lint
pnpm typecheck
pnpm test
pnpm ci:repro:current
```

## Idempotence and Recovery

This planning slice is docs-only and has no replay events because it does not change mission state, source registry state, Finance Twin state, CFO Wiki compiled state, monitoring state, readiness state, approvals, reports, delivery records, source files, or finance records.

Validation commands may create local database/object-storage test state. They should be rerunnable against the local Docker services and should not mutate repository source truth.

If validation fails, record the exact command, failure summary, and log path in this plan before stopping or fixing a docs-only issue. If a failure points to runtime/product behavior, do not broaden this slice; recommend the smallest corrective plan.

If browser screenshot capture is unavailable in F12 implementation, record that limitation in `docs/qa/v1-ui-demo-readiness-audit.md` and rely on route inspection, local app output, and deterministic validations.

If F12 implementation discovers behavior that implies provider calls, external delivery, certification, report release, legal/audit opinion, payment instruction, finance write, customer contact, source mutation, or autonomous action beyond shipped boundaries, stop and recommend the smallest safety corrective slice.

## Artifacts and Notes

Planning artifact created by this slice:

- `plans/FP-0079-manual-ui-demo-readiness-audit.md`

Validation log root for this planning slice:

- `/var/folders/41/pj1kw0tj2xd832wl_62gn73m0000gn/T//pocket-cfo-f12-planning-validation.20260507T161733Z.50846`

Required future F12 implementation artifact:

- `docs/qa/v1-ui-demo-readiness-audit.md`

Optional future F12 implementation artifacts:

- `docs/qa/screenshots/*.png`

No real company data, public deployment, external communications, source mutation, finance writes, generated launch copy, or autonomous action is allowed.

## Interfaces and Dependencies

F12 implementation may depend on:

- local Docker Postgres and object storage
- the existing control-plane service
- the existing web app
- Codex's local browser for local route inspection and screenshots if available
- active docs and shipped FP records

F12 implementation must not depend on:

- provider credentials
- provider jobs
- external delivery systems
- email, Slack, SMS, webhooks, scheduled delivery, or auto-send behavior
- public deployment
- GitHub connector product changes
- V2A EvidenceIndex or document-map implementation
- PDF/OCR/vector implementation
- ChatGPT App or MCP server implementation
- iOS or OpenClaw implementation

## Outcomes & Retrospective

FP-0079 is now the active F12 manual UI/demo-readiness audit contract. The plan keeps F12 bounded to manual app/web demo-readiness inspection, `docs/qa/v1-ui-demo-readiness-audit.md`, optional local screenshots if browser capture is available, and direct read-only copy/layout corrections only if the audit proves them.

The planning slice changed only this plan and directly stale active-doc/roadmap F12 handoff pointers. It added no code, UI implementation, route, schema, migration, package script, smoke alias, eval dataset, fixture, runtime behavior, provider integration, certification, delivery, deployment, external communication, source mutation, finance write, generated product prose, autonomous action, or FP-0080.

Validation passed across the full ladder, including `pnpm ci:repro:current`.

Closeout QA confirmed the docs-only planning commit is on the F12 branch and PR #222 is open. Recommended next product step after this PR: start F12 implementation under FP-0079. V2A should wait until F12 closes and a later V2A plan names exact scope.
