# Add the F1D operator source inventory and ingest UI on top of F1A/F1B/F1C

## Purpose / Big Picture

This plan implements the next additive **F1 operator source inventory** slice for Pocket CFO.

The user-visible goal is to expose the already-merged F1A/F1B/F1C source-registry backend through the web app so an operator can browse registered sources, inspect source files and ingest runs, and trigger a truthful upload-plus-ingest workflow from the operator surface.
This slice also corrects the current web posture so Pocket CTO engineering intake and GitHub issue intake no longer present themselves as the main operator flow.

This is still F1 work only.
It does not add Finance Twin UI or writes, CFO Wiki UI, reports, monitoring, or general finance discovery UI.

## Progress

- [x] 2026-04-09T11:21:08Z Complete the required preflight: fetch `origin/main`, confirm the clean `codex/f1d-operator-source-inventory-ui-local-v1` branch state, verify `gh` auth, and confirm local Postgres plus object storage availability.
- [x] 2026-04-09T11:21:08Z Read the active repo guidance, roadmap, F0/F1A/F1B/F1C Finance Plans, and scoped AGENTS files; inspect the current web and source-module surfaces.
- [x] 2026-04-09T11:21:08Z Define the smallest truthful F1D shape: finance-first home copy, additive `/sources` inventory and `/sources/[sourceId]` detail pages, server-action-backed source registration and upload/ingest controls, and no required control-plane route changes.
- [x] 2026-04-09T11:30:50Z Implement the source inventory UI, detail UI, finance-first home posture, and narrow mission-page copy correction with reusable web components and API helpers.
- [x] 2026-04-09T11:30:50Z Add deterministic web tests for the new source pages, forms, and API helpers; confirm the web path stays truthful without requiring a control-plane route change.
- [x] 2026-04-09T11:36:05Z Run the required validation sequence and confirm a fully green ladder through the focused web tests, twin guard tests, `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm ci:repro:current`. Publication remains the only unfinished step.

## Surprises & Discoveries

- Observation: the existing control-plane source surface already exposes the F1A/F1B/F1C routes needed for source inventory, file inspection, and ingest-run inspection.
  Evidence: `apps/control-plane/src/modules/sources/routes.ts` already registers `/sources`, `/sources/:sourceId`, `/sources/:sourceId/files`, `/sources/files/:sourceFileId`, `/sources/files/:sourceFileId/ingest`, `/sources/files/:sourceFileId/ingest-runs`, and `/sources/ingest-runs/:ingestRunId`.

- Observation: `POST /sources` is truthful but manual because it requires initial snapshot metadata rather than a first-file upload.
  Evidence: `packages/domain/src/source-registry.ts` and `apps/control-plane/src/modules/sources/service.ts` model source creation as one source plus one initial snapshot summary.

- Observation: the current web home and missions surfaces still lead with Pocket CTO engineering mission language and GitHub issue intake copy.
  Evidence: `apps/web/app/page.tsx` and `apps/web/app/missions/page.tsx` currently headline engineering mission intake and GitHub issue envelopes as the main operator story.

## Decision Log

- Decision: keep F1D additive and prefer existing control-plane routes over new backend work.
  Rationale: the requested slice is an operator web surface on top of merged F1A/F1B/F1C, and the existing source routes already cover the required truthful read and ingest actions.

- Decision: do not add a control-plane convenience route unless implementation proves the existing web path cannot support a truthful operator workflow.
  Rationale: the user explicitly prefers route reuse and only permits a tiny additive backend route if it is strictly necessary.

- Decision: keep F1D fully web-side and expose manual source registration honestly instead of widening the control plane.
  Rationale: the existing source routes plus web server actions were sufficient for source inventory, raw-file upload, and ingest triggering, so the safer additive slice is to leave F1A/F1B/F1C backend behavior unchanged.

- Decision: the web source-registration form will remain explicit about its manual metadata contract.
  Rationale: the current `POST /sources` route creates a source plus initial snapshot summary; F1D should surface that honestly rather than pretend it already supports first-file source creation in one step.

- Decision: missions and GitHub issue intake remain present but secondary.
  Rationale: GitHub stays as a legacy connector and missions stay real product infrastructure, but F1D must remove engineering/GitHub-first operator framing from the home surface.

- Decision: replay and evidence behavior stay unchanged in this slice.
  Rationale: F1D is a web/UI slice over existing source-registry state; it should not claim new replay or evidence coverage beyond what F1A/F1B/F1C already persist.

## Context and Orientation

Pocket CFO is in the F1 source-registry and raw-ingest phase.
F1A shipped the generic source-registry foundation, F1B added immutable source files and provenance-backed raw ingest, and F1C added deterministic parser dispatch and durable ingest receipts.

