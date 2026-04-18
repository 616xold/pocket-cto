# Define F5C1 board packet specialization and draft review foundation

## Purpose / Big Picture

This plan is the active F5 implementation contract produced by the docs-only F5C master-plan and active-doc refresh slice.
The target phase is `F5`, and the first execution slice is `F5C1-board-packet-specialization-and-draft-review-foundation`.
The user-visible goal is narrow and concrete: after the shipped F5A and F5B reporting path already creates one draft `finance_memo`, one linked `evidence_appendix`, and truthful stored-vs-filed-vs-exported posture, Pocket CFO should be able to compile one specialized draft `board_packet` from that completed reporting work and present it as review-ready draft output without widening into external release, finance approval, lender or diligence specialization, runtime-codex drafting, or non-markdown export formats.

This matters now because the repo already ships the right deterministic substrate for the first packet-specialization pass: first-class `reporting` missions, `manual_reporting`, stored `finance_memo.bodyMarkdown`, stored `evidence_appendix.bodyMarkdown`, reporting proof bundles, mission-centric filing and markdown export reuse, and operator mission detail that already exposes the stored report bodies directly.
What is still missing is a narrowed F5C contract.
The broad roadmap label for F5C is too wide to hand to the next implementation thread safely.
This plan narrows that next thread to one packet family, one input contract, one review posture, and one bounded set of seams.

GitHub connector work is explicitly out of scope.
This plan does not authorize F5C2 lender or diligence packet specialization, F5C3 approval-release hardening, runtime-codex drafting, PDF export, slide export, Marp export, F6 monitoring, or any rename from `modules/reporting/**` to `modules/reports/**`.

## Progress

- [x] 2026-04-18T23:40:19Z Audit the active docs, shipped F5A and F5B records, reporting mission contracts, reporting operator surfaces, proof-bundle posture, runtime-codex boundary, and approval semantics before narrowing the first real F5C implementation slice.
- [x] 2026-04-18T23:40:19Z Create `plans/FP-0038-board-packet-specialization-and-draft-review-foundation.md` and refresh the smallest truthful active-doc set so `plans/FP-0037-draft-report-body-filed-artifact-and-markdown-export-hardening.md` remains the shipped F5B record while this file becomes the active F5C implementation contract.
- [x] 2026-04-18T23:40:19Z Re-run the preserved source-ingest through finance-report confidence ladder plus repo-wide validation for this docs-and-plan handoff without starting F5C1 code.
- [ ] 2026-04-18T23:40:19Z Start the first real F5C1 implementation thread on a clean branch and land deterministic `board_packet` specialization plus draft-review foundation from one completed reporting mission with stored `finance_memo` and stored `evidence_appendix` only.

## Surprises & Discoveries

- Observation: the shipped reporting contract is already first-class and still narrower than the broad F5C roadmap label.
  Evidence: `packages/domain/src/mission.ts`, `packages/domain/src/reporting-mission.ts`, and `apps/control-plane/src/modules/missions/reporting.ts` already model `mission.type = "reporting"`, `sourceKind = "manual_reporting"`, and `reportKind = "finance_memo"` with creation anchored by `sourceDiscoveryMissionId`.

- Observation: F5B already gives the next packet slice deterministic stored inputs rather than just metadata.
  Evidence: `packages/domain/src/reporting-mission.ts`, `apps/control-plane/src/modules/reporting/service.ts`, `apps/control-plane/src/modules/reporting/publication.ts`, `apps/web/components/reporting-output-card.tsx`, `tools/finance-memo-smoke.mjs`, and `tools/finance-report-filed-artifact-smoke.mjs` already preserve stored memo and appendix bodies, source reporting lineage, and additive filed/export posture.

- Observation: the operator action surface still starts reporting from discovery missions only, so the first F5C1 user path must move downstream to completed reporting missions rather than back to generic intake.
  Evidence: `apps/web/app/missions/[missionId]/mission-actions.tsx`, `apps/web/app/missions/[missionId]/mission-action-forms.tsx`, and `apps/web/app/missions/[missionId]/actions.ts` currently create only draft `finance_memo` reporting missions from succeeded discovery missions.

- Observation: current approval plumbing remains runtime-execution-centered and should stay out of the first packet-specialization slice.
  Evidence: `packages/domain/src/proof-bundle.ts`, `apps/control-plane/src/modules/evidence/proof-bundle-assembly.ts`, and `docs/ops/codex-app-server.md` still treat approvals as runtime or external-action posture rather than report-review workflow semantics.

