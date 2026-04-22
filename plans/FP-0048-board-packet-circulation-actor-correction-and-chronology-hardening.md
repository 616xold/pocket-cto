# Define F5C4H board-packet circulation actor correction and chronology hardening

## Purpose / Big Picture

This file is the active F5C4H implementation contract for the first real board-packet circulation actor-correction slice.
`plans/FP-0047-board-packet-circulation-record-correction-and-chronology-foundation.md` remains the shipped F5C4G record that precedes it.
The target phase is `F5`, and the current delivered slice inside this plan is `F5C4H-board-packet-circulation-actor-correction-and-chronology-hardening`.
The user-visible goal is narrow and concrete: after the shipped F5A through F5C4G baseline already creates one draft `board_packet`, resolves one internal `report_circulation` approval, records one immutable original circulation record, and appends correction history plus derived chronology on that same seam, Pocket CFO now lets an operator append actor-attribution corrections to that existing circulation history and see one truthful current effective actor identity alongside the original immutable record and chronology summary without widening into actual send, distribute, publish, export widening, runtime-codex drafting, or a broader later-F5 umbrella.

This matters now because the repo no longer lacks board review posture, circulation logging, append-only chronology, or actor-attribution correction on that seam.
The shipped F5C4H widening closes the last previously verified board-specific gap: correction entries can now carry corrected `circulatedBy`, so the current effective actor identity may diverge truthfully from the immutable original record when later chronology requires it.
The next gain is therefore not more packet families, not delivery behavior, and not F6.
It is one shipped board-specific actor-correction contract that any later narrow continuation must preserve truthfully.

GitHub connector work is explicitly out of scope.
This plan does not authorize runtime-codex drafting, runtime-codex circulation behavior, actual send, distribute, or publish behavior, PDF export, slide export, Marp export, broader packet widening, a new approval kind, a new mission family, or any rename from `modules/reporting/**` to `modules/reports/**`.

## Progress

- [x] 2026-04-22T10:43:13Z Audit the shipped F5A through F5C4G plan chain, active docs, approvals seams, reporting seams, proof-bundle posture, runtime-codex boundary, and board-circulation contracts to verify whether any concrete later-F5 gap still exists.
- [x] 2026-04-22T10:43:13Z Confirm the narrow remaining gap in repo truth: the current append-only correction schema and derived effective chronology do not support corrected `circulatedBy`, so actor-attribution correction is the only implementation-ready F5C4H continuation worth planning.
- [x] 2026-04-22T10:43:13Z Create `plans/FP-0048-board-packet-circulation-actor-correction-and-chronology-hardening.md` and refresh only the smallest truthful active-doc set so `plans/FP-0047-board-packet-circulation-record-correction-and-chronology-foundation.md` remains the shipped F5C4G record while this file becomes the sole active implementation contract.
- [x] 2026-04-22T11:30:33Z Start the real F5C4H implementation thread: add optional corrected `circulatedBy` support on append-only correction entries, derive corrected effective actor chronology on the existing `report_circulation` seam, update the smallest truthful reporting and proof surfaces, and add the packaged actor-correction smoke.
  Status: shipped on the existing `report_circulation` seam with immutable original `circulationRecord` preservation, append-only actor correction history, original-versus-effective actor chronology across reporting and mission surfaces, proof-bundle chronology hardening, and the dedicated `pnpm smoke:board-packet-circulation-actor-correction:local` proof.
- [x] 2026-04-22T11:30:33Z Run the requested targeted tests, shipped baseline proofs, new actor-correction proof, preserved twin guardrails, repo-wide validation, and `pnpm ci:repro:current` for the landed F5C4H code.
  Status: all required commands passed on 2026-04-22, including `pnpm ci:repro:current` in the clean temporary worktree at `/var/folders/41/pj1kw0tj2xd832wl_62gn73m0000gn/T/pocket-cto-ci-repro-qLGLKh/repo`.
- [x] 2026-04-22T11:40:43Z Run the post-landing QA pass for the shipped F5C4H slice, confirm the feature remains narrow and delivery-free, and refresh any stale FP-0048 wording that still described actor correction as future work or the thread as docs-only.
  Status: the targeted F5C4H specs, required smoke ladder, and preserved twin guardrails all passed during QA. The only issue found was stale implementation-contract wording inside this plan, which was corrected without widening scope.

