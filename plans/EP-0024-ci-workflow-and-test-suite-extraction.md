# EP-0024 - Extract CI workflow facts into the repo-scoped twin and expose stored workflow reads

This ExecPlan is a living document. Keep `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` current.

## Purpose / Big Picture

After this slice, Pocket CTO can inspect one synced repository, discover workflow files under `.github/workflows`, parse durable CI workflow and job facts deterministically, persist those facts into the repo-scoped twin, and return a concise stored workflow summary through thin control-plane routes.
Operators will be able to trigger a repo-scoped workflow sync, inspect the resulting sync run, and read stored workflow and job summaries without rescanning the repository on every GET.

This plan covers roadmap submilestone `M3.4 CI workflow and test suite extraction`, but this prompt intentionally implements only the first half: `M3.4A CI workflow extraction`.
It explicitly stops before test suite extraction, docs indexing, freshness scoring, blast-radius answers, or redesigning the existing metadata and ownership slices.

## Progress

- [x] (2026-03-19T00:00:00Z) Read the requested repo docs, roadmap, M3.1/M3.2/M3.3 ExecPlans, the named skills, the requested twin or bootstrap files, and ran the required inspections `rg -n "workflow|ci.yml|\\.github/workflows|pnpm test|vitest|playwright|jest|cypress|turbo test|test:" .github apps packages docs plans package.json`, `git status --short`, and `git diff --name-only HEAD`.
- [x] (2026-03-19T00:00:00Z) Captured the required pre-coding M3.4A workflow extraction gap note in-thread, confirming that the twin spine, metadata extractor, and ownership layer already provide repo-scoped sync runs, registry-backed targeting, truthful local source resolution, idempotent entity or edge upserts, and stored read-route patterns.
- [x] (2026-03-19T00:00:00Z) Created EP-0024 before coding so the workflow slice stays self-contained, additive, and resumable.
- [x] (2026-03-19T00:00:00Z) Implemented the M3.4A workflow slice inside the twin bounded context: added workflow discovery and YAML parsing helpers, added a dedicated `workflows-sync` path, persisted `ci_workflow_file`, `ci_workflow`, and `ci_job` entities plus the required workflow edges, and exposed thin `workflows-sync` and `workflows` routes.
- [x] (2026-03-19T00:00:00Z) Added focused workflow coverage for discovery scope, truthful zero-workflow sync success, deterministic workflow-name fallback, stable job keys on rerun, clean route responses, and the legacy `ci_job -> ciJob` compatibility mapping; the narrow twin spec command passed after a small test-clock fix.
- [x] (2026-03-19T00:00:00Z) Updated `docs/ops/local-dev.md` and declared a direct YAML parser dependency for `@pocket-cto/control-plane` so the workflow slice stays explicit instead of relying on a transitive hoist.
- [x] (2026-03-19T02:32:00Z) Ran the full required validation matrix successfully: `pnpm db:generate`, `pnpm db:migrate`, `pnpm run db:migrate:ci`, `pnpm repo:hygiene`, `pnpm lint`, `pnpm typecheck`, `pnpm build`, `pnpm test`, and `pnpm ci:repro:current`.
- [x] (2026-03-19T02:32:00Z) Confirmed live GitHub App env was available through the local `.env`, synced GitHub installations plus the repository registry, and completed one real workflow sync for `616xold/pocket-cto` using a temporary local checkout so the existing source resolver could stay truthful without product-side clone fallback.

## Surprises & Discoveries

- Observation: the current generic twin schema is already open-ended enough to store CI workflow facts without a required schema migration.
  Evidence: `packages/db/src/schema/twin.ts` already keys entities by `repo_full_name + kind + stable_key`, keys edges by repo plus endpoints, and stores generic JSON payloads plus `sourceRunId`.

- Observation: no workflow extraction code or route exists yet.
  Evidence: `rg -n "ci_workflow|ci_job|workflows-sync|workflow_file|workflow_contains_job|repository_has_ci_workflow_file|workflow_file_defines_workflow" apps/control-plane/src packages/domain/src packages/db/src docs/ops/local-dev.md plans` returned no current implementation hits.

- Observation: M3.2 and M3.3 already define the right architectural pattern for this slice.
  Evidence: `source-resolver.ts`, `metadata-sync.ts`, and `ownership-sync.ts` already prove the repo-scoped extractor pattern of registry-first targeting, truthful local-checkout verification, sync-run lifecycle persistence, idempotent upserts, and stored summary reads.

