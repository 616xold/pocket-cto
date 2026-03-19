# EP-0025 - Index deterministic repository docs and stored doc sections in the repo-scoped twin

This ExecPlan is a living document. Keep `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` current.

## Purpose / Big Picture

After this slice, Pocket CTO can inspect one synced repository, discover the approved documentation files deterministically, extract durable heading facts, persist those facts into the repo-scoped twin, and return concise stored docs views through thin control-plane routes.
Operators will be able to trigger a repo-scoped docs sync, inspect the resulting sync run, and read stored doc files plus sections without rescanning the repository on every GET.

This plan covers roadmap submilestone `M3.5 docs and runbook indexing`, but this prompt intentionally implements only the first half: durable docs discovery and heading extraction.
It explicitly stops before runbook command extraction, freshness scoring, blast-radius answers, or redesigning the existing M3.2, M3.3, or M3.4 slices.

## Progress

- [x] (2026-03-19T14:06:40Z) Read the required repo instructions, roadmap, M3.2, M3.3, and M3.4 ExecPlans, the named skills, the requested twin or bootstrap files, and ran the required inspections `rg -n "README.md|START_HERE.md|WORKFLOW.md|AGENTS.md|docs/.*\\.md|runbook|smoke|validation|rollback|curl |pnpm |node " apps packages docs plans README.md START_HERE.md WORKFLOW.md AGENTS.md`, `git status --short`, and `git diff --name-only HEAD`.
- [x] (2026-03-19T14:06:40Z) Captured the required pre-coding `M3.5A docs indexing gap` note in-thread, confirming that the twin spine already provides repo-scoped sync runs, registry-backed targeting, truthful local source resolution, metadata targets, ownership targets, and stored CI/test views, but does not yet persist durable documentation files or sections.
- [x] (2026-03-19T14:06:40Z) Created EP-0025 before coding so the docs-indexing slice stays self-contained, additive, and resumable.
- [x] (2026-03-19T14:24:06Z) Implemented the M3.5A docs slice inside the twin bounded context: added deterministic approved-path docs discovery, a Markdown heading extractor with front-matter and fenced-code handling, a dedicated `docs-sync` path, stored docs and doc-sections formatters, thin docs routes, shared domain contracts, and focused route plus sync specs.
- [x] (2026-03-19T14:24:06Z) Added focused coverage proving discovery scope, deterministic heading extraction, truthful zero-doc sync success, rerun idempotence, and stored docs route responses; the narrow docs test ring passed before the repo-wide validation matrix.
- [x] (2026-03-19T14:24:06Z) Ran the full required validation matrix successfully: `pnpm db:generate`, `pnpm db:migrate`, `pnpm run db:migrate:ci`, `pnpm repo:hygiene`, `pnpm lint`, `pnpm typecheck`, `pnpm build`, `pnpm test`, and `pnpm ci:repro:current`.
- [x] (2026-03-19T14:24:06Z) Confirmed live GitHub App env was present through the local `.env`, synced GitHub installations plus the repository registry, and completed one real docs sync for `616xold/pocket-cto` from a temporary local checkout so the existing source resolver stayed truthful without product-side clone fallback.

## Surprises & Discoveries

- Observation: the current twin schema already supports this slice without a database migration because entity and edge `kind` are open text columns keyed by repo plus stable key.
  Evidence: `packages/db/src/schema/twin.ts` already persists generic `kind`, `stableKey`, JSON payload, and `sourceRunId` fields for entities and edges, and `apps/control-plane/src/modules/twin/drizzle-repository.ts` already maps unknown kinds to the legacy `"doc"` enum.

- Observation: the earlier M3.2, M3.3, and M3.4 slices already define the exact architectural pattern this slice should follow.
  Evidence: `metadata-sync.ts`, `ownership-sync.ts`, `workflow-sync.ts`, and `test-suite-sync.ts` already prove the repo-scoped extractor pattern of registry-backed repo targeting, truthful local source resolution, sync-run lifecycle persistence, idempotent upserts, and stored read routes.

- Observation: the current local-docs surface is limited to metadata summaries and operational docs; there is no stored route for documentation files or sections yet.
  Evidence: `apps/control-plane/src/modules/twin/routes.ts`, `apps/control-plane/src/modules/twin/service.ts`, and `packages/domain/src/twin.ts` expose metadata, ownership, workflows, test suites, and CI summaries, but no docs-sync or docs read contracts.

