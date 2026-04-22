# Define F5C4F circulation log and first board-packet circulation-record foundation

## Purpose / Big Picture

This file began as the active F5C4F implementation contract created by a docs-and-plan-only handoff slice and now records the first real F5C4F implementation landed on this branch.
`plans/FP-0045-board-packet-review-or-circulation-readiness-foundation.md` remains the shipped F5C4E record that precedes it.
The target phase is `F5`, and the next execution slice is `F5C4F-circulation-log-and-first-board-packet-circulation-record-foundation`.
The user-visible goal is narrow and concrete: after the shipped F5A through F5C4E baseline already creates draft `finance_memo`, `board_packet`, `lender_update`, and `diligence_packet` artifacts, records external release readiness and release records for `lender_update` and `diligence_packet`, and records board-specific `approved_for_circulation` readiness for `board_packet`, Pocket CFO should next let an operator record that one already-approved `board_packet` was circulated outside the system, surface one explicit circulation record plus circulated posture, and keep that state durable and replayable without widening into actual send, distribute, publish, export widening, or runtime-codex drafting.

This matters now because the repo no longer lacks board review posture.
The missing capability is one truthful circulation-log and circulation-record layer on top of the shipped `report_circulation` seam.
The next gain is therefore not to reopen F5C4E, not to invent a second circulation-tracking subsystem, and not to start later F5C4 or F6 work early.
It is now the shipped board-packet circulation-log record that the next thread should use as the current later-F5 handoff point.

GitHub connector work is explicitly out of scope.
This plan does not authorize actual send, distribute, publish, PDF export, slide export, Marp export, bounded runtime-codex drafting or circulation behavior, later multi-artifact widening, F6 monitoring, or any rename from `modules/reporting/**` to `modules/reports/**`.

## Progress

- [x] 2026-04-21T22:40:36Z Audit the shipped F5A through F5C4E plan chain, active docs, approvals seams, reporting seams, proof-bundle posture, runtime-codex boundary, and board-packet circulation truth before choosing the narrowest truthful F5C4F contract.
- [x] 2026-04-21T22:40:36Z Create `plans/FP-0046-circulation-log-and-first-board-packet-circulation-record-foundation.md` and refresh the smallest truthful active-doc set so `plans/FP-0045-board-packet-review-or-circulation-readiness-foundation.md` remains the shipped F5C4E record while this file becomes the single active implementation contract.
- [x] 2026-04-21T22:48:42Z Run the preserved source-ingest through diligence-packet-release-log confidence ladder, targeted twin regressions, repo-wide validation, and `pnpm ci:repro:current` for this docs-and-plan handoff without starting F5C4F code.
- [x] 2026-04-21T23:29:57Z Implement the first real F5C4F slice by extending the existing resolved `report_circulation` approval payload with one immutable `circulationRecord`, adding `POST /missions/:missionId/reporting/circulation-log`, surfacing circulation-record posture across reporting, mission, proof-bundle, and approval-card reads, and keeping the system deterministic, runtime-free, and delivery-free.
- [x] 2026-04-21T23:29:57Z Add the packaged `pnpm smoke:board-packet-circulation-log:local` proof, land the additive replay-event migration for truthful circulation-log replay, rerun the full requested validation ladder, and finish the smallest truthful doc refresh that the landed F5C4F implementation actually makes stale.
- [x] 2026-04-21T23:36:04Z Run a strict F5C4F QA pass, confirm the branch and PR state, and correct the stale active-doc wording that still described F5C4F as the next slice to implement after the code was already shipped.
- [x] 2026-04-22T00:28:13Z Land one narrow post-merge polish pass on the shipped F5C4F baseline: hard-stop finance approval request preparation once a later release or circulation record already exists, preserve pending-request idempotence plus approved-but-not-yet-logged reuse, refresh the smallest stale docs, and keep F5C4G implementation out of scope in this thread.

## Surprises & Discoveries

