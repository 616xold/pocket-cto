# EP-0007 - Specialize planner turns and persist plan artifacts

This ExecPlan is a living document. Keep `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` current.

## Purpose / Big Picture

After this slice, the first claimed `planner` task in Pocket CTO no longer runs on the generic read-only placeholder prompt. It runs on a dedicated planner prompt assembled from the mission contract, task role, workspace context, and repository workflow policy, then persists its read-only plan output as an explicit `plan` artifact tied to the task.

The operator-visible proof is concrete. A planner task in an isolated workspace should complete one read-only turn, update `mission_tasks.summary` with a concise planner summary, append `artifact.created` for a `plan` artifact, and keep replay compact by storing only deterministic completed textual planner outputs instead of token deltas.

This is roadmap submilestone `M1.4 basic planner task` only. It must not widen into executor file mutation, GitHub integration, approval persistence, or later M1.5 through M2 behavior.

## Progress

- [x] (2026-03-11T02:24Z) Read `START_HERE.md`, `README.md`, `AGENTS.md`, `WORKFLOW.md`, `PLANS.md`, `plans/ROADMAP.md`, `plans/EP-0001-mission-spine.md`, `plans/EP-0005-turn-lifecycle-and-replay.md`, `plans/EP-0006-workspaces-and-git-worktrees.md`, the requested architecture and ops docs, the runtime and evidence modules, the DB/domain schema files, the local generated Codex App Server bindings, and the fake runtime fixture named in the prompt.
- [x] (2026-03-11T02:24Z) Verified the M1.4 runtime-output gap before coding: the generated App Server schema and fake fixture already expose completed `agentMessage.text`, but Pocket CTO currently reduces runtime items to `itemId` plus `itemType`, so planner turns cannot yet persist plan text or derive task summaries from final runtime output.
- [x] (2026-03-11T02:24Z) Drafted this ExecPlan with the bounded M1.4 scope, expected edit surface, replay and evidence implications, validation commands, and recovery posture.
- [x] (2026-03-11T02:41Z) Added `planner-context.ts` and `planner-prompt.ts`, switched planner tasks to the new prompt path only, kept non-planner roles on the existing generic read-only input, and injected a bounded workspace-root `WORKFLOW.md` excerpt when present.
- [x] (2026-03-11T02:41Z) Extended the runtime result shape to capture completed agent-message text compactly through `completedAgentMessages` and `finalAgentMessageText`, keeping low-level item parsing in `@pocket-cto/codex-runtime` and leaving replay structural.
- [x] (2026-03-11T02:41Z) Added a narrow planner evidence path: planner task summaries now persist to `mission_tasks.summary`, successful planner turns persist one `plan` artifact with stable URI and thread/turn metadata, `artifact.created` replay is appended for that artifact, and the placeholder proof-bundle manifest is updated in place with the plan artifact id and one decision-trace line.
- [x] (2026-03-11T02:41Z) Added focused runtime, planner-prompt, in-memory orchestrator, and DB-backed orchestrator tests; updated the Codex runtime and local-dev ops docs; ran the required validation commands; and completed one manual planner acceptance against the fake fixture with `WORKFLOW.md` injection and no mutation attempts.
- [x] (2026-03-12T03:07Z) Hardened M1.4 planner evidence so it no longer depends on a rich final `agentMessage`: the runtime now captures ordered completed textual outputs for `plan` and `agentMessage` items, planner evidence deterministically combines them, plan artifacts record capture provenance in metadata, and fake fixture modes plus integration tests now cover `plan-only` and `multi-text` planner output paths.

## Surprises & Discoveries

- Observation: The local generated Codex App Server schema already models `agentMessage` items with final `text`, and `item/completed` notifications carry the full `ThreadItem` union, not only ids.
  Evidence: `tmp/codex-app-server-schema-m1.2-polish/v2/ThreadItem.ts` defines `{ "type": "agentMessage", id, text, phase }`, and `tmp/codex-app-server-schema-m1.2-polish/v2/ItemCompletedNotification.ts` wraps `item: ThreadItem`.

