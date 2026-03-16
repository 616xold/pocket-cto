# EP-0018 - Ship the M2 operator home and mission list

This ExecPlan is a living document. Keep `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` current.

## Purpose / Big Picture

After this slice, Pocket CTO stops forcing the operator to jump straight into a known mission id or a demo shell.
The web app will have a real operator home, a real `/missions` page, and a minimal text-intake path that creates a mission and redirects directly into the existing mission-detail flow.
The control plane will expose a real `GET /missions` summary read model so the operator can see recent missions, status, proof-bundle posture, and lightweight approval or PR context without loading the full mission-detail payload for every card.

This work covers roadmap submilestone `M2.7 web UI mission list and mission detail`, but this slice is intentionally narrower than the full milestone name.
It ships the mission list and operator-home half only.
It does not add GitHub issue intake, widen into M3 discovery surfaces, or redesign the existing mission detail page.

## Progress

- [x] (2026-03-16T01:01Z) Read the required repo docs, adjacent M2 ExecPlans, replay and local-dev guidance, the current mission control-plane and web surfaces, and the named skills, then ran the requested inspections `rg -n "getMissionDetail|/missions/:missionId|POST /missions/text|Open mission detail shell|MissionCard|getMissionDetail" apps packages docs`, `git status --short`, and `git diff --name-only HEAD`.
- [x] (2026-03-16T01:01Z) Captured the M2.7 gap before coding: mission detail and text mission creation already exist, but there is still no summary-shaped mission-list API, no shared list contract, no `/missions` page, and no operator-home intake flow that drops naturally into mission detail.
- [x] (2026-03-16T01:14Z) Added the shared mission-list contract under `packages/domain`, extended the mission bounded context with an additive `listMissions(...)` read path plus thin `GET /missions`, and kept mission detail untouched.
- [x] (2026-03-16T01:14Z) Replaced the static web root with an operator home, added a real `/missions` page, shipped reusable summary cards and a tiny text-intake form, and wired the intake server action to the existing `POST /missions/text` backend with redirect-to-detail behavior.
- [x] (2026-03-16T01:14Z) Added focused list-route, repository, service, API-client, summary-card, page-render, and intake-action tests; the narrow control-plane and web vitest suites now pass before the full validation matrix.
- [x] (2026-03-16T01:18Z) Ran the required validation matrix end to end: `pnpm db:generate`, `pnpm db:migrate`, `pnpm run db:migrate:ci`, `pnpm repo:hygiene`, `pnpm lint`, `pnpm typecheck`, `pnpm build`, `pnpm test`, and `pnpm ci:repro:current` all completed successfully.
- [x] (2026-03-16T01:21Z) Performed one manual smoke flow through the rendered web surface by submitting the `/missions` intake form with `curl` in progressive-enhancement mode; the response redirected to `/missions/8b93319b-9c32-4cd2-8b5d-c9327d8a20c9`, the new mission appeared first on the mission list, and the existing detail page rendered correctly for that mission.

## Surprises & Discoveries

- Observation: the current root page is still a static shell and points at a `demo-mission` fallback instead of a durable operator entrypoint.
  Evidence: `apps/web/app/page.tsx` and `apps/web/app/missions/[missionId]/page.tsx`.

- Observation: the existing mission detail contract already contains enough evidence posture to support a compact list card without introducing new persistence tables.
  Evidence: `packages/domain/src/mission-detail.ts`, `apps/control-plane/src/modules/missions/detail-view.ts`, and `docs/architecture/replay-and-evidence.md`.

- Observation: the requested `git status --short` and `git diff --name-only HEAD` checks were clean before this slice began.
  Evidence: both commands returned no output.

- Observation: in-memory mission creation can land multiple rows in the same millisecond, so using UUIDs as the tie-breaker for “newest-first” would make the test and local in-memory ordering dishonest.
  Evidence: the first narrow route and service tests produced reversed order even though the second mission had been created later, because the original in-memory list sort broke timestamp ties with random UUIDs.

- Observation: `pnpm dev:embedded` still started the control-plane in `api_only` mode in this local environment even though the web operator-home and mission-list smoke flow worked correctly.
  Evidence: the dev logs reported `controlMode":"api_only"` during the manual smoke run, and the mission detail page showed the existing live-control-unavailable banner.

## Decision Log

