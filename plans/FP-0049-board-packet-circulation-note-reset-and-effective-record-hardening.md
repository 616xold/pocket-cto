# Define F5C4I board-packet circulation note reset and effective-record hardening

## Purpose / Big Picture

This file started as the active F5C4I implementation contract created by a docs-and-plan-only master-plan slice and now records the landed F5C4I implementation.
`plans/FP-0048-board-packet-circulation-actor-correction-and-chronology-hardening.md` remains the shipped F5C4H record that precedes it.
The target phase is `F5`, and the next execution slice is `F5C4I-board-packet-circulation-note-reset-and-effective-record-hardening`.
The user-visible goal is narrow and concrete: after the shipped F5A through F5C4H baseline already creates one draft `board_packet`, resolves one internal `report_circulation` approval, records one immutable original circulation record, appends correction history on that same seam, and supports corrected actor attribution, Pocket CFO now lets an operator explicitly clear a previously non-null effective `circulationNote` back to truthful absence while keeping the original record immutable, the correction history append-only, and the derived effective chronology honest.

This matters now because the current correction contract already supports append-only correction for `circulatedAt`, `circulatedBy`, `circulationChannel`, and note replacement, but it still cannot distinguish unchanged from explicit clear for `circulationNote`.
`null` still means "no change" in the correction input contract and in the effective chronology fallback logic, so a mistakenly recorded non-null note cannot currently be corrected back to absent.
That is a real operator-facing truthfulness gap on an already-shipped board circulation seam, and it is the only later-F5 continuation justified by current repo truth.

GitHub connector work is explicitly out of scope.
This landed slice stayed narrow: it added no schema migration, no replay-event migration, no new approval kind, no new correction route, no runtime-codex drafting, no send/distribute/publish behavior, no PDF export, no slide export, and no `modules/reporting/**` rename wave.

## Progress

- [x] 2026-04-22T19:21:55Z Audit the shipped F5C4H chain, active docs, reporting and approvals seams, proof-bundle posture, runtime-codex boundary, and current board-circulation truth to decide whether explicit clear-to-absent note semantics are truly required.
- [x] 2026-04-22T19:21:55Z Confirm from current code that `circulationNote` correction still uses `null` as "no change", so a previously non-null effective note cannot be corrected back to absent on the existing `report_circulation` seam.
- [x] 2026-04-22T19:21:55Z Create `plans/FP-0049-board-packet-circulation-note-reset-and-effective-record-hardening.md` and refresh only the smallest truthful active-doc set so FP-0048 remains the shipped F5C4H record while this file becomes the single active later-F5 implementation contract.
- [x] 2026-04-22T19:21:55Z Run the docs-and-plan validation ladder for this handoff, including the preserved smoke stack through `pnpm smoke:board-packet-circulation-actor-correction:local`, the twin guardrails, `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm ci:repro:current`.
- [x] 2026-04-22T19:55:15Z Reconcile the implementation contract with the current F5C4I mission instructions: keep the slice note-reset-only, preserve the shipped actor-correction smoke, and explicitly require the new packaged `tools/board-packet-circulation-note-reset-smoke.mjs` proof plus `pnpm smoke:board-packet-circulation-note-reset:local`.
- [x] 2026-04-22T20:08:06Z Land explicit note-reset semantics on the existing `report_circulation` correction seam, keep the original `circulationRecord` immutable, keep correction history append-only, reuse `approval.circulation_log_corrected`, and harden the derived effective note plus chronology without widening scope.
- [x] 2026-04-22T20:20:05Z Run the preserved full confidence ladder end to end, including the new note-reset smoke, the preserved actor-correction smoke, twin guardrails, `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm ci:repro:current`, and confirm FP-0049 lands without widening into broader later-F5 or F6 work.

## Surprises & Discoveries

- Observation: the current correction input contract still treats `circulationNote: null` as "no change", not as an explicit clear instruction.
  Evidence: `packages/domain/src/reporting-mission.ts` defines `RecordReportingCirculationLogCorrectionInputSchema` with `circulationNote` defaulting to `null`, and the schema only checks whether at least one nullable field is non-null.