- Observation: The fake runtime fixture already emits planner-useful completed items, including both a `plan` item with `text` and an `agentMessage` item with `text`.
  Evidence: `packages/testkit/src/runtime/fake-codex-app-server.mjs` `buildLifecycle()` returns a completed `plan` item and a completed `agentMessage` item in the success mode.

- Observation: Pocket CTO currently discards planner-useful text before it reaches control-plane persistence.
  Evidence: `packages/codex-runtime/src/protocol.ts` parses thread items as passthrough objects, but `apps/control-plane/src/modules/runtime-codex/turn-lifecycle.ts` stores only `{ itemId, itemType, phase, threadId, turnId }`, and `apps/control-plane/src/modules/runtime-codex/types.ts` exposes no field for final message text.

- Observation: Planner turns can emit substantive `plan` text before or instead of a rich final `agentMessage`, so a final-message-only capture path is not stable enough for executor handoff.
  Evidence: the fake runtime fixture success mode already emits both `plan` and `agentMessage` items, and the new `plan-only` and `multi-text` fixture modes demonstrate planner-complete turns where the final `agentMessage` is absent or duplicated.

- Observation: The current prompt path is deliberately generic and read-only for every task role, so planner specialization must move into new small modules rather than accreting more text into `turn-input.ts`.
  Evidence: `apps/control-plane/src/modules/runtime-codex/turn-input.ts` builds one shared read-only prompt keyed only by role-specific one-line instructions.

- Observation: `WORKFLOW.md` is a repo-owned policy contract in this repository and should be injected into planner context if present, but today no runtime module reads workspace files for prompt assembly.
  Evidence: `WORKFLOW.md` defines workflow policy, while `apps/control-plane/src/modules/runtime-codex/` currently has no file-system context loader for prompt construction.

- Observation: `@pocket-cto/control-plane` typecheck still consumes referenced package declarations rather than live source exports for `@pocket-cto/codex-runtime`.
  Evidence: the first `pnpm --filter @pocket-cto/control-plane typecheck` failed to see `readAgentMessageThreadItem` until `pnpm --filter @pocket-cto/codex-runtime build` refreshed the referenced declarations.

## Decision Log

- Decision: Keep low-level final-message extraction inside `packages/codex-runtime`, but keep planner artifact formatting and summary generation in `apps/control-plane/src/modules/evidence/`.
  Rationale: The protocol package should own transport parsing, while mission-facing artifact and summary policy belongs in the control plane.
  Date/Author: 2026-03-11 / Codex

- Decision: Capture only completed `agentMessage` text and ignore token or delta streams for planner persistence.
  Rationale: The original M1.4 slice only needed compact replay and a narrow runtime extension. That kept the first planner artifact implementation small while avoiding streaming storage.
  Date/Author: 2026-03-11 / Codex

- Decision: Build persisted planner bodies from ordered completed textual outputs of type `plan` and `agentMessage`, trim empty blocks, collapse identical adjacent blocks, and record the contributing item ids and types in artifact metadata.
  Rationale: This keeps transport parsing generic, keeps planner selection policy inside the control-plane evidence boundary, preserves substantive plan text when no rich final `agentMessage` exists, and gives M1.5 a deterministic planner artifact contract to consume.
  Date/Author: 2026-03-12 / Codex

- Decision: Specialize planner prompt building in dedicated modules under `apps/control-plane/src/modules/runtime-codex/`, leaving non-planner roles on the current read-only placeholder path.
  Rationale: This preserves modularity, keeps M1.4 scoped to planner behavior, and makes the later M1.5 executor prompt replacement explicit.
  Date/Author: 2026-03-11 / Codex

- Decision: Persist the planner output as an additive `artifacts.kind = 'plan'` record with a stable task-scoped URI and structured metadata that includes thread and turn identifiers.
  Rationale: The artifact ledger already exists and `plan` is a first-class artifact kind. This is the narrowest evidence path that satisfies replay and proof-bundle linkage without introducing new tables.
  Date/Author: 2026-03-11 / Codex

- Decision: Update the existing placeholder proof-bundle manifest artifact in place instead of inserting a second proof-bundle artifact when planner evidence arrives.
  Rationale: M1.4 only needs to enrich the placeholder with the new plan artifact id and one decision-trace line. Updating the latest manifest row keeps the evidence ledger conservative and avoids inventing a new proof-bundle revision policy prematurely.
  Date/Author: 2026-03-11 / Codex

