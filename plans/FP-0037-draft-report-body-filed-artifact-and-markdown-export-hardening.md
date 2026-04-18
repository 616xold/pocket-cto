# Define F5B draft report body, filed artifact, and markdown export hardening

## Purpose / Big Picture

This plan is the active F5 implementation contract produced by the docs-only F5B master-plan and active-doc refresh slice.
The target phase is `F5`, and the next execution slice is `F5B-draft-report-body-filed-artifact-and-markdown-export-hardening`.
The user-visible goal is narrow and concrete: after the landed F5A reporting mission persists one draft `finance_memo` plus one linked `evidence_appendix`, Pocket CFO should let an operator directly consume those stored draft bodies in mission detail, explicitly file selected draft artifacts back into the CFO Wiki through the existing filed-page seam, and understand markdown export posture through the existing CFO Wiki export seam.

This matters now because F5A already ships the reporting foundation: first-class `reporting` missions, `manual_reporting`, deterministic memo and appendix compilation from completed discovery work, stored `bodyMarkdown` on both report artifacts, and proof bundles that are already ready when both draft artifacts exist.
What remains underpowered is reuse.
The current operator reporting card mostly shows metadata, route and wiki references, linked evidence ids, and limitation summaries rather than the stored draft bodies themselves, and the reporting path is not yet wired into the existing CFO Wiki filed-page and markdown export seams.

GitHub connector work is explicitly out of scope.
This plan does not authorize packet specialization, release semantics, PDF export, slide export, runtime-codex drafting, new discovery families, raw-source mutation, or a rename from `modules/reporting/**` to `modules/reports/**`.

## Progress

- [x] 2026-04-18T21:09:53Z Audit the active docs, shipped F5A reporting surfaces, proof-bundle posture, wiki filed-page seam, markdown export seam, and operator mission detail views before choosing the narrowest truthful F5B scope.
- [x] 2026-04-18T21:09:53Z Create `plans/FP-0037-draft-report-body-filed-artifact-and-markdown-export-hardening.md` and refresh the smallest truthful active-doc chain so `FP-0036` remains the shipped F5A record while this file becomes the active F5B implementation contract.
- [x] 2026-04-18T21:23:00Z Run the preserved source-ingest through finance-memo confidence ladder plus repo-wide validation for this docs-and-plan handoff without starting F5B code.
- [ ] 2026-04-18T21:09:53Z Land the first F5B implementation slice: direct draft-body visibility, explicit filed artifact reuse, and markdown export posture from the existing CFO Wiki seams only.
- [ ] 2026-04-18T21:09:53Z Re-run the F5B validation ladder after code lands and keep proof readiness semantics unchanged even when filing or export has not happened yet.

## Surprises & Discoveries

- Observation: the landed F5A reporting artifacts already persist the exact draft content F5B needs to expose directly.
  Evidence: `packages/domain/src/reporting-mission.ts` already stores `bodyMarkdown` on both `FinanceMemoArtifactMetadata` and `EvidenceAppendixArtifactMetadata`, and `apps/control-plane/src/modules/reporting/formatter.ts` already compiles those bodies deterministically from stored discovery evidence.

- Observation: the current operator reporting detail mostly surfaces metadata and linked evidence rather than the stored draft bodies themselves.
  Evidence: `apps/web/components/reporting-output-card.tsx` currently renders report kind, source discovery linkage, related routes, related wiki pages, linked evidence, and limitations, but it does not render `financeMemo.bodyMarkdown` or `evidenceAppendix.bodyMarkdown`.

- Observation: the existing CFO Wiki seams are already wide enough for the first F5B filing and markdown export reuse path.
  Evidence: `apps/control-plane/src/modules/wiki/routes.ts` and `service.ts` already ship `POST /cfo-wiki/companies/:companyKey/filed-pages`, `GET /cfo-wiki/companies/:companyKey/filed-pages`, `POST /cfo-wiki/companies/:companyKey/export`, and `GET /cfo-wiki/companies/:companyKey/exports`, while `apps/control-plane/src/modules/wiki/filed-pages.ts` already preserves filed pages as durable `filed_artifact` pages with explicit manual provenance.

