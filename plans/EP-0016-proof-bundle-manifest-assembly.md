# EP-0016 - Assemble final proof-bundle manifests for the GitHub-first slice

This ExecPlan is a living document. Keep `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` current.

## Purpose / Big Picture

After this slice, Pocket CTO will stop treating the proof bundle as a lightly-enriched placeholder and start treating it as the durable final evidence package for the GitHub-first vertical slice.
Operators should be able to open a mission detail view and see one coherent manifest that truthfully summarizes the mission objective, repository target, planner evidence, executor validation, PR publication state, latest approval posture, replay volume, and decision-ready risk or rollback notes without manually stitching together the artifact ledger.

The user-visible proof is narrow but meaningful.
Successful GitHub publish paths should produce a `ready` proof bundle manifest that reads like a shippable decision package.
Partial paths should surface `incomplete` instead of pretending readiness.
Terminal non-shippable paths should surface `failed`.
The manifest should refresh deterministically after the planner artifact, executor evidence, PR creation, and approval resolution when those milestones change the final operator posture.

This plan covers roadmap submilestone `M2.5 proof bundle manifest assembly`.
It depends on the current runtime-evidence work from `plans/EP-0011-runtime-artifact-placeholders-and-evidence-mapping.md` and the GitHub App branch plus PR path from `plans/EP-0015-branch-and-pr-artifact-creation.md`.
It does not implement issue intake, approval-card formatting, or larger M2.7 UI work.

## Progress

- [x] (2026-03-15T22:01Z) Read the required repo docs, current M1.7 through M2.4 ExecPlans, local-dev and replay guidance, the current proof-bundle domain plus DB schema, the evidence and orchestrator modules, the GitHub publish path, and the mission-detail web surface, then ran the requested inspections: `rg -n "proofBundle|proof_bundle_manifest|artifact.created|pr_link|diff_summary|test_report|log_excerpt|approval" packages apps docs`, `git status --short`, and `git diff --name-only HEAD`.
- [x] (2026-03-15T22:01Z) Captured the M2.5 gap before coding: the repo already persists `proof_bundle_manifest`, `plan`, `diff_summary`, `test_report`, `log_excerpt`, and `pr_link`, but the manifest still updates incrementally and cannot yet assemble a final GitHub-aware decision package with truthful readiness, completeness, repo or PR metadata, approval posture, or key timestamps.
- [x] (2026-03-15T22:24Z) Expanded the proof-bundle domain and replay contracts to support a final assembled manifest: added richer manifest fields, explicit statuses `placeholder | incomplete | ready | failed`, evidence completeness, timestamps, artifact-kind summaries, and the narrow replay event `proof_bundle.refreshed`, then generated and applied the additive replay enum migration.
- [x] (2026-03-15T22:24Z) Added evidence-boundary assembly modules that derive proof-bundle summary facts from persisted mission, task, artifact, approval, and replay state, assemble the final manifest deterministically, avoid gratuitous rewrites, create the initial manifest through `artifact.created`, and append `proof_bundle.refreshed` only when a later material refresh changes the manifest.
- [x] (2026-03-15T22:24Z) Wired proof-bundle refresh through the intended milestone boundaries: planner evidence persistence, executor evidence persistence, PR-link persistence, and approval resolution or approval cancellation paths that change operator posture.
- [x] (2026-03-15T22:24Z) Updated the mission-detail read model and narrow web proof-bundle section so operators can see readiness, completeness, repo and branch and PR metadata, approval posture, replay counts, timestamps, and concise decision-oriented summaries without a broader UI redesign.
- [x] (2026-03-15T22:24Z) Added focused tests for ready, incomplete, and failed assembly paths plus richer mission-detail rendering, updated the affected DB-backed orchestrator expectations, refreshed replay and local-dev docs, and ran the required validation matrix successfully.
- [x] (2026-03-16T00:22Z) Localized the remaining M2.5 static-surface red to committed-ref drift in `packages/testkit/src/fixtures.ts`, confirmed the live-checkout `ci:static` failure was temporarily amplified by dirty-worktree clean-tree gating, committed the narrow fixture/spec fix plus matching plan notes, and reran the full static matrix successfully including `pnpm ci:static` and `pnpm ci:repro:ref --ref HEAD --step static --repeat 5`.