## Surprises & Discoveries

- Observation: the current correction schema already models append-only correction metadata and corrected effective circulation facts, but it omits corrected actor identity.
  Evidence: `packages/domain/src/approval.ts` defines `ReportCirculationApprovalCirculationCorrectionSchema` with `circulatedAt`, `circulationChannel`, and `circulationNote`, but no corrected `circulatedBy`.

- Observation: the current derived effective chronology always preserves the actor from the prior effective record rather than allowing an actor correction.
  Evidence: `apps/control-plane/src/modules/reporting/circulation-chronology.ts` keeps `circulatedBy: input.currentEffective.circulatedBy` inside `buildCorrectedEffectiveRecordView`.

- Observation: the existing `report_circulation` approval payload and `approval.circulation_log_corrected` replay event are already the right persistence and replay anchors for the next slice.
  Evidence: `apps/control-plane/src/modules/approvals/service.ts`, `apps/control-plane/src/modules/approvals/payload.ts`, and `apps/control-plane/src/modules/reporting/service.ts` already append corrections safely by `correctionKey` on the resolved approval payload and emit `approval.circulation_log_corrected`.

- Observation: preserving the shipped F5C4G correction smoke while adding one dedicated F5C4H actor-correction smoke kept the baseline proof stable and matched the narrower acceptance contract for this slice.
  Evidence: `tools/board-packet-circulation-log-correction-smoke.mjs` remained untouched while `tools/board-packet-circulation-actor-correction-smoke.mjs` and the `pnpm smoke:board-packet-circulation-actor-correction:local` package script were added for actor-only chronology proof.

- Observation: the full requested implementation ladder is green for this slice, including clean-tree reproduction.
  Evidence: the targeted domain, control-plane, and web vitest commands, the preserved baseline smokes, the new actor-correction smoke, the twin guardrails, `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm ci:repro:current` all passed on 2026-04-22.

- Observation: the only QA defect after landing was stale FP-0048 narrative text that still described corrected actor attribution as unshipped future work and still described the thread as docs-only.
  Evidence: the plan's `Purpose / Big Picture` and `Context and Orientation` sections still said corrected `circulatedBy` was a remaining gap and that no runtime code or smoke commands had shipped, despite the validated F5C4H implementation.

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

- Decision: preserve the shipped F5C4G correction smoke and add one dedicated F5C4H actor-correction smoke.
  Rationale: keeping `pnpm smoke:board-packet-circulation-log-correction:local` unchanged preserves the prior baseline truth, while `pnpm smoke:board-packet-circulation-actor-correction:local` proves the new actor-only widening directly.

- Decision: leave approval-card rendering unchanged in this first F5C4H slice.
  Rationale: actor chronology is already visible in reporting output, mission detail, mission card, mission list, and proof-bundle surfaces, while approval posture itself remains unchanged on the existing `report_circulation` seam.

- Decision: after this first shipped F5C4H slice, the repo should reevaluate whether any later-F5 work is still justified before F6, and it should not create a broad `FP-0049` umbrella prematurely.
  Rationale: the current remaining operator problem is concrete and narrow, so the next successor should be chosen only after this actor-correction slice is audited and any residual gap is proven real.

- Decision: keep FP-0048 itself post-landing truthful during QA, even when the only correction is documentation.
  Rationale: this plan is part of the active contract surface, so stale future-tense wording about shipped behavior is a slice-local correctness issue, not optional polish.

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

The shipped F5C4H widening now means correction entries can carry corrected actor identity while preserving the original immutable record.
Any active successor contract must therefore stay board-specific, approval-payload-backed, additive, deterministic, runtime-free, and delivery-free instead of reopening broader later-F5 scope.

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
This shipped slice already landed runtime code, schema widening, read-model updates, tests, and one dedicated smoke command, all inside the existing approvals, reporting, evidence, and web read-model seams.
Any next real F5C4H continuation should stay inside those same seams.

## Plan of Work

First, ship the narrowest truthful actor-correction widening on the existing `report_circulation` seam and preserve FP-0047 as the shipped F5C4G record rather than reopening it.

