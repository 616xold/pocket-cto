# Polish the shipped finance discovery baseline for truthfulness and compatibility

## Purpose / Big Picture

This plan defines a narrow **F4 post-merge polish** slice over the already shipped F4A and F4B finance discovery baseline.

The user-visible goal is to make the current finance discovery surface truthful and internally consistent without widening product scope. `POST /missions/analysis` must remain the primary finance entrypoint. If `POST /missions/discovery` remains, it must be explicit and test-proven as a finance-shaped deprecated alias rather than a misleading promise that the old repo-scoped engineering discovery create contract still works. The actively advertised `smoke:m3-discovery:live` package surface must not remain live if that contract is false.

GitHub connector work is explicitly out of scope. This slice must not start F4B, F4C, F5, or F6 work, must not widen finance question families, and must not delete legacy GitHub or engineering-twin modules.

## Progress

- [x] 2026-04-15T14:20:31Z Run the required fetched-`origin/main` preflight, confirm the requested branch, clean worktree, authenticated `gh`, and healthy Docker-backed Postgres plus object storage posture.
- [x] 2026-04-15T14:20:31Z Audit the active docs, F4A and F4B plans, mission creation routes, finance discovery contracts, proof-bundle shaping, web surfaces, and legacy smoke tooling to determine whether retirement or compatibility restoration is the smaller truthful fix.
- [x] 2026-04-15T14:20:31Z Create `plans/FP-0032-finance-discovery-polish-and-compatibility.md` as the live execution plan for this narrow slice before code changes.
- [x] 2026-04-15T14:20:31Z Retire the false active legacy `smoke:m3-discovery:live` package surface while keeping historical archive references intact where tests depend on them.
- [x] 2026-04-15T14:20:31Z Add route and domain coverage so `/missions/discovery` is proven truthful as a finance alias and legacy repo-scoped payload rejection is explicit.
- [x] 2026-04-15T14:20:31Z Apply the smallest active-doc and plan refresh needed so current docs and plans no longer overstate legacy engineering discovery mission creation support.
- [x] 2026-04-15T14:20:31Z Run the requested validation ladder through `pnpm ci:repro:current`; create the single local commit, push, and open or report the PR only after the green validation state is preserved.
- [x] 2026-04-15T14:32:42Z Run the follow-up QA pass, correct the missed FP-0030 present-tense legacy-discovery wording, and re-run the required narrow tests, finance smokes, twin reproducibility trio, and `pnpm ci:repro:current` because the active-doc truth boundary needed one more fix.

## Surprises & Discoveries

- Observation: `HEAD` and fetched `origin/main` currently point at the same commit, so this branch is auditing the exact shipped repo state rather than a divergent local draft.
  Evidence: `git rev-parse HEAD` and `git rev-parse origin/main` both returned `1257336a8e77576bee191f2b5438d38ef42bfb8e`.

- Observation: `POST /missions/discovery` no longer accepts the legacy repo-scoped engineering payload even though a live root package smoke still advertises that behavior.
  Evidence: `apps/control-plane/src/modules/missions/routes.ts` parses `createDiscoveryMissionSchema`, which is now finance-only via `CreateDiscoveryMissionInputSchema`, and a direct local probe returned `201` for a finance-shaped payload plus `400` for `{ repoFullName, questionKind: "auth_change", changedPaths }`.

- Observation: the live mismatch is concentrated in the packaged smoke surface rather than across the active docs set.
  Evidence: `package.json` still exposes `smoke:m3-discovery:live`, `tools/m3-discovery-mission-smoke.mjs` still posts the legacy repo-scoped payload to `/missions/discovery`, while the active finance docs already center `POST /missions/analysis` and the shipped finance smokes.

- Observation: archive and historical closeout surfaces still intentionally reference the M3 engineering smoke.
  Evidence: `apps/control-plane/src/modules/missions/m3-closeout-docs.spec.ts` asserts references to `pnpm smoke:m3-discovery:live` and `tools/m3-discovery-mission-smoke.mjs` inside archive-era closeout material.

- Observation: after retirement, the removed live smoke alias no longer appears in the active package or active-doc set outside this execution plan's own audit notes.
  Evidence: `rg -n "smoke:m3-discovery:live" package.json README.md START_HERE.md plans/ROADMAP.md plans/FP-0030-finance-discovery-foundation-and-first-answer.md plans/FP-0031-finance-discovery-supported-posture-and-obligation-families.md docs/ops/source-ingest-and-cfo-wiki.md docs/ops/local-dev.md docs/ops/codex-app-server.md docs/benchmarks/seeded-missions.md evals/README.md` returned no matches.

- Observation: the first QA pass still found stale present-tense engineering-discovery wording inside `plans/FP-0030-finance-discovery-foundation-and-first-answer.md`, even though the active product surfaces had already been corrected.
  Evidence: a strict active-doc scan on 2026-04-15 matched `plans/FP-0030-finance-discovery-foundation-and-first-answer.md:25-26` and `:103-110`, where pre-F4A blast-radius observations still read as if they described the live route contract until this QA correction rewrote them as historical context.

