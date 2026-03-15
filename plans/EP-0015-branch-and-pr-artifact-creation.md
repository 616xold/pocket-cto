# EP-0015 - Publish executor branches and draft PR artifacts

This ExecPlan is a living document. Keep `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` current.

## Purpose / Big Picture

After this slice, a successful executor run does not stop at local workspace validation.
Pocket CTO can take the validated task worktree, publish it to the correct GitHub repository through the configured GitHub App installation, open a draft pull request against the registry default branch, and persist that PR link as durable evidence.
The operator-visible proof is still intentionally narrow and backend-first: executor success now yields a real `pr_link` artifact in the mission artifact ledger and that artifact is linked from the proof bundle manifest.

This plan covers roadmap submilestone `M2.4 branch and PR artifact creation`.
It depends on the GitHub App auth and installation model from `plans/EP-0012-github-app-auth-and-installation-persistence.md`, the webhook and installation-link durability from `plans/EP-0013-webhook-signature-and-idempotent-ingress.md`, and the repository registry plus write-target resolution from `plans/EP-0014-repository-registry-and-repo-sync.md`.
It does not implement issue-to-mission intake, merge automation, approval cards, or the later M2.5 proof-bundle assembly slice.

## Progress

- [x] (2026-03-15T20:22Z) Read the required repo docs, adjacent GitHub milestone plans, relevant DB and domain files, current GitHub App module, workspace or validation or orchestrator or evidence paths, and the exact requested inspections: `rg -n "pr_link|branch|pull request|draft PR|proofBundle|artifact.created|syncInstallationRepositories|repositories" packages apps docs`, `git status --short`, and `git diff --name-only HEAD`.
- [x] (2026-03-15T20:22Z) Captured the M2.4 gap honestly: the repository registry can already resolve one writable repo and task workspaces already have deterministic branches and isolated git worktrees, but there is still no dedicated GitHub write path for commit or push or draft-PR creation and no `pr_link` artifact persistence.
- [x] (2026-03-15T20:35Z) Added the dedicated GitHub publish path under `apps/control-plane/src/modules/github-app/` with a local git write client, deterministic commit or PR formatter, publish service, and focused specs for success, repo-state failure, branch-exists failure, push failure, PR creation failure, and secure transport behavior without tokenized remotes or `gh`.
- [x] (2026-03-15T20:40Z) Wired the publish step into executor completion, added explicit `executor_publish_failed` replay reasoning, persisted `pr_link` artifacts with compact `artifact.created` replay, and linked those artifacts into the proof bundle manifest without widening into full M2.5 bundle assembly.
- [x] (2026-03-15T20:44Z) Added the DB-backed orchestrator spec that proves a successful executor run can commit, push, create a draft PR through mocked GitHub write services, persist the `pr_link` artifact, and expose that artifact through the proof bundle.
- [x] (2026-03-15T20:46Z) Updated `docs/ops/local-dev.md` and `README.md`, ran the requested validation commands successfully, rebuilt `@pocket-cto/domain` so the new replay reason propagated to downstream typecheck, and completed one live smoke against `616xold/pocket-cto` that created draft PR `#19` and persisted artifact `210e102d-0ee3-4eb2-bb13-1640b5480e92`.

## Surprises & Discoveries

- Observation: the working tree already contains uncommitted M2.3 write-readiness changes in the GitHub App module and associated specs or docs.
  Evidence: `git status --short` and `git diff --name-only HEAD` show modified `github-app` module files, specs, `docs/ops/local-dev.md`, and `plans/EP-0014-repository-registry-and-repo-sync.md` before M2.4 starts.

- Observation: the current executor prompt explicitly forbids commits, pushes, merges, rebases, and related git write actions inside the model turn.
  Evidence: `apps/control-plane/src/modules/runtime-codex/executor-prompt.ts`.

- Observation: the workspace branch naming rule already matches the preferred M2.4 deterministic format.
  Evidence: `apps/control-plane/src/modules/workspaces/naming.ts` builds `pocket-cto/<missionId>/<task.sequence>-<task.role>`.

- Observation: the proof bundle manifest and artifact schema already support `pr_link`, so this milestone likely does not need a DB schema change if all PR data lives in additive artifact metadata.
  Evidence: `packages/db/src/schema/artifacts.ts` and `packages/domain/src/proof-bundle.ts`.