- Observation: the repo already ships the exact prerequisite state F5C4F needs: one completed `board_packet` reporting mission, one stored `board_packet` artifact, one persisted `report_circulation` approval, and one derived `approved_for_circulation` readiness view.
  Evidence: `packages/domain/src/approval.ts`, `packages/domain/src/reporting-mission.ts`, `apps/control-plane/src/modules/reporting/circulation-readiness.ts`, `apps/web/components/reporting-output-card.tsx`, and `tools/board-packet-circulation-approval-smoke.mjs`.

- Observation: the existing approval-payload seam is already the most natural persistence anchor for the first board circulation record.
  Evidence: `packages/domain/src/approval.ts` already stores finance approval payloads in JSON-backed approval rows, and `apps/control-plane/src/modules/approvals/service.ts` already persists lender-update and diligence-packet release records as durable extensions of the existing resolved `report_release` payload rather than inventing a second subsystem.

- Observation: the remaining gap is circulation-record persistence and replay, not board-packet drafting, approval resolution, or runtime continuity.
  Evidence: `packages/domain/src/approval.ts` does not yet carry any `circulationRecord`, `packages/domain/src/reporting-mission.ts` and `packages/domain/src/proof-bundle.ts` do not yet expose a circulation-record view, `apps/control-plane/src/modules/reporting/service.ts` exposes `prepareReportCirculationApproval` but no circulation-log preparation path, and `packages/domain/src/replay-event.ts` plus `packages/db/src/schema/replay.ts` only define `approval.release_logged` rather than a board-specific circulation-log event.

- Observation: the active-doc chain was still one step behind current planning truth even though the shipped F5C4E code and plan already pointed at F5C4F conceptually.
  Evidence: `README.md`, `START_HERE.md`, `docs/ACTIVE_DOCS.md`, `plans/ROADMAP.md`, `docs/ops/local-dev.md`, `docs/ops/source-ingest-and-cfo-wiki.md`, `docs/ops/codex-app-server.md`, `evals/README.md`, and `docs/benchmarks/seeded-missions.md` all still said no later-F5 implementation contract was checked in yet.

- Observation: approved-for-circulation versus circulation-logged truth reads more cleanly when `circulationRecord` stays present as its own typed posture and uses `circulated: false` before the operator logs the external circulation event.
  Evidence: `packages/domain/src/reporting-mission.ts`, `packages/domain/src/proof-bundle.ts`, `apps/control-plane/src/modules/reporting/circulation-record.ts`, and `apps/web/components/reporting-output-card.tsx`.

- Observation: the new board circulation-log smoke is deterministic when run in the normal serial validation ladder, but shared DB-backed worker activity can create false negatives if multiple worker-heavy local smokes overlap.
  Evidence: `tools/board-packet-circulation-log-smoke.mjs`, `tools/board-packet-circulation-approval-smoke.mjs`, and the DB-backed orchestration and reporting flows exercised by `pnpm ci:repro:current`.

- Observation: the first implementation pass left several active docs one step behind the shipped code by still describing F5C4F as the next slice to execute instead of the latest shipped reporting record.
  Evidence: `README.md`, `START_HERE.md`, `docs/ACTIVE_DOCS.md`, `plans/ROADMAP.md`, `docs/ops/local-dev.md`, `docs/ops/source-ingest-and-cfo-wiki.md`, and `docs/ops/codex-app-server.md`.

## Decision Log

- Decision: the first real F5C4F scope is `F5C4F-circulation-log-and-first-board-packet-circulation-record-foundation`.
  Rationale: the repo needs one implementation-ready successor contract, not another broad later-F5 umbrella.

- Decision: the first artifact family in F5C4F remains exactly `board_packet`.
  Rationale: the board packet is already the shipped artifact that owns internal circulation posture, and the user explicitly ruled out widening the first F5C4F implementation to multiple packet families.

