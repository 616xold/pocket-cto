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

1. finance discovery answers
2. finance memo or packet compilation
3. wiki compilation quality
4. provenance and freshness disclosure
5. contradiction handling

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
