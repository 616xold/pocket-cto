# EP-0023 - Extract CODEOWNERS ownership facts into the repo-scoped twin

This ExecPlan is a living document. Keep `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` current.

## Purpose / Big Picture

After this slice, Pocket CTO can inspect one synced repository, discover the effective `CODEOWNERS` file using GitHub precedence, parse durable ownership rules deterministically, persist those facts into the repo-scoped twin, and compute effective ownership over the already stored `workspace_directory` and `package_manifest` twin entities without pretending arbitrary file-graph blast-radius ownership already exists.
Operators will be able to trigger a repo-scoped ownership sync, inspect the resulting sync run, and read concise stored ownership data through thin routes without rescanning the repository on every request.

This plan covers roadmap submilestone `M3.3 CODEOWNERS and ownership extraction`.
It intentionally stops before arbitrary file-graph ownership, CI workflow extraction, docs indexing, freshness scoring, blast-radius answers, or metadata extractor redesign.

## Progress

- [x] (2026-03-19T01:36:00Z) Re-read the requested repo docs, roadmap, M3.2 and M3.3 files, the named skills, the requested twin or tooling files, and ran the required inspections `rg -n "M3.3A|ownership-summary|ownership-sync|smoke:twin-metadata:live|CODEOWNERS|owner_principal|rule_owns_" apps packages docs plans package.json`, `git status --short`, and `git diff --name-only HEAD`.
- [x] (2026-03-19T01:36:00Z) Captured the pre-coding M3.3 live proof and docs gap in-thread, added the tiny route-driven `tools/twin-ownership-smoke.mjs` helper plus `pnpm smoke:twin-ownership:live`, and fixed the stale M3.3A or route wording in `docs/ops/local-dev.md`.
- [x] (2026-03-19T01:36:00Z) Ran a successful live ownership smoke against the real `616xold/pocket-cto` repo using an explicit temporary checkout path, refreshed metadata targets before ownership sync, and replaced the stale “env absent” proof posture with current live evidence.
- [x] (2026-03-19T01:36:00Z) Re-ran the full required validation matrix successfully after the proof refresh: `pnpm db:generate`, `pnpm db:migrate`, `pnpm run db:migrate:ci`, `pnpm repo:hygiene`, `pnpm lint`, `pnpm typecheck`, `pnpm build`, `pnpm test`, and `pnpm ci:repro:current`.
- [x] (2026-03-18T04:00:39Z) Read the required repo docs, roadmap, M3.1 and M3.2 ExecPlans, the named skills, the requested twin or bootstrap files, and ran the required inspections `rg -n "CODEOWNERS|ownership|owner|workspace_directory|package_manifest|twin" apps packages docs plans`, `git status --short`, and `git diff --name-only HEAD`.
- [x] (2026-03-18T04:00:39Z) Captured the pre-coding M3.3A gap note in-thread: the twin spine already provides repo-scoped runs, entity or edge upserts, source resolution, and metadata sync, but still lacks CODEOWNERS precedence discovery, deterministic parsing, durable ownership entities, and ownership read routes.
- [x] (2026-03-18T04:00:39Z) Created EP-0023 before coding so the slice stays self-contained, additive, and resumable.
- [x] (2026-03-18T04:14:50Z) Implemented the M3.3A ownership slice inside the twin bounded context: added CODEOWNERS discovery and parser helpers, added a dedicated ownership-sync path, persisted `codeowners_file`, `ownership_rule`, and `owner_principal` entities plus the required ownership edges, and exposed thin `ownership-sync`, `ownership-rules`, and `owners` routes.
- [x] (2026-03-18T04:14:50Z) Added focused tests for discovery precedence, comment and blank filtering, owner normalization and deduplication, rerun idempotence, truthful zero-file sync success, route-level ownership reads, and the legacy enum bridge for `owner_principal`.
- [x] (2026-03-18T04:14:50Z) Updated `docs/ops/local-dev.md`, ran the full required validation matrix successfully, and confirmed that live GitHub App smoke could not be run on this machine because the required GitHub env vars were unset.
- [x] (2026-03-18T23:04:30Z) Re-read the requested files for the M3.3B slice, ran the required inspections `rg -n "ownership_rule|owner_principal|package_manifest|workspace_directory|repository_contains_manifest|repository_contains_directory|CODEOWNERS" apps packages docs plans`, `git status --short`, and `git diff --name-only HEAD`, and captured the pre-coding M3.3B effective-ownership gap note in-thread.
- [x] (2026-03-18T23:04:30Z) Implemented effective ownership over stored `workspace_directory` and `package_manifest` entities: added deterministic CODEOWNERS target matching with last-match-wins semantics, persisted `rule_owns_directory` and `rule_owns_manifest` edges, and exposed a thin `ownership-summary` route plus domain read model.
- [x] (2026-03-18T23:04:30Z) Added focused tests for last-match-wins matching, expected directory or manifest owners, unmatched targets, rerun idempotence for effective ownership edges, truthful `no_codeowners_file` summaries, and the stored summary route surface.
- [x] (2026-03-18T23:08:00Z) Re-ran the full required validation matrix for the completed M3.3 slice, updated `docs/ops/local-dev.md` and this ExecPlan for the ownership summary surface, and confirmed again that live GitHub App smoke could not run because the required env vars were unset in the current shell.

