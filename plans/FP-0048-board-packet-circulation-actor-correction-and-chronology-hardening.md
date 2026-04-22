# Define F5C4H board-packet circulation actor correction and chronology hardening

## Purpose / Big Picture

This file is the active F5C4H implementation contract created by a docs-and-plan-only handoff slice.
`plans/FP-0047-board-packet-circulation-record-correction-and-chronology-foundation.md` remains the shipped F5C4G record that precedes it.
The target phase is `F5`, and the next execution slice is `F5C4H-board-packet-circulation-actor-correction-and-chronology-hardening`.
The user-visible goal is narrow and concrete: after the shipped F5A through F5C4G baseline already creates one draft `board_packet`, resolves one internal `report_circulation` approval, records one immutable original circulation record, and appends correction history plus derived chronology on that same seam, Pocket CFO should next let an operator append actor-attribution corrections to that existing circulation history and see one truthful current effective actor identity alongside the original immutable record and chronology summary without widening into actual send, distribute, publish, export widening, runtime-codex drafting, or a broader later-F5 umbrella.

This matters now because the repo no longer lacks board review posture, circulation logging, or append-only chronology.
The verified remaining gap is narrower: correction entries can currently amend `circulatedAt`, `circulationChannel`, and `circulationNote`, but they cannot carry a corrected `circulatedBy`, so the current effective actor identity always falls through from the original immutable record even when a later actor correction is required.
The next gain is therefore not more packet families, not delivery behavior, and not F6.
It is one implementation-ready board-specific actor-correction contract that a new thread can execute directly.

GitHub connector work is explicitly out of scope.
This plan does not authorize runtime-codex drafting, runtime-codex circulation behavior, actual send, distribute, or publish behavior, PDF export, slide export, Marp export, broader packet widening, a new approval kind, a new mission family, or any rename from `modules/reporting/**` to `modules/reports/**`.

## Progress

- [x] 2026-04-22T10:43:13Z Audit the shipped F5A through F5C4G plan chain, active docs, approvals seams, reporting seams, proof-bundle posture, runtime-codex boundary, and board-circulation contracts to verify whether any concrete later-F5 gap still exists.
- [x] 2026-04-22T10:43:13Z Confirm the narrow remaining gap in repo truth: the current append-only correction schema and derived effective chronology do not support corrected `circulatedBy`, so actor-attribution correction is the only implementation-ready F5C4H continuation worth planning.
- [x] 2026-04-22T10:43:13Z Create `plans/FP-0048-board-packet-circulation-actor-correction-and-chronology-hardening.md` and refresh only the smallest truthful active-doc set so `plans/FP-0047-board-packet-circulation-record-correction-and-chronology-foundation.md` remains the shipped F5C4G record while this file becomes the sole active implementation contract.
- [ ] 2026-04-22T10:43:13Z Run the requested source-ingest-through-reporting confidence ladder, targeted twin guardrails, repo-wide validation, and `pnpm ci:repro:current` for this docs-and-plan handoff without starting F5C4H code.
  Status: every requested smoke, the targeted twin vitest run, `pnpm lint`, `pnpm typecheck`, and `pnpm test` passed on 2026-04-22, but `pnpm ci:repro:current` failed in a clean temporary worktree on the pre-existing `packages/codex-runtime/src/protocol.spec.ts` notification assertion, so this handoff remains validation-blocked for commit/push/PR purposes.
- [ ] 2026-04-22T10:43:13Z Start the real F5C4H implementation thread: add optional corrected `circulatedBy` support on append-only correction entries, derive corrected effective actor chronology on the existing `report_circulation` seam, update the smallest truthful reporting and proof surfaces, and rerun the full validation ladder after code lands.

## Surprises & Discoveries

- Observation: the current correction schema already models append-only correction metadata and corrected effective circulation facts, but it omits corrected actor identity.
  Evidence: `packages/domain/src/approval.ts` defines `ReportCirculationApprovalCirculationCorrectionSchema` with `circulatedAt`, `circulationChannel`, and `circulationNote`, but no corrected `circulatedBy`.

