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

It should turn raw-source inventory plus twin facts into durable pages such as:

- company overviews
- reporting-period indexes
- source coverage pages
- policy pages
- metric definition pages
- concept hubs for cash, receivables, payables, spend, contract obligations, and the policy corpus
- source digest pages
- later filed notes or filed outputs that are worth keeping

The CFO Wiki is derived, not authoritative over raw sources.

### 4. Mission outputs

Answers, memos, packets, and investigations are mission outputs.
Some of them should later be filed back into the wiki when they create durable knowledge.

## Why the wiki exists

The wiki solves a different problem than the twin.

The twin is for deterministic queries, lineage, and freshness-aware state.
The wiki is for operator-readable synthesis, navigation, and durable knowledge capture.

That combination is much stronger than “just use chat” and stronger than “just use a graph.”

Pocket CFO F3 is therefore:

- not a generic RAG layer
- not a second authoritative graph
- not a freeform editable markdown folder

The authority contract stays fixed:

- raw sources remain authoritative for document claims
- the Finance Twin remains authoritative for structured finance facts
- the CFO Wiki is compiled and derived from those two layers

## Required special files

The compiled wiki should always maintain:

- `index.md`
- `log.md`

`index.md` is the top-level navigation and coverage map.
`log.md` is the append-only change ledger for ingest, compilation, and filing activity.

These are mandatory, even at small scale.

## Compiler contract

The wiki compiler must:

1. read only from stored raw-source metadata, stored source-derived evidence, and stored Finance Twin state
2. produce compiler-owned markdown pages plus persisted page metadata
3. attach page refs and page links explicitly
4. surface freshness posture, limitations, and ambiguity in the page body
5. preserve `current`, `historical`, and `superseded` states rather than “forgetting” prior finance understanding
6. keep deterministic structure first and constrained synthesis second

The compiler must not:

- treat generated text as the source of truth
- silently overwrite raw sources
- silently collapse conflicting evidence into one confident answer
- require vector search or a vector DB for the first slice
- make PDF-heavy deep read a day-one dependency

## Page ownership and page kinds

Compiled pages are **compiler-owned**.
They are derived artifacts and should be reproducible from stored state.

Pocket CFO now also supports a separate filed artifact page kind for durable operator-filed markdown.
Later slices may still add:

- filed mission outputs
- durable memo or report pages

Those filed page kinds are not the same thing as compiler-owned pages.
They keep explicit provenance so humans can tell whether a page is compiled state or a later filed artifact.

The initial compiler-owned page kinds for F3A are:

- `index`
- `log`
- `company_overview`
- `period_index`
- `source_coverage`

The current shipped F3B page kind adds:

- `source_digest`

The current shipped F3C filed page kind adds:

- `filed_artifact`

The current shipped F3D compiler-owned page kinds add:

- `concept`
- `metric_definition`
- `policy`

The first required deterministic pages are:

- `index.md`
- `log.md`
- `company/overview.md`
- `periods/<periodKey>/index.md`
- `sources/coverage.md`

The current shipped F3D deterministic page families add:

- `concepts/<conceptKey>.md` for the fixed deterministic concept registry
- `metrics/<metricKey>.md` for the fixed deterministic metric-definition registry
- `policies/<sourceId>.md` for explicit `policy_document` bindings only

## Evidence and ref classes

Every wiki page should attach explicit refs using finance-friendly evidence classes:

- `twin_fact`
  Structured fact grounded in Finance Twin state.

- `source_excerpt`
  A quote, excerpt, or source locator grounded in raw-source evidence or a stored deterministic document extract.

- `compiled_inference`
  A constrained compiler synthesis that is derived from other refs and labeled as an inference rather than a raw fact.

- `ambiguous`
  A known conflict, coverage gap, unsupported source type, or unresolved interpretation that the compiler must keep visible.

Numeric claims should resolve to `twin_fact` or `source_excerpt` refs whenever possible.
If they cannot, the page should explicitly show the limitation rather than inventing certainty.

## Current, historical, and superseded

The wiki should not use generic “forgetting” semantics.
It should distinguish:

- `current`
  The best current compiled view for the company or the relevant reporting period.

- `historical`
  A still-useful page that reflects a prior period or prior state and remains intentionally reviewable.

- `superseded`
  A page or interpretation that has been replaced by a newer compiled understanding but must remain visible for audit or context.

Older periods and prior compile states should remain understandable without pretending they are current.

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
- freshness posture
- visible limitations

Do not hide the evidence posture only in frontmatter.

## Compile pipeline

The initial compile pipeline should look like this:

1. create a compile run for one company
2. read source inventory, snapshot metadata, and authoritative Finance Twin state
3. build a deterministic page registry for the required compiler-owned pages
4. render deterministic markdown skeletons
5. attach page refs and page links
6. upsert pages, refs, and links
7. refresh `index.md`
8. append a new entry to `log.md`
9. persist compile stats and replay-relevant metadata

The first implementation slice should compile from Finance Twin state and source inventory only.
It should not begin with broad document-body synthesis.

Current shipped state:

- F3A is now implemented as a backend-first, one-company compile and read surface in the control-plane
- the compile runs synchronously and inline for now
- it reads only stored source-inventory metadata plus stored Finance Twin state
- it persists compile runs, compiler-owned pages, page links, and page refs additively
- it always produces `index.md` and `log.md` on successful compile
- it does not parse broad document bodies, call runtime-codex, or add vector search
- the first narrow F3B slice now adds explicit company-scoped document bindings by `sourceId`, persisted deterministic markdown or plain-text extracts from stored raw bytes, compiler-owned source digest pages, and route-backed backlinks
- unsupported PDFs, scans, unreadable files, or snapshots without stored raw source bytes remain visible as unsupported coverage instead of fake digests
- F3C now adds persisted lint runs and findings over stored wiki state, deterministic markdown-first export runs with manifest-backed bundle contents, and an explicit filed artifact ownership seam that survives later compiler-owned replacement

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

1. accept a typed company-scoped mission question rather than using generic chat as the execution contract
2. read the twin and relevant wiki pages
3. answer only from stored state and explicit freshness posture
4. surface assumptions, gaps, and conflicts
5. if the result is durable and useful, file it back into the wiki

## F4 discovery contract

Pocket CFO F4 should treat finance discovery as a mission-based read path, not as a generic finance chatbot.

The shipped F4A through F4C2 contract therefore stays:

- one typed company-scoped finance discovery question
- one deterministic answer artifact
- one finance-ready proof bundle
- explicit freshness posture
- explicit related routes and wiki pages
- explicit visible limitations

The authority boundary remains:

- raw sources remain authoritative for document claims
- the Finance Twin remains authoritative for structured finance facts
- the CFO Wiki remains the derived operator-readable layer built from those two sources of truth

The shipped F4 question contract stays typed and narrow:

- `companyKey`
- `questionKind`
- optional operator wording stored for display only
- `policySourceId` required only for source-scoped `policy_lookup`

The shipped answer families are exactly:

- `cash_posture`
- `collections_pressure`
- `payables_pressure`
- `spend_posture`
- `obligation_calendar_review`
- `policy_lookup`

The current finance discovery answer artifact is durable enough to survive outside chat and now already feeds the shipped first F5A reporting path.
`plans/FP-0036-reporting-mission-foundation-and-first-finance-memo.md` records that landed first reporting reuse contract as a draft `finance_memo` plus linked `evidence_appendix` compiled from a completed discovery mission.
Those reporting artifacts now persist:

- company key
- question kind
- one concise answer summary
- freshness posture
- visible limitations
- explicit related routes or route-backed evidence
- explicit related wiki pages
- structured evidence sections that later report compilation can reuse
- deterministic `bodyMarkdown` plus structured metadata

`plans/FP-0037-draft-report-body-filed-artifact-and-markdown-export-hardening.md` now serves as the shipped F5B record for that stored-report reuse step:

- render the stored memo and appendix bodies directly in mission detail, read-only
- file selected report artifacts into the existing CFO Wiki filed-page seam through explicit operator action
- reuse company-level markdown export runs after filing without changing proof readiness semantics

`plans/FP-0038-board-packet-specialization-and-draft-review-foundation.md` is now the active F5C contract for the next reporting specialization step:

- compile one draft `board_packet` only from one completed `reporting` mission with stored `finance_memo` plus stored `evidence_appendix`
- keep `mission.type = "reporting"` and specialize through `reportKind`
- keep packet compilation deterministic, runtime-free, and draft-only
- keep lender and diligence specialization, approval-release semantics, and non-markdown export formats out of scope

Numeric claims should only appear when route-backed stored state or explicit refs support them.
If the stored state is partial, stale, conflicting, or insufficient, the answer should say so plainly instead of inventing certainty.

## Shipped F4 discovery answer posture

The shipped F4A through F4C2 answer path stays deterministic and read-only.

It now:

- executes through the mission engine rather than an ad hoc chat route
- answers from stored Finance Twin plus stored CFO Wiki state only
- supports only the shipped families listed above
- uses the relevant stored Finance Twin reads and related wiki pages for each supported family
- surfaces route-backed freshness posture, visible limitations, related routes, and related wiki pages in every stored answer artifact and proof bundle
- reuses diagnostics already present in stored views
- states explicit limitations rather than collapsing everything into a fake single-number finance claim

