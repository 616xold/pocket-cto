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

The latest shipped F5 record is `plans/FP-0039-lender-update-specialization-and-draft-review-foundation.md`.
The shipped F5A through F5C1 slices already create first-class reporting missions from completed discovery missions, assemble one draft `finance_memo` plus one linked `evidence_appendix`, expose those stored bodies directly, reuse the existing CFO Wiki filed-page plus markdown export seams for the finance-memo path, and compile one draft `board_packet` from completed reporting work without creating a runtime thread.

For shipped F5C2, the control plane and operator surface should:

- keep numeric and factual authority in stored evidence, not in runtime output
- compile one draft `lender_update` only from one completed reporting mission with stored `finance_memo` plus stored `evidence_appendix`
- keep `mission.type = "reporting"` and specialize through `reportKind`
- keep the next packet path deterministic, runtime-free, and draft-only
- avoid creating a runtime thread for packet compilation or draft-review posture
- keep filing or export semantics, diligence specialization, approval-release posture, and non-markdown output formats out of the first lender-update slice

Later F5 slices may use runtime-codex only in a bounded role such as draft phrasing or formatting assistance once a deterministic packet skeleton already exists.
Even then, runtime-codex must not invent finance facts, override stored numbers, or become the approval authority layer.

## Prompt ownership

Build product prompts in control-plane modules such as:

- missions
- wiki
- reporting
- approvals

Do not hard-code Pocket CFO product logic into the runtime transport wrapper.

## Approval and sandbox posture

As the product pivots:

- read-only analysis or lint tasks may run with a `never` approval posture
- write-capable tasks such as wiki filing or report artifact generation should request approval when the slice requires it
- network access should remain restricted by default
- runtime actions that change external communication posture must stay human-reviewable

For F5A through shipped F5C2 specifically, draft report compilation, body exposure, finance-memo filing/export posture, first board-packet specialization, and first lender-update specialization should stay deterministic and draft-only, so these slices should not introduce runtime approval or release semantics yet.

## Transition note

The current repo still contains Pocket CTO-era terminology around planners, executors, and git worktrees.
That remains acceptable while the finance-discovery slices continue retargeting the control plane around the stable runtime seam.

Do not force a giant runtime rewrite during the finance-discovery transition.
Keep the seam stable while the finance slices land around it.
