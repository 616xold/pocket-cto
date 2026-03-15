# EP-0014 - Add repository registry sync and read surfaces

This ExecPlan is a living document. Keep `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` current.

## Purpose / Big Picture

After this slice, Pocket CTO can truthfully answer which repositories are currently visible to each persisted GitHub App installation, refresh that registry on demand through installation-scoped GitHub App tokens, and reconcile repository removals without silently deleting history.
The operator-visible proof remains intentionally backend-first and narrow: thin control-plane routes can list repository summaries globally or per installation, manual repository sync can run for one installation or all persisted installations, and webhook `installation_repositories` updates converge on the same durable repository registry instead of maintaining a second source of truth.

This plan covers roadmap submilestone `M2.3 repository registry and repo sync`.
It depends on the GitHub App auth and installation persistence work from `plans/EP-0012-github-app-auth-and-installation-persistence.md` and the webhook signature plus ingress ledger work from `plans/EP-0013-webhook-signature-and-idempotent-ingress.md`.
It does not implement issue-to-mission intake, branch creation, pull request creation, approval cards, web UI repository pages, or the later M2.4 slice.

## Progress

- [x] (2026-03-15T16:58Z) Read the required repo docs, current GitHub milestone plans, local-dev and security guidance, the GitHub App bounded-context files, and the requested repo or git inspections: `rg -n "repository|repositories|installation_repositories|full_name|default_branch|archived|disabled" packages apps docs`, `git status --short`, and `git diff --name-only HEAD`.
- [x] (2026-03-15T16:58Z) Captured the M2.3 gap: installation state and webhook ingress are already persisted, and webhook `installation_repositories` already touches the existing `repositories` table, but the registry is still too thin and destructive to serve as a truthful installation-scoped repository inventory.
- [x] (2026-03-15T17:15Z) Created the new M2.3 bounded-context plan, extended the `repositories` table schema additively with installation id, owner login, repo name, visibility flags, active state, and sync timestamps, generated migration `packages/db/drizzle/0009_noisy_slipstream.sql`, and hand-tuned that migration to backfill required columns before enforcing `NOT NULL`.
- [x] (2026-03-15T17:15Z) Implemented the repository-registry service path: installation-token-backed `GET /installation/repositories` sync for one installation or all persisted installations, inactive reconciliation for missing repositories, installation deletion that preserves repository rows as inactive, and shared webhook/manual use of the same upsert plus mark-inactive repository methods.
- [x] (2026-03-15T17:15Z) Added focused tests for one-install sync, sync-all, honest inactive reconciliation, webhook convergence, and the new repository routes; ran the focused GitHub suite after migrating both dev and test databases, and it passed with 46 tests across `service.spec.ts`, `webhook-service.spec.ts`, `webhook-routes.spec.ts`, and `app.spec.ts`.
- [x] (2026-03-15T17:18Z) Updated `docs/ops/local-dev.md` with the new repository-registry routes and inactive-state semantics, added a short README discoverability note, ran the full required validation commands successfully, and completed one live sync against the configured `616xold` GitHub App installation.
- [x] (2026-03-15T20:03Z) Added a narrow write-target resolution boundary on top of the durable repository registry: repository lookup by `fullName`, deterministic `resolveWritableRepository(fullName)` service behavior, explicit typed repo-state errors, the thin `GET /github/repositories/:owner/:repo` read route, focused service and route tests, and updated local-dev guidance for write readiness.

## Surprises & Discoveries

- Observation: the working tree is already dirty with uncommitted M2.2 delivery-read-surface changes in webhook and docs files.
  Evidence: `git status --short` and `git diff --name-only HEAD` show modified webhook route, service, error, spec, docs, and EP-0013 files before M2.3 starts.

- Observation: the existing `repositories` table is already the live repository persistence surface for GitHub App data, so M2.3 should extend it rather than introducing a second registry table.
  Evidence: `packages/db/src/schema/integrations.ts`, `apps/control-plane/src/modules/github-app/drizzle-repository.ts`, and `apps/control-plane/src/modules/github-app/webhook-service.ts`.