Second, widen the pure approval and reporting contracts just enough to let append-only correction entries carry optional corrected `circulatedBy` on the existing `report_circulation` seam.
The original `circulationRecord` must remain immutable, and the correction history must remain append-only and idempotent by `correctionKey`.

Third, retarget the existing mission-scoped correction write path rather than inventing a new subsystem.
The current `POST /missions/:missionId/reporting/circulation-log-correction` seam should continue to own this work, but it should accept optional corrected actor identity on the same correction entry and derive one truthful current effective actor view plus chronology summary from the original record plus appended corrections.

Fourth, widen reporting, proof-bundle, mission, approval-card, and operator read surfaces only enough to make original-versus-effective actor identity visible.
The repo should keep current freshness, limitation, provenance, and reviewer-trace posture explicit and should still avoid any delivery automation or runtime-codex widening.

Finally, after this first F5C4H slice, pause before opening another plan number.
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

5. Extend the existing proof coverage and add one dedicated actor-correction smoke.
   Update:
   - `tools/board-packet-circulation-actor-correction-smoke.mjs`
   - `apps/control-plane/src/modules/approvals/service.spec.ts`
   - `apps/control-plane/src/modules/reporting/service.spec.ts`
   - `apps/control-plane/src/modules/evidence/proof-bundle-assembly.spec.ts`
   - `apps/web/components/reporting-output-card.spec.tsx`
   - any other narrow web or control-plane tests directly adjacent to touched seams

   F5C4H should:
   - preserve the shipped `pnpm smoke:board-packet-circulation-approval:local` proof
   - preserve the shipped `pnpm smoke:board-packet-circulation-log:local` proof
   - preserve the shipped `pnpm smoke:board-packet-circulation-log-correction:local` proof as the F5C4G baseline
   - add `pnpm smoke:board-packet-circulation-actor-correction:local` as the dedicated F5C4H actor-only proof
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

For the first real F5C4H implementation thread, rerun the narrow validation ladder requested for this slice and finish only on a full green pass.

Required command set:

```bash
pnpm --filter @pocket-cto/domain exec vitest run src/approval.spec.ts src/proof-bundle.spec.ts src/mission-detail.spec.ts src/mission-list.spec.ts
zsh -lc "cd apps/control-plane && pnpm exec vitest run src/modules/approvals/**/*.spec.ts src/modules/reporting/**/*.spec.ts src/modules/missions/**/*.spec.ts src/modules/evidence/**/*.spec.ts src/modules/orchestrator/**/*.spec.ts src/app.spec.ts"
zsh -lc "cd apps/web && pnpm exec vitest run app/**/*.spec.ts* components/**/*.spec.ts* lib/api.spec.ts"
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
pnpm smoke:board-packet-circulation-actor-correction:local
pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/twin/workflow-sync.spec.ts src/modules/twin/test-suite-sync.spec.ts src/modules/twin/codeowners-discovery.spec.ts
pnpm lint
pnpm typecheck
pnpm test
pnpm ci:repro:current
```

Current implementation run status on 2026-04-22:

- passed: `pnpm --filter @pocket-cto/domain exec vitest run src/approval.spec.ts src/proof-bundle.spec.ts src/mission-detail.spec.ts src/mission-list.spec.ts`
- passed: `zsh -lc "cd apps/control-plane && pnpm exec vitest run src/modules/approvals/**/*.spec.ts src/modules/reporting/**/*.spec.ts src/modules/missions/**/*.spec.ts src/modules/evidence/**/*.spec.ts src/modules/orchestrator/**/*.spec.ts src/app.spec.ts"`
- passed: `zsh -lc "cd apps/web && pnpm exec vitest run app/**/*.spec.ts* components/**/*.spec.ts* lib/api.spec.ts"`
- passed: the shipped baseline proofs from `pnpm smoke:finance-discovery-answer:local` through `pnpm smoke:diligence-packet-release-log:local`
- passed: `pnpm smoke:board-packet-circulation-actor-correction:local`
- passed: `pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/twin/workflow-sync.spec.ts src/modules/twin/test-suite-sync.spec.ts src/modules/twin/codeowners-discovery.spec.ts`
- passed: `pnpm lint`
- passed: `pnpm typecheck`
- passed: `pnpm test`
- passed: `pnpm ci:repro:current`
  Detail: clean temporary worktree reproduction succeeded at `/var/folders/41/pj1kw0tj2xd832wl_62gn73m0000gn/T/pocket-cto-ci-repro-qLGLKh/repo`.

