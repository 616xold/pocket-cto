# EP-0012 - Add GitHub App auth and installation persistence

This ExecPlan is a living document. Keep `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` current.

## Purpose / Big Picture

After this slice, Pocket CTO can authenticate as a real GitHub App, list its current installations from GitHub, persist those installation snapshots durably in Postgres, and mint short-lived installation access tokens through an honest in-memory cache.
The operator-visible proof is intentionally narrow and backend-first: `GET /github/installations` shows the persisted installation summaries and `POST /github/installations/sync` refreshes them from GitHub without using PATs, `gh`, or webhook shortcuts.

This plan covers roadmap submilestone `M2.1 GitHub App auth and installation model`.
It does not implement webhook ingestion, issue-to-mission intake, repository registry sync, branch or PR creation, or any web UI beyond the minimal control-plane debug surface.

## Progress

- [x] (2026-03-15T00:00Z) Read the required repo docs, current milestone plans, control-plane bootstrap and route files, config and DB schema files, and inspected the existing GitHub placeholders with `rg -n "GITHUB_APP_|GITHUB_WEBHOOK_SECRET|GitHub App|PAT|github_install|installation" . packages apps docs plans`, `git status --short`, and `git diff --name-only HEAD`.
- [x] (2026-03-15T00:00Z) Captured the M2.1 auth gap: env placeholders and a thin `github_installations` table already exist, but there is no GitHub App bounded context, no JWT auth, no installation sync service, no token cache, and no installation-sync routes.
- [x] (2026-03-15T01:00Z) Added the new `apps/control-plane/src/modules/github-app/` bounded context with modular config, auth, token-cache, client, repository, service, schema, and routes files, then wired it into `bootstrap.ts`, `app.ts`, `lib/types.ts`, and `lib/http-errors.ts`.
- [x] (2026-03-15T01:05Z) Extended `packages/db/src/schema/integrations.ts`, generated additive migration `packages/db/drizzle/0006_naive_jimmy_woo.sql`, and refreshed the `@pocket-cto/db` package output so the control-plane package could see the enriched installation table shape.
- [x] (2026-03-15T01:10Z) Added focused M2.1 tests for GitHub App config parsing, private-key decode plus JWT signing, token-cache reuse plus refresh, DB-backed installation sync persistence from mocked GitHub responses, and route-level configured versus unconfigured behavior.
- [x] (2026-03-15T01:13Z) Updated `docs/ops/local-dev.md` with an honest M2.1 GitHub App setup section and added one short README discoverability note.
- [x] (2026-03-15T01:14Z) Ran the required validation commands plus the extra test-database migration helper, then completed one live installation sync and token-mint smoke check against the configured GitHub App installation for `616xold`.

## Surprises & Discoveries

- Observation: the repository already has the right env placeholders for a GitHub App, but they are only parsed as optional strings with no M2.1-specific validation or runtime usage.
  Evidence: `.env.example` and `packages/config/src/index.ts`.

- Observation: the database already has a `github_installations` table, but it is only a placeholder and cannot yet persist app id, target metadata, suspended state, permissions, or sync timestamps.
  Evidence: `packages/db/src/schema/integrations.ts`.

- Observation: the only existing GitHub HTTP surface is a placeholder webhook route under `modules/github/`, so M2.1 needs a new bounded context rather than extending an existing service.
  Evidence: `apps/control-plane/src/modules/github/webhook-routes.ts`.

- Observation: this slice does not change mission or task state, so there is no new replay-event requirement as long as the new debug routes stay read-only plus installation-sync oriented.
  Evidence: `docs/architecture/replay-and-evidence.md` and the requested scope explicitly exclude mission intake, webhooks, branch creation, and PR creation.

- Observation: the control-plane package typecheck reads the referenced `@pocket-cto/db` package output, so the DB package needed a build refresh after the installation schema changed before `apps/control-plane` could typecheck against the new columns.
  Evidence: the first control-plane typecheck still saw the old `github_installations` declaration shape until `pnpm --filter @pocket-cto/db build` regenerated the package output.

- Observation: DB-backed control-plane tests still depend on the dedicated test database being migrated explicitly, not just the main development database.
  Evidence: the new GitHub App service spec failed on `column "app_id" does not exist` until `pnpm run db:migrate:ci` migrated both `pocket_cto` and `pocket_cto_test`.

## Decision Log

- Decision: implement M2.1 under `apps/control-plane/src/modules/github-app/` and leave `apps/control-plane/src/modules/github/` reserved for later webhook ingress.
  Rationale: the user explicitly requested a GitHub App bounded context, and separating auth plus installation persistence from webhook transport keeps the new module legible and respects the repo’s thin-route rule.
  Date/Author: 2026-03-15 / Codex

