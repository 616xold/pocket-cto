# Read-Only Agent Threat Model

FP-0083 documents the shipped V2C local/internal evidence-tool contract. FP-0085 through FP-0124 ship the bounded read-only ChatGPT App/MCP planning, proof, route-input, metadata-builder, OAuth-deferral, remote-host-deferral, security, and evidence-dispatch boundaries described in the active Finance Plans. FP-0125 ships one local-only/read-only protected-resource metadata route at GET `/.well-known/oauth-protected-resource/mcp`, registered only through explicit valid FP-0123 route-input evidence dependency, with default `buildApp()` route absence and unchanged `/mcp` behavior. FP-0126 ships only a docs-and-plan/proof-gate compatibility master plan for future WWW-Authenticate `resource_metadata` auth-challenge sequencing. FP-0127 ships only local/proof-only/read-only WWW-Authenticate auth-challenge domain contracts and direct proof tooling.

These records do not start a public MCP server, public ChatGPT App, Apps SDK UI/resource implementation, root or dual protected-resource metadata route, WWW-Authenticate route behavior/header emission, OAuth/token/session/auth middleware implementation, token validation runtime, app submission, remote deployment, deployment config, hidden/default evidence service construction, OpenAI API/model calls, OpenAI file-search/vector integration, provider calls, external communications, source mutation, finance writes, generated product prose, runtime-Codex finance output, FP-0128, or autonomous action.

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
- FP-0109 injected MCP dispatch fails closed when a tool `companyKey` does not match the configured company context, when declared arguments cannot be honored, or when a source-coverage `sourceId` is not available from the already-loaded evidence store.
- FP-0109 MCP tool results mirror `structuredContent` in bounded JSON text without raw full-file dumps, credentials, tokens, OAuth material, object-store dumps, database dumps, provider credentials, OpenAI keys, or private raw finance data.
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

Before any remote MCP server, public ChatGPT App, Apps SDK UI/resource implementation, protected-resource metadata route beyond the FP-0125 exact local path, WWW-Authenticate route behavior, OAuth flow, token/session implementation, token validation runtime, auth middleware implementation, endpoint expansion, app submission, hosted deployment, hidden evidence service construction, or default/public evidence dispatch beyond FP-0111 explicit local app-construction wiring, a future plan must satisfy the FP-0099 security threat-model/platform-boundary prerequisites, the FP-0100 local security boundary contracts, the FP-0101 implementation sequencing/platform-readiness gates, the FP-0102 endpoint/OAuth/remote-MCP architecture gates, the FP-0103 endpoint architecture proof-contract gates, the FP-0104 endpoint readiness proof gates, the FP-0105 endpoint route ownership/transport-adapter proof gates, the FP-0106 protocol envelope, `ping` liveness, and tool-dispatch proof gates, the FP-0107 local route-adapter shell boundary, the FP-0108 evidence tool dispatch contract boundary, the FP-0109 local injected dispatch adapter boundary, the FP-0110 default local dispatch planning/proof-gate boundary, the FP-0111 explicit local wiring boundary, the FP-0112 remote/public MCP OAuth readiness boundary, the FP-0113 OAuth/security contract boundary, the FP-0114 remote host readiness/security contract boundary, the FP-0115 remote host sequencing boundary, the FP-0116 remote host resource contract boundary, the FP-0117 OAuth/token/session/auth sequencing boundary, the FP-0118 protected-resource metadata/auth challenge readiness contract boundary, the shipped FP-0119 protected-resource metadata route sequencing boundary, the shipped FP-0120 canonical resource/auth-server readiness contract boundary, the shipped FP-0121 route implementation readiness boundary, the shipped FP-0122 builder/credential-hardening boundary, the shipped FP-0123 route-input evidence boundary, the shipped FP-0124 route implementation planning boundary, the shipped FP-0125 local route boundary, the shipped FP-0126 auth-challenge sequencing boundary, and the shipped FP-0127 auth-challenge contract boundary, then prove at least:

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
