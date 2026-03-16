# EP-0019 - Turn persisted GitHub issue envelopes into build missions

This ExecPlan is a living document. Keep `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` current.

## Purpose / Big Picture

After this slice, Pocket CTO can take a real persisted GitHub `issues` webhook envelope and truthfully turn it into a build mission without pretending that webhook ingress, issue comments, or the mission compiler have been redesigned.
The operator-visible proof stays intentionally narrow and honest: the control plane exposes a latest-per-issue intake read model, repeated create attempts are idempotent against issue identity, the created mission preserves GitHub source context plus real repository full-name targeting, and the web mission surfaces show a small GitHub issue intake section with either a create action or an existing mission link.

This slice closes the remaining issue-intake gap inside the broader M2 GitHub-first vertical slice.
It builds directly on `plans/EP-0013-webhook-signature-and-idempotent-ingress.md`, `plans/EP-0014-repository-registry-and-repo-sync.md`, `plans/EP-0015-branch-and-pr-artifact-creation.md`, and `plans/EP-0018-mission-list-and-operator-home.md`.
It does not widen into M3 twin work, redesign webhook ingress, redesign the compiler wholesale, implement comment-to-mission ingestion, or add merge or deploy automation.

## Progress

- [x] (2026-03-16T01:50Z) Read the required repo docs, roadmap, workflow contract, adjacent GitHub milestone plans, security and replay guidance, local-dev guide, mission and GitHub module code, and the named skills; also ran the requested inspections `rg -n "issues|issue_comment|github_issue|sourceKind|sourceRef|deliveryId|handledAs" apps packages docs`, `git status --short`, and `git diff --name-only HEAD`.
- [x] (2026-03-16T01:50Z) Captured the M2.7 issue-intake gap before coding: issue and comment webhook envelopes are already durably stored, but there is still no durable issue-to-mission binding, no latest-issue intake read model, no idempotent create-mission route from a stored issue delivery, and no web intake section that exposes this path.
- [x] (2026-03-16T02:06Z) Implemented the additive persistence, backend intake service, routes, web cards, and focused tests for GitHub issue intake. The slice now exposes `GET /github/intake/issues`, `POST /github/intake/issues/:deliveryId/create-mission`, a durable `github_issue_mission_bindings` table, and a mission-service issue creation path that preserves truthful GitHub source and repo context.
- [x] (2026-03-16T02:11Z) Updated `docs/ops/local-dev.md` plus one short README note so operators can inspect persisted issue intake and create missions from stored GitHub issue deliveries.
- [x] (2026-03-16T02:15Z) Ran the required validation matrix end to end: `pnpm db:generate`, `pnpm db:migrate`, `pnpm run db:migrate:ci`, `pnpm repo:hygiene`, `pnpm lint`, `pnpm typecheck`, `pnpm build`, `pnpm test`, and `pnpm ci:repro:current`.

## Surprises & Discoveries

- Observation: the requested git inspections returned no paths before this slice started.
  Evidence: `git status --short` and `git diff --name-only HEAD` both returned no output.

- Observation: M2.2 already stores enough truthful webhook context for issue intake without revisiting ingress.
  Evidence: `packages/db/src/schema/integrations.ts` persists `github_webhook_deliveries` with `deliveryId`, `eventName`, `action`, `installationId`, full raw `payload`, finalized `outcome`, and timestamps, while `apps/control-plane/src/modules/github-app/webhook-service.ts` already records `issues` as `issue_envelope_recorded` and `issue_comment` as `issue_comment_envelope_recorded`.

- Observation: the current mission creation spine already emits the replay and placeholder proof-bundle evidence this slice needs.
  Evidence: `apps/control-plane/src/modules/missions/service.ts` appends `mission.created`, `task.created`, `mission.status_changed`, and `artifact.created` for the proof-bundle placeholder during mission creation.

