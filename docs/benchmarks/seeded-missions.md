# Seeded finance missions

Pocket CFO should benchmark trusted finance work, not generic “AI CFO” vibes.

This file defines the first seeded mission families the product should eventually support and grade.

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

### 2. Runway answer

Input:
Cash summary, trial balance, burn assumptions, and policy notes.

Success:
The system returns a cited runway answer with freshness posture, assumptions, and clear limitations.

### 3. Concentration answer

Input:
AR aging plus customer revenue or invoice exports.

Success:
The system identifies concentration risk and cites which source records support the result.

### 4. Policy lookup

Input:
One or more policy, SOP, or board documents.

Success:
The system answers a typed policy question with section-level evidence and explicit uncertainty where the policy is ambiguous.

### 5. Memo or packet compilation

Input:
A stored answer plus relevant twin or wiki context.

Success:
The system produces a short memo or packet with linked evidence, freshness notes, and an appendix-ready structure.

## Rubric dimensions

Each seeded mission should eventually be graded on:

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
