# Define F5C4E board-packet review or circulation-readiness foundation

## Purpose / Big Picture

This plan is the active F5C4E implementation contract and now also records the first real implementation thread against that contract.
`plans/FP-0044-release-log-and-first-diligence-packet-release-record-foundation.md` remains the shipped F5C4D record that precedes it.
The target phase is `F5`, and the next execution slice is `F5C4E-board-packet-review-or-circulation-readiness-foundation`.
The user-visible goal is narrow and concrete: after the shipped F5A through F5C4D baseline already creates draft `finance_memo`, `board_packet`, `lender_update`, and `diligence_packet` artifacts, supports external-facing `report_release` approval and release-log posture for `lender_update` and `diligence_packet`, and keeps delivery outside the system, Pocket CFO should next let an operator request and resolve one internal board-packet review and derive one explicit circulation-ready posture from one completed `board_packet` reporting mission with one stored `board_packet` artifact without widening into actual circulation logging, actual circulation or delivery, runtime-codex drafting, or broader packet rollout.

This matters now because the repo no longer lacks packet specialization or external release posture.
The remaining gap is that `board_packet` is still explicitly draft-only everywhere, while the existing approvals and release-log seam is intentionally external-facing and lender or diligence-specific.
The next gain is therefore not to reopen `report_release`, not to create another broad later-F5 umbrella, and not to start F6.
It is to define one implementation-ready board-facing internal review contract that a new thread can execute directly.

GitHub connector work is explicitly out of scope.
This plan does not authorize actual circulation logging, actual send, distribute, publish, broader packet approval widening, bounded runtime-codex phrasing or formatting assistance, PDF export, slide export, Marp export, F6 monitoring, or any rename from `modules/reporting/**` to `modules/reports/**`.

## Progress

- [x] 2026-04-21T16:20:00Z Audit the shipped F5A through F5C4D plan chain, active docs, approvals seams, reporting seams, proof-bundle posture, runtime-codex boundary, and board-packet operator surfaces before choosing the narrowest truthful F5C4E contract.
- [x] 2026-04-21T16:20:00Z Create `plans/FP-0045-board-packet-review-or-circulation-readiness-foundation.md` and refresh the smallest truthful active-doc chain so `plans/FP-0044-release-log-and-first-diligence-packet-release-record-foundation.md` remains the shipped F5C4D record while this file becomes the single active implementation contract.
- [x] 2026-04-21T15:55:00Z Re-open the active F5C4E contract for the first real implementation thread, explicitly invoke the required repo skills in-thread, audit the current branch and active code seams, and record the pre-edit verdict: add one additive `report_circulation` approval kind, one mission-scoped board-packet circulation-approval route, and one board-only circulation-readiness view on the existing approvals substrate without reusing `report_release`, without adding circulation logging, and without changing proof readiness.
- [x] 2026-04-21T18:49:00Z Implement one additive board-packet internal review or circulation-readiness slice: add `report_circulation`, one mission-scoped board-packet circulation-approval request path, one derived circulation-ready posture, and the smallest truthful proof or UI widening without adding circulation logging or delivery behavior.
- [x] 2026-04-21T18:49:00Z Run the targeted domain, control-plane, web, smoke, twin, repo-wide, and clean-tree CI reproduction ladder for F5C4E after the first real implementation lands, including the new `pnpm smoke:board-packet-circulation-approval:local` proof and `pnpm ci:repro:current`.

## Surprises & Discoveries

- Observation: the current repo truth is that `board_packet` is still draft-only, while approval and release surfaces are explicitly lender or diligence-only.
  Evidence: `packages/domain/src/approval.ts`, `packages/domain/src/reporting-mission.ts`, `apps/control-plane/src/modules/reporting/release-readiness.ts`, `apps/control-plane/src/modules/reporting/release-record.ts`, `apps/web/app/missions/[missionId]/mission-actions.tsx`, and `apps/web/components/reporting-output-card.tsx`.

