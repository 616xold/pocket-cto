# Pocket CFO roadmap

This roadmap replaces the old engineering-centric milestone story with a finance-specific sequence that Codex can follow cleanly.

## Build philosophy

Preserve the strongest spine from historical Pocket CTO scaffolding:

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

- tag the historical engineering product as `pocket-cto-m3-final`
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
  - retarget the historical engineering blast-radius discovery contract to company-scoped finance discovery
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

The latest shipped implementation records for this phase are `plans/FP-0045-board-packet-review-or-circulation-readiness-foundation.md` for F5C4E, `plans/FP-0046-circulation-log-and-first-board-packet-circulation-record-foundation.md` for F5C4F, `plans/FP-0047-board-packet-circulation-record-correction-and-chronology-foundation.md` for F5C4G, `plans/FP-0048-board-packet-circulation-actor-correction-and-chronology-hardening.md` for F5C4H, and `plans/FP-0049-board-packet-circulation-note-reset-and-effective-record-hardening.md` for F5C4I.
F5C4I is now shipped: the repo already supports explicit clear-to-absent `circulationNote` correction on the existing board `report_circulation` seam while keeping the original record immutable and the correction history append-only.
There is no active later-F5 implementation contract after FP-0049. `plans/FP-0050-monitoring-foundation-and-first-cash-posture-alert.md` remains the shipped first-F6A record, `plans/FP-0051-alert-to-investigation-mission-foundation.md` remains the shipped first-F6B record, `plans/FP-0052-collections-pressure-monitor-foundation.md` is now the shipped F6C implementation record, `plans/FP-0053-payables-pressure-monitor-foundation.md` is now the shipped F6D implementation record, `plans/FP-0054-policy-covenant-threshold-monitor-foundation.md` is now the shipped F6E implementation record, `plans/FP-0055-monitor-demo-replay-and-stack-pack-foundation.md` is now the shipped F6F implementation record, `plans/FP-0056-non-cash-alert-investigation-generalization-foundation.md` is now the shipped F6G implementation record, `plans/FP-0057-close-control-checklist-foundation.md` is now the shipped F6H implementation record, and `plans/FP-0058-stack-pack-expansion-and-close-control-demo-foundation.md` is now the shipped F6I implementation record. F6I does not reopen F5 and is limited to extending the existing deterministic demo replay proof with close/control checklist expected output.
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
    - `F5C4I — board-packet circulation note reset and effective-record hardening`
      - start only from one completed approved-for-circulation `board_packet` reporting mission with one stored `board_packet` artifact, one existing immutable circulation record, and zero or more existing circulation corrections
      - keep `mission.type = "reporting"` and `reportKind = "board_packet"`
      - keep the original `circulationRecord` immutable and correction history append-only
      - distinguish unchanged versus replace versus clear for `circulationNote` only on the existing `report_circulation` correction seam
      - derive one truthful current effective note plus chronology summary without widening actor, channel, or time reset behavior beyond shipped support
      - reuse the existing correction route and `approval.circulation_log_corrected` replay seam by default
      - keep the slice deterministic, runtime-free, and delivery-free in the system sense
      - do not add actual send, distribute, publish, PDF export, slide export, or runtime-codex behavior
    - after the shipped F5C4I closeout, the repo should not reopen broader later-F5 work unless a new plan names a concrete truthfulness gap. FP-0051 is now the shipped first-F6B record, FP-0052 records the shipped F6C collections-pressure monitor slice, FP-0053 records the shipped F6D payables-pressure monitor slice, and FP-0054 records the shipped F6E policy/covenant threshold monitor slice.

Exit criteria:

- one completed finance discovery mission can produce a first-class reporting mission
- the first report path yields a draft `finance_memo` plus `evidence_appendix`
- report outputs remain reproducible, evidence-linked, freshness-aware, and explicit about limitations
- packet specialization now includes shipped `board_packet`, `lender_update`, and `diligence_packet` draft-review paths, lender-update approval and release-record posture are already shipped through F5C4B, diligence approval, release-readiness, and release-record posture are now shipped through F5C4D, board circulation-readiness is now shipped through F5C4E, board circulation-log and first circulation-record posture are now shipped through F5C4F, shipped F5C4G adds immutable correction history plus chronology on that same board seam, shipped F5C4H adds append-only actor-attribution correction on that same seam, and shipped FP-0049 closes the explicit `circulationNote` clear-to-absent gap on that same seam; markdown export reuse remains limited to the filed-artifact path defined in F5B

## F6 — Monitoring, controls, and adoption loop

Goal:
Turn Pocket CFO into a recurring finance operating system without weakening the source-truth boundary.

`plans/FP-0050-monitoring-foundation-and-first-cash-posture-alert.md` records the shipped first F6A implementation slice.
`plans/FP-0051-alert-to-investigation-mission-foundation.md` records the shipped first F6B implementation slice.
`plans/FP-0052-collections-pressure-monitor-foundation.md` records the F6C implementation slice.
`plans/FP-0053-payables-pressure-monitor-foundation.md` records the shipped F6D implementation slice.
`plans/FP-0054-policy-covenant-threshold-monitor-foundation.md` records the shipped F6E implementation slice.
`plans/FP-0055-monitor-demo-replay-and-stack-pack-foundation.md` records the shipped F6F implementation slice.
`plans/FP-0056-non-cash-alert-investigation-generalization-foundation.md` is the shipped F6G implementation record.
`plans/FP-0057-close-control-checklist-foundation.md` is the shipped F6H implementation record.
`plans/FP-0058-stack-pack-expansion-and-close-control-demo-foundation.md` is the shipped F6I implementation record.
`plans/FP-0059-operator-notification-readiness-foundation.md` is the shipped F6J implementation record.
`plans/FP-0060-close-control-acknowledgement-foundation.md` is the shipped F6K implementation record.
`plans/FP-0061-source-pack-expansion-foundation.md` is the shipped F6L implementation record.
`plans/FP-0062-external-notification-delivery-planning-foundation.md` is the shipped F6M implementation record for a first internal delivery-readiness boundary.
`plans/FP-0063-close-control-review-summary-foundation.md` is the shipped F6N implementation record for a first internal close/control review summary.
`plans/FP-0064-receivables-payables-source-pack-foundation.md` is the shipped F6O record for one receivables/payables source-pack foundation only.
`plans/FP-0065-external-provider-boundary-foundation.md` is the shipped F6P record for one internal external-provider-boundary/readiness foundation only.
`plans/FP-0066-close-control-certification-boundary-foundation.md` is the shipped F6Q implementation record for one internal close/control certification-boundary/readiness foundation only.
`plans/FP-0067-contract-obligation-source-pack-foundation.md` is the shipped F6R record for one contract/obligation source-pack foundation only.
`plans/FP-0068-external-delivery-human-confirmation-boundary-foundation.md` is the shipped F6S implementation record for one internal external-delivery human-confirmation / delivery-preflight boundary only.
`plans/FP-0069-ledger-reconciliation-source-pack-foundation.md` is the shipped F6U record for one ledger/reconciliation source-pack foundation only.
`plans/FP-0070-close-control-certification-safety-foundation.md` is the shipped F6T implementation record for one internal close/control certification-safety/readiness foundation only.
`plans/FP-0071-policy-covenant-document-source-pack-foundation.md` is the shipped F6W record for one policy/covenant document source-pack foundation only.
`plans/FP-0072-board-lender-document-source-pack-foundation.md` is the shipped F6Y record for one board/lender document source-pack foundation only.
`plans/FP-0073-final-f6-v1-exit-audit-and-handoff.md` is the shipped F6Z final F6/v1 exit audit and handoff record; it is docs-and-validation-only and added no product runtime behavior.
F6A is not a broad monitoring platform.
The first shipped implementation slice is exactly `F6A-monitoring-foundation-and-first-cash-posture-alert`.
The first shipped F6B slice is exactly `F6B-alert-to-investigation-mission-foundation`.
The shipped F6C slice is exactly `F6C-collections-pressure-monitor-foundation`.
The shipped F6D slice is exactly `F6D-payables-pressure-monitor-foundation`.
The shipped F6E slice is exactly `F6E-policy-covenant-threshold-monitor-foundation`.
The shipped F6F slice is exactly `F6F-monitor-demo-replay-and-stack-pack-foundation`.
The shipped F6G slice is exactly `F6G-non-cash-alert-to-investigation-generalization-foundation`.
The shipped F6H slice is exactly `F6H-close-control-checklist-foundation`.
The shipped F6I slice is exactly `F6I-stack-pack-expansion-and-close-control-demo-foundation`.
The shipped F6J slice is exactly `F6J-operator-notification-readiness-foundation`.
The shipped F6K slice is exactly `F6K-close-control-acknowledgement-foundation`.
The shipped F6L slice is exactly `F6L-bank-card-source-pack-foundation`.
The shipped F6M slice is exactly `F6M-external-notification-delivery-planning-foundation`.
The shipped F6N slice is exactly `F6N-close-control-review-summary-foundation`.
The shipped F6O slice is exactly `F6O-receivables-payables-source-pack-foundation`.
The shipped F6P slice is exactly `F6P-external-provider-boundary-foundation`.
The shipped F6Q slice is exactly `F6Q-close-control-certification-boundary-foundation`.
The shipped F6R slice is exactly `F6R-contract-obligation-source-pack-foundation`.
The shipped F6S slice is exactly `F6S-external-delivery-human-confirmation-boundary-foundation`.
The shipped F6U slice is exactly `F6U-ledger-reconciliation-source-pack-foundation`.
The shipped F6T contract is exactly `F6T-close-control-certification-safety-foundation` and is not actual certification.
The shipped F6W slice is exactly `F6W-policy-covenant-document-source-pack-foundation` and is source-pack-only implementation.
The shipped F6Y slice is exactly `F6Y-board-lender-document-source-pack-foundation` and is source-pack-only implementation.
The shipped F6Z record is exactly `F6Z-final-f6-v1-exit-audit-and-handoff` and is docs-and-validation-only.

Focus:

- deterministic monitors over stored source, Finance Twin, CFO Wiki, and proof state
- one first `cash_posture` monitor result
- one second `collections_pressure` monitor result over stored receivables-aging or collections-posture state only
- one third `payables_pressure` monitor result over stored payables-aging or payables-posture state only
- one fourth `policy_covenant_threshold` monitor result over stored CFO Wiki policy-document posture, deterministic policy extracts, policy pages, policy-corpus posture, and explicit comparable Finance Twin posture only
- one operator-visible alert-card posture when source-backed conditions warrant it
- explicit source lineage, freshness or missing-source posture, limitations, proof-bundle posture, deterministic severity rationale, and human-review next step
- manual alert-to-investigation handoff first, the shipped policy/covenant threshold monitor, one deterministic demo replay, one stack-pack foundation, benchmark support, and the shipped collections-first non-cash alert handoff only where a concrete source-backed need exists
- one deterministic close/control checklist foundation that reviews source coverage, source freshness, policy-source posture, and monitor replay readiness without adding alert semantics
- one shipped stack-pack expansion that adds normalized close/control checklist expected output to the existing `pocket-cfo-monitor-demo` replay proof without adding product runtime behavior
- one shipped internal operator attention/readiness read model that can show which shipped source-backed posture needs review without external delivery
- one shipped internal close/control acknowledgement-readiness foundation that can show whether shipped checklist/readiness posture is ready for operator review acknowledgement without approvals, close-complete status, delivery, runtime-Codex, missions, monitor reruns, or finance actions
- one shipped bank/card source-pack proof over checked-in bank-account-summary and card-expense posture without delivery, runtime-Codex, reports, approvals, monitor-family expansion, or discovery-family expansion
- one shipped deterministic internal delivery-readiness result, not actual external delivery
- one shipped receivables/payables source-pack foundation that stays fixture/manifest/proof-oriented and does not add product runtime behavior
- one shipped internal provider-boundary/readiness result that can review future provider boundaries without adding provider calls, provider credentials, provider jobs, outbox sends, delivery, reports, approvals, generated prose, runtime-Codex, finance actions, or new monitor/discovery families
- one shipped F6Q internal certification-boundary/readiness result that can review the boundary around any future certification without adding actual certification, close-complete status, sign-off, attestation, legal/audit opinion, assurance, approval, report release, report circulation, provider calls, provider credentials, provider jobs, delivery, outbox sends, generated prose, runtime-Codex, finance actions, or new monitor/discovery families
- one shipped F6R contract/obligation source-pack foundation that stays fixture/manifest/proof-oriented, source role `contract_metadata` only, extractor key `contract_metadata_csv` only, proof surface limited to existing source registry and Finance Twin contract/obligation routes, direct proof `pnpm exec tsx tools/contract-obligation-source-pack-proof.mjs`, and no product runtime behavior
- one shipped F6S deterministic internal external-delivery human-confirmation / delivery-preflight boundary, not actual external delivery, with no send behavior, provider calls, provider credentials, provider jobs, outbox sends, scheduled delivery, auto-send, report creation/release/circulation, approvals, certification, generated prose, runtime-Codex, source mutation, finance actions, monitor reruns, missions, or autonomous action
- one shipped F6U ledger/reconciliation source-pack foundation that stays fixture/manifest/proof-oriented, source roles `chart_of_accounts`, `trial_balance`, and `general_ledger` only, extractor keys `chart_of_accounts_csv`, `trial_balance_csv`, and `general_ledger_csv` only, proof surface limited to existing source registry and Finance Twin sync/read/reconciliation routes, direct proof `pnpm exec tsx tools/ledger-reconciliation-source-pack-proof.mjs`, and no product runtime behavior
- one shipped F6W policy/covenant document source-pack foundation that stays fixture/manifest/proof-oriented, source role and document role `policy_document` only, source kind `document` only, media types `text/markdown` and `text/plain` only, proof surface limited to existing source registry and CFO Wiki bind/compile/read routes, direct proof `pnpm exec tsx tools/policy-covenant-document-source-pack-proof.mjs`, and no product runtime behavior
- one shipped F6Y board/lender document source-pack foundation that stays fixture/manifest/proof-oriented, document roles `board_material` and `lender_document` only, source kind `document` only, media types `text/markdown` and `text/plain` only, proof surface limited to existing source registry and CFO Wiki bind/compile/read routes, direct proof `pnpm exec tsx tools/board-lender-document-source-pack-proof.mjs`, and no product runtime behavior

Exit criteria:

- one deterministic `cash_posture` monitor can produce a reviewable monitor result and alert card without runtime-codex, delivery, autonomous remediation, or new discovery families
- one operator can manually create or open a deterministic investigation mission from one persisted `cash_posture` alert without automatic mission creation, notifications, runtime-codex, delivery, report conversion, or a second alert system
- one deterministic `collections_pressure` monitor can persist a reviewable monitor result and optional alert card from stored receivables-aging or collections-posture state only, while staying investigation-free in F6C
- the shipped F6D slice supports one deterministic `payables_pressure` monitor without investigations, delivery, payment behavior, runtime-Codex, reports, approvals, or multi-monitor widening
- the shipped F6E slice supports one deterministic `policy_covenant_threshold` monitor without investigations, delivery, runtime-Codex, legal or policy advice, reports, approvals, new discovery families, or broad monitoring-platform behavior
- the shipped F6F slice proves a new user can bootstrap one demo company from checked-in source files and docs, then replay the shipped monitor stack deterministically
- the shipped F6G slice lets an operator manually create or open one taskless deterministic investigation mission from one persisted alerting `collections_pressure` monitor result, while preserving shipped cash behavior and rejecting payables and policy/covenant investigations
- the shipped F6H slice produces one company-scoped deterministic checklist result/read model from stored Finance Twin posture, stored CFO Wiki policy/source posture, and latest persisted monitor results as context only, with each item carrying source posture, evidence basis, freshness or limitations, status, proof posture, and human-review next step; it makes no close-complete assertion
- the shipped F6I record extends the existing demo stack-pack proof so one replay verifies shipped monitor outputs, cash plus collections handoffs, payables and policy/covenant investigation absence, normalized close/control checklist items, aggregate status, absence boundaries, fixture immutability, and no new monitor or discovery families
- the shipped F6J slice stays internal and delivery-free: it adds one deterministic operator readiness/read model over shipped stored state with evidence basis, freshness, limitations, proof posture, status, human-review next steps, and runtime/action absence boundaries, and no notification provider, outbox send, report delivery, approval, mission creation, monitor rerun, runtime-Codex, autonomous action, or new monitor/discovery family
- the shipped F6K slice stays internal and read-only: it adds one deterministic acknowledgement-readiness result over shipped checklist/readiness posture, with no approval kind, close-complete assertion, report release, external delivery, notification provider, outbox send, runtime-Codex, mission creation, monitor rerun, source mutation, autonomous action, or new monitor/discovery family
- the shipped F6L slice stays source-pack-only: it proves checked-in bank-account-summary and card-expense source-pack posture through existing source registry and Finance Twin routes only
- the shipped F6M slice stays internal and read-only: it adds one deterministic delivery-readiness result over shipped F6J/F6K posture with no provider integration, outbox sends, external delivery, approvals, reports, runtime-Codex drafting, generated notification prose, monitor reruns, mission creation, source mutation, finance writes, advice, or autonomous action
- the shipped F6N slice stays internal and read-only: it adds one deterministic close/control review-summary result over shipped F6H/F6J/F6K/F6M posture with bounded sections, company-scope guardrails, explicit absence boundaries, no certification, no close-complete status, no sign-off, no attestation, no approvals, no report release/circulation, no external delivery/provider/outbox behavior, no generated prose, no runtime-Codex, no monitor reruns, no mission creation, no source mutation, no finance writes, no advice/instructions, no autonomous action, no F6O implementation, and no new monitor or discovery family
- the shipped F6O slice stays source-pack-only: it adds one receivables/payables source-pack foundation with source roles limited to `receivables_aging` and `payables_aging`, extractor keys limited to `receivables_aging_csv` and `payables_aging_csv`, direct proof `pnpm exec tsx tools/receivables-payables-source-pack-proof.mjs`, no package script or root smoke alias, no product runtime behavior, no new monitor or discovery families, no delivery, no reports, no approvals, no runtime-Codex, no generated prose, and no source mutation outside proof upload/sync setup
- the shipped F6P slice stays internal and read-only: it adds one deterministic provider-boundary/readiness result over shipped F6M/F6N posture with bounded internal boundary gates, evidence basis, freshness/limitations, proof posture, status, human-review next step, explicit no-provider-call/no-send/no-outbox/no-report/no-approval/no-generated-prose boundaries, no provider credentials, no provider jobs, no delivery, no runtime-Codex, no finance actions, no monitor-family expansion, and no discovery-family expansion
- the shipped F6Q slice adds one deterministic internal certification-boundary/readiness result over shipped F6N/F6P posture, with bounded internal targets, evidence basis, freshness/limitations, proof posture, status, human-review next step, explicit no-certification/no-close-complete/no-sign-off/no-attestation/no-legal-opinion/no-audit-opinion/no-assurance/no-approval/no-report-release/no-report-circulation/no-delivery/no-provider-call/no-provider-credential/no-provider-job/no-outbox/no-generated-prose boundaries, read-only/no-schema posture, and no F6R implementation in that slice
- the shipped F6R slice adds one contract/obligation source-pack manifest, one immutable checked-in contract-metadata CSV fixture, one normalized expected source/twin posture file, and one deterministic direct proof path, while preserving shipped F5 and F6 behavior and adding no monitor family, discovery family, product runtime behavior, package script, root smoke alias, route, schema, migration, eval dataset, mission behavior, report, approval, delivery, provider call, runtime-Codex, generated prose, source mutation outside proof upload/sync setup, finance write, certification, close-complete status, sign-off, attestation, legal/audit opinion, assurance, or autonomous action
- the shipped F6S slice adds exactly one deterministic internal human-confirmation/readiness result or read model over shipped F6M/F6P/F6Q/F6N posture, with bounded delivery-gate targets, evidence basis, source/freshness posture, limitations, proof posture, status, human-review next step, explicit absence boundaries, read-only/no-schema posture, and no actual delivery, provider call, provider credential, provider job, outbox send, scheduled delivery, auto-send, approval, report creation/release/circulation, certification, mission creation, monitor rerun/result creation, runtime-Codex, generated prose, source mutation, finance write, advice/instruction, autonomous action, new monitor family, or new discovery family
- the shipped F6U slice adds exactly one ledger/reconciliation source-pack manifest, one immutable checked-in chart-of-accounts/trial-balance/general-ledger CSV fixture family, one normalized expected ledger/reconciliation source/twin posture file, and one deterministic direct proof path, while preserving shipped F5 and F6 behavior and adding no product runtime behavior, package script, root smoke alias, route, schema, migration, eval dataset, mission behavior, report, approval, delivery, provider call, provider credential, provider job, runtime-Codex, generated prose, source mutation outside proof upload/sync setup, finance write, certification, close-complete status, sign-off, attestation, legal/audit opinion, assurance, monitor family, discovery family, or autonomous action
- the shipped F6W slice adds exactly one policy/covenant document source-pack manifest, one immutable checked-in markdown/plain-text policy-document fixture family, one normalized expected source/wiki/policy posture file, and one deterministic direct proof path, while preserving shipped F5 and F6 behavior and adding no product runtime behavior, package script, root smoke alias, route, schema, migration, eval dataset, UI, mission behavior, report, approval, delivery, notification provider, provider call, provider credential, provider job, outbox send, runtime-Codex, generated prose, source mutation outside proof upload/bind/compile setup, finance write, certification, certified status, close-complete status, sign-off, attestation, legal/audit opinion, assurance, monitor family, discovery family, payment behavior, legal/policy advice, collection/customer-contact instruction, or autonomous action
- the shipped F6Y slice adds exactly one board/lender document source-pack manifest, one immutable checked-in markdown/plain-text board/lender document fixture family, one normalized expected source/wiki posture file, and one deterministic direct proof path, while preserving shipped F5 and F6 behavior and adding no product runtime behavior, package script, root smoke alias, route, schema, migration, eval dataset, UI, mission behavior, report, board packet, lender update, approval, delivery, provider call, provider credential, provider job, outbox send, runtime-Codex, generated prose, source mutation outside proof upload/bind/compile setup, finance write, certification, certified status, close-complete status, sign-off, attestation, legal/audit opinion, assurance, monitor family, discovery family, payment behavior, legal/policy/board/lender advice, collection/customer-contact instruction, or autonomous action

