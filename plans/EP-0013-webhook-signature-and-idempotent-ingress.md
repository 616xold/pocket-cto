# EP-0013 - Add webhook signature verification and idempotent ingress

This ExecPlan is a living document. Keep `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` current.

## Purpose / Big Picture

After this slice, Pocket CTO can accept real GitHub App webhook deliveries through `POST /github/webhooks`, verify that each delivery was actually signed by the configured GitHub App webhook secret, persist the ingress envelope durably, and update installation plus repository linkage state without using PATs or pretending that issue intake is already mission compilation.
The operator-visible proof remains intentionally backend-first and narrow: webhook deliveries get an honest ingress response, duplicate deliveries do not repeat side effects, installation events update persisted GitHub App state, and `issues` plus `issue_comment` deliveries are durably recorded as accepted ingress envelopes while explicitly stopping short of mission creation.

This plan covers roadmap submilestone `M2.2 webhook ingestion`.
It depends on the M2.1 GitHub App auth and installation persistence foundation from `plans/EP-0012-github-app-auth-and-installation-persistence.md`.
It does not implement issue-to-mission intake, repository registry sync beyond install-linkage updates, branch creation, pull request creation, approval cards, or web UI changes.

## Progress

- [x] (2026-03-15T01:27Z) Read the required repo docs, roadmap, security and replay guidance, M2.1 ExecPlan, local-dev guide, current GitHub App bounded-context files, DB schema, and control-plane wiring, then inspected the requested webhook-related ripgrep output plus clean `git status --short` and `git diff --name-only HEAD`.
- [x] (2026-03-15T01:27Z) Captured the M2.2 gap honestly: M2.1 already provides GitHub App config, JWT auth, installation token caching, and durable installation sync, but the webhook path is still a placeholder `202` route with no signature verification, no delivery idempotency ledger, and no event-specific installation or repository updates.
- [x] (2026-03-15T01:50Z) Added the new webhook ingress module under `apps/control-plane/src/modules/github-app/` with separate signature, schema, types, repository, drizzle repository, service, route, and focused spec files; wired the service into `bootstrap.ts`, `app.ts`, `lib/types.ts`, and `lib/http-errors.ts`; and extended the GitHub App repository plus service so installation and repository linkage updates reuse the M2.1 bounded context instead of bypassing it.
- [x] (2026-03-15T01:56Z) Extended `packages/db/src/schema/integrations.ts`, generated additive migrations `packages/db/drizzle/0007_smiling_ezekiel.sql` and `packages/db/drizzle/0008_glossy_ken_ellis.sql`, rebuilt `@pocket-cto/db`, and migrated both the development and test databases so the new delivery ledger and repository external-id column exist before DB-backed specs run.
- [x] (2026-03-15T02:02Z) Added focused tests for route-level signature and header handling, duplicate-delivery idempotency, installation-state updates, installation-repository linkage updates, and durable issue-envelope acceptance without mission creation, then updated local docs plus README discoverability notes.
- [x] (2026-03-15T02:03Z) Ran the required validation commands successfully: `pnpm db:generate`, `pnpm db:migrate`, `pnpm --filter @pocket-cto/control-plane test`, `pnpm --filter @pocket-cto/control-plane typecheck`, `pnpm --filter @pocket-cto/control-plane lint`, and `pnpm --filter @pocket-cto/web typecheck`.

## Surprises & Discoveries

- Observation: the working tree started clean, so this slice can treat every touched file and migration artifact as part of the milestone without having to route around unrelated local changes.
  Evidence: `git status --short` and `git diff --name-only HEAD` both returned no paths.

- Observation: the existing GitHub webhook route lives in `apps/control-plane/src/modules/github/webhook-routes.ts` and only returns a placeholder `202`, so the honest implementation should move webhook ingress into the already-active `github-app` bounded context rather than extending the deprecated placeholder.
  Evidence: `apps/control-plane/src/modules/github/webhook-routes.ts` and `apps/control-plane/src/app.ts`.

- Observation: the repository already has the right config placeholder for `GITHUB_WEBHOOK_SECRET`, but M2.1 still treated it as optional and unused.
  Evidence: `.env.example` and `packages/config/src/index.ts`.

