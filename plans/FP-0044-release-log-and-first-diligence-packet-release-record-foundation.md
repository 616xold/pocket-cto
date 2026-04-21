# Define F5C4D release log and first diligence-packet release-record foundation

## Purpose / Big Picture

This plan now serves as the shipped F5 implementation record for the first real F5C4D diligence release-log and release-record slice.
The target phase is `F5`, and the executed slice recorded here is `F5C4D-release-log-and-first-diligence-packet-release-record-foundation`.
The user-visible goal is narrow and concrete: after the shipped F5A through F5C4C baseline already creates draft `finance_memo`, `board_packet`, `lender_update`, and `diligence_packet` artifacts, supports one finance-facing `report_release` approval path plus lender-update release logging, and now supports diligence approval and release-readiness without delivery, Pocket CFO should next let an operator record that one already-approved `diligence_packet` was released externally and surface one explicit release record without widening into actual send, distribute, publish, board-packet circulation posture, runtime-codex drafting, or non-markdown output work.

This matters now because the remaining repo gap is no longer diligence approval-readiness.
That slice is shipped in `plans/FP-0043-diligence-packet-approval-review-and-release-readiness.md`.
The remaining gap is that release-record persistence, release-record summaries, and operator release-log posture are still lender-update-only even though the underlying `report_release` approval seam, taskless approval resolution path, and replay-backed `approval.release_logged` event family already exist.
The next gain is therefore one narrow contract that widens the existing lender-update release-log seam to `diligence_packet`, and no broader.

GitHub connector work is explicitly out of scope.
This plan does not authorize actual send, distribute, publish, board-packet review or circulation posture, broader packet release widening beyond `diligence_packet`, bounded runtime-codex phrasing or formatting assistance, PDF export, slide export, Marp export, F6 monitoring, or any rename from `modules/reporting/**` to `modules/reports/**`.
This file now records the shipped F5C4D implementation rather than only the pre-code handoff.

## Progress

- [x] 2026-04-21T12:29:00Z Audit the shipped F5A through F5C4C plan chain, the existing lender-update-only release-record seam, and the stale active-doc guidance before narrowing the first real F5C4D contract.
- [x] 2026-04-21T12:29:00Z Create `plans/FP-0044-release-log-and-first-diligence-packet-release-record-foundation.md` and refresh the smallest truthful active-doc set so `plans/FP-0043-diligence-packet-approval-review-and-release-readiness.md` remains the shipped F5C4C record while this file becomes the single active F5C4D implementation contract.
- [x] 2026-04-21T12:38:15Z Run the requested docs-and-plan validation ladder for this handoff without starting F5C4D code.
- [x] 2026-04-21T14:21:00Z Implement `F5C4D-release-log-and-first-diligence-packet-release-record-foundation` exactly as defined here: widen the existing mission-scoped release-log seam from lender-update-only to lender-update-plus-diligence, persist the first diligence release record on the existing `report_release` approval seam, keep release logging deterministic and runtime-free, and avoid any actual send, distribute, publish, board-circulation, PDF, slide, or runtime-codex behavior.
- [x] 2026-04-21T14:21:00Z Add targeted domain, control-plane, web, and smoke coverage for diligence release-log eligibility, release-record persistence, proof-bundle posture, and the new packaged `pnpm smoke:diligence-packet-release-log:local` path.
- [x] 2026-04-21T14:32:25Z Run the full preserved confidence ladder plus the new diligence release-log proof on the final branch, finish the tiny active-doc refresh that this shipped F5C4D behavior actually makes stale, and confirm `pnpm ci:repro:current` succeeds against the current worktree snapshot.
- [x] 2026-04-21T14:45:50Z QA follow-up corrected one stale `plans/ROADMAP.md` sentence that still described diligence release logging as the active next step after F5C4D shipped; the roadmap now points the next narrow slice at F5C4E board-packet review or circulation readiness.

## Surprises & Discoveries

- Observation: the pure approval contract is already wide enough for F5C4D to stay additive and avoid a new approval kind.
  Evidence: `packages/domain/src/approval.ts` already allows `reportKind` values of both `lender_update` and `diligence_packet`, and the `report_release` payload already carries nullable `releaseRecord` data.