- Observation: the current correction preparation logic collapses note clear and note unchanged into the same branch.
  Evidence: `apps/control-plane/src/modules/reporting/service.ts` uses `readChangedCorrectionValue(request.circulationNote, currentEffectiveRecord.circulationNote)`, so `null` cannot mean "clear the current note" and instead always means "preserve the current effective note".

- Observation: the current derived effective chronology falls back to the prior effective note whenever a correction entry carries `circulationNote: null`.
  Evidence: `apps/control-plane/src/modules/reporting/circulation-chronology.ts` derives the effective note with `input.correction.circulationNote ?? input.currentEffective.circulationNote`.

- Observation: the narrowest truthful continuation can stay on the existing approvals seam and replay event.
  Evidence: `apps/control-plane/src/modules/approvals/service.ts` already appends correction entries to `payload.circulationCorrections` and replays `approval.circulation_log_corrected`; no second subsystem is needed.

- Observation: the current actor-correction smoke is already the right proof seam for the next slice.
  Evidence: `pnpm smoke:board-packet-circulation-actor-correction:local` already exercises the append-only correction path on the existing board seam, so the next implementation can extend that proof instead of inventing a new smoke alias.

- Observation: the current implementation request now explicitly requires a dedicated packaged note-reset smoke in addition to the preserved actor-correction proof.
  Evidence: the current thread instructions require `tools/board-packet-circulation-note-reset-smoke.mjs` and `pnpm smoke:board-packet-circulation-note-reset:local`, so the active plan must name that proof artifact instead of treating a new smoke alias as out of scope by default.

- Observation: the landing thread's allowed write scope is narrower than the usual active-doc refresh surface.
  Evidence: the implementation instructions for this thread explicitly allow FP-0049 plus the touched domain, control-plane, web, package, smoke, and testkit seams, but do not authorize broader README or `docs/**` churn.

## Decision Log

- Decision: the first real F5C4I scope is `F5C4I-board-packet-circulation-note-reset-and-effective-record-hardening`.
  Rationale: the repo needs one implementation-ready successor contract, not another broad later-F5 umbrella.

- Decision: the artifact family in F5C4I remains exactly `board_packet`.
  Rationale: the board packet is still the only reporting artifact that owns internal circulation posture, circulation logging, correction history, and effective chronology in repo truth.

- Decision: F5C4I must start only from one completed `reporting` mission with `reportKind = "board_packet"`, one stored `board_packet` artifact, derived circulation readiness already at `approved_for_circulation`, one existing immutable `circulationRecord`, and zero or more existing append-only `circulationCorrections`.
  Rationale: the note-reset slice should consume one stored board-packet circulation history, not generic chat intake, not `finance_memo` directly, not `lender_update`, and not `diligence_packet`.

- Decision: F5C4I keeps `mission.type = "reporting"` and `reportKind = "board_packet"`.
  Rationale: reporting already owns the correct mission, replay, artifact, and proof semantics, so a second top-level correction mission family would widen the product boundary unnecessarily.

- Decision: F5C4I adds note-reset semantics only.
  Rationale: the shipped actor-correction widening already covers `circulatedBy`, and the current correction contract already handles replacement for time, actor, channel, and note text. The remaining gap is explicit clear-to-absent behavior for `circulationNote`, so the next slice should not widen actor, channel, or time reset behavior unless a concrete operator need appears later.

- Decision: distinguish unchanged versus replace versus clear for `circulationNote` with one explicit note-reset indicator on the existing correction contract.
  Rationale: the implementation needs an unambiguous tri-state contract for note correction only. The preferred narrow design is to keep `circulationNote` as the replacement payload when present and add one explicit boolean or equivalent discriminator for "clear the effective note", while leaving absence of both as "unchanged".

- Decision: keep the original `circulationRecord` immutable and the correction history append-only.
  Rationale: the first logged circulation event remains a reviewable historical fact and should stay visible exactly as originally recorded.

