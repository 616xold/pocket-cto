# EP-0024 - Extract CI workflow facts into the repo-scoped twin and expose stored workflow reads

This ExecPlan is a living document. Keep `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` current.

## Purpose / Big Picture

After this slice, Pocket CTO can inspect one synced repository, discover workflow files under `.github/workflows`, parse durable CI workflow and job facts deterministically, derive durable test-suite facts from stored package manifests, persist those facts plus honest CI-to-test linkage into the repo-scoped twin, and return concise stored workflow plus CI/test summaries through thin control-plane routes.
Operators will be able to trigger repo-scoped workflow sync and test-suite sync passes, inspect the resulting sync runs, and read stored workflow, test-suite, and CI linkage summaries without rescanning the repository on every GET.

This plan covers roadmap submilestone `M3.4 CI workflow and test suite extraction`.
Prompt A implemented `M3.4A CI workflow extraction`.
The active prompt now implements `M3.4B durable test-suite extraction and CI linkage`.
The current follow-up prompt closes the remaining `M3.4 live proof tooling` gap with a repeatable route-driven smoke helper, script alias, and doc refresh.
It still explicitly stops before docs indexing, freshness scoring, blast-radius answers, or redesigning the existing metadata and ownership slices.

## Progress

- [x] (2026-03-19T00:00:00Z) Read the requested repo docs, roadmap, M3.1/M3.2/M3.3 ExecPlans, the named skills, the requested twin or bootstrap files, and ran the required inspections `rg -n "workflow|ci.yml|\\.github/workflows|pnpm test|vitest|playwright|jest|cypress|turbo test|test:" .github apps packages docs plans package.json`, `git status --short`, and `git diff --name-only HEAD`.
- [x] (2026-03-19T00:00:00Z) Captured the required pre-coding M3.4A workflow extraction gap note in-thread, confirming that the twin spine, metadata extractor, and ownership layer already provide repo-scoped sync runs, registry-backed targeting, truthful local source resolution, idempotent entity or edge upserts, and stored read-route patterns.
- [x] (2026-03-19T00:00:00Z) Created EP-0024 before coding so the workflow slice stays self-contained, additive, and resumable.
- [x] (2026-03-19T00:00:00Z) Implemented the M3.4A workflow slice inside the twin bounded context: added workflow discovery and YAML parsing helpers, added a dedicated `workflows-sync` path, persisted `ci_workflow_file`, `ci_workflow`, and `ci_job` entities plus the required workflow edges, and exposed thin `workflows-sync` and `workflows` routes.
- [x] (2026-03-19T00:00:00Z) Added focused workflow coverage for discovery scope, truthful zero-workflow sync success, deterministic workflow-name fallback, stable job keys on rerun, clean route responses, and the legacy `ci_job -> ciJob` compatibility mapping; the narrow twin spec command passed after a small test-clock fix.
- [x] (2026-03-19T00:00:00Z) Updated `docs/ops/local-dev.md` and declared a direct YAML parser dependency for `@pocket-cto/control-plane` so the workflow slice stays explicit instead of relying on a transitive hoist.
- [x] (2026-03-19T02:32:00Z) Ran the full required validation matrix successfully: `pnpm db:generate`, `pnpm db:migrate`, `pnpm run db:migrate:ci`, `pnpm repo:hygiene`, `pnpm lint`, `pnpm typecheck`, `pnpm build`, `pnpm test`, and `pnpm ci:repro:current`.
- [x] (2026-03-19T02:32:00Z) Confirmed live GitHub App env was available through the local `.env`, synced GitHub installations plus the repository registry, and completed one real workflow sync for `616xold/pocket-cto` using a temporary local checkout so the existing source resolver could stay truthful without product-side clone fallback.
- [x] (2026-03-19T03:00:00Z) Re-read the requested M3.4B files plus the named skills, ran the required inspections `rg -n "package_manifest|scriptNames|pnpm test|vitest|playwright|jest|cypress|test:" .github apps packages docs plans package.json`, `git status --short`, and `git diff --name-only HEAD`, confirmed the worktree was clean, and captured the required pre-coding M3.4B test-suite extraction gap note in-thread.
- [x] (2026-03-19T03:00:00Z) Implemented the M3.4B stored test-suite extraction slice inside the twin bounded context: added a dedicated `test-suites-sync` extractor, derived `test_suite` entities from stored manifest script keys, persisted `package_manifest_declares_test_suite` plus `ci_job_runs_test_suite` edges, exposed thin `test-suites` and `ci-summary` routes, and updated the legacy `test_suite -> testSuite` compatibility mapping.
- [x] (2026-03-19T03:00:00Z) Added focused M3.4B coverage for stable suite derivation, rerun idempotence, explicit job-to-suite mapping, explicit unmapped jobs, route summaries, and a pre-existing ownership route-spec race that the widened twin test ring surfaced and fixed.
- [x] (2026-03-19T03:12:00Z) Reran the full validation matrix successfully, completed the live GitHub App smoke for `616xold/pocket-cto`, and recorded the final M3.4B evidence plus changed-file set in this ExecPlan.
- [x] (2026-03-19T03:20:00Z) Re-read the requested M3.4 proof files plus the named skills, ran the required inspections `rg -n "smoke:twin|workflows-sync|test-suites-sync|ci-summary|mappedJobCount|unmappedJobCount|workflow file count|test suite count" package.json docs plans apps`, `git status --short`, and `git diff --name-only HEAD`, confirmed the worktree was clean, and captured the required pre-coding M3.4 live proof tooling gap note in-thread.
- [x] (2026-03-19T13:56:00Z) Added the repeatable route-driven `tools/twin-ci-smoke.mjs` helper plus `pnpm smoke:twin-ci:live`, refreshed the local-dev and ExecPlan wording so the conservative `mappedJobCount: 0` outcome is documented honestly, reran the full validation matrix, and captured the exact live smoke result from the packaged command.

