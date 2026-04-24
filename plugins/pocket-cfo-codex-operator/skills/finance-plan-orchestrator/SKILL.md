---
name: finance-plan-orchestrator
description: Use for any Pocket CFO task that creates, updates, audits, or executes Finance Plans, active roadmap docs, phase handoffs, or plan truthfulness. Do not use to widen scope beyond the current active plan.
---

Purpose: Keep every Pocket CFO Codex thread anchored to one truthful Finance Plan and one phase-bounded scope.

General Pocket CFO invariants:
- Treat Pocket CFO as a single-company, single-operator, evidence-native finance mission-control system.
- Prefer deterministic read models, persisted source lineage, proof bundles, replay events, and human-reviewable outputs.
- Never invent finance facts. Never infer source truth that is not present in stored source/twin/wiki/proof state.
- Preserve mission-based workflows; do not turn Pocket CFO into generic chat.
- Keep slices narrow, phase-bound, and green. Do not widen into delivery, export, runtime-Codex, or F6 implementation unless the active Finance Plan explicitly authorizes it.
- Do not use GitHub Connector Guard unless the user explicitly requests it.

When invoked:
1. Read README.md, START_HERE.md, docs/ACTIVE_DOCS.md, PLANS.md, plans/ROADMAP.md, and the active plans/FP-*.md file.
2. Identify whether the task is docs-only, plan-only, implementation, QA, closeout, or post-merge polish.
3. Confirm which Finance Plan is active and which prior plans are shipped records.
4. If docs-only, do not add runtime code, routes, schema, migrations, package scripts, smoke commands, fixtures, or implementation scaffolding.
5. If implementation, implement only the first narrow slice described by the active plan.
6. If QA, fix only defects inside the audited slice.
7. If a bigger issue appears, report it instead of widening.

Finance Plan discipline:
- Create a new active Finance Plan only when explicitly requested.
- Do not create the next FP number during implementation or polish.
- Keep active docs synchronized with the one true next contract.
