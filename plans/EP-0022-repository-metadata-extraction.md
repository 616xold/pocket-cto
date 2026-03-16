# EP-0022 - Extract deterministic repository metadata into the repo-scoped twin

This ExecPlan is a living document. Keep `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` current.

## Purpose / Big Picture

After this slice, Pocket CTO can take one real synced repository from the durable GitHub repository registry, inspect the correct local checkout deterministically, and persist a first useful repository twin without pretending deeper discovery already exists.
Operators will be able to trigger a repo-scoped metadata sync, inspect the resulting sync run, and read a concise repository twin summary that reports the stored repository, branch, README, manifest, and workspace-directory state.

This plan covers roadmap submilestone `M3.2 repository metadata extraction`.
It intentionally stops before CODEOWNERS extraction, CI workflow extraction, docs or runbook indexing, freshness scoring, blast-radius answers, or discovery-mission formatting.

## Progress

- [x] (2026-03-16T22:38:00Z) Read the required repo instructions, roadmap, M3.1 ExecPlan, architecture and ops docs, the requested twin or GitHub or workspace source files, and ran the required inspections `rg -n "package.json|README|docs/|CODEOWNERS|\\.github/workflows|defaultBranch|source repo root|POCKET_CTO_SOURCE_REPO_ROOT|repository registry|twin" apps packages docs plans tools`, `git status --short`, and `git diff --name-only HEAD`.
- [x] (2026-03-16T22:43:00Z) Captured the M3.2 gap before coding: the twin bounded context already persists repo-scoped runs, entities, and edges through the repository registry, but there is still no extractor entrypoint, no typed local-source availability failure, no deterministic metadata scan, and no operator-readable repository summary surface.
- [x] (2026-03-16T23:10:00Z) Implemented the repo-scoped extractor slice inside the twin bounded context: added a typed source-unavailable error, a local git-backed source resolver, a deterministic repository metadata extractor, `syncRepositoryMetadata(...)`, `getRepositoryMetadataSummary(...)`, thin sync and summary routes, and bootstrap plus port wiring that injects the extractor with the existing `POCKET_CTO_SOURCE_REPO_ROOT` contract.
- [x] (2026-03-16T23:10:00Z) Added focused coverage for extraction from a temp repo, rerun upserts, sync-run status or counts, mismatched or missing local source failures, and the route-level metadata sync plus summary flow. The narrow twin spec command now passes.
- [x] (2026-03-16T23:18:00Z) Updated `docs/ops/local-dev.md`, reran the full required validation matrix successfully, and ran one live GitHub-backed repository-registry plus metadata-sync attempt for `616xold/pocket-cto`. The registry sync succeeded, and the metadata sync created a truthful failed run because the local checkout resolved to `616xold/pocket-cto-starter` instead of the requested repo.
- [x] (2026-03-16T23:24:00Z) Per the modular-architecture guard, split the twin metadata implementation into smaller bounded-context modules (`metadata-sync`, `repository-metadata-extractor`, `repository-metadata-discovery`, and `source-resolver`) and reran the full requested validation matrix plus `pnpm ci:repro:current` to confirm the final tree, not just the pre-split checkpoint.

## Surprises & Discoveries

- Observation: M3.1 already solved the hardest persistence problems for this slice.
  Evidence: `apps/control-plane/src/modules/twin/repository.ts`, `drizzle-repository.ts`, and `service.ts` already provide repo-scoped sync runs, stable entity uniqueness by `repo_full_name + kind + stable_key`, and stable edge uniqueness by repo and endpoints.

- Observation: the existing workspace config already codifies the single-source-root contract that this extractor must respect instead of bypassing.
  Evidence: `apps/control-plane/src/modules/workspaces/config.ts` normalizes `POCKET_CTO_SOURCE_REPO_ROOT`, resolves the real git root, and rejects unsafe workspace placements relative to the source repo root.

- Observation: the repository registry is already the durable source of truth for `fullName`, `defaultBranch`, archived or disabled flags, and installation-linked repo readiness.
  Evidence: `apps/control-plane/src/modules/github-app/service.ts` exposes `getRepository(...)` and `resolveWritableRepository(...)` over persisted repository rows in `apps/control-plane/src/modules/github-app/repository.ts`.

