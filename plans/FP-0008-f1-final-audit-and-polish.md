# Audit the F1 milestone against latest main and apply only tiny truthfulness polish

## Purpose / Big Picture

This plan performs the final **F1 closeout audit and polish** slice for Pocket CFO.

The user-visible goal is to verify that the actual latest `origin/main` truthfully satisfies the F1 milestone before any F2 work begins, then apply only the smallest additive last-mile polish if the public operator surface, smoke ergonomics, or local-dev guidance still overstate or misframe the shipped F1 state.

This slice is intentionally narrow.
It does not start Finance Twin work, CFO Wiki work, reporting, monitoring, finance discovery product work, or GitHub connector deletion.

## Progress

- [x] 2026-04-09T19:45:51Z Complete preflight: fetch `origin/main`, confirm clean branch state on `codex/f1-final-audit-and-last-mile-polish-local-v1`, verify `gh` auth, confirm the `616xold/pocket-cfo` remote, and confirm local Postgres plus object storage availability.
- [x] 2026-04-09T19:45:51Z Read the active repo guidance, roadmap, F0-F1 Finance Plans, scoped AGENTS files, and Finance Plan template to ground the audit in the written F1 contract.
- [x] 2026-04-09T19:48:08Z Inspect the required source, web, smoke, shell-branding, and local-dev files against the F1 milestone checklist and record the audit verdict before any edits.
- [x] 2026-04-09T19:48:08Z Apply the smallest in-scope polish needed: Pocket CFO shell metadata, a generic operator-safe not-found page, and local-dev wording that reflects an F1-complete source-ingest baseline.
- [x] 2026-04-09T19:52:00Z Run the full requested validation ladder after the public-surface polish and confirm green results through focused web tests, both packaged source smokes, the twin guard specs, `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm ci:repro:current`.
- [ ] 2026-04-09T19:45:51Z If edits were required and every required validation is green, create one final polish commit, push the current branch, and create or report the PR into `main`.

## Surprises & Discoveries

- Observation: the actual F1 backend and operator source surfaces are already present on fetched `origin/main`.
  Evidence: `packages/db/src/schema/sources.ts`, `packages/domain/src/source-registry.ts`, `apps/control-plane/src/modules/sources/routes.ts`, `apps/web/app/sources/**`, `package.json`, and `tools/source-ingest-smoke.*` all line up with the roadmap and the earlier F1 plans.

- Observation: the remaining F1 gap is public-surface truthfulness, not missing source-ingest capability.
  Evidence: `apps/web/app/layout.tsx`, `apps/web/app/manifest.ts`, and `apps/web/app/not-found.tsx` still described the product as Pocket CTO or engineering mission control, while `docs/ops/local-dev.md` still framed the repo as "early F1" despite the shipped F1 source-ingest surface.

## Decision Log

- Decision: audit against freshly fetched `origin/main` and prefer a no-op result if the current repo already satisfies F1 cleanly.
  Rationale: the user explicitly prefers no code changes unless the audit reveals a real remaining gap.

- Decision: keep GitHub connector work explicitly out of scope.
  Rationale: F1 closeout should preserve the existing connector boundary and avoid widening the slice.

- Decision: keep any allowed polish limited to public-surface truthfulness, operator posture, smoke ergonomics, or small local-dev accuracy fixes.
  Rationale: backend F1 semantics are already expected to be in place, so this slice should not reopen core implementation work unless a tiny truthful fix is strictly necessary.

- Decision: keep the final polish to wording and metadata only.
  Rationale: the audit found no missing F1 backend or operator-surface implementation, only stale branding and phase wording.

## Context and Orientation

Pocket CFO is finishing F1.
F0 reset the active guidance layer, F1A added the source registry, F1B added immutable raw-file and provenance ingest, F1C added deterministic parser dispatch and ingest receipts, F1D added the operator source inventory UI, and F1 closeout work added packaged source smoke commands plus source-ingest-first operator posture.

This audit starts from a clean local branch whose `HEAD` currently matches fetched `origin/main`.
The relevant bounded contexts for this slice are:

- `plans/` for the live audit record and any tiny truthfulness note if strictly needed
- `apps/web/app/`, `apps/web/components/`, and `apps/web/lib/api.ts` for public operator posture and source-inventory truthfulness
- `package.json` and `tools/source-ingest-smoke.*` for packaged F1 smoke ergonomics
- `apps/control-plane/src/modules/sources/source-ingest-smoke-tool.spec.ts` only if smoke helper coverage needs a tiny truthful adjustment
- `docs/ops/local-dev.md` for post-F1 local guidance accuracy

GitHub connector work is out of scope.
Finance Twin, CFO Wiki, reporting, monitoring, approvals expansion, and broader mission/discovery product work are out of scope.
Replay, evidence, provenance, and freshness behavior should stay unchanged unless a tiny wording fix is needed to keep existing limitations visible.

## Plan of Work

Run the audit in three passes.

First, inspect the required implementation, UI, smoke, and documentation surfaces against the roadmap and earlier F1 plans to decide whether F1 is already complete on latest `origin/main`.
Second, if a real gap remains, apply only the smallest additive polish inside the user-approved file list and keep the change reviewable and CI-safe.
Third, run the narrowest validation that truthfully supports the verdict, expanding to the full requested validation ladder only when edits or touched surfaces require it.

## Concrete Steps

