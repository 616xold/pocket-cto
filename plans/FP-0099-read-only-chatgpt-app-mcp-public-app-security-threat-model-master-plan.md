# FP-0099 - Read-only ChatGPT App MCP Public App Security Threat Model Master Plan

## Purpose / Big Picture

FP-0099 is the V2S public-app security threat-model and platform-boundary master plan for the read-only ChatGPT App/MCP track.

FP-0099 is not implementation. This is a docs-and-plan plus proof-gate compatibility slice only. It defines future public-app/MCP security threat-model and platform-boundary planning before any public ChatGPT App, remote MCP, endpoint, OAuth, Apps SDK iframe/resource, or app-submission work begins.

This plan follows shipped FP-0098, which established public-app readiness, security posture, and submission-boundary questions. FP-0099 narrows the next safe step to explicit threat questions, platform-boundary prerequisites, proof-gate bridge fields, and refusal/privacy posture. It keeps public app implementation remains future-only and public app submission remains future-only.

## Progress

- [x] Confirmed FP-0098 is shipped and merged to `origin/main` before opening FP-0099.
- [x] Confirmed no FP-0099 or FP-0100 existed before this slice.
- [x] Confirmed required proof gates existed and passed in the pre-edit tree while proving FP-0099 absence.
- [x] Recorded official OpenAI platform and security context as read-only research only.
- [x] Apply the narrow V2F/V2G proof-gate bridge so exactly this FP-0099 docs-only plan is tolerated.
- [x] Refresh directly stale active docs without adding runtime/product behavior.
- [x] Run focused validation, strict same-branch QA, final validation, and close the plan.

## Surprises & Discoveries

- Existing V2F/V2G gates intentionally treated any FP-0099 file as a failure. That was correct before this slice and now needs a narrow bridge that accepts exactly one successor plan file while still rejecting FP-0100.
- Official OpenAI public-app, Apps SDK, MCP, and security material reinforces that endpoint configuration, user/admin controls, action controls, prompt-injection handling, OAuth/auth, app submission, and privacy/data controls are separate future implementation and review concerns. FP-0099 records those concerns but does not implement them.
- Same-branch QA found only the authorized docs/proof files. Route, endpoint, API/backend route, schema/migration, package script, eval dataset, fixture, source-pack, FP-0100, screenshot, image, public asset, listing-copy, app-submission-artifact, source-mutation, finance-write, and OpenAI API/model-call scans stayed empty.

## Decision Log

- FP-0099 is not implementation.
- FP-0099 does not authorize endpoint implementation.
- FP-0099 does not authorize OAuth implementation.
- FP-0099 does not authorize remote MCP server deployment.
- FP-0099 does not authorize Apps SDK iframe/resource implementation.
- FP-0099 does not authorize public ChatGPT App implementation.
- FP-0099 does not authorize app submission.
- FP-0099 does not authorize OpenAI API/model calls.
- FP-0099 defines future security threat-model and platform-boundary planning only.
- FP-0099 preserves FP-0098 as the shipped public-app readiness/security/submission-boundary plan.
- FP-0099 preserves FP-0097 as the shipped local visual QA/accessibility foundation.
- FP-0099 preserves FP-0096 and FP-0094 as shipped local preview route boundaries.
- FP-0099 preserves FP-0092 and FP-0091 as shipped local UI composition/component foundations.
- FP-0099 preserves FP-0087 as the shipped read-only app/MCP contract, descriptor, and response-envelope foundation.
- FP-0099 preserves all authority lanes: raw sources, Finance Twin, CFO Wiki, EvidenceIndex, V2C tools, V2D Atlas, V2E orchestration, V2F benchmark/community contracts, V2G app/MCP descriptors/envelopes, FP-0091/0092/0094/0096/0097 local UI route/component foundations, and FP-0098 public-app readiness planning.

## Context and Orientation

Pocket CFO's source of truth remains finance evidence, not chat output or public app presentation. Raw source files are immutable. The Finance Twin, CFO Wiki, EvidenceIndex, and durable reports/evidence bundles remain the mission-facing authority lanes.

FP-0099 sits after these shipped boundaries:

- FP-0087: local proof-only read-only ChatGPT App/MCP contract, descriptor, and response-envelope foundation.
- FP-0091 and FP-0092: local component-only and composition/accessibility foundations.
- FP-0094, FP-0096, and FP-0097: one local noindex/nofollow/noarchive preview route, state matrix, screenshotless visual QA, and accessibility foundation.
- FP-0098: docs-only public-app readiness/security/submission-boundary planning.

The next safe step is a security threat-model and platform-boundary plan. It is not public ChatGPT App implementation. It is not Apps SDK iframe/resource implementation. It is not remote MCP deployment. It is not OAuth. It is not app submission. It is not endpoint implementation. It is not OpenAI API/model integration. It is not deployment. It is not product runtime behavior.

## Plan of Work

