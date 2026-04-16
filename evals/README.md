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

1. deterministic finance discovery answers for the shipped F4A through F4C1 families, with `cash_posture` as the first F4A family, `collections_pressure`, `payables_pressure`, `spend_posture`, and `obligation_calendar_review` shipped in F4B, and explicit-source `policy_lookup` shipped in F4C1
2. later posture, aging, spend, and obligation answers that stay grounded in already-shipped Finance Twin reads
3. source-scoped `policy_lookup` from explicit `policySourceId`, explicit `policy_document` bindings, and stored deterministic extracts
4. finance memo or packet compilation
5. wiki compilation quality
6. provenance, freshness disclosure, and contradiction handling

## F4 staging

Early F4 evals should distinguish what the repo can truthfully support from what belongs to later deterministic work.

Shipped today:

- discovery evals can cover `cash_posture`, `collections_pressure`, `payables_pressure`, `spend_posture`, `obligation_calendar_review`, and source-scoped `policy_lookup`
- eval prompts should require twin/wiki-grounded answers with explicit freshness and limitations
- runtime-codex, vector retrieval, OCR, deep-read, and report compilation should stay out of scope

During F4C2 and later finance-discovery hardening:

- keep `policy_lookup` eval prompts explicitly source-scoped and grounded in stored deterministic policy pages plus extract status
- do not grade generic corpus-wide semantic policy search as if it already exists
- use the deterministic `pnpm smoke:finance-discovery-quality:local` ladder as the current practical quality proof for the shipped F4 baseline while broader eval-hook continuation remains later work
- add later discovery families only when the repo can already ground them deterministically

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
