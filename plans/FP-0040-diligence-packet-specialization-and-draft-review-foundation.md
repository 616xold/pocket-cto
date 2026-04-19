# Define F5C3 diligence packet specialization and draft review foundation

## Purpose / Big Picture

This plan is the active F5 implementation contract produced by the F5C3 master-plan and active-doc refresh slice.
The target phase is `F5`, and the next execution slice is `F5C3-diligence-packet-specialization-and-draft-review-foundation`.
The user-visible goal is narrow and concrete: after the shipped F5A, F5B, F5C1, and F5C2 path already creates one draft `finance_memo`, one linked `evidence_appendix`, truthful stored-vs-filed-vs-exported posture for the finance-memo path, one draft `board_packet`, and one draft `lender_update`, Pocket CFO should next be able to compile one specialized draft `diligence_packet` from completed reporting work and present it as review-ready draft output without widening into approval-release semantics, runtime-codex drafting, filing or export expansion, or non-markdown output formats.

This mattered because the repo already shipped the right deterministic substrate for the next packet-specialization pass: first-class `reporting` missions, `manual_reporting`, stored `finance_memo.bodyMarkdown`, stored `evidence_appendix.bodyMarkdown`, reporting proof bundles, mission-centric filing and markdown export reuse for the finance-memo path, and two specialized draft packet families that already proved `reportKind` can widen inside the existing reporting bounded context without creating a second top-level mission family.
What was still missing was one narrowed F5C3 contract and implementation.
The inherited “diligence packet specialization and approval-release” shape was too wide to hand to the next implementation thread safely.
This plan narrowed that work to one packet family, one input contract, one review posture, one bounded validation ladder, and one explicit later handoff to F5C4, and it now records the landed F5C3 slice.

GitHub connector work is explicitly out of scope.
This plan does not authorize F5C4 approval-release implementation, later bounded runtime-codex phrasing or formatting assistance, PDF export, slide export, Marp export, F6 monitoring, or any rename from `modules/reporting/**` to `modules/reports/**`.
The landed F5C3 slice adds only the narrow implementation this plan authorized: one additive `diligence_packet` report kind and artifact kind, one dedicated `POST /missions/reporting/diligence-packets` path, one deterministic compiler, one packaged smoke, and small doc refreshes needed to keep the repo truthful.

## Progress

- [x] 2026-04-19T22:24:33Z Audit the active docs, shipped F5A through F5C2 records, reporting and evidence contracts, runtime-codex boundary, approval semantics, and benchmark guidance before choosing the narrowest truthful F5C3 scope.
- [x] 2026-04-19T22:24:33Z Create `plans/FP-0040-diligence-packet-specialization-and-draft-review-foundation.md` and refresh the smallest truthful active-doc set so `plans/FP-0039-lender-update-specialization-and-draft-review-foundation.md` remains the shipped F5C2 record while this file becomes the single active F5C3 implementation contract.
- [x] 2026-04-19T22:24:33Z Run the preserved source-ingest through lender-update confidence ladder, targeted twin regressions, repo-wide validation, and `pnpm ci:repro:current` for this docs-and-plan handoff without starting F5C3 code.
- [x] 2026-04-19T23:23:04Z Implement `F5C3-diligence-packet-specialization-and-draft-review-foundation` exactly as defined here: widen the reporting and proof contracts to `diligence_packet`, add the dedicated creation path, compile one deterministic draft artifact from stored memo-plus-appendix evidence only, extend operator review surfaces, and keep approval-release semantics, runtime-codex drafting, filing or export expansion, PDF export, slide export, and F6 work out of scope.
- [x] 2026-04-19T23:23:04Z Run the required F5C3 validation ladder end to end: narrow suites, required domain/control-plane/web suites, preserved baseline smokes, the new `pnpm smoke:diligence-packet:local` proof, twin guardrails, `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm ci:repro:current`.

## Surprises & Discoveries

