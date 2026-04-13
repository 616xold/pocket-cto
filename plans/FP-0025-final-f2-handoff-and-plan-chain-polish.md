# Finalize the F2 handoff and plan-chain truthfulness

## Purpose / Big Picture

This plan implements the final **F2Q handoff-and-plan-chain polish** slice for Pocket CFO.

The user-visible goal is to leave the repository in a state where a fresh Codex thread can tell, without guesswork, that broad F2 Finance Twin breadth is already complete through F2O, that F3 CFO Wiki compiler work is the next new implementation phase, and that the correct workflow is:

- continue an unfinished `plans/FP-*.md` plan if one actually exists
- otherwise create the next-phase Finance Plan before changing code

This slice is intentionally narrow.
It is not another finance breadth feature, does not add another extractor family, does not widen the backend finance surface, does not start F3 through F6 implementation, and should remain docs-and-plan focused unless a concrete route-visible truthfulness bug is confirmed.

## Progress

- [x] 2026-04-13T09:07:00Z Complete preflight against fetched `origin/main`, confirm the exact branch name, clean worktree, authenticated `gh`, and local Postgres plus object storage availability.
- [x] 2026-04-13T09:07:00Z Read the active repo guidance, required ops docs, finance-twin truth surfaces, package smoke inventory, and the full `FP-0001` through `FP-0024` Finance Plan chain before planning.
- [x] 2026-04-13T09:07:00Z Record the pre-edit F2Q verdict: broad F2 is already shipped through F2O, the remaining work is active-doc truthfulness plus plan-chain bookkeeping, and no confirmed finance-twin code copy bug has been found so far.
- [x] 2026-04-13T09:28:00Z Apply the smallest truthful updates to active docs and clearly merged F1 or F2 plans so the repo no longer hardcodes an always-active unfinished `FP-*` plan or stale final publish-step checkboxes.
- [x] 2026-04-13T09:46:00Z Run the full required validation ladder, fix only in-scope failures, and confirm the full smoke, test, lint, typecheck, and reproducibility sequence is green without widening scope.
- [x] 2026-04-13T15:42:38Z Confirm the slice published exactly one follow-up commit, pushed `codex/f2q-final-f2-handoff-and-plan-chain-polish-local-v1`, verified the remote head, and opened PR `#84` after the already-green validation ladder.
- [x] 2026-04-13T15:45:19Z Run the strict QA pass, correct the stale final publication bookkeeping in this plan only, and re-run the required F1 or F2 smokes, engineering-twin trio, and `pnpm ci:repro:current` successfully.

## Surprises & Discoveries

- Observation: fetched `origin/main` already includes the merged F2O breadth and the later `chore: finalize F2 exit polish` follow-up, so this slice is truly a handoff-and-bookkeeping cleanup rather than a feature gap.
  Evidence: preflight showed `HEAD` equals `origin/main`, the finance-twin contracts and limitations already name breadth through `card_expense_csv`, and `git log` shows `e5e9393 chore: finalize F2 exit polish` touching `plans/FP-0024-final-f2-exit-audit-and-polish.md`.

- Observation: the live guidance still hardcodes an always-active unfinished plan in several places.
  Evidence: `README.md`, `START_HERE.md`, `AGENTS.md`, and `docs/ACTIVE_DOCS.md` still say “the current active `plans/FP-*.md`” or point directly at `FP-0024` even though the fetched repo state already includes the F2 closeout commit.

- Observation: a small set of clearly merged F1 or F2 plans still have only stale final publication checkboxes left.
  Evidence: `rg -n "^- \\[ \\]" plans/FP-*.md` shows publish-step leftovers in `FP-0007`, `FP-0008`, `FP-0020`, `FP-0022`, `FP-0023`, and `FP-0024`, and `git log -1 -- <plan>` shows later merged commits for those files or slices. `FP-0003` remains uncertain enough that it should stay unchanged unless the audit becomes stronger.

- Observation: `WORKFLOW.md` and `apps/control-plane/src/modules/finance-twin/summary.ts` already read truthfully for this handoff slice.
  Evidence: `WORKFLOW.md` does not hardcode an always-active unfinished Finance Plan or another F2 breadth step, and `summary.ts` already states the shipped deterministic source families through `card_expense_csv` without overclaiming wiki or F3 behavior.

