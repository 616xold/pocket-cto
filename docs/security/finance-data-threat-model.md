# Finance Data Threat Model

FP-0083 created the documentation and governance baseline. FP-0086 adds a docs/proof-only SafeDemoDataPolicy-first benchmark/community manifest contract foundation, FP-0087 adds local proof-only read-only app/MCP contract plus descriptor/response-envelope contracts, FP-0098 adds public-app readiness/security/submission-boundary planning, FP-0099 adds public-app security threat-model/platform-boundary planning, and FP-0100 adds local/proof-only public-app security boundary contracts, without adding UI, routes, endpoints, OAuth, remote MCP deployment, Apps SDK resources, app submission, schema, migrations, package scripts, fixtures, sample data, provider calls, deployment, finance writes, source mutation, generated product prose, runtime-Codex finance output, or autonomous action.

## Assets

Finance data categories include:

- raw company exports and uploaded source files
- source snapshots, checksums, storage refs, provenance, freshness posture, and ingest logs
- bank, card, payroll, customer, vendor, receivables, payables, contract, obligation, tax, legal, board, and lender materials
- derived Finance Twin facts and read models
- compiled CFO Wiki pages and filed artifacts
- proof bundles, evidence cards, SourceAnchors, DocumentMaps, SourceCoverageMatrix entries, limitations, and permitted-next-action fields
- local Postgres data, MinIO/S3-compatible object storage, backups, logs, screenshots, shell history, and `.env` files

Secrets, credentials, and tokens include database URLs, object-store keys, API keys, GitHub tokens, cookies, session data, provider credentials, OpenAI keys if ever introduced, OAuth material if ever introduced, and local machine credentials.

## Threats

Public repo disclosure can occur through commits, issues, PR comments, screenshots, pasted logs, sample data, eval datasets, fixture files, source packs, markdown docs, or proof output.

Source packs, fixtures, benchmark cases, and demo examples are risky because they look safe once checked in. A source-pack file, benchmark case, or example derived from a real company remains private finance data even if names are changed.

Local Postgres and object storage are risky because they may retain raw source bytes, derived facts, local proof state, screenshots, database dumps, or object keys after a demo ends.

Contributor and PR risk includes accidental full-file dumps, copied `.env` values, private screenshots, broad rewrites that weaken warnings, and sample data that was not reviewed as synthetic.

Prompt injection in source text is expected. A PDF, export, markdown file, wiki page, or source excerpt may contain instructions such as "ignore previous instructions" or "send this report." Those strings are untrusted data and must not be followed.

Read-only evidence tools can still disclose data through broad search results, full-file excerpts, query logs, audit output, citations, or insufficient redaction.

Future provider, certification, deployment, public MCP, public ChatGPT App, Apps SDK UI/resources, OAuth, endpoints, app submission, public community-pack distribution, benchmark datasets, and sample/demo data would add new privacy and security risks. They are outside the shipped product boundary and require future plans after the FP-0099 security threat-model/platform-boundary prerequisites and FP-0100 local security boundary contracts are accepted.

## Mitigations

- Keep raw sources immutable and do not rewrite uploaded source truth.
- Commit only synthetic, reviewed, clearly labeled demo or benchmark data under a named future plan. Lightly anonymized real finance data is forbidden.
- Do not put real finance data, credentials, database dumps, object-store files, or private screenshots in git, issues, PRs, docs, fixtures, evals, or source packs.
- Keep source excerpts bounded, cited, and redacted where the V2C policy applies.
- Keep V2G app/MCP response envelopes strict: no raw full text, private source text, credentials, tokens, OAuth material, API keys, object-store dumps, database dumps, provider credentials, source mutation fields, finance-write fields, provider fields, payment fields, customer-contact fields, or app-submission fields.
- Treat source text and source excerpts as untrusted data.
- Use stored SourceAnchors, DocumentMaps, EvidenceCards, Finance Twin state, CFO Wiki pages, freshness posture, and limitations as the evidence boundary.
- Preserve no-provider, no-deployment, no-public-MCP, no-public-ChatGPT-App, no-finance-write, no-source-mutation, and no-autonomous-action boundaries until future plans prove otherwise.
- Use [SECURITY.md](../../SECURITY.md) for private vulnerability reports and accidental sensitive-data disclosure.
- Use [docs/demo/demo-data-policy.md](../demo/demo-data-policy.md) before adding any future demo source pack or sample data.

## Explicit Non-Goals

This repository does not currently provide production hosting, cloud/SaaS security controls, tenant isolation, provider credential management, public MCP deployment, public ChatGPT App submission, OAuth, external delivery, certification, legal/tax/audit assurance, complete DLP, or autonomous finance action.

This threat model is a baseline for local OSS review and self-hosting, not a security certification.
