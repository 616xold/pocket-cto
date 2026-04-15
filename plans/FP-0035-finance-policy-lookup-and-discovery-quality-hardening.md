# Define F4C finance policy lookup and discovery-quality hardening

## Purpose / Big Picture

This plan defines the first real **F4C finance discovery** execution contract for Pocket CFO.

The user-visible goal is to let a fresh implementation thread add one truthful new finance-discovery family, `policy_lookup`, without reopening the shipped F4A and F4B baseline or widening into generic policy chat, runtime-codex answer generation, vector retrieval, OCR, deep-read, F5 reporting, or F6 monitoring. F4C matters now because the repo already ships the deterministic source and wiki backbone needed for source-scoped policy answers: explicit `policy_document` bindings, stored deterministic document extracts, compiler-owned policy pages at `policies/<sourceId>`, related source-digest history, and the `concepts/policy-corpus` concept page. The next gain is therefore not broader retrieval. It is a deterministic, read-only, mission-based policy lookup path plus a later hardening pass that extends discovery quality and eval coverage only where real evidence gaps remain.

GitHub connector work is explicitly out of scope for this slice and for the initial F4C1 implementation.
This planning thread is docs-and-plan only. It creates the active F4C contract and refreshes the smallest active-doc set so a later implementation thread can continue this plan directly.

## Progress

- [x] 2026-04-15T17:59:02Z Audit the active docs, shipped F4 plan chain, discovery-domain contracts, proof-bundle shaping, wiki policy surfaces, and operator-facing mission views before drafting the F4C execution contract.
- [x] 2026-04-15T17:59:02Z Create `plans/FP-0035-finance-policy-lookup-and-discovery-quality-hardening.md` and refresh the smallest active-doc set so F4C1 and F4C2 are described consistently.
- [x] 2026-04-15T18:08:24Z Run the docs-and-plan validation ladder for this planning slice without starting F4C implementation.
- [x] 2026-04-15T22:20:42Z Apply a tiny follow-on handoff-doc truthfulness polish so `START_HERE.md` and `docs/ops/local-dev.md` point cleanly at the shipped F4A/F4B baseline, the active `FP-0035` contract, the next `F4C1` implementation thread, and the later `F4C2` hardening pass.
- [x] 2026-04-15T22:34:18Z Preflight the clean `codex/f4c1-finance-policy-lookup-local-v1` branch against fetched `origin/main`, reload the active docs and required repo skills, and confirm this existing `FP-0035` contract is sufficient for F4C1 without creating a new Finance Plan.
- [x] 2026-04-15T23:12:41Z Implement `policy_lookup` as the only new F4C1 family through the existing mission engine, discovery bounded context, proof-bundle path, and operator read models. The shipped slice keeps the five F4A/F4B families unchanged, requires explicit `policySourceId` scope, persists truthful limited answers plus finance-ready proof bundles, adds the local `smoke:finance-policy-lookup:local` alias, and refreshes only the small doc set made stale by the landed code.
- [ ] Land F4C2 discovery-quality hardening and eval extension only after F4C1 proves which operator or evidence gaps are still real.

## Surprises & Discoveries

- Observation: the current finance-discovery path is already modular and registry-driven, but the typed question contract still has no place for explicit policy source scope.
  Evidence: `packages/domain/src/discovery-mission.ts` currently models every finance question as `{ companyKey, questionKind, operatorPrompt? }`, while `apps/control-plane/src/modules/finance-discovery/family-registry.ts` and `service.ts` only know the five shipped F4A/F4B families.

- Observation: the repo already ships the deterministic policy evidence layer F4C1 needs, including truthful gap posture for missing, unsupported, or failed extracts.
  Evidence: `packages/domain/src/cfo-wiki.ts`, `apps/control-plane/src/modules/wiki/bound-sources.ts`, `apps/control-plane/src/modules/wiki/compiler/knowledge-registry.ts`, and `knowledge-render.ts` already support explicit `policy_document` bindings, `policies/<sourceId>` pages, source-digest history, `concepts/policy-corpus`, and visible unsupported or failed extract gaps.

