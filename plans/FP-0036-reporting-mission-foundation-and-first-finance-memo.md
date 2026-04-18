# Define F5A reporting mission foundation and first finance memo

## Purpose / Big Picture

This plan is the active F5 implementation contract produced by the docs-only F5 master-plan and active-doc refresh slice.
The target phase is `F5`, and the first execution slice is `F5A-reporting-mission-foundation-and-first-finance-memo`.
The user-visible goal is narrow and concrete: after a completed finance discovery mission, Pocket CFO should be able to create a first-class reporting mission that deterministically compiles one draft `finance_memo` plus one linked `evidence_appendix` from stored evidence that already exists in the repo.

This matters now because F4A through F4C2 already ship the right reporting inputs: typed finance discovery missions, durable `discovery_answer` artifacts, finance-ready proof bundles, route-backed freshness and limitations, source-scoped policy lookup, and stored CFO Wiki context.
What is still missing is the reporting foundation itself: a first-class reporting mission type, truthful report artifact taxonomy, a deterministic memo compiler bounded by stored evidence, and a draft-versus-release posture that does not silently reuse Pocket CTO runtime approval semantics.

GitHub connector work is explicitly out of scope.
This plan does not authorize F6 monitoring, packet specialization, PDF export, slide export, generic finance chat, runtime-codex authority, vector retrieval, OCR, PageIndex, QMD, MinerU, or raw-source mutation.

## Progress

- [x] 2026-04-18T15:57:53Z Audit the active docs, shipped F4 record, mission-domain contracts, proof-bundle shaping, approval semantics, runtime-codex posture, wiki filing seam, web mission surfaces, and DB enum constraints before choosing the first real F5 slice.
- [x] 2026-04-18T15:57:53Z Create `plans/FP-0036-reporting-mission-foundation-and-first-finance-memo.md` and refresh the smallest truthful active-doc set so `FP-0035` remains the shipped final F4 record while this file becomes the active F5 implementation contract.
- [x] 2026-04-18T16:08:11Z Re-run the preserved F4 confidence ladder for this docs-only handoff, including source-ingest, finance-twin, CFO Wiki, discovery quality, targeted twin regressions, repo-wide lint and typecheck and test, and `pnpm ci:repro:current`, without starting F5A code.
- [x] 2026-04-18T16:46:56Z Run a strict QA pass on this docs-only F5 handoff, confirm the branch and PR stay clean, and apply only one tiny wording correction so top-level docs describe `FP-0035` as the shipped final F4 record and mirror the narrow F5A, F5B, and F5C slice map.
- [x] 2026-04-18T17:23:49Z Apply a tiny post-merge portability polish so this active F5 contract removes absolute local filesystem links, stays repo-portable for a fresh contributor, and leaves the wider active-doc chain unchanged because it was already truthful.
- [x] 2026-04-18T17:28:39Z Re-run the required docs-only validation ladder after the portability polish and keep the result green across the preserved smoke and eval stack, the targeted twin regressions, `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm ci:repro:current`.
- [x] 2026-04-18T18:10:42Z Re-read the active docs, required repo skills, domain contracts, proof-bundle assembly, orchestrator phases, mission routes, DB enums, smoke patterns, and web mission surfaces on the clean F5A branch, then confirm the narrow landed shape before edits: first-class `reporting` plus `manual_reporting`, one scout-only deterministic `POST /missions/reporting` path, one draft `finance_memo`, one linked `evidence_appendix`, explicit source-discovery lineage in read models, and no runtime-codex or release semantics.
- [x] 2026-04-18T18:50:39Z Implement `F5A-reporting-mission-foundation-and-first-finance-memo` exactly as defined here, without widening into packets, release semantics, runtime drafting, or F6 work.
- [x] 2026-04-18T18:50:39Z Run the F5A implementation validation ladder after code lands, including the preserved F4 baseline confidence ladder plus the new narrow reporting proof.
- [x] 2026-04-18T18:57:15Z Run a strict post-landing QA pass on the F5A slice, fix only the stale doc handoff language that still described F5A as future work, and keep the same branch and PR posture while re-running the narrow reporting proofs plus the required discovery, eval, and twin guardrails.