- Observation: the checked-in `WORKFLOW.md` starts with YAML front matter, so naive heading extraction would have produced bad section facts.
  Evidence: `WORKFLOW.md` begins with a front-matter block before the first visible heading, and the new docs parser needed an explicit front-matter skip path to keep `doc_section` extraction truthful.

- Observation: the real `616xold/pocket-cto` repository already yields a non-trivial docs surface under the approved discovery scope.
  Evidence: the final live docs sync for `616xold/pocket-cto` completed successfully with `docFileCount: 20`, `docSectionCount: 192`, and sync run id `0aad9bf9-0816-480f-9220-6f2ebcb4c5c9`.

## Decision Log

- Decision: implement docs indexing as a separate `docs-sync` path inside the twin bounded context instead of widening metadata sync.
  Rationale: the prompt explicitly says not to redesign M3.2, and the modular-architecture guard favors a dedicated sync module, formatter, and read-model surface for a new extraction domain.
  Date/Author: 2026-03-19 / Codex

- Decision: discover only root `README.md`, `START_HERE.md`, `WORKFLOW.md`, `AGENTS.md`, plus `docs/**/*.md`, in deterministic lexical order.
  Rationale: the prompt narrows discovery scope tightly, explicitly excludes `plans/**`, and requires the sync to succeed truthfully with zero docs when none of those files exist.
  Date/Author: 2026-03-19 / Codex

- Decision: extract headings with a deterministic line-based Markdown parser rather than a broader Markdown AST dependency.
  Rationale: this slice only needs durable heading facts, anchor-like ids, and short excerpts. A narrow line-based parser keeps behavior auditable, repo-scoped, rerunnable, and easy to test.
  Date/Author: 2026-03-19 / Codex

- Decision: persist `doc_file` entities keyed by repo plus relative path, and `doc_section` entities keyed by repo plus relative path plus deterministic ordinal-based section identity.
  Rationale: headings can repeat inside one file, so stable keys must stay unique and rerunnable even when heading text or heading paths collide.
  Date/Author: 2026-03-19 / Codex

- Decision: do not add replay events for this slice.
  Rationale: docs sync mutates twin state, not mission or task lifecycle state. The audit surface for this milestone is the persisted sync run plus stored doc entities, edges, and read routes.
  Date/Author: 2026-03-19 / Codex

- Decision: defer runbook command extraction entirely.
  Rationale: the prompt explicitly forbids widening into runbook command extraction in this pass, so this slice should stop after durable docs discovery and heading indexing.
  Date/Author: 2026-03-19 / Codex

- Decision: keep live proof as a route-driven temporary-checkout verification instead of adding a new checked-in smoke helper in this prompt.
  Rationale: the prompt requires one real docs sync result but does not require a reusable smoke command, and the narrowest compliant change is to verify through the existing app surface without expanding product or tooling scope.
  Date/Author: 2026-03-19 / Codex

## Context and Orientation

Pocket CTO exits M3.4 with a real repo-scoped twin bounded context under `apps/control-plane/src/modules/twin/`.
That bounded context already owns:

- registry-backed repository targeting through the GitHub App repository registry
- truthful local source resolution through `source-resolver.ts`
- durable sync-run lifecycle persistence
- idempotent entity upserts keyed by repo full name, kind, and stable key
- idempotent edge upserts keyed by repo full name, kind, and endpoints
- stored metadata, ownership, workflow, test-suite, and CI read routes

M3.5A should extend that same bounded context with a new extractor and stored read model for repository docs.
The implementation must stay repo-scoped, deterministic, and rerunnable.
The sync should scan only the approved docs surface for the exact synced repository resolved through the existing source resolver.

The relevant existing files and modules are:

- app wiring and service ports in `apps/control-plane/src/lib/types.ts`, `apps/control-plane/src/bootstrap.ts`, and `apps/control-plane/src/modules/twin/routes.ts`
- twin orchestration and persistence in `apps/control-plane/src/modules/twin/service.ts`, `repository.ts`, `drizzle-repository.ts`, and `types.ts`
- existing extractor patterns in `apps/control-plane/src/modules/twin/metadata-sync.ts`, `ownership-sync.ts`, `workflow-sync.ts`, and `test-suite-sync.ts`
- shared read-model contracts in `packages/domain/src/twin.ts`
- generic twin storage schema in `packages/db/src/schema/twin.ts`
- local operator documentation in `docs/ops/local-dev.md`