- Decision: add a separate mission-list read model contract instead of overloading `MissionDetailView`.
  Rationale: the list surface needs compact summary fields, not the full detail payload, and the repo rules explicitly prefer explicit contracts over one oversized shared shape.
  Date/Author: 2026-03-16 / Codex

- Decision: keep `GET /missions` thin and summary-shaped with newest-first ordering, one explicit default limit, and only light `status`, `sourceKind`, and `limit` filters.
  Rationale: that satisfies the operator-home use case without smuggling orchestration logic or dense query semantics into the route.
  Date/Author: 2026-03-16 / Codex

- Decision: reuse the existing `POST /missions/text` backend for the new web intake flow and add the redirect in a web server action.
  Rationale: the text mission creation spine already emits the required persistence, replay, and placeholder evidence, so M2.7 should reuse it instead of introducing a second intake path.
  Date/Author: 2026-03-16 / Codex

- Decision: keep the root page as a lightweight operator home with recent-mission preview and put the fuller list surface at `/missions`.
  Rationale: that gives the operator a natural landing page without bloating `/` into a dashboard, and it keeps the existing mission-detail page as the only evidence-heavy drill-down.
  Date/Author: 2026-03-16 / Codex

- Decision: in the in-memory repository, preserve latest insertion order when mission `createdAt` timestamps tie instead of using UUIDs as a fallback.
  Rationale: UUID ordering is unrelated to creation time, while preserving insertion order keeps the local newest-first contract honest in tests and in-memory app instances.
  Date/Author: 2026-03-16 / Codex

## Context and Orientation

Pocket CTO already has the backend and UI halves of mission detail.
On the backend, `MissionService.createFromText(...)` compiles text into a mission, persists tasks, appends replay events, and creates a placeholder proof bundle.
`MissionService.getMissionDetail(...)` then joins the mission, tasks, artifacts, proof bundle, and approvals into the current operator detail read model.
Those behaviors flow through the mission bounded context in `apps/control-plane/src/modules/missions/`, with persistence in `repository.ts` and `drizzle-repository.ts`, transport in `routes.ts`, and presentation mapping in `detail-view.ts`.

On the web side, `apps/web/lib/api.ts` already parses `GET /missions/:missionId`, and `apps/web/app/missions/[missionId]/page.tsx` renders the existing mission detail card plus operator actions.
The root page is still a static landing shell that fetches `/health` and links to a demo mission.

The missing seam is a list summary boundary that both control-plane and web can share.
This slice should add:

- an additive domain contract under `packages/domain/src/`
- a repository query that can return newest-first mission summaries without loading full details
- a thin `GET /missions` route in the mission module
- a web API client for that route
- a reusable mobile-safe mission summary card or list component
- a tiny text-intake form that posts to the existing text-intake endpoint and redirects to `/missions/[missionId]`
- docs that explain how to use the new operator-home path locally

The intended edit surface for this slice is:

- `plans/EP-0018-mission-list-and-operator-home.md`
- `packages/domain/src/mission-list.ts`
- `packages/domain/src/index.ts`
- `apps/control-plane/src/lib/types.ts`
- `apps/control-plane/src/modules/missions/schema.ts`
- `apps/control-plane/src/modules/missions/routes.ts`
- `apps/control-plane/src/modules/missions/service.ts`
- `apps/control-plane/src/modules/missions/repository.ts`
- `apps/control-plane/src/modules/missions/drizzle-repository.ts`
- `apps/control-plane/src/modules/missions/drizzle-repository.spec.ts`
- `apps/control-plane/src/modules/missions/service.spec.ts`
- `apps/control-plane/src/app.spec.ts`
- `apps/control-plane/src/bootstrap.spec.ts`
- `apps/web/lib/api.ts`
- `apps/web/lib/api.spec.ts`
- `apps/web/app/page.tsx`
- `apps/web/app/missions/page.tsx`
- `apps/web/app/missions/actions.ts`
- `apps/web/app/missions/actions.spec.ts`
- `apps/web/components/mission-list-card.tsx`
- `apps/web/components/mission-list-card.spec.tsx`
- `apps/web/components/mission-list.tsx`
- `apps/web/app/globals.css`
- `docs/ops/local-dev.md`
- `README.md`

This slice should preserve existing boundaries:

- the mission route stays thin and does not own SQL
- the new list contract lives in `packages/domain`, not in app-local types
- the web app keeps using the control-plane API and does not import DB code
- text intake continues to use the existing mission creation spine, so replay and proof-bundle placeholder behavior stay truthful without new hidden side effects
- no GitHub App auth, token, webhook, or permission behavior should change in this slice

