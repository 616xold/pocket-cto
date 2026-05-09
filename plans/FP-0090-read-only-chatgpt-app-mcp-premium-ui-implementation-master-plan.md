# FP-0090 - Premium Read-only ChatGPT App MCP UI Implementation Master Plan

## Purpose / Big Picture

Target phase: `V2J`.

Exact slice: `V2J-read-only-chatgpt-app-mcp-premium-ui-implementation-master-plan`.

Status: shipped docs-and-plan plus proof-gate compatibility slice, created 2026-05-09 and shipped through PR #250.

This Finance Plan defines the implementation boundary for the next future premium read-only ChatGPT App/MCP UI code slice. FP-0090 is not implementation. FP-0090 is docs-and-plan plus proof-gate compatibility. FP-0090 is a premium UI implementation master-plan only. It makes a later local/proof-only/read-only UI implementation safe to start, but it does not start that work.

FP-0090 does not authorize UI code yet. FP-0090 does not authorize Apps SDK iframe/UI code yet. FP-0090 does not authorize public app implementation. FP-0090 does not authorize public app submission. FP-0090 does not authorize remote MCP deployment. FP-0090 does not authorize OAuth implementation. FP-0090 does not authorize endpoint implementation.

This is not UI implementation. This is not public ChatGPT App implementation. This is not Apps SDK iframe/UI implementation. This is not remote MCP deployment. This is not OAuth. This is not app submission. This is not endpoint implementation. This is not OpenAI API/model integration. This is not deployment. This is not product runtime behavior.

FP-0090 creates no product code, no UI implementation, no route, no endpoint, no endpoint implementation, no remote MCP server, no Apps SDK iframe/UI, no OAuth, no app submission, no public app implementation, no schema, no migration, no package script, no smoke alias, no eval dataset, no fixture, no sample data, no public demo data, no public source pack, no source-pack mutation, no OpenAI API/model call, no hosted tool, no vector/file-search integration, no OCR, no PageIndex, no provider/certification/deployment work, no external communication, no source mutation, no finance writes, no generated product prose, no runtime-Codex finance output, and no autonomous action.

The user-visible purpose is to make the next app-facing step precise: a future UI implementation slice may add UI components only if it remains local/proof-only/read-only and does not add public app submission, remote MCP, endpoint, OAuth, OpenAI API/model calls, provider/certification/deployment, finance writes, source mutation, generated product prose, runtime-Codex finance output, or autonomous action. If the next future slice writes UI code, it is real UI work and must be described to the user that way before coding starts.

Authority model remains unchanged:

- raw sources remain authoritative for document claims
- the Finance Twin remains authoritative for structured finance facts
- the CFO Wiki remains compiled and derived
- EvidenceIndex remains the read-only source anchor, document map, evidence card, source coverage, freshness, and limitation layer
- V2C tools remain local/internal read-only evidence contracts
- V2D Evidence Atlas remains the shipped read-only local operator UI foundation
- V2E remains local/internal proof-only bounded orchestration
- V2F remains docs/proof-only benchmark/community contracts with no datasets or real finance data
- V2G remains local proof-only read-only ChatGPT App/MCP contracts, descriptors, and response envelopes
- FP-0088 remains the shipped premium UI/security readiness record
- FP-0089 remains the shipped premium UI design-system readiness record

GitHub connector product behavior is explicitly out of scope. Routine `git`, `gh`, push, and PR operations for this repository do not invoke GitHub Connector Guard.

Replay and evidence-bundle implications: this slice creates no mission state transition, ingest action, report action, approval, durable product runtime output, source mutation, Finance Twin write, CFO Wiki write, evidence bundle, provider job, certification record, delivery record, endpoint, UI, or app runtime behavior. The proof-gate bridge is repo validation posture only. No UI code was added.

Successor note: FP-0091 is the later local/proof-only/read-only component-only implementation slice. It does not change this FP-0090 record's historical no-UI scope.

## Progress