## Surprises & Discoveries

- Observation: first-class reporting cannot be a domain-only rename because `mission_type`, `mission_source_kind`, and `artifact_kind` are backed by Postgres enums today.
  Evidence: `packages/domain/src/mission.ts`, `packages/db/src/schema/missions.ts`, and `packages/db/src/schema/artifacts.ts`.

- Observation: the current generic mission compiler is still an engineering-era stub that emits a `build` mission, so the first report path should not start from freeform text intake.
  Evidence: `apps/control-plane/src/modules/missions/compiler.ts`.

- Observation: the shipped discovery answer contract already preserves the exact evidence posture a first memo compiler should reuse, including company scope, question kind, freshness, limitations, related routes, related wiki pages, evidence sections, body markdown, and structured data.
  Evidence: `packages/domain/src/discovery-mission.ts` and `apps/control-plane/src/modules/finance-discovery/artifact.ts`.

- Observation: the proof-bundle layer is already finance-aware for discovery, but its expected artifact kinds still stop at `discovery_answer` for finance work and do not know about memo or appendix artifacts.
  Evidence: `packages/domain/src/proof-bundle.ts` and `apps/control-plane/src/modules/evidence/proof-bundle-assembly.ts`.

- Observation: the current approval bounded context models live Codex runtime approvals for file changes, commands, and network escalation, not report review or external communication release semantics.
  Evidence: `packages/domain/src/approval.ts`, `apps/control-plane/src/modules/approvals/README.md`, and `apps/control-plane/src/modules/approvals/service.ts`.

- Observation: the wiki already has a durable manual filing seam, but it is intentionally separate from compiler-owned pages and is not yet a report-specific filing or export contract.
  Evidence: `packages/domain/src/cfo-wiki.ts` and `apps/control-plane/src/modules/wiki/filed-pages.ts`.

- Observation: the mission UI already centers mission list and mission detail screens, so the narrowest coherent first reporting entry point is from an existing completed discovery mission detail or answer surface rather than from a second disconnected report tool.
  Evidence: `apps/web/app/missions/page.tsx`, `apps/web/app/missions/[missionId]/page.tsx`, `apps/web/components/discovery-answer-card.tsx`, and `apps/web/components/mission-card.tsx`.

- Observation: the current runtime-codex seam is already intentionally narrow and can stay fully out of the first F5A slice without blocking memo compilation.
  Evidence: `docs/ops/codex-app-server.md`, `apps/control-plane/src/modules/runtime-codex/service.ts`, and `apps/control-plane/src/modules/orchestrator/discovery-phase.ts`.

- Observation: the current evidence placeholder path, proof-bundle assembly, mission-detail reader, and mission-list summary all branch only between discovery and build behavior, so truthful F5A reporting cannot be represented by overloading the existing discovery answer slot or the build proof expectations.
  Evidence: `apps/control-plane/src/modules/evidence/service.ts`, `apps/control-plane/src/modules/evidence/proof-bundle-assembly.ts`, `apps/control-plane/src/modules/evidence/proof-bundle-summary.ts`, `apps/control-plane/src/modules/missions/detail-view.ts`, and `apps/control-plane/src/modules/missions/service.ts`.

- Observation: even after the first doc refresh, two top-level guidance points could still blur the F4-to-F5 handoff by calling `FP-0035` the shipped `F4C` record instead of the shipped final F4 record and by keeping one old broad F5 thread label in `START_HERE.md`.
  Evidence: `README.md` and `START_HERE.md`.

- Observation: the active F5 implementation contract still carried workstation-specific markdown links even though the surrounding active-doc chain was already phase-correct.
  Evidence: this file previously referenced absolute local filesystem paths throughout the Evidence, Context and Orientation, and Concrete Steps sections.

## Decision Log

