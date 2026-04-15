# Build the F4B supported finance discovery families

## Purpose / Big Picture

This plan defines the first real **F4B finance discovery** implementation slice for Pocket CFO.

The user-visible goal is to extend the shipped F4A finance-discovery path from one truthful `cash_posture` family into exactly four additional deterministic, read-only, mission-based families that the repo can already support from stored state: `collections_pressure`, `payables_pressure`, `spend_posture`, and `obligation_calendar_review`. Each answer must continue to run only from stored Finance Twin plus stored CFO Wiki state, persist a durable finance discovery answer artifact, persist a finance-ready proof bundle, and expose freshness, provenance posture, and limitations plainly without widening into policy lookup, generic finance chat, runtime-codex answer generation, new Finance Twin extractors, F4C/F5/F6 work, or unsupported aging-review families.

GitHub connector work is explicitly out of scope for this slice. This plan is the active F4B implementation contract and must stay current while the code lands.

## Progress

- [x] 2026-04-15T10:58:10Z Run the requested branch, cleanliness, `gh`, Docker, and fetched-`origin/main` preflight for the F4B local thread.
- [x] 2026-04-15T10:58:10Z Audit the active docs, F4A contract, domain contracts, finance-discovery bounded context, mission read models, evidence assembly, proof-bundle shaping, and web surfaces to confirm the additive F4B extension seams.
- [x] 2026-04-15T10:58:10Z Create `plans/FP-0031-finance-discovery-supported-posture-and-obligation-families.md` as the active F4B execution plan before code changes because no unfinished F4B plan file existed.
- [x] 2026-04-15T11:38:43Z Add the narrow typed supported-family contract and code-owned family registry for `cash_posture`, `collections_pressure`, `payables_pressure`, `spend_posture`, and `obligation_calendar_review`.
- [x] 2026-04-15T11:38:43Z Extend the `finance-discovery` bounded context, mission creation path, proof-bundle shaping, and mission read models so each supported family produces deterministic finance-ready answers from stored Finance Twin plus stored CFO Wiki state only.
- [x] 2026-04-15T11:38:43Z Update the web intake and mission answer presentation so the new supported families are visible and truthful without implying unsupported finance capabilities.
- [x] 2026-04-15T11:38:43Z Add the narrow tests and the new `tools/finance-discovery-supported-families-smoke.mjs` coverage, then run the required F4B validation ladder through `pnpm ci:repro:current`.
- [ ] 2026-04-15T11:38:43Z Create the single local commit, push the existing branch, and open the requested PR now that the full requested validation ladder is green.

## Surprises & Discoveries

- Observation: the repo already ships the exact Finance Twin routes and deterministic wiki pages needed for the requested four F4B families, so the work should stay inside contract widening and answer assembly rather than new extraction or storage work.
  Evidence: `apps/control-plane/src/modules/finance-twin/routes.ts` exposes the required receivables, payables, spend, and obligation reads, while `apps/control-plane/src/modules/wiki/compiler/knowledge-registry.ts` already registers the corresponding metric and concept pages.

- Observation: the current F4A implementation is narrow but modular, with the main F4B blocker being `cash_posture`-specific branching and strings rather than architectural gaps.
  Evidence: `packages/domain/src/discovery-mission.ts`, `apps/control-plane/src/modules/finance-discovery/service.ts`, `apps/control-plane/src/modules/finance-discovery/formatter.ts`, `apps/control-plane/src/modules/missions/discovery.ts`, and the web mission components all encode cash-only assumptions today.

- Observation: the current JSON-backed mission and artifact persistence seams still appear sufficient for F4B, so schema churn should remain unnecessary unless the implementation proves otherwise.
  Evidence: `packages/domain/src/discovery-mission.ts`, `packages/domain/src/proof-bundle.ts`, and the existing F4A artifact and proof-bundle paths already carry typed finance discovery metadata without needing DB column changes.

## Decision Log

- Decision: keep `mission.type === "discovery"` and `POST /missions/analysis` as the primary F4 entry point.
  Rationale: the mission engine path is already shipped and the user explicitly asked to preserve it.