- [x] 2026-05-09T19:35:00Z - Invoked the requested Pocket CFO operator skills: Finance Plan Orchestrator, Modular Architecture Guard, Source Provenance Guard, CFO Wiki Maintainer, Evidence Bundle Auditor, F6 Monitoring Semantics Guard, Validation Ladder Composer, and Pocket CFO Handoff Auditor.
- [x] 2026-05-09T19:35:00Z - Confirmed GitHub Connector Guard is out of scope because GitHub connector product behavior is not part of this slice.
- [x] 2026-05-09T19:35:00Z - Ran preflight against fetched `origin/main` on branch `codex/v2j-read-only-chatgpt-app-mcp-premium-ui-implementation-master-plan-local-v1`; the repo started clean, `HEAD` matched `origin/main`, GitHub auth/repo access worked, PR #249 was merged, Docker Postgres/MinIO were available, FP-0089 existed, FP-0090 was absent, FP-0091 was absent, and required V2 proof tools existed.
- [x] 2026-05-09T19:35:00Z - Read the required active docs, shipped FP-0086 through FP-0089 records, package metadata, V2F/V2G domain contracts, and direct proof tooling before edits.
- [x] 2026-05-09T19:35:00Z - Ran baseline V2A/V2B/V2C/V2E/V2F/V2G proof gates before edits; all passed.
- [x] 2026-05-09T19:35:00Z - Confirmed baseline V2F/V2G gates still proved `fp0090Absent: true`, which is the expected pre-edit state this slice replaces with a stronger docs-only FP-0090 successor boundary and `fp0091Absent`.
- [x] 2026-05-09T19:35:00Z - Used official OpenAI and Apple web research only for app/UI/security/accessibility context and recorded the sources below.
- [x] 2026-05-09T19:35:00Z - Created this FP-0090 plan as the only allowed FP-0090 file.
- [x] 2026-05-09T19:51:00+01:00 - Updated the minimal V2F/V2G proof schemas, builders, tools, and focused specs so exactly this docs-only FP-0090 plan is accepted and FP-0091 remains rejected.
- [x] 2026-05-09T19:51:00+01:00 - Refreshed directly stale active docs, ROADMAP, and tiny FP-0089 shipped-state wording so FP-0089 is shipped and FP-0090 is active as docs-only implementation readiness.
- [x] 2026-05-09T19:51:00+01:00 - Ran focused proof validation and focused domain specs; seven direct proof gates passed and focused V2F/V2G domain specs passed.
- [x] 2026-05-09T19:51:00+01:00 - Ran strict same-branch QA over changed files; expected keyword hits are planning/proof-boundary language only, exactly one FP-0090 file exists, no FP-0091 exists, and no UI code was added.
- [x] 2026-05-09T19:56:27+01:00 - Ran final validation; `git diff --check`, seven direct proof gates, focused V2F/V2G domain specs, `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm ci:repro:current` passed. Closeout doc edit now requires the minimum post-closeout rerun before commit.

## Surprises & Discoveries

The expected proof-gate compatibility issue is present: V2F/V2G proof gates still prove FP-0090 absence after FP-0089 shipped. The correct fix is not to remove the boundary. The correct fix is to replace `fp0090Absent` with exact docs-only FP-0090 acceptance fields and a new `fp0091Absent` guard.

PR #249 is merged into `main`, so FP-0089 is shipped. Active docs still contain wording that treats FP-0089 as active, which this slice may refresh narrowly while keeping FP-0089 as the shipped premium UI design-system readiness record.

Official OpenAI Apps SDK guidance frames ChatGPT app UI as focused, conversational, native-feeling, and consistent with ChatGPT system patterns. FP-0090 uses that as implementation planning context only; it does not implement Apps SDK UI or import an Apps SDK design system.

Official OpenAI security/privacy, MCP, Developer Mode, and app submission docs reinforce that write tools, remote MCP servers, OAuth, public submission, iframes, app review, and action confirmation are distinct risk surfaces. FP-0090 keeps those future-only and only defines how a future local UI must display refusal, permitted action, forbidden action, privacy, and no-runtime boundaries.

Apple Human Interface Guidelines reinforce the future quality bar around accessibility, consistent color semantics, no status by color alone, keyboard/focus behavior, layout adaptability, typography legibility, and calm interaction design.

## Decision Log

Decision: FP-0090 is safe to create only as docs-and-plan plus proof-gate compatibility.
Rationale: PR #249 is merged, FP-0089 is shipped, active docs support FP-0089 as docs-only premium UI design-system readiness, required proof tools existed and passed before edits, no real finance data or public sample pack is required, and this plan can remain non-runtime.