- Observation: YAML parsing is not currently declared directly in `@pocket-cto/control-plane`.
  Evidence: `apps/control-plane/package.json` has no direct `yaml` or `js-yaml` dependency even though the lockfile contains transitive YAML parsers.

## Decision Log

- Decision: implement CI workflow extraction as a separate `workflows-sync` path inside the twin bounded context instead of widening the existing metadata or ownership sync paths.
  Rationale: the prompt explicitly says not to redesign the metadata or ownership slices, and the modular-architecture guard favors a separate sync module, formatter, and read model for a new extraction surface.
  Date/Author: 2026-03-19 / Codex

- Decision: discover only `.yml` and `.yaml` files under `.github/workflows`, and treat “none found” as a truthful successful sync with zero workflow facts.
  Rationale: the prompt narrows discovery scope tightly and requires rerunnable truth instead of a generic failure when a repo has no workflows.
  Date/Author: 2026-03-19 / Codex

- Decision: use the existing repository registry plus the existing M3.2 source resolver as the only workflow source-selection path.
  Rationale: the prompt explicitly says to reuse the existing source resolver and forbids clone fallback. This also keeps the slice GitHub App-first and registry-backed under the GitHub integration guard.
  Date/Author: 2026-03-19 / Codex

- Decision: store workflow-file, workflow, and job facts through generic twin kinds and derive the read route from the latest successful workflow sync snapshot.
  Rationale: the current twin tables are additive and do not prune old rows. Filtering the read model to the latest successful workflow sync keeps zero-file reruns truthful without introducing delete-heavy behavior.
  Date/Author: 2026-03-19 / Codex

- Decision: do not add replay events for this slice.
  Rationale: workflow sync mutates twin state, not mission or task lifecycle state. The audit surface for this slice is the persisted sync-run row plus stored workflow entities, edges, and read routes.
  Date/Author: 2026-03-19 / Codex

- Decision: stop EP-0024 after M3.4A and explicitly defer M3.4B test suite extraction to a follow-up pass.
  Rationale: the prompt narrows scope to workflow discovery and durable persistence only, and the roadmap favors one strong vertical slice over widening into multiple extractors at once.
  Date/Author: 2026-03-19 / Codex

- Decision: persist compact workflow-step facts inside `ci_job` payloads and explicitly defer standalone step entities.
  Rationale: the prompt requires compact `run` and `uses` summaries but explicitly says not to create separate step entities yet, so the first slice should keep persistence minimal and auditable.
  Date/Author: 2026-03-19 / Codex

- Decision: add `yaml` as a direct `@pocket-cto/control-plane` dependency.
  Rationale: workflow parsing is now a first-class bounded-context responsibility, and the repo instructions prefer explicit dependencies over relying on a transitive hoist.
  Date/Author: 2026-03-19 / Codex

## Context and Orientation

Pocket CTO exits M3.3 with a real repo-scoped twin bounded context under `apps/control-plane/src/modules/twin/`.
That bounded context already owns:

- registry-backed repository targeting via the GitHub App repository registry
- truthful local source resolution through `source-resolver.ts`
- repo-scoped sync-run lifecycle persistence
- idempotent entity upserts keyed by repo full name, kind, and stable key
- idempotent edge upserts keyed by repo full name, kind, and endpoints
- metadata sync plus summary routes
- ownership sync plus stored ownership read routes

What is still missing for M3.4A is a durable CI workflow slice.
Today, Pocket CTO does not discover workflow files under `.github/workflows`, does not parse workflow/job facts, does not persist `ci_workflow_file`, `ci_workflow`, or `ci_job` entities, and does not expose a stored workflow summary route.

The relevant existing files and modules are:

- `apps/control-plane/src/modules/twin/source-resolver.ts`
- `apps/control-plane/src/modules/twin/metadata-sync.ts`
- `apps/control-plane/src/modules/twin/repository-metadata-extractor.ts`
- `apps/control-plane/src/modules/twin/ownership-sync.ts`
- `apps/control-plane/src/modules/twin/formatter.ts`
- `apps/control-plane/src/modules/twin/service.ts`
- `apps/control-plane/src/modules/twin/routes.ts`
- `apps/control-plane/src/modules/twin/repository.ts`
- `apps/control-plane/src/modules/twin/drizzle-repository.ts`
- `apps/control-plane/src/bootstrap.ts`
- `apps/control-plane/src/lib/types.ts`
- `packages/domain/src/twin.ts`
- `packages/db/src/schema/twin.ts`
- `docs/ops/local-dev.md`
- `.github/workflows/ci.yml`

