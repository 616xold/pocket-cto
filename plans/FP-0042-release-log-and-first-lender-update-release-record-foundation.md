# Define F5C4B release log and first lender update release record foundation

## Purpose / Big Picture

This plan is the active F5 implementation contract produced by the docs-only F5C4B master-plan and active-doc refresh slice.
The target phase is `F5`, and the first execution slice is `F5C4B-release-log-and-first-lender-update-release-record-foundation`.
The user-visible goal is narrow and concrete: after the shipped F5C4A path already lets an operator request and resolve one finance-facing `report_release` approval for one completed `lender_update` reporting mission, Pocket CFO should next let an operator record that the already-approved lender update was actually released outside the system, surface one explicit release record plus one release-logged posture, and keep that state durable and replayable without widening into actual send, distribute, publish, runtime-codex drafting, or broader packet-approval rollout.

This matters now because the repo already ships draft specialization plus release-readiness.
What it still does not ship is a durable first-class release record.
The current reporting contract still has no `releaseLogged`, `releasedAt`, or `releasedBy` posture, no dedicated release-record view, and no mission-centric route to record external release after approval.
The next gain is therefore not more approval variety.
It is one narrow release-log foundation on top of the existing `report_release` approval and `lender_update` reporting path.

GitHub connector work is explicitly out of scope.
This plan does not authorize actual send, distribute, publish, or delivery automation, board-packet or diligence-packet approval widening, PDF export, slide export, Marp export, runtime-codex drafting, or any rename from `modules/reporting/**` to `modules/reports/**`.

## Progress

- [x] 2026-04-20T21:55:36Z Audit the active docs, shipped F5A through F5C4A plan chain, approval and reporting contracts, proof-bundle shaping, and current release-readiness truth before choosing the narrow F5C4B successor contract.
- [x] 2026-04-20T21:55:36Z Create `plans/FP-0042-release-log-and-first-lender-update-release-record-foundation.md` and refresh the smallest truthful active-doc set so `plans/FP-0041-approval-review-and-first-lender-update-release-readiness.md` remains the shipped F5C4A record while this file becomes the single active F5C4B implementation contract.
- [x] 2026-04-20T22:07:35Z Run the preserved source-ingest through lender-update-release-approval confidence ladder, targeted twin regressions, repo-wide validation, and `pnpm ci:repro:current` for this docs-only handoff without starting F5C4B code.

## Surprises & Discoveries

- Observation: the current repo already ships the exact F5C4A approval substrate the next slice should build on, including `report_release`, lender-update-only release-readiness, and a packaged local proof.
  Evidence: `packages/domain/src/approval.ts`, `packages/domain/src/reporting-mission.ts`, `apps/control-plane/src/modules/approvals/service.ts`, `apps/control-plane/src/modules/reporting/release-readiness.ts`, and `tools/lender-update-release-approval-smoke.mjs`.

- Observation: the main F5C4 gap is no longer review-state persistence; it is release recording after approval.
  Evidence: `packages/domain/src/reporting-mission.ts` already models `releaseReadiness`, but it still exposes no release-record view and no `releaseLogged`, `releasedAt`, or `releasedBy` fields anywhere in the reporting or proof-bundle contract.

- Observation: the existing approval payload plus reporting read-model seam is already wide enough for a first release-record foundation.
  Evidence: `packages/domain/src/approval.ts` already stores `report_release` payload in JSON-backed approval rows, `apps/control-plane/src/modules/approvals/service.ts` already updates those rows transactionally, and `apps/control-plane/src/modules/reporting/artifact.ts` plus `apps/control-plane/src/modules/evidence/proof-bundle-summary.ts` already derive reporting views from stored approval and artifact state.

