# Define F5C4A approval review and first lender update release readiness

## Purpose / Big Picture

This plan now serves as the shipped F5C4A implementation record.
`plans/FP-0042-release-log-and-first-lender-update-release-record-foundation.md` is the active F5C4B implementation contract that follows it.
The target phase is `F5`, and the execution slice recorded here is `F5C4A-approval-review-and-first-lender-update-release-readiness`.
The user-visible goal is narrow and concrete: after the shipped F5A through F5C3 path already creates one draft `finance_memo`, one linked `evidence_appendix`, truthful stored-vs-filed-vs-exported posture for the finance-memo path, one draft `board_packet`, one draft `lender_update`, and one draft `diligence_packet`, Pocket CFO should next let an operator request review on one completed `lender_update` reporting mission, resolve one finance-facing approval, and see one explicit release-readiness posture without widening into actual sending, distribution, release logging, runtime-codex drafting, or broader packet-approval rollout.

This matters now because packet specialization is no longer the missing capability.
The missing capability is approval and review truthfulness for external-communication posture.
The repo already ships the deterministic reporting substrate and the generic approvals persistence substrate, but the approvals bounded context still reflects Pocket CTO live-runtime semantics.
The next gain is therefore not another packet family and not actual delivery.
It is a narrow retargeting of the existing approvals system so one stored `lender_update` draft can move from "review required" to "approved for release" in a truthful, replayable, finance-facing way.

GitHub connector work is explicitly out of scope.
This plan does not authorize actual send, distribute, publish, or release logging behavior, broader board or diligence approval widening, bounded runtime-codex phrasing or formatting assistance, PDF export, slide export, Marp export, F6 monitoring, or any rename from `modules/reporting/**` to `modules/reports/**`.

## Progress

- [x] 2026-04-20T10:36:29Z Audit the active docs, shipped F5A through F5C3 records, approval-domain contracts, reporting and evidence read models, runtime-codex boundary, and lender-update baseline before choosing the narrowest truthful F5C4 scope.
- [x] 2026-04-20T10:36:29Z Create `plans/FP-0041-approval-review-and-first-lender-update-release-readiness.md` and refresh the smallest truthful active-doc set so `plans/FP-0040-diligence-packet-specialization-and-draft-review-foundation.md` remains the shipped F5C3 record while this file becomes the single active F5C4 implementation contract.
- [x] 2026-04-20T10:50:51Z Run the preserved source-ingest through diligence-packet confidence ladder, targeted twin regressions, repo-wide validation, and `pnpm ci:repro:current` for this docs-and-plan handoff without starting F5C4A code.
- [x] 2026-04-20T19:40:08Z Re-open the active F5C4A contract for the first real implementation thread, explicitly invoke the required repo skills, record the pre-edit implementation verdict, and align the plan with the exact narrow slice requested here: one singular `POST /missions/:missionId/reporting/release-approval` route plus one packaged `tools/lender-update-release-approval-smoke.mjs` proof.
- [x] 2026-04-20T20:15:30Z Implement the additive `report_release` approval kind, lender-update release-readiness read models, persisted `api_only` approval resolution, mission-detail and mission-list UI surfaces, the additive `approval_kind` migration, and the packaged `pnpm smoke:lender-update-release-approval:local` proof without widening into board, diligence, delivery, PDF, slide, or runtime-codex behavior.
- [x] 2026-04-20T20:45:00Z Close the slice with green targeted suites, preserved baseline smokes, the new lender-update release-approval smoke, repo-wide lint or typecheck or test, and a green `pnpm ci:repro:current` run before commit and push.

## Surprises & Discoveries

- Observation: the current approvals bounded context already owns durable persistence, replay events, mission approval listing, and approval resolution, but its documented posture and typed kind set still assume live Codex runtime continuation.
  Evidence: `packages/domain/src/approval.ts`, `packages/db/src/schema/artifacts.ts`, `apps/control-plane/src/modules/approvals/service.ts`, `apps/control-plane/src/modules/approvals/routes.ts`, and `apps/control-plane/src/modules/approvals/README.md`.

