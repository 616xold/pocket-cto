# FP-0087 - Read-only ChatGPT App MCP Contracts Foundation

## Purpose / Big Picture

Target phase: V2G.

Exact shipped slice: `V2G-read-only-chatgpt-app-mcp-contracts-foundation-local-v1`.

This Finance Plan records the first V2G local proof-only read-only ChatGPT App/MCP contract foundation. It implements pure domain contracts and direct proof tooling only, over the already-shipped V2A/V2B/V2C/V2D/V2E/V2F evidence spine.

The shipped slice proves how a future ChatGPT App/MCP wrapper must stay read-only: exact allowlisted evidence tools, explicit forbidden write/action/provider/deployment/legal/audit/payment/customer-contact tools, fail-closed refusal posture, prompt-injection and privacy boundaries, no-runtime posture, deferred OAuth/submission/provider-certification boundaries, threat-model questions, and a machine-readable proof.

This is not public ChatGPT App implementation, a remote MCP server, Apps SDK iframe/UI, OAuth, app submission, deployment, provider integration, certification, OpenAI API/model integration, hosted tools, vector/file-search, OCR, PageIndex, source-pack behavior, source mutation, finance writes, generated product prose, runtime-Codex finance output, external communications, or autonomous action. There is no app submission and no OpenAI API/model calls.

The north star remains unchanged: raw finance evidence becomes a persisted, freshness-aware decision system that can answer a question, explain limitations, and produce a durable artifact another human can review outside chat. ChatGPT App/MCP artifacts are future distribution wrapper contracts only; they are never source truth.

## Progress

