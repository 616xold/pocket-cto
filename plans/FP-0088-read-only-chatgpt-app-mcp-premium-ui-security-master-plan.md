# FP-0088 - Premium Read-only ChatGPT App MCP UI and Security Readiness Master Plan

## Purpose / Big Picture

Target phase: `V2H`.

Exact slice: `V2H-read-only-chatgpt-app-mcp-premium-ui-security-master-plan`.

Status: shipped docs-and-plan plus proof-gate compatibility slice, created 2026-05-09 and merged through PR #248.

This Finance Plan defines the premium read-only ChatGPT App/MCP UI and app/MCP security readiness bar that must be satisfied before any future public app implementation, Apps SDK iframe/UI implementation, remote MCP deployment, OAuth, app submission, endpoint implementation, OpenAI API/model integration, or deployment work can start.

FP-0088 is not implementation. It is a master-plan and boundary-hardening record only. It creates no product code, UI, routes, endpoints, remote MCP server, Apps SDK iframe, OAuth flow, app submission, schema, migration, package script, smoke alias, eval dataset, fixture, sample data, public demo data, source pack, OpenAI API/model call, provider/certification/deployment work, external communication, source mutation, finance write, generated product prose, runtime-Codex finance output, or autonomous action.

Do not implement UI in this slice.

Boundary shorthand for proof gates: no OpenAI API/model call, no source mutation, no finance writes, and no autonomous action.

The user-visible purpose is to make the next app-facing step safer before any app-facing code exists: define what a premium evidence-first ChatGPT App/MCP experience must look like, define the security questions that future endpoint/OAuth/submission work must answer, and repair the existing V2F/V2G proof gates so they accept exactly this docs-only FP-0088 successor while still rejecting FP-0089 and all runtime or public-app scope.

Authority model remains unchanged:

- raw sources remain authoritative for document claims
- the Finance Twin remains authoritative for structured finance facts
- the CFO Wiki remains compiled and derived
- EvidenceIndex remains the read-only source anchor, document map, evidence card, source coverage, freshness, and limitation layer
- V2C evidence tools remain local/internal read-only contracts
- V2D Evidence Atlas remains a read-only local operator UI foundation
- V2E remains local/internal proof-only bounded orchestration
- V2F remains docs/proof-only benchmark/community manifest posture with no datasets or real finance data
- V2G remains local proof-only read-only ChatGPT App/MCP contracts, descriptors, and response envelopes

GitHub connector product behavior is explicitly out of scope. Routine `git`, `gh`, push, and PR operations for this repository do not invoke GitHub Connector Guard.

Replay and evidence-bundle implications: this slice creates no mission state transition, ingest action, report action, approval, durable product output, source mutation, Finance Twin write, CFO Wiki write, evidence bundle, provider job, certification record, delivery record, or product runtime behavior. The proof-gate bridge is repo validation posture only.

## Progress