The planned new or expanded workflow files are:

- `apps/control-plane/src/modules/twin/workflow-discovery.ts`
- `apps/control-plane/src/modules/twin/workflow-parser.ts`
- `apps/control-plane/src/modules/twin/workflow-sync.ts`
- `apps/control-plane/src/modules/twin/workflow-formatter.ts`
- the touched twin service, route, schema, repository, formatter, and spec files

This slice should preserve boundaries:

- `packages/domain` stays pure and adds only shared read-model or sync-result contracts
- `packages/db` should remain unchanged unless implementation proves a schema extension is actually required
- `apps/control-plane/src/modules/twin/` owns workflow discovery, parsing, persistence orchestration, and route formatting
- routes stay thin and must not walk the filesystem or parse YAML inline

No new environment variables are expected.
No new GitHub App permissions or webhook subscriptions are expected.
`WORKFLOW.md` and stack packs should remain accurate without changes.

## Plan of Work

First, add a small workflow discovery module that inspects only `.github/workflows` under the resolved repository root and returns every `.yml` or `.yaml` file in deterministic path order, along with cheap file stats and file contents needed for parsing.
If the directory does not exist or contains no matching files, discovery should return a truthful empty result instead of failing.

Next, add a parser module that reads each workflow file, extracts the workflow display name with a deterministic fallback when `name` is absent, normalizes the workflow trigger summary from the `on` section, and extracts one stored job summary per top-level job entry.
The job summary should include the stable job key plus compact normalized fields for display name, `runs-on`, `needs`, `permissions`, and step `run` or `uses` entries.
This parser should not create separate step entities and should not attempt test-suite extraction yet.

Then, add a dedicated `workflows-sync` orchestrator that:

- resolves repository detail from the registry
- starts a workflow sync run with a dedicated extractor name
- resolves the truthful local checkout through the existing source resolver
- discovers and parses workflow files
- ensures the repo-scoped `repository` entity exists for edge creation
- upserts `ci_workflow_file`, `ci_workflow`, and `ci_job` entities with stable keys
- upserts `repository_has_ci_workflow_file`, `workflow_file_defines_workflow`, and `workflow_contains_job` edges
- finishes the sync run with truthful counts, including the zero-file path

After that, add a stored read model for workflows derived from the latest successful workflow sync snapshot rather than a live rescan.
If the latest successful run recorded zero workflow files, the read route should return a truthful empty workflow summary.

Finally, add thin routes for `POST /twin/repositories/:owner/:repo/workflows-sync` and `GET /twin/repositories/:owner/:repo/workflows`, add focused tests, update `docs/ops/local-dev.md`, run the full required validation matrix, and if live GitHub App env is available, run one real workflow sync against `616xold/pocket-cto` after refreshing the repository registry.

Expected file edits are:

- `plans/EP-0024-ci-workflow-and-test-suite-extraction.md`
- `apps/control-plane/package.json`
- `pnpm-lock.yaml`
- `apps/control-plane/src/bootstrap.ts`
- `apps/control-plane/src/lib/types.ts`
- `apps/control-plane/src/modules/twin/service.ts`
- `apps/control-plane/src/modules/twin/routes.ts`
- `apps/control-plane/src/modules/twin/schema.ts`
- `apps/control-plane/src/modules/twin/formatter.ts`
- `apps/control-plane/src/modules/twin/repository.ts`
- `apps/control-plane/src/modules/twin/drizzle-repository.ts`
- `apps/control-plane/src/modules/twin/workflow-discovery.ts`
- `apps/control-plane/src/modules/twin/workflow-parser.ts`
- `apps/control-plane/src/modules/twin/workflow-sync.ts`
- `apps/control-plane/src/modules/twin/workflow-formatter.ts`
- `apps/control-plane/src/modules/twin/service.spec.ts`
- `apps/control-plane/src/modules/twin/routes.spec.ts`
- `apps/control-plane/src/modules/twin/drizzle-repository.spec.ts`
- `apps/control-plane/src/modules/twin/metadata-sync.spec.ts`
- `packages/domain/src/twin.ts`
- `docs/ops/local-dev.md`