- Observation: the existing approvals bounded context is already the correct durable substrate for a board-facing internal review path as long as the approval kind and copy change.
  Evidence: `apps/control-plane/src/modules/approvals/service.ts`, `apps/control-plane/src/modules/approvals/routes.ts`, `apps/control-plane/src/modules/approvals/payload.ts`, `apps/control-plane/src/modules/approvals/card-formatter.ts`, and `apps/control-plane/src/modules/approvals/README.md` already persist taskless finance approvals, replay request or resolve events, and allow `report_release` approvals to resolve without live runtime continuation.

- Observation: the board packet already exists as a stored specialized reporting artifact, so the missing work is internal review posture rather than another packet compiler.
  Evidence: `packages/domain/src/reporting-mission.ts`, `apps/control-plane/src/modules/reporting/board-packet.ts`, `apps/control-plane/src/modules/reporting/service.ts`, `apps/control-plane/src/modules/evidence/proof-bundle-assembly.ts`, and `tools/board-packet-smoke.mjs`.

- Observation: the approvals and proof narratives currently frame board circulation as later work, but they do not yet name one active successor plan.
  Evidence: `README.md`, `START_HERE.md`, `docs/ACTIVE_DOCS.md`, `plans/ROADMAP.md`, `docs/ops/local-dev.md`, `docs/ops/source-ingest-and-cfo-wiki.md`, `docs/ops/codex-app-server.md`, `evals/README.md`, `docs/benchmarks/seeded-missions.md`, and `apps/control-plane/src/modules/approvals/README.md`.

- Observation: the `report_release` seam should stay external-facing rather than becoming the board-circulation path.
  Evidence: `packages/domain/src/approval.ts`, `apps/control-plane/src/modules/reporting/service.ts`, `apps/control-plane/src/modules/approvals/card-formatter.ts`, and the shipped lender or diligence release smokes all anchor that seam to explicit external release and release logging posture.

- Observation: the existing lender or diligence release-readiness plumbing already gives F5C4E the right implementation shape if the board path gets its own helper and read-model field instead of overloading release posture.
  Evidence: `apps/control-plane/src/modules/reporting/release-readiness.ts`, `apps/control-plane/src/modules/reporting/release-record.ts`, `apps/control-plane/src/modules/evidence/proof-bundle-summary.ts`, `apps/control-plane/src/modules/evidence/proof-bundle-assembly.ts`, and `apps/control-plane/src/modules/missions/detail-view.ts`.

- Observation: the additive `report_circulation` enum migration was not sufficient on its own because the local Drizzle journal metadata initially omitted the new migration entry and snapshot, so `pnpm db:migrate` skipped the enum widening until the metadata was repaired.
  Evidence: `packages/db/drizzle/0036_busy_ken_hale.sql`, `packages/db/drizzle/meta/_journal.json`, `packages/db/drizzle/meta/0036_snapshot.json`, the failed `pnpm smoke:board-packet-circulation-approval:local` run with `invalid input value for enum approval_kind: "report_circulation"`, and the succeeding rerun after the metadata fix plus `pnpm db:migrate`.

## Decision Log

- Decision: the first real F5C4E scope is `F5C4E-board-packet-review-or-circulation-readiness-foundation`.
  Rationale: the repo needs one implementation-ready board-facing contract, not another broad later-F5 umbrella.

- Decision: the first artifact family in F5C4E is exactly `board_packet`.
  Rationale: the board packet is already a stored draft artifact in repo reality, and the user explicitly ruled out widening the first slice to multiple packet families.

- Decision: F5C4E must start only from one completed `reporting` mission with `reportKind = "board_packet"` and one stored `board_packet` artifact.
  Rationale: the first board review slice should consume one stored board-packet draft, not generic chat, not `finance_memo` directly, not `lender_update`, and not `diligence_packet`.

- Decision: F5C4E keeps `mission.type = "reporting"` and `reportKind = "board_packet"`.
  Rationale: reporting already owns the correct mission, replay, artifact, and proof semantics, so a second top-level mission family would widen the product boundary unnecessarily.

