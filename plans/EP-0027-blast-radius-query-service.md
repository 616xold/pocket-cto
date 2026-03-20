# EP-0027 - Answer stored twin blast-radius queries through a deterministic read-model route

This ExecPlan is a living document. Keep `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` current.

## Purpose / Big Picture

After this slice, Pocket CTO can answer a direct operator question it cannot answer today: "What is the stored blast radius of these changed repository paths?"
Operators will be able to call one thin repo-scoped query route with a narrow deterministic payload and receive an operator-readable answer built only from the stored engineering twin: impacted workspace directories, primary impacted manifests, effective owners when present, related stored test suites, related mapped CI jobs, freshness posture, and explicit limitations.

This plan covers roadmap submilestone `M3.7 blast-radius query service`.
It intentionally stops before discovery-mission formatting, natural-language parsing, new extraction passes, deeper file-graph analysis, or widening into roadmap `M3.8`.

## Progress

- [x] (2026-03-20T00:40:58Z) Read the required repo instructions, roadmap, M3.2 through M3.6 ExecPlans, the named skills, the requested twin or bootstrap files, and ran the required inspections `rg -n "ownership-summary|ci-summary|freshness|workspace_directory|package_manifest|rule_owns_manifest|rule_owns_directory|ci_job_runs_test_suite|runbooks|docs|unmappedJobs|reasonCode" apps packages docs plans`, `git status --short`, and `git diff --name-only HEAD`.
- [x] (2026-03-20T00:40:58Z) Captured the required in-thread `M3.7 blast-radius gap` note before editing, confirming that the twin already persists the stored metadata, ownership, CI, and freshness facts needed for a read-only blast-radius answer, but lacks a deterministic query route and answer-shaping layer.
- [x] (2026-03-20T00:40:58Z) Created EP-0027 before coding so the new route surface, matching rules, limitations policy, and validation matrix stay explicit and resumable.
- [x] (2026-03-20T00:56:36Z) Added shared blast-radius request and response contracts in `packages/domain/src/twin.ts`, wired parsing in `apps/control-plane/src/modules/twin/schema.ts`, extended `TwinServicePort`, and shipped the thin `POST /twin/repositories/:owner/:repo/blast-radius/query` route.
- [x] (2026-03-20T00:56:36Z) Implemented the stored-state blast-radius query layer in new helper modules under `apps/control-plane/src/modules/twin/`, keeping path matching, limitation building, and answer shaping inside the twin bounded context without adding persistence or sync side effects.
- [x] (2026-03-20T00:56:36Z) Added focused tests for deterministic directory and manifest matching, ownership visibility, stored-edge-only suite and job linkage, unmatched path handling, stale or failed freshness limitations, route behavior, and the no-new-persistence contract.
- [x] (2026-03-20T00:56:36Z) Updated `docs/ops/local-dev.md` with the new blast-radius route, request shape, matching semantics, and conservative stored-state-only response expectations.
- [x] (2026-03-20T00:56:36Z) Ran the full requested validation matrix successfully and captured a real persisted-state blast-radius query against `616xold/pocket-cto`.

## Surprises & Discoveries

- Observation: the existing twin read surfaces already expose most of the facts the new query needs, so M3.7 can stay read-model focused instead of widening persistence.
  Evidence: `apps/control-plane/src/modules/twin/service.ts` already derives stored metadata, ownership, CI, docs, runbooks, and freshness summaries from repo-scoped twin runs, entities, and edges.

- Observation: the stored metadata and ownership slices already codify the exact target types the user asked to use for blast radius.
  Evidence: `workspace_directory` and `package_manifest` are persisted by `repository-metadata-extractor.ts`, and effective ownership is already materialized through `rule_owns_directory` and `rule_owns_manifest`.

- Observation: mapped CI coverage is already intentionally conservative, so M3.7 should preserve that posture and surface limitations instead of broadening matching.
  Evidence: `apps/control-plane/src/modules/twin/test-suite-sync.ts`, `test-suite-matcher.ts`, and `test-suite-formatter.ts` derive suites only from stored manifest scripts and jobs only from stored `ci_job_runs_test_suite` edges, while explicit unmapped jobs already carry `reasonCode` and `reasonSummary`.

## Decision Log

- Decision: implement the blast-radius answer as a stored-state query layer inside the existing twin bounded context instead of adding new persistence.
  Rationale: the prompt explicitly says to keep this slice read-model and route focused, avoid new twin persistence unless blocked, and answer only from already stored twin state.
  Date/Author: 2026-03-20 / Codex

- Decision: keep the route payload narrow with one fixed `questionKind` enum value, `auth_change`, plus explicit `changedPaths`.
  Rationale: the user explicitly asked not to add natural-language parsing and to keep the request deterministic.
  Date/Author: 2026-03-20 / Codex

