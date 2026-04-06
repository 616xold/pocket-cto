# EP-0008 - Enable guarded executor turns with planner handoff and local validation

This ExecPlan is a living document. Keep `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` current.

## Purpose / Big Picture

After this submilestone, Pocket CTO can run an `executor` task as a controlled file-changing turn inside its isolated task workspace instead of treating that role as another read-only placeholder. The executor will receive the latest relevant planner artifact as explicit handoff context, be told exactly where mutation is allowed, and then succeed or fail based on local post-turn guardrails such as changed-path enforcement and `git diff --check`.

The operator-visible proof is narrow but real. An executor task that changes only allowed files should complete with a concise task summary that names the intended change and validation result. An executor task that edits files outside the mission allowlist or leaves diff-check failures behind should fail with an explicit task-status reason, while planner behavior and its read-only posture remain unchanged.

This plan intentionally stops at roadmap submilestone `M1.5 basic executor task`.
It does not add approval persistence, GitHub or PR side effects, richer artifact plumbing, or broader CI orchestration. M1.6 will own approval persistence. M1.7 will own richer runtime-to-evidence artifact mapping.

## Progress

- [x] (2026-03-12T21:41Z) Split controlled business failures from runtime crashes at the orchestrator result boundary: executor missing-planner-artifact now returns `task_failed` instead of `runtime_failed`, worker logging records that path as a controlled failure, and true runtime/protocol exceptions still stay on the `runtime_failed` path for future metrics and approval handling.
- [x] (2026-03-12T16:24Z) Re-ran the full required validation list after the hardening pass, refreshed `@pocket-cto/domain` declarations for the additive replay reasons, and completed two manual temp-repo acceptances that confirmed no-op executor turns and planner-evidence-failure turns both terminalize with cleared `codexTurnId` and released workspace leases.
- [x] (2026-03-12T16:20Z) Hardened post-turn terminalization so completed runtime turns no longer strand planner or executor tasks in `running`: terminal outcomes are now computed before the final DB write, executor validation hook exceptions become structured failed reports, executor no-op turns fail explicitly, and fallback terminalization clears `codexTurnId` plus releases the workspace lease even when planner evidence persistence or later validation work fails.
- [x] (2026-03-12T03:14Z) Re-read the required repo docs, active ExecPlans, architecture and ops docs, DB and domain schemas, orchestrator/runtime modules, workspace modules, evidence modules, and the fake Codex App Server fixture named in the prompt.
- [x] (2026-03-12T03:14Z) Confirmed the current executor gap before coding: executor tasks still use the generic read-only prompt path, there is no repository read path for planner plan artifacts, and there is no post-turn workspace validation module or hook surface beyond runtime completion status.
- [x] (2026-03-12T03:14Z) Drafted this ExecPlan with the bounded M1.5 scope, exact edit surface, validation commands, replay implications, and evidence handoff.
- [x] (2026-03-12T03:34Z) Added a narrow planner-artifact read boundary on the mission repository, including dependency-first lookup, mission-level planner fallback, and executor failure when no planner artifact exists.
- [x] (2026-03-12T03:34Z) Added dedicated executor context and prompt modules, a shared workflow-policy loader, and an executor turn policy builder that uses `workspaceWrite` with writable roots limited to the task workspace and `networkAccess = false`.
- [x] (2026-03-12T03:34Z) Added `modules/validation/` with changed-path capture, allowlist enforcement, and `git diff --check`, then wired executor summaries plus terminal task decisions through `orchestrator/runtime-phase.ts`.
- [x] (2026-03-12T03:34Z) Added focused prompt, validation, repository, in-memory orchestrator, and DB-backed executor tests; updated the two ops docs; ran the required validation commands; and captured one manual temp-repo executor acceptance with a stub writer runtime.
- [x] (2026-03-12T22:31Z) Added the minimal M1.6 handoff note: executor mutation turns no longer stay on `approvalPolicy = "never"` after this milestone and now resolve approval posture through the dedicated M1.6 approval-policy resolver, while planner and other read-only turns remain `never`.

