# EP-0011 - Map runtime outputs into artifact placeholders and richer proof bundles

This ExecPlan is a living document. Keep `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` current.

## Purpose / Big Picture

After this slice, Pocket CTO will no longer treat a successful or terminalized executor run as only a task summary plus replay structure. The control plane will persist a small but legible evidence set for runtime work by mapping existing executor validation and runtime output into `diff_summary`, `test_report`, and `log_excerpt` artifacts, then threading those artifact ids back into the proof-bundle manifest.

The user-visible change is concrete. A successful executor task should now leave behind artifact rows and replay entries that explain what changed, what validation ran, and what concise runtime output mattered. A terminalized failure should still leave behind a useful `log_excerpt` or failure-summary artifact so an operator can review what happened without rereading the whole runtime transcript. This is roadmap submilestone `M1.7 artifact placeholder emission for PR, test report, and summary`, but this plan is intentionally narrowed to runtime-to-replay and artifact-placeholder mapping only. It must not widen into GitHub integration, PR creation, approval redesign, or M2 proof-bundle assembly.

## Progress

- [x] (2026-03-13T19:41Z) Read the required repo docs, M1.4 through M1.6 ExecPlans, evidence and runtime modules, schema and domain contracts, and inspected the current artifact gap with `rg -n "saveArtifact|artifact.created|diff_summary|test_report|pr_link|log_excerpt|proof bundle" apps packages docs` plus `git status --short`.
- [x] (2026-03-13T19:54Z) Added modular M1.7 evidence helpers under `apps/control-plane/src/modules/evidence/` for `diff_summary`, `test_report`, `log_excerpt`, shared markdown and validation summarization utilities, and an executor runtime-artifact coordinator that keeps artifact persistence inside the evidence boundary instead of broadening `runtime-phase.ts`.
- [x] (2026-03-13T19:54Z) Wired executor completion handling to prepare and persist runtime artifact placeholders, append one `artifact.created` replay event per saved artifact, and enrich the existing proof-bundle manifest in place while leaving the planner plan-artifact flow intact.
- [x] (2026-03-13T19:54Z) Extended DB-backed orchestrator coverage so executor success now proves persisted `diff_summary` plus `test_report`, terminalized no-change failure proves persisted `test_report` plus `log_excerpt`, replay ordering around `artifact.created` is asserted, proof-bundle artifact ids are checked, and planner artifact behavior remains covered by the existing planner-path tests.
- [x] (2026-03-13T19:54Z) Ran the required validation commands, completed one manual planner-plus-executor acceptance with a stub runtime against a temp git repo, and captured the resulting artifact ids, kinds, proof-bundle linkage, and replay sequence below.

## Surprises & Discoveries

- Observation: the schema and domain contracts already reserve the exact artifact kinds this milestone needs, but the runtime evidence flow only persists `plan` and `proof_bundle_manifest`.
  Evidence: `packages/db/src/schema/artifacts.ts`, `packages/domain/src/proof-bundle.ts`, `apps/control-plane/src/modules/evidence/planner-output.ts`, and the gap search results from 2026-03-13.

- Observation: executor turns already produce deterministic source material for placeholders without adding new runtime protocol fields.
  Evidence: `apps/control-plane/src/modules/runtime-codex/types.ts` already exposes `completedTextOutputs`, `finalAgentMessageText`, item lifecycle structure, thread id, turn id, and terminal status; `apps/control-plane/src/modules/validation/service.ts` and `apps/control-plane/src/modules/validation/types.ts` already expose changed paths, diff-check output, escaped paths, checks, and failure codes.

- Observation: the working tree already contains unrelated local eval-lane changes and doc or config edits, so this slice must build on top of that state without resetting anything.
  Evidence: `git status --short` on 2026-03-13 showed modifications in `.env.example`, `.gitignore`, `apps/control-plane/package.json`, `docs/ops/local-dev.md`, `package.json`, `packages/config/src/index.ts`, and untracked eval directories plus `plans/EP-0010-real-llm-evals-lane.md`.

- Observation: no additive DB change was necessary for M1.7 because the required artifact kinds were already present in the enum and schema.
  Evidence: `pnpm db:generate` returned `No schema changes, nothing to migrate`, and `pnpm db:migrate` completed without creating a new migration.

## Decision Log

- Decision: keep artifact persistence policy inside `apps/control-plane/src/modules/evidence/` and keep the orchestrator responsible only for choosing the prepared evidence outcome and committing it.
  Rationale: this preserves the architecture boundary from `AGENTS.md`, avoids a giant `runtime-phase.ts` branch, and keeps later M2 artifact evolution localized.
  Date/Author: 2026-03-13 / Codex