- Observation: the stale truth in this slice lives mostly in the active docs and successor-plan wording rather than in missing approval or reporting architecture.
  Evidence: `README.md`, `START_HERE.md`, `docs/ACTIVE_DOCS.md`, `plans/ROADMAP.md`, `docs/ops/local-dev.md`, `docs/ops/source-ingest-and-cfo-wiki.md`, `docs/ops/codex-app-server.md`, `evals/README.md`, `docs/benchmarks/seeded-missions.md`, and `plans/FP-0041-approval-review-and-first-lender-update-release-readiness.md` still pointed the next thread at F5C4A even though that slice is already shipped.

## Decision Log

- Decision: the first real F5C4B scope is `F5C4B-release-log-and-first-lender-update-release-record-foundation`.
  Rationale: the repo needs one implementation-ready release-record contract, not a blended release-log plus broader packet-approval program.

- Decision: the first artifact family in F5C4B remains exactly `lender_update`.
  Rationale: the narrowest truthful next step is the same lender-facing draft family that already ships review and release-readiness.

- Decision: F5C4B must start only from one completed `reporting` mission with `reportKind = "lender_update"`, one stored `lender_update` artifact, and derived release-readiness already at `approved_for_release`.
  Rationale: the first release-log slice should consume one stored approved draft, not generic chat intake, not `finance_memo` directly, not `board_packet`, and not `diligence_packet`.

- Decision: F5C4B keeps `mission.type = "reporting"` and `reportKind = "lender_update"`.
  Rationale: reporting is already the first-class umbrella with the correct mission, replay, artifact, and proof semantics, so a second top-level mission family would widen the product boundary unnecessarily.

- Decision: F5C4B adds release logging and release recording only.
  Rationale: the first follow-on slice after F5C4A should record that external release happened, not add more approval kinds, not reopen review posture, and not claim delivery automation exists.

- Decision: the preferred persistence anchor is the existing `report_release` approval payload plus derived reporting and proof views, not a second release-tracking subsystem.
  Rationale: the current approvals table, repository, and replay seams are already durable and transaction-safe, while the repo does not yet need a second release-specific table or bounded context for one narrow lender-update slice.

- Decision: the first F5C4B contract should add one explicit release-record view with `releaseLogged`, `releasedAt`, `releasedBy`, minimal `releaseChannel` metadata, the backing approval id, and a human-readable summary.
  Rationale: the repo needs one first-class release-record surface that stays separate from draft posture, proof readiness, and finance-memo publication posture.

- Decision: the first mission-centric route should be `POST /missions/:missionId/reporting/release-record`.
  Rationale: the next operator action is to record release on one already-approved draft, so a singular mission-scoped route is the narrowest truthful control-plane seam.

- Decision: the first F5C4B slice should append one additive `approval.release_logged` replay event when the first release record is persisted.
  Rationale: recording external release changes mission-facing posture and therefore needs replay coverage, but it should stay anchored to the existing approval seam rather than creating a second release-event family unless a concrete gap appears.

- Decision: the first F5C4B slice stays deterministic, runtime-free, and delivery-free in the system sense.
  Rationale: Pocket CFO may record that release happened externally, but it must not actually send, distribute, or publish anything in this slice.

- Decision: the first F5C4B slice allows exactly one release record per completed lender-update mission and treats duplicate retries as idempotent reads of the existing record rather than silent overwrites.
  Rationale: the narrowest safe first release-record foundation is additive and immutable-by-default; edit or correction workflows can wait for a later explicit slice if they are needed.

- Decision: the later slice map after F5C4B is `F5C4C-broader-packet-approval-widening`, and only after that should bounded runtime-codex phrasing or formatting assistance be reconsidered if it still solves a proven operator problem.
  Rationale: external-communication posture should harden in layers: first review and release-readiness, then lender-update release logging, then broader packet widening, then optional bounded runtime assistance.

- Decision: preserve the current `modules/reporting/**` vocabulary and do not reintroduce a `modules/reports/**` rename wave.
  Rationale: the shipped F5A through F5C4A code already standardized on first-class `reporting` seams, and a rename would add noise before the first release-record contract exists.

## Context and Orientation