- Observation: the current stub text compiler still emits `spec.repos = ["web"]`, so a true live smoke had to seed mission repo context explicitly with a synced full repository name instead of relying on manual-text compilation alone.
  Evidence: `apps/control-plane/src/modules/missions/compiler.ts` and the live smoke used `primaryRepo = "616xold/pocket-cto"` explicitly.

- Observation: because runtime artifacts and the PR artifact both update the proof bundle manifest in place, PR-link persistence must read the latest manifest after runtime-artifact persistence or it risks overwriting the newer artifact ids.
  Evidence: the first implementation draft passed the original proof-bundle snapshot into PR-link persistence, which would have dropped the just-persisted runtime artifact ids until the flow was changed to fetch the current manifest inside the completion transaction.

## Decision Log

- Decision: keep git network writes inside a dedicated GitHub App write module rather than extending the workspace git manager or leaking git push logic into orchestrator or evidence code.
  Rationale: the prompt explicitly requires network writes to stay in a dedicated GitHub write module, and the existing workspace manager should remain focused on local worktree lifecycle only.
  Date/Author: 2026-03-15 / Codex

- Decision: reuse the existing deterministic task branch `pocket-cto/<missionId>/<task.sequence>-<task.role>` as the remote head branch and fail explicitly if that branch already exists on the remote.
  Rationale: the branch name is already stable and truthful for the task, and failing on pre-existing remote branches keeps the first version simple and auditable.
  Date/Author: 2026-03-15 / Codex

- Decision: resolve the publish target from `mission.primaryRepo` and delegate final repository-state checks to the existing repository-registry write-target resolver.
  Rationale: M2.3 already established the repository registry as the source of truth and added explicit inactive or archived or disabled or installation-unavailable failures, so M2.4 should reuse that boundary instead of duplicating policy.
  Date/Author: 2026-03-15 / Codex

- Decision: perform the publish step after local executor validation but before final task persistence, and treat push or PR failures as honest executor-task failures.
  Rationale: GitHub side effects cannot be rolled back transactionally, so the cleanest truthful model is to run publish outside the DB transaction, then persist task success or failure plus evidence according to the external outcome.
  Date/Author: 2026-03-15 / Codex

- Decision: persist the PR as a `pr_link` artifact with additive metadata and append a compact `artifact.created` replay event, while keeping proof-bundle enrichment conservative.
  Rationale: the replay contract already treats artifacts as the durable evidence surface, and M2.5 can build richer manifest assembly later without M2.4 overfitting summaries prematurely.
  Date/Author: 2026-03-15 / Codex

- Decision: keep one compact executor failure reason `executor_publish_failed` for all publish-stage failures and put the detailed distinction into the persisted summary and artifact evidence instead of adding several new replay branches.
  Rationale: the prompt asks to keep replay compact, while the summary and `log_excerpt` evidence can still distinguish branch-preflight or push or PR-creation failure honestly.
  Date/Author: 2026-03-15 / Codex

- Decision: use a process-local `GIT_CONFIG_*` extraheader with `Authorization: Basic <base64(x-access-token:token)>` for HTTPS pushes and avoid tokenized remote URLs.
  Rationale: this keeps the installation token out of git config on disk, out of remotes, and out of logged command arguments while still using ordinary `git push`.
  Date/Author: 2026-03-15 / Codex

## Context and Orientation

Pocket CTO already has the three foundations M2.4 needs.

First, the GitHub App bounded context under `apps/control-plane/src/modules/github-app/` can mint installation tokens, sync installations and repository registry rows, and resolve one writable repository from durable registry state.
The key files are `client.ts`, `service.ts`, `repository.ts`, `drizzle-repository.ts`, `types.ts`, `schema.ts`, `formatter.ts`, and `errors.ts`.

Second, executor tasks already run inside isolated git worktrees.
`apps/control-plane/src/modules/workspaces/service.ts`, `git-manager.ts`, `naming.ts`, and the workspace repository ensure one persisted workspace per task, one deterministic path, and one deterministic local branch.

