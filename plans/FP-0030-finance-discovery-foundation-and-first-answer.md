# Build the F4A finance discovery foundation and first answer

## Purpose / Big Picture

This plan defines the first real **F4A finance discovery** implementation slice for Pocket CFO.

The user-visible goal is to make the first F4 code slice straightforward for a fresh contributor: retarget the current engineering-coded discovery mission path into a company-scoped finance discovery mission that can answer one deterministic stored-state question, persist a durable finance answer artifact, and present a finance-ready proof bundle without widening into generic finance chat, runtime-codex answer generation, new Finance Twin extractors, or later F4B/F4C/F5/F6 work.

F4A matters now because broad F2 Finance Twin breadth is already shipped through F2O and F3A through F3D now provide deterministic wiki context, concept pages, metric-definition pages, and policy pages. The truthful next gain is not another extractor family or a memo compiler. It is one mission-based finance answer path that reads the stored Finance Twin plus relevant stored CFO Wiki state, exposes freshness and limitations plainly, and produces an artifact a later F5 report compiler can reuse.

GitHub connector work is explicitly out of scope for this slice.
This plan is the active F4A implementation contract and must stay current while the future implementation retargets the domain contracts, additive persistence shape, control-plane bounded contexts, operator read models, proof-bundle posture, and smoke coverage.

## Progress

- [x] 2026-04-14T16:40:48Z Audit the active docs, prior F3 plans, eval guidance, and the current discovery, mission, evidence, twin, wiki, and web seams before defining the first real F4 execution contract.
- [x] 2026-04-14T16:40:48Z Create `plans/FP-0030-finance-discovery-foundation-and-first-answer.md` and refresh the smallest truthful active-doc set so a fresh F4A implementation thread can start without ambiguity.
- [x] 2026-04-14T16:50:12Z Run the required docs-and-plan validation ladder for this master-plan slice and confirm the repo stays green without starting F4/F5/F6 implementation, including the full smoke ladder, the twin reproducibility trio, `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm ci:repro:current`.
- [x] 2026-04-14T23:48:00Z Run the F4A local-thread preflight against fetched `origin/main`, confirm the requested branch and clean worktree posture, audit the current discovery, proof-bundle, twin, wiki, and web seams again, and land the smallest required doc-truthfulness polish before code changes.
- [x] 2026-04-15T00:35:07Z Implement the F4A domain, control-plane, evidence, web, and smoke changes described in this plan without widening into runtime-codex, new Finance Twin extractors, or later F4B/F4C/F5/F6 work.
- [x] 2026-04-15T00:35:07Z Run the full F4A implementation validation ladder through `pnpm ci:repro:current`, confirm the new finance-discovery smoke and the historical engineering-twin reproducibility trio stay green, and prepare the single publishable commit for the implementation thread.

## Surprises & Discoveries

- Observation: at plan start, the discovery mission contract was still engineering blast-radius discovery from domain through web UI.
  Evidence: `packages/domain/src/discovery-mission.ts`, `apps/control-plane/src/modules/missions/discovery.ts`, `apps/control-plane/src/modules/orchestrator/discovery-phase.ts`, `apps/control-plane/src/modules/evidence/discovery-answer.ts`, `apps/web/components/discovery-mission-intake-form.tsx`, `apps/web/components/discovery-answer-card.tsx`, `tools/m3-discovery-mission-smoke.mjs`, and `tools/twin-blast-radius-smoke.mjs` all centered `repoFullName`, `changedPaths`, `auth_change`, and stored twin blast-radius answers before the F4A implementation landed.

- Observation: discovery proof-bundle support already exists, but the current proof surface still carries repo and PR assumptions that are not finance-ready.
  Evidence: `packages/domain/src/proof-bundle.ts`, `apps/control-plane/src/modules/evidence/proof-bundle-summary.ts`, `apps/control-plane/src/modules/evidence/proof-bundle-assembly.ts`, and `apps/web/components/mission-card.tsx` still default to repo labels, PR links, GitHub-ready bundle copy, and build-mission evidence framing even when the mission type is `discovery`.