- Decision: treat `diff_summary`, `test_report`, and `log_excerpt` as narrow placeholder artifacts in M1.7, derived from already-available validation and runtime outputs rather than from richer external systems.
  Rationale: the user asked for richer evidence before GitHub App integration lands. Using current local data produces truthful, deterministic placeholders now without widening scope.
  Date/Author: 2026-03-13 / Codex

- Decision: defer real `pr_link` persistence unless a clearly labeled non-GitHub placeholder becomes obviously necessary during implementation.
  Rationale: the repo and roadmap both keep GitHub App work for M2. Adding a fake PR artifact too early risks obscuring that boundary; a documented deferral is safer unless a tiny pending placeholder materially improves evidence.
  Date/Author: 2026-03-13 / Codex

- Decision: mark the proof-bundle manifest `status = "ready"` once executor runtime evidence placeholders exist, even though mission terminal-state orchestration and GitHub PR work remain later milestones.
  Rationale: after M1.7 the manifest is no longer an empty placeholder. It contains artifact ids plus user-facing summaries that are sufficient for operator review of the local run, so keeping `placeholder` would be less truthful than marking the bundle ready for this pre-M2 evidence slice.
  Date/Author: 2026-03-13 / Codex

- Decision: persist `log_excerpt` only for non-success executor terminalizations in M1.7, while successful executor turns persist `diff_summary` plus `test_report`.
  Rationale: the prompt required at least those artifact kinds and explicitly called out failure-oriented excerpts. Restricting `log_excerpt` to non-success paths keeps the success artifact set legible and avoids duplicating the final executor report unnecessarily.
  Date/Author: 2026-03-13 / Codex

## Context and Orientation

Pocket CTO already has the spine needed for this slice. The mission repository can persist artifacts and update the placeholder proof-bundle manifest. The replay service can append `artifact.created`. The runtime layer captures compact structural lifecycle plus completed textual outputs. The validation layer can summarize local changed paths and diff-check results. The orchestrator already computes terminal task outcomes and already persists planner evidence after a successful planner turn.

The current M1.7 gap is that executor evidence is still mostly implicit. `apps/control-plane/src/modules/evidence/executor-output.ts` only formats task summaries. `apps/control-plane/src/modules/orchestrator/runtime-phase.ts` uses validation to decide terminal task status, but it does not convert that validation or runtime output into persisted `diff_summary`, `test_report`, or `log_excerpt` artifacts, and it does not enrich the proof-bundle manifest with those artifact ids or more truthful summary fields. The schema and domain types already support those artifact kinds, so the work is additive and mostly lives in the control-plane evidence boundary.

The main files for this slice are:

- `plans/EP-0011-runtime-artifact-placeholders-and-evidence-mapping.md`
- `docs/architecture/replay-and-evidence.md`
- `docs/ops/codex-app-server.md`
- `docs/ops/local-dev.md`
- `apps/control-plane/src/modules/evidence/service.ts`
- `apps/control-plane/src/modules/evidence/executor-output.ts`
- new small helper modules under `apps/control-plane/src/modules/evidence/`, likely including `diff-summary.ts`, `test-report.ts`, and `log-excerpt.ts`
- `apps/control-plane/src/modules/orchestrator/runtime-phase.ts`
- `apps/control-plane/src/modules/missions/repository.ts`
- `apps/control-plane/src/modules/missions/drizzle-repository.ts` only if a small artifact-read helper or repository interface adjustment is needed
- focused specs under `apps/control-plane/src/modules/orchestrator/` and possibly `apps/control-plane/src/modules/evidence/`

This slice should not change `WORKFLOW.md`, stack packs, GitHub App permissions, or environment variables. It should keep planner evidence intact, approval semantics intact except for any tiny artifact metadata hook, and replay compact and artifact-first.

## Plan of Work

First, add small evidence helper modules that can deterministically derive artifact drafts from the executor completion inputs Pocket CTO already has. One helper should build a diff-summary placeholder from changed paths, validation results, and any concise final report hints. Another should build a test-report placeholder from executor validation data even when the only available “test” evidence is a local diff check or a failed validation summary. A third should build a log-excerpt placeholder from final agent report text, concise stderr-style validation output, or a terminal failure summary when that is the most truthful artifact Pocket CTO can produce.

Next, extend the evidence service with proof-bundle enrichment helpers for these new artifact kinds. The manifest update should stay conservative: add new artifact ids, improve `changeSummary` and `verificationSummary` when real placeholders exist, mark failure-oriented summaries honestly when only a log excerpt exists, and keep `status` truthful without pretending M2’s full assembly is already done. The existing planner artifact attachment behavior should remain intact and additive.

Then, wire the executor completion path in `runtime-phase.ts` so successful or terminalized runs can persist prepared runtime artifacts through the evidence boundary. This should happen after the terminal task outcome is known, with one `artifact.created` event per saved artifact. The logic must stay deterministic and role-aware: planner continues using the current plan-artifact path, executor success should persist at least `diff_summary` and `test_report`, and executor terminal failure should persist a useful `log_excerpt` and any other truthful placeholder summaries if they are available.

