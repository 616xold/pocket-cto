# Active Docs Boundary

Use this file to know which docs are active, which docs are historical reference, and where current Pocket CFO truth lives.

## Active Guidance Order

Treat these as active product and implementation guidance, in this order:

1. [START_HERE.md](../START_HERE.md)
2. [README.md](../README.md)
3. [CODEX_README.md](../CODEX_README.md)
4. [docs/PROJECT_STATE.md](PROJECT_STATE.md)
5. [docs/V2_BOUNDARY.md](V2_BOUNDARY.md)
6. [SECURITY.md](../SECURITY.md)
7. [PRIVACY.md](../PRIVACY.md)
8. [CONTRIBUTING.md](../CONTRIBUTING.md)
9. [AGENTS.md](../AGENTS.md)
10. [PLANS.md](../PLANS.md)
11. [WORKFLOW.md](../WORKFLOW.md)
12. [plans/ROADMAP.md](../plans/ROADMAP.md)
13. the unfinished `plans/FP-*.md` file if one exists
14. [docs/security/finance-data-threat-model.md](security/finance-data-threat-model.md)
15. [docs/security/read-only-agent-threat-model.md](security/read-only-agent-threat-model.md)
16. [docs/demo/demo-data-policy.md](demo/demo-data-policy.md)
17. [docs/demo/local-demo-operator-journey.md](demo/local-demo-operator-journey.md)
18. [docs/ops/self-host-baseline.md](ops/self-host-baseline.md)
19. [docs/ops/local-dev.md](ops/local-dev.md)
20. [docs/ops/source-ingest-and-cfo-wiki.md](ops/source-ingest-and-cfo-wiki.md)
21. [docs/ops/codex-app-server.md](ops/codex-app-server.md)
22. [docs/benchmarks/seeded-missions.md](benchmarks/seeded-missions.md)
23. [evals/README.md](../evals/README.md)

Read [docs/ops/github-app-setup.md](ops/github-app-setup.md) only when GitHub connector work is explicitly in scope.

## Current Plan Truth

[plans/FP-0079-manual-ui-demo-readiness-audit.md](../plans/FP-0079-manual-ui-demo-readiness-audit.md) is the shipped F12 manual UI/demo-readiness audit record. It created `docs/qa/v1-ui-demo-readiness-audit.md`, recorded the local browser screenshot-capture limitation, applied only direct read-only copy fixes proven by the audit, and added no product runtime behavior.

[plans/FP-0078-public-repo-hygiene-and-v2-transition.md](../plans/FP-0078-public-repo-hygiene-and-v2-transition.md) is the shipped F11 public repo hygiene and V2 transition record.

FP-0077 is the shipped F10/v1 public launch handoff record. FP-0076 is shipped F9 read-only UI truthfulness polish. FP-0075 is shipped F8 future-scope triage. FP-0074 is shipped F7 launch-readiness. FP-0050 through FP-0073 remain shipped F6 records.

[plans/FP-0080-evidence-index-and-document-map-foundation.md](../plans/FP-0080-evidence-index-and-document-map-foundation.md) is the shipped first V2A EvidenceIndex/document-map foundation record. It records the original docs-and-plan contract and the narrow native deterministic read-only implementation closeout.

[plans/FP-0081-document-precision-adapters-foundation.md](../plans/FP-0081-document-precision-adapters-foundation.md) is the shipped V2B document precision adapters foundation record. It ships one deterministic policy/covenant TextPdfAdapter over EvidenceIndex with direct proof/spec coverage, while keeping broad PDF/OCR/vector/PageIndex/MCP/ChatGPT App/provider/certification/UI/runtime work future-only.

[plans/FP-0082-read-only-mcp-chatgpt-evidence-app-alpha.md](../plans/FP-0082-read-only-mcp-chatgpt-evidence-app-alpha.md) is the shipped V2C local/internal read-only evidence-tool contract record. It adds a pure shared `EvidenceToolResponse` contract, local read-only search/fetch/inspect functions over existing EvidenceIndex/TextPdfAdapter artifacts, focused specs, and a direct proof command without implementing a public MCP server, ChatGPT App, Apps SDK UI, routes, schema, migrations, package scripts, evals, fixtures, provider work, certification, deployment, source mutation, finance writes, generated advice, LLM orchestration, runtime-Codex finance output, or autonomous action.