## Decision Log

- Decision: prefer retiring the active legacy `smoke:m3-discovery:live` surface instead of restoring full repo-scoped engineering discovery creation compatibility.
  Rationale: the shipped finance replacement path already exists through `pnpm smoke:finance-discovery-answer:local` and `pnpm smoke:finance-discovery-supported-families:local`, while restoring the old contract would widen this slice back into engineering discovery routing, orchestration, evidence, and operator-surface compatibility work.

- Decision: keep `POST /missions/analysis` as the primary finance entrypoint and keep `/missions/discovery` only if it stays a thin, explicitly deprecated finance-shaped alias.
  Rationale: this preserves the shipped finance path, avoids a broader transport rewrite, and keeps compatibility truthful for finance-shaped callers without pretending repo-scoped engineering create still works.

- Decision: keep GitHub connector and engineering-twin modules intact, and preserve archive docs or historical references that tests intentionally protect.
  Rationale: the user explicitly forbade deleting those modules in this slice, and archive references remain useful historical evidence as long as they are not presented as active product truth.

## Context and Orientation

Pocket CFO has already shipped F4A and F4B. The active-doc boundary for this slice is `README.md`, `START_HERE.md`, `PLANS.md`, `plans/ROADMAP.md`, `plans/FP-0030-finance-discovery-foundation-and-first-answer.md`, `plans/FP-0031-finance-discovery-supported-posture-and-obligation-families.md`, this plan, `docs/ops/source-ingest-and-cfo-wiki.md`, `docs/ops/local-dev.md`, `docs/ops/codex-app-server.md`, `docs/benchmarks/seeded-missions.md`, and `evals/README.md`.

The relevant bounded contexts are:

- `packages/domain/src/**` for typed finance discovery mission, proof-bundle, mission-detail, and mission-list contracts.
- `apps/control-plane/src/modules/missions/**` for thin route and mission-creation behavior.
- `apps/control-plane/src/modules/orchestrator/**` and `apps/control-plane/src/modules/evidence/**` for discovery execution and finance-ready proof-bundle shaping.
- `apps/control-plane/src/modules/finance-discovery/**` for the deterministic finance answer path that must remain unchanged and bounded.
- `apps/web/components/**` and `apps/web/lib/api.ts` for truthful intake and answer presentation.
- `tools/m3-discovery-mission-smoke.mjs` and `package.json` for the false active legacy surface.

GitHub connector work is out of scope. No new env vars, no DB schema work, no new finance families, no runtime-codex answer path, and no new Finance Twin extractor work belong in this plan.

## Plan of Work

This slice should land in three additive passes.

First, tighten the truth boundary around mission creation and active tooling. That means proving the current `/missions/discovery` alias behavior explicitly, and removing or relabeling the false active legacy smoke contract without disturbing archive-era historical proofs.

Second, refresh the narrow read-model and proof-bundle expectations so finance-vs-legacy behavior is explicit where operators or tests could otherwise infer the wrong contract. The finance discovery bounded context itself should remain unchanged unless a tiny overlap fix is truly necessary.

Third, refresh only the smallest active-doc and plan set needed so current guidance no longer implies legacy repo-scoped discovery mission creation remains a live supported surface after F4A and F4B shipped.

## Concrete Steps

1. Update the live plan and stale plan truth in:
   - `plans/FP-0031-finance-discovery-supported-posture-and-obligation-families.md`
   - this plan

2. Retire the false active legacy smoke surface in:
   - `package.json`
   - `tools/m3-discovery-mission-smoke.mjs`
   - any tiny adjacent helper or spec file only if needed to keep tests truthful

3. Prove current `/missions/discovery` behavior in the narrowest route and app tests by adding explicit checks for:
   - finance-shaped payload succeeds
   - legacy repo-scoped payload is rejected truthfully
   - `POST /missions/analysis` remains unchanged

   Expected files:
   - `apps/control-plane/src/app.spec.ts`
   - `apps/control-plane/src/modules/missions/**/*.spec.ts` only where directly necessary
   - `packages/domain/src/discovery-mission.spec.ts` only if contract coverage is missing

4. Refresh only the smallest active package and doc surfaces that still overstate live compatibility, likely:
   - `README.md` only if needed
   - `START_HERE.md` only if needed
   - `plans/ROADMAP.md` only if needed
   - `docs/ops/local-dev.md` only if needed
   - `docs/benchmarks/seeded-missions.md` only if needed
   - `evals/README.md` only if needed

5. Re-run the requested validation ladder in the user-specified order, including the finance discovery smokes and the proof that the retired legacy surface is no longer actively advertised if retirement is the chosen path.

