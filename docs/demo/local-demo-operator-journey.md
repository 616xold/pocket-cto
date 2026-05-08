# Local Demo Operator Journey

This demo journey uses existing local services, existing proof commands, and existing safe checked-in fixtures/proofs only. FP-0083 adds no sample data, source-pack fixtures, eval datasets, package scripts, smoke aliases, UI, routes, schema, migrations, provider calls, deployment, public app behavior, generated product prose, finance writes, source mutation, or autonomous action.

Do not use real company finance data for a public or OSS demo.

## Start Local Services

```bash
cp .env.example .env
docker compose up -d
pnpm install
pnpm db:generate
pnpm db:migrate
```

For local app inspection, run:

```bash
pnpm dev
```

This starts the existing control-plane and web development surfaces. It is not production deployment.

## Existing Proof Spine

Run the read-only V2 proof spine first:

```bash
pnpm exec tsx tools/read-only-evidence-app-proof.mjs
pnpm exec tsx tools/document-precision-foundation-proof.mjs
pnpm exec tsx tools/evidence-index-foundation-proof.mjs
```

Then run the existing source-pack proof sequence:

```bash
pnpm exec tsx tools/board-lender-document-source-pack-proof.mjs
pnpm exec tsx tools/policy-covenant-document-source-pack-proof.mjs
pnpm exec tsx tools/ledger-reconciliation-source-pack-proof.mjs
pnpm exec tsx tools/bank-card-source-pack-proof.mjs
pnpm exec tsx tools/receivables-payables-source-pack-proof.mjs
pnpm exec tsx tools/contract-obligation-source-pack-proof.mjs
```

These commands use existing checked-in synthetic proof posture. They are not permission to add new sample data or source-pack fixtures.

## Finance Twin Smoke Sequence

```bash
pnpm smoke:finance-twin-account-catalog:local
pnpm smoke:finance-twin-general-ledger:local
pnpm smoke:finance-twin:local
pnpm smoke:finance-twin-reconciliation:local
pnpm smoke:finance-twin-account-bridge:local
pnpm smoke:finance-twin-balance-bridge-prerequisites:local
pnpm smoke:finance-twin-balance-proof-lineage:local
pnpm smoke:finance-twin-period-context:local
pnpm smoke:finance-twin-source-backed-balance-proof:local
```

## CFO Wiki Smoke Sequence

```bash
pnpm smoke:cfo-wiki-foundation:local
pnpm smoke:cfo-wiki-document-pages:local
pnpm smoke:cfo-wiki-lint-export:local
pnpm smoke:cfo-wiki-concept-metric-policy:local
```

## Discovery, Monitoring, And Readiness Smokes

```bash
pnpm smoke:finance-policy-lookup:local
pnpm smoke:policy-covenant-threshold-monitor:local
pnpm smoke:close-control-checklist:local
pnpm smoke:delivery-readiness:local
pnpm smoke:operator-readiness:local
pnpm smoke:close-control-acknowledgement:local
pnpm smoke:monitor-demo-replay:local
pnpm smoke:finance-discovery-supported-families:local
```

## What A Human Should Inspect

Inspect command output and, when `pnpm dev` is running, the existing local web/control-plane surfaces for:

- source registration, checksums, storage refs, and source freshness posture
- Finance Twin facts and read models tied to stored source posture
- CFO Wiki pages labeled as compiled/derived
- EvidenceIndex SourceAnchors, DocumentMaps, EvidenceCards, SourceCoverageMatrix entries, and limitations
- V2C read-only evidence-tool proof output, especially citations, redactions, audit fields, blocked actions, and unsupported reasons
- monitor and readiness outputs that remain deterministic, source-backed, review-only, and delivery-free

Do not invent screenshots. If screenshots are captured later, verify they contain only safe synthetic data and no credentials, private finance records, customer/vendor/payroll/tax/legal/board/lender content, or local secrets.

## What This Is Not

This is not a demo of provider integration, actual certification, external delivery, public deployment, public ChatGPT App, remote MCP, Apps SDK UI, OAuth, app submission, OpenAI file-search/vector integration, OCR, PageIndex, LLM orchestration, generated finance advice, runtime-Codex finance output, finance writes, source mutation, or autonomous action.
