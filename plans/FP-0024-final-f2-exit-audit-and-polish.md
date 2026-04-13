# Finalize F2 exit truthfulness and active-doc polish

## Purpose / Big Picture

This plan implements the final **F2P Finance Twin closeout** slice for Pocket CFO.

The user-visible goal is to verify that fetched `origin/main` already truthfully ships the full F2A through F2O Finance Twin breadth, apply only the smallest additive polish needed to make the active docs and any route-visible limitations fully truthful, and leave the repo in a state where saying "broad F2 is done; move to F3" is an honest recommendation.

This slice is intentionally narrow. It is a final F2 closeout audit and polish pass, not a new breadth feature. It must not add another extractor family, must not start F3 implementation, must not widen into CFO Wiki compilation, discovery UX, reports, monitoring, controls, or connectors, and must keep F1 raw-source ingest authoritative and immutable.

## Progress

- [x] 2026-04-13T00:03:16Z Complete preflight against fetched `origin/main`, confirm `HEAD` matches `origin/main`, confirm the exact branch name, confirm a clean worktree, verify `gh` auth, and verify local Postgres plus object storage availability.
- [x] 2026-04-13T00:03:16Z Read the active repo guidance, required ops docs, scoped AGENTS files, and the full F2A through F2O Finance Plan chain; inspect the finance-twin summary, routes, service, package smoke inventory, bootstrap, domain, DB, and test seams before planning.
- [x] 2026-04-13T00:05:45Z Apply the smallest truthful closeout polish by creating this F2P plan and updating only the stale active docs the audit proved were still behind merged F2O reality.
- [x] 2026-04-13T00:10:33Z Run the full required validation ladder and confirm every requested command is green, including the finance-twin smokes, engineering-twin sync tests, repo-wide checks, and `pnpm ci:repro:current`; no in-scope code truthfulness fix was required.
- [x] 2026-04-13T00:10:33Z Create exactly one local commit, push the existing branch, verify the remote head, and create or report the requested PR now that the tiny docs-only closeout diff is fully green.

## Surprises & Discoveries

- Observation: fetched `origin/main` already contains the shipped F2O code surface, including deterministic `card_expense_csv` support and backend-first spend-item plus spend-posture reads.
  Evidence: the current finance-twin contracts, schema, routes, and summary limitation copy already name F2O extractor breadth and spend read surfaces.

- Observation: the active-doc drift is real and concentrated in a small set of files.
  Evidence: `README.md`, `START_HERE.md`, and `docs/ops/local-dev.md` still describe F2O or `FP-0023` as the active edge even though fetched `origin/main` already includes merged F2O behavior.

- Observation: the current route-visible finance-twin limitation copy appears materially truthful already.
  Evidence: `apps/control-plane/src/modules/finance-twin/summary.ts` names all shipped F2 extractor families through `card_expense_csv` and keeps F3 through F6 work explicitly out of scope.

- Observation: `PLANS.md`, `WORKFLOW.md`, and `docs/ACTIVE_DOCS.md` do not currently appear to force another F2 breadth slice.
  Evidence: their current wording stays phase-generic and already says active plans plus current code should resolve milestone truth.

- Observation: no confirmed code-path truthfulness bug was found in the current finance-twin limitation surface.
  Evidence: `apps/control-plane/src/modules/finance-twin/summary.ts` already names the shipped extractor families and route-backed breadth through card-expense plus spend posture, so the closeout remained docs-only after inspection.

- Observation: the requested validation ladder is fully green on the closeout diff.
  Evidence: the ordered finance-twin smokes, the targeted engineering-twin tests, `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm ci:repro:current` all completed successfully against the current branch.

## Decision Log

- Decision: treat F2P as a closeout audit and truthfulness slice, not as a new feature slice.
  Rationale: the fetched repo state already ships broad F2 extractor breadth through F2O, and the smallest honest path is to fix stale guidance rather than add more product surface.

- Decision: create a new active plan `plans/FP-0024-final-f2-exit-audit-and-polish.md`.
  Rationale: the work spans multiple files, touches docs and possible route-visible copy, and the repo requires a live Finance Plan for meaningful work.

- Decision: keep GitHub connector work explicitly out of scope.
  Rationale: this slice audits finance-twin truthfulness on top of file-first ingest and must not widen into connector work or revive GitHub-first product framing.