- Observation: the main repo problem before this slice was no longer missing reporting architecture; it was stale active-plan truthfulness.
  Evidence: `plans/ROADMAP.md`, `docs/benchmarks/seeded-missions.md`, `START_HERE.md`, `docs/ACTIVE_DOCS.md`, `docs/ops/local-dev.md`, and parts of `plans/FP-0039-lender-update-specialization-and-draft-review-foundation.md` still pointed contributors at F5C2 or at a generic “create the next later-F5 plan” step even though the next real need is one narrowed F5C3 contract.

- Observation: the current reporting bounded context already preserves the exact specialization seam F5C3 should extend.
  Evidence: `packages/domain/src/reporting-mission.ts`, `apps/control-plane/src/modules/missions/board-packet.ts`, `apps/control-plane/src/modules/missions/lender-update.ts`, `apps/control-plane/src/modules/reporting/board-packet.ts`, and `apps/control-plane/src/modules/reporting/lender-update.ts` already keep `mission.type = "reporting"` stable, specialize through `reportKind`, and compile packet drafts only from one completed `finance_memo` reporting mission with stored `finance_memo` plus stored `evidence_appendix`.

- Observation: the next truthful diligence input contract should stay finance-memo-reporting-grounded rather than board-packet-grounded or lender-update-grounded.
  Evidence: `apps/control-plane/src/modules/reporting/service.ts` already requires a completed reporting mission with stored `finance_memo` plus stored `evidence_appendix` before packet specialization can compile, while both shipped packet helpers read those stored reporting artifacts as the packet source of truth.

- Observation: finance-memo filing and markdown export already exist as a separate publication seam and should remain separate from the first diligence specialization slice.
  Evidence: `apps/control-plane/src/modules/reporting/publication.ts`, `apps/control-plane/src/modules/reporting/service.ts`, and `apps/web/components/reporting-output-card.tsx` already keep stored draft posture, filed-page posture, and markdown export posture explicit for `finance_memo` without redefining proof readiness for specialized packet kinds.

- Observation: runtime-codex and approvals remain explicit later seams, not blockers for the next deterministic packet slice.
  Evidence: `docs/ops/codex-app-server.md`, `apps/control-plane/src/modules/runtime-codex/**`, `apps/control-plane/src/modules/approvals/**`, and the shipped F5A through F5C2 reporting flow already keep draft packet compilation runtime-free and release-free.

- Observation: the first local diligence smoke failure came from local database drift, not from a widened reporting design problem.
  Evidence: the first `pnpm smoke:diligence-packet:local` run left the diligence mission stuck after the worker tried to persist a `diligence_packet` artifact into a Docker-backed database whose `artifact_kind` enum had not yet applied the new additive migration. Running `pnpm db:migrate` fixed the local drift, after which the same smoke and `pnpm ci:repro:current` both passed.

- Observation: the repo-wide typecheck still exercises control-plane app-container doubles that the narrower F5C3 suites do not hit directly.
  Evidence: `pnpm typecheck` surfaced one missing `createDiligencePacket` test-double method in `apps/control-plane/src/bootstrap.spec.ts` even though the narrower reporting, missions, evidence, and web suites were already green.

## Decision Log

- Decision: the first real F5C3 scope is `F5C3-diligence-packet-specialization-and-draft-review-foundation`.
  Rationale: the repo needs one implementation-ready packet contract, not a blended diligence-plus-approval-plus-runtime program.

- Decision: the first F5C3 packet family is exactly `diligence_packet`.
  Rationale: one diligence-facing draft packet is the narrowest truthful specialization after the shipped lender-update baseline.

- Decision: F5C3 must compile only from one completed `reporting` mission with stored `finance_memo` plus stored `evidence_appendix`.
  Rationale: the next packet path should reuse stored reporting evidence, not the derived `board_packet`, not the derived `lender_update`, not generic chat intake, and not raw wiki pages alone.