- Observation: the current derived effective chronology always preserves the actor from the prior effective record rather than allowing an actor correction.
  Evidence: `apps/control-plane/src/modules/reporting/circulation-chronology.ts` keeps `circulatedBy: input.currentEffective.circulatedBy` inside `buildCorrectedEffectiveRecordView`.

- Observation: the existing `report_circulation` approval payload and `approval.circulation_log_corrected` replay event are already the right persistence and replay anchors for the next slice.
  Evidence: `apps/control-plane/src/modules/approvals/service.ts`, `apps/control-plane/src/modules/approvals/payload.ts`, and `apps/control-plane/src/modules/reporting/service.ts` already append corrections safely by `correctionKey` on the resolved approval payload and emit `approval.circulation_log_corrected`.

- Observation: the active-doc chain was still intentionally stopping at “reevaluate later-F5” wording rather than naming one active successor plan.
  Evidence: `README.md`, `START_HERE.md`, `docs/ACTIVE_DOCS.md`, `plans/ROADMAP.md`, `docs/ops/local-dev.md`, `docs/ops/source-ingest-and-cfo-wiki.md`, `docs/ops/codex-app-server.md`, `evals/README.md`, `docs/benchmarks/seeded-missions.md`, and `apps/control-plane/src/modules/approvals/README.md` all described FP-0047 as shipped but did not yet point the next thread at one concrete F5C4H contract.

- Observation: the requested docs-only validation ladder is fully green except for one unrelated clean-tree repro failure outside this slice.
  Evidence: `pnpm ci:repro:current` failed on 2026-04-22 in the temporary worktree during `@pocket-cto/codex-runtime` test execution because `packages/codex-runtime/src/protocol.spec.ts` expected `item/commandExecution/terminalInteraction` notifications that were not present, while all requested smokes, the targeted twin vitest run, `pnpm lint`, `pnpm typecheck`, and `pnpm test` passed beforehand.

## Decision Log

- Decision: the first real F5C4H scope is `F5C4H-board-packet-circulation-actor-correction-and-chronology-hardening`.
  Rationale: the repo needs one implementation-ready successor contract, not another broad later-F5 umbrella.

- Decision: the first artifact family in F5C4H remains exactly `board_packet`.
  Rationale: the board packet is already the only reporting artifact that owns internal circulation posture, circulation logging, and correction history in repo truth.

- Decision: F5C4H must start only from one completed `reporting` mission with `reportKind = "board_packet"`, one stored `board_packet` artifact, circulation readiness already at `approved_for_circulation`, one existing immutable `circulationRecord`, and zero or more existing append-only `circulationCorrections`.
  Rationale: the next actor-correction slice should consume one stored board-packet circulation history, not generic chat intake, not `finance_memo` directly, not `lender_update`, and not `diligence_packet`.

- Decision: F5C4H keeps `mission.type = "reporting"` and `reportKind = "board_packet"`.
  Rationale: reporting already owns the correct mission, replay, artifact, and proof semantics, so a second top-level correction mission family would widen the product boundary unnecessarily.

- Decision: F5C4H adds actor-attribution correction semantics only.
  Rationale: the verified gap is corrected actor identity, so the next slice should keep the original `circulationRecord` immutable, keep correction history append-only, add optional corrected `circulatedBy` support to correction entries, and derive a truthful current effective actor identity plus chronology summary without widening into delivery behavior.

- Decision: the preferred persistence anchor remains the existing resolved `report_circulation` approval payload.
  Rationale: the narrowest truthful extension is to widen the existing correction entry on that payload with optional corrected `circulatedBy` rather than inventing a second circulation-tracking subsystem.

- Decision: the preferred replay anchor remains the existing `approval.circulation_log_corrected` event.
  Rationale: the repo already records correction appends through that event, so the next slice should reuse it unless a concrete replay blocker appears during implementation.

- Decision: F5C4H should not plan a new replay-event migration, schema migration, or approval kind by default.
  Rationale: the current code path already persists correction history and replays correction events, so any additive persistence widening should happen only if the implementation thread hits a concrete blocker and records that change explicitly.

