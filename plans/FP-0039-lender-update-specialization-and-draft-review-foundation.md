# Define F5C2 lender update specialization and draft review foundation

## Purpose / Big Picture

This plan now serves as the shipped F5C2 implementation record produced by the F5C2 master-plan, implementation, and QA closeout work.
The target phase is `F5`, and the next execution slice is `F5C2-lender-update-specialization-and-draft-review-foundation`.
The user-visible goal is narrow and concrete: after the shipped F5A, F5B, and F5C1 path already creates one draft `finance_memo`, one linked `evidence_appendix`, truthful stored-vs-filed-vs-exported posture, and one specialized draft `board_packet`, Pocket CFO should next be able to compile one specialized draft `lender_update` from completed reporting work and present it as review-ready draft output without widening into diligence specialization, external release, finance approval, runtime-codex drafting, filing or export expansion, or non-markdown output formats.

This matters now because the repo already ships the right deterministic substrate for the next packet-specialization pass: first-class `reporting` missions, `manual_reporting`, stored `finance_memo.bodyMarkdown`, stored `evidence_appendix.bodyMarkdown`, reporting proof bundles, mission-centric filing and markdown export reuse for the finance-memo path, and the first real packet specialization through a draft-only `board_packet`.
What is still missing is a narrowed F5C2 contract.
The inherited “lender and diligence packet specialization” label is too wide to hand to the next implementation thread safely.
This plan narrows that next thread to one packet family, one input contract, one review posture, and one bounded set of seams.

GitHub connector work is explicitly out of scope.
This plan does not authorize diligence packet specialization, approval-release hardening, runtime-codex drafting, PDF export, slide export, Marp export, F6 monitoring, or any rename from `modules/reporting/**` to `modules/reports/**`.
This plan now records the landed F5C2 implementation: additive runtime code, one additive artifact-kind migration, one packaged lender-update smoke, and no new eval dataset, filing path, export path, approval path, or runtime-codex drafting seam beyond the bounded lender-update specialization described below.

## Progress

- [x] 2026-04-19T12:11:24Z Audit the active docs, shipped F5A through F5C1 records, reporting mission contracts, reporting operator surfaces, proof-bundle posture, runtime-codex boundary, approval semantics, and packaged smoke coverage before choosing the narrowest truthful F5C2 scope.
- [x] 2026-04-19T12:11:24Z Create `plans/FP-0039-lender-update-specialization-and-draft-review-foundation.md` and refresh the smallest truthful active-doc chain so `plans/FP-0038-board-packet-specialization-and-draft-review-foundation.md` remains the shipped F5C1 record while this file becomes the single active F5C2 implementation contract.
- [x] 2026-04-19T12:18:41Z Run the preserved source-ingest through board-packet confidence ladder, targeted twin regressions, repo-wide validation, and `pnpm ci:repro:current` for this docs-and-plan handoff without starting F5C2 code.
- [x] 2026-04-19T12:35:24Z Re-audit the clean F5C2 branch against the shipped F5A through F5C1 code, explicitly invoke the required repo skills in-thread, and confirm the pre-edit implementation verdict: add one deterministic `lender_update` specialization by extending the existing reporting and board-packet seams rather than reopening finance-memo publication, runtime-codex drafting, diligence specialization, or release posture.
- [x] 2026-04-19T13:58:26Z Land the first real F5C2 implementation slice: add `reportKind = "lender_update"`, add a first-class `lender_update` artifact kind and additive DB migration, add one dedicated `POST /missions/reporting/lender-updates` creation contract, compile one deterministic draft lender update from one completed finance-memo reporting mission with stored memo-plus-appendix evidence only, and extend proof-bundle plus mission-detail plus mission-list plus operator surfaces without widening into filing, export, diligence, approval, or runtime-codex drafting.
- [x] 2026-04-19T14:02:00Z Validate the landed F5C2 slice through targeted domain, control-plane, and web suites; the preserved F4 through F5C1 smoke ladder; the new `pnpm smoke:lender-update:local` proof; preserved twin guardrails; repo-wide `pnpm lint`, `pnpm typecheck`, and `pnpm test`; and clean-worktree `pnpm ci:repro:current`.
- [x] 2026-04-19T14:10:08Z Run a strict F5C2 QA pass, fix the lender-update operator follow-on copy so it stays truthful on lender-update mission detail, and refresh the active-doc chain so FP-0039 is recorded as the shipped F5C2 record rather than the next active implementation thread.
- [x] 2026-04-19T14:20:08Z Fix one QA-only web spec fixture shape mismatch that `pnpm ci:repro:current` exposed in `apps/web/app/missions/[missionId]/mission-actions.spec.tsx`, then rerun the narrow web tests plus `pnpm ci:repro:current` until reproducibility returned green.