- Decision: the first real F5 slice is `F5A-reporting-mission-foundation-and-first-finance-memo`.
  Rationale: the repo needs one narrow implementation-ready reporting contract, not a broad memo-plus-packet program.

- Decision: F5A introduces `reporting` as a first-class mission type now rather than hiding reporting inside `discovery` or `build`.
  Rationale: reporting has different artifact, draft/release, and operator-review posture than discovery, so leaving it implicit would keep the core product boundary muddy.

- Decision: the first F5A intake contract compiles only from an already-completed finance discovery mission and its stored evidence, with `sourceDiscoveryMissionId` as the anchor rather than generic chat text.
  Rationale: the shipped F4 baseline already persists the evidence we need, and the first report path should stay grounded in stored artifacts instead of inventing a new freeform intake surface.

- Decision: the first reporting mission should materialize a single deterministic `scout` task rather than new planner or executor behavior.
  Rationale: the first memo compiler is read-only, stored-state, and runtime-free, so discovery-style deterministic execution is the narrowest truthful task graph.

- Decision: the minimal first-class reporting artifact kinds are `finance_memo` and `evidence_appendix`.
  Rationale: F5A should ship one primary memo family and one explicit evidence companion without overloading engineering artifact kinds or pretending packets already exist.

- Decision: `board_packet`, `lender_update`, and `diligence_packet` stay reserved for later F5 specialization slices.
  Rationale: packet specialization changes audience, filing, approval, and export posture enough that it should not ride inside the first memo-foundation slice.

- Decision: the reporting compiler must reuse stored `discovery_answer`, stored proof-bundle data, related route paths, related wiki pages, freshness posture, and limitations from the source discovery mission.
  Rationale: the memo compiler is a derived artifact producer, not a new source of financial truth.

- Decision: F5A stays deterministic-only and does not call runtime-codex at all.
  Rationale: the narrowest truthful first report slice is evidence assembly and memo skeletoning from stored state; bounded runtime drafting or formatting can wait until a deterministic memo contract exists.

- Decision: F5A is draft-only and does not introduce release semantics or new report-approval kinds.
  Rationale: reporting clearly changes external communication posture, so the safest truthful first slice is to persist draft artifacts with explicit "no release workflow yet" status rather than silently inheriting file-change or command approvals.

- Decision: the first operator path for report creation is from a completed discovery mission detail or discovery-answer surface, and not from a disconnected report tool.
  Rationale: the product stays mission-based when reporting grows directly out of stored discovery work.

- Decision: F5A produces durable report artifacts only and does not file them back into the wiki or export PDF or slides.
  Rationale: durable artifact generation is the narrowest slice; wiki filing, appendix export hardening, PDF, and slide output can be layered later without conflating contracts.

- Decision: F5A will likely require additive enum migrations for `mission_type`, `mission_source_kind`, and `artifact_kind`, but it should avoid approval-enum, replay-event-enum, or task-role-enum changes unless a concrete implementation blocker appears.
  Rationale: first-class reporting must be truthful in persisted state, but the narrowest path is to reuse existing replay and scout-task mechanics.

- Decision: F5A reporting creation should reject missing, non-discovery, failed, or legacy engineering discovery sources, but it should allow source proof-bundle gaps when a finance `discovery_answer` exists and carry those gaps forward explicitly into the memo and appendix limitations.
  Rationale: the stored finance discovery answer is the minimum truthful reporting substrate, while proof-bundle incompleteness is important evidence posture rather than automatic grounds to fabricate or block if the memo can still remain explicit about the gap.

- Decision: the reporting read-model contract should add first-class reporting fields and a dedicated reporting artifact view instead of forcing mission detail or mission list surfaces to infer memo state from generic artifact summaries.
  Rationale: F5A needs explicit operator-visible source-discovery lineage, memo summary, draft posture, and appendix presence without re-parsing ad hoc artifact text in the web layer.