- Observation: the existing approval routes and service shape can likely be widened for finance review approvals without inventing a second persistence system, but the current `resolve` path is incorrectly coupled to `liveControl` and in-memory runtime session delivery.
  Evidence: `apps/control-plane/src/modules/approvals/routes.ts` currently rejects resolution when live control is unavailable, and `apps/control-plane/src/modules/approvals/service.ts` currently tries to resume live runtime continuation after every accepted approval.

- Observation: the reporting bounded context already preserves the exact narrow input F5C4A should gate: one completed `reporting` mission with `reportKind = "lender_update"` and one stored `lender_update` artifact.
  Evidence: `packages/domain/src/reporting-mission.ts`, `apps/control-plane/src/modules/reporting/service.ts`, `apps/control-plane/src/modules/reporting/lender-update.ts`, `apps/control-plane/src/modules/reporting/artifact.ts`, and `apps/web/components/reporting-output-card.tsx`.

- Observation: the current reporting and proof-bundle read models already carry the freshness, limitation, provenance, and source-lineage posture F5C4A should preserve, so the missing work is review-state rendering rather than a new artifact family.
  Evidence: `packages/domain/src/reporting-mission.ts`, `packages/domain/src/proof-bundle.ts`, `apps/control-plane/src/modules/evidence/proof-bundle-assembly.ts`, `apps/control-plane/src/modules/evidence/proof-bundle-summary.ts`, and `apps/control-plane/src/modules/missions/detail-view.ts`.

- Observation: the approval-card operator UI is still repo and PR flavored, which will read as misleading for finance review approvals unless the formatter and copy become report-aware.
  Evidence: `apps/control-plane/src/modules/approvals/card-formatter.ts` and `apps/web/components/approval-card-list.tsx` currently summarize file-change, command, and network approvals with repo and PR context but no finance report-review context.

- Observation: the active-doc chain was partly fresh and partly one phase behind before this slice.
  Evidence: top-level docs already described F5C3 as shipped, but `plans/FP-0040-diligence-packet-specialization-and-draft-review-foundation.md`, `docs/ops/source-ingest-and-cfo-wiki.md`, and `docs/ops/codex-app-server.md` still framed F5C3 as the active next implementation contract.

- Observation: this plan still carried two handoff-era mismatches when the first implementation thread started: it described the slice as docs-only and it named a plural release-approvals route plus a `release-readiness` smoke file even though the narrow requested contract is one singular mission route and one `lender-update-release-approval` smoke.
  Evidence: `## Context and Orientation`, `## Artifacts and Notes`, and Concrete Steps 3 and 6 in this file before the current refresh.

## Decision Log

- Decision: the first real F5C4 scope is `F5C4A-approval-review-and-first-lender-update-release-readiness`.
  Rationale: the repo needs one implementation-ready approval and review contract, not a blended approval-plus-delivery-plus-runtime program.

- Decision: the first artifact family subject to approval and review hardening is exactly `lender_update`.
  Rationale: lender-facing communication is the narrowest truthful external-communication draft already shipped in repo reality, and the user explicitly ruled out multi-artifact widening in the first F5C4 implementation.

- Decision: F5C4A must start from one completed `reporting` mission with `reportKind = "lender_update"` and one stored `lender_update` artifact.
  Rationale: the first approval slice should consume one stored reporting artifact, not generic chat intake, not `finance_memo` directly, not `board_packet`, and not `diligence_packet`.

- Decision: F5C4A keeps `mission.type = "reporting"` and `reportKind = "lender_update"`.
  Rationale: reporting is already the first-class umbrella with the correct mission, replay, artifact, and proof semantics, so a second top-level approval mission family would widen the product boundary unnecessarily.

- Decision: F5C4A adds review request, approval resolution, and release-readiness posture only.
  Rationale: the first hardening slice should make review state explicit without claiming send, distribute, publish, or release logging behavior that does not exist yet.

- Decision: retarget the existing approvals bounded context instead of inventing a second approval system.
  Rationale: the existing approvals table, repository, replay events, listing, and resolution seams are already the durable substrate; the missing work is finance-specific kinding and runtime-decoupled behavior.