- Decision: F5C4H stays deterministic and runtime-free.
  Rationale: stored reporting artifacts plus the existing approvals seam are sufficient for actor-correction hardening, so runtime-codex drafting, runtime-codex circulation behavior, and bounded formatting assistance remain out of scope.

- Decision: F5C4H stays delivery-free in the system sense.
  Rationale: Pocket CFO may record actor-attribution correction around an external circulation event, but it must not actually send, distribute, publish, or circulate anything itself in this slice.

- Decision: after F5C4H, the repo should reevaluate whether any later-F5 work is still justified before F6, and this docs-only handoff must not create `FP-0049`.
  Rationale: the current remaining operator problem is concrete and narrow, so the next successor should be chosen only after this actor-correction slice either ships or proves unnecessary in practice.

- Decision: preserve the current `modules/reporting/**` vocabulary and do not reopen a `modules/reports/**` rename wave.
  Rationale: the current repo already uses `reporting` as first-class vocabulary, and this task is about truthfulness and sequencing rather than namespace churn.

## Context and Orientation

Pocket CFO has already shipped F4A through F4C2, with `plans/FP-0035-finance-policy-lookup-and-discovery-quality-hardening.md` as the shipped final F4 record.
Pocket CFO has also already shipped the full pre-F5C4H F5 chain:

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
- `plans/FP-0047-board-packet-circulation-record-correction-and-chronology-foundation.md` as the shipped F5C4G board circulation correction-and-chronology record

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
- one board-packet circulation-log and immutable original circulation-record path on the existing `report_circulation` seam
- one append-only correction history plus derived chronology on that same seam

The verified remaining gap is that correction entries still cannot carry corrected actor identity.
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
- `plans/FP-0047-board-packet-circulation-record-correction-and-chronology-foundation.md`
- this active implementation contract, `plans/FP-0048-board-packet-circulation-actor-correction-and-chronology-hardening.md`
- `docs/ops/local-dev.md`
- `docs/ops/source-ingest-and-cfo-wiki.md`
- `docs/ops/codex-app-server.md`
- `docs/benchmarks/seeded-missions.md`
- `evals/README.md`
- `apps/control-plane/src/modules/approvals/README.md`

GitHub connector work is out of scope.
The internal `@pocket-cto/*` package scope remains unchanged.
This thread is docs-only, so no runtime code, routes, schema, migrations, package scripts, smoke commands, eval datasets, or implementation scaffolding are in scope now.
The next real F5C4H implementation thread should stay inside the existing approvals, reporting, evidence, and web read-model seams.

## Plan of Work

First, keep this slice docs-only and make the active handoff truthful.
That means authoring one concrete FP-0048 plan, refreshing the smallest active-doc chain that still pointed at a generic post-F5C4G reevaluation, and preserving FP-0047 as the shipped F5C4G record rather than reopening it.

Second, in the next real implementation thread, widen the pure approval and reporting contracts just enough to let append-only correction entries carry optional corrected `circulatedBy` on the existing `report_circulation` seam.
The original `circulationRecord` must remain immutable, and the correction history must remain append-only and idempotent by `correctionKey`.

Third, retarget the existing mission-scoped correction write path rather than inventing a new subsystem.
The current `POST /missions/:missionId/reporting/circulation-log-correction` seam should continue to own this work, but it should accept optional corrected actor identity on the same correction entry and derive one truthful current effective actor view plus chronology summary from the original record plus appended corrections.

Fourth, widen reporting, proof-bundle, mission, approval-card, and operator read surfaces only enough to make original-versus-effective actor identity visible.
The repo should keep current freshness, limitation, provenance, and reviewer-trace posture explicit and should still avoid any delivery automation or runtime-codex widening.

Finally, after F5C4H lands, pause before opening another plan number.
Only if a concrete operator problem still remains should the repo decide whether any later-F5 continuation is justified before F6.

## Concrete Steps

