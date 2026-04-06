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
- [x] (2026-03-10T01:16Z) Re-diagnosed the currently red CI path from a fresh clone because `gh` was unavailable locally, audited tracked-ignored and ignored-path behavior with git-index commands, and reproduced two concrete clean-checkout issues: `pnpm build` mutates tracked `apps/web/next-env.d.ts`, and `pnpm test` under `turbo run test` strips required env such as `DATABASE_URL` and artifact placeholders from control-plane DB-backed specs.
- [x] (2026-03-10T01:27Z) Added shared root `ci:static` and `ci:integration-db` scripts, introduced small `tools/ci-check-clean-tree.mjs` and `tools/ci-migrate-databases.mjs` helpers, wired the workflow to those scripts with explicit CI telemetry or color env plus version steps, and updated `turbo.json` so the required runtime env reaches task processes.
- [x] (2026-03-10T01:27Z) Revalidated the hardened path from a fresh overlay clone of the current work: `pnpm ci:static` passed with a clean tree after build, and `pnpm ci:integration-db` passed after DB prep, dual migrations, tests, and a second clean-tree check.
- [x] (2026-03-10T22:52Z) Audited the live repo state before editing, confirmed `gh` was unavailable in this environment, and reproduced two clean snapshots from temp worktrees: the pushed `95b45cbaf875229bd138f63b992ef0da35773493` commit and the exact next intended push assembled from the current tracked diff plus untracked runtime files.
- [x] (2026-03-10T22:58Z) Identified the first concrete next-push break in that temp overlay: `pnpm ci:static` failed in `@pocket-cto/testkit#lint` because `packages/testkit/src/runtime/fake-codex-app-server.mjs` referenced bare `setTimeout` under the repo ESLint globals contract.
- [x] (2026-03-10T22:58Z) Added `pnpm ci:repro:current`, pinned the workflow to `pnpm` 10.4.1 to match `packageManager`, and documented the temp-worktree reproduction path so future CI diagnosis validates the exact next push instead of only the last commit on `main`.
- [x] (2026-03-10T23:00Z) Extended `tools/ci-check-clean-tree.mjs` with an optional baseline snapshot mode so `pnpm ci:repro:current` can compare post-build or post-test churn against the overlaid starting state rather than against `HEAD`.
- [x] (2026-03-10T23:01Z) Re-ran `pnpm ci:repro:current` after that baseline fix and verified the exact next intended push now passes install, `pnpm ci:static`, and `pnpm ci:integration-db` from a fresh temp worktree with local Postgres.
- [x] (2026-03-10T23:16Z) Re-audited the live repo on branch `codex/next-push-ci` at `cc3918379789e3961a2bee5eb5d49742931cf717`, confirmed `origin/codex/next-push-ci` points at the same pushed commit, and verified the remaining branch-visibility gap: the workflow still limited `push` to `main`, so plain branch pushes showed no CI status despite the repo already having `ci:repro:current` and the exact `pnpm` pin.
- [x] (2026-03-10T23:18Z) Removed the `main`-only push filter, added `workflow_dispatch` plus per-ref workflow concurrency, and documented that CI now runs on branch pushes so future Codex branches show visible status before opening a PR.
- [x] (2026-03-10T23:23Z) Reproduced the latest pushed branch commit `cc3918379789e3961a2bee5eb5d49742931cf717` from a clean temp worktree and confirmed both `pnpm ci:static` and `pnpm ci:integration-db` pass under runner-style env with local Postgres.
- [x] (2026-03-10T23:27Z) Re-ran the requested root validation commands in the live dirty checkout, confirmed `pnpm repo:hygiene`, `pnpm lint`, `pnpm typecheck`, `pnpm build`, and `pnpm test` still pass, and confirmed `pnpm ci:static` plus `pnpm ci:integration-db` fail there only at `ci:clean-tree` because the worktree intentionally contains unstaged runtime changes.
- [x] (2026-03-10T23:29Z) Re-ran `pnpm ci:repro:current` after the branch-trigger change and verified the exact next intended push still passes install, `pnpm ci:static`, and `pnpm ci:integration-db` from a fresh temp worktree at `/var/folders/41/pj1kw0tj2xd832wl_62gn73m0000gn/T/pocket-cto-ci-repro-U8JSVW/repo`.
- [x] (2026-03-11T00:14Z) Audited the new M1.3 workspace env surface and found that `packages/config` plus docs already knew about `WORKSPACE_ROOT` and `POCKET_CTO_SOURCE_REPO_ROOT`, but `turbo.json`, `.github/workflows/ci.yml`, and `tools/ci-repro-current-worktree.mjs` still did not propagate them.
- [x] (2026-03-11T00:16Z) Added `WORKSPACE_ROOT` and `POCKET_CTO_SOURCE_REPO_ROOT` to Turbo `globalEnv`, set safe workflow defaults (`/tmp/pocket-cto-workspaces` and `${{ github.workspace }}`), mirrored the same contract in `ci:repro:current` with temp-rooted values, and updated local-dev docs plus this ExecPlan to explain the reason.
- [x] (2026-03-11T02:15Z) Re-ran `pnpm repo:hygiene`, `pnpm lint`, `pnpm typecheck`, `pnpm build`, and `pnpm test` in the live checkout, then confirmed `pnpm ci:static` and `pnpm ci:integration-db` fail there only at `ci:clean-tree` because the current repo intentionally contains the tracked workspace-env edits from this slice.
- [x] (2026-03-11T02:15Z) Re-ran `pnpm ci:repro:current` with local Postgres and verified the clean temp worktree passes install, `pnpm ci:static`, and `pnpm ci:integration-db` with `WORKSPACE_ROOT` rooted outside the repo and `POCKET_CTO_SOURCE_REPO_ROOT` pointed at the temp checkout.
- [x] (2026-03-12T16:27Z) Fetched the remote state, confirmed `gh` is unavailable locally, and found that `origin/main` now points at merge commit `08b53f1a9552a16465db7a37b69b7dde475783d7` while the current branch head is `fc137bcdfd5e860e1d9d7e992f0173aa5253684b`.
- [x] (2026-03-12T16:29Z) Confirmed `origin/main` and `HEAD` share the same git tree object, which rules out a content-only merge skew as the primary explanation for the reported post-merge `integration-db` failure.
- [x] (2026-03-12T16:32Z) Added `pnpm ci:repro:ref` plus `tools/ci-repro-ref.mjs` and `tools/ci-repro-shared.mjs` so any clean ref can be reproduced with the same workflow env contract and optional repeated `integration-db` runs.
- [x] (2026-03-12T16:33Z) Reproduced `pnpm ci:integration-db` from clean temp worktrees 5 times against `origin/main` and once against `HEAD`, with every run passing install, DB prep, dual migrations, tests, and the clean-tree check.
- [x] (2026-03-12T16:34Z) Re-ran `pnpm repo:hygiene`, `pnpm lint`, `pnpm typecheck`, `pnpm build`, and `pnpm test` on the live branch, then re-ran `pnpm ci:static` and `pnpm ci:integration-db` against a baseline snapshot so both entrypoints stayed green relative to the current dirty M1.5 worktree.
- [x] (2026-03-13T19:15Z) Re-fetched `origin/main`, confirmed `gh` is unavailable in this environment, and reproduced the merged M1.6 failure from clean refs: `pnpm ci:repro:ref --ref origin/main --step integration-db --repeat 10` failed 10/10 times and `pnpm ci:repro:ref --ref HEAD --step integration-db --repeat 5` failed 5/5 times at the same `pnpm ci:integration-db` clean-tree step.
- [x] (2026-03-13T19:15Z) Narrowed the deterministic failure to the fake Codex approval fixture mutating tracked `packages/codex-runtime/README.md` because `turn/start` fell back to `process.cwd()` instead of the thread `cwd` when approval tests omitted `cwd`, then fixed the fixture and added a protocol-spec assertion that the approval side effect lands in the temporary approval directory.
- [x] (2026-03-13T19:15Z) Updated `tools/ci-repro-ref.mjs` so repeated clean-ref runs continue after failures and report a full summary, removed a stray root `.DS_Store`, and revalidated the patched current snapshot with `pnpm ci:repro:current`, which now passes install, `pnpm ci:static`, and `pnpm ci:integration-db` from a clean temp worktree.
- [x] (2026-03-14T03:08Z) Fetched `origin/main` to `e7fd99e50c6d7cac62acf6fbd34e840ca8689f4e`, confirmed `gh` is still unavailable locally, and re-ran clean-ref `integration-db` reproduction against committed `HEAD` and merged `origin/main`; both refs failed deterministically in `@pocket-cto/web#test` because `apps/web/lib/api.spec.ts` still expects `http://localhost:4000` while the CI env contract uses `http://127.0.0.1:4000`.
- [x] (2026-03-14T03:08Z) Verified that the exact current local branch snapshot is already green without further CI edits: `pnpm ci:repro:current` passed from a clean temp worktree, `pnpm repo:hygiene`, `pnpm lint`, `pnpm typecheck`, `pnpm build`, and `pnpm test` passed in the live checkout, and the direct live `pnpm ci:static` plus `pnpm ci:integration-db` runs again failed only at `ci:clean-tree` because the web API fix and plan work are still intentionally unstaged.
- [x] (2026-03-15T23:35Z) Re-fetched `origin/main`, confirmed `gh` is still unavailable locally, and reproduced the latest M2.5 branch static failure from clean refs: `pnpm ci:repro:ref --ref HEAD --step static --repeat 5` failed 5/5 inside `pnpm typecheck`, specifically `pnpm typecheck:packages`, because `packages/testkit/src/fixtures.ts` still returned the pre-M2.5 proof-bundle placeholder shape required by `ProofBundleManifest`.
- [x] (2026-03-15T23:35Z) Fixed the stale proof-bundle placeholder fixture in `packages/testkit`, added a focused regression spec for the current manifest shape, and revalidated the dirty current snapshot: `pnpm repo:hygiene`, `pnpm lint`, `pnpm typecheck`, `pnpm build`, and `pnpm test` all passed locally; `pnpm ci:repro:current` passed from a clean temp worktree including `ci:integration-db`; and the direct live `pnpm ci:static` plus `pnpm ci:integration-db` runs again failed only at `ci:clean-tree` because the two testkit edits are intentionally unstaged.

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

