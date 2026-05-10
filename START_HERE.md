# Start Here

Pocket CFO is an evidence-native finance discovery and decision system. The repository still contains historical Pocket CTO/internal scaffolding, but the active product direction is Pocket CFO.

## Humans

Start with [README.md](README.md).

It explains the product definition, current shipped capabilities, setup, validation summary, architecture, safety boundaries, V2 roadmap summary, and finance-data privacy warning.

Use [docs/PROJECT_STATE.md](docs/PROJECT_STATE.md) for the shipped phase/state ledger and [docs/V2_BOUNDARY.md](docs/V2_BOUNDARY.md) for the V2 boundary.

## Codex Operators

Start with [CODEX_README.md](CODEX_README.md), then follow [docs/ACTIVE_DOCS.md](docs/ACTIVE_DOCS.md).

[plans/FP-0079-manual-ui-demo-readiness-audit.md](plans/FP-0079-manual-ui-demo-readiness-audit.md) is the shipped F12 manual UI/demo-readiness audit record. [plans/FP-0078-public-repo-hygiene-and-v2-transition.md](plans/FP-0078-public-repo-hygiene-and-v2-transition.md) is the shipped F11 public repo hygiene and V2 transition record.

## First Local Thread Prompt

```text
Use the pocket-cfo-codex-operator plugin.
Read CODEX_README.md, docs/ACTIVE_DOCS.md, README.md, docs/PROJECT_STATE.md, docs/V2_BOUNDARY.md, AGENTS.md, PLANS.md, WORKFLOW.md, plans/ROADMAP.md, and the active unfinished Finance Plan.
Identify the active phase, shipped records, forbidden scopes, and next unchecked slice.
Implement only that slice, keep internal package scope unchanged, update the active Finance Plan as work proceeds, and run the validation ladder named by the plan.
```

## Operating Pattern

Use one Codex thread per slice. Keep work phase-bounded and plan-scoped.

Current shipped records:

- FP-0079 is the shipped F12 manual UI/demo-readiness audit record.
- FP-0078 is the shipped F11 public repo hygiene and V2 transition record.
- FP-0077 is the shipped F10/v1 public launch handoff record.
- FP-0076 is the shipped F9 read-only product UI launch-polish record.
- FP-0075 is the shipped F8 future-scope triage record.
- FP-0074 is the shipped F7 launch-readiness record.
- FP-0050 through FP-0073 are shipped F6 records.

F12 is shipped through FP-0079. [FP-0080](plans/FP-0080-evidence-index-and-document-map-foundation.md) is the shipped first V2A EvidenceIndex and document-map foundation record. [FP-0081](plans/FP-0081-document-precision-adapters-foundation.md) is the shipped V2B document precision adapters foundation record for one narrow deterministic policy/covenant TextPdfAdapter over EvidenceIndex. [FP-0082](plans/FP-0082-read-only-mcp-chatgpt-evidence-app-alpha.md) is the shipped V2C local/internal read-only evidence-tool contract and direct proof record. [FP-0083](plans/FP-0083-oss-demo-self-host-security-baseline.md) is the shipped OSS demo/self-host/security baseline documentation record. [FP-0084](plans/FP-0084-evidence-atlas-ui-foundation.md) is the shipped V2D read-only Evidence Atlas UI foundation record. [FP-0085](plans/FP-0085-bounded-llm-orchestration-foundation.md) is the shipped V2E local/internal proof-only bounded LLM orchestration foundation record. [FP-0086](plans/FP-0086-benchmark-community-pack-foundation.md) is the shipped V2F docs/proof-only benchmark/community manifest foundation record. [FP-0087](plans/FP-0087-read-only-chatgpt-app-mcp-master-plan.md) is the shipped V2G local proof-only read-only ChatGPT App/MCP contract and MCP descriptor/response-envelope foundation record. [FP-0088](plans/FP-0088-read-only-chatgpt-app-mcp-premium-ui-security-master-plan.md) is the shipped V2H docs-only premium UI/security readiness and proof-gate compatibility plan. [FP-0089](plans/FP-0089-read-only-chatgpt-app-mcp-premium-ui-design-system-master-plan.md) is the shipped V2I docs-only premium UI design-system readiness and proof-gate compatibility plan. [FP-0090](plans/FP-0090-read-only-chatgpt-app-mcp-premium-ui-implementation-master-plan.md) is the shipped V2J docs-only premium UI implementation readiness and proof-gate compatibility plan. [FP-0091](plans/FP-0091-read-only-chatgpt-app-mcp-premium-ui-component-foundation.md) is the shipped V2K local/proof-only/read-only premium UI component foundation plan. [FP-0092](plans/FP-0092-read-only-chatgpt-app-mcp-premium-ui-composition-accessibility-foundation.md) is the shipped V2L local/proof-only/read-only premium UI composition and accessibility foundation plan. [FP-0093](plans/FP-0093-read-only-chatgpt-app-mcp-premium-ui-preview-route-master-plan.md) is the shipped docs-only V2M local UI preview route master-plan. [FP-0094](plans/FP-0094-read-only-chatgpt-app-mcp-premium-ui-preview-route-foundation.md) is the shipped V2N local/proof-only/read-only preview route foundation at `apps/web/app/read-only-app-mcp-preview/page.tsx`. [FP-0095](plans/FP-0095-read-only-chatgpt-app-mcp-premium-ui-preview-route-state-matrix-master-plan.md) is the shipped docs-only V2O local UI preview route state-matrix and visual QA master-plan. [FP-0096](plans/FP-0096-read-only-chatgpt-app-mcp-premium-ui-preview-route-state-matrix-foundation.md) is the shipped V2P local/proof-only/read-only preview route state-matrix foundation on the existing route only. [FP-0097](plans/FP-0097-read-only-chatgpt-app-mcp-premium-ui-preview-route-visual-qa-foundation.md) is the shipped V2Q local/proof-only/read-only preview route visual QA and accessibility foundation on that existing route only. [FP-0098](plans/FP-0098-read-only-chatgpt-app-mcp-public-app-readiness-master-plan.md) is the shipped V2R docs-only public-app readiness/security/submission-boundary master plan and proof-gate compatibility record. [FP-0099](plans/FP-0099-read-only-chatgpt-app-mcp-public-app-security-threat-model-master-plan.md) is the shipped V2S docs-only public-app security threat-model/platform-boundary master plan and proof-gate compatibility record.