- Decision: F5C3 keeps `mission.type = "reporting"` and specializes through `reportKind`.
  Rationale: reporting is already the first-class umbrella with the right mission, replay, artifact, and proof semantics, so a second top-level mission family would widen the product boundary unnecessarily.

- Decision: F5C3 stays deterministic and runtime-free.
  Rationale: the next packet-specialization slice should prove evidence-grounded diligence-packet compilation before any bounded runtime phrasing or formatting assistance is considered.

- Decision: F5C3 stays draft-only and review-ready.
  Rationale: diligence communication changes external posture, so the safest truthful next slice is to surface a review-ready draft packet without introducing external release or finance approval semantics yet.

- Decision: F5C3 does not add PDF export, slide export, or Marp export.
  Rationale: the next packet slice should prove the specialized draft artifact contract before it widens into new output channels.

- Decision: F5C3 should not add filing or export behavior for `diligence_packet` in the first specialization pass.
  Rationale: the strong preference is to keep the next packet family focused on specialization, not publication posture, because filing and export already exist as a distinct finance-memo seam and should not be silently broadened into diligence communication.

- Decision: implement F5C3 by mirroring the shipped board-packet and lender-update specialization pattern with one dedicated diligence-packet intake contract, one dedicated diligence-packet artifact, and the same completed-finance-memo source-reporting gate.
  Rationale: that keeps the slice additive, legible, and low-risk while preserving the existing `reporting` mission umbrella, the current proof-bundle fanout, and the finance-memo-only publication seam.

- Decision: after F5C3, the next later-F5 slice is `F5C4-approval-release-hardening-for-external-communication-posture`, and only after that should any later bounded runtime-codex drafting or formatting assistance be reconsidered.
  Rationale: the repo needs specialized deterministic packet drafts before it widens into approval, release, or runtime-assisted presentation work.

- Decision: keep the only post-implementation polish inside F5C3 to the additive database migration and one missing test-double method.
  Rationale: the diligence smoke failure and repo-wide typecheck issue were both narrow truthfulness gaps inside the shipped F5C3 surface, so fixing them directly was lower risk than reopening reporting, proof-bundle, or runtime boundaries.

- Decision: preserve the current `modules/reporting/**` vocabulary and do not reintroduce a `modules/reports/**` rename wave.
  Rationale: the shipped F5A through F5C2 code already standardized on first-class `reporting` seams, and a rename would create noise before the diligence-packet contract exists.

- Decision: leave `plans/FP-0039-lender-update-specialization-and-draft-review-foundation.md` as the shipped F5C2 record while this file becomes the single active later-F5 plan.
  Rationale: the plan chain should preserve shipped history and keep exactly one active successor plan.

## Context and Orientation

Pocket CFO has already shipped F4A through F4C2, with `plans/FP-0035-finance-policy-lookup-and-discovery-quality-hardening.md` as the shipped final F4 record.
Pocket CFO has also already shipped the first four F5 slices:

- `plans/FP-0036-reporting-mission-foundation-and-first-finance-memo.md` as the shipped F5A reporting-foundation record
- `plans/FP-0037-draft-report-body-filed-artifact-and-markdown-export-hardening.md` as the shipped F5B reporting-reuse record
- `plans/FP-0038-board-packet-specialization-and-draft-review-foundation.md` as the shipped F5C1 board-packet record
- `plans/FP-0039-lender-update-specialization-and-draft-review-foundation.md` as the shipped F5C2 lender-update record

That shipped F5 baseline now truthfully means all of the following are already in repo reality:

- `mission.type = "reporting"` and `sourceKind = "manual_reporting"`
- one deterministic `POST /missions/reporting` path from completed discovery work
- one draft `finance_memo`
- one linked `evidence_appendix`
- stored `bodyMarkdown` on both report artifacts
- mission-centric filing and markdown export reuse over the existing CFO Wiki seams for the finance-memo path
- one deterministic `POST /missions/reporting/board-packets` path from completed reporting work
- one draft `board_packet`
- one deterministic `POST /missions/reporting/lender-updates` path from completed reporting work
- one draft `lender_update`
- reporting proof bundles that stay explicit about freshness, limitations, discovery lineage, reporting lineage, draft posture, and finance-memo publication posture

The repo now has the shipped diligence-packet specialization path this plan described.
`reportKind` now includes `diligence_packet`, packet specialization extends through the first diligence review posture, and the operator reporting follow-on actions now define a dedicated diligence-facing draft review path without widening into approval or release behavior.

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
- this shipped F5C3 record, `plans/FP-0040-diligence-packet-specialization-and-draft-review-foundation.md`
- `docs/ops/local-dev.md`
- `docs/ops/source-ingest-and-cfo-wiki.md`
- `docs/ops/codex-app-server.md`
- `docs/benchmarks/seeded-missions.md`
- `evals/README.md`

GitHub connector work is out of scope.
The internal `@pocket-cto/*` package scope remains unchanged.
This plan started as docs-only guidance, but the current landed slice now includes runtime code, routes, schema changes, one additive migration, one packaged smoke command, targeted tests, and small doc refreshes that keep the repo aligned with the shipped F5C3 reality.

The most relevant implementation seams for the future F5C3 code thread are:

- `packages/domain/src/mission.ts`
- `packages/domain/src/reporting-mission.ts`
- `packages/domain/src/proof-bundle.ts`
- `packages/domain/src/mission-detail.ts`
- `packages/domain/src/mission-list.ts`
- `packages/domain/src/index.ts`
- `packages/db/src/schema/artifacts.ts`
- one additive drizzle migration under `packages/db/drizzle/`
- `apps/control-plane/src/modules/missions/reporting.ts`
- `apps/control-plane/src/modules/missions/service.ts`
- `apps/control-plane/src/modules/missions/routes.ts`
- add `apps/control-plane/src/modules/missions/diligence-packet.ts`
- `apps/control-plane/src/modules/reporting/service.ts`
- `apps/control-plane/src/modules/reporting/formatter.ts`
- `apps/control-plane/src/modules/reporting/artifact.ts`
- `apps/control-plane/src/modules/reporting/types.ts`
- add `apps/control-plane/src/modules/reporting/diligence-packet.ts`
- `apps/control-plane/src/modules/evidence/proof-bundle-summary.ts`
- `apps/control-plane/src/modules/evidence/proof-bundle-assembly.ts`
- `apps/control-plane/src/modules/missions/detail-view.ts`
- `apps/control-plane/src/modules/runtime-codex/**` only as an explicit non-goal for F5C3
- `apps/control-plane/src/modules/approvals/**` only as an explicit non-goal for F5C3
- `apps/web/app/missions/[missionId]/actions.ts`
- `apps/web/app/missions/[missionId]/mission-actions.tsx`
- `apps/web/app/missions/[missionId]/mission-action-forms.tsx`
- `apps/web/app/missions/[missionId]/page.tsx`
- `apps/web/components/reporting-output-card.tsx`
- `apps/web/components/mission-card.tsx`
- `apps/web/components/mission-list-card.tsx`
- `apps/web/lib/api.ts`
- `tools/diligence-packet-smoke.mjs`
- `package.json`

## Plan of Work

F5C should now proceed through one narrow diligence-focused contract before it widens again.

First, implement `F5C3` as one specialized reporting family called `diligence_packet`.
The new packet path should start only from one completed reporting mission that already stores one `finance_memo` and one `evidence_appendix`.
That means F5C3 should widen the reporting input contract from the shipped `finance_memo` discovery-grounded source and the shipped `board_packet` and `lender_update` reporting-grounded sources into a third reporting-grounded specialization: the existing `finance_memo` path keeps its current discovery anchor, the existing `board_packet` path keeps its completed-reporting anchor, the existing `lender_update` path keeps its completed-reporting anchor, and the new `diligence_packet` path should also compile from a completed reporting mission with stored memo-plus-appendix evidence rather than from `board_packet`, `lender_update`, or raw wiki state alone.

