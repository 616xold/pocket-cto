# Codex App Server integration notes

Pocket CFO still uses Codex App Server as a primary runtime seam.

The key change is not the transport.
The key change is what the surrounding control plane asks the runtime to do.

## Role in Pocket CFO

The runtime seam should stay narrow and generic.

The control plane owns:

- finance mission semantics
- source-registry rules
- Finance Twin reads and writes
- wiki filing policy
- report artifact policy
- approval policy meaning

The runtime package owns:

- session lifecycle
- thread and turn transport
- approval request plumbing
- structural event extraction
- result normalization

## Good uses during the pivot

Codex is especially valuable for:

- wiki maintenance from already-registered evidence
- investigation or analysis writeups
- memo drafting
- evidence summary drafting
- report formatting assistance

Codex should **not** be treated as the raw source of financial truth.

## Prompt ownership

Build product prompts in control-plane modules such as:

- missions
- wiki
- reports
- approvals

Do not hard-code Pocket CFO product logic into the runtime transport wrapper.

## Approval and sandbox posture

As the product pivots:

- read-only analysis or lint tasks may run with a `never` approval posture
- write-capable tasks such as wiki filing or report artifact generation should request approval when the slice requires it
- network access should remain restricted by default
- runtime actions that change external communication posture must stay human-reviewable

## Transition note

The current repo still contains Pocket CTO-era terminology around planners, executors, and git worktrees.
That is acceptable during F0.

Do not force a giant runtime rewrite during the docs reset.
Keep the seam stable while the finance slices land around it.