- Observation: the current stub compiler still defaults repo context to a short hint like `web`, so issue intake must override repo targeting explicitly instead of trusting compiler output.
  Evidence: `apps/control-plane/src/modules/missions/compiler.ts` always emits `spec.repos = ["web"]`.

- Observation: a null-vs-undefined check was enough to make the first listing test lie about issue binding state.
  Evidence: the initial `listIssues()` implementation used `binding?.missionId !== null`, which treated an absent binding as already bound until it was corrected to a non-nullish check.

- Observation: the workspace has GitHub App and webhook env keys present locally, but the primary development database currently has no persisted `issues` deliveries to use for a live smoke.
  Evidence: `.env` contains non-empty `GITHUB_APP_ID`, `GITHUB_APP_PRIVATE_KEY_BASE64`, `GITHUB_WEBHOOK_SECRET`, and `DATABASE_URL`, while a direct DB query against `github_webhook_deliveries` for `event_name = 'issues'` returned an empty result set.

## Decision Log

- Decision: keep issue intake inside the existing GitHub App bounded context with separate intake-specific route, repository, schema, and service files.
  Rationale: the source of truth is the persisted GitHub webhook envelope and the slice is GitHub-specific, but mission creation logic should still be reused through the mission service instead of duplicating the mission spine in the route.
  Date/Author: 2026-03-16 / Codex

- Decision: add one additive binding table keyed by durable GitHub issue identity and allow `missionId` to start nullable inside the transaction while the mission is being created.
  Rationale: reserving the issue identity before mission creation is the smallest reliable way to prevent duplicate missions under retries or concurrent create attempts without redesigning webhook ingress.
  Date/Author: 2026-03-16 / Codex

- Decision: collapse the intake read model to the latest persisted `issues` delivery per issue identity and treat `issue_comment` deliveries only as comment activity or presence metadata.
  Rationale: that keeps the operator surface actionable and avoids duplicate cards for edited or reopened issues while still keeping comments clearly separate from mission creation.
  Date/Author: 2026-03-16 / Codex

- Decision: compile issue intake through the existing mission compiler using formatted issue title and body text, then override mission source metadata and repository targeting with the truthful GitHub issue URL and repository full name.
  Rationale: the prompt explicitly requires use of the existing compiler but also requires the created mission to point at the real GitHub repo full name instead of only a short compiler hint.
  Date/Author: 2026-03-16 / Codex

- Decision: do not add new replay event types for issue intake itself.
  Rationale: the mission creation path already emits the required mission and task lifecycle replay, while the new intake list route is read-only and issue comments remain envelopes only.
  Date/Author: 2026-03-16 / Codex

## Context and Orientation

Pocket CTO already has the four pieces this slice needs.

First, M2.2 webhook ingress is real and durable.
`apps/control-plane/src/modules/github-app/webhook-routes.ts`, `webhook-service.ts`, `webhook-repository.ts`, and `webhook-drizzle-repository.ts` verify signatures, enforce delivery idempotency, and persist `issues` plus `issue_comment` payloads into `github_webhook_deliveries`.

Second, M2.3 repository registry and M2.4 publish already established the truthful repo target boundary.
`packages/db/src/schema/integrations.ts` stores `repositories.full_name`, installation linkage, active state, and write-readiness inputs.
`apps/control-plane/src/modules/github-app/service.ts` already resolves or validates real repository full names.

Third, the mission spine already knows how to create a build mission with tasks, replay, and a placeholder proof bundle.
That behavior lives in `apps/control-plane/src/modules/missions/service.ts`, with persistence in `repository.ts` and `drizzle-repository.ts`.

Fourth, EP-0018 already shipped the operator home and mission list surfaces.
The shared list contract lives in `packages/domain/src/mission-list.ts`, the control-plane list route lives in `apps/control-plane/src/modules/missions/routes.ts`, and the web surfaces are in `apps/web/app/page.tsx`, `apps/web/app/missions/page.tsx`, and `apps/web/lib/api.ts`.