Slice map:

- `F6A — monitoring foundation and first cash posture alert`
  - start only from one company `companyKey`
  - read existing stored Finance Twin cash-posture state through `FinanceTwinService.getCashPosture(companyKey)`, including source freshness or missing-source posture
  - define one `monitor_result` concept and one `cash_posture` monitor kind
  - produce one alert-card read model only when deterministic source-backed conditions warrant it
  - include severity, source freshness, source lineage, limitations, proof-bundle posture, and a recommended human-review action
  - keep investigation missions, runtime-codex, external notification, delivery, accounting writes, bank writes, tax filings, legal advice, and F5 reporting/approval changes out of scope
- `F6B — alert-to-investigation mission foundation`
  - start only from one persisted F6A `monitor_result` with `monitorKind = "cash_posture"` and `status = "alert"`
  - require one operator-visible alert card with source lineage, freshness or missing-source posture, deterministic severity rationale, limitations, proof posture, and a human-review next step already present
  - reuse the existing mission engine and mission detail/list patterns with `mission.type = "discovery"`, `sourceKind = "alert"`, and a `pocket-cfo://monitor-results/<monitorResultId>` source ref
  - create or open a taskless ready handoff mission instead of queuing finance-discovery runtime work
  - keep the investigation seed deterministic and source-backed with `monitorResultId`, `companyKey`, monitor kind, alert severity, conditions, freshness or missing-source posture, lineage summary, limitations, proof posture, and human-review next step
  - do not create missions automatically from monitor runs, run scheduled monitor automation, send notifications, invoke runtime-codex, write investigation prose with an LLM, invent finance facts, create external actions, turn the alert into a report, add an approval kind, or add a second alert system
- `F6C — collections_pressure monitor foundation`
  - shipped implementation record in `plans/FP-0052-collections-pressure-monitor-foundation.md`
  - first F6C monitor family is exactly `collections_pressure`
  - start only from one `companyKey` plus stored Finance Twin receivables-aging or collections-posture state
  - produce one deterministic `monitor_result` with `monitorKind = "collections_pressure"` plus one optional alert card when source-backed conditions warrant it
  - reuse `apps/control-plane/src/modules/monitoring/**`, `monitor_results`, and existing monitoring alert-card patterns
  - does not create investigations, rerun cash monitors as input, use F6B investigation missions as input, add reports or approvals, invoke runtime-codex, add delivery, or widen into a broad monitoring platform
- `F6D — payables_pressure monitor foundation`
  - shipped implementation record in `plans/FP-0053-payables-pressure-monitor-foundation.md`
  - first F6D monitor family is exactly `payables_pressure`
  - start only from one `companyKey` plus stored Finance Twin payables-aging or payables-posture state
  - produce one deterministic `monitor_result` with `monitorKind = "payables_pressure"` plus one optional alert card when source-backed conditions warrant it
  - reuse `apps/control-plane/src/modules/monitoring/**`, `monitor_results`, and existing monitoring alert-card patterns
  - does not create investigations, rerun cash or collections monitors as input, use F6B investigation missions as input, add payment instructions or vendor-payment recommendations, add reports or approvals, invoke runtime-codex, add delivery, or widen into a broad monitoring platform
- `F6E — policy/covenant threshold monitor foundation`
  - shipped implementation record in `plans/FP-0054-policy-covenant-threshold-monitor-foundation.md`
  - first F6E monitor family is exactly `policy_covenant_threshold`
  - start only from one `companyKey` plus stored CFO Wiki policy-document bindings, deterministic policy extracts, policy pages, policy-corpus posture, source freshness or missing-source posture, source lineage refs, limitations, and explicit comparable Finance Twin posture when threshold comparison is possible
  - produce one deterministic `monitor_result` with `monitorKind = "policy_covenant_threshold"` plus one optional alert card when source-backed conditions warrant it
  - condition kinds stay narrow: `missing_source`, `failed_source`, `stale_source`, `coverage_gap`, `data_quality_gap`, `threshold_breach`, and `threshold_approaching`
  - `threshold_breach` and `threshold_approaching` require explicit stored threshold facts plus explicit comparable stored actual posture; otherwise the monitor reports coverage or data-quality posture
  - reuse `apps/control-plane/src/modules/monitoring/**`, `monitor_results`, and existing monitoring alert-card patterns
  - does not create investigations, use F6B investigation missions as input, rerun cash/collections/payables monitors as input, add policy advice or legal interpretation, add reports or approvals, invoke runtime-codex, add delivery, add payment behavior, add a discovery family, or widen into a broad monitoring platform
- `F6F — monitor demo replay and stack-pack foundation`
  - shipped implementation record in `plans/FP-0055-monitor-demo-replay-and-stack-pack-foundation.md`
  - first F6F scope is exactly `F6F-monitor-demo-replay-and-stack-pack-foundation`
  - not a new monitor family and not a discovery-family expansion
  - input contract is one checked-in demo stack-pack fixture set with source files for bank/cash, receivables aging, payables aging, and policy threshold docs
  - includes deterministic source registration through `pnpm smoke:monitor-demo-replay:local` and expected monitor outputs for `cash_posture`, `collections_pressure`, `payables_pressure`, and `policy_covenant_threshold`
  - includes the expected monitor investigation handoff boundary where demo alert results are eligible
  - output contract is one deterministic replay smoke summary; no durable replay artifact or schema was added
  - no new monitor result semantics, alert condition kinds, approval kinds, runtime-Codex, delivery, payments, legal/policy advice, reports, or autonomous remediation
- `F6G — non-cash alert-to-investigation generalization`
  - shipped implementation record in `plans/FP-0056-non-cash-alert-investigation-generalization-foundation.md`
  - first F6G scope is exactly `F6G-non-cash-alert-to-investigation-generalization-foundation`
  - manual operator-initiated handoff only
  - start only from one persisted alerting `collections_pressure` monitor result with one alert card already carrying source freshness or missing-source posture, source lineage refs, deterministic severity rationale, limitations, proof posture, and a human-review next step
  - preserve the shipped `cash_posture` create/open behavior from F6B
  - reuse the existing mission engine with `mission.type = "discovery"`, `sourceKind = "alert"`, and `pocket-cfo://monitor-results/<monitorResultId>` as the source ref
  - create or open a taskless ready handoff mission instead of queuing finance-discovery runtime work
  - do not create missions automatically from monitor runs, schedule monitors, send notifications, invoke runtime-Codex, write investigation prose with an LLM, invent finance facts, create reports, add approvals, add delivery, create payment instructions, recommend vendor payments, create collection actions, add customer-contact instructions, add legal or policy advice, or take autonomous action
  - keep `payables_pressure` and `policy_covenant_threshold` investigations out of the first F6G implementation
- `F6H — close/control checklist foundation`
  - shipped implementation record in `plans/FP-0057-close-control-checklist-foundation.md`
  - first F6H scope is exactly `F6H-close-control-checklist-foundation`
  - not a monitor family and not a discovery-family expansion
  - start only from one `companyKey`, stored Finance Twin source posture, stored CFO Wiki policy/source posture where relevant, and optionally latest monitor results as context only
  - input must not be generic chat, `finance_memo`, `board_packet`, `lender_update`, `diligence_packet`, runtime-Codex, or an F6B/F6G investigation mission
  - output is one deterministic checklist result or read model with a bounded set of items
  - first checklist item families are source coverage review, cash source freshness review, receivables-aging source freshness review, payables-aging source freshness review, policy-source freshness review, and monitor replay readiness
  - each item must include source posture, evidence basis, freshness or limitations, status, and a human-review next step
  - no "close complete" status shipped; the aggregate is `ready_for_review`, `needs_review`, or `blocked_by_evidence`
  - packaged proof: `pnpm smoke:close-control-checklist:local`
  - no runtime-Codex, email, Slack, webhooks, notification delivery, approval kind, report conversion, accounting write, bank write, journal booking, tax filing, legal advice, policy advice, payment instruction, collection instruction, customer-contact instruction, or autonomous remediation
  - preserve shipped F5 and F6 behavior: no monitor evaluator changes, no F6B/F6G mission changes, no payables or policy/covenant investigations, and no new monitor or discovery families
- `F6I — stack-pack expansion and close/control demo foundation`
  - shipped implementation record in `plans/FP-0058-stack-pack-expansion-and-close-control-demo-foundation.md`
  - first F6I scope is exactly `F6I-stack-pack-expansion-and-close-control-demo-foundation`
  - not a monitor family and not a discovery-family expansion
  - expand the existing `pocket-cfo-monitor-demo` stack-pack, not a second demo platform
  - input contract is one checked-in demo stack-pack fixture set, existing source files for bank/cash, receivables aging, payables aging, and policy thresholds, existing expected monitor results, one new normalized expected close/control checklist result, and the existing source registration/replay route flow
  - output contract is one deterministic replay proof that verifies the four shipped monitor families, cash and collections handoffs where alerting, payables and policy/covenant investigations absent, close/control checklist items, aggregate status, close/control absence boundary, fixture source immutability, and no new monitor or discovery families
  - use the existing `pnpm smoke:monitor-demo-replay:local` proof; do not add a new package script
  - did not add routes, schema, migrations, monitor evaluators, mission behavior, runtime-Codex, delivery, reports, approvals, new checklist item families, new monitor condition kinds, or investigation behavior
