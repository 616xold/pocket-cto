# Demo Data Policy

Pocket CFO demo data must be synthetic-only unless a future Finance Plan names and proves a stricter reviewed exception. FP-0086 ships SafeDemoDataPolicy as the first V2F benchmark/community gate, and FP-0087 descriptor/envelope proofs inherit that posture with in-memory synthetic examples only. Neither slice adds sample data, source-pack fixtures, eval datasets, package scripts, smoke aliases, or source-pack mutations.

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

Issues, PRs, docs, screenshots, eval outputs, proof logs, examples, and demo guides must not include real finance data. Use redacted, synthetic, or existing approved proof output only.

## Accidental Sensitive Data

If sensitive data is committed or posted:

1. Stop using the branch, issue, or PR for additional detail.
2. Remove the data from the working tree and public text.
3. Rotate any exposed credentials or tokens immediately.
4. Report the incident through [SECURITY.md](../../SECURITY.md) without reposting the sensitive data.
5. Coordinate history cleanup privately with maintainers.

Deleting a file in a later commit is not enough if the data entered git history, screenshots, logs, caches, package artifacts, object storage, or database dumps.
