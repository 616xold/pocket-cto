# M2 Exit Seeded Runs Report

Date: 2026-03-16

## Objective

Close the remaining M2 exit-audit gap by running three seeded build missions end to end through the real M2 stack, capturing durable PR and proof-bundle evidence, and recording whether the system is ready to move beyond M2.

## Seeded-run strategy

- Run the real control plane in embedded-worker mode against fresh dedicated databases and a dedicated workspace root.
- Use the real `POST /missions/text` route for two text missions and the real signed `POST /github/webhooks` plus `POST /github/intake/issues/:deliveryId/create-mission` path for GitHub issue intake.
- Reuse real GitHub App installation sync, repository sync, repo targeting, branch creation, draft PR publication, proof-bundle assembly, and mission detail read models.
- Auto-resolve any live pending approvals through `POST /approvals/:approvalId/resolve`, but record truthfully when no approval is actually requested.

## Environment and commands

Repo target:

- `616xold/pocket-cto`

Preparation:

```bash
DATABASE_URL=postgres://postgres:postgres@localhost:5432/pocket_cto_m2_exit_20260316_v3 \
TEST_DATABASE_URL=postgres://postgres:postgres@localhost:5432/pocket_cto_m2_exit_20260316_v3_test \
node tools/ci-prepare-postgres.mjs

DATABASE_URL=postgres://postgres:postgres@localhost:5432/pocket_cto_m2_exit_20260316_v3 \
TEST_DATABASE_URL=postgres://postgres:postgres@localhost:5432/pocket_cto_m2_exit_20260316_v3_test \
pnpm run db:migrate:ci

env \
  DATABASE_URL=postgres://postgres:postgres@localhost:5432/pocket_cto_m2_exit_20260316_v3 \
  TEST_DATABASE_URL=postgres://postgres:postgres@localhost:5432/pocket_cto_m2_exit_20260316_v3_test \
  CONTROL_PLANE_EMBEDDED_WORKER=true \
  WORKER_POLL_INTERVAL_MS=1000 \
  WORKSPACE_ROOT=/tmp/pocket-cto-m2-target-g7loAC/workspaces-v3 \
  POCKET_CTO_SOURCE_REPO_ROOT=/tmp/pocket-cto-m2-target-g7loAC/source-repo \
  pnpm --filter @pocket-cto/control-plane dev

POCKET_CTO_SOURCE_REPO_ROOT=/tmp/pocket-cto-m2-target-g7loAC/source-repo \
node tools/m2-exit-seeded-runs.mjs --timeout-ms 900000
```

## Outcome summary