- Observation: the existing `repositories` table can store installation linkage, repo full name, default branch, and language, but it currently lacks uniqueness guarantees and does not get updated by any webhook path.
  Evidence: `packages/db/src/schema/integrations.ts`.

- Observation: this slice changes GitHub integration state but not mission or task state, so replay events are not required as long as the delivery ledger itself remains durable and truthful about what was accepted.
  Evidence: `AGENTS.md` limits replay mandates to mission state or task lifecycle changes, and `docs/architecture/replay-and-evidence.md` scopes replay around mission narratives rather than every external integration row.

- Observation: Fastify’s default inherited JSON parser had to be removed inside the webhook route plugin so the route could reliably receive the exact raw request body as a `Buffer` for signature verification.
  Evidence: the initial webhook route specs returned `invalid_request` because the inherited parser produced a parsed body instead of raw bytes until `removeAllContentTypeParsers()` plus a route-local buffer parser were added in `webhook-routes.ts`.

- Observation: the first generated repository-id unique index was partial, which Postgres would not use for the repository upsert path as implemented.
  Evidence: `packages/db/drizzle/0007_smiling_ezekiel.sql` created a partial unique index, the repository-linkage spec then failed with `there is no unique or exclusion constraint matching the ON CONFLICT specification`, and `packages/db/drizzle/0008_glossy_ken_ellis.sql` replaced that index with a non-partial unique index while the repository code moved to explicit select-then-update or insert logic.

- Observation: no public webhook URL was available in the local environment during this slice.
  Evidence: `.env` still points `PUBLIC_APP_URL=http://localhost:3000` and `CONTROL_PLANE_URL=http://localhost:4000`, with no checked-in tunnel or public callback URL configured.

## Decision Log

- Decision: expose the real ingress route at `POST /github/webhooks` and stop wiring the old placeholder `/webhooks/github` route into the app.
  Rationale: the user explicitly required `POST /github/webhooks`, and keeping a single canonical path avoids ambiguous test and ops guidance.
  Date/Author: 2026-03-15 / Codex

- Decision: verify webhook signatures against the exact raw request body using `X-Hub-Signature-256` with `sha256=` HMAC and constant-time comparison.
  Rationale: GitHub signs the raw payload bytes, not the parsed JSON object, so any parsed-body comparison would be incorrect and would create false negatives or accidental acceptance bugs.
  Date/Author: 2026-03-15 / Codex

- Decision: require `X-GitHub-Delivery`, `X-GitHub-Event`, and `X-Hub-Signature-256`, and return machine-readable request errors for each missing or invalid condition.
  Rationale: the prompt requires explicit error codes for missing signature, bad signature, missing delivery id, and missing event name; keeping those as typed API errors makes the route truthful and easy to test.
  Date/Author: 2026-03-15 / Codex

- Decision: add a dedicated additive `github_webhook_deliveries` table keyed by `delivery_id` and use it as the idempotency barrier plus ingress envelope ledger.
  Rationale: the existing schema has no durable place to record accepted webhook deliveries, and reusing missions, replay, or artifacts would blur architecture boundaries and overstate the maturity of issue intake.
  Date/Author: 2026-03-15 / Codex

- Decision: respond with `202 Accepted` for a first-time delivery and `200 OK` with `duplicate: true` for a repeated delivery id that was already durably recorded.
  Rationale: a first-time request still represents ingress work being accepted, while a duplicate delivery is not new work and is more honestly represented as an already-recorded success.
  Date/Author: 2026-03-15 / Codex

- Decision: fully handle `installation` and `installation_repositories` inside the webhook service, but only durably persist `issues` and `issue_comment` envelopes without creating missions.
  Rationale: that is the exact scope of M2.2 in this prompt and keeps M2.3 clean instead of smuggling in issue-to-mission logic early.
  Date/Author: 2026-03-15 / Codex

- Decision: store a durable delivery ledger row only after the installation or repository side effects and the delivery finalization can commit together in one database transaction.
  Rationale: this keeps retries honest. A failed transaction leaves no half-recorded delivery behind, so GitHub redelivery can retry as a first attempt instead of being mistaken for a duplicate.
  Date/Author: 2026-03-15 / Codex