## Surprises & Discoveries

- Observation: the current generic twin schema is already open-ended enough to store CI workflow facts without a required schema migration.
  Evidence: `packages/db/src/schema/twin.ts` already keys entities by `repo_full_name + kind + stable_key`, keys edges by repo plus endpoints, and stores generic JSON payloads plus `sourceRunId`.

- Observation: no workflow extraction code or route exists yet.
  Evidence: `rg -n "ci_workflow|ci_job|workflows-sync|workflow_file|workflow_contains_job|repository_has_ci_workflow_file|workflow_file_defines_workflow" apps/control-plane/src packages/domain/src packages/db/src docs/ops/local-dev.md plans` returned no current implementation hits.

- Observation: M3.2 and M3.3 already define the right architectural pattern for this slice.
  Evidence: `source-resolver.ts`, `metadata-sync.ts`, and `ownership-sync.ts` already prove the repo-scoped extractor pattern of registry-first targeting, truthful local-checkout verification, sync-run lifecycle persistence, idempotent upserts, and stored summary reads.

- Observation: YAML parsing is not currently declared directly in `@pocket-cto/control-plane`.
  Evidence: `apps/control-plane/package.json` has no direct `yaml` or `js-yaml` dependency even though the lockfile contains transitive YAML parsers.

- Observation: the stored `package_manifest` twin entities already carry deterministic suite-discovery inputs, but they do not carry script command bodies.
  Evidence: `repository-metadata-extractor.ts` persists only `path`, `packageName`, `private`, `hasWorkspaces`, and sorted `scriptNames`, so M3.4B can safely derive suites from script keys but cannot justify broad command inference from manifest payloads alone.

- Observation: widening the twin test ring surfaced an existing race in the ownership route fixture helper.
  Evidence: `routes.spec.ts` wrote `.github/CODEOWNERS` in parallel with `mkdir(".github")`, which produced an `ENOENT` on a clean rerun until the helper was made sequential.

- Observation: M3.4 had live proof evidence but still lacked a reusable helper and package alias like the earlier M3.2 and M3.3 slices.
  Evidence: `rg -n "smoke:twin|workflows-sync|test-suites-sync|ci-summary|mappedJobCount|unmappedJobCount|workflow file count|test suite count" package.json docs plans apps` showed `smoke:twin-metadata:live` and `smoke:twin-ownership:live`, but no dedicated `smoke:twin-ci:live` command before this follow-up.

