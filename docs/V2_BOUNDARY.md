# Pocket CFO V2 Boundary

## V2 North Star

Pocket CFO V2 is an evidence-native CFO cockpit for one company: raw source truth -> deterministic Finance Twin -> compiled CFO Wiki -> mission-based answers/reports/monitoring -> proof-backed evidence cards that humans and agents can read.

## V2 Product Thesis

V2 should make finance evidence navigable and reviewable without weakening the authority model. The product should help a human understand what the company knows, what is stale or missing, what is derived, and what action is permitted next.

The compelling proof point is not an assistant that sounds like a CFO. It is a persisted, freshness-aware decision system that can answer a question, explain limitations, and produce a durable artifact another human can review outside chat.

## V2 Allowed Boundaries

V2 may build within these boundaries:

- single company
- single trust boundary
- file-first/manual export default
- raw sources authoritative for document claims
- Finance Twin authoritative for structured finance facts
- CFO Wiki compiled/derived
- evidence, freshness, limitations, and permitted-next-action fields on answers
- read-only agent tools first
- deterministic source indexing before freeform synthesis
- human-reviewable artifacts before external use

## V2 Forbidden Boundaries

V2 must not cross these boundaries:

- no autonomous bank writes
- no accounting writes
- no tax filings
- no legal advice
- no provider sends
- no customer contact instructions
- no payment instructions
- no certification
- no close-complete status
- no sign-off
- no assurance
- no external delivery
- no multi-tenant SaaS in V2

## LLM Rule

An LLM may plan, classify, summarize, and help navigate only under evidence contracts. It cannot become the source of finance truth.

LLM output must not override raw source files, Finance Twin facts, CFO Wiki provenance, proof bundles, freshness posture, or limitations.

## Agent Rule

Agents get read-only structured evidence tools first. Write tools are out of V2 unless a later plan proves review gates, threat model, liability boundaries, and no-autonomous-action controls.

No agent may release external communications, move money, file taxes, write accounting records, contact customers, call providers, certify close, or mutate raw sources without a future named plan and explicit human approval boundaries.

## V2 Phase Sequence

- **F11 public repo hygiene and V2 transition**: docs-only public repo hygiene, README split, active-doc freshness, V2 boundary framing, and stale public wording cleanup.
- **F12 manual UI/demo-readiness audit**: shipped through FP-0079; inspected existing read-only UI and demo posture, classified gaps, recorded screenshot limitations, and avoided product runtime implementation.
- **V2A EvidenceIndex and document-map foundation**: shipped through FP-0080 as the first read-only evidence index/document-map foundation, limited to native anchors, traces, cards, coverage, direct proof, and fail-closed unsupported-source posture.
- **V2B document precision adapters**: shipped through FP-0081 as one deterministic policy/covenant TextPdfAdapter foundation over EvidenceIndex, with any expansion beyond the named plan blocked and no generic document AI.
- **V2C read-only agent/MCP/ChatGPT Evidence App alpha**: expose read-only structured evidence tools after EvidenceIndex and document precision foundations.
- **V2D Evidence Atlas UI**: visualize evidence, sources, freshness, limitations, and derived state after the substrate exists.
- **V2E bounded LLM orchestration**: use LLMs for navigation and summarization only under deterministic evidence contracts.
- **V2F benchmark/community pack**: package benchmark/community source packs after evidence contracts stabilize.
- **V2G optional distribution tracks**: consider optional ChatGPT App, MCP, iOS, OpenClaw, deployment, or other distribution tracks only after V2 foundations and safety boundaries are proven.

## Distribution And Precision Decisions

- ChatGPT App/MCP is worth pursuing later as a read-only evidence app after EvidenceIndex and V2B precision proof.
- iOS is postponed.
- OpenClaw is inspiration/benchmark only, not a V2 dependency.
- PageIndex/OCR/vector are future adapters, not canonical authority. FP-0081 ships only a narrow deterministic text-PDF precision candidate, not OCR/vector/PageIndex implementation.

## Acceptance Criteria For V2 Transition

The F11/F12-to-V2A transition is acceptable when:

- README is human-facing and no longer carries the full FP ledger.
- Codex/operator guidance lives in root `CODEX_README.md`.
- current shipped state lives in `docs/PROJECT_STATE.md`.
- this V2 boundary doc exists and is linked from active docs.
- active docs and roadmap point to FP-0080 as the shipped first V2A Finance Plan and FP-0081 as the shipped first V2B document precision adapter foundation, with any expansion still requiring a future named plan.
- `@pocket-cto/*` and root `pocket-cto` are documented as internal scaffolding.
- GitHub and engineering-twin modules remain present and isolated as internal/historical scaffolding.
- no product runtime behavior, schema, route, package script, smoke alias, eval dataset, fixture, source mutation, finance write, generated product prose, provider behavior, certification behavior, delivery behavior, deployment, external communication, or autonomous action was added.
- validation passes on the final implementation tree for the FP-0080 V2A foundation and on the final implementation tree for the FP-0081 V2B foundation.