- Observation: proof readiness for reporting is already correctly separated from later publication or export work.
  Evidence: `packages/domain/src/proof-bundle.ts` and `apps/control-plane/src/modules/evidence/proof-bundle-assembly.ts` already treat reporting readiness as the presence of stored `finance_memo` plus `evidence_appendix`, and they do not require filed pages or export runs.

- Observation: the current wiki filed-page request is generic and deterministic, which means F5B can reuse it without inventing a second report-publication subsystem.
  Evidence: `packages/domain/src/cfo-wiki.ts` defines `CfoWikiCreateFiledPageRequestSchema` as `title`, `markdownBody`, `filedBy`, and `provenanceSummary`, which is enough for the reporting path to pass the stored report body through untouched and add deterministic filing provenance.

## Decision Log

- Decision: the first real F5B scope is `F5B-draft-report-body-filed-artifact-and-markdown-export-hardening`.
  Rationale: the repo needs one implementation-ready reporting reuse contract, not a broad “reporting polish” bucket and not a premature packet or release program.

- Decision: the exact F5B problem statement is that F5A already persists one draft `finance_memo` plus one linked `evidence_appendix`, but the operator still cannot consume and reuse those drafts as well as they should because body rendering is underpowered, durable wiki filing is unwired, and markdown export posture is not yet visible in the reporting path.
  Rationale: the right follow-on is reuse hardening, not another reporting-foundation slice.

- Decision: F5B must reuse the existing CFO Wiki filed-page and markdown export seams rather than inventing a second report-publication subsystem.
  Rationale: `POST /cfo-wiki/companies/:companyKey/filed-pages` and the company export routes already exist, already preserve provenance, and already fit the wiki-derived authority model.

- Decision: F5B should surface `finance_memo.bodyMarkdown` and `evidence_appendix.bodyMarkdown` directly in mission detail as read-only rendered content without adding an editor.
  Rationale: the bodies are already stored deterministically, and direct operator visibility is the narrowest truthful way to make those drafts reviewable outside metadata-only cards.

- Decision: filing should be an explicit operator action from reporting mission detail and not an automatic side effect of report compile.
  Rationale: F5A compile stays deterministic and read-only, while filing into the internal wiki is a deliberate follow-on action with its own provenance.

- Decision: the first F5B export posture should harden a markdown-first path only by reusing existing company-level CFO Wiki export runs and surfacing their linkage from reporting detail after filing; the first F5B slice should not add a report-specific export trigger.
  Rationale: this is the narrowest deterministic export reuse path that still makes filed report artifacts legible in the current markdown export system without implying PDF, slide, packet, or release workflows.

- Decision: proof readiness must remain driven by stored `finance_memo` plus `evidence_appendix`, while filed and export posture should appear as separate reporting-specific summaries or statuses.
  Rationale: already-ready F5A proof bundles must not become “not ready” just because filing or export has not happened yet.

- Decision: F5B remains deterministic and runtime-free; do not use runtime-codex for memo rendering, filing, or export in this slice.
  Rationale: the stored reporting artifacts and existing wiki routes are already sufficient for the first reuse-hardening pass.

- Decision: F5B still does not introduce report approval or release semantics.
  Rationale: filing a draft into the internal CFO Wiki is not external release, and this slice must not silently inherit Pocket CTO runtime-approval language for external communications.

- Decision: keep `modules/reporting/**` vocabulary intact and do not rename the bounded context to `modules/reports/**`.
  Rationale: the live repo already standardized on first-class `reporting` vocabulary in F5A.

- Decision: do not lead with DB schema changes, new report artifact kinds, or new reporting routes in the first F5B slice unless a concrete typed gap appears during implementation.
  Rationale: existing reporting artifact metadata plus existing CFO Wiki route seams should be exhausted first.

- Decision: the post-F5B slice map is `F5C-board-lender-diligence-packet-specialization-and-approval-release-hardening`.
  Rationale: packet specialization, approval posture, and external release semantics belong after the base memo, filing, and markdown export reuse path is stable.