- Observation: no schema change is required for this slice because M3.1 already made `kind`, `stableKey`, JSON payloads, and sync-run stats open-ended enough for repository metadata extraction.
  Evidence: the new entity and edge kinds (`default_branch`, `root_readme`, `package_manifest`, `workspace_directory`, and the repository-metadata edge kinds) fit into the existing text `kind` columns and JSON payload contract in `packages/db/src/schema/twin.ts`.

## Decision Log

- Decision: keep repository metadata extraction entirely inside the twin bounded context and inject only the minimal source-resolution dependency from bootstrap.
  Rationale: `AGENTS.md` and the modular-architecture guard require the extractor to stay separate from routes, GitHub transport, and workspace orchestration; the twin bounded context already owns sync runs, entities, edges, and summary reads.
  Date/Author: 2026-03-16 / Codex

- Decision: use the existing GitHub repository registry as the source of truth for which repo to inspect, then prefer the local `POCKET_CTO_SOURCE_REPO_ROOT` checkout only when it truthfully resolves to the same synced `owner/repo`.
  Rationale: the prompt explicitly forbids arbitrary cloning and silent wrong-tree scans, and the GitHub App integration guard requires repo access to remain installation-scoped and registry-backed.
  Date/Author: 2026-03-16 / Codex

- Decision: model source-unavailable as a typed twin error and map it through the shared HTTP error handler.
  Rationale: operators need a truthful failure when the local checkout is missing or mismatched; burying that as a generic 500 would hide an important workflow rule.
  Date/Author: 2026-03-16 / Codex

- Decision: keep the first extractor deterministic and auditable by reading only the repo root README, discovered `package.json` files, and approved top-level directories.
  Rationale: M3.2 should ship a strong metadata spine before magic. Deferring CODEOWNERS, CI workflows, docs indexing, and blast-radius reasoning keeps the slice narrow and rerunnable.
  Date/Author: 2026-03-16 / Codex

- Decision: when `POCKET_CTO_SOURCE_REPO_ROOT` is unset, fall back to the current process repo root but still require the local `origin` remote to resolve to the same synced `owner/repo`.
  Rationale: this preserves the repo's single-operator local dogfooding ergonomics from the workspace slice without weakening the new truthfulness rule that forbids scanning the wrong tree.
  Date/Author: 2026-03-16 / Codex

- Decision: do not add replay events for this slice.
  Rationale: metadata sync changes twin state, not mission or task lifecycle state. The audit surface for this slice will be the persisted sync-run row, stable twin entities or edges, and the operator-readable summary route.
  Date/Author: 2026-03-16 / Codex

## Context and Orientation

Pocket CTO exits M3.1 with a real repo-scoped twin persistence spine but no extractor.
The twin bounded context already owns durable sync runs, entities, edges, and thin debug routes under `apps/control-plane/src/modules/twin/`.
Those writes are already repo-scoped and idempotent by stable keys, so M3.2 does not need a new persistence model.

The GitHub App bounded context under `apps/control-plane/src/modules/github-app/` already persists the repository registry.
That registry is the authoritative source for repository identity, default branch, archived or disabled flags, and installation availability.
M3.2 must reuse that boundary rather than infer repository identity from a local filesystem path alone.

The local checkout contract already exists for workspaces.
`packages/config/src/index.ts` exposes `POCKET_CTO_SOURCE_REPO_ROOT`, and `apps/control-plane/src/modules/workspaces/config.ts` resolves it to a real absolute git repo root.
For this slice, twin metadata extraction should use the same local-source-root concept, but it must additionally verify that the requested synced repository actually matches that local checkout.

The relevant files and modules are:

- shared twin domain contracts in `packages/domain/src/twin.ts`
- app wiring in `apps/control-plane/src/bootstrap.ts` and `apps/control-plane/src/lib/types.ts`
- HTTP error mapping in `apps/control-plane/src/lib/http-errors.ts`
- twin persistence and service boundaries in `apps/control-plane/src/modules/twin/repository.ts`, `drizzle-repository.ts`, `types.ts`, `formatter.ts`, `routes.ts`, and `service.ts`
- GitHub repository registry surfaces in `apps/control-plane/src/modules/github-app/service.ts`, `repository.ts`, and `drizzle-repository.ts`
- workspace source-root safety context in `apps/control-plane/src/modules/workspaces/config.ts` and `git-manager.ts`
- operator docs in `docs/ops/local-dev.md`

