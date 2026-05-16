# Demo Data Policy

Pocket CFO demo data must be synthetic-only unless a future Finance Plan names and proves a stricter reviewed exception. FP-0086 ships SafeDemoDataPolicy as the first V2F benchmark/community gate, FP-0087 descriptor/envelope proofs inherit that posture with in-memory synthetic examples only, FP-0098 plans public-app readiness without demo/public assets, FP-0099 plans public-app security threat-model/platform-boundary prerequisites without demo/public assets, FP-0100 ships local/proof-only public-app security boundary contracts without demo/public assets, FP-0101 plans public-app implementation sequencing/platform-readiness without demo/public assets, FP-0102 plans endpoint/OAuth/remote-MCP architecture and security-readiness without demo/public assets, FP-0103 ships endpoint architecture proof contracts without demo/public assets, FP-0104 plans endpoint implementation readiness and exact future endpoint inventory without demo/public assets, FP-0105 ships endpoint route ownership and transport-adapter proof contracts without demo/public assets, FP-0106 ships MCP protocol envelope, `ping` liveness, and tool-dispatch proof contracts without demo/public assets, FP-0107 ships a local/control-plane `/mcp` route-adapter shell without demo/public assets, FP-0108 ships local/proof-only/read-only evidence tool dispatch contracts without demo/public assets, FP-0109 ships a local-only/read-only dependency-injected evidence dispatch adapter with company/source-context and bounded mirror hardening without demo/public assets, FP-0110 ships docs-only default local evidence dispatch enablement planning and proof-gate compatibility without demo/public assets, FP-0111 ships explicit local app-construction wiring without demo/public assets, FP-0112 ships remote/public MCP OAuth readiness planning without demo/public assets, FP-0113 ships local/proof-only OAuth/token/session/auth middleware and public MCP security contracts without demo/public assets, FP-0114 ships local/proof-only remote MCP host readiness and public transport/security contracts without demo/public assets, FP-0115 ships docs-only remote MCP host implementation sequencing without demo/public assets, FP-0116 ships local/proof-only remote host resource contracts without demo/public assets, FP-0117 ships docs-only OAuth/token/session/auth implementation sequencing without demo/public assets, FP-0118 ships local/proof-only protected-resource metadata/auth challenge readiness contracts without demo/public assets, FP-0119 ships docs-and-plan/proof-gate-only protected-resource metadata route implementation sequencing and WWW-Authenticate `resource_metadata` challenge sequencing without demo/public assets, FP-0120 ships local/proof-only/read-only canonical resource/auth-server readiness contracts without demo/public assets, FP-0121 ships docs-and-plan/proof-gate-only protected-resource metadata route implementation readiness planning without demo/public assets, and FP-0122 ships local/proof-only/read-only protected-resource metadata document-builder and deferred route-response contracts with post-merge credential/userinfo hardening without demo/public assets. These slices add no sample data, source-pack fixtures, eval datasets, package scripts, smoke aliases, screenshots, generated images, public assets, listing copy, generated public prose, app-submission artifacts, source-pack mutations, or FP-0123.

## Synthetic-Only Rule

Demo data and any future benchmark/community examples must be invented, non-private, clearly labeled, and safe to publish. They must not be derived from a real company by merely renaming fields or changing dates, and lightly anonymized real finance data is forbidden.

Do not use or commit:

- real company exports
- bank, card, payroll, customer, vendor, receivables, payables, tax, legal, board, or lender private data
- real contracts, invoices, statements, payroll reports, bank files, tax filings, board decks, lender reports, or legal documents
- credentials, tokens, `.env` values, cookies, database URLs, object-store keys, API keys, provider credentials, screenshots, logs, database dumps, or local object-store files

## Labeling Requirements

Any future approved demo data must state:

- that it is synthetic
- the owning Finance Plan
- the intended proof or demo path
- the source family and document role
- whether it is safe for public screenshots
- the review performed to confirm it is not private finance data

## Future Sample Source Packs

Future sample source packs require a named Finance Plan and review before merge. The plan must prove the data is synthetic, non-private, clearly labeled, not copied from a real company, and does not change source-pack behavior by accident.

Future sample packs must not become the default source of truth for product claims. Raw sources, source snapshots, checksums, provenance, Finance Twin state, CFO Wiki pages, and evidence artifacts remain the authority layers.

## Public Artifacts

Issues, PRs, docs, screenshots, eval outputs, proof logs, examples, demo guides, public app listing copy, app-submission artifacts, and public assets must not include real finance data. Use redacted, synthetic, or existing approved proof output only under a named future plan.

## Accidental Sensitive Data

If sensitive data is committed or posted:

1. Stop using the branch, issue, or PR for additional detail.
2. Remove the data from the working tree and public text.
3. Rotate any exposed credentials or tokens immediately.
4. Report the incident through [SECURITY.md](../../SECURITY.md) without reposting the sensitive data.
5. Coordinate history cleanup privately with maintainers.

Deleting a file in a later commit is not enough if the data entered git history, screenshots, logs, caches, package artifacts, object storage, or database dumps.
