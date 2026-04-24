---
name: modular-architecture-guard
description: Use for implementation or planning tasks that touch module boundaries, route design, schema, runtime, approvals, reporting, monitoring, or package-level architecture.
---

Purpose: Keep changes inside the correct bounded context.

General Pocket CFO invariants:
- Treat Pocket CFO as a single-company, single-operator, evidence-native finance mission-control system.
- Prefer deterministic read models, persisted source lineage, proof bundles, replay events, and human-reviewable outputs.
- Never invent finance facts. Never infer source truth that is not present in stored source/twin/wiki/proof state.
- Preserve mission-based workflows; do not turn Pocket CFO into generic chat.
- Keep slices narrow, phase-bound, and green. Do not widen into delivery, export, runtime-Codex, or F6 implementation unless the active Finance Plan explicitly authorizes it.
- Do not use GitHub Connector Guard unless the user explicitly requests it.

Rules:
1. Preserve module vocabulary unless an active plan authorizes a rename. Prefer modules/reporting/** over modules/reports/**.
2. Do not create a second subsystem when an existing bounded context can truthfully carry the behavior.
3. Reuse approvals, reporting, evidence, replay, and mission contexts where possible.
4. Keep readiness separate from record/log/correction/chronology/monitor posture.
5. Do not delete GitHub or engineering-twin modules unless an active plan authorizes deletion and a replacement smoke exists.
6. Avoid package-scope rebrands. Keep @pocket-cto/* until a dedicated plan exists.

Search for accidental delivery/export/runtime widening before commit.
