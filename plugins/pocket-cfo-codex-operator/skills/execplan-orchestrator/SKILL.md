---
name: execplan-orchestrator
description: Use when a task is complex, spans multiple files or packages, or needs a step-by-step execution document. Create or update a Finance Plan in plans/ that follows PLANS.md exactly, uses the F0-F6 roadmap, and remains live during implementation.
---

# ExecPlan Orchestrator

Follow this workflow strictly.

## When to trigger

Use this skill when:

- the task spans multiple files
- the task touches more than one package
- the task is likely to take more than 45 minutes
- the task changes architecture, schemas, workflows, or integration surfaces
- the user asks for a roadmap, implementation plan, or milestone breakdown

Do not use this skill for:

- typo fixes
- tiny styling tweaks
- isolated test updates
- one-function bug fixes with no boundary changes

## Required steps

1. Read `docs/ACTIVE_DOCS.md`, `AGENTS.md`, `PLANS.md`, `plans/ROADMAP.md`, and any active Finance Plan.
2. If no plan exists, create a new `plans/FP-*.md` plan.
3. Use the repository template in `plans/templates/execplan-template.md`.
4. Make the plan self-contained.
5. Explicitly name:
   - the target phase and slice
   - the files and modules to edit
   - whether GitHub connector work is in or out of scope
   - the validation commands
   - the replay, evidence, provenance, and freshness implications
6. Start implementation only after the plan is concrete enough that a new contributor could continue from it.
7. Update `Progress`, `Decision Log`, and `Surprises & Discoveries` at every meaningful stopping point.

## Quality bar

A valid Pocket CFO Finance Plan must:

- explain why the change matters in user-visible terms
- preserve modular boundaries
- define acceptance as observable behavior
- mention replay and evidence when relevant
- include safe retry and rollback guidance
- be implementable by a new contributor with only this repo and the plan
- keep the active-doc boundary explicit

## Output behavior

When invoked, either:

- create or update a Finance Plan, or
- confirm the active Finance Plan is sufficient and proceed against it

Do not produce a vague checklist.
Write a real execution document.