## Plan of Work

First, define a compact mission-list contract in the domain package.
That contract should expose the fields the operator list actually needs: mission identity, title, objective excerpt, mission status, source kind, optional source ref, primary repo, created and updated timestamps, latest task status and role when available, proof-bundle status, pending approval count, PR number and URL when present, and any other clean additive summary counts such as approval-card count.

Next, extend the mission bounded context with a dedicated list-summary read path.
The repository layer should expose a summary query for newest-first mission rows with an explicit default limit and optional `status`, `sourceKind`, and `limit` filters.
The service should own the read-model assembly and normalize defaults.
The route should parse input, call the service, and return the typed summary payload.

Then, add the operator-home and mission-list UI surfaces in the web app.
The root page should stop behaving like a static landing screen and become a practical operator home that points naturally into the mission list flow.
`/missions` should render concise, mobile-safe cards instead of a dense table and link each card to `/missions/[missionId]`.
The list UI should stay summary-shaped and avoid duplicating the detail page.

After that, add the minimal text-intake UI.
Use a tiny server action that posts a single text field to the existing text-intake backend and redirects to the created mission detail page.
No mission compiler redesign or complex client state is needed.

Finally, add focused tests and docs, then run the requested validation matrix.
If local execution remains possible, perform one manual web intake flow and record the created mission id plus whether it appeared on the mission list and opened correctly in mission detail.

## Concrete Steps

Run these commands from the repository root as needed:

    rg -n "getMissionDetail|/missions/:missionId|POST /missions/text|Open mission detail shell|MissionCard|getMissionDetail" apps packages docs
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

    pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/missions/service.spec.ts src/modules/missions/drizzle-repository.spec.ts src/app.spec.ts
    pnpm --filter @pocket-cto/web exec vitest run lib/api.spec.ts components/mission-list-card.spec.tsx app/missions/actions.spec.ts
    rg -n "MissionDetailView|approvalCards|proofBundle|sourceKind|updatedAt" packages/domain apps/control-plane apps/web

If local manual execution is possible after implementation:

1. start the stack with `docker compose up -d`
2. run `pnpm dev` or `pnpm dev:embedded`
3. create one mission from the new web intake surface
4. record the mission id, whether it appeared in `/missions`, and whether `/missions/<id>` opened correctly

## Validation and Acceptance

Success for this M2.7 slice is demonstrated when all of the following are true:

1. `GET /missions` exists and returns a dedicated summary-shaped payload rather than the full mission-detail contract.
2. Mission summaries are ordered newest-first.
3. The route enforces an explicit default limit and honors any implemented `status`, `sourceKind`, and `limit` filters.
4. Each summary includes at least mission id, title, objective excerpt, mission status, source kind, primary repo, created and updated timestamps, proof-bundle status, and the latest task status and role when available.
5. Pending approval count and PR number or URL appear when that evidence already exists.
6. The web app exposes a real `/missions` page with concise mobile-safe cards that link into `/missions/[missionId]`.
7. The root page becomes a usable operator home that points naturally into the mission-list flow instead of the old static shell.
8. A minimal text-intake form exists on the home or list surface, calls the existing text-intake backend, and redirects to the created mission detail page.
9. Focused tests cover the new control-plane route shape, ordering, filters if implemented, the web API client parsing, mission-list card rendering, and text-intake redirect behavior.
10. Replay and evidence remain truthful: this slice reuses the existing text-intake replay sequence and proof-bundle placeholder rather than inventing a parallel mission-creation side channel.

## Idempotence and Recovery

This slice should stay additive.
No schema migration is expected because the mission-list route should derive its summary from existing mission, task, artifact, approval, and proof-bundle data.
If implementation starts to require persistence changes, stop and narrow scope before widening the milestone.

The list read model should be deterministic for the same persisted state.
The text-intake web action should be safe to retry manually; duplicate submissions can still create duplicate missions, but they should do so honestly through the existing text-intake backend rather than through hidden client-only state.

Rollback is straightforward:
revert the mission-list domain contract, the new repository and service methods, the `GET /missions` route wiring, the web operator-home and list components, the intake server action, the focused tests, and the doc updates together.

## Artifacts and Notes

Initial M2.7 gap notes captured before implementation:

1. Existing backend surfaces:
   `POST /missions/text` and `GET /missions/:missionId` already exist.