- Observation: the shipped Finance Twin and CFO Wiki surfaces are strong enough for a first deterministic finance answer, but they are narrower than the long-term discovery wishlist.
  Evidence: `apps/control-plane/src/modules/finance-twin/routes.ts` already exposes truthful `cash-posture`, `bank-accounts`, `receivables-aging`, `collections-posture`, `payables-aging`, `payables-posture`, `contracts`, `obligation-calendar`, `spend-items`, and `spend-posture` reads, while the shipped F3D wiki now provides deterministic concept, metric-definition, and policy pages. None of those surfaces yet provide truthful deterministic support for runway, burn variance, concentration, covenant risk, anomaly review, or policy-scored spend exceptions.

- Observation: the current source-ingest and wiki ops docs already state most of the authority model F4 needs, but they stop short of defining the F4 mission contract precisely.
  Evidence: `docs/ops/source-ingest-and-cfo-wiki.md` already says trustworthy query flow should read the twin plus relevant wiki pages and answer only from stored state with freshness and limitations, yet it does not currently define the typed company-scoped question contract, finance answer artifact contract, or the F4A/F4B/F4C cut.

- Observation: Codex App Server remains useful for later writeups and reports, but the first F4 answer path should not depend on it.
  Evidence: `docs/ops/codex-app-server.md` already says Codex is not the raw source of financial truth and is best used for wiki maintenance, writeups, memo drafting, and formatting assistance. The current runtime-codex module is therefore a later assistive seam, not the first deterministic finance answer engine.

- Observation: the existing mission and artifact tables appear flexible enough to carry the first F4A question and answer retarget in JSON-backed contracts without an obvious mandatory schema migration.
  Evidence: `packages/db/src/schema/missions.ts` and `packages/db/src/schema/artifacts.ts` already persist `spec`, mission-input compiler output, and artifact metadata as JSON, while `packages/domain/src/mission.ts`, `packages/domain/src/discovery-mission.ts`, and `packages/domain/src/proof-bundle.ts` currently impose the engineering-discovery semantics that need retargeting.

- Observation: the shipped F4A slice was able to stay fully additive and avoid DB schema churn.
  Evidence: the landed implementation completed through typed domain-contract changes, new `apps/control-plane/src/modules/finance-discovery/**` bounded-context files, mission-route retargeting, finance-ready proof-bundle shaping, web read-model updates, and `tools/finance-discovery-answer-smoke.mjs` without any `packages/db/drizzle/**` migration edits.

## Decision Log

- Decision: define Pocket CFO F4 as mission-based finance discovery from stored Finance Twin and stored CFO Wiki state, not as a generic finance chat box.
  Rationale: the mission engine, replay spine, and durable artifacts are already the strongest reusable product spine in the repo, and the first answer path must stay reviewable, typed, and reproducible.

- Decision: keep the authority boundary fixed for F4.
  Rationale: raw sources remain authoritative for document claims, the Finance Twin remains authoritative for structured finance facts, and the CFO Wiki remains the operator-readable compiled layer derived from those two sources of truth.

- Decision: lock the F4 sequence into three additive slices: `F4A`, `F4B`, and `F4C`.
  Rationale: the repo needs an implementation-ready map that starts with one deterministic read-only answer path, then expands only into already-supported posture or aging families, and only later adds policy lookup plus discovery-quality hardening.

- Decision: make `cash_posture` the first and only required F4A question family.
  Rationale: `cash_posture` already has a truthful deterministic backend read surface, related bank-account inventory support, and corresponding wiki concept or metric-definition context. It is the narrowest first answer that can ship without inventing new extractors or fake one-number conclusions.

- Decision: keep the future F4A question contract typed and company-scoped, with optional operator wording stored for display only.
  Rationale: answer logic must run from typed question data and stored state only. Freeform operator phrasing may help UX, but it must not become the execution substrate.

- Decision: make the future finance discovery answer artifact durable, deterministic, and F5-reusable.
  Rationale: the artifact must carry company scope, question kind, one concise answer summary, explicit freshness posture, visible limitations, related routes, related wiki pages, structured evidence sections, and a deterministic markdown body or renderable equivalent so later report compilation can reuse it without rereading chat.

- Decision: keep the first F4A execution path deterministic and read-only with no runtime-codex dependency.
  Rationale: the first shipped answer should be reproducible from stored Finance Twin and wiki reads alone. Runtime-codex remains valuable for later memo drafting, investigative writeups, or report formatting, but it must not be the first answer engine.