- Observation: The committed CI workflow can look green locally until `turbo run test` is exercised under a runner-style env, because Turbo 2 does not pass arbitrary env through to task processes unless the repo declares them.
  Evidence: in a fresh clone of `21d1381`, `pnpm test` failed inside `apps/control-plane/src/test/database.ts` with `DATABASE_URL`, `ARTIFACT_S3_ENDPOINT`, `ARTIFACT_S3_BUCKET`, `ARTIFACT_S3_ACCESS_KEY`, and `ARTIFACT_S3_SECRET_KEY` all reported as `undefined`, while `pnpm --filter @pocket-cto/control-plane exec node -e 'console.log(process.env.DATABASE_URL)'` in the same shell still showed the values.

- Observation: The committed web build still mutates a tracked file even after the earlier `tsconfig.json` stabilization.
  Evidence: a fresh clone of `21d1381` ran `pnpm build` successfully but left `apps/web/next-env.d.ts` modified with the new typed-routes reference and updated Next.js comment block.

- Observation: The currently pushed `95b45cbaf875229bd138f63b992ef0da35773493` snapshot is locally green, but the exact next intended push can still be red because the active worktree contains additional runtime files beyond `origin/main`.
  Evidence: a clean temp worktree at `95b45cbaf875229bd138f63b992ef0da35773493` passed both `pnpm ci:static` and `pnpm ci:integration-db`, while the temp worktree overlaid with the live diff failed immediately in `@pocket-cto/testkit#lint`.

