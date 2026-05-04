# Seeded finance missions

Pocket CFO should benchmark trusted finance work, not generic “AI CFO” vibes.

This file defines the first seeded mission families the product should benchmark and grade, including the shipped F4A through F4C2 discovery baseline below.

## Why these matter

The product thesis is evidence-native finance discovery and decision support.
Seeded missions should therefore stress:

- provenance
- freshness honesty
- numeric consistency
- limitation handling
- artifact quality
- reproducibility

## Recommended seeded mission families

### 1. Source registration and ingest proof

Input:
A mixed bundle of finance exports and docs.

Success:
The system registers each file as source truth, records checksums and ingest status, and emits an operator-readable ingest proof artifact.

### 2. F4A cash-posture answer

Input:
Stored bank-account summary state plus the related deterministic wiki context.

Success:
The system returns a typed `cash_posture` answer with freshness posture, route-backed evidence, related wiki pages, and clear limitations.

### 3. F4B posture, aging, spend, and obligation answers

Input:
Stored receivables-aging, payables-aging, spend, or contract-obligation state plus the related deterministic wiki context.

Success:
The system answers narrow typed questions such as `collections_pressure`, `payables_pressure`, `spend_posture`, or `obligation_calendar_review` from stored state with explicit freshness and limitations.

### 4. F4C policy lookup

Input:
One explicit `policySourceId` bound as `policy_document` for the company plus the stored deterministic wiki state for that same source; generic SOP docs or board materials do not count unless they are intentionally bound that way.

Success:
The system answers a typed `policy_lookup` question from the scoped policy page, same-source digest history when useful, `concepts/policy-corpus` when useful, and bound-source extract status, with a truthful limited answer whenever the latest extract is missing, unsupported, or failed.

### 5. F5A draft finance memo compilation

Input:
A completed discovery mission plus its stored `discovery_answer`, proof bundle, and relevant route or wiki context.

Success:
The system creates a first-class reporting mission that produces one draft `finance_memo` plus one linked `evidence_appendix`, with linked evidence, freshness notes, visible limitations, and explicit draft-only posture.

### 6. F5B draft report body, filed artifact, and markdown export posture

Input:
One completed reporting mission that already stores a draft `finance_memo`, a linked `evidence_appendix`, and company-scoped CFO Wiki state with the existing filed-page and export seams.

Success:
The system renders the stored memo and appendix bodies directly in mission detail, lets an operator explicitly file those stored drafts into the CFO Wiki through the existing filed-page route, and shows filing plus markdown export posture separately from proof readiness.

### 7. F5C1 board packet specialization and draft review foundation

Input:
One completed reporting mission that already stores a draft `finance_memo`, a linked `evidence_appendix`, and the carried freshness, limitations, route, and wiki context from completed reporting work.

Success:
The system creates one draft `board_packet` from that completed reporting mission only, keeps `mission.type = "reporting"` and specializes through `reportKind`, preserves carried freshness and limitations, and presents the packet as review-ready draft output without lender or diligence specialization, release workflow, runtime-codex drafting, or PDF or slide export.

### 8. F5C2 lender update specialization and draft review foundation

Input:
One completed reporting mission that already stores a draft `finance_memo`, a linked `evidence_appendix`, and the carried freshness, limitations, route, and wiki context from completed reporting work.

Success:
The system creates one draft `lender_update` from that completed reporting mission only, keeps `mission.type = "reporting"` and specializes through `reportKind`, preserves carried freshness and limitations, and presents the packet as review-ready draft output without diligence specialization, release workflow, runtime-codex drafting, filing or export expansion, or PDF or slide export.

### 9. F5C3 diligence packet specialization and draft review foundation

Input:
One completed reporting mission that already stores a draft `finance_memo`, a linked `evidence_appendix`, and the carried freshness, limitations, route, and wiki context from completed reporting work.

Success:
The system creates one draft `diligence_packet` from that completed reporting mission only, keeps `mission.type = "reporting"` and specializes through `reportKind`, preserves carried freshness and limitations, and presents the packet as review-ready draft output without approval-release workflow, runtime-codex drafting, filing or export expansion, or PDF or slide export.

### 10. F5C4A approval review and first lender update release readiness

Input:
One completed `reporting` mission with `reportKind = "lender_update"`, one stored `lender_update` artifact, and the carried freshness, limitations, route, and wiki context from completed reporting work.

Success:
The system persists one finance-facing `report_release` approval request for that completed lender-update reporting mission, resolves it without live runtime continuation, derives release-readiness as `not_requested`, `pending_review`, `approved_for_release`, or `not_approved_for_release`, and presents that reviewer trace without send, distribute, publish, release-log, runtime-codex drafting, or PDF or slide export behavior.

### 11. F5C4B release log and first lender update release record foundation

