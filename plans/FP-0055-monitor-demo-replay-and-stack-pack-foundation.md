# Define F6F monitor demo replay and stack-pack foundation

## Purpose / Big Picture

This file is the active Finance Plan for the next Pocket CFO F6 slice.
The target phase is `F6`, and the first real scope is exactly `F6F-monitor-demo-replay-and-stack-pack-foundation`.

The user-visible goal is narrow: after shipped F6A through F6E, a new operator should be able to bootstrap one demo company from checked-in source files and docs, then replay the shipped source-backed monitoring stack deterministically.
The demo should prove the existing operating loop:

- source files become registered immutable evidence
- Finance Twin and CFO Wiki state are refreshed deterministically
- the four shipped monitor families run from stored state
- the shipped cash-only alert-to-investigation handoff can be demonstrated when the demo cash monitor produces an alert

F6F is not a new monitor family.
It must not add `spend_posture`, `obligation_calendar_review`, a new policy monitor, `covenant_risk`, or any new discovery family.
It must not change shipped monitor result semantics, alert condition kinds, F6B investigation behavior, F5 reporting/approval/release/circulation behavior, or runtime-Codex posture.

This docs-and-plan slice creates the implementation-ready contract only.
It does not add code, routes, schema, migrations, package scripts, smoke commands, eval datasets, fixtures, or implementation scaffolding.
FP-0050 remains the shipped F6A record, FP-0051 remains the shipped F6B record, FP-0052 remains the shipped F6C record, FP-0053 remains the shipped F6D record, and FP-0054 remains the shipped F6E record.
GitHub connector work is explicitly out of scope.

## Progress

- [x] 2026-04-27T21:37:35Z Invoke the requested Pocket CFO operator plugin guards, run preflight, confirm the branch and services, and read the required active docs, shipped F6 records, ops docs, package scripts, monitor smokes, and stack-pack boundary.
- [x] 2026-04-27T21:37:35Z Create FP-0055 as the single active implementation-ready F6F contract while preserving FP-0050 through FP-0054 as shipped F6A through F6E records.
- [x] 2026-04-27T21:37:35Z Refresh the active-doc spine so the next thread starts the narrow F6F demo replay and stack-pack implementation rather than re-planning F6F or widening into F6G or later work.
- [x] 2026-04-27T21:44:38Z Run the docs-and-plan validation ladder through `pnpm ci:repro:current`; all required commands passed.

## Surprises & Discoveries

The shipped F6 monitor proof surface is already strong enough to compose one demo replay.
The repo has packaged local proofs for `cash_posture`, `collections_pressure`, `payables_pressure`, `policy_covenant_threshold`, and the cash-only alert-to-investigation handoff.
F6F should orchestrate and document that shipped baseline rather than changing monitor evaluators.

The current `packages/stack-packs` package is still engineering-shaped.
It contains a `nextjs-vercel` pack with repo, CI, and mission-type vocabulary.
The F6F implementation should not force finance demo semantics into that old shape if it becomes misleading.
Prefer a narrow additive finance demo stack-pack contract beside the existing interface, or a manifest that clearly says it is a Pocket CFO demo fixture pack, while keeping `@pocket-cto/*` package scope unchanged.

The shipped monitor-result replay posture is not the same thing as mission replay.
Current monitor results record their own replay posture, and F6B creates mission replay only for the manual cash-alert investigation handoff.
F6F should not invent new mission replay events just to make a demo look active.

There is no checked-in F6F contract before this file.
Existing active docs correctly say FP-0054/F6E is shipped and that F6F should start only as a new Finance Plan.

## Decision Log

Decision: the first real F6F scope is `F6F-monitor-demo-replay-and-stack-pack-foundation`.
Rationale: the next useful proof is demo bootstrap and deterministic replay of shipped monitoring, not another monitor family.

Decision: F6F is not a new monitor family.
Rationale: shipped monitor families remain exactly `cash_posture`, `collections_pressure`, `payables_pressure`, and `policy_covenant_threshold`.
No `spend_posture`, `obligation_calendar_review`, new policy monitor, or new discovery family belongs in F6F.