Second, keep the specialized diligence-packet compiler inside the existing `modules/reporting/**` bounded context and reuse stored report artifacts as the only diligence-packet source of truth.
F5C3 should read the completed source reporting mission, its stored `finance_memo`, its stored `evidence_appendix`, and the existing reporting proof bundle only where that helps explain draft posture.
It should not re-open discovery answer assembly, not read generic chat text, not treat raw wiki pages as the packet source of truth by themselves, and not create a runtime thread.

Third, expose the diligence packet as a review-ready draft reporting artifact through the existing mission list and mission detail surfaces.
F5C3 should show that the packet is specialized and reviewable, but it must not add release buttons, external-send actions, finance approval cards, filing behavior, markdown export reuse, PDF output, or slide output.

Fourth, leave F5C4 and later work explicitly deferred.
After this slice lands, the next thread should implement approval-release hardening for external communication posture.
Only after that later review posture exists should the repo reconsider bounded runtime-codex phrasing or formatting assistance for report packets.

## Concrete Steps

1. Widen the pure reporting contract without adding a new mission family.
   Update:
   - `packages/domain/src/mission.ts`
   - `packages/domain/src/reporting-mission.ts`
   - `packages/domain/src/proof-bundle.ts`
   - `packages/domain/src/mission-detail.ts`
   - `packages/domain/src/mission-list.ts`
   - `packages/domain/src/index.ts`
   - `packages/db/src/schema/artifacts.ts`
   - one additive drizzle migration under `packages/db/drizzle/`

   F5C3 should:
   - add `diligence_packet` as the next `reportKind`
   - keep `mission.type = "reporting"`
   - preserve `finance_memo`, `board_packet`, and `lender_update` as the shipped report kinds
   - add `CreateDiligencePacketMissionInputSchema` and a reporting-grounded source contract for diligence specialization so `diligence_packet` compiles from a completed reporting mission rather than from discovery, `board_packet`, `lender_update`, or generic chat
   - add one additive `artifact_kind` value for `diligence_packet`
   - carry source reporting mission lineage, source discovery mission lineage, carried freshness, carried limitations, related routes, related wiki pages, and draft-review posture through the typed read models

2. Extend reporting mission creation and reporting compilation inside the existing bounded contexts.
   Update:
   - `apps/control-plane/src/modules/missions/reporting.ts`
   - `apps/control-plane/src/modules/missions/service.ts`
   - `apps/control-plane/src/modules/missions/routes.ts`
   - add `apps/control-plane/src/modules/missions/diligence-packet.ts`
   - `apps/control-plane/src/modules/reporting/service.ts`
   - `apps/control-plane/src/modules/reporting/formatter.ts`
   - `apps/control-plane/src/modules/reporting/artifact.ts`
   - `apps/control-plane/src/modules/reporting/types.ts`
   - add `apps/control-plane/src/modules/reporting/diligence-packet.ts`

   F5C3 should:
   - require one completed source reporting mission
   - require stored `finance_memo`
   - require stored `evidence_appendix`
   - compile one deterministic draft `diligence_packet`
   - preserve `modules/reporting/**` ownership and vocabulary
   - remain read-only with no runtime-codex thread creation

3. Extend proof-bundle shaping and mission read models for specialized draft review, not release.
   Update:
   - `apps/control-plane/src/modules/evidence/proof-bundle-summary.ts`
   - `apps/control-plane/src/modules/evidence/proof-bundle-assembly.ts`
   - `apps/control-plane/src/modules/missions/detail-view.ts`
   - `apps/control-plane/src/modules/missions/service.ts`

   F5C3 should:
   - carry the source reporting mission id, source discovery mission id, and report kind through the proof bundle
   - keep freshness, limitation, provenance, and reviewer-ready posture explicit
   - distinguish specialized draft-review posture from later release posture
   - avoid new approval kinds, release workflow states, filed-page semantics, or external communication send semantics

