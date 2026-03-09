# EP-0004 - Make CI hermetic and clean up plan numbering

This ExecPlan is a living document. Keep `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` current.

## Purpose / Big Picture

After this change, a clean Ubuntu GitHub Actions runner should be able to install the repo from the checked-in lockfile, run static validation, provision and migrate both required Postgres databases, and finish the full test suite without depending on a committed `.env`, a manually started local database, or a real local Codex binary.
At the same time, the duplicate `EP-0002` plan numbering disappears so future contributors have one unambiguous plan index.

The user-visible proof is operational rather than product-facing: the CI workflow becomes readable and diagnosable, the plan filenames are unique, and the repo-level validation commands remain truthful on a clean checkout.

## Progress

- [x] (2026-03-09T21:31Z) Read the requested repository docs, config modules, package manifests, CI workflow, lockfile, env example, test DB helpers, and active ExecPlans, then audited the current workflow for hermeticity gaps and found the duplicate `EP-0002` plan numbering conflict.
- [x] (2026-03-09T21:31Z) Created this ExecPlan and recorded the repo-level scope, affected files, validation commands, and rollback posture.
- [x] (2026-03-09T21:31Z) Renamed the runtime bootstrap plan from `EP-0002` to `EP-0003`, updated every stale repo reference, and recorded the numbering cleanup in the affected plan logs.
- [x] (2026-03-09T21:37Z) Replaced the single CI verify job with explicit `static` and `integration-db` jobs, added workflow-owned env blocks, and added `tools/ci-prepare-postgres.mjs` as the narrow Postgres readiness and database-creation helper.
- [x] (2026-03-09T21:43Z) Kept CI and tests independent from a committed `.env`, a manually provisioned database, and a real `codex` binary by injecting all required env in the workflow, validating the existing fake Codex fixture paths, and pinning a harmless CI runtime default.
- [x] (2026-03-09T21:44Z) Updated docs with the new CI contract, recorded the numbering cleanup in the hygiene and runtime plans, and kept `apps/web/tsconfig.json` stable so `pnpm build` no longer rewrites tracked config on each run.
- [x] (2026-03-09T21:47Z) Ran `pnpm repo:hygiene`, `pnpm lint`, `pnpm typecheck`, `pnpm build`, and `pnpm test`, then ran the encoded DB-prep and dual migration commands against the local Postgres instance available in this session.

## Surprises & Discoveries

- Observation: The current workflow still installs with `--frozen-lockfile=false`, so CI does not prove the checked-in lockfile is authoritative.
  Evidence: `.github/workflows/ci.yml` currently runs `pnpm install --frozen-lockfile=false`.

- Observation: The current workflow runs no Postgres service, creates no databases, and applies no migrations, even though control-plane DB-backed specs import the test database helper at module load time.
  Evidence: `.github/workflows/ci.yml` has no `services:` block, while `apps/control-plane/src/test/database.ts` calls `loadEnv()` and `resolveTestDatabaseUrl()` eagerly and then truncates real database tables.

- Observation: The repo started this slice with two different ExecPlans named `EP-0002`, which made cross-references ambiguous.
  Evidence: the hygiene plan already occupied `EP-0002`, the runtime bootstrap plan had to be renumbered to `EP-0003`, and `plans/EP-0001-mission-spine.md` originally pointed at the runtime plan using the duplicate number.

- Observation: `pnpm build` rewrites `apps/web/tsconfig.json` on a clean checkout unless the Next.js-generated `noEmit` and `.next/types/**/*.ts` entries are already checked in.
  Evidence: the local validation build added those fields automatically before the file was committed in its stabilized form.

- Observation: The fake Codex app-server fixture already avoided a real `codex` binary, but lint on a clean run still failed until the fixture imported `process` explicitly under the repo's ESLint rules.
  Evidence: `pnpm lint` failed on `packages/testkit/src/runtime/fake-codex-app-server.mjs` with `no-undef` before the explicit Node import was added.

## Decision Log

- Decision: Keep `plans/EP-0002-repo-hygiene.md` as the authoritative `EP-0002` and renumber the runtime bootstrap plan to `EP-0003`.
  Rationale: The user explicitly required the hygiene plan to remain `EP-0002`, and renumbering the later runtime plan is the smallest change that restores a unique plan sequence.
  Date/Author: 2026-03-09 / Codex