- Decision: F5C4F must start only from one completed `reporting` mission with `reportKind = "board_packet"`, one stored `board_packet` artifact, and derived circulation readiness already at `approved_for_circulation`.
  Rationale: the first circulation-log slice should consume one stored approved draft, not generic chat intake, not `finance_memo` directly, not `lender_update`, and not `diligence_packet`.

- Decision: F5C4F keeps `mission.type = "reporting"` and `reportKind = "board_packet"`.
  Rationale: reporting already owns the correct mission, replay, artifact, and proof semantics, so a second top-level mission family would widen the product boundary unnecessarily.

- Decision: F5C4F adds circulation logging and circulation recording only.
  Rationale: the first follow-on slice after F5C4E should record that circulation happened, not reopen approval posture and not claim delivery automation exists.

- Decision: the first F5C4F contract should add one explicit `circulationRecord` view with `circulated`, `circulatedAt`, `circulatedBy`, minimal `circulationChannel` metadata, optional `circulationNote`, the backing approval id, and a human-readable summary while leaving `circulationReadiness` separate.
  Rationale: the repo needs one first-class circulation-record surface that distinguishes approved-but-not-logged posture from logged-as-circulated posture without collapsing those truths into one status string.

- Decision: the preferred persistence anchor is the existing resolved `report_circulation` approval payload plus derived reporting and proof views, not a second circulation-tracking subsystem.
  Rationale: the current approvals table, repository, and replay seams are already durable and transaction-safe, while the repo does not yet need a second circulation-specific table or bounded context for one narrow board-packet slice.

- Decision: the first mission-centric route should be `POST /missions/:missionId/reporting/circulation-log`.
  Rationale: the next operator action is to log that an already-approved board packet was circulated, and matching the existing `release-log` pattern keeps the seam discoverable and narrow.

- Decision: F5C4F should add one additive replay event for circulation logging and one matching proof-bundle refresh trigger if replay typing still requires it.
  Rationale: recording circulation changes mission-facing posture and therefore needs replay coverage, but that replay should stay anchored to the existing approval seam rather than creating a second event family unless a concrete gap appears.

- Decision: the first F5C4F slice stays deterministic and runtime-free.
  Rationale: stored reporting artifacts plus the existing approvals seam are sufficient for the first board circulation-record contract, so no runtime-codex drafting or circulation behavior is justified yet.

- Decision: the first F5C4F slice stays delivery-free in the system sense.
  Rationale: Pocket CFO may record that circulation happened externally, but it must not actually send, distribute, publish, or circulate anything itself in this slice.

- Decision: the first F5C4F slice should allow exactly one circulation record per completed approved-for-circulation board-packet mission and treat duplicate retries as idempotent reads of the existing record rather than silent overwrites.
  Rationale: the narrowest safe first circulation-record foundation is additive and immutable-by-default; edit or correction workflows can wait for a later explicit slice if they are needed.

- Decision: approved-but-not-yet-logged board-packet reads should keep a separate `circulationRecord` posture with `circulated: false` instead of collapsing the field to `null`.
  Rationale: the operator and proof surfaces need to distinguish "this mission can never circulate" from "this mission is approved for circulation but no circulation event has been logged yet" without redefining readiness or overloading summary strings.

- Decision: preserve the current `modules/reporting/**` vocabulary and do not reopen a `modules/reports/**` rename wave.
  Rationale: the current repo already uses `reporting` as first-class vocabulary, and this task is about truthfulness and sequencing rather than namespace churn.

- Decision: after F5C4F, do not create a broad `FP-0047` umbrella automatically.
  Rationale: the next later slice should be chosen only after the repo proves whether a narrower post-circulation operator problem remains, and bounded runtime-codex phrasing or formatting assistance should be reconsidered only after F5C4F ships and only if it solves a concrete operator need without changing the delivery-free boundary.