- `F6J — operator notification readiness foundation`
  - shipped implementation record in `plans/FP-0059-operator-notification-readiness-foundation.md`
  - not a monitor family and not a discovery-family expansion
  - internal operator-visible readiness only, not external delivery
  - start only from shipped stored state: latest persisted monitor results, close/control checklist read posture, source and CFO Wiki freshness posture, and monitor demo replay proof posture only as stored/expected proof context
  - output contract is one deterministic internal operator attention/readiness result or read model with bounded attention items
  - each item must include evidence basis, source lineage or proof reference, freshness or missing-source posture, limitations, proof posture, status, and a human-review next step
  - packaged proof: `pnpm smoke:operator-readiness:local`
  - no email, Slack, SMS, webhook, notification provider call, outbox send behavior, report delivery, external publish behavior, operator delivery workflow, approval, report conversion, mission creation, monitor rerun, runtime-Codex drafting, payment behavior, legal or policy advice, collection/customer-contact instruction, autonomous action, monitor-family expansion, or discovery-family expansion
- `F6K — close/control acknowledgement`
  - shipped implementation record in `plans/FP-0060-close-control-acknowledgement-foundation.md`
  - first F6K scope is exactly `F6K-close-control-acknowledgement-foundation`
  - internal operator-visible acknowledgement readiness only, not approval, sign-off, certification, close completion, report release, or external delivery
  - start only from shipped stored/read state: close/control checklist result or read posture, operator-readiness result or read posture, latest persisted monitor results only as context if needed, and source/CFO Wiki freshness posture already surfaced through those reads
  - input must not be generic chat, report artifacts as primary input, runtime-Codex, mission-generated prose, monitor reruns, or demo replay runtime execution
  - output contract is one deterministic acknowledgement-readiness result for a bounded target such as the current close/control checklist aggregate plus item-family blockers when relevant
  - each target must include source/evidence basis, freshness or missing-source posture, limitations, proof posture, and a human-review next step
  - shipped read-only/no-schema; any later persisted acknowledgement record must be additive, idempotent, company-scoped, evidence-linked, actor-attributed, and explicitly not an approval or close-complete record
  - packaged proof: `pnpm smoke:close-control-acknowledgement:local`
  - no email, Slack, SMS, webhook, notification provider call, outbox send behavior, report delivery, external publish behavior, approval kind, report conversion, mission creation, monitor rerun, runtime-Codex drafting, payment behavior, legal or policy advice, collection/customer-contact instruction, autonomous action, monitor-family expansion, or discovery-family expansion
- `F6L — source-pack expansion`
  - shipped implementation record in `plans/FP-0061-source-pack-expansion-foundation.md`
  - first source-pack family is exactly `bank-card-source-pack-foundation`
  - not a monitor family and not a discovery-family expansion
  - starts only from checked-in static bank-account-summary and card-expense source-pack posture, expected normalized source/twin posture, existing source registration/upload routes, and existing Finance Twin sync/read routes
  - output contract is one `pocket-cfo-bank-card-source-pack` manifest, one immutable checked-in fixture set, one normalized expected source/twin posture file, and one direct deterministic proof path: `pnpm exec tsx tools/bank-card-source-pack-proof.mjs`
  - did not add routes, schema, migrations, package scripts, smoke aliases, eval datasets, monitor evaluators, mission behavior, checklist/readiness/acknowledgement behavior, runtime-Codex, delivery, reports, approvals, payment behavior, finance writes, legal or policy advice, collection/customer-contact instructions, autonomous action, new monitor families, or new discovery families
- `F6M — external notification/delivery planning`
  - shipped implementation record in `plans/FP-0062-external-notification-delivery-planning-foundation.md`
  - first implementation is internal delivery-readiness only, not actual delivery
  - start only from shipped stored/read state: F6J operator-readiness result or read posture, F6K close/control acknowledgement-readiness result or read posture, F6H close/control checklist result, latest persisted monitor results only as context, and source/CFO Wiki freshness posture already surfaced through those reads
  - input must not be generic chat, report artifacts as primary input, runtime-Codex, mission-generated prose, monitor reruns, demo replay runtime execution, or generated notification prose
  - output contract is one deterministic internal delivery-readiness result or read model with a bounded list of delivery-readiness targets
  - each target must include evidence basis, source lineage or proof reference, freshness or missing-source posture, limitations, proof posture, status, and a human-review next step
  - output must include explicit absence boundaries showing no email, Slack, SMS, webhook, notification provider call, outbox send, scheduled notification, auto-send, report delivery, external publish behavior, approval, report, mission creation, monitor rerun, runtime-Codex drafting, generated notification prose, source mutation, finance write, legal/policy/payment/collection/customer-contact instruction, or autonomous action occurred
  - shipped read-only and no-schema
  - packaged proof: `pnpm smoke:delivery-readiness:local`
  - no F5 report/release/circulation/correction changes, no monitor evaluator changes, no F6B/F6G mission changes, no F6H checklist behavior changes, no F6J readiness behavior changes, no F6K acknowledgement behavior changes, no F6L source-pack behavior changes, no new approval kind, no report conversion, and no monitor-family or discovery-family expansion
- `F6N — close/control review summary foundation`
  - shipped implementation record in `plans/FP-0063-close-control-review-summary-foundation.md`
  - first implementation is an internal close/control review summary only, not certification
  - starts only from shipped stored/read state: F6H close/control checklist posture, F6J operator-readiness posture, F6K acknowledgement-readiness posture, F6M delivery-readiness posture, and source/CFO Wiki freshness posture already surfaced through those reads
  - output contract is one deterministic internal close/control review-summary result with bounded sections for checklist posture, operator-readiness posture, acknowledgement-readiness posture, delivery-boundary posture, monitor-context posture, and source/CFO Wiki freshness posture
  - each section includes evidence basis, source lineage or proof refs where available, freshness or missing-source posture, limitations, proof posture, internal review status, and a human-review next step
  - shipped read-only and no-schema
  - route: `GET /close-control/companies/:companyKey/review-summary`
  - no certification status, close-complete status, sign-off, attestation, legal opinion, audit opinion, approval workflow, report release, report circulation, external delivery, generated prose, runtime-Codex drafting, finance writes, legal/policy/payment/collection/customer-contact instruction, autonomous action, monitor-family expansion, discovery-family expansion, or F6O implementation
  - preserves shipped F5 and F6 behavior: no F5 report/release/circulation/correction changes, no monitor evaluator changes, no F6B/F6G mission changes, no F6H checklist behavior changes, no F6J readiness behavior changes, no F6K acknowledgement behavior changes, no F6L source-pack behavior changes, no F6M delivery-readiness behavior changes, no new approval kind, no report conversion, and no monitor-family or discovery-family expansion
- `F6O — additional source-pack expansion`
  - shipped implementation record in `plans/FP-0064-receivables-payables-source-pack-foundation.md`
  - first F6O scope is exactly `F6O-receivables-payables-source-pack-foundation`
  - not a monitor family and not a discovery-family expansion
  - one source-pack family only
  - source roles are exactly `receivables_aging` and `payables_aging`
  - extractor keys are exactly `receivables_aging_csv` and `payables_aging_csv`
  - starts only from checked-in static receivables-aging and payables-aging source-pack posture, expected normalized source/twin posture, existing source registration/upload routes, and existing Finance Twin sync/read routes
  - output contract is one `pocket-cfo-receivables-payables-source-pack` manifest, one immutable checked-in fixture set, one normalized expected source/twin posture file, and one direct deterministic proof path: `pnpm exec tsx tools/receivables-payables-source-pack-proof.mjs`
  - no new monitor result semantics, checklist item families, readiness behavior, acknowledgement behavior, delivery-readiness behavior, review-summary behavior, investigation behavior, mission behavior, report behavior, approval behavior, delivery behavior, runtime-Codex behavior, source mutation, finance write, legal/policy/payment/collection/customer-contact instruction, autonomous action, new monitor family, or new discovery family
  - no package script or root smoke alias was added
  - preserve shipped F5 and F6 behavior, including F6L bank/card source-pack proof and F6N review-summary posture
- `F6P — external provider boundary foundation`
  - shipped implementation record in `plans/FP-0065-external-provider-boundary-foundation.md`
  - implementation is internal provider-boundary/readiness only, not provider integration and not actual delivery
  - starts only from shipped stored/read state: F6M delivery-readiness posture and F6N close/control review-summary posture
  - input is not generic chat, report artifacts as primary input, runtime-Codex, mission-generated prose, monitor reruns, demo replay runtime execution, provider state, provider credentials, outbox jobs, external communications, or generated notification prose
  - output contract is one deterministic internal provider-boundary/readiness result with bounded internal boundary targets, not provider jobs, channel sends, recipient targets, credential records, send records, or delivery logs
  - each target includes evidence basis, freshness or missing-source posture, limitations, proof posture, status, and human-review next step
  - statuses are review-oriented: `ready_for_provider_boundary_review`, `needs_human_review_before_provider_boundary`, and `blocked_by_evidence`
  - output includes explicit absence boundaries showing no email, Slack, SMS, webhook, notification provider call, provider credential flow, provider job, outbox send, scheduled notification, auto-send, report delivery, external publish behavior, approval, report, mission creation, monitor rerun, runtime-Codex drafting, generated prose, source mutation, finance write, legal/policy/payment/collection/customer-contact instruction, or autonomous action occurred
  - implementation is read-only and no-schema; any later persistence requires a future named plan and must not be a send record, provider job, outbox send, delivery log, approval, report release, certification, or close-complete record
  - no F5 report/release/circulation/correction changes, no monitor evaluator changes, no F6B/F6G mission changes, no F6H checklist behavior changes, no F6J readiness behavior changes, no F6K acknowledgement behavior changes, no F6L bank/card source-pack behavior changes, no F6M delivery-readiness behavior changes, no F6N review-summary behavior changes, no F6O receivables/payables source-pack behavior changes, no new approval kind, no report conversion, and no monitor-family or discovery-family expansion
