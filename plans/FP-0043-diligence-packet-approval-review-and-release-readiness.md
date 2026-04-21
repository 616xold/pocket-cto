# Define F5C4C diligence packet approval review and release readiness

## Purpose / Big Picture

This plan is the active F5 implementation contract for the first real F5C4C diligence approval-review and release-readiness slice.
The target phase is `F5`, and the next execution slice is `F5C4C-diligence-packet-approval-review-and-release-readiness`.
The user-visible goal is narrow and concrete: after the shipped F5A through F5C4B baseline already creates draft `finance_memo`, `board_packet`, `lender_update`, and `diligence_packet` artifacts, supports one finance-facing `report_release` approval path plus release logging for `lender_update`, and keeps delivery outside the system, Pocket CFO should next let an operator request review on one completed `diligence_packet` reporting mission, resolve that review through the existing approvals bounded context, and see one explicit release-readiness posture for diligence without widening into actual send, distribute, publish, diligence release logging, board-packet review or circulation posture, runtime-codex drafting, or non-markdown output work.

This matters now because the remaining repo gap is no longer packet specialization and no longer lender-update release recording.
The remaining gap is that the approval payload and release-readiness helpers are still lender-update-only, and before this handoff the approval-module docs plus active guidance set still pointed the next later-F5 step at lender-update-only follow-on work.
The next gain is therefore one narrow contract that widens the existing `report_release` and release-readiness seam from lender-update-only to `lender_update` plus `diligence_packet`, and no broader.

GitHub connector work is explicitly out of scope.
This plan does not authorize actual send, distribute, publish, diligence release logging, board-packet review or circulation readiness, bounded runtime-codex phrasing or formatting assistance, PDF export, slide export, Marp export, F6 monitoring, or any rename from `modules/reporting/**` to `modules/reports/**`.
The current thread is the first real implementation pass against this contract, so the plan must stay live as domain, control-plane, web, smoke, and validation work lands.

## Progress

- [x] 2026-04-20T23:45:32Z Audit the active docs, shipped F5A through F5C4B records, approval-domain contracts, reporting and evidence seams, runtime-codex boundary, and stale later-F5 wording before choosing the narrowest truthful F5C4C scope.
- [x] 2026-04-20T23:45:32Z Create `plans/FP-0043-diligence-packet-approval-review-and-release-readiness.md` and refresh the smallest truthful active-doc set so `plans/FP-0042-release-log-and-first-lender-update-release-record-foundation.md` remains the shipped F5C4B record while this file becomes the single active F5C4C implementation contract.
- [x] 2026-04-20T23:55:55Z Run the requested docs-and-plan validation ladder for this master-plan handoff without starting F5C4C code.
- [x] 2026-04-21T00:04:36Z Re-open the active F5C4C contract for the first real implementation thread, explicitly invoke the required repo skills in-thread, audit the current branch and active plan chain, and record the pre-edit verdict: widen only the lender-update-only approval payload, release-readiness helpers, request-preparation path, proof narratives, and operator copy so `diligence_packet` can reuse the shipped runtime-free `report_release` seam without adding diligence release logging, board circulation posture, new approval kinds, or runtime-codex behavior.
- [x] 2026-04-21T01:06:18Z Implement `F5C4C-diligence-packet-approval-review-and-release-readiness` exactly as defined here: widen the existing `report_release` approval payload and release-readiness seams from lender-update-only to `lender_update` plus `diligence_packet`, add one mission-centric diligence review request path and one derived release-ready posture, keep the slice deterministic, runtime-free, delivery-free, and release-log-free, and preserve the shipped lender-update release-log proof contract while doing so.
- [x] 2026-04-21T01:37:41Z Run the preserved source-ingest through lender-update-release-log confidence ladder, add the narrowest diligence-approval proof coverage, and keep repo-wide validation green without starting F5C4D, F5C4E, or F6. This thread finished green on the requested focused Vitest sweeps, the exact domain/control-plane/web validation commands, all shipped baseline smokes, the new `pnpm smoke:diligence-packet-release-approval:local`, the preserved twin guardrails, `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm ci:repro:current`.