The missing seam is a truthful intake layer between stored GitHub issue envelopes and mission creation.
This slice needs:

- one additive persistence surface to bind an issue identity to a mission id
- one summary-shaped intake read model over persisted issue envelopes
- one create-mission service path that is safe to retry and safe against duplicate issue-to-mission creation
- one small web section that shows issue cards and calls that new route

The intended edit surface for this slice is:

- `plans/EP-0019-github-issue-intake-to-build-mission.md`
- `README.md`
- `docs/ops/local-dev.md`
- `packages/domain/src/github-issue-intake.ts`
- `packages/domain/src/index.ts`
- `packages/db/src/schema/integrations.ts`
- generated migration output under `packages/db/drizzle/`
- `apps/control-plane/src/app.ts`
- `apps/control-plane/src/bootstrap.ts`
- `apps/control-plane/src/lib/http-errors.ts`
- `apps/control-plane/src/lib/types.ts`
- `apps/control-plane/src/modules/github-app/errors.ts`
- `apps/control-plane/src/modules/github-app/webhook-types.ts`
- new intake files under `apps/control-plane/src/modules/github-app/`:
  `issue-intake-schema.ts`
  `issue-intake-repository.ts`
  `issue-intake-drizzle-repository.ts`
  `issue-intake-service.ts`
  `issue-intake-routes.ts`
- `apps/control-plane/src/modules/missions/service.ts`
- focused specs under the same control-plane modules plus `apps/control-plane/src/app.spec.ts`
- `apps/web/lib/api.ts`
- `apps/web/lib/api.spec.ts`
- `apps/web/app/page.tsx`
- `apps/web/app/missions/page.tsx`
- `apps/web/app/missions/actions.ts`
- `apps/web/app/missions/actions.spec.ts`
- new intake UI components under `apps/web/components/`
- `apps/web/app/globals.css`

This slice should preserve the existing architecture rules:

- routes stay thin
- GitHub envelope parsing and idempotency live in service and repository files, not in Fastify handlers
- `packages/domain` owns the shared intake contract
- mission creation still flows through the mission bounded context so replay and placeholder proof-bundle evidence stay truthful
- issue comments remain persisted envelopes only and do not become mission creators in this slice

No new GitHub App credentials are expected.
No PAT fallback is allowed.
No new webhook subscriptions beyond the already-consumed `issues` and `issue_comment` events are expected.

## Plan of Work

First, add the smallest additive persistence needed to make issue-to-mission creation durable and retry-safe.
That means one `github_issue_mission_bindings` table in `packages/db/src/schema/integrations.ts` with repo full name, issue number, issue id, optional node id, nullable mission id during the transaction, latest source delivery id, and timestamps, plus uniqueness over issue identity.

Next, add a dedicated GitHub issue intake boundary under `apps/control-plane/src/modules/github-app/`.
The repository layer should manage binding reservations, mission attachment, and binding lookups.
The service layer should derive latest-per-issue intake summaries from stored webhook envelopes, aggregate comment activity honestly, and create missions from persisted `issues` deliveries only.
The route layer should expose `GET /github/intake/issues` and `POST /github/intake/issues/:deliveryId/create-mission`.

Then, extend the mission service just enough to support issue-origin mission creation without duplicating the replay or proof-bundle spine.
The new path should compile formatted issue title and body text through the existing compiler, persist the combined raw compiler input, set `sourceKind = github_issue`, set a truthful canonical `sourceRef`, and override `primaryRepo` plus `spec.repos` to the real repository full name from the webhook payload.

After that, wire the new service into the control-plane app and add focused HTTP errors for explicit non-issue delivery rejection.
The create route must return the existing mission when the issue is already bound instead of creating duplicate work.

Finally, update the web mission surfaces.
Add a small GitHub issue intake section with actionable cards, a create-mission action for unbound issues, and an existing mission link plus status for bound issues.
Keep the layout simple and mobile-safe.