- Observation: Reproducing a dirty next-push snapshot needs a clean-tree baseline, otherwise the guard will correctly flag the overlaid diff itself as churn.
  Evidence: the first `pnpm ci:repro:current` attempt failed after a successful build because `tools/ci-check-clean-tree.mjs` compared the temp worktree against `HEAD` instead of the captured overlay state; writing a baseline snapshot before install fixed the false failure.

- Observation: The current remote branch tip already contains the hermetic CI scripts and reproduction helper, but branch pushes still look silent because the workflow trigger is narrower than the validation contract.
  Evidence: `origin/codex/next-push-ci` resolves to `cc3918379789e3961a2bee5eb5d49742931cf717`, `package.json` already exposes `pnpm ci:repro:current`, `tools/ci-repro-current-worktree.mjs` exists in the tree, and `.github/workflows/ci.yml` still declares `push.branches: ["main"]`.

- Observation: The root `ci:static` and `ci:integration-db` scripts are behaving correctly in the live checkout by failing only at the final clean-tree gate, not in lint, typecheck, build, migration, or tests.
  Evidence: after the branch-trigger fix, both commands completed their substantive steps successfully and then reported the existing tracked and untracked runtime files already present in the dirty worktree.

- Observation: The repo had already documented safe external workspace semantics for M1.3, but CI and Turbo still treated workspace env changes as invisible.
  Evidence: `packages/config/src/index.ts` and `docs/ops/local-dev.md` already mention `WORKSPACE_ROOT` and `POCKET_CTO_SOURCE_REPO_ROOT`, while `turbo.json` omitted both from `globalEnv`, `.github/workflows/ci.yml` set neither, and `tools/ci-repro-current-worktree.mjs` exported neither in its `CI_ENV` contract.