2. Existing web surfaces:
   mission detail exists, but `/` still links to `demo-mission` and there is no `/missions`.
3. Existing evidence posture:
   text-intake mission creation already persists replay plus a placeholder proof bundle, so the new intake UI should reuse that backend path.
4. Existing GitHub integration posture:
   no new GitHub App permissions or webhook expectations are needed for this slice because the list only reads already-persisted PR and repo evidence.

Validation results, manual checks, and final route-shape notes will be appended here as implementation proceeds.

Implemented route and UI shape notes:

- `GET /missions` now returns `{ missions, filters }`
- the shared contract lives in `packages/domain/src/mission-list.ts`
- each mission card summary includes id, title, objective excerpt, mission status, source kind, source ref, primary repo, created and updated timestamps, latest task summary when present, proof-bundle status, pending approval count, and PR number or URL when present
- the root page now acts as the operator home, while `/missions` is the dedicated full list surface

Validation results:

- `pnpm db:generate` passed with no schema diff to apply.
- `pnpm db:migrate` passed.
- `pnpm run db:migrate:ci` passed.
- `pnpm repo:hygiene` passed.
- `pnpm lint` passed.
- `pnpm typecheck` passed after tightening one typed-route link and updating test doubles for the new `listMissions(...)` service dependency.
- `pnpm build` passed and emitted the new `/missions` route in the Next.js output.
- `pnpm test` passed.
- `pnpm ci:repro:current` passed and reported `CI reproduction succeeded`.

Manual smoke notes:

- Submitted the rendered `/missions` intake form via progressive-enhancement POST with the text `Manual smoke mission list intake 2026-03-16 01:21Z`.
- The web response returned `303 See Other` with `Location: /missions/8b93319b-9c32-4cd2-8b5d-c9327d8a20c9`.
- `GET /missions` then returned that mission first, confirming newest-first ordering for the new item.
- The `/missions` web page rendered the new summary card at the top of the list.
- The `/missions/8b93319b-9c32-4cd2-8b5d-c9327d8a20c9` detail page loaded the existing mission detail view correctly.
- The local run still reported `api_only` control mode, so live approval-resolution and interrupt actions remained unavailable during this smoke run.

## Interfaces and Dependencies

Important existing types and modules for this slice:

- `MissionRecord`, `MissionStatus`, and `MissionSourceKind` in `packages/domain/src/mission.ts`
- `MissionDetailView` and approval-card types in `packages/domain/src/mission-detail.ts`
- proof-bundle types in `packages/domain/src/proof-bundle.ts`
- `MissionService`, `MissionRepository`, and `DrizzleMissionRepository` in `apps/control-plane/src/modules/missions/`
- `buildMissionDetailView(...)` in `apps/control-plane/src/modules/missions/detail-view.ts`
- `buildApp(...)` and container typing in `apps/control-plane/src/app.ts`, `apps/control-plane/src/lib/types.ts`, and `apps/control-plane/src/bootstrap.ts`
- web data fetching in `apps/web/lib/api.ts`
- mission detail rendering in `apps/web/app/missions/[missionId]/page.tsx`

No new environment variables are expected.
No new GitHub App permissions, token behaviors, or webhook subscriptions are expected.
No new replay event type is expected because the list route is read-only and the intake form should reuse the existing `POST /missions/text` lifecycle.

## Outcomes & Retrospective

This slice shipped the missing M2 operator-home spine without widening into M3.
Pocket CTO now has an additive `GET /missions` summary route, a dedicated shared mission-list contract, a real `/missions` page, and a practical root operator home that can create a mission from text and redirect directly into the existing detail page.

The implementation stayed within the mission bounded context and web read-model boundary:
routes remained thin, the summary contract stayed separate from `MissionDetailView`, and the web UI used concise cards instead of forcing the full detail payload into the list surface.
Replay and evidence posture stayed truthful because the new intake flow reuses the existing `POST /missions/text` lifecycle instead of introducing a parallel mission-creation path.

The requested validation matrix passed in full, and the manual smoke flow confirmed that the web intake creates a real mission, the mission appears on the list, and the detail drill-down still works.
The operator home now feels complete enough for M2's mission-list slice, with one notable follow-up outside this slice: the local `pnpm dev:embedded` path still surfaced `api_only` control mode during the smoke run, so live detail-page controls remain an adjacent runtime issue rather than something introduced here.