- Decision: explicitly defer vector search, vector DB, PageIndex, QMD, MinerU, OCR, and PDF-heavy deep read from F4A and F4B unless a concrete evidence-precision gap is proven later.
  Rationale: none of those are prerequisites for the first truthful finance discovery answer, and adding them prematurely would blur the source-of-truth boundary and widen scope.

- Decision: recommend a dedicated deterministic `finance-discovery` bounded context in the control-plane and make the existing mission, evidence, orchestrator, and web discovery surfaces delegate to it.
  Rationale: the repo already shows the cost of letting discovery semantics sprawl across unrelated files. A dedicated bounded context keeps the future F4A retargeting modular and reviewable.

- Decision: keep GitHub connector work out of scope and do not use GitHub Connector Guard in this slice or the initial F4A implementation.
  Rationale: the user requested it directly, and the product center for F4 is finance evidence rather than repository sync or PR publishing.

- Decision: keep the engineering-twin path intact as historical scaffolding while F4A lands.
  Rationale: the engineering-twin reproducibility surface still has value as archive or test infrastructure, and the user explicitly forbids deleting GitHub or engineering-twin modules in this slice.

- Decision: mark `runway`, `burn_variance`, `concentration`, `covenant_risk`, `anomaly_review`, and policy-scored `spend_exceptions` as explicitly blocked for now.
  Rationale: those families do not yet have truthful deterministic Finance Twin support in the current repo, so the active docs and implementation plan must name them as later work instead of implying they are ready.

- Decision: prefer an additive JSON-backed retarget first and avoid DB migrations unless a concrete F4A contract gap appears during implementation.
  Rationale: the existing mission spec, mission input, and artifact metadata persistence seams already provide room for a typed company-scoped finance question, durable answer artifact, and finance-ready proof-bundle fields without destructive enum or column churn.

- Decision: keep `POST /missions/analysis` as the primary finance-discovery create route while preserving `POST /missions/discovery` as a thin compatibility alias for the transition.
  Rationale: the new route makes the company-scoped finance-analysis posture explicit, while the alias keeps already-shipped mission surfaces compatible and avoids widening this slice into a broader transport rewrite.

## Context and Orientation

Pocket CFO has already shipped:

- F1 authoritative raw-source registration, snapshots, files, checksums, and immutable storage refs
- broad F2 Finance Twin breadth through F2O, including truthful backend-first reads for cash posture, receivables aging, collections posture, payables aging, payables posture, contract inventory, obligation calendar, spend posture, lineage, and related diagnostics
- F3A deterministic CFO Wiki compile runs, compiler-owned foundation pages, links, refs, and route-backed reads
- F3B explicit company-scoped document bindings, deterministic document extracts, source digest pages, and backlinks
- F3C persisted wiki lint runs, deterministic export runs, and ownership-safe filed artifact preservation
- F3D deterministic concept pages, metric-definition pages, and policy pages from fixed registries plus explicit `policy_document` bindings

The pre-implementation repo truth that F4A had to retarget was:

- `packages/domain/src/mission.ts` modeled mission types as `build`, `incident`, `release`, and `discovery`
- `packages/domain/src/discovery-mission.ts` modeled repo-scoped blast-radius discovery questions and artifacts
- `packages/domain/src/proof-bundle.ts` centered generic build or PR-era evidence expectations
- `apps/control-plane/src/modules/missions/discovery.ts` compiled stored blast-radius discovery missions around `repoFullName`, `changedPaths`, and `auth_change`
- `apps/control-plane/src/modules/evidence/discovery-answer.ts` persisted stored twin blast-radius answers
- `apps/control-plane/src/modules/orchestrator/discovery-phase.ts` executed discovery through `TwinService.queryRepositoryBlastRadius`
- `apps/web/components/discovery-mission-intake-form.tsx` and `apps/web/components/discovery-answer-card.tsx` presented repo blast-radius intake and evidence
- `tools/m3-discovery-mission-smoke.mjs` and `tools/twin-blast-radius-smoke.mjs` served as the engineering discovery proofs

The active-doc boundary for this slice is:

- `README.md`
- `START_HERE.md`
- `AGENTS.md`
- `PLANS.md`
- `WORKFLOW.md`
- `plans/ROADMAP.md`
- `plans/FP-0026-cfo-wiki-foundation-and-page-registry.md`
- `plans/FP-0027-cfo-wiki-document-page-compiler-and-backlinks.md`
- `plans/FP-0028-cfo-wiki-lint-export-and-durable-filing.md`
- `plans/FP-0029-cfo-wiki-concept-metric-and-policy-pages.md`
- this plan: `plans/FP-0030-finance-discovery-foundation-and-first-answer.md`
- `docs/ops/source-ingest-and-cfo-wiki.md`
- `docs/ops/local-dev.md`
- `docs/ops/codex-app-server.md`
- `docs/benchmarks/seeded-missions.md`
- `evals/README.md`

The full F4 slice map is locked as follows:

- `F4A — finance discovery foundation and first supported answer`
  - retarget the discovery mission contract from engineering blast radius to company-scoped finance discovery
  - define the finance discovery question contract
  - define the finance discovery answer artifact contract
  - define finance-ready proof-bundle expectations for analysis missions
  - keep execution deterministic and read-only
  - first shipped question family:
    - `cash_posture`
  - answer only from stored Finance Twin plus stored CFO Wiki state and explicit freshness
  - no runtime-codex
  - no report compiler
  - no new Finance Twin extractor

- `F4B — supported posture, aging, spend, and obligation answers`
  - expand only into question families already truthfully supported by shipped F2/F3 surfaces such as:
    - `collections_pressure`
    - `payables_pressure`
    - `spend_posture`
    - `obligation_calendar_review`
    - optionally `receivables_aging_review` and `payables_aging_review` if they stay purely route-backed and deterministic
  - keep answers grounded in existing Finance Twin reads, wiki pages, and lineage
  - keep question families narrow and typed
  - still no runtime-codex, F5 reports, or F6 monitoring

- `F4C — policy lookup and discovery quality hardening`
  - add policy lookup from explicit `policy_document` bindings and stored deterministic extracts only
  - extend seeded finance smoke and eval hooks
  - harden operator-facing answer detail and proof-bundle presentation
  - do not introduce PageIndex/QMD/MinerU, vector search, OCR, or deep-read dependencies unless an actual evidence-precision gap is proven during F4A/F4B

Question families that remain explicitly blocked for now are:

- `runway`
- `burn_variance`
- `concentration`
- `covenant_risk`
- `anomaly_review`
- `spend_exceptions` based on policy scoring or exception inference

The relevant bounded contexts for the future F4A implementation are:

- `packages/domain` for pure mission, finance-discovery, proof-bundle, and read-model contracts
- `packages/db` for additive mission, artifact, and replay schema changes only if the future implementation proves they are truly necessary
- `apps/control-plane/src/modules/finance-discovery/**` as the recommended deterministic finance-discovery bounded context
- `apps/control-plane/src/modules/missions/**` for route and mission-creation integration only
- `apps/control-plane/src/modules/evidence/**` for discovery-answer and proof-bundle assembly integration
- `apps/control-plane/src/modules/orchestrator/**` for mission execution integration
- `apps/control-plane/src/modules/finance-twin/**` and `apps/control-plane/src/modules/wiki/**` for read integration seams only
- `apps/web/app/missions/**`, `apps/web/components/**`, and `apps/web/lib/api.ts` for operator intake and detail read-model retargeting

GitHub connector work is out of scope.
This master-plan and doc-refresh slice does not add finance discovery runtime code, routes, schema changes, migrations, scripts, or smoke tooling. It exists only to make the first F4A implementation slice precise enough that a fresh thread can start without ambiguity.

## Plan of Work

Implement F4A in six bounded passes.

First, retarget the pure domain contracts so discovery questions, discovery answers, mission detail, mission list summaries, and proof-bundle summaries all support company-scoped finance discovery instead of engineering blast radius. Keep DB changes additive first and prefer reusing existing mission-type storage values where that avoids destructive enum churn.

Second, add a deterministic finance-discovery bounded context under `apps/control-plane/src/modules/finance-discovery/**`. This module should own typed question handling, answer assembly, markdown or renderable formatting, route-backed evidence section construction, and finance-ready artifact shaping. It should read from existing finance-twin and wiki seams directly rather than calling internal HTTP routes.

