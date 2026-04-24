---
name: source-provenance-guard
description: Use for tasks touching source ingest, finance twin facts, discovery answers, reporting artifacts, monitoring, proof bundles, freshness, lineage, or CFO Wiki truth.
---

Purpose: Protect source truth, freshness, and lineage.

General Pocket CFO invariants:
- Treat Pocket CFO as a single-company, single-operator, evidence-native finance mission-control system.
- Prefer deterministic read models, persisted source lineage, proof bundles, replay events, and human-reviewable outputs.
- Never invent finance facts. Never infer source truth that is not present in stored source/twin/wiki/proof state.
- Preserve mission-based workflows; do not turn Pocket CFO into generic chat.
- Keep slices narrow, phase-bound, and green. Do not widen into delivery, export, runtime-Codex, or F6 implementation unless the active Finance Plan explicitly authorizes it.
- Do not use GitHub Connector Guard unless the user explicitly requests it.

Rules:
1. Finance answers, reports, monitor results, alerts, and investigation seeds must trace to stored source/twin/wiki/proof state.
2. Do not create or rewrite finance facts to pass a feature.
3. Preserve fresh/stale/missing-source posture.
4. Ready means required stored artifact/facts exist; it does not mean approved, released, circulated, corrected, or monitored.
5. Monitoring alerts are deterministic findings over stored state, not advice and not autonomous action.