- Decision: use all matching stored `workspace_directory` targets for a changed path, but only the nearest ancestor `package_manifest` as that path's primary manifest target.
  Rationale: this follows the requested semantics exactly while avoiding noisy manifest over-inference from ancestor manifests.
  Date/Author: 2026-03-20 / Codex

- Decision: keep ownership, CI, and freshness uncertainty explicit through structured limitation entries instead of silently omitting or backfilling missing facts.
  Rationale: the prompt requires stale, failed, unowned, missing, and unmatched conditions to stay visible so operators can judge trust boundaries directly.
  Date/Author: 2026-03-20 / Codex

- Decision: do not add replay events for this slice.
  Rationale: this milestone adds a read-only operator route over existing stored twin state. It does not change mission or task lifecycle state, and the durable evidence surface is the route response, existing sync-run history, focused tests, docs, and validation output.
  Date/Author: 2026-03-20 / Codex

- Decision: split the implementation into `blast-radius-paths.ts`, `blast-radius-limitations.ts`, and `blast-radius-query.ts` instead of extending `service.ts` with all matching and explanation logic inline.
  Rationale: the repo instructions and modular architecture skill both require small bounded modules, and this split keeps path normalization, conservative limitation shaping, and route-level orchestration independently testable.
  Date/Author: 2026-03-20 / Codex

## Context and Orientation

Pocket CTO exits M3.6 with a repo-scoped engineering twin bounded context under `apps/control-plane/src/modules/twin/` that already owns:

- registry-backed repository targeting through the GitHub App repository registry
- truthful local source resolution for scan-based slices
- repo-scoped sync-run lifecycle persistence
- idempotent twin entity and edge upserts
- stored metadata, ownership, workflow, test-suite, docs, runbooks, and freshness read models

M3.7 should not add another extractor or another source-selection path.
It should answer from the stored twin that already exists for a repository.

The key current files are:

- `packages/domain/src/twin.ts`
- `apps/control-plane/src/lib/types.ts`
- `apps/control-plane/src/modules/twin/schema.ts`
- `apps/control-plane/src/modules/twin/routes.ts`
- `apps/control-plane/src/modules/twin/service.ts`
- `apps/control-plane/src/modules/twin/freshness.ts`
- `apps/control-plane/src/modules/twin/formatter.ts`
- `apps/control-plane/src/modules/twin/ownership-summary-formatter.ts`
- `apps/control-plane/src/modules/twin/test-suite-formatter.ts`
- `apps/control-plane/src/modules/twin/ownership-targets.ts`
- `docs/ops/local-dev.md`

The expected M3.7 edit surface is:

- `plans/EP-0027-blast-radius-query-service.md`
- `packages/domain/src/twin.ts`
- `apps/control-plane/src/lib/types.ts`
- `apps/control-plane/src/modules/twin/schema.ts`
- `apps/control-plane/src/modules/twin/routes.ts`
- `apps/control-plane/src/modules/twin/service.ts`
- new blast-radius query helper module(s) under `apps/control-plane/src/modules/twin/`
- focused blast-radius specs under `apps/control-plane/src/modules/twin/`
- `docs/ops/local-dev.md`

This slice should preserve boundaries:

- `packages/domain` stays pure and adds only shared request or response contracts
- `apps/control-plane/src/modules/twin/` owns deterministic path matching, stored-state joins, and operator answer formatting
- routes stay thin and only parse params and body, call the service, and return the result
- no new database schema, migrations, GitHub App permissions, webhook expectations, stack-pack changes, or environment variables are expected

`WORKFLOW.md` should remain accurate without changes because this slice stays additive, read-only, and GitHub App-first through the existing repository registry.

## Plan of Work

First, add shared blast-radius request and response contracts in `packages/domain/src/twin.ts` and wire the corresponding parse surface in `apps/control-plane/src/modules/twin/schema.ts`.
The route request should remain narrow: one deterministic `questionKind` and a list of changed repo-relative paths.
The response should carry repository context, query echo, impacted targets, stored owners and CI facts, explicit unmatched paths, freshness, limitations, and one concise answer summary.

Next, implement the stored-state blast-radius join inside the twin bounded context.
The new query should load the existing repo-scoped twin state once, reuse the current stored metadata, ownership, CI, and freshness derivations, and then apply deterministic path matching:

- a changed path matches a stored `workspace_directory` when equal to or nested under that directory path
- a changed path matches a stored `package_manifest` when it is the manifest path itself or nested under that manifest's directory
- among matching manifests, the nearest ancestor manifest is the primary manifest target for that path
- unmatched paths remain explicit