- Observation: the existing wiki service seam is already wide enough for source-scoped policy lookup without adding a new route layer.
  Evidence: `apps/control-plane/src/lib/types.ts` exposes both `getPage` and `listCompanySources` on `CfoWikiServicePort`, and `apps/control-plane/src/modules/wiki/service.ts` already returns bound-source metadata, latest snapshot status, latest extract status, and limitations through `listCompanySources`.

- Observation: the current mission and proof-bundle read models already carry most of the policy-answer evidence posture F4C1 will need.
  Evidence: `packages/domain/src/proof-bundle.ts`, `apps/control-plane/src/modules/evidence/proof-bundle-summary.ts`, `proof-bundle-assembly.ts`, `apps/control-plane/src/modules/missions/detail-view.ts`, `mission-list.ts`, and `apps/web/components/mission-card.tsx` already preserve `questionKind`, answer summary, freshness, limitations, related route paths, and related wiki page keys.

- Observation: policy lookup can stay read-only and mission-based without involving runtime-codex or new Finance Twin extractors.
  Evidence: `apps/control-plane/src/modules/orchestrator/discovery-phase.ts` already runs finance discovery through the scout-only deterministic path, and the shipped wiki policy pages are derived from stored raw-source extracts rather than runtime-codex output.

- Observation: the existing source-list read seam already exposes enough bound-source status to reject unknown or non-`policy_document` scope before answer assembly.
  Evidence: `apps/control-plane/src/modules/wiki/service.ts` and `bound-sources.ts` already return each bound source with `documentRole`, latest snapshot metadata, latest extract status, latest source-file presence, and truthful limitations via `listCompanySources`.

- Observation: the new packaged F4C1 smoke caught one real embedded-worker seam that focused unit batches did not exercise.
  Evidence: `pnpm smoke:finance-policy-lookup:local` initially failed with `this.requireCompany is not a function` because the policy-lookup discovery path passed `CfoWikiService` instance methods unbound; the final implementation now wraps those reads so the embedded worker preserves the wiki service context cleanly.

## Decision Log

- Decision: keep F4C mission-based and deterministic rather than treating policy lookup as generic policy chat.
  Rationale: the mission engine, replay spine, durable answer artifacts, and proof bundles remain the supported Pocket CFO answer path.

- Decision: split F4C into two additive passes inside one phase: `F4C1` for explicit policy lookup and `F4C2` for discovery-quality hardening plus eval extension.
  Rationale: the repo needs one clear first implementation contract before it broadens into smoke or eval changes.

- Decision: define `policy_lookup` as the only new required F4C1 family.
  Rationale: this is the narrowest truthful policy slice the shipped wiki and source-binding system can already support.

- Decision: require explicit policy source scope in the F4C1 typed question contract, with `policySourceId` preferred as a required field for `policy_lookup`.
  Rationale: the first policy path should not pretend generic corpus-wide semantic retrieval exists when the shipped product truth is explicit bound-source policy coverage.

- Decision: answer F4C1 policy questions only from the compiled policy page `policies/<policySourceId>`, related source-digest pages for that same source when useful, `concepts/policy-corpus` when useful, and explicit bound-source metadata plus stored extract status.
  Rationale: raw sources remain authoritative, the CFO Wiki remains the derived operator-readable layer, and the first policy answer must stay source-scoped and deterministic.

- Decision: if the latest bound policy extract is missing, unsupported, or failed, persist a truthful limited answer instead of fabricating a digest or escalating to a different retrieval mode.
  Rationale: visible coverage gaps are more trustworthy than fake synthesis.

- Decision: keep F4C1 read-only and out of the runtime-codex path.
  Rationale: the first shipped policy answer should be reproducible from stored state alone.

- Decision: keep vector search, embeddings, PageIndex, QMD, MinerU, OCR, deep-read, new Finance Twin extractors, generic policy retrieval, report compilation, and F5/F6 work explicitly out of scope.
  Rationale: none of those are prerequisites for the first truthful F4C1 slice.

- Decision: keep `receivables_aging_review`, `payables_aging_review`, `runway`, `burn_variance`, `concentration`, `covenant_risk`, `anomaly_review`, and policy-scored `spend_exceptions` blocked in F4C1.
  Rationale: the current repo does not yet have a truthful deterministic contract for those paths.

