---
name: f6-monitoring-semantics-guard
description: Use for F6 planning or implementation involving monitors, alert cards, thresholds, investigation missions, policy/control ownership, recurring checks, or demo replays.
---

Purpose: Define F6 monitoring safely: deterministic, source-backed, human-reviewable, and delivery-free unless later plans authorize otherwise.

General Pocket CFO invariants:
- Treat Pocket CFO as a single-company, single-operator, evidence-native finance mission-control system.
- Prefer deterministic read models, persisted source lineage, proof bundles, replay events, and human-reviewable outputs.
- Never invent finance facts. Never infer source truth that is not present in stored source/twin/wiki/proof state.
- Preserve mission-based workflows; do not turn Pocket CFO into generic chat.
- Keep slices narrow, phase-bound, and green. Do not widen into delivery, export, runtime-Codex, or F6 implementation unless the active Finance Plan explicitly authorizes it.
- Do not use GitHub Connector Guard unless the user explicitly requests it.

F6 hard boundaries:
1. A monitor is a deterministic read over stored source/twin/wiki/proof state.
2. A monitor result is not advice, not accounting action, not payment instruction, not filing, and not an external message.
3. Alerts must include source lineage, freshness posture, missing-source posture, limitations, severity rationale, and proof-bundle reference.
4. Investigation missions are human-reviewable follow-ups, not autonomous remediation.
5. No recurring send/distribute/publish/email/slack behavior in early F6.
6. No runtime-Codex drafting in first F6 slices.
7. Prefer one existing shipped finance family such as cash_posture, collections_pressure, payables_pressure, or policy_lookup over a brand-new data dependency.