[plans/FP-0083-oss-demo-self-host-security-baseline.md](../plans/FP-0083-oss-demo-self-host-security-baseline.md) is the shipped OSS demo/self-host/security baseline documentation record. It created `SECURITY.md`, `PRIVACY.md`, `CONTRIBUTING.md`, demo-data policy, local demo journey, self-host guidance, finance-data threat model, and read-only-agent threat model docs before any public ChatGPT App, remote MCP, Apps SDK UI, OAuth, app submission, V2D UI, V2E LLM orchestration, V2F community packs, provider integration, certification, deployment, external communications, package-scope rename, source mutation, finance writes, generated product prose, runtime-Codex finance output, or autonomous action.

[plans/FP-0084-evidence-atlas-ui-foundation.md](../plans/FP-0084-evidence-atlas-ui-foundation.md) is the shipped V2D read-only Evidence Atlas UI foundation record. It adds one local `apps/web` route at `/evidence-atlas`, modular read-only atlas components, a web-only atlas read-model helper, and focused specs over existing EvidenceIndex, V2B TextPdfAdapter, V2C evidence-tool, Finance Twin, CFO Wiki, mission answer, proof bundle, and source coverage contracts. It adds no backend route, web API route, schema, migrations, package scripts, fixtures, sample data, public app, MCP, OpenAI vector/file-search, source mutation, finance write, generated product prose, LLM orchestration, runtime-Codex finance output, or autonomous action.

[plans/FP-0085-bounded-llm-orchestration-foundation.md](../plans/FP-0085-bounded-llm-orchestration-foundation.md) is the shipped V2E local/internal proof-only bounded LLM orchestration foundation record. It adds pure contracts, a proof-only QueryPlanner over the fixed read-only V2C tool allowlist, deterministic evidence selection handoff, schema-constrained bounded summary/refusal contracts, missing-citation refusal, unsupported-evidence refusal, unsafe-action refusal, local proof audit events, and evidence-faithfulness/missing-citation/unsafe-action deterministic grade posture. It adds no routes, UI, schema, migrations, package scripts, smoke aliases, eval datasets, fixtures, sample data, public app/MCP, OpenAI API/vector/file-search, OCR, PageIndex, provider behavior, certification, delivery, deployment, external communications, source mutation, finance writes, generated advice, runtime-Codex finance output, or autonomous action.

[plans/FP-0086-benchmark-community-pack-foundation.md](../plans/FP-0086-benchmark-community-pack-foundation.md) is the shipped V2F docs/proof-only benchmark/community manifest foundation record. It ships SafeDemoDataPolicy first, SyntheticFinanceSourcePolicy, CommunityPackManifest, BenchmarkTask taxonomy, BenchmarkCase placeholder rules, BenchmarkProof, BenchmarkNoRuntimeBoundary, privacy boundaries, contributor-challenge boundaries, focused specs, and a direct proof command without adding UI, routes, schema, migrations, package scripts, smoke aliases, eval datasets, fixtures, sample data, source packs, source-pack mutations, OpenAI API/model calls, public ChatGPT App/MCP, Apps SDK UI, OAuth, app submission, provider behavior, certification, delivery, deployment, external communications, source mutation, finance writes, generated advice, runtime-Codex finance output, or autonomous action.

[plans/FP-0087-read-only-chatgpt-app-mcp-master-plan.md](../plans/FP-0087-read-only-chatgpt-app-mcp-master-plan.md) is the shipped V2G local proof-only read-only ChatGPT App/MCP contract and MCP descriptor/response-envelope foundation record. It adds typed domain contracts for read-only app/MCP concepts, the exact read-only MCP allowlist, forbidden tools and renamed-equivalent rejection, local proof-only MCP descriptors, strict descriptor input/output schemas, evidence query/fetch/source-coverage/capability-boundary fetch contracts, app/MCP response envelopes, refusal posture, prompt-injection/privacy/no-runtime boundaries, deferred OAuth/submission/provider-certification boundaries, threat-model questions, focused specs, typed V2F boundary hardening, and direct proof commands without adding public app implementation, MCP server runtime, endpoints, Apps SDK iframe/UI, OAuth, app submission, schema, migrations, package scripts, smoke aliases, eval datasets, fixtures, sample data, public demo data, source-pack behavior, OpenAI API/model calls, hosted tools, vector/file-search integration, OCR, PageIndex, provider behavior, certification, delivery, deployment, external communications, source mutation, finance writes, generated advice, runtime-Codex finance output, or autonomous action.