Decision: FP-0090 does not authorize UI code yet.
Rationale: this slice defines the future UI implementation boundary, primary states, file boundaries, QA gates, and acceptance criteria only. This is not UI implementation. A later implementation Finance Plan must explicitly open component code.

Decision: a future implementation slice may add UI components only if it remains local/proof-only/read-only.
Rationale: the only near-term UI code path this plan prepares is a local component implementation over existing V2G descriptor/envelope-shaped examples. It must not alter app routes unless a later plan explicitly opens route work.

Decision: FP-0090 does not authorize Apps SDK iframe/UI code yet.
Rationale: Apps SDK iframe/UI implementation remains future-only because it creates platform-specific app-facing runtime concerns, CSP/resource questions, review implications, and public distribution pressure.

Decision: FP-0090 does not authorize public app implementation or public app submission.
Rationale: public app work requires hosted MCP/server posture, app management permissions, app metadata, privacy/security review, screenshots, test prompts, review workflow, and public distribution intent. Public ChatGPT App implementation remains future-only. Public app implementation remains future-only.

Decision: FP-0090 does not authorize remote MCP deployment, endpoint implementation, or OAuth implementation.
Rationale: those scopes add network exposure, authentication, authorization, token handling, operational security, audit logging, and public data disclosure risks. A later threat-model/security implementation plan must prove them before any endpoint exists.

Decision: future UI must be premium, calm, Apple/OpenAI-style, evidence-first, and polished before publication.
Rationale: the future UI should help a human see evidence, freshness, limitations, and refusal posture clearly. It must not feel like a generic dashboard, a raw text dump, or an advice-first finance assistant.

Decision: future UI must preserve all authority lanes.
Rationale: the UI may display raw-source, Finance Twin, CFO Wiki, EvidenceIndex, V2C, V2D, V2E, V2F, V2G, FP-0088, and FP-0089 posture, but it must not become a new source of finance truth.

Decision: proof gates must accept exactly one docs-only FP-0090 file.
Rationale: replacing `fp0090Absent` with `fp0090AbsentOrDocsOnlyBoundaryVerified`, `fp0091Absent`, `premiumUiImplementationPlanBoundaryVerified`, `noUiCodeFromFp0090`, `noAppsSdkIframeFromFp0090`, `noEndpointOauthSubmissionFromFp0090`, and `noPublicAppImplementationFromFp0090` keeps the gate stronger than simple absence.

Decision: no replay event is added.
Rationale: this slice changes planning records, active docs, and validation gates only. It does not change product runtime state, mission state, source state, reports, approvals, or evidence artifacts.

## Context and Orientation

Current shipped V2 foundation:

- FP-0080 shipped V2A EvidenceIndex and document-map foundation.
- FP-0081 shipped V2B document precision adapter foundation.
- FP-0082 shipped V2C local/internal read-only evidence-tool contracts.
- FP-0083 shipped OSS demo, self-host, security, privacy, and contribution baseline docs.
- FP-0084 shipped the read-only local Evidence Atlas UI foundation.
- FP-0085 shipped local/internal proof-only bounded LLM orchestration.
- FP-0086 shipped docs/proof-only benchmark/community manifest foundation with SafeDemoDataPolicy and no datasets.
- FP-0087 shipped local proof-only read-only ChatGPT App/MCP contracts, descriptors, response envelopes, exact allowlists, forbidden actions, refusal boundaries, privacy/no-runtime posture, deferred OAuth/submission/provider boundaries, and direct proof tools.
- FP-0088 shipped docs-only premium UI/security readiness and proof-gate compatibility, without implementing UI, endpoints, remote MCP, OAuth, app submission, OpenAI API/model calls, package scripts, datasets, fixtures, sample data, source packs, source mutation, finance writes, generated product prose, runtime-Codex finance output, or autonomous action.
- FP-0089 shipped docs-only premium UI design-system readiness and proof-gate compatibility, without implementing UI, Apps SDK iframe/UI, endpoints, remote MCP, OAuth, app submission, OpenAI API/model calls, package scripts, datasets, fixtures, sample data, source packs, source mutation, finance writes, generated product prose, runtime-Codex finance output, or autonomous action.