- [x] 2026-05-09T16:45:00Z - Invoked the requested Pocket CFO operator skills: Finance Plan Orchestrator, Modular Architecture Guard, Source Provenance Guard, CFO Wiki Maintainer, Evidence Bundle Auditor, F6 Monitoring Semantics Guard, Validation Ladder Composer, and Pocket CFO Handoff Auditor.
- [x] 2026-05-09T16:45:00Z - Confirmed GitHub Connector Guard is out of scope because GitHub connector product behavior is not part of this slice.
- [x] 2026-05-09T16:45:00Z - Ran preflight against fetched `origin/main` on branch `codex/v2h-read-only-chatgpt-app-mcp-premium-ui-security-master-plan-local-v2`; the repo started clean, `HEAD` matched `origin/main`, GitHub auth/repo access worked, PR #246 and PR #247 were merged, Docker Postgres/MinIO were available, FP-0087 existed, FP-0088 was absent, FP-0089 was absent, and required V2 proof tools existed.
- [x] 2026-05-09T16:45:00Z - Ran baseline V2A/V2B/V2C/V2E/V2F/V2G proof gates before edits; all passed.
- [x] 2026-05-09T16:45:00Z - Confirmed baseline V2F/V2G gates still proved `fp0088Absent: true`, which is the expected pre-edit state this slice must replace with a stronger docs-only successor boundary.
- [x] 2026-05-09T16:45:00Z - Used official OpenAI and Apple web research only for app/UI/security context and recorded the sources below.
- [x] 2026-05-09T18:08:00Z - Created this FP-0088 plan as the only allowed FP-0088 file.
- [x] 2026-05-09T18:08:00Z - Updated the minimal V2F/V2G proof schemas, tools, and focused specs so exactly this docs-only plan is accepted and FP-0089 remains rejected.
- [x] 2026-05-09T18:08:00Z - Refreshed only directly stale active docs: root orientation docs, active docs, project state, V2 boundary, and roadmap.
- [x] 2026-05-09T18:09:00Z - Ran focused proof validation and focused domain specs; all required V2A/V2B/V2C/V2E/V2F/V2G proof gates and the three focused domain spec files passed.
- [x] 2026-05-09T18:10:00Z - Ran strict same-branch QA over changed paths. Forbidden-scope hits were boundary/proof language only; no FP-0089, app/runtime route, endpoint, UI implementation, DB/migration, package script, dataset, fixture, sample data, source pack, provider/deployment, source mutation, finance write, or autonomous-action file path was added.
- [x] 2026-05-09T18:16:00Z - Ran final validation through `git diff --check`, all required V2 proof gates, focused domain specs, `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm ci:repro:current`; all passed before final closeout.
- [x] 2026-05-09T18:20:00Z - Reran minimum validation after the final closeout edit: `git diff --check`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm ci:repro:current` all passed. Commit, push, and PR remain next.
- [x] 2026-05-09T18:21:00Z - PR #248 was confirmed merged into `main`; FP-0088 is now a shipped V2H docs-only readiness record and FP-0089 is the active successor design-system readiness plan.

## Surprises & Discoveries

The critical correction from the failed V2H attempt is valid: V2F/V2G proof gates were still requiring FP-0088 absence, so creating the required FP-0088 plan would make the proof ladder fail. The correct fix is not to remove the boundary. The correct fix is to replace hard absence with an exact docs-only boundary proof that accepts only `plans/FP-0088-read-only-chatgpt-app-mcp-premium-ui-security-master-plan.md`.

PR #246 and PR #247 are merged into `main`, so FP-0087 is shipped with descriptor/envelope hardening. This means FP-0088 can safely plan the next readiness layer without altering FP-0087 runtime scope.

Official OpenAI Apps SDK docs now treat app submission as a distinct public distribution path with hosted MCP server, CSP, screenshots, test prompts, review, and permission prerequisites. That reinforces that FP-0088 must not authorize app submission or public distribution.

Official OpenAI security/privacy guidance for Apps SDK emphasizes least privilege, explicit consent, prompt-injection defense, server-side validation, audit logs, and write-action risk. FP-0088 uses this only as readiness context; it does not implement OAuth, endpoints, logging, or public server behavior.

Apple HIG accessibility and color guidance reinforces that the future premium UI bar must not rely on color alone, must meet contrast expectations, must support keyboard navigation, and must keep controls comfortably targetable and spaced.

## Decision Log

Decision: FP-0088 is safe to create only as docs-and-plan plus proof-gate compatibility.
Rationale: PR #247 is merged, FP-0087 is shipped, active docs support FP-0087 as local proof-only contracts/descriptors/envelopes, required proof tools exist and passed before edits, no real finance data or public sample pack is required, and this plan can remain non-runtime.

Decision: FP-0088 does not authorize public app submission.
Rationale: app submission requires a later app-submission plan with public distribution intent, hosted MCP server posture, privacy/security review, screenshots, test prompts, permissions, and review workflow. FP-0088 records readiness requirements only.

Decision: FP-0088 does not authorize remote MCP deployment.
Rationale: remote MCP deployment would add hosting, network exposure, authentication, authorization, CSP, logging, retention, privacy, and operational risks. A later threat-model/security implementation plan must prove those before any endpoint exists.

Decision: FP-0088 does not authorize OAuth implementation.
Rationale: OAuth requires explicit user consent, scoped authorization, token handling, expiration/error behavior, and threat-model review. FP-0088 only records the questions future OAuth work must answer.

Decision: FP-0088 does not authorize Apps SDK iframe/UI code.
Rationale: future UI must first have a dedicated UI polish/design-system implementation plan. This thread defines target surfaces and quality bars without adding app-facing code.

Decision: FP-0088 defines premium UI readiness requirements only.
Rationale: design readiness can be specified before implementation. The future UI should be calm, minimal, high-trust, evidence-first, accessible, and native-feeling in a ChatGPT App context.

Decision: FP-0088 defines app/MCP security readiness requirements only.
Rationale: security readiness questions must be answered before endpoints, OAuth, app submission, public distribution, or write-adjacent surfaces can be considered.

Decision: proof gates must accept exactly one docs-only FP-0088 file.
Rationale: replacing `fp0088Absent` with `fp0088AbsentOrDocsOnlyBoundaryVerified`, `fp0089Absent`, `premiumUiSecurityPlanBoundaryVerified`, `noUiImplementationFromFp0088`, and `noEndpointOauthSubmissionFromFp0088` keeps the gate stronger than simple absence.

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

FP-0088 is a successor planning/readiness slice after FP-0087. It is not a public-app implementation track. It should make future implementation harder to start accidentally by requiring explicit design-system, threat-model/security, and app-submission plans first.

Official web research used:

- OpenAI Apps SDK overview, `https://developers.openai.com/apps-sdk`: used to confirm Apps SDK is the current ChatGPT app framework, that the public submission flow remains the path to public distribution, and that app creation/deploy/submission are separate phases.
- OpenAI Apps SDK UI guidelines, `https://developers.openai.com/apps-sdk/concepts/ui-guidelines`: used to frame future UI readiness as native-feeling ChatGPT app quality using high-quality, accessible component/system foundations. No UI code was implemented.
- OpenAI Apps SDK Security & Privacy, `https://developers.openai.com/apps-sdk/guides/security-privacy`: used to frame least privilege, explicit consent, prompt-injection defense, server-side validation, data minimization, logging redaction, OAuth/scopes, and operational security as readiness questions only.
- OpenAI ChatGPT Developer Mode, `https://developers.openai.com/api/docs/guides/developer-mode`: used to confirm full MCP access includes read and write tools, write actions carry destructive/data-sharing risk, and `readOnlyHint` informs read-only detection. FP-0088 keeps write tools impossible.
- OpenAI MCP servers for ChatGPT Apps and API integrations, `https://developers.openai.com/api/docs/mcp`: used to confirm remote MCP server context and why FP-0088 must not start remote server or vector/OpenAI API implementation.
- OpenAI Apps SDK submission guide, `https://developers.openai.com/apps-sdk/deploy/submission`: used to confirm public distribution requires submission/review prerequisites and that this slice must not submit or prepare submission artifacts.
- OpenAI Apps SDK app submission guidelines, `https://developers.openai.com/apps-sdk/app-submission-guidelines`: used to frame future public-readiness obligations around minimal inputs, predictable/auditable behavior, explicit side effects, privacy policy, response minimization, and write-action labeling.
- Apple Human Interface Guidelines Accessibility, `https://developer.apple.com/design/human-interface-guidelines/accessibility`: used to set future premium UI accessibility bars for contrast, keyboard access, perceivable status beyond one channel, control sizing, spacing, and simple interactions.
- Apple Human Interface Guidelines Color, `https://developer.apple.com/design/human-interface-guidelines/color`: used to require color sparingly, no status by color alone, light/dark/increased-contrast checks, and clear focus indicators.