## Context and Orientation

Pocket CFO has already shipped F4A through F4C2, with `plans/FP-0035-finance-policy-lookup-and-discovery-quality-hardening.md` as the shipped final F4 record.
Pocket CFO has also already shipped the first F5A reporting slice, with `plans/FP-0036-reporting-mission-foundation-and-first-finance-memo.md` now serving as the shipped F5A record.
That landed F5A path gives the repo first-class `reporting` missions, `manual_reporting`, one deterministic `POST /missions/reporting` path, one draft `finance_memo`, one linked `evidence_appendix`, and reporting proof bundles that remain grounded in completed discovery work and stored evidence only.

The current follow-on gap is narrow:

- `packages/domain/src/reporting-mission.ts` already exposes stored `bodyMarkdown`
- `apps/control-plane/src/modules/reporting/**` already compiles deterministic draft bodies
- `apps/web/components/reporting-output-card.tsx` still underexposes those bodies in operator detail
- `apps/control-plane/src/modules/wiki/**` already ships the filed-page and export routes F5B should reuse

The active-doc boundary for this handoff is:

- `README.md`
- `START_HERE.md`
- `PLANS.md`
- `plans/ROADMAP.md`
- `plans/FP-0036-reporting-mission-foundation-and-first-finance-memo.md`
- this active plan, `plans/FP-0037-draft-report-body-filed-artifact-and-markdown-export-hardening.md`
- `docs/ACTIVE_DOCS.md`
- `docs/ops/local-dev.md`
- `docs/ops/source-ingest-and-cfo-wiki.md`
- `docs/ops/codex-app-server.md`
- `docs/benchmarks/seeded-missions.md`
- `evals/README.md`

GitHub connector work is out of scope.
The internal `@pocket-cto/*` package scope remains unchanged.
This slice is docs-and-plan only; it does not add runtime code, routes, schema changes, migrations, package scripts, smoke commands, or implementation scaffolding.

The most relevant implementation seams for the next F5B code thread are:

- `packages/domain/src/reporting-mission.ts` and `packages/domain/src/index.ts` only if a tiny shared filed/export status helper or label is needed
- `apps/web/app/missions/[missionId]/page.tsx`
- `apps/web/app/missions/[missionId]/actions.ts`
- `apps/web/app/missions/[missionId]/mission-actions.tsx`
- `apps/web/app/missions/[missionId]/mission-action-forms.tsx`
- `apps/web/components/reporting-output-card.tsx`
- `apps/web/components/mission-card.tsx`
- `apps/web/components/mission-list-card.tsx` only if a tiny report-status label belongs there
- `apps/web/lib/api.ts`
- `apps/control-plane/src/modules/wiki/**` only through the existing filed-page and export routes

## Plan of Work

The first F5B code thread should start in the operator surface, not by reopening reporting compile.
F5A already produced the durable draft artifacts.
The first F5B move is therefore to expose those stored memo and appendix bodies directly in reporting mission detail so an operator can read what the system already persisted without leaving the mission UI or reverse-engineering metadata.

Once read-only body visibility exists, the next step is to add explicit operator filing that reuses the existing CFO Wiki filed-page seam.
The reporting path should pass the stored `bodyMarkdown` through untouched, use deterministic titles and provenance summaries that reference the reporting mission id, source discovery mission id, and artifact kind, and create filed wiki pages only when the operator chooses to do so.
The file action should stay additive and should not mutate the source reporting artifacts.

After filing is in place, the same reporting detail surface should expose separate filing and markdown export posture by reading the existing company filed-page list plus the existing company export-run list.
That posture should remain informational and separate from proof readiness.
The first F5B slice should not add a report editor, automatic filing during compile, a report-specific export trigger, packet specialization, release semantics, or runtime-codex involvement.

## Concrete Steps