## Surprises & Discoveries

- Observation: the current lender-update-only limitation is still encoded in the pure approval and reporting contracts rather than only in docs.
  Evidence: `packages/domain/src/approval.ts` still fixes `ReportReleaseApprovalPayloadSchema.reportKind` to `"lender_update"`, while `apps/control-plane/src/modules/reporting/release-readiness.ts` still returns `null` unless `reportKind === "lender_update"`.

- Observation: the repo already ships the first release-log step on top of the existing `report_release` seam, so some approval-module and active-doc wording is one step behind current reality.
  Evidence: `apps/control-plane/src/modules/approvals/service.ts` already persists `releaseRecord` and appends `approval.release_logged`, but `apps/control-plane/src/modules/approvals/README.md` still lists release logging as a non-goal and `plans/ROADMAP.md` plus `docs/ops/source-ingest-and-cfo-wiki.md` still describe lender-update release logging as the active next step.

- Observation: the existing approvals substrate is already wide enough for diligence review without inventing a second approval system or a second mission family.
  Evidence: `apps/control-plane/src/modules/approvals/service.ts`, `routes.ts`, `repository.ts`, and `events.ts` already own durable approval persistence, replay, resolution, and list behavior, while `packages/domain/src/reporting-mission.ts` and `apps/control-plane/src/modules/reporting/**` already model `diligence_packet` inside `mission.type = "reporting"`.

- Observation: board-packet review or circulation posture is a distinct later problem from diligence approval-readiness.
  Evidence: the repo already ships `board_packet` as a draft specialization, but the current release-readiness copy, approval-card copy, and release-record posture all assume lender-specific external communication semantics rather than board-circulation semantics.

- Observation: the main work of this thread is active-plan truthfulness, not implementation unblockers inside the finance evidence spine.
  Evidence: source ingest, Finance Twin, CFO Wiki, discovery, reporting specialization, lender-update approval, and lender-update release logging are all already packaged and validated; the remaining gap is one narrow later-F5 successor contract plus doc truthfulness around it.

- Observation: the first real implementation thread confirmed the remaining work is branchy and copy-heavy rather than infrastructural.
  Evidence: `apps/control-plane/src/modules/reporting/service.ts`, `apps/control-plane/src/modules/reporting/release-readiness.ts`, `apps/control-plane/src/modules/reporting/release-record.ts`, `apps/control-plane/src/modules/evidence/proof-bundle-summary.ts`, `apps/control-plane/src/modules/evidence/proof-bundle-assembly.ts`, `apps/control-plane/src/modules/approvals/card-formatter.ts`, and `apps/web/app/missions/[missionId]/mission-actions.tsx` already contain the full lender-update seam, but they hard-code lender-only report-kind checks and summary copy instead of using a wider shared report-release path.

- Observation: one shipped F5C4B smoke depends on lender-specific approval-card wording, so the widening had to keep that exact lender summary stable while generalizing the rest of the release-approval copy.
  Evidence: `tools/lender-update-release-log-smoke.mjs` asserts the rendered approval summary text `External lender-update release is logged`, so `apps/control-plane/src/modules/approvals/card-formatter.ts` needed a narrow lender-only wording branch even after `report_release` widened to `diligence_packet`.

## Decision Log

- Decision: the first real F5C4C scope is `F5C4C-diligence-packet-approval-review-and-release-readiness`.
  Rationale: the repo needs one narrow successor contract rather than a generic “broader packet approval widening” umbrella.

- Decision: the first artifact family in F5C4C is exactly `diligence_packet`.
  Rationale: diligence already exists as a stored packet artifact, while board review or circulation posture is a distinct later operator problem.

