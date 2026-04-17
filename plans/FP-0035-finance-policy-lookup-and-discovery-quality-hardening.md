# Define F4C finance policy lookup and discovery-quality hardening

## Purpose / Big Picture

This plan defines the first real **F4C finance discovery** execution contract for Pocket CFO.

The user-visible goal is to let a fresh implementation thread add one truthful new finance-discovery family, `policy_lookup`, without reopening the shipped F4A and F4B baseline or widening into generic policy chat, runtime-codex answer generation, vector retrieval, OCR, deep-read, F5 reporting, or F6 monitoring. F4C matters now because the repo already ships the deterministic source and wiki backbone needed for source-scoped policy answers: explicit `policy_document` bindings, stored deterministic document extracts, compiler-owned policy pages at `policies/<sourceId>`, related source-digest history, and the `concepts/policy-corpus` concept page. The next gain is therefore not broader retrieval. It is a deterministic, read-only, mission-based policy lookup path plus a later hardening pass that extends discovery quality and eval coverage only where real evidence gaps remain.

GitHub connector work is explicitly out of scope for this slice and for the initial F4C1 implementation.
This plan now serves as the shipped F4C record. It preserves the narrow implementation contract, validation ladder, evidence posture, and active-doc refresh that carried F4C1, F4C2, and the final finance-native eval-hook closeout without widening into F5 or F6 behavior.

## Progress

- [x] 2026-04-15T17:59:02Z Audit the active docs, shipped F4 plan chain, discovery-domain contracts, proof-bundle shaping, wiki policy surfaces, and operator-facing mission views before drafting the F4C execution contract.
- [x] 2026-04-15T17:59:02Z Create `plans/FP-0035-finance-policy-lookup-and-discovery-quality-hardening.md` and refresh the smallest active-doc set so F4C1 and F4C2 are described consistently.
- [x] 2026-04-15T18:08:24Z Run the docs-and-plan validation ladder for this planning slice without starting F4C implementation.
- [x] 2026-04-15T22:20:42Z Apply a tiny follow-on handoff-doc truthfulness polish so `START_HERE.md` and `docs/ops/local-dev.md` point cleanly at the shipped F4A/F4B baseline, the active `FP-0035` contract, the next `F4C1` implementation thread, and the later `F4C2` hardening pass.
- [x] 2026-04-15T22:34:18Z Preflight the clean `codex/f4c1-finance-policy-lookup-local-v1` branch against fetched `origin/main`, reload the active docs and required repo skills, and confirm this existing `FP-0035` contract is sufficient for F4C1 without creating a new Finance Plan.
- [x] 2026-04-15T23:12:41Z Implement `policy_lookup` as the only new F4C1 family through the existing mission engine, discovery bounded context, proof-bundle path, and operator read models. The shipped slice keeps the five F4A/F4B families unchanged, requires explicit `policySourceId` scope, persists truthful limited answers plus finance-ready proof bundles, adds the local `smoke:finance-policy-lookup:local` alias, and refreshes only the small doc set made stale by the landed code.
- [x] 2026-04-16T11:56:00Z Apply a tiny post-merge truthfulness polish so this active F4 plan, the seeded benchmark framing, and the eval staging text all point at the shipped F4A through F4C1 baseline while leaving only F4C2 as remaining planned work.
- [x] 2026-04-16T12:24:00Z Preflight the clean `codex/f4c2-discovery-quality-hardening-local-v1` branch, reload the required repo skills plus the active-doc set, and confirm the narrowest truthful F4C2 slice is operator-safe policy-source selection, additive policy source-scope rendering hardening, and one deterministic packaged discovery-quality smoke.
- [x] 2026-04-16T15:28:20Z Land the first real F4C2 slice: replace blind raw UUID policy selection with a deterministic `policy_document` picker, propagate one additive policy source-scope summary through answer/mission/proof surfaces, add the packaged `smoke:finance-discovery-quality:local` proof, refresh only the small stale doc set, and hold the line against new discovery families, generic retrieval, runtime-codex answering, vector search, OCR, deep-read, F5, and F6 expansion.
- [x] 2026-04-16T16:37:00Z Tighten the F4C2 QA proof so `smoke:finance-discovery-quality:local` renders the mission-list card as well as discovery and mission detail surfaces, keeping the packaged smoke aligned with the shipped local-dev truthfulness claim without widening the slice.
- [x] 2026-04-17T16:15:03Z Apply a tiny post-merge active-doc truthfulness polish so README, START_HERE, local-dev guidance, source-ingest guidance, seeded benchmarks, and eval staging all point at the shipped F4A through F4C2 baseline while leaving `FP-0035` active only for a possible later eval-hook continuation before F5.
- [x] 2026-04-17T16:55:32Z Land the narrow later-F4 eval-hook continuation by extending `tools/finance-discovery-quality-hardening-smoke.mjs` with explicit structured-output support, adding finance-native `pnpm eval:finance-discovery-quality` report capture under `evals/results/finance-discovery-quality/`, refreshing the now-stale active docs, and rerunning the full validation ladder through `pnpm ci:repro:current`.
- [x] 2026-04-17T17:06:41Z Run a strict post-landing QA pass, confirm the branch and PR stay clean, and apply the smallest roadmap truthfulness polish so F4C2 no longer describes the already-landed eval-hook continuation as future work before recommending F5 planning next.

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