## Plan of Work

Allowed files for this slice:

- `plans/FP-0088-read-only-chatgpt-app-mcp-premium-ui-security-master-plan.md`
- `tools/read-only-mcp-descriptor-response-envelope-proof.mjs`
- `tools/read-only-chatgpt-app-mcp-proof.mjs`
- `tools/benchmark-community-pack-proof.mjs`
- `packages/domain/src/read-only-app-mcp*.ts` only for proof-gate fields/helpers
- `packages/domain/src/benchmark-community*.ts` only for proof-gate fields/helpers
- focused specs for those proof gates
- directly stale active docs such as `README.md`, `CODEX_README.md`, `START_HERE.md`, `docs/ACTIVE_DOCS.md`, `docs/PROJECT_STATE.md`, `docs/V2_BOUNDARY.md`, `plans/ROADMAP.md`, and relevant security/demo/self-host docs only if directly stale

Forbidden files and behavior:

- no product code
- no UI implementation
- no routes or endpoints
- no remote MCP server
- no Apps SDK iframe/UI
- no OAuth
- no app submission
- no schema or migrations
- no package scripts or smoke aliases
- no eval datasets, fixtures, sample data, public demo data, or source packs
- no source-pack fixture edits
- no FP-0089
- no provider integration, certification, OCR/vector/PageIndex/OpenAI file-search, iOS/OpenClaw, deployment, external communications, source mutation, finance writes, generated product prose, runtime-Codex finance output, or autonomous action

Premium future UI surfaces to define but not implement:

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

Future UI quality bar:

- premium Apple/OpenAI-style visual standard
- calm, minimal, spacious layout
- evidence-first information hierarchy
- accessible contrast
- keyboard navigation
- visible focus states
- no status by color alone
- high-quality empty, error, loading, unsupported, stale, and refusal states
- polished copy without generated financial advice
- no dark-pattern action prompts
- clear privacy and no-runtime boundaries

Evidence hierarchy for future UI:

1. answer or refusal status
2. evidence cards
3. citations and source anchors
4. freshness
5. limitations
6. permitted next actions
7. forbidden actions
8. privacy and no-runtime boundary

Future app/MCP security questions:

- How are write actions impossible by schema, descriptor, tool registration, response envelope, and UI affordance?
- How are prompt-injection strings displayed as untrusted data rather than followed?
- How are citations and bounded excerpts shown without raw full-file dumps?
- How are missing, unsupported, stale, or conflicting evidence states shown?
- How are raw full-file dump requests refused?
- How are privacy and no-runtime boundaries visible?
- How are forbidden actions visible as blocked text rather than controls?
- How is no-real-finance-data posture preserved in tests, screenshots, submissions, and public materials?
- What must happen before endpoint, OAuth, app submission, or deployment work starts?
- How will future UI avoid generated financial advice while still providing useful evidence navigation?

Mandatory future plans before public app work:

- future UI polish/design-system implementation plan before UI code.
- Threat-model/security implementation plan before endpoint, remote MCP, or OAuth.
- App-submission plan before submission, screenshots, review packet, public listing, or publication.

## Concrete Steps

1. Run preflight and baseline proof gates.
2. Confirm baseline proof gates prove FP-0088 absence and treat that as expected pre-edit state.
3. Use only official OpenAI and Apple sources for current platform/security/UI context.
4. Create this plan as the only FP-0088 file.
5. Replace V2F/V2G `fp0088Absent` proof fields with exact docs-only boundary proof fields:
   - `fp0088AbsentOrDocsOnlyBoundaryVerified`
   - `fp0089Absent`
   - `premiumUiSecurityPlanBoundaryVerified`
   - `noUiImplementationFromFp0088`
   - `noEndpointOauthSubmissionFromFp0088`
6. Update focused specs to require the new fields.
7. Refresh only directly stale active docs.
8. Run focused proof validation and strict same-branch QA.
9. Run final validation.
10. If validation is green, commit exactly once, push the requested branch, and open the requested PR.

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
- Confirm no FP-0089 exists.
- Confirm the proof gates reject multiple FP-0088 files and any FP-0088 filename other than the exact plan filename.
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

- `plans/FP-0088-read-only-chatgpt-app-mcp-premium-ui-security-master-plan.md` exists and is the only FP-0088 file.
- No FP-0089 exists.
- V2F/V2G proofs report the exact docs-only FP-0088 successor boundary instead of `fp0088Absent`.
- Existing FP-0087 typed boundary remains intact.
- Public app implementation, remote MCP deployment, Apps SDK UI, OAuth, app submission, OpenAI API/model calls, provider/certification/deployment, package scripts, datasets, fixtures, sample data, source packs, source mutation, finance writes, generated product prose, runtime-Codex finance output, and autonomous action remain absent.

## Idempotence and Recovery

Rerunning this slice should find this exact FP-0088 file and update it rather than creating another FP-0088 or FP-0089.

If proof gates fail because FP-0088 is present, patch only the proof-gate bridge so the exact docs-only plan is accepted. Do not widen into UI/runtime/app/OAuth/submission work.

If proof gates find multiple FP-0088 files, delete the duplicate only if it was created by this slice; otherwise stop and report the unrelated dirty or conflicting file.

If validation fails after a proof-gate correction, report the exact failing command and recommend the smallest safer corrective slice:

- proof-gate bridge correction
- V2G descriptor/envelope proof correction
- V2F benchmark proof-boundary correction
- hold FP-0088 until proof gates can accept a docs-only successor

Do not publish a partially green branch.

## Artifacts and Notes

This plan records current platform/security/design context from official docs, but repo truth remains the current code, shipped Finance Plans, active Pocket CFO docs, and local proof gates.

No raw sources, source snapshots, source checksums, Finance Twin facts, CFO Wiki pages, evidence bundles, mission answers, reports, approvals, or raw finance files are changed.

No real finance data, public sample pack, eval dataset, fixture, sample data, or source pack is required.

## Interfaces and Dependencies

Repo dependencies:

- shipped FP-0087 local proof-only read-only app/MCP contracts and descriptor/envelope proof gates
- shipped FP-0086 benchmark/community proof gate
- shipped FP-0085, FP-0084, FP-0082, FP-0081, and FP-0080 direct proof spine
- active docs and roadmap state

External research dependencies used only for context:

- official OpenAI Apps SDK, MCP, Developer Mode, security/privacy, submission, and app-submission docs
- official Apple Human Interface Guidelines accessibility and color docs

No environment variables are added.

No `WORKFLOW.md`, stack packs, skills, package scripts, smoke aliases, or runtime interfaces are changed.

## Outcomes & Retrospective

Final validation and post-closeout minimum validation passed.

The outcome is a shipped FP-0088 readiness master plan plus a stricter proof-gate bridge that allowed this exact docs-only successor and rejected everything else that would turn the plan into public app/runtime behavior. No UI, endpoint, remote MCP server, OAuth, app submission, data file, package script, source mutation, finance write, runtime-Codex finance output, or autonomous action was added.

Remaining work is intentionally future-plan-only: a narrow UI polish/design-system implementation plan before UI code, a threat-model/security implementation plan before endpoint/remote MCP/OAuth work, and an app-submission plan before public submission.