- Decision: until a narrower successor slice is explicitly planned, `FP-0046` should remain the latest shipped F5 record and the current later-F5 handoff reference rather than being described as an unimplemented next step.
  Rationale: active docs should describe shipped behavior and the current sequencing truthfully, especially after a QA pass verifies that the circulation-log slice is already landed and validated.

- Decision: treat the remaining post-log request-path correction as one polish pass against shipped `FP-0046` instead of creating a new plan number.
  Rationale: the gap is a narrow operator-safety correction plus doc freshness cleanup, not a new product capability; the next thread should define the narrow F5C4G board circulation-record correction/chronology slice explicitly rather than treating this polish pass as that implementation contract.

## Context and Orientation

Pocket CFO has already shipped F4A through F4C2, with `plans/FP-0035-finance-policy-lookup-and-discovery-quality-hardening.md` as the shipped final F4 record.
Pocket CFO has also already shipped the full pre-F5C4F F5 chain:

- `plans/FP-0036-reporting-mission-foundation-and-first-finance-memo.md` as the shipped F5A reporting-foundation record
- `plans/FP-0037-draft-report-body-filed-artifact-and-markdown-export-hardening.md` as the shipped F5B reporting-reuse record
- `plans/FP-0038-board-packet-specialization-and-draft-review-foundation.md` as the shipped F5C1 board-packet record
- `plans/FP-0039-lender-update-specialization-and-draft-review-foundation.md` as the shipped F5C2 lender-update record
- `plans/FP-0040-diligence-packet-specialization-and-draft-review-foundation.md` as the shipped F5C3 diligence-packet record
- `plans/FP-0041-approval-review-and-first-lender-update-release-readiness.md` as the shipped F5C4A lender-update approval and release-readiness record
- `plans/FP-0042-release-log-and-first-lender-update-release-record-foundation.md` as the shipped F5C4B lender-update release-log and release-record record
- `plans/FP-0043-diligence-packet-approval-review-and-release-readiness.md` as the shipped F5C4C diligence approval and release-readiness record
- `plans/FP-0044-release-log-and-first-diligence-packet-release-record-foundation.md` as the shipped F5C4D diligence release-log and release-record record
- `plans/FP-0045-board-packet-review-or-circulation-readiness-foundation.md` as the shipped F5C4E board review and circulation-readiness record

That shipped baseline already means all of the following are repo truth today:

- `mission.type = "reporting"` and `sourceKind = "manual_reporting"`
- one deterministic `POST /missions/reporting` path from completed discovery work
- one draft `finance_memo`
- one linked `evidence_appendix`
- one draft `board_packet`
- one draft `lender_update`
- one draft `diligence_packet`
- one finance-facing `report_release` approval path plus release-ready posture and release record for `lender_update`
- one finance-facing `report_release` approval path plus release-ready posture and release record for `diligence_packet`
- one finance-facing `report_circulation` approval path plus circulation-ready posture for `board_packet`

The repo now has one truthful board-packet circulation-log and circulation-record path.
`ReportCirculationApprovalPayloadSchema` now includes a nested circulation record.
Reporting, mission, proof-bundle, and operator surfaces now expose `circulationRecord`.
Replay now carries the additive `approval.circulation_logged` event.
The next later-F5 follow-on should therefore stay board-specific, approval-payload-backed, deterministic, runtime-free, and delivery-free unless a narrower post-log continuation is explicitly planned.

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
- `plans/FP-0042-release-log-and-first-lender-update-release-record-foundation.md`
- `plans/FP-0043-diligence-packet-approval-review-and-release-readiness.md`
- `plans/FP-0044-release-log-and-first-diligence-packet-release-record-foundation.md`
- `plans/FP-0045-board-packet-review-or-circulation-readiness-foundation.md`
- this active plan, `plans/FP-0046-circulation-log-and-first-board-packet-circulation-record-foundation.md`
- `docs/ops/local-dev.md`
- `docs/ops/source-ingest-and-cfo-wiki.md`
- `docs/ops/codex-app-server.md`
- `docs/benchmarks/seeded-missions.md`
- `evals/README.md`
- `apps/control-plane/src/modules/approvals/README.md`