- Observation: The latest merged `origin/main` commit and the current branch head are content-identical.
  Evidence: `git rev-parse origin/main^{tree} HEAD^{tree}` returned the same tree hash `1234a3d66a258689e97cf93bb5692714fa83cf2a`.

- Observation: The merged M1.6 `integration-db` failure is deterministic from clean refs, and it is a clean-tree failure rather than a Postgres or assertion failure.
  Evidence: `pnpm ci:repro:ref --ref origin/main --step integration-db --repeat 10` failed 10/10 times and `pnpm ci:repro:ref --ref HEAD --step integration-db --repeat 5` failed 5/5 times, each after tests completed successfully but `pnpm run ci:clean-tree` reported a tracked change to `packages/codex-runtime/README.md`.

- Observation: The dirty tracked file comes from the fake Codex approval fixture using the wrong fallback `cwd`.
  Evidence: The failing temp worktree diff showed duplicated `executor change via approval fixture` lines in `packages/codex-runtime/README.md`, and `packages/testkit/src/runtime/fake-codex-app-server.mjs` appended that marker to `join(pendingServerRequest.cwd, "README.md")` while `turn/start` defaulted `cwd` to `process.cwd()` instead of the thread `cwd`.

- Observation: The CI/tooling layer is now behaving correctly for the exact next push, but the last committed branch snapshot and merged `origin/main` are both still red because the web API spec hardcodes the old control-plane base URL.
  Evidence: `pnpm ci:repro:ref --ref HEAD --step integration-db --repeat 5` failed 5/5 and `pnpm ci:repro:ref --ref origin/main --step integration-db --repeat 3` failed 3/3 in `apps/web/lib/api.spec.ts`, each comparing `http://localhost:4000/...` against the runner-style `http://127.0.0.1:4000/...` requests, while `pnpm ci:repro:current` passed from a clean temp worktree because the live `apps/web/lib/api.ts` and `apps/web/lib/api.spec.ts` changes already resolve the base URL from env.

