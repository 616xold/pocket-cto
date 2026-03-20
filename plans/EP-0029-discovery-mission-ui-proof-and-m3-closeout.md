# EP-0029 - Close M3 with discovery mission operator intake, readable proof, and explicit exit evidence

This ExecPlan is a living document. Keep `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` current.

## Purpose / Big Picture

After this slice, Pocket CTO should stop treating discovery missions as a backend-only seam and start presenting them as an operator-complete M3 flow.
An operator should be able to create one deterministic discovery mission from the web surface, land directly on a mission detail page that clearly shows the stored discovery answer, rerun one packaged end-to-end smoke command, and inspect one checked-in M3 exit report that says plainly whether the repository evidence supports an explicit `M3 complete` state.

This plan covers the closeout slice for roadmap submilestone `M3.8 discovery mission formatter`.
It is intentionally narrow: it finishes the operator visibility, proof packaging, and milestone closeout work for discovery missions without widening into roadmap `M4`, redesigning the stored blast-radius backend, or changing discovery artifact semantics unless an actual bug is exposed.

## Progress

- [x] (2026-03-20T03:07:29Z) Read the required repo docs, roadmap, M3.2 through M3.8-adjacent ExecPlans, architecture references, the named skills, and the listed mission or web or proof files, then ran the required inspections `rg -n "discoveryAnswer|POST /missions/discovery|smoke:twin|m3 exit|blast-radius|auth_change|proof bundle|mission detail|operator home" apps packages docs plans package.json`, `git status --short`, and `git diff --name-only HEAD`.
- [x] (2026-03-20T03:07:29Z) Captured the required in-thread `M3.8B discovery mission operator gap` note before editing, confirming that the backend discovery spine already exists but the operator intake, readable mission-detail answer block, packaged M3 smoke, and explicit closeout evidence are still missing.
- [x] (2026-03-20T03:07:29Z) Created EP-0029 before coding so the new UI, proof, tests, and M3-exit acceptance bar stay explicit and resumable.
- [x] (2026-03-20T03:18:27Z) Added the additive mission-detail `discoveryAnswer` projection, shipped deterministic discovery-intake UI plus server-action and API wiring on the operator home and mission list surfaces, and added the packaged `tools/m3-discovery-mission-smoke.mjs` helper plus the root alias `pnpm smoke:m3-discovery:live`.
- [x] (2026-03-20T03:21:04Z) Closed the focused regression ring after fixing the `app.spec.ts` discovery-detail expectation and aligning the new mission-card fixtures with the actual discovery-answer domain schema.
- [x] (2026-03-20T03:25:13Z) Completed the full required validation matrix: `pnpm db:generate`, `pnpm db:migrate`, `pnpm run db:migrate:ci`, `pnpm repo:hygiene`, `pnpm lint`, `pnpm typecheck`, `pnpm build`, `pnpm test`, and `pnpm ci:repro:current`.
- [x] (2026-03-20T03:28:22Z) Ran the live packaged discovery smoke with a truthful `616xold/pocket-cto` checkout, refreshed all required twin slices through the real routes, produced a terminal discovery mission with a ready proof bundle, checked in `docs/ops/m3-exit-report.md`, and updated `plans/ROADMAP.md` to mark `M3` complete.

## Surprises & Discoveries

- Observation: the existing discovery backend already stores nearly the exact operator-facing data this slice needs.
  Evidence: `apps/control-plane/src/modules/evidence/discovery-answer.ts` already persists `repoFullName`, `questionKind`, `changedPaths`, `answerSummary`, impacted directories or manifests, owners, related suites or jobs, freshness, and limitations inside the durable `discovery_answer` artifact metadata.

- Observation: the current mission detail contract is still generic and does not project discovery-specific evidence even though the stored artifact is already summary-shaped.
  Evidence: `packages/domain/src/mission-detail.ts` and `apps/control-plane/src/modules/missions/detail-view.ts` expose approvals, approval cards, artifacts, and proof bundle, but no `discoveryAnswer` summary block.