- Decision: widen the finance discovery question contract to exactly five supported families in this slice: `cash_posture`, `collections_pressure`, `payables_pressure`, `spend_posture`, and `obligation_calendar_review`.
  Rationale: these are the only families the repo can truthfully support today from shipped Finance Twin and CFO Wiki state.

- Decision: introduce a code-owned supported-family registry inside the finance-discovery bounded context.
  Rationale: a registry is the narrowest truthful way to encode required route-backed reads, related wiki pages, freshness and limitation rules, evidence section templates, and deterministic formatter behavior per family without scattering new conditionals across routes or the web surface.

- Decision: keep answer assembly inside `apps/control-plane/src/modules/finance-discovery/**` and keep routes thin.
  Rationale: this preserves the current modular boundary and avoids leaking finance-answer logic into transport files.

- Decision: keep policy lookup, runtime-codex, vector search, OCR, PageIndex/QMD/MinerU, deep-read, new Finance Twin extractors, aging-review families, and all later F4C/F5/F6 work explicitly out of scope.
  Rationale: the user asked for F4B only, and the repo does not yet have truthful deterministic support for those paths in this slice.

- Decision: prefer no schema change.
  Rationale: the existing mission spec, answer artifact metadata, and proof-bundle manifest seams appear sufficient for additive contract widening, and widening the schema would violate the narrow-slice goal unless proven necessary.

- Decision: keep GitHub connector and engineering-twin modules intact and untouched except where existing shared read-model helpers already depend on generic discovery unions.
  Rationale: the user explicitly forbade deleting or widening those historical scaffolds in this slice.

- Decision: encode baseline freshness and limitation posture in the family registry rather than burying it in formatter-only branching.
  Rationale: the supported families need a code-owned truth source for route-backed evidence, wiki context, and plain-language limitations so proof bundles, answer artifacts, mission detail, and web rendering stay aligned and truthful from the same deterministic metadata.

- Decision: add a dedicated supported-families local smoke command instead of widening the original F4A `finance-discovery-answer` smoke beyond its first-answer purpose.
  Rationale: a separate smoke keeps the original cash-posture proof intact while giving F4B its own deterministic acceptance check for the newly supported families.

## Context and Orientation

Pocket CFO has already shipped F4A for `cash_posture` on top of broad F2 Finance Twin breadth through F2O and deterministic CFO Wiki breadth through F3D. The active-doc boundary for this slice is `README.md`, `START_HERE.md`, `AGENTS.md`, `PLANS.md`, `plans/ROADMAP.md`, `plans/FP-0030-finance-discovery-foundation-and-first-answer.md`, this plan, `docs/ops/source-ingest-and-cfo-wiki.md`, `docs/ops/local-dev.md`, `evals/README.md`, and `docs/benchmarks/seeded-missions.md`.

The relevant code seams are:

- `packages/domain/src/discovery-mission.ts`, `packages/domain/src/proof-bundle.ts`, `packages/domain/src/mission-detail.ts`, `packages/domain/src/mission-list.ts`, and `packages/domain/src/index.ts` for typed finance discovery and read-model contracts.
- `apps/control-plane/src/modules/finance-discovery/**` for answer-family ownership, deterministic answer assembly, and artifact shaping.
- `apps/control-plane/src/modules/missions/**`, `apps/control-plane/src/modules/evidence/**`, and `apps/control-plane/src/modules/orchestrator/**` for mission creation, proof-bundle assembly, and scout-task execution.
- `apps/control-plane/src/modules/finance-twin/**` and `apps/control-plane/src/modules/wiki/**` only for tiny read seams if the current service interfaces are missing one of the already-shipped reads.
- `apps/web/app/missions/**`, `apps/web/components/**`, and `apps/web/lib/api.ts` for truthful operator intake and answer rendering.
- `tools/finance-discovery-supported-families-smoke.mjs` for the new F4B smoke proof.

GitHub connector work is out of scope. No runtime-codex answer path, no policy lookup, and no new extractor work belong in this plan.

## Plan of Work

Implement F4B in five additive passes.

First, widen the pure domain contract so the finance discovery question, answer, proof-bundle, mission-detail, and mission-list types can represent the four new supported families while preserving the F4A cash path and the legacy engineering discovery union where it still exists.