- Decision: F5C4C must start only from one completed `reporting` mission with `reportKind = "diligence_packet"` and one stored `diligence_packet` artifact.
  Rationale: the first approval widening should stay reporting-grounded and artifact-grounded, not generic chat, not `finance_memo` directly, not `board_packet`, and not `lender_update`.

- Decision: F5C4C keeps `mission.type = "reporting"` and specializes through `reportKind`.
  Rationale: reporting already owns the right replay, artifact, and proof semantics, so a second top-level mission family would widen the product boundary unnecessarily.

- Decision: F5C4C adds review request, approval resolution, and `approved_for_release` posture only for `diligence_packet`.
  Rationale: the first diligence review slice should make external-communication posture explicit without claiming delivery or release logging.

- Decision: F5C4C reuses the existing approvals bounded context and the existing `report_release` approval kind rather than inventing a second approval system.
  Rationale: persistence, replay, listing, and resolution seams already exist; the missing work is widening payload and read-model semantics.

- Decision: finance `report_release` approvals remain durable operator decisions, not live runtime continuations.
  Rationale: diligence review is not a paused runtime command and must continue to resolve safely in `api_only` mode without task resume behavior.

- Decision: F5C4C widens the existing `report_release` payload and release-readiness/reporting view seams from lender-update-only to `lender_update` plus `diligence_packet`, and no broader.
  Rationale: the next code thread should preserve the shipped lender-update path while adding the smallest additive diligence widening.

- Decision: F5C4C remains deterministic and runtime-free.
  Rationale: stored reporting artifacts plus the existing approvals seam are sufficient for the first diligence review contract.

- Decision: F5C4C remains delivery-free in the system sense.
  Rationale: release-readiness is the goal; actual send, distribute, publish, and diligence release logging remain later work.

- Decision: the later slices after F5C4C are `F5C4D-release-log-and-first-diligence-packet-release-record-foundation` followed by `F5C4E-board-packet-review-or-circulation-readiness-foundation`; only after those later slices should bounded runtime-codex phrasing or formatting assistance be reconsidered.
  Rationale: this sequence preserves one strong diligence review slice, then diligence release logging, then board-specific circulation posture, instead of widening into multi-packet or runtime behavior early.

- Decision: preserve existing `modules/reporting/**` vocabulary and do not reopen a `modules/reports/**` rename wave.
  Rationale: the current repo already uses reporting as first-class vocabulary, and this task is about truthfulness and sequencing rather than namespace churn.

- Decision: keep F5C4C additive and schema-free unless a concrete typed blocker appears during implementation.
  Rationale: the current code audit shows the diligence gap lives in pure Zod contracts, reporting helpers, proof rendering, approval-card formatting, and operator actions rather than in Postgres enums, tables, or replay-event types, so additive code changes are the safer and narrower path.

- Decision: preserve the shipped lender-update approval-card summary wording while widening the rest of the release-approval seam.
  Rationale: the lender-update release-log proof already treats that rendered summary as part of the observable contract, so changing it inside F5C4C would create an unnecessary regression outside the diligence scope.

## Context and Orientation

Pocket CFO has already shipped F4A through F4C2, with `plans/FP-0035-finance-policy-lookup-and-discovery-quality-hardening.md` as the shipped final F4 record.
Pocket CFO has also already shipped the full pre-F5C4C F5 chain:

- `plans/FP-0036-reporting-mission-foundation-and-first-finance-memo.md` as the shipped F5A reporting-foundation record
- `plans/FP-0037-draft-report-body-filed-artifact-and-markdown-export-hardening.md` as the shipped F5B reporting-reuse record
- `plans/FP-0038-board-packet-specialization-and-draft-review-foundation.md` as the shipped F5C1 board-packet record
- `plans/FP-0039-lender-update-specialization-and-draft-review-foundation.md` as the shipped F5C2 lender-update record
- `plans/FP-0040-diligence-packet-specialization-and-draft-review-foundation.md` as the shipped F5C3 diligence-packet record
- `plans/FP-0041-approval-review-and-first-lender-update-release-readiness.md` as the shipped F5C4A lender-update approval and release-readiness record
- `plans/FP-0042-release-log-and-first-lender-update-release-record-foundation.md` as the shipped F5C4B lender-update release-log and release-record record