## Concrete Steps

Run these commands from the repository root as needed:

    rg -n "issues|issue_comment|github_issue|sourceKind|sourceRef|deliveryId|handledAs" apps packages docs
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

    pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/github-app/issue-intake-service.spec.ts src/modules/missions/service.spec.ts src/app.spec.ts
    pnpm --filter @pocket-cto/web exec vitest run lib/api.spec.ts app/missions/actions.spec.ts app/missions/page.spec.tsx components/github-issue-intake-card.spec.tsx
    rg -n "issue-intake|create-mission|github/intake/issues|github_issue_mission_bindings" apps packages docs

If live GitHub App and webhook env are available after implementation and at least one issue delivery already exists, run one smoke path and record:

- delivery id used
- repo full name
- issue number
- created mission id
- whether repeated create returned the same mission id
- whether the mission appeared in the mission list

## Validation and Acceptance

Success for this slice is demonstrated when all of the following are true:

1. One additive binding model exists that can bind a GitHub issue identity to a mission id without destructive schema changes.
2. Repeated create attempts for the same GitHub issue return the existing mission instead of creating a duplicate.
3. `GET /github/intake/issues` returns summary items derived from persisted `issues` envelopes and includes whether each issue is already bound plus the bound mission id when present.
4. `POST /github/intake/issues/:deliveryId/create-mission` loads the stored delivery, rejects non-issue deliveries explicitly, and creates a mission only from a persisted `issues` envelope.
5. The created mission uses `sourceKind = github_issue`.
6. The created mission carries a truthful GitHub issue `sourceRef`.
7. The created mission points at the real repository full name from the GitHub payload, not only the compiler's short repo hint.
8. `issue_comment` deliveries remain persisted envelopes only and are not used as mission creators in this slice.
9. The web mission surfaces show GitHub issue intake cards with create or existing-mission affordances and stay mobile-safe.
10. Replay and evidence remain truthful because mission creation still emits the standard mission/task/proof-bundle placeholder sequence.

Useful manual acceptance after implementation should look like:

    curl -i http://localhost:4000/github/intake/issues
    curl -i -X POST http://localhost:4000/github/intake/issues/<delivery-id>/create-mission
    curl -i http://localhost:4000/missions?sourceKind=github_issue

If a persisted issue envelope exists locally, the first create should produce a mission and the second create for the same issue should return the same mission id.

## Idempotence and Recovery

The schema change must stay additive.
If `pnpm db:generate` shows unrelated drift, stop and correct the schema before continuing.

Issue intake must be safe to retry.
The binding reservation row should be inserted on issue identity before mission creation in the same database transaction.
That makes duplicate or concurrent create attempts converge on one issue binding.
If the transaction fails before commit, both the reservation and the mission creation should roll back together.

Safe recovery guidance:

- if a route call is retried with the same issue delivery after success, it should return the existing mission rather than creating a second mission
- if mission creation fails before commit, rerun the same create route after fixing the underlying cause
- if rollback is needed, revert the additive binding migration, the new intake module, the mission-service issue path, the web section, the tests, and the docs together

This slice must not redesign webhook ingress and must not add PAT fallback.

## Artifacts and Notes

Initial gap notes captured before coding:

1. Existing persisted issue-envelope truth:
   `github_webhook_deliveries` already stores `issues` and `issue_comment` payloads durably with finalized handling outcomes.
2. Existing missing binding truth:
   there is no durable row today that says "GitHub issue X is already bound to mission Y".
3. Existing mission spine truth:
   the mission service already emits replay plus placeholder proof-bundle evidence for a new mission.
4. Existing UI truth:
   the home and mission-list surfaces exist, but they only expose text intake and mission summaries.

The explicit pre-code gap note from this slice:

1. Persisted issue/comment data already available:
   delivery id, event name, action, optional installation id, full payload, outcome, and timestamps.