- Observation: the current deterministic matcher can leave every live workflow job unmapped even when test-suite extraction succeeds.
  Evidence: `pnpm smoke:twin-ci:live -- --source-repo-root /var/folders/41/pj1kw0tj2xd832wl_62gn73m0000gn/T//pocket-cto-m34-proof-jxeb9Q` returned `testSuiteCount: 9`, `mappedJobCount: 0`, and `unmappedJobCount: 2` for `616xold/pocket-cto`.

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

- Decision: implement M3.4B as a separate `test-suites-sync` extractor that reads stored manifest and workflow-job entities instead of widening `workflows-sync`.
  Rationale: workflow discovery should stay local-checkout based while test-suite extraction should remain a stored-data pass over existing manifest and job rows.
  Date/Author: 2026-03-19 / Codex

- Decision: derive test suites only from stored manifest script keys `test` and `test:*`, and match workflow jobs only when a `run` command clearly invokes one of those script keys through deterministic package-manager patterns.
  Rationale: the prompt explicitly prefers honest linkage over broad shell guessing, and the stored manifest payloads do not justify wider inference.
  Date/Author: 2026-03-19 / Codex

- Decision: close the remaining M3.4 proof gap with a checked-in `tools/twin-ci-smoke.mjs` helper and root `pnpm smoke:twin-ci:live` alias instead of relying on one-off `tsx --eval` snippets.
  Rationale: M3.2 and M3.3 already use tiny route-driven helpers for reproducible live proof, and that pattern keeps the M3.4 evidence app-first, GitHub App-first, operator-safe, and easy to rerun.
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

The product slice itself is now complete: Pocket CTO persists workflow, job, and test-suite facts plus honest CI-to-test linkage and exposes stored `workflows`, `test-suites`, and `ci-summary` read routes.
What the follow-up prompt closed was the remaining proof/tooling gap: before this pass, the live M3.4 evidence depended on one-off thread snippets instead of a checked-in repeatable helper and package alias.

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

The planned new or expanded M3.4 files are:

- `apps/control-plane/src/modules/twin/workflow-discovery.ts`
- `apps/control-plane/src/modules/twin/workflow-parser.ts`
- `apps/control-plane/src/modules/twin/workflow-sync.ts`
- `apps/control-plane/src/modules/twin/workflow-formatter.ts`
- `apps/control-plane/src/modules/twin/test-suite-sync.ts`
- `apps/control-plane/src/modules/twin/test-suite-matcher.ts`
- `apps/control-plane/src/modules/twin/test-suite-formatter.ts`
- the touched twin service, route, schema, repository, formatter, and spec files

This slice should preserve boundaries:

- `packages/domain` stays pure and adds only shared read-model or sync-result contracts
- `packages/db` should remain unchanged unless implementation proves a schema extension is actually required
- `apps/control-plane/src/modules/twin/` owns workflow discovery, parsing, stored manifest or job matching, persistence orchestration, and route formatting
- routes stay thin and must not walk the filesystem or parse YAML inline

No new environment variables are expected.
No new GitHub App permissions or webhook subscriptions are expected.
`WORKFLOW.md` and stack packs should remain accurate without changes.

## Plan of Work

Keep the shipped M3.4 workflow and test-suite extractors intact and close only the remaining proof-refresh gap.

Add one checked-in `tools/twin-ci-smoke.mjs` helper that:

- loads local env the same safe way as the other repo smoke tools
- requires `--source-repo-root` or `POCKET_CTO_SOURCE_REPO_ROOT`
- boots the control plane in-process and drives only the existing GitHub plus twin routes
- prints only safe summary fields for the repo, sync runs, and CI counts

Wire that helper to one root `package.json` alias, update `docs/ops/local-dev.md` with the exact command, and refresh this ExecPlan so the latest live proof no longer depends on one-off `tsx --eval` notes.

Expected file edits for this proof-refresh follow-up are:

- `package.json`
- `tools/twin-ci-smoke.mjs`
- `docs/ops/local-dev.md`
- `plans/EP-0024-ci-workflow-and-test-suite-extraction.md`

No schema or product-code changes are expected unless the packaged live smoke exposes a real bug.

## Concrete Steps