Third, retarget the mission creation and orchestration path so the primary backend entry point becomes `POST /missions/analysis`, the mission engine remains the only supported answer path, and claimed scout tasks call finance-discovery services rather than `TwinService.queryRepositoryBlastRadius`. Existing list and detail routes stay in place. If compatibility is needed during transition, the current `/missions/discovery` surface may remain as a thin alias only until the operator surface fully moves over.

Fourth, retarget discovery evidence and proof-bundle assembly so the answer artifact, decision trace, completeness rules, and operator-facing bundle copy become finance-ready. Discovery answers should read like reviewable finance analysis with freshness, limitations, related routes, related wiki pages, and reusable evidence sections, not like a PR or GitHub package.

Fifth, retarget the web missions surface so finance analysis intake, mission detail, and discovery answer cards reflect company scope, typed finance question kinds, explicit freshness posture, explicit limitations, route-backed evidence, and related wiki pages. This is not a wiki UI slice and not a generic finance chat UI slice.

Sixth, add a future F4A smoke proof plus the narrow doc or eval touch points that the code slice makes truthful. Keep the current engineering discovery smokes intact as historical proofs until the finance replacement ships and is green.

## Concrete Steps

1. Retarget the pure domain contracts in:
   - `packages/domain/src/mission.ts`
   - `packages/domain/src/discovery-mission.ts`
   - `packages/domain/src/proof-bundle.ts`
   - `packages/domain/src/mission-detail.ts`
   - `packages/domain/src/mission-task.ts`
   - `packages/domain/src/mission-list.ts`
   - `packages/domain/src/index.ts`

   F4A should prefer additive-first contract changes with these principles:
   - keep `mission.type === "discovery"` unless a rename is truly required and explicitly justified
   - keep `manual_discovery` or other persisted source-kind values unless a finance-specific rename is worth the schema churn
   - replace repo blast-radius question or answer semantics with company-scoped finance discovery semantics
   - keep route-visible schemas and artifact metadata strong enough that a later F5 report compiler can reuse them directly

2. Aim the future F4A question contract at one typed company-scoped shape only:

```ts
type FinanceDiscoveryQuestion = {
  companyKey: string;
  questionKind: "cash_posture";
  operatorPrompt?: string | null;
};
```

   Notes:
   - `operatorPrompt` is optional display context only
   - answer logic must run from `companyKey`, `questionKind`, and stored state only
   - no generic freeform finance chat input belongs in the first F4A route or mission contract
   - no repo name, changed paths, or engineering twin inputs belong in the future F4A question shape

3. Aim the future F4A answer artifact at one durable finance-ready shape:

```ts
type FinanceDiscoveryAnswerArtifact = {
  source: "stored_finance_twin_and_cfo_wiki";
  companyKey: string;
  questionKind: "cash_posture";
  summary: string;
  answerSummary: string;
  freshnessPosture: {
    state: string;
    reasonSummary: string;
  };
  limitations: string[];
  relatedRoutes: Array<{
    label: string;
    routePath: string;
  }>;
  relatedWikiPages: Array<{
    pageKey: string;
    title: string;
  }>;
  evidenceSections: Array<{
    key: string;
    title: string;
    summary: string;
    routePath?: string;
    pageKey?: string;
  }>;
  bodyMarkdown: string;
  structuredData: Record<string, unknown>;
};
```

   The future implementation should enforce:
   - no uncited numeric claim in `answerSummary`, `bodyMarkdown`, or `structuredData`
   - explicit freshness posture and visible limitations on every answer
   - deterministic markdown or renderable answer body
   - structured evidence sections that F5 can later reuse

4. Keep additive DB changes narrow in:
   - `packages/db/src/schema/missions.ts`
   - `packages/db/src/schema/artifacts.ts`
   - `packages/db/src/schema/replay.ts` only if replay taxonomy truly must change

   The future F4A implementation should:
   - avoid destructive enum churn
   - prefer storing finance discovery question and answer detail in existing JSON contracts where that stays clear and type-safe
   - add schema changes only when the future route, artifact, or proof-bundle contract cannot be expressed cleanly through existing additive fields
   - preserve existing replay events unless a small additive finance-specific payload or classification is clearly needed

