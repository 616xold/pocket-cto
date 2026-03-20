# EP-0028 - Execute deterministic discovery missions into durable answer artifacts

This ExecPlan is a living document. Keep `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` current.

## Purpose / Big Picture

After this slice, Pocket CTO can accept one typed discovery request through `POST /missions/discovery`, persist it as a truthful discovery mission, execute it without the Codex runtime, store one durable `discovery_answer` artifact, and expose a proof bundle that is honestly ready only when the stored answer exists and the discovery task succeeded.
An operator will be able to ask a deterministic auth-change question against one synced repository and later inspect the mission detail, replay trail, stored answer artifact, and proof bundle without pretending that missing or stale twin state was hidden.

This plan covers roadmap submilestone `M3.8 discovery mission formatter`, narrowed to the backend milestone slice requested in-thread.
It intentionally stops before natural-language parsing, `POST /missions/text` discovery classification, new twin extraction paths, live twin resync during discovery execution, new web forms, or widening into `M4`.

## Progress

- [x] (2026-03-20T00:00:00Z) Read the requested repo docs, roadmap, M3.2 through M3.7 plans, the named skills, the listed mission or twin or evidence files, and ran the required inspections `rg -n "discovery|MissionTypeSchema|scout|proof_bundle|artifact.created|blast-radius|createFromText|createMission|task roles|sourceKind" apps packages docs plans`, `git status --short`, and `git diff --name-only HEAD`.
- [x] (2026-03-20T00:00:00Z) Captured the required in-thread `M3.8A discovery mission backend gap` note before editing, confirming that the twin already answers deterministic stored-state blast-radius questions but the mission backend still lacks a typed discovery intake, a non-runtime execution path, a durable discovery answer artifact, and discovery-specific proof-bundle truth.
- [x] (2026-03-20T02:30:00Z) Added additive domain and DB contracts for typed discovery intake, persisted discovery question state, additive source and artifact kinds, and proof-bundle trigger support for `discovery_answer`.
- [x] (2026-03-20T02:42:00Z) Added the dedicated `POST /missions/discovery` mission-intake path, keeping routes thin while persisting one truthful discovery mission, one scout task, and one discovery-shaped placeholder proof bundle without touching `POST /missions/text`.
- [x] (2026-03-20T02:49:00Z) Implemented a non-runtime discovery orchestrator phase that executes claimed scout tasks through `TwinService.queryRepositoryBlastRadius(...)`, persists one durable `discovery_answer` artifact on success, appends `artifact.created`, refreshes proof truth, and fails explicitly for unavailable repos or missing stored twin coverage.
- [x] (2026-03-20T02:55:58Z) Added focused route, mission-service, DB-backed persistence, orchestrator, and proof-bundle tests covering deterministic intake, non-runtime execution, artifact persistence, proof readiness, stale freshness visibility, and explicit failure cases while preserving existing build-mission behavior.
- [x] (2026-03-20T02:59:57Z) Ran the requested validation matrix successfully: `pnpm db:generate`, `pnpm db:migrate`, `pnpm run db:migrate:ci`, `pnpm repo:hygiene`, `pnpm lint`, `pnpm typecheck`, `pnpm build`, `pnpm test`, and `pnpm ci:repro:current`.
- [x] (2026-03-20T02:59:57Z) Checked for live GitHub App environment and found no local GitHub credentials in this shell, so the optional live repository sync plus stored-twin discovery proof run was not attempted and is reported as unavailable rather than guessed.

## Surprises & Discoveries

- Observation: the twin bounded context already provides the exact stored-state answer primitive this slice needs.
  Evidence: `apps/control-plane/src/modules/twin/service.ts` already implements `queryRepositoryBlastRadius(...)` over stored metadata, ownership, CI, and freshness without performing new persistence writes.

- Observation: the current mission spine is reusable for discovery creation, but proof-bundle assembly is still build-mission-shaped.
  Evidence: `apps/control-plane/src/modules/missions/service.ts` already creates missions, tasks, replay, and placeholder proof bundles transactionally, while `apps/control-plane/src/modules/evidence/proof-bundle-assembly.ts` still expects build artifacts `plan`, `diff_summary`, `test_report`, and `pr_link`.