- Observation: The latest M2.5 `CI / static` red run is a deterministic schema-drift failure in `packages/testkit`, not a workflow or clean-tree problem.
  Evidence: `pnpm ci:repro:ref --ref HEAD --step static --repeat 5` failed 5/5 before any build or clean-tree step, each time inside `pnpm typecheck:packages` when `tsc` reported that `packages/testkit/src/fixtures.ts` was still constructing the old proof-bundle placeholder shape without `missionTitle`, repo or PR metadata, `validationSummary`, `evidenceCompleteness`, `artifacts`, or `timestamps`.

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

- Decision: Mirror GitHub Actions through shared root scripts instead of duplicating long command chains in the workflow.
  Rationale: The repo needed one diagnosable CI contract that can run both on Actions and from a fresh local clone, and root scripts make the clean-checkout path explicit and reusable.
  Date/Author: 2026-03-10 / Codex

- Decision: Add the CI env contract to `turbo.json` via `globalEnv`.
  Rationale: The real integration-db failure was not missing workflow env but Turbo's strict env forwarding, so the smallest durable fix is to declare the exact env surface the build and test tasks need.
  Date/Author: 2026-03-10 / Codex

- Decision: Keep the new clean-tree guard focused on post-command worktree churn and untracked non-ignored files, not staged differences.
  Rationale: The workflow only needs to prove a clean checkout stays clean after build or test, and matching `git diff --exit-code` behavior keeps the helper aligned with the user's requested CI shape while still catching untracked debris.
  Date/Author: 2026-03-10 / Codex

- Decision: Add `pnpm ci:repro:current` as a checked-in temp-worktree overlay command instead of relying on manual git plumbing for dirty-tree CI diagnosis.
  Rationale: The repo now needs to validate the exact next intended push, including uncommitted runtime files, and the smallest durable way to do that is one helper that applies tracked diffs plus untracked files onto a clean checkout and then runs the same shared CI scripts.
  Date/Author: 2026-03-10 / Codex

- Decision: Pin `pnpm/action-setup` to `10.4.1`.
  Rationale: The root `packageManager` already declares `pnpm@10.4.1`, and matching the workflow exactly removes another source of local-versus-Actions drift.
  Date/Author: 2026-03-10 / Codex

- Decision: Keep `tools/ci-check-clean-tree.mjs` as the single clean-tree authority and let `pnpm ci:repro:current` supply an optional baseline snapshot file.
  Rationale: The workflow still wants empty-baseline semantics on a real clean checkout, but local next-push reproduction needs to preserve the current diff while catching any additional churn introduced by install, build, or test.
  Date/Author: 2026-03-10 / Codex

- Decision: Run CI on every branch push for the current repo stage, keep `pull_request`, add `workflow_dispatch`, and add per-ref concurrency cancellation.
  Rationale: The real operator problem is invisible status on `codex/*` pushes, not excessive CI volume, and this repo is still in a high-churn bootstrap phase where branch pushes need visible feedback before PR creation. Manual dispatch and concurrency make reruns clearer without widening runtime behavior.
  Date/Author: 2026-03-10 / Codex

- Decision: Treat M1.3 workspace envs as part of the repo-level CI contract now, even before planner or executor file-mutation work lands.
  Rationale: `WORKSPACE_ROOT` and `POCKET_CTO_SOURCE_REPO_ROOT` already influence workspace placement and safety checks. If Turbo caching, Actions env, and local repro do not all see them, future M1.4 and M1.5 work can inherit stale workspace semantics or unsafe defaults silently.
  Date/Author: 2026-03-11 / Codex

- Decision: Add a generic clean-ref CI reproduction helper with repeat support instead of relying on one-off shell commands for post-merge diagnosis.
  Rationale: The repo now needs two distinct reproduction modes: dirty-snapshot overlay reproduction for local branch work and clean-ref reproduction for merged commits or merge targets. A checked-in helper keeps both paths on the same workflow env contract and makes flake checks repeatable.
  Date/Author: 2026-03-12 / Codex