5. Add a dedicated deterministic finance-discovery bounded context under `apps/control-plane/src/modules/finance-discovery/**`, preferably with:
   - `schema.ts`
   - `service.ts`
   - `formatter.ts`
   - `artifact.ts`

   Keep it responsible for:
   - validating supported finance discovery question kinds
   - loading existing Finance Twin reads and relevant wiki page context
   - constructing deterministic answer summaries, route-backed evidence sections, related wiki page lists, and finance limitations
   - building or reading finance discovery answer artifacts

   Keep it out of:
   - runtime-codex prompts or threads
   - generic retrieval or vector search
   - source ingest or new extractor logic
   - F5 report or packet rendering

6. Retarget the mission entry and read-model integration in:
   - `apps/control-plane/src/modules/missions/discovery.ts`
   - `apps/control-plane/src/modules/missions/service.ts`
   - `apps/control-plane/src/modules/missions/schema.ts`
   - `apps/control-plane/src/modules/missions/routes.ts`
   - `apps/control-plane/src/modules/missions/detail-view.ts`
   - `apps/control-plane/src/modules/missions/discovery-answer-view.ts`

   Route recommendations for F4A are:
   - `POST /missions/analysis`
   - `GET /missions`
   - `GET /missions/:missionId`

   Implementation notes:
   - `POST /missions/analysis` should be the primary create route for finance discovery missions
   - answer-building logic should live in the finance-discovery service and be called by mission execution, not duplicated in route handlers
   - if temporary compatibility is needed, keep `/missions/discovery` as a thin alias only during the transition
   - do not add an ad hoc finance chat route

7. Retarget orchestration in:
   - `apps/control-plane/src/modules/orchestrator/discovery-phase.ts`
   - `apps/control-plane/src/modules/orchestrator/service.ts`
   - `apps/control-plane/src/modules/orchestrator/task-state-machine.ts`
   - `apps/control-plane/src/modules/orchestrator/events.ts`

   The future F4A execution path should:
   - keep the mission engine primary
   - continue using a read-only deterministic scout-style execution phase if that is the smallest additive path
   - call finance-discovery answer assembly instead of `TwinService.queryRepositoryBlastRadius`
   - persist replay and task summaries truthfully for success, unsupported-question rejection, stale-state failure, or answer-build failure

8. Retarget evidence and proof assembly in:
   - `apps/control-plane/src/modules/evidence/discovery-answer.ts`
   - `apps/control-plane/src/modules/evidence/proof-bundle-summary.ts`
   - `apps/control-plane/src/modules/evidence/proof-bundle-assembly.ts`
   - `apps/control-plane/src/modules/evidence/service.ts`

   F4A proof-bundle expectations should become finance-ready rather than PR-ready:
   - discovery proof completeness should center the finance answer artifact and mission evidence, not PR artifacts
   - bundle summaries should name the company, question kind, freshness posture, and limitation posture
   - bundle decision trace should read like reviewable finance analysis
   - later F5 work should be able to reuse the stored answer artifact and proof-bundle context without reverse-engineering repo-specific copy

9. Use only existing read seams from:
   - `apps/control-plane/src/modules/finance-twin/**`
   - `apps/control-plane/src/modules/wiki/**`

   The first F4A `cash_posture` answer should be built from the shipped:
   - cash-posture route or underlying read seam
   - bank-account inventory route or underlying read seam when useful
   - related F3D metric-definition and concept pages such as `metrics/cash-posture` and `concepts/cash`
   - `company/overview` when useful for operator context

   It should surface:
   - currency buckets
   - dated versus undated balance posture where relevant
   - existing diagnostics already present in stored route-backed views
   - explicit limitations rather than a fake single-number cash claim

10. Keep the following items explicitly out of scope for F4A:
    - no generic finance chat
    - no runtime-codex in the first answer path
    - no vector DB
    - no PageIndex, QMD, MinerU, OCR, or PDF-heavy deep read dependency
    - no wiki UI work
    - no new Finance Twin extractor
    - no F5 reporting implementation
    - no F6 monitoring implementation
    - no deletion of GitHub or engineering-twin modules