- Decision: the post-F5A slice map is `F5B-evidence-appendix-filed-artifact-and-export-hardening` followed by `F5C-board-lender-diligence-packet-specialization-and-approval-release-hardening`.
  Rationale: this sequence keeps memo foundation first, filing/export second, and audience-specific packet plus approval semantics last.

- Decision: top-level docs should describe `FP-0035` as the shipped final F4 record and should mirror the narrow F5A, F5B, and F5C thread map rather than leaving behind a broad legacy F5 thread label.
  Rationale: the active-doc chain should point the next contributor at one exact F5A implementation start and preserve the truthful phase boundary between shipped F4 work and planned later F5 specialization.

- Decision: normalize all intra-repo references in this active F5 contract to repo-portable paths and keep the rest of the active-doc chain untouched unless a real truthfulness gap appears.
  Rationale: the only remaining post-merge issue was plan portability, not broader phase wording or scope drift.

## Context and Orientation

Pocket CFO has already shipped F4A through F4C2 and now truthfully supports exactly six finance discovery families:

- `cash_posture`
- `collections_pressure`
- `payables_pressure`
- `spend_posture`
- `obligation_calendar_review`
- `policy_lookup`

Those discovery missions already persist durable `discovery_answer` artifacts and finance-ready proof bundles with freshness posture, limitations, route links, wiki links, and policy source scope where relevant.
The CFO Wiki already exposes bound-source lists, current pages, filed markdown artifacts, exports, and compile history.
What the repo still does not have is any real reporting foundation: `packages/domain/src/mission.ts` stops at `discovery`, `apps/control-plane/src/modules/missions/compiler.ts` is a `build` stub, proof bundles do not know about memo or appendix artifacts, approvals are runtime-execution-only, and the mission UI has no report-creation path.

The active-doc boundary for this handoff is:

- `README.md`
- `START_HERE.md`
- `PLANS.md`
- `plans/ROADMAP.md`
- `plans/FP-0035-finance-policy-lookup-and-discovery-quality-hardening.md`
- this active plan, `plans/FP-0036-reporting-mission-foundation-and-first-finance-memo.md`
- `docs/ACTIVE_DOCS.md`
- `docs/ops/local-dev.md`
- `docs/ops/source-ingest-and-cfo-wiki.md`
- `docs/ops/codex-app-server.md`
- `docs/benchmarks/seeded-missions.md`
- `evals/README.md`

GitHub connector work is out of scope.
The internal `@pocket-cto/*` package scope remains unchanged.
This thread now includes the landed F5A implementation plus a narrow post-landing QA pass.
The next thread should start the narrow F5B follow-on, not reopen F4C2, repeat F5A foundation work, or widen into F6.

The relevant implementation seams for the landed F5A code are:

- `packages/domain/src/mission.ts`, `packages/domain/src/proof-bundle.ts`, `packages/domain/src/mission-detail.ts`, `packages/domain/src/mission-list.ts`, and a new `packages/domain/src/reporting-mission.ts`
- `packages/db/src/schema/missions.ts` and `packages/db/src/schema/artifacts.ts` plus one additive migration
- `apps/control-plane/src/modules/missions/**`
- `apps/control-plane/src/modules/evidence/**`
- `apps/control-plane/src/modules/orchestrator/**`
- a new `apps/control-plane/src/modules/reporting/**` bounded context
- `apps/control-plane/src/modules/wiki/**` for read-only evidence reuse only
- `apps/control-plane/src/modules/runtime-codex/**` only as an explicit non-goal for F5A
- `apps/web/app/missions/**`, `apps/web/components/mission-card.tsx`, `apps/web/components/discovery-answer-card.tsx`, `apps/web/components/mission-list-card.tsx`, `apps/web/components/approval-card-list.tsx`, and `apps/web/lib/api.ts`

## Plan of Work

F5A should start by making reporting a truthful first-class mission category rather than a memo-flavored footnote on discovery.
The pure domain and DB contracts should add a reporting mission input shape that points to one completed discovery mission, one report kind, and one draft posture, while preserving the current mission, artifact, replay, and proof-bundle spine.
Because mission type, source kind, and artifact kind are all persisted enums, the first code thread should treat those schema updates as additive and minimal.

