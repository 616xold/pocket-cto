# EP-0002 - Prepare the repository for a clean initial commit

This ExecPlan is a living document. Keep `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` current.

## Purpose / Big Picture

After this change, a new contributor should be able to initialize git in this checkout, make a first commit, and avoid accidentally committing local secrets, generated build output, runtime artifacts, or source-shadowing JavaScript companions.
The change is visible through three outcomes: the repository tree no longer contains obvious local or generated junk, `pnpm repo:hygiene` fails fast when that junk reappears, and the written guidance tells future Codex threads to keep `.gitignore` plus the hygiene guard in sync with any new toolchain output.

## Progress

- [x] (2026-03-09T18:18Z) Read the required repository guidance, roadmap, active mission-spine ExecPlan, local-dev docs, package manifests, workspace config, CI workflow, and current ignore rules before starting the hygiene slice.
- [x] (2026-03-09T18:18Z) Audited the current checkout and confirmed there is no `.git/` directory, local artifacts already exist in the tree (`.env`, `.DS_Store`, nested `node_modules`, package `dist/`, `*.tsbuildinfo`), and generated companions currently shadow TypeScript source under `packages/domain/src/`.
- [x] (2026-03-09T18:46Z) Removed the current local and generated artifacts from the tree, including `.env`, `.DS_Store`, nested `node_modules`, package `dist/`, `*.tsbuildinfo`, and generated companions under `packages/domain/src/`, while preserving `.env.example`, `apps/web/next-env.d.ts`, and DB migration assets.
- [x] (2026-03-09T18:46Z) Expanded root `.gitignore`, added `tools/repo-hygiene-check.mjs`, wired `pnpm repo:hygiene` into `package.json`, `pnpm check`, and CI, and added short repo-hygiene guidance to `AGENTS.md` plus `docs/ops/local-dev.md`.
- [x] (2026-03-09T18:46Z) Fixed clean-checkout workspace validation gaps uncovered by the hygiene work: `packages/codex-runtime/src/client.ts` now uses type-only imports, `packages/stack-packs/tsconfig.json` and `apps/web/tsconfig.json` now declare the missing `@pocket-cto/domain` project references, `apps/web/package.json` now declares direct `zod`, `apps/web/lib/api.ts` now uses stable Zod output typing, `packages/config/package.json` test passes cleanly with no local specs, and `tools/typecheck-packages.mjs` now bootstraps declaration-only outputs into `dist/` without repopulating `src/`.
- [x] (2026-03-09T18:46Z) Validation passed with the final scripts and workspace wiring: `pnpm repo:hygiene`, `pnpm lint`, `pnpm typecheck`, and `pnpm test` all succeeded, then the checkout was cleaned again and `pnpm repo:hygiene` re-passed on the first-commit-ready tree.
- [x] (2026-03-09T21:31Z) Recorded the follow-up repo hardening slice that split CI into static and integration-db jobs, removed the duplicate plan number by renaming the runtime bootstrap plan to `EP-0003`, and kept this hygiene document as the authoritative `EP-0002`.

## Surprises & Discoveries

- Observation: This checkout is not yet a git repository, so tracked-file cleanup cannot be performed through git commands here and must be handled as filesystem cleanup plus future guardrails.
  Evidence: `test -d .git && echo yes || echo no` returned `no`.

- Observation: The repository already contains local and generated artifacts that would make a poor first commit baseline, including `.env`, `.DS_Store`, nested `node_modules`, multiple `dist/` folders, and package `*.tsbuildinfo` files.
  Evidence: `find . -type d ...` and `find . \( -name '.env' -o -name '.DS_Store' -o -name '*.tsbuildinfo' ... \)` returned matches under the repo root, apps, and packages.

- Observation: `packages/domain/src/` contains generated `.js` and `.d.ts` companions alongside `.ts` sources, which is exactly the source-resolution hazard this hygiene slice needs to prevent from recurring.
  Evidence: `find packages apps/control-plane -path '*/src/*' \( -name '*.js' -o -name '*.d.ts' \)` returned only `packages/domain/src/*.js` and `packages/domain/src/*.d.ts`.

- Observation: The existing package `build` path is not safe to reuse for clean-checkout typecheck bootstrapping because it repopulates `packages/domain/src/` with generated companions.
  Evidence: after the first `pnpm typecheck` attempt that bootstrapped package `build` scripts, `pnpm repo:hygiene` failed and `find packages apps/control-plane -path '*/src/*' \( -name '*.js' -o -name '*.d.ts' \)` again returned `packages/domain/src/*.js` and `packages/domain/src/*.d.ts`.

- Observation: Clean-checkout validation surfaced multiple pre-existing workspace contract issues unrelated to hygiene itself: missing TypeScript project references in `packages/stack-packs` and `apps/web`, a missing direct `zod` dependency in `apps/web`, and a no-test package script in `packages/config`.
  Evidence: the first clean-checkout `pnpm typecheck` runs failed in `packages/stack-packs` and `apps/web` with project-reference errors, `apps/web/lib/api.ts` failed to resolve `zod`, and the first root `pnpm test` failed because `packages/config` had no test files while still running bare `vitest run`.

