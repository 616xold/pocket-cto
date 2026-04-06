# EP-0021 - Add the repo-scoped twin persistence spine and debug read surface

This ExecPlan is a living document. Keep `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` current.

## Purpose / Big Picture

After this slice, Pocket CTO can persist a repo-scoped engineering twin spine in Postgres and inspect it through thin control-plane debug routes without pretending extraction or blast-radius answering already exist.
Operators and later M3 slices will be able to point at one synced repository from the durable repository registry, record synthetic twin sync runs, upsert twin entities and edges against that repository, and read back stored twin state through `GET /twin/repositories/:owner/:repo/entities`, `GET /twin/repositories/:owner/:repo/edges`, and `GET /twin/repositories/:owner/:repo/runs`.

This plan covers roadmap submilestone `M3.1 twin entity and edge schema`.
It intentionally stops before extraction, freshness scoring, blast-radius answering, or discovery-mission formatting.

## Progress

- [x] (2026-03-16T22:07:00Z) Read the required repo docs, M2 and roadmap ExecPlans, local-dev and architecture guidance, the named skills, the listed config or DB or control-plane files, and ran the requested inspections `rg -n "twin|entity|edge|fresh|freshness|blast|CODEOWNERS|workflow|runbook|metadata sync|repository registry" packages apps docs plans`, `git status --short`, and `git diff --name-only HEAD`.
- [x] (2026-03-16T22:07:00Z) Captured the M3.1 gap honestly before coding: Pocket CTO already has a durable GitHub App installation plus repository registry, repo write-readiness semantics, and a reserved twin bounded-context placeholder, but the live twin DB and domain contracts are legacy non-repo-scoped placeholders with no sync-run table, no service or repository boundary, and no debug read routes.
- [x] (2026-03-16T22:13:00Z) Replaced the legacy twin placeholder contracts with the repo-scoped M3.1 spine: updated the shared domain contracts, evolved the existing twin tables additively, introduced `twin_sync_runs`, created the control-plane twin bounded context, and wired the read-only debug routes into the app container and Fastify surface.
- [x] (2026-03-16T22:14:00Z) Added focused tests for entity upsert uniqueness, edge repo scoping, sync-run start and finish persistence, debug read routes, timestamp round-trips, and truthful repo-readiness failures by covering the Drizzle repository, twin service, routes, and touched wiring seams.
- [x] (2026-03-16T22:16:00Z) Updated local-dev docs, reran the full validation matrix, and completed a live smoke that read one synced repository target from the repository registry and created one synthetic twin sync run without extraction logic. M3.2 can now start cleanly on top of this persistence spine.

## Surprises & Discoveries

- Observation: the repository already exports `packages/domain/src/twin.ts` and `packages/db/src/schema/twin.ts`, but both are legacy placeholders that do not match the repo-scoped M3.1 contract.
  Evidence: `packages/domain/src/twin.ts` still models `type`, `key`, `repo`, `freshnessStatus`, `lastObservedAt`, and lightweight edges, while `packages/db/src/schema/twin.ts` still defines matching placeholder columns and no `twin_sync_runs` table.

- Observation: older Drizzle snapshots already contain `twin_entities` and `twin_edges`, so the safest M3.1 migration path is to evolve those tables additively in place rather than create a second competing twin schema.
  Evidence: the requested ripgrep output surfaced `twin_entities` and `twin_edges` repeatedly in `packages/db/drizzle/meta/*.json`, and the current source schema still exports those table names.

- Observation: Pocket CTO already has the right source-of-truth boundary for target repositories and repo readiness, so M3.1 does not need any new repository-selection logic.
  Evidence: `apps/control-plane/src/modules/github-app/service.ts` already exposes `getRepository(...)`, `listRepositories(...)`, and `resolveWritableRepository(...)` on top of the durable repository registry from `plans/EP-0014-repository-registry-and-repo-sync.md`.

- Observation: the existing `apps/control-plane/src/modules/twin/` directory is only a README placeholder, so this slice can create the bounded context cleanly without having to unwind runtime code first.
  Evidence: `find apps/control-plane/src/modules/twin -maxdepth 2 -type f` returned only `apps/control-plane/src/modules/twin/README.md`.

- Observation: the generated Drizzle migration needed manual staging because legacy twin rows already exist and Postgres rejects immediate `NOT NULL` additions without a backfill path.
  Evidence: the first generated `packages/db/drizzle/0012_smooth_whistler.sql` attempted direct `SET NOT NULL` additions for new repo-scoped twin columns, so the migration was rewritten to add columns, backfill from legacy fields, and only then tighten constraints.