Finally, add focused tests and docs. The tests should prove the new artifacts persist, replay appends in the expected order, proof-bundle manifest artifact ids include the new rows, failure cases still preserve evidence, and planner artifact flow does not regress. The docs and this plan should clearly state that GitHub or PR evidence remains deferred to M2.

## Concrete Steps

Run these commands from the repository root as needed:

    pnpm db:generate
    pnpm db:migrate
    pnpm --filter @pocket-cto/codex-runtime test
    pnpm --filter @pocket-cto/codex-runtime typecheck
    pnpm --filter @pocket-cto/control-plane test
    pnpm --filter @pocket-cto/control-plane typecheck
    pnpm --filter @pocket-cto/control-plane lint

If local execution remains possible after tests, also run one manual executor acceptance against the fake fixture or stub runtime and record:

- the artifact ids created
- the artifact kinds created
- the resulting proof-bundle `artifactIds`
- the replay event sequence around each `artifact.created`
- whether the run ended `succeeded` or terminalized `failed`

Implementation order:

1. Keep this ExecPlan current with discoveries, decisions, validation evidence, and remaining gaps.
2. Add modular evidence helper modules for `diff_summary`, `test_report`, and `log_excerpt`.
3. Extend the evidence service with conservative proof-bundle enrichment for runtime artifact placeholders.
4. Wire executor and terminal-failure artifact persistence into `orchestrator/runtime-phase.ts` without breaking planner evidence flow.
5. Add focused tests for executor success, executor terminal failure, replay `artifact.created`, proof-bundle linkage, and planner regression coverage.
6. Update docs and record any explicit `pr_link` deferral.
7. Run the required validation commands and the manual executor acceptance if the local setup allows it.

## Validation and Acceptance

Success for this slice is demonstrated when all of the following are true:

1. A successful executor turn persists at least one `diff_summary` artifact and one `test_report` artifact.
2. A terminalized executor failure persists a useful `log_excerpt` artifact or an equivalent failure-summary placeholder artifact, and that artifact is clearly sourced from runtime or validation output.
3. Each persisted runtime artifact appends its own `artifact.created` replay event.
4. The proof-bundle manifest references the new artifact ids and exposes more truthful summary fields than the original empty placeholder.
5. The existing planner `plan` artifact flow still works and its proof-bundle linkage remains intact.
6. No route handler, no DB schema migration, and no GitHub integration is required for this slice unless a tiny additive metadata hook becomes clearly necessary.
7. Replay remains compact and does not add token-level or delta-level storage.
8. Any deferred `pr_link` behavior is documented plainly in this ExecPlan and, if needed, the supporting docs.

Manual acceptance should show one executor run that ends with database evidence that a human can review:

- a `diff_summary` artifact with changed-file context
- a `test_report` artifact with validation status and concise checks
- a `log_excerpt` artifact for failure or concise runtime handoff text where appropriate
- replay showing `artifact.created` entries for those artifacts
- proof-bundle `artifactIds` including the new rows

## Idempotence and Recovery

This slice should remain additive. The schema already defines the artifact kinds, so no destructive DB change should be necessary. If `pnpm db:generate` produces no migration, that is the preferred outcome. If a tiny additive migration becomes necessary unexpectedly, it must include a rollback note here before landing.

Artifact creation must be safe to retry at the task level. The prepared artifact bodies should be deterministic for a given terminal turn and validation result, and failures should leave the task terminalized rather than stranded in `running`. If runtime artifact persistence fails after a completed turn, the fallback path should still leave a truthful task summary and replay trail so the operator can diagnose the failure. Rollback is straightforward: revert the new evidence helper modules, the orchestrator wiring, the supporting tests, and any doc changes together.

## Artifacts and Notes

Initial gap notes captured before implementation:

1. Current runtime output sources:
   `apps/control-plane/src/modules/runtime-codex/types.ts` already provides `completedTextOutputs`, `finalAgentMessageText`, ordered lifecycle items, thread ids, turn ids, and terminal status.
2. Current validation sources:
   `apps/control-plane/src/modules/validation/service.ts` and `apps/control-plane/src/modules/validation/types.ts` already provide changed paths, escaped paths, `diffCheckPassed`, `diffCheckOutput`, per-check summaries, and `failureCode`.
3. Artifact kinds reserved but not used by the runtime evidence flow in this milestone:
   `diff_summary`, `test_report`, `log_excerpt`, and `pr_link` remain unpersisted in the executor path even though `packages/db/src/schema/artifacts.ts` and `packages/domain/src/proof-bundle.ts` already define them.
