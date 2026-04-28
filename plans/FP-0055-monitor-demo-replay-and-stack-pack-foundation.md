# Define F6F monitor demo replay and stack-pack foundation

## Purpose / Big Picture

This file is the shipped Finance Plan record for the Pocket CFO F6F slice.
The target phase is `F6`, and the shipped scope is exactly `F6F-monitor-demo-replay-and-stack-pack-foundation`.

The user-visible goal is narrow: after shipped F6A through F6E, a new operator can bootstrap one demo company from checked-in source files and docs, then replay the shipped source-backed monitoring stack deterministically.
The demo proves the existing operating loop:

- source files become registered immutable evidence
- Finance Twin and CFO Wiki state are refreshed deterministically
- the four shipped monitor families run from stored state
- the shipped alert-to-investigation boundary is demonstrated from stored alert results; after shipped F6G polish, the replay expects cash plus collections handoffs when those demo monitors alert

F6F is not a new monitor family.
It must not add `spend_posture`, `obligation_calendar_review`, a new policy monitor, `covenant_risk`, or any new discovery family.
It must not change shipped monitor result semantics, alert condition kinds, F6B investigation behavior, F5 reporting/approval/release/circulation behavior, or runtime-Codex posture.

This implementation slice adds one checked-in demo fixture set, one finance-native demo stack-pack manifest, one deterministic replay smoke command, one normalized expected-output manifest, and docs describing the shipped boundary.
It does not add routes, schema, migrations, monitor families, discovery families, monitor evaluator semantics, runtime-Codex, delivery, reports, approvals, payment behavior, legal advice, policy advice, or autonomous remediation.
FP-0050 remains the shipped F6A record, FP-0051 remains the shipped F6B record, FP-0052 remains the shipped F6C record, FP-0053 remains the shipped F6D record, and FP-0054 remains the shipped F6E record.
GitHub connector work is explicitly out of scope.

## Progress

- [x] 2026-04-27T21:37:35Z Invoke the requested Pocket CFO operator plugin guards, run preflight, confirm the branch and services, and read the required active docs, shipped F6 records, ops docs, package scripts, monitor smokes, and stack-pack boundary.
- [x] 2026-04-27T21:37:35Z Created FP-0055 as the implementation-ready F6F contract during the slice; it now remains the shipped F6F record while FP-0050 through FP-0054 remain shipped F6A through F6E records.
- [x] 2026-04-27T21:37:35Z Refreshed the active-doc spine at the start of F6F so the then-next thread implemented the narrow F6F demo replay and stack-pack slice rather than re-planning F6F or widening into F6G or later work.
- [x] 2026-04-27T21:44:38Z Run the docs-and-plan validation ladder through `pnpm ci:repro:current`; all required commands passed.
- [x] 2026-04-27T22:08:31Z Add the checked-in F6F demo fixture set, normalized expected monitor outputs, finance-native demo stack-pack manifest, deterministic replay smoke, and `pnpm smoke:monitor-demo-replay:local`.
- [x] 2026-04-27T22:08:31Z Prove the replay smoke locally against the Docker-backed app: it bootstraps `demo-monitor-stack`, verifies the four shipped monitor families, creates or opens the then-shipped cash-alert investigation, and confirms then-unsupported monitor alerts remain investigation-free.
- [x] 2026-04-27T22:08:31Z Refresh the active docs and ops/eval guidance to identify FP-0055 as the shipped F6F record, with F6G or later work requiring a new Finance Plan.
- [x] 2026-04-27T22:14:56Z Run the full requested F6F validation ladder through `pnpm ci:repro:current`; all required commands passed.
- [x] 2026-04-27T22:37:54Z Polish shipped F6F proof/doc posture after merge: refresh stale local-dev and shipped-record wording, make the demo replay smoke prove checked-in fixture source immutability internally, and keep F6G planning or implementation out of scope.
- [x] 2026-04-27T22:43:44Z QA-polish FP-0055 shipped-record wording so historical validation and handoff notes do not read like an active instruction to keep implementing F6F.
- [x] 2026-04-27T23:58:41Z Post-F6G polish: align the shipped F6F demo replay proof wording with shipped F6G so cash plus collections handoffs are expected where alerting, payables and policy/covenant investigations remain absent, and F6H still requires a new Finance Plan.