Input:
One completed `reporting` mission with `reportKind = "lender_update"`, one stored `lender_update` artifact, derived release-readiness already at `approved_for_release`, and the carried freshness, limitations, route, and wiki context from completed reporting work.

Success:
The system records one explicit external-release record for that already-approved lender update, surfaces one release-logged posture plus `releasedAt`, `releasedBy`, and minimal release-channel metadata, preserves the original approval trace, and does so without send, distribute, publish, broader packet approval widening, runtime-codex drafting, or PDF or slide export behavior.

### 12. F5C4C diligence-packet approval review and release readiness

Input:
One completed `reporting` mission with `reportKind = "diligence_packet"`, one stored `diligence_packet` artifact, and the carried freshness, limitations, route, and wiki context from completed reporting work.

Success:
The system persists one finance-facing `report_release` approval request for that completed diligence-packet reporting mission, resolves it without live runtime continuation, derives release-readiness as `not_requested`, `pending_review`, `approved_for_release`, or `not_approved_for_release`, and presents that reviewer trace without send, distribute, publish, release-log, board-packet circulation widening, runtime-codex drafting, or PDF or slide export behavior.

### 13. F5C4D release log and first diligence-packet release record foundation

Input:
One completed `reporting` mission with `reportKind = "diligence_packet"`, one stored `diligence_packet` artifact, derived release-readiness already at `approved_for_release`, and the carried freshness, limitations, route, and wiki context from completed reporting work.

Success:
The system records one explicit external-release record for that already-approved diligence packet, surfaces one release-logged posture plus `releasedAt`, `releasedBy`, and minimal release-channel metadata, preserves the original approval trace, and does so without send, distribute, publish, board-packet circulation widening, runtime-codex drafting, or PDF or slide export behavior.

### 14. F5C4E board-packet review or circulation-readiness foundation

Input:
One completed `reporting` mission with `reportKind = "board_packet"`, one stored `board_packet` artifact, and the carried freshness, limitations, route, and wiki context from completed reporting work.

Success:
The system persists one finance-facing `report_circulation` approval request for that completed board-packet reporting mission, resolves it without live runtime continuation, derives circulation readiness as `not_requested`, `pending_review`, `approved_for_circulation`, or `not_approved_for_circulation`, and presents that reviewer trace without circulation logging, send, distribute, publish, runtime-codex drafting, or PDF or slide export behavior.

### 15. F5C4F circulation log and first board-packet circulation-record foundation

Input:
One completed `reporting` mission with `reportKind = "board_packet"`, one stored `board_packet` artifact, derived circulation readiness already at `approved_for_circulation`, and the carried freshness, limitations, route, and wiki context from completed reporting work.

Success:
The system records one explicit circulation record for that already-approved board packet, surfaces one circulated posture plus `circulatedAt`, `circulatedBy`, and minimal circulation-channel metadata, preserves the original approval trace, and does so without send, distribute, publish, runtime-codex drafting, or PDF or slide export behavior.

### 16. Shipped F6A cash-posture monitor result and alert-card foundation

Input:
One company `companyKey` with stored source-backed cash-posture or bank-account-summary Finance Twin state, including explicit source freshness or missing-source posture.

Success:
The system records or returns one deterministic `cash_posture` monitor result and exposes one operator-visible alert card only when freshness threshold, missing-source, failed-source, coverage, or other explicitly source-backed conditions warrant it. The alert card includes source lineage, source freshness or missing-source posture, deterministic severity rationale, limitations, proof-bundle posture, and a human-review next step, and it does so without creating an investigation mission, invoking runtime-codex, sending notifications, moving money, booking journals, filing taxes, giving legal advice, adding a discovery family, or reopening F5 reporting/approval semantics.

### 17. Shipped F6B manual alert-to-investigation handoff

Input:
One persisted F6A `cash_posture` monitor result with `status = "alert"` and one operator-visible alert card that already includes source lineage, freshness or missing-source posture, deterministic severity rationale, limitations, proof posture, and a human-review next step.

Success:
One explicit operator action creates or opens one deterministic source-backed investigation mission that carries `monitorResultId`, `companyKey`, monitor kind, alert severity, conditions, source freshness or missing-source posture, lineage summary, limitations, proof posture, and human-review next step. The handoff must not create missions automatically from monitor runs, send notifications, invoke runtime-codex, draft investigation prose with an LLM, invent finance facts, create external actions, turn alerts into reports, add approval kinds, add monitor families, or add a second alert system.

### 18. Shipped F6C collections-pressure monitor result and alert-card foundation

Input:
One company `companyKey` with stored source-backed receivables-aging or collections-posture Finance Twin state, including explicit source freshness or missing-source posture.

Success:
The system records one deterministic `collections_pressure` monitor result and exposes one operator-visible alert card only when source-backed missing-source, failed-source, stale-source, coverage-gap, overdue-concentration, or data-quality conditions warrant it. The alert card includes source lineage, source freshness or missing-source posture, deterministic severity rationale, limitations, proof-bundle posture, and a human-review next step, and the monitor run does so without automatically creating investigations, invoking runtime-codex, sending notifications, turning alerts into reports, adding approvals, or creating autonomous finance actions.