FP-0090 is the successor implementation master-plan slice after shipped FP-0089. It is still not a UI implementation track. It makes future component work harder to start accidentally by requiring screenshot review, accessibility acceptance criteria, evidence hierarchy acceptance, refusal-state checks, privacy/no-runtime checks, copy review, and responsive layout review before any app-facing code can merge.

Official web research used:

- OpenAI Apps SDK overview, `https://developers.openai.com/apps-sdk`: used to confirm Apps SDK is the current ChatGPT app framework and that build/deploy/submit are distinct tracks. No Apps SDK implementation was added.
- OpenAI Apps SDK UX principles, `https://developers.openai.com/apps-sdk/concepts/ux-principles`: used to frame future UI as focused, native-feeling, conversationally useful, and not a port of a broad website.
- OpenAI Apps SDK UI guidelines, `https://developers.openai.com/apps-sdk/concepts/ui-guidelines`: used to frame future display modes, native ChatGPT fit, system color/type/spacing discipline, and accessible component-system expectations. No UI code was implemented.
- OpenAI Apps SDK Security & Privacy, `https://developers.openai.com/apps-sdk/guides/security-privacy`: used to frame least privilege, explicit consent, prompt-injection defense, server-side validation, audit logs, data minimization, CSP, and write-action risk as future security/display requirements only.
- OpenAI ChatGPT Developer Mode, `https://developers.openai.com/api/docs/guides/developer-mode`: used to confirm that write actions carry destructive/data-sharing risk, that write actions require careful confirmation, and that `readOnlyHint` affects read-only detection. FP-0090 keeps write affordances impossible.
- OpenAI MCP servers for ChatGPT Apps and API integrations, `https://developers.openai.com/api/docs/mcp`: used to confirm remote MCP server, OAuth, and data-source context, which FP-0090 explicitly does not start.
- OpenAI Apps SDK submission guide, `https://developers.openai.com/apps-sdk/deploy/submission`: used to confirm public submission requires a public MCP server, CSP, app metadata, privacy policy URLs, screenshots, test prompts/responses, OAuth details if selected, and review flow. FP-0090 creates none of those artifacts.
- OpenAI Apps SDK app submission guidelines, `https://developers.openai.com/apps-sdk/app-submission-guidelines`: used to frame future public-readiness requirements around trust, privacy, minimal data collection, response minimization, iframe caution, predictable behavior, and auditability. FP-0090 remains pre-submission planning only.
- Apple Human Interface Guidelines Accessibility, `https://developer.apple.com/design/human-interface-guidelines/accessibility`: used to set future accessibility bars for keyboard navigation, simple interactions, cognitive clarity, perceivable status, and assistive-technology review.
- Apple Human Interface Guidelines Color, `https://developer.apple.com/design/human-interface-guidelines/color`: used to require semantic color discipline, light/dark/increased-contrast checks, sparing color use, no status by color alone, and visible focus indicators.
- Apple Human Interface Guidelines Layout, `https://developer.apple.com/design/human-interface-guidelines/layout`: used as current official layout context for future responsive app-container behavior, safe spacing, adaptive width behavior, and hierarchy discipline.
- Apple Human Interface Guidelines Typography, `https://developer.apple.com/design/human-interface-guidelines/typography`: used as current official typography context for future type scale, legibility, density, and hierarchy discipline.

## Plan of Work

Allowed files for this slice:

- `plans/FP-0090-read-only-chatgpt-app-mcp-premium-ui-implementation-master-plan.md`
- `plans/FP-0089-read-only-chatgpt-app-mcp-premium-ui-design-system-master-plan.md` only for tiny shipped-state wording polish if directly stale
- `tools/read-only-mcp-descriptor-response-envelope-proof.mjs`
- `tools/read-only-chatgpt-app-mcp-proof.mjs`
- `tools/benchmark-community-pack-proof.mjs`
- `packages/domain/src/read-only-app-mcp*.ts` only for proof-gate fields/helpers
- `packages/domain/src/benchmark-community*.ts` only for proof-gate fields/helpers
- focused specs for those proof gates
- directly stale active docs such as `README.md`, `CODEX_README.md`, `START_HERE.md`, `docs/ACTIVE_DOCS.md`, `docs/PROJECT_STATE.md`, `docs/V2_BOUNDARY.md`, `plans/ROADMAP.md`, and related active policy docs only if directly stale