- Decision: Let `tools/ci-repro-ref.mjs` continue across repeated failures and print a per-iteration summary instead of aborting on the first red run.
  Rationale: The March 13 diagnosis needed to distinguish deterministic merged failures from flakes, and continuing across repeats is the smallest checked-in change that makes that evidence visible without ad hoc shell loops.
  Date/Author: 2026-03-13 / Codex

- Decision: Fix the fake Codex approval fixture to inherit the thread `cwd` when `turn/start` omits it, and assert the temp approval directory receives the README side effect.
  Rationale: The real red `integration-db` path came from test-fixture `cwd` drift, not from CI, Postgres, or product runtime logic. Correcting the fallback and codifying the expectation in `packages/codex-runtime/src/protocol.spec.ts` removes the deterministic clean-tree mutation without weakening the guardrails.
  Date/Author: 2026-03-13 / Codex

- Decision: Keep the March 14 follow-up verification-only and do not re-edit the live `apps/web/lib/api.ts` or `apps/web/lib/api.spec.ts` changes from the CI thread.
  Rationale: Clean-ref repro proves the remaining failure is deterministic on committed refs, but `pnpm ci:repro:current` proves the exact current branch snapshot is already green because the local web API env-resolution fix exists in the worktree. The correct next step is to commit and push that existing fix, not to duplicate or overwrite it from repo-tooling work.
  Date/Author: 2026-03-14 / Codex

- Decision: Fix the stale `packages/testkit` proof-bundle placeholder locally instead of widening CI tooling or weakening type generation.
  Rationale: The red M2.5 static path is a straight domain-contract drift introduced by the richer `ProofBundleManifest` shape, and the smallest truthful fix is to update the shared fixture plus add a narrow regression test near that fixture. The workflow and repro tooling were already behaving correctly.
  Date/Author: 2026-03-15 / Codex

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

The continuation edit surface for the March 10 diagnosis and hardening pass is:

- `plans/EP-0004-ci-hermetic-hardening.md`
- `package.json`
- `.github/workflows/ci.yml`
- `docs/ops/local-dev.md`
- `tools/ci-check-clean-tree.mjs`
- `tools/ci-repro-current-worktree.mjs`
- `tools/ci-repro-ref.mjs`
- `tools/ci-repro-shared.mjs`
- `packages/codex-runtime/src/protocol.spec.ts`
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

The repo now has a unique ExecPlan sequence through `EP-0003`, a split GitHub Actions workflow with distinct static and DB-backed stages, a checked-in Postgres prep helper that provisions both `pocket_cto` and `pocket_cto_test` before migrations and tests, and a temp-worktree reproduction command for validating the exact next intended push.

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

The follow-up March 10 diagnosis found two remaining clean-checkout gaps in the committed CI path:

- `pnpm build` still rewrote tracked `apps/web/next-env.d.ts`.
- `pnpm test` still failed in the integration-db job because Turbo stripped required CI env from task processes.

Those committed gaps are now addressed by the shared `pnpm ci:static` and `pnpm ci:integration-db` scripts, the explicit `turbo.json` env contract, the checked-in `next-env.d.ts` update, and the post-build or post-test clean-tree guard.

The latest follow-up diagnosis established two concrete truths for the next push:

- the pushed `95b45cbaf875229bd138f63b992ef0da35773493` snapshot already passes `pnpm ci:static` and `pnpm ci:integration-db` from a clean temp worktree under runner-style env
- the exact next intended push initially failed from a clean temp worktree because `packages/testkit/src/runtime/fake-codex-app-server.mjs` referenced bare `setTimeout`

That next-push gap is now covered by the fixture fix, the exact `pnpm` 10.4.1 workflow pin, and `pnpm ci:repro:current`, which reproduces the live worktree diff in a clean temp checkout before the branch is pushed.