- Observation: the current operator intake still requires a raw UUID paste for `policy_lookup`, even though the existing bound-source list route already exposes the exact deterministic data needed for a safe selector.
  Evidence: `apps/web/components/discovery-mission-intake-form.tsx` still renders a freeform `policySourceId` text field, while `apps/control-plane/src/modules/wiki/routes.ts` and `service.ts` already expose `GET /cfo-wiki/companies/:companyKey/sources` with bound-source role, include-in-compile posture, latest extract status, and latest snapshot version.

- Observation: the shipped F4C1 answer path already computes a richer bound-source summary than the operator surfaces currently show.
  Evidence: `apps/control-plane/src/modules/finance-discovery/policy-lookup.ts` already records bound source name, role, include-in-compile posture, latest extract status, and latest snapshot version inside the policy answer structured data, while `apps/web/components/discovery-answer-card.tsx`, `mission-card.tsx`, and `mission-list-card.tsx` still largely display only the raw `policySourceId`.

- Observation: several active docs still lagged the shipped F4C2 baseline after merge and continued to frame either the baseline or the next-thread guidance as if F4C2 were still future work.
  Evidence: `README.md`, `START_HERE.md`, `docs/ops/local-dev.md`, `docs/ops/source-ingest-and-cfo-wiki.md`, `evals/README.md`, and `docs/benchmarks/seeded-missions.md` each needed a narrow wording refresh even though this plan already recorded the landed F4C2 slice and later-only eval-hook boundary.

- Observation: invoking the packaged root smoke command from the control-plane eval runner includes `pnpm` banner lines before the smoke payload, so the new eval hook needed to parse the structured JSON document out of command stdout instead of assuming a raw JSON-only stream.
  Evidence: the first `pnpm eval:finance-discovery-quality` attempt failed on `Unexpected token '>'` until the runner extracted the smoke JSON payload from the packaged command output while still preserving the packaged smoke as the source of truth.

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

- Decision: keep `FP-0035` as the active F4 plan record after merge, but rewrite any stale post-acceptance wording so only `F4C2` remains as planned work.
  Rationale: the repo truth now includes shipped F4C1 acceptance, so the plan chain should no longer imply that unchecked F4C1 implementation still remains.

- Decision: implement F4C2 operator hardening by propagating one additive typed policy-source-scope summary through discovery answers, proof bundles, and mission list read models instead of inventing a second rendering contract.
  Rationale: the policy answer already owns the truthful bound-source evidence posture, and the narrowest safe hardening path is to reuse that deterministic summary across the operator surfaces.

- Decision: keep policy-source selection deterministic and route-backed through the existing company bound-source list, filtered to explicit `policy_document` bindings only.
  Rationale: this removes blind UUID entry without replacing the required `policySourceId` contract with fuzzy search or generic retrieval.

- Decision: package F4C2 quality proof as one deterministic smoke that specifically validates the six shipped discovery families, human-readable freshness labels, visible limitations, route/wiki evidence links, and source-scoped policy proof-bundle posture.
  Rationale: the current practical finance quality proof is the deterministic smoke ladder, not the older planner/executor/compiler eval naming.

- Decision: after the F4C2 merge, keep the active-doc chain explicitly aligned to the shipped F4A through F4C2 baseline and describe `FP-0035` as active only for a possible narrow eval-hook continuation before F5.
  Rationale: leaving README, START_HERE, local-dev guidance, benchmark framing, or eval staging one phase behind would misstate shipped product truth and could send the next thread back into already-completed F4C2 work.