1. Keep the reporting body contract anchored in the already-shipped artifact metadata.
   Start from:
   - `packages/domain/src/reporting-mission.ts`
   - `apps/control-plane/src/modules/reporting/formatter.ts`
   - `apps/control-plane/src/modules/reporting/artifact.ts`

   The first F5B thread should confirm that the existing `financeMemo` and `evidenceAppendix` view payloads already carry the stored bodies needed for direct rendering.
   Add a tiny shared helper in `packages/domain/src/reporting-mission.ts` and `packages/domain/src/index.ts` only if deterministic filed/export labels or detail-only status parsing would otherwise be duplicated in the web layer.
   Do not start with new DB schema or artifact-kind work.

2. Reuse the existing CFO Wiki filed-page seam for explicit report filing.
   Update:
   - `apps/web/lib/api.ts`
   - `apps/web/app/missions/[missionId]/actions.ts`
   - `apps/web/app/missions/[missionId]/mission-actions.tsx`
   - `apps/web/app/missions/[missionId]/mission-action-forms.tsx`

   The filing action should:
   - call the existing `POST /cfo-wiki/companies/:companyKey/filed-pages` route
   - file `financeMemo.bodyMarkdown` or `evidenceAppendix.bodyMarkdown` without rewriting the stored report body
   - use deterministic titles and provenance summaries that include the reporting mission id, source discovery mission id, and filed artifact kind
   - remain explicit operator work, not compile-time side effect

3. Render stored report bodies directly in mission detail and show separate publication posture.
   Update:
   - `apps/web/app/missions/[missionId]/page.tsx`
   - `apps/web/components/reporting-output-card.tsx`
   - `apps/web/components/mission-card.tsx`
   - `apps/web/components/mission-list-card.tsx` only if one tiny label helps without cluttering the list view

   The reporting detail view should:
   - render `financeMemo.bodyMarkdown` directly in a read-only section
   - render `evidenceAppendix.bodyMarkdown` directly in a read-only section
   - keep the existing metadata, linked evidence, related routes, related wiki pages, and limitations visible
   - show separate filing and export posture without implying proof incompleteness
   - avoid an editor, inline body mutation, or freeform report composition

4. Reuse the existing company export seam without adding a report-specific export trigger.
   Update:
   - `apps/web/lib/api.ts`
   - `apps/web/app/missions/[missionId]/page.tsx`
   - `apps/web/components/reporting-output-card.tsx`

   The first F5B export posture should:
   - call the existing `GET /cfo-wiki/companies/:companyKey/exports` route
   - show company-level markdown export linkage after filing
   - compare latest relevant filed-page timestamps against the latest company export run when a separate “exported after filing” summary is helpful
   - keep PDF, Marp, slide, packet, and external release output out of scope

5. Keep proof-bundle readiness semantics unchanged.
   Do not reinterpret `proofBundle.status === "ready"` for reporting missions.
   Ready should still mean the stored `finance_memo` plus `evidence_appendix` exist and were assembled through the existing deterministic reporting path.
   If a tiny label or summary needs to explain separate filed/export posture, keep it in the reporting detail layer rather than changing `evidenceCompleteness` or the meaning of `ready`.

6. Preserve explicit non-goals in code comments, UI copy, and tests where needed.
   F5B must not:
   - reopen F5A mission foundation work
   - add packet specialization
   - add release or approval semantics
   - add runtime-codex drafting
   - auto-file during report compile
   - add a report editor
   - add PDF, Marp, or slide export
   - rename `modules/reporting/**`

## Validation and Acceptance

The first F5B code thread should keep the current confidence ladder intact and add only narrow test coverage for the body-visibility and filed/export reuse path.

Targeted test batches:

- `pnpm --filter @pocket-cto/domain exec vitest run src/reporting-mission.spec.ts src/mission-detail.spec.ts src/mission-list.spec.ts`
- `zsh -lc "cd apps/web && pnpm exec vitest run app/missions/[missionId]/actions.spec.ts app/missions/[missionId]/action-feedback.spec.tsx components/**/*.spec.tsx lib/api.spec.ts"`

Preserved finance proof ladder:

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
- `pnpm smoke:finance-discovery-supported-families:local`
- `pnpm smoke:finance-policy-lookup:local`
- `pnpm smoke:finance-discovery-quality:local`
- `pnpm eval:finance-discovery-quality`
- `pnpm smoke:finance-memo:local`

