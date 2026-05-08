# Security Policy

Pocket CFO handles finance source material by design. Treat every vulnerability report, public issue, pull request, screenshot, log, and reproduction as a possible disclosure path.

## Reporting A Vulnerability

Report suspected vulnerabilities without exposing sensitive finance data publicly.

Preferred reporting path:

1. Use GitHub private vulnerability reporting for this repository if it is available.
2. If private vulnerability reporting is unavailable, contact a maintainer through an already-known private channel.
3. If no private channel is available, open a public issue that contains only a short coordination request and no sensitive details.

Do not include real company exports, bank data, payroll data, customer or vendor data, tax records, legal materials, credentials, board or lender materials, tokens, private screenshots, object-store keys, database dumps, or full source files in public issues, comments, PRs, commits, examples, or logs.

Safe initial report content:

- affected area or file path
- high-level impact
- whether sensitive data may be involved
- redacted reproduction steps
- your preferred private follow-up channel

Unsafe initial report content:

- raw finance exports or uploaded source files
- screenshots containing finance records, customer/vendor names, payroll, tax, legal, board, or lender material
- `.env` values, API keys, access tokens, cookies, session data, database URLs, object-store keys, or provider credentials
- exploit payloads that include private source text or full-file dumps

## Current Security Boundary

The shipped repository is local-first and proof-oriented. It is not a public hosted deployment.

Current boundaries:

- no external provider calls in the shipped product path
- no production deployment posture
- no public MCP server
- no public ChatGPT App
- no Apps SDK UI, OAuth, or app submission
- no OpenAI file-search, vector-store, OCR, PageIndex, or provider integration in the shipped product
- no autonomous bank, accounting, tax, legal, certification, delivery, customer-contact, source-mutation, finance-write, or external communication action

Routine repository operations with `git` and `gh` are developer workflow only. They are not Pocket CFO product behavior.

## Dependency And Security Updates

Security and dependency updates should be handled as narrow reviewed changes with the active Finance Plan discipline. Do not use a dependency bump to add provider calls, deployment behavior, public app behavior, new package scripts, fixtures, routes, schema, UI, or broader product scope.

Expected validation for security-sensitive dependency work includes the affected focused tests plus the repo gates named by the active Finance Plan, normally including:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm ci:repro:current
```

## Local Self-Host Risk

Self-hosting is local-only in the current boundary. Operators are responsible for their own machine, Docker daemon, local network exposure, `.env` files, Postgres volumes, MinIO/object-storage buckets, backups, logs, screenshots, and shell history.

Do not run Pocket CFO with real company finance data unless you understand and accept the local storage and access-control risk. Do not expose local services to the public internet.

## No Assurance Guarantee

Pocket CFO does not guarantee audit, legal, tax, compliance, assurance, certification, close-complete, sign-off, attestation, or security assurance output. Evidence packets and proof commands are review aids for humans, not professional opinions or autonomous actions.