That shipped baseline already means all of the following are repo truth today:

- `mission.type = "reporting"` and `sourceKind = "manual_reporting"`
- one deterministic `POST /missions/reporting` path from completed discovery work
- one draft `finance_memo`
- one linked `evidence_appendix`
- one draft `board_packet`
- one draft `lender_update`
- one draft `diligence_packet`
- one finance-facing `report_release` approval path for completed `lender_update` reporting missions
- one lender-update-only derived release-readiness posture
- one lender-update-only release-log and release-record path on the existing `report_release` approval seam

The repo still does not have any diligence-packet approval or release-readiness path.
The pure domain payload is still lender-update-only.
The reporting release-readiness helpers and web copy are still lender-update-only.
Before this handoff, the approvals module README and multiple active docs still framed lender-update release logging as the next hardening step even though that slice was already shipped.

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
- this active plan, `plans/FP-0043-diligence-packet-approval-review-and-release-readiness.md`
- `docs/ops/local-dev.md`
- `docs/ops/source-ingest-and-cfo-wiki.md`
- `docs/ops/codex-app-server.md`
- `docs/benchmarks/seeded-missions.md`
- `evals/README.md`
- `apps/control-plane/src/modules/approvals/README.md`

GitHub connector work is out of scope.
The internal `@pocket-cto/*` package scope remains unchanged.
This thread is docs-only and must not add runtime code, routes, schema changes, migrations, package scripts, smoke commands, eval datasets, or implementation scaffolding.

The most relevant implementation seams for the next F5C4C code thread are:

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
- `tools/lender-update-release-approval-smoke.mjs`
- `tools/lender-update-release-log-smoke.mjs`

## Plan of Work

F5C4 should now continue through one explicit diligence-focused approval contract before it widens again.

First, implement `F5C4C` as one finance-facing approval and release-readiness slice on top of the shipped `diligence_packet` reporting path.
The new review path should start only from one completed `reporting` mission with `reportKind = "diligence_packet"` and one stored `diligence_packet` artifact.
The reporting mission should stay succeeded as a draft-producing mission.
The new approval should be persisted separately as a finance review trace, not as a live runtime pause.
That means F5C4C should widen the existing typed `report_release` contract rather than inventing a second approval kind or a second release-readiness system.

Second, keep approval request and approval resolution inside the existing approvals bounded context and reuse the existing approvals table, repository, replay events, list route, and resolve route where possible.
The critical distinction remains behavioral rather than infrastructural: finance review approvals must not require an in-memory runtime session, must not resume a paused task, must not push a completed reporting mission back into `awaiting_approval`, and must not require `liveControl.enabled` for resolution.
The only widening in this slice is that the same persisted approval seam that already works for `lender_update` should also work for `diligence_packet`.

Third, widen the reporting, proof-bundle, mission-detail, mission-list, approval-card, and reporting-output read models just enough to show diligence review posture.
The derived release-readiness state should be available for both `lender_update` and `diligence_packet`.
The released-state or release-record surface should remain separate.
For diligence, that release-record surface should stay `null` and unavailable until `F5C4D`.
For board packets, no approval or circulation-readiness posture should be added in this slice.

Fourth, leave later sequencing explicit.
After F5C4C lands, the next thread should implement `F5C4D-release-log-and-first-diligence-packet-release-record-foundation`.
After that, the repo can tackle `F5C4E-board-packet-review-or-circulation-readiness-foundation`.
Only after those later review and delivery-free foundations exist should the repo reconsider bounded runtime-codex phrasing or formatting assistance for packets.