## Surprises & Discoveries

The shipped F6 monitor proof surface is already strong enough to compose one demo replay.
The repo has packaged local proofs for `cash_posture`, `collections_pressure`, `payables_pressure`, `policy_covenant_threshold`, and the monitor alert-to-investigation handoff boundary.
F6F orchestrates and documents that shipped baseline rather than changing monitor evaluators.

The current `packages/stack-packs` package is still engineering-shaped.
It contains a `nextjs-vercel` pack with repo, CI, and mission-type vocabulary.
The F6F implementation does not force finance demo semantics into that old shape.
It adds a narrow finance demo stack-pack contract beside the existing interface while keeping `@pocket-cto/*` package scope unchanged.

The shipped monitor-result replay posture is not the same thing as mission replay.
Current monitor results record their own replay posture, and F6B creates mission replay only for the manual cash-alert investigation handoff.
F6F does not invent new mission replay events just to make a demo look active.

The implementation did not need a durable replay table or replay artifact.
The deterministic command summary is enough for the first F6F proof because monitor results, source files, Finance Twin sync state, CFO Wiki state, and monitor investigation missions already persist through shipped seams.

Retry determinism revealed one narrow fixture hygiene issue: repeated runs against the fixed `demo-monitor-stack` company can accumulate active CFO Wiki policy-document bindings.
The replay now uses the existing CFO Wiki binding route to mark previous demo policy-document bindings as excluded before binding the current fixture document, so the policy/covenant monitor sees one intended threshold document without rewriting raw sources or changing evaluator semantics.

## Decision Log

Decision: the first real F6F scope is `F6F-monitor-demo-replay-and-stack-pack-foundation`.
Rationale: the next useful proof is demo bootstrap and deterministic replay of shipped monitoring, not another monitor family.

Decision: F6F is not a new monitor family.
Rationale: shipped monitor families remain exactly `cash_posture`, `collections_pressure`, `payables_pressure`, and `policy_covenant_threshold`.
No `spend_posture`, `obligation_calendar_review`, new policy monitor, or new discovery family belongs in F6F.

Decision: the F6F input contract is one checked-in demo stack-pack fixture set.
Rationale: a new user needs source files and docs that can be registered deterministically, not chat memory or ad hoc local setup.
The shipped fixture set includes source files for bank/cash, receivables aging, payables aging, and policy threshold docs, plus deterministic source-registration instructions.

Decision: the F6F expected-output contract covers only shipped monitor behavior.
Rationale: expected outputs must be recorded for `cash_posture`, `collections_pressure`, `payables_pressure`, and `policy_covenant_threshold`, plus alert-to-investigation handoffs for the supported alerting demo families.
After shipped F6G, that means cash plus collections handoffs are expected and payables plus policy/covenant investigation handoffs remain out of scope.

Decision: the first demo replay ships as one deterministic smoke path.
Rationale: `pnpm smoke:monitor-demo-replay:local` registers the demo sources, uploads immutable fixture files, runs the shipped sync/wiki/monitor stack, compares normalized outputs, verifies the supported handoffs, asserts forbidden side effects remain absent, and prints one compact JSON summary.

Decision: no durable demo replay artifact or schema is added in F6F.
Rationale: the deterministic JSON summary is enough for the first implementation, while the underlying source files, source-file uploads, Finance Twin syncs, CFO Wiki posture, monitor results, and monitor investigation missions persist through existing shipped seams.