- [x] 2026-05-09T12:30:23Z - Created FP-0087 as the V2G docs-and-plan-only master plan after FP-0086 shipped.
- [x] 2026-05-09T13:02:30Z - Hardened the original V2F `fp0087Absent` gate to accept the FP-0087 boundary without requiring FP-0087 to stay absent forever.
- [x] 2026-05-09T13:54:42Z - Loaded the required `pocket-cfo-codex-operator` skills for the implementation thread: Finance Plan Orchestrator, Modular Architecture Guard, Source Provenance Guard, CFO Wiki Maintainer, Evidence Bundle Auditor, F6 Monitoring Semantics Guard, Validation Ladder Composer, and Pocket CFO Handoff Auditor.
- [x] 2026-05-09T13:54:42Z - Confirmed GitHub Connector Guard is out of scope because GitHub connector product behavior is not part of this slice.
- [x] 2026-05-09T13:54:42Z - Completed implementation preflight against fetched `origin/main`: branch `codex/v2g-read-only-chatgpt-app-mcp-contracts-foundation-local-v1`, clean repo, PR #243 merged, Docker Postgres/MinIO available, FP-0087 and FP-0086 present, FP-0088 absent, and required V2 proof tools present.
- [x] 2026-05-09T13:54:42Z - Reran baseline direct V2A/V2B/V2C/V2E/V2F proofs before implementation; all passed.
- [x] 2026-05-09T13:54:42Z - Added pure V2G domain contracts, focused specs, and `tools/read-only-chatgpt-app-mcp-proof.mjs`.
- [x] 2026-05-09T13:54:42Z - Hardened the V2F benchmark/community proof and spec to validate FP-0087 through the typed V2G `AppProof` when FP-0087 exists.
- [x] 2026-05-09T13:54:42Z - Fixed one focused QA defect in the V2G forbidden-tool classifier: `file tax return` now maps to the forbidden `file_tax` posture.
- [x] 2026-05-09T13:54:42Z - Ran focused proof/spec validation for V2A through V2G; all passed.
- [x] 2026-05-09T13:54:42Z - Ran strict same-branch QA for changed-file scope, FP-0088 absence, no package/script/UI/route/schema/eval/fixture/sample/source-pack diff, forbidden tool rejection, raw full-file dump/data-exfiltration/prompt-injection fail-closed posture, and no runtime leak.
- [x] 2026-05-09T13:54:42Z - Ran the full pre-closeout 37-command validation ladder; all commands passed. Log root: `/tmp/pocket-cfo-v2g-full-validation-20260509T134847Z-66703`.
- [x] 2026-05-09T13:54:42Z - Updated FP-0087 and directly stale active docs to mark V2G as shipped local proof-only read-only app/MCP contract foundation, not app implementation.
- [x] 2026-05-09T14:00:00Z - Final-tail `pnpm ci:repro:current` initially failed inside the reproduced temp worktree because the typed V2F boundary predicate required the exact phrase `no app submission` after the FP-0087 closeout rewrite. Patched the FP-0087 closeout text to carry that exact no-submission boundary.
- [x] 2026-05-09T14:00:00Z - Reran `pnpm --filter @pocket-cto/domain exec vitest run src/benchmark-community.spec.ts src/read-only-app-mcp.spec.ts`, `pnpm exec tsx tools/benchmark-community-pack-proof.mjs`, and `pnpm exec tsx tools/read-only-chatgpt-app-mcp-proof.mjs`; all passed after the closeout-text correction.
- [x] 2026-05-09T14:00:00Z - Reran final-tail validation after the correction; `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm ci:repro:current` all passed. Log root: `/tmp/pocket-cfo-v2g-final-tail-rerun-20260509T135956Z-1079`.
- [x] 2026-05-09T14:11:06Z - Same-branch QA found and patched one contract hardening gap: app/MCP response-required fields now also include `refusalPosture` and `forbiddenActions`, and the proof/spec verify those fields directly.
- [x] 2026-05-09T14:18:53Z - Same-branch QA validation passed after the response-field hardening: focused V2A/V2B/V2C/V2E/V2F/V2G proofs/specs, DB-backed smoke ladder, web/domain/control-plane/twin test ladders, `git diff --check`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm ci:repro:current`.

## Surprises & Discoveries

The most useful QA finding was small but important: a natural-language renamed tax-filing tool, `file tax return`, did not initially classify as forbidden. The fix stayed inside the V2G forbidden-tool alias contract and the focused proof/spec now covers it.

Same-branch QA also found that the response-field tuple proved evidence, freshness, limitations, permitted next actions, and citations, but did not require the explicit refusal posture and forbidden-action fields that the V2G boundary text already called for. The correction stayed in pure domain/proof/spec files and did not add runtime behavior.

The earlier FP-0087 planning thread had already replaced the stale V2F hard absence check with a docs-only boundary check. After the typed V2G proof existed, this implementation tightened that gate again: V2F now accepts FP-0087 only when the typed V2G proof validates the FP-0087 boundary, public-app absence, remote-MCP absence, and OpenAI API/model-call absence.

No web browsing was used in this implementation thread. The official OpenAI docs references in the original planning record remain historical context only; repo truth, shipped Finance Plans, and current code define the implemented boundary.

## Decision Log

- V2G implementation scope is pure domain contract and proof tooling only. The default boundary is `packages/domain` plus one direct `tools/` proof command.
- `ReadOnlyChatGptAppPlan` and `ReadOnlyMcpServerPlan` are contracts only. They do not start an app, server, endpoint, OAuth flow, UI, or submission path.
- The MCP tool allowlist is exact and read-only: `search_evidence`, `fetch_evidence_card`, `fetch_source_anchor`, `fetch_document_map`, `fetch_source_coverage`, `fetch_company_posture`, and `fetch_capability_boundaries`.
- Renamed write/action/provider/deployment/legal/audit/payment/customer-contact tool names are rejected by contract classification, not by prompt wording.
- V2G inherits the V2F SafeDemoDataPolicy posture. Proof/spec examples use in-memory synthetic examples only; no fixtures, eval datasets, sample data, public demo data, or source packs are added.
- No replay event is produced by this local contract/proof slice because no product runtime state, mission state, source state, evidence bundle, Finance Twin state, CFO Wiki page, route, schema, or external action changes.
- FP-0088 was not created.

## Context and Orientation

Shipped V2 truth now provides the evidence spine needed for read-only app/MCP wrapper contracts:

- FP-0080 shipped V2A EvidenceIndex/document-map contracts and a native read-only anchor/trace/card/coverage layer.
- FP-0081 shipped V2B TextPdfAdapter precision proof over EvidenceIndex for one narrow deterministic policy/covenant text-PDF path.
- FP-0082 shipped V2C local/internal read-only evidence-tool contracts over EvidenceIndex/TextPdfAdapter outputs.
- FP-0083 shipped OSS demo, self-host, security, privacy, finance-data threat model, read-only-agent threat model, and demo-data policy docs before public app or deployment work.
- FP-0084 shipped V2D Evidence Atlas UI as read-only local visualization only.
- FP-0085 shipped V2E local/internal proof-only bounded orchestration over the fixed V2C tool allowlist.
- FP-0086 shipped V2F benchmark/community manifest contracts and SafeDemoDataPolicy-first proof posture without datasets, fixtures, sample data, source packs, OpenAI API/model calls, public app/MCP work, or runtime behavior.

V2G does not add finance authority. Raw sources remain authoritative for document claims, the Finance Twin remains authoritative for structured facts, the CFO Wiki remains compiled/derived, EvidenceIndex remains the read-only anchor/trace/card/coverage/limitation layer, V2C tools remain local/internal read-only contracts, V2D remains visualization only, V2E remains proof-only bounded orchestration, and V2F remains benchmark/community contract posture.

## Plan of Work

Implemented files:

- `packages/domain/src/read-only-app-mcp*.ts`
- `packages/domain/src/read-only-app-mcp.spec.ts`
- `packages/domain/src/index.ts`
- `tools/read-only-chatgpt-app-mcp-proof.mjs`
- `packages/domain/src/benchmark-community.spec.ts`
- `tools/benchmark-community-pack-proof.mjs`
- directly stale active docs

No control-plane runtime module, app route, web API route, backend/control-plane HTTP route, UI, schema, migration, package script, smoke alias, eval dataset, fixture, sample data, public demo data, public source pack, source-pack mutation, OpenAI API/model call, provider integration, certification, delivery, deployment, external communication, source mutation, finance write, generated product prose, runtime-Codex finance output, or autonomous action was added.

## Concrete Steps

1. Load required Pocket CFO operator skills and run preflight.
2. Read FP-0087, FP-0086 through FP-0080, active docs, security/privacy/demo/self-host docs, V2A/V2B/V2C/V2E/V2F domain contracts, relevant control-plane modules, V2D Evidence Atlas files, and direct proof tools.
3. Rerun baseline direct V2 proofs.
4. Add V2G contract schemas for app/MCP plans, allowlist, forbidden tools, evidence query/fetch, source coverage fetch, capability-boundary fetch, refusal posture, prompt-injection boundary, privacy boundary, no-runtime boundary, deferred OAuth/submission/provider-certification boundaries, proof plan, threat-model questions, and proof.
5. Add focused domain specs and the direct proof command.
6. Harden V2F proof/spec to use typed V2G proof posture when FP-0087 exists.
7. Run focused validation, strict QA, and the full validation ladder.
8. Close out FP-0087 and active docs as shipped local proof-only contracts.
9. Rerun minimum final validation, then commit once, push, and open a PR.

## Validation and Acceptance

Baseline direct proofs passed before implementation:

```bash
pnpm exec tsx tools/benchmark-community-pack-proof.mjs
pnpm exec tsx tools/bounded-llm-orchestration-proof.mjs
pnpm exec tsx tools/read-only-evidence-app-proof.mjs
pnpm exec tsx tools/document-precision-foundation-proof.mjs
pnpm exec tsx tools/evidence-index-foundation-proof.mjs
```

Focused V2G validation passed:

```bash
pnpm --filter @pocket-cto/domain exec vitest run src/read-only-app-mcp.spec.ts
pnpm exec tsx tools/read-only-chatgpt-app-mcp-proof.mjs
pnpm exec tsx tools/benchmark-community-pack-proof.mjs
pnpm --filter @pocket-cto/domain typecheck
pnpm --filter @pocket-cto/domain lint
```

Focused V2A-through-V2G validation passed:

```bash
pnpm exec tsx tools/benchmark-community-pack-proof.mjs
pnpm exec tsx tools/bounded-llm-orchestration-proof.mjs
pnpm exec tsx tools/read-only-evidence-app-proof.mjs
pnpm exec tsx tools/document-precision-foundation-proof.mjs
pnpm exec tsx tools/evidence-index-foundation-proof.mjs
pnpm exec tsx tools/read-only-chatgpt-app-mcp-proof.mjs
pnpm --filter @pocket-cto/domain exec vitest run src/evidence-index.spec.ts src/evidence-tool.spec.ts src/bounded-llm.spec.ts src/benchmark-community.spec.ts src/read-only-app-mcp.spec.ts
zsh -lc "cd apps/control-plane && setopt NULL_GLOB && pnpm exec vitest run src/modules/evidence-index/**/*.spec.ts src/modules/bounded-llm-orchestration/**/*.spec.ts"
```

The full pre-closeout 37-command ladder passed, including all requested DB-backed source-pack proofs, CFO Wiki/Finance Twin/monitor/readiness smokes, web tests/typecheck, expanded domain specs with the V2G spec, control-plane module specs, twin guardrail specs, `git diff --check`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm ci:repro:current`.