- Observation: the first publish pass left this plan’s final progress checkbox stale even though the branch, remote head, and PR were already in the expected state.
  Evidence: QA found `git status --short --untracked-files=all` clean, `git diff --name-status HEAD~1..HEAD` limited to docs and plan files, and `gh pr list --head codex/f2q-final-f2-handoff-and-plan-chain-polish-local-v1 --base main` returning open PR `#84` while this plan still showed the publication step unchecked.

## Decision Log

- Decision: treat this slice as docs-and-plan truthfulness work first, with TypeScript edits allowed only if a concrete route-visible truthfulness bug is proven.
  Rationale: the user explicitly asked for the smallest additive diff and the current audit has not found a confirmed `summary.ts` mismatch.

- Decision: create a new active Finance Plan `plans/FP-0025-final-f2-handoff-and-plan-chain-polish.md`.
  Rationale: the slice spans multiple files, changes active guidance and plan-chain bookkeeping, and the repo requires a live Finance Plan for meaningful work.

- Decision: replace “read the current active `plans/FP-*.md`” wording with a truthful fallback rule instead of hardcoding another soon-stale active-plan pointer.
  Rationale: a fresh thread must be able to distinguish “continue an unfinished plan” from “create the next-phase plan before coding.”

- Decision: keep GitHub connector work explicitly out of scope.
  Rationale: the user explicitly forbids GitHub Connector Guard and this slice is not connector work.

- Decision: update only clearly merged plans whose stale state is limited to final publish-step bookkeeping, and leave uncertain cases untouched while recording the uncertainty here.
  Rationale: the user explicitly prefers truthful minimal edits over speculative historical rewriting.

- Decision: leave `WORKFLOW.md`, `package.json`, and `apps/control-plane/src/modules/finance-twin/summary.ts` unchanged.
  Rationale: the audit found no truthfulness drift in those files, and this slice should not create symmetry edits that do not improve repo accuracy.

- Decision: correct only `FP-0025` during the QA pass unless another in-scope truthfulness gap appears.
  Rationale: the branch is otherwise clean, the active docs and audited prior plans already match the intended F2 handoff state, and the user asked for a narrow audit-and-correction pass.

## Context and Orientation

Pocket CFO has already shipped F1 raw-source ingest and broad F2 Finance Twin breadth through F2O on fetched `origin/main`.
The current repo already exposes packaged local finance smokes through `card-expense`, and the current finance-twin limitation copy appears materially truthful.

The relevant files for this slice are:

- `plans/FP-0025-final-f2-handoff-and-plan-chain-polish.md` as the live execution record
- `README.md`
- `START_HERE.md`
- `AGENTS.md`
- `docs/ACTIVE_DOCS.md`
- `docs/ops/local-dev.md`
- `PLANS.md` only if a tiny fallback-rule clarification is truly needed
- `WORKFLOW.md` only if it still implies an always-active unfinished plan or more broad F2 work
- `apps/control-plane/src/modules/finance-twin/summary.ts` only if a confirmed route-visible truthfulness gap appears
- prior plan files only where clearly merged publish-step bookkeeping is stale

GitHub connector work is out of scope.
The engineering twin remains intact and its reproducibility tests must stay green unchanged.
Replay behavior is unchanged, but active-doc truthfulness, route-visible limitations wording, provenance posture, freshness posture, and next-phase guidance remain first-class because this slice is about leaving an evidence-safe handoff state.

## Plan of Work

Implement this slice in four bounded passes.

First, keep this plan current while finishing the audit of active guidance, packaged smoke inventory, and the F1/F2 plan chain against fetched `origin/main`.

Second, update only the active docs that still overstate `FP-0024` as in progress or assume an unfinished active `FP-*` plan must always exist. The intended replacement is a small truthful fallback rule that tells a fresh thread to continue an unfinished plan if one exists, otherwise create the next-phase plan before coding.

Third, update only clearly merged F1 or F2 plans whose remaining stale state is limited to the final commit/push/PR checkbox or an equally small “remaining work is publication only” note. Leave any uncertain older plan unchanged and record that uncertainty here rather than guessing.

Fourth, run the full required validation ladder, stop on out-of-scope failures, and publish exactly one commit plus the requested push and PR only if edits were needed and every required command is green.

## Concrete Steps

1. Keep this plan updated at every meaningful checkpoint.