## Internal Scaffolding

The root package name remains `pocket-cto`, and packages remain under `@pocket-cto/*`. Treat those as internal scaffolding. Do not rename package scopes, imports, root `package.json`, database names, service names, scripts, GitHub modules, or engineering-twin modules without a dedicated future plan.

## Do Not Start From This File Alone

Do not extend EvidenceIndex or evidence-tool behavior from this file alone; follow FP-0080 for the shipped V2A foundation, FP-0081 for the shipped V2B precision-adapter boundary, FP-0082 for the shipped V2C local read-only tool-contract boundary, FP-0083 for the shipped OSS baseline docs, FP-0084 for the shipped V2D Evidence Atlas UI foundation boundary, FP-0085 for the shipped V2E bounded LLM orchestration foundation, FP-0086 for the shipped V2F benchmark/community foundation, FP-0087 for the shipped V2G local proof-only ChatGPT App/MCP contract and descriptor/envelope boundary, FP-0088 only for docs-only premium UI/security readiness plus proof-gate compatibility, FP-0089 only for docs-only premium UI design-system readiness plus proof-gate compatibility, FP-0090 only for docs-only premium UI implementation readiness plus proof-gate compatibility, FP-0091 only for local/proof-only/read-only UI components under `apps/web/components/read-only-app-mcp/**`, FP-0092 only for local/proof-only/read-only UI composition and accessibility hardening under `apps/web/components/read-only-app-mcp/**`, FP-0093 only for docs-only local UI preview route planning, FP-0094 only for the single local/proof-only/read-only preview route at `apps/web/app/read-only-app-mcp-preview/page.tsx`, FP-0095 only for docs-only local preview route state-matrix and visual QA planning, FP-0096 only for local/proof-only/read-only state-matrix rendering on that existing preview route, shipped FP-0097 only for local/proof-only/read-only screenshotless visual QA/accessibility hardening on that existing preview route, FP-0098 only for docs-only public-app readiness/security/submission-boundary planning plus proof-gate compatibility, and FP-0099 only for docs-only public-app security threat-model/platform-boundary planning plus proof-gate compatibility. Do not start additional route code, API routes, backend routes, endpoints, persistence, broad adapters, eval datasets, fixtures, sample data, source-pack behavior, F6V provider integration, F6X actual certification, deeper PDF/OCR/vector search beyond FP-0081, public ChatGPT App implementation, MCP server implementation, Apps SDK implementation, OAuth, app submission, OpenAI vector/file-search integration, OpenAI API/model integration, iOS, OpenClaw, deployment, external communications, package-scope renaming, product runtime behavior beyond a named Finance Plan, schema/routes outside a named plan, finance writes, source mutation, generated product prose, runtime-Codex finance output, or autonomous action from this file alone. V2E expansion beyond FP-0085's local/internal proof-only boundaries, V2F expansion beyond FP-0086's docs/proof-only benchmark/community manifest foundation, V2G expansion beyond FP-0087's local proof-only contract and descriptor/envelope foundation, FP-0088 implementation beyond readiness planning, FP-0089 implementation beyond readiness planning, FP-0090 implementation beyond docs/proof-gate readiness, any FP-0091 expansion beyond local component-only code, any FP-0092 expansion beyond local composition/accessibility hardening, any FP-0093 expansion beyond docs-only preview-route planning, any FP-0094 expansion beyond its single local preview route, any FP-0095 expansion beyond docs-only state-matrix planning, any FP-0096 expansion beyond the existing local preview route state matrix, any FP-0097 expansion beyond existing-route visual QA/accessibility hardening, any FP-0098 expansion beyond readiness/security/submission-boundary planning, and any FP-0099 expansion beyond security threat-model/platform-boundary planning remain future-plan-only.