Schema changes are not expected unless implementation proves the current generic twin tables are insufficient.

## Concrete Steps

Run these commands from the repository root as needed:

    rg -n "workflow|ci.yml|\\.github/workflows|pnpm test|vitest|playwright|jest|cypress|turbo test|test:" .github apps packages docs plans package.json
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

    pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/twin/service.spec.ts src/modules/twin/routes.spec.ts src/modules/twin/drizzle-repository.spec.ts src/modules/twin/metadata-sync.spec.ts
    rg -n "workflows-sync|ci_workflow|ci_job|workflow_file|workflow_contains_job" apps/control-plane/src packages/domain/src docs/ops/local-dev.md

If live GitHub env is present after implementation:

    curl -X POST http://localhost:4000/github/repositories/sync
    curl -X POST http://localhost:4000/twin/repositories/616xold/pocket-cto/workflows-sync
    curl http://localhost:4000/twin/repositories/616xold/pocket-cto/workflows

Record only the repo full name, workflow file count, workflow count, job count, and sync-run id.
Do not print secrets, tokens, or raw auth headers.

## Validation and Acceptance

Success for M3.4A is demonstrated when all of the following are true:

1. Workflow sync uses the existing repository registry and the existing twin source resolver; it does not clone repositories or invent a second source-selection path.
2. Discovery scans only `.github/workflows` and only `.yml` or `.yaml` files beneath that directory.
3. When no workflow files exist, `POST /twin/repositories/:owner/:repo/workflows-sync` succeeds truthfully, finishes the sync run as `succeeded`, and reports zero workflow files, zero workflows, and zero jobs.
4. The sync persists `ci_workflow_file`, `ci_workflow`, and `ci_job` entities with deterministic stable keys.
5. The sync persists `repository_has_ci_workflow_file`, `workflow_file_defines_workflow`, and `workflow_contains_job` edges with repo-scoped idempotent upserts.
6. Workflow-file payloads include at least relative path plus cheap file stats when available.
7. Workflow payloads include at least name plus normalized trigger summary.
8. Job payloads include at least job key, display name when present, normalized `runs-on`, normalized `needs`, permissions when present, and a compact list of step `run` or `uses` entries.
9. Workflow name fallback is deterministic when the YAML omits `name`.
10. Repeated workflow syncs converge on the same workflow-file, workflow, and job entity ids instead of duplicating them.
11. `GET /twin/repositories/:owner/:repo/workflows` returns a clean stored workflow summary and job summaries without rescanning the repository.
12. The workflow read route derives its view from the latest successful workflow sync snapshot so zero-file reruns remain truthful.
13. `docs/ops/local-dev.md` documents the current workflow sync and read routes honestly, without claiming test suite extraction, docs indexing, freshness scoring, or blast-radius behavior.

Human acceptance after implementation should look like:

    curl -i -X POST http://localhost:4000/twin/repositories/OWNER/REPO/workflows-sync
    curl -i http://localhost:4000/twin/repositories/OWNER/REPO/workflows

For a synced repo with workflow files, the sync route should return a succeeded run with non-zero counts and the read route should return stored workflow and job summaries.
For a synced repo without workflow files, the sync route should still succeed and the read route should return a truthful empty workflow snapshot.

## Idempotence and Recovery

Workflow sync must be safe to rerun.
Stable entity keys should converge on:

- `ci_workflow_file` by discovered file path
- `ci_workflow` by discovered file path plus workflow name or deterministic file fallback
- `ci_job` by discovered file path plus job key

Edge upserts should converge on the same repository-to-file, file-to-workflow, and workflow-to-job relationships.

If a sync fails after the run starts, the run must finish as `failed` with an error summary so operators can distinguish extraction failures from truthful “no workflow files” absence.
Retrying the same repo after fixing the local checkout or YAML issue should create a new sync run and converge on the same workflow entity and edge ids.

Safe rollback guidance:

- revert the workflow modules, route additions, docs, package dependency updates, and this ExecPlan together
- do not delete existing twin rows manually during rollback; persisted workflow facts are additive and can remain inert
- if implementation unexpectedly needs a schema change, keep it additive-first and roll it back only through the repo migration workflow

## Artifacts and Notes

Required pre-coding gap note captured in-thread:

1. The twin spine, metadata extractor, and ownership layer already give us repo-scoped sync runs, idempotent entity or edge upserts, registry-backed repo targeting, truthful local source resolution, and stored route patterns.
2. Durable CI workflow extraction is still missing scoped workflow-file discovery, deterministic YAML parsing, durable workflow-file/workflow/job persistence, and stored workflow read routes.
3. The planned edit surface includes the new ExecPlan, new twin workflow modules, touched twin service or route or formatter seams, shared domain contracts, focused tests, docs, and likely a direct YAML dependency for `@pocket-cto/control-plane`.
4. The chosen strategy is `.github/workflows` discovery only, deterministic workflow and job parsing, stable repo-scoped entity keys, and read models derived from the latest successful workflow sync snapshot.

Validation evidence:

- `pnpm --filter @pocket-cto/control-plane add yaml@^2.4.2` succeeded and updated the package manifest plus lockfile for an explicit workflow parser dependency.
- `pnpm exec prettier --write apps/control-plane/package.json apps/control-plane/src/bootstrap.spec.ts apps/control-plane/src/lib/types.ts apps/control-plane/src/modules/orchestrator/drizzle-service.spec.ts apps/control-plane/src/modules/twin/drizzle-repository.spec.ts apps/control-plane/src/modules/twin/drizzle-repository.ts apps/control-plane/src/modules/twin/routes.ts apps/control-plane/src/modules/twin/schema.ts apps/control-plane/src/modules/twin/service.ts apps/control-plane/src/modules/twin/workflow-discovery.spec.ts apps/control-plane/src/modules/twin/workflow-discovery.ts apps/control-plane/src/modules/twin/workflow-formatter.ts apps/control-plane/src/modules/twin/workflow-parser.ts apps/control-plane/src/modules/twin/workflow-routes.spec.ts apps/control-plane/src/modules/twin/workflow-sync.spec.ts apps/control-plane/src/modules/twin/workflow-sync.ts docs/ops/local-dev.md packages/domain/src/twin.ts plans/EP-0024-ci-workflow-and-test-suite-extraction.md` succeeded.
- `pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/twin/workflow-discovery.spec.ts src/modules/twin/workflow-sync.spec.ts src/modules/twin/workflow-routes.spec.ts src/modules/twin/drizzle-repository.spec.ts` passed.
- `pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/twin/workflow-discovery.spec.ts src/modules/twin/workflow-sync.spec.ts src/modules/twin/workflow-routes.spec.ts src/modules/twin/drizzle-repository.spec.ts src/modules/twin/service.spec.ts src/modules/twin/routes.spec.ts src/modules/twin/metadata-sync.spec.ts` passed with 27 tests across 7 files.
- `pnpm db:generate` passed with no schema changes required.
- `pnpm db:migrate` passed.
- `pnpm run db:migrate:ci` passed.
- `pnpm repo:hygiene` passed.
- `pnpm lint` passed.
- `pnpm typecheck` passed after extending the affected test doubles for the new twin service port methods and tightening one workflow-sync iteration type.
- `pnpm build` passed.
- `pnpm test` passed with 49 control-plane test files and 209 tests green.
- `pnpm ci:repro:current` passed, including the temp-worktree `ci:static`, DB prep and migration, integration test run, and clean-tree verification.

Live smoke evidence:

- Live GitHub App env was present in the local `.env` through `GITHUB_APP_ID`, `GITHUB_APP_PRIVATE_KEY_BASE64`, `GITHUB_WEBHOOK_SECRET`, and `DATABASE_URL`; no secrets were printed.
- Because this workspace remote is `616xold/pocket-cto-starter`, the live proof used a temporary shallow checkout of `https://github.com/616xold/pocket-cto.git` and set `POCKET_CTO_SOURCE_REPO_ROOT` to that checkout so the existing M3.2 source resolver could verify the requested repo truthfully.
- `POST /github/installations/sync` succeeded with `syncedCount: 1`.
- `POST /github/repositories/sync` succeeded with `syncedInstallationCount: 1` and `syncedRepositoryCount: 1`.
- `POST /twin/repositories/616xold/pocket-cto/workflows-sync` succeeded with sync run `09c57e13-012e-4eb9-a1e6-2c4ec4664f86`, `workflowFileCount: 1`, `workflowCount: 1`, and `jobCount: 2`.
- `GET /twin/repositories/616xold/pocket-cto/workflows` returned the same stored counts with `workflowState: workflows_available` and the same latest run id.