- Observation: the active-doc chain was the main thing still widening or misdirecting F5 work.
  Evidence: `README.md`, `START_HERE.md`, `docs/ACTIVE_DOCS.md`, `plans/ROADMAP.md`, `docs/ops/local-dev.md`, `docs/ops/source-ingest-and-cfo-wiki.md`, `docs/ops/codex-app-server.md`, `evals/README.md`, and `docs/benchmarks/seeded-missions.md` all still pointed at `FP-0037` as active or left F5C too broad.

## Decision Log

- Decision: the first real F5C scope is `F5C1-board-packet-specialization-and-draft-review-foundation`.
  Rationale: the repo needs one implementation-ready packet contract, not a blended packet-plus-approval-plus-release program.

- Decision: the first packet family is exactly `board_packet`.
  Rationale: one board-facing draft packet is the narrowest truthful specialization on top of the shipped memo-plus-appendix baseline.

- Decision: F5C1 compiles only from one completed `reporting` mission that already stores one `finance_memo` and one `evidence_appendix`.
  Rationale: the first packet path should reuse stored reporting evidence, not generic chat intake and not raw wiki pages alone.

- Decision: F5C1 keeps `mission.type = "reporting"` and specializes through `reportKind`.
  Rationale: reporting is already a first-class umbrella with the right mission, replay, artifact, and proof semantics, so a second top-level mission family would widen the product boundary unnecessarily.

- Decision: F5C1 stays deterministic and runtime-free.
  Rationale: the first packet-specialization slice should prove evidence-grounded packet compilation before any bounded runtime phrasing or formatting assistance is considered.

- Decision: F5C1 stays draft-only and review-ready.
  Rationale: packet specialization changes external communication posture, so the safest truthful first slice is to surface a review-ready draft packet without introducing external release or finance approval semantics yet.

- Decision: F5C1 does not add lender or diligence packet specialization.
  Rationale: multi-packet scope would blur the contract and make the first F5C implementation thread too wide.

- Decision: F5C1 does not add PDF export, slide export, or Marp export.
  Rationale: the first packet slice should prove the specialized draft artifact contract before it widens into new output channels.

- Decision: F5C should now proceed as three explicit sub-slices: `F5C1-board-packet-specialization-and-draft-review-foundation`, `F5C2-lender-and-diligence-packet-specialization`, and `F5C3-approval-release-hardening-for-external-communication-posture`.
  Rationale: this sequencing keeps packet-family expansion separate from external communication posture hardening.

- Decision: preserve the current `modules/reporting/**` vocabulary and do not reintroduce a `modules/reports/**` rename wave.
  Rationale: the shipped F5A and F5B code already standardized on first-class `reporting` seams, and a rename would create noise before the packet contract exists.

- Decision: leave `plans/FP-0036-reporting-mission-foundation-and-first-finance-memo.md` as the shipped F5A record and `plans/FP-0037-draft-report-body-filed-artifact-and-markdown-export-hardening.md` as the shipped F5B record while this file becomes the active F5C contract.
  Rationale: the plan chain should preserve shipped history and create exactly one new active plan.

## Context and Orientation

Pocket CFO has already shipped F4A through F4C2, with `plans/FP-0035-finance-policy-lookup-and-discovery-quality-hardening.md` as the shipped final F4 record.
Pocket CFO has also already shipped the first two F5 slices:

- `plans/FP-0036-reporting-mission-foundation-and-first-finance-memo.md` as the shipped F5A reporting-foundation record
- `plans/FP-0037-draft-report-body-filed-artifact-and-markdown-export-hardening.md` as the shipped F5B reporting-reuse record

That shipped F5 baseline now truthfully means all of the following are already in repo reality:

- `mission.type = "reporting"` and `sourceKind = "manual_reporting"`
- one deterministic `POST /missions/reporting` path from completed discovery work
- one draft `finance_memo`
- one linked `evidence_appendix`
- stored `bodyMarkdown` on both report artifacts
- mission-centric filing and markdown export reuse over the existing CFO Wiki seams
- reporting proof bundles that already stay explicit about freshness, limitations, source discovery lineage, draft posture, and filed/export posture

What the repo still does not have is any narrowed packet-specialization contract.
`reportKind` is still limited to `finance_memo`, reporting creation still starts only from completed discovery missions, and the current operator reporting follow-on actions stop at filing plus markdown export.

The active-doc boundary for this handoff is:

- `README.md`
- `START_HERE.md`
- `docs/ACTIVE_DOCS.md`
- `PLANS.md`
- `plans/ROADMAP.md`
- `plans/FP-0035-finance-policy-lookup-and-discovery-quality-hardening.md`
- `plans/FP-0036-reporting-mission-foundation-and-first-finance-memo.md`
- `plans/FP-0037-draft-report-body-filed-artifact-and-markdown-export-hardening.md`
- this active plan, `plans/FP-0038-board-packet-specialization-and-draft-review-foundation.md`
- `docs/ops/local-dev.md`
- `docs/ops/source-ingest-and-cfo-wiki.md`
- `docs/ops/codex-app-server.md`
- `docs/benchmarks/seeded-missions.md`
- `evals/README.md`

