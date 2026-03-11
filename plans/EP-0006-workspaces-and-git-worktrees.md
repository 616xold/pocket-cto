# EP-0006 - Persist isolated task workspaces and local git worktrees

This ExecPlan is a living document. Keep `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` current.

## Purpose / Big Picture

After this submilestone, a claimed task in Pocket CTO will no longer execute from the control-plane process directory.
Before runtime bootstrap or turn execution, the worker will ensure that task has one persisted workspace record, one deterministic local git worktree, one deterministic local branch name, and an explicit lease.
The runtime will use that workspace root as `cwd`, so later M1.4 planner turns and M1.5 executor turns inherit an isolated place to inspect and eventually change files safely.

The operator-visible proof is narrow and concrete.
A queued mission processed by one worker tick should create and persist a workspace for the claimed task, populate `mission_tasks.workspace_id`, create a matching local git worktree under `WORKSPACE_ROOT`, start the current read-only same-session first turn from that workspace path, and release the workspace lease when the task reaches a terminal state without deleting the worktree.

## Progress

- [x] (2026-03-11T00:00Z) Read the required repo instructions, active roadmap and ExecPlans, state-machine and replay docs, local-dev and Codex runtime ops docs, schema files, and the current control-plane mission, orchestrator, and runtime modules for the M1.3 workspace slice.
- [x] (2026-03-11T00:00Z) Verified the local git and worktree environment before coding with `git --version`, `git worktree list`, `git rev-parse --show-toplevel`, and a temporary `git worktree add --detach ...` plus `git worktree remove --force ...` round-trip. The current checkout can create and remove local worktrees successfully.
- [x] (2026-03-11T00:18Z) Added a dedicated `modules/workspaces/` bounded context with deterministic naming, repo-root resolution, isolated git worktree management, DB-backed workspace persistence, task linkage, and explicit lease semantics.
- [x] (2026-03-11T00:18Z) Wired workspace acquisition into the orchestrator before runtime bootstrap or turn execution, passed `workspace.rootPath` as runtime `cwd`, recorded bootstrap `cwd` in `runtime.thread_started`, and released workspace leases on terminal task completion while keeping worktrees on disk.
- [x] (2026-03-11T00:18Z) Added a temp-git-repo workspace service test plus expanded DB-backed control-plane tests for deterministic workspace creation, runtime `cwd` propagation, same-task workspace reuse after a failed tick, and terminal lease release.
- [x] (2026-03-11T00:18Z) Ran `pnpm db:generate`, `pnpm db:migrate`, `pnpm --filter @pocket-cto/control-plane test`, `pnpm --filter @pocket-cto/control-plane typecheck`, and `pnpm --filter @pocket-cto/control-plane lint`, then completed one manual local temp-repo acceptance and recorded the observed workspace and runtime `cwd` below.
- [x] (2026-03-11T01:54Z) Corrected M1.3 workspace-root safety so the default dogfooding root resolves to a sibling `<repo>.workspaces` directory outside the source repo, rejects equal or nested workspace roots clearly, and updated docs plus `.env.example` to match the actual runtime behavior.
- [x] (2026-03-11T01:54Z) Audited `mission_tasks.workspace_id` linkage and deferred the reverse DB foreign key because the current `workspaces.task_id -> mission_tasks.id` relationship would make it a cyclic-FK migration for a narrow M1.3 polish pass; added a focused repository invariant test instead.

## Surprises & Discoveries

- Observation: The schema already has a `workspaces` table and `mission_tasks.workspace_id`, but there is no control-plane module that persists or uses them.
  Evidence: `packages/db/src/schema/missions.ts`, `apps/control-plane/src/modules/workspaces/README.md`, and the absence of workspace lookups in `apps/control-plane/src/modules/orchestrator/` or `apps/control-plane/src/modules/runtime-codex/`.

- Observation: M1.2 still resolves runtime defaults with `process.cwd()`, so fresh same-session thread bootstrap and turn execution both inherit the control-plane process directory today.
  Evidence: `apps/control-plane/src/bootstrap.ts` passes `process.cwd()` to `resolveCodexThreadDefaults(...)`, and the current test fixtures assert `cwd: process.cwd()`.