- Observation: the legacy `twin_entities.type` column is still backed by a narrow enum, so the new generic `kind` column must be the real M3.1 contract while the repository layer keeps the legacy enum populated as a compatibility shim.
  Evidence: `packages/db/src/schema/twin.ts` still defines `twinEntityTypeEnum` from the older placeholder model, while the new M3.1 service and route surfaces intentionally read and write `kind`.

## Decision Log

- Decision: evolve `twin_entities` and `twin_edges` additively in place, keep their legacy placeholder columns temporarily as compatibility shims, and add the new M3.1 repo-scoped columns plus `twin_sync_runs`.
  Rationale: the prompt requires additive-first schema work, and reusing the existing table names avoids a second twin persistence model while still letting M3.1 ship the exact new repo-scoped spine.
  Date/Author: 2026-03-16 / Codex

- Decision: treat the repository registry as the source of truth for twin targeting and reuse existing GitHub repository readiness semantics for sync-run write operations.
  Rationale: M2.3 already solved repository availability, inactivity, archived or disabled state, and installation availability; M3.1 should compose with that work instead of reimplementing it.
  Date/Author: 2026-03-16 / Codex

- Decision: keep the M3.1 HTTP surface read-only and summary-shaped, while leaving entity or edge upserts plus sync-run mutation methods on the service boundary for later extractor slices and focused tests.
  Rationale: the prompt explicitly defers extraction and asks for thin read or debug routes only where they help inspect state.
  Date/Author: 2026-03-16 / Codex

- Decision: do not add replay events for M3.1.
  Rationale: this slice introduces repo-scoped twin persistence and read surfaces but does not change mission or task lifecycle state, and the existing replay contract is scoped around those mission narratives.
  Date/Author: 2026-03-16 / Codex

- Decision: keep the legacy twin columns in place for now and map unknown `kind` values onto a safe legacy enum placeholder when persisting `twin_entities.type`.
  Rationale: the prompt requires additive-only schema work, but the new twin spine needs an open-ended `kind` surface immediately; a temporary compatibility map lets the new `kind` field lead without forcing a destructive enum migration during M3.1.
  Date/Author: 2026-03-16 / Codex

## Context and Orientation

Pocket CTO exits M2 with a real GitHub-first control plane.
The GitHub App bounded context under `apps/control-plane/src/modules/github-app/` can persist installations, reconcile the repository registry, and report repo write readiness from the durable registry.
That is the exact platform M3.1 should stand on.

Today’s twin footprint is only partial and inconsistent:

- `packages/domain/src/twin.ts` still describes an older generic twin entity model with `freshnessStatus` and no sync runs.
- `packages/db/src/schema/twin.ts` still defines `twin_entities` and `twin_edges`, but not the repo-scoped columns or `twin_sync_runs` required by M3.1.
- `apps/control-plane/src/modules/twin/` is only a README placeholder, so there is no twin service, no repository, and no route surface yet.

The relevant M2 foundations already exist:

- `apps/control-plane/src/modules/github-app/service.ts` is the source for repository summaries and write-readiness semantics.
- `packages/db/src/schema/integrations.ts` holds the durable repository registry that M3.1 must treat as the source of truth for target repositories.
- `apps/control-plane/src/bootstrap.ts`, `apps/control-plane/src/app.ts`, and `apps/control-plane/src/lib/types.ts` are the wiring seams for new bounded contexts and routes.
- `docs/ops/local-dev.md` already documents the repository registry routes and should be extended with the new twin debug routes only.

The intended edit surface for this slice is:

- `plans/EP-0021-twin-entity-and-edge-schema.md`
- `packages/domain/src/twin.ts`
- `packages/db/src/schema/twin.ts`
- generated migration output under `packages/db/drizzle/`
- `apps/control-plane/src/lib/types.ts`
- `apps/control-plane/src/bootstrap.ts`
- `apps/control-plane/src/app.ts`
- `apps/control-plane/src/test/database.ts`
- new twin bounded-context files under `apps/control-plane/src/modules/twin/`:
  `types.ts`
  `repository.ts`
  `drizzle-repository.ts`
  `service.ts`
  `schema.ts`
  `formatter.ts`
  `routes.ts`
- focused specs under the same module plus `apps/control-plane/src/app.spec.ts` and `apps/control-plane/src/bootstrap.spec.ts`
- `docs/ops/local-dev.md`

