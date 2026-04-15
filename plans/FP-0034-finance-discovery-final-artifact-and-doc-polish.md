# Polish the final shipped F4 finance discovery artifacts and docs

## Purpose / Big Picture

This plan defines the final narrow **F4 post-merge polish** slice over the already shipped F4A and F4B finance discovery baseline.

The user-visible goal is to close the last truthfulness gaps in the stored finance discovery answer artifact, proof-bundle-adjacent summary copy, and the smallest stale active-doc surface before F4C planning starts. The slice is limited to deterministic stale-read limitation visibility, human-readable freshness labels in durable artifact copy, and a tiny repo-map refresh. GitHub connector work is explicitly out of scope. No new finance families, policy lookup, runtime-codex answering, vector search, OCR, deep-read, new extractors, F5, or F6 work belong in this slice.

## Progress

- [x] 2026-04-15T17:22:13Z Run the required fetched-`origin/main` preflight, confirm the requested branch and clean worktree posture, confirm authenticated `gh`, and confirm healthy Docker-backed Postgres plus object storage posture.
- [x] 2026-04-15T17:22:13Z Audit the active docs, F4 plan chain, finance-discovery bounded context, mission read models, proof-bundle shaping, and web freshness helper surfaces to answer the required final-polish questions before editing.
- [x] 2026-04-15T17:22:13Z Create `plans/FP-0034-finance-discovery-final-artifact-and-doc-polish.md` as the only active Finance Plan for this final audit-and-fix slice.
- [x] 2026-04-15T17:30:18Z Apply the narrow code fixes so stale required Finance Twin reads become explicit limitations and human-facing finance artifact copy stops emitting raw freshness enums.
- [x] 2026-04-15T17:30:18Z Refresh the smallest truthful active-doc surface, including the README repo map and any directly stale F4 handoff notes this slice changes.
- [x] 2026-04-15T17:30:18Z Run the full required validation ladder through `pnpm ci:repro:current`, confirming every requested check is green before publication.
- [x] 2026-04-15T17:40:38Z Run a strict post-publish QA pass on the landed polish slice, catch the remaining freshness-posture wording leak inside durable human-facing summaries, and keep the fix inside the same finance-discovery bounded context without widening scope.

## Surprises & Discoveries

- Observation: the shipped baseline already has the right bounded contexts for this final polish, so the full fix can stay inside shared domain helpers, the existing finance-discovery module, mission and evidence read models, web components, and tiny active-doc touch points without DB schema churn.
  Evidence: the audit of `packages/domain/src/**`, `apps/control-plane/src/modules/finance-discovery/**`, `apps/control-plane/src/modules/evidence/**`, `apps/control-plane/src/modules/missions/**`, and `apps/web/components/**` found formatter and summary wording drift rather than missing persistence shape.

- Observation: stale required Finance Twin reads are still surfaced inside freshness posture rollups but not yet guaranteed to appear as explicit limitation bullets.
  Evidence: `apps/control-plane/src/modules/finance-discovery/required-read-posture.ts` currently promotes only `missing` and `failed` required-read states into explicit limitations, while `summary-builders.ts` rolls stale required reads into freshness prose only.

- Observation: durable finance artifact copy still exposes raw freshness enums in operator-facing markdown and route evidence summaries.
  Evidence: `apps/control-plane/src/modules/finance-discovery/formatter.ts` writes freshness state as a backticked raw enum inside `bodyMarkdown`, and `read-formatters.ts` writes route evidence lines like `Freshness is stale`.

- Observation: the active README repo map is one plan behind the shipped F4 plan chain.
  Evidence: `README.md` includes `FP-0030`, `FP-0031`, and `FP-0032` in the repo map, but omits the shipped `FP-0033` and the new active `FP-0034` plan file for this slice.