- Observation: the current operator home and mission list are intentionally text-first and summary-shaped, so the safest way to finish M3 is to add one deterministic second intake card rather than redesign those pages.
  Evidence: `apps/web/app/page.tsx`, `apps/web/app/missions/page.tsx`, and `apps/web/components/mission-intake-form.tsx` already keep the UI compact and mobile-safe, with server actions that create a mission and redirect immediately into detail.

- Observation: the twin milestone closeouts already use a consistent route-driven packaged smoke-helper pattern that this slice should mirror instead of inventing ad hoc shell snippets.
  Evidence: `tools/twin-metadata-smoke.mjs`, `tools/twin-ownership-smoke.mjs`, `tools/twin-ci-smoke.mjs`, `tools/twin-freshness-smoke.mjs`, and `tools/twin-blast-radius-smoke.mjs` all boot the real app container, call existing routes, and print only safe summary fields.

- Observation: a shared local development database can contain older queued missions that starve a new live discovery smoke, even when the packaged helper itself is correct.
  Evidence: the first live smoke against the default local database created mission `17fc804c-afd1-4120-a66c-958d5d7d5a8f`, but that mission remained `queued` behind unrelated older work; rerunning the same helper against a fresh local Postgres database with the same GitHub App credentials and truthful source checkout succeeded immediately.

## Decision Log

- Decision: extend mission detail additively with one explicit `discoveryAnswer` summary block derived only from the persisted `discovery_answer` artifact.
  Rationale: the backend already stores the needed fields durably, and an additive read-model extension keeps the control-plane route thin while avoiding UI-side artifact parsing.
  Date/Author: 2026-03-20 / Codex

- Decision: keep the new operator intake deterministic and typed with `repoFullName`, `questionKind = auth_change`, and explicit `changedPaths`, submitted through a server action to the existing `POST /missions/discovery` route.
  Rationale: the prompt explicitly forbids natural-language discovery intake for this slice and asks for a narrow operator-complete path, not a new compiler surface.
  Date/Author: 2026-03-20 / Codex

- Decision: package the live proof as one dedicated `tools/m3-discovery-mission-smoke.mjs` helper plus one root script alias.
  Rationale: M3.2 through M3.7 already established the route-driven smoke-helper pattern as the honest, repeatable proof surface for twin milestones and closeouts.
  Date/Author: 2026-03-20 / Codex

- Decision: only update `plans/ROADMAP.md` to say `M3 complete` if the packaged smoke, stored proof bundle state, and checked-in exit report all support that wording truthfully.
  Rationale: the evidence-bundle guard requires closeout language to follow evidence, not optimism. If the evidence is incomplete, the report should say exactly why instead of forcing a milestone label.
  Date/Author: 2026-03-20 / Codex

## Context and Orientation

Pocket CTO exits EP-0028 with a working backend discovery-mission slice.
`POST /missions/discovery` already creates a truthful `manual_discovery` mission with one `scout` task, the orchestrator already executes that task through the stored twin blast-radius query instead of the Codex runtime, and successful runs already persist one durable `discovery_answer` artifact plus a refreshed proof bundle.

What is still missing is the operator-complete finish for roadmap `M3`.
The web operator surfaces still only create text missions.
The mission detail page still renders the generic proof and artifact chrome but does not lift the stored discovery answer into a clear summary block.
There is no packaged end-to-end discovery mission smoke helper yet.
There is also no checked-in M3 exit report that states the exact discovery proof posture and whether the repo has actually reached `M3 complete`.

The relevant files and modules are:

- discovery mission intake and detail read-model seams in `apps/control-plane/src/modules/missions/schema.ts`, `routes.ts`, `service.ts`, and `detail-view.ts`
- durable discovery artifact parsing in `apps/control-plane/src/modules/evidence/discovery-answer.ts`
- shared mission-detail contracts in `packages/domain/src/mission-detail.ts`
- operator actions and API client helpers in `apps/web/app/missions/actions.ts` and `apps/web/lib/api.ts`
- operator surfaces in `apps/web/app/page.tsx`, `apps/web/app/missions/page.tsx`, and `apps/web/app/missions/[missionId]/page.tsx`
- mission-detail presentation in `apps/web/components/mission-card.tsx`
- existing smoke-helper pattern under `tools/`
- operator docs in `docs/ops/local-dev.md`
- milestone reporting in `docs/ops/m3-exit-report.md` and `plans/ROADMAP.md`

