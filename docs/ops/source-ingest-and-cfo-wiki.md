# Source ingest and CFO Wiki

This doc operationalizes the Pocket CFO design choice that matters most for the pivot:

> finance evidence becomes the product boundary, and a compiled markdown wiki sits beside the Finance Twin rather than replacing it.

## The four-layer model

Pocket CFO should keep four layers distinct.

### 1. Raw sources

These are immutable uploads or exports:

- CSV and XLSX exports
- PDFs
- Markdown or text docs
- images or scans
- ZIP bundles
- policy and diligence material

Raw sources are the **authoritative input layer**.
Do not edit them in place.

### 2. Finance Twin

This is the deterministic structured layer.

It should hold normalized entities, relationships, freshness posture, and lineage for things like:

- company
- legal entity
- reporting period
- ledger account
- bank account
- customer
- vendor
- contract
- metric definition
- policy
- risk
- scenario

The Finance Twin is the machine-queryable layer.

### 3. CFO Wiki

This is the human-readable compiled markdown layer.

It should turn raw documents plus twin facts into durable pages such as:

- company overviews
- reporting-period indexes
- policy pages
- metric definition pages
- runway and concentration concept pages
- memo and report pages that are worth keeping

The CFO Wiki is derived, not authoritative over raw sources.

### 4. Mission outputs

Answers, memos, packets, and investigations are mission outputs.
Some of them should later be filed back into the wiki when they create durable knowledge.

## Why the wiki exists

The wiki solves a different problem than the twin.

The twin is for deterministic queries, lineage, and freshness-aware state.
The wiki is for operator-readable synthesis, navigation, and durable knowledge capture.

That combination is much stronger than “just use chat” and stronger than “just use a graph.”

## Required special files

The compiled wiki should always maintain:

- `index.md`
- `log.md`

`index.md` is the top-level navigation and coverage map.
`log.md` is the append-only change ledger for ingest, compilation, and filing activity.

These are mandatory, even at small scale.

## Suggested target layout

Not all of this has to exist on day one, but this is the intended shape:

```text
raw/
  <sourceId>/
    <snapshotId>/
      original files...

wiki/
  index.md
  log.md
  entities/
  concepts/
  policies/
  periods/
  reports/
```

## Page conventions

A good compiled page should make room for:

- title
- page kind
- canonical id if one exists
- reporting period or scope when relevant
- source refs or twin refs
- concise summary
- key facts or definitions
- contradictions or caveats
- links to related pages

Do not hide the evidence posture only in frontmatter.

## Ingest flow

A trustworthy ingest flow should look like this:

1. register the source and snapshot
2. persist the raw file immutably
3. compute checksum and metadata
4. dispatch deterministic parsers where possible
5. update Finance Twin facts and lineage
6. create or refresh wiki pages
7. update `index.md`
8. append to `log.md`
9. emit replay or ingest evidence

## Query flow

A trustworthy query flow should look like this:

1. read the twin and relevant wiki pages
2. answer only from stored state and explicit freshness posture
3. surface assumptions, gaps, and conflicts
4. if the result is durable and useful, file it back into the wiki

## Lint flow

A wiki lint pass should look for:

- missing evidence refs
- uncited numeric claims
- stale pages
- duplicate pages
- broken backlinks
- missing definitions for important concepts
- inconsistent figures across related pages
- mission outputs that should have been filed back but were not

## Non-negotiable rules

- raw sources are immutable
- derived pages must stay traceable
- conflicting evidence stays visible
- stale or partial coverage must remain visible
- extracted facts and inferred conclusions should be distinguishable
- valuable answers should not vanish inside chat when they belong in the durable knowledge layer

## Practical design consequence

Pocket CFO should be:

**Source Registry + Finance Twin + CFO Wiki + Mission/Proof Control Plane**

not a shallow rename of the old GitHub-first Pocket CTO slice.
