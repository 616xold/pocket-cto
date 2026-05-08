# Self-Host Baseline

Pocket CFO self-hosting is local-only in the current boundary. This document is an OSS/operator baseline, not production deployment guidance.

FP-0083 adds no deployment automation, package scripts, smoke aliases, routes, schema, migrations, UI, fixtures, sample data, provider calls, public ChatGPT App, remote MCP server, Apps SDK UI, OAuth, app submission, external communications, source mutation, finance writes, generated product prose, LLM orchestration, runtime-Codex finance output, or autonomous action.

## Local-Only Posture

Run Pocket CFO on a trusted local machine. Do not expose the local web app, control plane, Postgres, MinIO, or object storage ports to the public internet.

The current shipped boundary is:

- one company
- one operator
- one local trust boundary
- file-first/manual export default
- raw sources authoritative for document claims
- Finance Twin authoritative for structured facts
- CFO Wiki compiled and derived
- V2C evidence tools local/internal only

## Required Local Services

The Docker Compose stack provides:

- Postgres for local state
- MinIO/S3-compatible object storage for local artifacts
- OpenTelemetry collector for local telemetry plumbing

Start services:

```bash
docker compose up -d
```

Inspect services:

```bash
docker compose ps
```

## Environment And Secrets

Create local environment configuration from the example:

```bash
cp .env.example .env
```

Treat `.env` as sensitive. Do not commit it, paste it into issues, include it in screenshots, or copy it into proof logs. Use local-only credentials for local services. Do not reuse production credentials.

## Local Setup

```bash
pnpm install
pnpm db:generate
pnpm db:migrate
pnpm dev
```

`pnpm dev` starts existing local development services. It is not a production hosting mode.

## Validation Commands

Use existing commands. Do not add package scripts or smoke aliases for FP-0083.

Core gates:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm ci:repro:current
```

Evidence spine:

```bash
pnpm exec tsx tools/read-only-evidence-app-proof.mjs
pnpm exec tsx tools/document-precision-foundation-proof.mjs
pnpm exec tsx tools/evidence-index-foundation-proof.mjs
```

Source-pack proof spine:

```bash
pnpm exec tsx tools/board-lender-document-source-pack-proof.mjs
pnpm exec tsx tools/policy-covenant-document-source-pack-proof.mjs
pnpm exec tsx tools/ledger-reconciliation-source-pack-proof.mjs
pnpm exec tsx tools/bank-card-source-pack-proof.mjs
pnpm exec tsx tools/receivables-payables-source-pack-proof.mjs
pnpm exec tsx tools/contract-obligation-source-pack-proof.mjs
```

## Local Data Retention And Cleanup

Local Postgres and object storage may retain source metadata, raw source bytes, source snapshots, derived Finance Twin facts, CFO Wiki pages, proof state, logs, and local demo artifacts.

To stop local services:

```bash
docker compose down
```

To remove local Docker volumes for this compose project, use:

```bash
docker compose down -v
```

The `-v` form is destructive for local Docker volumes. It does not clean git history, screenshots, shell history, external backups, package caches, exported files, or copies outside Docker.

## Limitations

This baseline does not provide production hardening, cloud deployment, SaaS posture, multi-tenant isolation, managed backups, key management, public network hardening, remote MCP hosting, public ChatGPT App submission, OAuth, provider credential management, external delivery, certification, audit/legal/tax assurance, or autonomous action.

Do not use this as a production deployment guide.