- Decision: keep unsupported but valid signed webhook event names as `ignored_event` ledger entries rather than hard-failing them.
  Rationale: M2.2 still needs narrow explicit handling for the four scoped events, but recording other signed deliveries as ignored is more truthful and safer than rejecting them after signature verification.
  Date/Author: 2026-03-15 / Codex

## Context and Orientation

Pocket CTO already has a working GitHub App auth and installation-sync bounded context under `apps/control-plane/src/modules/github-app/`.
That context can:

- parse GitHub App env via `config.ts`
- create app JWTs and installation tokens via `auth.ts`, `client.ts`, and `token-cache.ts`
- persist installation snapshots through `repository.ts`, `drizzle-repository.ts`, and `service.ts`
- expose debug routes through `routes.ts`

What it cannot do yet is accept webhooks honestly.
The currently wired webhook module is still the placeholder `apps/control-plane/src/modules/github/webhook-routes.ts`, which returns a fixed `202`.

The relevant persistence surfaces are:

- `packages/db/src/schema/integrations.ts` for `github_installations` and `repositories`
- `packages/db/src/schema/index.ts` and `packages/db/src/index.ts` for DB exports
- generated migration files under `packages/db/drizzle/`

The relevant control-plane integration points are:

- `apps/control-plane/src/bootstrap.ts` for service wiring
- `apps/control-plane/src/app.ts` for route registration
- `apps/control-plane/src/lib/types.ts` for container-facing service ports
- `apps/control-plane/src/lib/http-errors.ts` for typed API error mapping

The intended edit surface for this slice is:

- `plans/EP-0013-webhook-signature-and-idempotent-ingress.md`
- `README.md`
- `docs/ops/local-dev.md`
- `packages/db/src/schema/integrations.ts`
- `packages/db/src/schema/index.ts` if schema exports change
- `packages/db/src/index.ts` if top-level exports need refresh
- additive migration output under `packages/db/drizzle/`
- `apps/control-plane/src/app.ts`
- `apps/control-plane/src/bootstrap.ts`
- `apps/control-plane/src/lib/http-errors.ts`
- `apps/control-plane/src/lib/types.ts`
- the existing GitHub App module files that need new repository and service methods:
  `config.ts`
  `types.ts`
  `repository.ts`
  `drizzle-repository.ts`
  `service.ts`
- new webhook-specific files under `apps/control-plane/src/modules/github-app/`:
  `webhook-signature.ts`
  `webhook-types.ts`
  `webhook-schema.ts`
  `webhook-repository.ts`
  `webhook-drizzle-repository.ts`
  `webhook-service.ts`
  `webhook-routes.ts`
- focused tests under the same module plus app and bootstrap specs

This slice should update GitHub App expectations explicitly:

- `GITHUB_WEBHOOK_SECRET` becomes required for live webhook ingress
- required webhook headers become `X-GitHub-Delivery`, `X-GitHub-Event`, and `X-Hub-Signature-256`
- supported event types for stateful handling are only `installation` and `installation_repositories`
- supported event types for durable-but-no-mission ingress are `issues` and `issue_comment`
- issue-to-mission intake remains deferred to M2.3 or a later dedicated slice

## Plan of Work

First, create the new webhook bounded-context files under `apps/control-plane/src/modules/github-app/` so transport, signature verification, typing, persistence, and orchestration remain separate.
The route module must stay thin: read the raw body, parse the required headers, call the webhook service, and serialize the service result.

Next, add the smallest additive persistence needed for honest ingress.
That means a dedicated `github_webhook_deliveries` table keyed by GitHub delivery id, plus any small additive repository-table constraints needed so `installation_repositories` updates can be durable and repeat-safe.
The delivery table should store enough to reconstruct ingress truthfully: delivery id, event name, optional action, payload envelope, duplicate-safe processing markers, and timestamps.

Then, extend the existing GitHub App persistence surface so installation and repository linkage state can be updated from webhook payloads without inventing a second source of truth.
The GitHub App repository and service should own installation upserts, installation deletion or deactivation behavior, and repository linkage updates tied to installation events.

After that, wire the new webhook service into `bootstrap.ts` and `app.ts`, add typed HTTP errors for missing or invalid webhook requirements, and replace the placeholder route registration.