User-visible acceptance now proven on 2026-04-22:

- one completed approved-for-circulation `board_packet` reporting mission with one stored `board_packet` artifact and one existing logged `circulationRecord` can append a correction that optionally changes the effective `circulatedBy`
- the original immutable `circulationRecord` still preserves the original logged `circulatedBy`
- append-only `circulationCorrections` remain safe to retry by `correctionKey`
- derived reporting, mission, and proof-bundle surfaces show original actor truth, current effective actor truth, correction count, latest correction summary, and chronology clearly
- no new approval kind, no new mission family, no system send or delivery behavior, no runtime-codex widening, and no broader packet widening are introduced
- provenance, freshness, reviewer trace, and limitations remain visible wherever circulation chronology is shown

## Idempotence and Recovery

This slice is safe to rerun because it is additive: it widens append-only correction entries with optional corrected actor identity, preserves the original circulation record, and reuses the existing approval and replay anchors.
If the same patch needs to be applied again, reread the current effective record first and preserve idempotent retries through the existing `correctionKey` contract.

Retries should stay keyed by the existing `correctionKey` contract so replays of the same actor-correction request remain idempotent.
If a correction write partially fails after the approval payload updates, use the replay and approval row as the durable source of truth rather than rewriting raw evidence or mutating the original circulation record.

If any later F5C4H continuation unexpectedly requires a new migration or replay-type widening, stop and update this plan explicitly before landing that change.
Rollback should prefer reverting the narrow F5C4H commit series rather than widening the correction subsystem further.

## Artifacts and Notes

This slice should produce:

- widened board-circulation correction contracts on the existing `report_circulation` seam with optional corrected `circulatedBy`
- updated reporting, mission, and proof surfaces that distinguish original actor from effective actor
- `tools/board-packet-circulation-actor-correction-smoke.mjs` plus the `pnpm smoke:board-packet-circulation-actor-correction:local` package script
- the smallest truthful active-doc refresh that stops describing corrected `circulatedBy` as unshipped
- one local commit, push, and PR only if the full requested validation ladder is green

## Interfaces and Dependencies

- `packages/domain` remains the pure contract layer for approvals, reporting views, proof bundles, mission detail, and mission list state.
- `apps/control-plane/src/modules/approvals` remains the persistence and replay owner for `report_circulation`.
- `apps/control-plane/src/modules/reporting` remains the owner of circulation-readiness, circulation-record, chronology derivation, and mission-scoped operator preparation.
- `apps/control-plane/src/modules/evidence` remains the owner of proof-bundle summaries and manifest assembly.
- `apps/web` remains read-model and form wiring only; it must not import DB code directly.
- `packages/codex-runtime` and runtime-codex prompts stay unchanged in F5C4H.
- `tools/board-packet-circulation-log-correction-smoke.mjs` remains the shipped F5C4G proof seam, and `tools/board-packet-circulation-actor-correction-smoke.mjs` is the shipped F5C4H proof seam.
- GitHub connector work stays out of scope, and `$github-app-integration-guard` remains unused for this slice.
- No new environment variables are expected.

## Outcomes & Retrospective

This thread shipped the first real F5C4H implementation.
What landed is one narrow append-only actor-correction widening on the existing board `report_circulation` seam, one truthful original-versus-effective actor chronology across reporting and proof surfaces, one dedicated packaged actor-correction smoke, and the smallest active-doc refresh needed to stop describing corrected actor attribution as future-only work.

The main change from the prior “reevaluate later-F5” posture is that the repo now has concrete shipped truth for corrected board circulation actor attribution without widening into delivery, export, or runtime-codex behavior.
What remains should stay narrow: if any follow-on work is still justified, keep it inside FP-0048 hardening rather than reopening broader later-F5 scope or starting F6 early.