## Validation and Acceptance

Required validation for this slice:

- `pnpm --filter @pocket-cto/domain exec vitest run src/discovery-mission.spec.ts src/mission.spec.ts src/proof-bundle.spec.ts src/mission-detail.spec.ts src/mission-list.spec.ts`
- `bash -lc "cd apps/control-plane && pnpm exec vitest run src/modules/finance-discovery/**/*.spec.ts src/modules/missions/**/*.spec.ts src/modules/evidence/**/*.spec.ts src/modules/orchestrator/**/*.spec.ts src/app.spec.ts"`
- `bash -lc "cd apps/web && pnpm exec vitest run app/**/*.spec.ts* components/**/*.spec.ts* lib/api.spec.ts"`
- `pnpm smoke:finance-discovery-answer:local`
- `pnpm smoke:finance-discovery-supported-families:local`
- `pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/twin/workflow-sync.spec.ts src/modules/twin/test-suite-sync.spec.ts src/modules/twin/codeowners-discovery.spec.ts`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm ci:repro:current`

Acceptance must be observable as:

- `POST /missions/analysis` still accepts only the shipped finance discovery families and remains the primary finance entrypoint.
- If `/missions/discovery` remains, finance-shaped payloads succeed and legacy repo-scoped payloads fail with truthful validation errors.
- No active package or active-doc surface still advertises legacy repo-scoped engineering discovery mission creation unless that compatibility truly exists.
- Finance mission outputs still expose freshness posture, limitations, and finance-ready proof-bundle summaries without widening question families or adding new dependencies.

## Idempotence and Recovery

This slice should stay additive and retry-safe. No raw sources, Finance Twin state, or CFO Wiki pages should be mutated as part of the compatibility polish. If a doc or package-surface retirement proves too broad, revert only the touched F4 polish files and keep the shipped finance mission path intact. If evidence emerges that retirement is unexpectedly broader than restoring compatibility, stop, record that discovery in this plan, and reassess before widening scope.

## Artifacts and Notes

Expected artifacts from this slice are:

- one live Finance Plan for the polish slice
- tightened tests that prove current finance-vs-legacy mission creation truth
- a truthful package-script surface for finance discovery smokes
- tiny active-doc refreshes only where F4A or F4B had left stale compatibility wording
- one local commit, one push on the existing branch, and one PR only if the full validation ladder is green

## Interfaces and Dependencies

Boundaries that must hold:

- `packages/domain` stays pure and type-only.
- `apps/control-plane/src/modules/missions/**` stays thin and transport-oriented.
- `apps/control-plane/src/modules/finance-discovery/**` remains the only finance answer-assembly owner.
- `apps/control-plane/src/modules/evidence/**` remains responsible for proof-bundle shaping.
- `apps/web/**` remains a read-model and intake layer only.

Dependencies:

- existing finance discovery route contracts
- existing finance discovery smokes
- existing archive-doc guards that intentionally protect historical M3 references
- no GitHub connector guard usage
- no new environment variables

## Outcomes & Retrospective

- Shipped scope:
  - Retired the false active `smoke:m3-discovery:live` root package script while leaving the historical engineering smoke helper and archive-era closeout references intact.
  - Added explicit domain and route coverage proving that `/missions/discovery` now succeeds only for finance-shaped payloads and rejects the legacy repo-scoped engineering payload truthfully.
  - Refreshed the smallest active guidance set so contributors now see F4B as shipped, understand `/missions/discovery` as a deprecated finance-shaped alias, and get pointed at F4C or this polish plan instead of stale pre-F4B next-step guidance.
  - Refreshed stale F4A and F4B plan closeout notes so neither active plan still reads like the current next implementation phase.
  - Followed up with a QA-only doc correction so FP-0030 now frames its pre-F4A engineering-discovery observations as historical context rather than live product truth.

- Files changed:
  - `package.json`
  - `packages/domain/src/discovery-mission.spec.ts`
  - `apps/control-plane/src/app.spec.ts`
  - `START_HERE.md`
  - `docs/ops/local-dev.md`
  - `plans/FP-0030-finance-discovery-foundation-and-first-answer.md`
  - `plans/FP-0031-finance-discovery-supported-posture-and-obligation-families.md`
  - this plan

- Validation passed:
  - Narrow domain, control-plane, and web discovery-focused tests.
  - The requested domain, control-plane, and web spec batches.
  - `pnpm smoke:finance-discovery-answer:local`
  - `pnpm smoke:finance-discovery-supported-families:local`
  - the requested twin reproducibility trio
  - `pnpm lint`
  - `pnpm typecheck`
  - `pnpm test`
  - `pnpm ci:repro:current`

- Remaining work:
  - Create the single local commit, push the existing branch, and open or report the PR now that the requested validation state is green.
  - Leave any future new implementation work to F4C rather than reopening engineering discovery compatibility or widening finance scope here.