2. Repair active guidance in:
   - `README.md`
   - `START_HERE.md`
   - `AGENTS.md`
   - `docs/ACTIVE_DOCS.md`
   - `docs/ops/local-dev.md`
   - `PLANS.md` only if a tiny fallback-rule clarification is strictly necessary
   - `WORKFLOW.md` only if the audit proves it still implies an unfinished F2 or always-active unfinished plan

3. Make broad F2 completion and F3-next explicit without hardcoding a new stale “active plan” pointer.

4. Confirm that the packaged finance smoke list in the active docs exactly matches `package.json` through:
   - `pnpm smoke:source-ingest:local`
   - `pnpm smoke:finance-twin:local`
   - `pnpm smoke:finance-twin-account-catalog:local`
   - `pnpm smoke:finance-twin-general-ledger:local`
   - `pnpm smoke:finance-twin-snapshot:local`
   - `pnpm smoke:finance-twin-reconciliation:local`
   - `pnpm smoke:finance-twin-period-context:local`
   - `pnpm smoke:finance-twin-account-bridge:local`
   - `pnpm smoke:finance-twin-balance-bridge-prerequisites:local`
   - `pnpm smoke:finance-twin-source-backed-balance-proof:local`
   - `pnpm smoke:finance-twin-balance-proof-lineage:local`
   - `pnpm smoke:finance-twin-bank-account-summary:local`
   - `pnpm smoke:finance-twin-receivables-aging:local`
   - `pnpm smoke:finance-twin-payables-aging:local`
   - `pnpm smoke:finance-twin-contract-metadata:local`
   - `pnpm smoke:finance-twin-card-expense:local`

5. Audit prior plan bookkeeping and apply only minimal truthful fixes in:
   - `plans/FP-0007-f1-finalization-reconciliation.md`
   - `plans/FP-0008-f1-final-audit-and-polish.md`
   - `plans/FP-0020-receivables-aging-and-collections-posture.md`
   - `plans/FP-0022-contract-metadata-and-obligation-calendar.md`
   - `plans/FP-0023-card-expense-and-spend-posture.md`
   - `plans/FP-0024-final-f2-exit-audit-and-polish.md`

6. Leave `plans/FP-0003-source-files-and-provenance-ingest.md` unchanged unless the audit becomes unambiguously stronger than it is now.

7. Re-check `apps/control-plane/src/modules/finance-twin/summary.ts` only if the doc fixes reveal a real route-visible truthfulness mismatch. Otherwise keep it untouched.

8. Run validation in this exact order:

```bash
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

9. If and only if the full ladder is green, create exactly one local commit:

```bash
git commit -m "chore: finalize F2 handoff polish"
```

10. If edits were made, confirm the branch is still `codex/f2q-final-f2-handoff-and-plan-chain-polish-local-v1`, push that exact branch, verify the remote head, and create or report the PR into `main`.

## Validation and Acceptance

Required validation order:

```bash
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
- no active doc still frames `FP-0024` as an in-progress active closeout if it is already merged
- no active doc assumes there is always a current unfinished `plans/FP-*.md` file
- the active docs now explain the correct fallback: continue an unfinished plan if one exists; otherwise create the next-phase plan before code changes
- the next new active implementation phase is described as F3 rather than another broad F2 breadth slice
- the packaged finance smoke inventory in active docs matches `package.json` exactly
- the F1/F2 plan chain has been audited for stale release-step bookkeeping, and any clearly merged plan with only stale final publish bookkeeping has been fixed minimally
- `FP-0024` is current, truthful, and marked complete if merged
- no new finance-twin feature is added
- F1 source-ingest behavior still works
- F2A through F2O behavior still works
- engineering-twin reproducibility tests still pass unchanged
- the diff remains tiny and reviewable

Provenance, freshness, replay, and evidence posture:
this slice must keep raw sources immutable, keep route-visible limitation wording truthful, preserve explicit freshness and limitation language where relevant, and avoid implying any new wiki, reporting, monitoring, or connector behavior that the current code does not actually ship. Replay behavior remains unchanged.

## Idempotence and Recovery

This slice is additive-first and safe to retry when followed carefully.