## Surprises & Discoveries

- Observation: the working tree already contains uncommitted M2.4 GitHub App changes in `README.md`, the GitHub App bounded context, `docs/ops/local-dev.md`, and `plans/EP-0015-branch-and-pr-artifact-creation.md`.
  Evidence: `git status --short` and `git diff --name-only HEAD` on 2026-03-15 before EP-0016 implementation.

- Observation: the current proof-bundle manifest is persisted durably, but its schema is still too small for a final GitHub-aware evidence package.
  Evidence: `packages/domain/src/proof-bundle.ts` currently only carries objective, four summary strings, `decisionTrace`, `artifactIds`, `replayEventCount`, and `status = "placeholder" | "ready"`.

- Observation: the current evidence boundary already has clean planner, runtime-artifact, and PR-link seams, so M2.5 can recompute the manifest from persisted state instead of widening `runtime-phase.ts`.
  Evidence: `apps/control-plane/src/modules/evidence/planner-output.ts`, `runtime-artifacts.ts`, and `pull-request-link.ts`.

- Observation: preserving `riskSummary` and `rollbackSummary` from the previously persisted bundle caused stale incomplete-path text to survive after the executor later failed.
  Evidence: the DB-backed no-changes executor spec initially returned the planner-era rollback message until proof-bundle summary derivation stopped carrying those fields forward when fresh execution evidence existed.

- Observation: the current repo-level static red localizes to a shared testkit placeholder fixture that lagged the richer M2.5 `ProofBundleManifest` contract; the live checkout also fails the clean-tree gate because that narrow fixture/spec fix is already present as uncommitted changes.
  Evidence: `pnpm ci:static` on 2026-03-16 failed at `ci:clean-tree`, while the dirty diff in `packages/testkit/src/fixtures.ts` and `packages/testkit/src/fixtures.spec.ts` updates `proofBundlePlaceholderFixture(...)` and its regression spec to the current manifest shape described in `packages/domain/src/proof-bundle.ts`.

- Observation: once the shared `packages/testkit` placeholder and its regression spec were committed, the M2.5 static surface went fully green without any proof-bundle assembly or GitHub-path logic changes.
  Evidence: `pnpm ci:static` passed in the live checkout and `pnpm ci:repro:ref --ref HEAD --step static --repeat 5` succeeded against commit `fd66bbbcaa7bd4c6e6e48266bed060bba256bc3d`.

## Decision Log

- Decision: assemble the proof bundle from persisted mission, task, artifact, approval, and replay state instead of mutating the manifest field-by-field in orchestrator code.
  Rationale: a recomputed manifest is easier to keep truthful, easier to refresh after approval resolution, and reduces the risk of stale or overwritten fields when planner, executor, and PR evidence arrive in different phases.
  Date/Author: 2026-03-15 / Codex

- Decision: add explicit manifest statuses `placeholder`, `ready`, `incomplete`, and `failed`, and keep the rule set narrow and deterministic.
  Rationale: the current `placeholder | ready` model overstates maturity for partial or failed GitHub-aware paths.
  Date/Author: 2026-03-15 / Codex

- Decision: emit one narrow replay event when an existing proof bundle manifest materially changes after creation.
  Rationale: the proof-bundle manifest affects operator posture, so later refreshes should be replay-visible without resorting to a broad generic artifact-update event.
  Date/Author: 2026-03-15 / Codex

- Decision: keep `riskSummary` and `rollbackSummary` dynamically derived from current execution posture instead of carrying them forward from an older manifest once executor or PR evidence exists.
  Rationale: those summaries describe current operator posture, so stale planner-era fallback text is worse than recomputing a conservative current summary.
  Date/Author: 2026-03-15 / Codex

- Decision: treat the remaining M2.5 static issue as a narrow testkit contract-drift fix unless the validation rerun proves a real product bug.
  Rationale: the proof-bundle assembly modules, status rules, and operator read model are already aligned; broadening logic would add risk without addressing the localized repro.
  Date/Author: 2026-03-16 / Codex

## Context and Orientation

