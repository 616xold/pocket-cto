# Pocket CFO Finance Plans

This file defines the required standard for executable plans in this repository.

Use a Finance Plan whenever work spans multiple files, more than one package, or more than 45 minutes of implementation time.

A Finance Plan is a living design and implementation document that a coding agent or human can follow without prior memory.

## Naming

Active Pocket CFO plans use `plans/FP-*.md`.

Do **not** create new `EP-*` plans.
Existing `EP-*` files are Pocket CTO history and should be archived or treated as reference-only once a replacement path exists.

## Rules

1. Every Finance Plan must be self-contained.
2. Every Finance Plan must explain the user-visible purpose first.
3. Every Finance Plan must name the target phase explicitly (`F0` through `F6`).
4. Every Finance Plan must define exact files, modules, commands, and acceptance checks.
5. Every Finance Plan must stay current while work proceeds.
6. Every Finance Plan must keep `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` up to date.
7. Every Finance Plan must prefer additive, testable changes.
8. Every Finance Plan must state rollback or retry guidance for risky steps.
9. Every Finance Plan must include validation commands.
10. Every Finance Plan must describe evidence of success, not just code changes.
11. Every Finance Plan must call out provenance, freshness, and limitation implications when relevant.
12. Every Finance Plan must say whether GitHub connector work is in scope or explicitly out of scope.
13. If no unfinished Finance Plan exists for the current repo phase, create the next-phase `plans/FP-*.md` plan before changing code.
14. Once a plan is clearly merged or shipped, update stale final publication checkboxes and outcome notes instead of leaving the plan looking unfinished.
15. When a new phase starts, keep the prior shipped plan as the historical record, add a tiny handoff note if the old plan previously claimed active status, and create exactly one new active plan for the next implementation contract.

## Required sections

Every Finance Plan must contain these sections, in this order:

1. `# <Short action-oriented title>`
2. `## Purpose / Big Picture`
3. `## Progress`
4. `## Surprises & Discoveries`
5. `## Decision Log`
6. `## Context and Orientation`
7. `## Plan of Work`
8. `## Concrete Steps`
9. `## Validation and Acceptance`
10. `## Idempotence and Recovery`
11. `## Artifacts and Notes`
12. `## Interfaces and Dependencies`
13. `## Outcomes & Retrospective`

## Formatting rules

- Write in plain prose.
- Prefer sentences over giant bullet farms.
- Be concrete about files and commands.
- Use checkboxes only in `Progress`.
- Use UTC timestamps in `Progress` entries.
- Do not rely on “as discussed previously”.
- Repeat assumptions if they matter.
- If a plan changes active-vs-archived docs, say so explicitly.

## Repository-specific requirements

For Pocket CFO plans:

- name the target phase and slice explicitly
- preserve architecture boundaries from `AGENTS.md`
- mention replay and evidence-bundle implications
- mention provenance, freshness, and limitation posture when the slice affects answers or reports
- for reporting or report-artifact phases, define the source-evidence contract, draft-versus-release posture, and runtime-codex boundary explicitly
- mention any impact on `WORKFLOW.md`, stack packs, or skills
- mention any new environment variables and where they are documented
- say whether the change is docs-only, schema-only, route-driven, artifact-driven, or cross-cutting
- keep internal `@pocket-cto/*` package scope unchanged unless the plan is specifically about renaming it later

## When you are implementing a Finance Plan

- proceed slice by slice
- do not ask for “next steps” after every tiny change
- keep the plan updated after meaningful progress
- if scope changes, record the reason in the `Decision Log`
- if a safer or simpler design emerges, prefer it and document the change
- if a stale Pocket CTO doc caused confusion, either update the active-doc boundary or archive that file in the same slice

## Template

Use `plans/templates/execplan-template.md` as the starting point for new Finance Plans.
