---
name: cfo-wiki-maintainer
description: Use when compiling, updating, or linting the CFO Wiki from immutable finance sources and twin facts. Enforces the raw-source -> finance-twin -> compiled-wiki pattern, required index/log maintenance, backlinks, provenance, contradiction tracking, and durable filing of valuable outputs.
---

# CFO Wiki Maintainer

Pocket CFO should not answer only inside chat.
It should compile durable finance knowledge into a markdown layer that humans and agents can reuse.

This skill keeps that layer clean, grounded, and reviewable.

## Trigger when

Use this skill when the task touches:

- compiled finance wiki pages
- markdown knowledge-base generation
- wiki indexes, logs, backlinks, or cross-links
- filing answer or memo outputs back into a durable knowledge layer
- wiki lint passes
- source-document summaries or policy/concept pages

Do not use this skill when the task is only about:

- raw source storage
- pure database schema work with no wiki implications
- unrelated UI styling

## Core doctrine

The CFO Wiki is **derived**.
It is not the raw source of truth.

Pocket CFO should keep four layers mentally distinct:

1. **raw sources**: immutable uploads, exports, PDFs, docs, images, bundles
2. **Finance Twin**: deterministic structured facts and lineage
3. **CFO Wiki**: human-readable compiled markdown pages
4. **mission outputs**: answers, memos, packets, investigations that may later be filed into the wiki

The wiki should be readable like a high-signal internal knowledge base while still being anchored to real evidence.

## Non-negotiable rules

1. Never rewrite or “clean up” raw sources in place.
2. Every wiki claim must trace to at least one source reference, twin fact, or clearly labeled inference.
3. Numeric claims must cite evidence or be marked as unresolved.
4. Conflicting evidence must remain visible.
5. Missing or stale coverage must be surfaced explicitly.
6. Valuable mission outputs should be filed back into the wiki as durable pages or linked notes.
7. Keep the wiki deterministic enough that rerunning compilation does not create chaotic drift.

## Required special files

The compiled wiki should always maintain:

- `index.md` as the top-level navigation and coverage map
- `log.md` as the append-only update ledger for compilation or filing events

These two files are mandatory.
If a task updates the wiki and forgets them, the task is incomplete.

## Suggested page anatomy

Each durable wiki page should make room for:

- a clear title
- what the page is about
- the reporting period or company scope when relevant
- source refs or twin refs
- a concise summary
- key facts, definitions, or numbers
- contradictions, caveats, or open questions
- links to related pages

Use obvious headings.
Do not hide the evidence posture in frontmatter alone.

## Ingest behavior

When a new finance source lands:

1. preserve the raw file immutably
2. update source registry metadata and checksums
3. extract deterministic facts into the Finance Twin where possible
4. create or refresh the relevant wiki pages
5. update `index.md`
6. append an entry to `log.md`

## Query behavior

When answering from wiki state:

1. search the wiki and twin first
2. prefer specific pages over global summaries
3. cite freshness or staleness plainly
4. if the answer produced new durable understanding, file it back into the wiki

## Lint behavior

A good wiki lint pass looks for:

- pages with no evidence refs
- stale pages
- orphan pages with no backlinks
- duplicate concept pages
- missing definition pages for important metrics or policies
- inconsistent figures across related pages
- valuable answers that were never filed back

## Final checks

Before finishing, verify:

- the wiki stayed derived, not authoritative over raw sources
- `index.md` and `log.md` were handled
- new pages are linkable and obvious to a human operator
- contradictions and limitations are visible
- the task did not invent unsupported finance claims