- Observation: the first polish pass still left raw freshness enum tokens inside the freshness-posture reason summary, which meant durable answer markdown and proof-bundle freshness copy could still read `fresh`, `stale`, or `failed` straight from the enum-backed summary builder.
  Evidence: `apps/control-plane/src/modules/finance-discovery/summary-builders.ts` still interpolated `${state}` and `${entry.state}` directly into `reasonSummary` after the `bodyMarkdown` state line and route evidence summaries were already humanized.

## Decision Log

- Decision: keep the final polish additive and avoid DB or schema changes unless a concrete blocker appears.
  Rationale: the defects are artifact wording, limitation visibility, and doc freshness issues, not missing persistence capability.

- Decision: promote stale required-read posture into explicit limitation bullets alongside the already shipped missing and failed cases.
  Rationale: a required stale read materially constrains the answer and should not remain buried only in freshness prose.

- Decision: introduce one shared deterministic freshness-label helper in a shared package and use it in both control-plane artifact copy and the web surface.
  Rationale: the same finance freshness states appear in durable artifact markdown, route evidence summaries, and operator UI labels, so one shared helper is the narrowest truthful way to keep them aligned.

- Decision: keep GitHub connector and engineering-twin modules intact and do not start F4C, F5, or F6 implementation in this slice.
  Rationale: the user requested a final F4A/F4B audit-and-fix slice only, with F4C reserved for the next planning phase.

- Decision: apply the shared freshness-label helper to freshness-posture reason summaries as well, so the durable answer markdown and derived proof-bundle freshness summaries do not continue to expose raw enum tokens through copied prose.
  Rationale: leaving the helper out of the summary builder meant the final stored artifact copy was only partially humanized, which failed the narrow truthfulness bar of this polish slice.

## Context and Orientation

Pocket CFO has already shipped F4A and F4B on `main`, with `POST /missions/analysis` as the primary finance entrypoint and `POST /missions/discovery` as a finance-shaped deprecated alias. The shipped supported families remain exactly `cash_posture`, `collections_pressure`, `payables_pressure`, `spend_posture`, and `obligation_calendar_review`. `smoke:m3-discovery:live` is already retired. FP-0033 is shipped context, not an active implementation plan.

The active-doc boundary for this slice is `README.md`, `START_HERE.md`, `PLANS.md`, `plans/ROADMAP.md`, `plans/FP-0030-finance-discovery-foundation-and-first-answer.md`, `plans/FP-0031-finance-discovery-supported-posture-and-obligation-families.md`, `plans/FP-0032-finance-discovery-polish-and-compatibility.md`, `plans/FP-0033-finance-discovery-baseline-closeout-polish.md`, this plan, `docs/ops/source-ingest-and-cfo-wiki.md`, `docs/ops/local-dev.md`, `docs/benchmarks/seeded-missions.md`, and `evals/README.md`.

The relevant implementation seams are:

- `packages/domain/src/discovery-mission.ts`, `proof-bundle.ts`, `mission-detail.ts`, `mission-list.ts`, and `index.ts` for shared finance discovery and proof-bundle contracts plus the shared freshness-label helper if that is the cleanest shared home.
- `apps/control-plane/src/modules/finance-discovery/**` for deterministic required-read handling, answer assembly, body markdown, route evidence summaries, freshness posture, and limitations.
- `apps/control-plane/src/modules/evidence/**` and `apps/control-plane/src/modules/missions/**` for mission-facing proof and read-model behavior that should stay aligned with the stored answer artifact.
- `apps/web/components/**` and `apps/web/lib/api.ts` for operator-facing freshness labels and finance mission rendering.
- `tools/finance-discovery-answer-smoke.mjs` and `tools/finance-discovery-supported-families-smoke.mjs` for shipped F4 acceptance coverage.

GitHub connector work is out of scope. Replay, evidence, provenance, freshness, limitations, and the F4A/F4B to F4C handoff are in scope because this slice changes mission-facing finance answer truthfulness.

## Plan of Work

This final polish should land in three bounded passes.

