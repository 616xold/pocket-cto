# Finalize the F1 operator and smoke reconciliation against current main

## Purpose / Big Picture

This plan performs the final **F1 reconciliation and closeout** slice before any F2 work begins.

The user-visible goal is to confirm what `origin/main` already truthfully contains, subsume the missing optional F1C1 smoke-alignment work without duplicating F1D, and leave the public Pocket CFO repo visibly and operationally source-ingest-first rather than Pocket CTO engineering-first.

This slice is intentionally narrow.
It does not add Finance Twin work, CFO Wiki work, reports, monitoring, or broader backend product semantics.

## Progress

- [x] 2026-04-09T17:50:40Z Complete the required preflight: fetch `origin/main`, confirm the clean `codex/f1-finalization-reconciliation-local-v1` branch state, verify `gh` auth, confirm the `616xold/pocket-cfo` remote, and confirm local Postgres plus object storage availability.
- [x] 2026-04-09T17:50:40Z Read the active repo guidance, roadmap, F0-F1 plans, and scoped AGENTS files; inspect `origin/main` and verify that F1D is already present while the optional F1C1 smoke-alignment slice is still missing from `origin/main`.
- [x] 2026-04-09T17:50:40Z Reconcile the missing F1C1 smoke-alignment files onto this branch without duplicating the already-merged F1D UI slice.
- [x] 2026-04-09T17:50:40Z Apply only the smallest remaining F1 truthfulness polish needed so local operator guidance stays source-ingest-first and does not read as F0-only or engineering-first.
- [x] 2026-04-09T17:50:40Z Run the requested validation ladder and confirm a fully green result through targeted web tests, the focused smoke-helper spec, both packaged source smokes, the twin guard specs, `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm ci:repro:current`.
- [ ] 2026-04-09T17:50:40Z Create exactly one final reconciliation commit, push `codex/f1-finalization-reconciliation-local-v1`, and create or report the PR into `main`.

## Surprises & Discoveries

- Observation: the current branch tip already matches fetched `origin/main`.
  Evidence: `git rev-parse HEAD` and `git rev-parse origin/main` both resolved to `90860a660e0939efd3b42afa0bc77ea22c3b1cd6` during preflight.

- Observation: the full F1D operator UI slice is already contained in `origin/main`.
  Evidence: `git merge-base --is-ancestor 7efb78ed6f91ef5a5d661386b3cb3b9169c5e593 origin/main` returned success, and the current `apps/web/app/page.tsx`, `apps/web/app/missions/page.tsx`, and `apps/web/app/sources/**` surfaces already reflect the finance-first source inventory posture.

- Observation: the optional F1C1 smoke-alignment slice is not contained in `origin/main`.
  Evidence: `git merge-base --is-ancestor 9774b8539544c656da1df646c1136721d6110097 origin/main` returned failure, `plans/FP-0006-source-ingest-smoke-alignment.md` is absent, the root `package.json` is missing `smoke:source-registry:local` and `smoke:source-ingest:local`, and `tools/source-ingest-smoke.*` is missing.

- Observation: after applying the missing F1C1 smoke slice, `docs/ops/local-dev.md` still described the repo as if it were only in F0 pivot-foundation work.
  Evidence: the document gained the new smoke commands from F1C1, but its opening copy still said "pivot foundation phase", "during F0", and "F0 branch state" until this reconciliation updated that wording.

## Decision Log

- Decision: treat F1D as already reconciled and do not cherry-pick or reimplement it.
  Rationale: the current `origin/main` state already carries the operator home, missions copy correction, source inventory routes, source detail routes, and web API helpers from the F1D commit.

- Decision: subsume the missing F1C1 slice by applying commit `9774b8539544c656da1df646c1136721d6110097` without creating an intermediate commit.
  Rationale: the requested reconciliation strategy prefers cherry-picking the missing work if needed, and this is the smallest additive way to restore the packaged source smoke path.

- Decision: keep GitHub connector work, Finance Twin work, CFO Wiki work, reports, monitoring, and broader backend semantics explicitly out of scope.
  Rationale: this is a closeout slice for F1 operator posture and smoke ergonomics only.

- Decision: allow only tiny truthfulness edits beyond the missing F1C1 files, most likely in `docs/ops/local-dev.md` and this active Finance Plan.
  Rationale: the repo already presents the operator UI as source-ingest-first, so only narrow wording or discoverability fixes should land here.