- `F6Q — close/control certification boundary foundation`
  - shipped implementation record in `plans/FP-0066-close-control-certification-boundary-foundation.md`
  - implementation is internal certification-boundary/readiness only, not actual certification
  - starts only from shipped stored/read state: F6N close/control review-summary posture and F6P external-provider-boundary posture; F6M delivery-readiness, F6K acknowledgement-readiness, F6H checklist, F6J operator-readiness, latest persisted monitor results, and source/CFO Wiki freshness posture may be used only as context through shipped read services if needed
  - input is not generic chat, report artifacts as primary input, runtime-Codex, mission-generated prose, monitor reruns, demo replay runtime execution, provider state, provider credentials, outbox jobs, external communications, or generated prose
  - output contract is one deterministic internal certification-boundary/readiness result with bounded certification-boundary targets, not certification, close-complete status, sign-off, attestation, legal opinion, audit opinion, approval, report release, report circulation, provider job, channel send, recipient target, credential record, send record, delivery log, assurance record, or autonomous action
  - each target includes evidence basis, freshness or missing-source posture, limitations, proof posture, status, and human-review next step
  - statuses are review-oriented, such as `ready_for_certification_boundary_review`, `needs_human_review_before_certification_boundary`, and `blocked_by_evidence`
  - output includes explicit absence boundaries showing no certification, close complete, sign-off, attestation, legal/audit opinion, email, Slack, SMS, webhook, notification provider call, provider credential flow, provider job, outbox send, scheduled notification, auto-send, report delivery, external publish behavior, approval, report, mission creation, monitor rerun, runtime-Codex drafting, generated prose, source mutation, finance write, legal/policy/payment/collection/customer-contact instruction, or autonomous action occurred
  - implementation is read-only and no-schema; any later persistence requires a future named plan and must not be a certification record, approval record, close-complete record, sign-off record, attestation record, report-release record, legal opinion, audit opinion, assurance record, delivery log, provider job, or outbox send
  - no F5 report/release/circulation/correction changes, no monitor evaluator changes, no F6B/F6G mission changes, no F6H checklist behavior changes, no F6J readiness behavior changes, no F6K acknowledgement behavior changes, no F6L bank/card source-pack behavior changes, no F6M delivery-readiness behavior changes, no F6N review-summary behavior changes, no F6O receivables/payables source-pack behavior changes, no F6P provider-boundary behavior changes, no new approval kind, no report conversion, and no monitor-family or discovery-family expansion
- `F6R — additional source-pack expansion`
  - shipped record in `plans/FP-0067-contract-obligation-source-pack-foundation.md`
  - shipped F6R scope is exactly `F6R-contract-obligation-source-pack-foundation`
  - not a monitor family and not a discovery-family expansion
  - one source-pack family only
  - source role is exactly `contract_metadata`
  - extractor key is exactly `contract_metadata_csv`
  - starts only from checked-in static contract-metadata source-pack posture, expected normalized source/twin posture, existing source registration/upload routes in proof tooling only, and existing Finance Twin contract-metadata sync plus contract inventory and obligation-calendar read routes in proof tooling only
  - input must not be generic chat, report artifacts as primary input, runtime-Codex, mission-generated prose, monitor reruns, demo replay runtime execution, provider state, provider credentials, outbox jobs, external communications, generated prose, or source mutation beyond proof upload/sync setup
  - output contract is one `pocket-cfo-contract-obligation-source-pack` manifest, one immutable checked-in fixture set, one normalized expected contract/obligation source/twin posture file, obligation-calendar posture, and one direct deterministic proof path at `pnpm exec tsx tools/contract-obligation-source-pack-proof.mjs`
  - proof verifies raw fixture immutability, source/file/snapshot/checksum posture, `contract_metadata_csv` sync, contract inventory posture, obligation-calendar posture, source/twin lineage, freshness, diagnostics, limitations, and fixed monitor/discovery family boundaries
  - no new monitor result semantics, checklist item families, readiness behavior, acknowledgement behavior, delivery-readiness behavior, review-summary behavior, provider-boundary behavior, certification-boundary behavior, investigation behavior, mission behavior, report behavior, approval behavior, delivery behavior, runtime-Codex behavior, provider call, provider credential, provider job, outbox send, source mutation outside proof upload/sync setup, generated prose, finance write, legal/policy/payment/collection/customer-contact instruction, autonomous action, new monitor family, or new discovery family
  - no package script or root smoke alias unless FP-0067 is explicitly amended
  - preserve shipped F5 and F6 behavior, including F6L bank/card source-pack proof, F6O receivables/payables source-pack proof, F6P provider-boundary posture, and F6Q certification-boundary posture
- `F6S — external delivery human-confirmation boundary foundation`
  - shipped implementation record in `plans/FP-0068-external-delivery-human-confirmation-boundary-foundation.md`
  - implementation is internal human-confirmation / delivery-preflight readiness only, not actual external delivery
  - route is `GET /external-delivery/companies/:companyKey/human-confirmation-boundary`
  - starts only from shipped stored/read state: F6M delivery-readiness posture, F6P external-provider-boundary posture, F6Q close/control certification-boundary posture, and F6N close/control review-summary posture; F6J/F6K/F6H posture, latest persisted monitor results, and source/CFO Wiki freshness posture may be used only as context through shipped read services if needed
  - input is not generic chat, report artifacts as primary input, runtime-Codex, mission-generated prose, monitor reruns, demo replay runtime execution, provider state, provider credentials, outbox jobs, external communications, generated notification prose, generated prose, or source mutation
  - output contract is one deterministic internal external-delivery human-confirmation readiness result with bounded delivery-gate targets, not provider jobs, channel sends, recipient targets, credential records, send records, delivery logs, approvals, report releases, certifications, close-complete records, sign-offs, attestations, legal/audit opinions, or autonomous actions
  - target families are `delivery_readiness_confirmation_boundary`, `provider_boundary_confirmation_boundary`, `certification_boundary_confirmation_boundary`, `review_summary_confirmation_boundary`, `source_freshness_and_proof_boundary`, and `human_confirmation_absence_boundary`
  - each target includes evidence basis, source/freshness posture, limitations, proof posture, internal review status, and human-review next step
  - statuses are review-oriented, such as `ready_for_human_confirmation_review`, `needs_human_review_before_confirmation`, and `blocked_by_evidence`
  - output includes explicit absence boundaries showing no email, Slack, SMS, webhook, notification provider call, provider credential flow, provider job, outbox send, scheduled delivery, auto-send, report delivery, external publish behavior, approval, report release, report circulation, certification, close-complete status, sign-off, attestation, legal/audit opinion, mission creation, monitor rerun, runtime-Codex drafting, generated prose, source mutation, finance write, legal/policy/payment/collection/customer-contact instruction, or autonomous action occurred
  - implementation is read-only and no-schema; any later persistence requires a future named plan and must not be a send record, provider call record, provider job, outbox send, delivery log, approval, report release, certification, close-complete record, sign-off, attestation, legal opinion, audit opinion, assurance record, or autonomous-action record
  - no F5 report/release/circulation/correction changes, no monitor evaluator changes, no F6B/F6G mission changes, no F6H checklist behavior changes, no F6J readiness behavior changes, no F6K acknowledgement behavior changes, no F6L bank/card source-pack behavior changes, no F6M delivery-readiness behavior changes, no F6N review-summary behavior changes, no F6O receivables/payables source-pack behavior changes, no F6P provider-boundary behavior changes, no F6Q certification-boundary behavior changes, no F6R source-pack behavior changes, no new approval kind, no report conversion, and no monitor-family or discovery-family expansion
- `F6T — close/control certification-safety foundation`
  - shipped implementation record in `plans/FP-0070-close-control-certification-safety-foundation.md`
  - shipped one deterministic internal certification-safety/readiness read model through `GET /close-control/companies/:companyKey/certification-safety`, not actual certification
  - starts only from shipped stored/read state: F6Q certification-boundary posture, F6S human-confirmation posture, and F6N review-summary posture
  - output contract is one deterministic internal certification-safety/readiness result with bounded certification-safety targets
  - each target includes evidence basis, source/freshness posture, limitations, proof posture, status, and human-review next step
  - statuses remain review-oriented: `ready_for_certification_safety_review`, `needs_human_review_before_certification_safety`, and `blocked_by_evidence`
  - no certification records, certified status, certification complete, close-complete status, sign-off, attestation, assurance, legal opinion, audit opinion, approval, report creation, report release, report circulation, external delivery, provider call, provider credential, provider job, outbox send, scheduled delivery, auto-send, mission creation, monitor rerun/result creation, source mutation, runtime-Codex, generated prose, finance write, payment behavior, advice/instruction, customer-contact instruction, autonomous action, new monitor family, or new discovery family
  - implementation is read-only and no-schema; any later persistence requires a future named plan and must be additive, idempotent, company-scoped, evidence-linked, and explicitly not a certification record, approval record, close-complete record, sign-off, attestation, assurance, legal/audit opinion, report-release record, delivery record, provider job, outbox send, or external representation
  - preserve shipped F5 and F6 behavior, including F6Q certification-boundary posture, F6S human-confirmation posture, and F6U ledger/reconciliation source-pack proof
- `F6U — ledger/reconciliation source-pack foundation`
  - shipped implementation record in `plans/FP-0069-ledger-reconciliation-source-pack-foundation.md`
  - first F6U scope is exactly `F6U-ledger-reconciliation-source-pack-foundation`
  - not a monitor family, not a discovery-family expansion, not certification, not provider integration, and not external delivery
  - one source-pack family only
  - source roles are exactly `chart_of_accounts`, `trial_balance`, and `general_ledger`
  - extractor keys are exactly `chart_of_accounts_csv`, `trial_balance_csv`, and `general_ledger_csv`
  - starts only from checked-in static ledger/reconciliation source-pack posture, expected normalized source/twin/reconciliation posture, existing source registration/upload routes in proof tooling only, and existing Finance Twin sync/read/reconciliation routes in proof tooling only
  - input must not be generic chat, report artifacts as primary input, runtime-Codex, mission-generated prose, monitor reruns, demo replay runtime execution, provider state, provider credentials, outbox jobs, external communications, generated prose, or source mutation beyond proof upload/sync setup
  - output contract is one `pocket-cfo-ledger-reconciliation-source-pack` manifest, one immutable checked-in chart-of-accounts/trial-balance/general-ledger fixture set, one normalized expected ledger/reconciliation source/twin posture file, and one direct deterministic proof path at `pnpm exec tsx tools/ledger-reconciliation-source-pack-proof.mjs`
  - proof verifies raw fixture immutability, source/file/snapshot/checksum posture, `chart_of_accounts_csv`, `trial_balance_csv`, and `general_ledger_csv` sync, account-catalog posture, trial-balance posture, general-ledger posture, reconciliation posture, account-bridge posture, balance-bridge-prerequisites posture, source-backed balance-proof posture, balance-proof lineage, period-context posture, source/twin lineage, freshness, diagnostics, limitations, and fixed monitor/discovery family boundaries
  - no new monitor result semantics, checklist item families, readiness behavior, acknowledgement behavior, delivery-readiness behavior, review-summary behavior, provider-boundary behavior, certification-boundary behavior, human-confirmation behavior, investigation behavior, mission behavior, report behavior, approval behavior, delivery behavior, runtime-Codex behavior, provider call, provider credential, provider job, outbox send, source mutation outside proof upload/sync setup, generated prose, finance write, legal/policy/payment/collection/customer-contact instruction, autonomous action, new monitor family, or new discovery family
  - no package script or root smoke alias was added
  - preserve shipped F5 and F6 behavior, including F6L bank/card source-pack proof, F6O receivables/payables source-pack proof, F6R contract/obligation source-pack proof, F6P provider-boundary posture, F6Q certification-boundary posture, and F6S human-confirmation posture