## Surprises & Discoveries

- Observation: `executor` turns are still deliberately routed through the generic read-only placeholder input and read-only runtime policy from M1.4.
  Evidence: `apps/control-plane/src/modules/orchestrator/runtime-phase.ts` always builds `buildReadOnlyTurnPolicy()` and only swaps planner tasks onto `buildPlannerTurnInput(...)`; `apps/control-plane/src/modules/runtime-codex/turn-input.ts` still tells executor tasks to inspect only and “Do not make changes.”

- Observation: Planner evidence is persisted, but only through write-side methods. There is currently no repository or evidence read path to retrieve the latest planner `plan` artifact for executor handoff.
  Evidence: `apps/control-plane/src/modules/evidence/planner-output.ts` writes `artifacts.kind = 'plan'`, while `apps/control-plane/src/modules/missions/repository.ts` and `apps/control-plane/src/modules/missions/drizzle-repository.ts` expose `saveArtifact`, `getProofBundleByMissionId`, and `upsertProofBundle` but no `plan` artifact lookup.

- Observation: The current task-status reason union does not have a reason for post-runtime executor validation failure.
  Evidence: `packages/domain/src/replay-event.ts` currently limits `TaskStatusChangeReasonSchema` to `worker_claimed`, `task_completed`, `runtime_turn_started`, `runtime_turn_completed`, and `runtime_turn_failed`.

- Observation: There is no existing post-turn validation infrastructure for local git diffs, changed-path allowlists, or command hooks.
  Evidence: repo-wide search shows no `git diff --check`, no workspace validation module, and no executor-specific validation hook interface under `apps/control-plane/src/modules/`.

- Observation: `mission_tasks.summary` is the narrowest operator-visible executor outcome surface available before M1.7 richer artifact plumbing lands.
  Evidence: the current schema already exposes `mission_tasks.summary`, while `artifacts.kind` has no dedicated executor completion artifact kind for this milestone and the prompt explicitly forbids widening into richer runtime-to-evidence artifact plumbing.

- Observation: `@pocket-cto/control-plane` typecheck still needs the referenced `@pocket-cto/domain` declarations refreshed after additive replay-event enum changes.
  Evidence: the first `pnpm --filter @pocket-cto/control-plane typecheck` after code changes still saw the old `TaskStatusChangeReason` union until `pnpm --filter @pocket-cto/domain build` regenerated the referenced declarations.

- Observation: the original M1.5 completion path still ran executor validation, planner evidence persistence, `clearCodexTurnId`, task finalization, and workspace release inside one transaction, so a thrown post-turn step could roll back the runtime terminalization work and leave the task `running`.
  Evidence: `apps/control-plane/src/modules/orchestrator/runtime-phase.ts` previously executed `validateExecutorTurn(...)` and `persistPlannerTurnEvidence(...)` inside the same `missionRepository.transaction(...)` that appended `runtime.turn_completed` and cleared `codexTurnId`.

- Observation: the in-memory mission repository does not model transactional rollback, so the terminalization-integrity failure mode only reproduces accurately in the DB-backed orchestrator harness.
  Evidence: an initial in-memory planner-evidence-failure spec left the task `succeeded` after a thrown `saveArtifact(...)` because `InMemoryMissionRepository.transaction(...)` is only a session wrapper, not a rollback-capable transaction.

- Observation: plain `git diff --check --relative HEAD --` does not inspect brand-new untracked files, so executor whitespace and conflict-marker validation would have had a blind spot for newly created files.
  Evidence: a local probe against a temp repo showed `git diff --check` ignored an untracked file with trailing whitespace, while `git diff --no-index --check -- <empty-file> <path>` reported the issue correctly.