## Concrete Steps

1. Widen the pure approval and reporting contracts without adding a new mission family or a new approval kind.
   Update:
   - `packages/domain/src/approval.ts`
   - `packages/domain/src/reporting-mission.ts`
   - `packages/domain/src/proof-bundle.ts`
   - `packages/domain/src/mission-detail.ts`
   - `packages/domain/src/mission-list.ts`
   - `packages/domain/src/index.ts`

   F5C4C should:
   - widen `ReportReleaseApprovalPayloadSchema.reportKind` from lender-update-only to `z.enum(["lender_update", "diligence_packet"])`
   - preserve the existing `releaseRecord` field as a nullable future-sequencing seam without logging diligence release in this slice
   - allow release-readiness views and proof-bundle summaries to represent `diligence_packet` as well as `lender_update`
   - keep `mission.type = "reporting"` and all current report kinds unchanged
   - avoid DB schema changes unless a concrete typed gap appears during implementation; no additive enum or table work is planned for this slice

2. Retarget the approvals bounded context for diligence review approvals without inventing a second approval system.
   Update:
   - `apps/control-plane/src/modules/approvals/service.ts`
   - `apps/control-plane/src/modules/approvals/schema.ts`
   - `apps/control-plane/src/modules/approvals/routes.ts`
   - `apps/control-plane/src/modules/approvals/payload.ts`
   - `apps/control-plane/src/modules/approvals/card-formatter.ts`
   - `apps/control-plane/src/modules/approvals/README.md`

   F5C4C should:
   - reuse the approvals table, repository, `approval.requested`, and `approval.resolved` replay events
   - continue to use `report_release` as the only finance-facing approval kind in this slice
   - allow the existing request path to create `report_release` approvals for completed `diligence_packet` reporting missions with one stored `diligence_packet` artifact
   - keep `taskId = null`, skip live runtime delivery and task resume behavior, and avoid changing completed reporting missions back to `awaiting_approval`
   - make duplicate request retries idempotent by returning the existing pending or latest applicable `report_release` approval for that mission instead of creating duplicates
   - leave `approval.release_logged` behavior unchanged and lender-update-only until F5C4D

3. Extend the mission-centric request path and reporting read models from lender-update-only to lender-update-plus-diligence.
   Update:
   - `apps/control-plane/src/modules/missions/routes.ts`
   - `apps/control-plane/src/modules/missions/service.ts`
   - `apps/control-plane/src/modules/reporting/service.ts`
   - `apps/control-plane/src/modules/reporting/release-readiness.ts`
   - `apps/control-plane/src/modules/reporting/release-record.ts`
   - `apps/control-plane/src/modules/reporting/artifact.ts`

   F5C4C should:
   - widen the existing `POST /missions/:missionId/reporting/release-approval` contract from lender-update-only to `lender_update` plus `diligence_packet`
   - require one completed `reporting` mission, one supported `reportKind`, and one stored matching packet artifact
   - reject `finance_memo`, `board_packet`, incomplete reporting missions, and missing packet artifacts
   - derive `not_requested`, `pending_review`, `approved_for_release`, or `not_approved_for_release` for `diligence_packet` while keeping `releaseRecord` absent and release logging unavailable for diligence in this slice

4. Extend evidence and operator read models for diligence review posture, not delivery.
   Update:
   - `apps/control-plane/src/modules/evidence/proof-bundle-summary.ts`
   - `apps/control-plane/src/modules/evidence/proof-bundle-assembly.ts`
   - `apps/control-plane/src/modules/missions/detail-view.ts`
   - `apps/web/components/approval-card-list.tsx`
   - `apps/web/components/reporting-output-card.tsx`
   - `apps/web/components/mission-card.tsx`
   - `apps/web/components/mission-list-card.tsx`
   - `apps/web/app/missions/[missionId]/mission-actions.tsx`
   - `apps/web/app/missions/[missionId]/actions.ts`
   - `apps/web/lib/api.ts`

   F5C4C should:
   - carry the latest finance approval trace and release-readiness posture across proof bundle, mission detail, mission list, approval cards, and reporting detail for `diligence_packet`
   - keep freshness, limitations, provenance, reviewer trace, and draft posture explicit
   - distinguish `approved_for_release` posture from later `releaseRecord` posture
   - keep the shipped lender-update release-log surfaces intact and leave `board_packet` without approval or circulation-readiness posture in this slice

