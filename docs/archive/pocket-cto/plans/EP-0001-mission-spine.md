# EP-0001 - Build the mission spine

This ExecPlan is a living document. Keep `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` current.

## Purpose / Big Picture

After this milestone, Pocket CTO should be able to accept a text request, compile it into a typed mission, persist the mission and its initial tasks, append replay events, and expose the mission through a thin control-plane API.
This is the first meaningful proof that the project is a control plane and not just a UI or prompt wrapper.

## Progress

- [x] (2026-03-08T00:00Z) Initial ExecPlan drafted.
- [x] (2026-03-08T03:57Z) Reviewed the required repo docs, architecture docs, schema files, and the current mission/replay scaffold to scope M0.2 plus the persistence and container-wiring slices of M0.3 and M0.4.
- [x] (2026-03-08T04:03Z) Bootstrapped the minimum local setup for this checkout by copying `.env.example` to `.env` and installing `pnpm@10.4.1`.
- [x] (2026-03-08T04:34Z) Added additive replay-order persistence with `missions.replay_cursor`, `replay_events.sequence`, and typed DB helpers for reusable executors and pooled connections.
- [x] (2026-03-08T04:46Z) Replaced the live in-memory mission and replay path with DB-backed Drizzle repositories in `apps/control-plane`, while keeping explicit in-memory containers for isolated tests.
- [x] (2026-03-08T04:58Z) Refactored mission creation to run inside a repository transaction, persist mission input and proof-bundle placeholder artifacts, and append deterministic replay events including `artifact.created`.
- [x] (2026-03-08T05:06Z) Added DB-backed repository tests, fixed local migration/bootstrap gaps, and passed `pnpm db:generate`, `pnpm db:migrate`, `pnpm --filter @pocket-cto/control-plane test`, and `pnpm --filter @pocket-cto/control-plane typecheck`.
- [x] (2026-03-08T05:17Z) Started the final M0 persistence hardening slice to isolate DB-backed tests from the dev database, add task integrity constraints, and add DB-backed rollback proof before moving on to prompt 2.
- [x] (2026-03-08T21:32Z) Added `TEST_DATABASE_URL` support plus safe `_test` derivation for DB-backed tests, updated local-dev documentation, and moved the control-plane test helper off the main development database.
- [x] (2026-03-08T21:34Z) Added additive `mission_tasks` integrity constraints for self-referential dependencies and per-mission sequence uniqueness, then generated and applied the migration.
- [x] (2026-03-08T21:35Z) Added a DB-backed `MissionService` integration test for successful mission-spine persistence and a rollback proof that throws after proof-bundle persistence and leaves all mission-spine tables empty.
- [x] (2026-03-08T21:35Z) Final validation passed for this persistence slice: `pnpm db:generate`, `pnpm db:migrate`, `pnpm --filter @pocket-cto/control-plane test`, and `pnpm --filter @pocket-cto/control-plane typecheck`.
- [x] (2026-03-09T01:08Z) Hardened the remaining M0 route contract so `POST /missions/text`, `GET /missions/:missionId`, and `GET /missions/:missionId/events` now use centralized `400` mapping for Zod validation failures and stable `404` mission-not-found responses from the service layer.
- [x] (2026-03-09T01:08Z) Expanded route-level `app.inject` coverage for the full `201`/`200`/`400`/`404` matrix and documented exact local `curl` acceptance flows plus expected response shapes in `docs/ops/local-dev.md`.
- [x] (2026-03-09T01:08Z) Passed `pnpm --filter @pocket-cto/control-plane test` and `pnpm --filter @pocket-cto/control-plane typecheck` for the API-contract slice; `pnpm --filter @pocket-cto/control-plane lint` still fails on pre-existing workspace lint baseline issues after adding the missing direct `@eslint/js` dependency required by `eslint.config.mjs`.
- [x] (2026-03-09T02:33Z) Aligned mission creation with the documented state machine by persisting `planned -> queued` after initial task materialization, appending a machine-readable `mission.status_changed` replay event, and returning `mission.status = "queued"` from both create and detail endpoints.
- [x] (2026-03-09T02:33Z) Updated route-level, in-memory service, and DB-backed service tests plus local acceptance documentation to assert the new queued mission status and the deliberate replay order `mission.created -> task.created* -> mission.status_changed -> artifact.created`.
- [x] (2026-03-09T02:33Z) Re-ran `pnpm --filter @pocket-cto/control-plane test` and `pnpm --filter @pocket-cto/control-plane typecheck` after the queued-transition slice; `pnpm --filter @pocket-cto/control-plane lint` still depends on the broader lint-baseline cleanup described below.
- [x] (2026-03-09T02:50Z) Finished the M0 worker-entrypoint slice: the worker now supports `--once` plus env-driven poll mode, claims exactly one runnable persisted task per tick, emits deterministic `task.status_changed` replay for `pending -> claimed`, and leaves missions themselves at `queued` for the later M1 runtime handoff.
- [x] (2026-03-09T02:50Z) Added in-memory and DB-backed orchestrator coverage for planner-before-executor ordering, dependency blocking while planner is only `claimed`, stable repeated idle ticks, and replay ordering across claim plus later task completion.
- [x] (2026-03-09T02:53Z) Final worker-slice validation passed: `pnpm --filter @pocket-cto/control-plane test`, `pnpm --filter @pocket-cto/control-plane typecheck`, and `pnpm --filter @pocket-cto/control-plane lint` all succeeded after refreshing the referenced `domain` and `config` declaration outputs and the checked-in source-side domain JS companions.
- [x] (2026-03-09T02:53Z) Manual DB-backed acceptance passed: creating mission `62d67a2b-3f35-48c4-9d9e-d3e6cce8f9cf`, running `pnpm --filter @pocket-cto/control-plane exec tsx src/worker.ts --once`, and fetching mission detail plus replay showed planner `pending -> claimed`, executor still `pending`, mission still `queued`, and replay sequence `6 = task.status_changed` with `reason = "worker_claimed"`.
- [ ] Create root project infrastructure and package boundaries.
- [x] Add domain schemas and DB schema for missions, tasks, artifacts, approvals, replay events, and outbox events.
- [x] Implement control-plane API and worker entrypoints.
- [x] Implement mission creation from text input with a stubbed compiler path.
- [x] Append replay events for mission and task creation.
- [x] Expose mission detail and replay event endpoints.
- [x] Add tests for mission creation and replay append behavior.
- [x] Update docs and outcomes after implementation.