This slice starts from fetched `origin/main` with those backend files present.
The relevant bounded contexts are:

- `apps/web/app/` for the home route, new source routes, and server actions
- `apps/web/components/` for focused source cards, file rows, ingest-run lists, status badges, and operator forms
- `apps/web/lib/api.ts` for reusable control-plane fetch and mutation helpers
- `apps/control-plane/src/modules/sources/` only if the existing backend proves insufficient after implementation attempts

GitHub connector work is explicitly out of scope except for preserving the existing legacy surfaces truthfully.
Finance Twin, CFO Wiki, reports, monitoring, approvals changes, and general finance discovery UI are out of scope.
No active-doc boundary changes are planned beyond keeping this Finance Plan current.

## Plan of Work

Implement this F1D slice in four bounded passes.

First, extend the web API client and add source-focused actions so the app can list sources, fetch source details plus file and ingest-run views, create a manual source record, upload raw bytes for an existing source, and trigger ingest from the web.
Second, build a small set of reusable source UI components and new `/sources` plus `/sources/[sourceId]` routes that keep loading, empty, limitation, and status states visible.
Third, pivot the home page from engineering-first intake to finance/source-ingest-first guidance, and apply only the smallest mission-page copy correction needed so it no longer reads as the primary engineering/GitHub workflow.
Fourth, add deterministic web tests and run the required validation ladder.

Keep route files thin, keep `apps/web` free of orchestration logic, and avoid any control-plane changes unless the web path cannot stay truthful otherwise.

## Concrete Steps

1. Create and maintain `plans/FP-0005-operator-source-inventory-ui.md` as the active F1D Finance Plan.

2. Extend `apps/web/lib/api.ts` with source-focused contracts and helpers for:
   - `GET /sources`
   - `GET /sources/:sourceId`
   - `POST /sources`
   - `POST /sources/:sourceId/files`
   - `GET /sources/:sourceId/files`
   - `GET /sources/files/:sourceFileId`
   - `POST /sources/files/:sourceFileId/ingest`
   - `GET /sources/files/:sourceFileId/ingest-runs`
   - `GET /sources/ingest-runs/:ingestRunId`

3. Add `apps/web/app/sources/actions.ts` for server actions that:
   - create a source via the existing manual snapshot contract
   - upload one raw file to an existing source
   - trigger ingest for an uploaded file
   - revalidate the relevant pages and redirect cleanly

4. Add new source routes under `apps/web/app/sources/`, likely:
   - `apps/web/app/sources/page.tsx`
   - `apps/web/app/sources/[sourceId]/page.tsx`

5. Add only the reusable source UI pieces needed under `apps/web/components/`, likely including:
   - source summary cards
   - source registration form
   - source file upload form
   - source file list rows
   - ingest-run list or run-history cards
   - any narrow formatters or status helpers needed to keep page files small

6. Update `apps/web/app/page.tsx` so the operator home leads with source inventory and ingest, not engineering mission or GitHub issue intake.

7. Update `apps/web/app/missions/page.tsx` only as needed to remove actively misleading engineering/GitHub-first product framing while keeping the real mission surface intact.

8. Add deterministic tests for:
   - source API helpers
   - source inventory page rendering
   - source detail page rendering
   - home-page finance-first framing
   - any new server-action helpers that can be tested deterministically without browser flakiness

9. If implementation proves one control-plane convenience route is strictly necessary, keep it additive and limited to the existing `modules/sources` boundary, then add the narrowest relevant backend test coverage.

10. Run validation in this exact order:

   ```bash
   pnpm --filter @pocket-cto/web exec vitest run app/page.spec.tsx app/sources/page.spec.tsx app/sources/[sourceId]/page.spec.tsx lib/api.spec.ts
   pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/twin/workflow-sync.spec.ts src/modules/twin/test-suite-sync.spec.ts src/modules/twin/codeowners-discovery.spec.ts
   pnpm lint
   pnpm typecheck
   pnpm test
   pnpm ci:repro:current
   ```

   If F1D needs a control-plane change, also run the narrowest relevant source-module tests and `pnpm ci:integration-db` if the backend change warrants it.

11. If and only if every required validation is green, create exactly one local commit:

   ```bash
   git commit -m "feat: add operator source inventory UI"
   ```

12. If green, confirm the branch name, show the requested git status/log commands, push `codex/f1d-operator-source-inventory-ui-local-v1`, verify the remote head, and create or report the PR into `main` with the requested title and body.

## Validation and Acceptance

Required validation commands, in order:

```bash
pnpm --filter @pocket-cto/web exec vitest run app/page.spec.tsx app/sources/page.spec.tsx app/sources/[sourceId]/page.spec.tsx lib/api.spec.ts
pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/twin/workflow-sync.spec.ts src/modules/twin/test-suite-sync.spec.ts src/modules/twin/codeowners-discovery.spec.ts
pnpm lint
pnpm typecheck
pnpm test
pnpm ci:repro:current
```

Run the narrowest source-module tests and `pnpm ci:integration-db` too if control-plane code changes.

Acceptance is met when all of the following are true:

- the web home no longer presents Pocket CTO engineering/GitHub intake as the main operator flow
- `/sources` exists and shows source inventory with latest snapshot summary and empty/error states honestly
- `/sources/[sourceId]` exists and shows source metadata, snapshot history, source files, and ingest-run history
- the operator can perform at least one truthful web ingest path using the existing backend, even if source registration remains manual metadata first
- status, limitations, and missing-data states remain visible rather than implied away
- no Finance Twin UI or writes were added
- no CFO Wiki, reports, or monitoring UI were added
- GitHub modules and the legacy connector path still compile unchanged
- deterministic web tests cover the new source pages and relevant API helpers

Replay, evidence, freshness, and limitation posture:
this slice surfaces existing source-registry and ingest statuses in the web UI, but it does not add new replay events, evidence bundles, Finance Twin freshness logic, or report-generation behavior.
Those limitations must remain explicit in copy and plan notes.

## Idempotence and Recovery

This slice is additive-first and safe to retry.

- Web-only retries are safe because the new pages and components do not mutate persisted state until an explicit server action runs.
- Re-running source creation through the manual registration form creates a new source record and should be treated as a deliberate new operator action, not a hidden retry.
- Re-running upload or ingest creates the same additive F1B/F1C effects the existing backend already models: a new uploaded file snapshot or a new ingest-run record.
- If a web action or page design proves misleading, restore the uncommitted web files and retry without touching the F1A/F1B/F1C backend.
- If a control-plane change becomes necessary and is wrong, revert only that additive source-module change and rerun the narrow targeted tests before rejoining the repo-wide validation ladder.

## Artifacts and Notes

Expected artifacts from this slice:

- one active F1D Finance Plan
- a finance-first operator home surface
- additive `/sources` and `/sources/[sourceId]` web routes
- reusable source inventory and ingest UI components
- deterministic web tests covering the new slice
- one clean commit, push, and PR only if validation is fully green

Documentation posture:
no broad docs rewrite is planned in this slice.
If implementation exposes a direct active-doc mismatch, keep the correction narrow and explicitly note it here.

## Interfaces and Dependencies

Package and runtime boundaries:

- `apps/web` must fetch through `apps/web/lib/api.ts` and not import `@pocket-cto/db`
- `apps/control-plane` remains the only owner of source persistence, storage, and ingest orchestration
- internal `@pocket-cto/*` package names stay unchanged

Runtime expectations:

- reuse the existing control-plane URL configuration in `apps/web/lib/api.ts`
- reuse the existing source-registry routes rather than creating parallel endpoints unless strictly necessary
- no new environment variables are expected

Upstream and downstream dependencies:

- upstream: F1A/F1B/F1C source-registry, source-file, and ingest-run APIs
- downstream: later F2/F3/F4/F5/F6 work will rely on this web surface staying truthful about what is and is not implemented

## Outcomes & Retrospective

This slice is in progress.

The web implementation now exists in the planned additive shape.
`/sources` and `/sources/[sourceId]` are implemented, the home surface now leads with source inventory and ingest rather than engineering/GitHub-first intake, and the mission page copy has been narrowed so missions remain available without presenting themselves as the primary F1 operator story.

Focused proof stayed green:
the targeted web vitest run covering `app/page.spec.tsx`, `app/sources/page.spec.tsx`, `app/sources/[sourceId]/page.spec.tsx`, and `lib/api.spec.ts` passed after tightening the source-create payload assertion to match the domain defaults emitted by `CreateSourceInputSchema`.

Repo-level validation also passed in the requested order:

- `pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/twin/workflow-sync.spec.ts src/modules/twin/test-suite-sync.spec.ts src/modules/twin/codeowners-discovery.spec.ts`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm ci:repro:current`

The main boundary risk remains the same but is now explicitly handled:
source creation is still a manual metadata contract in the backend, and F1D exposes that honestly instead of inventing a fake one-step first-file creation flow.

At this point the only remaining work is publication:
create the single requested commit, push `codex/f1d-operator-source-inventory-ui-local-v1`, and create or report the PR into `main`.
