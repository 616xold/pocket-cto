---
name: modular-architecture-guard
description: Use when implementing or refactoring code. Enforces Pocket CFO module boundaries, small files, thin routes, pure domain contracts, and explicit service or repository splits. Do not use for docs-only changes.
---

# Modular Architecture Guard

Pocket CFO must stay legible to both humans and agents.
Your job is to prevent the repository from turning into a pile of god files while the pivot introduces new finance modules.

## Trigger when

Use this skill when:

- writing new application code
- refactoring a bounded context
- adding a route, service, repository, or package
- changing database access patterns
- introducing a new integration

Do not use this skill for:

- documentation-only changes
- markdown formatting
- image or asset updates

## Rules

1. Choose the target bounded context before writing code.
2. Keep transport, business logic, persistence, and formatting in separate files.
3. Keep routes thin.
4. Keep `packages/domain` pure and dependency-light.
5. Keep `apps/web` free of direct database imports.
6. Prefer adding a new module over extending a miscellaneous utility file.
7. If a file exceeds roughly 300 logical lines, split it.
8. Export package APIs through `src/index.ts`.
9. Add or update tests near the module you changed.
10. If you had to bend a boundary, record the reason in the active Finance Plan and an ADR if the change is architectural.

## Preferred bounded contexts for the pivot

Within `apps/control-plane`, prefer these product-facing seams:

- `modules/sources`
- `modules/missions`
- `modules/orchestrator`
- `modules/replay`
- `modules/evidence`
- `modules/finance-twin` or the finance-renamed twin slice
- `modules/wiki`
- `modules/reports`
- `modules/monitoring`
- `modules/approvals`
- `modules/runtime-codex`

Legacy GitHub modules may remain for a while, but they should be treated as connector or archive material, not as the main value path.

## Default split patterns

### HTTP or ingest flows

- `routes.ts` or `controller.ts`
- `schema.ts`
- `service.ts`
- `repository.ts`
- `events.ts`

### Deterministic extraction flows

- `parser.ts`
- `mapping.ts`
- `repository.ts`
- `service.ts`
- `events.ts`

### UI features

- page
- small presentational components
- API client
- view-model or formatter helper

## Deliverable check

Before finishing, verify:

- no unrelated responsibilities were merged into one file
- imports flow in the correct direction
- new modules have obvious names
- new code is discoverable from the repo map
- GitHub connector logic did not leak into the finance domain center