## Surprises & Discoveries

- Observation: before this slice, the repo truth was one phase ahead of the active docs.
  Evidence: `README.md`, `START_HERE.md`, `docs/ACTIVE_DOCS.md`, `docs/ops/local-dev.md`, `docs/ops/source-ingest-and-cfo-wiki.md`, `docs/ops/codex-app-server.md`, `evals/README.md`, and `docs/benchmarks/seeded-missions.md` all pointed the next thread at `plans/FP-0038-board-packet-specialization-and-draft-review-foundation.md` even though the codebase already shipped the F5C1 board-packet path.

- Observation: the reporting bounded context already preserves the exact specialization seam F5C2 should extend.
  Evidence: `packages/domain/src/reporting-mission.ts` already keeps `mission.type = "reporting"` stable, specializes through `reportKind`, distinguishes discovery-grounded versus reporting-grounded source input, and ships `board_packet` without creating a second top-level mission family.

- Observation: the next truthful input contract for lender specialization should stay reporting-grounded rather than board-packet-grounded.
  Evidence: `apps/control-plane/src/modules/reporting/service.ts` already requires a completed reporting mission with stored `finance_memo` plus stored `evidence_appendix` before packet specialization can compile, and `apps/control-plane/src/modules/reporting/board-packet.ts` already proves that stored reporting artifacts are the packet source of truth.

- Observation: filing and export posture already exist for the finance-memo reporting path and should remain separate from the next packet-specialization contract.
  Evidence: `apps/control-plane/src/modules/reporting/publication.ts`, `apps/control-plane/src/modules/reporting/service.ts`, and `apps/web/components/reporting-output-card.tsx` already keep stored draft posture, filed-page posture, and markdown export posture explicit without redefining proof readiness.

- Observation: the shipped F5C1 plan needed a minimal handoff note so it would remain a truthful historical record instead of an active next-step instruction.
  Evidence: before this refresh, `plans/FP-0038-board-packet-specialization-and-draft-review-foundation.md` still described the old docs-only handoff state even though its own progress log already recorded the landed F5C1 implementation.

- Observation: the shipped board-packet specialization already isolates almost all of the control-plane and web fanout F5C2 needs, so the remaining work is mostly to add a second packet artifact contract and creation path rather than inventing a new reporting architecture.
  Evidence: `packages/domain/src/reporting-mission.ts`, `apps/control-plane/src/modules/missions/board-packet.ts`, `apps/control-plane/src/modules/reporting/board-packet.ts`, `apps/control-plane/src/modules/reporting/service.ts`, `apps/control-plane/src/modules/evidence/proof-bundle-summary.ts`, `apps/web/app/missions/[missionId]/mission-actions.tsx`, and `apps/web/components/reporting-output-card.tsx`.

- Observation: the packaged lender-update smoke exposed one real slice-local failure before the final ladder went green: the new `artifact_kind` enum value existed in code and migration files, but the already-running local database had not applied the additive migration yet.
  Evidence: the first `pnpm smoke:lender-update:local` run left the lender-update mission stuck in `running` with only the placeholder proof bundle persisted until `pnpm db:migrate` applied `packages/db/drizzle/0032_bizarre_daimon_hellstrom.sql`, after which the same smoke passed cleanly.

- Observation: the first implementation pass left one operator-surface wording leak and one stale active-doc chain after the code itself had already landed.
  Evidence: `apps/web/app/missions/[missionId]/mission-actions.tsx` reused board-packet draft-only fallback copy on lender-update mission detail, while `README.md`, `START_HERE.md`, `docs/ACTIVE_DOCS.md`, `docs/ops/local-dev.md`, `docs/ops/source-ingest-and-cfo-wiki.md`, `docs/ops/codex-app-server.md`, and `evals/README.md` still pointed contributors at `FP-0039` as if F5C2 were the next active thread.

- Observation: the only post-correction failure came from a new QA spec fixture rather than the shipped lender-update path itself.
  Evidence: `pnpm ci:repro:current` failed in `apps/web/app/missions/[missionId]/mission-actions.spec.tsx` until the fixture added the required `mission.createdBy` field and the `liveControl.limitation = "single_process_only"` shape expected by `MissionDetailView`.

## Decision Log

