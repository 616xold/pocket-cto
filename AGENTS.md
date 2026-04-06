# Pocket CFO repository instructions for Codex

You are working on **Pocket CFO**, an evidence-native finance discovery and decision system.

Read this file before doing any work.
For non-trivial work, also read `docs/ACTIVE_DOCS.md`, `PLANS.md`, `plans/ROADMAP.md`, and the active Finance Plan in `plans/`.

## Non-negotiable working rules

1. **Prefer modular code.**
   Do not collapse transport, domain logic, persistence, formatting, and prompt assembly into one file.
   Soft cap: keep most source files below 300 logical lines.
   Split early.

2. **Use a Finance Plan for meaningful work.**
   If a task spans multiple files, touches more than one package, or is likely to take more than 45 minutes, create or update a `plans/FP-*.md` plan before coding.
   Follow `PLANS.md` exactly.

3. **Finance evidence is the source of truth.**
   Raw source files, source snapshots, checksums, provenance, freshness posture, and derived twin state matter more than chat convenience.
   Never treat a model answer as the source of truth.

4. **Raw sources are immutable.**
   Do not silently rewrite uploaded exports, PDFs, or source documents.
   Derived artifacts belong in the twin, wiki, reports, or evidence layers.

5. **GitHub is an optional connector, not the product center.**
   Do not let repo or PR semantics leak into the primary Pocket CFO path.
   Keep GitHub-specific logic isolated behind connector boundaries.

6. **Preserve architecture boundaries.**
   - `packages/domain`: pure contracts, schemas, shared finance mission and artifact types
   - `packages/db`: persistence schema and DB helpers only
   - `packages/codex-runtime`: Codex App Server protocol wrapper only
   - `packages/config`: env parsing and runtime config
   - `packages/stack-packs`: pack interfaces and manifests
   - `packages/testkit`: fixtures and reusable test helpers
   - `apps/control-plane`: sources, missions, orchestrator, replay, evidence, finance twin, wiki, reports, monitoring
   - `apps/web`: operator UI and read models only

7. **Routes stay thin.**
   HTTP route files should parse input, call a service, and serialize output.
   They should not contain SQL, ingest logic, finance math, or prompt-building.

8. **Database changes are additive first.**
   Avoid destructive schema changes unless the active Finance Plan names them explicitly and includes recovery guidance.

9. **Replay and evidence are mandatory.**
   Any mission state change or meaningful ingest/report action needs replay or an explicit recorded reason why it does not.

10. **Freshness and limitations are first-class.**
    If a result depends on stale, partial, inferred, or conflicting evidence, say that plainly in code, docs, and outputs.
    Do not hide uncertainty.

11. **Do not claim unfinished finance capabilities as implemented.**
    The active docs define direction.
    The code defines current reality.
    When those differ, state the gap honestly and implement through the active plan.

12. **No hidden policy.**
    If a workflow rule matters, encode it in code, config, `WORKFLOW.md`, or a checked-in doc.
    Do not rely on ephemeral prompt memory.

13. **Ship the evidence spine before cleverness.**
    Source registry, Finance Twin, replay, approvals, evidence bundles, and durable outputs matter more than glossy chat behavior.

14. **Do not cross the product safety boundary.**
    No autonomous bank writes, ledger writes, tax filings, legal advice, or external communication releases without explicit human approval and a named plan.

15. **When uncertain, narrow scope instead of diluting the design.**
    Prefer one strong finance slice over three half-built surfaces.

## Definition of done for any slice

A slice is not done until all of the following are true:

- code exists in the right module boundaries
- tests exist for the touched behavior
- the active Finance Plan is updated
- the active docs are updated if behavior or workflow changed
- acceptance is observable by a human
- replay implications are covered
- mission-facing outputs expose provenance, freshness posture, and limitations when relevant

## Modular code preferences

Use these patterns by default:

- `routes.ts` or `controller.ts` for transport
- `schema.ts` for validation
- `service.ts` for orchestration or domain logic
- `repository.ts` for persistence
- `formatter.ts` for operator summaries and evidence formatting
- `events.ts` for replay or outbox events

If a bounded context grows, make a folder and split by responsibility instead of extending one file forever.

## Default implementation preferences

- TypeScript strict mode
- Zod for external input validation
- Drizzle ORM for database schema and queries
- Fastify for control-plane HTTP endpoints
- Next.js App Router for the web UI
- Pino for logs
- OpenTelemetry hooks from the beginning
- Postgres as the state source of truth
- S3-compatible artifact storage
- file-first finance ingestion before API connector sprawl
- Codex App Server as the narrow runtime seam
- deterministic extraction before freeform generation

## Commands

```bash
pnpm install
pnpm dev
pnpm lint
pnpm typecheck
pnpm test
pnpm check
pnpm db:generate
pnpm db:migrate
docker compose up -d
```

## Skills in this repo

Skills live in `.agents/skills`.

Use them deliberately:

- `$execplan-orchestrator` for any complex slice or refactor
- `$modular-architecture-guard` when implementing or refactoring code
- `$source-provenance-guard` when touching source ingest, lineage, or freshness
- `$cfo-wiki-maintainer` when compiling or maintaining the markdown knowledge layer
- `$evidence-bundle-auditor` when shipping answers, reports, approvals, or proof logic
- `$github-app-integration-guard` only for GitHub connector work

## Files you should usually read before large changes

- `docs/ACTIVE_DOCS.md`
- `README.md`
- `START_HERE.md`
- `PLANS.md`
- `plans/ROADMAP.md`
- current active `plans/FP-*.md`
- `docs/ops/source-ingest-and-cfo-wiki.md`
- `docs/ops/local-dev.md`
- `docs/ops/codex-app-server.md`
- `docs/ops/github-app-setup.md` only if connector work is in scope

Historical Pocket CTO material such as `plans/EP-*.md` and the old M2/M3 exit reports may still exist temporarily, but they are **reference only** and must not be treated as active product scope.

## Forbidden shortcuts

Avoid these unless the active Finance Plan explicitly approves them:

- using GitHub as the default product source of truth
- mutating raw source files instead of creating derived artifacts
- answering finance questions from chat context alone
- deleting legacy engineering modules before the replacement path exists
- one giant route or service file that owns everything
- route handlers talking directly to the database
- a repo-wide internal namespace rename during the pivot foundation phase
- auto-releasing external memos or packets without a review path

## Reporting progress

At each stopping point:

- update the active Finance Plan `Progress` section
- record design changes in the `Decision Log`
- note surprises that affect scope or sequence
- state exactly what remains
- mention any archive or active-doc boundary changes you made

## Repo-specific north star

The compelling proof point is not “an AI that sounds like a CFO.”

It is:

> raw finance evidence becomes a persisted, freshness-aware decision system that can answer a question, explain its limitations, and produce a durable artifact another human can review outside chat.