- Observation: This checkout is itself a git worktree and already has several sibling worktrees, but local add/remove behavior still works.
  Evidence: `git worktree list` showed the main repo plus detached temp worktrees, and the temporary add/remove probe completed successfully at `/tmp/pocket-cto-worktree-check-gfl8d5`.

- Observation: The repo docs already reserve `apps/control-plane/src/modules/workspaces/` as the bounded context for isolated workspace lifecycle, so adding workspace logic anywhere else would dilute the published repo map.
  Evidence: `docs/architecture/repo-map.md`, `docs/architecture/security-model.md`, and `apps/control-plane/src/modules/workspaces/README.md`.

- Observation: On this macOS environment, temp paths under `/var/...` are canonicalized by Git to `/private/var/...`, so worktree verification and test assertions must compare canonical realpaths instead of raw `resolve(...)` output.
  Evidence: the first workspace-manager test failed until `LocalWorkspaceGitManager` and the temp-repo helpers normalized paths through `realpath(...)`, after which both workspace and DB-backed integration tests passed.

- Observation: The first M1.3 pass left `WORKSPACE_ROOT` defaulted to `.workspaces` and resolved it from `process.cwd()`, which makes dogfooding create worktrees inside the same repo checkout that is being used as the source repo.
  Evidence: `.env.example` set `WORKSPACE_ROOT=.workspaces`, and `apps/control-plane/src/modules/workspaces/config.ts` previously called `resolve(processCwd, env.WORKSPACE_ROOT)`.

## Decision Log

- Decision: Keep workspace orchestration in a dedicated `modules/workspaces/` bounded context with separate repository, service, git-manager, and naming modules.
  Rationale: This preserves the modular architecture rules from `AGENTS.md` and keeps git command execution out of orchestrator and runtime code.
  Date/Author: 2026-03-11 / Codex

- Decision: Support exactly one local source repo root in M1.3, resolved from `POCKET_CTO_SOURCE_REPO_ROOT` or else from `git rev-parse --show-toplevel` for the current dogfooding checkout.
  Rationale: The prompt explicitly forbids starting GitHub integration here. A single explicit local repo root is the narrowest design that unblocks workspace isolation without inventing clone or registry behavior early.
  Date/Author: 2026-03-11 / Codex

- Decision: Use deterministic workspace paths `WORKSPACE_ROOT/<missionId>/<task.sequence>-<task.role>` and deterministic branch names `pocket-cto/<missionId>/<task.sequence>-<task.role>`.
  Rationale: Deterministic names make the path idempotent, easy to inspect manually, and stable enough for later planner or executor prompts and artifact association.
  Date/Author: 2026-03-11 / Codex

- Decision: Persist one workspace row per task and make reacquisition idempotent for the same task while the lease is still owned by the current worker owner.
  Rationale: The prompt requires one workspace per task and explicit future-upgradable lease semantics, but a single-worker owner model is sufficient for v1 if the persisted shape is already explicit.
  Date/Author: 2026-03-11 / Codex

- Decision: Do not add a new replay event for workspace creation or lease release in this slice.
  Rationale: The replay requirement applies to mission and task state changes. Workspace acquisition and lease release are infrastructural support for the existing M1.2 task lifecycle, so they will stay persisted in relational state and documented here instead of widening the replay contract prematurely.
  Date/Author: 2026-03-11 / Codex

- Decision: Keep worktrees on disk after lease release and after terminal task completion.
  Rationale: M1.4 and M1.5 still need those directories for inspection and later file-changing work. The prompt explicitly prefers retention over cleanup in this slice.
  Date/Author: 2026-03-11 / Codex

- Decision: Canonicalize temp git repo and workspace paths through `realpath(...)` when verifying local worktrees in tests and git-manager checks.
  Rationale: macOS temp paths can surface as `/var/...` while Git reports `/private/var/...`; comparing canonical paths keeps the deterministic-path contract intact without weakening verification.
  Date/Author: 2026-03-11 / Codex