- Decision: the first real F5C2 scope is `F5C2-lender-update-specialization-and-draft-review-foundation`.
  Rationale: the repo needs one implementation-ready packet contract, not a blended lender-plus-diligence-plus-approval program.

- Decision: the first F5C2 packet family is exactly `lender_update`.
  Rationale: one lender-facing draft packet is the narrowest truthful specialization after the shipped board-packet baseline.

- Decision: F5C2 must compile only from one completed `reporting` mission with stored `finance_memo` plus stored `evidence_appendix`.
  Rationale: the next packet path should reuse stored reporting evidence, not the derived `board_packet`, not generic chat intake, and not raw wiki pages alone.

- Decision: F5C2 keeps `mission.type = "reporting"` and specializes through `reportKind`.
  Rationale: reporting is already the first-class umbrella with the right mission, replay, artifact, and proof semantics, so a second top-level mission family would widen the product boundary unnecessarily.

- Decision: F5C2 stays deterministic and runtime-free.
  Rationale: the next packet-specialization slice should prove evidence-grounded lender-update compilation before any bounded runtime phrasing or formatting assistance is considered.

- Decision: F5C2 stays draft-only and review-ready.
  Rationale: lender communication changes external posture, so the safest truthful next slice is to surface a review-ready draft packet without introducing external release or finance approval semantics yet.

- Decision: F5C2 does not add diligence packet specialization.
  Rationale: multi-packet scope would blur the contract and make the next implementation thread too wide.

- Decision: F5C2 does not add PDF export, slide export, or Marp export.
  Rationale: the next packet slice should prove the specialized draft artifact contract before it widens into new output channels.

- Decision: F5C2 should not add filing or export behavior for `lender_update` in the first specialization pass.
  Rationale: the strong preference is to keep the next packet family focused on specialization, not publication posture, because filing and export already exist as a distinct finance-memo seam and should not be silently broadened into lender communication.

- Decision: implement F5C2 by mirroring the shipped board-packet specialization pattern with one dedicated lender-update intake contract, one dedicated lender-update artifact, and the same completed-finance-memo source-reporting gate.
  Rationale: that keeps the slice additive, legible, and low-risk while preserving the existing `reporting` mission umbrella, the current proof-bundle fanout, and the finance-memo-only publication seam.

- Decision: the F5C2 QA closeout should refresh operator copy and active-doc pointers without opening a new later-F5 implementation plan inside this slice.
  Rationale: the truthful correction is to mark FP-0039 as the shipped F5C2 record and leave later-F5 planning to its own next slice, rather than keeping stale “active F5C2” wording or widening this QA pass into F5C3 implementation work.

- Decision: F5C should now proceed as three explicit remaining sub-slices after shipped F5C1: `F5C2-lender-update-specialization-and-draft-review-foundation`, `F5C3-diligence-packet-specialization-and-draft-review-foundation`, and `F5C4-approval-release-hardening-for-external-communication-posture`.
  Rationale: this sequencing keeps lender specialization, diligence specialization, and external communication posture hardening as separate contracts.

- Decision: preserve the current `modules/reporting/**` vocabulary and do not reintroduce a `modules/reports/**` rename wave.
  Rationale: the shipped F5A through F5C1 code already standardized on first-class `reporting` seams, and a rename would create noise before the lender-update contract exists.

## Context and Orientation

Pocket CFO has already shipped F4A through F4C2, with `plans/FP-0035-finance-policy-lookup-and-discovery-quality-hardening.md` as the shipped final F4 record.
Pocket CFO has also already shipped the first three F5 slices:

- `plans/FP-0036-reporting-mission-foundation-and-first-finance-memo.md` as the shipped F5A reporting-foundation record
- `plans/FP-0037-draft-report-body-filed-artifact-and-markdown-export-hardening.md` as the shipped F5B reporting-reuse record
- `plans/FP-0038-board-packet-specialization-and-draft-review-foundation.md` as the shipped F5C1 board-packet record

That shipped F5 baseline now truthfully means all of the following are already in repo reality:

- `mission.type = "reporting"` and `sourceKind = "manual_reporting"`
- one deterministic `POST /missions/reporting` path from completed discovery work
- one draft `finance_memo`
- one linked `evidence_appendix`
- stored `bodyMarkdown` on both report artifacts
- mission-centric filing and markdown export reuse over the existing CFO Wiki seams for the finance-memo path
- one deterministic `POST /missions/reporting/board-packets` path from completed reporting work
- one draft `board_packet`
- reporting proof bundles that stay explicit about freshness, limitations, discovery lineage, reporting lineage, draft posture, and finance-memo publication posture