Once the contracts exist, the control plane should add a new `modules/reporting/**` bounded context that deterministically assembles a draft memo and evidence appendix from stored discovery outputs.
That module should read the source discovery mission, its `discovery_answer`, its proof bundle, and the related wiki and route context already stored in those artifacts.
It should not read raw chat, call runtime-codex, recompile the wiki, or invent new finance facts.

After the reporting module exists, the mission engine should expose a typed reporting creation path that starts from a completed discovery mission detail.
The first operator action should create a reporting mission, queue one scout task, persist two report artifacts, refresh the proof bundle, and present a draft report posture back through the existing mission list and mission detail screens.
The UI should stay mission-based and must surface at least these first-class report fields: summary, memo type, freshness, limitations, linked evidence, appendix posture, and draft status.

F5A should explicitly leave wiki filing, packet specialization, export formats, external release semantics, and bounded runtime drafting for later slices.
It should land one strong memo path, not three half-built output surfaces.

## Concrete Steps

1. Widen the pure domain and DB contracts.
   Update:
   - `packages/domain/src/mission.ts`
   - `packages/domain/src/proof-bundle.ts`
   - `packages/domain/src/mission-detail.ts`
   - `packages/domain/src/mission-list.ts`
   - `packages/domain/src/reporting-mission.ts`
   - `packages/domain/src/index.ts`
   - `packages/db/src/schema/missions.ts`
   - `packages/db/src/schema/artifacts.ts`
   - one additive drizzle migration under `packages/db/drizzle/`

   F5A should add:
   - `mission.type = "reporting"`
   - a truthful reporting source kind such as `manual_reporting`
   - a reporting input contract anchored by `sourceDiscoveryMissionId`
   - report artifact kinds `finance_memo` and `evidence_appendix`
   - proof-bundle fields for report summary, source discovery lineage, appendix posture, and draft status

2. Create a dedicated reporting bounded context instead of extending the mission compiler stub.
   Add a new `apps/control-plane/src/modules/reporting/` folder with small files such as:
   - `service.ts`
   - `artifact.ts`
   - `formatter.ts`
   - `types.ts`
   - `schema.ts` only if the control-plane route layer needs a local typed helper

   The reporting service should:
   - load one completed source discovery mission
   - require a stored `discovery_answer`
   - require or truthfully limit on source proof-bundle state
   - compile one deterministic memo skeleton
   - compile one deterministic appendix artifact
   - preserve freshness, limitations, related routes, related wiki pages, and source mission lineage explicitly
   - mark the result as draft-only

3. Integrate reporting into the mission engine with minimal new seams.
   Update:
   - add `apps/control-plane/src/modules/missions/reporting.ts`
   - `apps/control-plane/src/modules/missions/service.ts`
   - `apps/control-plane/src/modules/missions/routes.ts`
   - `apps/control-plane/src/modules/missions/schema.ts`
   - `apps/control-plane/src/modules/orchestrator/task-state-machine.ts`
   - add `apps/control-plane/src/modules/orchestrator/reporting-phase.ts`
   - `apps/control-plane/src/modules/orchestrator/service.ts`
   - `apps/control-plane/src/bootstrap.ts`

   F5A should:
   - create reporting missions through a typed route, not through `compileFromText`
   - queue one `scout` task for reporting
   - reuse existing replay event families such as `mission.created`, `task.status_changed`, `artifact.created`, and `proof_bundle.refreshed`
   - keep runtime-codex and live-approval plumbing out of the first reporting path

