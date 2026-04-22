# Define F5C4G board-packet circulation-record correction and chronology foundation

## Purpose / Big Picture

This file is now the active F5C4G implementation contract created by a docs-and-plan-only handoff slice.
`plans/FP-0046-circulation-log-and-first-board-packet-circulation-record-foundation.md` remains the shipped F5C4F record that precedes it.
The target phase is `F5`, and the next execution slice is `F5C4G-board-packet-circulation-record-correction-and-chronology-foundation`.
The user-visible goal is narrow and concrete: after the shipped F5A through F5C4F baseline already creates one draft `board_packet`, resolves one internal `report_circulation` approval, and records one explicit board-packet circulation record on that same approval seam, Pocket CFO should next let an operator append immutable corrections to that existing circulation record and see one explicit chronology plus one derived current effective circulation view without widening into actual send, distribute, publish, PDF or slide export, runtime-codex drafting, or a broader later-F5 umbrella.

This matters now because the repo no longer lacks board review posture or first circulation logging.
The current gap is narrower: the existing `report_circulation` seam holds one original circulation record, but the repo still has no immutable correction history and no first-class chronology ergonomics for operators, proof bundles, or approval cards.
The next gain is therefore not more packet families, not delivery automation, and not F6.
It is one board-specific correction-and-chronology contract that a new thread can execute directly.

GitHub connector work is explicitly out of scope.
This plan does not authorize actual send, distribute, publish, external communication automation, runtime-codex drafting or circulation behavior, PDF export, slide export, Marp export, broader packet widening, or any rename from `modules/reporting/**` to `modules/reports/**`.

## Progress

- [x] 2026-04-22T00:55:41Z Audit the shipped F5A through F5C4F chain, active docs, reporting and approvals seams, proof-bundle posture, runtime-codex boundary, and current board-circulation truth before choosing the narrowest truthful F5C4G successor contract.
- [x] 2026-04-22T00:55:41Z Create `plans/FP-0047-board-packet-circulation-record-correction-and-chronology-foundation.md` and refresh the smallest truthful active-doc set so `plans/FP-0046-circulation-log-and-first-board-packet-circulation-record-foundation.md` remains the shipped F5C4F record while this file becomes the single active implementation contract.
- [x] 2026-04-22T01:05:41Z Run the requested docs-and-plan validation ladder for this handoff without starting F5C4G code; the preserved smokes, targeted twin Vitest sweep, `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm ci:repro:current` all finished green, and the few shell-mangled commands from the first interactive batch were rerun exactly and passed.

## Surprises & Discoveries

- Observation: the current repo already uses the exact persistence seam the next slice should reuse.
  Evidence: `packages/domain/src/approval.ts`, `apps/control-plane/src/modules/approvals/service.ts`, and `apps/control-plane/src/modules/reporting/service.ts` already persist one immutable `circulationRecord` inside the resolved `report_circulation` approval payload and route mission-scoped circulation-log work through that seam.

- Observation: the remaining gap is chronology and correction semantics, not missing board-packet reporting infrastructure.
  Evidence: `apps/control-plane/src/modules/reporting/circulation-record.ts`, `apps/control-plane/src/modules/evidence/proof-bundle-summary.ts`, `apps/web/components/reporting-output-card.tsx`, and `apps/web/components/mission-list-card.tsx` still expose one original record summary only and do not model append-only correction history or a derived effective current view.

- Observation: the current F5C4F baseline already enforces the correct input contract for the next slice.
  Evidence: `packages/domain/src/reporting-mission.ts`, `tools/board-packet-circulation-approval-smoke.mjs`, and `tools/board-packet-circulation-log-smoke.mjs` already anchor the board path to one completed `reporting` mission with `reportKind = "board_packet"`, one stored `board_packet` artifact, `approved_for_circulation` posture, and one logged circulation record.

- Observation: the approvals row payload is JSON-backed, so the correction-and-chronology widening can likely stay additive and payload-backed.
  Evidence: `packages/domain/src/approval.ts`, `apps/control-plane/src/modules/approvals/payload.ts`, and `apps/control-plane/src/modules/approvals/service.ts` already treat finance release and circulation state as typed JSON payloads on top of the existing approvals table rather than as separate release or circulation tables.