- Decision: prefer docs-only edits unless a concrete route-visible truthfulness bug is confirmed in current code.
  Rationale: the user explicitly asked for the smallest additive diff and warned against polishing for symmetry when a file is already truthful.

- Decision: leave `apps/control-plane/src/modules/finance-twin/summary.ts`, `package.json`, `docs/ACTIVE_DOCS.md`, `PLANS.md`, and `WORKFLOW.md` unchanged.
  Rationale: the audit did not find stale F2O-next wording or smoke-command drift in those files, so touching them would have been symmetry work rather than a truthful closeout fix.

- Decision: treat F3 as the next major phase and avoid inventing another broad F2 extractor family.
  Rationale: broad F2 breadth is already present through F2O, and this closeout slice exists to make that status explicit and reviewable before F3 starts.

- Decision: keep the implementation docs-only after validation instead of forcing a route-copy edit for symmetry.
  Rationale: the shipped finance-twin limitation surface and packaged smoke aliases were already truthful, and the full validation ladder confirmed the repo only needed active-guidance cleanup to make the F2 closeout statement honest.

## Context and Orientation

Pocket CFO has already shipped F1 raw-source ingest and the F2A through F2O Finance Twin breadth on fetched `origin/main`: trial balance, chart of accounts, general ledger, snapshot and lineage, reconciliation and bridge readiness, source-backed balance proof, balance-proof lineage, bank summaries, receivables aging, payables aging, contract metadata, and card-expense spend posture.

The active-doc boundary says stale milestone sequencing must be corrected in the same slice once the repo state changes. This slice therefore focuses on:

- `plans/FP-0024-final-f2-exit-audit-and-polish.md` as the active execution record
- `README.md`, `START_HERE.md`, and `docs/ops/local-dev.md` for stale F2O or `FP-0023` framing
- `docs/ACTIVE_DOCS.md`, `PLANS.md`, and `WORKFLOW.md` only if the audit proves they still imply another F2 breadth slice
- `apps/control-plane/src/modules/finance-twin/summary.ts` only if the route-visible limitations or capability copy is still behind merged F2O reality
- `package.json` only if active-doc smoke inventory drifts from the actually packaged finance smoke commands

GitHub connector work is out of scope. The engineering-twin module remains intact and its reproducibility checks must stay green unchanged. Replay behavior is unchanged in this slice, but route-visible limitations, provenance posture, freshness language, and active-doc truthfulness remain first-class because the goal is an evidence-safe closeout recommendation rather than a cosmetic rewrite.

## Plan of Work

Implement this slice in four bounded passes.

First, keep this plan current and finish the audit of the active docs, packaged smoke inventory, and route-visible finance-twin copy against fetched `origin/main`.

Second, update only the files the audit proves are stale so they truthfully state that merged F2 breadth now runs through F2O, that `FP-0024` is the active closeout plan for this thread, and that F3 is the next major phase instead of another broad F2 extractor slice.

Third, leave code untouched unless a concrete route-visible truthfulness bug is confirmed. If such a bug exists, fix it in the smallest bounded finance-twin file without widening the product surface or weakening limitations.

Fourth, run the full requested validation ladder using the Docker-backed local environment, stop on out-of-scope failures, and publish exactly one commit plus the requested push and PR only if edits were made and every required command is green.

## Concrete Steps

1. Keep `plans/FP-0024-final-f2-exit-audit-and-polish.md` current throughout the slice, updating `Progress`, `Decision Log`, `Surprises & Discoveries`, and `Outcomes & Retrospective` at each meaningful checkpoint.

2. Audit the stale guidance and plan-pointer surfaces in:
   - `README.md`
   - `START_HERE.md`
   - `docs/ops/local-dev.md`
   - `docs/ACTIVE_DOCS.md` only if the transition note needs a tiny truthfulness addition
   - `PLANS.md` only if plan sequencing wording still implies another F2 breadth slice
   - `WORKFLOW.md` only if workflow wording still conflicts with the F2-to-F3 transition

3. Confirm whether `apps/control-plane/src/modules/finance-twin/summary.ts` already truthfully describes the shipped Finance Twin breadth and limitations.
   Only edit it if current route-visible wording still understates merged F2O breadth or incorrectly frames F2O as unfinished.