## Context and Orientation

Pocket CFO is in F1 closeout.
F0 reset the active guidance layer, F1A added the generic source registry, F1B added immutable source-file and provenance ingest, F1C added deterministic parser dispatch and ingest receipts, and F1D added the operator source inventory UI on top of those backend slices.

This reconciliation slice starts from a clean branch already aligned to `origin/main`.
The relevant bounded contexts are:

- `plans/` for the live Finance Plan and any tiny truthfulness note on earlier F1 plans
- `apps/web/app/` and `apps/web/lib/` only if a tiny F1 copy or truthfulness correction is still required
- `package.json` and `tools/` for the missing packaged source smoke commands
- `apps/control-plane/src/modules/sources/` only for the focused smoke-helper spec already authored in F1C1
- `docs/ops/local-dev.md` for a small Pocket CFO source-smoke discoverability and phase-truthfulness update

GitHub connector work is out of scope.
Replay, evidence bundles, provenance, and freshness behavior should remain unchanged beyond exposing the already-existing F1 source-ingest statuses through the packaged smoke path and docs.

## Plan of Work

Implement this reconciliation in three small passes.

First, keep this Finance Plan current while comparing the current branch to the known F1D and F1C1 commits so we only bring in what `origin/main` truly lacks.
Second, apply the missing F1C1 smoke-alignment work without committing it yet, then make only the narrow truthfulness polish still needed for F1 closeout.
Third, run the exact requested validation order against the local Docker-backed environment, fix only in-scope regressions, and publish one clean final reconciliation commit if every required check is green.

## Concrete Steps

1. Create and maintain `plans/FP-0007-f1-finalization-reconciliation.md` as the active Finance Plan for this slice.

2. Verify the fetched `origin/main` state for:
   - `plans/FP-0005-operator-source-inventory-ui.md`
   - `plans/FP-0006-source-ingest-smoke-alignment.md`
   - `apps/web/app/page.tsx`
   - `apps/web/app/missions/page.tsx`
   - `apps/web/app/sources/**`
   - `apps/web/lib/api.ts`
   - `package.json`
   - `tools/source-ingest-smoke.mjs`
   - `tools/source-ingest-smoke.d.mts`
   - `docs/ops/local-dev.md`

3. If `origin/main` is missing the optional F1C1 slice, apply commit `9774b8539544c656da1df646c1136721d6110097` with `git cherry-pick --no-commit` so the final branch still ends with one commit only.

4. Review the resulting changes and apply only the smallest remaining F1 truthfulness polish needed, limited to the allowed reconciliation files.

5. Run validation in this exact order:

   ```bash
   pnpm --filter @pocket-cto/web exec vitest run app/page.spec.tsx app/missions/page.spec.tsx app/sources/page.spec.tsx app/sources/[sourceId]/page.spec.tsx lib/api.spec.ts
   pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/sources/source-ingest-smoke-tool.spec.ts
   pnpm smoke:source-registry:local
   pnpm smoke:source-ingest:local
   pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/twin/workflow-sync.spec.ts src/modules/twin/test-suite-sync.spec.ts src/modules/twin/codeowners-discovery.spec.ts
   pnpm lint
   pnpm typecheck
   pnpm test
   pnpm ci:repro:current
   ```

6. If a validation step fails, fix only failures that are truly inside this F1 reconciliation slice or the known narrow twin reproducibility surface; otherwise stop and report the exact blocker without publishing.

7. If and only if the full validation ladder is green, create exactly one local commit:

   ```bash
   git commit -m "chore: finalize F1 operator and smoke surfaces"
   ```

8. If green, confirm the branch state, push `codex/f1-finalization-reconciliation-local-v1`, verify the remote head, and create or report the PR into `main` with the requested title and body.

## Validation and Acceptance

Required validation commands, in order:

```bash
pnpm --filter @pocket-cto/web exec vitest run app/page.spec.tsx app/missions/page.spec.tsx app/sources/page.spec.tsx app/sources/[sourceId]/page.spec.tsx lib/api.spec.ts
pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/sources/source-ingest-smoke-tool.spec.ts
pnpm smoke:source-registry:local
pnpm smoke:source-ingest:local
pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/twin/workflow-sync.spec.ts src/modules/twin/test-suite-sync.spec.ts src/modules/twin/codeowners-discovery.spec.ts
pnpm lint
pnpm typecheck
pnpm test
pnpm ci:repro:current
```

