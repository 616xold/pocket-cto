---
name: source-provenance-guard
description: Use when implementing or refactoring source ingest, uploads, parser dispatch, lineage, freshness, or evidence references. Enforces immutable raw sources, checksums, snapshot identity, source-to-artifact lineage, and explicit stale/conflict handling.
---

# Source Provenance Guard

Pocket CFO only earns trust if every meaningful answer can be traced back to real evidence.

This skill protects that contract.

## Trigger when

Use this skill when the task touches:

- source registry
- file upload or ingest
- source snapshots
- checksums or file identity
- parser dispatch
- source-to-twin lineage
- source citations in answers, memos, or wiki pages
- freshness posture or stale-state handling

Do not use this skill for:

- CSS-only changes
- purely presentational UI work with no provenance behavior
- unrelated runtime transport changes

## Core doctrine

Raw finance evidence is a product primitive.

That means:

- raw sources are immutable
- snapshots are explicit
- derived facts must be traceable
- stale or missing evidence must remain visible
- conflicting evidence must not be overwritten into false certainty

## Non-negotiable rules

1. Every raw source needs a stable identity.
2. Every stored file needs a checksum.
3. Every snapshot needs explicit source metadata.
4. Derived facts must link back to at least one source or snapshot.
5. If provenance is partial or missing, say so plainly in the schema, service, and output.
6. Never silently replace a raw source in place.
7. Distinguish extracted facts from inferred conclusions.
8. Keep conflict handling additive, not destructive.

## Source identity expectations

A trustworthy source record usually needs:

- source id
- snapshot id
- file id
- original file name
- media type
- checksum
- ingest timestamp
- reporting period or scope when known
- ingest status
- parser status
- lineage to derived artifacts

Not every slice needs every field on day one, but the design should move in this direction.

## Suggested module split

When implementing source work, prefer:

- `routes.ts` for upload or registry transport
- `schema.ts` for external input validation
- `service.ts` for orchestrating ingest
- `repository.ts` for persistence
- `storage.ts` for object-store interactions
- `parser.ts` or `dispatch.ts` for deterministic parser routing
- `provenance.ts` for lineage helpers
- `events.ts` for replay or outbox events

## Freshness and conflict rules

- If an answer depends on stale sources, state that explicitly.
- If two sources disagree, preserve both sides and mark the inconsistency.
- If a result is inferred rather than extracted, label it clearly.
- If a parser fails, preserve the raw source anyway and mark the ingest state truthfully.

## Final checks

Before finishing, verify:

- raw files are immutable
- checksums and snapshot identity are explicit
- lineage can reach from answer or artifact back to source evidence
- stale, partial, or conflicting evidence is not hidden
- replay or evidence contracts include the ingest event when relevant