Decision: the replay excludes previous active demo policy-document bindings before binding the current fixture policy document.
Rationale: the fixed demo company key is retry-safe only if old policy fixtures do not accumulate into duplicate threshold conditions.
The implementation uses the existing CFO Wiki binding route and leaves raw source files immutable.

Decision: F6F remains deterministic, runtime-free, delivery-free, and non-autonomous.
Rationale: demo replay does not need runtime-Codex, email, Slack, webhooks, notification delivery, bank/accounting/tax/legal writes, payment instructions, policy/legal advice, LLM-generated advice, or autonomous remediation.

Decision: F6F preserves shipped F5 and F6 behavior.
Rationale: no F5 reporting approval/release/circulation/correction changes, no F6B mission behavior changes, no monitor evaluator changes, no new approval kind, and no report conversion belong in this foundation unless a narrow replay-fixture truthfulness defect is found and documented before fixing it.

Decision: later F6 slices are named but not created here.
Rationale: at F6F closeout, likely later slices were `F6G-non-cash-alert-to-investigation-generalization` only if a concrete operator need was proven, `F6H-close-control-checklist-foundation` only if source-backed and explicitly scoped, and `F6I-stack-pack-expansion` only after the first demo pack was green.
FP-0056 is now the shipped F6G record; do not create FP-0057 or start F6H from this shipped F6F record.

Decision: post-merge F6F proof/doc polish remains correction-and-freshness work inside the shipped FP-0055 record.
Rationale: fixture immutability and absence-summary proof fields strengthen the already-shipped replay evidence without adding product behavior, monitor evaluator semantics, monitor families, discovery families, schema, routes, package scripts, smoke aliases, runtime-Codex, delivery, reports, approvals, payment behavior, legal or policy advice, autonomous finance action, FP-0056, or F6G planning.

## Context and Orientation

Pocket CFO has shipped:

- F1 raw source registration and immutable file ingest
- F2A through F2O deterministic Finance Twin breadth
- F3A through F3D deterministic CFO Wiki compilation, lint/export, concepts, metrics, and policy pages
- F4A through F4C2 deterministic finance discovery for exactly six shipped families
- F5A through F5C4I deterministic reporting, packet, approval, release, circulation, correction, actor, and note-reset posture
- F6A deterministic `cash_posture` monitoring over stored Finance Twin cash-posture state only
- F6B manual alert-to-investigation handoff from one persisted alerting `cash_posture` monitor result
- F6C deterministic `collections_pressure` monitoring over stored receivables-aging or collections-posture state only
- F6D deterministic `payables_pressure` monitoring over stored payables-aging or payables-posture state only
- F6E deterministic `policy_covenant_threshold` monitoring over stored CFO Wiki policy-document posture plus explicit comparable Finance Twin posture only

The shipped monitor families remain exactly:

- `cash_posture`
- `collections_pressure`
- `payables_pressure`
- `policy_covenant_threshold`

The shipped discovery families remain exactly:

- `cash_posture`
- `collections_pressure`
- `payables_pressure`
- `spend_posture`
- `obligation_calendar_review`
- `policy_lookup`

The current backend monitoring surface is:

- `POST /monitoring/companies/:companyKey/cash-posture/run`
- `GET /monitoring/companies/:companyKey/cash-posture/latest`
- `POST /monitoring/companies/:companyKey/collections-pressure/run`
- `GET /monitoring/companies/:companyKey/collections-pressure/latest`
- `POST /monitoring/companies/:companyKey/payables-pressure/run`
- `GET /monitoring/companies/:companyKey/payables-pressure/latest`
- `POST /monitoring/companies/:companyKey/policy-covenant-threshold/run`
- `GET /monitoring/companies/:companyKey/policy-covenant-threshold/latest`
- `POST /missions/monitoring-investigations` for persisted alerting `cash_posture` monitor results only

Relevant shipped seams for the replay are:

- `packages/testkit` for checked-in fixture files and fixture validation
- `packages/stack-packs` for the additive finance demo stack-pack manifest and contract
- `packages/domain/src/monitoring.ts` for shipped monitor result, alert-card, source-lineage, proof, and runtime-boundary contracts
- `apps/control-plane/src/modules/sources/**` for immutable source registration and file upload behavior
- `apps/control-plane/src/modules/finance-twin/**` for deterministic source sync and stored Finance Twin reads
- `apps/control-plane/src/modules/wiki/**` for policy-document binding, deterministic extracts, policy pages, and compile posture
- `apps/control-plane/src/modules/monitoring/**` for run/latest monitor services
- `apps/control-plane/src/modules/missions/**` for the shipped monitoring investigation handoff boundary
- the existing monitor smoke scripts in `tools/` for proven source registration, sync, monitor, and boundary-assertion patterns

No GitHub connector work is in scope.
No new environment variables are expected.
No runtime-Codex behavior is expected.

## Plan of Work

First, the slice added a checked-in demo stack-pack fixture set for one deterministic company key, `demo-monitor-stack`.
The fixture includes immutable bank/cash, receivables-aging, payables-aging, and policy-threshold source files plus an expected-output manifest that normalizes away generated ids, timestamps, and raw source ids.

Second, the fixture README and replay script define deterministic source-registration behavior.
The replay registers each source, uploads each source file, syncs the finance sources, binds the current policy document after excluding previous active demo policy bindings, compiles the CFO Wiki, and then runs the four shipped monitor routes.

Third, the slice added `pnpm smoke:monitor-demo-replay:local`.
The smoke builds the app in-process like existing local smokes, registers the demo sources, runs the deterministic monitor stack, compares normalized monitor output to the expected-output manifest, and prints a compact JSON replay summary.

Fourth, the supported handoff boundary is included because the demo cash and collections monitors intentionally alert.
The replay calls `POST /missions/monitoring-investigations` for those persisted `cash_posture` and `collections_pressure` alerts, proves repeated create/open is idempotent, and confirms payables and policy/covenant alerts do not create investigations.

Fifth, the slice intentionally keeps replay output non-durable.
The replay command summary is enough for F6F, and no schema, migration, replay table, report artifact, approval, or new artifact kind was added.

Sixth, active docs were refreshed after behavior landed and the replay smoke passed locally.
They now identify FP-0055 as the shipped F6F record and state that F6G or later implementation requires a new Finance Plan.

## Concrete Steps

1. Add demo fixture ownership.
   Shipped files:
   - `packages/testkit/fixtures/f6f-monitor-demo-stack/README.md`
   - `packages/testkit/fixtures/f6f-monitor-demo-stack/sources/bank-cash.csv`
   - `packages/testkit/fixtures/f6f-monitor-demo-stack/sources/receivables-aging.csv`
   - `packages/testkit/fixtures/f6f-monitor-demo-stack/sources/payables-aging.csv`
   - `packages/testkit/fixtures/f6f-monitor-demo-stack/sources/policy-thresholds.md`
   - `packages/testkit/fixtures/f6f-monitor-demo-stack/expected-monitor-results.json`

   The fixture includes source file metadata, intended source kinds, registration order, policy binding instructions, expected monitor status/severity/condition kinds/proof posture, and the expected cash handoff posture for the cash alert.

2. Add a stack-pack manifest without widening old engineering semantics.
   Shipped files:
   - `packages/stack-packs/src/packs/pocket-cfo-monitor-demo.ts`
   - `packages/stack-packs/src/index.ts`
   - narrow stack-pack specs

   The existing `StackPack` type could not truthfully represent finance demo sources, so F6F adds a narrow `PocketCfoDemoStackPack` contract beside it.
   The existing `nextjs-vercel` pack, `@pocket-cto/*` package scope, and GitHub-optional posture remain unchanged.

