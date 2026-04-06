# EP-0017 - Format concise approval cards for the M2 operator surface

This ExecPlan is a living document. Keep `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` current.

## Purpose / Big Picture

After this slice, Pocket CTO mission detail stops showing approvals as bare ledger rows and starts showing compact operator-ready approval cards.
An operator should be able to glance at the mission detail page and understand what action is gated, why it matters, which task and repo context it affects, and what to do next without parsing raw approval records or low-level runtime payloads.

This work covers roadmap submilestone `M2.6 approval card formatter`.
It intentionally stays narrow.
It will not redesign approval persistence, widen into issue intake, or pull the repo into the larger M2.7 UI polish slice.

## Progress

- [x] (2026-03-16T00:04Z) Re-read the required repo docs, current adjacent ExecPlans, replay and local-dev guidance, the approval persistence module, the mission detail read model, and the current web mission detail surface, then ran the required inspections `rg -n "approval|awaiting_approval|liveControl|reason|rationale|kind|status" apps packages docs`, `git status --short`, and `git diff --name-only HEAD`.
- [x] (2026-03-16T00:04Z) Captured the M2.6 gap before coding: durable approvals already persist kind, status, actors, rationale, timestamps, task linkage, and rich runtime payload details, but the mission detail read model currently strips them down to a thin summary so the web UI can only render raw ledger rows.
- [x] (2026-03-16T00:14Z) Added the control-plane approval-card formatter boundary under `apps/control-plane/src/modules/approvals/card-formatter.ts`, extended the mission detail contract with additive `approvalCards`, and kept the existing `approvals` summary array for compatibility.
- [x] (2026-03-16T00:14Z) Updated the web mission detail and operator action surfaces to render compact approval cards and pending approval titles or summaries while preserving the existing resolve and interrupt controls.
- [x] (2026-03-16T00:14Z) Added focused formatter, mission-detail, API-shape, and web rendering tests that cover file-change, command, network-escalation, fallback kinds, and pending versus resolved card differences.
- [x] (2026-03-16T00:14Z) Updated the local-dev and replay or evidence docs, rebuilt `@pocket-cto/domain` so referenced app-package typechecks picked up the new contract, ran the requested validation matrix, and completed one manual mission-detail fetch-plus-render check.
- [x] (2026-03-16T17:06Z) Re-opened EP-0017 for the M2.6 operational proof gap, re-read the required local-dev, M2 exit, runtime-control, and approval-card files, and reran the required inspections `rg -n "approval.requested|approval.resolved|awaiting_approval|approvalCards|resolveApproval|interrupt|liveControl|Approval required: \`false\`" apps docs plans tools`, `git status --short`, and `git diff --name-only HEAD`.
- [x] (2026-03-16T17:06Z) Added a narrow reproducible approval smoke helper at `tools/m2-approval-proof-smoke.ts` plus the root script `pnpm m2:approval-smoke`, using the existing `file-change-approval` fake runtime fixture behind a temporary embedded control-plane app and real localhost HTTP routes.
- [x] (2026-03-16T17:06Z) Captured fresh local proof in `docs/ops/local-dev.md` and `docs/ops/m2-exit-report.md` showing `awaiting_approval`, one persisted approval row, pending and resolved `approvalCards`, `POST /approvals/:approvalId/resolve`, and replay evidence for `approval.requested` plus `approval.resolved`.

## Surprises & Discoveries

- Observation: the persisted approval row already carries enough data for a good card without any schema change.
  Evidence: `packages/domain/src/approval.ts` plus `apps/control-plane/src/modules/approvals/service.ts` store kind, status, actors, rationale, task id, timestamps, and runtime payload details like `reason`, `grantRoot`, `command`, `cwd`, and network context.

- Observation: the current operator gap is almost entirely in the read-model seam.
  Evidence: `apps/control-plane/src/modules/missions/detail-view.ts` currently reduces approvals to `id`, `kind`, `status`, actors, rationale, and timestamps; `apps/web/components/mission-card.tsx` then renders those values directly.

- Observation: proof-bundle assembly already computes repo, branch, PR, and latest approval posture for the same mission detail response, so the approval-card formatter can reuse that existing context instead of reaching into GitHub modules directly.
  Evidence: `apps/control-plane/src/modules/evidence/proof-bundle-summary.ts`, `packages/domain/src/proof-bundle.ts`, and `packages/domain/src/mission-detail.ts`.