## Surprises & Discoveries

- Observation: the current twin persistence schema is already open-ended enough for CODEOWNERS extraction, so this slice may not require a database migration if the new facts fit inside existing generic `kind`, `stableKey`, and JSON payload columns.
  Evidence: `packages/db/src/schema/twin.ts` already stores entity and edge `kind` as text, uses JSON payloads, and keys uniqueness by `repo_full_name + kind + stable_key` for entities and repo plus endpoints for edges.

- Observation: M3.2 already codified the exact source-truth contract that this slice should reuse.
  Evidence: `apps/control-plane/src/modules/twin/source-resolver.ts` resolves only a truthful local checkout for the requested synced repository and fails explicitly on missing, unreadable, or mismatched source roots.

- Observation: M3.2 summary routes are metadata-specific, so ownership needs its own narrow read models instead of overloading the existing repository summary response.
  Evidence: `apps/control-plane/src/modules/twin/formatter.ts` currently only derives repository, branch, README, manifest, and directory summaries from stored twin rows.

- Observation: no database schema change was required for M3.3.
  Evidence: `pnpm db:generate` completed with `No schema changes, nothing to migrate` because the existing repo-scoped twin tables already accept generic text `kind` values plus JSON payloads.

- Observation: ownership reads need to distinguish “latest run failed” from “latest successful snapshot is empty because no CODEOWNERS file exists”.
  Evidence: the new ownership routes derive their stored view from the latest successful ownership run, but explicitly return an empty snapshot when that latest successful run recorded `codeownersFileCount = 0`, so older ownership rows do not masquerade as current truth.

- Observation: effective ownership can stay additive if the summary route reads from the latest successful ownership snapshot while still using the current repo-scoped metadata target entities.
  Evidence: `workspace_directory` and `package_manifest` entities already have stable repo-scoped ids and paths from M3.2, so M3.3B only needed new rule-to-target edges and a read model that treats unmatched current targets as explicitly unowned when a successful ownership snapshot exists.

- Observation: the local `.env` is sufficient for GitHub App-backed live twin smoke even when the current shell is missing exported variables, as long as the smoke helper loads it first and receives an explicit source repo root.
  Evidence: `tools/m2-exit-utils.mjs` loaded `GITHUB_APP_ID`, `GITHUB_APP_PRIVATE_KEY_BASE64`, and `GITHUB_WEBHOOK_SECRET` successfully, while `pnpm smoke:twin-ownership:live -- --source-repo-root /tmp/pocket-cto-ownership-smoke-6tbTqb` completed with synced installation and repository counts of `1`.