Pocket CTO already has the core evidence ingredients for this slice.
Mission creation persists a `proof_bundle_manifest` placeholder.
Planner completion persists a `plan` artifact.
Executor terminalization persists `diff_summary`, `test_report`, and `log_excerpt` placeholders.
Successful GitHub publish persists a `pr_link` artifact.
Runtime approvals are durable and replay-visible.

What is missing is the final assembly step.
Today the manifest mostly accumulates artifact ids through incremental helper methods in `apps/control-plane/src/modules/evidence/service.ts`.
That approach leaves major evidence gaps:

- no durable repo, branch, or PR summary in the manifest
- no latest approval summary
- no explicit validation summary field separate from general verification text
- no artifact index with kinds
- no completeness model
- no key evidence timestamps
- no truthful `incomplete` or `failed` status
- no refresh after approval resolution

The main files and modules for this slice are:

- `plans/EP-0016-proof-bundle-manifest-assembly.md`
- `packages/domain/src/proof-bundle.ts`
- `packages/domain/src/replay-event.ts`
- `packages/domain/src/mission-detail.ts`
- `packages/db/src/schema/replay.ts`
- `apps/control-plane/src/modules/evidence/service.ts`
- new small evidence modules under `apps/control-plane/src/modules/evidence/`
- `apps/control-plane/src/modules/approvals/service.ts`
- `apps/control-plane/src/modules/orchestrator/runtime-phase.ts`
- `apps/control-plane/src/modules/missions/detail-view.ts`
- `apps/control-plane/src/bootstrap.ts`
- focused control-plane and web specs
- `docs/architecture/replay-and-evidence.md`
- `docs/ops/local-dev.md`

This slice should preserve the current architecture boundaries:

- proof-bundle assembly stays in the evidence boundary
- route files remain thin
- approval orchestration stays in the approvals boundary and only calls the evidence boundary for refresh
- GitHub publish stays inside the GitHub App bounded context
- the web surface only consumes the richer read model and does not rebuild bundle logic client-side

## Plan of Work

First, expand the proof-bundle domain contract so it can represent the final GitHub-aware evidence package without breaking the existing placeholder flow.
That means adding the richer manifest fields, the new status values, a completeness summary, repo and PR metadata, approval summary, timestamps, and an artifact index that includes kinds.

Next, add small evidence-boundary modules for proof-bundle assembly and summary extraction.
One module should translate persisted artifacts and approvals into concise summary inputs.
Another should assemble the full manifest deterministically from mission, tasks, artifacts, approvals, replay counts, and the previous manifest.
The assembly rule set should also decide whether the next manifest is `placeholder`, `incomplete`, `ready`, or `failed`.

Then, add one refresh path that can be called after planner evidence, executor runtime evidence, PR-link persistence, and approval resolution.
That path should:

- read persisted state inside the current transaction when possible
- assemble the next manifest
- compare it with the current manifest
- avoid a rewrite when nothing material changed
- create the manifest only once via `artifact.created`
- update it in place for later refreshes
- append one narrow replay event when a later refresh changes the manifest materially

After that, update the mission-detail read model and web proof-bundle rendering so operators can actually consume the richer manifest.
The UI changes should stay narrow: better summary fields, readiness messaging, completeness hints, and repo or PR details without any large layout redesign.

Finally, add focused tests plus docs, run the required validation commands, and record the exact results and any live GitHub smoke evidence here.

## Concrete Steps

Run these commands from the repository root as needed:

    pnpm db:generate
    pnpm db:migrate
    pnpm run db:migrate:ci
    pnpm --filter @pocket-cto/control-plane test
    pnpm --filter @pocket-cto/control-plane typecheck
    pnpm --filter @pocket-cto/control-plane lint
    pnpm --filter @pocket-cto/web test
    pnpm --filter @pocket-cto/web typecheck
    pnpm --filter @pocket-cto/web lint

Useful narrow inspection commands during implementation:

    rg -n "proofBundle|proof_bundle_manifest|artifact.created|pr_link|diff_summary|test_report|log_excerpt|approval" packages apps docs
    git status --short
    git diff --name-only HEAD
    pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/orchestrator/drizzle-service.spec.ts src/modules/approvals/service.spec.ts src/app.spec.ts
    pnpm --filter @pocket-cto/web exec vitest run components/mission-card.spec.tsx lib/api.spec.ts