- Decision: F5C4E adds review request, approval resolution, and `approved_for_circulation` or circulation-ready posture only.
  Rationale: the first board-facing slice should make internal review posture explicit without claiming circulation logging, delivery, or external release behavior.

- Decision: F5C4E reuses the existing approvals bounded context but does not reuse `report_release`.
  Rationale: board circulation is an internal-circulation problem, not an external release problem, so it needs its own finance-facing approval kind on the same durable approvals substrate.

- Decision: add one new finance-facing approval kind, `report_circulation`.
  Rationale: this keeps the first board slice generic enough to widen later to other internal-circulation artifacts if needed, while avoiding external-release wording and behavior.

- Decision: finance `report_circulation` approvals must remain taskless, replay-backed, and free of live runtime continuation assumptions.
  Rationale: internal board review is a durable operator decision on a finished draft artifact, not a paused runtime command.

- Decision: F5C4E adds one board-specific circulation-readiness view separate from `releaseReadiness`.
  Rationale: the repo already uses `releaseReadiness` and `releaseRecord` for external-facing lender or diligence posture, so board circulation needs its own truthful read model rather than overloading external release semantics.

- Decision: the first F5C4E circulation-ready posture should be derived as `not_requested`, `pending_review`, `approved_for_circulation`, or `not_approved_for_circulation`.
  Rationale: those four states distinguish no request yet, pending internal review, approved internal circulation posture, and resolved-but-not-approved posture without claiming a circulation log already exists.

- Decision: F5C4E stays deterministic and runtime-free.
  Rationale: the board review slice should prove evidence-grounded internal review posture before any bounded runtime phrasing or formatting assistance is reconsidered.

- Decision: F5C4E stays delivery-free in the system sense.
  Rationale: the first board slice may derive circulation-ready posture, but it must not actually send, distribute, publish, log circulation, or otherwise claim circulation happened.

- Decision: F5C4E should use one thin mission-scoped route at `POST /missions/:missionId/reporting/circulation-approval`.
  Rationale: this mirrors the existing release-approval pattern while making the board-facing behavior explicit and keeping the seam discoverable to operators.

- Decision: keep the completed `board_packet` reporting mission in status `succeeded` even when circulation review is pending.
  Rationale: draft compilation and internal circulation readiness are separate truths, and regressing the mission back into runtime-style approval semantics would be misleading.

- Decision: the later slice after F5C4E is `F5C4F-circulation-log-and-first-board-packet-circulation-record-foundation`; only after that later delivery-free foundation should bounded runtime-codex phrasing or formatting assistance be reconsidered.
  Rationale: later-F5 hardening should proceed as board review and circulation-ready posture first, board circulation logging second, and optional runtime assistance only after both delivery-free foundations exist.

- Decision: preserve the current `modules/reporting/**` vocabulary and do not reopen a `modules/reports/**` rename wave.
  Rationale: the current repo already uses `reporting` as first-class vocabulary, and this task is about truthfulness and sequencing rather than namespace churn.

- Decision: keep the board-packet proof-bundle draft-only risk wording backward-compatible with the shipped F5C1 proof text while adding explicit F5C4E circulation truth.
  Rationale: the F5C4E slice should add circulation-readiness posture without regressing the established board-packet smoke expectation or falsely implying PDF, slide, or delivery behavior now exists.

## Context and Orientation

Pocket CFO has already shipped F4A through F4C2, with `plans/FP-0035-finance-policy-lookup-and-discovery-quality-hardening.md` as the shipped final F4 record.
Pocket CFO has also already shipped the full pre-F5C4E F5 chain:

- `plans/FP-0036-reporting-mission-foundation-and-first-finance-memo.md` as the shipped F5A reporting-foundation record
- `plans/FP-0037-draft-report-body-filed-artifact-and-markdown-export-hardening.md` as the shipped F5B reporting-reuse record
- `plans/FP-0038-board-packet-specialization-and-draft-review-foundation.md` as the shipped F5C1 board-packet record
- `plans/FP-0039-lender-update-specialization-and-draft-review-foundation.md` as the shipped F5C2 lender-update record
- `plans/FP-0040-diligence-packet-specialization-and-draft-review-foundation.md` as the shipped F5C3 diligence-packet record
- `plans/FP-0041-approval-review-and-first-lender-update-release-readiness.md` as the shipped F5C4A lender-update approval and release-readiness record
- `plans/FP-0042-release-log-and-first-lender-update-release-record-foundation.md` as the shipped F5C4B lender-update release-log and release-record record
- `plans/FP-0043-diligence-packet-approval-review-and-release-readiness.md` as the shipped F5C4C diligence approval and release-readiness record
- `plans/FP-0044-release-log-and-first-diligence-packet-release-record-foundation.md` as the shipped F5C4D diligence release-log and release-record record

That shipped baseline already means all of the following are repo truth today:

- `mission.type = "reporting"` and `sourceKind = "manual_reporting"`
- one deterministic `POST /missions/reporting` path from completed discovery work
- one draft `finance_memo`
- one linked `evidence_appendix`
- one draft `board_packet`
- one draft `lender_update`
- one draft `diligence_packet`
- one finance-facing `report_release` approval path for completed `lender_update` and `diligence_packet` reporting missions
- one release-readiness posture for those two external-facing packet kinds
- one external release-log and release-record path for those two external-facing packet kinds

The repo still does not have any truthful board-packet internal review or circulation-ready path.
Board packets remain draft-only in proof narratives, reporting output, mission actions, and approval documentation.
The active successor contract must therefore stay board-specific, internal-facing, deterministic, runtime-free, and delivery-free.

The active-doc boundary for this plan is:

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
- this active plan, `plans/FP-0045-board-packet-review-or-circulation-readiness-foundation.md`
- `docs/ops/local-dev.md`
- `docs/ops/source-ingest-and-cfo-wiki.md`
- `docs/ops/codex-app-server.md`
- `docs/benchmarks/seeded-missions.md`
- `evals/README.md`
- `apps/control-plane/src/modules/approvals/README.md`

GitHub connector work is out of scope.
The internal `@pocket-cto/*` package scope remains unchanged.
This thread now includes the first real F5C4E implementation pass, so additive runtime code, schema changes, one additive migration, one packaged smoke command, and the smallest truthful doc refreshes are in scope as long as they stay inside the bounded seams this plan names.

The most relevant implementation seams for the next F5C4E code thread are:

- `packages/domain/src/approval.ts`
- `packages/domain/src/reporting-mission.ts`
- `packages/domain/src/proof-bundle.ts`
- `packages/domain/src/mission-detail.ts`
- `packages/domain/src/mission-list.ts`
- `packages/domain/src/index.ts`
- `packages/db/src/schema/artifacts.ts`
- one additive drizzle migration under `packages/db/drizzle/`
- `apps/control-plane/src/modules/approvals/**`
- `apps/control-plane/src/modules/missions/routes.ts`
- `apps/control-plane/src/modules/missions/service.ts`
- `apps/control-plane/src/modules/missions/reporting-actions.ts`
- `apps/control-plane/src/modules/reporting/service.ts`
- `apps/control-plane/src/modules/reporting/artifact.ts`
- add one small helper such as `apps/control-plane/src/modules/reporting/circulation-readiness.ts` only if it keeps service logic legible
- `apps/control-plane/src/modules/evidence/proof-bundle-summary.ts`
- `apps/control-plane/src/modules/evidence/proof-bundle-assembly.ts`
- `apps/control-plane/src/modules/missions/detail-view.ts`
- `apps/web/components/approval-card-list.tsx`
- `apps/web/components/reporting-output-card.tsx`
- `apps/web/components/mission-card.tsx`
- `apps/web/components/mission-list-card.tsx`
- `apps/web/app/missions/[missionId]/mission-actions.tsx`
- `apps/web/app/missions/[missionId]/mission-action-forms.tsx`
- `apps/web/app/missions/[missionId]/actions.ts`
- `apps/web/lib/api.ts`
- add `tools/board-packet-circulation-approval-smoke.mjs`
- update `package.json`