1. Widen the pure approval and reporting contracts without adding a new mission family, a new approval kind, or a second circulation subsystem.
   Update:
   - `packages/domain/src/approval.ts`
   - `packages/domain/src/reporting-mission.ts`
   - `packages/domain/src/proof-bundle.ts`
   - `packages/domain/src/mission-detail.ts`
   - `packages/domain/src/mission-list.ts`
   - `packages/domain/src/index.ts` only if exported types change

   F5C4H should:
   - keep `report_circulation` as the only finance-facing approval kind for the board path
   - keep `mission.type = "reporting"` and `reportKind = "board_packet"`
   - preserve the existing immutable `circulationRecord`
   - extend correction entries on the existing `report_circulation` payload with optional corrected `circulatedBy`
   - extend the derived effective record and chronology views so the current effective actor can come from the latest correction when present
   - avoid new artifact kinds, new mission families, new environment variables, and any planned replay-event migration

2. Retarget the existing board-circulation correction write seam from field-correction-only to field-plus-actor correction while keeping the slice board-specific.
   Update:
   - `apps/control-plane/src/modules/reporting/service.ts`
   - `apps/control-plane/src/modules/approvals/service.ts`
   - `apps/control-plane/src/modules/approvals/payload.ts`
   - `apps/control-plane/src/modules/missions/routes.ts`
   - `apps/control-plane/src/modules/missions/service.ts`
   - `apps/web/lib/api.ts`

   F5C4H should:
   - keep `POST /missions/:missionId/reporting/circulation-log-correction` as the preferred operator seam
   - require one completed `reporting` mission with `reportKind = "board_packet"`
   - require one stored `board_packet` artifact
   - require derived circulation readiness already at `approved_for_circulation`
   - require one existing original circulation record already logged on the resolved `report_circulation` approval
   - append one correction entry on that same approval payload instead of mutating the original record
   - preserve idempotent retries by `correctionKey`
   - reuse the existing `approval.circulation_log_corrected` replay event unless a concrete blocker forces an additive plan update

3. Update chronology derivation so original actor truth and corrected effective actor truth stay visible at the same time.
   Update:
   - `apps/control-plane/src/modules/reporting/circulation-chronology.ts`
   - `apps/control-plane/src/modules/reporting/circulation-record.ts`
   - `apps/control-plane/src/modules/reporting/artifact.ts`
   - `apps/control-plane/src/modules/evidence/proof-bundle-summary.ts`
   - `apps/control-plane/src/modules/evidence/proof-bundle-assembly.ts`
   - `apps/control-plane/src/modules/missions/detail-view.ts`

   F5C4H should:
   - keep the existing circulation-readiness contract unchanged
   - preserve the original immutable circulation record, including its original `circulatedBy`
   - derive the current effective actor identity from the latest correction entry when one supplies corrected `circulatedBy`, otherwise from the prior effective record
   - render chronology so operators can understand who was originally logged, who is currently effective, when each correction was appended, and why the correction was needed
   - keep freshness, limitations, provenance, and reviewer trace explicit

4. Extend the operator surfaces just enough to show original actor, effective actor, and actor-correction chronology without widening into delivery controls.
   Update:
   - `apps/control-plane/src/modules/approvals/card-formatter.ts`
   - `apps/web/components/approval-card-list.tsx`
   - `apps/web/components/reporting-output-card.tsx`
   - `apps/web/components/mission-card.tsx`
   - `apps/web/components/mission-list-card.tsx`
   - `apps/web/app/missions/[missionId]/mission-actions.tsx`
   - `apps/web/app/missions/[missionId]/mission-action-forms.tsx`
   - `apps/web/app/missions/[missionId]/actions.ts`

   F5C4H should:
   - keep the existing circulation-approval, circulation-log, and correction actions intact
   - widen the correction form only enough to capture optional corrected `circulatedBy`
   - render original circulation actor and effective circulation actor separately
   - keep send buttons, distribution automation, PDF export, slide export, and runtime-codex drafting controls out of scope

