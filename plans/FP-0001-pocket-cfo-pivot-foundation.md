# Reset the active repo guidance layer for Pocket CFO

## Purpose / Big Picture

This plan performs the **F0 pivot foundation** step for Pocket CFO.

The goal is not to rewrite the control plane yet.
The goal is to reset the active guidance layer so that humans and Codex both read the repo as **Pocket CFO**, not as stale Pocket CTO product scope.

After this plan completes, the repo should still boot and remain CI-safe, but its active docs, roadmap, skills, and operating instructions should all point toward:

- finance evidence as source truth
- a source-registry boundary
- a Finance Twin
- a compiled CFO Wiki
- finance missions and finance evidence artifacts

This is the preparation slice that makes the real implementation work tractable.

## Progress

- [ ] 2026-04-05T00:00:00Z Tag the current repo state as `pocket-cto-m3-final`.
- [ ] 2026-04-05T00:00:00Z Apply the Pocket CFO prep-pack overlay files to the repo root.
- [ ] 2026-04-05T00:00:00Z Create `docs/archive/pocket-cto/`, `docs/archive/pocket-cto/plans/`, and `docs/archive/pocket-cto/ops/`.
- [ ] 2026-04-05T00:00:00Z Move historical `plans/EP-*.md` files into `docs/archive/pocket-cto/plans/`.
- [ ] 2026-04-05T00:00:00Z Move `docs/ops/m2-exit-report.md` and `docs/ops/m3-exit-report.md` into `docs/archive/pocket-cto/ops/`.
- [ ] 2026-04-05T00:00:00Z Run repo validation and confirm the active docs now point to Pocket CFO.
- [ ] 2026-04-05T00:00:00Z Start the next implementation slice from F1 source-registry work.

## Surprises & Discoveries

Use this section while executing the plan.

Record anything that materially changes sequencing, such as:

- stale docs still being read by Codex
- hidden GitHub-first assumptions in operator copy
- runtime or env docs that still imply the old product center
- archive moves that reveal other active-vs-historical collisions

## Decision Log

- The control-plane spine stays; this slice changes the guidance layer first.
- GitHub is demoted to an optional connector and must not remain the active product identity.
- Internal package scope stays `@pocket-cto/*` during F0 to avoid unnecessary churn.
- Historical Pocket CTO plans remain valuable, but only after being archived or clearly marked reference-only.
- The CFO Wiki is a compiled markdown layer beside the Finance Twin, not a replacement for it.

## Context and Orientation

The repository already contains a strong orchestration/evidence spine.
What is stale is the product framing, the mission vocabulary, and the active documentation set.

This plan therefore updates the files that guide Codex and human readers first:

- root guidance files
- roadmap and plan template
- active-doc boundary
- local dev and Codex runtime docs
- scoped AGENTS files
- skill instructions
- benchmark and eval guidance
- archive landing page

This plan does **not** yet rewrite:

- domain contracts
- DB schema
- control-plane routes
- UI routes
- tools or smoke commands
- architecture docs beyond demoting them through the active-doc boundary

## Plan of Work

Execute the pivot foundation in three waves.

The first wave replaces the active guidance surface so the repo reads as Pocket CFO.
The second wave creates the archive boundary and moves historical Pocket CTO plans and exit reports out of the active path.
The third wave validates that the repo still behaves as a stable working monorepo and that the next slice can begin from F1 source-registry work.

Throughout this plan, avoid destructive code changes.
The point is to make the repo **think correctly before it starts changing deeply**.

## Concrete Steps

1. Create a safety tag:

   ```bash
   git tag pocket-cto-m3-final
   ```

2. Copy the prep-pack overlay into the repository root, preserving paths.

3. Review the diff to confirm the active files now include:

   - `README.md`
   - `START_HERE.md`
   - `AGENTS.md`
   - `PLANS.md`
   - `WORKFLOW.md`
   - `.env.example`
   - `plans/ROADMAP.md`
   - `plans/FP-0001-pocket-cfo-pivot-foundation.md`
   - `docs/ACTIVE_DOCS.md`
   - the new and updated skills under `.agents/skills/`

4. Create archive folders:

   ```bash
   mkdir -p docs/archive/pocket-cto/plans docs/archive/pocket-cto/ops
   ```

5. Move historical plans and exit reports:

   ```bash
   git mv plans/EP-*.md docs/archive/pocket-cto/plans/
   git mv docs/ops/m2-exit-report.md docs/archive/pocket-cto/ops/
   git mv docs/ops/m3-exit-report.md docs/archive/pocket-cto/ops/
   ```

6. Re-open `docs/ACTIVE_DOCS.md` and confirm the archive boundary is still accurate after the moves.

7. Run validation.

8. Commit the result as one clean F0 docs-and-guidance reset.

9. Start the next Codex session from this plan and move into F1 source-registry work.

## Validation and Acceptance

Minimum validation after the docs reset:

```bash
pnpm repo:hygiene
pnpm lint
pnpm typecheck
```

Recommended fuller pass if time permits:

```bash
pnpm test
pnpm check
```

Acceptance is met when all of the following are true:

- the active docs consistently describe Pocket CFO, not Pocket CTO
- `docs/ACTIVE_DOCS.md` clearly separates active vs historical guidance
- `plans/ROADMAP.md` uses the F0-F6 Pocket CFO sequence
- Codex startup instructions now point to this Finance Plan
- GitHub is described as an optional connector rather than the product center
- the repo still boots under the current package structure
- no production code was deleted as part of this prep-only slice

## Idempotence and Recovery

This plan is intentionally safe to retry.

- Reapplying the overlay is safe because it only replaces guidance files.
- Archive moves are reversible with `git restore --staged` or `git mv` back to original paths.
- If a copied guidance file is wrong, restore it from Git and reapply only the corrected file.
- The `pocket-cto-m3-final` tag provides the clean rollback point before destructive implementation phases begin.

## Artifacts and Notes

The expected artifacts from this plan are:

- one clean F0 docs commit
- the Pocket CTO archive folder scaffold
- a repo whose active guidance layer now points to Pocket CFO
- a ready starting point for F1 source-registry work

The prep pack that accompanies this plan is intentionally guidance-only.
It should not be expanded into schema or route rewrites inside this slice.

## Interfaces and Dependencies

This plan touches:

- root docs and repo instructions
- Finance Plan conventions
- local env documentation
- local development instructions
- Codex runtime guidance
- skill guidance
- archive boundaries
- benchmark and eval guidance

This plan does not change the runtime protocol, DB schema, or API surface.
It prepares those later slices.

## Outcomes & Retrospective

Fill this section after execution.

Capture:

- whether Codex stopped reading stale Pocket CTO docs as active truth
- whether any hidden active-doc collisions remained
- whether the archive move uncovered additional files that should move later
- the exact first F1 slice chosen next