Second, refactor the `finance-discovery` bounded context around a code-owned supported-family registry that describes, per family, the required Finance Twin reads, related routes, related wiki pages, deterministic evidence sections, summary wording, freshness posture, and limitation rules. The service should read stored state through service seams, not internal HTTP routes.

Third, widen the mission-creation and proof-bundle paths so mission titles, objectives, evidence requirements, proof-bundle summaries, and discovery read models stay truthful for every supported family. The execution path remains a scout-only deterministic mission that persists one discovery answer artifact and refreshes the proof bundle.

Fourth, update the operator web intake and answer presentation so mission creation can select the new supported families and mission detail or list surfaces render the family-specific related routes, wiki pages, freshness posture, and limitations without implying unsupported finance capabilities.

Fifth, add or update the narrow tests plus the new supported-families smoke proof, then run the full requested validation ladder. Only after that should this slice be committed, pushed, and opened as a PR.

## Concrete Steps

1. Update the finance discovery contract in:
   - `packages/domain/src/discovery-mission.ts`
   - `packages/domain/src/proof-bundle.ts`
   - `packages/domain/src/mission-detail.ts`
   - `packages/domain/src/mission-list.ts`
   - `packages/domain/src/index.ts`
   - `packages/domain/src/*.spec.ts`

   The supported `questionKind` values in this slice must be exactly:
   - `cash_posture`
   - `collections_pressure`
   - `payables_pressure`
   - `spend_posture`
   - `obligation_calendar_review`

2. Add the code-owned supported-family registry and widen the finance-discovery bounded context in:
   - `apps/control-plane/src/modules/finance-discovery/service.ts`
   - `apps/control-plane/src/modules/finance-discovery/formatter.ts`
   - `apps/control-plane/src/modules/finance-discovery/artifact.ts`
   - `apps/control-plane/src/modules/finance-discovery/**/*.spec.ts`

   Required route and wiki mappings:
   - `collections_pressure`
     - routes: `/finance-twin/companies/:companyKey/receivables-aging`, `/finance-twin/companies/:companyKey/collections-posture`
     - wiki: `metrics/collections-posture`, `metrics/receivables-aging`, `concepts/receivables`, `company/overview`
   - `payables_pressure`
     - routes: `/finance-twin/companies/:companyKey/payables-aging`, `/finance-twin/companies/:companyKey/payables-posture`
     - wiki: `metrics/payables-posture`, `metrics/payables-aging`, `concepts/payables`, `company/overview`
   - `spend_posture`
     - routes: `/finance-twin/companies/:companyKey/spend-items`, `/finance-twin/companies/:companyKey/spend-posture`
     - wiki: `metrics/spend-posture`, `concepts/spend`, `company/overview`
   - `obligation_calendar_review`
     - routes: `/finance-twin/companies/:companyKey/contracts`, `/finance-twin/companies/:companyKey/obligation-calendar`
     - wiki: `metrics/obligation-calendar`, `concepts/contract-obligations`, `company/overview`

3. Widen mission creation, detail, and proof-bundle shaping in:
   - `apps/control-plane/src/modules/missions/discovery.ts`
   - `apps/control-plane/src/modules/missions/detail-view.ts`
   - `apps/control-plane/src/modules/missions/discovery-answer-view.ts`
   - `apps/control-plane/src/modules/missions/service.ts`
   - `apps/control-plane/src/modules/missions/**/*.spec.ts`
   - `apps/control-plane/src/modules/evidence/discovery-answer.ts`
   - `apps/control-plane/src/modules/evidence/proof-bundle-summary.ts`
   - `apps/control-plane/src/modules/evidence/proof-bundle-assembly.ts`
   - `apps/control-plane/src/modules/evidence/**/*.spec.ts`
   - `apps/control-plane/src/modules/orchestrator/discovery-phase.ts`
   - `apps/control-plane/src/modules/orchestrator/**/*.spec.ts`
   - `apps/control-plane/src/app.spec.ts`

   Keep the current scout-task execution model, persist additive finance-ready evidence, and keep stale, partial, missing, or unsupported state visible.