- Observation: the current discovery task graph is larger than necessary for this backend slice.
  Evidence: `apps/control-plane/src/modules/orchestrator/task-state-machine.ts` currently returns `["planner", "scout"]` for `discovery`, even though this prompt explicitly prefers one truthful scout-task flow and forbids Codex runtime involvement.

- Observation: additive enum migrations need to stay idempotent across both local and CI migration flows in this repo.
  Evidence: the first generated migration for `manual_discovery` and `discovery_answer` failed on a repeated apply during `pnpm run db:migrate:ci` until it was wrapped in `IF NOT EXISTS` checks.

## Decision Log

- Decision: create a dedicated typed `POST /missions/discovery` intake instead of routing through `POST /missions/text`.
  Rationale: the prompt explicitly forbids discovery through text intake for this slice and requires deterministic typed payloads without natural-language parsing.
  Date/Author: 2026-03-20 / Codex

- Decision: use one `scout` task for discovery missions in this slice.
  Rationale: a single task is the cleanest truthful path because there is no planner or executor handoff and the discovery answer comes directly from the stored twin blast-radius query.
  Date/Author: 2026-03-20 / Codex

- Decision: execute discovery through a new non-runtime orchestrator phase that calls `TwinService.queryRepositoryBlastRadius(...)`.
  Rationale: this preserves the worker or replay spine while satisfying the hard requirement that discovery execution must not involve the Codex runtime or a new twin extraction path.
  Date/Author: 2026-03-20 / Codex

- Decision: persist one additive `discovery_answer` artifact with the answer metadata needed for later mission detail and proof rendering.
  Rationale: the prompt requires a durable answer artifact, explicit replay via `artifact.created`, and a future-small web step built from stored artifact state rather than transient computation.
  Date/Author: 2026-03-20 / Codex

- Decision: keep build proof-bundle logic unchanged and branch proof expectations by mission type.
  Rationale: the repository already has passing build-mission proof behavior; discovery readiness should be added without regressing the build evidence contract.
  Date/Author: 2026-03-20 / Codex

- Decision: keep GitHub App truthfulness by resolving discovery repos through the existing repository registry only.
  Rationale: the GitHub App guard and prompt both require invalid or unavailable repository targets to fail explicitly and forbid PAT-style shortcuts or ad hoc repo inference.
  Date/Author: 2026-03-20 / Codex

- Decision: keep mission detail additive by deriving discovery summaries from persisted artifact state instead of redesigning the detail schema for this slice.
  Rationale: the existing mission detail already exposes proof-bundle and artifact summaries, which is enough to keep the later web step small without broadening the read model prematurely.
  Date/Author: 2026-03-20 / Codex

## Context and Orientation

Pocket CTO exits `M3.7` with a complete stored-state blast-radius query path but no mission-facing discovery backend.
The twin bounded context under `apps/control-plane/src/modules/twin/` already owns repository targeting through the GitHub App repository registry, stored metadata and ownership and CI freshness reads, and the deterministic `queryRepositoryBlastRadius(...)` helper that answers `auth_change` questions from already persisted twin state.

The mission bounded context under `apps/control-plane/src/modules/missions/` already owns the transactional creation spine for missions, tasks, replay events, and proof-bundle placeholders.
That spine is reusable, but discovery needs one new typed input route and one durable question payload that stays replayable without going through the stub text compiler.

The orchestrator bounded context under `apps/control-plane/src/modules/orchestrator/` currently assumes claimed work flows into the Codex runtime phase.
For this slice, it needs a narrow non-runtime branch for `discovery` missions so worker execution stays compact and replay-visible without creating Codex threads or turns.

The evidence bounded context under `apps/control-plane/src/modules/evidence/` already owns proof-bundle assembly and artifact shaping.
It must be extended so discovery missions produce a truthful `discovery_answer` artifact and a proof bundle that becomes `ready` only when the scout task succeeded and that artifact exists.

The main files and modules are:

- domain contracts in `packages/domain/src/mission.ts`, `packages/domain/src/mission-detail.ts`, `packages/domain/src/proof-bundle.ts`, `packages/domain/src/twin.ts`, and a new `packages/domain/src/discovery-mission.ts`
- additive DB schema in `packages/db/src/schema/missions.ts` and `packages/db/src/schema/artifacts.ts`
- mission intake and read-model files in `apps/control-plane/src/modules/missions/schema.ts`, `routes.ts`, `service.ts`, and `detail-view.ts`
- orchestrator files in `apps/control-plane/src/modules/orchestrator/task-state-machine.ts`, `events.ts`, `service.ts`, and a new `discovery-phase.ts`
- evidence files in `apps/control-plane/src/modules/evidence/service.ts`, `proof-bundle-assembly.ts`, and `proof-bundle-summary.ts`
- bootstrap and port wiring in `apps/control-plane/src/bootstrap.ts` and `apps/control-plane/src/lib/types.ts`
- operator docs in `docs/ops/local-dev.md`

This slice should preserve boundaries:

- `packages/domain` stays pure and carries only typed intake, artifact, mission-detail, and proof contracts
- `packages/db` stays additive-first and only adds enum values when needed
- `apps/control-plane/src/modules/missions/` owns HTTP intake and mission-creation orchestration, not twin query logic
- `apps/control-plane/src/modules/orchestrator/` owns task execution branching and replay-visible status transitions
- `apps/control-plane/src/modules/twin/` remains the single place that knows how to answer stored blast-radius questions
- routes stay thin and should not contain twin logic, artifact formatting, or replay decisions

No new GitHub App permissions, webhook subscriptions, or PAT fallbacks are expected.
`WORKFLOW.md` should remain accurate because discovery still requires replay events and proof output, but uses no extra runtime or network policy.

## Plan of Work

First, add the discovery mission contract.
Create a pure domain schema for the typed `POST /missions/discovery` payload, the durable discovery question record, and the summary shape used when reading a stored answer artifact back out of mission detail.
If truthfulness needs a new mission source kind for typed discovery intake, add it additively in both domain and DB enum schema.

Next, wire the mission intake surface without touching the text compiler path.
Add the new request parser and route, then extend `MissionService` with a dedicated creation method that builds a deterministic discovery spec, persists the durable question payload into mission input state, creates one `scout` task, appends compact replay, and persists the existing proof-bundle placeholder.

Then, implement non-runtime discovery execution.
Create a small orchestrator discovery phase that recognizes claimed discovery scout tasks, loads the mission and durable question payload, calls the existing twin blast-radius query, decides whether the stored answer is sufficiently truthful to succeed or must fail explicitly, persists one `discovery_answer` artifact when successful, appends `artifact.created`, and transitions task or mission status through the existing replay spine without emitting runtime-thread events.

After that, extend evidence and read models.
Add the new artifact kind, keep one summary-shaped artifact metadata contract, teach proof-bundle assembly to branch by mission type so build missions remain unchanged while discovery missions become `ready` when the scout task succeeded and the `discovery_answer` artifact exists, and optionally expose one additive `discoveryAnswer` mission-detail summary derived from the persisted artifact if that materially reduces later web work.

Finally, add focused tests, update `docs/ops/local-dev.md` with the new route and one `curl` example, keep this ExecPlan current, run the full requested validation matrix, and if live GitHub env is present, create one real discovery mission against stored twin state for `616xold/pocket-cto` and record the safe proof fields requested in the prompt.

## Concrete Steps

Run these commands from the repository root as needed:

    rg -n "discovery|MissionTypeSchema|scout|proof_bundle|artifact.created|blast-radius|createFromText|createMission|task roles|sourceKind" apps packages docs plans
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

    pnpm --filter @pocket-cto/control-plane exec vitest run src/app.spec.ts src/modules/missions/service.spec.ts src/modules/missions/drizzle-service.spec.ts src/modules/orchestrator/service.spec.ts src/modules/evidence/proof-bundle-assembly.spec.ts
    rg -n "discovery|manual_discovery|discovery_answer|POST /missions/discovery|queryRepositoryBlastRadius" packages/domain/src packages/db/src apps/control-plane/src docs/ops/local-dev.md