3. Add the deterministic replay or smoke path.
   Shipped files:
   - `tools/monitor-demo-replay-smoke.mjs`
   - `package.json` script `smoke:monitor-demo-replay:local`
   - narrow adjacent specs for the stack-pack manifest and fixture manifest

   The replay:
   - registers the demo sources from the fixture
   - uploads source files without mutating them
   - syncs bank/cash, receivables, and payables source files through existing Finance Twin sync routes
   - binds and compiles the policy document through existing CFO Wiki routes
   - runs only the shipped monitor routes for `cash_posture`, `collections_pressure`, `payables_pressure`, and `policy_covenant_threshold`
   - creates or opens cash plus collections alert investigations only when those supported demo results are `status = "alert"`
   - compares normalized outputs against expected monitor results
   - asserts no runtime-Codex thread, notification, outbox delivery, report artifact, approval, payment instruction, legal/policy advice, or autonomous finance action is created

4. Preserve monitor semantics.
   The implementation did not change monitor evaluators or monitor result condition kinds.
   No fixture truthfulness defect required an evaluator fix.

5. Refresh active docs after implementation.
   Refreshed docs:
   - `README.md`
   - `START_HERE.md`
   - `docs/ACTIVE_DOCS.md`
   - `plans/ROADMAP.md`
   - `docs/ops/local-dev.md`
   - `docs/ops/source-ingest-and-cfo-wiki.md`
   - `docs/ops/codex-app-server.md`
   - `evals/README.md`
   - `docs/benchmarks/seeded-missions.md`

## Validation and Acceptance

The F6F implementation thread ran the full F6F validation ladder:

- `pnpm --filter @pocket-cto/stack-packs exec vitest run`
- `pnpm --filter @pocket-cto/testkit exec vitest run src/f6f-monitor-demo-fixture.spec.ts`
- `pnpm --filter @pocket-cto/domain exec vitest run src/monitoring.spec.ts src/finance-twin.spec.ts src/proof-bundle.spec.ts`
- `zsh -lc "cd apps/control-plane && pnpm exec vitest run src/modules/monitoring/**/*.spec.ts src/modules/missions/**/*.spec.ts src/modules/sources/**/*.spec.ts src/modules/wiki/**/*.spec.ts src/modules/finance-twin/**/*.spec.ts src/modules/evidence/**/*.spec.ts src/app.spec.ts"`
- `pnpm smoke:cash-posture-monitor:local`
- `pnpm smoke:collections-pressure-monitor:local`
- `pnpm smoke:payables-pressure-monitor:local`
- `pnpm smoke:policy-covenant-threshold-monitor:local`
- `pnpm smoke:cash-posture-alert-investigation:local`
- `pnpm smoke:finance-discovery-supported-families:local`
- `pnpm smoke:monitor-demo-replay:local`
- `pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/twin/workflow-sync.spec.ts src/modules/twin/test-suite-sync.spec.ts src/modules/twin/codeowners-discovery.spec.ts`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm ci:repro:current`

F6F implementation acceptance is observable only if all of the following are true:

- one checked-in demo stack-pack fixture set exists for one demo company
- the fixture includes bank/cash, receivables-aging, payables-aging, and policy threshold source files or docs
- deterministic source-registration instructions exist and preserve raw-source immutability
- one replay command or smoke path can bootstrap the demo company from those source files
- the replay produces or verifies expected monitor outputs for `cash_posture`, `collections_pressure`, `payables_pressure`, and `policy_covenant_threshold`
- the replay includes cash plus collections alert investigation handoffs when those demo results are alerting
- payables and policy/covenant monitor results do not create investigations
- monitor results and alert cards preserve source lineage, freshness or missing-source posture, deterministic severity rationale, limitations, proof posture, and human-review next steps
- no new monitor family, discovery family, alert condition kind, approval kind, report conversion, delivery behavior, runtime-Codex behavior, payment behavior, legal/policy advice, or autonomous remediation is added
- F5 reporting/circulation/release/correction behavior remains unchanged
- shipped F6A, F6B, F6C, F6D, and F6E smokes remain green

## Idempotence and Recovery

The F6F replay must be retry-safe.
It uses a fixed demo company key, deterministic source names, timestamped monitor run tags, normalized output comparisons, current-policy binding hygiene, and shipped cash-handoff idempotency to open existing demo records safely.
Generated ids and timestamps should not be treated as fixture truth.

Raw demo source files must not be rewritten to make replay pass.
If fixture evidence is stale, partial, conflicting, unsupported, or insufficient, the expected outputs must expose that freshness or limitation posture rather than hiding it.

Rollback for the implementation consists of removing the additive fixture, stack-pack manifest, replay command, package script, and doc updates while leaving shipped monitor contracts, monitor results, F6B handoff behavior, F5 reporting behavior, raw source registry semantics, and existing stack packs intact.
No destructive database migration is needed for F6F.

## Artifacts and Notes

This F6F slice produces:

- `plans/FP-0055-monitor-demo-replay-and-stack-pack-foundation.md`
- active-doc updates that identify FP-0055 as the shipped F6F record
- one checked-in demo fixture set
- one finance-native demo stack-pack manifest
- one deterministic replay smoke path
- one normalized expected-output manifest
- one compact replay summary from `pnpm smoke:monitor-demo-replay:local`

Do not create FP-0056 in this slice.
Do not start F6G, F6H, or F6I implementation here.

## Interfaces and Dependencies

Package boundaries remain unchanged:

- `packages/domain` still owns pure finance contracts; F6F did not add domain schemas
- `packages/db` did not change because no persisted demo replay artifact was needed
- `packages/stack-packs` owns the additive finance demo pack interface and manifest
- `packages/testkit` owns the checked-in demo fixture set and fixture spec
- `apps/control-plane/src/modules/sources` owns source registration and raw file ingest
- `apps/control-plane/src/modules/finance-twin` owns source-backed structured finance syncs and reads
- `apps/control-plane/src/modules/wiki` owns policy binding, deterministic extracts, and wiki compile posture
- `apps/control-plane/src/modules/monitoring` owns monitor run/latest behavior
- `apps/control-plane/src/modules/missions` owns the shipped monitoring investigation handoff boundary
- `apps/web` is not required for the first replay proof

Runtime-Codex stays out of scope:

- no runtime-Codex drafting
- no runtime-Codex monitoring findings
- no runtime-Codex investigation writeups
- no natural-language autonomous monitoring
- no runtime-owned finance facts

Delivery and autonomous action stay out of scope:

- no email
- no Slack
- no webhooks
- no notifications
- no send, distribute, publish, pay, book, file, release, tax filing, legal advice, policy advice, payment instruction, vendor-payment recommendation, or external action

Current module vocabulary stays stable.
Do not rename `modules/twin/**`, `modules/reporting/**`, or `@pocket-cto/*`.
Do not delete GitHub or engineering-twin modules as part of F6F.
No new environment variables are expected.

## Outcomes & Retrospective

This slice shipped the first real F6F implementation: one source-backed monitor demo fixture, one finance-native demo stack-pack manifest, one deterministic replay smoke, normalized expected-output comparison for the four shipped monitor families, and the then-shipped cash handoff proof.
After shipped F6G, the replay proof is aligned to expect cash plus collections handoffs while preserving payables and policy/covenant investigation rejection.
F6F did not add schema, routes, monitor families, discovery families, runtime-Codex, delivery, reports, approvals, payment behavior, legal advice, policy advice, or autonomous remediation.
The full implementation validation ladder passed on 2026-04-27, including the new fixture and stack-pack specs, shipped F6 monitor smokes, finance-discovery supported families smoke, `pnpm smoke:monitor-demo-replay:local`, twin guardrail specs, lint, typecheck, test, and `pnpm ci:repro:current`.

FP-0056 is now the shipped F6G record.
The exact next recommendation is to start F6H planning only if there is a concrete next operator need, and only by creating a new Finance Plan.
No F6H or later implementation started in FP-0055.