### 19. Shipped F6D payables-pressure monitor result and alert-card foundation

Input:
One company `companyKey` with stored source-backed payables-aging or payables-posture Finance Twin state, including explicit source freshness or missing-source posture.

Success:
The system records one deterministic `payables_pressure` monitor result and exposes one operator-visible alert card only when source-backed missing-source, failed-source, stale-source, coverage-gap, overdue-concentration, or data-quality conditions warrant it. The alert card includes source lineage, source freshness or missing-source posture, deterministic severity rationale, limitations, proof-bundle posture, and a human-review next step, and it does so without creating investigations, invoking runtime-codex, sending notifications, creating payment instructions, recommending vendor payments, turning alerts into reports, adding approvals, or creating autonomous finance actions.

### 20. Shipped F6E policy/covenant threshold monitor result and alert-card foundation

Input:
One company `companyKey` with stored CFO Wiki policy-document posture, stored deterministic policy extracts, policy pages, policy-corpus posture, explicit source freshness or missing-source posture, and explicit comparable Finance Twin posture only when a threshold comparison is source-backed.

Success:
The system records one deterministic `policy_covenant_threshold` monitor result and exposes one operator-visible alert card only when source-backed missing-source, failed-source, stale-source, coverage-gap, data-quality, threshold-approaching, or threshold-breach conditions warrant it. `threshold_approaching` and `threshold_breach` require explicit stored threshold facts plus explicit comparable stored actual posture. The alert card includes source lineage, freshness or missing-source posture, deterministic rationale, limitations, proof posture, and a human-review next step, and it does so without creating investigations, invoking runtime-codex, sending notifications, giving legal or policy advice, creating payment instructions, turning alerts into reports, adding approvals, adding discovery families, or creating autonomous finance actions.

### 21. Shipped F6F monitor demo replay and stack-pack foundation

Input:
One checked-in demo stack-pack fixture set for one company, with source files for bank/cash, receivables aging, payables aging, and policy threshold docs, plus deterministic source-registration instructions and expected outputs for the shipped monitor stack.

Success:
The system bootstraps the demo company from immutable checked-in sources via `pnpm smoke:monitor-demo-replay:local`, runs the shipped `cash_posture`, `collections_pressure`, `payables_pressure`, and `policy_covenant_threshold` monitors deterministically, compares normalized outputs to the expected manifest, and demonstrates the shipped cash and collections alert-to-investigation handoff boundary where applicable. It does so without adding monitor families, discovery families, payables investigations, policy/covenant investigations, delivery, runtime-codex, report conversion, approvals, payment behavior, legal or policy advice, or autonomous remediation.

### 22. Shipped F6G collections-pressure alert investigation handoff

Input:
One persisted alerting `collections_pressure` monitor result with one alert card that already carries source freshness or missing-source posture, source lineage refs, deterministic severity rationale, limitations, proof posture, and a human-review next step.

Success:
The shipped F6G implementation lets an operator manually create or open one taskless deterministic investigation mission from that stored collections alert, preserving shipped cash handoff behavior and keeping payables and policy/covenant investigations absent. `pnpm smoke:collections-pressure-alert-investigation:local` is the narrow proof. It does not create missions automatically, schedule monitors, send notifications, invoke runtime-codex, write investigation prose with an LLM, create reports, add approvals, create delivery, create payment instructions, recommend vendor payments, create customer-contact instructions, create collection instructions, give legal or policy advice, or take autonomous action.

### 23. Shipped F6H close/control checklist foundation

Input:
One company `companyKey` with stored Finance Twin source posture, stored CFO Wiki policy/source posture where relevant, and latest persisted monitor results as context only.

Success:
The shipped F6H implementation produces one deterministic close/control checklist result/read model with bounded source coverage, cash source freshness, receivables-aging source freshness, payables-aging source freshness, policy-source freshness, and monitor replay readiness items. Each item includes source posture, evidence basis, freshness or limitations, status, proof posture, and a human-review next step. `pnpm smoke:close-control-checklist:local` proves missing source posture is not ready, limited posture needs review, latest monitor results are context only, no monitor is rerun, no monitor result/mission/report/approval/delivery/runtime side effect is created, and no monitor or discovery family is added. F6H does not assert close complete and does not add runtime-codex, notifications, reports, approvals, accounting writes, bank writes, tax filings, legal or policy advice, payment instructions, collection instructions, customer-contact instructions, or autonomous remediation.

### 24. Shipped F6I stack-pack expansion and close/control demo foundation

Input:
The existing `pocket-cfo-monitor-demo` stack-pack fixture set for one company, with immutable source files for bank/cash, receivables aging, payables aging, and policy thresholds, existing normalized monitor expectations, and one new normalized expected close/control checklist output.