- Decision: Treat blank or unset `WORKSPACE_ROOT` as a request for a safe sibling directory outside the source repo and resolve relative `WORKSPACE_ROOT` values from the source repo parent directory, not from `process.cwd()`.
  Rationale: Dogfooding must not create worktrees inside the source checkout by default. A sibling `<repo-name>.workspaces` directory keeps the one-repo pre-M2 model intact while making the isolation boundary explicit and local-only.
  Date/Author: 2026-03-11 / Codex

- Decision: Defer a DB-level foreign key from `mission_tasks.workspace_id` to `workspaces.id` in M1.3 and enforce the linkage with repository writes plus an invariant test instead.
  Rationale: `workspaces.task_id` already references `mission_tasks.id`. Adding the reverse FK in this slice would introduce a cyclic-FK migration and schema-definition complication that is not justified by this narrow safety fix.
  Date/Author: 2026-03-11 / Codex

## Context and Orientation

Pocket CTO already persists missions, mission tasks, proof-bundle placeholders, and replay events.
M1.1 added Codex thread bootstrap and M1.2 added same-session first-turn execution plus structural runtime replay.
That means the current worker can claim tasks, start or recover runtime threads, run one read-only turn, and update mission or task status, but it still runs from the control-plane process root instead of a task-isolated workspace.

This M1.3 slice fills that gap and only that gap.
It must not widen into GitHub App repo lookup, planner prompt design, executor mutation guardrails, approval persistence, PR creation, or artifact emission beyond the replay already present from M1.2.

The relevant repository boundaries are:

- `packages/domain/` for pure task or workspace contracts if a shared type is needed.
- `packages/db/` for additive schema changes only.
- `packages/config/` for env parsing of `POCKET_CTO_SOURCE_REPO_ROOT` and `WORKSPACE_ROOT`.
- `apps/control-plane/src/modules/workspaces/` for workspace naming, repo-root resolution, git command execution, repository persistence, and lease semantics.
- `apps/control-plane/src/modules/orchestrator/` for lifecycle order only: ensure workspace before runtime, preserve claimed-task recovery precedence, and release the lease on terminal completion.
- `apps/control-plane/src/modules/runtime-codex/` for runtime policy and transport only. It should receive `cwd`, not discover worktrees itself.

Platform assumptions for this plan:

- Current environment is macOS with Apple Git `2.50.1`.
- The checkout root resolved by `git rev-parse --show-toplevel` is `/Users/sohaib/Downloads/pocket-cto-starter`.
- Local git worktrees can be created and removed from this checkout.
- Pre-M2, Pocket CTO manages exactly one local source repo root and never fetches or clones from a remote.
- `WORKSPACE_ROOT` may be relative in env, but the resolved workspace root must remain outside the source repo root and inside the chosen external workspace-root directory.

Expected edit surface for this slice:

- `plans/EP-0006-workspaces-and-git-worktrees.md`
- `docs/ops/local-dev.md`
- `docs/ops/codex-app-server.md` only if the `cwd` contract needs clarification
- `packages/config/src/index.ts`
- `packages/db/src/schema/missions.ts`
- `packages/domain/src/mission-task.ts`
- `packages/domain/src/index.ts` and possibly a new `packages/domain/src/workspace.ts`
- new modules under `apps/control-plane/src/modules/workspaces/`
- `apps/control-plane/src/bootstrap.ts`
- `apps/control-plane/src/lib/types.ts`
- `apps/control-plane/src/modules/missions/repository.ts`
- `apps/control-plane/src/modules/missions/drizzle-repository.ts`
- `apps/control-plane/src/modules/missions/repository-mappers.ts`
- `apps/control-plane/src/modules/orchestrator/service.ts`
- `apps/control-plane/src/modules/orchestrator/runtime-phase.ts`
- `apps/control-plane/src/modules/orchestrator/worker.ts`
- `apps/control-plane/src/modules/orchestrator/service.spec.ts`
- `apps/control-plane/src/modules/orchestrator/drizzle-service.spec.ts`
- `apps/control-plane/src/test/database.ts`