- Observation: the orchestrator result seam still treated any exception from `executeClaimedTaskTurn(...)` as `runtime_failed`, even when `RuntimePhase` had already terminalized the task as a controlled business failure and cleared active turn state.
  Evidence: `apps/control-plane/src/modules/orchestrator/service.ts` caught every thrown error from `executeTaskTurn(...)` and returned `runtime_failed` after only reloading the task, while `apps/control-plane/src/modules/orchestrator/runtime-phase.ts` already used `failExecutorForMissingPlannerArtifact(...)` to mark the task `failed` before rethrowing.

## Decision Log

- Decision: Executor tasks will fail fast when no usable planner artifact can be resolved.
  Rationale: M1.5 needs an explicit, inspectable dependency boundary. Silently running executor mutation without planner handoff would weaken the planner-to-executor contract and make later evidence harder to trust.
  Date/Author: 2026-03-12 / Codex

- Decision: Planner-artifact lookup will use one narrow repository method that first checks the executor task’s dependency task id for a `plan` artifact, then falls back to the latest planner-task `plan` artifact in the same mission.
  Rationale: The prompt asks for exactly that preference order and explicitly warns against broad artifact-query complexity. A single mission-repository method keeps the boundary tight and reusable.
  Date/Author: 2026-03-12 / Codex

- Decision: Executor prompt assembly and executor turn policy will live in dedicated runtime-codex modules instead of expanding `turn-input.ts` or reusing planner code.
  Rationale: This preserves the published modular boundaries and keeps planner and executor behavior independently auditable.
  Date/Author: 2026-03-12 / Codex

- Decision: Post-turn validation will use a modular hook runner with two built-in hooks in M1.5: changed-path capture plus allowlist enforcement, and `git diff --check`.
  Rationale: That is the smallest future-extensible surface that satisfies the milestone without turning the worker into a generic CI runner.
  Date/Author: 2026-03-12 / Codex

- Decision: Executor validation failures after an otherwise successful runtime turn will mark the task `failed` with a new explicit status-change reason `executor_validation_failed`.
  Rationale: The state machine requires the final task state to reflect whether outputs are valid. Reusing `runtime_turn_failed` would blur runtime transport failures with local policy failure.
  Date/Author: 2026-03-12 / Codex

- Decision: Executor outcomes in M1.5 will persist only to `mission_tasks.summary`, not to new executor artifacts.
  Rationale: The prompt explicitly narrows this milestone away from richer runtime-to-evidence artifact mapping. A concise task summary is the smallest operator-visible surface that still records change plus validation outcome.
  Date/Author: 2026-03-12 / Codex

- Decision: Post-turn terminalization will compute executor validation and planner evidence preparation before the final task-state write transaction, then persist one deterministic terminal outcome in a transaction, with one fallback failure terminalization attempt if the first persistence pass throws.
  Rationale: This is the narrowest way to keep runtime transport unchanged while ensuring a completed turn does not leave the task `running` with a stale `codexTurnId` because later validation or evidence work failed.
  Date/Author: 2026-03-12 / Codex

- Decision: Completed executor turns with zero changed paths now fail explicitly with `executor_no_changes`.
  Rationale: A no-op executor turn does not satisfy the M1.5 mutation slice and should not silently count as successful work.
  Date/Author: 2026-03-12 / Codex

- Decision: Validation hooks catch ordinary git or filesystem exceptions inside `LocalExecutorValidationService`, convert them into structured failed checks, and continue terminalization.
  Rationale: Hook failures are part of the executor guardrail result, not a reason to crash post-turn cleanup.
  Date/Author: 2026-03-12 / Codex

- Decision: `git diff --check` coverage now extends to untracked files by running the narrow no-index check against each untracked path.
  Rationale: This closes a real hygiene gap for brand-new files without introducing a generic command-runner or CI surface.
  Date/Author: 2026-03-12 / Codex