- Observation: stale repo guidance was not claiming the wrong shipped behavior, but it was still one step short of a truly implementation-ready successor contract.
  Evidence: `README.md`, `START_HERE.md`, `docs/ACTIVE_DOCS.md`, `plans/ROADMAP.md`, `docs/ops/local-dev.md`, `docs/ops/source-ingest-and-cfo-wiki.md`, and `docs/ops/codex-app-server.md` all pointed generally at a narrow F5C4G correction/chronology follow-on without naming one active plan file.

## Decision Log

- Decision: the first real F5C4G scope is `F5C4G-board-packet-circulation-record-correction-and-chronology-foundation`.
  Rationale: the repo needs one implementation-ready successor contract, not another broad later-F5 umbrella.

- Decision: the first artifact family in F5C4G remains exactly `board_packet`.
  Rationale: the board packet is already the only reporting artifact that owns internal circulation posture and first circulation-record behavior in repo truth.

- Decision: F5C4G must start only from one completed `reporting` mission with `reportKind = "board_packet"`, one stored `board_packet` artifact, derived circulation readiness already at `approved_for_circulation`, and one existing circulation record already logged.
  Rationale: the first correction-and-chronology slice should consume one stored board-packet circulation record, not generic chat intake, not `finance_memo` directly, not `lender_update`, and not `diligence_packet`.

- Decision: F5C4G keeps `mission.type = "reporting"` and `reportKind = "board_packet"`.
  Rationale: reporting already owns the correct mission, replay, artifact, and proof semantics, so a second top-level correction mission family would widen the product boundary unnecessarily.

- Decision: F5C4G adds correction and chronology semantics only.
  Rationale: the next board-specific hardening step is immutable correction history plus chronology ergonomics, not more approval kinds, not delivery behavior, and not export widening.

- Decision: the original `circulationRecord` must stay immutable.
  Rationale: the first logged circulation event is already a reviewable historical fact and should remain visible exactly as originally recorded.

- Decision: corrections should be append-only on the existing `report_circulation` seam.
  Rationale: the current approvals seam is already the durable board-circulation anchor, so the narrowest truthful extension is a correction history on that same payload rather than a second circulation-tracking subsystem.

- Decision: derive one current effective circulation view plus one explicit chronology summary from the original record and any later correction entries.
  Rationale: operators need both truths at once: what was first recorded, and what the current effective board-circulation fact is after later correction.

- Decision: the preferred first mission-scoped write seam is one thin route at `POST /missions/:missionId/reporting/circulation-correction`.
  Rationale: the repo already uses mission-scoped `release-approval`, `release-log`, `circulation-approval`, and `circulation-log` actions, so a matching singular correction route is the narrowest discoverable operator seam.

- Decision: each correction entry should record who corrected the circulation fact, when the correction was recorded, why the correction was needed, and the corrected effective circulation facts.
  Rationale: chronology ergonomics are only reviewable if the repo preserves both the correction act and the corrected effective fact, rather than replacing one timestamp in place.

- Decision: the next slice should prefer a stable correction key or another explicit idempotence mechanism for append-only retries.
  Rationale: correction work is additive rather than replace-in-place, so safe retry behavior matters more than in the first release-log or circulation-log slices.

- Decision: F5C4G stays deterministic and runtime-free.
  Rationale: stored reporting artifacts plus the existing approval seam are sufficient for correction history and chronology; runtime-codex should not enter the first correction slice.

- Decision: F5C4G stays delivery-free in the system sense.
  Rationale: Pocket CFO may record and correct circulation chronology around an external circulation event, but it must not actually send, distribute, publish, or circulate anything itself in this slice.

- Decision: preserve the current `modules/reporting/**` vocabulary and do not reopen a `modules/reports/**` rename wave.
  Rationale: the current repo already uses `reporting` as first-class vocabulary, and this task is about truthfulness and sequencing rather than namespace churn.

- Decision: after F5C4G lands, the repo should pause and reevaluate whether any later-F5 work is still justified before F6.
  Rationale: the current gap after F5C4F is concrete and narrow, but the next successor after F5C4G should be chosen only from a proven remaining operator problem rather than by pre-authoring a broad `FP-0048` umbrella.

## Context and Orientation

Pocket CFO has already shipped F4A through F4C2, with `plans/FP-0035-finance-policy-lookup-and-discovery-quality-hardening.md` as the shipped final F4 record.
Pocket CFO has also already shipped the full pre-F5C4G F5 chain:

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
- `plans/FP-0046-circulation-log-and-first-board-packet-circulation-record-foundation.md` as the shipped F5C4F board circulation-log and circulation-record record

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
- one board-packet circulation-log and circulation-record path on the existing `report_circulation` seam