4. Current artifact persistence boundary:
   planner evidence already persists through `apps/control-plane/src/modules/evidence/planner-output.ts`, while executor evidence currently stops at `apps/control-plane/src/modules/evidence/executor-output.ts` task summary formatting.
5. Working-tree caution:
   `git status --short` before implementation showed unrelated local modifications and untracked eval-lane files, so this slice must avoid resetting or reverting any pre-existing changes.

Validation results and manual acceptance notes will be appended here as implementation proceeds.

Validation results captured after implementation:

- `pnpm db:generate` passed with `No schema changes, nothing to migrate`.
- `pnpm db:migrate` passed.
- `pnpm --filter @pocket-cto/codex-runtime test` passed with 6 tests.
- `pnpm --filter @pocket-cto/codex-runtime typecheck` passed.
- `pnpm --filter @pocket-cto/control-plane test -- --run src/modules/orchestrator/drizzle-service.spec.ts` passed with 19 tests and proved the new executor evidence paths before the full suite run.
- `pnpm --filter @pocket-cto/control-plane test` passed with 59 tests.
- `pnpm --filter @pocket-cto/control-plane typecheck` passed.
- `pnpm --filter @pocket-cto/control-plane lint` passed.

Manual acceptance captured after implementation with a stub runtime against a temp git repo:

- `missionId = 46b08215-305d-42b2-b563-c313fdc8855b`
- `finalTaskStatus = succeeded`
- `artifactIdsCreated = [decfc6f9-9b8d-4629-82e3-51a290237026, 80e66df0-b58a-4e4a-9c5d-0fd3bbabd04d, 9cb84090-8641-4111-a6b5-ee5418bc2b5f, c930cf0b-8cc8-4249-a21b-a96a705f5d7a]`
- `artifactKindsCreated = [plan, diff_summary, test_report, proof_bundle_manifest]`
- `proofBundleArtifactIds = [decfc6f9-9b8d-4629-82e3-51a290237026, 80e66df0-b58a-4e4a-9c5d-0fd3bbabd04d, 9cb84090-8641-4111-a6b5-ee5418bc2b5f]`
- executor-side `artifact.created` replay entries were:
  - sequence `26` for `diff_summary`
  - sequence `27` for `test_report`
- replay around executor artifact creation was:
  - sequence `24` `runtime.turn_completed`
  - sequence `25` `task.status_changed` with `reason = "runtime_turn_completed"`
  - sequence `26` `artifact.created` for `diff_summary`
  - sequence `27` `artifact.created` for `test_report`

## Interfaces and Dependencies

Important existing types and modules for this slice:

- `ArtifactKind`, `ArtifactRecord`, and `ProofBundleManifest` in `packages/domain/src/proof-bundle.ts`
- `ReplayEventTypeSchema`, `TaskStatusChangeReasonSchema`, and runtime replay payload types in `packages/domain/src/replay-event.ts`
- `artifacts` schema in `packages/db/src/schema/artifacts.ts`
- `MissionRepository.saveArtifact(...)`, `MissionRepository.getProofBundleByMissionId(...)`, and `MissionRepository.upsertProofBundle(...)` in `apps/control-plane/src/modules/missions/repository.ts`
- `EvidenceService` and `persistPlannerTurnEvidence(...)` in `apps/control-plane/src/modules/evidence/`
- `RuntimeCodexRunTurnResult` in `apps/control-plane/src/modules/runtime-codex/types.ts`
- `ExecutorValidationService` and `ExecutorValidationReport` in `apps/control-plane/src/modules/validation/`
- `OrchestratorRuntimePhase` in `apps/control-plane/src/modules/orchestrator/runtime-phase.ts`

External and runtime dependencies for this slice remain unchanged:

- local Postgres for artifact persistence
- the existing fake Codex App Server fixture or local stub runtime for tests and manual acceptance
- no new environment variables expected
- no GitHub App permissions or webhook changes expected

## Outcomes & Retrospective

M1.7 now produces real runtime evidence placeholders instead of stopping at executor task summaries.
Successful executor turns persist `diff_summary` and `test_report` artifacts derived from local validation and compact runtime output, while terminalized executor failures can still persist a reviewable `log_excerpt` plus validation evidence.
Each persisted artifact appends its own `artifact.created` replay event, and the existing proof-bundle manifest is enriched in place with new artifact ids, more truthful summary fields, and a `ready` status once runtime evidence exists.

The planner path stayed intact.
Planner turns still persist the existing `plan` artifact through `planner-output.ts`, and the new runtime-artifact flow only attaches to executor terminalization.

The explicit remaining M2 gap is GitHub-backed evidence.
`pr_link` is still deferred intentionally, there is still no GitHub App branch or PR artifact creation in this slice, and later M2 work can now build on a clearer evidence contract because the local runtime already emits deterministic diff, validation, and failure-excerpt placeholders.