What the repo still does not have is any narrowed lender-update specialization contract.
`reportKind` is still limited to `finance_memo` plus `board_packet`, packet specialization still stops at board review posture, and the current operator reporting follow-on actions do not define lender-facing draft review behavior.

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
- this active plan, `plans/FP-0039-lender-update-specialization-and-draft-review-foundation.md`
- `docs/ops/local-dev.md`
- `docs/ops/source-ingest-and-cfo-wiki.md`
- `docs/ops/codex-app-server.md`
- `docs/benchmarks/seeded-missions.md`
- `evals/README.md`

GitHub connector work is out of scope.
The internal `@pocket-cto/*` package scope remains unchanged.
This landed slice adds bounded runtime code, one additive migration, one packaged lender-update smoke command, and no new eval dataset. Filing, markdown export reuse, PDF or slide export, approval-release posture, diligence specialization, and runtime-codex drafting remain out of scope.

The most relevant implementation seams for the landed F5C2 work are:

- `packages/domain/src/mission.ts`
- `packages/domain/src/reporting-mission.ts`
- `packages/domain/src/proof-bundle.ts`
- `packages/domain/src/mission-detail.ts`
- `packages/domain/src/mission-list.ts`
- `packages/domain/src/index.ts`
- `apps/control-plane/src/modules/missions/reporting.ts`
- `apps/control-plane/src/modules/missions/service.ts`
- `apps/control-plane/src/modules/missions/routes.ts`
- `apps/control-plane/src/modules/reporting/**`
- `apps/control-plane/src/modules/evidence/**`
- `apps/control-plane/src/modules/runtime-codex/**` only as an explicit non-goal for F5C2
- `apps/control-plane/src/modules/approvals/**` only as an explicit non-goal for F5C2
- `apps/web/app/missions/[missionId]/**`
- `apps/web/components/reporting-output-card.tsx`
- `apps/web/components/mission-card.tsx`
- `apps/web/components/mission-list-card.tsx`
- `apps/web/lib/api.ts`

## Plan of Work

F5C should now proceed through one narrow lender-focused contract before it widens again.

First, implement `F5C2` as one specialized reporting family called `lender_update`.
The new packet path should start only from one completed reporting mission that already stores one `finance_memo` and one `evidence_appendix`.
That means F5C2 should widen the reporting input contract from the shipped `finance_memo` discovery-grounded source and the shipped `board_packet` reporting-grounded source into a second reporting-grounded specialization: the existing `finance_memo` path keeps its current discovery anchor, the existing `board_packet` path keeps its completed-reporting anchor, and the new `lender_update` path should also compile from a completed reporting mission with stored memo-plus-appendix evidence rather than from the board packet or raw wiki state alone.

Second, keep the specialized lender-update compiler inside the existing `modules/reporting/**` bounded context and reuse stored report artifacts as the only lender-update source of truth.
F5C2 should read the completed source reporting mission, its stored `finance_memo`, its stored `evidence_appendix`, and the existing reporting proof bundle only where that helps explain draft posture.
It should not re-open discovery answer assembly, not read generic chat text, not treat raw wiki pages as the packet source of truth by themselves, and not create a runtime thread.

Third, expose the lender update as a review-ready draft reporting artifact through the existing mission list and mission detail surfaces.
F5C2 should show that the packet is specialized and reviewable, but it must not add release buttons, external-send actions, finance approval cards, filing behavior, markdown export reuse, PDF output, or slide output.
Later slices can widen from there:

- `F5C3` can add diligence packet specialization after the lender-update contract is stable.
- `F5C4` can add explicit approval-release hardening for external communication posture once specialized lender and diligence drafts already exist.

## Concrete Steps

1. Widen the pure reporting contract without adding a new mission family.
   Update:
   - `packages/domain/src/mission.ts`
   - `packages/domain/src/reporting-mission.ts`
   - `packages/domain/src/proof-bundle.ts`
   - `packages/domain/src/mission-detail.ts`
   - `packages/domain/src/mission-list.ts`
   - `packages/domain/src/index.ts`

   F5C2 should:
   - add `lender_update` as the next `reportKind`
   - keep `mission.type = "reporting"`
   - preserve `finance_memo` and `board_packet` as the shipped report kinds
   - add a reporting-grounded source contract for lender specialization so `lender_update` compiles from a completed reporting mission rather than from discovery, `board_packet`, or generic chat
   - carry source reporting mission lineage, source discovery mission lineage, carried freshness, carried limitations, related routes, related wiki pages, and draft-review posture through the typed read models