First, tighten required-read posture handling inside the finance-discovery bounded context so stale required Finance Twin reads become explicit limitation bullets in addition to the existing missing and failed behavior. The logic should stay deterministic, route-backed, and family-driven.

Second, add one shared human-readable finance freshness-label helper and apply it anywhere durable finance answer copy or route evidence summaries currently emit raw freshness enums. The helper should be narrow and deterministic, with no artifact-model widening and no UI scope expansion.

Third, refresh the smallest stale active-doc surface that this polish makes inaccurate, specifically the README repo map and any plan-progress notes needed to keep the F4 chain and the F4C handoff truthful.

## Concrete Steps

1. Keep this active plan current while implementing the slice:
   - `plans/FP-0034-finance-discovery-final-artifact-and-doc-polish.md`

2. Tighten stale required-read limitation visibility in:
   - `apps/control-plane/src/modules/finance-discovery/required-read-posture.ts`
   - `apps/control-plane/src/modules/finance-discovery/summary-builders.ts`
   - `apps/control-plane/src/modules/finance-discovery/service.spec.ts`
   - adjacent evidence specs only if proof-bundle summaries need updated expectations

3. Add and apply the shared freshness-label helper in the cleanest shared home, expected to be:
   - `packages/domain/src/discovery-mission.ts` or a tiny adjacent shared helper exported through `packages/domain/src/index.ts`
   - `packages/domain/src/*.spec.ts` as needed
   - `apps/control-plane/src/modules/finance-discovery/formatter.ts`
   - `apps/control-plane/src/modules/finance-discovery/read-formatters.ts`
   - `apps/web/components/freshness-label.ts` only if it becomes a thin wrapper or can be removed cleanly
   - `apps/web/components/discovery-answer-card.tsx`
   - `apps/web/components/mission-card.tsx`
   - `apps/web/components/mission-list-card.tsx`
   - related `*.spec.tsx`

4. Refresh only the smallest active-doc surface that is still stale:
   - `README.md`
   - this plan
   - any of `START_HERE.md`, `plans/ROADMAP.md`, or `plans/FP-0033-finance-discovery-baseline-closeout-polish.md` only if this slice makes them concretely stale

## Validation and Acceptance

Validation order for this slice must be exactly:

1. Run the narrowest relevant changed tests for:
   - finance discovery question-contract behavior for the shipped supported families
   - stale, missing, and failed required-read limitation behavior
   - mixed freshness-rollup behavior
   - finance answer artifact body and evidence rendering behavior
   - mission route validation and serialization
   - mission detail and mission list finance read-model behavior
   - web answer-card and mission-card freshness-label behavior

2. Run:
   - `pnpm --filter @pocket-cto/domain exec vitest run src/discovery-mission.spec.ts src/proof-bundle.spec.ts src/mission-detail.spec.ts src/mission-list.spec.ts`
   - `zsh -lc "cd apps/control-plane && pnpm exec vitest run src/modules/finance-discovery/**/*.spec.ts src/modules/missions/**/*.spec.ts src/modules/evidence/**/*.spec.ts src/app.spec.ts"`
   - `zsh -lc "cd apps/web && pnpm exec vitest run app/**/*.spec.ts* components/**/*.spec.ts* lib/api.spec.ts"`

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

- Supported-family answers surface stale required Finance Twin reads as explicit limitation bullets as well as freshness posture.
- Durable finance answer artifacts and route evidence summaries do not emit raw freshness enum strings when a human-readable label is available.
- The fix stays inside the existing finance-discovery bounded context, shared domain helpers, mission and evidence read models, web surfaces, and active docs without schema churn.
- README’s repo map reflects the shipped F4 plan chain through `FP-0033` and includes this new `FP-0034` plan file.
- No new families, policy lookup, runtime-codex answering, vector search, OCR, deep-read, new extractor work, F5, or F6 implementation is introduced.

## Idempotence and Recovery