The repo still does not support immutable correction or first-class chronology ergonomics for board circulation records.
The active successor contract must therefore stay board-specific, approval-payload-backed, additive, deterministic, runtime-free, and delivery-free.

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
- `plans/FP-0046-circulation-log-and-first-board-packet-circulation-record-foundation.md`
- this active implementation contract, `plans/FP-0047-board-packet-circulation-record-correction-and-chronology-foundation.md`
- `docs/ops/local-dev.md`
- `docs/ops/source-ingest-and-cfo-wiki.md`
- `docs/ops/codex-app-server.md`
- `docs/benchmarks/seeded-missions.md`
- `evals/README.md`
- `apps/control-plane/src/modules/approvals/README.md`

GitHub connector work is out of scope.
The internal `@pocket-cto/*` package scope remains unchanged.
This current thread is docs-only and must not add runtime code, routes, schema changes, migrations, package scripts, smoke commands, eval datasets, or implementation scaffolding.

The most relevant implementation seams for the next F5C4G code thread are:

- `packages/domain/src/approval.ts`
- `packages/domain/src/reporting-mission.ts`
- `packages/domain/src/proof-bundle.ts`
- `packages/domain/src/mission-detail.ts`
- `packages/domain/src/mission-list.ts`
- `packages/domain/src/replay-event.ts`
- `packages/domain/src/index.ts`
- `packages/db/src/schema/replay.ts`
- one additive drizzle migration under `packages/db/drizzle/` only if a new replay event is required
- `apps/control-plane/src/modules/approvals/**`
- `apps/control-plane/src/modules/missions/routes.ts`
- `apps/control-plane/src/modules/missions/service.ts`
- `apps/control-plane/src/modules/reporting/service.ts`
- `apps/control-plane/src/modules/reporting/circulation-readiness.ts`
- `apps/control-plane/src/modules/reporting/circulation-record.ts`
- add one small helper such as `apps/control-plane/src/modules/reporting/circulation-chronology.ts` only if it keeps service logic legible
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
- preserve `tools/board-packet-circulation-approval-smoke.mjs`
- preserve `tools/board-packet-circulation-log-smoke.mjs`
- add `tools/board-packet-circulation-correction-smoke.mjs`
- update `package.json`

## Plan of Work

F5C4 should now continue through one explicit board-focused correction-and-chronology contract before the repo decides whether any later-F5 work remains.

First, extend the pure approval, reporting, mission, and proof-bundle contracts so the existing `report_circulation` payload can preserve two truths at once: the original immutable circulation record and any later append-only correction history.
That widening should add one derived current effective circulation view and one explicit chronology view or summary without redefining `circulationReadiness`, proof readiness, or `mission.type = "reporting"`.

Second, keep write behavior inside the existing approvals and reporting seams.
The next implementation should prepare one mission-scoped correction request only for a completed `board_packet` reporting mission that already has one stored `board_packet` artifact, `approved_for_circulation` posture, and one logged original circulation record.
The correction write should extend the resolved `report_circulation` approval payload rather than creating a new correction table, a new mission family, or a second circulation subsystem.

Third, widen the derived read models just enough to make chronology operator-friendly.
Reporting detail, proof-bundle narratives, mission cards, mission lists, and approval cards should clearly show the original logged circulation, the current effective corrected circulation fact, and the correction chronology or summary without implying Pocket CFO performed the circulation itself.

Fourth, keep future sequencing explicit.
After F5C4G lands, the repo should reevaluate whether any concrete later-F5 operator problem still exists before opening another plan number.
Do not author `FP-0048` in advance from this docs-only slice.

## Concrete Steps

1. Widen the pure approval, reporting, proof-bundle, mission, and replay contracts without adding a new mission family.
   Update:
   - `packages/domain/src/approval.ts`
   - `packages/domain/src/reporting-mission.ts`
   - `packages/domain/src/proof-bundle.ts`
   - `packages/domain/src/mission-detail.ts`
   - `packages/domain/src/mission-list.ts`
   - `packages/domain/src/replay-event.ts`
   - `packages/domain/src/index.ts`
   - `packages/db/src/schema/replay.ts`
   - one additive drizzle migration under `packages/db/drizzle/` only if a new replay event is required

   F5C4G should:
   - keep `report_circulation` as the only finance-facing approval kind for the board path
   - keep `mission.type = "reporting"` and `reportKind = "board_packet"`
   - preserve the existing `circulationRecord` field as the original immutable log entry
   - add one append-only correction history field on the existing `report_circulation` payload
   - add one typed derived current effective circulation view plus one typed chronology view or summary
   - avoid new artifact kinds, new mission families, and new environment variables