Targeted twin regressions plus repo-wide validation:

- `pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/twin/workflow-sync.spec.ts src/modules/twin/test-suite-sync.spec.ts src/modules/twin/codeowners-discovery.spec.ts`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm ci:repro:current`

User-visible F5B acceptance should be:

- a reporting mission detail page renders the stored memo and appendix bodies directly, read-only, without adding an editor
- an operator can explicitly file the memo and appendix into the CFO Wiki through the existing filed-page seam
- filed pages preserve manual provenance and do not mutate the original reporting artifacts
- reporting detail shows filing posture and markdown export posture separately from proof readiness
- proof bundles that are already ready from F5A remain ready even when filing or export has not happened yet
- runtime-codex, packet specialization, PDF export, slide export, and release approval remain out of scope

## Idempotence and Recovery

F5B should stay additive and retry-safe.
Raw sources, completed discovery missions, stored reporting artifacts, and proof bundles remain immutable inputs.
Rendering the stored bodies in mission detail is read-only.

Filed pages are already additive.
Repeated filing attempts should create additional filed pages with unique keys via the existing `filed/<slug>` allocation logic rather than mutating or replacing the original report artifacts.
That makes retries safe and visible.

Company wiki export runs are also additive.
If an export run happens later through the existing company-level export flow, it should create another persisted export run rather than rewriting earlier ones.
If the filing or export posture UI fails, the underlying reporting mission must remain readable and proof-ready.

## Artifacts and Notes

This docs-and-plan slice now leaves:

- one active implementation record at `plans/FP-0037-draft-report-body-filed-artifact-and-markdown-export-hardening.md`
- refreshed active docs that point at the shipped F4 and F5A records plus this active F5B contract

The first F5B code thread is expected to leave:

- the existing `finance_memo` and `evidence_appendix` artifacts unchanged as the stored reporting source of truth
- read-only operator rendering of both stored report bodies
- zero, one, or two filed wiki pages created through the existing filed-page seam, depending on operator action
- separate filed/export summaries or links in reporting detail that do not change proof readiness semantics

No new environment variables are expected for the first F5B slice.
If a concrete implementation blocker later proves otherwise, document it in this plan and in the active docs before widening scope.

## Interfaces and Dependencies

`packages/domain` should stay pure and should only gain a tiny helper or detail-only status type if the web layer would otherwise duplicate deterministic filing or export labels.
`apps/web` should own read-only report-body rendering, operator filing actions, and company export linkage in the mission detail experience.
`apps/control-plane/src/modules/wiki/**` should stay the filing and export system of record for this slice; F5B should reuse those existing routes rather than adding a second publication path.
`apps/control-plane/src/modules/reporting/**` remains the source of deterministic memo and appendix structure, and its vocabulary should stay `reporting`, not `reports`.
`apps/control-plane/src/modules/evidence/**` should keep the existing proof-bundle contract stable for the first F5B slice.

F5B depends on these already-shipped surfaces:

- completed discovery missions
- stored `discovery_answer` artifacts
- stored `finance_memo` and `evidence_appendix` artifacts with `bodyMarkdown`
- reporting proof bundles
- company-level CFO Wiki filed-page routes and export routes

F5B does not depend on:

- GitHub connector work
- runtime-codex execution
- packet-specialized report kinds
- approval or release workflows
- PDF, Marp, or slide export
- new Finance Twin extractors

## Outcomes & Retrospective

This docs-and-plan slice creates the active F5B implementation contract and refreshes the active-doc chain so the next thread can start the first real F5B code slice cleanly.
No runtime code, routes, schema changes, migrations, package scripts, smoke commands, or implementation scaffolding were added here.

`plans/FP-0035-finance-policy-lookup-and-discovery-quality-hardening.md` remains the shipped final F4 record.
`plans/FP-0036-reporting-mission-foundation-and-first-finance-memo.md` remains the shipped F5A record.
This file is now the active F5B contract.

If a bigger issue than body visibility, explicit filing, or markdown export reuse appears during implementation, stop and report it rather than widening into F5C or F6 work.