- Observation: the app-package `tsc` runs consume the referenced `packages/domain` project outputs, so changing the domain contract required a local `pnpm --filter @pocket-cto/domain build` before the control-plane and web typechecks could see `approvalCards`.
  Evidence: the first requested `pnpm --filter @pocket-cto/control-plane typecheck` and `pnpm --filter @pocket-cto/web typecheck` runs failed with missing `MissionApprovalCard` or `approvalCards` contract errors until the domain build refreshed the referenced declarations.

- Observation: the real local seeded approval run is still not a reliable way to force an approval request on demand, even though the approval-capable stack and route surface already work.
  Evidence: `docs/ops/m2-exit-report.md` truthfully recorded `Approval required: false` for the approval-seeking seeded run, while the dedicated smoke immediately reproduced a pending approval only when the runtime was pointed at the existing `file-change-approval` fixture.

## Decision Log

- Decision: extend the existing `GET /missions/:missionId` read model with `approvalCards` instead of adding a separate approval-card route.
  Rationale: the current mission detail surface already aggregates approvals, artifacts, proof bundle, and live-control posture in one response, so approval cards belong in that same operator read model as a presentation-focused derivative.
  Date/Author: 2026-03-16 / Codex

- Decision: keep one narrow formatter module under `apps/control-plane/src/modules/approvals/` and keep the web layer render-only.
  Rationale: this preserves bounded-context ownership of approval semantics, keeps card wording reusable for later surfaces, and avoids rebuilding formatting rules separately in the browser.
  Date/Author: 2026-03-16 / Codex

- Decision: preserve the existing `approvals` array for low-level summary compatibility and add `approvalCards` as the operator-facing contract.
  Rationale: this narrows migration risk for current tests and any callers while letting the web mission detail shift to the richer card contract immediately.
  Date/Author: 2026-03-16 / Codex

- Decision: treat unsupported or sparse approval kinds explicitly in the formatter instead of inventing missing detail.
  Rationale: approval cards are part of the evidence surface, so “unknown approval” is safer than implied precision when persisted data is limited.
  Date/Author: 2026-03-16 / Codex

- Decision: close the operational proof gap with an explicit fixture-backed local smoke instead of claiming the seeded live runtime path is reliable enough today.
  Rationale: the repository already has a truthful fake-runtime approval fixture that exercises the same approval persistence, read-model, replay, and HTTP resolution paths; using it openly is safer than overstating the current live-runtime behavior.
  Date/Author: 2026-03-16 / Codex

## Context and Orientation

Pocket CTO already persists approvals durably and threads them into the mission detail response.
The approval module owns persistence, resolution, replay, and live continuation.
The mission detail read model already joins mission, task, artifact, approval, proof-bundle, and live-control state.
The web mission detail page already renders those sections and preserves operator actions for approval resolution and task interrupt.

The missing piece for M2.6 is a formatter seam that can turn a persisted approval row plus surrounding mission context into a compact operator card.
Today the read model throws away most runtime detail and the web surface compensates by showing generic rows like “Requested by system at ...”.

The main files for this slice are:

- `plans/EP-0017-approval-card-formatter.md`
- `packages/domain/src/mission-detail.ts`
- `packages/domain/src/index.ts`
- `apps/control-plane/src/modules/approvals/card-formatter.ts`
- `apps/control-plane/src/modules/approvals/card-formatter.spec.ts`
- `apps/control-plane/src/modules/missions/detail-view.ts`
- `apps/control-plane/src/modules/missions/service.spec.ts`
- `apps/control-plane/src/app.spec.ts`
- `apps/web/lib/api.spec.ts`
- `apps/web/components/mission-card.tsx`
- `apps/web/components/mission-card.spec.tsx`
- `apps/web/app/missions/[missionId]/page.tsx`
- `docs/ops/local-dev.md`
- `docs/architecture/replay-and-evidence.md`

This slice should not change:

- approval persistence schema
- replay event types
- GitHub App permissions, token handling, or webhook semantics
- live-control route behavior

The follow-up proof helper for this slice intentionally keeps those boundaries intact.
It packages existing behavior into a reproducible local smoke rather than redesigning persistence, changing routes, or widening into M3.

## Plan of Work

First, add a typed approval-card contract to the mission-detail domain response.
That contract should represent concise operator-facing card fields rather than raw persistence fields: title, summary, task label, repo or branch or PR context, pending action hint, and resolution text.
The card shape should still preserve explicit kind, status, actor, and timestamp facts.

Next, add one formatter module in the approvals bounded context.
That formatter should accept a persisted approval row plus mission tasks and proof-bundle context, inspect the runtime payload safely, and derive a compact card for the known approval kinds:
`file_change`, `command`, `network_escalation`, plus an honest fallback for anything else currently persisted.