Success:
The shipped F6I implementation extends the existing `pnpm smoke:monitor-demo-replay:local` proof so one deterministic replay verifies the four shipped monitor families, cash and collections alert-to-investigation handoffs where alerting, payables and policy/covenant investigations absent, close/control checklist item statuses, close/control aggregate status, close/control absence boundaries, fixture source immutability, and no new monitor or discovery families. F6I did not add a new benchmark dataset, monitor family, discovery family, route, schema, migration, package script, runtime-codex behavior, delivery, report conversion, approval, payment behavior, legal or policy advice, collection/customer-contact instruction, or autonomous action.

### 25. Shipped F6J internal operator attention/readiness foundation

Input:
One company `companyKey` with shipped latest monitor results, close/control checklist posture, source/freshness posture, and proof posture already available through stored/read state.

Success:
The shipped F6J implementation produces one deterministic internal operator attention/readiness read model with bounded attention items, evidence basis, source lineage or proof refs, freshness or missing-source posture, limitations, proof posture, status, and human-review next steps. `pnpm smoke:operator-readiness:local` is the narrow proof. It does not add notification providers, outbox sends, external delivery, reports, approvals, runtime-codex, monitor reruns, mission creation, payment behavior, legal or policy advice, collection/customer-contact instructions, autonomous action, monitor families, or discovery families.

### 26. Shipped F6K internal close/control acknowledgement-readiness foundation

Input:
One company `companyKey` with shipped close/control checklist posture and operator-readiness posture.

Success:
The shipped F6K implementation produces one deterministic internal acknowledgement-readiness result over shipped checklist/readiness posture only, with source/freshness posture, limitations, proof posture, and human-review next steps. `pnpm smoke:close-control-acknowledgement:local` is the narrow proof. It does not add approvals, close-complete status, certification, sign-off, attestation, delivery, outbox sends, reports, missions, monitor reruns, runtime-codex, source mutation, finance actions, monitor families, or discovery families.

### 27. Shipped F6L bank/card source-pack foundation

Input:
One checked-in bank/card source-pack manifest plus immutable bank-account-summary and card-expense CSV fixtures.

Success:
The shipped F6L implementation proves the source pack through existing source registry and Finance Twin routes only via `pnpm exec tsx tools/bank-card-source-pack-proof.mjs`. It does not add routes, schema, package scripts, smoke aliases, eval datasets, runtime-codex, delivery, reports, approvals, monitor families, discovery families, mission behavior, checklist/readiness/acknowledgement behavior, finance writes, legal/policy advice, collection/customer-contact instructions, or autonomous action.

### 28. Shipped F6M internal delivery-readiness boundary foundation

Input:
One company `companyKey` with shipped F6J operator-readiness and F6K acknowledgement-readiness posture.

Success:
The shipped F6M implementation produces one deterministic internal delivery-readiness boundary result with bounded targets, evidence/source/freshness/proof posture, limitations, human-review next steps, and explicit no-send/no-provider/no-outbox boundaries. `pnpm smoke:delivery-readiness:local` is the narrow proof. It does not add external delivery, notification providers, outbox sends, reports, approvals, missions, monitor reruns, source mutation, runtime-codex, generated notification prose, finance writes, advice, instructions, autonomous action, monitor families, or discovery families.

### 29. Shipped F6N internal close/control review-summary foundation

Input:
One company `companyKey` with shipped F6H checklist posture, F6J operator-readiness posture, F6K acknowledgement-readiness posture, and F6M delivery-readiness posture.

Success:
The shipped F6N implementation produces one deterministic internal close/control review-summary result with bounded sections for checklist posture, operator-readiness posture, acknowledgement-readiness posture, delivery-boundary posture, monitor-context posture, and source/CFO Wiki freshness posture. The route is `GET /close-control/companies/:companyKey/review-summary`, and narrow domain/control-plane specs are the first deterministic proof. It does not add certification, close-complete status, sign-off, attestation, approvals, report release, report circulation, external delivery, provider calls, outbox sends, generated prose, runtime-codex, missions, monitor reruns, monitor-result creation, source mutation, finance writes, advice/instructions, autonomous action, F6O implementation, monitor families, or discovery families.

### 30. Shipped F6O receivables/payables source-pack foundation

Input:
One checked-in receivables/payables source-pack manifest plus immutable receivables-aging and payables-aging CSV fixtures.

Success:
The shipped F6O implementation proves the source pack through existing source registry and Finance Twin routes only via `pnpm exec tsx tools/receivables-payables-source-pack-proof.mjs`. It does not add F6P, routes, schema, package scripts, smoke aliases, eval datasets, runtime-codex, delivery, notification providers, reports, approvals, monitor families, discovery families, mission behavior, checklist/readiness/acknowledgement/delivery-readiness/review-summary behavior, generated prose, finance writes, legal/policy advice, collection/customer-contact instructions, source mutation outside proof upload/sync setup, or autonomous action.