Pocket CFO has already shipped F4A through F4C2, with `plans/FP-0035-finance-policy-lookup-and-discovery-quality-hardening.md` as the shipped final F4 record.
Pocket CFO has also already shipped the first six F5 slices:

- `plans/FP-0036-reporting-mission-foundation-and-first-finance-memo.md` as the shipped F5A reporting-foundation record
- `plans/FP-0037-draft-report-body-filed-artifact-and-markdown-export-hardening.md` as the shipped F5B reporting-reuse record
- `plans/FP-0038-board-packet-specialization-and-draft-review-foundation.md` as the shipped F5C1 board-packet record
- `plans/FP-0039-lender-update-specialization-and-draft-review-foundation.md` as the shipped F5C2 lender-update record
- `plans/FP-0040-diligence-packet-specialization-and-draft-review-foundation.md` as the shipped F5C3 diligence-packet record
- `plans/FP-0041-approval-review-and-first-lender-update-release-readiness.md` as the shipped F5C4A lender-update approval and release-readiness record

That shipped baseline now truthfully means all of the following are already in repo reality:

- `mission.type = "reporting"` and `sourceKind = "manual_reporting"`
- one deterministic `POST /missions/reporting` path from completed discovery work
- one draft `finance_memo`
- one linked `evidence_appendix`
- stored `bodyMarkdown` on both report artifacts
- mission-centric filing and markdown export reuse over the existing CFO Wiki seams for the finance-memo path
- one deterministic `POST /missions/reporting/board-packets` path from completed reporting work
- one draft `board_packet`
- one deterministic `POST /missions/reporting/lender-updates` path from completed reporting work
- one draft `lender_update`
- one deterministic `POST /missions/reporting/diligence-packets` path from completed reporting work
- one draft `diligence_packet`
- one persisted `report_release` approval path for a completed `lender_update` reporting mission
- one derived release-readiness posture of `not_requested`, `pending_review`, `approved_for_release`, or `not_approved_for_release`

The repo still does not have any truthful first-class release-record path after approval.
There is no mission-centric release-record route, no dedicated release-record view, no `releaseLogged` posture, and no `releasedAt` or `releasedBy` state in the current reporting or proof-bundle contracts.
The next implementation thread must therefore extend the existing `report_release` seam into one narrow lender-update release-record foundation without claiming delivery automation exists.

The active-doc boundary for this handoff is:

- `README.md`
- `START_HERE.md`
- `docs/ACTIVE_DOCS.md`
- `PLANS.md`
- `plans/ROADMAP.md`
- `plans/FP-0035-finance-policy-lookup-and-discovery-quality-hardening.md`
- `plans/FP-0036-reporting-mission-foundation-and-first-finance-memo.md`
- `plans/FP-0037-draft-report-body-filed-artifact-and-markdown-export-hardening.md`
- `plans/FP-0038-board-packet-specialization-and-draft-review-foundation.md`
- `plans/FP-0039-lender-update-specialization-and-draft-review-foundation.md`
- `plans/FP-0040-diligence-packet-specialization-and-draft-review-foundation.md`
- `plans/FP-0041-approval-review-and-first-lender-update-release-readiness.md`
- this active F5C4B contract, `plans/FP-0042-release-log-and-first-lender-update-release-record-foundation.md`
- `docs/ops/local-dev.md`
- `docs/ops/source-ingest-and-cfo-wiki.md`
- `docs/ops/codex-app-server.md`
- `docs/benchmarks/seeded-missions.md`
- `evals/README.md`

GitHub connector work is out of scope.
The internal `@pocket-cto/*` package scope remains unchanged.
This handoff slice is docs-only and must not add runtime code, routes, schema changes, migrations, package scripts, smoke commands, eval datasets, or implementation scaffolding.

The most relevant implementation seams for the future F5C4B code thread are:

- `packages/domain/src/approval.ts`
- `packages/domain/src/reporting-mission.ts`
- `packages/domain/src/proof-bundle.ts`
- `packages/domain/src/mission-detail.ts`
- `packages/domain/src/mission-list.ts`
- `packages/domain/src/index.ts`
- `apps/control-plane/src/modules/approvals/**`
- `apps/control-plane/src/modules/missions/routes.ts`
- `apps/control-plane/src/modules/missions/service.ts`
- `apps/control-plane/src/modules/reporting/service.ts`
- `apps/control-plane/src/modules/reporting/release-readiness.ts`
- `apps/control-plane/src/modules/reporting/artifact.ts`
- `apps/control-plane/src/modules/evidence/proof-bundle-assembly.ts`
- `apps/control-plane/src/modules/evidence/proof-bundle-summary.ts`
- `apps/web/components/approval-card-list.tsx`
- `apps/web/components/reporting-output-card.tsx`
- `apps/web/components/mission-card.tsx`
- `apps/web/components/mission-list-card.tsx`
- `apps/web/app/missions/[missionId]/**`
- `apps/web/lib/api.ts`
- `tools/lender-update-release-approval-smoke.mjs` as the shipped baseline proof to preserve when the next thread adds release-record coverage

## Plan of Work

F5C4B should now proceed in one narrow release-record step and one explicit later-only boundary.

First, the next code thread should extend the existing `report_release` approval seam rather than inventing a new mission family or a separate release-tracking subsystem.
The new operator path should start only from one completed `reporting` mission with `reportKind = "lender_update"`, one stored `lender_update` artifact, and release-readiness already at `approved_for_release`.
That means F5C4B should widen the typed contracts to include one explicit release-record view and one mission-centric release-record input, while keeping the existing approval trace and release-readiness view intact.

Second, the control plane should persist one release record as a durable extension of the existing approved `report_release` approval wherever possible.
The critical distinction is behavioral rather than infrastructural: recording release is not a second approval, not a runtime continuation, and not an actual send.
It is an operator-entered statement that an already-approved lender update was released externally at a specific time through a minimal channel description.
The control-plane read models should then surface both the approval trace and the release record across reporting detail, mission detail, mission list, proof bundle, and approval-card copy without collapsing them into one status string.

Third, leave broader widening explicitly deferred.
After F5C4B lands, the next thread should implement `F5C4C-broader-packet-approval-widening`.
Only after that later review posture exists should the repo reconsider bounded runtime-codex phrasing or formatting assistance for report packets.

## Concrete Steps

1. Widen the pure approval and reporting contracts without adding a new mission family or a second release subsystem.
   Update:
   - `packages/domain/src/approval.ts`
   - `packages/domain/src/reporting-mission.ts`
   - `packages/domain/src/proof-bundle.ts`
   - `packages/domain/src/mission-detail.ts`
   - `packages/domain/src/mission-list.ts`
   - `packages/domain/src/index.ts`

   F5C4B should:
   - add one typed release-record input contract with `releasedAt`, `releasedBy`, one minimal `releaseChannel`, and one optional short channel-detail field
   - add one typed `ReportingReleaseRecordView` with `releaseLogged`, `releasedAt`, `releasedBy`, `releaseChannel`, optional detail, the backing approval id, and a summary
   - keep the existing `releaseReadiness` view separate from the new release-record view
   - prefer extending the JSON-backed `report_release` approval payload with one additive `releaseRecord` object instead of starting with a new table, enum, or mission family
   - keep `mission.type = "reporting"` and `reportKind = "lender_update"` unchanged