The expected new or expanded M3.5A files are:

- `plans/EP-0025-docs-and-runbook-indexing.md`
- `apps/control-plane/src/modules/twin/docs-discovery.ts`
- `apps/control-plane/src/modules/twin/docs-parser.ts`
- `apps/control-plane/src/modules/twin/docs-sync.ts`
- `apps/control-plane/src/modules/twin/docs-formatter.ts`
- `apps/control-plane/src/modules/twin/service.ts`
- `apps/control-plane/src/modules/twin/routes.ts`
- `apps/control-plane/src/modules/twin/schema.ts`
- `apps/control-plane/src/lib/types.ts`
- `packages/domain/src/twin.ts`
- focused twin docs specs under `apps/control-plane/src/modules/twin/`
- `docs/ops/local-dev.md`

This slice should preserve boundaries:

- `packages/domain` stays pure and adds only shared docs sync-result or read-model contracts
- `packages/db` remains unchanged unless implementation proves a schema extension is actually required
- `apps/control-plane/src/modules/twin/` owns docs discovery, heading extraction, persistence orchestration, and route formatting
- routes stay thin and must not scan the filesystem or parse Markdown inline

No new environment variables are expected.
No new GitHub App permissions or webhook subscriptions are expected.
`WORKFLOW.md` and stack packs should remain accurate without changes.

## Plan of Work

First, add deterministic docs discovery inside the twin bounded context.
The discovery module should look only for the approved root files and `docs/**/*.md`, ignore everything else, return relative paths in sorted order, and treat missing files or directories as a truthful empty result instead of a failure.

Next, add a small Markdown heading extractor that turns each discovered file into one `doc_file` entity and zero or more `doc_section` entities.
The file payload should include the relative path, a title fallback, heading count, and cheap file stats such as line count and size.
The section payload should include source file path, heading text, heading level, normalized anchor-like id, deterministic heading path or ordinal, and a short excerpt from the section body.

Then, implement `docs-sync` using the existing twin patterns.
The sync should resolve the repo through the registry plus the existing source resolver, create a sync run, persist `doc_file` and `doc_section` entities plus `repository_has_doc_file` and `doc_file_contains_section` edges, and complete truthfully with zero docs when no approved files exist.
Repeated runs must converge on the same stable keys instead of duplicating rows.

After persistence works, add stored docs read routes:

- `POST /twin/repositories/:owner/:repo/docs-sync`
- `GET /twin/repositories/:owner/:repo/docs`
- `GET /twin/repositories/:owner/:repo/doc-sections`

Those reads should use only stored twin state from the latest successful docs-sync snapshot, stay concise, and keep ordering deterministic and summary-shaped.

Finally, add focused tests, update the local-dev guide with the new docs routes, run the full required validation matrix, and, if live GitHub env is present, run one real docs sync for `616xold/pocket-cto` and record only safe summary fields.

## Concrete Steps

Run these commands from the repository root as needed:

    rg -n "README.md|START_HERE.md|WORKFLOW.md|AGENTS.md|docs/.*\\.md|runbook|smoke|validation|rollback|curl |pnpm |node " apps packages docs plans README.md START_HERE.md WORKFLOW.md AGENTS.md
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

    pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/twin/docs-sync.spec.ts src/modules/twin/docs-routes.spec.ts src/modules/twin/docs-discovery.spec.ts
    rg -n "docs-sync|doc_file|doc_section|repository_has_doc_file|doc_file_contains_section|/twin/repositories/.*/docs|/twin/repositories/.*/doc-sections" apps/control-plane/src packages/domain/src docs/ops/local-dev.md

If live GitHub env is present after implementation:

    curl -X POST http://localhost:4000/github/repositories/sync
    curl -X POST http://localhost:4000/twin/repositories/616xold/pocket-cto/docs-sync
    curl http://localhost:4000/twin/repositories/616xold/pocket-cto/docs
    curl http://localhost:4000/twin/repositories/616xold/pocket-cto/doc-sections