- Decision: implement the eval-hook continuation as a finance-native JSON report path under `apps/control-plane/src/modules/evals/**` and `evals/results/finance-discovery-quality/` rather than forcing the deterministic smoke through planner/executor/compiler result files.
  Rationale: this keeps the packaged `finance-discovery-quality` smoke as the authoritative proof step, preserves honest provenance and assertion reporting, and avoids inventing fake candidate, grader, reference, or provider metadata when no model call occurred.

- Decision: execute the new eval hook by calling the packaged root `pnpm smoke:finance-discovery-quality:local -- --json` command and parsing its structured payload instead of duplicating the smoke implementation inside the eval layer.
  Rationale: the smoke script remains the source of truth for the shipped quality proof, while the eval layer stays a thin reporting wrapper that can capture git provenance and durable artifacts without drifting from the underlying deterministic assertions.

- Decision: after the QA pass, update roadmap language to describe the finance-native eval hook as shipped rather than as a possible future continuation.
  Rationale: with `pnpm eval:finance-discovery-quality` already landed, leaving roadmap wording one step behind would misstate current repo truth and blur the F4-to-F5 handoff.

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

5. Implement the narrow F4C2 hardening pass in:
   - `packages/domain/src/discovery-mission.ts`
   - `packages/domain/src/proof-bundle.ts`
   - `packages/domain/src/mission-detail.ts`
   - `packages/domain/src/mission-list.ts`
   - `packages/domain/src/index.ts`
   - `apps/control-plane/src/modules/finance-discovery/**`
   - `apps/control-plane/src/modules/missions/**`
   - `apps/control-plane/src/modules/evidence/**`
   - `apps/web/components/**`
   - `apps/web/lib/api.ts`
   - `package.json`
   - `tools/finance-discovery-quality-hardening-smoke.mjs`

   F4C2 should:
   - keep the six shipped discovery families exactly unchanged
   - preserve explicit `policySourceId` submission while replacing blind raw-UUID entry with a deterministic `policy_document` selector
   - surface an additive policy source-scope summary wherever a policy answer, mission summary, mission detail, or proof bundle already exists
   - add one packaged `pnpm smoke:finance-discovery-quality:local` alias without retargeting the broader eval framework
   - refresh only the tiny active-doc set made stale by the landed smoke alias or source-scope presentation changes

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

F4C2 implementation acceptance for this thread should run in this order:

4. Run the narrow targeted tests you add or widen for:
   - policy-source selector state and explicit `policy_document` filtering
   - additive policy source-scope rendering in discovery answer, mission detail, mission card, mission list, and proof-bundle summary surfaces
   - truthful policy proof-bundle summary propagation from stored answer metadata
   - deterministic quality-smoke behavior for the six shipped finance discovery families
   - structured smoke-summary behavior, finance-quality report generation behavior, no-fake-model-metadata behavior, command or alias behavior, and doc-facing summary formatting behavior for the finance-native eval hook

5. Run:
   - `pnpm --filter @pocket-cto/domain exec vitest run src/discovery-mission.spec.ts src/proof-bundle.spec.ts src/mission-detail.spec.ts src/mission-list.spec.ts`
   - `zsh -lc "cd apps/control-plane && pnpm exec vitest run src/modules/finance-discovery/**/*.spec.ts src/modules/missions/**/*.spec.ts src/modules/evidence/**/*.spec.ts src/app.spec.ts"`
   - `zsh -lc "cd apps/web && pnpm exec vitest run app/**/*.spec.ts* components/**/*.spec.ts* lib/api.spec.ts"`
   - `pnpm smoke:finance-discovery-answer:local`
   - `pnpm smoke:finance-discovery-supported-families:local`
   - `pnpm smoke:finance-policy-lookup:local`
   - `pnpm smoke:finance-discovery-quality:local`
   - `pnpm eval:finance-discovery-quality`

6. Run:
   - `pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/twin/workflow-sync.spec.ts src/modules/twin/test-suite-sync.spec.ts src/modules/twin/codeowners-discovery.spec.ts`

7. Run:
   - `pnpm lint`
   - `pnpm typecheck`
   - `pnpm test`
   - `pnpm ci:repro:current`

F4C2 acceptance is met only if all of the following are observable:

- `policy_lookup` mission submission still requires explicit `policySourceId`, but the operator can choose it from a deterministic `policy_document` source selector rather than blind raw UUID entry.
- discovery answer, mission detail, mission card, mission list, and proof-bundle presentation all show an additive source-scope summary more informative than the raw id alone whenever that scoped metadata is truly available.
- the packaged `pnpm smoke:finance-discovery-quality:local` proof covers the six shipped discovery families and specifically verifies human-readable freshness labels, visible limitations, route/wiki evidence links, explicit policy source scope, and truthful limited-answer behavior for unsupported policy extracts.
- the finance-native `pnpm eval:finance-discovery-quality` command reuses that deterministic smoke and writes a durable report with run label, timestamp, git provenance, covered families, per-case assertion status, a human-readable summary, and no fake model/provider metadata.
- no generic retrieval, runtime-codex, vector search, OCR, PageIndex, QMD, MinerU, deep-read dependency, new Finance Twin extractor, F5, or F6 behavior is introduced.

F4C2 implementation is now accepted on this branch after the required thread-level ladder ran green:

- targeted domain, control-plane, and web F4C2 hardening tests for policy source selector state, answer/mission/proof scope rendering, and deterministic smoke behavior
- `pnpm --filter @pocket-cto/domain exec vitest run src/discovery-mission.spec.ts src/proof-bundle.spec.ts src/mission-detail.spec.ts src/mission-list.spec.ts`
- `zsh -lc "cd apps/control-plane && pnpm exec vitest run src/modules/finance-discovery/**/*.spec.ts src/modules/missions/**/*.spec.ts src/modules/evidence/**/*.spec.ts src/app.spec.ts"`
- `zsh -lc "cd apps/web && pnpm exec vitest run app/**/*.spec.ts* components/**/*.spec.ts* lib/api.spec.ts"`
- `pnpm smoke:finance-discovery-answer:local`
- `pnpm smoke:finance-discovery-supported-families:local`
- `pnpm smoke:finance-policy-lookup:local`
- `pnpm smoke:finance-discovery-quality:local`
- `pnpm eval:finance-discovery-quality`
- `pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/twin/workflow-sync.spec.ts src/modules/twin/test-suite-sync.spec.ts src/modules/twin/codeowners-discovery.spec.ts`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm ci:repro:current`

## Idempotence and Recovery

F4C2 should stay additive and retry-safe. It should not mutate raw sources, rewrite stored document extracts, or silently rewrite wiki pages outside the normal compiler-owned path. If an implementation step fails, the safe retry path is to rerun the targeted tests plus the packaged discovery smokes, refresh the relevant stored wiki compile only when the source evidence actually changed, and preserve limited-answer posture rather than introducing a heuristic fallback. If the hardening contract proves broader than expected, revert only the touched domain, finance-discovery, mission, evidence, web, smoke, and tiny doc files from F4C2 rather than disturbing the shipped F4A through F4C2 baseline or the optional GitHub connector path.

## Artifacts and Notes

Expected future artifacts from F4C are:

- this active F4C Finance Plan kept current as implementation lands
- one stored `discovery_answer` artifact per `policy_lookup` mission
- one finance-ready proof bundle carrying source-scoped policy evidence posture
- one packaged `finance-discovery-quality-hardening` smoke proving the shipped six-family discovery baseline plus policy-source truthfulness
- one finance-native `eval:finance-discovery-quality` report artifact under `evals/results/finance-discovery-quality/` that captures the packaged smoke with git provenance and per-case quality assertions
- the smallest active-doc refresh needed if the F4C2 smoke alias, eval-hook command, or policy-source presentation changes visible behavior

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
- no runtime-codex dependency in F4C1 or F4C2

## Outcomes & Retrospective

This active plan now records the fully landed F4C closeout rather than only a future contract. The repo still ships exactly six finance discovery families, `policy_lookup` remains explicitly source-scoped, operator intake now chooses policy sources from deterministic `policy_document` bindings, mission-facing answer and proof surfaces carry a richer additive scope summary than a raw UUID alone, the packaged deterministic smoke still proves the shipped discovery-quality baseline, and finance-native `pnpm eval:finance-discovery-quality` now writes a durable eval-style report without fake model/provider metadata. The contract still requires explicit `policySourceId` scope and still locks policy answers to explicit `policy_document` bindings plus stored deterministic extracts only.

No new finance discovery families, generic policy chat, corpus-wide retrieval, runtime-codex answer generation, vector search, embeddings, OCR, PageIndex, QMD, MinerU, deep-read dependencies, new Finance Twin extractors, F5 reporting, or F6 monitoring behavior were added in this slice. F4A through F4C2 are now the shipped authoritative discovery baseline, and this plan now serves as the final F4 record rather than an active pre-F5 continuation.

Remaining work:

- none inside F4; start F5 memo-and-packet compiler planning next