- Observation: the existing release-log persistence anchor is already the right one for the first diligence release-record slice.
  Evidence: `apps/control-plane/src/modules/approvals/service.ts` already persists lender-update release records on the existing approved `report_release` approval seam and appends `approval.release_logged`, while `apps/control-plane/src/modules/reporting/service.ts` already prepares the lender-update release-log input from mission-scoped reporting state.

- Observation: the current gap is service and read-model gating, not missing reporting architecture.
  Evidence: `apps/control-plane/src/modules/reporting/release-record.ts` still returns `null` unless `reportKind === "lender_update"`, `apps/control-plane/src/modules/reporting/service.ts` still hard-codes lender-update-only release-log preparation, and `apps/web/components/reporting-output-card.tsx` still renders release-record detail only for lender updates.

- Observation: the active-doc chain was still one slice behind after F5C4C landed.
  Evidence: `README.md`, `START_HERE.md`, `docs/ACTIVE_DOCS.md`, `plans/ROADMAP.md`, `docs/ops/local-dev.md`, `docs/ops/source-ingest-and-cfo-wiki.md`, `docs/ops/codex-app-server.md`, `evals/README.md`, and `docs/benchmarks/seeded-missions.md` all still pointed the next thread at `FP-0043`.

- Observation: one roadmap exit-criteria sentence stayed one step behind even after the broader F5C4D doc refresh landed.
  Evidence: `plans/ROADMAP.md` still said diligence release logging was the active next hardening step instead of recording F5C4D as shipped and pointing the next slice at F5C4E.

- Observation: the release-record seam becomes most truthful only after release-approval posture exists.
  Evidence: the reporting and proof read models should keep `releaseRecord` absent while release approval is still `not_requested`, then surface an explicit not-yet-released `releaseRecord` summary once `report_release` is pending, approved, or denied.

## Decision Log

- Decision: the first real F5C4D scope is `F5C4D-release-log-and-first-diligence-packet-release-record-foundation`.
  Rationale: the repo needs one implementation-ready release-record contract, not a blended diligence release-log plus board-circulation or runtime program.

- Decision: the first artifact family in F5C4D remains exactly `diligence_packet`.
  Rationale: `diligence_packet` is the only additional external-facing packet family that already ships release-readiness without a release-record path.

- Decision: F5C4D must start only from one completed `reporting` mission with `reportKind = "diligence_packet"`, one stored `diligence_packet` artifact, and derived release-readiness already at `approved_for_release`.
  Rationale: the first diligence release-log slice should consume one stored approved draft, not generic chat intake, not `finance_memo` directly, not `board_packet`, and not `lender_update`.

- Decision: F5C4D keeps `mission.type = "reporting"` and `reportKind = "diligence_packet"`.
  Rationale: reporting is already the first-class umbrella with the correct mission, replay, artifact, and proof semantics, so a second top-level mission family would widen the product boundary unnecessarily.

- Decision: F5C4D adds release logging and release recording only.
  Rationale: the next follow-on slice after shipped F5C4C should record that external release happened, not reopen approval-review posture and not claim delivery automation exists.

- Decision: the preferred persistence anchor remains the existing resolved `report_release` approval payload plus derived reporting and proof views.
  Rationale: the current approvals table, repository, and replay seams are already durable and transaction-safe, while the repo does not yet need a second release-tracking subsystem for one narrow diligence slice.

- Decision: the first F5C4D contract should add one explicit diligence release-record view with `released`, `releasedAt`, `releasedBy`, minimal `releaseChannel` metadata, optional `releaseNote`, the backing approval id, and a human-readable summary.
  Rationale: the repo needs one first-class diligence release-record surface that stays separate from draft posture, proof readiness, and release-readiness.

- Decision: F5C4D should widen the existing mission-centric `POST /missions/:missionId/reporting/release-log` route from lender-update-only to lender-update-plus-diligence while preserving the shipped lender-update behavior unchanged.
  Rationale: the current operator seam already matches the release-log action; the next slice should add exactly one additional supported report kind rather than inventing a second route family.

- Decision: reuse the existing `approval.release_logged` replay event family.
  Rationale: recording external diligence release changes mission-facing posture and therefore needs replay coverage, but the current event family is already the right semantic anchor.

