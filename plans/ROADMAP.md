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
Add the compiled markdown knowledge layer beside the Finance Twin.

Focus:

- wiki page generation
- index and log maintenance
- backlinks and page linting
- filing durable mission outputs back into the wiki

Exit criteria:

- one company can refresh a reproducible CFO Wiki
- the wiki is linked, readable, and evidence-aware

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
