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
Make deterministic, mission-based finance discovery the first real answer path without turning Pocket CFO into generic finance chat.

Pocket CFO F4 is **not**:

- a generic finance chat box
- a runtime-codex-first answer engine
- a vector-search, OCR, or deep-read dependency project

The authority model stays fixed:

- raw sources remain authoritative for document claims
- the Finance Twin remains authoritative for structured finance facts
- the CFO Wiki remains the derived operator-readable layer
- the mission engine remains the primary product path for discovery answers

The first F4 answer path must:

- be typed and company-scoped
- run from stored Finance Twin plus stored CFO Wiki state
- expose freshness, provenance posture, and limitations explicitly
- stay deterministic and read-only
- produce durable finance answer artifacts and finance-ready proof bundles
- avoid runtime-codex in the first answer path

Focus:

- typed company-scoped finance discovery questions
- deterministic answer artifacts
- finance-ready proof bundles
- explicit freshness and limitation posture
- seeded smoke paths and eval hooks for truthfully supported families

Slice map:

- `F4A — finance discovery foundation and first supported answer`
  - retarget the discovery mission contract from engineering blast radius to company-scoped finance discovery
  - define the finance discovery question contract
  - define the finance discovery answer artifact contract
  - define finance-ready proof-bundle expectations for analysis missions
  - keep execution deterministic and read-only
  - first shipped question family:
    - `cash_posture`
  - answer only from stored Finance Twin plus stored CFO Wiki state and explicit freshness
  - no runtime-codex
  - no report compiler
  - no new Finance Twin extractor

- `F4B — supported posture, aging, spend, and obligation answers`
  - expand only into question families already truthfully supported by shipped F2/F3 surfaces such as:
    - `collections_pressure`
    - `payables_pressure`
    - `spend_posture`
    - `obligation_calendar_review`
    - leave `receivables_aging_review` and `payables_aging_review` for a later narrow slice even though the route-backed reads exist
  - keep answers grounded in existing Finance Twin reads, wiki pages, and lineage
  - keep question families narrow and typed
  - still no runtime-codex, F5 reports, or F6 monitoring

- `F4C — policy lookup and discovery quality hardening`
  - `F4C1 — shipped explicit policy lookup from bound policy documents`
    - adds one typed finance discovery family:
      - `policy_lookup`
    - requires explicit policy source scope via `policySourceId`
    - answers only from:
      - compiled policy page `policies/<sourceId>`
      - related source-digest pages for that same source when useful
      - `concepts/policy-corpus` when useful
      - explicit bound-source metadata and stored extract status
    - stays deterministic, read-only, and mission-based
    - persists a truthful limited answer instead of fabricating a digest when the latest bound policy extract is missing, unsupported, or failed
    - keeps runtime-codex, generic retrieval, new Finance Twin extractors, and report compilation out of scope
  - `F4C2 — shipped discovery quality hardening and finance-native eval-hook closeout`
    - the shipped baseline now includes deterministic `policy_document` source selection from the existing bound-source route, additive policy source-scope rendering across answer, mission, list, and proof-bundle surfaces, packaged `pnpm smoke:finance-discovery-quality:local`, and finance-native `pnpm eval:finance-discovery-quality`
    - the landed eval hook reuses the shipped deterministic discovery-quality smoke to write a durable finance-native report without fake model or provider metadata
    - only consider deeper evidence-precision work if a concrete gap remains after the shipped F4C2 baseline
    - do not assume PageIndex/QMD/MinerU, vector search, OCR, or deep-read are required

Supported now vs blocked for later:

- the shipped F4 discovery families are `cash_posture`, `collections_pressure`, `payables_pressure`, `spend_posture`, `obligation_calendar_review`, and `policy_lookup`
- `receivables_aging_review` and `payables_aging_review` remain later narrow-slice work rather than part of the first F4B implementation
- `policy_lookup` requires explicit `policySourceId` scope rather than generic corpus-wide retrieval
- the following families remain explicitly blocked until new deterministic Finance Twin support exists:
  - `runway`
  - `burn_variance`
  - `concentration`
  - `covenant_risk`
  - `anomaly_review`
  - `spend_exceptions` based on policy scoring or exception inference

Deferred precision dependencies:

- PageIndex, QMD, MinerU, OCR, vector search, vector DB, and PDF-heavy deep read are later precision concerns, not first-slice dependencies
- deeper document precision should be justified by a proven evidence gap during F4A/F4B, not assumed up front

Exit criteria:

- one company-scoped finance discovery mission completes end to end through the mission engine
- the first answer path is deterministic, read-only, twin/wiki-grounded, and explicit about freshness and limitations
- proof bundles are finance-ready rather than PR-ready
- blocked question families remain clearly blocked until deterministic support exists

## F5 — Reporting, memo, and packet compiler

Goal:
Turn shipped discovery outputs into reviewable finance reporting artifacts without pretending the repo already has full packet, export, or release workflows.