Then, thread that formatter through the existing mission detail read model.
`buildMissionDetailView(...)` should keep the existing thin approval summaries but also attach `approvalCards` in oldest-first order so the mission detail route stays coherent and low-risk.

After that, update the web mission detail renderer to use the new approval cards.
The approvals section should become compact, mobile-safe, and explicit about operator posture while leaving `MissionActions` in charge of resolve and interrupt controls.

Finally, add focused tests and docs.
Formatter tests should cover kind-specific copy and pending or resolved differences.
Read-model and API-shape tests should prove `approvalCards` exists and is correctly shaped.
Web tests should prove the card rendering for at least one pending and one resolved approval.
The docs should explain that mission detail now exposes formatted approval cards derived from persisted evidence.

## Concrete Steps

Run these commands from the repository root as needed:

    rg -n "approval|awaiting_approval|liveControl|reason|rationale|kind|status" apps packages docs
    git status --short
    git diff --name-only HEAD
    pnpm --filter @pocket-cto/control-plane test
    pnpm --filter @pocket-cto/control-plane typecheck
    pnpm --filter @pocket-cto/control-plane lint
    pnpm --filter @pocket-cto/web test
    pnpm --filter @pocket-cto/web typecheck
    pnpm --filter @pocket-cto/web lint

Useful narrow commands during implementation:

    pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/approvals/card-formatter.spec.ts src/modules/missions/service.spec.ts src/app.spec.ts
    pnpm --filter @pocket-cto/web exec vitest run components/mission-card.spec.tsx lib/api.spec.ts

If local execution remains possible after tests, run one manual mission-detail fetch or render check and record:

- approval card count
- one sample pending card summary
- one sample resolved card summary
- whether resolve or interrupt controls still behave as expected

## Validation and Acceptance

Success for M2.6 is demonstrated when all of the following are true:

1. The mission detail contract exposes concise approval cards derived from persisted approvals plus mission context.
2. Each card includes at least approval kind, status, requested timestamp, requester, concise title, concise summary or body, affected task, repo or branch or PR context when available, pending action hint, and rationale or resolution text when resolved.
3. The formatter handles `file_change`, `command`, and `network_escalation`, and any unsupported kind remains explicit rather than pretending detail exists.
4. The control-plane route surface remains thin and approval persistence logic stays unchanged.
5. The web mission detail page renders compact approval cards and keeps the current resolve and interrupt controls working.
6. Focused tests cover formatter output, pending versus resolved card differences, mission-detail or API shape, and web rendering.
7. Replay and proof-bundle evidence remain truthful; approval cards are derived from persisted evidence rather than becoming a hidden side channel.

## Idempotence and Recovery

This slice should be additive and read-model focused.
No DB migration is expected.
If any code path starts requiring schema changes, stop and re-scope because M2.6 should not redesign approval persistence.

The formatter should be deterministic for the same approval row and surrounding mission state.
If validation fails partway through implementation, rollback is straightforward:
revert the approval-card formatter module, the domain contract addition, the mission-detail wiring, the web rendering updates, the associated tests, and the doc changes together.

## Artifacts and Notes

Initial gap notes captured before implementation:

1. `git status --short`
   Result: clean working tree before this slice started.
2. `git diff --name-only HEAD`
   Result: no pre-existing local diff before this slice started.
3. Current data gap:
   `ApprovalRecord` already stores rich payload detail, but `MissionApprovalSummary` currently omits task linkage and payload-derived explanation fields.
4. Current UI gap:
   `MissionCard` renders approvals as simple rows with requester, timestamps, and optional rationale, which is not yet a concise operator-ready card.

Validation results, manual checks, and any final card-format examples will be appended here as implementation proceeds.

Chosen card-format rules to implement:

- one short title line per approval
- one compact summary line that answers “what is being approved and why”
- one small facts row for task, repo, branch, and PR when available
- one action hint for pending cards only
- one resolution or rationale line for resolved cards only
- honest fallback copy for sparse or unsupported approval kinds

Validation results captured after implementation:

- `pnpm --filter @pocket-cto/control-plane test`
  Result: passed with 35 test files and 160 tests.
- `pnpm --filter @pocket-cto/control-plane typecheck`
  Result: the first run failed because the referenced `@pocket-cto/domain` outputs were stale; after `pnpm --filter @pocket-cto/domain build`, the rerun passed.
- `pnpm --filter @pocket-cto/control-plane lint`
  Result: passed.
- `pnpm --filter @pocket-cto/web test`
  Result: passed with 4 test files and 15 tests.
- `pnpm --filter @pocket-cto/web typecheck`
  Result: the first run failed for the same stale-domain-output reason; after `pnpm --filter @pocket-cto/domain build`, the rerun passed.