Third, successful executor turns already persist local evidence.
`apps/control-plane/src/modules/orchestrator/runtime-phase.ts` drives executor validation and terminalization, while `apps/control-plane/src/modules/evidence/runtime-artifacts.ts` persists `diff_summary`, `test_report`, and `log_excerpt` artifacts and updates the proof bundle in place.

What does not exist yet is the publish bridge between those layers.
There is no module that can:

- select the mission repository and installation token for writes
- commit the validated worktree locally
- push the deterministic branch to GitHub without persisting tokens
- open a draft PR
- persist a `pr_link` artifact and attach it to the proof bundle
- fail truthfully when push or PR creation does not succeed

The intended edit surface for this slice is:

- `plans/EP-0015-branch-and-pr-artifact-creation.md`
- `README.md`
- `docs/ops/local-dev.md`
- `packages/domain/src/replay-event.ts`
- `apps/control-plane/src/bootstrap.ts`
- `apps/control-plane/src/bootstrap.spec.ts`
- `apps/control-plane/src/modules/evidence/service.ts`
- `apps/control-plane/src/modules/evidence/runtime-artifacts.ts`
- `apps/control-plane/src/modules/github-app/client.ts`
- `apps/control-plane/src/modules/github-app/errors.ts`
- `apps/control-plane/src/modules/github-app/types.ts`
- new write-path files under `apps/control-plane/src/modules/github-app/`, likely:
  `git-write-client.ts`
  `git-write-client.spec.ts`
  `publish-formatter.ts`
  `publish-service.ts`
  `publish-service.spec.ts`
- `apps/control-plane/src/modules/orchestrator/runtime-phase.ts`
- `apps/control-plane/src/modules/orchestrator/service.ts`
- `apps/control-plane/src/modules/orchestrator/drizzle-service.spec.ts`

This slice should preserve current architecture boundaries:

- routes remain thin and should not gain publish logic
- workspace management stays local-only
- GitHub API and git-network writes stay in the GitHub App bounded context
- evidence modules own artifact and proof-bundle persistence
- orchestrator only sequences those services

This slice also changes GitHub App permission expectations:

- existing `Metadata` read remains required
- pushing commits and branches needs repository `Contents` write
- draft PR creation needs `Pull requests` write

## Plan of Work

First, add a dedicated GitHub write path under the existing `github-app` bounded context.
That path should have one small formatter for deterministic commit and PR text, one local git writer for staging or committing or pushing with process-local auth headers, and one publish service that ties together repository-target resolution, installation-token minting, branch preflight, push, and draft PR creation.

Next, extend the GitHub App client just enough to support the publish service.
It needs a narrow branch-existence read and a draft-PR create call that both use installation-scoped tokens and typed response parsing.
No PAT fallback, no `gh`, and no token persistence should be added.

Then, wire the publish service into executor completion.
The executor runtime flow should keep local validation as the precondition for publish, run the GitHub publish step only for a would-be successful executor task, and downgrade the task to an honest failure if push or PR creation fails.
When publish succeeds, the orchestrator should persist a `pr_link` artifact, append `artifact.created`, and link that artifact into the proof bundle manifest without widening into full M2.5 bundle assembly.

After that, add focused tests.
The core coverage should include one successful executor path that produces a commit or push or draft PR through mocked GitHub write services, explicit repo-state failures from the registry resolver, push failure truthfulness, PR creation failure truthfulness after a successful push, and secure git-transport assertions that the push path uses `git` plus process-local auth headers instead of tokenized remotes or `gh`.

Finally, update local docs and run the required validation commands.
If live GitHub App env is present, run one real smoke against `616xold/pocket-cto` and record the PR and artifact evidence here.

## Concrete Steps

Run these commands from the repository root as needed:

    rg -n "pr_link|branch|pull request|draft PR|proofBundle|artifact.created|syncInstallationRepositories|repositories" packages apps docs
    git status --short
    git diff --name-only HEAD
    pnpm db:generate
    pnpm db:migrate
    pnpm run db:migrate:ci
    pnpm --filter @pocket-cto/control-plane test
    pnpm --filter @pocket-cto/control-plane typecheck
    pnpm --filter @pocket-cto/control-plane lint
    pnpm --filter @pocket-cto/web typecheck