- `F6V — actual provider integration`
  - later only if a future plan proves provider security, compliance posture, human confirmation, observability, retry behavior, safe failure modes, and no autonomous send
- `F6W — additional source-pack expansion`
  - shipped record in `plans/FP-0071-policy-covenant-document-source-pack-foundation.md`
  - shipped F6W scope is exactly `F6W-policy-covenant-document-source-pack-foundation`
  - one source-pack family only: `pocket-cfo-policy-covenant-document-source-pack`
  - document role is exactly `policy_document`
  - source kind is exactly `document`
  - media types are limited to `text/markdown` and `text/plain`
  - direct proof is `pnpm exec tsx tools/policy-covenant-document-source-pack-proof.mjs`
  - proof surface is limited to existing source registry and CFO Wiki bind, compile, and read routes, with shipped policy/covenant and close/control reads as validation context only
  - not a monitor family, not a discovery-family expansion, not a monitor evaluator change, not product runtime behavior, not runtime-Codex, not provider integration, not external delivery, not approval, not report release, not certification, not legal/policy advice, not audit opinion, and not autonomous finance action
  - shipped implementation proves raw fixture immutability, normalized source/wiki/policy posture, fixed monitor/discovery families, freshness/limitations posture, and absence boundaries without adding routes, schema, migrations, package scripts, root smoke aliases, eval datasets, UI, missions, monitor reruns/results, checklist/readiness/acknowledgement/delivery-readiness/review-summary/provider-boundary/certification-boundary/human-confirmation/certification-safety behavior, delivery, provider calls, provider credentials, provider jobs, outbox sends, reports, approvals, certification, certified status, close-complete status, sign-off, attestation, assurance, legal/audit opinion, payment behavior, legal/policy advice, collection/customer-contact instruction, generated prose, finance writes, autonomous action, or source mutation beyond proof upload/bind/compile setup
- `F6Y — board/lender document source-pack foundation`
  - shipped record in `plans/FP-0072-board-lender-document-source-pack-foundation.md`
  - first F6Y scope is exactly `F6Y-board-lender-document-source-pack-foundation`
  - one source-pack family only: `pocket-cfo-board-lender-document-source-pack`
  - document roles are exactly `board_material` and `lender_document`
  - source kind is exactly `document`
  - media types are limited to `text/markdown` and `text/plain`
  - direct proof is `pnpm exec tsx tools/board-lender-document-source-pack-proof.mjs`
  - proof uses existing source registry and CFO Wiki bind, compile, source-list, source-digest, source-coverage, index/log, and page-read routes only
  - not a monitor family, not a discovery-family expansion, not a monitor evaluator change, not product runtime behavior, not runtime-Codex, not provider integration, not external delivery, not reporting, not approval, not report release, not report circulation, not certification, not legal/policy advice, not audit opinion, and not autonomous finance action
  - shipped implementation preserves raw fixture immutability, normalized source/wiki posture, fixed monitor/discovery families, freshness/limitations posture, and absence boundaries without adding routes, schema, migrations, package scripts, root smoke aliases, eval datasets, UI, missions, monitor reruns/results, checklist/readiness/acknowledgement/delivery-readiness/review-summary/provider-boundary/certification-boundary/human-confirmation/certification-safety behavior, delivery, provider calls, provider credentials, provider jobs, outbox sends, reports, board packets, lender updates, approvals, certification, certified status, close-complete status, sign-off, attestation, assurance, legal/audit opinion, payment behavior, legal/policy/board/lender advice, collection/customer-contact instruction, generated prose, finance writes, autonomous action, or source mutation beyond proof upload/bind/compile setup
- `F6X — actual certification`
  - later only if operator need, legal boundaries, evidence boundaries, review gates, assurance constraints, and non-advice constraints are proven
- `F6Z — final F6/v1 exit audit and handoff`
  - shipped record in `plans/FP-0073-final-f6-v1-exit-audit-and-handoff.md`
  - one final F6/v1 audit and handoff slice only
  - docs-and-validation only
  - no product runtime behavior, route, schema, migration, package script, smoke alias, eval dataset, fixture, monitor family, discovery family, provider integration, outbox/send/delivery behavior, report creation/release/circulation, approval workflow, actual certification, legal/audit opinion, runtime-Codex, generated prose, source mutation, finance write, or autonomous action
  - preserves shipped F6A through F6Y behavior and validates the shipped source-pack proof posture plus safety-boundary posture before later provider or certification planning

## F7 — v1 launch-readiness and active-doc hardening

Shipped record: `plans/FP-0074-v1-launch-readiness-and-active-doc-hardening.md`.

Purpose:

- one v1 launch-readiness and active-doc hardening closeout only
- docs-and-validation only
- no product runtime behavior
- no FP-0075 was created during F7

Scope boundaries:

- no route, schema, migration, package script, smoke alias, eval dataset, fixture, monitor family, discovery family, UI, mission behavior, runtime-Codex, provider integration, outbox/send/delivery behavior, report creation/release/circulation, approval workflow, actual certification, legal/audit opinion, generated prose, source mutation, finance write, or autonomous action
- no F6A/F6C/F6D/F6E monitor evaluator changes
- no F6B/F6G mission handoff changes
- no F6H/F6J/F6K/F6M/F6N/F6P/F6Q/F6S/F6T behavior changes
- no F6L/F6O/F6R/F6U/F6W/F6Y source-pack implementation changes
- no broad FP-0073 rewrite beyond the tiny F7 handoff clarification

Launch-readiness outputs:

- active docs describe current shipped product truth
- README, START_HERE, ACTIVE_DOCS, PLANS, and ROADMAP agree that FP-0050 through FP-0073 are shipped F6 records and FP-0074 is the shipped F7 record
- local-dev lists direct proof and smoke commands without adding scripts
- source-ingest/CFO Wiki docs do not imply provider integration, delivery, report release, certification, approval, source mutation, finance writes, or autonomous action
- Codex App Server docs do not imply runtime-Codex finance actions, launch-readiness drafting, notification prose, or external communications
- seeded-missions and evals docs do not imply generated prose or product-runtime eval behavior
- no report artifact, board packet, lender update, certification artifact, close-complete artifact, provider setup, delivery artifact, approval workflow, or product artifact is created

Validation posture:

- verify direct source-pack proofs for F6L, F6O, F6R, F6U, F6W, and F6Y
- verify raw fixture immutability where each shipped proof asserts it
- verify normalized expected-output posture where each shipped proof asserts it
- verify shipped monitor families remain exactly `cash_posture`, `collections_pressure`, `payables_pressure`, and `policy_covenant_threshold`
- verify shipped discovery families remain exactly `cash_posture`, `collections_pressure`, `payables_pressure`, `spend_posture`, `obligation_calendar_review`, and `policy_lookup`
- verify delivery-readiness is not actual delivery, provider-boundary is not provider integration, certification-boundary is not actual certification, human-confirmation is no-send/no-provider/no-outbox, and certification-safety is non-certifying

Future-only posture:

- F6V actual provider integration remains future only, after provider security, compliance posture, human confirmation, observability, retry behavior, safe failure modes, credential boundaries, provider-job boundaries, outbox boundaries, and no autonomous send are proven
- F6X actual certification remains future only, after operator need, legal boundaries, evidence boundaries, review gates, assurance constraints, non-advice constraints, and non-legal-opinion boundaries are proven
- deeper document precision, PDF, OCR, or vector search remains future only if a later plan proves a source/evidence gap
- F9 product UI launch polish is shipped in `plans/FP-0076-product-ui-launch-polish-foundation.md` as read-only app/web navigation, copy, warning, and status-surface truthfulness only, with no backend runtime behavior and no FP-0077 created during F9

## F8 - v1 future-scope triage and roadmap hardening

Shipped record: `plans/FP-0075-v1-future-scope-triage-and-roadmap-hardening.md`.

Purpose:

- one future-scope decision and roadmap-hardening slice only
- docs-and-validation only
- no product runtime behavior
- no FP-0076 created during F8

Scope boundaries:

- no route, schema, migration, package script, smoke alias, eval dataset, fixture, monitor family, discovery family, UI, mission behavior, runtime-Codex, provider integration, outbox/send/delivery behavior, report creation/release/circulation, approval workflow, actual certification, legal/audit opinion, generated prose, source mutation, finance write, or autonomous action
- no F6A/F6C/F6D/F6E monitor evaluator changes
- no F6B/F6G mission handoff changes
- no F6H/F6J/F6K/F6M/F6N/F6P/F6Q/F6S/F6T behavior changes
- no F6L/F6O/F6R/F6U/F6W/F6Y source-pack implementation changes
- no F6Z final audit rewrite and no broad FP-0074 rewrite

F8 decision contract:

- F8 is not a product feature slice
- F8 does not implement F6V provider integration
- F8 does not implement F6X actual certification
- F8 does not implement product UI launch polish
- F8 does not implement deeper document precision, PDF, OCR, or vector search
- F8 preserves shipped F6 and F7 posture

Subsequent shipped and future slices:

- F6V actual provider integration, future only after provider security, compliance posture, human confirmation, observability, retry behavior, safe failure modes, credential boundaries, provider-job boundaries, outbox boundaries, and no autonomous send are proven
- F6X actual certification, future only after operator need, legal boundaries, evidence boundaries, review gates, assurance constraints, non-advice constraints, and non-legal-opinion boundaries are proven
- F9 product UI launch polish, now shipped in `plans/FP-0076-product-ui-launch-polish-foundation.md` and bounded away from provider, certification, delivery, approval, report-release, legal/audit, generated-prose, finance-action, and autonomous-action behavior
- deeper document precision/PDF/OCR/vector search, future only if a source/evidence gap is proven and provenance, freshness, limitations, and no-generated-prose boundaries stay intact
- v1 public launch handoff, now shipped in `plans/FP-0077-v1-public-launch-handoff.md` as docs-and-validation-only closeout; public launch implementation beyond docs-and-validation, deployment, external comms, launch announcements, and generated launch copy remain future-only until a later reviewed Finance Plan names concrete scope

## F9 - product UI launch polish foundation

Shipped record: `plans/FP-0076-product-ui-launch-polish-foundation.md`.

Purpose:

- one read-only product UI launch-polish foundation only
- app/web navigation, copy, warning, and status-surface truthfulness only
- no backend runtime behavior
- no FP-0077 created during F9

Scope boundaries:

- no backend code, backend route, web API route, schema, migration, package script, smoke alias, eval dataset, fixture, monitor family, discovery family, mission behavior, runtime-Codex, provider integration, outbox/send/delivery behavior, report creation/release/circulation, approval workflow, actual certification, legal/audit opinion, generated prose, source mutation, finance write, product runtime behavior, or autonomous action
- no F6A/F6C/F6D/F6E monitor evaluator changes
- no F6B/F6G mission handoff changes
- no F6H/F6J/F6K/F6M/F6N/F6P/F6Q/F6S/F6T behavior changes
- no F6L/F6O/F6R/F6U/F6W/F6Y source-pack implementation changes
- no FP-0075/F8 rewrite beyond shipped-record freshness wording
- no UI action controls, provider setup UI, credential UI, send/delivery UI, approval controls, report-release/circulation controls, certification controls, close-complete controls, sign-off controls, attestation controls, assurance/legal/audit controls, runtime-Codex drafting controls, source-mutation controls, finance-action controls, payment controls, advice UI, customer-contact instruction UI, or autonomous-action UI

F9 decision contract:

- F9 is not provider integration
- F9 is not certification
- F9 is not generated prose or runtime-Codex
- F9 preserves shipped source/proof posture
- F9 shipped only read-only product-surface hardening: navigation labels, active-doc/product truth links, status copy pointing to source-backed proof surfaces, warnings that delivery/provider/certification/legal/audit actions are future-only, and stale-copy clarification
- F9 did not add UI action controls

Candidate future slices, not created here:

- deeper document precision/PDF/OCR/vector search, future only if a source/evidence gap is proven
- F6V actual provider integration, future only
- F6X actual certification, future only
- v1 public launch handoff is now shipped in `plans/FP-0077-v1-public-launch-handoff.md` as F10 docs-and-validation-only closeout
- public launch implementation beyond docs-and-validation, deployment/external comms, launch announcements, generated launch copy, F6V, F6X, deeper PDF/OCR/vector search, and later work remain future-only unless a later reviewed Finance Plan names exact scope

## F10 - v1 public launch handoff

Shipped record: `plans/FP-0077-v1-public-launch-handoff.md`.

Purpose:

- one v1 public launch handoff closeout only
- docs-and-validation only
- no product runtime behavior
- no FP-0078 created in F10

Scope boundaries:

- no route, schema, migration, package script, smoke alias, eval dataset, fixture, UI, monitor family, discovery family, mission behavior, runtime-Codex, provider integration, outbox/send/delivery behavior, report creation/release/circulation, approval workflow, actual certification, legal/audit opinion, generated prose, source mutation, finance write, product runtime behavior, deployment/external comms, or autonomous action
- no F6A/F6C/F6D/F6E monitor evaluator changes
- no F6B/F6G mission handoff changes
- no F6H/F6J/F6K/F6M/F6N/F6P/F6Q/F6S/F6T behavior changes
- no F6L/F6O/F6R/F6U/F6W/F6Y source-pack implementation changes
- no FP-0074/FP-0075/FP-0076 broad rewrite beyond tiny shipped-record handoff clarification if needed

F10 decision contract:

- F10 is not a product feature slice
- F10 is not provider integration
- F10 is not certification
- F10 is not deeper document precision, PDF, OCR, or vector search
- F10 is not product UI implementation
- F10 preserves shipped F6/F7/F8/F9 behavior
- F10 closed v1 public launch handoff outputs as the FP-0077 shipped record, active-doc agreement, and validation logs only, without creating product artifacts
- F10 verified shipped source-pack proof posture and shipped safety-boundary posture before closing this docs-and-validation handoff

Candidate future slices, not created here:

- one more narrow v1 handoff correction only if a future Finance Plan names a concrete docs/validation gap
- deeper document precision/PDF/OCR/vector search, future only if a source/evidence gap is proven
- F6V actual provider integration, future only
- F6X actual certification, future only
- public launch deployment or external communications, future only if a later roadmap/Finance Plan names exact scope

## Post-F10 / F11 / V2 transition

F11 record: `plans/FP-0078-public-repo-hygiene-and-v2-transition.md`.

Purpose:

- move from shipped F10/v1 public launch handoff into a cleaner public repository and V2 planning posture
- split public-facing and Codex-facing docs before beginning V2 feature work
- move the full shipped FP ledger out of README and into `docs/PROJECT_STATE.md`
- define V2 authority and safety boundaries in `docs/V2_BOUNDARY.md`
- preserve shipped source/proof/safety boundaries while making the repo easier for humans and future Codex threads to understand

F11 - public repo hygiene and V2 transition:

- docs-only public repo hygiene, README split, active-doc freshness, V2 boundary framing, and stale public wording cleanup
- created or refreshed `README.md`, `CODEX_README.md`, `docs/PROJECT_STATE.md`, `docs/V2_BOUNDARY.md`, `START_HERE.md`, `docs/ACTIVE_DOCS.md`, this roadmap, and directly stale active ops/eval docs
- preserves `@pocket-cto/*`, root `pocket-cto`, package names, imports, database names, scripts, GitHub modules, and engineering-twin modules as internal scaffolding
- does not broadly rewrite archived Pocket CTO history
- no product runtime behavior, code, UI, route, schema, migration, package script, smoke alias, eval dataset, fixture, EvidenceIndex, document map, provider integration, actual certification, PDF/OCR/vector implementation, ChatGPT App, MCP server, iOS, OpenClaw, deployment, external communications, source mutation, finance write, generated product prose, autonomous action, or FP-0079

F12 - manual UI and demo-readiness audit:

- shipped through `plans/FP-0079-manual-ui-demo-readiness-audit.md`
- created `docs/qa/v1-ui-demo-readiness-audit.md`
- manually inspected existing app/web product surfaces, screenshot availability, and demo posture
- classified stale public/product copy, missing screenshots, launch-demo clarity gaps, and demo-readiness limits
- added no product feature work; only direct read-only copy corrections proven by the audit were applied
- kept provider, certification, delivery, external communications, package rename, EvidenceIndex, and V2 implementation out of scope

V2A - EvidenceIndex and document-map foundation:

- shipped first foundation record: `plans/FP-0080-evidence-index-and-document-map-foundation.md`
- implements a read-only evidence index and document-map layer only within the FP-0080 contract
- raw sources remain authoritative for document claims
- Finance Twin remains authoritative for structured finance facts
- CFO Wiki remains compiled/derived
- first implementation supports deterministic markdown/plain-text and already-supported source text only
- no deeper PDF/OCR/vector/PageIndex/OpenAI vector store or file-search implementation unless explicitly planned later
- no UI, package script, smoke alias, eval dataset, fixture, provider integration, certification, ChatGPT App, MCP server, deployment, external communications, package-scope rename, GitHub module deletion, engineering-twin deletion, source mutation, finance write, generated prose, autonomous action, or FP-0081 in FP-0080

V2B - document precision adapters:

- shipped through `plans/FP-0081-document-precision-adapters-foundation.md` as the first deterministic document precision adapter foundation
- ships one deterministic policy/covenant text-PDF precision adapter over EvidenceIndex only when quality gates prove safe SourceAnchors
- must preserve provenance, freshness posture, limitations, adapter provenance/version, and raw-source authority
- tables remain fail-closed unless a later plan proves row/cell anchors, merged-cell handling, layout ambiguity handling, and numeric ambiguity handling
- OCR, vector/file search, PageIndex, broad PDF extraction, generic document AI, LLM orchestration, MCP/ChatGPT App, UI, provider integration, certification, deployment, external communications, source mutation, finance writes, generated prose, and autonomous action remain blocked

V2C - read-only agent/MCP/ChatGPT Evidence App alpha:

- shipped through `plans/FP-0082-read-only-mcp-chatgpt-evidence-app-alpha.md` as a local/internal read-only evidence-tool contract and direct proof
- agents and humans get the same read-only evidence contract first
- shipped tools are limited to read-only search/fetch/inspect over shipped EvidenceIndex, TextPdfAdapter provenance, SourceAnchors, DocumentMaps, EvidenceCards, SourceCoverageMatrix, CapabilityBoundaries, Finance Twin summaries, CFO Wiki references, mission answers, and proof bundles
- LLMs may navigate or summarize only under evidence contracts in V2E or later
- public ChatGPT App alpha, MCP server, Apps SDK UI, remote deployment, OAuth, app submission, public publication, write tools, provider integration, certification, delivery, report release, payment, source mutation, finance writes, generated advice, and autonomous action remain future-only until a dedicated plan proves scope, safety, auth, privacy, and non-autonomous boundaries

OSS demo/self-host/security baseline:

- shipped through `plans/FP-0083-oss-demo-self-host-security-baseline.md`
- docs-only baseline before public app, remote MCP, community pack, or deployment work
- adds SECURITY.md, PRIVACY.md, CONTRIBUTING.md, local demo operator journey, demo-data policy, self-host baseline, finance-data threat model, and read-only-agent threat model
- first implementation should not add code, UI, routes, schema, migrations, package scripts, smoke aliases, eval datasets, fixtures, sample source-pack data, source mutation, finance writes, generated product prose, LLM orchestration, runtime-Codex finance output, deployment, provider integration, certification, external communications, or autonomous action
- public ChatGPT App alpha, remote MCP deployment, Apps SDK UI, OAuth, app submission, V2E LLM orchestration, V2F community packs, and V2G distribution tracks remain future-plan-only after this baseline

