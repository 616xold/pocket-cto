# Pocket CFO Codex Operator Guide

This guide is for Codex and human operators working in this repository. The human-facing product overview is [README.md](README.md).

## Active Docs Order

Read active docs in this order before meaningful work:

1. [START_HERE.md](START_HERE.md)
2. [README.md](README.md)
3. [CODEX_README.md](CODEX_README.md)
4. [docs/PROJECT_STATE.md](docs/PROJECT_STATE.md)
5. [docs/V2_BOUNDARY.md](docs/V2_BOUNDARY.md)
6. [docs/ACTIVE_DOCS.md](docs/ACTIVE_DOCS.md)
7. [SECURITY.md](SECURITY.md)
8. [PRIVACY.md](PRIVACY.md)
9. [CONTRIBUTING.md](CONTRIBUTING.md)
10. [AGENTS.md](AGENTS.md)
11. [PLANS.md](PLANS.md)
12. [WORKFLOW.md](WORKFLOW.md)
13. [plans/ROADMAP.md](plans/ROADMAP.md)
14. the unfinished `plans/FP-*.md` file if one exists
15. [docs/security/finance-data-threat-model.md](docs/security/finance-data-threat-model.md)
16. [docs/security/read-only-agent-threat-model.md](docs/security/read-only-agent-threat-model.md)
17. [docs/demo/demo-data-policy.md](docs/demo/demo-data-policy.md)
18. [docs/demo/local-demo-operator-journey.md](docs/demo/local-demo-operator-journey.md)
19. [docs/ops/self-host-baseline.md](docs/ops/self-host-baseline.md)
20. [docs/ops/local-dev.md](docs/ops/local-dev.md)
21. [docs/ops/source-ingest-and-cfo-wiki.md](docs/ops/source-ingest-and-cfo-wiki.md)
22. [docs/ops/codex-app-server.md](docs/ops/codex-app-server.md)
23. [docs/benchmarks/seeded-missions.md](docs/benchmarks/seeded-missions.md)
24. [evals/README.md](evals/README.md)

Read [docs/ops/github-app-setup.md](docs/ops/github-app-setup.md) only when GitHub connector work is explicitly in scope.

## Starting A Codex Local Thread

Open the repository root in the Codex app and start one local thread per slice. A good first prompt asks Codex to:

- read the active docs order above
- identify the active unfinished Finance Plan, if any
- confirm the current branch and clean worktree
- state the active phase and forbidden scopes
- implement only the next unchecked slice
- update the active Finance Plan as work progresses
- run the validation ladder named by the plan

Do not start from archived Pocket CTO material or from chat memory.

## Branch Naming Pattern

Use `codex/<phase-and-slice>-local-vN` unless the user gives an exact branch. Do not create a new branch when the user says the current branch is already correct.

## Finance Plan Lifecycle

Meaningful work uses exactly one active `plans/FP-*.md` file.

- If an unfinished FP exists, continue that plan.
- If no unfinished FP exists, read the latest shipped closeout or handoff record and create the next Finance Plan before code changes.
- Do not create the next FP number during closeout unless the active plan explicitly asks for it.
- Update `Progress`, `Surprises & Discoveries`, `Decision Log`, `Validation and Acceptance`, `Artifacts and Notes`, and `Outcomes & Retrospective` before declaring the slice shipped.

## Deciding Whether An Unfinished FP Exists

Use the active docs first, then inspect `plans/FP-*.md`.

An FP is unfinished when it says it is active, has unchecked implementation/closeout boxes, or its retrospective says the implementation has not started or has not shipped. A shipped FP is historical truth, not a new implementation mandate.

For F11, [plans/FP-0078-public-repo-hygiene-and-v2-transition.md](plans/FP-0078-public-repo-hygiene-and-v2-transition.md) is the public repo hygiene and V2 transition record. Continue it while it is unfinished; after closeout, treat it as shipped history. Do not create FP-0079 in the F11 slice.

## Required Operator Guards

Invoke the Pocket CFO operator guards that match the slice:

- `$finance-plan-orchestrator`
- `$modular-architecture-guard`
- `$source-provenance-guard`
- `$cfo-wiki-maintainer`
- `$evidence-bundle-auditor`
- `$f6-monitoring-semantics-guard`
- `$validation-ladder-composer`
- `$pocket-cfo-handoff-auditor`

Use `$execplan-orchestrator` only for a separate step-by-step execution document when the user or plan asks for one.

## When GitHub Connector Guard Is In Scope

`$github-app-integration-guard` is in scope only for product GitHub connector behavior: connector modules, GitHub app setup, webhook behavior, issue/PR ingestion, GitHub-backed source boundaries, or GitHub app docs.