11. Retarget operator-facing web surfaces in:
    - `apps/web/app/missions/**`
    - `apps/web/components/discovery-mission-intake-form.tsx`
    - `apps/web/components/discovery-answer-card.tsx`
    - `apps/web/components/mission-card.tsx`
    - `apps/web/lib/api.ts`

    The future F4A UI should:
    - submit company-scoped finance analysis intake instead of repo blast-radius intake
    - show company key, question kind, freshness posture, limitations, related routes, related wiki pages, and evidence sections
    - keep the mission list and mission detail flow intact
    - avoid introducing a wiki editor or generic chat surface

12. Update application wiring only where needed in:
    - `apps/control-plane/src/app.ts`
    - `apps/control-plane/src/bootstrap.ts`
    - `apps/control-plane/src/lib/types.ts`

    The future F4A implementation should:
    - wire the finance-discovery bounded context through explicit ports
    - keep routes thin
    - keep runtime-codex wiring unchanged unless a tiny additive type change is required elsewhere

13. Add a future F4A smoke proof after the implementation lands:
    - `tools/finance-discovery-answer-smoke.mjs`
    - `pnpm smoke:finance-discovery-answer:local`

    Keep these existing engineering proofs untouched until the finance replacement is shipped and green:
    - `tools/m3-discovery-mission-smoke.mjs`
    - `tools/twin-blast-radius-smoke.mjs`

14. Keep the future F4A implementation honest about unsupported families.
    Unsupported requests for `runway`, `burn_variance`, `concentration`, `covenant_risk`, `anomaly_review`, or policy-scored `spend_exceptions` should fail or stay blocked explicitly with visible limitations rather than falling back to heuristics, runtime-codex, or unstored assumptions.

## Validation and Acceptance

Future F4A implementation validation should run in this order:

```bash
pnpm smoke:finance-discovery-answer:local
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
pnpm smoke:cfo-wiki-foundation:local
pnpm smoke:cfo-wiki-document-pages:local
pnpm smoke:cfo-wiki-lint-export:local
pnpm smoke:cfo-wiki-concept-metric-policy:local
pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/twin/workflow-sync.spec.ts src/modules/twin/test-suite-sync.spec.ts src/modules/twin/codeowners-discovery.spec.ts
pnpm lint
pnpm typecheck
pnpm test
pnpm ci:repro:current
```

Focused F4A unit or integration coverage should also be added near the touched domain, control-plane, and web modules before the repo-wide ladder runs.

Acceptance for the future F4A implementation is met when all of the following are true:

- one company-scoped finance discovery mission completes end to end through the mission engine
- the first supported question family is `cash_posture`
- the answer is built only from stored Finance Twin plus stored CFO Wiki state
- the first answer path is deterministic and read-only
- the first answer path does not depend on runtime-codex
- the mission detail surface shows company scope, question kind, freshness posture, limitations, related routes, related wiki pages, and route-backed evidence sections clearly
- the stored finance discovery answer artifact is durable and reusable by later F5 reporting work
- the proof bundle reads like reviewable finance evidence rather than a GitHub-ready PR package
- explicit freshness, provenance posture, and limitations remain visible instead of being buried
- `runway`, `burn_variance`, `concentration`, `covenant_risk`, `anomaly_review`, and policy-scored `spend_exceptions` remain blocked or unsupported until the repo gains truthful deterministic support
- no generic finance chat route, no runtime-codex answer dependency, no vector search, no PageIndex/QMD/MinerU/OCR dependency, no wiki UI, no new Finance Twin extractor, and no F5/F6 runtime behavior are added

Provenance, freshness, and limitation posture for F4A:

- raw sources remain authoritative for document claims
- the Finance Twin remains authoritative for structured finance facts
- the CFO Wiki remains a derived operator-readable layer
- every answer must state freshness posture and visible limitations
- no uncited numeric claim may appear beyond what stored route-backed state or explicit refs support

## Idempotence and Recovery

F4A should be safe to retry.

- re-running the same mission after fresher Finance Twin or wiki state exists should produce a new deterministic answer artifact rather than mutating raw sources or hiding older evidence
- answer persistence should stay additive and replay-visible
- if the future F4A route or answer assembly fails, it should fail without code, branch, PR, deployment, or external communication side effects
- if a requested question family is unsupported, reject it explicitly and leave the limitation visible instead of guessing
- if finance discovery output overclaims unsupported evidence, narrow the answer immediately and preserve the missing or ambiguous coverage in the artifact body
- if an additive schema change proves unnecessary, prefer removing it before publish rather than widening the migration footprint
- if validation fails outside this slice or outside the known narrow engineering-twin reproducibility surface, stop and report the blocker rather than widening scope