- Decision: F5C4D stays deterministic, runtime-free, and delivery-free in the system sense.
  Rationale: Pocket CFO may record that diligence release happened externally, but it must not actually send, distribute, or publish anything in this slice.

- Decision: the first F5C4D slice allows exactly one release record per completed diligence-packet mission and treats duplicate retries as idempotent reads of the existing record rather than silent overwrites.
  Rationale: the narrowest safe first diligence release-record foundation is additive and immutable-by-default; edit or correction workflows can wait for a later explicit slice if they are needed.

- Decision: the later slice after F5C4D is `F5C4E-board-packet-review-or-circulation-readiness-foundation`, and only after that should bounded runtime-codex phrasing or formatting assistance be reconsidered if it still solves a proven operator problem.
  Rationale: later-F5 hardening should proceed as diligence release logging first, board circulation posture second, and optional runtime assistance only after those delivery-free foundations already exist.

- Decision: preserve existing `modules/reporting/**` vocabulary and do not reopen a `modules/reports/**` rename wave.
  Rationale: the current repo already uses `reporting` as first-class vocabulary, and this task is about truthfulness and sequencing rather than namespace churn.

- Decision: no new schema migration, new approval kind, new artifact kind, new replay-event type, or new environment variable is planned for the first F5C4D slice.
  Rationale: the current code audit shows the diligence release-log gap lives in existing approval payload usage, reporting helpers, proof rendering, and operator copy rather than in Postgres enums, tables, or env wiring, so additive code changes are the safer and narrower path.

## Context and Orientation

Pocket CFO has already shipped F4A through F4C2, with `plans/FP-0035-finance-policy-lookup-and-discovery-quality-hardening.md` as the shipped final F4 record.
Pocket CFO has also already shipped the full pre-F5C4D F5 chain:

- `plans/FP-0036-reporting-mission-foundation-and-first-finance-memo.md` as the shipped F5A reporting-foundation record
- `plans/FP-0037-draft-report-body-filed-artifact-and-markdown-export-hardening.md` as the shipped F5B reporting-reuse record
- `plans/FP-0038-board-packet-specialization-and-draft-review-foundation.md` as the shipped F5C1 board-packet record
- `plans/FP-0039-lender-update-specialization-and-draft-review-foundation.md` as the shipped F5C2 lender-update record
- `plans/FP-0040-diligence-packet-specialization-and-draft-review-foundation.md` as the shipped F5C3 diligence-packet record
- `plans/FP-0041-approval-review-and-first-lender-update-release-readiness.md` as the shipped F5C4A lender-update approval and release-readiness record
- `plans/FP-0042-release-log-and-first-lender-update-release-record-foundation.md` as the shipped F5C4B lender-update release-log and release-record record
- `plans/FP-0043-diligence-packet-approval-review-and-release-readiness.md` as the shipped F5C4C diligence approval and release-readiness record

That shipped baseline already means all of the following are repo truth today:

- `mission.type = "reporting"` and `sourceKind = "manual_reporting"`
- one deterministic `POST /missions/reporting` path from completed discovery work
- one draft `finance_memo`
- one linked `evidence_appendix`
- one draft `board_packet`
- one draft `lender_update`
- one draft `diligence_packet`
- one finance-facing `report_release` approval path for completed `lender_update` reporting missions
- one lender-update release-log and release-record path after approval on the existing `report_release` seam
- one finance-facing `report_release` approval path for completed `diligence_packet` reporting missions
- one diligence release-readiness posture with no diligence release-log yet

The repo still does not have any diligence-packet release-log or release-record path.
The pure approval payload already allows it, but the release-log preparation path, release-record view builders, and operator summaries are still lender-update-only.

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
- this active plan, `plans/FP-0044-release-log-and-first-diligence-packet-release-record-foundation.md`
- `docs/ops/local-dev.md`
- `docs/ops/source-ingest-and-cfo-wiki.md`
- `docs/ops/codex-app-server.md`
- `docs/benchmarks/seeded-missions.md`
- `evals/README.md`

GitHub connector work is out of scope.
The internal `@pocket-cto/*` package scope remains unchanged.
This thread is docs-only and must not add runtime code, routes, schema changes, migrations, package scripts, smoke commands, eval datasets, or implementation scaffolding.