- Decision: keep GitHub connector and engineering-twin modules intact and do not use GitHub Connector Guard here.
  Rationale: the user explicitly excluded that boundary from this slice, and F4C remains finance-centered.

- Decision: execute F4C1 against the existing `FP-0035` document instead of creating a new Finance Plan.
  Rationale: the active contract already names the exact scope, validation ladder, evidence posture, and out-of-scope boundaries for this implementation thread.

- Decision: keep the F4C1 policy-lookup read seam inside the existing discovery service by binding the current wiki-service methods rather than widening the wiki module or adding a special policy route.
  Rationale: the shipped `getPage` plus `listCompanySources` seam was already sufficient; the only extra hardening needed was to preserve method context in the embedded-worker path.

## Context and Orientation

Pocket CFO has already shipped F4A and F4B through the following supported discovery families:

- `cash_posture`
- `collections_pressure`
- `payables_pressure`
- `spend_posture`
- `obligation_calendar_review`

The current discovery implementation is registry-driven inside `apps/control-plane/src/modules/finance-discovery/**`, runs through `mission.type === "discovery"` and `POST /missions/analysis`, persists durable `discovery_answer` artifacts, and refreshes finance-ready proof bundles through the scout-only orchestrator path.

The current wiki implementation already ships the policy surfaces F4C1 can rely on:

- explicit `policy_document` bindings
- deterministic document extracts from stored raw bytes
- compiler-owned policy pages at `policies/<sourceId>`
- same-source source-digest history pages
- `concepts/policy-corpus`
- bound-source list views with latest snapshot, latest extract, and truthful limitation posture

The active-doc boundary for this slice is:

- `README.md`
- `START_HERE.md`
- `PLANS.md`
- `plans/ROADMAP.md`
- `plans/FP-0030-finance-discovery-foundation-and-first-answer.md`
- `plans/FP-0031-finance-discovery-supported-posture-and-obligation-families.md`
- `plans/FP-0032-finance-discovery-polish-and-compatibility.md`
- `plans/FP-0033-finance-discovery-baseline-closeout-polish.md`
- `plans/FP-0034-finance-discovery-final-artifact-and-doc-polish.md`
- this plan: `plans/FP-0035-finance-policy-lookup-and-discovery-quality-hardening.md`
- `docs/ops/source-ingest-and-cfo-wiki.md`
- `docs/ops/local-dev.md`
- `docs/benchmarks/seeded-missions.md`
- `evals/README.md`

The relevant implementation seams for the future F4C1 code thread are:

- `packages/domain/src/discovery-mission.ts`, `proof-bundle.ts`, `mission-detail.ts`, `mission-list.ts`, and `cfo-wiki.ts` for pure typed contracts
- `apps/control-plane/src/modules/finance-discovery/**` for deterministic answer-family ownership and policy-answer assembly
- `apps/control-plane/src/modules/missions/**` for thin mission creation and read-model integration
- `apps/control-plane/src/modules/evidence/**` for proof-bundle and artifact shaping
- `apps/control-plane/src/modules/orchestrator/discovery-phase.ts` for scout-only execution integration
- `apps/control-plane/src/modules/wiki/**` only for read seams that expose policy pages and bound-source metadata
- `apps/web/components/**` and `apps/web/lib/api.ts` for operator intake, detail, and list rendering

This planning slice does not add runtime code, routes, schema changes, migrations, package scripts, smoke aliases, or eval datasets.

## Plan of Work

F4C should now proceed in two explicit sub-slices inside one phase.

First, implement `F4C1` as a new source-scoped finance-discovery family called `policy_lookup`. The domain contract should become a discriminated finance question shape: the five shipped F4A/F4B families keep the current company-scoped shape, while `policy_lookup` additionally requires `policySourceId` and keeps freeform operator wording as display-only metadata. The control-plane answer path should remain in `apps/control-plane/src/modules/finance-discovery/**`, read from existing wiki service seams instead of new routes, and persist one deterministic discovery answer artifact plus one finance-ready proof bundle through the existing scout-only mission engine.

Second, implement `F4C2` only after F4C1 is green and its operator evidence posture is clear. F4C2 should extend seeded finance smokes and eval hooks for the shipped discovery families plus `policy_lookup`, and it may harden answer detail or proof-bundle presentation only where F4A, F4B, or F4C1 prove a real operator need. F4C2 should not pre-commit the repo to PageIndex, QMD, MinerU, OCR, vector search, embeddings, or deep-read unless the concrete F4C1 results show an evidence-precision gap that the existing deterministic path cannot address.

