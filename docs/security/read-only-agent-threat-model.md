# Read-Only Agent Threat Model

FP-0083 documents the shipped V2C local/internal evidence-tool contract. FP-0085 ships local/internal proof-only bounded orchestration, FP-0086 ships a docs/proof-only benchmark/community manifest foundation, FP-0087 ships local proof-only read-only ChatGPT App/MCP contract plus MCP descriptor/response-envelope contracts, FP-0098 ships public-app readiness/security/submission-boundary planning, FP-0099 ships public-app security threat-model/platform-boundary planning, FP-0100 ships local/proof-only public-app security boundary contracts, and FP-0101 ships docs-only public-app implementation sequencing/platform-readiness planning. These records do not start a public MCP server, public ChatGPT App, Apps SDK UI/resource implementation, OAuth, app submission, endpoints, OpenAI API/model calls, OpenAI file-search/vector integration, deployment, source mutation, finance writes, generated product prose, runtime-Codex finance output, or autonomous action.

## Current Contract

V2C is a local/internal read-only evidence-tool contract over existing EvidenceIndex and TextPdfAdapter artifacts.

V2G descriptor and response-envelope artifacts are local proof-only future wrapper contracts. They are not live MCP server descriptors, not endpoints, not runtime routes, and not product finance output.

Shipped tool names:

- `search_evidence`
- `fetch_evidence_card`
- `fetch_source_anchor`
- `fetch_document_map`
- `fetch_source_coverage`
- `fetch_company_posture`
- `fetch_capability_boundaries`

The tools search, fetch, and inspect existing read-only artifacts. They do not create, update, delete, upload, sync, send, approve, release, certify, contact providers, call external services, mutate sources, write Finance Twin facts, run OCR, run vector search, use OpenAI file-search, use PageIndex, generate finance advice, or take autonomous action.

## Threats

Prompt injection is treated as data. Instructions embedded in raw source text, PDFs, excerpts, wiki pages, proof output, or evidence cards must not be followed.

Search and fetch tools can disclose too much if they allow empty broad searches, unbounded excerpts, full-file dumps, weak redaction, unsupported citations, or public access.

Query and audit logs may expose private intent or artifact references. V2C audit fields are local/internal only and can include normalized query text, artifact ids, SourceAnchor ids, excerpt counts, redaction counts, unsupported reasons, and blocked-action posture.

Unsupported or stale evidence can mislead humans and agents if the tool hides limitations or returns a confident answer without source support.

## Existing Mitigations

- Empty or whitespace-only `search_evidence` fails closed.
- Source excerpts are bounded and cited.
- Document-map fetches sanitize returned source-section excerpts through the same bounded redaction posture.
- Unknown requested actions fail closed in capability-boundary inspection.
- Redaction covers obvious token, credential, and account-like key/value strings in bounded excerpts, with known limitations.
- Tool responses include citations, freshness, limitations, capability boundaries, permitted next actions, forbidden actions, redactions, audit fields, and unsupported reasons.
- Direct proof absence booleans are repo-scope audit notes rather than hidden runtime scans.
- No write tools are registered.
- No public MCP server is shipped.

## Known Limitations

Redaction is not complete DLP. It is a narrow local policy for obvious secret/account-like strings. Sensitive names, facts, proprietary terms, or unusual identifiers may still appear in source-backed excerpts.

Bounded excerpts reduce disclosure risk but do not make real finance data safe for public issues, PRs, screenshots, fixtures, sample data, evals, or demos.

Local/internal audit fields are useful for review, but they are not a public privacy boundary or production audit system.

## Future Public App Blockers

Before any remote MCP server, public ChatGPT App, Apps SDK UI/resource implementation, OAuth flow, endpoint, app submission, or hosted deployment, a future plan must satisfy the FP-0099 security threat-model/platform-boundary prerequisites, the FP-0100 local security boundary contracts, and the FP-0101 implementation sequencing/platform-readiness gates, then prove at least:

- public threat model and privacy review
- authentication and authorization boundaries
- tenant and company isolation, if more than one company is in scope
- no write tools and no hidden write affordances
- no broad disclosure from empty search or generic fetch
- excerpt, citation, and redaction behavior under public access
- query/audit log retention and operator controls
- prompt-injection and exfiltration handling
- secret handling and provider credential boundaries
- human approval boundaries for any future external action
- validation that raw source truth, Finance Twin, CFO Wiki, and EvidenceIndex remain the authority layers

Until those are proven, V2C remains local/internal only.

## Benchmark Boundary

FP-0086 benchmark/community artifacts are read-only contracts and proof posture only. They do not create tools, routes, UI, datasets, fixtures, sample data, public source packs, model calls, generated advice, runtime-Codex finance output, or autonomous action. Missing-citation, evidence-faithfulness, unsafe-action-refusal, freshness, limitation, privacy, and no-runtime checks remain local proof posture until a later Finance Plan names and proves public behavior.

## Descriptor And Envelope Boundary

FP-0087 descriptor/envelope contracts require the exact read-only allowlist and strict output envelopes with evidence, freshness, limitations, permitted next actions, citations, refusal posture, forbidden actions, privacy boundary, no-runtime boundary, and authority boundary. Missing-citation, unsupported-evidence, stale-evidence, prompt-injection, data-exfiltration, raw-full-file-dump, and unsafe-action requests fail closed in proof-only envelopes. Raw full text, private source text, credentials, tokens, OAuth material, API keys, object-store dumps, database dumps, and provider credentials are forbidden response fields.