- Re-running the audit and validation commands is safe because the intended changes are limited to plan and truthfulness wording unless a tiny confirmed code-copy fix is required.
- Re-running the packaged finance smokes and engineering-twin tests should keep proving the same F1 and F2 behavior because this slice does not change raw-source identity, extractor families, or the engineering-twin path.
- If a doc or plan edit overclaims the shipped repo state, revert that wording immediately and prefer the narrower truthful statement.
- If a prior plan’s merge or release status turns out to be less certain than it looked, leave that plan unchanged and record the uncertainty here instead of guessing.
- If validation fails outside this slice or outside the known narrow engineering-twin reproducibility surface, stop and report the blocker instead of widening scope or publishing a partially green branch.

## Artifacts and Notes

Expected artifacts from this slice:

- one active F2Q Finance Plan
- truthful active-doc updates only where the audit proves stale F2 guidance still exists
- minimal plan-chain bookkeeping updates only where merge status is clearly knowable
- at most one tiny finance-twin wording fix if a concrete route-visible truthfulness bug is confirmed
- one full validation record showing the shipped F2 breadth still works unchanged
- one clean commit, push, and PR only if edits were needed and the full ladder is green

Evidence-bundle note:
this slice changes active guidance and plan-chain bookkeeping, so the resulting wording must keep sources, freshness posture, gaps, and limitations visible enough that a human reviewer can understand what is shipped without relying on chat memory. It does not introduce new artifacts, reports, approvals, or external communication flows.

## Interfaces and Dependencies

Primary interfaces affected by this slice:

- active guidance in `README.md`, `START_HERE.md`, `AGENTS.md`, `docs/ACTIVE_DOCS.md`, and `docs/ops/local-dev.md`
- the live Finance Plan `plans/FP-0025-final-f2-handoff-and-plan-chain-polish.md`
- prior F1 or F2 plans only where stale final publication bookkeeping is clearly merged
- route-visible finance-twin limitations only if a confirmed truthfulness bug appears
- packaged smoke command inventory as documented from the current root `package.json`

Key dependencies and seams:

- raw-source authority remains the existing source-registry storage and metadata path
- finance-twin route truth depends on the current persisted F2 state in `@pocket-cto/domain`, `@pocket-cto/db`, and `apps/control-plane/src/modules/finance-twin/`
- engineering-twin reproducibility remains guarded by the unchanged `src/modules/twin/*.spec.ts` suite
- no new environment variables, connector permissions, workflow contract changes, or package-scope renames are expected

## Outcomes & Retrospective

Final outcome:

- Broad F2 remains explicitly closed through F2O, active docs now handle the “unfinished plan exists” versus “create the next-phase plan” transition truthfully, and the next new implementation phase remains F3 CFO Wiki compiler work.
- The only QA correction needed after publication was to close the stale final publication bookkeeping inside this plan itself; no active-doc wording, finance-twin route copy, package script, or prior-plan bookkeeping needed further changes.
- The strict QA rerun stayed green for `pnpm smoke:source-ingest:local`, every requested finance-twin smoke through `pnpm smoke:finance-twin-card-expense:local`, the engineering-twin Vitest trio, and `pnpm ci:repro:current`.
- PR `#84` remains the active review artifact for this slice, and no new finance features, source families, or connector behavior were introduced during the QA pass.

Implementation status before validation:

- Active docs now say broad F2 is complete through F2O, stop framing `FP-0024` as the still-live closeout plan, and explain the fallback rule: continue an unfinished Finance Plan if one exists; otherwise create the next-phase plan before code changes.
- `PLANS.md` now encodes the same fallback rule and clarifies that clearly merged plans should not retain stale final publication checkboxes.
- Clearly merged F1 or F2 plans with only stale final publication bookkeeping were updated minimally in `FP-0007`, `FP-0008`, `FP-0020`, `FP-0022`, `FP-0023`, and `FP-0024`.
- `FP-0003`, `WORKFLOW.md`, `package.json`, and `summary.ts` were intentionally left unchanged because the audit did not justify stronger edits.

The intended shipped outcome remains a repo that makes broad F2 completion explicit, removes stale always-active-plan assumptions, fixes clearly merged plan-chain publication bookkeeping, and leaves an unambiguous handoff rule for the first fresh F3 thread without adding new finance functionality.

Validation status:

- `pnpm smoke:source-ingest:local` passed.
- All requested finance-twin breadth smokes passed through `pnpm smoke:finance-twin-card-expense:local`.
- `pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/twin/workflow-sync.spec.ts src/modules/twin/test-suite-sync.spec.ts src/modules/twin/codeowners-discovery.spec.ts` passed unchanged.
- `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm ci:repro:current` all passed.
