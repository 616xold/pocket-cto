# Seeded finance missions

Pocket CFO should benchmark trusted finance work, not generic “AI CFO” vibes.

This file defines the first seeded mission families the product should benchmark and grade, starting with the shipped F4A and F4B discovery families below.

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
One or more sources explicitly bound as `policy_document` for the company; generic SOP docs or board materials do not count unless they are intentionally bound that way.

Success:
The system answers a typed policy question from explicit `policy_document` bindings and stored deterministic extracts with explicit uncertainty where the policy is ambiguous.

### 5. Memo or packet compilation

Input:
A stored answer plus relevant twin or wiki context.

Success:
The system produces a short memo or packet with linked evidence, freshness notes, and an appendix-ready structure.

## Blocked for now

These discovery families should stay out of the shipped F4A/F4B baseline and out of early seeded-finance grading until new deterministic Finance Twin support exists:

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