- Decision: Split CI into a `static` job and an `integration-db` job.
  Rationale: Static checks and DB-backed tests have different dependencies and failure modes; separating them makes logs readable and keeps DB setup out of the static path.
  Date/Author: 2026-03-09 / Codex

- Decision: Add a small `tools/` helper for Postgres readiness and database creation instead of hiding DB bootstrap inside a long inline shell block.
  Rationale: The repo already favors explicit checked-in policy and small reusable modules; a narrow Node helper keeps the workflow readable and reproducible on both CI and local machines.
  Date/Author: 2026-03-09 / Codex

- Decision: Provide CI env explicitly in the workflow and pin a harmless `CODEX_APP_SERVER_COMMAND` default there even though current tests already use fake fixtures.
  Rationale: The repo should not depend on `.env` in CI, and an explicit safe runtime default guards future tests against accidentally shelling out to a real `codex` binary.
  Date/Author: 2026-03-09 / Codex

- Decision: Keep the Next.js-generated `apps/web/tsconfig.json` additions checked in.
  Rationale: The static CI job now runs `pnpm build`, and allowing the build to mutate a tracked config file on every clean checkout would make the repo non-hermetic even when the code passes.
  Date/Author: 2026-03-09 / Codex

- Decision: Fix the fake Codex fixture lint failure directly instead of weakening lint rules or changing test behavior.
  Rationale: Importing the Node global explicitly is the smallest change that keeps the existing fake-fixture test path intact and lets CI stay green without widening runtime behavior.
  Date/Author: 2026-03-09 / Codex

## Context and Orientation

This slice belongs to roadmap milestone `M0.1 repo bootstrap and dev infrastructure`.
It is repo infrastructure work, not a product feature change.
The mission, replay, worker, runtime, GitHub, and UI behavior should stay functionally unchanged unless a tiny test or config change is required to make CI hermetic on a clean runner.

The relevant repo areas are:

- CI orchestration in `.github/workflows/ci.yml`
- root scripts and validation flow in `package.json`
- config contract in `packages/config/src/index.ts` and `packages/config/src/test-db.ts`
- DB-backed test bootstrap in `apps/control-plane/src/test/database.ts`
- migration entrypoint in `packages/db`
- plan references under `plans/`
- contributor docs in `README.md` and `docs/ops/local-dev.md`

Replay and proof-bundle implications are explicit: none.
This slice does not change persisted mission or task behavior, so no new replay events or evidence artifacts are required.
There is also no impact on `WORKFLOW.md`, stack packs, GitHub App permissions, or webhook expectations.

## Plan of Work

First, resolve the duplicate plan numbering by renaming the runtime bootstrap plan to `EP-0003`, fixing every stale reference, and recording that cleanup in the relevant plan logs.

Next, redesign CI into two jobs.
The `static` job will own install, hygiene, lint, typecheck, and build on a clean runner with an explicit environment.
The `integration-db` job will own Postgres provisioning, database creation, migrations against both `pocket_cto` and `pocket_cto_test`, and the full test suite.

Then add the smallest helper under `tools/` needed to wait for Postgres and create the two databases from the workflow-provided URLs.
Finally, update docs so contributors understand that CI uses workflow env and service containers while local development still uses `.env.example -> .env`.

The intended edit surface is:

- `plans/EP-0004-ci-hermetic-hardening.md`
- `plans/EP-0002-repo-hygiene.md`
- `plans/EP-0003-codex-runtime-bootstrap.md`
- `plans/EP-0001-mission-spine.md`
- `.github/workflows/ci.yml`
- `package.json`
- `README.md` and/or `docs/ops/local-dev.md`
- `tools/ci-prepare-postgres.mjs`
- `apps/web/tsconfig.json`
- `packages/testkit/src/runtime/fake-codex-app-server.mjs`

Implementation should avoid widening into application modules unless a tiny test harness or config adjustment is necessary for hermetic CI.

## Concrete Steps

Run these commands from the repository root as needed:

    pnpm repo:hygiene
    pnpm lint
    pnpm typecheck
    pnpm build
    pnpm test

If local Postgres is available, also run the CI-encoded DB prep and migration path:

    cp .env.example .env
    pnpm install
    pnpm db:prepare:ci
    DATABASE_URL=postgres://postgres:postgres@localhost:5432/pocket_cto pnpm --filter @pocket-cto/db db:migrate
    DATABASE_URL=postgres://postgres:postgres@localhost:5432/pocket_cto_test pnpm --filter @pocket-cto/db db:migrate