4. Add the narrowest truthful operator path from completed reporting work to specialized diligence-packet review.
   Update:
   - `apps/web/app/missions/[missionId]/actions.ts`
   - `apps/web/app/missions/[missionId]/mission-actions.tsx`
   - `apps/web/app/missions/[missionId]/mission-action-forms.tsx`
   - `apps/web/app/missions/[missionId]/page.tsx`
   - `apps/web/components/reporting-output-card.tsx`
   - `apps/web/components/mission-card.tsx`
   - `apps/web/components/mission-list-card.tsx`
   - `apps/web/lib/api.ts`

   The first operator path should:
   - start from a completed `finance_memo` reporting mission
   - create one draft `diligence_packet` reporting mission
   - render the specialized diligence packet as review-ready draft output
   - keep filing and markdown-export posture separate and unchanged from the finance-memo path
   - avoid release buttons, external-send actions, finance approval cards, or PDF or slide export controls

5. Add the narrowest local proof for the new packet family and refresh only the docs made stale by shipped code.
   Update:
   - `tools/diligence-packet-smoke.mjs`
   - `package.json`
   - `docs/ops/local-dev.md` only if the new packaged smoke command lands in code

   F5C3 should:
   - mirror the shipped board-packet and lender-update local-proof pattern
   - add one packaged `pnpm smoke:diligence-packet:local` command
   - avoid new eval datasets or broad benchmark rewrites in the first implementation pass

6. Keep explicit non-goals in code comments, UI copy, tests, and docs where needed.
   F5C3 must not:
   - reopen F5A discovery-to-memo foundation work
   - reopen F5B body visibility, filed-page reuse, or markdown export posture work
   - reopen F5C1 board-packet specialization work
   - reopen F5C2 lender-update specialization work
   - add approval or release semantics
   - add runtime-codex drafting
   - add filing or export semantics for `diligence_packet`
   - add PDF, slide, or Marp export
   - rename `modules/reporting/**`

## Validation and Acceptance

The next F5C3 implementation thread should preserve the current confidence ladder and add only the narrowest diligence-specialization coverage on top of it.

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
- `pnpm smoke:lender-update:local`
- `pnpm smoke:diligence-packet:local`

Targeted twin regressions plus repo-wide validation:

- `pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/twin/workflow-sync.spec.ts src/modules/twin/test-suite-sync.spec.ts src/modules/twin/codeowners-discovery.spec.ts`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm ci:repro:current`

User-visible F5C3 acceptance should be:

- a completed `finance_memo` reporting mission can create one specialized `diligence_packet` reporting mission
- the diligence packet compiles only from stored `finance_memo` plus stored `evidence_appendix` from one completed reporting mission
- the diligence packet remains deterministic, runtime-free, and explicit about freshness, limitations, and lineage
- the diligence packet is review-ready draft output, not released output
- filing or export behavior for `diligence_packet` remains out of scope
- approval-release semantics remain out of scope

Implementation acceptance reached in this slice:

- the pure reporting, proof-bundle, mission-detail, and mission-list contracts now include `diligence_packet`
- `packages/db/src/schema/artifacts.ts` and the additive drizzle migration now persist `diligence_packet` truthfully
- `POST /missions/reporting/diligence-packets` now creates one draft diligence-packet reporting mission only from one completed finance-memo reporting mission with stored `finance_memo` plus stored `evidence_appendix`
- the reporting compiler, proof-bundle assembly, mission detail, mission list, and web review surfaces now expose one deterministic, draft-only `diligence_packet` path with carried freshness, limitations, lineage, route links, and wiki links
- `tools/diligence-packet-smoke.mjs` and `pnpm smoke:diligence-packet:local` now prove the packaged F5C3 path end to end
- the required validation ladder, including `pnpm ci:repro:current`, is green

Provenance, freshness, replay, and limitation expectations for the future F5C3 implementation are:

- the `diligence_packet` must carry forward source discovery mission lineage, source reporting mission lineage, stored freshness, stored limitations, related routes, and related wiki pages from the completed finance-memo reporting mission
- proof-bundle readiness for the diligence packet must remain tied to one persisted `diligence_packet` artifact compiled from stored finance-memo plus evidence-appendix evidence only
- raw wiki pages remain derived evidence inputs, not the only diligence-packet source of truth
- no approval, release, send, filing, export, PDF, or slide side effect should be produced in the first F5C3 implementation pass

## Idempotence and Recovery

The landed F5C3 slice is additive and retry-safe.
The new `diligence_packet` behavior hangs off existing `reporting` mission seams, uses one additive `artifact_kind` migration, and avoids destructive rewrites of reporting history.
If a local database misses the additive migration, run `pnpm db:migrate` and rerun the narrow proof rather than widening the implementation.

If diligence-packet mission creation fails after the reporting mission record exists but before the artifact persists, the mission should remain non-ready and retryable through the existing mission and proof-bundle flow.
No release, send, approval, filing, PDF export, or slide export side effect should be produced in F5C3.

## Artifacts and Notes

This landed slice produces:

- one shipped Finance Plan record at `plans/FP-0040-diligence-packet-specialization-and-draft-review-foundation.md`
- one draft `diligence_packet` artifact kind and one dedicated diligence-packet compiler path
- one refreshed reporting proof bundle with diligence-packet lineage and draft-review posture
- one packaged `pnpm smoke:diligence-packet:local` proof
- no new eval dataset, no filed-page side effect, and no markdown-export expansion for `diligence_packet`

## Interfaces and Dependencies

Pocket CFO should keep the same bounded-context split it already uses for F5A through F5C2:

- `packages/domain` for pure reporting and proof contracts
- `packages/db` for additive persistence schema changes only
- `apps/control-plane/src/modules/missions/**` for thin typed mission creation
- `apps/control-plane/src/modules/reporting/**` for deterministic artifact compilation and reporting read models
- `apps/control-plane/src/modules/evidence/**` for proof-bundle assembly
- `apps/web/**` for operator review surfaces only

The CFO Wiki remains derived and reviewable, but F5C3 should not treat raw wiki pages alone as the diligence-packet source of truth.
The runtime-codex seam remains stable and out of scope for the first diligence specialization pass.
`apps/control-plane/src/modules/runtime-codex/**` and `apps/control-plane/src/modules/approvals/**` remain explicit later-slice seams for this plan, not F5C3 implementation targets.

No new environment variables are expected for the first F5C3 slice.
If a concrete need appears during implementation, document it in this plan, `docs/ops/local-dev.md`, and the touched module README or config file before relying on it.

## Outcomes & Retrospective

This slice lands the first real F5C3 implementation exactly as intended: reporting remains first-class, the discovery families stay unchanged, `diligence_packet` now exists as the next specialized draft report kind, and the packet compiles deterministically from one completed finance-memo reporting mission with stored memo-plus-appendix evidence only.
It leaves `plans/FP-0039-lender-update-specialization-and-draft-review-foundation.md` as the shipped F5C2 record, keeps the finance-memo filing and markdown-export seam unchanged, keeps runtime-codex and approvals out of scope, and proves the additive migration plus packaged diligence smoke through `pnpm ci:repro:current`.

This slice does not reopen F5A through F5C2, does not widen into F5C4 or F6, and does not delete GitHub or engineering-twin modules.
What remains is authoring the next narrow F5C4 approval-release plan; no additional F5C3 continuation is required to keep this slice truthful.