The latest shipped implementation records for this phase are `plans/FP-0045-board-packet-review-or-circulation-readiness-foundation.md` for F5C4E, `plans/FP-0046-circulation-log-and-first-board-packet-circulation-record-foundation.md` for F5C4F, and `plans/FP-0047-board-packet-circulation-record-correction-and-chronology-foundation.md` for F5C4G.
`plans/FP-0048-board-packet-circulation-actor-correction-and-chronology-hardening.md` now serves as the active F5C4H implementation-ready contract.
The next remaining execution slice is one narrow board circulation actor-correction and chronology-hardening follow-on on top of the existing `report_circulation` seam; do not reopen F5C4E through F5C4G, author a broad `FP-0049` umbrella, or start F6 early.
The authority model stays fixed:

- raw sources remain authoritative for document claims
- the Finance Twin remains authoritative for structured finance facts
- discovery answers and proof bundles remain the stored reporting inputs
- the memo compiler is derived output, not a new source of truth

Focus:

- first-class reporting missions
- one draft `finance_memo`
- one linked `evidence_appendix`
- mission-based operator entry from completed discovery work
- explicit draft posture and later approval or release hardening

Slice map:

- `F5A — reporting mission foundation and first finance memo`
  - add a first-class `reporting` mission type
  - compile only from a completed finance discovery mission and its stored `discovery_answer`, proof bundle, related routes, and related wiki pages
  - persist one draft `finance_memo`
  - persist one linked `evidence_appendix`
  - keep execution deterministic and read-only
  - keep runtime-codex, wiki filing, packet specialization, PDF export, and release semantics out of scope

- `F5B — draft report body, filed artifact, and markdown export hardening`
  - expose stored `finance_memo.bodyMarkdown` and `evidence_appendix.bodyMarkdown` directly in reporting mission detail
  - keep that body exposure read-only, with no editor and no runtime drafting
  - file selected report artifacts back into the wiki only through an explicit operator action that reuses the existing filed-page seam
  - reuse company-level markdown export runs and export linkage only after filing, while keeping export posture separate from proof readiness
  - keep packet specialization, PDF export, slide export, and release hardening out of scope

