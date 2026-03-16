# EP-0020 - Close M2 with seeded end-to-end runs and an audit report

This ExecPlan is a living document. Keep `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` current.

## Purpose / Big Picture

M2 is supposed to prove more than isolated features. An operator should be able to point at a durable report and say that Pocket CTO took real text and GitHub issue intake through the real M2 stack, published real GitHub draft PRs, assembled proof bundles, and surfaced approval trace when needed. This slice closes the remaining roadmap gap by running three seeded build missions end to end, capturing their evidence, and checking whether M2 is actually complete.

The operator-visible result is one in-repo M2 exit report plus a reproducible helper that can re-run the seeded mission set locally against the existing stack. If a seeded run exposes a small M2-scoped defect, fix it additively and record the decision here. If a run cannot succeed, document that failure truthfully instead of papering over it.

## Progress

- [x] 2026-03-16T03:24:57Z Audited roadmap criteria, required docs, and M2 implementation files. Confirmed that text intake, GitHub issue intake, PR-link persistence, proof-bundle assembly, and mission-detail evidence surfaces exist in code, while the remaining weakly evidenced exit criterion is the lack of a durable three-run closeout report.
- [x] 2026-03-16T03:41:42Z Added a reproducible seeded-run helper under `tools/`, wired it into `package.json`, and split the helper into small modules instead of leaving it as one long file.
- [x] 2026-03-16T03:41:42Z Ran the first real text-intake seeded attempt against a clean source-repo clone and discovered a validation defect: untracked new files were failing executor validation because `git diff --no-index --check` returned a nonzero exit code for “diff exists” even when no whitespace errors were present.
- [x] 2026-03-16T03:41:42Z Fixed that validation bug in `apps/control-plane/src/modules/validation/git-client.ts` and added focused regression coverage in `apps/control-plane/src/modules/validation/git-client.spec.ts`.
- [x] 2026-03-16T03:55:29Z Added the small text-intake repo-target override and mission terminalization fixes that the seeded runs exposed, reran the live stack against fresh dedicated databases, and captured three successful end-to-end seeded runs with real draft PRs, ready proof bundles, and durable mission-detail evidence in `docs/ops/m2-exit-report.md`.
- [x] 2026-03-16T03:55:29Z Updated `docs/ops/local-dev.md` with a reproducible "M2 exit seeded runs" section using the helper plus fresh dedicated databases and embedded-worker mode.
- [x] 2026-03-16T04:01:40Z Ran the required validation matrix: `pnpm db:generate`, `pnpm db:migrate`, `pnpm run db:migrate:ci`, `pnpm repo:hygiene`, `pnpm lint`, `pnpm typecheck`, `pnpm build`, `pnpm test`, and `pnpm ci:repro:current` all passed. `pnpm build` and the fresh-worktree `ci:repro:current` build reproduced existing Next.js warnings about `typedRoutes`, missing build cache, and the Next ESLint plugin, but no validation command failed.

## Surprises & Discoveries

- Observation: The repo already includes a truthful signed local GitHub issue-ingress smoke helper and the M2 code path appears ready for live GitHub App publish.
  Evidence: `tools/github-issue-intake-local-smoke.mjs`, `apps/control-plane/src/modules/github-app/*`, and `docs/ops/local-dev.md` document live install sync, repository sync, and signed ingress replay.
- Observation: Local secrets for OpenAI, GitHub App auth, webhook secret, and databases are present in the local `.env`, so real local seeded runs are feasible without adding PAT-based shortcuts.
  Evidence: local `.env` presence checks showed `OPENAI_API_KEY`, `GITHUB_APP_ID`, `GITHUB_APP_PRIVATE_KEY_BASE64`, `GITHUB_WEBHOOK_SECRET`, `DATABASE_URL`, and `TEST_DATABASE_URL` as set.
- Observation: `docker` is not currently on `PATH` in this environment, so any dependency startup guidance should avoid assuming `docker compose` is usable during this slice.
  Evidence: `docker compose ps --format json` returned `zsh:1: command not found: docker`.
- Observation: Reusing the default local development database polluted the seeded-run queue with older in-flight missions and made the exit audit ambiguous.
  Evidence: direct DB inspection showed multiple stale `running` and `claimed` tasks from earlier local experiments, and the new seeded helper spent time behind that backlog until a clean dedicated database was used.
- Observation: The first clean seeded text-intake run exposed a real executor-validation bug rather than a mission-authoring failure.
  Evidence: the executor worktree contained exactly the requested new markdown file, while the persisted `log_excerpt` artifact showed `git diff --no-index --check` failing with no whitespace output and no GitHub publish attempt.