## Decision Log

- Decision: Create a dedicated ExecPlan for the M0.1 repo-hygiene slice instead of overloading `EP-0001`.
  Rationale: The mission-spine plan already documents product behavior and persistence work; this slice is repository infrastructure and cleanliness work that needs a self-contained execution document with different acceptance criteria.
  Date/Author: 2026-03-09 / Codex

- Decision: Keep the hygiene guard at the repository root under `tools/` and wire it into both `pnpm check` and CI.
  Rationale: A fast root-level guard gives future contributors and Codex threads one canonical command to run before commits and in automation, without touching application runtime code paths.
  Date/Author: 2026-03-09 / Codex

- Decision: Remove generated JS and declaration companions from TypeScript source roots rather than trying to keep them synchronized.
  Rationale: The repository already builds package outputs into `dist/`; allowing generated companions in `src/` creates runtime shadowing hazards and makes clean commits harder to preserve.
  Date/Author: 2026-03-09 / Codex

- Decision: Bootstrap root `pnpm typecheck` with a dedicated declaration-only tool under `tools/typecheck-packages.mjs` instead of calling workspace `build` scripts.
  Rationale: The clean-checkout typecheck path needs dependency declarations, but the existing package build path can repopulate `src/` companions; a declaration-only bootstrap that writes both `.d.ts` and `tsbuildinfo` into `dist/` preserves clean source roots.
  Date/Author: 2026-03-09 / Codex

- Decision: Fix the clean-checkout workspace baseline issues discovered during validation instead of documenting them as known failures.
  Rationale: The user explicitly required `pnpm lint`, `pnpm typecheck`, and `pnpm test` before stopping, and the uncovered issues were small contract or tooling gaps that could be corrected without widening product scope.
  Date/Author: 2026-03-09 / Codex

- Decision: Keep the hygiene plan as `EP-0002` when the later runtime bootstrap plan was renumbered.
  Rationale: The repo-bootstrap and hygiene slice landed first and already serves as the stable reference point for clean-checkout policy, so later CI and runtime planning should move around it instead of renaming it.
  Date/Author: 2026-03-09 / Codex

## Context and Orientation

This slice belongs to roadmap milestone `M0.1 repo bootstrap and dev infrastructure`.
It does not add product features, database schema changes, replay events, worker semantics, GitHub integration behavior, or UI behavior.
The work stays at the repository boundary.

The key files are:

- root metadata and guardrails: `.gitignore`, `package.json`, `.github/workflows/ci.yml`, `AGENTS.md`
- contributor docs: `README.md`, `docs/ops/local-dev.md`
- source roots that must stay clean: `packages/**/src`, `apps/control-plane/src`
- intentionally tracked generated assets that must remain committed: `pnpm-lock.yaml`, `packages/db/drizzle/*.sql`, `packages/db/drizzle/meta/**`, `apps/web/next-env.d.ts`, `.env.example`
- the new hygiene guard entrypoint: `tools/repo-hygiene-check.mjs`

Replay and proof-bundle implications are explicit: none.
This task does not change mission or task state, so no replay event additions are required.
There is no `WORKFLOW.md`, stack-pack, GitHub App permission, or environment-variable change beyond documenting how local `.env` files should stay uncommitted.

## Plan of Work

First, remove the obvious local and generated artifacts that should not be present in a clean initial-commit tree, while preserving intentional checked-in assets such as DB migrations, the lockfile, and `apps/web/next-env.d.ts`.
Next, expand `.gitignore` to cover the current artifact classes plus the source-side companion files that can shadow TypeScript at runtime.

Then add a small Node-based hygiene check under `tools/` that scans the working tree for forbidden junk files, generated companions inside TypeScript source roots, and, when git is available, tracked files that violate the same rules.
Finally, wire that check into the root scripts and CI, add short repo-specific guidance to `AGENTS.md` and local-dev docs, and run the required validation commands.

The intended edit surface for this plan is:

- `plans/EP-0002-repo-hygiene.md`
- `.gitignore`
- `package.json`
- `.github/workflows/ci.yml`
- `AGENTS.md`
- `docs/ops/local-dev.md`
- `tools/repo-hygiene-check.mjs`

The intended cleanup surface for this plan is:

- `.env`
- `.DS_Store`
- `node_modules/` and nested `node_modules/`
- package `dist/` directories created locally
- `.vite/`
- `*.tsbuildinfo`
- generated `.js` and `.d.ts` companions under `packages/domain/src/`

## Concrete Steps

Run these commands from the repository root as needed:

    find . -type d \( -name node_modules -o -name dist -o -name .next -o -name coverage -o -name .vite -o -name __MACOSX -o -name tmp -o -name temp -o -name artifacts-local -o -name playwright-report -o -name test-results \) | sort
    find packages apps/control-plane -path '*/src/*' \( -name '*.js' -o -name '*.d.ts' \) | sort
    find . \( -name '.env' -o -name '.env.*' -o -name '.DS_Store' -o -name '*.tsbuildinfo' -o -name '*.log' -o -name '*.pid' \) | sort
    pnpm repo:hygiene
    pnpm lint
    pnpm typecheck
    pnpm test