- Observation: the current truth for `616xold/pocket-cto` is a successful ownership sync with no effective `CODEOWNERS` file, not a live-smoke failure.
  Evidence: the refreshed live smoke returned `codeownersFilePath = null`, `ownershipState = no_codeowners_file`, `ruleCount = 0`, `ownerCount = 0`, `ownedDirectoryCount = 0`, `ownedManifestCount = 0`, and `unownedTargetCount = 14`, and a direct filesystem check of `/tmp/pocket-cto-ownership-smoke-6tbTqb` found no `CODEOWNERS` file.

## Decision Log

- Decision: implement CODEOWNERS extraction as a separate ownership-sync path inside the twin bounded context instead of widening `syncRepositoryMetadata(...)`.
  Rationale: the prompt explicitly says not to redesign the M3.2 metadata extractor, and the modular-architecture guard favors separate transport, service, parsing, and persistence seams for a new extraction slice.
  Date/Author: 2026-03-18 / Codex

- Decision: discover at most one effective `CODEOWNERS` file per repo by GitHub precedence order `.github/CODEOWNERS`, `CODEOWNERS`, then `docs/CODEOWNERS`.
  Rationale: the prompt requires GitHub precedence and repo-scoped determinism. Persisting only the effective file keeps reruns stable and avoids implying unsupported multi-file merge semantics.
  Date/Author: 2026-03-18 / Codex

- Decision: treat missing `CODEOWNERS` as a successful sync with zero `codeowners_file`, `ownership_rule`, and `owner_principal` rows created or refreshed by that run.
  Rationale: operators need truthful absence, not a generic failure, and later slices can distinguish “no ownership data exists” from “sync broke”.
  Date/Author: 2026-03-18 / Codex

- Decision: persist ownership facts through generic twin entities and edges, and derive route read models from stored rows rather than rescanning the repository on read.
  Rationale: M3.1 already established the twin as the durable source of truth for sync results, and read routes should stay summary-shaped and inexpensive.
  Date/Author: 2026-03-18 / Codex

- Decision: do not add replay events for this slice.
  Rationale: ownership sync mutates twin state, not mission or task lifecycle state. The durable audit surface for this milestone is the sync-run row plus stored twin entities, edges, and read models.
  Date/Author: 2026-03-18 / Codex

- Decision: build the ownership read routes from the latest successful ownership run rather than all stored ownership rows.
  Rationale: the twin tables are additive and do not prune older ownership facts in this slice. Filtering by the latest successful ownership run keeps the read routes truthful on reruns, including the important case where the newest successful sync found no CODEOWNERS file.
  Date/Author: 2026-03-18 / Codex

- Decision: compute effective ownership only for stored `workspace_directory` and `package_manifest` entities, and only from their persisted `path` fields.
  Rationale: the prompt explicitly narrows M3.3B to existing metadata entities and says not to widen into arbitrary file graphs, docs indexing, CI workflows, or blast-radius behavior.
  Date/Author: 2026-03-18 / Codex

- Decision: apply deterministic CODEOWNERS last-match-wins semantics and persist only the winning effective rule-to-target edge per stored target.
  Rationale: operators need a durable, rerunnable read model. Persisting only `rule_owns_directory` and `rule_owns_manifest` for the winning rule keeps the stored graph concise while preserving owner details through the already persisted rule payload and `rule_assigns_owner` facts.
  Date/Author: 2026-03-18 / Codex

- Decision: expose `ownership-summary` with explicit `not_synced`, `no_codeowners_file`, and `effective_ownership_available` states.
  Rationale: the prompt requires the summary to say explicitly when no CODEOWNERS file exists, and operators also need honesty when ownership sync has not succeeded yet.
  Date/Author: 2026-03-18 / Codex

- Decision: keep the proof refresh route-driven and tooling-first by adding a tiny in-process ownership smoke helper that refreshes metadata targets before ownership sync.
  Rationale: the prompt explicitly prefers tooling and docs over product code for this closeout, and ownership summary counts are only meaningful when the current twin metadata targets are refreshed in the same run.
  Date/Author: 2026-03-19 / Codex

## Context and Orientation