Decision: the F6F input contract is one checked-in demo stack-pack fixture set.
Rationale: a new user needs source files and docs that can be registered deterministically, not chat memory or ad hoc local setup.
The fixture set must include source files for bank/cash, receivables aging, payables aging, and policy threshold docs, plus deterministic source-registration instructions.

Decision: the F6F expected-output contract covers only shipped monitor behavior.
Rationale: expected outputs must be recorded for `cash_posture`, `collections_pressure`, `payables_pressure`, and `policy_covenant_threshold`, plus one `cash_posture` alert-to-investigation handoff when the demo cash posture is intentionally alerting.
Non-cash investigation handoffs remain out of scope.

Decision: the first demo replay should prefer one deterministic command or smoke path.
Rationale: the smallest useful operator proof is a command such as a future `pnpm smoke:monitor-demo-replay:local` that registers the demo sources, runs the shipped stack, compares normalized outputs, and reports what was proven.
This docs-only slice does not add that script.

Decision: persistent demo replay output is optional and must be justified.
Rationale: a deterministic JSON summary may be enough for the first implementation.
If the implementation needs a persisted evidence or demo replay artifact, it should reuse an existing evidence/artifact seam where truthful and record why persistence is needed rather than adding a new table by default.

Decision: F6F remains deterministic, runtime-free, delivery-free, and non-autonomous.
Rationale: demo replay does not need runtime-Codex, email, Slack, webhooks, notification delivery, bank/accounting/tax/legal writes, payment instructions, policy/legal advice, LLM-generated advice, or autonomous remediation.

Decision: F6F preserves shipped F5 and F6 behavior.
Rationale: no F5 reporting approval/release/circulation/correction changes, no F6B mission behavior changes, no monitor evaluator changes, no new approval kind, and no report conversion belong in this foundation unless a narrow replay-fixture truthfulness defect is found and documented before fixing it.

Decision: later F6 slices are named but not created here.
Rationale: likely later slices are `F6G-non-cash-alert-to-investigation-generalization` only if a concrete operator need is proven, `F6H-close-control-checklist-foundation` only if source-backed and explicitly scoped, and `F6I-stack-pack-expansion` only after the first demo pack is green.
Do not create FP-0056 or any later plan in this slice.

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

Relevant implementation seams for the next thread are:

- `packages/testkit` for checked-in fixture files and reusable test helpers if the implementation needs fixture ownership
- `packages/stack-packs` for an additive demo stack-pack manifest or finance-demo pack contract
- `packages/domain/src/monitoring.ts` for shipped monitor result, alert-card, source-lineage, proof, and runtime-boundary contracts
- `apps/control-plane/src/modules/sources/**` for immutable source registration and file upload behavior
- `apps/control-plane/src/modules/finance-twin/**` for deterministic source sync and stored Finance Twin reads
- `apps/control-plane/src/modules/wiki/**` for policy-document binding, deterministic extracts, policy pages, and compile posture
- `apps/control-plane/src/modules/monitoring/**` for run/latest monitor services
- `apps/control-plane/src/modules/missions/**` for the shipped cash-only monitoring investigation handoff
- the existing monitor smoke scripts in `tools/` for proven source registration, sync, monitor, and boundary-assertion patterns

No GitHub connector work is in scope.
No new environment variables are expected.
No runtime-Codex behavior is expected.

## Plan of Work

First, add a checked-in demo stack-pack fixture set.
The fixture should represent one demo company and include bank/cash, receivables-aging, payables-aging, and policy-threshold source files.
Raw fixture files should be immutable test/demo inputs.
Expected outputs should live beside the fixture or in a clearly named expected-output manifest and should normalize generated ids and timestamps.

Second, add deterministic source-registration instructions for the demo company.
The instructions should explain how the replay command registers each source, uploads each source file, syncs the finance sources, binds the policy document, compiles the CFO Wiki, and then runs the four shipped monitor routes.
The instructions should make freshness posture explicit rather than relying on hidden local time assumptions.