Useful narrow commands during implementation:

    pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/github-app/publish-service.spec.ts src/modules/github-app/git-write-client.spec.ts
    pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/orchestrator/drizzle-service.spec.ts
    rg -n "gh|personal access token|PAT" apps/control-plane/src/modules/github-app

If live GitHub App env is present after implementation, also run one smoke path and record:

- synced repository full name
- deterministic or temporary branch name used for the smoke
- PR number
- PR URL
- whether the PR is draft
- persisted `pr_link` artifact id
- proof-bundle `artifactIds`

## Validation and Acceptance

Success for M2.4 is demonstrated when all of the following are true:

1. A successful executor run with validated workspace changes can resolve one writable repository from the durable registry using mission context.
2. Repo states that are inactive, archived, disabled, or missing installation linkage fail explicitly before any push or PR success is persisted.
3. The local task worktree is committed on the deterministic branch and pushed through a short-lived installation token without writing the token into disk config, git remotes, or logs.
4. A draft PR is created through the GitHub API with `base = repository.defaultBranch` and `head = workspace.branchName`.
5. The PR title and body are deterministic and derived from mission plus executor context.
6. Successful PR creation persists one `pr_link` artifact whose metadata contains at least repo full name, branch name, PR number, PR URL, base branch, and head branch.
7. Replay appends one `artifact.created` event for the `pr_link` artifact and does not claim PR success when push or PR creation fails.
8. The proof bundle manifest includes the persisted `pr_link` artifact id after success.
9. Push failure prevents PR creation and prevents `pr_link` artifact persistence.
10. PR creation failure after a successful push is recorded honestly as task failure while still preserving enough evidence to debug the pushed branch state.
11. The implementation uses GitHub App installation tokens and does not introduce PAT or `gh` CLI shortcuts.
12. Local docs state the additional GitHub App permissions and a reproducible local smoke path.

Useful manual acceptance after implementation should look like:

    pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/orchestrator/drizzle-service.spec.ts -t "publishes executor changes to a draft pull request"

When live GitHub App env is configured, a narrower real smoke should also show one remote branch and one draft PR against the resolved repository default branch.

## Idempotence and Recovery

This slice should be additive and mostly code-only.
If `pnpm db:generate` shows unrelated schema changes, stop and correct the code because M2.4 should not need a migration for the first implementation.

Branch naming is deterministic, so branch reuse must be explicit.
The first version should fail if the remote branch already exists rather than guessing whether reuse or overwrite is safe.
That makes retries truthful:

- if local validation fails, rerun the executor after fixing the workspace state
- if branch push fails before any remote write, retry the whole publish path safely
- if PR creation fails after the branch is already pushed, keep the task failure explicit and inspect the pushed branch before retrying
- if code rollback is needed, revert the publish module, orchestrator wiring, specs, and docs together; no token cleanup should be required because tokens are not persisted

## Artifacts and Notes

Initial M2.4 gap notes captured before implementation:

1. Repository registry readiness already exists:
   `apps/control-plane/src/modules/github-app/service.ts` can resolve a writable repository and expose inactive or archived or disabled or installation-unavailable failures from the durable registry.
2. Workspace readiness already exists:
   `apps/control-plane/src/modules/workspaces/naming.ts` and `git-manager.ts` already create deterministic branches and isolated worktrees.
3. Current publish gap:
   `apps/control-plane/src/modules/orchestrator/runtime-phase.ts` currently ends executor success at local validation and runtime artifact persistence only.
4. Current evidence gap:
   `pr_link` is in the artifact enum and proof-bundle contract, but no module currently creates or links one.

Validation results and live-smoke notes will be appended here as implementation proceeds.

Validation results captured after implementation:

- `pnpm db:generate`
  Result: passed with `No schema changes, nothing to migrate`.
- `pnpm db:migrate`
  Result: passed.
- `pnpm run db:migrate:ci`
  Result: passed for both `pocket_cto` and `pocket_cto_test`.
- `pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/github-app/git-write-client.spec.ts src/modules/github-app/publish-service.spec.ts src/modules/orchestrator/service.spec.ts src/modules/orchestrator/drizzle-service.spec.ts`
  Result: passed with 4 files and 38 tests.