Then, shape the operator answer conservatively.
Impacted targets should show owners only when effective ownership exists.
Related test suites should come only from stored manifest-to-suite facts.
Related mapped CI jobs should come only from stored suite-to-job facts.
Any stale, failed, never-synced, unowned, unmatched, or unmapped-job posture must stay visible in `ciCoverageLimitations` or `limitations`.

Finally, add focused tests, update `docs/ops/local-dev.md` with the new route and example request or response shape, keep this ExecPlan current, run the full validation matrix, and if live GitHub env is available, run one real query for `616xold/pocket-cto` using already-persisted twin state or a truthful refresh path when available.

## Concrete Steps

Run these commands from the repository root as needed:

    rg -n "ownership-summary|ci-summary|freshness|workspace_directory|package_manifest|rule_owns_manifest|rule_owns_directory|ci_job_runs_test_suite|runbooks|docs|unmappedJobs|reasonCode" apps packages docs plans
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

    pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/twin/service.spec.ts src/modules/twin/routes.spec.ts src/modules/twin/test-suite-routes.spec.ts
    rg -n "blast-radius|queryRepositoryBlastRadius|/blast-radius/query" apps/control-plane/src packages/domain/src docs/ops/local-dev.md

If live GitHub env is present after implementation:

    curl -X POST http://localhost:4000/github/installations/sync
    curl -X POST http://localhost:4000/github/repositories/sync
    curl -X POST http://localhost:4000/twin/repositories/616xold/pocket-cto/blast-radius/query \
      -H 'content-type: application/json' \
      -d '{"questionKind":"auth_change","changedPaths":["apps/web/lib/auth.ts"]}'

If a truthful source checkout for `616xold/pocket-cto` is available locally, it is acceptable to refresh the existing twin through the already shipped sync routes before the query.
Do not print secrets, tokens, or raw auth headers.

## Validation and Acceptance

Success for M3.7 is demonstrated when all of the following are true:

1. `POST /twin/repositories/:owner/:repo/blast-radius/query` exists and keeps transport thin.
2. The request body is deterministic and narrow, with no natural-language parsing.
3. The query answers only from already stored twin state: stored metadata targets, effective ownership, stored test suites, stored CI job mappings, and stored freshness.
4. A changed path matches a stored `workspace_directory` only when equal to or nested under its path.
5. A changed path matches a stored `package_manifest` only when equal to the manifest path or nested under that manifest directory.
6. When multiple manifests match a changed path, the answer uses the nearest ancestor manifest as the primary package target for that path.
7. Unmatched changed paths remain explicit in the response.
8. Owners are surfaced only when effective ownership exists; unknown or unowned targets remain explicit.
9. Related test suites are surfaced only through stored manifest-to-suite facts.
10. Related mapped CI jobs are surfaced only through stored suite-to-job edges.
11. If an impacted manifest has no mapped CI jobs, the response says so explicitly instead of inventing coverage.
12. If the repository freshness rollup is `stale`, `failed`, or `never_synced`, the response includes an explicit limitation.
13. Focused tests prove path-to-directory matching, nearest-manifest selection, owner visibility, stored-edge-only suite and job linkage, unmatched-path visibility, stale or failed freshness limitations, and that the query path performs no new persistence writes.
14. `docs/ops/local-dev.md` documents the new blast-radius route honestly and does not claim discovery-mission formatting or broader graph reasoning already exists.

Human acceptance after implementation should look like:

    curl -i -X POST http://localhost:4000/twin/repositories/OWNER/REPO/blast-radius/query \
      -H 'content-type: application/json' \
      -d '{"questionKind":"auth_change","changedPaths":["apps/web/lib/auth.ts","packages/domain/src/twin.ts"]}'

The response should be operator-readable, repository-scoped, deterministic, conservative, and explicit about missing or stale data.

## Idempotence and Recovery

This slice is read-model and route oriented, so it should be safe to retry.
The query must not mutate twin rows, start syncs, or perform new extraction work.

If the implementation fails validation, revert the new route, schemas, service method, helper module(s), tests, docs, and this ExecPlan together.
Existing twin rows should be left intact because M3.7 does not depend on schema changes or row rewrites.
If implementation unexpectedly proves that new persistence is required, stop, record the blocker here, and land that change only through a separate additive-first migration path.

## Artifacts and Notes

Required pre-coding gap note captured in-thread:

1. The current twin already persists and proves repo-scoped metadata targets, effective ownership edges, stored test suites plus mapped CI jobs, docs and runbooks slices, and repository freshness.
2. What is still missing is a deterministic stored-state query surface that maps changed paths onto those targets, surfaces owners and CI/test linkage conservatively, and keeps unmatched or stale conditions explicit.
3. Planned edits are constrained to the new ExecPlan, shared domain contracts, twin route or service or helper seams, focused tests, and local-dev docs.
4. The chosen strategy is to reuse existing metadata, ownership, CI, and freshness read models; match changed paths deterministically; and return a concise operator-readable blast-radius answer with explicit limitations.