GitHub connector work is out of scope.
The internal `@pocket-cto/*` package scope remains unchanged.
This thread now includes the first real F5C4F runtime code, route, schema, migration, package-script, smoke-command, and read-model changes for board-packet circulation logging while still staying inside the allowed file set and the delivery-free product boundary.

The most relevant implementation seams for the next F5C4F code thread are:

- `packages/domain/src/approval.ts`
- `packages/domain/src/reporting-mission.ts`
- `packages/domain/src/proof-bundle.ts`
- `packages/domain/src/mission-detail.ts`
- `packages/domain/src/mission-list.ts`
- `packages/domain/src/replay-event.ts`
- `packages/domain/src/index.ts`
- `packages/db/src/schema/replay.ts`
- one additive drizzle migration under `packages/db/drizzle/`
- `apps/control-plane/src/modules/approvals/**`
- `apps/control-plane/src/modules/missions/routes.ts`
- `apps/control-plane/src/modules/missions/service.ts`
- `apps/control-plane/src/modules/reporting/service.ts`
- `apps/control-plane/src/modules/reporting/circulation-readiness.ts`
- add one small helper such as `apps/control-plane/src/modules/reporting/circulation-record.ts` only if it keeps service logic legible
- `apps/control-plane/src/modules/reporting/artifact.ts`
- `apps/control-plane/src/modules/evidence/proof-bundle-assembly.ts`
- `apps/control-plane/src/modules/evidence/proof-bundle-summary.ts`
- `apps/control-plane/src/modules/missions/detail-view.ts`
- `apps/web/components/approval-card-list.tsx`
- `apps/web/components/reporting-output-card.tsx`
- `apps/web/components/mission-card.tsx`
- `apps/web/components/mission-list-card.tsx`
- `apps/web/app/missions/[missionId]/**`
- `apps/web/lib/api.ts`
- add `tools/board-packet-circulation-log-smoke.mjs`
- update `package.json`

## Plan of Work

F5C4 should now continue through one explicit board-focused circulation-record contract before it widens again.

First, implement `F5C4F` as one finance-facing circulation-log and circulation-record slice on top of the shipped `board_packet` reporting and approval path.
The new circulation-log path should start only from one completed `reporting` mission with `reportKind = "board_packet"`, one stored `board_packet` artifact, and derived circulation readiness already at `approved_for_circulation`.
The reporting mission should stay `succeeded` as a draft-producing mission.
The circulation record should be persisted separately as an operator-entered circulation trace on top of the existing approval seam, not as a live runtime continuation and not as delivery behavior.

Second, keep circulation-log persistence inside the existing approvals and reporting bounded contexts and reuse the existing approvals table, repository, replay events, list route, resolve route, and mission-scoped circulation-approval route where possible.
The critical distinction remains behavioral rather than infrastructural: recording circulation must not require a live runtime session, must not resume a paused task, must not change a completed reporting mission back to `awaiting_approval`, and must not create a second circulation subsystem.
The only widening in this slice is that the same persisted approval seam that already works for board circulation readiness should also work for board circulation logging.

Third, widen the reporting, proof-bundle, mission-detail, mission-list, approval-card, and reporting-output read models just enough to show circulation-record posture.
The derived circulation-readiness state should remain available and unchanged for `board_packet`.
The new circulation-record surface should stay separate from readiness so the repo can show approved-but-not-logged versus circulated explicitly.
For lender-update and diligence-packet flows, release-readiness and release-record surfaces should stay unchanged.

Fourth, leave later sequencing explicit.
After F5C4F lands, the repo should pause before opening another later-F5 plan number.
Only if a concrete operator problem remains should the next thread define one additional narrow slice, and bounded runtime-codex phrasing or formatting assistance should be reconsidered only after this delivery-free circulation-record foundation is shipped.

## Concrete Steps