Pocket CTO exits M3.3 with a real repo-scoped twin bounded context under `apps/control-plane/src/modules/twin/`.
That bounded context now owns:

- registry-backed repository targeting via the existing GitHub App repository registry
- truthful local source resolution through `source-resolver.ts`
- repo-scoped sync-run lifecycle persistence
- idempotent entity upserts keyed by repo full name, kind, and stable key
- idempotent edge upserts keyed by repo full name, kind, and endpoints
- metadata sync plus summary and debug routes
- ownership sync plus stored ownership rules, owners, and ownership-summary routes

The remaining responsibility of this refreshed ExecPlan is proof and operator-doc currency, not new product behavior.
The implemented M3.3 logic now:

- inspect only the truthful local checkout returned by the existing source resolver
- discover the effective `CODEOWNERS` file using GitHub precedence
- parse durable ownership rules without attempting effective file matching
- normalize owner principals deterministically
- persist file, rule, and principal facts with stable keys
- expose one sync route and three read routes for stored ownership data, including effective ownership summary

The most relevant existing files are:

- `apps/control-plane/src/modules/twin/service.ts`
- `apps/control-plane/src/modules/twin/routes.ts`
- `apps/control-plane/src/modules/twin/repository.ts`
- `apps/control-plane/src/modules/twin/drizzle-repository.ts`
- `apps/control-plane/src/modules/twin/source-resolver.ts`
- `apps/control-plane/src/modules/twin/formatter.ts`
- `apps/control-plane/src/bootstrap.ts`
- `apps/control-plane/src/lib/types.ts`
- `packages/domain/src/twin.ts`
- `packages/db/src/schema/twin.ts`

The planned new or expanded ownership files are:

- `apps/control-plane/src/modules/twin/codeowners-discovery.ts`
- `apps/control-plane/src/modules/twin/codeowners-parser.ts`
- `apps/control-plane/src/modules/twin/ownership-sync.ts`
- the touched twin service, formatter, route, schema, types, and spec files

## Plan of Work

First, add a small discovery module that checks `.github/CODEOWNERS`, then `CODEOWNERS`, then `docs/CODEOWNERS` under the resolved repository root and returns either the first matching path plus file contents or a truthful “none found” result.

Next, add a parser module that ignores blank and comment lines, splits each rule into a raw pattern plus owners, normalizes owner handles deterministically, deduplicates principals across the file, and tags each rule with a lightweight pattern classification when that is easy to infer. This parser should stay narrow and deterministic; it must not try to compute effective ownership for directories, manifests, or arbitrary files.

Then, add a separate ownership-sync orchestrator that:

- resolves repository detail from the registry
- starts an ownership sync run with a dedicated extractor name
- resolves the truthful local checkout through the existing source resolver
- discovers and parses the effective `CODEOWNERS` file
- ensures the repo-scoped `repository` entity exists for edge creation
- upserts `codeowners_file`, `ownership_rule`, and `owner_principal` entities with stable keys
- upserts `repository_has_codeowners`, `codeowners_file_defines_rule`, and `rule_assigns_owner` edges
- finishes the sync run with truthful counts, including the zero-file path

Finally, add thin routes for `POST /twin/repositories/:owner/:repo/ownership-sync`, `GET /twin/repositories/:owner/:repo/ownership-rules`, `GET /twin/repositories/:owner/:repo/owners`, and `GET /twin/repositories/:owner/:repo/ownership-summary`, add focused tests, update `docs/ops/local-dev.md`, and keep a repeatable live smoke helper available when the GitHub App env is available locally.

Expected file edits are:

- `plans/EP-0023-codeowners-and-ownership-extraction.md`
- `apps/control-plane/src/bootstrap.ts`
- `apps/control-plane/src/lib/types.ts`
- `apps/control-plane/src/modules/twin/codeowners-discovery.ts`
- `apps/control-plane/src/modules/twin/codeowners-parser.ts`
- `apps/control-plane/src/modules/twin/ownership-sync.ts`
- `apps/control-plane/src/modules/twin/formatter.ts`
- `apps/control-plane/src/modules/twin/routes.ts`
- `apps/control-plane/src/modules/twin/schema.ts`
- `apps/control-plane/src/modules/twin/service.ts`
- `apps/control-plane/src/modules/twin/types.ts`
- `apps/control-plane/src/modules/twin/drizzle-repository.ts`
- `apps/control-plane/src/modules/twin/repository.ts`
- `apps/control-plane/src/modules/twin/*.spec.ts`
- `packages/domain/src/twin.ts`
- `docs/ops/local-dev.md`
- `package.json`
- `tools/twin-ownership-smoke.mjs`

Schema changes are not expected unless implementation proves the current generic twin tables are insufficient.

## Concrete Steps

Run these commands from the repository root as needed:

    rg -n "CODEOWNERS|ownership|owner|workspace_directory|package_manifest|twin" apps packages docs plans
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
    rg -n "ownership-sync|CODEOWNERS|owner_principal|ownership_rule|codeowners_file" apps/control-plane/src packages/domain/src docs/ops/local-dev.md

If live GitHub env is present after implementation:

    curl -X POST http://localhost:4000/github/installations/sync
    curl -X POST http://localhost:4000/github/repositories/sync
    curl -X POST http://localhost:4000/twin/repositories/616xold/pocket-cto/metadata-sync
    curl -X POST http://localhost:4000/twin/repositories/616xold/pocket-cto/ownership-sync
    curl http://localhost:4000/twin/repositories/616xold/pocket-cto/ownership-summary
    pnpm smoke:twin-ownership:live -- --source-repo-root /absolute/path/to/pocket-cto

Record only the repo full name, chosen CODEOWNERS path or `null`, ownership state, rule count, owner count, owned target counts, unowned target count, and sync run id.
Do not print secrets, tokens, or raw auth headers.

## Validation and Acceptance

Success for M3.3 is demonstrated when all of the following are true:

1. Ownership sync uses the existing repository registry and the existing twin source resolver; it does not clone repositories or invent a second source-selection path.
2. CODEOWNERS discovery checks `.github/CODEOWNERS`, then `CODEOWNERS`, then `docs/CODEOWNERS`, and persists only the first existing match.
3. When no `CODEOWNERS` file exists, `POST /twin/repositories/:owner/:repo/ownership-sync` succeeds truthfully, finishes the sync run as `succeeded`, and reports zero ownership rules and zero owners.
4. The sync persists `codeowners_file`, `ownership_rule`, and `owner_principal` entities with deterministic stable keys.
5. The sync persists `repository_has_codeowners`, `codeowners_file_defines_rule`, and `rule_assigns_owner` edges with repo-scoped idempotent upserts.
6. Ownership rules ignore blank lines and comment lines.
7. Owner handles are normalized and deduplicated deterministically across the effective CODEOWNERS file.
8. Effective ownership uses last-match-wins semantics only over stored `workspace_directory` and `package_manifest` entity paths and persists only the winning `rule_owns_directory` or `rule_owns_manifest` edges.
9. Repeated ownership syncs converge on the same file, rule, owner principal, and effective ownership edge ids instead of duplicating them.
10. `GET /twin/repositories/:owner/:repo/ownership-rules` returns a clean stored view of rules, including source path, ordinal, raw pattern, normalized owners, and lightweight pattern classification.
11. `GET /twin/repositories/:owner/:repo/owners` returns a clean stored view of normalized owner principals.
12. `GET /twin/repositories/:owner/:repo/ownership-summary` returns a concise operator-readable summary with explicit `not_synced`, `no_codeowners_file`, or `effective_ownership_available` state plus owned and unowned metadata targets.
13. `docs/ops/local-dev.md` documents the current M3.3 routes and the repeatable ownership smoke honestly, without claiming arbitrary file ownership graphs, CI, docs indexing, or blast-radius answers.