## Surprises & Discoveries

- Observation: The repository already contains domain contracts, Drizzle schema definitions, thin Fastify routes, and an evidence placeholder service, but the live control-plane bootstrap still constructs only in-memory mission and replay repositories.
  Evidence: `apps/control-plane/src/bootstrap.ts`, `apps/control-plane/src/modules/missions/repository.ts`, `apps/control-plane/src/modules/replay/repository.ts`.

- Observation: The local environment was not bootstrapped and lacks the Docker and PostgreSQL command-line tools assumed by the README bootstrap path.
  Evidence: `.env` and `node_modules` were missing, `pnpm` had to be installed manually, and `docker`/`psql` were not present in `PATH`.

- Observation: The checked-in migration runner pointed at `packages/db/drizzle` relative to the package working directory, which resolved to the wrong path during `pnpm --filter @pocket-cto/db db:migrate`.
  Evidence: `pnpm db:migrate` initially failed with `Can't find meta/_journal.json file` until `packages/db/src/migrate.ts` was switched to a file-relative migrations path.

- Observation: `packages/testkit` imported `@pocket-cto/domain` through the workspace path map but did not declare the corresponding TypeScript project reference.
  Evidence: `pnpm --filter @pocket-cto/testkit build` failed until `packages/testkit/tsconfig.json` added a reference to `../domain`.

- Observation: The DB-backed test helper still points at `DATABASE_URL`, so the current cleanup path can truncate the main development database if tests are run against the default local setup.
  Evidence: `apps/control-plane/src/test/database.ts` calls `createDb(env.DATABASE_URL)` and truncates mission tables directly.

