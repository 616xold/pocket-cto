---
name: pocket-cfo-handoff-auditor
description: Use at the end of every Pocket CFO Codex slice or when reviewing Codex output. Produces a compact handoff packet for human review and next-prompt design.
---

Purpose: Replace long pasted transcripts with a compact audit packet.

General Pocket CFO invariants:
- Treat Pocket CFO as a single-company, single-operator, evidence-native finance mission-control system.
- Prefer deterministic read models, persisted source lineage, proof bundles, replay events, and human-reviewable outputs.
- Never invent finance facts. Never infer source truth that is not present in stored source/twin/wiki/proof state.
- Preserve mission-based workflows; do not turn Pocket CFO into generic chat.
- Keep slices narrow, phase-bound, and green. Do not widen into delivery, export, runtime-Codex, or F6 implementation unless the active Finance Plan explicitly authorizes it.
- Do not use GitHub Connector Guard unless the user explicitly requests it.

At closeout, produce HANDOFF_PACKET:
- slice name and phase
- active Finance Plan
- branch, commit, PR
- changed files grouped by docs/domain/db/control-plane/web/tools/tests
- new routes, migrations, scripts, smokes
- runtime surfaces changed
- docs changed
- validation commands passed, skipped, rerun
- known issues and fixes
- exact next recommendation

Rules:
1. Do not hide failures.
2. Do not claim all validation passed unless required validation passed on final tree.
3. Distinguish docs freshness from runtime correctness.
4. Distinguish shipped plan records from active plan contracts.