Human acceptance after implementation should look like:

    curl -i -X POST http://localhost:4000/twin/repositories/OWNER/REPO/ownership-sync
    curl -i http://localhost:4000/twin/repositories/OWNER/REPO/ownership-rules
    curl -i http://localhost:4000/twin/repositories/OWNER/REPO/owners
    curl -i http://localhost:4000/twin/repositories/OWNER/REPO/ownership-summary
    pnpm smoke:twin-ownership:live -- --source-repo-root /absolute/path/to/OWNER-REPO-checkout

For a synced repo with an effective `CODEOWNERS` file, the sync route should return a succeeded run plus non-zero rule and owner counts, and the read routes should return stored ownership data without rescanning the repository.
For a synced repo without `CODEOWNERS`, the sync route should still succeed and the summary should report `ownershipState = no_codeowners_file` plus explicitly unowned current metadata targets.

## Idempotence and Recovery

Ownership sync must be safe to rerun.
Stable entity keys should converge on:

- `codeowners_file` by discovered file path
- `ownership_rule` by discovered file path plus ordinal
- `owner_principal` by normalized owner handle

Edge upserts should converge on the same repository-to-file, file-to-rule, and rule-to-owner relationships.

If a sync fails after the run starts, the run must finish as `failed` with an error summary so operators can distinguish extraction failures from truthful “no CODEOWNERS file” absence.
Retrying the same repo after fixing the local checkout should create a new sync run and converge on the same ownership entities and edges.

Safe rollback guidance:

- revert the ownership modules, route additions, formatter changes, docs, and this ExecPlan together
- do not delete existing twin rows manually during rollback; the persisted ownership facts are additive and can remain inert
- if implementation unexpectedly needs a schema change, keep it additive-first and roll it back only through the repo migration workflow

## Artifacts and Notes

Required pre-coding gap note captured in-thread:

1. The twin spine already gives us repo-scoped runs, idempotent generic entity or edge upserts, registry-backed repo targeting, and truthful local source resolution.
2. Durable CODEOWNERS extraction is still missing precedence discovery, deterministic parsing, normalized owner principals, durable file or rule or owner persistence, and ownership read routes.
3. The planned edit surface includes the new ExecPlan, new twin ownership modules, the existing twin service or route or formatter seams, shared domain types, focused tests, and `docs/ops/local-dev.md`.
4. The chosen strategy is one effective CODEOWNERS file by GitHub precedence, deterministic parsing of durable rule facts only, stable repo-scoped entity keys, and read models derived from stored rows.

Validation results, live smoke notes, and exact changed files will be appended here as work proceeds.

Validation results:

- Re-ran the full required matrix on 2026-03-19 after the proof-helper and docs refresh so the live evidence and the checked tree are aligned.
- `pnpm db:generate` passed with `No schema changes, nothing to migrate`.
- `pnpm db:migrate` passed.
- `pnpm run db:migrate:ci` passed.
- `pnpm repo:hygiene` passed.
- `pnpm lint` passed.
- `pnpm typecheck` passed.
- `pnpm build` passed. The existing Next.js `typedRoutes` and ESLint-plugin warnings in `apps/web` remained warnings only and did not block the build.
- `pnpm test` passed with all workspace packages green, including `apps/control-plane` `46` files and `202` tests.
- `pnpm ci:repro:current` passed, including clean-tree verification in the temporary worktree.

Files changed during the 2026-03-19 proof refresh:

- `docs/ops/local-dev.md`
- `package.json`
- `plans/EP-0023-codeowners-and-ownership-extraction.md`
- `tools/twin-ownership-smoke.mjs`

Implementation files changed earlier in M3.3:

- `apps/control-plane/src/bootstrap.spec.ts`
- `apps/control-plane/src/lib/types.ts`
- `apps/control-plane/src/modules/orchestrator/drizzle-service.spec.ts`
- `apps/control-plane/src/modules/twin/effective-ownership.spec.ts`
- `apps/control-plane/src/modules/twin/ownership-formatter.ts`
- `apps/control-plane/src/modules/twin/ownership-matcher.spec.ts`
- `apps/control-plane/src/modules/twin/ownership-matcher.ts`
- `apps/control-plane/src/modules/twin/ownership-summary-formatter.ts`
- `apps/control-plane/src/modules/twin/ownership-sync.ts`
- `apps/control-plane/src/modules/twin/ownership-targets.ts`
- `apps/control-plane/src/modules/twin/routes.spec.ts`
- `apps/control-plane/src/modules/twin/routes.ts`
- `apps/control-plane/src/modules/twin/schema.ts`
- `apps/control-plane/src/modules/twin/service.ts`
- `docs/ops/local-dev.md`
- `packages/domain/src/twin.ts`
- `plans/EP-0023-codeowners-and-ownership-extraction.md`

Live GitHub-backed evidence:

- smoke command: `pnpm smoke:twin-ownership:live -- --source-repo-root /tmp/pocket-cto-ownership-smoke-6tbTqb`
- `.env`-backed GitHub App credentials were present for the smoke helper even though the current shell itself did not export every GitHub variable.
- requested repository: `616xold/pocket-cto`
- explicit smoke source repo root: `/tmp/pocket-cto-ownership-smoke-6tbTqb`
- `syncInstallations()` succeeded with `installationsSynced = 1`
- `syncRepositories()` succeeded with `repositoriesSynced = 1`
- ownership sync run id: `2b8ae7f8-1747-425e-b91e-bcdacc2c499e`
- ownership sync status: `succeeded`
- chosen CODEOWNERS path: `null`
- ownership state: `no_codeowners_file`
- rule count: `0`
- owner count: `0`
- owned directory count: `0`
- owned manifest count: `0`
- unowned target count: `14`
- a direct filesystem check of the temporary checkout found no `CODEOWNERS` file, so the `null` path and empty ownership counts are the current truthful repo state, not a smoke failure.

## Interfaces and Dependencies

Important existing interfaces and modules for this slice:

- `GitHubAppService` methods `getRepository(...)` and `resolveWritableRepository(...)`
- `TwinService` and `TwinRepository` in `apps/control-plane/src/modules/twin/`
- `LocalTwinRepositorySourceResolver` in `apps/control-plane/src/modules/twin/source-resolver.ts`
- shared twin contracts in `packages/domain/src/twin.ts`
- generic twin persistence schema in `packages/db/src/schema/twin.ts`
- app wiring through `apps/control-plane/src/bootstrap.ts`, `apps/control-plane/src/app.ts`, and `apps/control-plane/src/lib/types.ts`

New or expanded interfaces expected by the end of this slice:

- CODEOWNERS discovery and parser helpers inside the twin bounded context
- an ownership sync method on `TwinService`
- domain read-model contracts for ownership sync, ownership rules, owner principals, and ownership summaries
- thin twin ownership routes for sync and stored reads

No new environment variables are expected.
No new GitHub App permissions or webhook subscriptions are expected.

## Outcomes & Retrospective

M3.3 now ships a durable, repo-scoped CODEOWNERS ownership slice on top of the M3.1 and M3.2 twin spine.
Pocket CTO can:

- discover the effective CODEOWNERS file by GitHub precedence
- parse durable rule facts while ignoring blank and comment lines
- normalize and deduplicate owner principals deterministically
- persist file, rule, and owner entities plus ownership edges
- compute effective ownership over stored workspace directories and package manifests with last-match-wins semantics
- expose thin ownership sync and ownership read routes, including an operator-readable ownership summary
- refresh that proof through a repeatable route-driven live smoke helper without widening product code

This slice intentionally does not widen into arbitrary file ownership graphs, CI workflows, docs indexing, or blast-radius questions.
Those behaviors remain clean follow-on work for M3.4 and later roadmap slices.

M3.4 can now start cleanly because the repo has:

- deterministic CODEOWNERS discovery
- durable persisted ownership rules and principals
- durable effective ownership edges for directories and manifests
- summary-shaped read routes for stored ownership facts
- validation proof that the new slice is rerunnable, deterministic, and additive
- current live proof for `616xold/pocket-cto`, including the truthful `no_codeowners_file` case instead of a stale “env absent” placeholder