## Plan of Work

F5C4 should now continue through one explicit board-focused internal review contract before it widens again.

First, implement `F5C4E` as one finance-facing board review or circulation-readiness slice on top of the shipped `board_packet` reporting path.
The new review path should start only from one completed `reporting` mission with `reportKind = "board_packet"` and one stored `board_packet` artifact.
The reporting mission should stay `succeeded` as a draft-producing mission.
The new approval should be persisted separately as an internal circulation trace, not as a live runtime pause and not as an external release action.
That means F5C4E should add a new board-facing approval seam and a new circulation-readiness view rather than widening the existing external `report_release` seam.

Second, keep approval request and approval resolution inside the existing approvals bounded context and reuse the existing approvals table, repository, replay events, list route, and resolve route where possible.
The critical distinction remains behavioral rather than infrastructural: board circulation approvals must not require an in-memory runtime session, must not resume a paused task, must not push a completed reporting mission back into `awaiting_approval`, and must be safe to resolve in `api_only` mode.
The first board slice should therefore mirror the durable finance-review posture of `report_release` while staying semantically distinct from external release and release logging.

Third, widen the reporting, proof-bundle, mission-detail, mission-list, approval-card, and reporting-output read models just enough to show board circulation-readiness posture.
The derived circulation-ready state should be available only for `board_packet` in this first slice.
The external `releaseReadiness` and `releaseRecord` surfaces should stay unchanged for `lender_update` and `diligence_packet`.
For board packets, no circulation-record surface should exist until the later `F5C4F` slice.

Fourth, leave later sequencing explicit.
After F5C4E lands, the next thread should implement `F5C4F-circulation-log-and-first-board-packet-circulation-record-foundation`.
Only after that later delivery-free foundation exists should the repo reconsider bounded runtime-codex phrasing or formatting assistance for packets.

## Concrete Steps

1. Widen the pure approval and reporting contracts without adding a new mission family or reusing `report_release`.
   Update:
   - `packages/domain/src/approval.ts`
   - `packages/domain/src/reporting-mission.ts`
   - `packages/domain/src/proof-bundle.ts`
   - `packages/domain/src/mission-detail.ts`
   - `packages/domain/src/mission-list.ts`
   - `packages/domain/src/index.ts`
   - `packages/db/src/schema/artifacts.ts`
   - one additive drizzle migration under `packages/db/drizzle/`

   F5C4E should:
   - add one new finance-facing approval kind, `report_circulation`
   - define a first `ReportCirculationApprovalPayload` that starts with `reportKind = "board_packet"` only
   - keep `mission.type = "reporting"` and all current report kinds unchanged
   - add one typed circulation-readiness view separate from `ReportingReleaseReadinessView`
   - derive circulation posture as `not_requested`, `pending_review`, `approved_for_circulation`, or `not_approved_for_circulation`
   - add one additive `approval_kind` enum value for `report_circulation`
   - avoid new artifact kinds, new release-record fields, or new replay-event types in the first slice

2. Retarget the approvals bounded context for board circulation review approvals without inventing a second approval system.
   Update:
   - `apps/control-plane/src/modules/approvals/service.ts`
   - `apps/control-plane/src/modules/approvals/schema.ts`
   - `apps/control-plane/src/modules/approvals/routes.ts`
   - `apps/control-plane/src/modules/approvals/payload.ts`
   - `apps/control-plane/src/modules/approvals/card-formatter.ts`
   - `apps/control-plane/src/modules/approvals/README.md`

   F5C4E should:
   - reuse the approvals table, repository, `approval.requested`, and `approval.resolved` replay events
   - allow `POST /approvals/:approvalId/resolve` to resolve `report_circulation` approvals in `api_only` mode just like taskless finance release approvals
   - keep `taskId = null`, skip live runtime delivery and task resume behavior, and avoid changing completed reporting missions back to `awaiting_approval`
   - make duplicate request retries idempotent by returning the existing pending or latest applicable `report_circulation` approval for that mission instead of creating duplicates
   - keep release-log persistence and `approval.release_logged` behavior unchanged and out of scope for this slice