- Decision: add one finance-facing approval kind, `report_release`.
  Rationale: this is generic enough to widen later to other external-facing report kinds while staying narrow enough for the first lender-update slice.

- Decision: finance `report_release` approvals must not depend on live runtime continuation, embedded-worker-only resolution, or task resume semantics.
  Rationale: report review is not a paused runtime command; it is a durable operator decision on a finished draft artifact.

- Decision: the reporting mission should remain `succeeded` after draft compilation even when review is pending.
  Rationale: compile success and release-readiness are separate truths, and regressing a finished reporting mission to `awaiting_approval` would incorrectly inherit runtime pause semantics.

- Decision: add one explicit release-readiness view for reporting instead of overloading existing filing or export posture.
  Rationale: `ReportingPublicationView` already describes stored-draft, filed-page, and markdown-export posture for the finance-memo path, so release-readiness needs its own typed summary.

- Decision: the first F5C4A release-readiness posture should be derived as `not_requested`, `pending_review`, `approved_for_release`, or `not_approved_for_release`.
  Rationale: those four states are enough to distinguish no request yet, pending finance review, approved posture, and resolved-but-not-approved posture without claiming that delivery already happened.

- Decision: proof-bundle readiness should remain tied to stored report artifacts, while finance approval and release-readiness posture should be rendered separately.
  Rationale: a completed `lender_update` draft can still have a ready evidence bundle even before release review is requested or approved.

- Decision: F5C4A stays deterministic and runtime-free.
  Rationale: the next later-F5 slice should persist and render finance review state from stored evidence only, not create runtime threads for drafting, formatting, or release behavior.

- Decision: F5C4A stays delivery-free.
  Rationale: the first approval slice may mark a draft as approved for release, but it must not actually send, distribute, publish, or record a final release log.

- Decision: preserve the current `modules/reporting/**` vocabulary and do not reintroduce a `modules/reports/**` rename wave.
  Rationale: the shipped F5A through F5C3 code already standardized on `reporting`, and a rename would add noise before the first approval contract exists.

- Decision: the later slice map after F5C4A is `F5C4B-release-log-and-first-lender-update-release-record-foundation`, then `F5C4C-broader-packet-approval-widening`, and only after that should bounded runtime-codex phrasing or formatting assistance be reconsidered if it still solves a real operator problem.
  Rationale: external-communication posture should harden in layers: first review and release-readiness, then lender-update release logging, then broader packet widening, then optional bounded runtime presentation help.

- Decision: the first mission-centric request path should be the singular `POST /missions/:missionId/reporting/release-approval`, and the packaged local proof should be `tools/lender-update-release-approval-smoke.mjs` behind `pnpm smoke:lender-update-release-approval:local`.
  Rationale: the implementation thread should match the explicit F5C4A user contract exactly rather than carrying forward handoff-era naming drift.

- Decision: proof bundles and reporting read models should expose `releaseReadiness` as a separate finance-review surface instead of reusing the legacy `latestApproval` summary.
  Rationale: proof readiness still means one stored lender-update artifact exists; finance approval posture is additive release-readiness state, not a redefinition of report readiness.

- Decision: `POST /approvals/:approvalId/resolve` should continue rejecting live-runtime approvals in `api_only` mode while permitting persisted `report_release` approvals to resolve without a runtime session.
  Rationale: F5C4A needs one truthful finance-review exception, not a broad reopening of runtime approval semantics outside embedded-worker mode.

## Context and Orientation

Pocket CFO has already shipped F4A through F4C2, with `plans/FP-0035-finance-policy-lookup-and-discovery-quality-hardening.md` as the shipped final F4 record.
Pocket CFO has also already shipped the first five F5 slices:

- `plans/FP-0036-reporting-mission-foundation-and-first-finance-memo.md` as the shipped F5A reporting-foundation record
- `plans/FP-0037-draft-report-body-filed-artifact-and-markdown-export-hardening.md` as the shipped F5B reporting-reuse record
- `plans/FP-0038-board-packet-specialization-and-draft-review-foundation.md` as the shipped F5C1 board-packet record
- `plans/FP-0039-lender-update-specialization-and-draft-review-foundation.md` as the shipped F5C2 lender-update record
- `plans/FP-0040-diligence-packet-specialization-and-draft-review-foundation.md` as the shipped F5C3 diligence-packet record

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
- one deterministic `POST /missions/reporting/diligence-packets` path from completed reporting work
- one draft `diligence_packet`
- reporting proof bundles that stay explicit about freshness, limitations, discovery lineage, reporting lineage, draft posture, and finance-memo publication posture

The repo still does not have any truthful finance-facing release-readiness workflow.
`ApprovalKindSchema` still knows only runtime and engineering approval kinds.
The approvals module README still documents live Codex runtime approval persistence plus single-process continuation.
`POST /approvals/:approvalId/resolve` still assumes live control must be enabled.
The next implementation thread must therefore retarget the existing approvals substrate for finance review semantics without pretending that runtime continuation and draft-report review are the same workflow.

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
- this shipped F5C4A record, `plans/FP-0041-approval-review-and-first-lender-update-release-readiness.md`
- `docs/ops/local-dev.md`
- `docs/ops/source-ingest-and-cfo-wiki.md`
- `docs/ops/codex-app-server.md`
- `docs/benchmarks/seeded-missions.md`
- `evals/README.md`

GitHub connector work is out of scope.
The internal `@pocket-cto/*` package scope remains unchanged.
This active slice now includes bounded runtime code, one additive schema migration, one packaged smoke command, and the smallest truthful doc refreshes required to keep the repo aligned with the shipped F5C4A implementation reality.

The most relevant implementation seams for the future F5C4A code thread are:

- `packages/domain/src/approval.ts`
- `packages/domain/src/reporting-mission.ts`
- `packages/domain/src/proof-bundle.ts`
- `packages/domain/src/mission-detail.ts`
- `packages/domain/src/mission-list.ts`
- `packages/domain/src/index.ts`
- `packages/db/src/schema/artifacts.ts`
- one additive drizzle migration under `packages/db/drizzle/`
- `apps/control-plane/src/modules/approvals/**`
- `apps/control-plane/src/modules/missions/detail-view.ts`
- `apps/control-plane/src/modules/missions/routes.ts`
- `apps/control-plane/src/modules/missions/service.ts`
- `apps/control-plane/src/modules/reporting/service.ts`
- `apps/control-plane/src/modules/reporting/artifact.ts`
- `apps/control-plane/src/modules/evidence/proof-bundle-assembly.ts`
- `apps/control-plane/src/modules/evidence/proof-bundle-summary.ts`
- `apps/web/components/approval-card-list.tsx`
- `apps/web/components/reporting-output-card.tsx`
- `apps/web/app/missions/[missionId]/**`
- `apps/web/lib/api.ts`

## Plan of Work

F5C4 should now proceed in two explicit steps and one explicit later-only boundary.

First, implement `F5C4A` as one finance-facing approval and release-readiness slice on top of the shipped `lender_update` reporting path.
The new review path should start only from one completed `reporting` mission with `reportKind = "lender_update"` and one stored `lender_update` artifact.
The reporting mission should stay succeeded as a draft-producing mission.
The new approval should be persisted separately as a finance review trace, not as a live runtime pause.
That means F5C4A should widen the typed contracts to include one finance approval kind, one report-release review view, one release-readiness summary, and one mission-centric request path that creates a `report_release` approval against the existing approvals bounded context.

Second, keep approval resolution inside the existing approvals bounded context and reuse the existing approvals table, repository, replay events, list route, and resolve route where possible.
The critical distinction is behavioral rather than infrastructural: finance review approvals must not require an in-memory runtime session, must not resume a paused task, must not push a completed reporting mission back into `awaiting_approval`, and must not require `liveControl.enabled` for resolution.
The control-plane read models should then surface both the latest finance approval trace and the derived release-readiness posture across mission detail, proof bundle, reporting detail, and approval-card copy.