This slice should preserve the repo boundaries from `AGENTS.md`:

- `packages/domain` stays pure and contains only shared twin contracts
- `packages/db` contains only schema additions and DB helpers
- `apps/control-plane` owns the repo-scoped twin service, repository, and routes
- routes remain thin and should not contain DB access or repo-readiness logic inline

No new environment variables are expected.
No new GitHub App permissions or webhook subscriptions are expected.
`WORKFLOW.md` and stack packs do not need to change for this slice.

## Plan of Work

First, replace the legacy twin domain and DB placeholders with the new repo-scoped persistence contract.
That means defining shared twin entity, edge, sync-run, and read-model contracts in `packages/domain/src/twin.ts`, then extending `packages/db/src/schema/twin.ts` additively so `twin_entities` and `twin_edges` gain the new repo-scoped M3.1 columns while `twin_sync_runs` is introduced as a new table.
The schema must keep old columns only as compatibility shims during this milestone and must not perform destructive renames or drops.

Next, create the real twin bounded context under `apps/control-plane/src/modules/twin/`.
The repository layer should own persistence and ordering.
The service layer should own repo-scoped reads, entity and edge upsert behavior, sync-run start and finish behavior, and composition with the GitHub repository registry.
Read methods should fetch repo context through the existing GitHub App service.
Sync-run writes should reuse `resolveWritableRepository(...)` so inactive, archived, disabled, or installation-unavailable repos fail truthfully.

Then, expose the minimal read or debug surface required by the prompt.
Add thin routes for repository-scoped entities, edges, and runs.
Keep responses summary-shaped and newest-first where applicable.
Do not add extractor write routes.

Finally, add focused tests, update local-dev docs, run the requested validation matrix, and if live GitHub env is present locally, run one synthetic twin smoke that reads a synced repository target and records one synthetic sync run without extraction logic.

## Concrete Steps

Run these commands from the repository root as needed:

    rg -n "twin|entity|edge|fresh|freshness|blast|CODEOWNERS|workflow|runbook|metadata sync|repository registry" packages apps docs plans
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

    pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/twin/service.spec.ts src/modules/twin/drizzle-repository.spec.ts src/modules/twin/routes.spec.ts src/app.spec.ts src/bootstrap.spec.ts
    rg -n "Twin|twin_|/twin/repositories" packages apps docs

If live GitHub env is present after implementation, also run one narrow smoke and record:

- which persisted synced repo target was used
- whether the twin service read that repo context successfully
- whether a synthetic sync run was created and finished successfully
- no secrets, tokens, or raw credentials

## Validation and Acceptance

Success for M3.1 is demonstrated when all of the following are true:

1. `twin_sync_runs` exists with the required fields and can record `running`, then terminal completion state.
2. `twin_entities` persists at least repo full name, kind, stable key, title, optional summary, JSON payload, observed time, optional stale-after time, optional source run id, and timestamps.
3. `twin_edges` persists at least repo full name, kind, from and to entity ids, JSON payload, observed time, optional source run id, and timestamps.
4. Entity uniqueness is enforced by repo full name plus kind plus stable key, and entity upserts refresh mutable fields instead of duplicating rows.
5. Edge uniqueness is enforced by repo full name plus kind plus endpoint ids, and edges remain repo-scoped.
6. The twin service reads repository context from the durable repository registry instead of inventing a second repo-target source.
7. Sync-run write methods fail truthfully with the existing GitHub repo-readiness semantics when the repo is inactive, archived, disabled, or installation-unavailable.
8. `GET /twin/repositories/:owner/:repo/entities` returns repo-scoped twin entities in a summary-shaped response.
9. `GET /twin/repositories/:owner/:repo/edges` returns repo-scoped edges in a summary-shaped response.
10. `GET /twin/repositories/:owner/:repo/runs` returns newest-first sync runs in a summary-shaped response.
11. `observedAt` and `staleAfter` survive persistence round-trips.
12. Local-dev docs explain the new twin debug routes honestly and do not imply extraction already exists.

Human acceptance after implementation should look like:

    curl -i http://localhost:4000/twin/repositories/OWNER/REPO/entities
    curl -i http://localhost:4000/twin/repositories/OWNER/REPO/edges
    curl -i http://localhost:4000/twin/repositories/OWNER/REPO/runs

When `OWNER/REPO` exists in the synced repository registry, those routes should return repo context plus stored twin state.
When the repository does not exist in the registry, the request should return the existing truthful repository-not-found error.