The F4C1 answer contract should stay additive and explicit. Each stored `policy_lookup` answer should carry:

- `companyKey`
- `questionKind: "policy_lookup"`
- `policySourceId`
- one concise deterministic answer summary
- explicit freshness posture
- explicit visible limitations
- related wiki pages anchored to the scoped policy source
- related route paths only where they help the operator inspect the same stored scoped evidence
- evidence sections grounded in stored wiki pages and bound-source status
- deterministic body markdown plus structured data suitable for later F5 reuse

The F4C1 proof-bundle expectations should remain finance-ready and source-scoped. The bundle should preserve the answer summary, freshness summary, limitation summary, related wiki page keys, any route paths that point back to the scoped stored evidence, and a verification summary that tells the operator to review the compiled policy page and its extract-status posture before acting.

The related wiki-page expectations for `policy_lookup` are:

- always include `policies/<policySourceId>` as the primary scoped page
- include `concepts/policy-corpus` when the answer benefits from showing the narrow policy-corpus boundary
- include same-source source-digest pages when they exist and help explain the latest extract posture or policy history
- do not include unrelated policy pages from other sources as if generic retrieval had occurred

The limitation posture for `policy_lookup` must always remain explicit. At minimum, F4C1 should preserve:

- source-scoped lookup only, not corpus-wide semantic retrieval
- no legal, control, approval, or obligation inference beyond explicit policy-page and extract-backed support
- truthful missing, unsupported, or failed extract posture for the latest bound source
- any missing policy page or missing policy-corpus page as a visible gap rather than a hidden fallback

## Concrete Steps

1. Widen the pure domain contract in:
   - `packages/domain/src/discovery-mission.ts`
   - `packages/domain/src/proof-bundle.ts`
   - `packages/domain/src/mission-detail.ts`
   - `packages/domain/src/mission-list.ts`
   - `packages/domain/src/cfo-wiki.ts` only if a tiny shared policy-source helper or type makes the contract clearer

   F4C1 should:
   - add `policy_lookup` to the finance discovery family set
   - require a discriminated typed shape where `policy_lookup` includes `policySourceId`
   - keep `mission.type === "discovery"` and JSON-backed persistence intact
   - avoid DB schema changes unless a concrete contract gap appears during implementation

2. Extend the finance-discovery bounded context in:
   - `apps/control-plane/src/modules/finance-discovery/family-registry.ts`
   - `apps/control-plane/src/modules/finance-discovery/service.ts`
   - `apps/control-plane/src/modules/finance-discovery/summary-builders.ts`
   - `apps/control-plane/src/modules/finance-discovery/read-formatters.ts`
   - `apps/control-plane/src/modules/finance-discovery/formatter.ts`
   - `apps/control-plane/src/modules/finance-discovery/types.ts`
   - add one tiny policy-specific helper file under `apps/control-plane/src/modules/finance-discovery/` if that keeps the registry readable

   F4C1 policy lookup should:
   - read bound-source metadata from `cfoWikiService.listCompanySources(companyKey)`
   - read the scoped policy page from `cfoWikiService.getPage(companyKey, buildCfoWikiPolicyPageKey(policySourceId))` or the equivalent page-key helper
   - read `concepts/policy-corpus` when useful
   - include same-source source-digest pages only for the scoped source when useful
   - persist a truthful limited answer when the latest bound policy extract is missing, unsupported, or failed
   - never widen into generic retrieval, runtime-codex, or new Finance Twin extraction

3. Keep mission creation, evidence, and orchestrator integration additive in:
   - `apps/control-plane/src/modules/missions/discovery.ts`
   - `apps/control-plane/src/modules/missions/service.ts`
   - `apps/control-plane/src/modules/missions/detail-view.ts`
   - `apps/control-plane/src/modules/evidence/proof-bundle-summary.ts`
   - `apps/control-plane/src/modules/evidence/proof-bundle-assembly.ts`
   - `apps/control-plane/src/modules/orchestrator/discovery-phase.ts`

   F4C1 integration must:
   - keep `POST /missions/analysis` as the supported entrypoint
   - keep scout-only deterministic execution
   - carry `policySourceId` into mission title, objective, answer metadata, and proof-bundle summaries where that helps operator review
   - keep replay and artifact creation behavior intact