- Observation: current webhook repository removals are destructive deletes, which would make the registry lie about prior visibility and prevent honest reconciliation status.
  Evidence: `removeInstallationRepositories` in both `apps/control-plane/src/modules/github-app/repository.ts` and `apps/control-plane/src/modules/github-app/drizzle-repository.ts`.

- Observation: this slice changes durable GitHub integration state but not mission or task lifecycle state, so no new replay event is required as long as the repository registry and webhook-delivery ledger remain truthful and inspectable.
  Evidence: `AGENTS.md` and `docs/architecture/replay-and-evidence.md` scope replay requirements around mission or task lifecycle changes.

- Observation: the generated Drizzle migration needed a manual backfill step before adding `NOT NULL` constraints for `installation_id`, `owner_login`, and `name`.
  Evidence: `packages/db/drizzle/0009_noisy_slipstream.sql` initially added those columns directly as required, which would fail on any existing repository rows until the migration was amended to populate them from `github_installations` and `full_name`.

- Observation: deleting an installation now leaves repository rows both inactive and installationless, so the write-target resolver needs an explicit precedence rule instead of blindly reporting the first falsy flag.
  Evidence: the new `resolveWritableRepository` test initially surfaced `GitHubRepositoryInactiveError` for a deleted-installation row until the resolver was updated to surface `installation_unavailable` before the generic inactive state when no persisted installation remains.

## Decision Log

- Decision: reuse the existing `repositories` table as the single durable repository registry and extend it additively with repository metadata plus an explicit active or inactive installation-link state.
  Rationale: the prompt requires reusing the current model rather than inventing a second registry, and extending the current table is the smallest truthful move.
  Date/Author: 2026-03-15 / Codex

- Decision: reconcile repository removals by marking the installation linkage inactive instead of deleting rows.
  Rationale: this keeps the registry honest about what the latest sync no longer sees while preserving durable repository metadata and avoiding blind hard deletes.
  Date/Author: 2026-03-15 / Codex

- Decision: route both manual sync and `installation_repositories` webhook updates through the same GitHub App service reconciliation methods.
  Rationale: M2.3 specifically requires convergence between manual sync and webhook handling, and a shared service path is the cleanest way to guarantee that.
  Date/Author: 2026-03-15 / Codex

- Decision: use installation access tokens minted through the existing M2.1 token cache and call GitHub `GET /installation/repositories` for repository sync.
  Rationale: this preserves the GitHub App-first security model and avoids PATs or `gh` shortcuts.
  Date/Author: 2026-03-15 / Codex

- Decision: preserve repository rows when an installation is deleted by storing the external `installationId` directly on the registry row, switching the foreign key to `ON DELETE SET NULL`, and marking those rows inactive instead of cascading deletes.
  Rationale: the repository registry should stay durable and truthful even when installation state changes, and a cascade delete would erase the very history this slice is meant to preserve.
  Date/Author: 2026-03-15 / Codex

- Decision: keep the M2.4 write-target policy inside the existing GitHub App bounded context as a single resolver keyed by repository `fullName`.
  Rationale: branch or pull-request flows will need one deterministic installation-backed target, and centralizing that policy avoids duplicating active or inactive, archive, disabled, and installation-link checks across later write surfaces.
  Date/Author: 2026-03-15 / Codex

- Decision: expose one optional summary route at `GET /github/repositories/:owner/:repo`, but keep actual write-target enforcement in `resolveWritableRepository(fullName)`.
  Rationale: operators and local developers still need to inspect readiness without triggering write-oriented errors, while later M2.4 write flows need a stricter boundary that throws typed failures.
  Date/Author: 2026-03-15 / Codex

- Decision: give `installation_unavailable` precedence over the generic inactive state when the persisted installation row is gone.
  Rationale: installation deletion already marks repository rows inactive, but M2.4 needs to know specifically when installation-token minting is impossible rather than receiving a less precise inactive error.
  Date/Author: 2026-03-15 / Codex

## Context and Orientation

Pocket CTO already has a real GitHub App bounded context under `apps/control-plane/src/modules/github-app/`.
That context can:

- resolve GitHub App and webhook config through `config.ts`
- mint App JWTs and installation tokens through `auth.ts`, `client.ts`, and `token-cache.ts`
- persist GitHub App installations through `repository.ts`, `drizzle-repository.ts`, and `service.ts`
- accept signed webhooks and persist their delivery envelopes through `webhook-service.ts` and `webhook-repository.ts`