Replay and evidence implications:

- no new mission replay events are expected because this slice is read-only
- the durable evidence surface is the stored twin state, the new query response, focused tests, validation commands, and any live route proof captured at closeout
- the final closeout should state exact files changed, chosen matching semantics, validation results, live query evidence when available, and whether M3.7B can now start cleanly

Validation results, exact changed files, and live-query evidence will be appended here as work proceeds.

Validation results:

- `pnpm db:generate` passed with no new schema changes to generate.
- `pnpm db:migrate` passed.
- `pnpm run db:migrate:ci` passed.
- `pnpm repo:hygiene` passed.
- `pnpm lint` passed.
- `pnpm typecheck` passed.
- `pnpm build` passed.
- `pnpm test` passed.
- `pnpm ci:repro:current` passed.

Exact changed files for this slice:

- `apps/control-plane/src/bootstrap.spec.ts`
- `apps/control-plane/src/lib/types.ts`
- `apps/control-plane/src/modules/orchestrator/drizzle-service.spec.ts`
- `apps/control-plane/src/modules/twin/blast-radius-limitations.ts`
- `apps/control-plane/src/modules/twin/blast-radius-paths.ts`
- `apps/control-plane/src/modules/twin/blast-radius-query.spec.ts`
- `apps/control-plane/src/modules/twin/blast-radius-query.ts`
- `apps/control-plane/src/modules/twin/blast-radius-routes.spec.ts`
- `apps/control-plane/src/modules/twin/routes.ts`
- `apps/control-plane/src/modules/twin/schema.ts`
- `apps/control-plane/src/modules/twin/service.spec.ts`
- `apps/control-plane/src/modules/twin/service.ts`
- `docs/ops/local-dev.md`
- `packages/domain/src/twin.ts`
- `plans/EP-0027-blast-radius-query-service.md`

Live proof captured at `2026-03-20T00:56:36Z`:

- Reused already-persisted twin state for `616xold/pocket-cto` after refreshing the GitHub App installation and repository registry through `/github/installations/sync` and `/github/repositories/sync`.
- Queried `POST /twin/repositories/616xold/pocket-cto/blast-radius/query` with `{"questionKind":"auth_change","changedPaths":["apps/control-plane/src/modules/github-app/auth.ts"]}`.
- Result summary:
  repo full name `616xold/pocket-cto`
  changed path count `1`
  impacted manifest count `1`
  owner count `0`
  related test suite count `1`
  related mapped job count `0`
  freshness rollup `fresh`
  limitations count `3`
- The live answer correctly mapped the changed auth path to the stored `apps` workspace directory and the nearest ancestor manifest `apps/control-plane/package.json`, surfaced the absence of a CODEOWNERS file explicitly, and kept CI coverage conservative because the impacted manifest's stored `test` suite had no mapped CI jobs while the repo still had explicit unmapped jobs.

## Interfaces and Dependencies

Important interfaces and modules for this slice:

- `TwinService` and `TwinServicePort`
- `registerTwinRoutes`
- `packages/domain/src/twin.ts`
- existing stored summary builders in `formatter.ts`, `ownership-summary-formatter.ts`, `test-suite-formatter.ts`, and `freshness.ts`
- stored target readers in `ownership-targets.ts`
- existing GitHub repository registry dependency through `getRepository(...)`

New or expanded interfaces expected by the end of this slice:

- a blast-radius request contract
- a blast-radius response contract
- a twin service method for repo-scoped blast-radius queries
- a thin POST route for the stored query surface

No new libraries, environment variables, GitHub App permissions, or webhook subscriptions are expected.

## Outcomes & Retrospective

M3.7 landed as a read-only, deterministic operator query over the stored twin instead of a new extractor. The route, contracts, helper modules, tests, and local-dev docs now let operators ask for repository blast radius using explicit changed paths and receive a conservative answer built from stored metadata targets, stored effective ownership, stored test-suite links, stored CI job mappings, and stored freshness.

The implementation stayed inside the planned boundaries:

- no new schema or migration work
- no new persistence writes or sync work inside the query route
- no natural-language parsing
- no widening into docs, runbooks, arbitrary file graphs, or discovery-mission formatting

What remains for follow-on work:

- M3.7B can build discovery-mission formatting and higher-level operator workflows on top of this response without redesigning the core matching rules.
- M3.8 can widen the model only if it introduces new truthful persisted facts instead of weakening the current conservative semantics.

The current route is strong enough for M3.7B to start cleanly because the core answer surface is now deterministic, repository-scoped, explicit about unknowns, and validated against both focused tests and one live persisted-state repository query.
