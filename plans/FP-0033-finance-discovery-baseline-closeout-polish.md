# Close out the shipped F4 finance discovery baseline

## Purpose / Big Picture

This plan defines a narrow **F4 closeout polish** slice over the already shipped F4A and F4B finance discovery baseline.

The user-visible goal is to leave the shipped baseline fully truthful, operator-clean, and ready to hand off to F4C without reopening baseline work later. The slice is limited to audit-and-fix work for required-read limitation visibility, human-readable operator freshness labels, neutral intake selection, and the smallest active-doc refresh that current code truth now requires. GitHub connector work is explicitly out of scope. No new finance families, policy lookup, runtime-codex answering, vector search, OCR, deep-read, new extractors, F5, or F6 work belong in this slice.

## Progress

- [x] 2026-04-15T16:09:29Z Run the required preflight against fetched `origin/main`, confirm the requested branch, verify a clean worktree, confirm authenticated `gh`, and confirm healthy Docker-backed Postgres plus object storage posture.
- [x] 2026-04-15T16:09:29Z Audit the active docs, F4 plan chain, finance-discovery bounded context, proof-bundle shaping, mission read models, web intake, and operator-facing answer surfaces to answer the required closeout questions before editing.
- [x] 2026-04-15T16:09:29Z Create `plans/FP-0033-finance-discovery-baseline-closeout-polish.md` as the only active Finance Plan for this final closeout slice.
- [x] 2026-04-15T16:09:29Z Apply the narrow implementation fixes for missing or failed required-read limitation visibility, human-readable finance freshness labels, and neutral discovery intake selection without widening the F4 baseline.
- [x] 2026-04-15T16:09:29Z Refresh only the smallest stale active-doc surfaces that the shipped F4A/F4B baseline now makes inaccurate.
- [x] 2026-04-15T16:09:29Z Run the full required validation ladder through `pnpm ci:repro:current`, then create the single local commit, push the existing branch, and open or report the PR only if every requested check is green.

## Surprises & Discoveries

- Observation: the shipped baseline already has the right modular seams, so the closeout can stay inside existing domain, finance-discovery, evidence, mission, web, and doc boundaries without schema churn.
  Evidence: the audit of `packages/domain/src/**`, `apps/control-plane/src/modules/finance-discovery/**`, `apps/control-plane/src/modules/missions/**`, `apps/control-plane/src/modules/evidence/**`, and `apps/web/components/**` found targeted formatter, summary, and rendering issues rather than missing persistence shape.

- Observation: missing or failed required Finance Twin reads are visible in freshness posture rollups, but multi-read families do not currently guarantee a corresponding explicit limitation bullet for every required-read gap.
  Evidence: `apps/control-plane/src/modules/finance-discovery/summary-builders.ts` derives missing-state freshness per required read, while explicit limitations are currently assembled from baseline family copy, route-returned limitations, missing wiki pages, and coverage checks rather than a dedicated required-read gap helper.

- Observation: the finance operator surface still renders raw freshness enum strings and still silently defaults the intake to `cash_posture`.
  Evidence: `apps/web/components/discovery-answer-card.tsx`, `apps/web/components/mission-card.tsx`, `apps/web/components/mission-list-card.tsx`, and `apps/web/components/discovery-mission-intake-form.tsx` currently expose raw freshness states or a hard-coded `cash_posture` default.

- Observation: the stale active-doc drift is small and local rather than repo-wide.
  Evidence: `docs/benchmarks/seeded-missions.md` still frames the seeded families as something the product should "eventually" support and grade, and `docs/ops/source-ingest-and-cfo-wiki.md` still frames policy lookup relative to only the first `cash_posture` answer while also carrying tiny present-tense grammar drift in the shipped F4 section.

## Decision Log

- Decision: keep the closeout entirely additive and avoid DB or schema changes unless a concrete blocker appears.
  Rationale: the audited defects are answer truthfulness, operator rendering, and doc freshness issues, not missing persistence capability.

- Decision: add one small shared deterministic freshness-label helper for operator-facing finance surfaces instead of scattering ad hoc title-casing or placeholder strings.
  Rationale: the same raw enum values appear across multiple web components, so one helper is the narrowest truthful way to keep the UI consistent.

- Decision: make missing or failed required-read gaps explicit through deterministic limitation bullets assembled from the finance-discovery bounded context.
  Rationale: evidence gaps should remain visible in both freshness posture and limitations, not only in freshness prose.

- Decision: require an explicit question-kind placeholder in the web intake instead of silently biasing new discovery missions toward `cash_posture`.
  Rationale: five shipped families now exist, so a defaulted first-family selection is no longer neutral product behavior.

- Decision: keep GitHub connector and engineering-twin modules intact and do not start F4C, F5, or F6 work in this slice.
  Rationale: the user required a final F4A/F4B closeout polish only.