2. Still missing before implementation:
   a durable issue identity binding, an issue-intake read model, an idempotent create route, and a web section exposing the path.
3. Planned strategy:
   latest-per-issue intake cards from stored `issues` envelopes, comment presence from `issue_comment`, one additive binding table, and mission creation through the existing compiler plus mission spine with truthful source and repo overrides.

Validation results and live-smoke notes will be appended here as implementation proceeds.

Validation results:

- `pnpm db:generate`: passed; after the initial generation of `packages/db/drizzle/0011_colorful_joshua_kane.sql`, reruns reported `No schema changes, nothing to migrate`.
- `pnpm db:migrate`: passed.
- `pnpm run db:migrate:ci`: passed when run sequentially; an earlier parallel attempt was discarded after it raced on database creation.
- `pnpm repo:hygiene`: passed.
- `pnpm lint`: passed after removing one unused import from `apps/control-plane/src/modules/github-app/issue-intake-service.spec.ts`.
- `pnpm typecheck`: passed after tightening one fixture helper return type, making the already-bound mission path explicit, and adding the new intake service stub to the orchestrator harness app container.
- `pnpm build`: passed. Existing Next.js warnings about `typedRoutes`, build cache, and the ESLint plugin remain unrelated to this slice.
- `pnpm test`: passed with all packages green, including `36` control-plane files and `170` control-plane tests.
- `pnpm ci:repro:current`: passed from a clean temporary worktree and confirmed both static and integration-db CI paths.

Live smoke status:

- Not run. The workspace has local GitHub App and webhook env configured, but the primary development database did not contain any persisted `issues` deliveries to bind, so there was no truthful live delivery to exercise.

## Outcomes & Retrospective

This slice now closes the M2.7 issue-intake seam without widening the milestone.
Persisted GitHub `issues` envelopes can be listed, inspected for comment activity, and turned into one build mission per GitHub issue identity.
Repeated creates converge on the same mission through the durable binding reservation instead of duplicating work.

The implementation stayed inside the existing boundaries:

- `packages/domain` owns the shared issue-intake contracts
- `packages/db` owns the additive issue-binding schema
- the GitHub App bounded context owns intake listing and delivery-to-mission orchestration
- the mission bounded context still owns mission creation, replay emission, and proof-bundle placeholder evidence
- the web surfaces stayed summary-shaped and mobile-safe instead of becoming a second operator console

The remaining gap for a future slice is not correctness here, but upstream data availability.
To demonstrate the live path end to end, the local environment still needs at least one real persisted GitHub `issues` webhook delivery in the primary development database.

## Interfaces and Dependencies

Important existing types and modules for this slice:

- `MissionRecord`, `CreateMissionFromTextInputSchema`, and `MissionSourceKindSchema` in `packages/domain/src/mission.ts`
- replay contracts in `packages/domain/src/replay-event.ts`
- mission list contracts in `packages/domain/src/mission-list.ts`
- webhook delivery contracts in `apps/control-plane/src/modules/github-app/webhook-types.ts`
- mission creation and replay flow in `apps/control-plane/src/modules/missions/service.ts`
- GitHub webhook persistence in `apps/control-plane/src/modules/github-app/webhook-repository.ts` and `webhook-drizzle-repository.ts`
- repository registry and mission repo resolution in `apps/control-plane/src/modules/github-app/service.ts`
- control-plane route wiring in `apps/control-plane/src/app.ts`, `bootstrap.ts`, and `lib/types.ts`
- web API calls in `apps/web/lib/api.ts`

New or changed dependencies expected in this slice:

- one new shared domain contract for GitHub issue intake summaries and create results
- one new additive DB table under `packages/db/src/schema/integrations.ts`
- no new environment variables
- no new GitHub App permissions or webhook event subscriptions

## Outcomes & Retrospective

This section will be updated after implementation with the exact shipped behavior, remaining gaps if any, the validation matrix results, and whether M2 as a whole now meets its exit criteria.
