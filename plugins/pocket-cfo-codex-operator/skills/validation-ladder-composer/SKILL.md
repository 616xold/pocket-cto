---
name: validation-ladder-composer
description: Use whenever a Pocket CFO prompt asks for validation, smoke ladders, QA reruns, or reproducibility gates.
---

Purpose: Compose validation ladders safely and repeatably.

General Pocket CFO invariants:
- Treat Pocket CFO as a single-company, single-operator, evidence-native finance mission-control system.
- Prefer deterministic read models, persisted source lineage, proof bundles, replay events, and human-reviewable outputs.
- Never invent finance facts. Never infer source truth that is not present in stored source/twin/wiki/proof state.
- Preserve mission-based workflows; do not turn Pocket CFO into generic chat.
- Keep slices narrow, phase-bound, and green. Do not widen into delivery, export, runtime-Codex, or F6 implementation unless the active Finance Plan explicitly authorizes it.
- Do not use GitHub Connector Guard unless the user explicitly requests it.

Always:
1. Read package.json before inventing any smoke command.
2. Read the active Finance Plan.
3. Split validation into narrow specs, package specs, shipped smokes, new smoke, twin guardrails, lint/typecheck/test, and ci:repro:current.
4. Use bash-safe scripts; avoid zsh array pitfalls and reserved names such as commands.
5. Log output to temp files and print exact failing command.
6. During QA, rerun only required checks unless a correction was made.
7. Never report a shell wrapper error as a product failure.