- `pnpm --filter @pocket-cto/web lint`
  Result: passed.

Manual mission-detail fetch and render check:

- Fetch path: a stubbed in-memory control-plane app served `GET /missions/:missionId` with two approval cards and returned `200 OK`.
- Render path: `apps/web/components/mission-card.tsx` rendered both the pending and resolved approval cards from that fetched payload.
- Approval card count: `2`
- Sample pending card summary: `Allow file edits in the task workspace. Why it matters: the runtime needs workspace write access to continue.`
- Sample resolved card summary: `Approved by Alicia at 2026-03-16T12:03:00.000Z. Rationale: Local validation should run before publishing.`
- Operator action controls still work: yes; the manual fetch showed the pending approval state the forms key off of, and the existing action-path tests stayed green in `apps/web/app/missions/[missionId]/actions.spec.ts`, `apps/web/app/missions/[missionId]/action-feedback.spec.tsx`, and `apps/web/lib/api.spec.ts`.

Operational proof addendum:

- Smoke command: `pnpm m2:approval-smoke`
- Smoke mode: `embedded_fake_runtime_approval_replay`
- Result: passed
- Mission id: `f6d5cd62-890d-4db2-a04f-d4efc98c5800`
- Approval id: `fe91022c-ad34-4e88-ac87-61deac594c06`
- Executor task id: `af4570b5-b871-4767-bc6a-27ed5714f186`
- Mission status before resolution: `awaiting_approval`
- Persisted approval rows before resolution: `1`
- Pending card summary: `Allow file edits under .../f6d5cd62-890d-4db2-a04f-d4efc98c5800/1-executor/src. Why it matters: Requesting extra write access for the planned file edits.`
- Resolve route: `POST /approvals/fe91022c-ad34-4e88-ac87-61deac594c06/resolve` returned `200`
- Final mission status: `succeeded`
- Final executor task status: `succeeded`
- Resolved card summary: `Approved by m2-approval-proof-smoke at 2026-03-16T17:06:12.434Z. Rationale: Fixture-backed local approval proof accepted through HTTP.`
- Replay evidence: `GET /missions/f6d5cd62-890d-4db2-a04f-d4efc98c5800/events` included both `approval.requested` and `approval.resolved`

## Interfaces and Dependencies

Important existing types and modules for this slice:

- `ApprovalRecord` and approval enums in `packages/domain/src/approval.ts`
- `MissionDetailView` in `packages/domain/src/mission-detail.ts`
- `ProofBundleManifest` in `packages/domain/src/proof-bundle.ts`
- `ApprovalService` and runtime payload helpers in `apps/control-plane/src/modules/approvals/`
- `buildMissionDetailView(...)` in `apps/control-plane/src/modules/missions/detail-view.ts`
- `MissionService.getMissionDetail(...)` in `apps/control-plane/src/modules/missions/service.ts`
- `MissionCard` and `MissionActions` in `apps/web/app/missions/[missionId]/`

No new environment variables are expected.
No new GitHub App permissions or webhook expectations are expected.
Approval cards will reuse existing repo or PR context already surfaced through the proof bundle rather than depending on new GitHub reads.
The local approval smoke helper adds one new operator command but does not add new runtime config or GitHub App scope.

## Outcomes & Retrospective

M2.6 now ships approval cards as an additive mission-detail read-model feature instead of a UI-only rewrite.
The control plane keeps the durable `approvals` summary array, adds reusable `approvalCards`, and formats those cards from persisted approval rows plus task and proof-bundle context.
The web mission detail and action panel now consume the formatted cards directly, so operators see concise titles, summaries, action hints, and resolved rationale without losing the existing resolve or interrupt workflow.

The slice now also has a truthful reproducible local proof path.
Because the real seeded runtime path still does not reliably emit a live approval on demand, the checked-in smoke deliberately uses the existing fake-runtime approval fixture while still driving the real control-plane HTTP routes, persisted approval rows, approval cards, and replay events.
That keeps the evidence bundle honest and gives operators a stable approval smoke they can rerun before wider UI or M3 work.

The shipped card strategy is intentionally compact and honest:
known kinds get specific copy for file edits, commands, and network escalation; pending cards tell the operator what to review; resolved cards surface the outcome and rationale; unsupported kinds admit that the formatter has only limited detail.
No replay, persistence, or GitHub permission behavior changed.

M2.7 can now start cleanly on top of this slice.
The operator surface has a stable reusable approval-card contract, the mission-detail API exposes it already, the current controls still work, and later UI work can focus on layout or broader mission-detail polish instead of rebuilding approval semantics from raw rows.