2. Extend reporting mission creation and reporting compilation inside the existing bounded contexts.
   Update:
   - `apps/control-plane/src/modules/missions/reporting.ts`
   - `apps/control-plane/src/modules/missions/service.ts`
   - `apps/control-plane/src/modules/missions/routes.ts`
   - `apps/control-plane/src/modules/reporting/service.ts`
   - `apps/control-plane/src/modules/reporting/formatter.ts`
   - `apps/control-plane/src/modules/reporting/artifact.ts`
   - `apps/control-plane/src/modules/reporting/types.ts`
   - add one small helper such as `apps/control-plane/src/modules/reporting/lender-update.ts` only if that keeps `formatter.ts` and `service.ts` legible

   F5C2 should:
   - require one completed source reporting mission
   - require stored `finance_memo`
   - require stored `evidence_appendix`
   - compile one deterministic draft `lender_update`
   - preserve `modules/reporting/**` ownership and vocabulary
   - remain read-only with no runtime-codex thread creation

3. Extend proof-bundle shaping and mission read models for specialized draft review, not release.
   Update:
   - `apps/control-plane/src/modules/evidence/proof-bundle-summary.ts`
   - `apps/control-plane/src/modules/evidence/proof-bundle-assembly.ts`
   - `apps/control-plane/src/modules/missions/detail-view.ts`
   - `apps/control-plane/src/modules/missions/service.ts`

   F5C2 should:
   - carry the source reporting mission id, source discovery mission id, and report kind through the proof bundle
   - keep freshness, limitation, provenance, and reviewer-ready posture explicit
   - distinguish specialized draft-review posture from later release posture
   - avoid new approval kinds, release workflow states, filed-page semantics, or external communication send semantics

4. Add the narrowest truthful operator path from completed reporting work to specialized lender-update review.
   Update:
   - `apps/web/app/missions/[missionId]/mission-actions.tsx`
   - `apps/web/app/missions/[missionId]/mission-action-forms.tsx`
   - `apps/web/app/missions/[missionId]/actions.ts`
   - `apps/web/components/reporting-output-card.tsx`
   - `apps/web/components/mission-card.tsx`
   - `apps/web/components/mission-list-card.tsx`
   - `apps/web/lib/api.ts`

   The first operator path should:
   - start from a completed `finance_memo` reporting mission
   - create one draft `lender_update` reporting mission
   - render the specialized lender update as review-ready draft output
   - keep filing and markdown-export posture separate and unchanged from the finance-memo path
   - avoid release buttons, external-send actions, finance approval cards, or PDF or slide export controls

5. Keep explicit non-goals in code comments, UI copy, and tests where needed.
   F5C2 must not:
   - reopen F5A discovery-to-memo foundation work
   - reopen F5B body visibility, filed-page reuse, or markdown export posture work
   - reopen F5C1 board-packet specialization work
   - add diligence packet specialization
   - add release or approval semantics
   - add runtime-codex drafting
   - add filing or export semantics for `lender_update`
   - add PDF, slide, or Marp export
   - rename `modules/reporting/**`

## Validation and Acceptance

The next F5C2 implementation thread should preserve the current confidence ladder and add only the narrowest lender-specialization coverage on top of it.

Targeted test batches:

- `pnpm --filter @pocket-cto/domain exec vitest run src/reporting-mission.spec.ts src/proof-bundle.spec.ts src/mission-detail.spec.ts src/mission-list.spec.ts`
- `zsh -lc "cd apps/control-plane && pnpm exec vitest run src/modules/reporting/service.spec.ts src/modules/missions/service.spec.ts src/modules/missions/routes.spec.ts src/modules/evidence/proof-bundle-assembly.spec.ts src/modules/missions/detail-view.spec.ts"`
- `zsh -lc "cd apps/web && pnpm exec vitest run \"components/reporting-output-card.spec.tsx\" \"components/mission-card.spec.tsx\" \"components/mission-list-card.spec.tsx\" \"app/missions/[missionId]/actions.spec.ts\""`

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

Targeted twin regressions plus repo-wide validation:

- `pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/twin/workflow-sync.spec.ts src/modules/twin/test-suite-sync.spec.ts src/modules/twin/codeowners-discovery.spec.ts`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm ci:repro:current`

User-visible F5C2 acceptance should be:

- a completed `finance_memo` reporting mission can create one specialized `lender_update` reporting mission
- the lender update compiles only from stored `finance_memo` plus stored `evidence_appendix` from one completed reporting mission
- the lender update remains deterministic, runtime-free, and explicit about freshness, limitations, and lineage
- the lender update is review-ready draft output, not released output
- diligence packet specialization remains out of scope
- approval-release semantics remain out of scope
- filing or export behavior for `lender_update` remains out of scope in the first specialization pass
- PDF, slide, and Marp export remain out of scope

For the landed F5C2 slice, acceptance is:

- `POST /missions/reporting/lender-updates` creates one `reporting` mission with `reportKind = "lender_update"` from one completed finance-memo reporting mission
- the new mission persists exactly one draft `lender_update` artifact plus the proof-bundle manifest
- proof readiness for the lender-update mission depends on the persisted `lender_update` artifact only while exposing source reporting lineage and linked appendix posture explicitly
- mission detail, mission list, and operator reporting cards expose the draft lender-update posture truthfully without inventing publication posture
- `pnpm smoke:lender-update:local` proves the deterministic, runtime-free, draft-only path without widening into diligence, approval, filing, export, PDF, or slide behavior

Provenance, freshness, replay, and limitation expectations for the landed F5C2 slice are:

- raw sources remain immutable and authoritative
- stored `finance_memo` plus stored `evidence_appendix` remain the lender-update source of truth
- carried freshness and limitations must remain explicit in the specialized packet, proof bundle, and operator read models
- replay should continue through the existing mission, task, artifact, and proof-bundle event spine rather than introducing release-only events early
- any proof or reporting gap should remain visible instead of being replaced with runtime invention

## Idempotence and Recovery

F5C2 should stay additive and retry-safe.
Raw sources, completed discovery missions, completed reporting missions, stored `finance_memo`, stored `evidence_appendix`, shipped `board_packet` drafts, and existing proof bundles remain immutable inputs.
The first lender-update specialization pass should derive new draft artifacts from stored reporting state without mutating the source memo, the source appendix, the source board packet, or the existing filed or export records.

If a lender-update compile fails, the source reporting mission should remain intact and reviewable.
If a lender-update retry is needed, it should rerun from the same stored reporting evidence or from a deliberately refreshed upstream reporting mission.
No release, send, approval, filing, PDF export, or slide export side effect should be produced in F5C2.

## Artifacts and Notes

This shipped F5C2 record now leaves:

- one shipped `lender_update` reporting specialization at `plans/FP-0039-lender-update-specialization-and-draft-review-foundation.md`
- refreshed active docs that point at shipped F5A through F5C2 history without pretending F5C2 is still the next unfinished thread
- one operator-surface copy fix so lender-update mission detail stays truthful about F5C2 draft-only posture

No new environment variables are expected for the first F5C2 slice.
If a concrete implementation blocker proves otherwise, document it in this plan and in the active docs before widening scope.

## Interfaces and Dependencies

`packages/domain` should stay pure and own the reporting source contract, packet-specialization report kinds, and reporting read-model fields.
`apps/control-plane/src/modules/reporting/**` should stay the deterministic compilation seam for the shipped `finance_memo` path, the shipped `board_packet` path, and the future `lender_update` specialization path.
`apps/control-plane/src/modules/evidence/**` should keep proof bundles explicit about freshness, limitations, lineage, and draft-review posture without importing release semantics early.
`apps/control-plane/src/modules/runtime-codex/**` and `apps/control-plane/src/modules/approvals/**` remain explicit later-slice seams for this plan, not F5C2 implementation targets.
`apps/web` should stay responsible for operator creation and review surfaces.

The CFO Wiki remains derived and reviewable, but F5C2 should not treat raw wiki pages alone as the lender-update source of truth.
The next packet path must stay grounded in the stored reporting artifacts that were already derived from completed discovery evidence.
The existing finance-memo filing and markdown export seams remain valid, but they are dependencies to preserve rather than the feature surface to widen in this first lender-update slice.

## Outcomes & Retrospective

This thread now records the shipped F5C2 implementation plus a narrow QA closeout.
It preserves the landed deterministic, draft-only, runtime-free `lender_update` specialization path from completed reporting work, records the additive migration and packaged lender-update smoke, and refreshes the active-doc chain so contributors are not pointed back at an already-shipped F5C2 slice.

This thread does not reopen F5C1, does not widen into F5C3 diligence implementation or F5C4 approval-release hardening, and does not start F6.
What remains is the next narrow later-F5 planning and implementation slice.