If live GitHub env is present after implementation:

    curl -X POST http://localhost:4000/github/repositories/sync
    curl -X POST http://localhost:4000/missions/discovery \
      -H 'content-type: application/json' \
      -d '{"repoFullName":"616xold/pocket-cto","questionKind":"auth_change","changedPaths":["apps/control-plane/src/modules/github-app/auth.ts"],"requestedBy":"operator"}'
    curl http://localhost:4000/missions/<mission-id>

If the stored twin state for `616xold/pocket-cto` is missing, first use the existing repository sync and twin sync routes.
Do not print tokens, secrets, or raw auth headers.

## Validation and Acceptance

Success for this slice is demonstrated when all of the following are true:

1. `POST /missions/discovery` exists and is separate from `POST /missions/text`.
2. The request body is deterministic and narrow, containing `repoFullName`, `questionKind`, `changedPaths`, and `requestedBy`.
3. Creating a discovery mission persists truthful source and repository context and a durable discovery question payload in mission input state.
4. Discovery missions materialize one `scout` task and do not require planner or executor runtime turns.
5. Discovery execution calls `TwinService.queryRepositoryBlastRadius(...)` and does not call the Codex runtime.
6. Discovery execution does not trigger a twin resync path.
7. A successful discovery mission persists exactly one `discovery_answer` artifact whose metadata includes repo, question, blast-radius answer summary, impacted targets, owners, related suites or jobs, freshness rollup, and limitations.
8. Successful discovery execution appends `artifact.created` for the stored discovery answer.
9. Discovery proof bundles become `ready` only when the discovery task succeeded and the `discovery_answer` artifact exists.
10. Build mission proof-bundle behavior remains unchanged.
11. Stale, failed-latest, or otherwise limited twin freshness remains visible in the stored discovery answer rather than being hidden.
12. Invalid repository targeting or an unanswerable query from stored twin state fails explicitly and honestly.
13. Mission detail remains additive and, if a `discoveryAnswer` field is added, it is summary-shaped and derived from persisted artifact state only.
14. Focused tests cover the new route, the non-runtime discovery execution path, artifact persistence, proof-bundle readiness, stale or missing freshness visibility, explicit repo failure, and unchanged build behavior.
15. `docs/ops/local-dev.md` documents the new discovery route honestly without claiming natural-language parsing or broader `M4` behavior.

Human acceptance after implementation should look like:

    curl -i -X POST http://localhost:4000/missions/discovery \
      -H 'content-type: application/json' \
      -d '{"repoFullName":"616xold/pocket-cto","questionKind":"auth_change","changedPaths":["apps/control-plane/src/modules/github-app/auth.ts"],"requestedBy":"operator"}'
    curl -i http://localhost:4000/missions/<mission-id>
    curl -i http://localhost:4000/missions/<mission-id>/events

The mission should show truthful discovery source and repo context, one scout task, compact replay, a durable stored answer artifact after successful execution, and a proof bundle whose readiness matches the presence of that answer artifact.

## Idempotence and Recovery

Mission creation stays transactional and additive.
If discovery creation fails before commit, no partial mission spine should remain.
If non-runtime discovery execution fails after the mission exists, the mission and scout task should terminalize honestly as failed without creating a false success artifact.

Discovery execution must be safe to retry at the worker level only through explicit mission or task retry behavior that already exists or future retry work.
This slice should avoid duplicate success artifacts during a single execution path by writing one answer artifact only after the blast-radius result is accepted as truthful.

Safe rollback guidance:

- revert the new domain contracts, DB enum additions, mission intake route, orchestrator discovery phase, evidence changes, tests, docs, and this ExecPlan together
- leave additive artifact or mission rows in place if a rollback happens after a successful local run; the rows are audit data and do not require destructive cleanup
- if an enum migration is added, roll it back only through the repo migration workflow rather than manual database edits

## Artifacts and Notes

Required pre-coding gap note captured in-thread:

1. The twin already provides stored repo metadata, ownership, CI/test-suite linkage, freshness, and a deterministic blast-radius answer path.
2. What is still missing is a typed discovery mission intake, a non-Codex execution path, a durable answer artifact, and discovery-aware proof-bundle truth.
3. Planned edits are constrained to the new ExecPlan, additive domain and DB contracts, mission or orchestrator or evidence seams, focused tests, and operator docs.
4. The chosen strategy is a single-scout discovery mission that calls the existing twin blast-radius query, persists one `discovery_answer` artifact, and marks the proof bundle ready only when that artifact exists and the scout task succeeded.

Replay and evidence implications:

- no discovery-specific replay event type should be added unless implementation proves it is necessary
- the replay trail should remain compact: mission creation, task creation, queued or running or terminal status changes, and `artifact.created` for the stored answer
- the durable evidence surface is the persisted `discovery_answer` artifact, the proof bundle manifest, the mission detail read model, focused tests, validation commands, and any optional live route proof captured at closeout

Validation results, exact changed files, live mission evidence, and closeout notes will be appended here as work proceeds.

## Interfaces and Dependencies

Important types, functions, modules, libraries, and environment variables for this slice:

- `TwinRepositoryBlastRadiusQuerySchema` and `TwinRepositoryBlastRadiusQueryResultSchema` in `packages/domain/src/twin.ts`
- new discovery intake and artifact schemas in `packages/domain/src/discovery-mission.ts`
- `MissionService`, `MissionRepository`, and `buildMissionDetailView(...)`
- `buildInitialTaskRolesForMission(...)`
- `OrchestratorService` and new `discovery-phase.ts`
- `TwinService.queryRepositoryBlastRadius(...)`
- `EvidenceService`, `ProofBundleAssemblyService`, and `deriveProofBundleAssemblyFacts(...)`
- existing GitHub repository registry reads through the GitHub App bounded context
- additive DB enums in `packages/db/src/schema/missions.ts` and `packages/db/src/schema/artifacts.ts`
- existing local-dev environment such as `DATABASE_URL`, `TEST_DATABASE_URL`, and any GitHub App env already documented; no new environment variables are expected

## Outcomes & Retrospective

The implementation delivered one deterministic backend-only discovery vertical slice.
`POST /missions/discovery` now creates a truthful discovery mission with `sourceKind=manual_discovery`, persists the typed discovery question inside mission input state, materializes one `scout` task, and never routes through the text compiler or the Codex runtime.
Claimed scout tasks now execute through a narrow non-runtime orchestrator phase that calls `TwinService.queryRepositoryBlastRadius(...)`, succeeds only when a stored answer can be persisted honestly, and fails explicitly when the repo is unavailable or stored twin state cannot answer the question.

The durable evidence strategy is additive and compact.
Successful discovery execution persists one `discovery_answer` artifact, appends `artifact.created`, and refreshes proof-bundle readiness only when both the scout task succeeded and the stored answer exists.
Build-mission proof rules remain unchanged because expected artifact kinds now branch by mission type instead of replacing the existing build contract.

Validation commands executed successfully in the main worktree:

- `pnpm db:generate`
- `pnpm db:migrate`
- `pnpm run db:migrate:ci`
- `pnpm repo:hygiene`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm build`
- `pnpm test`
- `pnpm ci:repro:current`

Notable validation notes:

- the generated additive enum migration needed idempotent guards so repeated migration application stays safe across both local and CI flows
- `pnpm build` passed with existing Next.js warnings about `typedRoutes` config migration and missing build-cache or ESLint plugin detection in `apps/web`; those warnings pre-existed this slice and did not block the build
- `pnpm ci:repro:current` succeeded against a clean temporary worktree rooted at `/var/folders/41/pj1kw0tj2xd832wl_62gn73m0000gn/T/pocket-cto-ci-repro-DCJTVd/repo`

Live mission evidence:

- not captured in this environment because no local GitHub App credentials were present, so repository sync and stored-twin live mission creation were unavailable

Remaining follow-on work:

- `M3.8B` can now start cleanly on top of this backend slice because the mission intake, truthful stored answer artifact, replay trail, and proof-bundle readiness rules now exist as stable backend seams