The relevant persistence surfaces today are:

- `packages/db/src/schema/integrations.ts` for `github_installations`, `repositories`, and `github_webhook_deliveries`
- `packages/db/src/schema/index.ts` and `packages/db/src/index.ts` for schema exports
- generated migrations under `packages/db/drizzle/`

The current repository gap is clear:

- repository rows only store `githubRepositoryId`, `fullName`, `defaultBranch`, `language`, `installationRefId`, and timestamps
- manual installation sync exists only for installations, not repositories
- webhook `installation_repositories` updates can add or remove repository links, but removals currently delete rows
- there is no clean read surface for repository summaries globally or by installation

The intended edit surface for this slice is:

- `plans/EP-0014-repository-registry-and-repo-sync.md`
- `README.md`
- `docs/ops/local-dev.md`
- `packages/db/src/schema/integrations.ts`
- additive migration output under `packages/db/drizzle/`
- `apps/control-plane/src/lib/http-errors.ts`
- `apps/control-plane/src/lib/types.ts`
- `apps/control-plane/src/bootstrap.ts`
- `apps/control-plane/src/modules/github-app/errors.ts`
- `apps/control-plane/src/modules/github-app/types.ts`
- `apps/control-plane/src/modules/github-app/client.ts`
- `apps/control-plane/src/modules/github-app/repository.ts`
- `apps/control-plane/src/modules/github-app/drizzle-repository.ts`
- `apps/control-plane/src/modules/github-app/service.ts`
- `apps/control-plane/src/modules/github-app/schema.ts`
- `apps/control-plane/src/modules/github-app/routes.ts`
- `apps/control-plane/src/modules/github-app/webhook-service.ts`
- focused specs under `apps/control-plane/src/modules/github-app/`
- `apps/control-plane/src/app.spec.ts`
- `apps/control-plane/src/bootstrap.spec.ts`
- `apps/control-plane/src/modules/orchestrator/drizzle-service.spec.ts` if service-port stubs need to grow with the new route surface

This slice should preserve the existing architecture boundaries:

- routes stay thin
- GitHub transport stays in `client.ts`
- sync and reconciliation rules live in `service.ts`
- persistence stays in repository modules
- webhook transport remains in `webhook-routes.ts`, but the repository-registry update logic should be shared with manual sync

This slice does not require new GitHub App permissions beyond repository `Metadata` read-only for listing installation repositories in the current scope.

## Plan of Work

First, extend the existing repository registry model additively so repository rows can stand on their own as an honest inventory.
At minimum that means persisting the GitHub repository id, full name, owner login, repo name, default branch, visibility, `archived`, `disabled`, active or inactive installation-link state, and a `lastSyncedAt` timestamp.
The schema should also preserve the current installation linkage and support reactivation when a repo reappears for an installation later.

Next, extend the GitHub App client and service so repository sync can use installation access tokens and GitHub `GET /installation/repositories`.
That sync path must support one installation and all persisted installations, stay idempotent, and update the same registry rows that the webhook path uses.
Removals or absences should mark the linkage inactive instead of deleting the registry row.

Then, update webhook repository handling to call the same shared repository-registry reconcile methods so the manual sync path and `installation_repositories` events converge on one durable model.

After that, add thin read and sync routes for repository summaries.
The routes should remain summary-shaped, validate inputs with Zod, and return typed `github_app_not_configured` or installation-level not-found errors when appropriate.

Finally, add focused tests and docs, then run the required validation commands and record exact results here.
If live GitHub App env is present locally, run one real sync and record installation count, repository count, whether `616xold/pocket-cto` exists in the persisted registry, its default branch, and whether it is active.

## Concrete Steps

Run these commands from the repository root as needed:

    pnpm db:generate
    pnpm db:migrate
    pnpm run db:migrate:ci
    pnpm --filter @pocket-cto/control-plane test
    pnpm --filter @pocket-cto/control-plane typecheck
    pnpm --filter @pocket-cto/control-plane lint
    pnpm --filter @pocket-cto/web typecheck