Third, leave actual delivery and broader widening explicitly deferred.
After F5C4A lands, the next thread should implement `F5C4B-release-log-and-first-lender-update-release-record-foundation`.
Only after that lender-update release-record foundation exists should the repo widen into `F5C4C-broader-packet-approval-widening`, and only after that later review posture exists should the repo reconsider bounded runtime-codex phrasing or formatting assistance for report packets.

## Concrete Steps

1. Widen the pure approval and reporting contracts without adding a new mission family.
   Update:
   - `packages/domain/src/approval.ts`
   - `packages/domain/src/reporting-mission.ts`
   - `packages/domain/src/proof-bundle.ts`
   - `packages/domain/src/mission-detail.ts`
   - `packages/domain/src/mission-list.ts`
   - `packages/domain/src/index.ts`
   - `packages/db/src/schema/artifacts.ts`
   - one additive drizzle migration under `packages/db/drizzle/`

   F5C4A should:
   - add one finance-facing approval kind, `report_release`
   - keep the existing approval status and resolution enums unless a concrete gap appears
   - add one typed reporting review or release-readiness view separate from `ReportingPublicationView`
   - derive release-readiness as `not_requested`, `pending_review`, `approved_for_release`, or `not_approved_for_release`
   - carry the latest finance approval id, status, timestamps, actors, and rationale into typed reporting and proof-bundle reads
   - keep `mission.type = "reporting"` and `reportKind = "lender_update"` unchanged
   - add one additive `approval_kind` enum value for `report_release`

2. Retarget the approvals bounded context for finance review approvals without inventing a second approval system.
   Update:
   - `apps/control-plane/src/modules/approvals/service.ts`
   - `apps/control-plane/src/modules/approvals/schema.ts`
   - `apps/control-plane/src/modules/approvals/routes.ts`
   - `apps/control-plane/src/modules/approvals/card-formatter.ts`
   - `apps/control-plane/src/modules/approvals/payload.ts`
   - `apps/control-plane/src/modules/approvals/README.md`
   - add one small helper file under `apps/control-plane/src/modules/approvals/` only if that keeps service logic legible

   F5C4A should:
   - reuse the approvals table, repository, `approval.requested`, and `approval.resolved` replay events
   - add a finance-specific request path that creates a `report_release` approval with `taskId = null`
   - allow finance approval resolution through the existing approval resolution seam even when `liveControl.enabled` is false
   - skip live runtime delivery and task or mission resume behavior for `report_release`
   - avoid forcing a completed reporting mission back to `awaiting_approval`
   - make duplicate request retries safe by returning the existing pending `report_release` approval for that mission instead of creating duplicates

3. Add one mission-centric request path for the first lender-update review workflow.
   Update:
   - `apps/control-plane/src/modules/missions/routes.ts`
   - `apps/control-plane/src/modules/missions/service.ts`
   - add one small helper such as `apps/control-plane/src/modules/missions/report-release.ts`
   - `apps/control-plane/src/modules/reporting/service.ts`

   F5C4A should:
   - add one thin operator route at `POST /missions/:missionId/reporting/release-approval`
   - require one completed `reporting` mission
   - require `reportKind = "lender_update"`
   - require one stored `lender_update` artifact
   - reject `finance_memo`, `board_packet`, `diligence_packet`, incomplete reporting missions, and missing lender-update artifacts
   - persist a `report_release` approval only for that completed lender-update draft

4. Extend proof-bundle shaping and mission read models for finance review posture, not delivery posture.
   Update:
   - `apps/control-plane/src/modules/evidence/proof-bundle-assembly.ts`
   - `apps/control-plane/src/modules/evidence/proof-bundle-summary.ts`
   - `apps/control-plane/src/modules/missions/detail-view.ts`
   - `apps/control-plane/src/modules/reporting/artifact.ts`
   - `apps/control-plane/src/modules/reporting/service.ts`

   F5C4A should:
   - keep proof-bundle readiness tied to stored report artifacts rather than pending review state
   - carry the latest `report_release` approval trace and derived release-readiness posture into the proof bundle and reporting view
   - keep freshness, limitations, and provenance posture explicit
   - distinguish draft stored state, finance-memo publication posture, and release-readiness posture rather than collapsing them into one status string
   - avoid release-log, send, publish, or delivery timestamps