## Context and Orientation

Pocket CTO already has the M0 mission spine, M1.2 structural runtime replay, and M1.3 isolated task workspaces. A worker tick can now claim a task, ensure a deterministic workspace, run one read-only Codex turn, store `codexThreadId` and `codexTurnId`, append structural replay, and release the workspace lease when the turn ends.

What is missing for M1.4 is planner usefulness. The runtime path still builds one generic read-only prompt for every role and returns only lifecycle structure. The artifact layer only creates proof-bundle placeholders at mission creation time. As a result, a planner task can succeed mechanically without producing a persisted plan or a decision-ready task summary.

Repository boundaries for this slice must remain:

- `packages/codex-runtime/` for protocol schemas, client parsing, and the narrow runtime result-shape addition needed to surface final completed `agentMessage` text.
- `packages/domain/` only if replay or proof-bundle contracts need additive shared typing for the new plan-evidence shape.
- `packages/db/` only if existing additive schema needs no changes beyond current columns and artifact kinds.
- `apps/control-plane/src/modules/runtime-codex/` for planner prompt assembly, workflow context loading, and task-role dispatch.
- `apps/control-plane/src/modules/evidence/` for plan-artifact formatting, summary derivation, and any proof-bundle placeholder updates.
- `apps/control-plane/src/modules/orchestrator/` for calling the planner-specific path only when `task.role === "planner"` and persisting the returned evidence.
- `apps/control-plane/src/modules/missions/` for narrow repository methods to save generic artifacts and update `mission_tasks.summary`.

Expected edit surface for this slice:

- `plans/EP-0007-planner-task-implementation.md`
- `docs/ops/codex-app-server.md`
- `docs/ops/local-dev.md`
- `packages/codex-runtime/src/protocol.ts`
- `packages/codex-runtime/src/client.ts` only if helper exports need adjustment
- `packages/codex-runtime/src/index.ts`
- `packages/codex-runtime/src/protocol.spec.ts`
- `packages/testkit/src/runtime/fake-codex-app-server.mjs`
- `apps/control-plane/src/bootstrap.ts`
- `apps/control-plane/src/modules/evidence/service.ts`
- `apps/control-plane/src/modules/missions/repository.ts`
- `apps/control-plane/src/modules/missions/drizzle-repository.ts`
- `apps/control-plane/src/modules/missions/repository-mappers.ts`
- `apps/control-plane/src/modules/orchestrator/runtime-phase.ts`
- `apps/control-plane/src/modules/orchestrator/service.spec.ts`
- `apps/control-plane/src/modules/orchestrator/drizzle-service.spec.ts`
- `apps/control-plane/src/modules/runtime-codex/service.ts`
- `apps/control-plane/src/modules/runtime-codex/turn-lifecycle.ts`
- `apps/control-plane/src/modules/runtime-codex/types.ts`
- new small planner-focused modules under `apps/control-plane/src/modules/runtime-codex/` such as `planner-context.ts` and `planner-prompt.ts`

This slice is not expected to change GitHub App permissions, webhook expectations, stack packs, or add new environment variables. `WORKFLOW.md` reading should use the existing workspace root and remain local/read-only.

## Plan of Work

First, split planner prompt assembly out of the current generic read-only turn-input builder. The new planner path should gather mission objective, mission type, constraints, acceptance, evidence requirements, task role, and workspace context, then inject a bounded summary of workspace-root `WORKFLOW.md` when present. The prompt must explicitly forbid file edits, patches, installs, git changes, formatter runs, and approvals for mutation, and must request concise structured sections that an executor can consume later.

Next, extend the runtime protocol and lifecycle mapping just enough to surface completed textual outputs from `plan` and `agentMessage` items. The App Server already sends the full item object; Pocket CTO only needs typed extraction of those completed text items plus compatibility fields such as `finalAgentMessageText` for the agent-message subset. This extraction stays inside `packages/codex-runtime` and `runtime-codex/turn-lifecycle.ts`, not in the orchestrator.