The most relevant implementation seams for the next F5C4D code thread are:

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
- `apps/control-plane/src/modules/reporting/release-record.ts`
- `apps/control-plane/src/modules/reporting/artifact.ts`
- `apps/control-plane/src/modules/evidence/proof-bundle-summary.ts`
- `apps/control-plane/src/modules/evidence/proof-bundle-assembly.ts`
- `apps/control-plane/src/modules/missions/detail-view.ts`
- `apps/web/components/approval-card-list.tsx`
- `apps/web/components/reporting-output-card.tsx`
- `apps/web/components/mission-card.tsx`
- `apps/web/components/mission-list-card.tsx`
- `apps/web/app/missions/[missionId]/**`
- `apps/web/lib/api.ts`
- `tools/lender-update-release-log-smoke.mjs`
- add `tools/diligence-packet-release-log-smoke.mjs`
- `package.json`

## Plan of Work

F5C4 should now continue through one explicit diligence-focused release-record contract before it widens again.

First, implement `F5C4D` as one finance-facing release-log and release-record slice on top of the shipped `diligence_packet` reporting and approval path.
The new release-log path should start only from one completed `reporting` mission with `reportKind = "diligence_packet"`, one stored `diligence_packet` artifact, and derived release-readiness already at `approved_for_release`.
The reporting mission should stay succeeded as a draft-producing mission.
The release record should be persisted separately as an operator-entered release trace on top of the existing approval seam, not as a live runtime continuation and not as a delivery action.

Second, keep release-log persistence inside the existing approvals and reporting bounded contexts and reuse the existing approvals table, repository, replay events, list route, resolve route, and mission-scoped release-log route where possible.
The critical distinction remains behavioral rather than infrastructural: recording release must not require a live runtime session, must not resume a paused task, must not change a completed reporting mission back to `awaiting_approval`, and must not create a second release subsystem.
The only widening in this slice is that the same persisted release-log seam that already works for `lender_update` should also work for `diligence_packet`.

Third, widen the reporting, proof-bundle, mission-detail, mission-list, approval-card, and reporting-output read models just enough to show diligence release-record posture.
The derived release-readiness state should remain available and unchanged for both `lender_update` and `diligence_packet`.
The release-record surface should now become available for diligence while remaining separate from release-readiness.
For board packets, no approval, release-log, or circulation-readiness posture should be added in this slice.

Fourth, leave later sequencing explicit.
After F5C4D lands, the next thread should implement `F5C4E-board-packet-review-or-circulation-readiness-foundation`.
Only after that later review posture exists should the repo reconsider bounded runtime-codex phrasing or formatting assistance for packets.

## Concrete Steps

1. Confirm the pure domain and persistence contracts stay additive and reuse the existing release-record seam.
   Start from:
   - `packages/domain/src/approval.ts`
   - `packages/domain/src/reporting-mission.ts`
   - `packages/domain/src/proof-bundle.ts`
   - `packages/domain/src/mission-detail.ts`
   - `packages/domain/src/mission-list.ts`
   - `packages/domain/src/index.ts`

   F5C4D should:
   - keep `report_release` as the only finance-facing approval kind
   - keep `mission.type = "reporting"` and all current report kinds unchanged
   - reuse the existing nullable `releaseRecord` payload shape and release-record view types
   - avoid DB schema changes, replay-event enum changes, and new artifact kinds unless a concrete blocker appears during implementation

2. Retarget the existing mission-scoped release-log seam from lender-update-only to lender-update-plus-diligence while keeping the first new scope diligence-only.
   Update:
   - `apps/control-plane/src/modules/reporting/service.ts`
   - `apps/control-plane/src/modules/approvals/service.ts`
   - `apps/control-plane/src/modules/approvals/payload.ts`
   - `apps/control-plane/src/modules/missions/routes.ts`
   - `apps/control-plane/src/modules/missions/service.ts`

   F5C4D should:
   - reuse `POST /missions/:missionId/reporting/release-log`
   - require one completed `reporting` mission
   - require `reportKind = "diligence_packet"` for the first new path while preserving the shipped lender-update path
   - require one stored `diligence_packet` artifact
   - require derived release-readiness already at `approved_for_release`
   - persist one release record as a durable extension of the latest approved `report_release` approval instead of inventing a second release store
   - treat duplicate retries as idempotent reads of the existing record and avoid silent overwrites
   - append the existing `approval.release_logged` replay event only when the first diligence release record is actually created