5. Extend the existing proof coverage instead of inventing a new smoke family.
   Update:
   - `tools/board-packet-circulation-log-correction-smoke.mjs`
   - `apps/control-plane/src/modules/approvals/service.spec.ts`
   - `apps/control-plane/src/modules/reporting/service.spec.ts`
   - `apps/control-plane/src/modules/evidence/proof-bundle-assembly.spec.ts`
   - `apps/web/components/reporting-output-card.spec.tsx`
   - any other narrow web or control-plane tests directly adjacent to touched seams

   F5C4H should:
   - preserve the shipped `pnpm smoke:board-packet-circulation-approval:local` proof
   - preserve the shipped `pnpm smoke:board-packet-circulation-log:local` proof
   - preserve the shipped `pnpm smoke:board-packet-circulation-log-correction:local` command and widen its assertions rather than adding a new smoke command
   - assert that the original `circulationRecord` stays unchanged while the derived effective actor and chronology update
   - keep the proof deterministic, runtime-free, and delivery-free

6. Refresh only the active docs that a landed F5C4H implementation would make stale.
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

For this docs-and-plan handoff thread, rerun the preserved confidence ladder to prove the guidance refresh stayed truthful without starting F5C4H code.
The next real implementation thread should rerun the same ladder after code lands.

Required command set:

```bash
pnpm smoke:source-ingest:local
pnpm smoke:finance-twin:local
pnpm smoke:finance-twin-account-catalog:local
pnpm smoke:finance-twin-general-ledger:local
pnpm smoke:finance-twin-snapshot:local
pnpm smoke:finance-twin-reconciliation:local
pnpm smoke:finance-twin-period-context:local
pnpm smoke:finance-twin-account-bridge:local
pnpm smoke:finance-twin-balance-bridge-prerequisites:local
pnpm smoke:finance-twin-source-backed-balance-proof:local
pnpm smoke:finance-twin-balance-proof-lineage:local
pnpm smoke:finance-twin-bank-account-summary:local
pnpm smoke:finance-twin-receivables-aging:local
pnpm smoke:finance-twin-payables-aging:local
pnpm smoke:finance-twin-contract-metadata:local
pnpm smoke:finance-twin-card-expense:local
pnpm smoke:cfo-wiki-foundation:local
pnpm smoke:cfo-wiki-document-pages:local
pnpm smoke:cfo-wiki-lint-export:local
pnpm smoke:cfo-wiki-concept-metric-policy:local
pnpm smoke:finance-discovery-answer:local
pnpm smoke:finance-discovery-supported-families:local
pnpm smoke:finance-policy-lookup:local
pnpm smoke:finance-discovery-quality:local
pnpm eval:finance-discovery-quality
pnpm smoke:finance-memo:local
pnpm smoke:finance-report-filed-artifact:local
pnpm smoke:board-packet:local
pnpm smoke:board-packet-circulation-approval:local
pnpm smoke:board-packet-circulation-log:local
pnpm smoke:board-packet-circulation-log-correction:local
pnpm smoke:lender-update:local
pnpm smoke:diligence-packet:local
pnpm smoke:lender-update-release-approval:local
pnpm smoke:lender-update-release-log:local
pnpm smoke:diligence-packet-release-approval:local
pnpm smoke:diligence-packet-release-log:local
pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/twin/workflow-sync.spec.ts src/modules/twin/test-suite-sync.spec.ts src/modules/twin/codeowners-discovery.spec.ts
pnpm lint
pnpm typecheck
pnpm test
pnpm ci:repro:current
```

Current docs-only run status on 2026-04-22:

- passed: every requested smoke command from `pnpm smoke:source-ingest:local` through `pnpm smoke:diligence-packet-release-log:local`
- passed: `pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/twin/workflow-sync.spec.ts src/modules/twin/test-suite-sync.spec.ts src/modules/twin/codeowners-discovery.spec.ts`
- passed: `pnpm lint`
- passed: `pnpm typecheck`
- passed: `pnpm test`
- failed: `pnpm ci:repro:current`
  Failure detail: the clean temporary worktree run failed inside `@pocket-cto/codex-runtime` on `packages/codex-runtime/src/protocol.spec.ts` because the expected `item/commandExecution/terminalInteraction` notification array was empty.
  Planning consequence: because the user required the full ladder to be green before commit, push, or PR creation, this docs-only slice stops at a truthful handoff rather than widening into unrelated runtime work.