- Decision: Add a separate orchestrator tick result `task_failed` for controlled policy or business failures that have already been persisted as terminal `failed` tasks with no active `codexTurnId`, and reserve `runtime_failed` for actual runtime, protocol, or infrastructure failures.
  Rationale: Worker logs and future metrics should distinguish deterministic business-policy failures such as missing planner handoff from genuine Codex runtime crashes. Reclassifying at the orchestrator boundary keeps `RuntimePhase` narrow and avoids widening the approval slice.
  Date/Author: 2026-03-12 / Codex

## Context and Orientation

Pocket CTO already has the mission spine from M0, runtime turn and replay mapping from M1.2, isolated task workspaces from M1.3, and planner prompt plus plan-artifact persistence from M1.4.

Today, a claimed task runs through `apps/control-plane/src/modules/orchestrator/runtime-phase.ts`. That module ensures a task workspace, selects planner context only for `task.role === "planner"`, and then calls `CodexRuntimeService.runTurn(...)`. Planner tasks get a dedicated prompt via `planner-context.ts` and `planner-prompt.ts`, while all non-planner roles, including executor, fall back to the generic read-only `turn-input.ts` path. After the turn completes, `persistPlannerTurnEvidence(...)` may persist a `plan` artifact and update `mission_tasks.summary`, but there is no executor-specific evidence or validation phase yet.

The main repository boundaries for this slice must remain:

- `packages/domain/` for additive shared enums or typed executor-handoff contracts only.
- `packages/db/` for additive schema changes only if strictly required. This plan aims to avoid schema changes beyond generated enum or migration needs.
- `apps/control-plane/src/modules/missions/` for planner-artifact lookup and task-summary persistence.
- `apps/control-plane/src/modules/runtime-codex/` for executor context, prompt, and turn policy only.
- `apps/control-plane/src/modules/validation/` or a similarly narrow local module for post-turn workspace checks.
- `apps/control-plane/src/modules/orchestrator/` for lifecycle decisions, validation-result handling, replayed status transitions, and task finalization.
- `apps/control-plane/src/modules/evidence/` for concise executor summary formatting so operator-facing output remains evidence-shaped even before M1.7 lands.
- `apps/control-plane/src/modules/workspaces/` for local workspace and git execution helpers if the validation path needs safe workspace-root-aware commands.

Expected edit surface for this slice:

- `plans/EP-0008-executor-guardrails-and-validation-hooks.md`
- `docs/ops/codex-app-server.md`
- `docs/ops/local-dev.md`
- `packages/domain/src/replay-event.ts`
- `packages/domain/src/index.ts` only if exports need updating
- `apps/control-plane/src/bootstrap.ts`
- `apps/control-plane/src/modules/evidence/service.ts`
- `apps/control-plane/src/modules/missions/repository.ts`
- `apps/control-plane/src/modules/missions/drizzle-repository.ts`
- `apps/control-plane/src/modules/missions/repository-mappers.ts` only if new artifact-read helpers need parsing support
- `apps/control-plane/src/modules/orchestrator/events.ts`
- `apps/control-plane/src/modules/orchestrator/runtime-phase.ts`
- `apps/control-plane/src/modules/orchestrator/service.spec.ts`
- `apps/control-plane/src/modules/orchestrator/drizzle-service.spec.ts`
- `apps/control-plane/src/modules/runtime-codex/config.ts`
- new small modules under `apps/control-plane/src/modules/runtime-codex/` such as `executor-context.ts` and `executor-prompt.ts`
- new small modules under `apps/control-plane/src/modules/validation/`
- `apps/control-plane/src/modules/workspaces/git-manager.ts` only if validation-safe git helpers belong there
- `packages/testkit/src/runtime/fake-codex-app-server.mjs` only if the executor validation tests need an extra fixture mode

There is no intended change to `WORKFLOW.md`, GitHub App permissions, webhook expectations, approval persistence, or remote network behavior in this slice.

