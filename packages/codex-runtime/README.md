# Codex runtime package

`packages/codex-runtime` is the narrow wrapper around the Codex App Server protocol.

During the Pocket CFO pivot, this package should stay intentionally domain-light.

## What belongs here

- process lifecycle for the local Codex App Server client
- initialize, thread, turn, and session handling
- structural runtime event normalization
- approval request plumbing
- response extraction and typed transport helpers

## What does not belong here

- finance source parsing
- Finance Twin logic
- wiki layout or backlink policy
- memo or packet semantics
- source-registry rules
- finance question templates as hard-coded product logic

## Pivot guidance

Pocket CFO still uses the Codex runtime seam heavily.
The difference is what the surrounding control plane asks it to do.

Typical runtime-backed tasks in the finance product will include:

- wiki compilation or maintenance
- investigation writeups
- memo drafting
- evidence summary drafting
- report formatting assistance

The control plane should assemble the domain-specific prompts and working context.
This package should remain a transport seam, not the place where Pocket CFO semantics accumulate.

## Working rule

If a change in this package materially changes prompt shape, approval handling, or runtime guarantees, update `docs/ops/codex-app-server.md` and the active Finance Plan in the same slice.