Record only the repo full name, doc file count, doc section count, and docs sync-run id.
Do not print secrets, tokens, or raw auth headers.

## Validation and Acceptance

Success for M3.5A is demonstrated when all of the following are true:

1. Docs sync uses the existing repository registry and the existing twin source resolver; it does not clone repositories or invent a second source-selection path.
2. Discovery scans only root `README.md`, `START_HERE.md`, `WORKFLOW.md`, `AGENTS.md`, plus `docs/**/*.md`, and excludes `plans/**` and eval-result surfaces.
3. When none of those approved docs exist, `POST /twin/repositories/:owner/:repo/docs-sync` succeeds truthfully, finishes the sync run as `succeeded`, and reports zero doc files and zero doc sections.
4. The docs slice persists `doc_file` and `doc_section` entities with deterministic stable keys.
5. The docs slice persists `repository_has_doc_file` and `doc_file_contains_section` edges with repo-scoped idempotent upserts.
6. `doc_file` payloads include at least relative path, title fallback, heading count, and cheap file stats such as line count or size.
7. `doc_section` payloads include at least source file path, heading text, heading level, normalized anchor-like id, heading path or ordinal, and a short body excerpt.
8. Heading extraction is deterministic across repeated runs of the same content.
9. Repeated docs syncs converge on the same doc-file and doc-section entity ids instead of duplicating them.
10. `GET /twin/repositories/:owner/:repo/docs` returns a concise stored docs view from the latest successful docs snapshot.
11. `GET /twin/repositories/:owner/:repo/doc-sections` returns concise stored section summaries from the latest successful docs snapshot.
12. The docs read routes stay thin and do not rescan the repository on read.
13. Focused tests prove discovery scope, deterministic heading extraction, truthful zero-doc sync success, rerun idempotence, and stored route responses.
14. `docs/ops/local-dev.md` documents the new docs-sync and docs read routes honestly, without claiming runbook extraction, freshness scoring, or blast-radius answers.
15. The full validation matrix plus `pnpm ci:repro:current` passes after the slice lands.

Human acceptance after implementation should look like:

    curl -i -X POST http://localhost:4000/twin/repositories/OWNER/REPO/docs-sync
    curl -i http://localhost:4000/twin/repositories/OWNER/REPO/docs
    curl -i http://localhost:4000/twin/repositories/OWNER/REPO/doc-sections
    curl -i http://localhost:4000/twin/repositories/OWNER/REPO/runs

For a synced repo with approved docs present, the sync route should return a completed run plus stored counts, the docs route should list stored doc files, and the doc-sections route should list stored headings with their source file and excerpt.
For a synced repo with no approved docs present, the sync route should still succeed truthfully with zero counts.

## Idempotence and Recovery

Docs sync must be safe to rerun.
Stable entity keys should keep doc-file and doc-section rows convergent across runs, and repo-scoped edges should upsert on the same repository-to-file and file-to-section relationships.
No delete pass is required in this slice beyond what is necessary to keep reruns coherent through latest-successful-run filtering.

If a sync fails midway, the run should still finish as `failed` with an error summary so operators can see what happened.
Retrying the same sync after fixing the local checkout or the offending Markdown file should create a new sync run and converge entities or edges on the same stable keys.

Safe rollback guidance:

- revert the new docs-sync modules, route additions, domain contracts, docs, tests, and this ExecPlan together
- do not delete existing twin rows; the persisted docs rows are additive and can remain inert if the code is rolled back
- no database rollback should be required unless implementation later proves a schema change is necessary

## Artifacts and Notes

Required pre-coding gap note captured in-thread:

1. Metadata, ownership, and CI/test extraction already provide repo registry context, manifests and directories, effective ownership over stored targets, workflows, jobs, test suites, and honest CI linkage.
2. Durable docs indexing is still missing deterministic discovery scope, stored doc-file and doc-section entities, stored docs read routes, and truthful zero-doc success behavior.
3. Planned edits include EP-0025, new twin docs modules and tests, shared domain contracts, thin route wiring, and `docs/ops/local-dev.md`.
4. The chosen strategy is deterministic approved-path discovery, line-based heading extraction, durable doc-file and doc-section persistence, and stored read routes based on the latest successful docs snapshot.