- Decision: reuse the existing `report_circulation` approval seam, existing `POST /missions/:missionId/reporting/circulation-log-correction` route, and existing `approval.circulation_log_corrected` replay event.
  Rationale: the narrowest truthful continuation is to widen the existing correction payload and derived views rather than inventing a new subsystem, a new route family, a new approval kind, or a new replay event by default.

- Decision: do not plan a database migration or replay-event migration for F5C4I, but do plan one dedicated packaged note-reset smoke and package script because the current mission requires it.
  Rationale: the current board circulation correction path is JSON-payload-backed and the replay event already exists, but the implementation request explicitly calls for a new deterministic note-reset proof while preserving the shipped actor-correction smoke.

- Decision: F5C4I stays deterministic, runtime-free, and delivery-free.
  Rationale: stored reporting artifacts plus the existing approvals seam are sufficient for note-reset hardening, so runtime-codex behavior, actual send or distribute behavior, and broader export widening remain out of scope.

- Decision: preserve the current `modules/reporting/**` vocabulary and do not reopen a `modules/reports/**` rename wave.
  Rationale: this slice is about truthfulness and sequencing, not namespace churn.

- Decision: after FP-0049, the repo should reevaluate whether any later-F5 work is still justified before F6.
  Rationale: current evidence points to exactly one remaining board-specific operator gap, not a broader later-F5 program.

- Decision: keep the post-landing doc update inside FP-0049 and the slice-local approvals README only for this thread.
  Rationale: the user-scoped write boundary for this landing is narrower than the normal active-doc refresh surface, so broader repo-doc changes should wait for an explicitly authorized follow-up if they are still needed.

## Context and Orientation

Pocket CFO has already shipped F4A through F4C2, with `plans/FP-0035-finance-policy-lookup-and-discovery-quality-hardening.md` as the shipped final F4 record.
Pocket CFO has also already shipped the full reporting chain through F5C4H:

- `plans/FP-0036-reporting-mission-foundation-and-first-finance-memo.md` as the shipped F5A record
- `plans/FP-0037-draft-report-body-filed-artifact-and-markdown-export-hardening.md` as the shipped F5B record
- `plans/FP-0038-board-packet-specialization-and-draft-review-foundation.md` as the shipped F5C1 record
- `plans/FP-0039-lender-update-specialization-and-draft-review-foundation.md` as the shipped F5C2 record
- `plans/FP-0040-diligence-packet-specialization-and-draft-review-foundation.md` as the shipped F5C3 record
- `plans/FP-0041-approval-review-and-first-lender-update-release-readiness.md` as the shipped F5C4A record
- `plans/FP-0042-release-log-and-first-lender-update-release-record-foundation.md` as the shipped F5C4B record
- `plans/FP-0043-diligence-packet-approval-review-and-release-readiness.md` as the shipped F5C4C record
- `plans/FP-0044-release-log-and-first-diligence-packet-release-record-foundation.md` as the shipped F5C4D record
- `plans/FP-0045-board-packet-review-or-circulation-readiness-foundation.md` as the shipped F5C4E record
- `plans/FP-0046-circulation-log-and-first-board-packet-circulation-record-foundation.md` as the shipped F5C4F record
- `plans/FP-0047-board-packet-circulation-record-correction-and-chronology-foundation.md` as the shipped F5C4G record
- `plans/FP-0048-board-packet-circulation-actor-correction-and-chronology-hardening.md` as the shipped F5C4H record

That shipped baseline already means all of the following are repo truth today:

- `mission.type = "reporting"` and `sourceKind = "manual_reporting"`
- one deterministic `POST /missions/reporting` path from completed discovery work
- one draft `finance_memo`
- one linked `evidence_appendix`
- one draft `board_packet`
- one draft `lender_update`
- one draft `diligence_packet`
- one finance-facing `report_release` approval path plus release-ready and release-record posture for `lender_update`
- one finance-facing `report_release` approval path plus release-ready and release-record posture for `diligence_packet`
- one finance-facing `report_circulation` approval path plus circulation-ready posture for `board_packet`
- one immutable original board-packet `circulationRecord` on that seam
- append-only `circulationCorrections` on that same seam
- truthful effective actor chronology from shipped F5C4H

