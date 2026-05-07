# Active Docs Boundary

Use this file to know which docs are active, which docs are historical reference, and where current Pocket CFO truth lives.

## Active Guidance Order

Treat these as active product and implementation guidance, in this order:

1. [START_HERE.md](../START_HERE.md)
2. [README.md](../README.md)
3. [CODEX_README.md](../CODEX_README.md)
4. [docs/PROJECT_STATE.md](PROJECT_STATE.md)
5. [docs/V2_BOUNDARY.md](V2_BOUNDARY.md)
6. [AGENTS.md](../AGENTS.md)
7. [PLANS.md](../PLANS.md)
8. [WORKFLOW.md](../WORKFLOW.md)
9. [plans/ROADMAP.md](../plans/ROADMAP.md)
10. the unfinished `plans/FP-*.md` file if one exists
11. [docs/ops/local-dev.md](ops/local-dev.md)
12. [docs/ops/source-ingest-and-cfo-wiki.md](ops/source-ingest-and-cfo-wiki.md)
13. [docs/ops/codex-app-server.md](ops/codex-app-server.md)
14. [docs/benchmarks/seeded-missions.md](benchmarks/seeded-missions.md)
15. [evals/README.md](../evals/README.md)

Read [docs/ops/github-app-setup.md](ops/github-app-setup.md) only when GitHub connector work is explicitly in scope.

## Current Plan Truth

[plans/FP-0079-manual-ui-demo-readiness-audit.md](../plans/FP-0079-manual-ui-demo-readiness-audit.md) is the shipped F12 manual UI/demo-readiness audit record. It created `docs/qa/v1-ui-demo-readiness-audit.md`, recorded the local browser screenshot-capture limitation, applied only direct read-only copy fixes proven by the audit, and added no product runtime behavior.

[plans/FP-0078-public-repo-hygiene-and-v2-transition.md](../plans/FP-0078-public-repo-hygiene-and-v2-transition.md) is the shipped F11 public repo hygiene and V2 transition record.

FP-0077 is the shipped F10/v1 public launch handoff record. FP-0076 is shipped F9 read-only UI truthfulness polish. FP-0075 is shipped F8 future-scope triage. FP-0074 is shipped F7 launch-readiness. FP-0050 through FP-0073 remain shipped F6 records.

[plans/FP-0080-evidence-index-and-document-map-foundation.md](../plans/FP-0080-evidence-index-and-document-map-foundation.md) is the shipped first V2A EvidenceIndex/document-map foundation record. It records the original docs-and-plan contract and the narrow native deterministic read-only implementation closeout.

[plans/FP-0081-document-precision-adapters-foundation.md](../plans/FP-0081-document-precision-adapters-foundation.md) is the shipped V2B document precision adapters foundation record. It ships one deterministic policy/covenant TextPdfAdapter over EvidenceIndex with direct proof/spec coverage, while keeping broad PDF/OCR/vector/PageIndex/MCP/ChatGPT App/provider/certification/UI/runtime work future-only.

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
- ChatGPT App/MCP
- iOS
- OpenClaw
- deployment/external communications
- package-scope renaming
- product runtime behavior outside the active Finance Plan, source mutation, finance writes, or autonomous action

F12 is shipped through FP-0079, the first V2A EvidenceIndex/document-map foundation is shipped through FP-0080, and the first V2B document precision adapter foundation is shipped through FP-0081. Anything beyond FP-0081 remains blocked until a future Finance Plan names exact scope.

## Update Rule

When product direction, operating procedure, or milestone sequencing changes, update the active doc in the same slice or archive the stale doc. Prefer linking to [docs/PROJECT_STATE.md](PROJECT_STATE.md) for shipped-state detail instead of copying the full plan ledger into every active doc.