1. Preserve the shipped FP-0098 readiness/submission boundary and all earlier read-only app/MCP proof lanes.
2. Create exactly one FP-0099 plan file at `plans/FP-0099-read-only-chatgpt-app-mcp-public-app-security-threat-model-master-plan.md`.
3. Define public-app security threat-model and platform-boundary questions without adding runtime behavior.
4. Update the minimum V2F/V2G proof surfaces so FP-0099 docs-only planning is accepted while FP-0100 remains absent.
5. Refresh directly stale active docs and security/demo-policy docs only where they would otherwise misstate the current plan state.
6. Run focused proof gates, focused domain specs, strict same-branch QA, and final validation.

## Concrete Steps

### Threat Questions

FP-0099 defines threat questions for:

- prompt injection from source text, user text, tool output, and model-visible context
- data exfiltration and raw full-file dump requests
- write/modify action impossibility
- tool allowlist drift
- MCP descriptor drift
- remote MCP endpoint trust
- OAuth/token/session storage
- user and admin consent
- enterprise RBAC/action control
- app visibility/public directory listing
- audit logging and replay/evidence boundaries
- no-real-finance-data and privacy posture
- unsupported/stale/conflicting evidence refusal

### Platform-Boundary Prerequisites

Future implementation prerequisites:

- no endpoint work before threat-model acceptance
- no OAuth before token/session/privacy review
- no remote MCP before host/network/security review
- no Apps SDK iframe/resource before UI/resource security plan
- no app submission before local proof, app security plan, privacy review, and submission plan

### Explicitly Forbidden In FP-0099

FP-0099 does not authorize endpoint implementation, OAuth implementation, remote MCP server deployment, Apps SDK iframe/resource implementation, public ChatGPT App implementation, app submission, provider/certification/deployment work, OpenAI API/model calls, source mutation, finance writes, generated product prose, runtime-Codex finance output, autonomous action, screenshots, generated images, public assets, listing copy, or app-submission artifacts.

No source mutation and no finance writes are permitted. No public assets are permitted. No listing copy is permitted. No app-submission artifacts are permitted. No OpenAI API/model calls are permitted.

### Future Acceptance Questions

Any later implementation plan must answer:

- Which endpoint hosts the MCP surface, and what trust, network, CORS/CSP, logging, and abuse-control boundaries apply?
- Which OAuth or auth/session material exists, how is it stored, how is it revoked, and which privacy review accepted it?
- Which Apps SDK resources are registered, which data becomes visible to the UI resource, and how are tool results and source text rendered as inert data?
- Which user/admin consent and enterprise action-control settings are required before any directory visibility or public listing?
- Which allowlist and descriptor checks prove no write/modify tools, renamed equivalents, or dynamic tool drift are possible?
- Which replay/evidence/audit events exist for any app-visible action, refusal, source-coverage boundary, or stale/conflicting evidence posture?
- Which privacy posture proves no real finance data, source-pack mutation, fixture mutation, or raw full-file dumping is involved?
- Which refusal templates handle unsupported, stale, partial, inferred, conflicting, private, or unsafe evidence without producing advice or product prose?

## Validation and Acceptance

FP-0099 is accepted only if:

- exactly one FP-0099 file exists at `plans/FP-0099-read-only-chatgpt-app-mcp-public-app-security-threat-model-master-plan.md`
- FP-0100 remains absent
- V2F/V2G proof gates accept FP-0099 as docs-only public-app security threat-model and platform-boundary planning
- FP-0098 public-app readiness/security/submission-boundary remains intact
- FP-0097 local visual QA/accessibility, FP-0096/0094 local route, FP-0092/0091 local UI, and FP-0087 descriptor/envelope boundaries remain intact
- no endpoints, routes, OAuth, remote MCP, Apps SDK resources, app submission artifacts, public assets, listing copy, model/API calls, data files, fixtures, source packs, screenshots, generated images, source mutation, finance writes, generated product prose, runtime-Codex finance output, or autonomous action are added

Required validation:

- `pnpm exec tsx tools/read-only-mcp-descriptor-response-envelope-proof.mjs`
- `pnpm exec tsx tools/read-only-chatgpt-app-mcp-proof.mjs`
- `pnpm exec tsx tools/benchmark-community-pack-proof.mjs`
- `pnpm exec tsx tools/bounded-llm-orchestration-proof.mjs`
- `pnpm exec tsx tools/read-only-evidence-app-proof.mjs`
- `pnpm exec tsx tools/document-precision-foundation-proof.mjs`
- `pnpm exec tsx tools/evidence-index-foundation-proof.mjs`
- `pnpm --filter @pocket-cto/domain exec vitest run src/benchmark-community.spec.ts src/read-only-app-mcp.spec.ts src/read-only-app-mcp-descriptor.spec.ts`
- `git diff --check`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm ci:repro:current`

Closeout validation passed on 2026-05-10:

- `git diff --check`
- `pnpm exec tsx tools/read-only-mcp-descriptor-response-envelope-proof.mjs`
- `pnpm exec tsx tools/read-only-chatgpt-app-mcp-proof.mjs`
- `pnpm exec tsx tools/benchmark-community-pack-proof.mjs`
- `pnpm exec tsx tools/bounded-llm-orchestration-proof.mjs`
- `pnpm exec tsx tools/read-only-evidence-app-proof.mjs`
- `pnpm exec tsx tools/document-precision-foundation-proof.mjs`
- `pnpm exec tsx tools/evidence-index-foundation-proof.mjs`
- `pnpm --filter @pocket-cto/domain exec vitest run src/benchmark-community.spec.ts src/read-only-app-mcp.spec.ts src/read-only-app-mcp-descriptor.spec.ts`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm ci:repro:current`