Useful narrow inspection commands during implementation:

    rg -n "repository|repositories|installation_repositories|full_name|default_branch|archived|disabled" packages apps docs
    git status --short
    git diff --name-only HEAD
    pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/github-app/service.spec.ts src/modules/github-app/webhook-service.spec.ts src/app.spec.ts

If live GitHub App env is present after implementation, also run one narrow acceptance path and record:

- synced installation count
- synced repository count
- whether `616xold/pocket-cto` is present in the registry
- the persisted `defaultBranch` for that repo
- whether the repo is marked active

## Validation and Acceptance

Success for M2.3 is demonstrated when all of the following are true:

1. The existing `repositories` table becomes the truthful durable repository registry without introducing a second competing registry table.
2. Repository rows persist at least GitHub repository id, full name, owner login, repo name, default branch, private or public visibility, archived state, disabled state, installation linkage, `updatedAt`, and `lastSyncedAt`.
3. `POST /github/installations/:installationId/repositories/sync` syncs one persisted installation through GitHub `GET /installation/repositories` using an installation access token from the existing cache path.
4. `POST /github/repositories/sync` syncs all persisted installations and returns an honest summary.
5. `GET /github/repositories` returns compact repository summaries from the durable registry.
6. `GET /github/installations/:installationId/repositories` returns compact repository summaries for one installation and returns a typed not-found error for an unknown installation id.
7. Manual sync upserts seen repositories and marks missing repositories inactive instead of blindly deleting them.
8. `installation_repositories` webhook events update the same registry rows and follow the same active or inactive reconciliation rules as manual sync.
9. Missing GitHub App configuration returns the existing typed `github_app_not_configured` error instead of silent empty results or PAT fallback.
10. The local-dev docs explain how to run repository sync, how to inspect the registry, and what inactive or removed means in this model.

Useful manual acceptance after implementation should look like:

    curl -i http://localhost:4000/github/repositories
    curl -i http://localhost:4000/github/installations
    curl -i http://localhost:4000/github/installations/12345/repositories
    curl -i -X POST http://localhost:4000/github/repositories/sync
    curl -i -X POST http://localhost:4000/github/installations/12345/repositories/sync

When GitHub App env is configured and installation `12345` exists in Postgres, the sync routes should return a persisted summary and the list routes should show repository rows with explicit `active` state.
When the app is unconfigured, the sync routes should return the typed not-configured error.
When the installation id is unknown, the installation-scoped routes should return the typed not-found error.

## Idempotence and Recovery

The schema change must stay additive.
If migration generation shows unrelated changes, fix the schema and regenerate rather than hand-editing the output blindly.

Repository sync must be safe to retry.
Repeated syncs for the same installation should update the same rows by `githubRepositoryId`, refresh metadata plus `lastSyncedAt`, and leave unchanged repositories stable.
If a repository disappears from a sync result, the service should mark it inactive and preserve the row.
If that repository reappears later, the same row should become active again and refresh its metadata.

Safe rollback guidance:

- revert the additive repository-table migration, GitHub App repository-service changes, route changes, tests, and docs together
- rerun `pnpm db:migrate` against the reverted schema only if the database must follow the code rollback
- do not delete existing repository rows manually, because the inactive marker is the safe fallback state for this slice

This slice must not add PAT fallback.

## Artifacts and Notes

Initial M2.3 gap notes captured before implementation:

1. Existing installation persistence:
   `github_installations` already stores installation id, app id, account metadata, target metadata, suspended state, permissions, and `lastSyncedAt`.
2. Existing webhook persistence:
   `github_webhook_deliveries` already stores delivery id, event name, action, installation id, payload, outcome, and timestamps.
3. Existing repository persistence:
   `repositories` already stores installation linkage, GitHub repository id, full name, default branch, language, and timestamps.
4. Explicit current gap:
   repository rows do not persist owner login, repo name, private or public visibility, `archived`, `disabled`, or active or inactive linkage state, and the current removal path deletes rows instead of reconciling them honestly.

Validation results and any live sync evidence will be appended here as implementation proceeds.

Focused validation captured during implementation:

- `pnpm db:generate`
  Result: passed and generated `packages/db/drizzle/0009_noisy_slipstream.sql`, which was then amended to backfill `installation_id`, `owner_login`, and `name` before applying `NOT NULL`.
- `pnpm db:migrate`
  Result: passed after the migration backfill changes.
