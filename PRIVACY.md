# Privacy Policy

Pocket CFO is designed as a local-first, file-first finance evidence system. The current shipped repository is a local proof and self-host baseline, not a hosted service.

## Current Data Posture

The shipped product path does not make external provider calls. It does not ship a public ChatGPT App, remote MCP server, Apps SDK UI, OAuth surface, app submission, OpenAI file-search/vector integration, OCR, PageIndex, provider integration, deployment, external delivery, or autonomous finance action.

Routine developer tools such as `git`, `gh`, package installation, or local shell commands are operator workflow. They are not finance product providers and should not be treated as a privacy boundary for real company data.

## Sensitive Finance Data

Raw source files may contain sensitive finance data. This includes, but is not limited to:

- company accounting exports and ledger data
- bank, card, and cash records
- payroll and employee records
- customer and vendor data
- receivables, payables, contracts, and obligations
- tax records
- legal materials
- board and lender materials
- screenshots, logs, database dumps, object-store files, credentials, tokens, and `.env` values

Do not commit real finance data to this repository. Do not include real finance data in issues, PRs, docs, screenshots, fixture files, sample data, eval datasets, source packs, proof logs, or demo artifacts.

## Local Storage

Local runs use local services such as Postgres and S3-compatible object storage. Those services may contain raw source files, source snapshots, checksums, derived Finance Twin state, CFO Wiki pages, proof artifacts, query text, and local logs.

Operators control retention in the local environment. Deleting a working copy is not the same as deleting Docker volumes, object-store contents, local backups, shell history, screenshots, or git history.

For cleanup guidance, see [docs/ops/self-host-baseline.md](docs/ops/self-host-baseline.md).

## V2C Evidence Tools

The shipped V2C evidence-tool contract is local/internal only. Its search, fetch, inspect, and audit fields are intended for local proof and developer inspection over existing EvidenceIndex/TextPdfAdapter artifacts.

V2C query/audit logs are local/internal only. They may include normalized query text, artifact ids, SourceAnchor ids, excerpt counts, redaction counts, unsupported reasons, and blocked-action posture. Do not type secrets, private finance facts, or real customer/vendor/payroll/tax/legal/board/lender content into evidence-tool queries.

## Limitations

Redaction in the shipped proof path is a narrow defensive layer, not a complete data-loss-prevention system. It covers obvious token, credential, and finance identifier patterns in bounded excerpts, but it cannot guarantee removal of every sensitive value or proprietary fact.

Future tracks such as public ChatGPT App alpha, remote MCP deployment, Apps SDK UI, OAuth, app submission, cloud/SaaS hosting, provider integrations, community packs, benchmark packs, OCR, vector search, PageIndex, and OpenAI file-search/vector adapters are future-plan-only. This privacy policy does not claim those tracks are implemented or safe for private finance data.