- Decision: keep the required validation intent intact even though bare `bash` `**` globs do not expand recursively in this shell path.
  Rationale: the requested control-plane and web spec batches must truly cover the finance-discovery, mission, evidence, and web surfaces, so explicit `rg --files` enumeration is preferable to silently accepting partial glob expansion.

## Context and Orientation

Pocket CFO has already shipped F4A and F4B on `main`, with `POST /missions/analysis` as the primary finance entrypoint and `POST /missions/discovery` as a finance-shaped deprecated alias. The shipped supported families remain exactly `cash_posture`, `collections_pressure`, `payables_pressure`, `spend_posture`, and `obligation_calendar_review`.

The active-doc boundary for this slice is `README.md`, `START_HERE.md`, `PLANS.md`, `plans/ROADMAP.md`, `plans/FP-0030-finance-discovery-foundation-and-first-answer.md`, `plans/FP-0031-finance-discovery-supported-posture-and-obligation-families.md`, `plans/FP-0032-finance-discovery-polish-and-compatibility.md`, this plan, `docs/ops/source-ingest-and-cfo-wiki.md`, `docs/ops/local-dev.md`, `docs/ops/codex-app-server.md`, `evals/README.md`, and `docs/benchmarks/seeded-missions.md`.

The relevant implementation seams are:

- `packages/domain/src/discovery-mission.ts`, `proof-bundle.ts`, `mission-detail.ts`, and `mission-list.ts` for typed finance discovery and proof-bundle contracts.
- `apps/control-plane/src/modules/finance-discovery/**` for deterministic required-read handling, answer assembly, freshness posture, and limitation shaping.
- `apps/control-plane/src/modules/evidence/**` and `apps/control-plane/src/modules/missions/**` for mission-facing proof and read-model behavior.
- `apps/web/app/missions/**`, `apps/web/components/**`, and `apps/web/lib/api.ts` for operator intake and operator-facing freshness rendering.
- `tools/finance-discovery-answer-smoke.mjs` and `tools/finance-discovery-supported-families-smoke.mjs` for the shipped F4 smoke coverage.

GitHub connector work is out of scope. Replay, evidence, provenance, freshness, and limitations are in scope because this slice changes mission-facing answer truthfulness and operator rendering.

## Plan of Work

This closeout should land in four bounded passes.

First, tighten the finance-discovery bounded context so required Finance Twin reads that are missing or freshness-failed surface as explicit limitation bullets as well as freshness posture. Keep the logic deterministic, family-driven, and route-backed.

Second, add one shared operator-facing freshness-label helper and retarget the finance mission surfaces to use it anywhere the operator currently sees raw finance freshness values or the `pending_answer` placeholder.

Third, neutralize the finance-discovery intake by removing the silent `cash_posture` default and requiring an explicit question-kind choice without introducing chat-like prompting or dynamic UX complexity.

Fourth, refresh only the smallest stale active-doc surfaces that the shipped F4 baseline now makes inaccurate, then run the full requested validation ladder and stop if anything outside this narrow slice fails.

## Concrete Steps

1. Update the active plan while implementing this slice:
   - `plans/FP-0033-finance-discovery-baseline-closeout-polish.md`

2. Tighten required-read limitation visibility in:
   - `apps/control-plane/src/modules/finance-discovery/service.ts` only if tiny service support is needed
   - `apps/control-plane/src/modules/finance-discovery/summary-builders.ts`
   - `apps/control-plane/src/modules/finance-discovery/formatter.ts` only if artifact body wording needs the same helper
   - `apps/control-plane/src/modules/finance-discovery/service.spec.ts`
   - `apps/control-plane/src/modules/evidence/proof-bundle-assembly.spec.ts` or adjacent evidence specs if proof-bundle summaries need updated expectations

3. Add and apply the shared freshness-label helper in the operator surface:
   - `apps/web/components/discovery-answer-card.tsx`
   - `apps/web/components/mission-card.tsx`
   - `apps/web/components/mission-list-card.tsx`
   - a tiny shared helper file under `apps/web/components/**`
   - related `*.spec.tsx`

4. Neutralize finance intake selection in:
   - `apps/web/components/discovery-mission-intake-form.tsx`
   - `apps/web/components/discovery-mission-intake-form.spec.tsx`
   - `apps/web/app/missions/actions.ts`
   - `apps/web/app/missions/actions.spec.ts`

5. Refresh only the smallest stale active docs:
   - `docs/benchmarks/seeded-missions.md`
   - `docs/ops/source-ingest-and-cfo-wiki.md`
   - any of `README.md`, `START_HERE.md`, `plans/ROADMAP.md`, `docs/ops/local-dev.md`, `evals/README.md`, `plans/FP-0030-finance-discovery-foundation-and-first-answer.md`, `plans/FP-0031-finance-discovery-supported-posture-and-obligation-families.md`, or `plans/FP-0032-finance-discovery-polish-and-compatibility.md` only if this closeout makes them stale in a concrete way

## Validation and Acceptance