The current remaining gap was narrower: a previously non-null effective `circulationNote` could not be corrected back to absent because the current contract still interpreted `null` as "no change".
The landed F5C4I slice therefore stays board-specific, approval-payload-backed, additive, deterministic, runtime-free, and delivery-free.

The active-doc boundary for this handoff is:

- `README.md`
- `START_HERE.md`
- `docs/ACTIVE_DOCS.md`
- `PLANS.md`
- `plans/ROADMAP.md`
- `plans/FP-0048-board-packet-circulation-actor-correction-and-chronology-hardening.md`
- this shipped record, `plans/FP-0049-board-packet-circulation-note-reset-and-effective-record-hardening.md`
- `docs/ops/local-dev.md`
- `docs/ops/source-ingest-and-cfo-wiki.md`
- `docs/ops/codex-app-server.md`
- `docs/benchmarks/seeded-missions.md`
- `evals/README.md`
- `apps/control-plane/src/modules/approvals/README.md`

GitHub connector work is out of scope.
The internal `@pocket-cto/*` package scope remains unchanged.
This landed implementation stayed inside the existing approvals, reporting, evidence, and web read-model seams.

## Plan of Work

First, keep the already-shipped F5C4H actor-correction record untouched and create one explicit active successor contract only because the current repo truth still leaves a note-reset gap.

Second, widen the pure correction contract just enough to express note-clear intent explicitly on the existing board circulation correction seam.
The preferred design is to preserve the existing nullable replacement fields for `circulatedAt`, `circulatedBy`, and `circulationChannel`, keep `circulationNote` as the replacement value when one is provided, and add one explicit flag or equivalent discriminator that means "clear the current effective note back to absent".

Third, retarget the existing correction write path rather than inventing a new subsystem.
The current `POST /missions/:missionId/reporting/circulation-log-correction` seam should continue to own this work, but it should reject ambiguous note-reset combinations, preserve idempotent retries by `correctionKey`, and append one correction entry on the same resolved `report_circulation` approval payload.

Fourth, harden the derived effective record and chronology summary so the system stops falling back to an old note after an explicit clear.
Reporting detail, mission detail, mission list, proof bundles, and operator surfaces should show whether the effective note remains present, was replaced, or was explicitly cleared, while keeping the original immutable record visible.

Finally, preserve the current proof seam and validation posture while adding the one new proof artifact the mission explicitly required.
This landed thread adds one dedicated packaged note-reset smoke, keeps the shipped actor-correction smoke intact, avoids any second subsystem, and reruns the preserved confidence ladder end to end before publication.

## Concrete Steps

1. Widen the pure approval and reporting contracts for explicit note-reset semantics only.
   Update:
   - `packages/domain/src/reporting-mission.ts`
   - `packages/domain/src/approval.ts`
   - `packages/domain/src/proof-bundle.ts`
   - `packages/domain/src/mission-detail.ts`
   - `packages/domain/src/mission-list.ts`
   - `packages/domain/src/index.ts` only if exported types change

   F5C4I should:
   - keep `report_circulation` as the only finance-facing approval kind for the board path
   - keep `mission.type = "reporting"` and `reportKind = "board_packet"`
   - keep the original `circulationRecord` immutable
   - add one explicit note-reset indicator on the correction input and the persisted correction entry
   - keep `circulationNote` itself as the replacement payload when the operator is replacing the note rather than clearing it
   - leave `circulatedAt`, `circulatedBy`, and `circulationChannel` on their current semantics
   - reject ambiguous combinations such as "replace note" and "clear note" in the same correction
   - avoid new artifact kinds, new mission families, new approval kinds, and new environment variables