V2D - Evidence Atlas UI:

- shipped through `plans/FP-0084-evidence-atlas-ui-foundation.md`
- visualizes source, Finance Twin, CFO Wiki, evidence, freshness, and limitation posture only as a read-only UI foundation over existing EvidenceIndex, V2B TextPdfAdapter, V2C evidence-tool, mission answer, proof bundle, and source coverage contracts
- first shipped implementation adds `/evidence-atlas`, Source Coverage Matrix posture, evidence timeline, document-map summary, evidence-card detail, answer anatomy boundary, capability boundary, unsupported/missing/stale evidence states, and bounded/cited excerpt rendering
- no backend route, web API route, schema, migration, package script, fixture, sample data, public app, MCP, OpenAI vector/file-search, source mutation, finance write, LLM orchestration, generated advice, runtime-Codex finance output, or autonomous action was added
- V2D expansion beyond FP-0084 remains future-plan-only

V2E - bounded LLM orchestration:

- shipped through `plans/FP-0085-bounded-llm-orchestration-foundation.md` as a local/internal proof-only bounded orchestration foundation
- shipped implementation adds pure contracts, a deterministic QueryPlanner, fixed read-only V2C tool plan, deterministic evidence selection handoff, bounded summary/refusal contracts, local proof audit event posture, and deterministic grade contracts
- LLMs may assist with navigation, summarization, and drafting only under deterministic evidence contracts after evidence selection in future named work
- no LLM output becomes source truth
- no OpenAI API calls, model calls, vector/file-search, OCR, PageIndex, routes, UI, schema, migrations, package scripts, smoke aliases, eval datasets, fixtures, sample data, public app/MCP, generated advice, generated external communications, autonomous actions, or finance writes were added

V2F - benchmark/community pack:

- shipped through `plans/FP-0086-benchmark-community-pack-foundation.md` as a SafeDemoDataPolicy-first docs/proof-only benchmark/community manifest foundation
- shipped implementation adds pure contracts for SafeDemoDataPolicy, SyntheticFinanceSourcePolicy, CommunityPackManifest, BenchmarkTask taxonomy, BenchmarkCase placeholder rules, BenchmarkProof, BenchmarkNoRuntimeBoundary, privacy boundaries, contributor-challenge boundaries, focused specs, and one direct proof command without datasets
- no eval dataset, fixture, sample data, public demo source pack, source-pack behavior, package script, smoke alias, OpenAI API/model call, public app/MCP work, community distribution, source mutation, finance write, generated advice, runtime-Codex finance output, or autonomous action starts from roadmap text alone

V2G - optional distribution tracks:

- first shipped slice is `V2G-read-only-chatgpt-app-mcp-contracts-foundation-local-v1`; the follow-on descriptor/envelope slice is `V2G-read-only-mcp-descriptor-response-envelope-foundation-local-v1`, both recorded in `plans/FP-0087-read-only-chatgpt-app-mcp-master-plan.md`
- FP-0087 ships a local proof-only typed contract foundation: read-only app/MCP plans, exact allowlist, forbidden tools, local proof-only MCP descriptors, strict descriptor input/output schemas, app/MCP response envelopes, refusal posture, prompt-injection/privacy/no-runtime boundaries, deferred OAuth/submission/provider-certification boundaries, threat-model questions, focused specs, typed V2F boundary hardening, and direct proof commands
- FP-0088 is shipped as `V2H-read-only-chatgpt-app-mcp-premium-ui-security-master-plan`, a docs-and-plan plus proof-gate compatibility slice that plans premium UI and security readiness only
- FP-0089 is shipped as `V2I-read-only-chatgpt-app-mcp-premium-ui-design-system-master-plan`, a docs-and-plan plus proof-gate compatibility slice that plans premium UI design-system readiness only
- FP-0090 is shipped as `V2J-read-only-chatgpt-app-mcp-premium-ui-implementation-master-plan`, a docs-and-plan plus proof-gate compatibility slice that defines the future local/proof-only/read-only UI implementation boundary only
- FP-0091 is shipped as `V2K-read-only-chatgpt-app-mcp-premium-ui-component-foundation-local-v1`, a local/proof-only/read-only component implementation slice under `apps/web/components/read-only-app-mcp/**` only
- FP-0092 is shipped as `V2L-read-only-chatgpt-app-mcp-premium-ui-composition-accessibility-foundation-local-v1`, a local/proof-only/read-only composition and accessibility hardening slice under `apps/web/components/read-only-app-mcp/**` only
- FP-0093 is shipped as `V2M-read-only-chatgpt-app-mcp-premium-ui-preview-route-master-plan-local-v1`, a docs-and-plan plus proof-gate compatibility slice that planned a future local read-only preview route boundary only
- FP-0094 is shipped as `V2N-read-only-chatgpt-app-mcp-premium-ui-preview-route-foundation-local-v1`, exactly one local/proof-only/read-only preview route at `apps/web/app/read-only-app-mcp-preview/page.tsx` that renders existing FP-0091/FP-0092 components from in-memory synthetic examples only
- FP-0095 is shipped as `V2O-read-only-chatgpt-app-mcp-premium-ui-preview-route-state-matrix-master-plan-local-v1`, a docs-and-plan plus proof-gate compatibility slice that planned future local read-only preview route state-matrix, noindex/local-only posture, and premium visual QA hardening only
- FP-0096 is shipped as `V2P-read-only-chatgpt-app-mcp-premium-ui-preview-route-state-matrix-foundation-local-v1`, a local/proof-only/read-only implementation slice on the existing preview route only
- FP-0097 is shipped as `V2Q-read-only-chatgpt-app-mcp-premium-ui-preview-route-visual-qa-foundation-local-v1`, a local/proof-only/read-only screenshotless visual QA/accessibility hardening slice on the existing preview route only
- FP-0098 is shipped as `V2R-read-only-chatgpt-app-mcp-public-app-readiness-master-plan-local-v1`, a docs-and-plan plus proof-gate compatibility slice that plans future public-app readiness, security posture, and submission-boundary questions only
- FP-0099 is shipped as `V2S-read-only-chatgpt-app-mcp-public-app-security-threat-model-master-plan-local-v1`, a docs-and-plan plus proof-gate compatibility slice that plans future public-app/MCP security threat-model and platform-boundary questions only
- FP-0100 is shipped as `V2T-read-only-chatgpt-app-mcp-public-app-security-boundary-contracts-foundation-local-v1`, a local/proof-only/read-only contract slice that proves public-app security boundary contracts and proof-gate compatibility only
- FP-0101 is shipped as `V2U-read-only-chatgpt-app-mcp-public-app-implementation-sequencing-master-plan-local-v1`, a docs-and-plan plus proof-gate compatibility slice that sequences future endpoint/OAuth/remote-MCP, Apps SDK resource, public app implementation, and app-submission lanes only
- no public app implementation, MCP server runtime, route implementation beyond the FP-0094/FP-0096/FP-0097 existing local preview route boundary, endpoint, Apps SDK iframe/resource registration, OAuth, app submission, schema, migration, package script, smoke alias, eval dataset, fixture, sample data, public demo data, source-pack behavior, OpenAI API/model call, hosted tool, vector/file-search integration, OCR, PageIndex, provider setup, certification, delivery, deployment, external communications, source mutation, finance write, generated product prose, runtime-Codex finance output, autonomous action, screenshot, generated image, public asset, listing copy, or app-submission artifact starts from FP-0087, FP-0090, FP-0091, FP-0092, FP-0093, FP-0094, FP-0095, FP-0096, FP-0097, FP-0098, FP-0099, FP-0100, FP-0101, or roadmap text alone
- optional ChatGPT App/MCP implementation, route expansion beyond FP-0097, endpoint/OAuth/remote MCP implementation, Apps SDK resource implementation, app submission, iOS, OpenClaw, deployment, or other distribution tracks require later named Finance Plans after V2 foundations, FP-0083 OSS baseline, V2E bounded-orchestration posture, V2F benchmark/no-real-finance-data posture, FP-0087 contract plus descriptor/envelope boundaries, shipped FP-0088 readiness boundaries, shipped FP-0089 design-system readiness boundaries, shipped FP-0090 UI implementation readiness boundaries, shipped FP-0091 local component-only boundaries, shipped FP-0092 local composition/accessibility boundaries, shipped FP-0093 docs-only preview-route planning boundaries, shipped FP-0094 single local route boundary, shipped FP-0095 docs-only state-matrix planning boundary, shipped FP-0096 existing-route state-matrix boundary, shipped FP-0097 existing-route visual QA boundary, shipped FP-0098 public-app readiness/security/submission-boundary boundary, shipped FP-0099 public-app security threat-model/platform-boundary boundary, shipped FP-0100 local security boundary contracts, and shipped FP-0101 public-app implementation sequencing/platform-readiness gates are proven

Still blocked until future Finance Plans:

- F6V provider integration
- F6X actual certification
- deeper PDF/OCR/vector search beyond the shipped narrow FP-0081 text-PDF precision-adapter candidate
- EvidenceIndex or precision-adapter expansion outside the shipped FP-0081 first V2B contract
- ChatGPT App implementation beyond the shipped local/internal FP-0082 contract
- MCP server implementation beyond the shipped local/internal FP-0082 contract
- V2G expansion beyond the shipped FP-0087 local proof-only contract and descriptor/envelope boundary
- FP-0092 implementation beyond local/proof-only/read-only composition and accessibility hardening
- FP-0093 expansion beyond docs-only local UI preview route planning
- FP-0094 expansion beyond the single local/proof-only/read-only preview route foundation
- FP-0095 expansion beyond docs-only local preview route state-matrix and visual QA planning
- FP-0096 expansion beyond the existing local preview route state matrix
- FP-0097 expansion beyond existing-route screenshotless visual QA/accessibility hardening
- FP-0098 expansion beyond docs-only public-app readiness/security/submission-boundary planning
- FP-0099 expansion beyond docs-only public-app security threat-model/platform-boundary planning
- FP-0100 expansion beyond local proof-only public-app security boundary contracts
- FP-0101 expansion beyond docs-only public-app implementation sequencing/platform-readiness planning
- FP-0091 implementation beyond local/proof-only/read-only component foundation
- FP-0090 implementation beyond docs-only premium UI implementation readiness and proof-gate compatibility
- iOS implementation
- OpenClaw integration
- deployment and external communications
- package-scope rename
- GitHub module deletion
- engineering-twin module deletion