## Artifacts and Notes

Expected artifacts from this planning slice are:

- this active F4A Finance Plan, kept current as implementation proceeds
- the active-doc refresh that locks the F4A/F4B/F4C map, the first supported question family, and the blocked-family boundary truthfully

Expected artifacts from the future F4A implementation slice are:

- a durable finance discovery answer artifact for `cash_posture`
- a finance-ready proof bundle for that mission
- focused domain, control-plane, and web coverage near the touched modules
- `tools/finance-discovery-answer-smoke.mjs`
- `pnpm smoke:finance-discovery-answer:local`

Evidence-bundle note:
F4A changes mission-facing answer evidence, proof-bundle wording, and operator review posture. The resulting answer and proof artifacts must expose freshness, limitations, related routes, related wiki pages, and question scope clearly enough that another operator can review or reuse them outside chat.

## Interfaces and Dependencies

Primary package and module boundaries for F4A are:

- `packages/domain` for pure finance discovery, mission, proof-bundle, and read-model contracts
- `packages/db` for additive mission, artifact, and replay schema changes only when truly necessary
- `apps/control-plane/src/modules/finance-discovery/**` for deterministic answer assembly
- `apps/control-plane/src/modules/missions/**` for route and mission-creation integration
- `apps/control-plane/src/modules/evidence/**` for artifact and proof-bundle assembly integration
- `apps/control-plane/src/modules/orchestrator/**` for mission execution integration
- `apps/control-plane/src/modules/finance-twin/**` only for read integration seams
- `apps/control-plane/src/modules/wiki/**` only for read integration seams
- `apps/web/app/missions/**`, `apps/web/components/**`, and `apps/web/lib/api.ts` for operator-facing intake and detail reads

Key upstream dependencies:

- existing Finance Twin reads for `cash_posture` and related supporting surfaces
- existing CFO Wiki concept, metric-definition, and company-overview pages
- existing source registry and lineage truth behind those surfaces
- existing mission, replay, and artifact persistence seams

Key downstream dependencies:

- later F4B posture, aging, spend, and obligation families should reuse the same finance-discovery bounded context
- later F4C policy lookup should extend the same mission or artifact contract from explicit `policy_document` bindings only
- later F5 reporting should reuse stored finance discovery artifacts rather than rebuilding answer structure from scratch

No new environment variables are expected for F4A.
Runtime-codex, vector retrieval, OCR, PageIndex, QMD, MinerU, and PDF-heavy deep read remain out of scope for the first implementation slice.

## Outcomes & Retrospective

Current outcome:
F4A is now shipped as a narrow deterministic finance-discovery slice with one truthful `cash_posture` mission family, a durable finance discovery answer artifact, a finance-ready proof bundle, a dedicated control-plane finance-discovery bounded context, an operator-facing mission route at `POST /missions/analysis`, and a green finance-discovery smoke plus clean detached-worktree repro.

What changed from the pre-existing repo state:

- the live engineering blast-radius discovery create contract was replaced for active intake by a typed company-scoped finance discovery question contract that supports `cash_posture` only, while any remaining engineering discovery references became historical follow-up surfaces rather than active product truth
- the control plane now assembles finance discovery answers deterministically from stored Finance Twin plus stored CFO Wiki state and persists finance-ready answer and proof artifacts without runtime-codex
- mission list, mission detail, proof-bundle summaries, and web mission cards now expose company key, question kind, freshness posture, limitations, related routes, related wiki pages, and reusable evidence sections truthfully
- the new `pnpm smoke:finance-discovery-answer:local` proof is green while the existing F1, F2, F3, and engineering-twin reproducibility surfaces remain intact and green
- the implementation stayed additive-first and did not require new Finance Twin extractors, vector search, OCR, deep-read dependencies, wiki UI work, or DB migrations

What remains:
F4B is now shipped on top of this foundation, and the next new major implementation phase is F4C policy lookup plus finance-discovery quality hardening. If a small post-merge truthfulness fix is discovered instead, handle it through `plans/FP-0032-finance-discovery-polish-and-compatibility.md` rather than reopening F4A scope.