## Plan of Work

First, add a narrow planner-artifact read boundary on the mission repository. The executor runtime path needs one explicit method that can resolve the most relevant planner handoff without teaching the repository a generic artifact-search API. The method should first try the executor task’s dependency task id for a `plan` artifact and then fall back to the latest planner-task `plan` artifact in the same mission, returning enough metadata for prompt assembly and explicit failure messaging.

Next, add executor-specific runtime modules. `executor-context.ts` should gather the mission contract, workspace context, resolved planner artifact body and summary, and a bounded `WORKFLOW.md` excerpt from the workspace root. `executor-prompt.ts` should then build a mutation-capable but tightly scoped executor prompt that states the allowed paths, forbids branch changes and destructive git actions, forbids network and installs, and asks for a concise final report with the required sections. `config.ts` should gain a dedicated executor turn policy builder that uses `workspace-write`, limits writable roots to the task workspace root, disables network, and keeps approval policy compatible with the current pre-M1.6 world.

Then, add local post-turn validation hooks. A small `modules/validation/` surface should collect changed paths via local git diff, enforce the `allowedPaths` boundary when present, and run `git diff --check` inside the workspace root. The hook result should be structured so later milestones can add more checks without rewriting the orchestrator. M1.5 only needs local file and diff validation, not a broad test-runner abstraction.

Finally, wire executor completion behavior through `OrchestratorRuntimePhase`. Successful planner turns should remain unchanged. Successful executor turns should update `mission_tasks.summary` with a concise change and validation summary, but only after planner-artifact resolution succeeds and post-turn validation passes. Missing planner artifacts or failed validation should move the task to `failed` with explicit reasons and leave replay behavior aligned with the existing runtime lifecycle contract. Docs, tests, this plan, and one manual temp-repo acceptance then complete the slice.

## Concrete Steps

Run these commands from the repository root as needed:

    pnpm db:generate
    pnpm db:migrate
    pnpm --filter @pocket-cto/codex-runtime test
    pnpm --filter @pocket-cto/codex-runtime typecheck
    pnpm --filter @pocket-cto/control-plane test
    pnpm --filter @pocket-cto/control-plane typecheck
    pnpm --filter @pocket-cto/control-plane lint

If local execution remains possible after tests, also run one manual acceptance against a temp local git repo using a stub or fake runtime that writes one allowed file and returns a concise final report. Record:

- workspace path
- planner artifact id used as input
- changed paths
- whether validation passed
- resulting task summary
- whether any changed path escaped the allowed-path boundary

Implementation order:

1. Keep this ExecPlan current with the verified executor gap analysis, design decisions, and validation evidence.
2. Add the planner-artifact read path on the mission repository.
3. Add executor context and prompt builders in `runtime-codex/`.
4. Add the executor-specific mutation-capable runtime policy in `runtime-codex/config.ts`.
5. Add the modular validation-hook surface and local git diff checks.
6. Wire executor-specific handoff loading, validation, summary persistence, and task-finalization decisions into `orchestrator/runtime-phase.ts`.
7. Add focused prompt, runtime-policy, validation, and DB-backed integration tests.
8. Update docs and this ExecPlan with exact outcomes and remaining gaps.
9. Run the required validation commands and record exact results.

## Validation and Acceptance

Success for M1.5 is demonstrated when all of the following are true:

1. Executor prompt construction includes the mission objective, mission type, constraints, acceptance criteria, evidence requirements, workspace context, planner artifact body and summary, and a bounded `WORKFLOW.md` excerpt when present.
2. The executor prompt explicitly allows mutation only within the allowed paths and explicitly forbids out-of-scope path changes, branch changes, commits, pushes, merges, rebases, destructive cleanup, network access, installs, and generators.
3. Executor turns use a dedicated `workspace-write` sandbox policy with writable roots restricted to the task workspace root and `networkAccess = false`.
4. Planner and other non-executor roles remain on the current read-only policy and prompt path unless a tiny compatibility adjustment is required.
5. When a relevant planner artifact is missing, the executor task does not silently proceed and instead reaches an explicit failed or blocked outcome that cites the planner-artifact gap.
6. Local validation captures changed paths, enforces the `allowedPaths` boundary when non-empty, fails the task when no files changed, and fails the task on `git diff --check` errors for both tracked and untracked files.
7. Executor validation failures after runtime completion still mark the task terminally and explicitly, with replay-compatible task status changes.
8. Planner evidence persistence failures after runtime completion still mark the planner task terminally, clear `codexTurnId`, and release the workspace lease.
9. Successful executor turns update `mission_tasks.summary` with a concise change and validation summary.
10. No test depends on a real `codex` binary or any remote service.
11. `docs/ops/codex-app-server.md` documents the executor mutation posture and validation-hook behavior, and `docs/ops/local-dev.md` documents how to inspect local executor results if useful.

Manual acceptance should show one executor task in a temp worktree:

- resolving a planner artifact id
- mutating one allowed file inside the task workspace
- passing changed-path and diff-check validation
- persisting a concise non-null executor summary
- making no changes outside the workspace or allowed-path set

## Idempotence and Recovery

This slice should stay additive. If a repository or domain change needs a migration, it must remain additive and safe to rerun locally with `pnpm db:generate` and `pnpm db:migrate`.

Planner-artifact lookup must fail explicitly instead of mutating without handoff. If a task fails because the planner artifact is missing, the safe recovery path is to rerun or repair the planner task so the artifact exists, then retry the executor task in a fresh tick rather than bypassing the handoff.

Validation must be local and deterministic. If a validation hook throws or a git command fails unexpectedly, the task should fail with explicit context rather than partially succeeding. If a task already completed its runtime turn but fails guardrail validation, rerunning the task should start from the persisted workspace state and the visible task summary or replay trail should make the failure diagnosable.

Rollback is straightforward: revert the executor prompt and validation modules together with the orchestrator wiring and any additive domain changes. If a migration is introduced, revert the migration alongside the application code.

## Artifacts and Notes

M1.5 executor gap analysis captured before implementation:

1. Current executor limitation:
   `apps/control-plane/src/modules/orchestrator/runtime-phase.ts` routes executor tasks through `buildReadOnlyTurnInput(...)` and `buildReadOnlyTurnPolicy()`, so executor turns are still explicitly non-mutating and produce no executor-specific summary or validation behavior.
2. Planner-artifact retrieval gap:
   planner `plan` artifacts are written by `apps/control-plane/src/modules/evidence/planner-output.ts`, but there is no read-side repository or evidence method to resolve the latest plan artifact for an executor dependency or mission-level fallback.
3. Guardrail strategy to implement:
   add a narrow plan-artifact lookup method, dedicated executor prompt/context modules, a dedicated executor `workspace-write` turn policy with network disabled, and a modular local validation-hook runner that enforces changed-path allowlists plus `git diff --check` before executor completion is finalized.
4. Initial intended edit surface:
   `packages/domain/src/replay-event.ts`, `apps/control-plane/src/modules/missions/{repository.ts,drizzle-repository.ts}`, `apps/control-plane/src/modules/runtime-codex/{config.ts,executor-context.ts,executor-prompt.ts}`, new `apps/control-plane/src/modules/validation/*`, `apps/control-plane/src/modules/evidence/service.ts`, `apps/control-plane/src/modules/orchestrator/runtime-phase.ts`, related tests, and the two ops docs.

Validation results and manual acceptance evidence will be added here as implementation proceeds.

Post-turn terminalization integrity gap captured before the hardening pass:

1. Current post-turn behavior:
   `handleTurnCompleted(...)` appended `runtime.turn_completed`, cleared `codexTurnId`, ran executor validation or planner evidence persistence, updated task status, and released the workspace lease inside one transaction.