- `pnpm --filter @pocket-cto/domain build`
  Result: passed and refreshed the referenced domain package output so the new replay reason propagated to downstream typecheck.
- `pnpm --filter @pocket-cto/control-plane typecheck`
  Result: passed.
- `pnpm --filter @pocket-cto/control-plane test`
  Result: passed with 33 files and 144 tests.
- `pnpm --filter @pocket-cto/control-plane lint`
  Result: passed.
- `pnpm --filter @pocket-cto/web typecheck`
  Result: passed.

Live GitHub App smoke evidence captured after implementation:

- Environment detection:
  `GITHUB_APP_ID` and `GITHUB_APP_PRIVATE_KEY_BASE64` were both present locally.
- Registry convergence:
  installation sync succeeded before publish, repository sync succeeded before publish, and `resolveWritableRepository("616xold/pocket-cto")` succeeded.
- Live publish result:
  `repoFullName = 616xold/pocket-cto`
  `branchName = pocket-cto/live-smoke-1773607575170`
  `draft = true`
  `prNumber = 19`
  `prUrl = https://github.com/616xold/pocket-cto/pull/19`
- Live artifact evidence:
  `artifactId = 210e102d-0ee3-4eb2-bb13-1640b5480e92`
  `proofBundleArtifactIds = ["210e102d-0ee3-4eb2-bb13-1640b5480e92"]`

The live smoke intentionally used a temp worktree plus a temp branch and created a single tracked file `docs/ops/live-smoke-1773607575170.md` on that draft PR branch.

## Interfaces and Dependencies

Important existing dependencies for this slice:

- `GitHubAppService.resolveWritableRepository()` for repo-registry backed target resolution
- `GitHubAppService.getInstallationAccessToken()` for short-lived installation-scoped tokens
- `GitHubAppClient` for GitHub REST API calls
- `WorkspaceService` and the persisted workspace record for deterministic branch and root-path context
- `LocalExecutorValidationService` for changed-path and `git diff --check` enforcement
- `MissionRepository.saveArtifact()` and `upsertProofBundle()` for durable artifact and manifest persistence
- `ReplayService.append()` for compact `artifact.created` replay

Likely new or expanded interfaces by the end of this slice:

- a git write client for local stage or commit or push behavior
- a GitHub publish service that returns a typed publish result or typed push or PR failure
- typed PR response models in the GitHub App module
- one proof-bundle attachment helper for `pr_link`
- one or more explicit executor publish-failure reason codes in the replay payload domain

Environment and permission expectations:

- existing GitHub App env remains `GITHUB_APP_ID` and `GITHUB_APP_PRIVATE_KEY_BASE64`
- required GitHub App permissions now include repository `Contents: write`, `Pull requests: write`, and existing `Metadata: read`
- no PAT env var should be added

## Outcomes & Retrospective

M2.4 now lands as a real publish slice instead of a placeholder promise.
Pocket CTO can take a validated executor worktree, resolve one writable repository from the durable registry, commit the change locally, push the deterministic task branch through a GitHub App installation token, open a draft PR, persist a `pr_link` artifact, append `artifact.created`, and link that artifact into the proof bundle manifest.

The write path stayed modular:

- `git-write-client.ts` owns local stage or commit or push behavior and secure token transport
- `publish-formatter.ts` owns deterministic commit or PR text
- `publish-service.ts` owns target resolution, token minting, branch preflight, push, and PR creation
- `pull-request-link.ts` plus `evidence/service.ts` own artifact and proof-bundle persistence
- `runtime-phase.ts` only sequences those services

The failure story is also now honest.
Inactive or archived or disabled or installation-unavailable repositories fail before push.
Remote branch collisions fail explicitly.
Push failures do not create PR artifacts.
PR creation failures after a successful push still terminalize the executor as failed and preserve enough evidence to debug what branch state was already published.

One scope boundary remains visible on purpose:
the stub text compiler still does not infer a synced repository full name from manual-text input, so fully automatic text-intake-to-PR still needs later mission-context improvement.
That gap is outside this slice and should stay separate from M2.5 proof-bundle assembly.

The next M2 slice can start cleanly.
M2.5 now has a durable PR artifact to assemble into richer proof-bundle output instead of having to invent branch or PR state itself.