Forbidden files and behavior:

- no product code
- no UI implementation
- no routes or endpoints
- no remote MCP server
- no Apps SDK iframe/UI
- no OAuth
- no app submission
- no public app implementation
- no schema or migrations
- no package scripts or smoke aliases
- no eval datasets, fixtures, sample data, public demo data, or source packs
- no source-pack fixture edits
- no FP-0091
- no provider integration, certification, OCR/vector/PageIndex/OpenAI file-search, iOS/OpenClaw, deployment, external communications, source mutation, finance writes, generated product prose, runtime-Codex finance output, or autonomous action

Future UI implementation boundary:

- future scope may include `apps/web/components/read-only-app-mcp/**` or another clearly named local UI component directory
- future UI implementation must not alter app routes unless a later plan explicitly opens route work
- future UI implementation must not add API routes, backend routes, DB schema, package scripts, fixture/sample data, public demo data, source packs, OpenAI API/model calls, or app submission artifacts
- future UI implementation must use in-memory or existing contract-shaped examples only inside tests; no fixtures
- future UI implementation must remain local/proof-only/read-only and must not create public app behavior

Future premium UI surfaces to define but not implement:

- `AppShell`
- `EvidenceAnswerPanel`
- `RefusalPanel`
- `EvidenceCardStack`
- `CitationRail`
- `SourceAnchorDrawer`
- `FreshnessBadge`
- `LimitationCallout`
- `PermittedNextActionsPanel`
- `ForbiddenActionsPanel`
- `PrivacyBoundaryPanel`
- `NoRuntimeBoundaryPanel`
- `PromptInjectionWarningState`
- `RawFullFileDumpRefusalState`
- `EmptyEvidenceState`
- `LoadingEvidenceState`
- `ErrorAndUnsupportedState`

Future UI acceptance requirements:

- screenshot review before merge for every future primary state
- accessibility acceptance criteria before merge for headings, landmarks, focus order, keyboard navigation, visible focus, semantic labels, and no status by color alone
- evidence hierarchy acceptance before merge for citation, source-anchor, freshness, limitation, permitted-next-action, forbidden-action, privacy, and no-runtime placement
- no action-looking controls for forbidden actions
- no raw text dump panels
- no advice-like CTAs
- no app-facing code merge without the criteria in this plan

Future evidence hierarchy:

1. answer or refusal status
2. evidence cards
3. citations and source anchors
4. freshness
5. limitations
6. permitted next actions
7. forbidden actions
8. privacy and no-runtime boundary

Future UI QA gates:

- screenshot or DOM snapshot review for all future primary states
- accessibility checks for headings, landmarks, focus order, keyboard navigation, visible focus, semantic labels, and no status by color alone
- evidence hierarchy checks for citation/source-anchor/freshness/limitation/permitted-next-action/forbidden-action placement
- refusal-state checks for missing citation, unsupported evidence, stale evidence, prompt injection, unsafe action, raw full-file dump, and data exfiltration
- privacy/no-runtime boundary checks
- copy review to avoid generated finance advice
- responsive layout review for narrow and wide ChatGPT app containers
- no app-facing code merge without those criteria

## Concrete Steps

1. Run preflight and baseline proof gates.
2. Confirm baseline proof gates prove FP-0090 absence and treat that as expected pre-edit state.
3. Use only official OpenAI and Apple sources for current platform/security/UI context.
4. Create this plan as the only FP-0090 file.
5. Replace V2F/V2G `fp0090Absent` proof fields with exact docs-only boundary proof fields:
   - `fp0090AbsentOrDocsOnlyBoundaryVerified`
   - `fp0091Absent`
   - `premiumUiImplementationPlanBoundaryVerified`
   - `noUiCodeFromFp0090`
   - `noAppsSdkIframeFromFp0090`
   - `noEndpointOauthSubmissionFromFp0090`
   - `noPublicAppImplementationFromFp0090`
6. Keep existing FP-0089 docs-only typed boundary fields intact:
   - `fp0089AbsentOrDocsOnlyBoundaryVerified`
   - `premiumUiDesignSystemPlanBoundaryVerified`
   - `noUiImplementationFromFp0089`
   - `noAppsSdkIframeFromFp0089`
   - `noEndpointOauthSubmissionFromFp0089`