This slice should preserve boundaries:

- `packages/domain` stays pure and only carries contracts for the summary read model
- `packages/db` should not need new schema changes unless a new summary contract forces them
- `apps/control-plane/src/modules/twin/` owns extraction orchestration, filesystem scanning, typed source errors, formatting, and routes
- routes stay thin and must not walk the filesystem directly

No new GitHub App permissions or webhook subscriptions are expected.
No new environment variables are expected; the extractor should reuse `POCKET_CTO_SOURCE_REPO_ROOT`.
`WORKFLOW.md` should remain accurate without changes because this slice stays local, additive, and approval-free.

## Plan of Work

First, create the new M3.2 twin source-resolution seam.
The twin service needs one repo-scoped extraction entrypoint that resolves repository context through the durable registry, then asks a small twin source module to return the exact local checkout path for that synced repository or throw a typed source-unavailable error.
That source-resolution module should be deterministic, avoid cloning, and use git metadata plus the configured root path to prove the local tree matches the requested repo full name.

Next, add a deterministic filesystem extractor inside the twin bounded context.
It should inspect only a small, auditable set of repository facts: the repository row itself, the default branch, root README presence and basic size or line metadata, every discovered `package.json`, and major top-level directories among `apps`, `packages`, `docs`, `infra`, and `tools`.
The extractor should produce stable entity keys and repo-scoped edges, then write them through the existing twin service or repository methods inside one sync run.

Then, add the operator-facing summary read surface.
If it remains thin, add `POST /twin/repositories/:owner/:repo/metadata-sync` to trigger extraction and `GET /twin/repositories/:owner/:repo/summary` to return a concise, operator-readable summary rather than raw rows.
The summary should be built from stored twin data and latest sync-run state, not by rescanning the repo on every read.

Finally, add focused tests, update the local-dev docs with one short metadata-sync section, run the requested validation matrix, and if live GitHub env is present, run one real metadata sync against `616xold/pocket-cto` and record the exact counts and sync-run id.

## Concrete Steps

Run these commands from the repository root as needed:

    rg -n "package.json|README|docs/|CODEOWNERS|\\.github/workflows|defaultBranch|source repo root|POCKET_CTO_SOURCE_REPO_ROOT|repository registry|twin" apps packages docs plans tools
    git status --short
    git diff --name-only HEAD
    pnpm db:generate
    pnpm db:migrate
    pnpm run db:migrate:ci
    pnpm repo:hygiene
    pnpm lint
    pnpm typecheck
    pnpm build
    pnpm test
    pnpm ci:repro:current

Useful narrow commands during implementation:

    pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/twin/service.spec.ts src/modules/twin/routes.spec.ts src/modules/twin/drizzle-repository.spec.ts
    rg -n "metadata-sync|repository_metadata|TwinServicePort|POCKET_CTO_SOURCE_REPO_ROOT|summary" apps/control-plane/src packages/domain/src docs/ops/local-dev.md

If live GitHub env is present after implementation:

    curl -X POST http://localhost:4000/github/repositories/sync
    curl -X POST http://localhost:4000/twin/repositories/616xold/pocket-cto/metadata-sync
    curl http://localhost:4000/twin/repositories/616xold/pocket-cto/summary

Record only the repo full name, default branch, entity counts by kind, and sync-run id.
Do not print tokens, secrets, or raw auth headers.

## Validation and Acceptance

Success for M3.2 is demonstrated when all of the following are true:

1. The twin bounded context exposes one repo-scoped metadata extraction entrypoint that creates a sync run, writes metadata entities and edges, and marks the run `succeeded` or `failed`.
2. The extractor uses the existing GitHub repository registry as the source of truth for the repository target.
3. When `POCKET_CTO_SOURCE_REPO_ROOT` is set and the local checkout truthfully matches the synced repository full name, the extractor uses that checkout.
4. When the requested synced repository is not available locally or the local checkout resolves to another repo, the extractor fails with a typed twin source-unavailable error instead of scanning the wrong tree.
5. Repeated runs converge on the same stable repository, branch, README, manifest, and workspace-directory entities instead of duplicating them.
6. The extractor persists at least these entity kinds: `repository`, `default_branch`, `root_readme`, `package_manifest`, and `workspace_directory`.
7. The extractor persists at least these edge kinds: `repository_has_branch`, `repository_contains_manifest`, `repository_contains_directory`, and `repository_has_readme`.
8. Entity payloads remain concise and auditable: repository flags plus default branch from the registry, README path plus basic stats, manifest path plus package metadata and script names only, and directory path plus simple classification.
9. `GET /twin/repositories/:owner/:repo/summary` returns a concise operator-readable read model derived from stored twin state.
10. Focused tests prove temp-repo extraction, rerun upserts, sync-run status and counts, truthful source-unavailable failures, and summary-read correctness.
11. `docs/ops/local-dev.md` documents one honest metadata-sync flow and does not claim CODEOWNERS, CI workflows, docs indexing, or blast-radius answers already exist.

Human acceptance after implementation should look like:

    curl -X POST http://localhost:4000/twin/repositories/OWNER/REPO/metadata-sync
    curl http://localhost:4000/twin/repositories/OWNER/REPO/summary
    curl http://localhost:4000/twin/repositories/OWNER/REPO/runs

For a synced repo with a truthful local checkout, the sync route should return a completed sync result and the summary should report stored repository, branch, README, manifests, directories, and latest run data.
For a missing or mismatched local checkout, the sync route should fail with the typed source-unavailable error.

## Idempotence and Recovery

Metadata sync must be safe to rerun.
Stable entity keys should keep repository metadata convergent across runs, and repo-scoped edges should upsert on the same repository-to-entity relationships.
No pruning or deletion logic is required in this slice beyond what is necessary to keep reruns coherent.

If a sync fails midway, the run should still finish as `failed` with an error summary so operators can see what happened.
Retrying the same sync after fixing the local checkout or source-root configuration should create a new sync run and converge entities or edges on the same stable keys.

Safe rollback guidance:

- revert the new twin extractor modules, route additions, summary formatter changes, error mapping, docs, and this ExecPlan together
- do not delete existing twin rows; the persisted metadata rows are additive and can remain inert if the code is rolled back
- if a database change becomes necessary during implementation, keep it additive-first and roll it back only through the repo migration workflow

## Artifacts and Notes

Required pre-coding gap note captured in-thread:

1. M3.1 already provides repo-scoped sync runs, stable entity or edge persistence, and debug reads.
2. Metadata extraction is still missing source-root truth, deterministic filesystem scanning, typed source-unavailable failures, and a concise summary read model.
3. Planned edit surface includes the new ExecPlan, twin module files, app wiring, HTTP error mapping, focused tests, and `docs/ops/local-dev.md`.
4. The chosen strategy is registry-first plus local-checkout verification, followed by deterministic extraction of repository, default-branch, README, manifests, and major top-level directories.

Validation results, smoke results, and exact changed files will be appended here as work proceeds.

Validation results:

- `pnpm db:generate` passed with `No schema changes, nothing to migrate`.
- `pnpm db:migrate` passed.
- `pnpm run db:migrate:ci` passed.
- `pnpm repo:hygiene` passed.
- `pnpm lint` passed after one small import-style fix in `metadata-sync.spec.ts`.
- `pnpm typecheck` passed after tightening the `visibility` literal return type in the twin formatter and simplifying the metadata-sync failure assertions.
- `pnpm build` passed.
- `pnpm test` passed with all workspace packages green, including `apps/control-plane` `41` files and `190` tests.
- `pnpm ci:repro:current` passed, including clean-tree verification in the temp worktree.

Final changed files for this slice:

- `apps/control-plane/src/bootstrap.spec.ts`
- `apps/control-plane/src/bootstrap.ts`
- `apps/control-plane/src/lib/http-errors.ts`
- `apps/control-plane/src/lib/types.ts`
- `apps/control-plane/src/modules/orchestrator/drizzle-service.spec.ts`
- `apps/control-plane/src/modules/twin/errors.ts`
- `apps/control-plane/src/modules/twin/formatter.ts`
- `apps/control-plane/src/modules/twin/metadata-sync.spec.ts`
- `apps/control-plane/src/modules/twin/metadata-sync.ts`
- `apps/control-plane/src/modules/twin/repository-metadata-discovery.ts`
- `apps/control-plane/src/modules/twin/repository-metadata-extractor.ts`
- `apps/control-plane/src/modules/twin/routes.spec.ts`
- `apps/control-plane/src/modules/twin/routes.ts`
- `apps/control-plane/src/modules/twin/service.spec.ts`
- `apps/control-plane/src/modules/twin/service.ts`
- `apps/control-plane/src/modules/twin/source-resolver.ts`
- `docs/ops/local-dev.md`
- `packages/domain/src/twin.ts`
- `plans/EP-0022-repository-metadata-extraction.md`