Third, add one deterministic replay command or smoke path in the implementation thread.
The preferred future command is `pnpm smoke:monitor-demo-replay:local`.
It should build the app in-process like existing local smokes, register the demo sources, run the deterministic monitor stack, compare normalized monitor output to the expected-output manifest, and print a compact demo replay summary.

Fourth, include the shipped cash-only handoff when applicable.
The first demo should intentionally make the cash monitor alert if the handoff is part of the acceptance proof.
Then the replay should call `POST /missions/monitoring-investigations` exactly once for that persisted `cash_posture` alert and prove repeated create/open is idempotent.
It must not create investigations for collections, payables, or policy/covenant alerts.

Fifth, decide whether a durable demo replay artifact is necessary.
The default is a deterministic summary from the replay command.
If a persisted artifact is added, it must use a truthful existing evidence or artifact seam where possible, carry provenance and limitations, and not become a new monitor-result semantic or a new reporting artifact.

Sixth, refresh docs only after behavior actually ships.
The implementation thread should update active docs to describe the shipped demo pack and command only after the command, fixture, and validation are green.

## Concrete Steps

1. Add demo fixture ownership.
   Expected future files:
   - `packages/testkit/fixtures/f6f-monitor-demo-stack/README.md`
   - `packages/testkit/fixtures/f6f-monitor-demo-stack/sources/bank-cash.csv`
   - `packages/testkit/fixtures/f6f-monitor-demo-stack/sources/receivables-aging.csv`
   - `packages/testkit/fixtures/f6f-monitor-demo-stack/sources/payables-aging.csv`
   - `packages/testkit/fixtures/f6f-monitor-demo-stack/sources/policy-thresholds.md`
   - `packages/testkit/fixtures/f6f-monitor-demo-stack/expected-monitor-results.json`

   The fixture must include source file metadata, intended source kinds, registration order, policy binding instructions, expected monitor status/severity/condition kinds/proof posture, and the expected cash handoff posture if the cash alert is enabled.

2. Add a stack-pack manifest without widening old engineering semantics.
   Expected future files:
   - `packages/stack-packs/src/packs/pocket-cfo-monitor-demo.ts`
   - `packages/stack-packs/src/index.ts`
   - narrow stack-pack specs

   If the existing `StackPack` type cannot truthfully represent finance demo sources, add a narrow finance demo pack contract beside it.
   Do not delete the existing `nextjs-vercel` pack, rename `@pocket-cto/*`, or make GitHub a required source of truth.

3. Add the deterministic replay or smoke path.
   Expected future files:
   - `tools/monitor-demo-replay-smoke.mjs`
   - `package.json` script `smoke:monitor-demo-replay:local`
   - narrow adjacent specs if reusable helpers are introduced

   The replay should:
   - register the demo sources from the fixture
   - upload source files without mutating them
   - sync bank/cash, receivables, and payables source files through existing Finance Twin sync routes
   - bind and compile the policy document through existing CFO Wiki routes
   - run only the shipped monitor routes for `cash_posture`, `collections_pressure`, `payables_pressure`, and `policy_covenant_threshold`
   - create or open one cash alert investigation only when the cash result is `status = "alert"`
   - compare normalized outputs against expected monitor results
   - assert no runtime-Codex thread, notification, outbox delivery, report artifact, approval, payment instruction, legal/policy advice, or autonomous finance action is created

4. Preserve monitor semantics.
   The implementation must not change monitor evaluators unless the demo fixture reveals a narrow truthfulness defect in source-backed replay behavior.
   If that happens, record the defect and correction in this plan before changing evaluator logic, and rerun all shipped F6 monitor smokes.

5. Refresh active docs after implementation.
   Expected docs if behavior ships:
   - `README.md`
   - `START_HERE.md`
   - `docs/ACTIVE_DOCS.md`
   - `plans/ROADMAP.md`
   - `docs/ops/local-dev.md`
   - `docs/ops/source-ingest-and-cfo-wiki.md`
   - `docs/ops/codex-app-server.md`
   - `evals/README.md` only if eval guidance changes
   - `docs/benchmarks/seeded-missions.md` only if benchmark guidance changes

## Validation and Acceptance