There is no intended change to GitHub App permissions, webhook expectations, stack packs, approval persistence, planner prompts, or executor prompts in this slice.

## Plan of Work

First, add the new control-plane workspace bounded context.
That module needs explicit naming helpers for workspace paths and branch names, a repo-root resolver for the single local source repo assumption, a git manager that runs `git worktree` and `git branch` commands safely, and a repository that persists workspace rows plus the `mission_tasks.workspace_id` linkage.
The design should keep git shelling isolated from repositories and from the orchestrator.

Next, make workspace acquisition idempotent and future-upgradable.
For a claimed task, the worker should ask the workspace service to ensure a workspace exists and is leased before any runtime bootstrap or turn logic runs.
If the workspace row already exists for that task and still points at the deterministic path and branch, reacquire or refresh the lease instead of creating a duplicate.
If the on-disk worktree does not exist yet, create it from the resolved single source repo root.

Then, wire workspace `cwd` into the current M1.2 runtime path.
`OrchestratorRuntimePhase` should load the required workspace and pass `workspace.rootPath` into `CodexRuntimeService.runTurn(...)`.
That preserves current same-session first-turn bootstrap because the fresh-thread path in `CodexRuntimeService` already uses the provided `cwd` for `thread/start` and then reuses that thread for `turn/start` in the same session.
The resumed-thread and replacement-thread paths should use the same workspace root.

Finally, release the workspace lease when a task reaches a terminal status, but keep the row and worktree on disk.
Add DB-backed tests that use a temp git repo and the fake app-server fixture to prove deterministic workspace persistence, runtime `cwd` propagation, idempotent reacquisition across ticks, and lease release on completion.
Update local-dev docs with the temporary single-source-repo assumption and how to inspect the resulting worktrees.

## Concrete Steps

Run these commands from the repository root as needed:

    git --version
    git worktree list
    git rev-parse --show-toplevel
    tmpdir=$(mktemp -d /tmp/pocket-cto-worktree-check-XXXXXX) && git worktree add --detach "$tmpdir" HEAD && git worktree remove "$tmpdir" --force
    pnpm db:generate
    pnpm db:migrate
    pnpm --filter @pocket-cto/control-plane test
    pnpm --filter @pocket-cto/control-plane typecheck
    pnpm --filter @pocket-cto/control-plane lint

If local execution remains possible after tests, also run one manual acceptance against a temp local git repo using the fake app-server fixture and record:

- workspace id
- workspace path
- branch name
- lease owner
- lease expiry
- runtime `cwd` observed during bootstrap or turn execution

Implementation order:

1. Draft and keep this ExecPlan current.
2. Add additive schema support for workspace uniqueness or linkage if needed.
3. Implement `modules/workspaces/` with naming, repo-root resolution, git-manager, repository, and service modules.
4. Integrate workspace acquisition into the orchestrator before runtime bootstrap or turn execution.
5. Pass persisted workspace `rootPath` as runtime `cwd`.
6. Release the workspace lease when the task reaches a terminal state.
7. Add focused in-memory or unit tests for naming or service logic, plus DB-backed integration tests with a temp git repo.
8. Run migrations, tests, typecheck, and lint.
9. Update docs and this ExecPlan with exact evidence and remaining gaps.

## Validation and Acceptance

Success for M1.3 is demonstrated when all of the following are true:

1. A claimed task gets a persisted workspace record before runtime bootstrap or turn execution begins.
2. The workspace record includes a deterministic `rootPath`, deterministic `branchName`, explicit `leaseOwner`, explicit `leaseExpiresAt`, and `isActive = true`.
3. `mission_tasks.workspace_id` is populated for that task.
4. The workspace path lives under `WORKSPACE_ROOT/<missionId>/<task.sequence>-<task.role>`.
5. A real local git worktree exists at that path and is attached to the resolved single source repo root.
6. The branch name follows `pocket-cto/<missionId>/<task.sequence>-<task.role>`.
7. A second worker tick reuses the same workspace record and the same worktree instead of creating a duplicate.
8. Runtime bootstrap and turn execution receive the workspace path as `cwd`, not the control-plane process root.
9. Task terminal completion releases the lease by clearing or deactivating the persisted lease fields without deleting the workspace row or removing the worktree.
10. Claimed-task recovery precedence from M1.2 still holds: recover claimed tasks first, then claim fresh work.
11. No test depends on GitHub or a remote repository.