2. Stranding risk:
   a thrown executor validation or planner evidence exception could roll back that transaction and leave the task `running` with the old `codexTurnId`.
3. Executor no-op behavior before hardening:
   a completed executor turn with zero changed paths still passed if `git diff --check` passed.
4. Hardening strategy:
   compute validation and planner-evidence preparation before the final transaction, catch hook exceptions into structured failed validation reports, and if the first finalization attempt throws after runtime completion, perform one fallback failed terminalization instead of leaving the task active.

Controlled failure classification gap captured before implementation:

1. True runtime failures:
   bootstrap, resume, turn-start, or protocol execution failures where the task has not already been deterministically terminalized stay on the `runtime_failed` path.
2. Controlled failures that were misclassified:
   the executor missing-planner-artifact path already marked the task `failed` with explicit summary and replay reason, but still surfaced from the worker as `runtime_failed` because `executeTaskTurn(...)` treated every thrown error the same way.
3. Narrow classification strategy:
   after a caught turn-execution exception, the orchestrator now reloads the latest task and returns `task_failed` when that task is already `failed` and `codexTurnId` is clear; otherwise it returns `runtime_failed`.
4. Expected worker-log effect:
   controlled policy failures are logged separately from runtime crashes so later metrics and M1.6 approval handling can trust the distinction.

Validation results captured after implementation:

- `pnpm db:generate` passed with `No schema changes, nothing to migrate`.
- `pnpm db:migrate` passed.
- `pnpm --filter @pocket-cto/codex-runtime test` passed with 5 tests.
- `pnpm --filter @pocket-cto/codex-runtime typecheck` passed.
- `pnpm --filter @pocket-cto/control-plane test` passed with 50 tests.
- `pnpm --filter @pocket-cto/control-plane typecheck` passed after refreshing `@pocket-cto/domain` declarations with `pnpm --filter @pocket-cto/domain build`.
- `pnpm --filter @pocket-cto/control-plane lint` passed.

Manual acceptance captured after implementation:

- command: `pnpm exec tsx <<'EOF' ... manual temp-repo executor harness ... EOF` from `apps/control-plane`
- workspace path: `/private/var/folders/41/pj1kw0tj2xd832wl_62gn73m0000gn/T/pocket-cto-workspaces-EvMrks/5a5bc4d8-61f9-412f-aa4f-acd0c1cabe6c/1-executor`
- planner artifact id used as input: `8ed2280a-21ee-45f8-8ab2-ca908bbea47d`
- changed paths: `README.md`
- validation passed: `true`
- task summary: `Apply the planner handoff to README.md inside the allowed workspace root. Validation passed for README.md and a clean git diff check.`
- changed paths escaping the allowlist: none
- command: `pnpm exec tsx <<'EOF' ... manual no-op executor and planner-evidence-failure harness ... EOF` from `apps/control-plane`
- manual no-op executor result:
  - workspace path: `/private/var/folders/41/pj1kw0tj2xd832wl_62gn73m0000gn/T/pocket-cto-workspaces-tbuEXV/42b9a582-7e74-4fa1-a603-1f8fe58dd354/1-executor`
  - final task status: `failed`
  - final reason: `executor_no_changes`
  - `codexTurnId` after completion: `null`
  - workspace lease: released (`isActive = false`, `leaseOwner = null`)
  - stranded after completion: `false`
- manual planner evidence failure result:
  - workspace path: `/private/var/folders/41/pj1kw0tj2xd832wl_62gn73m0000gn/T/pocket-cto-workspaces-fCpOSI/bad2b7f0-2d23-4fbb-a4e3-4a4c1084cb88/0-planner`
  - final task status: `failed`
  - final reason: `planner_evidence_failed`
  - `codexTurnId` after completion: `null`
  - workspace lease: released (`isActive = false`, `leaseOwner = null`)
  - stranded after completion: `false`