### 31. Shipped F6P internal external-provider-boundary foundation

Input:
One company `companyKey` with shipped F6M delivery-readiness posture and shipped F6N close/control review-summary posture.

Success:
The shipped F6P implementation produces one deterministic internal external-provider-boundary/readiness result with bounded provider-boundary targets for delivery-readiness, review-summary, source freshness, proof/limitations, human review, and outbox absence. The route is `GET /external-provider-boundary/companies/:companyKey`, and narrow domain/control-plane specs are the first deterministic proof. It does not add actual external delivery, provider calls, provider credentials, provider jobs, outbox sends, email, Slack, SMS, webhook, generated notification prose, generated prose, reports, approvals, missions, monitor reruns, monitor-result creation, source mutation, runtime-codex, finance writes, advice/instructions, autonomous action, actual certification, monitor families, or discovery families.

### 32. Shipped F6Q internal close/control certification-boundary foundation

Input:
One company `companyKey` with shipped F6N close/control review-summary posture and shipped F6P external-provider-boundary posture.

Success:
The shipped F6Q implementation produces one deterministic internal close/control certification-boundary/readiness result with bounded targets for review-summary, provider boundary, evidence/source posture, proof/limitations, human review, and certification absence. The route is `GET /close-control/companies/:companyKey/certification-boundary`, and narrow domain/control-plane specs are the first deterministic proof. It does not add actual certification, close-complete status, sign-off, attestation, legal opinion, audit opinion, assurance, approval, report release, report circulation, external delivery, provider calls, provider credentials, provider jobs, outbox sends, email, Slack, SMS, webhook, generated prose, reports, missions, monitor reruns, monitor-result creation, source mutation, runtime-codex, finance writes, advice/instructions, autonomous action, F6R implementation in that slice, monitor families, or discovery families.

### 33. Shipped F6R contract/obligation source-pack foundation

Input:
One checked-in contract/obligation source-pack manifest plus immutable contract-metadata CSV fixture.

Success:
The shipped F6R implementation proves the source pack through existing source registry and Finance Twin contract/obligation routes only via `pnpm exec tsx tools/contract-obligation-source-pack-proof.mjs`. It does not add F6S, routes, schema, package scripts, smoke aliases, eval datasets, runtime-codex, delivery, notification providers, provider calls, provider credentials, provider jobs, reports, approvals, monitor families, discovery families, mission behavior, checklist/readiness/acknowledgement/delivery-readiness/review-summary/provider-boundary/certification-boundary behavior, generated prose, finance writes, legal/policy advice, collection/customer-contact instructions, source mutation outside proof upload/sync setup, certification, close-complete status, sign-off, attestation, legal/audit opinion, assurance, or autonomous action.

### 34. Shipped F6U ledger/reconciliation source-pack foundation

Input:
One checked-in ledger/reconciliation source-pack manifest plus immutable chart-of-accounts, trial-balance, and general-ledger CSV fixtures.

Success:
The shipped F6U implementation proves the source pack through existing source registry and Finance Twin sync/read/reconciliation routes only via `pnpm exec tsx tools/ledger-reconciliation-source-pack-proof.mjs`. It did not add F6T implementation in that source-pack slice, F6V implementation, routes, schema, package scripts, smoke aliases, eval datasets, runtime-codex, delivery, notification providers, provider calls, provider credentials, provider jobs, reports, approvals, monitor families, discovery families, mission behavior, checklist/readiness/acknowledgement/delivery-readiness/review-summary/provider-boundary/certification-boundary/human-confirmation behavior, generated prose, finance writes, legal/policy advice, collection/customer-contact instructions, source mutation outside proof upload/sync setup, certification, close-complete status, sign-off, attestation, legal/audit opinion, assurance, or autonomous action.

### 35. Shipped F6W policy/covenant document source-pack foundation

Input:
One checked-in policy/covenant document source-pack manifest plus immutable markdown/plain-text policy-document fixtures.

Success:
The shipped F6W implementation proves the source pack through existing source registry and CFO Wiki bind/compile/read routes only via `pnpm exec tsx tools/policy-covenant-document-source-pack-proof.mjs`. It does not add routes, schema, package scripts, smoke aliases, eval datasets, UI, runtime-codex, delivery, notification providers, provider calls, provider credentials, provider jobs, reports, approvals, monitor families, discovery families, mission behavior, generated prose, finance writes, legal/policy advice, collection/customer-contact instructions, source mutation outside proof upload/bind/compile setup, certification, certified status, close-complete status, sign-off, attestation, legal/audit opinion, assurance, or autonomous action.

### 36. Shipped F6Y board/lender document source-pack foundation

Input:
One checked-in board/lender document source-pack manifest plus immutable markdown/plain-text board-material and lender-document fixtures.