| Run label | Intake | Mission id | Final mission status | Proof bundle | PR | Approval required | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| text-intake happy-path build mission | text | `48c7da65-7e60-4d59-af90-b834348d0f06` | `succeeded` | `ready` | [#26](https://github.com/616xold/pocket-cto/pull/26) | `false` | Text route now targets the real synced repo and publishes end to end. |
| GitHub issue-intake happy-path build mission | github_issue | `26eeea81-206e-4212-9b0b-82e4b1e1ff3e` | `succeeded` | `ready` | [#27](https://github.com/616xold/pocket-cto/pull/27) | `false` | Signed issue-ingress replay was idempotent on repeated create. |
| approval-involved happy-path build mission | text | `942e73d4-14cb-4e59-9c9b-7934cb1be618` | `succeeded` | `ready` | [#28](https://github.com/616xold/pocket-cto/pull/28) | `false` | Approval-capable run succeeded, but the live runtime never emitted a pending approval request. |

## Per-run evidence

### 1. text-intake happy-path build mission

- Intake type: `POST /missions/text`
- Mission id: `48c7da65-7e60-4d59-af90-b834348d0f06`
- Repo: `616xold/pocket-cto`
- Branch: `pocket-cto/48c7da65-7e60-4d59-af90-b834348d0f06/1-executor`
- PR: [#26](https://github.com/616xold/pocket-cto/pull/26)
- Final task statuses: planner `succeeded`, executor `succeeded`
- Proof bundle status: `ready`
- Artifact ids and kinds:
  - `1003d0de-8f0f-4e85-9af4-3c96b83b5178` `plan`
  - `0d664374-7bfa-432a-84e8-3c7456a5f2ce` `diff_summary`
  - `39d750f3-6ae7-4cb7-bdee-9293bc0025f4` `test_report`
  - `f1e59df2-3a43-48c0-886d-142c7368a3ad` `pr_link`
- Approval required: `false`
- Replay tail confirmed terminalization and evidence completion:
  - `runtime.turn_completed`
  - `task.status_changed`
  - `mission.status_changed`
  - `artifact.created`
  - `proof_bundle.refreshed`

### 2. GitHub issue-intake happy-path build mission

- Intake type: signed `POST /github/webhooks` followed by `POST /github/intake/issues/:deliveryId/create-mission`
- Mission id: `26eeea81-206e-4212-9b0b-82e4b1e1ff3e`
- Repo: `616xold/pocket-cto`
- Delivery id: `m2-exit-issue-20260316035042`
- Source ref: `https://github.com/616xold/pocket-cto/issues/35042`
- Idempotent create result: first create `created`, second create `already_bound`, same mission id reused
- Branch: `pocket-cto/26eeea81-206e-4212-9b0b-82e4b1e1ff3e/1-executor`
- PR: [#27](https://github.com/616xold/pocket-cto/pull/27)
- Final task statuses: planner `succeeded`, executor `succeeded`
- Proof bundle status: `ready`
- Artifact ids and kinds:
  - `32d61d38-72d6-41bd-88cd-c8e48eb25c4f` `plan`
  - `5701ea03-443d-465b-819f-58d53bdf4c7c` `diff_summary`
  - `8035a71f-b851-420b-add4-092d0127e5ff` `pr_link`
  - `b5f1298e-8ffb-4167-b0c4-2dfbf7e444ae` `test_report`
- Approval required: `false`

### 3. approval-involved happy-path build mission

- Intake type: `POST /missions/text`
- Mission id: `942e73d4-14cb-4e59-9c9b-7934cb1be618`
- Repo: `616xold/pocket-cto`
- Branch: `pocket-cto/942e73d4-14cb-4e59-9c9b-7934cb1be618/1-executor`
- PR: [#28](https://github.com/616xold/pocket-cto/pull/28)
- Final task statuses: planner `succeeded`, executor `succeeded`
- Proof bundle status: `ready`
- Artifact ids and kinds:
  - `88d1f561-6e7b-4e22-9965-671b8a02e9e8` `plan`
  - `4bf77d02-6702-4bc8-9bc3-a7ea4bc24e25` `diff_summary`
  - `afcb48a4-cb27-485e-add3-a1fa2d71f8be` `test_report`
  - `b71f5e38-fe2b-492f-8338-54079066c772` `pr_link`
- Approval required: `false`
- Approval resolution ids: none
- Important note: this mission used an approval-seeking prompt and the helper was prepared to auto-accept live pending approvals, but the real runtime completed without emitting a pending approval request. This seeded set therefore proves the approval-capable stack does not regress happy-path execution, but it does not add new live evidence of approval persistence or resolution beyond the existing M1.6 and M2.6 code and test coverage.

## Bugs exposed and fixed during closeout

### 1. False executor validation failures for new untracked files

- Symptom: a clean text mission that created a single new markdown file failed local executor validation.
- Root cause: `git diff --no-index --check` returned a nonzero exit code for "files differ" and the validation layer treated that as a whitespace failure even when stdout and stderr were empty.
- Fix:
  - `apps/control-plane/src/modules/validation/git-client.ts`
  - `apps/control-plane/src/modules/validation/git-client.spec.ts`

### 2. Text intake missions could not publish to the synced GitHub repo

- Symptom: text-intake missions validated locally but failed GitHub publish with `Mission repository hint does not match a synced repository`.
- Root cause: `POST /missions/text` always inherited the stub compiler repo target `web`, which is not a synced repository in the live M2 stack.
- Fix:
  - `packages/domain/src/mission.ts`
  - `packages/domain/src/mission.spec.ts`
  - `apps/control-plane/src/modules/missions/service.ts`
  - `apps/control-plane/src/modules/missions/service.spec.ts`
  - `apps/control-plane/src/app.spec.ts`
  - `tools/m2-exit-runner.mjs`

### 3. Missions did not terminalize when executor tasks completed

- Symptom: proof bundles and tasks could be terminal while the mission record stayed `running`, which made the seeded helper wait until timeout on failure paths.
- Root cause: executor task completion updated task state and evidence, but not the mission record itself.
- Fix:
  - `packages/domain/src/replay-event.ts`
  - `apps/control-plane/src/modules/missions/events.ts`
  - `apps/control-plane/src/modules/orchestrator/runtime-phase.ts`
  - `apps/control-plane/src/modules/orchestrator/drizzle-service.spec.ts`

## Cleanup status

Recorded first, left open for manual cleanup:

- Branch `pocket-cto/48c7da65-7e60-4d59-af90-b834348d0f06/1-executor`, PR [#26](https://github.com/616xold/pocket-cto/pull/26)
- Branch `pocket-cto/26eeea81-206e-4212-9b0b-82e4b1e1ff3e/1-executor`, PR [#27](https://github.com/616xold/pocket-cto/pull/27)
- Branch `pocket-cto/942e73d4-14cb-4e59-9c9b-7934cb1be618/1-executor`, PR [#28](https://github.com/616xold/pocket-cto/pull/28)

No live GitHub issue was created on GitHub.com during this local closeout slice.
The issue-intake run used a correctly signed local replay into the real webhook ingress route and then the real persisted intake route.

## Validation matrix

| Command | Result | Notes |
| --- | --- | --- |
| `pnpm db:generate` | passed | Drizzle generation completed cleanly. |
| `pnpm db:migrate` | passed | Local development database migration completed cleanly. |
| `pnpm run db:migrate:ci` | passed | Both CI-style databases migrated successfully. |
| `pnpm repo:hygiene` | passed | No generated-output or hygiene regressions detected. |
| `pnpm lint` | passed | Workspace lint passed. |
| `pnpm typecheck` | passed | Passed after the text-intake repo-target tests were updated for the new additive `primaryRepo` field. |
| `pnpm build` | passed | Existing Next.js warnings remained about `typedRoutes`, missing build cache, and the Next ESLint plugin. |
| `pnpm test` | passed | Workspace tests passed: 173 control-plane tests plus package and web suites. |
| `pnpm ci:repro:current` | passed | Fresh temp-worktree reproduction succeeded end to end, including static checks, DB-backed tests, and clean-tree verification. |

## Exit assessment

What this slice proves:

- text intake can create a build mission end to end in the real local M2 stack
- signed GitHub issue ingress plus create-mission intake can create a build mission end to end in the real local M2 stack
- successful missions attach real `pr_link` artifacts and ready proof bundles
- mission detail exposes truthful mission, task, artifact, proof-bundle, and replay posture for all three seeded runs
- a separate reproducible local approval smoke now proves the approval HTTP control path, persisted approval rows, `approvalCards`, and replay events through the existing embedded control-plane API

What remains weaker than ideal:

- the approval-capable seeded run did not produce a live pending approval, so the fresh approval proof below uses the existing embedded fake-runtime approval fixture rather than a real local Codex runtime approval
- the roadmap wording says "at least 3 seeded build tasks run end to end in staging"; these three runs were executed against a real local embedded stack, not a staging deployment

## Approval proof addendum

Date: 2026-03-16

Mode:

- `embedded_fake_runtime_approval_replay`

Command:

```bash
pnpm m2:approval-smoke
```

Observed result:

- Mission id: `f6d5cd62-890d-4db2-a04f-d4efc98c5800`
- Approval id: `fe91022c-ad34-4e88-ac87-61deac594c06`
- Executor task id: `af4570b5-b871-4767-bc6a-27ed5714f186`
- Mission status before resolution: `awaiting_approval`
- Persisted pending approval rows before resolution: `1`
- Pending card summary: `Allow file edits under .../f6d5cd62-890d-4db2-a04f-d4efc98c5800/1-executor/src. Why it matters: Requesting extra write access for the planned file edits.`
- Resolve route: `POST /approvals/fe91022c-ad34-4e88-ac87-61deac594c06/resolve` returned `200`
- Final mission status: `succeeded`
- Final executor task status: `succeeded`
- Resolved card summary: `Approved by m2-approval-proof-smoke at 2026-03-16T17:06:12.434Z. Rationale: Fixture-backed local approval proof accepted through HTTP.`
- Replay evidence: `approval.requested` present and `approval.resolved` present in `GET /missions/f6d5cd62-890d-4db2-a04f-d4efc98c5800/events`

Interpretation:

- This closes the operational proof gap for the approval-control surface locally.
- It does not claim a real local runtime emitted the approval.
- The proof is intentionally fixture-backed, but it still exercises the real control-plane HTTP routes and durable read models end to end.

Decision:

- Local M2 stack closeout: yes, the remaining seeded-run evidence gap is now closed for a real local stack.
- Literal roadmap exit wording: not fully yet, unless the team accepts these real local runs as satisfying the staging criterion or replays the same helper in staging.
- Safe to start M3: not yet as a strict roadmap call. Start M3 only after the team either accepts this real local evidence as equivalent to staging or repeats the helper in a staging deployment.