Acceptance is met when all of the following are true:

- the public operator home remains source-ingest-first rather than engineering-first
- the missions page no longer presents engineering or GitHub issue intake as the primary operator posture
- `/sources` inventory and `/sources/[sourceId]` detail remain present and truthful
- the repo root exposes finance-era packaged smoke commands for source registry and source ingest
- the packaged smoke helper files and focused helper spec are present
- `docs/ops/local-dev.md` truthfully points local operators toward the source-ingest smoke path when relevant
- all changes remain additive and backward compatible
- no Finance Twin, CFO Wiki, reports, monitoring, or GitHub deletion work is introduced

Replay, evidence, provenance, freshness, and limitation posture:
this slice does not add new product semantics.
It packages and documents the already-shipped F1 source-ingest behavior, keeps raw-file registration immutable, and continues to expose ingest status and limitations honestly without claiming later-phase outputs.

## Idempotence and Recovery

This slice is deliberately small and safe to retry.

- Re-running the `git cherry-pick --no-commit` step is safe only after clearing any partially applied changes, so keep the worktree clean between attempts.
- Re-running the packaged smoke commands should create new uniquely named source records and source files rather than mutate prior ones.
- If the narrow docs or plan polish proves misleading, restore only those edited files and rerun the targeted validations before resuming the full ladder.
- If an out-of-scope validation failure appears, stop without committing and report the blocker rather than widening the slice.

## Artifacts and Notes

Expected artifacts from this slice:

- one active Finance Plan for F1 reconciliation
- the missing packaged source smoke command surface from F1C1
- any tiny local-dev truthfulness update needed for F1 closeout
- one clean final reconciliation commit if validation is green
- one pushed branch and one PR into `main`, or a truthful report of why publication was blocked

Documentation posture:
keep prior F1 plans unchanged unless a tiny truthfulness note is strictly necessary.
Do not widen into unrelated docs rewrites.

## Interfaces and Dependencies

Package and runtime boundaries:

- `apps/web` stays web-only and must continue fetching through `apps/web/lib/api.ts`
- `apps/control-plane` remains the owner of source persistence, storage, and ingest semantics
- the root package owns smoke command packaging only
- internal `@pocket-cto/*` package names remain unchanged

Configuration expectations:

- reuse the current local `.env`, Postgres, and S3-compatible object-store settings
- add no new environment variables
- rely on the already-available `gh` CLI only for post-validation push and PR publication

Downstream dependency note:
this slice is intended to make the F1 repo state a stable starting point for later F2 work, but it must not start any F2 implementation itself.

## Outcomes & Retrospective

This slice is in progress and the implementation-plus-validation work is complete.

What now exists on this branch:
`origin/main` already contained the full F1D operator source inventory UI, so this reconciliation did not duplicate it.
The branch now also carries the missing optional F1C1 packaged smoke surface through `package.json`, `tools/source-ingest-smoke.mjs`, `tools/source-ingest-smoke.d.mts`, `apps/control-plane/src/modules/sources/source-ingest-smoke-tool.spec.ts`, and `plans/FP-0006-source-ingest-smoke-alignment.md`, plus one small truthfulness update to `docs/ops/local-dev.md` so it no longer reads as F0-only.

Validation results:

- `pnpm --filter @pocket-cto/web exec vitest run app/page.spec.tsx app/missions/page.spec.tsx app/sources/page.spec.tsx app/sources/[sourceId]/page.spec.tsx lib/api.spec.ts` passed.
- `pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/sources/source-ingest-smoke-tool.spec.ts` passed.
- `pnpm smoke:source-registry:local` passed and created a source plus raw-file ledger entry with ingest intentionally not requested.
- `pnpm smoke:source-ingest:local` passed and produced a `csv_tabular` ingest run with status `ready`.
- `pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/twin/workflow-sync.spec.ts src/modules/twin/test-suite-sync.spec.ts src/modules/twin/codeowners-discovery.spec.ts` passed.
- `pnpm lint` passed.
- `pnpm typecheck` passed.
- `pnpm test` passed.
- `pnpm ci:repro:current` passed and reported `CI reproduction succeeded`.

Remaining work:
create the single requested final commit, push the existing reconciliation branch, and create or report the PR into `main`.