2. Retarget the approvals plus reporting bounded contexts for one release-record foundation on top of the existing approved lender-update path.
   Update:
   - `apps/control-plane/src/modules/approvals/service.ts`
   - `apps/control-plane/src/modules/approvals/payload.ts`
   - `apps/control-plane/src/modules/approvals/schema.ts`
   - `apps/control-plane/src/modules/missions/routes.ts`
   - `apps/control-plane/src/modules/missions/service.ts`
   - `apps/control-plane/src/modules/reporting/service.ts`
   - add one small helper such as `apps/control-plane/src/modules/missions/release-record.ts` or `apps/control-plane/src/modules/reporting/release-record.ts` only if it keeps service logic legible

   F5C4B should:
   - add one thin operator route at `POST /missions/:missionId/reporting/release-record`
   - require one completed `reporting` mission
   - require `reportKind = "lender_update"`
   - require one stored `lender_update` artifact
   - require the derived release-readiness posture to already be `approved_for_release`
   - persist one release record against the latest approved `report_release` approval instead of inventing a second release store
   - reject `finance_memo`, `board_packet`, `diligence_packet`, incomplete reporting missions, non-approved lender updates, and missing lender-update artifacts
   - treat duplicate retries as idempotent reads of the existing release record and avoid silent overwrites
   - append one additive `approval.release_logged` replay event only when the first release record is actually created

3. Extend proof-bundle shaping and mission read models for release-record posture, not delivery automation.
   Update:
   - `apps/control-plane/src/modules/evidence/proof-bundle-assembly.ts`
   - `apps/control-plane/src/modules/evidence/proof-bundle-summary.ts`
   - `apps/control-plane/src/modules/missions/detail-view.ts`
   - `apps/control-plane/src/modules/reporting/artifact.ts`
   - `apps/control-plane/src/modules/reporting/service.ts`
   - `apps/control-plane/src/modules/reporting/release-readiness.ts`

   F5C4B should:
   - keep proof-bundle readiness tied to stored report artifacts rather than release logging
   - carry the release-record view and any additive release-logged summary into proof bundle, reporting view, mission detail, and mission list read models
   - keep freshness, limitations, provenance, and reviewer trace explicit after release is logged
   - keep finance-memo publication posture, lender-update release-readiness, and lender-update release-record posture as distinct concepts rather than collapsing them into one status field
   - avoid delivery receipts, send timestamps beyond operator-entered `releasedAt`, and any transport automation

4. Add the narrowest truthful operator path for recording external release.
   Update:
   - `apps/web/components/approval-card-list.tsx`
   - `apps/web/components/reporting-output-card.tsx`
   - `apps/web/components/mission-card.tsx`
   - `apps/web/components/mission-list-card.tsx`
   - `apps/web/app/missions/[missionId]/page.tsx`
   - `apps/web/app/missions/[missionId]/actions.ts`
   - `apps/web/app/missions/[missionId]/mission-actions.tsx`
   - `apps/web/lib/api.ts`

   The first operator path should:
   - start from a completed `lender_update` reporting mission that is already `approved_for_release`
   - let the operator record one external release with `releasedAt`, `releasedBy`, and minimal channel metadata only
   - render both the prior approval trace and the new release-record posture with report-aware copy
   - make it obvious that release was logged externally rather than sent by Pocket CFO
   - avoid send buttons, distribution actions, packet-widening controls, PDF export, slide export, or runtime-codex drafting controls

5. Add the narrowest local proof for the first lender-update release-record slice.
   Update:
   - add `tools/lender-update-release-record-smoke.mjs`
   - `package.json`
   - `docs/ops/local-dev.md` only if the new packaged smoke command lands in code

   F5C4B should:
   - preserve the shipped `pnpm smoke:lender-update-release-approval:local` baseline
   - add one packaged `pnpm smoke:lender-update-release-record:local` command
   - prove one completed approved lender-update mission can record one external release and surface that release record across mission detail, mission list, proof bundle, and approval cards
   - avoid new eval datasets in the first implementation pass