2. Retarget the existing board-circulation write seam from first-log-only to first-log-plus-correction while keeping the slice board-specific.
   Update:
   - `apps/control-plane/src/modules/reporting/service.ts`
   - `apps/control-plane/src/modules/approvals/service.ts`
   - `apps/control-plane/src/modules/approvals/payload.ts`
   - `apps/control-plane/src/modules/approvals/events.ts`
   - `apps/control-plane/src/modules/missions/routes.ts`
   - `apps/control-plane/src/modules/missions/service.ts`

   F5C4G should:
   - add one thin operator route at `POST /missions/:missionId/reporting/circulation-correction`
   - require one completed `reporting` mission with `reportKind = "board_packet"`
   - require one stored `board_packet` artifact
   - require derived circulation readiness already at `approved_for_circulation`
   - require one existing original circulation record already logged on the resolved `report_circulation` approval
   - append one correction entry on that same approval payload instead of mutating the original record
   - make correction retries safe through a stable correction key or another explicit idempotence mechanism
   - append one additive replay event for correction logging if replay typing still requires it

3. Add one focused chronology helper and derive effective current circulation separately from the original logged record.
   Update:
   - `apps/control-plane/src/modules/reporting/circulation-record.ts`
   - add `apps/control-plane/src/modules/reporting/circulation-chronology.ts`
   - `apps/control-plane/src/modules/reporting/circulation-readiness.ts`
   - `apps/control-plane/src/modules/reporting/artifact.ts`
   - `apps/control-plane/src/modules/evidence/proof-bundle-summary.ts`
   - `apps/control-plane/src/modules/evidence/proof-bundle-assembly.ts`
   - `apps/control-plane/src/modules/missions/detail-view.ts`

   F5C4G should:
   - keep the existing circulation-readiness contract unchanged
   - preserve the original immutable circulation record as a historical trace
   - derive the current effective circulation fact from the latest correction entry when one exists, otherwise from the original record
   - render chronology so operators can understand both when the original event was recorded and when each later correction was appended
   - keep freshness, limitations, provenance, and reviewer trace explicit

4. Extend the operator surfaces just enough to show original, effective, and chronological circulation truth.
   Update:
   - `apps/control-plane/src/modules/approvals/card-formatter.ts`
   - `apps/web/components/approval-card-list.tsx`
   - `apps/web/components/reporting-output-card.tsx`
   - `apps/web/components/mission-card.tsx`
   - `apps/web/components/mission-list-card.tsx`
   - `apps/web/app/missions/[missionId]/mission-actions.tsx`
   - `apps/web/app/missions/[missionId]/mission-action-forms.tsx`
   - `apps/web/app/missions/[missionId]/actions.ts`
   - `apps/web/lib/api.ts`

   F5C4G should:
   - keep the existing circulation-approval and circulation-log actions intact
   - add one correction action only after the original circulation record exists
   - render the original circulation record, current effective circulation view, and chronology summary separately
   - avoid send buttons, distribution automation, PDF export, slide export, or runtime-codex drafting controls

5. Add the narrowest proof coverage for the new correction-and-chronology path.
   Update:
   - add `tools/board-packet-circulation-correction-smoke.mjs`
   - update `package.json`
   - add or update the narrowest domain, control-plane, and web tests near the touched seams

   F5C4G should:
   - preserve the shipped `pnpm smoke:board-packet-circulation-approval:local` proof
   - preserve the shipped `pnpm smoke:board-packet-circulation-log:local` proof
   - add one packaged `pnpm smoke:board-packet-circulation-correction:local` proof for the append-only correction path
   - assert that the original `circulationRecord` stays unchanged while the derived effective view and chronology update
   - keep the proof deterministic, runtime-free, and delivery-free

6. Refresh only the active docs that landed F5C4G code would make stale.
   Update only where the landed code changes active wording:
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

Run the preserved confidence ladder from the current shipped baseline, add the new narrow correction smoke when it exists, and then rerun the required repo-wide gates.