4. Extend evidence assembly and mission read models for reporting artifacts.
   Update:
   - add `apps/control-plane/src/modules/evidence/finance-memo.ts`
   - add `apps/control-plane/src/modules/evidence/evidence-appendix.ts`
   - `apps/control-plane/src/modules/evidence/proof-bundle-assembly.ts`
   - `apps/control-plane/src/modules/evidence/proof-bundle-summary.ts`
   - `apps/control-plane/src/modules/missions/detail-view.ts`
   - `apps/control-plane/src/modules/missions/discovery-answer-view.ts` only if a parallel report-artifact reader is needed

   F5A proof bundles should consider a reporting mission ready only when both `finance_memo` and `evidence_appendix` are present and linked back to the source discovery mission.

5. Add the narrowest mission-based operator path for report creation and review.
   Update:
   - `apps/web/app/missions/[missionId]/page.tsx`
   - `apps/web/app/missions/[missionId]/mission-actions.tsx`
   - `apps/web/components/discovery-answer-card.tsx`
   - `apps/web/components/mission-card.tsx`
   - `apps/web/components/mission-list-card.tsx`
   - `apps/web/components/approval-card-list.tsx` only if wording needs a draft-only reporting clarification
   - `apps/web/lib/api.ts`

   The first report surfaces must show:
   - memo summary
   - memo type `finance_memo`
   - freshness
   - limitations
   - linked evidence
   - appendix presence or absence
   - draft-only status with no release workflow yet

6. Keep explicit non-goals encoded in code comments, plan notes, and UI copy where needed.
   F5A must not:
   - add generic report chat intake
   - add board, lender, or diligence packet specialization
   - file reports into the wiki automatically
   - add PDF, slide, or Marp export
   - add runtime-codex drafting
   - add release semantics or reuse file-change approvals as report approvals

## Validation and Acceptance

The landed F5A implementation ladder ran in this order:

1. Run targeted tests for the new reporting contracts and bounded contexts:
   - `pnpm --filter @pocket-cto/domain exec vitest run src/reporting-mission.spec.ts src/mission.spec.ts src/proof-bundle.spec.ts src/mission-detail.spec.ts src/mission-list.spec.ts`
   - `zsh -lc "cd apps/control-plane && pnpm exec vitest run src/modules/reporting/**/*.spec.ts src/modules/missions/**/*.spec.ts src/modules/evidence/**/*.spec.ts src/modules/orchestrator/**/*.spec.ts src/app.spec.ts"`
   - `zsh -lc "cd apps/web && pnpm exec vitest run app/**/*.spec.ts* components/**/*.spec.ts* lib/api.spec.ts"`

2. Run one new narrow local proof for the reporting slice:
   - `pnpm smoke:finance-memo:local`

3. Re-run the shipped F4 confidence ladder that matters for this slice so the discovery baseline stays green:
   - `pnpm smoke:finance-discovery-answer:local`
   - `pnpm smoke:finance-discovery-supported-families:local`
   - `pnpm smoke:finance-policy-lookup:local`
   - `pnpm smoke:finance-discovery-quality:local`
   - `pnpm eval:finance-discovery-quality`

4. Run the preserved twin regression batch plus repo-wide validation:
   - `pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/twin/workflow-sync.spec.ts src/modules/twin/test-suite-sync.spec.ts src/modules/twin/codeowners-discovery.spec.ts`
   - `pnpm lint`
   - `pnpm typecheck`
   - `pnpm test`
   - `pnpm ci:repro:current`

User-visible F5A acceptance should be:

- an operator can create a reporting mission from a completed discovery mission rather than from generic chat text
- the reporting mission produces one draft `finance_memo` artifact and one linked `evidence_appendix`
- the memo stays grounded in the source discovery answer, proof bundle, related routes, and related wiki pages
- freshness, limitations, and source evidence remain explicit in the memo, appendix, mission detail, mission list, and proof bundle
- the UI clearly shows draft-only posture and does not imply a release or send workflow exists yet
- no runtime-codex thread, packet export, wiki filing, or external approval flow is required for F5A success

## Idempotence and Recovery

F5A should be additive and retry-safe.
Raw sources, source snapshots, stored discovery answers, and source discovery proof bundles remain immutable inputs.
If a reporting mission fails, the operator should be able to create a new reporting mission against the same source discovery mission without mutating the source discovery artifacts in place.