5. Add the narrowest proof coverage for the new diligence approval path.
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
   - `apps/control-plane/src/modules/missions/detail-view.spec.ts`
   - `apps/control-plane/src/modules/evidence/proof-bundle-assembly.spec.ts`
   - `apps/web/components/reporting-output-card.spec.tsx`
   - `apps/web/components/mission-card.spec.tsx`
   - `apps/web/components/mission-list-card.spec.tsx`
   - `apps/web/app/missions/[missionId]/mission-actions.spec.tsx`
   - `apps/web/lib/api.spec.ts`
   - add `tools/diligence-packet-release-approval-smoke.mjs`
   - update `package.json`

   F5C4C should:
   - add one packaged `pnpm smoke:diligence-packet-release-approval:local` proof for the new diligence review path
   - avoid adding any diligence release-log smoke or delivery automation proof in this slice
   - keep the existing lender-update release-approval and release-log smokes as shipped baseline coverage

6. Refresh only the smallest stale guidance that the implementation thread actually invalidates.
   Update only where the landed F5C4C code would make current wording stale.
   Do not reopen the broader doc set if no new truth gap appears during implementation.

## Validation and Acceptance

The current docs-only handoff thread should rerun the full requested validation ladder without starting F5C4C code.
The next F5C4C implementation thread should rerun that preserved ladder plus one new diligence-approval proof.

Targeted future test batches:

- `pnpm --filter @pocket-cto/domain exec vitest run src/approval.spec.ts src/reporting-mission.spec.ts src/proof-bundle.spec.ts src/mission-detail.spec.ts src/mission-list.spec.ts`
- `zsh -lc "cd apps/control-plane && pnpm exec vitest run src/modules/approvals/service.spec.ts src/modules/approvals/card-formatter.spec.ts src/modules/reporting/service.spec.ts src/modules/missions/routes.spec.ts src/modules/missions/service.spec.ts src/modules/missions/detail-view.spec.ts src/modules/evidence/proof-bundle-assembly.spec.ts"`
- `zsh -lc "cd apps/web && pnpm exec vitest run \"components/reporting-output-card.spec.tsx\" \"components/mission-card.spec.tsx\" \"components/mission-list-card.spec.tsx\" \"app/missions/[missionId]/mission-actions.spec.tsx\" \"lib/api.spec.ts\""`

Preserved finance proof ladder plus the new F5C4C proof:

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

Preserved targeted twin regressions and repo-wide gates:

- `pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/twin/workflow-sync.spec.ts src/modules/twin/test-suite-sync.spec.ts src/modules/twin/codeowners-discovery.spec.ts`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm ci:repro:current`

Implementation acceptance for F5C4C is:

- one completed `reporting` mission with `reportKind = "diligence_packet"` and one stored `diligence_packet` artifact can request a persisted `report_release` approval
- that approval can be resolved without live runtime continuation
- `releaseReadiness` renders truthfully as `not_requested`, `pending_review`, `approved_for_release`, or `not_approved_for_release` for diligence
- proof bundle, reporting detail, mission detail, mission list, and approval cards all expose reviewer trace, freshness posture, limitations, and draft posture explicitly
- `releaseRecord` remains absent for diligence in this slice, and no system delivery, release logging, PDF export, slide export, or board-packet widening is introduced

## Idempotence and Recovery

This docs-only handoff is safe to rerun because it only creates one new plan and refreshes active guidance.
If this thread uncovers a broader problem than handoff truthfulness, stop and record it here rather than widening into runtime code.

The planned F5C4C implementation should remain additive and code-only.
No raw source files, source snapshots, wiki exports, or release records should be mutated in place.
Duplicate diligence review requests must be idempotent against the existing `report_release` seam.
If a code attempt widens board-packet posture, diligence release logging, or runtime-codex behavior, roll that widening back and keep the shipped lender-update path untouched.
If a concrete implementation blocker appears that truly requires schema work, pause and update this plan before making the change, because no schema migration is currently part of the intended slice.

## Artifacts and Notes

This docs-only handoff should leave:

- one new active plan at `plans/FP-0043-diligence-packet-approval-review-and-release-readiness.md`
- refreshed active docs that point the next contributor at this exact F5C4C contract
- `plans/FP-0042-release-log-and-first-lender-update-release-record-foundation.md` preserved as the shipped F5C4B record

The next F5C4C implementation thread should produce:

- one persisted `report_release` approval trace on one completed `diligence_packet` reporting mission
- one derived diligence release-readiness view across reporting, proof, mission, and approval-card surfaces
- one packaged `pnpm smoke:diligence-packet-release-approval:local` proof
- no diligence `releaseRecord` yet
- no send, distribute, publish, release-log, PDF, slide, or runtime-codex artifacts

## Interfaces and Dependencies

The critical package and module boundaries for F5C4C are:

- `packages/domain` for pure approval, reporting, proof-bundle, mission-detail, and mission-list contracts
- `apps/control-plane/src/modules/approvals/**` for approval persistence, replay, resolution, payload parsing, and approval-card formatting
- `apps/control-plane/src/modules/reporting/**` for release-readiness derivation and reporting views
- `apps/control-plane/src/modules/evidence/**` for proof-bundle shaping
- `apps/control-plane/src/modules/missions/**` for thin request routes and mission read models
- `apps/web/**` for operator-facing review and release-readiness rendering

Key dependencies and boundary rules:

- keep `mission.type = "reporting"` as the only umbrella
- keep `report_release` as the only finance-facing approval kind in this slice
- keep live runtime continuation behavior restricted to runtime approvals only
- keep raw sources, Finance Twin state, and CFO Wiki state as the evidence authority, with approvals and release-readiness derived from stored reporting artifacts plus persisted approval state
- keep `modules/reporting/**` vocabulary unchanged
- keep GitHub connector work out of scope
- add no new environment variables
- use `tools/lender-update-release-approval-smoke.mjs` and `tools/lender-update-release-log-smoke.mjs` as the shipped reference patterns for the new diligence approval proof

## Outcomes & Retrospective

This file now records the shipped first real F5C4C implementation slice rather than only the pre-code handoff.
The repo now truthfully supports one additional external-facing report family on the existing approval seam: a completed `diligence_packet` reporting mission with exactly one stored `diligence_packet` artifact can request `report_release`, resolve that approval without any live runtime continuation, and surface `approved_for_release` or related release-readiness posture across proof bundles, mission detail, mission list, mission cards, reporting cards, and approval cards.
The slice stayed additive and deterministic: no DB schema changes, no new approval kinds, no new artifact kinds, no diligence release logging, no actual send or distribution behavior, no board-packet widening, no PDF or slide export, and no runtime-codex drafting were introduced.

The only active-doc refresh inside the slice was the approvals-module README plus this live plan record.
`FP-0042` remains the shipped F5C4B lender-update release-log record.
`FP-0043` is now complete as the shipped F5C4C diligence approval-review and release-readiness record.

What remains is later F5C4 sequencing rather than more F5C4C continuation:

- start `F5C4D-release-log-and-first-diligence-packet-release-record-foundation` next
- keep board-packet review or circulation posture for `F5C4E`
- reconsider bounded runtime-codex phrasing or formatting assistance only after those later delivery-free foundations exist