The shipped F4 baseline still does none of the following:

- no generic finance chat
- no runtime-codex in the first answer path
- no vector DB or generic retrieval layer
- no PageIndex, QMD, MinerU, OCR, or PDF-heavy deep read dependency
- no new Finance Twin extractor
- no report compilation inside the F4 answer path itself; later F5 reporting work consumes the stored discovery outputs in a separate mission phase
- no F6 monitoring work

`FP-0038` now makes the next-step boundary explicit:

- the next F5 step should compile one specialized `board_packet` from the landed F5A plus F5B reporting artifacts rather than from discovery or generic chat
- the source reporting mission must already store both `finance_memo` and `evidence_appendix`
- raw wiki pages remain derived evidence inputs, not the only packet source of truth
- lender and diligence specialization, PDF export, slide export, runtime-codex drafting, and release semantics remain later work

F4C1 now ships one mission-based, source-scoped, deterministic policy lookup path.
`policy_lookup` requires explicit `policySourceId`, answers only from `policies/<sourceId>`, same-source source-digest pages when useful, `concepts/policy-corpus` when useful, and explicit bound-source extract status.
If the latest bound policy extract is missing, unsupported, or failed, the mission persists a truthful limited answer rather than inventing a digest.
F4C2 now also ships operator-safe policy source selection from the existing bound-source route, additive policy source-scope rendering across answer, mission, list, and proof-bundle surfaces, and the packaged deterministic `pnpm smoke:finance-discovery-quality:local` ladder as the current practical proof for the shipped six-family discovery baseline.
Generic corpus-wide policy retrieval, runtime-codex answer generation, vector search, OCR, and deep-read remain out of scope for the shipped F4 baseline.
Report compilation now exists in the shipped F5A slice and stays deterministic, draft-only, and source-discovery-grounded.
The shipped F5B follow-on now hardens body visibility, filed-page reuse, and markdown export posture from that stored reporting state.
The active F5C1 follow-on should specialize only one draft `board_packet` from that completed reporting state.

## Lint flow

The current shipped deterministic F3C lint pass looks for:

- missing evidence refs
- uncited numeric claims
- stale pages
- orphan pages
- broken links
- unsupported document gaps
- duplicate visible titles

## F3A scope

The first F3 implementation slice should focus on:

- a new wiki bounded context
- compile runs
- page registry state
- page links
- page refs
- deterministic pages:
  - `index.md`
  - `log.md`
  - `company/overview.md`
  - `periods/<periodKey>/index.md`
  - `sources/coverage.md`
- compile from Finance Twin state and source inventory only

F3A should not do any of the following:

- no vector DB
- no generic retrieval layer
- no PageIndex or QMD dependency
- no broad document-page synthesis yet
- no PDF-heavy deep read as a hard dependency
- no wiki UI
- no F4 discovery implementation
- no new Finance Twin extractor

The shipped F3A routes are intentionally narrow:

- `POST /cfo-wiki/companies/:companyKey/compile`
- `GET /cfo-wiki/companies/:companyKey`
- `GET /cfo-wiki/companies/:companyKey/index`
- `GET /cfo-wiki/companies/:companyKey/log`
- `GET /cfo-wiki/companies/:companyKey/pages/*`

## Deferred wiki support

F3A through F3D are now shipped.
F3D adds deterministic concept pages, metric-definition pages, and policy pages from fixed registries plus explicit `policy_document` bindings.
Future wiki enhancements can deepen document support, but they should not replace these compiler-owned registries with open-ended synthesis.
If deeper wiki support is ever pursued later, it can add:

- extractable PDF deep-read support when it is deterministic enough to stay truthful
- constrained synthesis inside deterministic templates for those page families
- broader related-page graph behavior once those page families exist

Unsupported scans or image-only documents should stay visible as gaps until a later capability can handle them truthfully.

Long-document deep read for PDF-heavy finance packets should be planned explicitly if it is ever pursued later.
It is not part of the shipped F3 baseline and it is not a blocker before F4 finance discovery answers.

## Non-negotiable rules

- raw sources are immutable
- raw sources remain authoritative for document claims
- the Finance Twin remains authoritative for structured finance facts
- the wiki stays derived rather than becoming a second truth layer
- derived pages must stay traceable
- conflicting evidence stays visible
- stale or partial coverage must remain visible
- extracted facts and inferred conclusions should be distinguishable
- valuable answers should not vanish inside chat when they belong in the durable knowledge layer

## Practical design consequence

Pocket CFO should be:

**Source Registry + Finance Twin + CFO Wiki + Mission/Proof Control Plane**

not a shallow rename of the old GitHub-first Pocket CTO slice.