Manual acceptance should look like:

- create a temp local git repo with one initial commit
- point `POCKET_CTO_SOURCE_REPO_ROOT` at that repo
- create a mission
- run one worker tick
- inspect the workspace record, the on-disk worktree, and the runtime-observed `cwd`

The expected proof is that one claimed planner task has both runtime replay from M1.2 and a durable workspace record tied to the deterministic local worktree.

## Idempotence and Recovery

Workspace creation must be safe to retry.
If the workspace row already exists for the task and the on-disk worktree is still present, the service should refresh or reacquire the lease instead of creating another row or another worktree.
If the row exists but the task already owns the active lease, reacquisition should be a no-op apart from lease refresh.

The migration path must remain additive.
If schema generation or migration fails, fix the schema and rerun `pnpm db:generate` and `pnpm db:migrate`.
Do not delete existing workspace rows manually unless local development data is being reset intentionally.

If worktree creation fails after the DB row is inserted but before the task executes, the worker should fail that tick without claiming fresh work for another task.
Because the task remains claimed, the same claimed-task recovery path can retry workspace creation on the next deterministic tick.
Rollback for this slice is straightforward: revert the workspace-module integration and additive schema changes together, then rerun the control-plane validation commands.

## Artifacts and Notes

Environment verification captured before implementation:

- `git --version` -> `git version 2.50.1 (Apple Git-155)`
- `git worktree list` showed `/Users/sohaib/Downloads/pocket-cto-starter` on branch `codex/next-push-ci` plus several detached temp worktrees
- `git rev-parse --show-toplevel` -> `/Users/sohaib/Downloads/pocket-cto-starter`
- temporary worktree probe:
  - command: `tmpdir=$(mktemp -d /tmp/pocket-cto-worktree-check-XXXXXX) && git worktree add --detach "$tmpdir" HEAD && git worktree remove "$tmpdir" --force`
  - result: success at `/tmp/pocket-cto-worktree-check-gfl8d5`

Replay and evidence notes for this slice:

- Existing M1.2 replay remains the execution narrative source of truth.
- Workspace persistence is an execution precondition, not a new mission or task state machine step.
- Manual acceptance evidence must include the workspace record identity, deterministic path, branch name, lease fields, and observed runtime `cwd`.

Validation results captured after the first M1.3 implementation:

- `pnpm db:generate` passed and generated `packages/db/drizzle/0004_wet_thor_girl.sql`.
- `pnpm db:migrate` passed against the local development database.
- `pnpm --filter @pocket-cto/control-plane test` passed with 21 tests, including the new temp-repo workspace service test and the DB-backed workspace/runtime assertions.
- `pnpm --filter @pocket-cto/control-plane typecheck` initially failed on stale referenced package declarations after adding `POCKET_CTO_SOURCE_REPO_ROOT` and `runtime.thread_started.payload.cwd`; rebuilding `@pocket-cto/config`, `@pocket-cto/domain`, and `@pocket-cto/db` resolved that drift, after which the required control-plane typecheck command passed.
- `pnpm --filter @pocket-cto/control-plane lint` passed.

Validation results captured after the workspace-root safety correction:

- `pnpm db:generate` passed with `No schema changes, nothing to migrate`.
- `pnpm db:migrate` passed.
- `pnpm --filter @pocket-cto/control-plane test` passed with 26 tests, including the new workspace-config and workspace-repository invariant coverage.
- `pnpm --filter @pocket-cto/control-plane typecheck` passed.
- `pnpm --filter @pocket-cto/control-plane lint` passed.
- Manual acceptance with blank `WORKSPACE_ROOT` and a temp local source repo resolved:
  - source repo root: `/private/var/folders/41/pj1kw0tj2xd832wl_62gn73m0000gn/T/pocket-cto-source-repo-SfGskJ`
  - workspace root: `/private/var/folders/41/pj1kw0tj2xd832wl_62gn73m0000gn/T/pocket-cto-source-repo-SfGskJ.workspaces`
  - workspace path: `/private/var/folders/41/pj1kw0tj2xd832wl_62gn73m0000gn/T/pocket-cto-source-repo-SfGskJ.workspaces/11111111-1111-4111-8111-111111111111/0-planner`
  - branch name: `pocket-cto/11111111-1111-4111-8111-111111111111/0-planner`
  - workspace root outside source repo: `true`