## Idempotence and Recovery

The schema changes must stay additive.
If `pnpm db:generate` shows destructive changes to twin tables, stop and correct the schema rather than accepting a migration that drops legacy columns.

Entity and edge writes must be safe to retry.
Entity upserts should converge on the same row by repo full name plus kind plus stable key.
Edge upserts should converge on the same row by repo full name plus kind plus endpoint ids.
Sync-run completion should update the existing run row by id and should be retry-safe as long as the same final status and timestamps are supplied.

Safe rollback guidance:

- revert the new twin bounded-context files, route wiring, docs, and the additive twin migration together
- do not manually delete existing twin rows during rollback; the additive columns and new sync-run table are the only new persistence surface
- if the database must follow the code rollback, revert to the previous schema only through the repo’s migration workflow

## Artifacts and Notes

Initial M3.1 gap notes captured before implementation:

1. Existing GitHub capability:
   the GitHub App bounded context already persists installations, syncs the repository registry, and exposes write-readiness semantics for archived, disabled, inactive, and installation-unavailable repositories.
2. Existing twin capability:
   only placeholder domain and DB types exist today, and the control-plane twin module has no implementation yet.
3. Replay and evidence implication:
   this slice should not add mission replay events because it does not change mission or task lifecycle state.
4. Requested route surface:
   only read or debug routes for entities, edges, and runs should be added in M3.1.

Validation results, live smoke notes, and exact changed files will be appended here as implementation proceeds.

## Interfaces and Dependencies

Important existing interfaces and modules for this slice:

- `GitHubAppService` in `apps/control-plane/src/modules/github-app/service.ts`
- `PersistedGitHubRepositorySchema` and repo-readiness helpers in `apps/control-plane/src/modules/github-app/types.ts`, `schema.ts`, and `formatter.ts`
- `AppContainer` wiring in `apps/control-plane/src/lib/types.ts`, `apps/control-plane/src/bootstrap.ts`, and `apps/control-plane/src/app.ts`
- `PersistenceSession` and `TransactionalRepository` in `apps/control-plane/src/lib/persistence.ts`
- Drizzle schema exports through `packages/db/src/schema/index.ts` and `packages/db/src/index.ts`

New interfaces expected by the end of this slice:

- shared twin entity, edge, sync-run, and repo-scoped read-model contracts in `packages/domain/src/twin.ts`
- a twin repository boundary with repo-scoped list and upsert methods plus sync-run lifecycle methods
- a twin service boundary with repo-scoped reads and sync-run writes
- thin control-plane routes for repo-scoped twin debug reads

No new environment variables are expected.
No new GitHub App permissions or webhook subscriptions are expected.

## Outcomes & Retrospective

M3.1 now ships a durable, repo-scoped twin persistence spine.
`packages/domain/src/twin.ts` exposes the new shared contracts for entities, edges, sync runs, and summary read models.
`packages/db/src/schema/twin.ts` evolves the existing twin tables additively and introduces `twin_sync_runs`.
`apps/control-plane/src/modules/twin/` now contains the real bounded context with a repository interface, Drizzle repository, service, schemas, formatter, routes, and focused tests.

The twin service composes cleanly with the existing GitHub repository registry rather than introducing a second targeting system.
Read methods resolve repository context from the durable registry.
Sync-run writes reuse repo write-readiness semantics so archived, disabled, inactive, or installation-unavailable repos fail truthfully.
The HTTP surface stays intentionally narrow and debug-only through:

- `GET /twin/repositories/:owner/:repo/entities`
- `GET /twin/repositories/:owner/:repo/edges`
- `GET /twin/repositories/:owner/:repo/runs`

Validation completed successfully:

- `pnpm db:generate`
- `pnpm db:migrate`
- `pnpm run db:migrate:ci`
- `pnpm repo:hygiene`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm build`
- `pnpm test`
- `pnpm ci:repro:current`

Live smoke also succeeded with a real synced repository target from the registry:

- repository: `616xold/pocket-cto`
- repo read through twin service: success
- synthetic sync run creation and completion: success
- before run count: `0`
- after run count: `1`

Remaining work is intentionally outside this slice: extractor-specific ingestion, freshness scoring, blast-radius reasoning, and discovery-mission formatting. Because the repo-scoped spine, repo-readiness composition, and debug read surface are now in place, M3.2 can begin cleanly without reworking this foundation.
