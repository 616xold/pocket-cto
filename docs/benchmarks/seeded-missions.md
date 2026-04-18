# Seeded finance missions

Pocket CFO should benchmark trusted finance work, not generic “AI CFO” vibes.

This file defines the first seeded mission families the product should benchmark and grade, including the shipped F4A through F4C2 discovery baseline below.

## Why these matter

The product thesis is evidence-native finance discovery and decision support.
Seeded missions should therefore stress:

- provenance
- freshness honesty
- numeric consistency
- limitation handling
- artifact quality
- reproducibility

## Recommended seeded mission families

### 1. Source registration and ingest proof

Input:
A mixed bundle of finance exports and docs.

Success:
The system registers each file as source truth, records checksums and ingest status, and emits an operator-readable ingest proof artifact.

### 2. F4A cash-posture answer

Input:
Stored bank-account summary state plus the related deterministic wiki context.

Success:
The system returns a typed `cash_posture` answer with freshness posture, route-backed evidence, related wiki pages, and clear limitations.

### 3. F4B posture, aging, spend, and obligation answers

Input:
Stored receivables-aging, payables-aging, spend, or contract-obligation state plus the related deterministic wiki context.

Success:
The system answers narrow typed questions such as `collections_pressure`, `payables_pressure`, `spend_posture`, or `obligation_calendar_review` from stored state with explicit freshness and limitations.

### 4. F4C policy lookup

Input:
One explicit `policySourceId` bound as `policy_document` for the company plus the stored deterministic wiki state for that same source; generic SOP docs or board materials do not count unless they are intentionally bound that way.

Success:
The system answers a typed `policy_lookup` question from the scoped policy page, same-source digest history when useful, `concepts/policy-corpus` when useful, and bound-source extract status, with a truthful limited answer whenever the latest extract is missing, unsupported, or failed.

### 5. F5A draft finance memo compilation

Input:
A completed discovery mission plus its stored `discovery_answer`, proof bundle, and relevant route or wiki context.

Success:
The system creates a first-class reporting mission that produces one draft `finance_memo` plus one linked `evidence_appendix`, with linked evidence, freshness notes, visible limitations, and explicit draft-only posture.

### 6. F5B draft report body, filed artifact, and markdown export posture

Input:
One completed reporting mission that already stores a draft `finance_memo`, a linked `evidence_appendix`, and company-scoped CFO Wiki state with the existing filed-page and export seams.

Success:
The system renders the stored memo and appendix bodies directly in mission detail, lets an operator explicitly file those stored drafts into the CFO Wiki through the existing filed-page route, and shows filing plus markdown export posture separately from proof readiness.

## Blocked for now

These discovery families should stay out of the shipped F4A through F4C2 baseline and out of early seeded-finance grading until new deterministic Finance Twin support exists:

- `receivables_aging_review`
- `payables_aging_review`
- `runway`
- `burn_variance`
- `concentration`
- `covenant_risk`
- `anomaly_review`
- `spend_exceptions` based on policy scoring or exception inference

## Rubric dimensions

Each seeded mission should be graded on:

- groundedness
- citation completeness
- freshness disclosure
- numeric consistency
- limitation honesty
- artifact completeness
- rerun reproducibility
- operator touch time

## Implementation note

During the early pivot, the repo may still carry legacy engineering eval commands.
Keep the eval harness architecture, but replace the scenarios and rubrics with finance-oriented datasets as F4/F5 land.
The current finance-native eval-hook proof for the shipped F4A through F4C2 discovery baseline is `pnpm eval:finance-discovery-quality`, which reuses the deterministic `pnpm smoke:finance-discovery-quality:local` ladder rather than a model-scored runtime eval.
The active next-step F5 reporting benchmark contract now lives in `plans/FP-0037-draft-report-body-filed-artifact-and-markdown-export-hardening.md`.