If live GitHub App env is present after implementation, run one narrow draft-PR smoke and record:

- proof-bundle status
- artifact ids and kinds in the manifest
- PR number and URL
- whether the manifest now reads like a coherent decision package

## Validation and Acceptance

Success for M2.5 is demonstrated when all of the following are true:

1. The proof bundle manifest is assembled from persisted state, not only incrementally patched.
2. The manifest includes mission identity or objective, repo target, branch, PR metadata when present, artifact ids plus kinds, latest approval summary, validation summary, concise change and verification and risk and rollback summaries, completeness, replay-event count, and key timestamps.
3. The status model is explicit and deterministic:
   `placeholder`
   used only when the mission has no meaningful persisted evidence beyond the initial placeholder.
   `ready`
   used only when the planner artifact, validation evidence, and PR link exist for a successful publish path, with no blocking pending approval or terminal failure.
   `incomplete`
   used when meaningful evidence exists but the mission is not yet a final shippable package because one or more expected GitHub-first evidence pieces are still missing.
   `failed`
   used when the latest terminal executor or mission posture is non-shippable, including publish-failure or validation-failure paths.
4. The manifest refreshes after planner evidence, executor runtime evidence, PR creation, and approval resolution when those boundaries change the operator posture.
5. Refreshes do not rewrite the manifest when the assembled result is unchanged.
6. The initial manifest still uses `artifact.created`, while later material refreshes emit the narrow explicit replay event chosen by implementation.
7. Mission detail and the web proof-bundle section reflect the richer manifest without a larger UI redesign.
8. Focused tests prove ready, incomplete, and failed paths plus richer mission-detail rendering.

## Idempotence and Recovery

This slice should be additive.
If a DB migration is required, it should only extend the replay-event enum or any other minimal schema surface needed for the new replay event type.
No destructive schema change is expected.

Manifest refresh must be safe to retry.
The assembler should compute the same result for the same persisted state, and the refresh path should compare the previous and next manifests before deciding whether to persist an update.
If the refresh path fails after artifact persistence, the mission should still retain the underlying artifacts and replay evidence rather than losing the runtime or PR evidence itself.

Rollback is straightforward:
revert the proof-bundle schema expansion, the evidence-boundary assembly modules, the refresh wiring, the small read-model and web updates, the focused tests, the doc changes, and any additive replay-event migration together.

## Artifacts and Notes

Initial M2.5 gap notes captured before implementation:

1. Existing persisted evidence already covers the milestone inputs:
   `proof_bundle_manifest`, `plan`, `diff_summary`, `test_report`, `log_excerpt`, and `pr_link`.
2. Existing manifest limitation:
   the manifest is still mostly a placeholder-plus-artifact-id list and cannot yet read like a final GitHub-aware decision package.
3. Existing operator read model:
   `GET /missions/:missionId` already returns the proof bundle, approvals, and artifact summaries together, so M2.5 can stay narrow and enrich the existing read model.
4. Existing replay limitation:
   replay currently shows manifest creation via `artifact.created`, but not later manifest refreshes.

Validation results, status rules as implemented, and any live smoke notes will be appended here as work proceeds.

Implemented status rules:

- `placeholder`
  when there are no persisted evidence artifacts other than the proof-bundle artifact itself and no approvals exist
- `failed`
  when the latest planner task failed, the latest executor task failed or was cancelled, the mission is `failed` or `cancelled`, or the latest approval is `declined`, `cancelled`, or `expired`
- `ready`
  when all final expected artifact kinds `plan`, `diff_summary`, `test_report`, and `pr_link` are present, the latest executor task succeeded, and there is no pending approval
- `incomplete`
  for every other meaningful evidence state, including planner-only, executor-only, PR-missing, and pending-approval paths

Implemented refresh triggers:

- `planner_evidence`
  after a `plan` artifact is persisted
- `executor_evidence`
  after executor runtime artifacts are persisted
- `pull_request_link`
  after the `pr_link` artifact is persisted
- `approval_resolution`
  after approval resolution or approval cancellation changes the final operator posture