Routine repository operations such as `git status`, `git commit`, `git push`, and opening a PR with `gh` are not product GitHub connector behavior. Keep GitHub as an optional connector, not the Pocket CFO product center.

## Validation Ladder Rules

Use the active Finance Plan's validation ladder. For F11, run the required DB-backed source-pack proofs, CFO Wiki smokes, Finance Twin smokes, monitoring/readiness smokes, package specs, web tests, lint, typecheck, test, and `pnpm ci:repro:current`.

If validation fails:

- do not widen scope
- do not add runtime behavior to make docs pass
- record the exact failing command and log location
- recommend the narrowest corrective slice
- do not publish a partially green branch

After FP closeout edits, rerun at minimum:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm ci:repro:current
```

## Keeping Plans Current

Update the active FP after meaningful progress and at closeout. Record:

- what changed
- what stayed out of scope
- validation commands run, skipped, or rerun
- surprises that affect sequence
- replay/evidence implications
- exact next recommendation

Docs-only slices should explicitly say they created no mission replay events and no product runtime behavior.

## Forbidden Scopes

Do not add product runtime behavior without an active plan. For docs-only closeout or QA slices, do not add code, UI, backend routes, web API routes, schema, migrations, package scripts, smoke aliases, eval datasets, fixtures, monitor families, discovery families, implementation scaffolding, provider integration, certification, deployment, external communications, source mutation, finance writes, generated product prose, or autonomous action.

Do not extend V2D beyond the shipped FP-0084 read-only Evidence Atlas UI boundary, do not expand V2E beyond the shipped FP-0085 local/internal proof-only bounded LLM orchestration foundation, do not expand V2F beyond the shipped FP-0086 docs/proof-only benchmark/community manifest foundation, and do not expand V2G beyond the shipped FP-0087 local proof-only read-only ChatGPT App/MCP contract and descriptor/envelope foundation. FP-0086 shipped SafeDemoDataPolicy first, CommunityPackManifest and BenchmarkTask contracts without datasets, and a direct proof command without package scripts or smoke aliases. FP-0087 shipped pure domain contracts, local proof-only MCP descriptors, app/MCP response-envelope contracts, and direct proof commands only; it does not authorize public app implementation or submission. Do not add eval datasets, fixtures, sample data, source-pack behavior, package scripts, smoke aliases, model calls, public ChatGPT App, remote MCP deployment, Apps SDK UI, OAuth, app submission, F6V, F6X, deeper PDF/OCR/vector/PageIndex/OpenAI file-search work, iOS, OpenClaw, deployment, or external communications from shipped docs alone.

## Internal Package Names

The internal package scope remains `@pocket-cto/*`, and the root package name remains `pocket-cto`. Treat those names as historical implementation scaffolding. Do not rename package scopes, imports, database names, service names, scripts, or root `package.json` without a dedicated future plan.

## Stale Pocket CTO And Engineering Docs

Pocket CTO-era docs and engineering-first modules may remain as historical reference or internal scaffolding. Clarify active/public docs when wording could confuse Pocket CFO direction, but do not rewrite archived history broadly, delete GitHub modules, delete engineering-twin modules, or treat old GitHub-first product assumptions as active truth.

## Avoiding Broad Rewrites

Patch the smallest set of active docs that are directly stale. Move ledger detail into [docs/PROJECT_STATE.md](docs/PROJECT_STATE.md) instead of repeating it everywhere. Prefer links to shipped FP records over copying every phase paragraph into new docs.

## README vs PROJECT_STATE vs V2_BOUNDARY

- [README.md](README.md): human-facing landing page, setup, product definition, architecture, boundaries, roadmap summary, and links to contribution/security/privacy/demo/self-host policy.
- [docs/PROJECT_STATE.md](docs/PROJECT_STATE.md): current shipped-state ledger, fixed family lists, source-pack proof commands, future-only tracks, internal scaffolding note.
- [docs/V2_BOUNDARY.md](docs/V2_BOUNDARY.md): V2 north star, allowed boundaries, forbidden boundaries, LLM/agent rules, phase sequence, acceptance criteria.

## Final Handoff Responses

A final handoff should name:

- verdict
- stale wording fixed
- docs created
- files changed
- validation results
- branch
- commit hash
- push status
- PR status
- exact next recommendation

For Pocket CFO closeouts, include the handoff audit facts without hiding failures or claiming validation that did not pass.

## Runtime Reminder

No runtime or product behavior should be added without an active Finance Plan that names exact scope, evidence contracts, replay implications, validation, and safety boundaries.