## Idempotence and Recovery

If a validation failure appears, do not widen scope. Patch only the proof-gate bridge, FP-0099 plan wording, or directly stale docs on this branch. If a failure indicates missing FP-0098 shipped truth, missing proof gates, unrelated dirty files, unavailable local services, or public-app implementation pressure, stop and recommend the smallest safer slice:

- FP-0099 proof-gate bridge correction
- FP-0098 public-app readiness proof correction
- FP-0097 post-merge visual QA correction
- FP-0087 descriptor/envelope correction
- hold public app work until security boundaries can be proven

## Artifacts and Notes

Official OpenAI sources used as current read-only platform/security context:

- OpenAI Apps SDK docs, `https://developers.openai.com/apps-sdk/`: used to frame Apps SDK and MCP app/tool/resource concepts as future platform context only.
- OpenAI Apps SDK Security & Privacy guide, `https://developers.openai.com/apps-sdk/guides/security-privacy`: used to frame future prompt-injection, tool-safety, data-minimization, least-privilege, resource-domain, and CSP/security questions.
- OpenAI Apps SDK app submission guidelines, `https://developers.openai.com/apps-sdk/app-submission-guidelines`: used to frame submission as a future review boundary, not an FP-0099 action.
- OpenAI Apps SDK deploy submission docs, `https://developers.openai.com/apps-sdk/deploy/submission`: used to frame future submission packaging/review prerequisites and keep submission out of FP-0099.
- OpenAI Developer Mode apps and full MCP connectors help, `https://help.openai.com/en/articles/12584461-developer-mode-apps-and-full-mcp-connectors-in-chatgpt-beta`: used to frame future connector/tool/action risk, user/admin controls, write/modify action concerns, and prompt-injection posture.
- OpenAI API Your data docs, `https://developers.openai.com/api/docs/guides/your-data`: used to frame future data-control/privacy posture only. FP-0099 made no OpenAI API calls and used no model.

No real finance data, public sample pack, eval dataset, fixture/sample data/source-pack mutation, write tools, OAuth implementation, app submission, remote endpoint implementation, OpenAI API/model call, provider/certification/deployment/external communication, finance write, or source mutation is required for this plan.

## Interfaces and Dependencies

FP-0099 touches only docs and proof-gate compatibility surfaces. It depends on:

- shipped FP-0098 public-app readiness/security/submission-boundary planning
- shipped FP-0097 local visual QA/accessibility foundation
- shipped FP-0096/FP-0094 local preview route foundations
- shipped FP-0092/FP-0091 local UI foundations
- shipped FP-0087 read-only app/MCP descriptor/envelope foundation
- V2F benchmark/community proof schemas and V2G app/MCP proof schemas

It does not add schema, migration, route, endpoint, app route, backend route, package script, smoke alias, fixture, sample data, eval dataset, source pack, Apps SDK resource, OAuth, remote MCP server, OpenAI API/model integration, or deployment dependency.

## Outcomes & Retrospective

FP-0099 shipped as docs-and-plan plus proof-gate compatibility only. It created one public-app security threat-model/platform-boundary plan, refreshed directly stale docs, and updated V2F/V2G proof gates so exactly this FP-0099 successor is tolerated while FP-0100 stays absent.

No product code, route, endpoint, remote MCP server, Apps SDK iframe/resource registration, OAuth, app submission, schema, migration, package script, fixture, sample data, source pack, OpenAI API/model call, screenshot, generated image, public asset, listing copy, app-submission artifact, source mutation, finance write, generated product prose, runtime-Codex finance output, autonomous action, or deployment was added.

Replay/evidence implications: no mission state changed, no source was ingested or mutated, no finance write occurred, and no runtime-Codex finance output was produced. No replay event or evidence bundle was required for this docs/proof-gate-only slice.

Gaps remaining: public app implementation, endpoint/OAuth/remote MCP/Apps SDK resource work, app submission, privacy/token/session review, host/network/security review, and public listing/submission assets remain future-only until a later named Finance Plan accepts the FP-0099 threat model and opens a narrow implementation slice.