- `F5C — packet specialization and later approval, review, and release-readiness hardening`
  - `F5C1 — board packet specialization and draft review foundation`
    - add the first packet-specific `reportKind`: `board_packet`
    - compile only from one completed `reporting` mission with stored `finance_memo` plus stored `evidence_appendix`
    - keep `mission.type = "reporting"` and specialize through `reportKind` rather than adding a second top-level mission family
    - keep execution deterministic, runtime-free, and draft-only
    - keep lender specialization, diligence specialization, external release semantics, and finance approval semantics out of scope
    - keep PDF, slide, and Marp export out of scope
  - `F5C2 — lender update specialization and draft review foundation`
    - add the next packet-specific `reportKind`: `lender_update`
    - compile only from one completed `reporting` mission with stored `finance_memo` plus stored `evidence_appendix`
    - keep `mission.type = "reporting"` and specialize through `reportKind`
    - keep execution deterministic, runtime-free, and draft-only
    - keep filing or export behavior for `lender_update`, diligence specialization, external release semantics, and finance approval semantics out of scope
    - keep PDF, slide, and Marp export out of scope
  - `F5C3 — diligence packet specialization and draft review foundation`
    - add the next packet-specific `reportKind`: `diligence_packet`
    - compile only from one completed `reporting` mission with stored `finance_memo` plus stored `evidence_appendix`
    - keep `mission.type = "reporting"` and specialize through `reportKind`
    - keep execution deterministic, runtime-free, and draft-only
    - keep filing or export behavior for `diligence_packet`, external release semantics, finance approval semantics, and bounded runtime-codex drafting out of scope
    - keep PDF, slide, and Marp export out of scope
  - `F5C4 — approval, review, and release-readiness hardening for external communication posture`
    - `F5C4A — approval review and first lender update release readiness`
      - start only from one completed `reporting` mission with `reportKind = "lender_update"` and one stored `lender_update` artifact
      - keep `mission.type = "reporting"` and `reportKind = "lender_update"`
      - retarget the existing approvals bounded context rather than inventing a second approval system
      - add one finance-facing approval kind:
        - `report_release`
      - add review request, approval resolution, and release-readiness posture only
      - keep the slice deterministic, runtime-free, and delivery-free
      - do not add actual send, distribute, publish, or release logging
    - `F5C4B — release log and first lender update release record foundation`
      - start only from one completed `reporting` mission with `reportKind = "lender_update"`, one stored `lender_update` artifact, and release-readiness already at `approved_for_release`
      - keep `mission.type = "reporting"` and `reportKind = "lender_update"`
      - add release logging and one explicit release record only
      - prefer persisting release-record data as a durable extension of the existing `report_release` approval payload or its derived reporting view rather than inventing a second release-tracking subsystem
      - add `releasedAt`, `releasedBy`, and minimal release-channel metadata while keeping the slice deterministic, runtime-free, and delivery-free in the system sense
      - do not add actual send, distribute, or publish behavior
    - `F5C4C — diligence-packet approval review and release readiness`
      - start only from one completed `reporting` mission with `reportKind = "diligence_packet"` and one stored `diligence_packet` artifact
      - keep `mission.type = "reporting"` and `reportKind = "diligence_packet"`
      - reuse the existing approvals bounded context and the existing `report_release` approval kind rather than inventing a second approval system
      - widen the existing `report_release` payload and release-readiness/reporting view seams from lender-update-only to `lender_update` plus `diligence_packet`, and no broader
      - add review request, approval resolution, and release-readiness posture only
      - keep the slice deterministic, runtime-free, and delivery-free
      - do not add actual send, distribute, publish, or diligence release logging
    - `F5C4D — release log and first diligence-packet release-record foundation`
      - start only from one completed `reporting` mission with `reportKind = "diligence_packet"`, one stored `diligence_packet` artifact, and release-readiness already at `approved_for_release`
      - keep `mission.type = "reporting"` and `reportKind = "diligence_packet"`
      - add release logging and one explicit release record only for `diligence_packet`
      - prefer persisting release-record data as a durable extension of the existing `report_release` approval payload or its derived reporting view rather than inventing a second release-tracking subsystem
      - add `releasedAt`, `releasedBy`, and minimal release-channel metadata while keeping the slice deterministic, runtime-free, and delivery-free in the system sense
      - do not add actual send, distribute, or publish behavior
    - `F5C4E — board-packet review or circulation-readiness foundation`
      - start only from one completed `reporting` mission with `reportKind = "board_packet"` and one stored `board_packet` artifact
      - keep `mission.type = "reporting"` and `reportKind = "board_packet"`
      - reuse the existing approvals bounded context but add one new finance-facing approval kind:
        - `report_circulation`
      - add review request, approval resolution, and `approved_for_circulation` or circulation-ready posture only
      - keep the slice deterministic, runtime-free, and delivery-free
      - do not add actual circulation logging, send, distribute, or publish behavior
    - `F5C4F — circulation log and first board-packet circulation-record foundation`
      - start only from one completed approved-for-circulation `board_packet` reporting mission with one stored `board_packet` artifact
      - keep `mission.type = "reporting"` and `reportKind = "board_packet"`
      - add circulation logging and one explicit circulation record only
      - keep the slice deterministic, runtime-free, and delivery-free in the system sense
      - do not add actual send, distribute, or publish behavior
    - `F5C4G — board-packet circulation-record correction and chronology foundation`
      - start only from one completed approved-for-circulation `board_packet` reporting mission with one stored `board_packet` artifact and one existing logged circulation record
      - keep `mission.type = "reporting"` and `reportKind = "board_packet"`
      - keep the original `circulationRecord` immutable
      - append one correction history on the existing `report_circulation` approval seam rather than inventing a second circulation-tracking subsystem
      - derive one current effective circulation view plus one explicit chronology summary
      - keep the slice deterministic, runtime-free, and delivery-free in the system sense
      - do not add actual send, distribute, publish, PDF export, slide export, or runtime-codex behavior
    - `F5C4H — board-packet circulation actor correction and chronology hardening`
      - start only from one completed approved-for-circulation `board_packet` reporting mission with one stored `board_packet` artifact, one existing immutable circulation record, and zero or more existing circulation corrections
      - keep `mission.type = "reporting"` and `reportKind = "board_packet"`
      - keep the original `circulationRecord` immutable and correction history append-only
      - extend correction entries on the existing `report_circulation` seam with optional corrected `circulatedBy`
      - derive one truthful current effective actor identity plus chronology summary on that same seam
      - keep the slice deterministic, runtime-free, and delivery-free in the system sense
      - do not add actual send, distribute, publish, PDF export, slide export, or runtime-codex behavior
    - only after F5C4H should the repo reevaluate whether any broader later-F5 work is still justified before F6, and bounded runtime-codex phrasing or formatting assistance should be reconsidered only if it still solves a proven operator problem

Exit criteria:

- one completed finance discovery mission can produce a first-class reporting mission
- the first report path yields a draft `finance_memo` plus `evidence_appendix`
- report outputs remain reproducible, evidence-linked, freshness-aware, and explicit about limitations
- packet specialization now includes shipped `board_packet`, `lender_update`, and `diligence_packet` draft-review paths, lender-update approval and release-record posture are already shipped through F5C4B, diligence approval, release-readiness, and release-record posture are now shipped through F5C4D, board circulation-readiness is now shipped through F5C4E, board circulation-log and first circulation-record posture are now shipped through F5C4F, shipped F5C4G now adds immutable correction history plus chronology on that same board seam, the active F5C4H contract narrows any remaining later-F5 work to actor-attribution correction only on that same seam, and markdown export reuse remains limited to the filed-artifact path defined in F5B

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