2. Retarget the existing board-circulation correction write seam without inventing a second subsystem.
   Update:
   - `apps/control-plane/src/modules/reporting/service.ts`
   - `apps/control-plane/src/modules/approvals/service.ts`
   - `apps/control-plane/src/modules/approvals/payload.ts`
   - `apps/control-plane/src/modules/missions/routes.ts`
   - `apps/control-plane/src/modules/missions/service.ts`

   F5C4I should:
   - keep `POST /missions/:missionId/reporting/circulation-log-correction` as the operator seam
   - require one completed `reporting` mission with `reportKind = "board_packet"`
   - require one stored `board_packet` artifact
   - require derived circulation readiness already at `approved_for_circulation`
   - require one existing immutable original circulation record already logged
   - append one correction entry on the existing `report_circulation` approval payload instead of mutating the original record
   - reuse `approval.circulation_log_corrected` rather than inventing a new replay event by default
   - preserve idempotent retries by `correctionKey`

3. Harden the derived effective record and chronology summary so explicit note clear stops falling back to stale text.
   Update:
   - `apps/control-plane/src/modules/reporting/circulation-chronology.ts`
   - `apps/control-plane/src/modules/reporting/circulation-record.ts`
   - `apps/control-plane/src/modules/reporting/artifact.ts`
   - `apps/control-plane/src/modules/evidence/proof-bundle-summary.ts`
   - `apps/control-plane/src/modules/evidence/proof-bundle-assembly.ts`
   - `apps/control-plane/src/modules/missions/detail-view.ts`

   F5C4I should:
   - derive the effective note as absent after an explicit clear
   - preserve the original immutable note on the original record
   - keep actor, time, and channel chronology unchanged except where already supported by shipped behavior
   - render chronology so operators can tell whether a correction replaced the note text or cleared the note entirely
   - keep freshness, reviewer trace, provenance posture, and limitations explicit

4. Extend the operator surfaces just enough to expose explicit note-clear behavior and its derived result.
   Update:
   - `apps/control-plane/src/modules/approvals/card-formatter.ts`
   - `apps/web/lib/api.ts`
   - `apps/web/components/reporting-output-card.tsx`
   - `apps/web/components/mission-card.tsx`
   - `apps/web/components/mission-list-card.tsx`
   - `apps/web/app/missions/[missionId]/mission-actions.tsx`
   - `apps/web/app/missions/[missionId]/mission-action-forms.tsx`
   - `apps/web/app/missions/[missionId]/actions.ts`

   F5C4I should:
   - keep the existing circulation-approval, circulation-log, and correction actions intact
   - add one explicit note-clear control on the existing correction action rather than a new action family
   - reject a clear request when the current effective note is already absent
   - show "no effective note" or equivalent truthful absence after an explicit clear instead of silently showing the old note
   - keep send, distribute, publish, PDF export, slide export, and runtime-codex drafting out of scope

5. Extend the existing proof coverage with one dedicated packaged note-reset smoke while preserving the shipped actor-correction proof.
   Update:
   - `tools/board-packet-circulation-note-reset-smoke.mjs`
   - `tools/board-packet-circulation-actor-correction-smoke.mjs`
   - `package.json`
   - `apps/control-plane/src/modules/reporting/service.spec.ts`
   - `apps/control-plane/src/modules/approvals/service.spec.ts`
   - `apps/control-plane/src/modules/evidence/proof-bundle-assembly.spec.ts`
   - `apps/web/lib/api.spec.ts`
   - `apps/web/components/reporting-output-card.spec.tsx`
   - the narrowest domain specs adjacent to the widened contracts

   F5C4I should:
   - preserve `pnpm smoke:board-packet-circulation-log-correction:local` as the shipped F5C4G baseline proof
   - preserve `pnpm smoke:board-packet-circulation-actor-correction:local` as the shipped actor-correction proof seam
   - add `pnpm smoke:board-packet-circulation-note-reset:local` as the dedicated F5C4I note-reset proof seam
   - assert that the original `circulationRecord` stays unchanged while the derived effective note becomes absent after a clear correction
   - keep the proof deterministic, runtime-free, and delivery-free