4. Update the web surfaces in:
   - `apps/web/app/missions/**`
   - `apps/web/components/discovery-mission-intake-form.tsx`
   - `apps/web/components/discovery-answer-card.tsx`
   - `apps/web/components/mission-card.tsx`
   - `apps/web/components/mission-list-card.tsx`
   - `apps/web/lib/api.ts`
   - related `*.spec.ts*`

   The intake must expose the five supported question kinds only. The answer and mission surfaces must stay deterministic and read-only, with no generic finance chat posture.

5. Add the new smoke command and implementation in:
   - `tools/finance-discovery-supported-families-smoke.mjs`
   - `package.json`

   The new smoke should prove all supported families can run from stored Finance Twin plus stored CFO Wiki state in the Docker-backed local environment.

## Validation and Acceptance

Validation order for this slice:

1. If schema changed unexpectedly, run the narrowest needed DB apply step before DB-backed tests. Schema change is not expected.
2. Run the narrow targeted tests added or widened for:
   - finance discovery question-contract behavior for all supported families
   - deterministic finance-discovery service behavior for each family
   - stale, partial, and missing-state limitation behavior
   - mission route validation and serialization
   - mission detail and mission list finance read-model behavior
   - web intake and answer-card behavior
   - proof-bundle summary behavior for each family
3. Run:
   - `pnpm --filter @pocket-cto/domain exec vitest run src/discovery-mission.spec.ts src/proof-bundle.spec.ts src/mission-detail.spec.ts src/mission-list.spec.ts`
   - `bash -lc "cd apps/control-plane && pnpm exec vitest run src/modules/finance-discovery/**/*.spec.ts src/modules/missions/**/*.spec.ts src/modules/evidence/**/*.spec.ts src/modules/orchestrator/**/*.spec.ts src/app.spec.ts"`
   - `bash -lc "cd apps/web && pnpm exec vitest run app/**/*.spec.ts* components/**/*.spec.ts* lib/api.spec.ts"`
4. Run the current smoke ladder:
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
   - `pnpm smoke:cfo-wiki-foundation:local`
   - `pnpm smoke:cfo-wiki-document-pages:local`
   - `pnpm smoke:cfo-wiki-lint-export:local`
   - `pnpm smoke:cfo-wiki-concept-metric-policy:local`
   - `pnpm smoke:finance-discovery-answer:local`
5. Run the new smoke:
   - `pnpm smoke:finance-discovery-supported-families:local`
6. Run:
   - `pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/twin/workflow-sync.spec.ts src/modules/twin/test-suite-sync.spec.ts src/modules/twin/codeowners-discovery.spec.ts`
7. Run:
   - `pnpm lint`
   - `pnpm typecheck`
   - `pnpm test`
   - `pnpm ci:repro:current`

Acceptance must be observable as:

- `POST /missions/analysis` accepts the five supported families and still rejects unsupported ones.
- Each supported family produces one deterministic summary, explicit freshness posture, visible limitations, related routes, related wiki pages, structured evidence sections, deterministic body markdown, and structured metadata from stored state only.
- Mission detail and mission list surfaces truthfully render the widened support.
- Proof bundles remain finance-ready and explicit about missing or stale evidence.
- No policy lookup, runtime-codex answer generation, vector search, OCR, deep-read dependency, new extractor, or unsupported family appears in code or docs as shipped behavior.

## Idempotence and Recovery

This slice should remain additive and retry-safe. The main retry path is rerunning tests and smoke commands after code changes; no raw sources should be mutated and no stored source snapshots should be rewritten. If a code change proves too broad, revert only the touched F4B files in this slice rather than changing shared GitHub or engineering-twin scaffolding. If an unexpected schema need appears, stop, record the reason in this plan, and add the narrowest additive migration plus recovery notes before proceeding.

## Artifacts and Notes

Expected artifacts from this slice are:

- the widened F4B finance discovery contracts and bounded-context code
- persisted `discovery_answer` artifacts for each supported family during tests or smoke runs
- refreshed finance-ready proof bundles carrying family-specific summaries, freshness posture, limitations, related routes, and related wiki pages
- the new `tools/finance-discovery-supported-families-smoke.mjs`
- updated plan progress and decision log entries
- one local commit, one push on the existing branch, and one PR only if the full validation ladder is green