GitHub connector work is out of scope.
The internal `@pocket-cto/*` package scope remains unchanged.
This planning slice is docs-only and must not add runtime code, routes, schema changes, migrations, package scripts, smoke commands, eval datasets, or implementation scaffolding.

The most relevant implementation seams for the future F5C1 code thread are:

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
- `apps/control-plane/src/modules/runtime-codex/**` only as an explicit non-goal for F5C1
- `apps/control-plane/src/modules/approvals/**` only as an explicit non-goal for F5C1
- `apps/web/app/missions/[missionId]/**`
- `apps/web/components/reporting-output-card.tsx`
- `apps/web/components/mission-card.tsx`
- `apps/web/components/mission-list-card.tsx`
- `apps/web/lib/api.ts`

## Plan of Work

F5C should now proceed in three explicit sub-slices inside one reporting phase.

First, implement `F5C1` as one specialized reporting family called `board_packet`.
The new packet path should start only from one completed reporting mission that already stores one `finance_memo` and one `evidence_appendix`.
That means F5C1 should widen the reporting input contract from a discovery-only source anchor to a discriminated reporting source shape: the shipped `finance_memo` path keeps its current discovery-grounded input, while the new `board_packet` path adds a reporting-grounded source anchor and carries forward company scope, question kind, policy source scope when present, stored freshness, stored limitations, related routes, related wiki pages, and source reporting lineage.

Second, keep the specialized packet compiler inside the existing `modules/reporting/**` bounded context and reuse stored report artifacts as the only packet source of truth.
F5C1 should read the completed source reporting mission, its stored `finance_memo`, its stored `evidence_appendix`, and the existing reporting proof bundle or publication summary only where that helps explain draft posture.
It should not re-open discovery answer assembly, not read generic chat text, not treat raw wiki pages as the packet source of truth by themselves, and not create a runtime thread.

Third, expose the board packet as a review-ready draft reporting artifact through the existing mission list and mission detail surfaces.
F5C1 should show that the packet is specialized and reviewable, but it must not add release buttons, external-send actions, finance approval cards, PDF output, or slide output.
Later slices can widen from there:

- `F5C2` can add lender and diligence packet specialization after the board packet contract is stable.
- `F5C3` can add explicit approval-release hardening for external communication posture once specialized packet drafts already exist.

## Concrete Steps

1. Widen the pure reporting contract without adding a new mission family.
   Update:
   - `packages/domain/src/mission.ts`
   - `packages/domain/src/reporting-mission.ts`
   - `packages/domain/src/proof-bundle.ts`
   - `packages/domain/src/mission-detail.ts`
   - `packages/domain/src/mission-list.ts`
   - `packages/domain/src/index.ts`

   F5C1 should:
   - add `board_packet` as the first new `reportKind`
   - keep `mission.type = "reporting"`
   - preserve `finance_memo` as the shipped memo kind
   - add a reporting-grounded source contract for packet specialization so `board_packet` compiles from a completed reporting mission rather than from discovery or generic chat
   - carry source reporting mission lineage, carried freshness, carried limitations, related routes, related wiki pages, and draft-review posture through the typed read models

2. Extend reporting mission creation and reporting compilation inside the existing bounded contexts.
   Update:
   - `apps/control-plane/src/modules/missions/reporting.ts`
   - `apps/control-plane/src/modules/missions/service.ts`
   - `apps/control-plane/src/modules/missions/routes.ts`
   - `apps/control-plane/src/modules/reporting/service.ts`
   - `apps/control-plane/src/modules/reporting/formatter.ts`
   - `apps/control-plane/src/modules/reporting/artifact.ts`
   - `apps/control-plane/src/modules/reporting/types.ts`
   - add one small helper such as `apps/control-plane/src/modules/reporting/board-packet.ts` only if that keeps `formatter.ts` and `service.ts` legible

   F5C1 should:
   - require one completed source reporting mission
   - require stored `finance_memo`
   - require stored `evidence_appendix`
   - compile one deterministic draft `board_packet`
   - preserve `modules/reporting/**` ownership and vocabulary
   - remain read-only with no runtime-codex thread creation

3. Extend proof-bundle shaping and mission read models for specialized draft review, not release.
   Update:
   - `apps/control-plane/src/modules/evidence/proof-bundle-summary.ts`
   - `apps/control-plane/src/modules/evidence/proof-bundle-assembly.ts`
   - `apps/control-plane/src/modules/missions/detail-view.ts`
   - `apps/control-plane/src/modules/missions/service.ts`

   F5C1 should:
   - carry the source reporting mission id and report kind through the proof bundle
   - keep freshness, limitation, and provenance posture explicit
   - distinguish specialized draft-review posture from later release posture
   - avoid new approval kinds, release workflow states, or external communication semantics