User-visible acceptance for the future F5C4H implementation thread:

- one completed approved-for-circulation `board_packet` reporting mission with one stored `board_packet` artifact and one existing logged `circulationRecord` can append a correction that optionally changes the effective `circulatedBy`
- the original immutable `circulationRecord` still preserves the original logged `circulatedBy`
- append-only `circulationCorrections` remain safe to retry by `correctionKey`
- derived reporting, mission, proof-bundle, and approval-card surfaces show original actor truth, current effective actor truth, and chronology clearly
- no new approval kind, no new mission family, no system send or delivery behavior, no runtime-codex widening, and no broader packet widening are introduced
- provenance, freshness, reviewer trace, and limitations remain visible wherever circulation chronology is shown

## Idempotence and Recovery

This docs-only handoff is safe to rerun because it adds one new plan file and refreshes active guidance only.
If the same doc patch needs to be applied again, reread the current active-doc chain first so the active plan pointer is not duplicated or drifted.

For the future implementation thread, retries should stay keyed by the existing `correctionKey` contract so replays of the same actor-correction request remain idempotent.
If a correction write partially fails after the approval payload updates, use the replay and approval row as the durable source of truth rather than rewriting raw evidence or mutating the original circulation record.

If the future implementation unexpectedly requires a new migration or replay-type widening, stop and update this plan explicitly before landing that change.
Rollback should prefer reverting the narrow F5C4H commit series rather than widening the correction subsystem further.

## Artifacts and Notes

This docs-only slice should produce:

- `plans/FP-0048-board-packet-circulation-actor-correction-and-chronology-hardening.md` as the sole active implementation contract
- the smallest truthful active-doc refresh that points the next thread at FP-0048 rather than a generic post-F5C4G reevaluation
- a truthful validation record showing that the docs refresh did not regress the shipped baseline across the requested smokes, targeted twin guardrails, lint, typecheck, and test, while also recording the unrelated `pnpm ci:repro:current` clean-tree blocker
- one local commit, push, and PR only if the full requested validation ladder is green

The future implementation slice should produce:

- widened board-circulation correction contracts on the existing `report_circulation` seam
- updated proof and operator surfaces that distinguish original actor from effective actor
- updated tests and widened assertions inside the existing board circulation correction smoke

## Interfaces and Dependencies

- `packages/domain` remains the pure contract layer for approvals, reporting views, proof bundles, mission detail, and mission list state.
- `apps/control-plane/src/modules/approvals` remains the persistence and replay owner for `report_circulation`.
- `apps/control-plane/src/modules/reporting` remains the owner of circulation-readiness, circulation-record, chronology derivation, and mission-scoped operator preparation.
- `apps/control-plane/src/modules/evidence` remains the owner of proof-bundle summaries and manifest assembly.
- `apps/web` remains read-model and form wiring only; it must not import DB code directly.
- `packages/codex-runtime` and runtime-codex prompts stay unchanged in F5C4H.
- `tools/board-packet-circulation-log-correction-smoke.mjs` remains the existing packaged proof seam; do not add a new smoke command family for actor correction.
- GitHub connector work stays out of scope, and `$github-app-integration-guard` remains unused for this slice.
- No new environment variables are expected.

## Outcomes & Retrospective

This thread is intentionally docs-and-plan only.
What shipped here is one implementation-ready F5C4H contract and the smallest truthful active-doc refresh needed to make it the sole active next step.
No runtime code, route, schema, migration, package-script, smoke-command, or eval-dataset changes shipped in this slice.

The main change from the prior “reevaluate later-F5” posture is that the repo now has enough concrete truth to justify exactly one narrow successor plan: append-only actor-attribution correction on the existing board `report_circulation` seam.
What remains is still narrow: first resolve or consciously waive the unrelated `pnpm ci:repro:current` clean-tree failure, then start the actual F5C4H implementation thread, rerun the full ladder, and close out once that code either ships or proves unnecessary.
