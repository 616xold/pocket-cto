# Pocket CFO evals

The eval harness architecture from Pocket CTO is worth keeping.
What changes is the dataset and rubric content.

## What to optimize for

Pocket CFO evals should reward:

- evidence-grounded finance answers
- honest freshness posture
- clear assumptions
- numeric consistency
- limitation handling
- report or memo quality when reporting is in scope

## What not to optimize for

Do not optimize for generic “sounds like a CFO” vibes.
Do not let uncited confidence score well.

## Early pivot reality

The repo may still expose legacy planner or executor eval commands while the finance vertical is landing.
That is acceptable during the transition.

When using those commands during the pivot:

- treat the harness as generic infrastructure
- swap in finance-oriented prompts and rubrics when the relevant slices land
- keep product runtime and eval runtime separate

## Target finance eval families

1. deterministic finance discovery answers for the shipped F4A through F4C2 baseline, with `cash_posture` as the first F4A family, `collections_pressure`, `payables_pressure`, `spend_posture`, and `obligation_calendar_review` shipped in F4B, explicit-source `policy_lookup` shipped in F4C1, and F4C2 discovery-quality hardening already shipped for the current six-family baseline
2. later posture, aging, spend, and obligation answers that stay grounded in already-shipped Finance Twin reads
3. source-scoped `policy_lookup` from explicit `policySourceId`, explicit `policy_document` bindings, and stored deterministic extracts
4. shipped F5A draft finance memo compilation from a completed discovery mission, its stored `discovery_answer`, and its linked evidence appendix
5. shipped F5B draft report body visibility, explicit filed artifact reuse, and markdown export posture from stored reporting artifacts plus the existing CFO Wiki seams
6. shipped F5C1 draft `board_packet` specialization from one completed reporting mission with stored `finance_memo` plus stored `evidence_appendix`
7. active F5C2 draft `lender_update` specialization from one completed reporting mission with stored `finance_memo` plus stored `evidence_appendix`
8. wiki compilation quality
9. provenance, freshness disclosure, and contradiction handling

## F4 staging

Early F4 evals should distinguish what the repo can truthfully support from what belongs to later deterministic work.

Shipped today:

- discovery evals can cover `cash_posture`, `collections_pressure`, `payables_pressure`, `spend_posture`, `obligation_calendar_review`, and source-scoped `policy_lookup`
- eval prompts should require twin/wiki-grounded answers with explicit freshness and limitations
- runtime-codex, vector retrieval, OCR, deep-read, and report compilation should stay out of scope
- `pnpm smoke:finance-discovery-quality:local` remains the deterministic source-of-truth quality smoke for the shipped F4A through F4C2 baseline
- `pnpm eval:finance-discovery-quality` now reuses that deterministic smoke to write a finance-native report under `evals/results/finance-discovery-quality/` without fake candidate, grader, reference, or provider metadata

For later phases:

- keep `policy_lookup` eval prompts explicitly source-scoped and grounded in stored deterministic policy pages plus extract status
- do not grade generic corpus-wide semantic policy search as if it already exists
- add later discovery families only when the repo can already ground them deterministically
- keep F5 memo and shipped board-packet evals anchored to the shipped F5A through F5C1 contracts, and keep the next packet-specialization evals anchored to the active `FP-0039` contract: one completed reporting mission with stored `finance_memo` plus stored `evidence_appendix` in, one deterministic draft `lender_update` out, with explicit freshness, limitations, review-ready posture, and no runtime-codex fact invention
- keep diligence specialization, PDF export, slide or Marp export, and release approval grading out of the first F5C2 eval scope

Do not treat these as early F4 supported families:

- `receivables_aging_review`
- `payables_aging_review`
- `runway`
- `burn_variance`
- `concentration`
- `covenant_risk`
- `anomaly_review`
- `spend_exceptions` based on policy scoring or exception inference

## Minimum grading questions

A good finance eval should ask:

- Was the answer grounded in the provided evidence?
- Were stale or missing inputs disclosed?
- Were assumptions clearly marked?
- Were important limitations preserved?
- Could a human review or reuse the output outside chat?

## Policy

Evals are for measurement and iteration.
They are not a substitute for the product’s evidence and approval contracts.