- Observation: Once DB-backed specs were isolated onto a dedicated test database, Vitest file parallelism became a real source of truncation races across suites.
  Evidence: DB-backed mission and replay specs intermittently failed until `apps/control-plane/vitest.config.ts` disabled file-level parallelism for the control-plane package.

- Observation: The root ESLint config imports `@eslint/js` directly but the workspace did not declare it as a direct dependency, so the required `pnpm --filter @pocket-cto/control-plane lint` command failed before it could evaluate source files.
  Evidence: `pnpm --filter @pocket-cto/control-plane lint` initially exited with `ERR_MODULE_NOT_FOUND` for `@eslint/js` until the dependency was added to `package.json`.

- Observation: The documented `planned -> queued` boundary already existed in the architecture docs, but the live `createFromText` flow still ended at `planned` and never appended a mission-level status-transition event.
  Evidence: `apps/control-plane/src/modules/missions/service.ts` previously returned the original `mission` record after task creation and `GET /missions/:missionId/events` only surfaced `mission.created`, `task.created`, and `artifact.created`.

- Observation: Control-plane typecheck uses the declaration outputs of referenced composite workspace packages, so changing `packages/domain` and `packages/config` required refreshing those referenced declarations before the control-plane package could see the new task attempt-count and worker env fields.
  Evidence: the first `pnpm --filter @pocket-cto/control-plane typecheck` still saw the old `MissionTaskRecord` and `Env` shapes until `pnpm --filter @pocket-cto/domain build` and `pnpm --filter @pocket-cto/config build` regenerated `dist/*.d.ts`.

- Observation: The checked-in `packages/domain/src/*.js` companions are runtime-active during local `tsx` execution, so adding `attemptCount` to the TypeScript schema also required updating the source-side generated JS or DB-backed task records would silently drop that field at runtime.
  Evidence: the first DB-backed orchestrator test failed because `MissionTaskRecordSchema.parse()` loaded stale `packages/domain/src/mission-task.js` and stripped `attemptCount` from the claimed task until those source-side companions were synced.

## Decision Log

- Decision: Start with a stubbed mission compiler interface before wiring the OpenAI structured-output call.
  Rationale: This lets the mission spine land quickly while preserving the correct contract boundary.
  Date/Author: 2026-03-08 / scaffold

- Decision: Keep the API and worker in the same package but with separate entrypoints.
  Rationale: This preserves process boundaries without early monorepo sprawl.
  Date/Author: 2026-03-08 / scaffold

- Decision: Keep `packages/db` limited to schema and reusable DB helpers, and put all concrete Drizzle repositories inside `apps/control-plane/src/modules/missions/` and `apps/control-plane/src/modules/replay/`.
  Rationale: This preserves the repository boundaries from `AGENTS.md` while still moving the live app onto Postgres-backed persistence.
  Date/Author: 2026-03-08 / Codex

- Decision: Persist the proof-bundle placeholder as an additive `proof_bundle_manifest` artifact row whose manifest JSON lives under `artifacts.metadata.manifest`.
  Rationale: This satisfies the preferred explicit storage shape from the task and makes the placeholder visible in the evidence ledger without adding a separate proof-bundle table yet.
  Date/Author: 2026-03-08 / Codex

- Decision: Make replay ordering deterministic with a mission-local replay counter and a persisted event ordinal.
  Rationale: A mission-scoped counter incremented and inserted inside the same transaction avoids relying on timestamp coincidence and gives the API a stable replay order.
  Date/Author: 2026-03-08 / Codex

- Decision: Keep an explicit `createInMemoryContainer()` path for route and service tests even though the live app now defaults to the DB-backed container.
  Rationale: This preserves fast isolated tests without weakening the production bootstrap path or mixing test-specific branching into the route layer.
  Date/Author: 2026-03-08 / Codex

- Decision: Load the nearest checked-in `.env` from `@pocket-cto/config` when `process.env` is the active source.
  Rationale: The README bootstrap already tells contributors to create `.env`, so the runtime should honor that file from nested package working directories instead of requiring manual shell exports.
  Date/Author: 2026-03-08 / Codex