[plans/FP-0088-read-only-chatgpt-app-mcp-premium-ui-security-master-plan.md](../plans/FP-0088-read-only-chatgpt-app-mcp-premium-ui-security-master-plan.md) is the shipped V2H docs-and-plan plus proof-gate compatibility record. It defines premium read-only ChatGPT App/MCP UI and security readiness requirements and updates V2F/V2G proof posture to accept exactly that docs-only successor while keeping public app implementation, MCP server runtime, endpoints, Apps SDK iframe/UI, OAuth, app submission, schema, migrations, package scripts, smoke aliases, eval datasets, fixtures, sample data, public demo data, source-pack behavior, OpenAI API/model calls, provider/certification/deployment, external communications, source mutation, finance writes, generated advice, runtime-Codex finance output, and autonomous action out of scope.

[plans/FP-0089-read-only-chatgpt-app-mcp-premium-ui-design-system-master-plan.md](../plans/FP-0089-read-only-chatgpt-app-mcp-premium-ui-design-system-master-plan.md) is the shipped V2I docs-and-plan plus proof-gate compatibility record. It defines premium read-only ChatGPT App/MCP UI design-system readiness requirements, future design tokens, component taxonomy, evidence hierarchy, accessibility bars, refusal-state grammar, and design QA gates while keeping UI implementation, Apps SDK iframe/UI, public app implementation, MCP server runtime, endpoints, OAuth, app submission, schema, migrations, package scripts, smoke aliases, eval datasets, fixtures, sample data, public demo data, source-pack behavior, OpenAI API/model calls, provider/certification/deployment, external communications, source mutation, finance writes, generated advice, runtime-Codex finance output, and autonomous action out of scope.

[plans/FP-0090-read-only-chatgpt-app-mcp-premium-ui-implementation-master-plan.md](../plans/FP-0090-read-only-chatgpt-app-mcp-premium-ui-implementation-master-plan.md) is the shipped V2J docs-and-plan plus proof-gate compatibility record. It defines the future premium read-only ChatGPT App/MCP UI implementation boundary, primary states, screenshot review, accessibility acceptance, evidence hierarchy acceptance, and no-action-control rules while keeping UI code, Apps SDK iframe/UI, public app implementation, MCP server runtime, endpoints, OAuth, app submission, schema, migrations, package scripts, smoke aliases, eval datasets, fixtures, sample data, public demo data, source-pack behavior, OpenAI API/model calls, provider/certification/deployment, external communications, source mutation, finance writes, generated advice, runtime-Codex finance output, and autonomous action out of scope.

[plans/FP-0091-read-only-chatgpt-app-mcp-premium-ui-component-foundation.md](../plans/FP-0091-read-only-chatgpt-app-mcp-premium-ui-component-foundation.md) is the shipped V2K local/proof-only/read-only premium UI component foundation. It opens actual local React component code under `apps/web/components/read-only-app-mcp/**` only, plus focused tests and the minimum proof-gate bridge, while keeping routes, endpoints, remote MCP, Apps SDK iframe/UI resources, OAuth, app submission, public app implementation, schema, migrations, package scripts, eval datasets, fixtures, sample data, source packs, OpenAI API/model calls, provider/certification/deployment, external communications, source mutation, finance writes, generated product prose, runtime-Codex finance output, and autonomous action out of scope.

[plans/FP-0092-read-only-chatgpt-app-mcp-premium-ui-composition-accessibility-foundation.md](../plans/FP-0092-read-only-chatgpt-app-mcp-premium-ui-composition-accessibility-foundation.md) is the shipped V2L local/proof-only/read-only premium UI composition and accessibility foundation. It composes the FP-0091 component set into a local evidence hierarchy, adds heading-level controls, scoped section IDs, accessibility, contrast/token, responsive, raw/private-field, no-control, and no-advice-copy tests, and updates only the minimum proof-gate bridge while keeping routes, endpoints, remote MCP, Apps SDK iframe/UI resources, OAuth, app submission, public app implementation, schema, migrations, package scripts, eval datasets, fixtures, sample data, source packs, OpenAI API/model calls, provider/certification/deployment, external communications, source mutation, finance writes, generated product prose, runtime-Codex finance output, and autonomous action out of scope.

[plans/FP-0093-read-only-chatgpt-app-mcp-premium-ui-preview-route-master-plan.md](../plans/FP-0093-read-only-chatgpt-app-mcp-premium-ui-preview-route-master-plan.md) is the shipped V2M docs-and-plan plus proof-gate compatibility record for the local read-only premium UI preview route. It planned one local preview route boundary only and kept route code, app routes, API routes, backend routes, endpoints, remote MCP, Apps SDK iframe/UI resources, OAuth, app submission, public app implementation, schema, migrations, package scripts, eval datasets, fixtures, sample data, source packs, OpenAI API/model calls, provider/certification/deployment, external communications, source mutation, finance writes, generated product prose, runtime-Codex finance output, autonomous action, screenshots, images, and public app assets out of scope.