Implementation order:

1. Update this ExecPlan with the scope, constraints, and acceptance criteria.
2. Rename the runtime bootstrap plan to `EP-0003` and update all references.
3. Add the Postgres prep helper under `tools/`.
4. Replace the CI workflow with split jobs, explicit env, a Postgres service, DB creation, and dual migration steps.
5. Update docs and plan logs.
6. Run the required validation commands and record exact outcomes.

## Validation and Acceptance

Success is demonstrated when all of these are true:

1. There is no duplicate ExecPlan number under `plans/`.
2. `plans/EP-0002-repo-hygiene.md` remains `EP-0002`.
3. The runtime bootstrap plan exists as `plans/EP-0003-codex-runtime-bootstrap.md`.
4. `.github/workflows/ci.yml` contains separate `static` and `integration-db` jobs.
5. CI installs with `pnpm install --frozen-lockfile`.
6. CI defines explicit env for the config schema instead of creating or relying on a committed `.env`.
7. The integration job provisions Postgres, creates both `pocket_cto` and `pocket_cto_test`, migrates both, and then runs `pnpm test`.
8. CI encodes a safe Codex runtime default so no automated path depends on a real `codex` binary being present.
9. `pnpm repo:hygiene`, `pnpm lint`, `pnpm typecheck`, `pnpm build`, and `pnpm test` pass locally after the change.

If local Postgres is present, manual acceptance should also show the DB helper succeeding and both migration commands completing against the two local databases.

## Idempotence and Recovery

The plan rename is safe to retry if the source file is moved once and all references are updated in the same change.
The Postgres helper should be idempotent by design: waiting for readiness and creating the target databases only if they do not already exist.
Migration steps are additive and can be rerun safely against already-migrated local CI-style databases.

If CI changes fail, revert the workflow and helper together rather than leaving a partially split job graph.
Do not weaken the config schema or DB test safety checks just to satisfy CI; prefer explicit env and database provisioning instead.

## Artifacts and Notes

Expected outputs from this slice:

- unique ExecPlan numbering under `plans/`
- a readable split GitHub Actions workflow
- a small checked-in helper for Postgres prep
- docs that distinguish local `.env` usage from CI env injection

Known non-goals:

- no product-surface API changes
- no new replay event types
- no GitHub App permission changes
- no Codex runtime feature work beyond CI-safe defaults

## Interfaces and Dependencies

Important files and modules:

- workflow definition in `.github/workflows/ci.yml`
- root scripts in `package.json`
- env schema in `packages/config/src/index.ts`
- test DB safety helper in `packages/config/src/test-db.ts`
- control-plane test DB bootstrap in `apps/control-plane/src/test/database.ts`
- Postgres migration command in `packages/db/src/migrate.ts`

Important dependencies:

- GitHub Actions Ubuntu runner
- Postgres 16 service container
- `pg` for the DB prep helper
- `pnpm` workspace install and script execution

Environment notes:

- CI must set `DATABASE_URL`, `TEST_DATABASE_URL`, `PUBLIC_APP_URL`, `CONTROL_PLANE_URL`, `NEXT_PUBLIC_CONTROL_PLANE_URL`, and artifact S3 placeholder values explicitly
- CI must not create or commit `.env`
- CI should pin a harmless `CODEX_APP_SERVER_COMMAND` and `CODEX_APP_SERVER_ARGS`

## Outcomes & Retrospective

The repo now has a unique ExecPlan sequence through `EP-0003`, a split GitHub Actions workflow with distinct static and DB-backed stages, and a checked-in Postgres prep helper that provisions both `pocket_cto` and `pocket_cto_test` before migrations and tests.

Validation succeeded locally with:

- `pnpm repo:hygiene`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm build`
- `pnpm test`
- `pnpm db:prepare:ci`
- `DATABASE_URL=postgres://postgres:postgres@127.0.0.1:5432/pocket_cto pnpm --filter @pocket-cto/db db:migrate`
- `DATABASE_URL=postgres://postgres:postgres@127.0.0.1:5432/pocket_cto_test pnpm --filter @pocket-cto/db db:migrate`

The only scope-adjacent fixes required by validation were repo-hygiene stabilizers: checking in the Next.js `tsconfig` additions that `pnpm build` already writes automatically and importing `process` explicitly in the fake Codex fixture so lint passes on a clean runner.