- Decision: DB-backed tests should resolve a dedicated test database URL from `TEST_DATABASE_URL`, or derive a suffixed `_test` database name from `DATABASE_URL` and reject unsafe truncation targets.
  Rationale: The persistence spine needs real Postgres integration tests, but those tests must not silently clear the main development database.
  Date/Author: 2026-03-08 / Codex

- Decision: Prove rollback by throwing after `saveProofBundle()` succeeds inside the DB-backed `MissionService` flow.
  Rationale: That failure point guarantees mission, mission input, tasks, replay events, and the proof-bundle artifact have all been written before the transaction aborts, so the test demonstrates real atomic rollback instead of pre-write validation failure.
  Date/Author: 2026-03-08 / Codex

- Decision: Run control-plane Vitest suites without file-level parallelism while DB-backed specs share one dedicated test database.
  Rationale: This preserves small modular tests without introducing cross-suite truncation races or requiring per-worker database provisioning for M0.
  Date/Author: 2026-03-08 / Codex

- Decision: Centralize API error translation in an app-level Fastify error handler and make services throw typed not-found errors instead of hand-building `400`/`404` responses inside route files.
  Rationale: This keeps routes thin, gives Zod body and UUID param failures a stable JSON shape, and lets mission detail plus replay endpoints share the same contract semantics without duplicated transport logic.
  Date/Author: 2026-03-09 / Codex

- Decision: Let `ReplayService` depend on the mission repository boundary for mission existence checks before returning replay events.
  Rationale: The route contract requires `404` for unknown mission IDs on `/missions/:missionId/events`, and service-level mission lookup preserves thin routes without leaking raw DB access into the replay transport layer.
  Date/Author: 2026-03-09 / Codex

- Decision: Add `@eslint/js` as a direct root dev dependency.
  Rationale: `eslint.config.mjs` imports that package directly, so keeping it transitive only makes the required lint command depend on package-manager implementation details instead of a declared workspace contract.
  Date/Author: 2026-03-09 / Codex

- Decision: Keep `mission.created` as the first mission-level replay event, emit `mission.status_changed` only after all initial `task.created` events, and place `artifact.created` after the queued transition.
  Rationale: That order makes the replay stream reconstruct the documented `planned -> queued` boundary directly from task materialization before any later worker or runtime activity exists.
  Date/Author: 2026-03-09 / Codex

- Decision: Mission creation ends at `queued`, worker claim will later own task `pending -> claimed`, and runtime bootstrap will later own the mission `queued -> running` execution transition.
  Rationale: This keeps the M0 mission-creation slice aligned with the documented state machine without smuggling worker or runtime behavior into the intake path.
  Date/Author: 2026-03-09 / Codex

- Decision: Encode runnable-task selection inside the mission repository using the order `missions.created_at ASC`, `missions.id ASC`, `mission_tasks.sequence ASC`, `mission_tasks.id ASC`, and only treat dependency-linked tasks as runnable after the dependency task reaches `succeeded`.
  Rationale: This keeps the worker entrypoint thin while making claim order explicit, deterministic, and shared across the in-memory plus Postgres paths.
  Date/Author: 2026-03-09 / Codex

- Decision: Keep task claiming and later task-status replay inside `OrchestratorService` transactions, and expose a narrow `transitionTaskStatus()` helper for tests plus the future runtime handoff instead of inventing Codex execution behavior during M0.
  Rationale: The M0 slice needs a real worker spine and replay trail, but it must not widen scope into Codex App Server process spawning, mission `queued -> running`, or workspace lifecycle before M1.
  Date/Author: 2026-03-09 / Codex

## Context and Orientation

The mission spine touches the following areas.

- `packages/domain/` holds the system contracts shared by API, worker, replay, and UI.
- `packages/db/` defines the relational schema and DB helpers.
- `apps/control-plane/` contains the mission creation API, worker loop, and replay plumbing.
- `packages/testkit/` contains fixtures and helper utilities for tests.
- `docs/architecture/` explains the intended system shape.

At the end of this milestone, the system does not need to talk to GitHub or Codex App Server yet.
It only needs to make the control-plane contract real.

This execution slice is narrower than the full milestone.
The focus for this prompt is:

- M0.2 schema hardening where replay ordering and proof-bundle storage need additive changes
- the persistence and container-wiring parts of M0.3
- the replay persistence and ordering parts of M0.4

The immediate follow-up slice for this prompt is narrower still:

- isolate DB-backed tests onto a dedicated test database
- add additive `mission_tasks` integrity constraints
- prove transactional rollback with a DB-backed `MissionService` integration test
- update local-dev and ExecPlan documentation so prompt 2 starts from an accurate baseline

The intended edit surface is:

- `plans/EP-0001-mission-spine.md`
- `docs/architecture/replay-and-evidence.md`
- `packages/db/src/schema/missions.ts`
- `packages/db/src/schema/replay.ts`
- `packages/db/src/schema/artifacts.ts`
- `packages/db/src/client.ts`
- `packages/db/src/index.ts`
- `apps/control-plane/src/bootstrap.ts`
- `apps/control-plane/src/app.ts`
- `apps/control-plane/src/modules/missions/`
- `apps/control-plane/src/modules/replay/`

## Plan of Work

The repository already has the first scaffold for missions, replay, and evidence, so this iteration hardens that scaffold rather than starting from zero.
First, make the additive schema changes needed for deterministic replay ordering and proof-bundle placeholder storage in the artifact ledger.
Next, implement concrete Drizzle repositories inside the mission and replay modules while preserving the in-memory repositories for isolated tests where they still add value.

Then refactor `MissionService` so mission creation runs inside a database transaction and can later become fully atomic without changing the route layer.
That flow should persist the mission, mission input, initial tasks, ordered replay events, and the proof-bundle placeholder artifact.
Finally, rewire the control-plane bootstrap through `@pocket-cto/config` and `@pocket-cto/db` so the live app uses the DB-backed path by default, and add focused tests for repository and service behavior.

## Concrete Steps

Run these commands from the repository root as needed:

    cp .env.example .env
    pnpm install

After dependencies are installed:

    pnpm db:generate
    pnpm db:migrate
    pnpm --filter @pocket-cto/control-plane test
    pnpm --filter @pocket-cto/control-plane typecheck

Implementation order:

1. Update this ExecPlan with scope, decisions, discoveries, and validation expectations.
2. Add the additive schema and DB-helper changes needed for deterministic replay ordering and artifact-backed proof bundles.
3. Implement Drizzle-backed mission and replay repositories inside `apps/control-plane/src/modules/*/repository.ts`.
4. Refactor `MissionService` and `ReplayService` so mission creation can run inside a shared transaction and replay ordinals stay deterministic.
5. Rewire bootstrap so the live app builds DB-backed services from `loadEnv()` and `createDb()`.
6. Add focused repository and service tests.
7. Run generation, migration, control-plane tests, and control-plane typecheck.
8. Update docs and this ExecPlan with outcomes and remaining work.

## Validation and Acceptance

Success is demonstrated when all of these are true:

1. `GET /health` returns a 200 response with a small JSON body.
2. `POST /missions/text` with a valid prompt creates a persisted mission.
3. `GET /missions/:missionId` returns:
   - mission metadata
   - initial tasks
   - a proof-bundle placeholder
4. `GET /missions/:missionId/events` returns replay events showing mission and task creation.
5. Replay events carry a deterministic mission-local ordinal and are returned in that order.
6. The proof-bundle placeholder is persisted as a `proof_bundle_manifest` artifact record.
7. Invalid request bodies and invalid UUID params return `400` with a stable JSON error body.
8. Unknown mission IDs return `404` with a stable JSON error body on both detail and replay routes.
9. Route-level tests for mission creation, mission detail, and replay appends pass.

A useful manual acceptance flow should look like:

    curl -X POST http://localhost:4000/missions/text \
      -H "content-type: application/json" \
      -d '{"text":"Implement passkeys for sign-in and keep email login working"}'

Then:

    curl http://localhost:4000/missions/<mission-id>
    curl http://localhost:4000/missions/<mission-id>/events

The second and third responses should show a structured mission and replay entries.
Invalid body, invalid UUID, and unknown mission checks are documented in `docs/ops/local-dev.md` and should match the stable JSON error bodies used in route tests.