3. Add one mission-centric request path for the first board-packet internal review workflow.
   Update:
   - `apps/control-plane/src/modules/missions/routes.ts`
   - `apps/control-plane/src/modules/missions/service.ts`
   - `apps/control-plane/src/modules/missions/reporting-actions.ts`
   - `apps/control-plane/src/modules/reporting/service.ts`

   F5C4E should:
   - add one thin operator route at `POST /missions/:missionId/reporting/circulation-approval`
   - require one completed `reporting` mission
   - require `reportKind = "board_packet"`
   - require one stored `board_packet` artifact
   - reject `finance_memo`, `lender_update`, `diligence_packet`, incomplete reporting missions, and missing board-packet artifacts
   - persist a `report_circulation` approval only for that completed board-packet draft

4. Extend proof-bundle shaping and reporting read models for internal circulation posture, not circulation logging.
   Update:
   - `apps/control-plane/src/modules/reporting/artifact.ts`
   - add one small helper such as `apps/control-plane/src/modules/reporting/circulation-readiness.ts`
   - `apps/control-plane/src/modules/evidence/proof-bundle-summary.ts`
   - `apps/control-plane/src/modules/evidence/proof-bundle-assembly.ts`
   - `apps/control-plane/src/modules/missions/detail-view.ts`

   F5C4E should:
   - keep proof-bundle readiness tied to one stored `board_packet` artifact rather than pending review state
   - carry the latest `report_circulation` approval trace and derived circulation-ready posture into proof bundle and reporting reads
   - keep freshness, limitations, provenance, source-report lineage, and reviewer trace explicit
   - keep board circulation readiness separate from lender or diligence `releaseReadiness` and `releaseRecord`
   - avoid circulation-log, send, publish, or delivery timestamps

5. Add the narrowest truthful operator path for board circulation review.
   Update:
   - `apps/web/components/approval-card-list.tsx`
   - `apps/web/components/reporting-output-card.tsx`
   - `apps/web/components/mission-card.tsx`
   - `apps/web/components/mission-list-card.tsx`
   - `apps/web/app/missions/[missionId]/mission-actions.tsx`
   - `apps/web/app/missions/[missionId]/mission-action-forms.tsx`
   - `apps/web/app/missions/[missionId]/actions.ts`
   - `apps/web/lib/api.ts`

   The first operator path should:
   - start from a completed `board_packet` reporting mission
   - let the operator request internal board review or circulation approval
   - render board-specific approval cards and reporting copy rather than lender or diligence release copy
   - render derived circulation-ready posture clearly next to the existing draft posture
   - show reviewer trace, rationale, and timestamps when present
   - avoid circulation-log controls, send buttons, distribution actions, release-log copy, PDF export, slide export, or runtime-codex drafting controls

6. Add the narrowest proof coverage for the new board circulation-approval path.
   Update:
   - `packages/domain/src/approval.spec.ts`
   - `packages/domain/src/reporting-mission.spec.ts`
   - `packages/domain/src/proof-bundle.spec.ts`
   - `packages/domain/src/mission-detail.spec.ts`
   - `packages/domain/src/mission-list.spec.ts`
   - `apps/control-plane/src/modules/approvals/service.spec.ts`
   - `apps/control-plane/src/modules/approvals/card-formatter.spec.ts`
   - `apps/control-plane/src/modules/reporting/service.spec.ts`
   - `apps/control-plane/src/modules/missions/routes.spec.ts`
   - `apps/control-plane/src/modules/missions/service.spec.ts`
   - `apps/control-plane/src/modules/missions/reporting-actions.spec.ts`
   - `apps/control-plane/src/modules/missions/detail-view.spec.ts`
   - `apps/control-plane/src/modules/evidence/proof-bundle-assembly.spec.ts`
   - `apps/web/components/approval-card-list.spec.tsx`
   - `apps/web/components/reporting-output-card.spec.tsx`
   - `apps/web/components/mission-card.spec.tsx`
   - `apps/web/components/mission-list-card.spec.tsx`
   - `apps/web/app/missions/[missionId]/actions.spec.ts`
   - `apps/web/app/missions/[missionId]/mission-actions.spec.tsx`
   - `apps/web/lib/api.spec.ts`
   - add `tools/board-packet-circulation-approval-smoke.mjs`
   - update `package.json`

   F5C4E should:
   - add one packaged `pnpm smoke:board-packet-circulation-approval:local` proof for the new board review path
   - avoid adding any board circulation-log proof or delivery automation proof in this slice
   - keep the existing lender-update and diligence release-approval or release-log smokes as shipped baseline coverage