Success:
The shipped F6Y implementation proves the source pack through existing source registry and CFO Wiki bind/compile/read routes only via `pnpm exec tsx tools/board-lender-document-source-pack-proof.mjs`. It does not add routes, schema, package scripts, smoke aliases, eval datasets, UI, runtime-codex, delivery, notification providers, provider calls, provider credentials, provider jobs, outbox sends, reports, board packets, lender updates, approvals, monitor families, discovery families, mission behavior, generated prose, finance writes, legal/policy/board/lender advice, collection/customer-contact instructions, source mutation outside proof upload/bind/compile setup, certification, certified status, close-complete status, sign-off, attestation, legal/audit opinion, assurance, or autonomous action.

### 37. Shipped F6Z final F6/v1 exit audit and handoff

Input:
Shipped FP-0050 through FP-0073 records, shipped F6 source-pack proofs, shipped safety-boundary proofs, and active docs.

Success:
`plans/FP-0073-final-f6-v1-exit-audit-and-handoff.md` is the shipped F6Z final audit/handoff record. It is docs-and-validation-only and did not add a benchmark dataset, route, schema, package script, smoke alias, eval dataset, fixture, monitor family, discovery family, product runtime behavior, provider integration, outbox/send/delivery behavior, report creation/release/circulation, approval workflow, actual certification, legal/audit opinion, runtime-codex, generated prose, source mutation, finance write, or autonomous action.

### 38. Shipped F7/v1 launch-readiness and active-doc hardening record

Input:
Active docs, shipped FP-0074, shipped F6 source-pack proof posture, and shipped safety-boundary posture.

Success:
`plans/FP-0074-v1-launch-readiness-and-active-doc-hardening.md` remains docs-and-validation-only and does not add a benchmark dataset, eval dataset, route, schema, package script, smoke alias, fixture, product runtime behavior, generated prose, provider integration, outbox/send/delivery behavior, report creation/release/circulation, approval workflow, actual certification, legal/audit opinion, runtime-codex, source mutation, finance write, monitor family, discovery family, FP-0075 during F7, or autonomous action.

### 39. Shipped F8/v1 future-scope triage and roadmap hardening

Input:
Shipped FP-0074, shipped FP-0073, shipped source-pack proof posture, shipped safety-boundary posture, and active roadmap docs.

Success:
`plans/FP-0075-v1-future-scope-triage-and-roadmap-hardening.md` is docs-and-validation-only and did not add a benchmark dataset, eval dataset, route, schema, package script, smoke alias, fixture, product runtime behavior, generated prose, provider integration, outbox/send/delivery behavior, report creation/release/circulation, approval workflow, actual certification, legal/audit opinion, runtime-codex, source mutation, finance write, monitor family, discovery family, FP-0076 during F8, or autonomous action.

### 40. Shipped F9 product UI launch-polish foundation

Input:
Shipped FP-0075, shipped FP-0074, shipped FP-0073, shipped source-pack proof posture, shipped safety-boundary posture, app/web product-surface truth, and active roadmap docs.

Success:
`plans/FP-0076-product-ui-launch-polish-foundation.md` is the shipped F9 product UI launch-polish record. It adds read-only app/web navigation, copy, warning, and status-surface truthfulness only, with no benchmark dataset, eval dataset, backend route, web API route, schema, package script, smoke alias, fixture, product runtime behavior, UI action controls, generated prose, provider integration, outbox/send/delivery behavior, report creation/release/circulation, approval workflow, actual certification, legal/audit opinion, runtime-codex, source mutation, finance write, monitor family, discovery family, FP-0077, or autonomous action.

## Blocked for now

These discovery families should stay out of the shipped F4A through F4C2 baseline and out of early seeded-finance grading until new deterministic Finance Twin support exists:

- `receivables_aging_review`
- `payables_aging_review`
- `runway`
- `burn_variance`
- `concentration`
- `covenant_risk`
- `anomaly_review`
- `spend_exceptions` based on policy scoring or exception inference

## Rubric dimensions

Each seeded mission should be graded on:

- groundedness
- citation completeness
- freshness disclosure
- numeric consistency
- limitation honesty
- artifact completeness
- rerun reproducibility
- operator touch time

## Implementation note