If git is initialized later, also run:

    git status --ignored -s

Implementation order:

1. Update this ExecPlan with the audit, scope, and acceptance criteria.
2. Remove local and generated artifacts from the tree.
3. Expand `.gitignore` with explicit package-manager, build, env, local-runtime, junk-file, and TS-companion patterns.
4. Add `tools/repo-hygiene-check.mjs` and wire `repo:hygiene` into root scripts plus CI.
5. Add short repo-specific guidance to `AGENTS.md` and `docs/ops/local-dev.md`.
6. Run the required validation commands and record their exact results here.

## Validation and Acceptance

Success is demonstrated when all of these are true:

1. The working tree no longer contains obvious local or generated artifacts such as `.env`, `.DS_Store`, nested `node_modules`, package `dist/`, and `*.tsbuildinfo`.
2. No generated `.js` or `.d.ts` companions remain under `packages/**/src` or `apps/control-plane/src`, except intentional tracked exceptions outside those patterns such as `apps/web/next-env.d.ts`.
3. Root `.gitignore` covers package-manager installs, caches, build outputs, env files, local runtime artifacts, OS/editor junk, and source-root companion files.
4. `pnpm repo:hygiene` exits successfully on the cleaned tree.
5. `pnpm check`, or its equivalent root verification path, includes `repo:hygiene`.
6. CI also runs the same hygiene command before the normal lint, typecheck, and test stages.
7. `AGENTS.md` and local-dev docs tell future Codex threads not to commit env files, generated outputs, or TS-source companions, and to update both `.gitignore` and `repo:hygiene` when new toolchains introduce artifacts.

Manual acceptance should look like this:

    pnpm repo:hygiene
    pnpm lint
    pnpm typecheck
    pnpm test

If git exists in the checkout:

    git status --ignored -s

The hygiene command should print no violations, and the git ignored-status view should show local artifacts ignored rather than ready to commit.

## Idempotence and Recovery

The cleanup commands in this plan only target generated or local artifacts and are safe to rerun.
If a deletion target turns out to be intentional, restore it from the source file that generated it or from a clean copy of the repository before initializing git.
If the hygiene script blocks on a false positive, narrow the pattern or add a documented allowlist entry in the same change rather than weakening the whole guard.
Because this checkout is not yet a git repo, rollback relies on the local filesystem copy; avoid deleting migrations, the lockfile, `.env.example`, or real `.ts`/`.tsx` source files.

## Artifacts and Notes

Resulting artifacts and notes:

- `.gitignore` now covers nested package-manager installs, build outputs, caches, env files, local runtime directories, editor junk, and accidental `src/` companions.
- `tools/repo-hygiene-check.mjs` now guards the tree and checks tracked ignored files whenever git is available.
- `tools/typecheck-packages.mjs` now gives the root `pnpm typecheck` command a clean-checkout-safe declaration bootstrap.
- `pnpm check` and `.github/workflows/ci.yml` now run the hygiene guard before the broader workspace validations.
- The final cleaned tree keeps only intentional local bootstrap assets such as `.env.example`; generated source companions, `dist/`, `node_modules/`, and `*.tsbuildinfo` were removed again after validation.

## Interfaces and Dependencies

Important files and interfaces for this slice:

- root scripts in `package.json`
- the new executable Node module `tools/repo-hygiene-check.mjs`
- git-aware checks implemented via the local `git` CLI when available
- repo patterns encoded in `.gitignore`

Important dependencies:

- Node 22 runtime already required by the repo
- `pnpm` workspace root scripts
- the local filesystem

Environment and policy notes:

- local `.env` files stay supported for developer setup, but must remain uncommitted
- no new environment variables are introduced
- no replay, proof bundle, worker, GitHub App, or UI interfaces change in this plan

## Outcomes & Retrospective

This slice finished the M0.1 hygiene goal for an initial commit.
The repository now has explicit ignore coverage, a fast `pnpm repo:hygiene` guard, CI and `pnpm check` wiring for that guard, and short repo-specific instructions telling future Codex threads to keep env files, generated output, and `src/` companions out of commits.

The final cleaned checkout is in first-commit shape: no `.git/` directory exists yet, only `.env.example` remains under env files, no `node_modules/`, `dist/`, `*.tsbuildinfo`, `.DS_Store`, or `packages/**/src/**/*.js|d.ts` companions remain, and `pnpm repo:hygiene` passes on that cleaned tree.
Validation also forced several small baseline fixes that were worth landing now because they made the required root commands truthful on a fresh checkout: root lint passes after the codex-runtime type-only import fix, root typecheck now bootstraps declarations without polluting `src/`, and root test no longer fails merely because `packages/config` has no specs.