Run these commands from the repository root as needed:

    rg -n "package_manifest|scriptNames|pnpm test|vitest|playwright|jest|cypress|test:" .github apps packages docs plans package.json
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

    pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/twin/test-suite-sync.spec.ts src/modules/twin/test-suite-routes.spec.ts src/modules/twin/workflow-sync.spec.ts src/modules/twin/workflow-routes.spec.ts src/modules/twin/drizzle-repository.spec.ts
    rg -n "test_suite|ci_job_runs_test_suite|package_manifest_declares_test_suite|ci-summary|test-suites" apps/control-plane/src packages/domain/src docs/ops/local-dev.md
    pnpm smoke:twin-ci:live -- --source-repo-root /absolute/path/to/pocket-cto

If live GitHub env is present after implementation:

    curl -X POST http://localhost:4000/github/repositories/sync
    curl -X POST http://localhost:4000/twin/repositories/616xold/pocket-cto/workflows-sync
    curl -X POST http://localhost:4000/twin/repositories/616xold/pocket-cto/test-suites-sync
    curl http://localhost:4000/twin/repositories/616xold/pocket-cto/ci-summary

Record only the repo full name, workflow file count, job count, test suite count, mapped or unmapped job counts, and the test-suite sync-run id.
Do not print secrets, tokens, or raw auth headers.

## Validation and Acceptance

Success for M3.4 is demonstrated when all of the following are true:

1. Workflow sync uses the existing repository registry and the existing twin source resolver; it does not clone repositories or invent a second source-selection path.
2. Discovery scans only `.github/workflows` and only `.yml` or `.yaml` files beneath that directory.
3. When no workflow files exist, `POST /twin/repositories/:owner/:repo/workflows-sync` succeeds truthfully, finishes the sync run as `succeeded`, and reports zero workflow files, zero workflows, and zero jobs.
4. The workflow slice persists `ci_workflow_file`, `ci_workflow`, and `ci_job` entities with deterministic stable keys plus the required workflow edges.
5. Workflow-file payloads include at least relative path plus cheap file stats when available.
6. Workflow payloads include at least name plus normalized trigger summary.
7. Job payloads include at least job key, display name when present, normalized `runs-on`, normalized `needs`, permissions when present, and a compact list of step `run` or `uses` entries.
8. Workflow name fallback is deterministic when the YAML omits `name`.
9. Repeated workflow syncs converge on the same workflow-file, workflow, and job entity ids instead of duplicating them.
10. `GET /twin/repositories/:owner/:repo/workflows` returns a clean stored workflow summary and job summaries without rescanning the repository.
11. Test-suite extraction reads only stored `package_manifest` entities and derives suites only from deterministic script keys `test` and `test:*`.
12. Test-suite sync persists `test_suite` entities keyed by repo plus manifest path plus script key.
13. Test-suite sync persists `package_manifest_declares_test_suite` edges for each derived suite and `ci_job_runs_test_suite` edges only when a workflow job `run` command clearly invokes the suite through deterministic package-manager patterns.
14. Repeated test-suite syncs converge on the same suite ids and do not duplicate suite rows.
15. When jobs cannot be mapped honestly, they remain explicit as unmapped jobs in the stored summary instead of being force-matched.
16. `GET /twin/repositories/:owner/:repo/test-suites` returns a concise stored suite view with matched jobs and explicit unmapped jobs.
17. `GET /twin/repositories/:owner/:repo/ci-summary` returns repo summary, workflow counts, test-suite counts, mapped or unmapped job counts, and suite-to-job linkage without rescanning the repository.
18. The test-suite and CI summary views derive from the latest successful workflow and test-suite sync snapshots so reruns remain truthful.
19. `docs/ops/local-dev.md` documents the workflow, test-suite, and CI summary routes honestly, without claiming docs indexing, freshness scoring, or blast-radius behavior.
20. The full validation matrix plus `pnpm ci:repro:current` passes after the slice lands.
21. A repeatable route-driven M3.4 live smoke helper exists under `tools/`, has a root package alias, and calls only the existing GitHub plus twin routes.
22. The docs and ExecPlan explicitly state that `mappedJobCount` may truthfully be `0` under the current conservative matcher.