[plans/FP-0094-read-only-chatgpt-app-mcp-premium-ui-preview-route-foundation.md](../plans/FP-0094-read-only-chatgpt-app-mcp-premium-ui-preview-route-foundation.md) is the shipped V2N local/proof-only/read-only premium UI preview route foundation. It adds exactly one local web page route at `apps/web/app/read-only-app-mcp-preview/page.tsx`, renders the shipped FP-0091/FP-0092 component composition with in-memory synthetic contract-shaped examples, adds focused route tests, and updates the proof-gate bridge while keeping web API routes, backend routes, endpoints, remote MCP, Apps SDK iframe/UI resources, OAuth, app submission, public app implementation, schema, migrations, package scripts, eval datasets, fixtures, sample data, source packs, OpenAI API/model calls, provider/certification/deployment, external communications, source mutation, finance writes, generated product prose, runtime-Codex finance output, autonomous action, screenshots, images, public assets, and route/runtime expansion out of scope.

[plans/FP-0095-read-only-chatgpt-app-mcp-premium-ui-preview-route-state-matrix-master-plan.md](../plans/FP-0095-read-only-chatgpt-app-mcp-premium-ui-preview-route-state-matrix-master-plan.md) is the shipped V2O docs-and-plan plus proof-gate compatibility record for future local preview route state-matrix and premium visual QA hardening. It planned future local state coverage, noindex/local-only posture, and visual QA boundaries while keeping route/UI code, web API routes, backend routes, endpoints, remote MCP, Apps SDK iframe/UI resources, OAuth, app submission, public app implementation, schema, migrations, package scripts, eval datasets, fixtures, sample data, source packs, OpenAI API/model calls, provider/certification/deployment, external communications, source mutation, finance writes, generated product prose, runtime-Codex finance output, autonomous action, screenshots, images, public assets, and FP-0096 out of scope.

[plans/FP-0096-read-only-chatgpt-app-mcp-premium-ui-preview-route-state-matrix-foundation.md](../plans/FP-0096-read-only-chatgpt-app-mcp-premium-ui-preview-route-state-matrix-foundation.md) is the shipped V2P local/proof-only/read-only premium UI preview route state-matrix foundation. It extends only the existing local preview route at `apps/web/app/read-only-app-mcp-preview/page.tsx` with synthetic in-memory answer/refusal/loading/empty/error/privacy/no-runtime examples, route tests, and the minimum proof-gate bridge while keeping additional app routes, web API routes, backend routes, endpoints, remote MCP, Apps SDK iframe/UI resources, OAuth, app submission, public app implementation, schema, migrations, package scripts, eval datasets, fixtures, sample data, source packs, OpenAI API/model calls, provider/certification/deployment, external communications, source mutation, finance writes, generated product prose, runtime-Codex finance output, autonomous action, screenshots, generated images, public assets, and FP-0097 out of scope.

[plans/FP-0097-read-only-chatgpt-app-mcp-premium-ui-preview-route-visual-qa-foundation.md](../plans/FP-0097-read-only-chatgpt-app-mcp-premium-ui-preview-route-visual-qa-foundation.md) is the shipped V2Q local/proof-only/read-only premium UI preview route visual QA and accessibility foundation. It hardens only the existing local preview route at `apps/web/app/read-only-app-mcp-preview/page.tsx` and local read-only components with screenshotless DOM/style visual QA, text-labelled state posture, accessibility assertions, and the minimum proof-gate bridge while keeping additional app routes, web API routes, backend routes, endpoints, remote MCP, Apps SDK iframe/UI resources, OAuth, app submission, public app implementation, schema, migrations, package scripts, eval datasets, fixtures, sample data, source packs, OpenAI API/model calls, provider/certification/deployment, external communications, source mutation, finance writes, generated product prose, runtime-Codex finance output, autonomous action, screenshots, generated images, public assets, and FP-0098 out of scope.

## Historical Reference

These archived files are reference-only. They may contain reusable implementation ideas, but they are not active product truth:

- `docs/architecture/**`
- `docs/archive/pocket-cto/**`
- `docs/archive/pocket-cto/plans/EP-*.md`
- `docs/archive/pocket-cto/ops/m3-exit-report.md`
- historical `EP-*` plans
- GitHub-first or engineering-first milestone notes
- old Pocket CTO product wording

Historical references must not override active Pocket CFO docs, current code behavior, or the active Finance Plan.

## Conflict Rule