This slice should stay additive and retry-safe. No raw sources, Finance Twin facts, or CFO Wiki pages should be mutated. If a change proves too broad, revert only the touched finance-discovery, web, or doc files from this slice rather than disturbing shared GitHub or engineering-twin scaffolding. If validation fails outside this narrow finance-discovery truthfulness surface or the known engineering-twin reproducibility trio, stop, record the blocker in this plan, and report it instead of widening scope.

## Artifacts and Notes

Expected artifacts from this slice are:

- this active Finance Plan kept current through the final polish
- finance discovery answer artifacts whose limitations explicitly carry stale, missing, or failed required-read posture when those states constrain the answer
- durable artifact body markdown and route evidence summaries with human-readable freshness labels
- the smallest active-doc refresh needed for the shipped F4 plan chain and F4C handoff truthfulness
- one local commit, one push on the existing branch, and one PR only if the full required validation ladder is green

## Interfaces and Dependencies

Boundaries that must hold:

- `packages/domain` stays pure and dependency-light.
- `apps/control-plane/src/modules/finance-discovery/**` remains the owner of finance-answer truthfulness rules.
- `apps/control-plane/src/modules/missions/**` stays thin and transport-oriented.
- `apps/control-plane/src/modules/evidence/**` stays responsible for proof-bundle shaping.
- `apps/web/**` remains an operator read-model and intake layer only.

Dependencies:

- existing Finance Twin read services and their route-backed freshness and limitation posture
- existing CFO Wiki page reads
- existing proof-bundle refresh flow and replay contract
- the shipped F4 local smoke tools
- no new env vars
- no GitHub connector guard usage

## Outcomes & Retrospective

Implementation stayed inside the existing finance-discovery bounded context, shared domain helpers, web freshness-label surface, proof-bundle shaping, and a tiny README repo-map refresh. No DB schema, extractor, family-support, runtime-codex, policy lookup, vector-search, OCR, PageIndex, QMD, MinerU, or deep-read work was added.

The narrow code fixes now make stale required Finance Twin reads appear as explicit stored limitations alongside the already shipped missing and failed cases, while preserving deterministic route-backed behavior. Durable finance answer markdown and route evidence summaries now render shared human-readable freshness labels instead of raw enum strings.

A strict post-publish QA pass found one remaining wording leak: freshness-posture `reasonSummary` strings still interpolated raw enum tokens, which then propagated into human-facing answer markdown and proof-bundle freshness summaries. The follow-up correction applied the shared freshness-label helper there as well, keeping the change inside the same control-plane formatter surface and focused specs.

That QA follow-up revalidated the affected control-plane specs, both finance-discovery local smokes, the engineering-twin reproducibility trio, and `pnpm ci:repro:current`, all green on the same branch without widening the slice.

Validation completed green across the required ladder:

- `pnpm --filter @pocket-cto/domain exec vitest run src/discovery-mission.spec.ts src/proof-bundle.spec.ts src/mission-detail.spec.ts src/mission-list.spec.ts`
- `zsh -lc "cd apps/control-plane && pnpm exec vitest run src/modules/finance-discovery/**/*.spec.ts src/modules/missions/**/*.spec.ts src/modules/evidence/**/*.spec.ts src/app.spec.ts"`
- `zsh -lc "cd apps/web && pnpm exec vitest run app/**/*.spec.ts* components/**/*.spec.ts* lib/api.spec.ts"`
- `pnpm smoke:finance-discovery-answer:local`
- `pnpm smoke:finance-discovery-supported-families:local`
- `pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/twin/workflow-sync.spec.ts src/modules/twin/test-suite-sync.spec.ts src/modules/twin/codeowners-discovery.spec.ts`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm ci:repro:current`

README now reflects the shipped F4 plan chain through `FP-0033` and includes this `FP-0034` polish handoff plan, which leaves the repo in a clean baseline state for F4C planning rather than further F4 implementation.