Validation results:

- `pnpm db:generate`
  passed, with no additional schema changes after the replay enum migration
- `pnpm db:migrate`
  passed
- `pnpm --filter @pocket-cto/control-plane test`
  passed before and after the narrow testkit fixture fix
- `pnpm --filter @pocket-cto/control-plane typecheck`
  passed before and after the narrow testkit fixture fix
- `pnpm --filter @pocket-cto/control-plane lint`
  passed before and after the narrow testkit fixture fix
- `pnpm --filter @pocket-cto/web test`
  passed before and after the narrow testkit fixture fix
- `pnpm --filter @pocket-cto/web typecheck`
  passed before and after the narrow testkit fixture fix
- `pnpm --filter @pocket-cto/web lint`
  passed before and after the narrow testkit fixture fix
- `pnpm ci:static`
  initially failed in the dirty live checkout at `ci:clean-tree`, then passed after the committed narrow fix restored both the `packages/testkit` contract and a clean worktree
- `pnpm ci:repro:ref --ref HEAD --step static --repeat 5`
  initially failed 5/5 on pre-fix `HEAD` inside `pnpm typecheck:packages` because `packages/testkit/src/fixtures.ts` still returned the pre-M2.5 placeholder shape, then passed 5/5 after the narrow fixture/spec commit
- `pnpm run db:migrate:ci`
  passed for both `pocket_cto` and `pocket_cto_test`
- `pnpm --filter @pocket-cto/control-plane test`
  passed, 34 test files and 155 tests
- `pnpm --filter @pocket-cto/control-plane typecheck`
  passed
- `pnpm --filter @pocket-cto/control-plane lint`
  passed
- `pnpm --filter @pocket-cto/web test`
  passed, 4 test files and 15 tests
- `pnpm --filter @pocket-cto/web typecheck`
  passed
- `pnpm --filter @pocket-cto/web lint`
  passed

Live GitHub smoke note:

- Skipped in this shell because the required GitHub App environment variables are not present, as confirmed by `env | rg '^GITHUB_APP_|^GITHUB_WEBHOOK|^GITHUB_DEFAULT_'`.

## Interfaces and Dependencies

Important existing dependencies for this slice:

- `ProofBundleManifestSchema` and artifact contracts in `packages/domain/src/proof-bundle.ts`
- replay event contracts in `packages/domain/src/replay-event.ts`
- replay-event enum schema in `packages/db/src/schema/replay.ts`
- artifact persistence through `MissionRepository.saveArtifact()` and `upsertProofBundle()`
- approval listing through `ApprovalRepository.listApprovalsByMissionId()`
- replay persistence and counting through `ReplayService`
- current evidence helper modules under `apps/control-plane/src/modules/evidence/`
- mission detail read-model builders under `apps/control-plane/src/modules/missions/`

Likely new or expanded interfaces by the end of this slice:

- a richer `ProofBundleManifest` schema and supporting nested types
- a small evidence-boundary proof-bundle assembler or refresher service
- a narrow replay event type for post-creation manifest refresh
- a richer proof-bundle section in the mission-detail read model and web surface

Environment and permission expectations should remain unchanged from M2.4.
If live GitHub env is present locally, it should continue to use the GitHub App path only.

## Outcomes & Retrospective

M2.5 now lands as a real proof-bundle assembly slice instead of another incremental enrichment patch.
The manifest is assembled inside the evidence boundary from durable state, persisted as the existing `proof_bundle_manifest` artifact kind, refreshed at the intended milestone boundaries, and exposed to the operator surface as a coherent decision package.

The resulting operator posture is materially closer to the M2 exit criteria:

- planner-only missions now read as `incomplete`
- successful publish paths can read as `ready`
- terminal validation or approval failures read as `failed`
- repo, branch, PR, approval, completeness, replay-count, artifact-kind, and timestamp details now travel with the manifest itself instead of requiring the UI to infer them

Remaining follow-up for M2.6 is now cleaner:

- approval-card formatting can build on a truthful final proof-bundle manifest instead of compensating for missing readiness or completeness state
- larger operator UI work can stay presentation-focused because the read model already carries the needed bundle shape