1. Widen the pure approval, reporting, proof-bundle, and replay contracts without adding a new mission family or a second circulation subsystem.
   Update:
   - `packages/domain/src/approval.ts`
   - `packages/domain/src/reporting-mission.ts`
   - `packages/domain/src/proof-bundle.ts`
   - `packages/domain/src/mission-detail.ts`
   - `packages/domain/src/mission-list.ts`
   - `packages/domain/src/replay-event.ts`
   - `packages/domain/src/index.ts`
   - `packages/db/src/schema/replay.ts`
   - one additive drizzle migration under `packages/db/drizzle/`

   F5C4F should:
   - keep `report_circulation` as the only finance-facing approval kind for the board path
   - keep `mission.type = "reporting"` and `reportKind = "board_packet"`
   - extend `ReportCirculationApprovalPayloadSchema` with one nullable `circulationRecord`
   - add one typed `ReportingCirculationRecordView` and matching proof-bundle field
   - add one additive replay event such as `approval.circulation_logged` plus any matching proof-bundle refresh trigger if the current replay typing still requires it
   - avoid new artifact kinds, new mission families, and new environment variables

2. Retarget the existing mission-scoped board circulation seam from approval-only to approval-plus-circulation-log while keeping the first new scope board-packet-only.
   Update:
   - `apps/control-plane/src/modules/reporting/service.ts`
   - `apps/control-plane/src/modules/approvals/service.ts`
   - `apps/control-plane/src/modules/approvals/payload.ts`
   - `apps/control-plane/src/modules/approvals/events.ts`
   - `apps/control-plane/src/modules/approvals/routes.ts` only if required by current approval read behavior
   - `apps/control-plane/src/modules/missions/routes.ts`
   - `apps/control-plane/src/modules/missions/service.ts`

   F5C4F should:
   - add one thin operator route at `POST /missions/:missionId/reporting/circulation-log`
   - require `reportKind = "board_packet"`
   - require one stored `board_packet` artifact
   - require derived circulation readiness already at `approved_for_circulation`
   - persist one circulation record on the existing resolved `report_circulation` approval payload only for that completed approved board-packet draft
   - make duplicate retries idempotent by returning the existing circulation record instead of creating duplicates

3. Add one focused circulation-record helper and derive circulation-record reads separately from circulation readiness.
   Update:
   - add `apps/control-plane/src/modules/reporting/circulation-record.ts`
   - `apps/control-plane/src/modules/reporting/circulation-readiness.ts`
   - `apps/control-plane/src/modules/reporting/artifact.ts`
   - `apps/control-plane/src/modules/evidence/proof-bundle-summary.ts`
   - `apps/control-plane/src/modules/evidence/proof-bundle-assembly.ts`
   - `apps/control-plane/src/modules/missions/detail-view.ts`

   F5C4F should:
   - preserve the existing `approved_for_circulation` readiness contract
   - add a separate circulated posture through `circulationRecord.circulated`
   - expose `circulatedAt`, `circulatedBy`, and minimal `circulationChannel` metadata
   - keep freshness, limitations, and reviewer trace explicit
   - avoid any claim that Pocket CFO performed the circulation itself

4. Extend the operator surface just enough to show approved-versus-circulated truth without widening into delivery controls.
   Update:
   - `apps/web/components/approval-card-list.tsx`
   - `apps/web/components/reporting-output-card.tsx`
   - `apps/web/components/mission-card.tsx`
   - `apps/web/components/mission-list-card.tsx`
   - `apps/web/app/missions/[missionId]/mission-actions.tsx`
   - `apps/web/app/missions/[missionId]/mission-action-forms.tsx`
   - `apps/web/app/missions/[missionId]/actions.ts`
   - `apps/web/lib/api.ts`

   F5C4F should:
   - keep the existing circulation-approval action unchanged for F5C4E behavior
   - add one circulation-log action only after approval is granted
   - render circulation-ready posture and circulation-record posture separately
   - avoid send buttons, distribution automation, PDF export, slide export, or runtime-codex drafting controls