This slice should preserve boundaries:

- `packages/domain` stays pure and carries only the additive mission-detail summary contract
- `apps/control-plane/src/modules/missions/` owns mission-detail shaping, not web presentation logic
- `apps/web` stays read-model and server-action only, with no direct database access
- the existing GitHub App repository registry and stored twin routes remain the only truthful repo and twin integration path
- replay and artifact behavior should stay unchanged unless a real bug forces a targeted fix

No new database schema, environment variables, webhook subscriptions, or GitHub App permissions are expected.
`WORKFLOW.md` should remain accurate because this slice adds operator visibility and proof packaging, not a new runtime or policy surface.

## Plan of Work

First, add an additive discovery-answer summary contract to mission detail.
Project the stored `discovery_answer` artifact metadata into one explicit `discoveryAnswer` field on the mission detail view.
Keep the summary shaped for operators: repo full name, question kind, changed paths, answer summary, impacted directories, impacted manifests, owners or explicit unowned notes, related test suites, related mapped CI jobs, freshness rollup, and limitations.
This should come from the existing durable artifact metadata only.

Next, add the operator intake surface without widening the backend.
Create one compact deterministic discovery-intake form component for the web app, wire it through a new server action and thin API helper to the existing `POST /missions/discovery` route, and place it on the operator home and mission list surfaces beside the existing text-intake path.
Successful submits should revalidate the list surfaces and redirect to `/missions/:missionId`.

Then, render discovery answers clearly in mission detail.
Extend the mission-detail card with a dedicated discovery evidence section that stays summary-shaped and mobile-safe.
Stale, missing, or failed twin limitations must remain prominent rather than buried inside generic proof-bundle notes.

After that, add a repeatable packaged proof helper and the closeout docs.
Create `tools/m3-discovery-mission-smoke.mjs`, wire a root alias such as `smoke:m3-discovery:live`, load env safely, call the real discovery route, poll mission detail until the mission terminals, and print only safe summary fields.
Update `docs/ops/local-dev.md` with the exact command and its truthful proof posture.
Create or update `docs/ops/m3-exit-report.md` with the required counts and identifiers, then tighten `plans/ROADMAP.md` only if the evidence really supports an explicit `M3 complete`.

Finally, add focused tests, keep this ExecPlan updated, run the full required validation matrix, and collect live discovery evidence if the local GitHub App env is present.

## Concrete Steps

Run these commands from the repository root as needed:

    rg -n "discoveryAnswer|POST /missions/discovery|smoke:twin|m3 exit|blast-radius|auth_change|proof bundle|mission detail|operator home" apps packages docs plans package.json
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

    pnpm --filter @pocket-cto/control-plane exec vitest run src/app.spec.ts src/modules/missions/service.spec.ts src/modules/orchestrator/service.spec.ts
    pnpm --filter @pocket-cto/web exec vitest run app/missions/actions.spec.ts app/missions/page.spec.tsx components/mission-card.spec.tsx lib/api.spec.ts
    rg -n "discovery|discoveryAnswer|manual_discovery|MissionCard|submitDiscovery|m3-exit" apps/web apps/control-plane/src packages/domain/src docs plans tools

If live GitHub env is present after implementation:

    curl -X POST http://localhost:4000/github/repositories/sync
    pnpm smoke:m3-discovery:live -- --repo-full-name 616xold/pocket-cto --changed-path apps/control-plane/src/modules/github-app/auth.ts
    pnpm smoke:m3-discovery:live -- --repo-full-name 616xold/pocket-cto --changed-path apps/control-plane/src/modules/github-app/auth.ts --source-repo-root /absolute/path/to/pocket-cto

Record only safe fields: repo full name, mission id, artifact id, proof-bundle status, impacted manifest count, owner count, related test-suite count, related mapped CI job count, freshness rollup, limitation count, and any explicit proof mode label.
Do not print secrets, tokens, or raw auth headers.

## Validation and Acceptance

Success for this M3 closeout slice is demonstrated when all of the following are true:

1. One deterministic discovery-intake form exists on the operator home and-or `/missions` surface.
2. The form accepts only `repoFullName`, `questionKind`, and `changedPaths`, and this slice supports only `questionKind = auth_change`.
3. Submitting the form uses a server action or thin API helper to call `POST /missions/discovery`.
4. Successful discovery submits redirect directly to `/missions/:missionId` and revalidate the mission list surfaces.
5. Mission detail exposes one explicit `discoveryAnswer` summary block derived from the persisted `discovery_answer` artifact only.
6. The mission-detail discovery block clearly shows repo full name, question kind, changed paths, answer summary, impacted directories, impacted manifests, owners or unowned note, related test suites, related mapped CI jobs, freshness rollup, and limitations.
7. Stale or missing twin posture is prominent in the discovery block and is not hidden inside generic proof-bundle wording.
8. The packaged smoke helper loads env safely, accepts repo full name plus changed paths, optionally accepts a truthful source repo root, creates a real discovery mission through the real route, polls mission detail until terminal, and prints only safe summary fields.
9. `docs/ops/local-dev.md` documents the exact packaged discovery smoke command honestly.
10. `docs/ops/m3-exit-report.md` records the exact smoke inputs and the required mission, artifact, proof, freshness, ownership, manifest, CI, suite, and limitation counts.
11. Focused tests prove discovery intake redirect behavior, discovery-detail rendering, and truthful proof-tooling or docs reflection without regressing the existing text-intake, issue-intake, build, or operator flows.
12. `plans/ROADMAP.md` says `M3 complete` only if the evidence in the exit report and smoke output supports that claim truthfully.

Human acceptance after implementation should look like:

    pnpm dev
    open http://localhost:3000/
    create a discovery mission from the typed intake card
    confirm the browser redirects to /missions/<mission-id>
    confirm the mission detail page shows the stored discovery answer clearly
    pnpm smoke:m3-discovery:live -- --repo-full-name 616xold/pocket-cto --changed-path apps/control-plane/src/modules/github-app/auth.ts
    open docs/ops/m3-exit-report.md

The operator should be able to create, inspect, and prove the discovery slice without reading raw database rows or assembling evidence manually.

## Idempotence and Recovery

The UI and read-model changes are additive and safe to retry.
If a submit action fails before the backend returns, no partial web-side state should be persisted.
The packaged smoke helper should be safe to rerun because it creates a fresh discovery mission each time and reads terminal state through the existing mission-detail route.

Safe rollback guidance:

- revert the new mission-detail contract, detail-view shaping, web intake form, actions, API helper, mission-detail rendering, smoke helper, docs updates, and this ExecPlan together
- do not delete any successful discovery missions or artifacts created during local proof runs; they are audit evidence
- if the final evidence is not strong enough for `M3 complete`, keep the code and docs but leave the roadmap wording conservative rather than forcing a broader rollback

## Artifacts and Notes

Required pre-coding gap note captured in-thread:

1. The backend already provides a typed discovery mission route, a non-runtime execution path, a durable `discovery_answer` artifact, and discovery-aware proof readiness.
2. What is still missing is operator creation from the web surface, clear mission-detail rendering of the stored answer, a packaged end-to-end smoke helper, and an explicit M3 exit report.
3. Planned edits are constrained to the new ExecPlan, additive mission-detail contracts, web forms or actions or rendering, one smoke helper, focused tests, and closeout docs.
4. The chosen strategy is a typed discovery form plus additive mission-detail summary projection, a route-driven packaged smoke, and one evidence-backed M3 exit report that only marks the roadmap complete if the proof supports it.

Replay and evidence implications:

- discovery mission replay and artifact behavior should remain unchanged for this slice
- the new operator surface should expose existing evidence more clearly, not invent new hidden workflow rules
- the durable evidence surface for closeout is the stored `discovery_answer` artifact, the refreshed mission detail view, focused tests, the packaged smoke output, the local-dev docs, this ExecPlan, and `docs/ops/m3-exit-report.md`

Validation results, changed files, smoke output, and the final M3-completion statement will be appended here as work proceeds.

## Interfaces and Dependencies

Important types, functions, modules, libraries, and environment variables for this slice:

- `CreateDiscoveryMissionInputSchema`, `DiscoveryMissionQuestionSchema`, and blast-radius contracts in `packages/domain/src`
- `readDiscoveryAnswerArtifactMetadata(...)` in `apps/control-plane/src/modules/evidence/discovery-answer.ts`
- `buildMissionDetailView(...)` in `apps/control-plane/src/modules/missions/detail-view.ts`
- `MissionDetailViewSchema` in `packages/domain/src/mission-detail.ts`
- server actions in `apps/web/app/missions/actions.ts`
- web API helpers in `apps/web/lib/api.ts`
- existing operator identity and form components in `apps/web/components/`
- `buildApp()` and local `.env` loading patterns used by existing smoke helpers in `tools/`
- current GitHub App env documented in `docs/ops/local-dev.md`; no new env vars are expected

## Outcomes & Retrospective

UI strategy shipped:

- one compact typed `DiscoveryMissionIntakeForm` now appears on both the operator home and `/missions`
- the form posts through a server action plus thin API helper to `POST /missions/discovery`
- successful submits redirect directly to `/missions/:missionId`
- mission detail renders the stored `discoveryAnswer` through a dedicated summary-shaped `DiscoveryAnswerCard`

Proof and evidence outcome:

- packaged helper: `pnpm smoke:m3-discovery:live`
- live proof mode used for closeout: `refreshed_live_state`
- truthful source checkout: `/tmp/pocket-cto-source-gXy9Gv` resolving to `616xold/pocket-cto`
- closeout mission id: `c8c98c5f-5c8b-4278-af33-b1a52a554603`
- closeout artifact id: `c0ff006f-057b-4c18-9f11-7b9b9c7ac801`
- closeout proof-bundle status: `ready`
- freshness rollup: `fresh`
- impacted manifest count: `1`
- owner count: `0`
- related test-suite count: `1`
- related mapped CI job count: `0`
- limitation count: `3`

Validation results:

- `pnpm db:generate` passed
- `pnpm db:migrate` passed
- `pnpm run db:migrate:ci` passed
- `pnpm repo:hygiene` passed
- `pnpm lint` passed
- `pnpm typecheck` passed after trimming invalid fixture-only fields from the new discovery-answer spec
- `pnpm build` passed
- `pnpm test` passed
- `pnpm ci:repro:current` passed on a clean detached worktree snapshot

Changed-file set for the slice:

- `apps/control-plane/src/app.spec.ts`
- `apps/control-plane/src/modules/missions/detail-view.ts`
- `apps/control-plane/src/modules/missions/discovery-answer-view.ts`
- `apps/control-plane/src/modules/missions/m3-closeout-docs.spec.ts`
- `apps/control-plane/src/modules/orchestrator/service.spec.ts`
- `apps/web/app/globals.css`
- `apps/web/app/missions/[missionId]/page.tsx`
- `apps/web/app/missions/actions.spec.ts`
- `apps/web/app/missions/actions.ts`
- `apps/web/app/missions/page.spec.tsx`
- `apps/web/app/missions/page.tsx`
- `apps/web/app/page.spec.tsx`
- `apps/web/app/page.tsx`
- `apps/web/components/discovery-answer-card.tsx`
- `apps/web/components/discovery-mission-intake-form.tsx`
- `apps/web/components/mission-card.spec.tsx`
- `apps/web/components/mission-card.tsx`
- `apps/web/lib/api.spec.ts`
- `apps/web/lib/api.ts`
- `docs/ops/local-dev.md`
- `docs/ops/m3-exit-report.md`
- `README.md`
- `package.json`
- `packages/domain/src/mission-detail.ts`
- `plans/EP-0029-discovery-mission-ui-proof-and-m3-closeout.md`
- `plans/ROADMAP.md`
- `tools/m3-discovery-mission-smoke.mjs`

Final milestone statement:

The repository now truthfully reaches `M3 complete`.
It is clean to move to `M4` because the M3 exit criteria are covered by operator-visible UI, durable discovery-answer rendering, repeatable packaged proof, focused regression coverage, full repo validation, and one real live discovery mission with a ready proof bundle.