5. Add the narrowest truthful operator read path for finance review status.
   Update:
   - `apps/web/components/approval-card-list.tsx`
   - `apps/web/components/reporting-output-card.tsx`
   - `apps/web/app/missions/[missionId]/page.tsx`
   - `apps/web/app/missions/[missionId]/actions.ts`
   - `apps/web/app/missions/[missionId]/mission-actions.tsx`
   - `apps/web/lib/api.ts`

   The first operator path should:
   - start from a completed `lender_update` reporting mission
   - let the operator request finance review
   - render finance approval cards with report-aware copy rather than repo or PR-centric copy
   - render derived release-readiness posture clearly next to the existing draft and publication posture
   - show reviewer trace, rationale, and timestamps when present
   - avoid send buttons, distribution actions, release-log controls, PDF export, slide export, or runtime-codex drafting controls

6. Add the narrowest local proof for the first lender-update review and release-readiness slice.
   Update:
   - add `tools/lender-update-release-approval-smoke.mjs`
   - `package.json`
   - `docs/ops/local-dev.md` only if the new packaged smoke command lands in code

   F5C4A should:
   - mirror the shipped finance-memo, board-packet, lender-update, and diligence-packet local-proof pattern
   - add one packaged `pnpm smoke:lender-update-release-approval:local` command
   - prove request-review, resolve-approval, and derived `approved_for_release` posture from one stored `lender_update` draft without any send or publish side effect
   - avoid new eval datasets in the first implementation pass

7. Keep explicit non-goals in code comments, UI copy, tests, and docs where needed.
   F5C4A must not:
   - reopen F5A reporting foundation work
   - reopen F5B finance-memo filing or export reuse work
   - reopen F5C1 board-packet specialization
   - reopen F5C2 lender-update draft specialization
   - reopen F5C3 diligence-packet draft specialization
   - add actual send, distribute, publish, or release logging
   - add board-packet or diligence-packet approval widening
   - add runtime-codex drafting or runtime-codex release behavior
   - add PDF, slide, or Marp export
   - rename `modules/reporting/**`

## Validation and Acceptance

The next F5C4A implementation thread should preserve the current confidence ladder and add only the narrowest approval-review and release-readiness coverage on top of it.

Targeted test batches:

- `pnpm --filter @pocket-cto/domain exec vitest run src/approval.spec.ts src/reporting-mission.spec.ts src/proof-bundle.spec.ts src/mission-detail.spec.ts src/mission-list.spec.ts`
- `zsh -lc "cd apps/control-plane && pnpm exec vitest run src/modules/approvals/service.spec.ts src/modules/approvals/card-formatter.spec.ts src/modules/reporting/service.spec.ts src/modules/evidence/proof-bundle-assembly.spec.ts src/modules/missions/detail-view.spec.ts src/modules/missions/routes.spec.ts"`
- `zsh -lc "cd apps/web && pnpm exec vitest run \"components/approval-card-list.spec.tsx\" \"components/reporting-output-card.spec.tsx\" \"app/missions/[missionId]/actions.spec.ts\" \"components/mission-card.spec.tsx\" \"components/mission-list-card.spec.tsx\""`

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
- `pnpm smoke:lender-update-release-approval:local`

Preserved twin guardrails:

- `pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/twin/workflow-sync.spec.ts src/modules/twin/test-suite-sync.spec.ts src/modules/twin/codeowners-discovery.spec.ts`