If active docs disagree with historical Pocket CTO docs:

- active docs win for product direction
- current code wins for implemented behavior
- the active Finance Plan decides how to close the gap

Do not claim a finance capability exists until code and acceptance prove it.

## Future-Only Tracks

These remain blocked until a future Finance Plan names exact scope:

- F6V provider integration
- F6X actual certification
- deeper PDF/OCR/vector search beyond the shipped narrow FP-0081 text-PDF precision-adapter candidate
- ChatGPT App/MCP implementation beyond the shipped FP-0097 existing-route local visual QA foundation, shipped FP-0096 existing-route local state-matrix foundation, shipped FP-0095 docs-only state-matrix/visual QA plan, the shipped FP-0094 local preview-route foundation, the shipped FP-0093 route-readiness plan, the shipped FP-0092 local composition/accessibility foundation, the shipped FP-0091 local component-only foundation, the shipped FP-0090 docs-only UI implementation readiness plan, the shipped FP-0089 design-system readiness plan, the shipped FP-0088 UI/security readiness plan, the shipped FP-0087 local proof-only contract and descriptor/envelope foundation, and the shipped local/internal FP-0082 contract
- V2G expansion beyond the shipped FP-0087 local proof-only read-only ChatGPT App/MCP contract and descriptor/envelope boundary
- V2F expansion beyond the shipped FP-0086 docs/proof-only benchmark/community foundation
- V2E expansion beyond the shipped FP-0085 local/internal proof-only bounded LLM orchestration foundation
- iOS
- OpenClaw
- deployment/external communications
- package-scope renaming
- product runtime behavior outside the active Finance Plan, source mutation, finance writes, or autonomous action

F12 is shipped through FP-0079, the first V2A EvidenceIndex/document-map foundation is shipped through FP-0080, the first V2B document precision adapter foundation is shipped through FP-0081, the first V2C local/internal read-only evidence-tool contract is shipped through FP-0082, the OSS demo/self-host/security baseline is shipped through FP-0083, the first V2D Evidence Atlas UI foundation is shipped through FP-0084, the first V2E local/internal proof-only bounded LLM orchestration foundation is shipped through FP-0085, the V2F docs/proof-only benchmark/community manifest foundation is shipped through FP-0086, the V2G local proof-only read-only ChatGPT App/MCP contract and descriptor/envelope foundation is shipped through FP-0087, FP-0088 is shipped for docs-only premium UI/security readiness and proof-gate compatibility, FP-0089 is shipped for docs-only premium UI design-system readiness and proof-gate compatibility, FP-0090 is shipped for docs-only premium UI implementation readiness and proof-gate compatibility, FP-0091 is shipped for local/proof-only/read-only premium UI component foundation, FP-0092 is shipped for local/proof-only/read-only premium UI composition and accessibility foundation, FP-0093 is shipped for docs-only local UI preview-route planning, FP-0094 is shipped for exactly one local/proof-only/read-only preview route foundation, FP-0095 is shipped for docs-only local preview route state-matrix and visual QA planning, FP-0096 is shipped for local/proof-only/read-only state-matrix rendering on the existing preview route, and FP-0097 is shipped for local/proof-only/read-only screenshotless visual QA/accessibility hardening on that existing route. Public ChatGPT App/MCP deployment, Apps SDK UI, OAuth, app submission, route implementation beyond the FP-0094/FP-0096/FP-0097 existing local preview route boundary, state-matrix implementation beyond FP-0096, visual QA implementation beyond FP-0097, V2D expansion beyond FP-0084, V2E expansion beyond FP-0085, V2F expansion beyond FP-0086, V2G expansion beyond FP-0087, FP-0088 implementation beyond readiness planning, FP-0089 implementation beyond readiness planning, FP-0090 implementation beyond readiness planning, FP-0091 implementation beyond local component-only proof scope, FP-0092 implementation beyond local composition/accessibility proof scope, FP-0093 expansion beyond route-readiness planning, FP-0094 expansion beyond its one local preview route, FP-0095 expansion beyond docs-only state-matrix planning, FP-0096 expansion beyond the existing local preview route state matrix, FP-0097 expansion beyond screenshotless visual QA/accessibility hardening, and anything beyond the FP-0082 local contract remain blocked until a future Finance Plan names exact scope.

## Update Rule

When product direction, operating procedure, or milestone sequencing changes, update the active doc in the same slice or archive the stale doc. Prefer linking to [docs/PROJECT_STATE.md](PROJECT_STATE.md) for shipped-state detail instead of copying the full plan ledger into every active doc.