Then, add a narrow evidence persistence boundary for planner outputs. The orchestrator runtime phase should, only for `task.role === "planner"` and only after a successful completed turn with planner-useful textual output, derive a concise task summary, persist a `plan` artifact with a stable URI and task/thread/turn linkage metadata, append `artifact.created`, and conservatively update the placeholder proof-bundle manifest so its artifact index and decision trace acknowledge the planner artifact when possible.

Finally, add focused tests across the runtime wrapper and the DB-backed control-plane path, update the docs and this ExecPlan, and run the required migration, test, typecheck, and lint commands plus one manual planner acceptance if the local runtime path remains available.

## Concrete Steps

Run these commands from the repository root as needed:

    pnpm db:generate
    pnpm db:migrate
    pnpm --filter @pocket-cto/codex-runtime test
    pnpm --filter @pocket-cto/codex-runtime typecheck
    pnpm --filter @pocket-cto/control-plane test
    pnpm --filter @pocket-cto/control-plane typecheck
    pnpm --filter @pocket-cto/control-plane lint

If local execution remains possible after tests, also run one manual planner acceptance against the fake fixture or real local Codex runtime and record:

- thread id
- turn id
- whether `WORKFLOW.md` was injected
- persisted artifact id and kind
- resulting `task.summary`
- first and last item types
- whether any file mutation was requested or attempted

Implementation order:

1. Keep this ExecPlan current with the gap analysis, decisions, and validation evidence.
2. Add planner context and prompt modules under `runtime-codex/`.
3. Extend the runtime wrapper and turn lifecycle to surface final completed agent-message text.
4. Add narrow repository and evidence methods for generic artifact persistence, task summary updates, and optional proof-bundle placeholder enrichment.
5. Wire planner-only evidence persistence into the orchestrator runtime phase without changing non-planner task behavior.
6. Add runtime-level and DB-backed control-plane tests.
7. Update docs and this ExecPlan with exact outcomes and remaining gaps.
8. Run the required validation and manual acceptance commands.

## Validation and Acceptance

Success for M1.4 is demonstrated when all of the following are true:

1. Planner prompt construction includes the mission objective, mission type, acceptance criteria, evidence requirements, workspace context, and explicit read-only rules.
2. Planner context includes a bounded summary or excerpt of workspace-root `WORKFLOW.md` when present and omits it cleanly when absent.
3. `@pocket-cto/codex-runtime` can surface ordered completed textual outputs from planner turns, while preserving compatibility access to final completed `agentMessage` text without storing every token delta.
4. A successful planner task persists exactly one `plan` artifact tied to the mission and task.
5. The planner task stores a concise `mission_tasks.summary` derived from the planner output.
6. Replay includes `artifact.created` for the new plan artifact.
7. Planner execution remains read-only and does not request or attempt file mutation, patch application, installs, formatter runs, git changes, or approval escalation.
8. Non-planner roles, especially `executor`, remain on the current non-mutating placeholder path unless a tiny compatibility adjustment is required.
9. `docs/ops/codex-app-server.md` documents the new runtime-output capture shape, and `docs/ops/local-dev.md` notes planner artifacts if that helps manual inspection.

Manual acceptance should show one claimed planner task completing with:

- a persisted `plan` artifact
- a non-null concise task summary
- a read-only prompt including workflow policy when available
- no file mutation attempted

## Idempotence and Recovery

This slice should stay additive. Artifact persistence should reuse the existing `artifacts` table and replay stream rather than introducing destructive schema changes.

Runtime-output capture must be safe to retry. If a runtime or persistence failure happens before the plan artifact is written, the task should remain recoverable by the existing claimed-task recovery path. If a failure happens after the planner turn completed but before the task summary or artifact is fully persisted, replay plus the durable thread and turn ids should make the failure diagnosable, and reruns should not duplicate plan artifacts unintentionally for the same completed turn.

Rollback is straightforward: revert the planner-specific prompt modules, the narrow runtime result-shape extension, and the planner artifact persistence together. If a migration is not needed, rollback stays entirely at the application layer.

## Artifacts and Notes

Verified M1.4 runtime-output notes before implementation:

- Generated schema: `tmp/codex-app-server-schema-m1.2-polish/v2/ThreadItem.ts` includes `agentMessage.text` and `plan.text`.
- Generated schema: `tmp/codex-app-server-schema-m1.2-polish/v2/ItemCompletedNotification.ts` includes the full `ThreadItem`.
- Fake fixture: `packages/testkit/src/runtime/fake-codex-app-server.mjs` success mode emits a completed `plan` item and completed `agentMessage` item with text.
- Current gap before the robustness pass: `apps/control-plane/src/modules/runtime-codex/turn-lifecycle.ts` resolved turn results with only `completedAgentMessages` and `finalAgentMessageText`, so planner evidence could still miss substantive `plan` output.

Expected evidence impact for this slice:

- new `plan` artifact row
- new `artifact.created` replay event for that row
- updated task summary
- optional placeholder proof-bundle manifest enrichment with artifact linkage and one decision-trace line

Validation results captured after implementation:

- `pnpm db:generate` passed with `No schema changes, nothing to migrate`.
- `pnpm db:migrate` passed.
- `pnpm --filter @pocket-cto/codex-runtime test` passed with 4 tests.
- `pnpm --filter @pocket-cto/codex-runtime typecheck` passed.
- `pnpm --filter @pocket-cto/control-plane test` passed with 31 tests.
- `pnpm --filter @pocket-cto/control-plane typecheck` passed after refreshing `@pocket-cto/codex-runtime` declarations with `pnpm --filter @pocket-cto/codex-runtime build`.
- `pnpm --filter @pocket-cto/control-plane lint` passed.

Manual acceptance captured after implementation:

- fake runtime path with temp repo `WORKFLOW.md` injection:
  - `threadId = thread_fake_123`
  - `turnId = turn_fake_123`
  - `workflowInjected = true`
  - `artifactId = 0d8f78cd-1120-4f68-9582-2c4ba996506c`
  - `artifactKind = plan`
  - `task.summary = "Plan the passkey work without changing files and preserve the existing email-login path."`
  - `firstItemType = plan`
  - `lastItemType = agentMessage`
  - `mutationRequestedOrAttempted = false`

## Interfaces and Dependencies

Important existing interfaces and modules for this slice:

- `MissionSpecSchema` and `MissionRecordSchema` in `packages/domain/src/mission.ts`
- `MissionTaskRecordSchema` in `packages/domain/src/mission-task.ts`
- `ArtifactRecordSchema` and `ProofBundleManifestSchema` in `packages/domain/src/proof-bundle.ts`
- `ReplayEventTypeSchema` in `packages/domain/src/replay-event.ts`
- `artifacts` and `mission_tasks.summary` in `packages/db/src/schema/artifacts.ts` and `packages/db/src/schema/missions.ts`
- `CodexAppServerClient`, `ThreadItemSchema`, and `KnownServerNotificationSchema` in `packages/codex-runtime/src/`
- `MissionRepository`, `ReplayService`, `EvidenceService`, `OrchestratorRuntimePhase`, `CodexRuntimeService`, and `WorkspaceService` in `apps/control-plane/src/modules/`

External/runtime dependencies:

- local `codex app-server` or the fake fixture for tests
- existing `WORKFLOW.md` at workspace root when present
- no new env vars expected

## Outcomes & Retrospective

M1.4 now ends with planner specialization and persisted plan artifacts in read-only isolated workspaces.
Planner turns have their own prompt builder and workspace-aware context loader, completed textual planner outputs are surfaced without delta storage, planner summaries persist to `mission_tasks.summary`, plan artifacts persist to the evidence ledger with `artifact.created` replay, and the placeholder proof bundle now acknowledges the planner artifact conservatively.

Planner artifacts are now robust enough to serve as a stable executor prerequisite for M1.5.
The persisted planner body is assembled deterministically from completed `plan` and `agentMessage` outputs, and artifact metadata records the capture strategy plus ordered source items that contributed to that body.

Non-planner behavior remains intentionally narrow.
`executor`, `scout`, `reviewer`, and `sre` still use the generic read-only placeholder prompt and do not persist planner artifacts.

The precise remaining gap to M1.5 is controlled executor mutation.
M1.5 still needs executor-specific prompt guardrails, file-change approval and mutation policy, controlled write-path handling, validation execution, and the evidence semantics for executor-produced diffs, test reports, and later PR artifacts.