Log root: `/tmp/pocket-cfo-v2g-full-validation-20260509T134847Z-66703`.

Final post-closeout tail passed after the FP-0087 predicate-text correction:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm ci:repro:current
```

Log root: `/tmp/pocket-cfo-v2g-final-tail-rerun-20260509T135956Z-1079`.

Acceptance evidence:

- `tools/read-only-chatgpt-app-mcp-proof.mjs` prints machine-readable JSON with the required V2G no-runtime, no-public-app, no-OpenAI/API/model, allowlist, forbidden-tool, refusal, privacy, prompt-injection, deferred-boundary, SafeDemoDataPolicy, FP-0087, and FP-0088 fields.
- V2F proof/spec now validates FP-0087 through typed V2G proof posture when FP-0087 exists.
- FP-0088 is absent.
- No package scripts or smoke aliases were added.
- No fixtures, eval datasets, sample data, public demo data, source packs, source-pack mutations, routes, UI, schema, migrations, endpoints, remote MCP server, Apps SDK UI, OAuth, app submission, provider/certification/delivery/deployment, source mutation, finance write, generated product prose, runtime-Codex finance output, or autonomous action were added.

## Idempotence and Recovery

The V2G code is pure domain contract/proof code. Re-running the direct proof command should be deterministic as long as FP-0087 remains the only FP-0087 file, FP-0088 remains absent, and no V2G package scripts or smoke aliases are introduced.

If validation fails in the V2G proof/spec, fix only the V2G contract/proof surface unless evidence shows a shipped V2A/V2B/V2C/V2E/V2F contract regression. Do not widen into runtime behavior.

If a future thread needs public app implementation, remote MCP deployment, OAuth, Apps SDK UI, app submission, provider/certification/delivery/deployment, or external communications, create a later Finance Plan first. FP-0087 does not authorize those scopes.

## Artifacts and Notes

Created artifacts:

- `packages/domain/src/read-only-app-mcp-boundaries.ts`
- `packages/domain/src/read-only-app-mcp-contracts.ts`
- `packages/domain/src/read-only-app-mcp-proof-schema.ts`
- `packages/domain/src/read-only-app-mcp-proof.ts`
- `packages/domain/src/read-only-app-mcp-runtime.ts`
- `packages/domain/src/read-only-app-mcp.ts`
- `packages/domain/src/read-only-app-mcp.spec.ts`
- `tools/read-only-chatgpt-app-mcp-proof.mjs`

Updated artifacts:

- `packages/domain/src/index.ts`
- `packages/domain/src/benchmark-community.spec.ts`
- `tools/benchmark-community-pack-proof.mjs`
- active docs that were directly stale after V2G shipped

Replay and evidence-bundle implications:

- No replay event is created.
- No evidence bundle is created or mutated.
- No raw source, source snapshot, checksum, Finance Twin state, CFO Wiki page, EvidenceIndex record, V2C evidence-tool runtime output, V2D Atlas UI behavior, V2E orchestration runtime, or V2F dataset/source-pack artifact is changed.

Impact on `WORKFLOW.md`, stack packs, skills, and environment:

- No `WORKFLOW.md` change.
- No stack-pack change.
- No repo-local skill or plugin change.
- No environment variable added.
- No package script added.

## Interfaces and Dependencies

V2G contract exports now include:

- `ReadOnlyChatGptAppPlan`
- `ReadOnlyMcpServerPlan`
- `McpToolAllowlist`
- `McpForbiddenTool`
- `AppEvidenceQuery`
- `AppEvidenceFetch`
- `AppSourceCoverageFetch`
- `AppCapabilityBoundaryFetch`
- `AppRefusalPosture`
- `AppPromptInjectionBoundary`
- `AppPrivacyBoundary`
- `AppNoRuntimeBoundary`
- `AppOAuthDeferredBoundary`
- `AppSubmissionDeferredBoundary`
- `AppProviderCertificationDeferredBoundary`
- `AppProofPlan`
- `AppThreatModelQuestions`
- `AppProof`

Future read-only app/MCP responses must represent evidence, freshness, limitations, permitted next actions, citations, refusal reason or unsupported posture where applicable, capability boundaries, forbidden actions, and bounded excerpts only.

Future app/MCP threat modeling must still answer how allowlists are enforced outside prompts, how untrusted source/user/tool/model-visible/app metadata is handled, how citations and bounded excerpts are guaranteed, how prompt injection/data exfiltration/raw dumps are refused, how no-real-finance-data posture is preserved, and what must happen before remote endpoints, OAuth, Apps SDK UI, or app submission are allowed.

## Outcomes & Retrospective

FP-0087 shipped as a local proof-only read-only ChatGPT App/MCP contract foundation.

The shipped slice adds typed read-only app/MCP concepts, exact allowlist, forbidden tools, refusal/privacy/no-runtime boundaries, deferred OAuth/submission/provider-certification boundaries, threat-model questions, and direct proof tooling.

No public app implementation, MCP server runtime, endpoint, Apps SDK iframe/UI, OAuth, app submission, OpenAI API/model call, hosted tools, vector/file-search, OCR, PageIndex, provider/certification/delivery/deployment/external communications, source mutation, finance write, generated product prose, runtime-Codex finance output, autonomous action, UI, routes, schema, migrations, package scripts, smoke aliases, eval datasets, fixtures, sample data, public demo data, public source packs, or source-pack mutation was added.

FP-0088 was not created.

Recommended next step after this PR merges: do not start public app implementation or submission. Public ChatGPT App implementation, remote MCP deployment, OAuth, Apps SDK UI, app submission, provider integration, certification, deployment, and external communications should continue to wait for a later named Finance Plan and threat model.