Docs should be touched only if a tiny truthful refresh becomes necessary after the code lands.

## Interfaces and Dependencies

Package and module boundaries must remain:

- `packages/domain` stays pure and type-only.
- `apps/control-plane/src/modules/finance-discovery/**` owns finance answer-family registry, formatting, and answer assembly.
- `apps/control-plane/src/modules/missions/**` stays responsible for intake, persistence orchestration, and read models, not finance-answer logic.
- `apps/control-plane/src/modules/evidence/**` stays responsible for artifact and proof-bundle shaping.
- `apps/control-plane/src/modules/orchestrator/**` stays responsible for scout-task execution flow.
- `apps/web/**` stays a read-model and intake surface only.

Expected dependencies:

- existing `FinanceTwinService` route-equivalent reads for bank accounts, cash posture, receivables aging, collections posture, payables aging, payables posture, spend items, spend posture, contracts, and obligation calendar
- existing `CfoWikiService.getPage`
- no new env vars
- no GitHub connector guard usage

## Outcomes & Retrospective

- Shipped scope:
  - Widened the typed finance discovery contract to exactly five truthful families: `cash_posture`, `collections_pressure`, `payables_pressure`, `spend_posture`, and `obligation_calendar_review`.
  - Added a code-owned supported-family registry plus supporting formatter and summary helpers inside `apps/control-plane/src/modules/finance-discovery/**` so each family owns its required Finance Twin reads, related routes, related wiki pages, freshness posture, baseline limitations, and evidence sections.
  - Kept `mission.type === "discovery"` and `POST /missions/analysis` as the primary finance entrypoint while widening mission titles, objectives, mission detail, mission list, and proof-bundle shaping to the new finance families.
  - Updated the web intake and answer rendering to expose only the supported families and to render deterministic finance answer metadata, related routes, related wiki pages, freshness posture, and limitations without implying generic finance chat or unsupported analysis.
  - Added `tools/finance-discovery-supported-families-smoke.mjs` and the `pnpm smoke:finance-discovery-supported-families:local` alias to prove the five supported families can run end to end from stored Finance Twin plus stored CFO Wiki state in the Docker-backed local environment.

- Architecture and provenance outcome:
  - Schema stayed unchanged.
  - No new Finance Twin extractors, policy lookup, runtime-codex answer generation, vector search, OCR, PageIndex/QMD/MinerU, deep-read dependency, or aging-review family support was introduced.
  - Answer assembly remained inside the `finance-discovery` bounded context, with routes staying thin and all mission-facing outputs carrying explicit freshness posture and limitations sourced from stored state.

- Docs refreshed:
  - `README.md`
  - `plans/ROADMAP.md`
  - `docs/ops/local-dev.md`

- Validation passed:
  - Narrow domain contract specs for discovery mission, proof bundle, mission detail, and mission list.
  - Narrow control-plane finance discovery, mission, evidence, orchestrator, and app route specs.
  - Narrow web intake, answer card, and API specs.
  - Focused twin sync specs required by the slice.
  - The full requested smoke ladder, including the new `pnpm smoke:finance-discovery-supported-families:local`.
  - `pnpm lint`
  - `pnpm typecheck`
  - `pnpm test`
  - `pnpm ci:repro:current`

- Surprises that affected execution:
  - No schema change or extra read seam was required once the family registry owned the supported-route and wiki mappings.
  - The new smoke initially failed because a derived company key exceeded the current length constraint, so the fixture builder was tightened to keep keys deterministic and within the stored limit.

- Remaining work after this slice:
  - Publish the already-validated branch as the single requested commit, push, and PR.
  - Leave `receivables_aging_review`, `payables_aging_review`, policy lookup, and the wider F4C/F5/F6 work for later slices.

- Recommendation:
  - Move to F4C next. This slice lands the first truthful F4B supported-family expansion cleanly, so the next slice should advance the planned F4C posture rather than extending F4B again unless new defects appear during review.