- Observation: The local text-intake path could not publish end to end until it was allowed to carry a truthful GitHub repo target instead of the stub compiler default `web`.
  Evidence: the first post-validation live rerun failed GitHub publish with `Mission repository hint does not match a synced repository` until text intake added an additive `primaryRepo` override and the helper started posting the synced repo full name.
- Observation: Mission detail could show a failed or succeeded executor task while the mission record itself remained `running`, which caused the helper to wait until timeout on non-terminal mission state.
  Evidence: the early seeded reruns showed executor failure evidence and a failed proof bundle while `GET /missions/:missionId` still returned `mission.status = running`; after mission terminalization was wired into orchestrator completion, the final reruns returned truthful terminal mission status.
- Observation: The approval-seeking seeded mission succeeded end to end without ever emitting a live pending approval.
  Evidence: the helper polled `GET /missions/:missionId/approvals` and recorded `approvalRequired: false`, while the final mission still produced a ready proof bundle and draft PR.

## Decision Log

- Decision: Keep this slice centered on acceptance harnesses, docs, and audit artifacts instead of broad product changes.
  Rationale: The roadmap gap is evidence of end-to-end operation, not missing feature surfaces. Narrow tooling and reporting are the safest way to close M2 without drifting into M3.
  Date/Author: 2026-03-16 / Codex
- Decision: Use the embedded worker mode for seeded runs so approval resolution can stay honest through the existing HTTP approval route.
  Rationale: Approval continuity is explicitly single-process in M2. Running the control plane with the embedded worker preserves the live in-memory continuation model already documented in `docs/ops/local-dev.md`.
  Date/Author: 2026-03-16 / Codex
- Decision: Prefer a small reusable Node helper under `tools/` plus a checked-in markdown report under `docs/ops/`.
  Rationale: The helper keeps reruns reproducible and the markdown report satisfies the durable in-repo evidence requirement without pushing reporting logic into product routes.
  Date/Author: 2026-03-16 / Codex
- Decision: Run the final seeded missions against fresh dedicated M2 exit databases and a dedicated workspace root instead of the default local development database.
  Rationale: Exit evidence should reflect the current seeded runs only. Reusing the everyday local database allows stale queued or running missions from prior experiments to distort claim order and operator conclusions.
  Date/Author: 2026-03-16 / Codex
- Decision: Treat empty stdout or stderr from `git diff --no-index --check` on untracked files as “no formatting issue found” instead of a failed validation.
  Rationale: For untracked new files, Git exits nonzero because the compared files differ, not because whitespace rules failed. The seeded text mission proved that conflating those cases produced false negatives and blocked otherwise valid proof-bundle completion.
  Date/Author: 2026-03-16 / Codex
- Decision: Add an additive `primaryRepo` override to text intake instead of changing the stub compiler default or bypassing publish for text missions.
  Rationale: The M2 product surface still needs text intake, but seeded closeout runs must target a real synced repo to exercise branch creation and PR publication honestly. An additive override keeps the route thin, preserves existing defaults, and avoids widening the compiler scope.
  Date/Author: 2026-03-16 / Codex
- Decision: Terminalize the mission record when planner or executor tasks terminalize, with replay reason `task_terminalized`.
  Rationale: Seeded run evidence and operator polling depend on truthful mission-level terminal state, not just task-level state. The fix is small, stays inside the orchestrator bounded context, and makes mission detail consistent with proof-bundle posture.
  Date/Author: 2026-03-16 / Codex
- Decision: Keep the approval-seeking seeded mission in the run set even though the live runtime never requested approval.
  Rationale: The prompt and helper preserved the approval-capable path and would have resolved a live pending approval through the real route. Recording that no approval was requested is more honest than forcing a fake approval or quietly swapping the run label after execution.
  Date/Author: 2026-03-16 / Codex

## Context and Orientation

The relevant M2 control-plane path starts in `apps/control-plane/src/app.ts`, which wires thin Fastify routes for mission intake, GitHub issue intake, approvals, and runtime control. `apps/control-plane/src/bootstrap.ts` builds the real Drizzle-backed container, GitHub App services, proof-bundle assembly, and the embedded or standalone worker depending on environment.

Mission creation lives in `apps/control-plane/src/modules/missions/service.ts`. GitHub issue intake is handled through persisted webhook envelopes in `apps/control-plane/src/modules/github-app/issue-intake-service.ts` and `apps/control-plane/src/modules/github-app/issue-intake-routes.ts`. GitHub branch push and draft PR creation are performed by `apps/control-plane/src/modules/github-app/publish-service.ts` after executor validation. Proof-bundle refresh and evidence completeness live in `apps/control-plane/src/modules/evidence/proof-bundle-assembly.ts`.