1. Inspect the required audit files, including:
   - `apps/web/app/layout.tsx`
   - `apps/web/app/manifest.ts`
   - `apps/web/app/not-found.tsx`
   - `apps/web/app/page.tsx`
   - `apps/web/app/page.spec.tsx`
   - `apps/web/app/missions/page.tsx`
   - `apps/web/app/missions/page.spec.tsx`
   - `apps/web/app/missions/[missionId]/page.tsx`
   - `apps/web/components/mission-card.tsx`
   - `apps/web/components/discovery-answer-card.tsx`
   - `apps/web/app/sources/**`
   - `apps/web/lib/api.ts`
   - `apps/web/lib/api.spec.ts`
   - `package.json`
   - `tools/source-ingest-smoke.mjs`
   - `tools/source-ingest-smoke.d.mts`
   - `apps/control-plane/src/modules/sources/source-ingest-smoke-tool.spec.ts`
   - `docs/ops/local-dev.md`
   - `plans/FP-0005-operator-source-inventory-ui.md`
   - `plans/FP-0006-source-ingest-smoke-alignment.md`
   - `plans/FP-0007-f1-finalization-reconciliation.md`

2. Compare those files against the explicit F1 checklist:
   - source registry shape and usability
   - raw file ingest truthfulness
   - deterministic parser dispatch and ingest receipts
   - operator source inventory and detail UI
   - packaged smoke commands
   - Pocket CFO public posture and shell metadata
   - truthful local-dev guidance
   - absence of early F2+ leakage

3. Record the audit verdict in this plan before making any edits.

4. If needed, apply only the smallest allowed polish in the user-approved files.

5. Run validation in the requested order when changes require it:

   ```bash
   pnpm --filter @pocket-cto/web exec vitest run app/page.spec.tsx app/missions/page.spec.tsx app/sources/page.spec.tsx app/sources/[sourceId]/page.spec.tsx lib/api.spec.ts
   pnpm smoke:source-registry:local
   pnpm smoke:source-ingest:local
   pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/twin/workflow-sync.spec.ts src/modules/twin/test-suite-sync.spec.ts src/modules/twin/codeowners-discovery.spec.ts
   pnpm lint
   pnpm typecheck
   pnpm test
   pnpm ci:repro:current
   ```

6. If no edits are needed, still run the smallest subset that proves the no-op verdict and document any intentionally skipped optional commands.

7. If and only if edits were needed and the full required ladder is green, create exactly one local commit:

   ```bash
   git commit -m "chore: finish F1 milestone polish"
   ```

8. If green and a commit exists, push `codex/f1-final-audit-and-last-mile-polish-local-v1`, verify the remote head, and create or report the PR into `main`.

## Validation and Acceptance

Validation strategy:
run the narrowest command set that truthfully supports the audit verdict.
If any web, smoke, or docs files change, run the full requested validation ladder.
If the audit is a no-op, still run enough targeted proof to justify that verdict and explain any skipped optional validations.

Acceptance is met when all of the following are true:

- latest `origin/main` truthfully satisfies the F1 exit criteria from the roadmap and F1 plans
- the operator web surface is source-ingest-first rather than engineering-first
- packaged source smoke commands exist and work
- local-dev guidance reflects the post-F1 repo state honestly
- no F2, F3, F4, F5, or F6 implementation work is introduced here
- any remaining limitations stay explicit rather than implied away

Replay, evidence, provenance, freshness, and limitation posture:
this slice should not add new product semantics.
It may only correct wording or tiny surface behavior so existing F1 source-registry, raw-ingest, and ingest-status behavior remains visible and truthful.

## Idempotence and Recovery

This audit slice is safe to retry.

- Re-reading and re-running the audit commands is harmless.
- If no edits are needed, the worktree should remain clean throughout.
- If a tiny polish edit proves unnecessary or misleading, revert only that uncommitted file before validation and keep rollback scope isolated to the approved file list.
- If an out-of-scope failure appears during validation, stop without publishing and report the exact blocker rather than widening the slice.

## Artifacts and Notes

Expected artifacts from this slice:

- one active Finance Plan documenting the F1 audit verdict
- zero code changes if latest `origin/main` already satisfies F1 truthfully
- or one tiny additive polish diff limited to the approved files
- validation evidence sufficient to justify the final PASS or polish verdict
- one clean commit, push, and PR only if edits were actually needed

Documentation posture:
avoid broad rewrites.
Only update active docs or earlier F1 plans if a tiny truthfulness note is strictly necessary.

## Interfaces and Dependencies

Package and runtime boundaries:

- `apps/web` remains web-only and must keep fetching through `apps/web/lib/api.ts`
- `apps/control-plane` remains the owner of source persistence, storage, parser dispatch, and ingest behavior
- the root package owns smoke-command packaging only
- internal `@pocket-cto/*` names remain unchanged

Runtime expectations:

- reuse the existing local Docker-backed Postgres and S3-compatible object store
- rely on the existing `.env` and packaged local smoke commands
- use `gh` only for optional push and PR publication if edits were actually needed

Downstream dependency note:
this slice exists to determine whether F1 is truly done and whether F2 can begin without carrying hidden F1 cleanup.

## Outcomes & Retrospective

This slice is in progress.
The audit verdict is now clear: fetched `origin/main` already satisfies the substantive F1 milestone, and the only remaining gap was stale Pocket CTO shell metadata plus slightly outdated local-dev framing.
The diff is therefore limited to those truthfulness fixes.

Validation results are now complete and green:

- `pnpm --filter @pocket-cto/web exec vitest run app/page.spec.tsx app/missions/page.spec.tsx app/sources/page.spec.tsx 'app/sources/[sourceId]/page.spec.tsx' lib/api.spec.ts`
- `pnpm smoke:source-registry:local`
- `pnpm smoke:source-ingest:local`
- `pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/twin/workflow-sync.spec.ts src/modules/twin/test-suite-sync.spec.ts src/modules/twin/codeowners-discovery.spec.ts`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm ci:repro:current`

Remaining work is publication only:
create the single requested commit, push the existing branch, and open or report the PR into `main`.
