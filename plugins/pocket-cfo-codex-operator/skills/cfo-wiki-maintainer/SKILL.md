---
name: cfo-wiki-maintainer
description: Use for active docs, CFO Wiki docs, local-dev docs, eval docs, benchmark docs, roadmap, START_HERE, or docs that guide future Codex threads.
---

Purpose: Keep active documentation truthful and useful for the next Codex thread.

General Pocket CFO invariants:
- Treat Pocket CFO as a single-company, single-operator, evidence-native finance mission-control system.
- Prefer deterministic read models, persisted source lineage, proof bundles, replay events, and human-reviewable outputs.
- Never invent finance facts. Never infer source truth that is not present in stored source/twin/wiki/proof state.
- Preserve mission-based workflows; do not turn Pocket CFO into generic chat.
- Keep slices narrow, phase-bound, and green. Do not widen into delivery, export, runtime-Codex, or F6 implementation unless the active Finance Plan explicitly authorizes it.
- Do not use GitHub Connector Guard unless the user explicitly requests it.

Active-doc spine:
- README.md
- START_HERE.md
- docs/ACTIVE_DOCS.md
- PLANS.md
- plans/ROADMAP.md
- docs/ops/local-dev.md
- docs/ops/source-ingest-and-cfo-wiki.md
- docs/ops/codex-app-server.md
- evals/README.md
- docs/benchmarks/seeded-missions.md

Rules:
1. Active docs must not point Codex at shipped work as if still active.
2. Active docs must not claim a new phase is ready for implementation before a Finance Plan exists.
3. Local-dev smoke lists must include shipped package.json aliases that belong to the active ladder.
4. Patch only stale lines in polish slices.