6. Refresh only the active docs that landed F5C4I code would make stale.
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

This landed F5C4I slice finished on the preserved confidence ladder while adding only the narrowest targeted suites near the touched seams.

Required F5C4I confidence ladder:

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
- `pnpm smoke:board-packet-circulation-log-correction:local`
- `pnpm smoke:board-packet-circulation-actor-correction:local`
- `pnpm smoke:board-packet-circulation-note-reset:local`
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

Acceptance for the landed F5C4I code is observable only if all of the following are true:

- one completed approved-and-logged `board_packet` reporting mission can append one correction that explicitly clears the effective `circulationNote`
- the original immutable `circulationRecord` stays unchanged and remains visible
- the effective note becomes absent after the clear correction rather than falling back to the old note
- chronology, reporting, mission, proof-bundle, and approval surfaces make the clear-versus-replace distinction visible
- note-reset semantics do not widen actor, channel, time, delivery, PDF export, slide export, or runtime-codex behavior
- mission-facing outputs remain explicit about provenance, freshness posture, reviewer trace, assumptions, and limitations when relevant

## Idempotence and Recovery

This landed F5C4I slice remains retry-safe because it extends the existing correction seam additively.
The landed F5C4I implementation stays additive by never mutating or deleting the original `circulationRecord`, by keeping correction history append-only, and by preserving `correctionKey` as the retry boundary.
If note-reset persistence fails, the write should roll back transactionally so no partial correction becomes visible.
Rollback should consist of reverting the additive domain, reporting, proof, and UI changes while leaving the shipped F5C4H baseline intact.
No database or replay-event migration is planned by default, so recovery should not depend on a destructive schema rollback.

## Artifacts and Notes

This landed thread ends with:

- `plans/FP-0049-board-packet-circulation-note-reset-and-effective-record-hardening.md` as the shipped F5C4I record
- additive contract, service, proof, and UI changes on the existing board correction seam
- green validation results on the preserved confidence ladder

The landed implementation also includes:

- extended targeted tests near the touched seams
- a new `tools/board-packet-circulation-note-reset-smoke.mjs` proof plus `pnpm smoke:board-packet-circulation-note-reset:local`
- the preserved shipped `tools/board-packet-circulation-actor-correction-smoke.mjs` proof

## Interfaces and Dependencies

Package boundaries remain unchanged:

- `packages/domain` owns pure approval, reporting, proof-bundle, mission-detail, and mission-list contracts
- `apps/control-plane/src/modules/approvals` remains the persistence anchor for `report_circulation`
- `apps/control-plane/src/modules/reporting` owns correction preparation plus derived effective-note and chronology logic
- `apps/control-plane/src/modules/evidence` surfaces note-reset truth in proof bundles without redefining proof readiness
- `apps/web` stays read-model and operator-action only and must not import database logic

The runtime seam stays stable:

- no runtime-codex drafting
- no runtime-codex circulation behavior
- no new environment variables are expected
- no GitHub connector work is in scope

The central dependency for F5C4I is the existing resolved `report_circulation` approval payload plus the shipped correction history and chronology view seams.
The slice should extend that seam additively rather than creating a second circulation subsystem or a second mission family.

## Outcomes & Retrospective

This thread landed the first real F5C4I code slice.
Pocket CFO now supports one explicit append-only `circulationNote` clear-to-absent correction on the existing board-packet `report_circulation` seam, keeps the original circulation record immutable, keeps correction history append-only, derives a truthful null effective note after the reset, and preserves deterministic delivery-free posture with no runtime-codex, PDF, slide, or release widening.

FP-0048 remains the shipped F5C4H predecessor record, and FP-0049 now serves as the shipped F5C4I record.
What remains is not an automatic next slice; the repo should reevaluate whether any later-F5 continuation is still justified before F6 and create a new narrow Finance Plan only if current repo truth reveals another concrete gap.