Manual acceptance evidence captured on 2026-03-11 against a temp local git repo:

- workspace id: `9cfdb7bc-936d-4bec-9783-59288542feef`
- workspace path: `/private/var/folders/41/pj1kw0tj2xd832wl_62gn73m0000gn/T/pocket-cto-workspaces-1SpZRb/4f1e88d7-ae69-44d6-9280-625ec514450f/0-planner`
- branch name: `pocket-cto/4f1e88d7-ae69-44d6-9280-625ec514450f/0-planner`
- lease owner: `pocket-cto-worker:manual:1`
- lease expiry: `2026-03-11T00:19:41.349Z`
- runtime `cwd`: `/private/var/folders/41/pj1kw0tj2xd832wl_62gn73m0000gn/T/pocket-cto-workspaces-1SpZRb/4f1e88d7-ae69-44d6-9280-625ec514450f/0-planner`

Handoff notes to later milestones:

- M1.3 ends once isolated workspaces and worktrees exist and runtime `cwd` is correct.
- M1.4 still needs real planner prompts and planner output handling.
- M1.5 still needs executor mutation guardrails and file-changing behavior inside the isolated worktree.

## Interfaces and Dependencies

Important interfaces and modules for this slice:

- `EnvSchema` and `loadEnv()` in `packages/config/src/index.ts`
- `missions`, `mission_tasks`, and `workspaces` in `packages/db/src/schema/missions.ts`
- `MissionTaskRecord` in `packages/domain/src/mission-task.ts`
- new workspace contracts or repository types under `apps/control-plane/src/modules/workspaces/`
- `MissionRepository` in `apps/control-plane/src/modules/missions/repository.ts`
- `OrchestratorService` and `OrchestratorRuntimePhase` in `apps/control-plane/src/modules/orchestrator/`
- `CodexRuntimeService` in `apps/control-plane/src/modules/runtime-codex/service.ts`

Important environment variables:

- existing `WORKSPACE_ROOT`
- new `POCKET_CTO_SOURCE_REPO_ROOT`
- existing Codex runtime env vars already used by M1.2

Important local dependencies and tools:

- `git` CLI for worktree and branch management
- `drizzle-orm` for workspace persistence
- `vitest` for focused DB-backed and unit tests
- the fake Codex App Server fixture in `packages/testkit/src/runtime/fake-codex-app-server.mjs`

## Outcomes & Retrospective

M1.3 landed as the intended narrow isolation slice.
Every claimed task now gets one persisted workspace row, one deterministic git worktree and branch, an explicit lease, and a runtime `cwd` that points at that workspace instead of the control-plane process directory.
The worker preserves the M1.2 claimed-task recovery order, ensures workspace state before any runtime bootstrap or turn execution, records the bootstrap `cwd` in replay, and releases the workspace lease on terminal completion without deleting the worktree.
The follow-up safety correction moves the default dogfooding workspace root outside the source repo, aligns `.env.example` and ops docs with that behavior, and makes nested workspace roots a clear configuration error instead of an accidental default.
The `mission_tasks.workspace_id` reverse FK remains deferred for now; repository writes plus a focused invariant test keep the linkage explicit without forcing a cyclic schema dependency into this slice.

What remains is the work the prompt explicitly deferred:

- M1.4 still needs real planner prompts and planner-output handling inside these isolated workspaces.
- M1.5 still needs executor guardrails and controlled file mutation inside the existing worktree substrate.

The filesystem-isolation spine for those later milestones is now in place and verified.
