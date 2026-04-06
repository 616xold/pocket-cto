# Start here

This repository is already structured so you can open it in the Codex app and keep the Pocket CFO pivot moving without losing the existing control-plane spine.

Before doing anything else, read `docs/ACTIVE_DOCS.md`.

## First run in Codex

Open the repository root in the Codex app.

Then start a fresh thread and give Codex this prompt:

```text
Read docs/ACTIVE_DOCS.md, README.md, AGENTS.md, PLANS.md, plans/ROADMAP.md, plans/FP-0001-pocket-cfo-pivot-foundation.md, and docs/ops/source-ingest-and-cfo-wiki.md.
Summarize the active phase, the archive boundary, and the next unchecked slice of FP-0001.
Then implement only that slice.
Keep internal package scope unchanged, preserve repo hygiene, update the Finance Plan Progress and Decision Log as you work, and run the narrowest meaningful validation after each step.
```

## Recommended operating pattern

Use **one Codex thread per slice**.

Suggested thread naming:

- `F0-pivot-foundation`
- `F1-source-registry-bridge`
- `F2-finance-twin-cash-slice`
- `F3-cfo-wiki-compiler`
- `F4-finance-discovery-answer`
- `F5-memo-and-packet-compiler`
- `F6-monitoring-and-controls`

## Review ritual

After each slice:

1. review the diff
2. confirm the touched files still respect package and module boundaries
3. confirm the active Finance Plan was updated
4. confirm stale or historical docs were not accidentally revived as active truth
5. run the listed validation commands
6. only then move to the next slice

## Use the repo skills

Explicitly invoke these when useful:

- `$execplan-orchestrator`
- `$modular-architecture-guard`
- `$source-provenance-guard`
- `$cfo-wiki-maintainer`
- `$evidence-bundle-auditor`

Use `$github-app-integration-guard` only when touching the optional GitHub connector path.

Example:

```text
$source-provenance-guard Add the source registry snapshot repository and checksum handling. Keep raw sources immutable and make lineage explicit in both schema and service code.
```

## What not to do first

Do not start with:

- a giant repo-wide rename of `@pocket-cto/*`
- deleting all GitHub modules in one shot
- finance connector sprawl
- autonomous accounting or banking actions
- vague “AI CFO” chat features
- deck polish before discovery, provenance, and freshness are real
- replacing deterministic twin logic with freeform LLM answers

## The correct first success

The first success is not a flashy finance UI.

The first success is:

> Pocket CFO becomes the active guidance layer of the repo, Codex stops reading stale Pocket CTO docs as product truth, and the next implementation slices can proceed from a clean F0 plan.

Once that is solid, F1 source registry work can begin safely.