Validation order for this slice must be exactly:

1. Run the narrowest relevant changed tests for:
   - finance discovery question-contract behavior for the shipped supported families
   - freshness-rollup behavior for mixed, missing, and failed multi-read families
   - missing or failed required-read limitation behavior
   - mission route validation and serialization
   - mission detail and mission list finance read-model behavior
   - web intake and answer-card behavior
   - proof-bundle summary behavior for mixed freshness and missing or failed read cases

2. Run:
   - `pnpm --filter @pocket-cto/domain exec vitest run src/discovery-mission.spec.ts src/proof-bundle.spec.ts src/mission-detail.spec.ts src/mission-list.spec.ts`
   - `bash -lc "cd apps/control-plane && pnpm exec vitest run src/modules/finance-discovery/**/*.spec.ts src/modules/missions/**/*.spec.ts src/modules/evidence/**/*.spec.ts src/app.spec.ts"`
   - `bash -lc "cd apps/web && pnpm exec vitest run app/**/*.spec.ts* components/**/*.spec.ts* lib/api.spec.ts"`

3. Run:
   - `pnpm smoke:finance-discovery-answer:local`
   - `pnpm smoke:finance-discovery-supported-families:local`

4. Run:
   - `pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/twin/workflow-sync.spec.ts src/modules/twin/test-suite-sync.spec.ts src/modules/twin/codeowners-discovery.spec.ts`

5. Run:
   - `pnpm lint`
   - `pnpm typecheck`
   - `pnpm test`
   - `pnpm ci:repro:current`

Acceptance is met only if all of the following are observable:

- Missing or failed required Finance Twin reads for supported families remain visible in both freshness posture and explicit limitation bullets.
- Finance operator surfaces do not show raw freshness enum strings such as `fresh`, `stale`, `missing`, `mixed`, `failed`, or `pending_answer`.
- Discovery intake no longer silently defaults to `cash_posture` and requires an explicit supported question-kind choice.
- Active docs touched in this slice no longer read one step behind the shipped F4A/F4B baseline.
- No schema churn, no new families, no policy lookup, no runtime-codex answering, no vector search, no OCR, and no deep-read dependency are introduced.

## Idempotence and Recovery

This slice should stay additive and retry-safe. No raw sources, Finance Twin facts, or CFO Wiki pages should be mutated. If a change proves too broad, revert only the touched finance-discovery, web, or doc files from this slice rather than disturbing shared GitHub or engineering-twin scaffolding. If validation fails outside the narrow finance-discovery closeout surface or the known engineering-twin reproducibility trio, stop, record the blocker in this plan, and report it instead of widening scope.

## Artifacts and Notes

Expected artifacts from this slice are:

- this active Finance Plan kept current through the closeout
- finance discovery answer artifacts whose limitations explicitly carry required-read gaps when reads are missing or freshness-failed
- proof bundles whose summaries stay aligned with the tightened answer truthfulness
- operator-facing web rendering that uses human-readable freshness labels
- the smallest active-doc refresh needed for shipped F4 truthfulness
- one local commit, one push on the existing branch, and one PR only if the full required validation ladder is green

## Interfaces and Dependencies

Boundaries that must hold:

- `packages/domain` stays pure and dependency-light.
- `apps/control-plane/src/modules/finance-discovery/**` remains the owner of finance-answer truthfulness rules.
- `apps/control-plane/src/modules/missions/**` stays thin and transport-oriented.
- `apps/control-plane/src/modules/evidence/**` stays responsible for proof-bundle shaping.
- `apps/web/**` remains an operator read-model and intake layer only.

Dependencies:

- existing Finance Twin read services and their route-backed freshness/limitation posture
- existing CFO Wiki page reads
- existing proof-bundle refresh flow and replay contract
- the shipped F4 local smoke tools
- no new env vars
- no GitHub connector guard usage

## Outcomes & Retrospective

Implementation and validation are complete.

The shipped closeout corrections so far are:

- deterministic required-read gap limitations for missing and freshness-failed Finance Twin reads in supported families
- one shared operator-facing freshness-label helper applied to finance answer and mission surfaces
- neutral discovery intake selection that requires an explicit finance question-kind choice
- a narrow active-doc refresh for the seeded mission benchmark note and the shipped F4 wiki-ingest workflow note

The completed validation record for this slice is:

- focused control-plane and web specs for required-read limitation behavior, proof-bundle summaries, intake neutrality, and operator freshness rendering
- the requested domain, control-plane, web, smoke, and engineering-twin validation commands
- repo-wide `pnpm lint`, `pnpm typecheck`, and `pnpm test`
- clean-worktree `pnpm ci:repro:current`

The requested bare `bash` `**` glob commands did not expand recursively in this shell, so equivalent explicit-file reruns were added with `rg --files` enumeration to preserve the exact requested coverage instead of silently accepting partial execution.

This closeout should now hand off directly to F4C planning with no further F4A/F4B baseline revisit.