Finally, add focused tests and docs.
The tests should cover valid versus invalid signatures, duplicate delivery handling, DB-backed installation and repository updates from webhook payloads, and durable acceptance of `issues` and `issue_comment` without mission creation.
The docs should describe required headers, local webhook-testing workflow, and the safe redelivery story.

## Concrete Steps

Run these commands from the repository root as needed:

    pnpm db:generate
    pnpm db:migrate
    pnpm --filter @pocket-cto/control-plane test
    pnpm --filter @pocket-cto/control-plane typecheck
    pnpm --filter @pocket-cto/control-plane lint
    pnpm --filter @pocket-cto/web typecheck

During implementation, also use narrow inspection commands when needed:

    rg -n "webhook|delivery|signature|X-Hub-Signature-256|installation_repositories|issue_comment|issues" . packages apps docs plans
    git status --short
    git diff --name-only HEAD

If a public webhook URL is available after implementation, run one real GitHub App webhook delivery and record:

- event type
- delivery id
- signature verification result
- whether the delivery row was persisted
- whether redelivery returns the duplicate success shape without replaying side effects

## Validation and Acceptance

Success for M2.2 is demonstrated when all of the following are true:

1. `POST /github/webhooks` exists and rejects requests that are missing `X-Hub-Signature-256`, `X-GitHub-Delivery`, or `X-GitHub-Event` with machine-readable API errors.
2. A request with an invalid HMAC is rejected with a machine-readable bad-signature error.
3. A request with a valid HMAC is accepted and persisted in the delivery ledger exactly once per `X-GitHub-Delivery` value.
4. Repeating the same delivery id returns an honest duplicate success response and does not repeat installation or repository side effects.
5. `installation` events update persisted installation state through the M2.1 GitHub App bounded context.
6. `installation_repositories` events update persisted repository linkage state for the target installation.
7. `issues` and `issue_comment` deliveries are durably accepted as ingress envelopes but do not create missions.
8. The route implementation remains thin and testable, with signature verification and business behavior outside the route file.
9. The local-dev docs explain the required headers, a local tunnel or webhook testing path, and how to retry a delivery safely.

Useful manual acceptance after implementation should look like:

    curl -i http://localhost:4000/github/webhooks \
      -H 'content-type: application/json' \
      -H 'x-github-delivery: <uuid>' \
      -H 'x-github-event: installation' \
      -H 'x-hub-signature-256: sha256=<hmac>' \
      --data-binary @payload.json

The first valid delivery should return an accepted shape with `duplicate: false`.
Replaying the same delivery id should return a success shape with `duplicate: true` and unchanged side effects.

## Idempotence and Recovery

The schema changes must stay additive.
If migration generation shows unrelated changes, fix the schema and regenerate rather than hand-editing the generated output blindly.

Webhook ingress must be safe to retry.
The delivery ledger should insert the delivery row first and use the unique `delivery_id` constraint as the idempotency barrier.
Only the request that successfully records the delivery for the first time may execute side effects.
Duplicate requests should return the stored success shape without mutating installation or repository state again.

Safe recovery guidance:

- if signature verification fails because the secret is wrong, fix `GITHUB_WEBHOOK_SECRET` and resend from GitHub; do not bypass verification
- if a valid delivery fails before persistence, GitHub redelivery should behave like a first attempt
- if a valid delivery is persisted and later retried, the route should surface `duplicate: true`
- if the migration or route needs rollback, revert the webhook module wiring, the new delivery table migration, and the docs together

This slice must not add PAT fallback.

## Artifacts and Notes

Initial M2.2 gap notes captured before implementation:

1. Existing M2.1 capability:
   GitHub App config parsing, app JWT generation, installation token caching, installation sync routes, and durable `github_installations` persistence already exist under `apps/control-plane/src/modules/github-app/`.
2. Existing ingress gap:
   the only webhook route is `apps/control-plane/src/modules/github/webhook-routes.ts`, which always returns `202 Accepted` with a "later milestone" note.
3. Existing repo guidance:
   `docs/ops/github-app-setup.md` already says webhook signatures must be verified and webhook handling must be idempotent.