7. Refresh only the smallest stale guidance that the implementation thread actually invalidates.
   Update only where landed F5C4E code changes active wording.
   Do not reopen the broader doc set if no new truth gap appears during implementation.
   Do not create `FP-0046` in the first F5C4E implementation thread.

## Validation and Acceptance

The next F5C4E implementation thread should preserve the current confidence ladder and add only the narrowest board circulation-review coverage on top of it.

Targeted test batches:

- `pnpm --filter @pocket-cto/domain exec vitest run src/approval.spec.ts src/reporting-mission.spec.ts src/proof-bundle.spec.ts src/mission-detail.spec.ts src/mission-list.spec.ts`
- `zsh -lc "cd apps/control-plane && pnpm exec vitest run src/modules/approvals/service.spec.ts src/modules/approvals/card-formatter.spec.ts src/modules/reporting/service.spec.ts src/modules/missions/routes.spec.ts src/modules/missions/service.spec.ts src/modules/missions/reporting-actions.spec.ts src/modules/missions/detail-view.spec.ts src/modules/evidence/proof-bundle-assembly.spec.ts"`
- `zsh -lc "cd apps/web && pnpm exec vitest run \"components/approval-card-list.spec.tsx\" \"components/reporting-output-card.spec.tsx\" \"components/mission-card.spec.tsx\" \"components/mission-list-card.spec.tsx\" \"app/missions/[missionId]/actions.spec.ts\" \"app/missions/[missionId]/mission-actions.spec.tsx\" \"lib/api.spec.ts\""`

Preserved finance proof ladder plus the new F5C4E proof:

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
- `pnpm smoke:lender-update-release-log:local`
- `pnpm smoke:diligence-packet-release-approval:local`
- `pnpm smoke:diligence-packet-release-log:local`
- `pnpm smoke:board-packet-circulation-approval:local`

Preserved targeted twin regressions and repo-wide gates:

- `pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/twin/workflow-sync.spec.ts src/modules/twin/test-suite-sync.spec.ts src/modules/twin/codeowners-discovery.spec.ts`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm ci:repro:current`

Acceptance checks for the first real F5C4E slice:

- one completed `board_packet` reporting mission with one stored `board_packet` artifact can request one persisted `report_circulation` approval without live runtime continuation
- `POST /approvals/:approvalId/resolve` can resolve that taskless finance approval in `api_only` mode
- board circulation readiness is derived as `not_requested`, `pending_review`, `approved_for_circulation`, or `not_approved_for_circulation`
- mission detail, mission list, proof bundle, approval cards, and reporting output expose freshness posture, limitations, reviewer trace, and circulation-ready posture clearly
- no circulation log, no send or distribute or publish behavior, no lender or diligence widening, no runtime-codex drafting, and no PDF or slide behavior appear in the first slice

## Idempotence and Recovery

F5C4E should stay additive.
Adding `report_circulation` to the approval kind enum is an additive-first database change and should land through one narrow migration rather than a destructive rewrite.
Request retries must be idempotent: if a pending or latest applicable `report_circulation` approval already exists for the mission, return it instead of creating duplicates.
Resolution retries should continue to reject non-pending approvals rather than silently mutating historical decisions.
If local validation fails because the additive approval-kind migration has not been applied, run `pnpm db:migrate` and rerun the affected board-circulation smoke or tests.
If the slice proves too wide, keep the existing board packet draft-only behavior, revert the additive code and migration before shipping, and leave raw sources, stored board-packet artifacts, CFO Wiki pages, and existing lender or diligence approval data untouched.

## Artifacts and Notes

This docs-only handoff already produces:

- this active plan, `plans/FP-0045-board-packet-review-or-circulation-readiness-foundation.md`
- the small active-doc refresh that points the repo at one concrete F5C4E contract

The next implementation thread should produce:

- one persisted `report_circulation` approval row for one completed board-packet mission
- one circulation-readiness view across reporting, mission, proof-bundle, and approval-card reads
- one packaged `pnpm smoke:board-packet-circulation-approval:local` proof
- only the smallest additional doc refresh made stale by landed F5C4E code

F5C4E should not produce:

- a circulation log or circulation record
- actual send, distribute, or publish behavior
- new raw-source artifacts or raw-source mutation
- a new mission family
- a `modules/reports/**` rename

## Interfaces and Dependencies

The F5C4E implementation should preserve Pocket CFO module boundaries:

- `packages/domain` stays pure and owns typed approval, reporting, and proof-bundle contracts
- `packages/db` owns the additive `approval_kind` enum widening and nothing else
- `apps/control-plane/src/modules/approvals` owns persistence, replay request or resolve behavior, payload parsing, and approval-card formatting
- `apps/control-plane/src/modules/reporting` owns board-packet source validation, circulation-approval preparation, and reporting read models
- `apps/control-plane/src/modules/evidence` owns proof-bundle assembly and decision-trace wording
- `apps/control-plane/src/modules/missions` owns thin mission-scoped request routes and action orchestration
- `apps/web` owns operator actions and read-only circulation-ready rendering

No new environment variables are planned for the first F5C4E slice.
No GitHub connector work is in scope.
No runtime-codex drafting or delivery behavior is in scope.
The first F5C4E slice depends on the already-shipped `board_packet` artifact path, the existing taskless finance-approval behavior from `report_release`, and the current proof-bundle read model fanout.
The active runtime boundary stays the same: Codex App Server remains a transport seam, not the source of board-circulation truth.

## Outcomes & Retrospective

This thread completed the first real F5C4E implementation.
It shipped one additive `report_circulation` approval kind, one mission-scoped `POST /missions/:missionId/reporting/circulation-approval` route, one board-only circulation-readiness view, one packaged `pnpm smoke:board-packet-circulation-approval:local` proof, and the smallest truthful read-model and operator-surface widening needed to show internal board circulation posture without adding circulation logging, delivery, runtime-codex drafting, PDF export, or slide export.

The active-doc boundary stayed narrow.
No broader README or roadmap refresh proved necessary in this implementation thread.
The only slice-adjacent checked-in doc refresh outside this plan was the small approvals bounded-context note in `apps/control-plane/src/modules/approvals/README.md`.

The main implementation surprise was operational rather than architectural: the additive approval-kind migration needed the matching Drizzle journal and snapshot metadata before `pnpm db:migrate` would actually widen the enum in local validation.
The other notable polish fix was keeping the board-packet proof-bundle draft-only wording backward-compatible with the shipped F5C1 smoke while still stating the new F5C4E circulation truth explicitly.

The full validation ladder for this slice is now green, including the targeted domain, control-plane, and web tests; the preserved finance discovery, finance memo, reporting, lender-update, diligence-packet, and new board-packet circulation smokes; the twin guardrails; `pnpm lint`; `pnpm typecheck`; `pnpm test`; and `pnpm ci:repro:current`.

What remains is later work, not more unfinished implementation inside this slice.
The next truthful successor is `F5C4F-circulation-log-and-first-board-packet-circulation-record-foundation`.