During the early pivot, the repo may still carry legacy engineering eval commands.
Keep the eval harness architecture, but replace the scenarios and rubrics with finance-oriented datasets as F4/F5 land.
The current finance-native eval-hook proof for the shipped F4A through F4C2 discovery baseline is `pnpm eval:finance-discovery-quality`, which reuses the deterministic `pnpm smoke:finance-discovery-quality:local` ladder rather than a model-scored runtime eval.
The shipped F5C3 reporting benchmark contract now lives in `plans/FP-0040-diligence-packet-specialization-and-draft-review-foundation.md`.
The shipped F5C4A reporting benchmark contract now lives in `plans/FP-0041-approval-review-and-first-lender-update-release-readiness.md`.
The shipped F5C4B reporting benchmark contract now lives in `plans/FP-0042-release-log-and-first-lender-update-release-record-foundation.md`.
The shipped F5C4C reporting benchmark contract now lives in `plans/FP-0043-diligence-packet-approval-review-and-release-readiness.md`.
The shipped F5C4D reporting benchmark contract now lives in `plans/FP-0044-release-log-and-first-diligence-packet-release-record-foundation.md`.
The shipped F5C4E reporting benchmark contract now lives in `plans/FP-0045-board-packet-review-or-circulation-readiness-foundation.md`.
The shipped F5C4F reporting benchmark contract now lives in `plans/FP-0046-circulation-log-and-first-board-packet-circulation-record-foundation.md`.
`plans/FP-0047-board-packet-circulation-record-correction-and-chronology-foundation.md` is the shipped F5C4G reporting benchmark record and adds immutable circulation-record correction plus chronology on the existing `report_circulation` seam.
`plans/FP-0048-board-packet-circulation-actor-correction-and-chronology-hardening.md` is now the shipped F5C4H benchmark record and already covers shipped optional corrected `circulatedBy` plus derived effective actor chronology on that same seam only.
`plans/FP-0049-board-packet-circulation-note-reset-and-effective-record-hardening.md` is now the latest shipped F5C4I benchmark record and covers explicit `circulationNote` clear-to-absent semantics plus derived effective-note chronology on that same seam, without widening into actual delivery, PDF export, slide or Marp export, or runtime-codex drafting behavior.
`plans/FP-0050-monitoring-foundation-and-first-cash-posture-alert.md` is the shipped F6A benchmark record. `pnpm smoke:cash-posture-monitor:local` is the current deterministic proof for this first monitor before any broader F6 benchmark dataset is added.
`plans/FP-0051-alert-to-investigation-mission-foundation.md` is the shipped F6B benchmark record.
`plans/FP-0052-collections-pressure-monitor-foundation.md` is the shipped F6C benchmark record for exactly one `collections_pressure` monitor, with `pnpm smoke:collections-pressure-monitor:local` as the deterministic proof.
`plans/FP-0053-payables-pressure-monitor-foundation.md` is the shipped F6D benchmark record for exactly one `payables_pressure` monitor, with `pnpm smoke:payables-pressure-monitor:local` as the deterministic proof.
`plans/FP-0054-policy-covenant-threshold-monitor-foundation.md` is the shipped F6E implementation record for exactly one `policy_covenant_threshold` monitor. `plans/FP-0055-monitor-demo-replay-and-stack-pack-foundation.md` is the shipped F6F implementation record for one deterministic monitor demo replay and stack-pack foundation. `plans/FP-0056-non-cash-alert-investigation-generalization-foundation.md` is the shipped F6G record for a manual collections-pressure alert investigation handoff only. `plans/FP-0057-close-control-checklist-foundation.md` is the shipped F6H implementation record. `plans/FP-0058-stack-pack-expansion-and-close-control-demo-foundation.md` is the shipped F6I implementation record. `plans/FP-0059-operator-notification-readiness-foundation.md` is the shipped F6J implementation record for internal operator attention/readiness only, with no broader F6 benchmark dataset, delivery behavior, notification provider, outbox send, runtime-codex, report, approval, monitor-family, or discovery-family behavior added. `plans/FP-0060-close-control-acknowledgement-foundation.md` is the shipped F6K implementation record for internal close/control acknowledgement readiness only, with `pnpm smoke:close-control-acknowledgement:local` as the narrow deterministic proof and no approval, close-complete, delivery, notification provider, outbox send, report, mission, monitor rerun, runtime-codex, finance action, monitor-family, or discovery-family behavior added. `plans/FP-0061-source-pack-expansion-foundation.md` is the shipped F6L implementation record for one bank/card source-pack foundation only, with `pnpm exec tsx tools/bank-card-source-pack-proof.mjs` as the direct deterministic proof and no broader F6 benchmark dataset, package script, smoke alias, runtime-codex behavior, delivery behavior, monitor family, or discovery family added. `plans/FP-0062-external-notification-delivery-planning-foundation.md` is the shipped F6M implementation record for internal delivery-readiness only, with `pnpm smoke:delivery-readiness:local` as the narrow deterministic proof and no provider, outbox, external delivery, approval, report, runtime-codex, generated prose, monitor-family, or discovery-family behavior added. `plans/FP-0063-close-control-review-summary-foundation.md` is the shipped F6N implementation record for internal close/control review-summary only, with narrow domain/control-plane specs as the deterministic proof and no certification, close-complete status, sign-off, attestation, approval, report release/circulation, external delivery, runtime-codex, generated prose, source mutation, F6O implementation, monitor-family, or discovery-family behavior added. `plans/FP-0064-receivables-payables-source-pack-foundation.md` is the shipped F6O implementation record for one receivables/payables source-pack proof only, with `pnpm exec tsx tools/receivables-payables-source-pack-proof.mjs` as the direct deterministic proof and no broader source-pack benchmark dataset, package script, smoke alias, runtime-codex behavior, delivery behavior, monitor family, or discovery family added. `plans/FP-0065-external-provider-boundary-foundation.md` is the shipped F6P implementation record for one internal provider-boundary/readiness foundation only, with narrow domain/control-plane specs as the deterministic proof and no actual external delivery, provider calls, provider credentials, provider jobs, outbox sends, reports, approvals, generated prose, source mutation, runtime-codex, finance actions, monitor family, or discovery family added. `plans/FP-0066-close-control-certification-boundary-foundation.md` is the shipped F6Q implementation record for one internal certification-boundary/readiness foundation only, with narrow domain/control-plane specs as the deterministic proof and no actual certification, close-complete status, sign-off, attestation, legal opinion, audit opinion, assurance, approval, report release, report circulation, external delivery, provider calls, provider credentials, provider jobs, outbox sends, generated prose, source mutation, runtime-codex, finance actions, F6R implementation in that slice, monitor family, or discovery family added. `plans/FP-0067-contract-obligation-source-pack-foundation.md` is the shipped F6R implementation record for one contract/obligation source-pack proof only, with `pnpm exec tsx tools/contract-obligation-source-pack-proof.mjs` as the direct deterministic proof and no broader source-pack benchmark dataset, package script, smoke alias, runtime-codex behavior, delivery behavior, provider behavior, monitor family, or discovery family added. `plans/FP-0068-external-delivery-human-confirmation-boundary-foundation.md` is the shipped F6S implementation record for one deterministic internal external-delivery human-confirmation / delivery-preflight boundary only, with no actual external delivery, provider calls, provider credentials, provider jobs, outbox sends, scheduled delivery, auto-send, report creation, report release/circulation, approvals, certification, close complete, sign-off, attestation, legal/audit opinion, runtime-codex, generated prose, monitor reruns, missions, source mutation, finance writes, advice, customer-contact instructions, autonomous action, monitor family, or discovery family added. `plans/FP-0069-ledger-reconciliation-source-pack-foundation.md` is the shipped F6U implementation record for one ledger/reconciliation source-pack proof only, with `pnpm exec tsx tools/ledger-reconciliation-source-pack-proof.mjs` as the direct deterministic proof and no broader source-pack benchmark dataset, package script, smoke alias, runtime-codex behavior, delivery behavior, provider behavior, report, approval, certification, monitor family, or discovery family added. `plans/FP-0070-close-control-certification-safety-foundation.md` is the shipped F6T implementation record for one deterministic internal close/control certification-safety/readiness foundation through `GET /close-control/companies/:companyKey/certification-safety`, with narrow domain/control-plane specs as deterministic proof and no benchmark dataset, schema, package script, smoke alias, runtime-codex behavior, delivery behavior, provider behavior, report creation/release/circulation, approval, actual certification, certified status, close complete, sign-off, attestation, assurance, legal/audit opinion, monitor family, or discovery family. The shipped F6W record is `plans/FP-0071-policy-covenant-document-source-pack-foundation.md` for one policy/covenant document source-pack proof with `pnpm exec tsx tools/policy-covenant-document-source-pack-proof.mjs`. The shipped F6Y record is `plans/FP-0072-board-lender-document-source-pack-foundation.md` for one board/lender document source-pack proof with `pnpm exec tsx tools/board-lender-document-source-pack-proof.mjs`. The shipped F6Z record is `plans/FP-0073-final-f6-v1-exit-audit-and-handoff.md`; it added no benchmark dataset and remains docs-and-validation-only. The shipped F7 record is `plans/FP-0074-v1-launch-readiness-and-active-doc-hardening.md`; it added no benchmark dataset, eval dataset, generated prose, product runtime behavior, provider integration, certification, delivery, approval, report release, FP-0075 during F7, monitor family, or discovery family. The shipped F8 record is `plans/FP-0075-v1-future-scope-triage-and-roadmap-hardening.md`; it added no benchmark dataset, eval dataset, generated prose, product runtime behavior, provider integration, certification, delivery, approval, report release, monitor family, or discovery family. The shipped F9 record is `plans/FP-0076-product-ui-launch-polish-foundation.md`; it added read-only app/web copy/navigation/warning/status-surface truthfulness only and no benchmark dataset, eval dataset, backend route, web API route, schema, package script, smoke alias, fixture, product runtime behavior, UI action control, provider integration, certification, delivery, approval, report release/circulation, monitor family, discovery family, FP-0077, or autonomous action. F6V, F6X, deeper PDF/OCR/vector search, v1 public launch handoff, F10, and later planning must wait for future Finance Plans or roadmap updates.