## Interfaces and Dependencies

Important interfaces for this slice:

- `MissionRepository` in `apps/control-plane/src/modules/missions/repository.ts`
- `OrchestratorRuntimePhase` in `apps/control-plane/src/modules/orchestrator/runtime-phase.ts`
- `CodexRuntimeService` in `apps/control-plane/src/modules/runtime-codex/service.ts`
- `WorkspaceService` and `LocalWorkspaceGitManager` in `apps/control-plane/src/modules/workspaces/`
- `ReplayService` in `apps/control-plane/src/modules/replay/service.ts`
- `EvidenceService` in `apps/control-plane/src/modules/evidence/service.ts`

Important domain and persistence interfaces:

- `MissionTaskRecord` in `packages/domain/src/mission-task.ts`
- `TaskStatusChangeReasonSchema` and runtime replay payloads in `packages/domain/src/replay-event.ts`
- `ArtifactRecord` and `ProofBundleManifest` in `packages/domain/src/proof-bundle.ts`
- `artifacts` in `packages/db/src/schema/artifacts.ts`
- `replay_events` in `packages/db/src/schema/replay.ts`

Important libraries and tools:

- `zod`
- `drizzle-orm`
- `vitest`
- Node `child_process` or existing git helpers for local validation commands
- local git worktrees only; no remote network access

Environment and policy notes:

- no new required environment variables are expected
- executor turns must keep `networkAccess = false`
- approval persistence is still deferred to M1.6
- richer runtime-to-evidence artifact plumbing is still deferred to M1.7

## Outcomes & Retrospective

M1.5 landed as a narrow executor execution slice instead of a generic “make the runtime writable” step.
Pocket CTO now resolves a planner `plan` artifact before executor execution, feeds that artifact into a dedicated executor prompt, runs the executor turn with a workspace-rooted `workspaceWrite` policy, and then validates the resulting local diff before deciding whether the task actually succeeded.

The most important lifecycle change is that runtime completion is no longer the whole success condition for executor tasks.
Replay still records the existing runtime turn structure, but final task status now depends on local guardrails too.
If the planner handoff is missing, the executor task fails fast with `executor_missing_planner_artifact`.
That controlled pre-turn failure now surfaces from the worker as `task_failed` rather than `runtime_failed`, keeping worker output honest about business-policy failures versus actual runtime crashes.
If the runtime turn completes but local validation fails, the executor task ends `failed` with `executor_validation_failed`.
If the runtime turn completes but changes nothing, the executor task now ends `failed` with `executor_no_changes`.
If validation passes, the executor task ends `succeeded` and stores a concise `mission_tasks.summary` that names the intended change and validation result.

Post-turn terminalization is now also safer for later milestones to build on.
Planner evidence persistence and executor validation no longer have to succeed inside the same narrow transaction that clears `codexTurnId`.
If planner evidence persistence still throws after a completed planner turn, Pocket CTO now marks the task `failed` with `planner_evidence_failed` instead of leaving it `running`.
If a validation hook throws, the hook result is recorded as a structured failed validation check and the executor task still terminalizes cleanly.

The new local validation surface is intentionally small:

- changed-path capture from local git state
- allowlist enforcement against `mission.spec.constraints.allowedPaths`
- `git diff --check`

That keeps the boundary future-extensible without turning M1.5 into a generic CI runner or artifact-plumbing milestone.
Planner behavior remains read-only and unchanged apart from the shared workflow-policy loader.

Validation passed for the required package and repo commands, and one manual temp-repo acceptance proved the end-to-end executor path with a stub runtime writing a single allowed file in an isolated worktree.

The remaining gaps are now crisp:

- M1.6 still needs approval persistence for any runtime approval or escalation path.
- M1.7 still needs richer runtime-to-evidence artifact plumbing beyond the current planner `plan` artifact and executor task summary.