This docs-and-plan thread must run:

- `pnpm smoke:source-ingest:local`
- `pnpm smoke:cash-posture-monitor:local`
- `pnpm smoke:collections-pressure-monitor:local`
- `pnpm smoke:payables-pressure-monitor:local`
- `pnpm smoke:policy-covenant-threshold-monitor:local`
- `pnpm smoke:cash-posture-alert-investigation:local`
- `pnpm smoke:finance-discovery-supported-families:local`
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
- the replay includes exactly one cash-alert investigation handoff when the demo `cash_posture` result is alerting
- non-cash monitor results do not create investigations
- monitor results and alert cards preserve source lineage, freshness or missing-source posture, deterministic severity rationale, limitations, proof posture, and human-review next steps
- no new monitor family, discovery family, alert condition kind, approval kind, report conversion, delivery behavior, runtime-Codex behavior, payment behavior, legal/policy advice, or autonomous remediation is added
- F5 reporting/circulation/release/correction behavior remains unchanged
- shipped F6A, F6B, F6C, F6D, and F6E smokes remain green

## Idempotence and Recovery

The F6F replay must be retry-safe.
It should either use deterministic run keys and open existing demo records safely, or use a clearly tagged isolated company key per run while comparing normalized output fields.
Generated ids and timestamps should not be treated as fixture truth.

Raw demo source files must not be rewritten to make replay pass.
If fixture evidence is stale, partial, conflicting, unsupported, or insufficient, the expected outputs should expose that freshness or limitation posture rather than hiding it.

Rollback for the implementation should consist of removing the additive fixture, stack-pack manifest, replay command, package script, and doc updates while leaving shipped monitor contracts, monitor results, F6B handoff behavior, F5 reporting behavior, raw source registry semantics, and existing stack packs intact.
No destructive database migration should be needed for F6F.

## Artifacts and Notes

This docs-and-plan slice produces:

- `plans/FP-0055-monitor-demo-replay-and-stack-pack-foundation.md`
- active-doc updates that identify FP-0055 as the next active F6F contract

The implementation slice should produce:

- one checked-in demo fixture set
- one stack-pack or finance-demo-pack manifest
- one deterministic replay command or smoke path
- one normalized expected-output manifest
- one compact replay summary, and a persisted evidence/demo replay artifact only if the implementation records why persistence is needed

Do not create FP-0056 in this slice.
Do not start F6G, F6H, or F6I implementation here.

## Interfaces and Dependencies

Package boundaries must remain unchanged:

- `packages/domain` owns pure contracts only if the implementation needs a narrow demo pack or replay summary schema
- `packages/db` should not change unless a persisted demo artifact is explicitly justified before implementation
- `packages/stack-packs` owns pack interfaces and manifests
- `packages/testkit` owns reusable fixtures and helpers
- `apps/control-plane/src/modules/sources` owns source registration and raw file ingest
- `apps/control-plane/src/modules/finance-twin` owns source-backed structured finance syncs and reads
- `apps/control-plane/src/modules/wiki` owns policy binding, deterministic extracts, and wiki compile posture
- `apps/control-plane/src/modules/monitoring` owns monitor run/latest behavior
- `apps/control-plane/src/modules/missions` owns the shipped cash-only investigation handoff
- `apps/web` should not be required for the first replay proof unless the implementation explicitly chooses to expose an operator read model after the command is green

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

This docs-and-plan slice creates the active F6F implementation-ready contract and refreshes the active guidance layer.
Implementation is still pending.
The docs-and-plan validation ladder passed on 2026-04-27, including shipped F6 monitor smokes, the cash alert-to-investigation smoke, finance-discovery supported families smoke, twin guardrail specs, lint, typecheck, test, and `pnpm ci:repro:current`.

The exact next recommendation is to start `F6F-monitor-demo-replay-and-stack-pack-foundation` next from this plan, and to implement only the demo fixture, stack-pack manifest, deterministic replay command, expected-output comparison, and cash-only handoff proof described here.
F6G, F6H, and F6I should remain unstarted until FP-0055 is green and a later named Finance Plan justifies the next slice.
