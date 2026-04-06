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

- [x] 2026-04-05T00:00:00Z Tag the current repo state as `pocket-cto-m3-final`.
- [x] 2026-04-05T00:00:00Z Apply the Pocket CFO prep-pack overlay files to the repo root.
- [x] 2026-04-05T00:00:00Z Create `docs/archive/pocket-cto/`, `docs/archive/pocket-cto/plans/`, and `docs/archive/pocket-cto/ops/`.
- [x] 2026-04-05T00:00:00Z Move historical `plans/EP-*.md` files into `docs/archive/pocket-cto/plans/`.
- [x] 2026-04-05T00:00:00Z Move `docs/ops/m2-exit-report.md` and `docs/ops/m3-exit-report.md` into `docs/archive/pocket-cto/ops/`.
- [x] 2026-04-06T17:44:19Z Reproduced the post-placement CI regression locally and confirmed that `apps/control-plane/src/modules/missions/m3-closeout-docs.spec.ts` still pointed at the pre-archive Pocket CTO paths and old local-dev expectations.
- [x] 2026-04-06T17:49:04Z Run repo validation, confirm the active docs now point to Pocket CFO without stale engineering-closeout assumptions, and restore green CI on this branch.
- [ ] 2026-04-06T17:44:19Z Start the next implementation slice from F1 source-registry work only after this branch is green again.

## Surprises & Discoveries

- Observation: the docs placement itself completed cleanly, but one stale engineering-closeout spec kept CI red afterward.
  Evidence: `apps/control-plane/src/modules/missions/m3-closeout-docs.spec.ts` still opened `docs/ops/m3-exit-report.md` and `plans/EP-0029-discovery-mission-ui-proof-and-m3-closeout.md` from their former active paths and still treated the old M3 smoke command as an active `docs/ops/local-dev.md` requirement.

- Observation: the safest F0 follow-up is archive-boundary hardening rather than restoring old files into active locations.
  Evidence: the historical proof still exists intact under `docs/archive/pocket-cto/ops/` and `docs/archive/pocket-cto/plans/`, so the truthful fix is to point the guardrail at the archive plus `docs/ACTIVE_DOCS.md`.

## Decision Log

- The control-plane spine stays; this slice changes the guidance layer first.
- GitHub is demoted to an optional connector and must not remain the active product identity.
- Internal package scope stays `@pocket-cto/*` during F0 to avoid unnecessary churn.
- Historical Pocket CTO plans remain valuable, but only after being archived or clearly marked reference-only.
- The CFO Wiki is a compiled markdown layer beside the Finance Twin, not a replacement for it.
- The historical M3 closeout proof stays in the Pocket CTO archive; active Pocket CFO local-dev guidance should not be forced to carry the old engineering smoke-command contract.
- This follow-up hardening slice is docs-and-test only, so replay, evidence bundle, provenance, and freshness behavior remain unchanged.

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
Those two waves are already complete on this branch.
The remaining F0 work is to keep the repo green by hardening the archive boundary, then validate that the next slice can begin from F1 source-registry work.

Throughout this plan, avoid destructive code changes.
The point is to make the repo **think correctly before it starts changing deeply**.

## Concrete Steps

1. Confirm the already-completed F0 placement state:

   ```bash
   git tag --list pocket-cto-m3-final
   rg --files docs/archive/pocket-cto/plans docs/archive/pocket-cto/ops
   ```

2. If you are porting the reset onto an older branch, create a safety tag:

   ```bash
   git tag pocket-cto-m3-final
   ```

3. If you are porting the reset onto an older branch, copy the prep-pack overlay into the repository root, preserving paths.

4. Review the diff to confirm the active files now include:

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

5. If you are porting the reset onto an older branch, create archive folders:

   ```bash
   mkdir -p docs/archive/pocket-cto/plans docs/archive/pocket-cto/ops
   ```

6. If you are porting the reset onto an older branch, move historical plans and exit reports:

   ```bash
   git mv plans/EP-*.md docs/archive/pocket-cto/plans/
   git mv docs/ops/m2-exit-report.md docs/archive/pocket-cto/ops/
   git mv docs/ops/m3-exit-report.md docs/archive/pocket-cto/ops/
   ```

7. Re-open `docs/ACTIVE_DOCS.md` and confirm the archive boundary is still accurate after the moves and after any follow-up docs hardening.

8. Run validation and keep CI green.

9. Commit the result as one clean F0 docs-and-guidance reset or follow-up hardening slice.

10. Start the next Codex session from this plan and move into F1 source-registry work only after the validation step is green.

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
- the post-placement archive boundary does not depend on pre-archive file paths or old engineering local-dev requirements
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

The branch now carries the intended Pocket CFO guidance reset and Pocket CTO archive placement instead of leaving those actions as future work.
The main follow-up surprise was small but important: one stale engineering-closeout spec still pointed at pre-archive paths and briefly made the branch look unfinished even though the archived proof was already in the right place.

This F0 follow-up keeps the historical M3 proof intact in the archive, narrows the active-doc boundary so later Codex sessions do not treat old engineering closeout material as current guidance, and leaves the repo ready for F1 source-registry work once validation is green again.
Validation now includes the repaired narrow spec, the repo-level `pnpm lint`, `pnpm typecheck`, and `pnpm test` passes, plus a successful `pnpm ci:repro:current` run through the clean-worktree static and integration-db path.