4. Requested M2.2 strategy:
   use `GITHUB_WEBHOOK_SECRET` for HMAC verification, record deliveries durably, update installation plus repository state for install events, and stop short of issue-to-mission intake.

Validation results and any live webhook evidence will be appended here as implementation proceeds.

Validation results captured after implementation:

- `pnpm db:generate`
  Result: first generated `packages/db/drizzle/0007_smiling_ezekiel.sql` for the delivery ledger plus repository external id, then generated `packages/db/drizzle/0008_glossy_ken_ellis.sql` to replace the initial partial repository-id unique index with a non-partial unique index after the repository-linkage test exposed the mismatch.
- `pnpm --filter @pocket-cto/db build`
  Result: passed after each schema update and refreshed the referenced DB package output for `apps/control-plane`.
- `pnpm run db:migrate:ci`
  Result: passed after both migrations and updated `pocket_cto` plus `pocket_cto_test`, which the DB-backed control-plane suite requires.
- `pnpm db:migrate`
  Result: passed.
- `pnpm --filter @pocket-cto/control-plane typecheck`
  Result: passed after older orchestrator harness stubs were updated to include the new `githubWebhookService` container port.
- `pnpm --filter @pocket-cto/control-plane test`
  Result: passed with 31 test files and 112 tests.
- `pnpm --filter @pocket-cto/control-plane lint`
  Result: passed.
- `pnpm --filter @pocket-cto/web typecheck`
  Result: passed.

Focused webhook evidence captured during implementation:

- Route-level webhook ingress:
  `pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/github-app/webhook-routes.spec.ts`
  Result: passed 7 tests covering valid signature acceptance, invalid signature rejection, missing-header errors, duplicate redelivery semantics, and the unconfigured-secret path.
- DB-backed webhook effects:
  `pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/github-app/webhook-service.spec.ts`
  Result: passed 4 tests covering duplicate-delivery idempotency, installation-state updates, installation-repository linkage updates, and issue-envelope persistence without mission creation.

Live webhook evidence:

- No public webhook URL was available in this environment, so no real GitHub App delivery or redelivery could be exercised honestly in this slice.

## Interfaces and Dependencies

Important dependencies for this slice:

- `@pocket-cto/config` for raw env loading
- `@pocket-cto/db` and Drizzle for persistence
- `fastify` for transport and request handling
- `zod` for payload and header validation
- Node built-in `crypto` for HMAC verification and constant-time comparison

Important interfaces expected by the end of this slice:

- a webhook signature verifier that accepts raw bytes plus header value and returns a typed verification result
- a webhook repository that durably records deliveries keyed by delivery id
- a webhook service that accepts the envelope, enforces idempotency, and dispatches narrow event handlers
- expanded GitHub App repository and service methods for applying installation snapshots and repository-linkage updates from webhook events
- typed API errors for missing delivery id, missing event name, missing signature, and bad signature

Expected environment and ops dependencies after this slice:

- `GITHUB_WEBHOOK_SECRET` must be configured for live webhook ingress
- a local tunnel or GitHub redelivery flow must preserve the raw JSON body and required headers
- GitHub App webhook subscriptions should include at least `installation`, `installation_repositories`, `issues`, and `issue_comment`

## Outcomes & Retrospective

Pocket CTO now has a truthful webhook ingress slice for M2.2.
`POST /github/webhooks` verifies the raw-body HMAC with `GITHUB_WEBHOOK_SECRET`, requires the key GitHub headers, and returns machine-readable request errors for missing or invalid signature requirements.
The first valid delivery persists into the new `github_webhook_deliveries` ledger and can update installation or repository state through the existing GitHub App bounded context.
Repeating the same delivery id returns success with `duplicate: true` and does not repeat side effects.

This slice also leaves M2.3 cleanly staged instead of half-started.
`installation` and `installation_repositories` are fully handled.
`issues` and `issue_comment` are durably accepted as ingress envelopes only.
No missions, branches, or PRs are created yet.

What remains after this slice:

- translate persisted issue and issue-comment envelopes into mission-intake logic in a later milestone
- build repository registry and richer repo sync beyond install-linkage deltas
- decide whether ignored signed webhook events should later become explicit handlers or remain ledger-only
