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
- ChatGPT App/MCP implementation beyond the shipped local/internal FP-0082 contract
- iOS
- OpenClaw
- deployment/external communications
- package-scope renaming
- product runtime behavior outside the active Finance Plan, source mutation, finance writes, or autonomous action

F12 is shipped through FP-0079, the first V2A EvidenceIndex/document-map foundation is shipped through FP-0080, the first V2B document precision adapter foundation is shipped through FP-0081, the first V2C local/internal read-only evidence-tool contract is shipped through FP-0082, and the OSS demo/self-host/security baseline is shipped through FP-0083. Public ChatGPT App/MCP deployment, Apps SDK UI, OAuth, app submission, V2D UI, V2E LLM orchestration, and anything beyond the FP-0082 local contract remain blocked until a future Finance Plan names exact scope.

## Update Rule

When product direction, operating procedure, or milestone sequencing changes, update the active doc in the same slice or archive the stale doc. Prefer linking to [docs/PROJECT_STATE.md](PROJECT_STATE.md) for shipped-state detail instead of copying the full plan ledger into every active doc.