Exact changed files in this slice:

- `apps/control-plane/package.json`
- `apps/control-plane/src/bootstrap.spec.ts`
- `apps/control-plane/src/lib/types.ts`
- `apps/control-plane/src/modules/orchestrator/drizzle-service.spec.ts`
- `apps/control-plane/src/modules/twin/drizzle-repository.spec.ts`
- `apps/control-plane/src/modules/twin/drizzle-repository.ts`
- `apps/control-plane/src/modules/twin/routes.ts`
- `apps/control-plane/src/modules/twin/schema.ts`
- `apps/control-plane/src/modules/twin/service.ts`
- `apps/control-plane/src/modules/twin/workflow-discovery.spec.ts`
- `apps/control-plane/src/modules/twin/workflow-discovery.ts`
- `apps/control-plane/src/modules/twin/workflow-formatter.ts`
- `apps/control-plane/src/modules/twin/workflow-parser.ts`
- `apps/control-plane/src/modules/twin/workflow-routes.spec.ts`
- `apps/control-plane/src/modules/twin/workflow-sync.spec.ts`
- `apps/control-plane/src/modules/twin/workflow-sync.ts`
- `docs/ops/local-dev.md`
- `packages/domain/src/twin.ts`
- `plans/EP-0024-ci-workflow-and-test-suite-extraction.md`
- `pnpm-lock.yaml`

Replay and evidence implications:

- no new mission replay events are expected because this slice does not change mission or task lifecycle behavior
- the durable evidence surface is the workflow sync run plus the stored workflow read route
- the final closeout must still state objective, change summary, validation evidence, risks, rollback guidance, and whether M3.4B can now start cleanly

## Interfaces and Dependencies

Important existing interfaces and modules for this slice:

- `GitHubAppService` methods `getRepository(...)` and `resolveWritableRepository(...)`
- twin contracts in `packages/domain/src/twin.ts`
- twin repository and service seams in `apps/control-plane/src/modules/twin/`
- source verification in `apps/control-plane/src/modules/twin/source-resolver.ts`
- current metadata and ownership extractor patterns in `metadata-sync.ts`, `repository-metadata-extractor.ts`, and `ownership-sync.ts`
- app wiring in `apps/control-plane/src/bootstrap.ts` and `apps/control-plane/src/lib/types.ts`

New or expanded interfaces expected by the end of this slice:

- a workflow discovery helper that returns deterministic file paths plus file stats
- a workflow parser that normalizes workflow names, trigger summaries, job facts, and compact step summaries
- a repo-scoped workflow sync method on the twin service and app container port
- a stored workflow read-model contract in `packages/domain/src/twin.ts`

No new environment variables are expected.
No new GitHub App permissions or webhook subscriptions are expected.
If a YAML parser is added, it should be declared directly in `@pocket-cto/control-plane` rather than relying on a transitive lockfile entry.

## Outcomes & Retrospective

M3.4A is complete.
Pocket CTO can now discover workflow files only under `.github/workflows`, parse deterministic workflow and job facts, persist `ci_workflow_file`, `ci_workflow`, and `ci_job` entities plus the required workflow edges, and expose a stored `GET /twin/repositories/:owner/:repo/workflows` read route backed by the latest successful workflow sync snapshot.

The slice stayed inside the existing twin architecture:

- repo targeting still flows through the GitHub App repository registry
- source verification still flows through the existing M3.2 source resolver
- persistence stays additive inside the generic twin entity and edge tables
- thin routes delegate immediately to the twin service
- no replay events, schema redesign, docs indexing, freshness scoring, blast-radius logic, or test-suite extraction were added

Residual risks and follow-up notes:

- The current parser intentionally captures only one workflow definition per file and compact job step summaries; M3.4B can build on these persisted facts but should not assume richer step-level graph detail exists yet.
- Live workflow sync still depends on having a truthful local checkout of the requested synced repository; when the active workspace remote differs, operators must point `POCKET_CTO_SOURCE_REPO_ROOT` at the correct repo checkout.

Rollback remains straightforward:

- revert the workflow modules, twin service or route wiring, docs updates, package dependency change, and this ExecPlan together
- leave persisted workflow twin rows in place rather than performing manual destructive cleanup

M3.4B can now start cleanly on top of the repo-scoped workflow sync-run, stored workflow read model, and deterministic keying patterns introduced here.
