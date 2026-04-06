# Pocket CFO

Pocket CFO is an evidence-native finance discovery and decision system.

It is **not** a generic finance chatbot and it is **not** an autonomous accounting agent.
It turns messy finance questions and raw source bundles into typed finance missions, a persisted Finance Twin, a compiled CFO Wiki, and decision-ready evidence artifacts.

## Current repo state

This repository is in **pivot mode**.

The active guidance layer now describes **Pocket CFO**.
Some code, package names, database names, and legacy modules still say `pocket-cto`.
Treat those as migration scaffolding, not as product direction.
The control-plane spine stays; the domain substrate is what changes.

Read `docs/ACTIVE_DOCS.md` before trusting older plans or engineering-era docs.

## Product boundary for v1

Pocket CFO v1 is intentionally narrow:

- single company
- single operator
- single trust boundary
- manual-export and file-first ingest
- finance evidence first; GitHub is only an optional connector
- PWA-first operator surface
- Codex App Server as the coding/runtime seam
- no autonomous bank writes, accounting writes, tax filings, or legal advice
- no multi-tenant SaaS boundary in v1

## What is already decided

1. **Mission, replay, and proof stay.**
   The orchestration spine from Pocket CTO is still the most valuable part of the repo.

2. **Raw finance sources become the product boundary.**
   The primary source of truth is no longer a repository or PR flow.
   It is source files, documents, policies, definitions, exports, and derived structured state.

3. **The engineering twin becomes a Finance Twin.**
   Keep the twin engine pattern, but replace the ontology and query semantics.

4. **A compiled CFO Wiki sits beside the twin.**
   The twin is the machine-queryable layer.
   The CFO Wiki is the operator-readable markdown layer built from raw sources plus twin facts.

5. **GitHub is demoted to connector status.**
   Keep the integration patterns, but do not let GitHub define the product.

6. **Internal package scope stays stable for now.**
   Keep `@pocket-cto/*` until the finance vertical is implemented cleanly enough to justify a later rename.

## Working architecture planes

1. **Source Registry** for uploads, snapshots, checksums, provenance, and raw artifacts.
2. **Finance Twin** for deterministic structured entities, edges, freshness, and lineage.
3. **CFO Wiki** for compiled markdown pages, indexes, backlinks, and durable analysis notes.
4. **Mission Engine** for analysis, reporting, monitoring, diligence, and close/control work.
5. **Evidence & Output Layer** for answers, memos, packets, and appendices.
6. **Operator Surface** for ingest, review, approval, export, and tracked questions.

## Repository map

```text
.
├── AGENTS.md
├── PLANS.md
├── WORKFLOW.md
├── START_HERE.md
├── apps
│   ├── control-plane
│   └── web
├── docs
│   ├── ACTIVE_DOCS.md
│   ├── architecture
│   ├── archive
│   ├── benchmarks
│   └── ops
├── packages
│   ├── codex-runtime
│   ├── config
│   ├── db
│   ├── domain
│   ├── stack-packs
│   └── testkit
├── plans
│   ├── ROADMAP.md
│   ├── FP-0001-pocket-cfo-pivot-foundation.md
│   └── templates
└── .agents
    └── skills
```

## Immediate build order

1. Read `docs/ACTIVE_DOCS.md`.
2. Read `START_HERE.md`.
3. Read `AGENTS.md`.
4. Read `PLANS.md`.
5. Read `plans/ROADMAP.md`.
6. Start with `plans/FP-0001-pocket-cfo-pivot-foundation.md`.
7. Keep progress updates inside the active Finance Plan while working.
8. Do not delete legacy engineering modules until the finance replacement path exists and a smoke proves it.

## Local development

The repo still boots with the existing monorepo structure and internal package names.

```bash
cp .env.example .env
docker compose up -d
pnpm install
pnpm db:generate
pnpm db:migrate
pnpm dev
```

Use `docs/ops/local-dev.md` for the pivot-aware operating pattern.
During F0 the important success is that the repo becomes **Pocket CFO in its active docs and Codex guidance** without destabilizing the working codebase.

## North star

The hero behavior is:

> a founder or finance operator drops raw exports and documents into Pocket CFO, asks a typed finance question, and receives a cited answer, freshness posture, limitations, and a memo or packet that can survive outside chat.

Everything in this repository should push toward that behavior.