4. Confirm whether `package.json` already exposes the packaged smoke commands the active docs should list.
   Only edit it if the active docs would otherwise be forced to describe non-existent or renamed local finance smoke commands.

5. Update `README.md` so it:
   - includes merged F2O in the shipped F2 baseline
   - stops calling F2O the active next slice
   - points the active plan pointer at `plans/FP-0024-final-f2-exit-audit-and-polish.md`
   - names F3 as the next major phase after this closeout
   - keeps the packaged finance smoke inventory truthful and reviewable

6. Update `START_HERE.md` so it:
   - stops ending the suggested F2 thread list at F2O as if it were still pending
   - includes `F2P-final-f2-exit-audit-and-polish` as the closeout thread for the current repo state
   - makes F3 the next major implementation phase after the closeout rather than implying more broad F2 extractor work

7. Update `docs/ops/local-dev.md` so it:
   - describes the merged repo state through F2O rather than through F2N
   - treats `card_expense_csv`, spend-item inventory, and spend posture as already shipped
   - keeps the packaged finance smoke list aligned with the actually available root scripts
   - makes broad F2 breadth complete and F3 next-major-phase truth explicit without starting F3 implementation

8. If and only if a file is confirmed stale, apply the smallest truthful edit with no extra symmetry changes.

9. Run validation in this exact order:

```bash
pnpm --filter @pocket-cto/domain exec vitest run src/finance-twin.spec.ts
pnpm --filter @pocket-cto/db exec vitest run src/schema.spec.ts
pnpm smoke:source-ingest:local
pnpm smoke:finance-twin:local
pnpm smoke:finance-twin-account-catalog:local
pnpm smoke:finance-twin-general-ledger:local
pnpm smoke:finance-twin-snapshot:local
pnpm smoke:finance-twin-reconciliation:local
pnpm smoke:finance-twin-period-context:local
pnpm smoke:finance-twin-account-bridge:local
pnpm smoke:finance-twin-balance-bridge-prerequisites:local
pnpm smoke:finance-twin-source-backed-balance-proof:local
pnpm smoke:finance-twin-balance-proof-lineage:local
pnpm smoke:finance-twin-bank-account-summary:local
pnpm smoke:finance-twin-receivables-aging:local
pnpm smoke:finance-twin-payables-aging:local
pnpm smoke:finance-twin-contract-metadata:local
pnpm smoke:finance-twin-card-expense:local
pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/twin/workflow-sync.spec.ts src/modules/twin/test-suite-sync.spec.ts src/modules/twin/codeowners-discovery.spec.ts
pnpm lint
pnpm typecheck
pnpm test
pnpm ci:repro:current
```

10. If and only if edits were needed and every required validation command is green, create exactly one local commit:

```bash
git commit -m "chore: finalize F2 exit polish"
```

11. If edits were made, confirm the branch remains `codex/f2p-final-f2-exit-audit-and-polish-local-v1`, show `git branch --show-current`, `git log --oneline -3`, and `git status --short --untracked-files=all`, push that exact branch, verify the remote head, and create or report the PR into `main` with the requested title and body.

## Validation and Acceptance

Required validation order:

```bash
pnpm --filter @pocket-cto/domain exec vitest run src/finance-twin.spec.ts
pnpm --filter @pocket-cto/db exec vitest run src/schema.spec.ts
pnpm smoke:source-ingest:local
pnpm smoke:finance-twin:local
pnpm smoke:finance-twin-account-catalog:local
pnpm smoke:finance-twin-general-ledger:local
pnpm smoke:finance-twin-snapshot:local
pnpm smoke:finance-twin-reconciliation:local
pnpm smoke:finance-twin-period-context:local
pnpm smoke:finance-twin-account-bridge:local
pnpm smoke:finance-twin-balance-bridge-prerequisites:local
pnpm smoke:finance-twin-source-backed-balance-proof:local
pnpm smoke:finance-twin-balance-proof-lineage:local
pnpm smoke:finance-twin-bank-account-summary:local
pnpm smoke:finance-twin-receivables-aging:local
pnpm smoke:finance-twin-payables-aging:local
pnpm smoke:finance-twin-contract-metadata:local
pnpm smoke:finance-twin-card-expense:local
pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/twin/workflow-sync.spec.ts src/modules/twin/test-suite-sync.spec.ts src/modules/twin/codeowners-discovery.spec.ts
pnpm lint
pnpm typecheck
pnpm test
pnpm ci:repro:current
```