6. Keep explicit non-goals in code comments, UI copy, tests, and docs where needed.
   F5C4B must not:
   - reopen F5A reporting foundation work
   - reopen F5B finance-memo filing or export reuse work
   - reopen F5C1 board-packet specialization
   - reopen F5C2 lender-update draft specialization
   - reopen F5C3 diligence-packet draft specialization
   - reopen F5C4A approval-request or release-readiness design
   - add actual send, distribute, publish, or delivery automation
   - widen approval or release-record behavior to `board_packet` or `diligence_packet`
   - add bounded runtime-codex drafting or delivery behavior
   - add PDF, slide, or Marp export
   - rename `modules/reporting/**`

## Validation and Acceptance

The next F5C4B implementation thread should preserve the current confidence ladder and add only the narrowest release-record coverage on top of it.

Targeted test batches:

- `pnpm --filter @pocket-cto/domain exec vitest run src/approval.spec.ts src/reporting-mission.spec.ts src/proof-bundle.spec.ts src/mission-detail.spec.ts src/mission-list.spec.ts`
- `zsh -lc "cd apps/control-plane && pnpm exec vitest run src/modules/approvals/service.spec.ts src/modules/missions/service.spec.ts src/modules/missions/routes.spec.ts src/modules/reporting/service.spec.ts src/modules/evidence/proof-bundle-assembly.spec.ts"`
- `zsh -lc "cd apps/web && pnpm exec vitest run \"components/approval-card-list.spec.tsx\" \"components/reporting-output-card.spec.tsx\" \"components/mission-card.spec.tsx\" \"components/mission-list-card.spec.tsx\" \"app/missions/[missionId]/actions.spec.ts\""`

Preserved finance proof ladder:

- `pnpm smoke:source-ingest:local`
- `pnpm smoke:finance-twin:local`
- `pnpm smoke:finance-twin-account-catalog:local`
- `pnpm smoke:finance-twin-general-ledger:local`
- `pnpm smoke:finance-twin-snapshot:local`
- `pnpm smoke:finance-twin-reconciliation:local`
- `pnpm smoke:finance-twin-period-context:local`
- `pnpm smoke:finance-twin-account-bridge:local`
- `pnpm smoke:finance-twin-balance-bridge-prerequisites:local`
- `pnpm smoke:finance-twin-source-backed-balance-proof:local`
- `pnpm smoke:finance-twin-balance-proof-lineage:local`
- `pnpm smoke:finance-twin-bank-account-summary:local`
- `pnpm smoke:finance-twin-receivables-aging:local`
- `pnpm smoke:finance-twin-payables-aging:local`
- `pnpm smoke:finance-twin-contract-metadata:local`
- `pnpm smoke:finance-twin-card-expense:local`
- `pnpm smoke:cfo-wiki-foundation:local`
- `pnpm smoke:cfo-wiki-document-pages:local`
- `pnpm smoke:cfo-wiki-lint-export:local`
- `pnpm smoke:cfo-wiki-concept-metric-policy:local`
- `pnpm smoke:finance-discovery-answer:local`
- `pnpm smoke:finance-discovery-supported-families:local`
- `pnpm smoke:finance-policy-lookup:local`
- `pnpm smoke:finance-discovery-quality:local`
- `pnpm eval:finance-discovery-quality`
- `pnpm smoke:finance-memo:local`
- `pnpm smoke:finance-report-filed-artifact:local`
- `pnpm smoke:board-packet:local`
- `pnpm smoke:lender-update:local`
- `pnpm smoke:diligence-packet:local`
- `pnpm smoke:lender-update-release-approval:local`
- `pnpm smoke:lender-update-release-record:local`

Preserved regression guardrails:

- `pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/twin/workflow-sync.spec.ts src/modules/twin/test-suite-sync.spec.ts src/modules/twin/codeowners-discovery.spec.ts`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm ci:repro:current`

User-visible F5C4B acceptance should be:

- one completed `lender_update` reporting mission that is already `approved_for_release` can record one external release through `POST /missions/:missionId/reporting/release-record`
- the system persists one explicit release record with `releasedAt`, `releasedBy`, minimal channel metadata, and a durable summary
- mission detail, mission list, reporting detail, approval cards, and proof bundle all expose the release record without hiding freshness, limitations, provenance, or reviewer trace
- retries do not create duplicate release records or duplicate replay events
- no send, distribute, publish, PDF, or slide side effect is produced
- `board_packet` and `diligence_packet` remain out of scope

Provenance, freshness, replay, and limitation expectations for the future F5C4B implementation are:

- the release record must stay clearly labeled as operator-entered external-release metadata, not raw source truth and not generated runtime output
- lender-update freshness, limitations, related routes, related wiki pages, and approval trace must remain visible after release is logged
- the release-record path must append replay only when the durable record is first created
- if release cannot be recorded because approval is missing or not yet approved, the system must say so plainly instead of inferring release happened

## Idempotence and Recovery

The future F5C4B slice should be additive and retry-safe.

If the route is called before the reporting mission is `approved_for_release`, the request should fail without mutating approval or reporting state.
If the route is called after the release record already exists, the first implementation should return the stored release record rather than silently mutating it.
If a transaction fails before the release record and replay event commit together, the operation should roll back cleanly so no partial release state appears.

Do not silently rewrite the raw lender-update artifact, the original approval rationale, or the release timestamp in place.
If the repo proves it needs explicit release-record correction later, that should become its own documented follow-on instead of piggybacking on the first F5C4B foundation.
If the existing approval payload seam turns out to be too narrow, stop and document the blocker before introducing a new table or wider subsystem.

## Artifacts and Notes

This active F5C4B contract expects the next code thread to produce:

- one active Finance Plan record at `plans/FP-0042-release-log-and-first-lender-update-release-record-foundation.md`
- one thin mission-centric route for release recording on approved lender updates only
- one explicit release-record view surfaced through reporting, mission, proof-bundle, and approval-card reads
- one packaged `pnpm smoke:lender-update-release-record:local` proof
- targeted tests plus the preserved finance confidence ladder
- no new eval dataset
- no new release-delivery automation
- no broader packet approval widening

For this docs-only handoff slice, the expected artifacts are narrower:

- this new active Finance Plan
- refreshed active-doc wording that points the next thread at FP-0042 instead of FP-0041
- one tiny truthful handoff note so FP-0041 remains the shipped F5C4A record

## Interfaces and Dependencies

`packages/domain` must stay pure and dependency-light.
`apps/control-plane/src/modules/approvals/**` remains the owner of approval persistence and replay.
`apps/control-plane/src/modules/reporting/**` remains the owner of derived reporting posture.
`apps/control-plane/src/modules/missions/**` should keep the HTTP layer thin and mission-centric.
`apps/web` should continue consuming typed read models only and must not infer release state by re-parsing raw artifact markdown.

The preferred persistence anchor is the existing JSON-backed `report_release` approval payload in Postgres, not a new release-log table.
No new environment variables are expected for the first F5C4B slice.
Codex App Server remains out of the first release-record implementation path.
Raw source evidence remains immutable and authoritative for finance facts, while the release record stays a derived operator-entered reporting event with explicit provenance to the approved draft and approval id.

## Outcomes & Retrospective

This docs-only slice creates `plans/FP-0042-release-log-and-first-lender-update-release-record-foundation.md` as the single active implementation contract for later F5 work.
It keeps `plans/FP-0041-approval-review-and-first-lender-update-release-readiness.md` as the shipped F5C4A record, refreshes the active-doc chain so the next contributor starts from the narrow lender-update release-log foundation, and explicitly defers broader packet approval widening to `F5C4C`.
The preserved validation ladder stayed green across the packaged finance smokes, the targeted twin regressions, `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm ci:repro:current`.

No runtime code, routes, schema changes, migrations, package scripts, smoke commands, eval datasets, or implementation scaffolding were added in this handoff slice.
What remains is the future F5C4B implementation exactly as described here: one approved lender-update in, one explicit release record out, with replay, proof, freshness, provenance, and limitations all still visible and with no delivery automation.
