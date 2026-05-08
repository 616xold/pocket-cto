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

F12 is shipped through FP-0079. [FP-0080](plans/FP-0080-evidence-index-and-document-map-foundation.md) is the shipped first V2A EvidenceIndex and document-map foundation record. [FP-0081](plans/FP-0081-document-precision-adapters-foundation.md) is the shipped V2B document precision adapters foundation record for one narrow deterministic policy/covenant TextPdfAdapter over EvidenceIndex. [FP-0082](plans/FP-0082-read-only-mcp-chatgpt-evidence-app-alpha.md) is the shipped V2C local/internal read-only evidence-tool contract and direct proof record.

## Internal Scaffolding

The root package name remains `pocket-cto`, and packages remain under `@pocket-cto/*`. Treat those as internal scaffolding. Do not rename package scopes, imports, root `package.json`, database names, service names, scripts, GitHub modules, or engineering-twin modules without a dedicated future plan.

## Do Not Start From This File Alone

Do not extend EvidenceIndex or evidence-tool behavior from this file alone; follow FP-0080 for the shipped V2A foundation, FP-0081 for the shipped V2B precision-adapter boundary, and FP-0082 for the shipped V2C local read-only tool-contract boundary. Do not start routes, UI, persistence, broad adapters, F6V provider integration, F6X actual certification, deeper PDF/OCR/vector search beyond FP-0081, public ChatGPT App implementation, MCP server implementation, Apps SDK implementation, OpenAI vector/file-search integration, iOS, OpenClaw, deployment, external communications, package-scope renaming, product runtime behavior beyond the active plan, schema/routes outside a named plan, UI, finance writes, source mutation, generated product prose, LLM orchestration, runtime-Codex finance output, or autonomous action from this file alone.