4. Update the operator web surfaces in:
   - `apps/web/components/discovery-mission-intake-form.tsx`
   - `apps/web/components/discovery-answer-card.tsx`
   - `apps/web/components/mission-card.tsx`
   - `apps/web/components/mission-list-card.tsx`
   - `apps/web/lib/api.ts`

   The F4C1 operator surface should:
   - allow `policy_lookup` mission creation only with explicit policy source scope
   - render the scoped policy source, related wiki pages, extract-status limitations, and limited-answer posture clearly
   - stay deterministic and read-only, with no chat-like freeform answer UI

5. Reserve `F4C2` for later hardening only after F4C1 proves what still needs attention.
   Expected F4C2 surfaces are:
   - `docs/benchmarks/seeded-missions.md`
   - `evals/README.md`
   - the existing finance smoke and eval hooks those docs point at

## Validation and Acceptance

The future F4C1 implementation ladder should run in this order:

1. Run the narrow targeted tests you add or widen for:
   - `policy_lookup` question-contract validation, including required `policySourceId`
   - scoped policy-answer assembly from a successful deterministic policy page
   - truthful limited-answer behavior when the latest bound policy snapshot is missing, unsupported, or failed
   - mission creation, mission detail, mission list, and proof-bundle shaping for `policy_lookup`
   - operator intake and answer rendering for explicit policy source scope

2. Run:
   - `pnpm --filter @pocket-cto/domain exec vitest run src/discovery-mission.spec.ts src/proof-bundle.spec.ts src/mission-detail.spec.ts src/mission-list.spec.ts`
   - `zsh -lc "cd apps/control-plane && pnpm exec vitest run src/modules/finance-discovery/service.spec.ts src/modules/missions/service.spec.ts src/modules/evidence/proof-bundle-assembly.spec.ts src/modules/orchestrator/service.spec.ts src/modules/wiki/service.spec.ts src/modules/wiki/knowledge-pages.spec.ts src/app.spec.ts"`
   - `zsh -lc "cd apps/web && pnpm exec vitest run components/**/*.spec.ts* lib/api.spec.ts"`

3. Run the existing confidence ladder unchanged to guard the shipped baseline:
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

F4C1 implementation is now accepted on this branch after the required thread-level ladder ran green:

- targeted domain, control-plane, and web `policy_lookup` test batches
- `pnpm --filter @pocket-cto/domain exec vitest run src/discovery-mission.spec.ts src/proof-bundle.spec.ts src/mission-detail.spec.ts src/mission-list.spec.ts`
- `zsh -lc "cd apps/control-plane && pnpm exec vitest run src/modules/finance-discovery/**/*.spec.ts src/modules/missions/**/*.spec.ts src/modules/evidence/**/*.spec.ts src/modules/orchestrator/**/*.spec.ts src/app.spec.ts"`
- `zsh -lc "cd apps/web && pnpm exec vitest run app/**/*.spec.ts* components/**/*.spec.ts* lib/api.spec.ts"`
- `pnpm smoke:finance-discovery-answer:local`
- `pnpm smoke:finance-discovery-supported-families:local`
- `pnpm smoke:finance-policy-lookup:local`
- `pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/twin/workflow-sync.spec.ts src/modules/twin/test-suite-sync.spec.ts src/modules/twin/codeowners-discovery.spec.ts`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm ci:repro:current`

Remaining planned work stays narrow:

- `F4C2` only, for discovery-quality hardening and eval extension informed by the now-shipped `policy_lookup` slice
   - `pnpm smoke:cfo-wiki-foundation:local`
   - `pnpm smoke:cfo-wiki-document-pages:local`
   - `pnpm smoke:cfo-wiki-lint-export:local`
   - `pnpm smoke:cfo-wiki-concept-metric-policy:local`
   - `pnpm smoke:finance-discovery-answer:local`
   - `pnpm smoke:finance-discovery-supported-families:local`

4. Run:
   - `pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/twin/workflow-sync.spec.ts src/modules/twin/test-suite-sync.spec.ts src/modules/twin/codeowners-discovery.spec.ts`

5. Run:
   - `pnpm lint`
   - `pnpm typecheck`
   - `pnpm test`
   - `pnpm ci:repro:current`

6. Only after F4C1 is green, extend the seeded finance smokes and eval hooks in F4C2 and rerun the same ladder with the added policy-specific coverage.

F4C1 acceptance is met only if all of the following are observable:

- `POST /missions/analysis` accepts `policy_lookup` only when `policySourceId` is supplied.
- Each `policy_lookup` mission persists one deterministic source-scoped answer artifact and one finance-ready proof bundle.
- The answer reads only from the scoped policy page, same-source source-digest history when useful, `concepts/policy-corpus` when useful, and bound-source extract status.
- Missing, unsupported, or failed latest extracts produce truthful limited answers rather than fabricated digest content.
- The operator surface makes the explicit policy source scope visible and does not imply generic semantic policy retrieval.
- No runtime-codex, vector search, OCR, deep-read, new Finance Twin extractor, report compiler, F5, or F6 work is introduced.

## Idempotence and Recovery

F4C1 should stay additive and retry-safe. It should not mutate raw sources, rewrite stored document extracts, or silently rewrite wiki pages outside the normal compiler-owned path. If an implementation step fails, the safe retry path is to rerun the targeted tests and the existing confidence ladder, refresh the relevant stored wiki compile only when the source evidence actually changed, and preserve limited-answer posture rather than introducing a heuristic fallback. If the policy contract proves broader than expected, revert only the touched domain, finance-discovery, mission, evidence, web, and doc files from F4C1 rather than disturbing the shipped F4A/F4B baseline or the optional GitHub connector path.

## Artifacts and Notes

Expected future artifacts from F4C are:

- this active F4C Finance Plan kept current as implementation lands
- one stored `discovery_answer` artifact per `policy_lookup` mission
- one finance-ready proof bundle carrying source-scoped policy evidence posture
- the smallest active-doc refresh needed if F4C1 implementation changes visible behavior
- later F4C2 seeded-smoke and eval updates only after F4C1 proves the right hardening targets

This planning thread itself should leave behind:

- `plans/FP-0035-finance-policy-lookup-and-discovery-quality-hardening.md`
- the minimal active-doc refresh that locks F4C1 and F4C2 wording together
- no new runtime surface

## Interfaces and Dependencies

Boundaries that must hold:

- `packages/domain` stays pure and dependency-light.
- `apps/control-plane/src/modules/finance-discovery/**` remains the owner of finance-answer truthfulness rules.
- `apps/control-plane/src/modules/missions/**` stays thin and transport-oriented.
- `apps/control-plane/src/modules/evidence/**` stays responsible for proof-bundle shaping.
- `apps/control-plane/src/modules/wiki/**` remains the derived-source read seam, not a second source of truth.
- `apps/web/**` remains an operator intake and read-model layer only.

Dependencies and seams:

- existing `CfoWikiServicePort.getPage` and `listCompanySources`
- existing compiler-owned policy pages, source-digest pages, and `concepts/policy-corpus`
- existing proof-bundle refresh and replay flow
- existing finance discovery route and mission engine seams
- no new environment variables
- no GitHub connector guard usage
- no runtime-codex dependency in F4C1

## Outcomes & Retrospective

This planning slice created the first real F4C execution contract and the follow-on handoff-doc polish now leaves the active-doc set pointing cleanly at that contract so a fresh Codex thread can implement F4C cleanly. The active contract now separates `F4C1` from `F4C2`, defines `policy_lookup` as the only new required F4C1 family, requires explicit `policySourceId` scope, and locks the first policy answer path to explicit `policy_document` bindings plus stored deterministic extracts only.

No runtime code, routes, schema changes, migrations, package scripts, smoke aliases, eval datasets, runtime-codex dependencies, vector search, OCR, PageIndex, QMD, MinerU, or deep-read work were added in this slice. F4A and F4B remain the shipped authoritative discovery baseline.

Remaining work:

- execute the unchecked F4C1 implementation steps in a follow-on thread against this plan
- leave any smoke or eval extension to F4C2 rather than widening F4C1 prematurely