- Decision: keep GitHub auth App-only with runtime JWT generation from `GITHUB_APP_ID` plus `GITHUB_APP_PRIVATE_KEY_BASE64`, and do not use PATs or `gh`.
  Rationale: this matches the repo’s non-negotiable GitHub App-first rule and the current roadmap slice.
  Date/Author: 2026-03-15 / Codex

- Decision: keep `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` optional and unused in this slice.
  Rationale: they are forward-looking for later OAuth or app-install flows, but M2.1 only needs app auth plus installation sync.
  Date/Author: 2026-03-15 / Codex

- Decision: use a single-process in-memory installation-token cache with expiry-aware refresh and a safety margin, and do not persist tokens in Postgres or Redis.
  Rationale: M2.1 only needs honest short-lived reuse inside one control-plane process. Persisting tokens would widen the security surface and conflict with the scope.
  Date/Author: 2026-03-15 / Codex

- Decision: make installation persistence additive by extending the existing `github_installations` table instead of adding a second installation table.
  Rationale: the repo already reserved that table for this purpose, so the smallest truthful schema move is to enrich it until it can store a real installation snapshot.
  Date/Author: 2026-03-15 / Codex

- Decision: return a typed `github_app_not_configured` HTTP error from the new installation routes when app credentials are missing.
  Rationale: the prompt requires an explicit machine-readable error rather than silent empty results or PAT fallback.
  Date/Author: 2026-03-15 / Codex

## Context and Orientation

Pocket CTO already has the mission spine, runtime approvals, and artifact placeholder work from M0 and M1.
The M2.1 gap is narrower and backend-first: Pocket CTO must first become a real GitHub App client before later webhook, repository-sync, or PR slices can build on top of it.

The existing repository state relevant to this slice is:

- `packages/config/src/index.ts` parses GitHub-related env vars but does not turn them into an executable M2.1 config boundary.
- `packages/db/src/schema/integrations.ts` defines placeholder `github_installations` and `repositories` tables.
- `apps/control-plane/src/bootstrap.ts` wires control-plane modules but has no GitHub App service.
- `apps/control-plane/src/app.ts` only registers the placeholder `/webhooks/github` route.
- `docs/ops/github-app-setup.md` and `docs/architecture/security-model.md` already commit the system to GitHub App auth, short-lived installation tokens, least privilege, and webhook-plus-reconcile as the long-term model.

The intended edit surface for this slice is:

- `plans/EP-0012-github-app-auth-and-installation-persistence.md`
- `packages/db/src/schema/integrations.ts`
- generated migration files under `packages/db/drizzle/`
- `apps/control-plane/src/bootstrap.ts`
- `apps/control-plane/src/app.ts`
- `apps/control-plane/src/lib/types.ts`
- `apps/control-plane/src/lib/http-errors.ts`
- new files under `apps/control-plane/src/modules/github-app/`:
  `config.ts`
  `types.ts`
  `errors.ts`
  `auth.ts`
  `token-cache.ts`
  `client.ts`
  `repository.ts`
  `drizzle-repository.ts`
  `service.ts`
  `schema.ts`
  `routes.ts`
- focused new specs under `apps/control-plane/src/modules/github-app/`
- `apps/control-plane/src/app.spec.ts`
- `apps/control-plane/src/bootstrap.spec.ts`
- `docs/ops/local-dev.md`
- `README.md` only if one short GitHub App setup note makes local discoverability better

This slice should not change `WORKFLOW.md`, stack packs, mission replay contracts, or approval behavior.
It does change GitHub App expectations in a concrete way:

- required now for live M2.1 sync: `GITHUB_APP_ID`, `GITHUB_APP_PRIVATE_KEY_BASE64`
- optional later: `GITHUB_WEBHOOK_SECRET`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`
- expected current GitHub App permissions: metadata read-only, with no webhook ingestion implemented yet in code
- expected current webhook subscriptions for later slices remain documented, but unused here

## Plan of Work

First, add the M2.1 bounded context under `apps/control-plane/src/modules/github-app/`.
That context should own config parsing, auth and JWT generation, token caching, GitHub transport, installation persistence, thin control-plane routes, and typed errors.
Routes must stay thin and only parse input, call the service, and serialize output.

Next, extend the existing `github_installations` schema additively so Pocket CTO can durably persist the fields required for a real installation snapshot.
At minimum that means storing installation id, app id, account login, account type, target type and id when available, suspended state when available, a permissions snapshot, and a sync timestamp.
No repository registry sync should be added yet.

Then, wire the new service into the control-plane bootstrap and app entrypoints.
The service should be able to list persisted installation summaries, sync them from GitHub using App auth, and mint installation access tokens through an honest single-process cache for later M2 slices.

Finally, add focused tests and docs.
The tests should cover GitHub App config parsing, private-key decoding and JWT auth helpers, token-cache reuse and refresh behavior, sync persistence from mocked GitHub responses, and route behavior when the app is configured versus unconfigured.
The docs should state exactly which env vars are required now, which remain optional, which permissions are currently expected, and that webhook handling still belongs to M2.2.

## Concrete Steps

Run these commands from the repository root as needed:

    pnpm db:generate
    pnpm db:migrate
    pnpm --filter @pocket-cto/control-plane test
    pnpm --filter @pocket-cto/control-plane typecheck
    pnpm --filter @pocket-cto/control-plane lint
    pnpm --filter @pocket-cto/web typecheck

If live GitHub App env is present after implementation, also run one narrow live acceptance path against the installed app and record:

- the number of installations returned by GitHub
- whether an installation for `616xold/pocket-cto` or the current account was persisted
- whether an installation access token was minted successfully
- token expiry metadata only, never the token value

Implementation order:

1. Keep this ExecPlan current with discoveries, decisions, and validation evidence.
2. Add the `modules/github-app/` bounded context with config, auth, token-cache, client, repository, service, schema, routes, and tests.
3. Extend `packages/db/src/schema/integrations.ts` additively and generate the migration.
4. Wire the GitHub App service into `bootstrap.ts`, `app.ts`, `lib/types.ts`, and app-level route tests.
5. Update `docs/ops/local-dev.md` and, if useful, add one short GitHub App note to `README.md`.
6. Run the required validation commands and record exact results here.
7. If credentials are available locally, run one live sync and record the installation count plus token-expiry metadata.

## Validation and Acceptance

Success for M2.1 is demonstrated when all of the following are true:

1. Pocket CTO can construct a GitHub App config only when `GITHUB_APP_ID` and `GITHUB_APP_PRIVATE_KEY_BASE64` are both present and valid.
2. The auth helper base64-decodes the private key into PEM, creates a valid RS256 app JWT, and uses it for GitHub App API calls.
3. `POST /github/installations/sync` fetches current installations from GitHub and upserts them into `github_installations`.
4. `GET /github/installations` returns persisted installation summaries from Postgres.
5. Missing app credentials return a machine-readable `github_app_not_configured` error instead of silent empty results or PAT fallback.
6. Installation access tokens are cached in memory by installation id, reused while still fresh, and refreshed before expiry using a safety margin.
7. No token value is persisted to the database.
8. No webhook ingestion, issue intake, repo sync, branch creation, or PR creation is added in this slice.
9. The local-dev documentation states the current required env vars, still-optional env vars, and the permissions or webhook expectations honestly.

Useful manual acceptance after implementation should look like:

    curl -i http://localhost:4000/github/installations
    curl -i -X POST http://localhost:4000/github/installations/sync

When GitHub App env is configured, the second call should report a persisted installation count and the first call should return durable installation summaries.
When GitHub App env is not configured, both routes should return the typed not-configured error.

## Idempotence and Recovery

The schema change must be additive.
If migration generation shows no changes beyond the intended installation-table enrichment, apply it and continue.
If the migration is wrong, fix the schema and regenerate rather than hand-editing partial DB state.

Installation sync should be safe to retry.
Repeated syncs should upsert the same installation rows by installation id, refresh their snapshot fields, and update `lastSyncedAt` without duplicating rows.
Because tokens are cached only in memory, a process restart should simply clear the cache and force the next token request to mint a new short-lived installation token.

Rollback is straightforward:
revert the new `modules/github-app/` files, the additive installation-table migration, the bootstrap and route wiring, and the docs together.
No long-lived secrets should need database cleanup because this slice does not persist access tokens.

## Artifacts and Notes

Initial M2.1 gap notes captured before implementation:

1. Existing GitHub placeholders:
   `packages/config/src/index.ts` and `.env.example` already parse and document `GITHUB_APP_ID`, `GITHUB_APP_PRIVATE_KEY_BASE64`, `GITHUB_WEBHOOK_SECRET`, `GITHUB_CLIENT_ID`, and `GITHUB_CLIENT_SECRET`.
2. Existing installation persistence placeholder:
   `packages/db/src/schema/integrations.ts` already defines `github_installations`, but only with `installation_id`, `account_login`, and `account_type`.
3. Existing GitHub route placeholder:
   `apps/control-plane/src/modules/github/webhook-routes.ts` exposes only a `202` placeholder for `/webhooks/github`.
4. Explicit current gap:
   there is no GitHub App config boundary, no runtime private-key decode, no app JWT logic, no installation sync service, no installation-token cache, and no installation debug routes.

Validation results and any live-installation evidence will be appended here as implementation proceeds.

Validation results captured after implementation:

- `pnpm db:generate`
  Result: generated additive migration `packages/db/drizzle/0006_naive_jimmy_woo.sql` on the first run, then reported `No schema changes, nothing to migrate` on the final validation pass.
- `pnpm --filter @pocket-cto/db build`
  Result: passed and refreshed the referenced DB package output after the schema change.
- `pnpm db:migrate`
  Result: passed on the final serial validation pass.
- `pnpm run db:migrate:ci`
  Result: passed and migrated both `pocket_cto` and `pocket_cto_test`, which the DB-backed control-plane suite still requires.
- `pnpm --filter @pocket-cto/control-plane test`
  Result: passed with 29 test files and 99 tests.
- `pnpm --filter @pocket-cto/control-plane typecheck`
  Result: passed.
- `pnpm --filter @pocket-cto/control-plane lint`
  Result: passed.
- `pnpm --filter @pocket-cto/web typecheck`
  Result: passed.

Live GitHub App smoke evidence captured after implementation:

- Environment detection:
  `.env` contained both `GITHUB_APP_ID` and `GITHUB_APP_PRIVATE_KEY_BASE64`, so the live path was exercised.
- Live sync summary:
  `installationCount = 1`
  `persistedCount = 1`
  `targetAccountPersisted = true`
  `targetInstallationId = 116452352`
- Live installation-token summary:
  `tokenMinted = true`
  `tokenExpiresAt = 2026-03-15T02:12:28Z`
- Live repository reachability spot-check:
  `repoAccessible = true` for `616xold/pocket-cto`
  `repositoryCount = 1`

## Interfaces and Dependencies

Important existing dependencies for this slice:

- `@pocket-cto/config` for raw env loading
- `@pocket-cto/db` and Drizzle for persistence
- `fastify` for control-plane routes
- `zod` for route and config validation
- Node built-ins `crypto` and `fetch` for JWT signing and GitHub API requests

Important new or expanded interfaces expected by the end of this slice:

- a GitHub App config parser that distinguishes configured versus unconfigured states
- a JWT auth helper for app-level GitHub requests
- an installation-token cache keyed by installation id
- a GitHub App client for listing installations and minting installation tokens
- a repository interface for listing and upserting persisted installation snapshots
- a service interface that powers `GET /github/installations` and `POST /github/installations/sync`

Environment variables for this slice:

- required for live sync now:
  `GITHUB_APP_ID`
  `GITHUB_APP_PRIVATE_KEY_BASE64`
- optional for later slices:
  `GITHUB_WEBHOOK_SECRET`
  `GITHUB_CLIENT_ID`
  `GITHUB_CLIENT_SECRET`

## Outcomes & Retrospective

M2.1 now lands as a real backend-first GitHub App slice instead of a placeholder.
Pocket CTO can authenticate as a GitHub App using `GITHUB_APP_ID` plus a runtime-decoded base64 private key, list current installations from GitHub, persist those installations durably in the existing `github_installations` table, and mint short-lived installation access tokens through an honest in-memory cache.

The new control-plane surface is intentionally small and thin.
`GET /github/installations` returns persisted installation summaries and `POST /github/installations/sync` refreshes those rows from GitHub.
When the app credentials are missing, both routes now return a typed `github_app_not_configured` error instead of silently falling back to PATs or empty results.

The installation persistence shape is additive and narrow:
the existing table now stores installation id, app id, account login, account type, target type and target id when available, suspended-at state, a permissions snapshot, and `lastSyncedAt` alongside the existing timestamps.
Repository membership, webhook-driven install or uninstall updates, and branch or PR work remain deferred to the next M2 slices.

The token-cache behavior is also intentionally honest for this milestone.
Tokens are cached in memory only, keyed by installation id, reused until a safety margin before expiry, and never persisted to Postgres.
That keeps the security surface narrow while giving later M2.2 and M2.3 work a real token source to build on.

There is still no replay or mission-evidence delta in this slice because M2.1 only adds GitHub App auth plus installation sync and does not yet change mission or task lifecycle.
That absence is intentional and documented rather than implicit.

M2.2 can now start cleanly.
Webhook ingestion can build on a real GitHub App config boundary, a durable installation model, and an installation-token path that is already modular and test-covered instead of having to invent those foundations inside the webhook slice itself.
