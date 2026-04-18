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

## First F4 posture

The first F4 finance discovery answer path should **not** depend on runtime-codex.

For F4A, the control plane should:

- accept a typed company-scoped finance discovery mission
- read stored Finance Twin plus stored CFO Wiki state
- assemble the first answer deterministically and read-only
- persist the answer artifact and finance-ready proof bundle without creating a runtime thread

Codex remains valuable after that first answer path exists for:

- later investigative writeups
- wiki filing or durable note drafting
- memo or packet drafting in F5
- evidence-summary or formatting assistance when a deterministic answer already exists

## Current F5 posture

The active F5 contract is `plans/FP-0037-draft-report-body-filed-artifact-and-markdown-export-hardening.md`.
The shipped first F5A slice already creates first-class reporting missions from completed discovery missions and assembles one draft `finance_memo` plus one linked `evidence_appendix` from stored discovery answers, proof bundles, related routes, and related wiki pages without creating a runtime thread.

For F5B, the control plane and operator surface should:

- keep numeric and factual authority in stored evidence, not in runtime output
- expose the stored memo and appendix bodies directly, read-only
- reuse the existing CFO Wiki filed-page seam for explicit operator filing only
- reuse the existing company markdown export seam for export linkage only
- avoid creating a runtime thread for body rendering, filing, or export posture

Later F5 slices may use runtime-codex only in a bounded role such as draft phrasing or formatting assistance once a deterministic memo skeleton already exists.
Even then, runtime-codex must not invent finance facts, override stored numbers, or become the approval authority layer.

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

For F5A through F5B specifically, draft report compilation, body exposure, filing, and export posture should stay deterministic and draft-only, so these slices should not introduce runtime approval or release semantics yet.

## Transition note

The current repo still contains Pocket CTO-era terminology around planners, executors, and git worktrees.
That remains acceptable while the finance-discovery slices continue retargeting the control plane around the stable runtime seam.

Do not force a giant runtime rewrite during the finance-discovery transition.
Keep the seam stable while the finance slices land around it.