Required command set for this docs-and-plan handoff and the next F5C4G implementation thread:

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
- `pnpm smoke:board-packet-circulation-approval:local`
- `pnpm smoke:board-packet-circulation-log:local`
- `pnpm smoke:board-packet-circulation-correction:local` once implemented
- `pnpm smoke:lender-update:local`
- `pnpm smoke:diligence-packet:local`
- `pnpm smoke:lender-update-release-approval:local`
- `pnpm smoke:lender-update-release-log:local`
- `pnpm smoke:diligence-packet-release-approval:local`
- `pnpm smoke:diligence-packet-release-log:local`
- `pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/twin/workflow-sync.spec.ts src/modules/twin/test-suite-sync.spec.ts src/modules/twin/codeowners-discovery.spec.ts`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm ci:repro:current`

Acceptance for the future F5C4G code thread is observable only if all of the following are true:

- one completed approved-and-logged `board_packet` reporting mission can append one correction entry on the existing `report_circulation` approval seam
- the original `circulationRecord` stays unchanged and remains visible
- reporting detail, mission detail, mission list, proof bundle, and approval-card surfaces expose one current effective circulation view plus one chronology summary or chronology entries
- correction history is append-only, replay-backed, and explicit about who corrected what and why
- mission-facing outputs remain explicit about provenance, freshness posture, reviewer trace, and limitations
- the slice stays deterministic, runtime-free, and delivery-free with no send, distribute, publish, PDF, slide, or runtime-codex behavior

## Idempotence and Recovery

This docs-and-plan slice is retry-safe because it only adds one new plan file and narrows active-doc wording.
The next F5C4G implementation thread should preserve additive safety by never mutating or deleting the original `circulationRecord`.
If correction persistence fails, the write should roll back transactionally so no partial correction or partial chronology state becomes visible.
Retries should reuse a stable correction key or another explicit idempotence mechanism so the same operator correction does not append duplicate entries accidentally.
Rollback should consist of reverting the additive code, any replay-event widening, and any new smoke command or tests, while keeping the shipped F5C4F baseline intact.

## Artifacts and Notes

This thread should end with:

- `plans/FP-0047-board-packet-circulation-record-correction-and-chronology-foundation.md` as the single active implementation contract
- the smallest truthful active-doc refresh pointing the next thread at this plan
- no runtime code, no routes, no schema changes, no migrations, no new smoke commands, no eval datasets, and no implementation scaffolding

The next F5C4G implementation thread is expected to produce:

- one packaged `pnpm smoke:board-packet-circulation-correction:local` proof
- additive domain, control-plane, and web tests near the touched seams
- updated proof-bundle and approval-card narratives for correction history and chronology

## Interfaces and Dependencies

Package boundaries remain unchanged:

- `packages/domain` owns pure approval, reporting, mission, proof-bundle, and replay contracts
- `packages/db` should only widen replay typing or migrations if a new correction replay event is required
- `apps/control-plane/src/modules/approvals` remains the persistence anchor for `report_circulation`
- `apps/control-plane/src/modules/reporting` should own correction preparation plus derived effective and chronology views
- `apps/control-plane/src/modules/evidence` should surface chronology truth in proof-bundle summaries without redefining proof readiness
- `apps/web` stays read-model and operator-action only and must not import database logic

The runtime seam stays stable:

- no runtime-codex drafting
- no runtime-codex circulation behavior
- no new environment variables are expected
- no GitHub connector work is in scope

The central dependency for F5C4G is the existing resolved `report_circulation` approval payload.
The slice should extend that seam additively rather than creating a second circulation subsystem or a second mission family.

## Outcomes & Retrospective

This thread intentionally shipped a docs-and-plan-only handoff, not runtime code.
`plans/FP-0047-board-packet-circulation-record-correction-and-chronology-foundation.md` is now the active implementation contract, and `plans/FP-0046-circulation-log-and-first-board-packet-circulation-record-foundation.md` remains the shipped F5C4F record.
The active-doc boundary now points the next thread at one narrow correction-and-chronology slice instead of a generic post-log continuation.
No runtime code, routes, schema changes, migrations, package scripts, smoke commands, eval datasets, or implementation scaffolding were added in this slice, and the requested docs-and-plan validation ladder finished green before handoff.
What remains is the next narrow implementation thread that executes the concrete steps above and then reevaluates whether any later-F5 work is still justified before F6.