Acceptance is met when all of the following are true:

- all active docs are truthful about the shipped F2 state on fetched `origin/main`
- no active doc still treats F2O as the pending next slice
- the next major phase is described as F3 rather than another broad F2 extractor slice
- route-visible limitations or capability copy does not imply unfinished F2 breadth if the code already ships it
- the packaged finance smoke inventory in the active docs matches the actually available packaged smoke commands
- F1 source-ingest behavior still works unchanged
- F2A through F2O behavior still works unchanged
- existing engineering-twin reproducibility tests still pass unchanged
- the final recommendation on whether F2 is done and the repo should move to F3 is explicit, grounded, and justified by the shipped repo state
- the diff remains tiny and reviewable

Provenance, freshness, replay, and evidence posture:
this slice must keep raw sources immutable, keep the finance-twin limitation copy truthful, preserve route-visible freshness and limitation language where relevant, and avoid implying any new mission-output, wiki, reporting, or connector behavior that the current code does not actually ship. Replay behavior remains unchanged.

## Idempotence and Recovery

This slice is additive-first and safe to retry when followed carefully.

- Re-running the audit and validation commands is safe because the intended changes are limited to plan and truthfulness wording unless a tiny confirmed code-copy fix is required.
- Re-running the packaged smokes and tests should keep proving the same F1 and F2 behavior because the closeout slice does not change raw-source identity, extractor families, or the engineering-twin path.
- If a doc change turns out to overclaim the shipped repo state, revert that wording immediately and prefer the narrower truthful statement.
- If validation fails outside this slice or outside the known narrow engineering-twin reproducibility surface, stop and report the blocker instead of widening scope or publishing a partially green branch.

## Artifacts and Notes

Expected artifacts from this slice:

- one active F2P Finance Plan
- truthful active-doc updates only where the audit proves stale F2 wording still exists
- at most one tiny finance-twin wording fix if a concrete route-visible truthfulness bug is confirmed
- one full validation record showing the shipped F2 breadth still works unchanged
- one clean commit, push, and PR only if edits were needed and the full ladder is green

Evidence-bundle note:
this slice changes active guidance and may touch route-visible limitations, so the resulting wording must keep sources, freshness posture, gaps, and limitations visible enough that a human reviewer can understand what is shipped without relying on chat memory. It does not introduce new artifacts, reports, approvals, or external communication flows.

## Interfaces and Dependencies

Primary interfaces affected by this slice:

- active-doc guidance in `README.md`, `START_HERE.md`, and `docs/ops/local-dev.md`
- the active Finance Plan in `plans/FP-0024-final-f2-exit-audit-and-polish.md`
- route-visible finance-twin limitation copy only if a concrete truthfulness fix is needed
- packaged smoke command inventory in root docs, driven by the current `package.json` scripts

Key dependencies and seams:

- raw-source authority remains the existing source-registry storage and metadata path
- finance-twin route truth depends on the current persisted F2 state in `@pocket-cto/domain`, `@pocket-cto/db`, and `apps/control-plane/src/modules/finance-twin/`
- engineering-twin reproducibility remains guarded by the unchanged `src/modules/twin/*.spec.ts` suite
- no new environment variables, connector permissions, workflow contract changes, or package-scope renames are expected

## Outcomes & Retrospective

Current outcome:
the audit confirmed broad F2 breadth is already shipped through F2O on fetched `origin/main`, and the only confirmed repo-state gap was stale active guidance in `README.md`, `START_HERE.md`, and `docs/ops/local-dev.md`. No confirmed finance-twin code truthfulness bug was found, so the implementation remained a tiny plan-plus-docs closeout rather than a code slice. The full requested validation ladder is now green, including `pnpm ci:repro:current`, so the branch is in a truthful state for a final F2 closeout recommendation.

Broad F2 closeout is complete, and the next new implementation phase after this merged closeout is F3 CFO Wiki compiler work.

Remaining work inside this plan is complete; the requested publication flow is already reflected in merged repo history.