The operator UI for this milestone is already present in `apps/web/app/page.tsx`, `apps/web/app/missions/page.tsx`, and `apps/web/app/missions/[missionId]/page.tsx`. Those surfaces consume `GET /missions`, `GET /missions/:missionId`, and the GitHub issue-intake endpoints but do not need redesign for this slice.

This closeout slice should mostly add:

- `plans/EP-0020-m2-exit-seeded-runs-and-audit.md`
- `tools/m2-exit-seeded-runs.mjs`
- `docs/ops/m2-exit-report.md`
- targeted doc and script wiring updates in `package.json` and `docs/ops/local-dev.md`

If the live seeded runs expose a small M2 bug, keep the fix inside the existing bounded context, preserve thin routes, and add a focused test near the changed module.

Replay and evidence implications are central here. Each run must preserve the existing replay stream, persist artifacts and proof-bundle updates through current services, and collect enough metadata for a human to approve or reject the run from the report without rereading this thread.

GitHub App implications should remain App-first. No PAT fallback is allowed. If a run uses GitHub issue intake or PR publish, it must do so through the configured GitHub App installation and repository registry. No new GitHub permissions or webhook subscriptions are expected beyond the already documented M2.4 and M2.7 expectations.

## Plan of Work

First, add the new closeout ExecPlan and a minimal reproducible helper that drives three seeded missions through the existing routes, polls their mission detail until terminalization, captures approvals when present, and writes structured report data that can be rendered into markdown. The helper should reuse the truthful signed webhook ingress pattern for the GitHub issue-intake run rather than inventing a backdoor.

Second, run the real local stack in embedded-worker mode, make sure installation and repository sync are in place, execute the three seeded missions, and gather the required evidence for each run: mission id, repo target, branch, PR, final statuses, artifact ledger, proof-bundle status, and approval or idempotence notes.

Third, write the durable M2 exit report in `docs/ops/m2-exit-report.md`, including cleanup status for any live branches, draft PRs, or seeded GitHub issues. If a run fails and the defect is small and squarely inside M2 scope, patch it additively, add focused tests, rerun the affected seeded mission, and record the incident honestly in both this ExecPlan and the report.

Finally, run the required repo validation commands, update this plan with actual outcomes, and answer whether M2 now satisfies all roadmap exit criteria and whether starting M3 is safe.

## Concrete Steps

1. Create this ExecPlan and keep it current after each meaningful milestone.
2. Inspect the current repo state and required M2 files before edits. Completed during the initial audit.
3. Add `tools/m2-exit-seeded-runs.mjs` to:
   - load local `.env`
   - verify control-plane and web health
   - sync GitHub installations and repositories through existing routes
   - create one text-intake mission
   - create one GitHub issue-intake mission via signed `POST /github/webhooks` plus `POST /github/intake/issues/:deliveryId/create-mission`
   - create one approval-involved mission, poll `GET /missions/:missionId` and `GET /missions/:missionId/approvals`, and resolve the approval through `POST /approvals/:approvalId/resolve` if a live approval appears
   - poll mission detail until success, failure, or timeout
   - fetch mission events and mission detail to capture replay and evidence metadata
   - emit machine-readable JSON for report assembly
4. Wire the helper into `package.json` with a focused script so reruns are obvious.
5. Write `docs/ops/m2-exit-report.md` with:
   - objective
   - exact seeded-run strategy
   - environment assumptions
   - one section per seeded run
   - verification evidence
   - risks, rollback or cleanup notes, and decision trace observations
   - explicit M2 readiness conclusion
6. Update `docs/ops/local-dev.md` with a short “M2 exit seeded runs” section pointing at the helper and report.
7. If a seeded run exposes a bug:
   - fix only the smallest M2-scoped issue
   - add or update focused tests near the touched module
   - rerun the affected seeded mission
   - document the defect and recovery path in this plan and the report
8. Run:
   - `pnpm db:generate`
   - `pnpm db:migrate`
   - `pnpm run db:migrate:ci`
   - `pnpm repo:hygiene`
   - `pnpm lint`
   - `pnpm typecheck`
   - `pnpm build`
   - `pnpm test`
   - `pnpm ci:repro:current`

## Validation and Acceptance

This slice is successful only if all of the following are true:

- `plans/EP-0020-m2-exit-seeded-runs-and-audit.md` is updated with actual progress, decisions, surprises, and outcomes.
- At least three separately named seeded build missions are run through the real local M2 stack, using a mix of text intake and GitHub issue intake.
- Successful runs persist real `pr_link` artifacts and proof-bundle manifests assembled by existing services.
- The approval-involved run either succeeds through the embedded approval route or is reported truthfully with exact failure evidence and reason.
- The report records per-run mission ids, repo targets, branches, PR numbers and URLs when present, final statuses, artifact ids and kinds, proof-bundle status, approval requirement, and issue-intake idempotence when relevant.
- Any live branches, draft PRs, or seeded issues are either cleaned up after recording or explicitly listed for manual cleanup.
- Required validation commands are run and their results are captured in the final report and this plan.

Human acceptance check:

1. Start the local stack in embedded mode.
2. Run the seeded-run helper.
3. Open `docs/ops/m2-exit-report.md`.
4. Verify that each seeded run has a mission id, evidence summary, proof-bundle posture, and cleanup note.
5. Spot-check a mission detail page and the linked draft PR.

## Idempotence and Recovery

The seeded-run helper must use distinct labels and issue numbers or delivery ids per run so repeated executions do not overwrite prior evidence. GitHub issue-intake create-mission should remain idempotent for the same persisted issue identity and the report should record that behavior rather than bypassing it.

If a run times out, fails validation, or stalls on approval, keep the partial evidence, mark the run as failed in the report, and only retry after recording the reason. Never delete draft PRs or branches before their identifiers are captured in the report.

If cleanup is performed, do it after the report is written or after the live identifiers have been safely copied into the report JSON and markdown. If a branch or PR cannot be cleaned automatically, list it under manual cleanup instead of hiding it.

Rollback for code changes is additive and low risk: remove the helper script, script wiring, docs, and any narrow bug fix if this slice proves too unstable. No destructive schema changes are planned.

## Artifacts and Notes

Planned durable artifacts for this slice:

- `docs/ops/m2-exit-report.md`
- optional JSON output captured from `tools/m2-exit-seeded-runs.mjs`
- live mission detail payloads and replay summaries referenced in the report
- GitHub draft PR links created by successful seeded runs

Required per-run report fields:

- run label
- intake type
- mission id
- repo full name
- branch name
- PR number and URL if created
- final mission status
- final task statuses
- proof bundle status
- artifact ids and kinds
- whether approval was required
- whether issue-intake create was idempotent when relevant

## Interfaces and Dependencies

Important modules and types:

- `MissionService` in `apps/control-plane/src/modules/missions/service.ts`
- `GitHubIssueIntakeService` in `apps/control-plane/src/modules/github-app/issue-intake-service.ts`
- `GitHubPublishService` in `apps/control-plane/src/modules/github-app/publish-service.ts`
- `ProofBundleAssemblyService` in `apps/control-plane/src/modules/evidence/proof-bundle-assembly.ts`
- approval and runtime control routes in `apps/control-plane/src/modules/approvals/routes.ts` and `apps/control-plane/src/modules/runtime-codex/routes.ts`
- the existing local signed ingress helper in `tools/github-issue-intake-local-smoke.mjs`

Environment variables expected by the live seeded runs:

- `DATABASE_URL`
- `TEST_DATABASE_URL`
- `OPENAI_API_KEY`
- `CODEX_APP_SERVER_COMMAND`
- `CODEX_APP_SERVER_ARGS`
- `CODEX_DEFAULT_MODEL`
- `GITHUB_APP_ID`
- `GITHUB_APP_PRIVATE_KEY_BASE64`
- `GITHUB_WEBHOOK_SECRET`

No new environment variables, GitHub App permissions, or webhook subscriptions are planned for this slice. Existing documented expectations remain:

- repository permissions: `Metadata` read-only, `Contents` write, `Pull requests` write
- webhook events: `installation`, `installation_repositories`, `issues`, `issue_comment`

## Outcomes & Retrospective

Three seeded missions now ran end to end against the real local embedded M2 stack and all three succeeded:

- text intake mission `48c7da65-7e60-4d59-af90-b834348d0f06` opened draft PR `#26`
- GitHub issue-intake mission `26eeea81-206e-4212-9b0b-82e4b1e1ff3e` opened draft PR `#27` and proved repeated create-mission is idempotent
- approval-seeking text mission `942e73d4-14cb-4e59-9c9b-7934cb1be618` opened draft PR `#28`, but it completed without requiring a live approval

The validation matrix is now green, including a clean `pnpm ci:repro:current` run from a fresh temp worktree. The strongest residual caveat is not product correctness but roadmap wording: the code, seeded runs, report, and replay evidence show the M2 stack works end to end locally, but `plans/ROADMAP.md` still says the three seeded runs should happen "in staging". Unless the team explicitly accepts equivalent real local-stack evidence, that final wording gap should be resolved before declaring M2 fully complete and starting M3.