## Idempotence and Recovery

If DB migrations fail, fix the schema and rerun the migration command on a fresh local database.
Do not hand-edit partial mission records in the database unless debugging.
Prefer deleting the local Postgres volume and rerunning bootstrap during early development.

Replay append behavior must be additive and safe to retry.
If a request fails after persistence but before response serialization, the mission should still exist and be fetchable by id.
If local Postgres provisioning is blocked in this environment, finish the code and documentation changes, record the blocker here, and leave the repository ready to run the required migration and validation commands on a machine with Postgres available.

## Artifacts and Notes

Expected initial artifacts for this milestone:

- DB schema files under `packages/db/src/schema/`
- domain contracts under `packages/domain/src/`
- mission API routes and services under `apps/control-plane/src/modules/missions/`
- replay service under `apps/control-plane/src/modules/replay/`
- tests proving the spine behavior

Expected proof and replay notes for this prompt:

- replay events expose a stable per-mission ordinal
- proof-bundle placeholder persistence is visible through `artifacts.kind = 'proof_bundle_manifest'`
- the live app bootstrap defaults to DB-backed mission and replay services

## Interfaces and Dependencies

Important interfaces that should exist at the end of this milestone:

- `MissionSpec` in `packages/domain/src/mission.ts`
- `MissionTask` contract in `packages/domain/src/mission-task.ts`
- `ReplayEvent` contract in `packages/domain/src/replay-event.ts`
- `MissionService` in `apps/control-plane/src/modules/missions/service.ts`
- `MissionCompiler` interface in `apps/control-plane/src/modules/missions/compiler.ts`
- `ReplayService` in `apps/control-plane/src/modules/replay/service.ts`

Important dependencies:

- `zod`
- `drizzle-orm`
- `pg`
- `fastify`
- `pino`
- `vitest`

Important environment variables and helpers:

- `DATABASE_URL` from `@pocket-cto/config`
- `createDb()` and pool helpers from `@pocket-cto/db`
- the existing mission compiler boundary in `apps/control-plane/src/modules/missions/compiler.ts`

## Outcomes & Retrospective

This slice completed the remaining M0 worker-entrypoint work on top of the earlier mission-intake, replay, and proof-placeholder hardening.
The live control plane now has the full M0 spine: valid mission text creates a persisted queued mission with ordered pending tasks, a worker tick deterministically claims exactly one runnable task from the oldest queued mission, `attempt_count` increments on claim, and replay appends a machine-readable `task.status_changed` event with `from`, `to`, and `reason`.

Focused repository and service tests now exercise both the in-memory and Postgres claim paths, while the API contract remains covered by `app.inject` tests for the required `201`, `200`, `400`, and `404` cases.
`docs/ops/local-dev.md` now includes exact manual acceptance commands for creating a mission, running the worker once, and verifying the mission plus replay state through the HTTP surface.
The architecture boundaries stayed intact: `src/worker.ts` is now thin, orchestration behavior lives under `apps/control-plane/src/modules/orchestrator/`, concrete persistence still lives under `apps/control-plane/src/modules/missions/` plus `apps/control-plane/src/modules/replay/`, and `packages/codex-runtime` stayed untouched.

EP-0001 is still not complete, but the M0 handoff to M1 is now explicit.
M0 now ends with a real worker entrypoint and deterministic task-claim semantics; M1.1 runtime bootstrap will attach Codex App Server process startup, thread or turn lifecycle, and the later mission `queued -> running` execution boundary to already-claimed tasks instead of rebuilding claim behavior from scratch.
That M1.1 handoff is now tracked in `plans/EP-0003-codex-runtime-bootstrap.md`, which owns the short-lived stdio bootstrap path `claim -> initialize -> initialized -> thread/start -> persist codexThreadId -> append runtime.thread_started`.
The follow-on M1.2 handoff is now tracked in `plans/EP-0005-turn-lifecycle-and-replay.md`, which owns `thread/resume`, read-only `turn/start`, `codexTurnId` persistence, structural item replay, and the first real `queued -> running` transition when a turn actually starts.
