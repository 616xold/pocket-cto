# Contributing

Pocket CFO is an evidence-native finance discovery and decision system. Contributions should protect source truth, privacy, and review boundaries before adding convenience.

## Active Docs Order

Before meaningful work, read:

1. [START_HERE.md](START_HERE.md)
2. [README.md](README.md)
3. [CODEX_README.md](CODEX_README.md)
4. [docs/PROJECT_STATE.md](docs/PROJECT_STATE.md)
5. [docs/V2_BOUNDARY.md](docs/V2_BOUNDARY.md)
6. [docs/ACTIVE_DOCS.md](docs/ACTIVE_DOCS.md)
7. [SECURITY.md](SECURITY.md)
8. [PRIVACY.md](PRIVACY.md)
9. [AGENTS.md](AGENTS.md)
10. [PLANS.md](PLANS.md)
11. [WORKFLOW.md](WORKFLOW.md)
12. [plans/ROADMAP.md](plans/ROADMAP.md)
13. the active unfinished `plans/FP-*.md` file, if one exists

Use [docs/ops/local-dev.md](docs/ops/local-dev.md), [docs/ops/source-ingest-and-cfo-wiki.md](docs/ops/source-ingest-and-cfo-wiki.md), [docs/ops/codex-app-server.md](docs/ops/codex-app-server.md), and [docs/ops/self-host-baseline.md](docs/ops/self-host-baseline.md) when the slice touches local operation, source ingest, runtime boundaries, demo, or self-host posture.

## Finance Plan Lifecycle

Meaningful work uses exactly one active Finance Plan in `plans/FP-*.md`.

- Continue an unfinished FP when one exists.
- Create a new FP only when no active plan exists and the work is meaningful enough to require one.
- Do not create the next FP number during closeout unless explicitly requested.
- Keep `Progress`, `Surprises & Discoveries`, `Decision Log`, `Validation and Acceptance`, `Artifacts and Notes`, and `Outcomes & Retrospective` current.
- Keep docs-only slices docs-only.

## Branches

Use `codex/<phase-and-slice>-local-vN` unless the maintainer gives an exact branch name.

Do not rename package scopes, imports, root `package.json`, database names, service names, scripts, GitHub modules, or engineering-twin modules without a dedicated future Finance Plan.

## Validation

Run the validation ladder named by the active Finance Plan. For broad slices, expect focused proof commands plus:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm ci:repro:current
```

If validation fails, do not widen scope. Report the exact failing command and recommend the smallest safer correction.

## Data Rules

Do not commit real company data. This includes company exports, bank data, payroll data, customer/vendor data, tax records, legal materials, credentials, tokens, board/lender materials, screenshots with private content, local database dumps, object-store files, or source-pack data derived from a real company.

Demo data must be synthetic, clearly labeled, and reviewed under the policy in [docs/demo/demo-data-policy.md](docs/demo/demo-data-policy.md).

## Forbidden High-Liability Scopes

Do not add any of these without a future named Finance Plan that proves the safety boundary:

- autonomous bank, accounting, tax, legal, certification, close-complete, sign-off, attestation, assurance, provider, delivery, customer-contact, or external communication behavior
- source mutation
- finance writes
- public ChatGPT App implementation
- remote MCP deployment
- Apps SDK UI
- OAuth
- app submission
- OpenAI API, file-search, vector-store, OCR, vector search, or PageIndex integration
- provider integration
- deployment
- generated finance advice or runtime-Codex finance output

Do not delete GitHub or engineering-twin modules without a future plan and replacement proof.

## Proposing Slices

For docs-only slices, name the stale docs, the exact files to change, and the validation commands.

For implementation slices, name the bounded context, files/modules, persistence/replay implications, source truth, freshness, limitations, and acceptance tests.

For QA slices, name the failing command, observed defect, minimal correction, and rerun ladder.

## Handling Stale Docs

Patch the smallest active-doc surface that is directly stale. Prefer linking to shipped plan records and [docs/PROJECT_STATE.md](docs/PROJECT_STATE.md) instead of copying the full phase ledger everywhere.

Historical Pocket CTO material is reference-only. Do not let archived GitHub-first or engineering-first docs override active Pocket CFO docs.

## Using Codex Safely

Use the `pocket-cfo-codex-operator` plugin guards when working with Codex. Keep Codex scoped to the active Finance Plan, do not paste private finance data into prompts, do not ask Codex to infer source truth from chat context, and do not let model output become source truth.

For security issues, follow [SECURITY.md](SECURITY.md). For privacy and data-retention warnings, follow [PRIVACY.md](PRIVACY.md).
