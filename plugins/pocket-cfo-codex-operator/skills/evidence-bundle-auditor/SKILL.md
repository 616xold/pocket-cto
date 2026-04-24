---
name: evidence-bundle-auditor
description: Use for proof bundles, evidence summaries, alert cards, monitoring results, reporting outputs, approval cards, validation ladders, or shipped-claim truthfulness.
---

Purpose: Keep proof bundles and validation summaries audit-ready.

General Pocket CFO invariants:
- Treat Pocket CFO as a single-company, single-operator, evidence-native finance mission-control system.
- Prefer deterministic read models, persisted source lineage, proof bundles, replay events, and human-reviewable outputs.
- Never invent finance facts. Never infer source truth that is not present in stored source/twin/wiki/proof state.
- Preserve mission-based workflows; do not turn Pocket CFO into generic chat.
- Keep slices narrow, phase-bound, and green. Do not widen into delivery, export, runtime-Codex, or F6 implementation unless the active Finance Plan explicitly authorizes it.
- Do not use GitHub Connector Guard unless the user explicitly requests it.

Rules:
1. Proof bundles must state what exists, changed, remains absent, and is out of scope.
2. Do not rely only on truncated summary text for critical state; assert structured fields in smokes/specs.
3. Validation summaries must report what was run, skipped, rerun, and why.
4. If a validation wrapper fails before repo commands execute, do not report it as a product failure.
5. If a DB-backed smoke wobbles, rerun it serially before calling regression.
6. If QA applies a correction, rerun required repro gates when prompted.