Human acceptance after implementation should look like:

    curl -i -X POST http://localhost:4000/twin/repositories/OWNER/REPO/workflows-sync
    curl -i -X POST http://localhost:4000/twin/repositories/OWNER/REPO/test-suites-sync
    curl -i http://localhost:4000/twin/repositories/OWNER/REPO/workflows
    curl -i http://localhost:4000/twin/repositories/OWNER/REPO/test-suites
    curl -i http://localhost:4000/twin/repositories/OWNER/REPO/ci-summary
    pnpm smoke:twin-ci:live -- --source-repo-root /absolute/path/to/OWNER-REPO-checkout

For a synced repo with workflow files and stored package manifests, the sync routes should return succeeded runs with truthful counts and the read routes should return stored workflow, suite, and CI linkage summaries.
For a synced repo without workflow files or without derivable test suites, the sync routes should still succeed and the read routes should return truthful empty snapshots and explicit unmapped-job state when applicable.

## Idempotence and Recovery

Workflow sync must be safe to rerun.
Stable entity keys should converge on:

- `ci_workflow_file` by discovered file path
- `ci_workflow` by discovered file path plus workflow name or deterministic file fallback
- `ci_job` by discovered file path plus job key
- `test_suite` by manifest path plus script key

Edge upserts should converge on the same repository-to-file, file-to-workflow, workflow-to-job, manifest-to-suite, and job-to-suite relationships.

If a sync fails after the run starts, the run must finish as `failed` with an error summary so operators can distinguish extraction failures from truthful “no workflow files” absence.
The same rule applies to test-suite sync: fixing a stored-manifest or linkage issue should produce a new run while converging on the same suite entity and edge ids.
Retrying the same repo after fixing the local checkout or YAML issue should create a new sync run and converge on the same workflow entity and edge ids.
Conservative linkage should remain honest on rerun: jobs that do not clearly invoke a stored suite should stay unmapped.

Safe rollback guidance:

- revert the workflow or test-suite modules, route additions, docs updates, and this ExecPlan together
- do not delete existing twin rows manually during rollback; persisted workflow and suite facts are additive and can remain inert
- if implementation unexpectedly needs a schema change, keep it additive-first and roll it back only through the repo migration workflow

## Artifacts and Notes

Required pre-coding gap note captured in-thread:

1. The twin spine, metadata extractor, and ownership layer already give us repo-scoped sync runs, idempotent entity or edge upserts, registry-backed repo targeting, truthful local source resolution, and stored route patterns.
2. Durable CI workflow extraction is still missing scoped workflow-file discovery, deterministic YAML parsing, durable workflow-file/workflow/job persistence, and stored workflow read routes.
3. The planned edit surface includes the new ExecPlan, new twin workflow modules, touched twin service or route or formatter seams, shared domain contracts, focused tests, docs, and likely a direct YAML dependency for `@pocket-cto/control-plane`.
4. The chosen strategy is `.github/workflows` discovery only, deterministic workflow and job parsing, stable repo-scoped entity keys, and read models derived from the latest successful workflow sync snapshot.

Validation evidence:

- `pnpm --filter @pocket-cto/control-plane add yaml@^2.4.2` succeeded and updated the package manifest plus lockfile for an explicit workflow parser dependency.
- `pnpm exec prettier --write apps/control-plane/src/bootstrap.spec.ts apps/control-plane/src/lib/types.ts apps/control-plane/src/modules/orchestrator/drizzle-service.spec.ts apps/control-plane/src/modules/twin/drizzle-repository.spec.ts apps/control-plane/src/modules/twin/drizzle-repository.ts apps/control-plane/src/modules/twin/routes.spec.ts apps/control-plane/src/modules/twin/routes.ts apps/control-plane/src/modules/twin/schema.ts apps/control-plane/src/modules/twin/service.ts apps/control-plane/src/modules/twin/test-suite-formatter.ts apps/control-plane/src/modules/twin/test-suite-matcher.ts apps/control-plane/src/modules/twin/test-suite-routes.spec.ts apps/control-plane/src/modules/twin/test-suite-sync.spec.ts apps/control-plane/src/modules/twin/test-suite-sync.ts docs/ops/local-dev.md packages/domain/src/twin.ts plans/EP-0024-ci-workflow-and-test-suite-extraction.md` succeeded.
- `pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/twin/workflow-discovery.spec.ts src/modules/twin/workflow-sync.spec.ts src/modules/twin/workflow-routes.spec.ts src/modules/twin/drizzle-repository.spec.ts` passed.
- `pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/twin/test-suite-sync.spec.ts src/modules/twin/test-suite-routes.spec.ts src/modules/twin/workflow-sync.spec.ts src/modules/twin/workflow-routes.spec.ts src/modules/twin/drizzle-repository.spec.ts` passed with 13 tests across 5 files.
- `pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/twin/test-suite-sync.spec.ts src/modules/twin/test-suite-routes.spec.ts src/modules/twin/workflow-sync.spec.ts src/modules/twin/workflow-routes.spec.ts src/modules/twin/drizzle-repository.spec.ts src/modules/twin/service.spec.ts src/modules/twin/routes.spec.ts src/modules/twin/metadata-sync.spec.ts` passed with 29 tests across 8 files after fixing the pre-existing `.github/CODEOWNERS` fixture race in `routes.spec.ts`.
- `pnpm db:generate` passed with no schema changes required.
- `pnpm db:migrate` passed.
- `pnpm run db:migrate:ci` passed.
- `pnpm repo:hygiene` passed.
- `pnpm lint` passed.
- `pnpm typecheck` passed after extending the affected test doubles for the new twin service port methods.
- `pnpm build` passed.
- `pnpm test` passed with 51 control-plane test files and 213 tests green.
- `pnpm ci:repro:current` passed, including the temp-worktree `ci:static`, DB prep and migration, integration test run, and clean-tree verification.
- `pnpm smoke:twin-ci:live -- --source-repo-root /var/folders/41/pj1kw0tj2xd832wl_62gn73m0000gn/T//pocket-cto-m34-proof-jxeb9Q` passed and replaced the earlier one-off `tsx --eval` proof path with a checked-in route-driven helper.

Live smoke evidence:

- Live GitHub App env was present in the local `.env` through `GITHUB_APP_ID`, `GITHUB_APP_PRIVATE_KEY_BASE64`, `GITHUB_WEBHOOK_SECRET`, and `DATABASE_URL`; no secrets were printed.
- Because this workspace remote is `616xold/pocket-cto-starter`, the repeatable live proof used a temporary shallow checkout of `https://github.com/616xold/pocket-cto.git` at `/var/folders/41/pj1kw0tj2xd832wl_62gn73m0000gn/T//pocket-cto-m34-proof-jxeb9Q` and set `POCKET_CTO_SOURCE_REPO_ROOT` to that checkout so the existing M3.2 source resolver could verify the requested repo truthfully.
- The repeatable proof command is now `pnpm smoke:twin-ci:live -- --source-repo-root /var/folders/41/pj1kw0tj2xd832wl_62gn73m0000gn/T//pocket-cto-m34-proof-jxeb9Q`.
- `POST /github/installations/sync` succeeded with `syncedCount: 1`.
- `POST /github/repositories/sync` succeeded with `syncedInstallationCount: 1` and `syncedRepositoryCount: 1`.
- `POST /twin/repositories/616xold/pocket-cto/metadata-sync` succeeded with sync run `c793ba19-6178-4eee-8f51-2d2f85439db2`.
- `POST /twin/repositories/616xold/pocket-cto/workflows-sync` succeeded with sync run `12720add-1f60-4d82-96ee-0e1209466f81`, `workflowFileCount: 1`, `workflowCount: 1`, and `jobCount: 2`.
- `POST /twin/repositories/616xold/pocket-cto/test-suites-sync` succeeded with sync run `8e0af1ce-b60c-46c7-86ef-ed966e407c5f`, `testSuiteCount: 9`, `mappedJobCount: 0`, and `unmappedJobCount: 2`.
- `GET /twin/repositories/616xold/pocket-cto/ci-summary` returned `workflowFileCount: 1`, `workflowCount: 1`, `jobCount: 2`, `testSuiteCount: 9`, `mappedJobCount: 0`, and `unmappedJobCount: 2`.
- The live repo stayed honest: `mappedJobCount` was truthfully `0` because neither stored job `run` command clearly invoked one of the stored manifest `test` or `test:*` script keys through the deterministic matcher.