- `pnpm run db:migrate:ci`
  Result: passed for both `pocket_cto` and `pocket_cto_test`.
- `pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/github-app/service.spec.ts src/modules/github-app/webhook-service.spec.ts src/modules/github-app/webhook-routes.spec.ts src/app.spec.ts`
  Result: passed with 4 files and 46 tests.

Final validation results:

- `pnpm db:generate`
  Result: passed with `No schema changes, nothing to migrate`.
- `pnpm --filter @pocket-cto/db build`
  Result: passed and refreshed the referenced DB package output for downstream typecheck.
- `pnpm db:migrate`
  Result: passed.
- `pnpm run db:migrate:ci`
  Result: passed for both `pocket_cto` and `pocket_cto_test`.
- `pnpm --filter @pocket-cto/control-plane test`
  Result: passed with 31 test files and 124 tests.
- `pnpm --filter @pocket-cto/control-plane typecheck`
  Result: passed.
- `pnpm --filter @pocket-cto/control-plane lint`
  Result: passed.
- `pnpm --filter @pocket-cto/web typecheck`
  Result: passed.

Write-target boundary validation added after the main M2.3 slice:

- `pnpm db:generate`
  Result: passed with `No schema changes, nothing to migrate`.
- `pnpm db:migrate`
  Result: passed.
- `pnpm --filter @pocket-cto/control-plane test`
  Result: passed with 31 test files and 131 tests after adding the resolver and optional single-repository route coverage.
- `pnpm --filter @pocket-cto/control-plane typecheck`
  Result: passed.
- `pnpm --filter @pocket-cto/control-plane lint`
  Result: passed.
- `pnpm --filter @pocket-cto/web typecheck`
  Result: passed.

Live GitHub App evidence:

- Environment detection:
  `.env` is present locally and contains non-empty `GITHUB_APP_ID` plus `GITHUB_APP_PRIVATE_KEY_BASE64`.
- Live installation sync:
  `installationSyncCount = 1`
  `installationId = 116452352`
  `accountLogin = 616xold`
- Live repository sync:
  `repositorySyncCount = 1`
  `activeRepositoryCount = 1`
  `inactiveRepositoryCount = 0`
- Registry check for `616xold/pocket-cto`:
  `repoPresent = true`
  `defaultBranch = main`
  `isActive = true`

## Interfaces and Dependencies

Important existing dependencies for this slice:

- `@pocket-cto/config` for env loading
- `@pocket-cto/db` and Drizzle for persistence
- `fastify` for control-plane routes
- `zod` for route and summary validation
- Node `fetch` for GitHub REST API requests

Important interfaces expected by the end of this slice:

- an expanded repository snapshot type that includes owner login, repo name, visibility, archived, disabled, active state, and sync timestamp
- a GitHub App client method for `GET /installation/repositories`
- GitHub App repository methods for listing repositories globally and by installation, upserting repository snapshots, and reconciling inactive repository links
- GitHub App service methods for sync-one, sync-all, and read-only repository summaries
- typed not-found errors for installation-scoped repository routes
- summary schemas for repository list and sync responses

Expected environment and ops dependencies after this slice:

- no new required env vars
- existing GitHub App env from M2.1 remains the live requirement for repository sync
- existing webhook secret from M2.2 remains required for live webhook ingress

## Outcomes & Retrospective

Pocket CTO now has a truthful repository registry for M2.3.
The existing `repositories` table is the single durable registry, manual repo sync uses installation-scoped GitHub App tokens instead of PATs, missing repositories are marked inactive rather than deleted, and `installation_repositories` webhook updates land in the same registry model and reconciliation rules.

The new operator-facing debug surface is still intentionally narrow:

- `GET /github/repositories`
- `GET /github/repositories/:owner/:repo`
- `GET /github/installations/:installationId/repositories`
- `POST /github/repositories/sync`
- `POST /github/installations/:installationId/repositories/sync`

This slice does not create missions from GitHub issues, create branches, or create pull requests.
Those remain for later GitHub milestones.
With installation state, webhook ingress, repository registry sync, and write-readiness resolution now all durable and inspectable, the next GitHub slice can start on branch or PR artifact work without having to reinvent repo-selection logic first.