7. Keep existing FP-0088 docs-only typed boundary fields intact:
   - `fp0088AbsentOrDocsOnlyBoundaryVerified`
   - `premiumUiSecurityPlanBoundaryVerified`
   - `noUiImplementationFromFp0088`
   - `noEndpointOauthSubmissionFromFp0088`
8. Update focused specs to require the new fields.
9. Refresh only directly stale active docs and FP-0089 shipped-state wording.
10. Run focused proof validation and strict same-branch QA.
11. Run final validation.
12. If validation is green, commit exactly once, push the requested branch, and open the requested PR.

## Validation and Acceptance

Baseline proof gates run before edits:

```bash
pnpm exec tsx tools/read-only-mcp-descriptor-response-envelope-proof.mjs
pnpm exec tsx tools/read-only-chatgpt-app-mcp-proof.mjs
pnpm exec tsx tools/benchmark-community-pack-proof.mjs
pnpm exec tsx tools/bounded-llm-orchestration-proof.mjs
pnpm exec tsx tools/read-only-evidence-app-proof.mjs
pnpm exec tsx tools/document-precision-foundation-proof.mjs
pnpm exec tsx tools/evidence-index-foundation-proof.mjs
```

Required focused validation after edits:

```bash
pnpm exec tsx tools/read-only-mcp-descriptor-response-envelope-proof.mjs
pnpm exec tsx tools/read-only-chatgpt-app-mcp-proof.mjs
pnpm exec tsx tools/benchmark-community-pack-proof.mjs
pnpm exec tsx tools/bounded-llm-orchestration-proof.mjs
pnpm exec tsx tools/read-only-evidence-app-proof.mjs
pnpm exec tsx tools/document-precision-foundation-proof.mjs
pnpm exec tsx tools/evidence-index-foundation-proof.mjs
pnpm --filter @pocket-cto/domain exec vitest run src/benchmark-community.spec.ts src/read-only-app-mcp.spec.ts src/read-only-app-mcp-descriptor.spec.ts
```

Strict same-branch QA:

- Search changed files for code/UI/routes/endpoints/schema/migrations/package scripts/eval datasets/fixtures/sample data/source packs/OpenAI API/model calls/OAuth/app submission/provider/deployment/source mutation/finance writes/autonomous action.
- Classify expected hits as planning or proof-boundary language only.
- Confirm exactly one FP-0090 file exists and it is `plans/FP-0090-read-only-chatgpt-app-mcp-premium-ui-implementation-master-plan.md`.
- Confirm no FP-0091 exists.
- Confirm no UI code was added.
- Confirm no Apps SDK iframe/UI, endpoint, OAuth, remote MCP, app submission, public app implementation, schema, migration, package script, data file, source pack, OpenAI API/model call, provider/certification/deployment, source mutation, finance write, generated product prose, runtime-Codex finance output, or autonomous action was added.
- Confirm existing FP-0089 docs-only typed boundary remains intact.
- Confirm existing FP-0088 docs-only typed boundary remains intact.
- Confirm existing FP-0087 typed boundary remains intact.
- Patch this same branch if QA finds a defect, then rerun focused validation.

Required final validation:

```bash
git diff --check
pnpm exec tsx tools/read-only-mcp-descriptor-response-envelope-proof.mjs
pnpm exec tsx tools/read-only-chatgpt-app-mcp-proof.mjs
pnpm exec tsx tools/benchmark-community-pack-proof.mjs
pnpm exec tsx tools/bounded-llm-orchestration-proof.mjs
pnpm exec tsx tools/read-only-evidence-app-proof.mjs
pnpm exec tsx tools/document-precision-foundation-proof.mjs
pnpm exec tsx tools/evidence-index-foundation-proof.mjs
pnpm --filter @pocket-cto/domain exec vitest run src/benchmark-community.spec.ts src/read-only-app-mcp.spec.ts src/read-only-app-mcp-descriptor.spec.ts
pnpm lint
pnpm typecheck
pnpm test
pnpm ci:repro:current
```

Acceptance evidence:

- `plans/FP-0090-read-only-chatgpt-app-mcp-premium-ui-implementation-master-plan.md` exists and is the only FP-0090 file.
- No FP-0091 exists.
- V2F/V2G proofs report the exact docs-only FP-0090 successor boundary instead of `fp0090Absent`.
- Existing FP-0089 docs-only typed boundary remains intact.
- Existing FP-0088 docs-only typed boundary remains intact.
- Existing FP-0087 typed boundary remains intact.
- Existing V2F/V2G proof flags remain intact.
- Public app implementation, public app submission, remote MCP deployment, Apps SDK iframe/UI, OAuth, endpoint implementation, OpenAI API/model calls, provider/certification/deployment, package scripts, datasets, fixtures, sample data, source packs, source mutation, finance writes, generated product prose, runtime-Codex finance output, and autonomous action remain absent.

## Idempotence and Recovery

Rerunning this slice should find this exact FP-0090 file and update it rather than creating another FP-0090 or FP-0091.

If proof gates fail because FP-0090 is present, patch only the proof-gate bridge so the exact docs-only plan is accepted. Do not widen into UI/runtime/app/OAuth/submission work.

If proof gates find multiple FP-0090 files, delete the duplicate only if it was created by this slice; otherwise stop and report the unrelated dirty or conflicting file.

If validation fails after a proof-gate correction, report the exact failing command and recommend the smallest safer corrective slice:

- proof-gate bridge correction
- FP-0089 proof-boundary correction
- FP-0088 proof-boundary correction
- V2G descriptor/envelope proof correction
- V2F benchmark proof-boundary correction
- hold FP-0090 until proof gates can accept a docs-only successor

Do not publish a partially green branch.

## Artifacts and Notes

This plan records current platform/security/design context from official docs, but repo truth remains the current code, shipped Finance Plans, active Pocket CFO docs, and local proof gates.

No raw sources, source snapshots, source checksums, Finance Twin facts, CFO Wiki pages, evidence bundles, mission answers, reports, approvals, or raw finance files are changed.

No real finance data, public sample pack, eval dataset, fixture, sample data, or source pack is required.

Planned future implementation definitions are implementation-boundary terms only. They are not component implementations, app routes, MCP descriptors, Apps SDK resources, OAuth scopes, submission assets, screenshots, listing copy, review prompts, public docs, or runtime behavior.

## Interfaces and Dependencies

Repo dependencies:

- shipped FP-0089 premium UI design-system readiness record
- shipped FP-0088 premium UI/security readiness record
- shipped FP-0087 local proof-only read-only app/MCP contracts and descriptor/envelope proof gates
- shipped FP-0086 benchmark/community proof gate
- shipped FP-0085, FP-0084, FP-0082, FP-0081, and FP-0080 direct proof spine
- active docs and roadmap state

External research dependencies used only for context:

- official OpenAI Apps SDK, UX principles, UI guidelines, MCP, Developer Mode, security/privacy, submission, and app-submission docs
- official Apple Human Interface Guidelines accessibility, color, layout, and typography docs

No environment variables are added.

No `WORKFLOW.md`, stack packs, skills, package scripts, smoke aliases, routes, endpoints, schema, migrations, or runtime interfaces are changed.

## Outcomes & Retrospective

Outcome: FP-0090 is a single active premium UI implementation master-plan and proof-gate compatibility bridge. It accepts exactly `plans/FP-0090-read-only-chatgpt-app-mcp-premium-ui-implementation-master-plan.md` as docs-and-plan only, keeps FP-0091 absent, and rejects any attempt to treat FP-0090 as UI/runtime/public app behavior.

Validation outcome before this closeout edit: `git diff --check`, seven direct proof gates, focused V2F/V2G domain specs, `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm ci:repro:current` passed.

Scope outcome must remain: no product code, UI, route, endpoint, remote MCP server, Apps SDK iframe/UI, OAuth, app submission, schema, migration, package script, smoke alias, eval dataset, fixture, sample data, source pack, OpenAI API/model call, vector/file-search, OCR, PageIndex, provider/certification/delivery/deployment, external communication, source mutation, finance write, generated product prose, runtime-Codex finance output, or autonomous action added.

Remaining work is intentionally future-plan-only: one narrow actual UI implementation Finance Plan before component code, a threat-model/security implementation plan before endpoint/remote MCP/OAuth work, and an app-submission plan before public submission.