Live GitHub-backed evidence:

- `syncInstallations()` succeeded with `installationsSynced = 1`.
- `syncRepositories()` succeeded with `repositoriesSynced = 1`.
- requested repository: `616xold/pocket-cto`
- registry default branch after sync: `main`
- metadata sync run id: `e9419f59-6a90-4417-a0d2-10c28db70ac5`
- metadata sync status: `failed`
- entity counts by kind after the failed live attempt: `{}`
- truthful failure: `Twin source repository 616xold/pocket-cto-starter does not match requested 616xold/pocket-cto`

## Interfaces and Dependencies

Important existing interfaces and modules for this slice:

- `GitHubAppService` methods `getRepository(...)` and `resolveWritableRepository(...)`
- twin contracts in `packages/domain/src/twin.ts`
- twin repository and service seams in `apps/control-plane/src/modules/twin/`
- workspace source-root helpers in `apps/control-plane/src/modules/workspaces/config.ts` and `git-manager.ts`
- HTTP error mapping in `apps/control-plane/src/lib/http-errors.ts`
- env parsing in `packages/config/src/index.ts`

New or expanded interfaces expected by the end of this slice:

- a typed twin source-unavailable error
- a twin source resolver contract for local checkout verification
- a repo-scoped metadata extraction method on the twin service and app container port
- a summary read-model contract in `packages/domain/src/twin.ts`
- thin twin routes for metadata sync and summary reads

No new GitHub App permissions or webhook subscriptions are expected.
No new env vars are expected.
Replay implications remain intentionally narrow: sync-run rows and summary surfaces provide the audit trail for this slice instead of mission replay events.

## Outcomes & Retrospective

M3.2 now ships a real repository-metadata extraction slice on top of the M3.1 twin persistence spine.
The twin bounded context can resolve a repository target through the durable GitHub repository registry, verify one local checkout truthfully through git metadata, create a repo-scoped sync run, extract deterministic repository metadata, persist stable entities and edges, and return a concise stored summary.

The shipped extraction strategy is exact and narrow:

- use the synced GitHub repository registry as the target source of truth
- resolve one local checkout from `POCKET_CTO_SOURCE_REPO_ROOT` when configured, otherwise from the current process repo root
- read the local git root and `remote.origin.url`
- require that the local checkout resolve to the same requested `owner/repo`
- extract only repository registry facts, the default branch, an optional root README, discovered `package.json` files, and approved top-level directories among `apps`, `packages`, `docs`, `infra`, and `tools`
- persist those through stable repo-scoped twin entities and edges

The final entity kinds persisted by this slice are:

- `repository`
- `default_branch`
- `root_readme`
- `package_manifest`
- `workspace_directory`

The final edge kinds persisted by this slice are:

- `repository_has_branch`
- `repository_contains_manifest`
- `repository_contains_directory`
- `repository_has_readme`

Validation completed successfully across the full requested matrix, and the clean-temp-worktree CI reproduction stayed green.
The live GitHub-backed attempt also succeeded in syncing the registry and then failed truthfully at the metadata-sync step because this local checkout did not match the requested repo full name.
That failure is valuable evidence for the new auditable source-verification rule rather than a hidden fallback.

Deferred work remains intentionally narrow:

- CODEOWNERS and ownership extraction in M3.3
- CI workflow and test-suite extraction in M3.4
- docs and runbook indexing in M3.5
- freshness scoring, stale markers, blast-radius answering, and discovery formatting in later M3 slices

M3.3 can now start cleanly on top of this slice because the repo-scoped extractor entrypoint, truthful local-source contract, sync-run lifecycle, stored metadata summary, and focused test coverage are all in place.