One final repo-level nuance is now explicit in the tooling and docs: `pnpm ci:static` and `pnpm ci:integration-db` are truthful mirrors of Actions and therefore expect a clean checkout, while `pnpm ci:repro:current` is the supported way to validate a dirty local snapshot by baselining the current diff and then running those same scripts in a temp worktree.

The final branch-visibility fix is intentionally small but important: GitHub Actions now runs on any branch push, on pull requests, and through manual dispatch, so a push to `codex/next-push-ci` will surface CI status directly instead of looking idle until a PR is opened.

The final validation picture is now explicit:

- the latest pushed branch commit is green from a clean temp worktree
- the exact current next-push snapshot is green through `pnpm ci:repro:current`
- the live dirty checkout still fails `pnpm ci:static` and `pnpm ci:integration-db` only because the clean-tree guard correctly sees the unstaged runtime slice that has not been committed yet

The latest follow-up keeps that contract aligned with M1.3 workspace semantics. Turbo cache invalidation now includes `WORKSPACE_ROOT` and `POCKET_CTO_SOURCE_REPO_ROOT`, GitHub Actions supplies safe external defaults for both, and `pnpm ci:repro:current` mirrors the same env contract with temp-local workspace paths so branch CI and local clean-checkout reproduction observe the same workspace-root assumptions.

The March 12 diagnosis narrows the reported post-merge `integration-db` red run to an unresolved but unreproduced failure. In this environment, `origin/main` and `HEAD` resolve to the same tree, `pnpm ci:integration-db` passes 5 out of 5 times from clean temp worktrees on `origin/main`, and the same clean-ref reproduction passes on `HEAD`. That evidence does not support a deterministic code or merge-tree defect.

The concrete hardening from this pass is diagnostic rather than behavioral: `pnpm ci:repro:ref` now makes it straightforward to rerun clean-ref static or integration reproduction, including repeat stress, against `origin/main`, a merge commit SHA, or any branch head under the same workflow env contract. On the live dirty branch, baseline-backed `pnpm ci:static` and `pnpm ci:integration-db` also stayed green relative to the current checkout, which keeps the CI surface trustworthy while M1.5 work remains in progress.

The March 14 verification changes the practical conclusion for this branch. The committed `HEAD` (`98a16eb3501b23564bcf34bb7410d4359947002e`) and merged `origin/main` (`e7fd99e50c6d7cac62acf6fbd34e840ca8689f4e`) are both still deterministically red in clean-ref `integration-db` reproduction because `apps/web/lib/api.spec.ts` expects `http://localhost:4000` while the CI env contract uses `http://127.0.0.1:4000`. The CI/tooling layer itself is no longer the blocker, though: `pnpm ci:repro:current` passed for the exact local branch snapshot, and the live checkout's direct `pnpm ci:static` plus `pnpm ci:integration-db` runs failed only at the clean-tree guard. The practical outcome is that the branch becomes safe to merge once the already-present web API env-resolution edits are committed and pushed; no additional CI hardening change was required in this verification-only pass.

The March 15 follow-up isolates the next red branch check to a different committed-ref gap. The current `HEAD` (`714d04c7312389ca008c2928928bc67d04064f77`) fails `pnpm ci:static` deterministically in clean-ref repro because `packages/testkit/src/fixtures.ts` still returns the old proof-bundle placeholder object after M2.5 expanded `ProofBundleManifest`. Updating that fixture and adding a focused `packages/testkit/src/fixtures.spec.ts` assertion is enough to restore the current next-push snapshot: `pnpm ci:repro:current` now passes both `ci:static` and `ci:integration-db` from a clean temp worktree. As with the earlier web-API fix, the committed SHA stays red until the fix is committed, so the practical merge guidance is unchanged: push only after the current local snapshot is staged, and trust `pnpm ci:repro:current` as the pre-push proof for the exact next branch state.
