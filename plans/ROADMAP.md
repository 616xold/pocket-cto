# Pocket CFO roadmap

This roadmap replaces the old engineering-centric milestone story with a finance-specific sequence that Codex can follow cleanly.

## Build philosophy

Preserve the strongest spine from Pocket CTO:

- typed missions
- replay
- approvals
- evidence bundles
- operator-facing read models
- Codex runtime seam

Change the product boundary:

- finance evidence becomes source truth
- the engineering twin becomes a Finance Twin
- docs/runbooks indexing becomes the CFO Wiki
- GitHub becomes an optional connector

## F0 — Pivot foundation, naming, and source-registry bridge

Goal:
Turn the repo into a Pocket CFO repo at the active-doc and workflow layer without breaking CI or Codex implementation flow.

Focus:

- tag the current engineering product as `pocket-cto-m3-final`
- rewrite root docs and active guidance
- establish active-vs-archive boundaries
- introduce the generic source-registry concept in guidance
- define finance mission types and artifact language

Exit criteria:

- repo boots and CI stays green under Pocket CFO terminology
- active docs no longer depend on GitHub-first product assumptions
- the next slice can start from a clean finance-oriented plan

## F1 — Source registry and raw ingest

Goal:
Create a trustworthy ingestion layer for finance data and documents.

Focus:

- source, source snapshot, and provenance models
- file-first upload and object storage path
- ingest status and parser dispatch
- operator source inventory

Exit criteria:

- a user can register finance source truth
- every raw file has identity, checksum, type, and ingest status

## F2 — Finance Twin v1

Goal:
Replace engineering twin semantics with a finance twin that can support real questions.

Focus:

- finance entity and edge kinds
- deterministic extractors for core source families
- freshness and stale-state posture
- source-to-entity lineage
- finance summary and query routes

Exit criteria:

- one source bundle produces a persisted Finance Twin snapshot
- summary routes expose fresh/stale posture clearly

## F3 — CFO Wiki compiler

Goal:
Add a twin-grounded compiled markdown knowledge layer beside the Finance Twin.

Pocket CFO F3 is **not** a generic RAG layer and **not** a second truth graph.
The authority model stays fixed:

- raw sources remain authoritative for document claims
- the Finance Twin remains authoritative for structured finance facts
- the CFO Wiki is compiled and derived from those two layers

The wiki contract for F3 is:

- compiler-owned pages, not freely edited source-of-truth pages
- mandatory `index.md` and `log.md`
- explicit page refs and backlinks
- explicit evidence classes:
  - `twin_fact`
  - `source_excerpt`
  - `compiled_inference`
  - `ambiguous`
- explicit temporal status:
  - `current`
  - `historical`
  - `superseded`
- deterministic page skeletons and evidence gathering first, constrained synthesis second

Long-document deep read for PDF-heavy finance documents is intentionally deferred beyond the shipped F3A-through-F3D backbone, not treated as a day-one dependency or a blocker before F4.
Vector search and a vector DB are also deferred concerns, not first-slice requirements.

Focus:

- twin-grounded wiki page generation
- compiler-owned page registry and compile runs
- index and log maintenance
- backlinks, page refs, and later wiki linting
- deterministic export and later filing of durable mission outputs back into the wiki

Slice map:

- `F3A — CFO Wiki foundation and page registry`
  - new wiki bounded context
  - compile runs
  - page registry
  - page links
  - page refs
  - deterministic pages:
    - `index.md`
    - `log.md`
    - `company/overview.md`
    - `periods/<periodKey>/index.md`
    - `sources/coverage.md`
  - compile from Finance Twin state and source inventory only
  - no broad document synthesis yet

- `F3B — document page compiler, backlinks, and doc-aware pages`
  - markdown or plain-text document handling from stored raw bytes
  - source digest pages
  - deterministic extract-backed document pages
  - explicit backlinks and related-page graph
  - unsupported PDFs, scans, or image-only files stay visible as gaps

- `F3C — wiki lint, export, and durable filing`
  - lint runs and findings
  - missing refs
  - uncited numbers
  - stale pages
  - broken backlinks
  - duplicate concepts
  - missing definitions
  - conflicts against twin facts
  - deterministic export to Obsidian-friendly layout
  - durable filing of markdown artifacts back into the wiki

- `F3D — concept, metric-definition, and policy pages`
  - deterministic concept hubs from fixed code-owned registries
  - deterministic metric-definition pages for already-supported Finance Twin or wiki-backed measure families
  - policy pages only for explicit `policy_document` bindings
  - route-backed evidence, freshness, lifecycle, and limitations on higher-level wiki pages
  - no generic RAG, vector search, OCR, or freeform authorship

Exit criteria:

- one company can refresh a reproducible CFO Wiki from stored source inventory plus Finance Twin state
- compiler-owned pages stay linked, readable, and evidence-aware
- `index.md` and `log.md` are always maintained
- the reproducible wiki includes deterministic concept, metric-definition, and policy pages without changing the raw-source and Finance Twin authority boundary

## F4 — Finance discovery and analysis missions

Goal:
Make deterministic finance question-answering the primary mission type.

Focus:

- typed finance discovery questions
- answer artifacts
- explicit freshness and limitation posture
- seeded smoke paths and eval hooks

Exit criteria:

- one finance discovery mission completes end to end
- proof bundles are finance-ready rather than PR-ready

## F5 — Reporting, memo, and packet compiler

Goal:
Turn discovery outputs into artifacts real operators can share and review.

Focus:

- finance memos
- board packets
- lender or diligence updates
- evidence appendices
- approval and release flows

Exit criteria:

- at least one discovery path can produce a reviewable finance artifact
- the artifact remains reproducible and evidence-linked

## F6 — Monitoring, controls, and adoption loop

Goal:
Turn Pocket CFO into a recurring finance operating system.

Focus:

- recurring checks
- alerts and follow-up missions
- control ownership
- benchmark datasets and demo stacks

Exit criteria:

- one recurring finance monitor can trigger a human-reviewable mission
- a new user can bootstrap a demo company from docs and sources
