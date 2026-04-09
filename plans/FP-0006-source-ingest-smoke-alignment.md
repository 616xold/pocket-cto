# Add packaged F1 source-ingest smoke commands for local ergonomics

## Purpose / Big Picture

This plan implements a narrow follow-up inside **F1 source registry and raw ingest**.

The user-visible goal is simple: the repo root should offer truthful packaged smoke commands that exercise the already-shipped F1 source routes without widening into Finance Twin, CFO Wiki, reports, monitoring, UI, or GitHub connector work.
After this slice, an operator should be able to run one repo-level command to register a finance-flavored source plus raw file through the current `/sources` routes, and another repo-level command to run the same path with ingest enabled through the current `/sources/files/:sourceFileId/ingest` route.

## Progress

- [x] 2026-04-09T12:36:09Z Complete the required preflight, confirm the branch state is clean, verify `gh auth status`, and read the required roadmap, F1A/F1B/F1C plans, local-dev guidance, and repo instructions.
- [x] 2026-04-09T12:44:03Z Add packaged root scripts plus one or more `tools/source-*.mjs` helpers that drive the existing F1 source routes truthfully without widening product semantics.
- [x] 2026-04-09T12:44:03Z Add focused test coverage for the packaged smoke helper behavior and update local-dev guidance only with a small truthful command note.
- [x] 2026-04-09T12:44:03Z Run `pnpm smoke:source-registry:local`, `pnpm smoke:source-ingest:local`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm ci:repro:current`. Commit, push, and PR creation remain the final publication steps.

## Surprises & Discoveries

- Observation: the F1 backend already exposes the truthful route surface needed for this slice.
  Evidence: `apps/control-plane/src/modules/sources/routes.ts` already supports `POST /sources`, `POST /sources/:sourceId/files`, and `POST /sources/files/:sourceFileId/ingest`.

- Observation: the root package scripts still emphasize engineering-era smokes and do not yet provide a packaged finance-source smoke path.
  Evidence: the current root `package.json` contains GitHub, M2, M3, and twin smoke scripts but no root `smoke:source-*` command.

- Observation: importing a `.mjs` smoke helper directly from Vitest will eagerly execute any top-level script entrypoint.
  Evidence: the first focused spec run executed the live smoke path on import until the tool was guarded behind a direct-entrypoint check.

- Observation: TypeScript needs a sibling declaration file for the new `.mjs` helper so control-plane specs can import it cleanly during `pnpm typecheck`.
  Evidence: the first repo typecheck failed with `TS7016` for `tools/source-ingest-smoke.mjs` until `tools/source-ingest-smoke.d.mts` was added.

## Decision Log

- Decision: create a new active Finance Plan for this ergonomics follow-up instead of reopening the shipped F1C implementation plan.
  Rationale: the existing F1A/F1B/F1C plans document delivered backend slices, while this work is a narrow repo-level packaging and smoke-alignment slice on top of those shipped routes.

- Decision: drive the smoke path through the existing HTTP routes using a packaged helper rather than calling source services directly.
  Rationale: the user asked for a truthful smoke path through the current backend, so the helper should exercise route parsing and transport boundaries instead of inventing a side door.

- Decision: keep GitHub connector work, UI work, Finance Twin work, CFO Wiki work, reports, monitoring, and replay expansion explicitly out of scope.
  Rationale: this slice is ergonomics-only and should not widen beyond the current F1 backend.

- Decision: seed source creation with a real temp manifest file referenced as `local_path`, then upload the finance-flavored CSV through the existing raw-file route.
  Rationale: the create-source route still requires an initial snapshot, so a real temp seed manifest keeps the smoke truthful without changing F1 product semantics.

- Decision: report the latest snapshot state by reading `/sources/:sourceId` after the optional ingest step.
  Rationale: the packaged smoke summary should show the current persisted snapshot status rather than only the earlier upload response.

## Context and Orientation

Pocket CFO is still in F1.
F1A established the generic source registry, F1B added immutable raw-file storage plus provenance, and F1C added deterministic parser dispatch plus durable ingest receipts.
This slice does not add new product semantics on top of those foundations.

The relevant bounded contexts are:

- the root `package.json` for packaged repo-level smoke commands
- `tools/` for reusable source smoke helpers
- `apps/control-plane/src/modules/sources/` only if a tiny smoke-facing fix is truly required
- `docs/ops/local-dev.md` only if a small truthful command note is helpful

GitHub connector work is out of scope.
Finance Twin, CFO Wiki, reports, monitoring, and web UI work are out of scope.
The active-doc boundary should remain unchanged apart from a small local-dev note if needed.

## Plan of Work

Implement this slice in three small passes.

First, add a narrow active Finance Plan that names the packaged smoke commands, helper files, validation, and publication steps.
Second, add a repo-level source smoke helper under `tools/` plus additive root scripts so an operator can run a registry-only smoke or a registry-plus-ingest smoke against the existing F1 routes.
Third, add focused test coverage for the packaged helper behavior, update `docs/ops/local-dev.md` only if the new command needs a small note, and then run the requested validation and publication steps.

## Concrete Steps

1. Create and keep this active Finance Plan current while work proceeds.

2. Update the root `package.json` scripts with additive finance-era smoke commands, likely including:
   - one command that creates a source and registers a raw file through the current routes
   - one command that performs the same path and then triggers ingest

3. Add one or more helpers under `tools/`, likely centered on `tools/source-ingest-smoke.mjs`, that:
   - load the repo `.env`
   - boot the real control-plane container with the current DB and object-store configuration
   - call the existing source routes through the Fastify app transport
   - print a compact summary containing the created source, snapshot, source-file, and optional ingest-run IDs plus status

4. Add focused test coverage for packaged helper behavior, likely by exporting argument-parsing or command-shaping helpers from the tool and asserting those defaults from a nearby Vitest spec.

5. Update `docs/ops/local-dev.md` only if a short command note is needed for discoverability.

6. Run validation:

   ```bash
   pnpm smoke:source-registry:local
   pnpm smoke:source-ingest:local
   pnpm lint
   pnpm typecheck
   pnpm test
   pnpm ci:repro:current
   ```

7. If and only if validation is green, create exactly one local commit:

   ```bash
   git commit -m "chore: add source ingest smoke commands"
   ```

8. If green, push the current feature branch and create the PR into `main`.

## Validation and Acceptance

Validation commands:

```bash
pnpm smoke:source-registry:local
pnpm smoke:source-ingest:local
pnpm lint
pnpm typecheck
pnpm test
pnpm ci:repro:current
```

Acceptance is met when all of the following are true:

- the repo root exposes packaged finance-source smoke commands
- one or more `tools/source-*.mjs` helpers exist
- the smoke path can create a source and register a raw file through the existing source routes
- the ingest-enabled smoke path can optionally trigger the current ingest route and report the ingest result truthfully
- no Finance Twin, CFO Wiki, reporting, monitoring, GitHub connector, or UI behavior is added or changed
- any docs change stays limited to a small truthful local-dev note

Provenance, freshness, and limitation posture:
the smoke must preserve the existing F1 truthfulness by keeping raw-file registration immutable, using the current checksum-backed file path, and reporting when the command stopped at registration versus when it also ran ingest.
No new freshness or evidence claims should be introduced beyond the current route outputs.

## Idempotence and Recovery

This slice is additive and safe to retry.

- Re-running the smoke commands should create new uniquely named source records rather than mutating prior rows.
- The helper should rely on existing F1 storage and ingest behavior instead of rewriting raw files in place.
- If validation fails, discard the uncommitted script or doc changes, re-run the packaged commands, and keep rollback scope isolated to root scripts, helper tooling, and any tiny smoke-facing fixes.

## Artifacts and Notes

Expected artifacts from this slice:

- one active Finance Plan for the F1 smoke-alignment follow-up
- additive root package smoke commands
- one or more `tools/source-*.mjs` helpers
- focused test coverage for the packaged helper behavior
- a small local-dev command note only if needed
- one clean commit, push, and PR if validation is fully green

Replay and evidence note:
this slice does not add source-domain replay, evidence bundles, or any new ingest semantics.
It packages a smoke path around the already-shipped F1 backend only.

## Interfaces and Dependencies

Package and runtime boundaries:

- the root package owns script packaging only
- `tools/` owns smoke orchestration helpers
- `apps/control-plane` remains the backend being exercised, not a new domain surface

Configuration expectations:

- reuse the existing repo `.env` loading pattern
- reuse the current DB and S3-compatible object-store settings
- add no new environment variables

GitHub connector work is explicitly out of scope.
No stack-pack or skill behavior changes are expected.

## Outcomes & Retrospective

This slice is in progress.

This slice shipped the intended narrow outcome.

What now exists:
the repo root now exposes `pnpm smoke:source-registry:local` and `pnpm smoke:source-ingest:local`, both backed by `tools/source-ingest-smoke.mjs`.
The helper boots the current DB-backed and object-store-backed control plane from the repo `.env`, creates a finance-flavored source plus a real raw file through the existing F1 routes, and optionally triggers ingest before printing a compact truthful summary.

Support artifacts:
`tools/source-ingest-smoke.d.mts` gives the helper a typed import surface for tests, `apps/control-plane/src/modules/sources/source-ingest-smoke-tool.spec.ts` covers the packaged helper defaults, and `docs/ops/local-dev.md` now mentions the new commands in the local validation list.

Validation results:
`pnpm smoke:source-registry:local` passed, `pnpm smoke:source-ingest:local` passed with a `csv_tabular` ingest run reaching `ready`, `pnpm lint` passed, `pnpm typecheck` passed after adding the helper declaration file, `pnpm test` passed, and `pnpm ci:repro:current` passed with detached-worktree reproduction success.

Scope held:
no Finance Twin, CFO Wiki, reports, monitoring, UI, GitHub connector, or source-domain replay work was added or changed.
No `apps/control-plane/src/modules/sources/` product semantics needed modification for this slice.