Validation results, live smoke evidence, exact changed files, and final safe summary fields will be appended here as work proceeds.

Validation results:

- `pnpm db:generate` passed with `No schema changes, nothing to migrate`.
- `pnpm db:migrate` passed.
- `pnpm run db:migrate:ci` passed.
- `pnpm repo:hygiene` passed.
- `pnpm lint` passed.
- `pnpm typecheck` passed after updating the `TwinServicePort` test doubles in `bootstrap.spec.ts` and `drizzle-service.spec.ts` with the new docs methods.
- `pnpm build` passed.
- `pnpm test` passed with `55` control-plane files and `218` control-plane tests green.
- `pnpm ci:repro:current` passed from a fresh temp worktree and finished with a clean-tree check.

Live proof result:

- repo full name: `616xold/pocket-cto`
- doc file count: `20`
- doc section count: `192`
- docs sync run id: `0aad9bf9-0816-480f-9220-6f2ebcb4c5c9`

Exact changed files in this slice:

- `plans/EP-0025-docs-and-runbook-indexing.md`
- `apps/control-plane/src/lib/types.ts`
- `apps/control-plane/src/modules/twin/routes.ts`
- `apps/control-plane/src/modules/twin/schema.ts`
- `apps/control-plane/src/modules/twin/service.ts`
- `apps/control-plane/src/modules/twin/docs-discovery.ts`
- `apps/control-plane/src/modules/twin/docs-parser.ts`
- `apps/control-plane/src/modules/twin/docs-sync.ts`
- `apps/control-plane/src/modules/twin/docs-formatter.ts`
- `apps/control-plane/src/modules/twin/docs-discovery.spec.ts`
- `apps/control-plane/src/modules/twin/docs-parser.spec.ts`
- `apps/control-plane/src/modules/twin/docs-sync.spec.ts`
- `apps/control-plane/src/modules/twin/docs-routes.spec.ts`
- `packages/domain/src/twin.ts`
- `docs/ops/local-dev.md`
- `apps/control-plane/src/bootstrap.spec.ts`
- `apps/control-plane/src/modules/orchestrator/drizzle-service.spec.ts`

## Interfaces and Dependencies

Important existing interfaces and dependencies for this slice are:

- `TwinService` in `apps/control-plane/src/modules/twin/service.ts`
- `TwinRepository` persistence methods in `apps/control-plane/src/modules/twin/repository.ts`
- repo targeting through `GitHubAppService.getRepository(...)` and `resolveWritableRepository(...)`
- truthful local checkout resolution through `TwinRepositorySourceResolver`
- shared twin contracts in `packages/domain/src/twin.ts`
- Fastify route registration in `apps/control-plane/src/modules/twin/routes.ts`
- Zod route and response schemas in `apps/control-plane/src/modules/twin/schema.ts`

Expected new docs interfaces:

- docs sync result schema and types in `packages/domain/src/twin.ts`
- stored docs and stored doc-sections view schemas and types in `packages/domain/src/twin.ts`
- deterministic docs discovery and heading extraction helpers under `apps/control-plane/src/modules/twin/`

No new environment variables are expected.
No new GitHub App permissions or webhook subscriptions are expected.
No new package dependency is expected unless heading extraction proves a standard-library parser insufficient.

## Outcomes & Retrospective

M3.5A now ships a truthful repo-scoped docs spine for the engineering twin.
Pocket CTO can deterministically discover the approved documentation files for a synced repository, extract durable heading facts, persist `doc_file` plus `doc_section` entities and their required edges, and serve stored docs views through thin routes.

The exact persisted entity kinds are `doc_file` and `doc_section`, with the existing shared `repository` entity upserted as the stable edge source when needed.
The exact persisted edge kinds are `repository_has_doc_file` and `doc_file_contains_section`.
The exact new routes are `POST /twin/repositories/:owner/:repo/docs-sync`, `GET /twin/repositories/:owner/:repo/docs`, and `GET /twin/repositories/:owner/:repo/doc-sections`.

The validation matrix is green, and live GitHub proof was captured successfully against `616xold/pocket-cto`.
What remains for the follow-up `M3.5B` slice is intentionally narrow: runbook-command extraction from the stored docs corpus, without reopening M3.2 through M3.5A boundaries or widening early into freshness scoring or blast-radius answers.