Schema changes should be additive only.
If enum-expansion migrations partially land, rerun the same migration forward rather than attempting destructive enum rollback.
If the code path must be disabled after deployment, prefer removing the report-create route or UI action in a follow-up change while leaving already-persisted reporting rows and artifacts readable.
Do not delete source discovery artifacts or raw-source evidence as part of recovery.

## Artifacts and Notes

This landed F5A slice now leaves:

- one shipped F5A record at `plans/FP-0036-reporting-mission-foundation-and-first-finance-memo.md`
- one follow-on active implementation record at `plans/FP-0037-draft-report-body-filed-artifact-and-markdown-export-hardening.md`
- refreshed active docs that point at the shipped F4 record, the landed F5A memo foundation, and the narrow F5B next step

The landed F5A implementation now provides:

- one `finance_memo` artifact, preferably persisted as durable markdown plus structured metadata
- one `evidence_appendix` artifact, preferably persisted as durable markdown plus structured metadata
- one refreshed proof-bundle manifest that links both artifacts back to the source discovery mission
- replay evidence sufficient to reconstruct mission creation, task execution, artifact persistence, and proof-bundle refresh
- one narrow local smoke proof that compiles a memo from a completed discovery mission

No new environment variables are expected for F5A.
If an implementation detail later proves otherwise, the next code thread must document it in this plan and in the active docs.

## Interfaces and Dependencies

`packages/domain` stays pure and should own the reporting mission schemas, report artifact metadata, proof-bundle contract, and mission read-model types.
`packages/db` should handle only the additive enum and schema persistence changes required for truthful first-class reporting.
`apps/control-plane/src/modules/reporting/**` should own deterministic report assembly and formatting.
`apps/control-plane/src/modules/missions/**` should stay thin and handle typed mission creation plus read-model integration.
`apps/control-plane/src/modules/evidence/**` should own artifact shaping and proof-bundle assembly.
`apps/web` should stay on operator read models only and must not reach into DB code.

F5A depends on these already-shipped surfaces:

- completed finance discovery missions
- stored `discovery_answer` artifacts
- finance-ready proof bundles
- related route paths and wiki page keys already persisted by F4
- the current mission list and mission detail operator surfaces

F5A does not depend on:

- GitHub connector work
- runtime-codex execution
- wiki recompilation during report compile
- new finance twin extractors
- packet exports
- release approvals

## Outcomes & Retrospective

This thread now records the landed first F5A reporting slice rather than only a docs handoff.
The branch added first-class reporting mission and artifact taxonomy, one typed `POST /missions/reporting` creation path from completed discovery work, one deterministic reporting bounded context, explicit mission-detail and mission-list reporting read models, one packaged `pnpm smoke:finance-memo:local` proof, and the minimum additive docs refresh required to keep the active-doc chain truthful.
The preserved F4 baseline validation ladder stayed green after the implementation landed, including the targeted domain, control-plane, and web reporting batches, the required discovery smokes, `pnpm eval:finance-discovery-quality`, the targeted twin regression batch, `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm ci:repro:current`.
The follow-on QA pass kept scope narrow, confirmed the branch and PR state, corrected only the stale post-landing doc language in this plan and the top-level handoff docs, and re-ran the narrow reporting proofs plus the required discovery, eval, and twin guardrails.

`plans/FP-0035-finance-policy-lookup-and-discovery-quality-hardening.md` remains the shipped final F4 record.
This file is now the shipped F5A record, and `plans/FP-0037-draft-report-body-filed-artifact-and-markdown-export-hardening.md` is the active F5B implementation contract.
The next remaining work is to start the narrow F5B follow-on exactly where F5A intentionally stopped:

- direct draft report-body visibility plus filed-artifact and markdown export hardening for the existing memo and appendix path
- no reopening of F5A mission foundation work
- no packet specialization yet
- no release semantics yet