4. Add the narrowest truthful operator path from completed reporting work to specialized board packet review.
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
   - create one draft `board_packet` reporting mission
   - render the specialized board packet as review-ready draft output
   - keep filed-page and markdown-export posture additive rather than redefining proof readiness
   - avoid release buttons, external-send actions, finance approval cards, or PDF or slide export controls

5. Keep explicit non-goals in code comments, UI copy, and tests where needed.
   F5C1 must not:
   - reopen F5A discovery-to-memo foundation work
   - reopen F5B body visibility, filed-page reuse, or markdown export posture work
   - add lender or diligence packet specialization
   - add release or approval semantics
   - add runtime-codex drafting
   - add PDF, slide, or Marp export
   - rename `modules/reporting/**`

## Validation and Acceptance

The next F5C1 implementation thread should preserve the current confidence ladder and add only the narrowest packet-specialization coverage on top of it.

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

Targeted twin regressions plus repo-wide validation:

- `pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/twin/workflow-sync.spec.ts src/modules/twin/test-suite-sync.spec.ts src/modules/twin/codeowners-discovery.spec.ts`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm ci:repro:current`

User-visible F5C1 acceptance should be:

- a completed `finance_memo` reporting mission can create one specialized `board_packet` reporting mission
- the packet compiles only from stored `finance_memo` plus stored `evidence_appendix` from one completed reporting mission
- the packet remains deterministic, runtime-free, and explicit about freshness, limitations, and lineage
- the packet is review-ready draft output, not released output
- lender and diligence packet specialization remain out of scope
- approval-release semantics remain out of scope
- PDF, slide, and Marp export remain out of scope

## Idempotence and Recovery

F5C1 should stay additive and retry-safe.
Raw sources, completed discovery missions, completed reporting missions, stored `finance_memo`, stored `evidence_appendix`, and existing proof bundles remain immutable inputs.
The first board packet specialization pass should derive new draft artifacts from that stored reporting state without mutating the source memo, the source appendix, or the existing filed or export records.

If a board-packet compile fails, the source reporting mission should remain intact and reviewable.
If a board-packet retry is needed, it should rerun from the same stored reporting evidence or from a deliberately refreshed upstream reporting mission.
No release, send, approval, PDF export, or slide export side effect should be produced in F5C1.

## Artifacts and Notes

This docs-and-plan slice leaves:

- one new active F5C implementation contract at `plans/FP-0038-board-packet-specialization-and-draft-review-foundation.md`
- refreshed active docs that point at shipped F5A and F5B history plus this active F5C contract

The first F5C1 code thread is expected to leave:

- one specialized draft `board_packet` reporting mission
- explicit source reporting mission lineage
- carried freshness posture and visible limitations from the stored reporting inputs
- updated proof-bundle summaries and mission read models that expose review-ready draft posture

No new environment variables are expected for the first F5C1 slice.
If a concrete implementation blocker proves otherwise, document it in this plan and in the active docs before widening scope.

## Interfaces and Dependencies

`packages/domain` should stay pure and own the reporting source contract, packet-specialization report kinds, and reporting read-model fields.
`apps/control-plane/src/modules/reporting/**` should stay the deterministic compilation seam for both the shipped `finance_memo` path and the new `board_packet` specialization path.
`apps/control-plane/src/modules/evidence/**` should keep proof bundles explicit about freshness, limitations, lineage, and draft-review posture without importing release semantics early.
`apps/control-plane/src/modules/runtime-codex/**` and `apps/control-plane/src/modules/approvals/**` remain explicit later-slice seams for this plan, not F5C1 implementation targets.
`apps/web` should stay responsible for operator creation and review surfaces.

The CFO Wiki remains derived and reviewable, but F5C1 should not treat raw wiki pages alone as the packet source of truth.
The first packet path must stay grounded in the stored reporting artifacts that were already derived from completed discovery evidence.

## Outcomes & Retrospective

This thread shipped the F5C master-plan and active-doc refresh only.
It created `plans/FP-0038-board-packet-specialization-and-draft-review-foundation.md`, moved the active-doc chain from the shipped F5B record to this new active F5C contract, and narrowed the next implementation thread to one deterministic, draft-only, runtime-free `board_packet` specialization path from completed reporting work.

This thread did not start F5C1 code, did not reopen F5B, did not widen into F5C2 or F5C3, and did not start F6.
What remains is the first real F5C1 implementation thread.