Exact changed files in this proof-refresh follow-up:

- `package.json`
- `tools/twin-ci-smoke.mjs`
- `docs/ops/local-dev.md`
- `plans/EP-0024-ci-workflow-and-test-suite-extraction.md`

Replay and evidence implications:

- no new mission replay events are expected because this slice does not change mission or task lifecycle behavior
- the durable evidence surface is the workflow sync run, the test-suite sync run, and the stored `workflows`, `test-suites`, and `ci-summary` read routes
- the final closeout must still state objective, change summary, validation evidence, risks, rollback guidance, and whether M3.4B can now start cleanly

## Interfaces and Dependencies

Important existing interfaces and modules for this slice:

- `GitHubAppService` methods `getRepository(...)` and `resolveWritableRepository(...)`
- twin contracts in `packages/domain/src/twin.ts`
- twin repository and service seams in `apps/control-plane/src/modules/twin/`
- source verification in `apps/control-plane/src/modules/twin/source-resolver.ts`
- current metadata and ownership extractor patterns in `metadata-sync.ts`, `repository-metadata-extractor.ts`, and `ownership-sync.ts`
- app wiring in `apps/control-plane/src/bootstrap.ts` and `apps/control-plane/src/lib/types.ts`

New or expanded interfaces in this proof-refresh follow-up:

- the root `package.json` smoke alias `smoke:twin-ci:live`
- the route-driven helper `tools/twin-ci-smoke.mjs`

No new environment variables are expected.
No new GitHub App permissions or webhook subscriptions are expected.
If a YAML parser is added, it should be declared directly in `@pocket-cto/control-plane` rather than relying on a transitive lockfile entry.

## Outcomes & Retrospective

M3.4 is complete.
Pocket CTO can now discover workflow files only under `.github/workflows`, parse deterministic workflow and job facts, persist `ci_workflow_file`, `ci_workflow`, and `ci_job` entities plus the required workflow edges, derive stored `test_suite` entities from manifest script keys `test` and `test:*`, persist honest `package_manifest_declares_test_suite` and `ci_job_runs_test_suite` edges, and expose stored `GET /twin/repositories/:owner/:repo/workflows`, `GET /twin/repositories/:owner/:repo/test-suites`, and `GET /twin/repositories/:owner/:repo/ci-summary` routes backed by the latest successful sync snapshots.

The slice stayed inside the existing twin architecture:

- repo targeting still flows through the GitHub App repository registry
- source verification still flows through the existing M3.2 source resolver for workflow discovery
- test-suite extraction stays a stored-data pass over prior metadata and workflow rows
- persistence stays additive inside the generic twin entity and edge tables
- thin routes delegate immediately to the twin service
- no replay events, schema redesign, docs indexing, freshness scoring, or blast-radius logic were added

Residual risks and follow-up notes:

- Suite derivation is intentionally limited to stored manifest script keys because manifest payloads do not include script command bodies.
- Job-to-suite linkage is intentionally conservative and currently recognizes only clear package-manager invocations, so some real CI jobs will remain explicitly unmapped until a future slice broadens the matcher with justified evidence.
- Live workflow sync still depends on having a truthful local checkout of the requested synced repository; when the active workspace remote differs, operators must point `POCKET_CTO_SOURCE_REPO_ROOT` at the correct repo checkout.

Rollback remains straightforward:

- revert the test-suite modules, twin service or route wiring, docs updates, and this ExecPlan together
- leave persisted workflow and test-suite twin rows in place rather than performing manual destructive cleanup

M3.4 now has a fully current proof base.
The slice is no longer relying on one-off `tsx --eval` snippets for its live evidence: the checked-in `pnpm smoke:twin-ci:live` helper drives the full route path, the local-dev guide points at that exact command, and both the docs and this ExecPlan now say plainly that `mappedJobCount` may honestly remain `0` under the conservative matcher.

Residual wording risk is low, but the M3.4 proof surface should be kept in sync if later slices broaden the matcher, add richer job-to-suite evidence, or change the required live target repository.

M3.5 now has a fully current proof base to build on.