Repo-wide final gate:

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm ci:repro:current`

User-visible F5C4A acceptance should be:

- a completed `lender_update` reporting mission can request one finance review approval without creating a new top-level mission family
- the request persists one `report_release` approval against the existing approvals bounded context
- approval resolution works without live runtime continuation
- the reporting mission detail, approval cards, and proof bundle show a derived release-readiness posture of `not_requested`, `pending_review`, `approved_for_release`, or `not_approved_for_release`
- proof-bundle readiness remains tied to stored report evidence rather than to pending review state
- the slice stays deterministic, runtime-free, and delivery-free
- no send, distribute, publish, release-log, PDF, or slide side effect is produced

Provenance, freshness, replay, and limitation expectations for the future F5C4A implementation are:

- the `lender_update` must keep carrying source discovery mission lineage, source reporting mission lineage, stored freshness, stored limitations, related routes, and related wiki pages from the completed reporting mission
- the `report_release` approval payload must identify the reporting mission, `reportKind`, company scope when present, and the reviewed artifact context clearly enough for another operator to understand the decision later
- replay must preserve both request and resolution events for finance review approvals
- release-readiness posture must remain visibly separate from actual release history
- no approval resolution may silently imply that external delivery already happened

## Idempotence and Recovery

The future F5C4A slice should be additive and retry-safe.
It should add one additive `approval_kind` enum value, one finance approval flow inside the existing approvals bounded context, and one derived release-readiness view on top of already-shipped reporting artifacts.
It should not rewrite raw sources, existing report bodies, or prior reporting history.

If a local database misses the additive `approval_kind` migration, run `pnpm db:migrate` and rerun the narrow proof rather than widening the implementation.
If an operator retries the review-request action while a `report_release` approval is already pending for that mission, the request should return the existing pending approval instead of creating duplicates.
If the latest approval resolves declined, cancelled, or expired, the reporting mission should remain a reusable stored draft with truthful `not_approved_for_release` posture and no delivery side effect.

## Artifacts and Notes

This shipped F5C4A contract expected the implementation thread to produce:

- one active Finance Plan record at `plans/FP-0041-approval-review-and-first-lender-update-release-readiness.md`
- one finance-facing `report_release` approval kind and additive migration
- one mission-centric review-request path for completed `lender_update` reporting missions
- one derived release-readiness view across reporting detail, proof bundles, and approval cards
- one packaged `pnpm smoke:lender-update-release-approval:local` proof
- no send, distribute, publish, or release-log side effect

## Interfaces and Dependencies

Pocket CFO should keep the same bounded-context split it already uses for F5A through F5C3:

- `packages/domain` for pure approval, reporting, proof, and mission-detail contracts
- `packages/db` for additive persistence schema changes only
- `apps/control-plane/src/modules/approvals/**` for approval persistence, replay, listing, resolution, and card formatting
- `apps/control-plane/src/modules/missions/**` for thin mission-centric request routes
- `apps/control-plane/src/modules/reporting/**` for deterministic reporting read models
- `apps/control-plane/src/modules/evidence/**` for proof-bundle assembly
- `apps/web/**` for operator review surfaces only

The CFO Wiki remains derived and reviewable, but F5C4A should not treat raw wiki pages alone as the lender-update approval source of truth.
The runtime-codex seam remains stable and out of scope for the first finance review slice.
`apps/control-plane/src/modules/runtime-codex/**` should remain a later seam, and `apps/control-plane/src/modules/approvals/**` should be retargeted rather than duplicated.

No new environment variables are expected for the first F5C4A slice.
If a concrete need appears during implementation, document it in this plan, `docs/ops/local-dev.md`, and the touched module README or config file before relying on it.

## Outcomes & Retrospective

This plan started as the docs-only handoff that narrowed later F5 work to one implementation-ready contract instead of a vague approval-release umbrella.
It keeps `plans/FP-0040-diligence-packet-specialization-and-draft-review-foundation.md` as the shipped F5C3 record, now serves as the shipped F5C4A record for one deterministic lender-update-only approval and release-readiness slice, and hands the next implementation thread to `plans/FP-0042-release-log-and-first-lender-update-release-record-foundation.md`.

This slice still must not reopen F5C3, widen into delivery semantics or F6, or delete GitHub or engineering-twin modules.
What remains is not more F5C4A work.
The next later-F5 step is the bounded F5C4B release-log and release-record slice described in FP-0042, with broader packet approval widening still deferred beyond that.