3. Extend release-record helpers and read models from lender-update-only to lender-update-plus-diligence without widening beyond `diligence_packet`.
   Update:
   - `apps/control-plane/src/modules/reporting/release-record.ts`
   - `apps/control-plane/src/modules/reporting/release-readiness.ts`
   - `apps/control-plane/src/modules/reporting/artifact.ts`
   - `apps/control-plane/src/modules/evidence/proof-bundle-summary.ts`
   - `apps/control-plane/src/modules/evidence/proof-bundle-assembly.ts`
   - `apps/control-plane/src/modules/missions/detail-view.ts`

   F5C4D should:
   - surface one explicit diligence release-record view with `released`, `releasedAt`, `releasedBy`, `releaseChannel`, `releaseNote`, `approvalId`, and summary
   - keep proof-bundle readiness tied to stored report artifacts rather than release logging
   - keep freshness, limitations, provenance, and reviewer trace explicit after release is logged
   - keep release-readiness and release-record posture as distinct concepts rather than collapsing them into one status field

4. Extend the operator surfaces for the first diligence release-record path and add one packaged local proof.
   Update:
   - `apps/web/components/approval-card-list.tsx`
   - `apps/web/components/reporting-output-card.tsx`
   - `apps/web/components/mission-card.tsx`
   - `apps/web/components/mission-list-card.tsx`
   - `apps/web/app/missions/[missionId]/mission-actions.tsx`
   - `apps/web/app/missions/[missionId]/actions.ts`
   - `apps/web/lib/api.ts`
   - add `tools/diligence-packet-release-log-smoke.mjs`
   - update `package.json`

   F5C4D should:
   - show the diligence release-record summary and fields without changing the shipped lender-update wording contract
   - keep board-packet review or circulation posture out of the UI in this slice
   - add one packaged `pnpm smoke:diligence-packet-release-log:local` proof
   - keep the existing lender-update release-approval and release-log smokes as shipped baseline coverage

5. Refresh only the smallest stale guidance that the landed F5C4D code would invalidate.
   Update only where the shipped behavior would change active guidance.
   Do not create `FP-0045` in the F5C4D implementation thread, and do not reopen the broader doc set if no new truth gap appears during implementation.

## Validation and Acceptance

The shipped F5C4D implementation reran the full preserved confidence ladder on the working branch and added the new diligence release-log proof.
The commands below now describe the validation set that passed for this slice, including the final `pnpm ci:repro:current` clean-worktree reproduction.

Targeted future test batches:

- `pnpm --filter @pocket-cto/domain exec vitest run src/approval.spec.ts src/reporting-mission.spec.ts src/proof-bundle.spec.ts src/mission-detail.spec.ts src/mission-list.spec.ts`
- `zsh -lc "cd apps/control-plane && pnpm exec vitest run src/modules/approvals/service.spec.ts src/modules/approvals/card-formatter.spec.ts src/modules/reporting/service.spec.ts src/modules/missions/routes.spec.ts src/modules/missions/service.spec.ts src/modules/missions/detail-view.spec.ts src/modules/evidence/proof-bundle-assembly.spec.ts"`
- `zsh -lc "cd apps/web && pnpm exec vitest run \"components/reporting-output-card.spec.tsx\" \"components/mission-card.spec.tsx\" \"components/mission-list-card.spec.tsx\" \"app/missions/[missionId]/mission-actions.spec.tsx\" \"lib/api.spec.ts\""`

Preserved finance proof ladder plus the new F5C4D proof:

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

Preserved targeted twin regressions and repo-wide gates:

- `pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/twin/workflow-sync.spec.ts src/modules/twin/test-suite-sync.spec.ts src/modules/twin/codeowners-discovery.spec.ts`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm ci:repro:current`

Implementation acceptance for F5C4D is:

- one completed `reporting` mission with `reportKind = "diligence_packet"`, one stored `diligence_packet` artifact, and derived release-readiness already at `approved_for_release` can log external release through the existing mission-scoped release-log route
- one explicit diligence `releaseRecord` renders truthfully across reporting detail, proof bundle, mission detail, mission list, and approval cards with `released`, `releasedAt`, `releasedBy`, minimal release-channel metadata, and preserved reviewer trace
- duplicate release-log retries are idempotent and do not overwrite the first persisted release record
- the shipped lender-update release-log path remains intact
- proof bundles and reporting read models keep freshness posture, limitations, provenance, and release-readiness visible rather than collapsing them into a single release flag
- no send, distribute, publish, board-packet circulation posture, PDF export, slide export, runtime-codex drafting, or new mission family is introduced

## Idempotence and Recovery

This docs-only handoff is safe to rerun because it only creates one new plan and refreshes active guidance.
If this thread uncovers a broader problem than handoff truthfulness, stop and record it here rather than widening into runtime code.

The planned F5C4D implementation should remain additive and code-only.
No raw source files, source snapshots, wiki exports, or release records should be mutated in place.
Duplicate diligence release-log requests must be idempotent against the existing `report_release` seam and should return the stored release record instead of replacing it.
If a code attempt widens board-packet posture, multi-packet release logging, or runtime-codex behavior, roll that widening back and keep the shipped lender-update and shipped diligence-approval paths untouched.
If a concrete implementation blocker appears that truly requires schema work, pause and update this plan before making the change, because no schema migration is currently part of the intended slice.

## Artifacts and Notes

This shipped F5C4D slice leaves:

- `plans/FP-0044-release-log-and-first-diligence-packet-release-record-foundation.md` as the shipped implementation record
- refreshed active docs that now point the next contributor at later-F5 work rather than back at `FP-0043`
- `plans/FP-0043-diligence-packet-approval-review-and-release-readiness.md` preserved as the shipped F5C4C record
- one persisted diligence `releaseRecord` on one completed approved-for-release `diligence_packet` reporting mission through the existing `report_release` approval seam
- one derived diligence release-record view across reporting, proof, mission, and approval-card surfaces
- one packaged `pnpm smoke:diligence-packet-release-log:local` proof
- no system delivery, no board-packet circulation posture, and no runtime-codex artifacts

## Interfaces and Dependencies

The critical package and module boundaries for F5C4D are:

- `packages/domain` stays the pure contract layer; keep changes there minimal and additive
- `apps/control-plane/src/modules/reporting/**` remains the primary owner of reporting release-log preparation and reporting read-model shaping
- `apps/control-plane/src/modules/approvals/**` remains the persistence anchor for `report_release` payloads and `approval.release_logged` replay
- `apps/control-plane/src/modules/missions/**` keeps mission-scoped routes thin and must not absorb reporting service logic
- `apps/control-plane/src/modules/evidence/**` remains responsible for proof-bundle summaries and evidence posture
- `apps/web/**` stays read-model-only and must not infer release semantics from raw artifacts directly
- `packages/db` should not need schema changes for this slice; if that assumption breaks, pause and update the plan first
- `packages/config`, runtime env parsing, and App Server transport should remain untouched

No new environment variables are expected.
No GitHub connector work is in scope.
Keep `modules/reporting/**` vocabulary intact.
Keep runtime-codex out of the first F5C4D implementation path.

## Outcomes & Retrospective

This file now records the shipped first real F5C4D implementation slice rather than only the pre-code handoff.
The slice widens the existing mission-scoped release-log seam from lender-update-only to lender-update-plus-diligence, persists the first diligence release record on the existing resolved `report_release` approval payload, surfaces explicit release-record posture across reporting, mission, proof-bundle, approval-card, and web read models, and adds one packaged `pnpm smoke:diligence-packet-release-log:local` proof without claiming delivery automation.
`FP-0043` remains the shipped F5C4C diligence approval and release-readiness record.

What remains after this shipped F5C4D slice is later-F5 sequencing rather than more design work inside F5C4D:

- preserve the shipped lender-update and diligence release-log paths
- narrow the next implementation step to F5C4E board-packet review or circulation readiness
- reconsider bounded runtime-codex phrasing or formatting assistance only after those later delivery-free foundations exist