5. Add the narrowest proof coverage for the new board circulation-log path.
   Update:
   - add `tools/board-packet-circulation-log-smoke.mjs`
   - update `package.json`
   - add or update the narrowest domain, control-plane, and web tests near the touched seams

   F5C4F should:
   - preserve the shipped `pnpm smoke:board-packet-circulation-approval:local` proof
   - add one packaged `pnpm smoke:board-packet-circulation-log:local` proof for the new circulation-record path
   - assert replay includes approval request, resolution, and circulation-log coverage
   - keep the proof deterministic, runtime-free, and delivery-free

6. Refresh only the active docs that landed F5C4F code actually makes stale.
   Update only where landed F5C4F code changes active wording:
   - `README.md`
   - `START_HERE.md`
   - `docs/ACTIVE_DOCS.md`
   - `plans/ROADMAP.md`
   - `docs/ops/local-dev.md`
   - `docs/ops/source-ingest-and-cfo-wiki.md`
   - `docs/ops/codex-app-server.md`
   - `evals/README.md`
   - `docs/benchmarks/seeded-missions.md`
   - `apps/control-plane/src/modules/approvals/README.md`

## Validation and Acceptance

Validation run for the landed F5C4F slice:

- `pnpm --filter @pocket-cto/domain exec vitest run src/approval.spec.ts src/proof-bundle.spec.ts src/mission-detail.spec.ts src/mission-list.spec.ts`
- `zsh -lc "cd apps/control-plane && pnpm exec vitest run src/modules/approvals/**/*.spec.ts src/modules/reporting/**/*.spec.ts src/modules/missions/**/*.spec.ts src/modules/evidence/**/*.spec.ts src/modules/orchestrator/**/*.spec.ts src/app.spec.ts"`
- `zsh -lc "cd apps/web && pnpm exec vitest run app/**/*.spec.ts* components/**/*.spec.ts* lib/api.spec.ts"`
- `pnpm smoke:finance-discovery-answer:local`
- `pnpm smoke:finance-discovery-supported-families:local`
- `pnpm smoke:finance-policy-lookup:local`
- `pnpm smoke:finance-discovery-quality:local`
- `pnpm eval:finance-discovery-quality`
- `pnpm smoke:finance-memo:local`
- `pnpm smoke:finance-report-filed-artifact:local`
- `pnpm smoke:board-packet:local`
- `pnpm smoke:board-packet-circulation-approval:local`
- `pnpm smoke:lender-update:local`
- `pnpm smoke:diligence-packet:local`
- `pnpm smoke:lender-update-release-approval:local`
- `pnpm smoke:lender-update-release-log:local`
- `pnpm smoke:diligence-packet-release-approval:local`
- `pnpm smoke:diligence-packet-release-log:local`
- `pnpm smoke:board-packet-circulation-log:local`
- `pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/twin/workflow-sync.spec.ts src/modules/twin/test-suite-sync.spec.ts src/modules/twin/codeowners-discovery.spec.ts`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm ci:repro:current`

Supporting local migration application for DB-backed validation:

- `pnpm db:migrate`

User-visible F5C4F acceptance should be:

- one completed approved-for-circulation `board_packet` reporting mission with one stored `board_packet` artifact can record one explicit circulation record without live runtime continuation
- mission detail, mission list, proof bundle, approval cards, and reporting output expose circulation-ready posture and circulation-record posture separately
- the new circulation record exposes `circulated`, `circulatedAt`, `circulatedBy`, minimal `circulationChannel` metadata, reviewer trace, freshness posture, limitations, and summary copy clearly
- replay captures approval request, approval resolution, and circulation-log truth without inventing delivery automation
- lender-update and diligence release flows remain unchanged
- no send, distribute, publish, PDF export, slide export, or runtime-codex drafting behavior appears in the first F5C4F slice

Provenance, freshness, replay, and limitation expectations for F5C4F are:

- the circulation record must stay linked to one stored `board_packet` artifact and one resolved `report_circulation` approval
- raw sources remain immutable and raw wiki pages remain derived evidence rather than the source of truth for circulation logging
- proof bundles and operator surfaces must continue exposing freshness and limitations rather than hiding them behind circulated posture
- no circulation record may silently imply that Pocket CFO performed the circulation itself

## Idempotence and Recovery

F5C4F should stay additive and retry-safe.
Adding one circulation-record payload field, one circulation-record view, and one replay event type is additive-first work.
The first circulation-record foundation should preserve the existing approved `report_circulation` row and add one immutable circulation record rather than rewriting history or starting a second subsystem.
Duplicate log retries should return the existing record instead of silently overwriting it.
If local validation fails because the additive replay-event migration has not been applied, run `pnpm db:migrate` and rerun the affected board-circulation smoke or tests.
No raw source files, stored board-packet artifacts, or CFO Wiki filed pages should be rewritten in place as part of this slice.

## Artifacts and Notes

This branch now produces:

- one persisted circulation record on one resolved `report_circulation` approval row for one completed approved board-packet mission
- one mission-scoped `POST /missions/:missionId/reporting/circulation-log` route
- one circulation-record view across reporting, mission, proof-bundle, and approval-card reads
- one additive replay-event migration for `approval.circulation_logged`
- one packaged `pnpm smoke:board-packet-circulation-log:local` proof
- the smallest additional doc refresh made stale by landed F5C4F code, including this plan and `apps/control-plane/src/modules/approvals/README.md`

## Interfaces and Dependencies

The F5C4F implementation should preserve Pocket CFO module boundaries:

- `packages/domain` owns approval, reporting, proof-bundle, mission-detail, mission-list, and replay contracts
- `packages/db` owns replay enum and migration updates only if replay typing widens
- `apps/control-plane/src/modules/approvals` owns persistence, idempotence, replay append, and approval-payload mutation
- `apps/control-plane/src/modules/reporting` owns board-packet source validation, circulation-log preparation, and reporting read models
- `apps/control-plane/src/modules/evidence` owns proof-bundle rendering and circulation-record summary posture
- `apps/web` owns operator actions and read-only circulation-record rendering

No new environment variables are expected for the first F5C4F slice.
No GitHub connector work is in scope.
No runtime-codex drafting or circulation behavior is in scope.
The runtime boundary stays the same: Codex App Server remains a transport seam, not the source of board-circulation truth.
The CFO Wiki remains derived and reviewable, but F5C4F must not treat raw wiki pages alone as the board circulation-record source of truth.

## Outcomes & Retrospective

This branch turns FP-0046 from a handoff contract into the first real F5C4F implementation record.
It keeps `plans/FP-0045-board-packet-review-or-circulation-readiness-foundation.md` as the shipped F5C4E record, leaves all earlier F5 records untouched, and lands one board-packet-only circulation-log and first circulation-record foundation without widening into delivery automation, PDF or slide export, runtime-codex drafting, or broader later-F5 work.
The branch ships runtime code, an additive replay-event migration, a packaged `board-packet-circulation-log` smoke, a mission-scoped circulation-log route, and the smallest doc refresh made stale by the landed slice.
The full requested validation ladder passed, including the domain, control-plane, and web vitest commands, the preserved finance discovery and reporting smokes, the new `pnpm smoke:board-packet-circulation-log:local` proof, the twin guardrail command, `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm ci:repro:current`.
The follow-on QA pass corrected the stale active-doc wording that still described F5C4F as future work after the branch had already shipped it.
What remains is not more F5C4E work.
Before starting broader later-F5 work, the next thread should define and/or execute one narrow F5C4G board circulation-record correction/chronology slice rather than reopening shipped F5C4F scope or creating a broad umbrella follow-on.
