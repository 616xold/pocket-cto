# Add immutable source files and provenance-backed raw ingest on top of F1A

## Purpose / Big Picture

This plan implements the next additive **F1 raw ingest** slice for Pocket CFO.

The user-visible goal is to move from logical source-registration records to real raw-file truth without widening into parser dispatch, Finance Twin work, CFO Wiki compilation, reports, monitoring, or the web upload UI.
After this slice, an operator should be able to register a new raw file for an existing source, have the control plane store the bytes immutably in object storage, persist file metadata plus provenance in Postgres, and keep the existing F1A source list and source detail surfaces truthful through snapshot summaries.

This slice matters now because later F1 parser work and later F2/F3 provenance-sensitive features need a trustworthy raw-file layer first.

## Progress

- [x] 2026-04-08T00:55:19Z Complete the required preflight: confirm fetched `origin/main`, clean branch state, GitHub auth, F1A path presence on `origin/main`, and local Postgres plus object storage reachability through the repo-standard local-dev bring-up path.
- [x] 2026-04-08T00:55:19Z Read the active repo guidance, F1 roadmap context, F0/F1A plans, control-plane and DB AGENTS files, and source-provenance guidance; inspect the current source-registry module, schema, tests, env, and storage-related seams.
- [x] 2026-04-08T00:55:19Z Implement additive domain contracts, DB schema, migration, control-plane storage helper, repository changes, and raw-ingest routes for `source_files` and `provenance_records`.
- [x] 2026-04-08T00:55:19Z Add deterministic tests for service, repository, storage, and HTTP behavior, then run the required validation sequence through `pnpm ci:repro:current`.
- [x] 2026-04-08T15:22:42Z Diagnose PR #62 `integration-db` against GitHub Actions logs, confirm the missing object-store service and bucket provisioning as the red CI cause, and validate the narrow CI hotfix through the failing storage spec, `pnpm ci:integration-db`, and `pnpm ci:repro:current`.
- [ ] 2026-04-08T00:55:19Z If every required validation is green, create exactly one commit, push `codex/f1b-source-files-and-provenance-local-v1`, and create or report the PR into `main`.

## Surprises & Discoveries

- Observation: F1A already persists file-shaped metadata on `source_snapshots`, and current list/detail read models depend on those snapshot summaries.
  Evidence: `packages/domain/src/source-registry.ts`, `packages/db/src/schema/sources.ts`, and `apps/control-plane/src/modules/sources/service.ts` treat snapshots as the summary-friendly source surface.

- Observation: the repository already reserves `SOURCE_OBJECT_PREFIX` beside the artifact S3 env, but there is no reusable source-storage helper or S3 client implementation yet.
  Evidence: `.env.example` includes `SOURCE_OBJECT_PREFIX`, while repo searches found no existing `S3Client` or source-object storage module.

- Observation: multipart upload support is not present in the current control-plane stack.
  Evidence: `apps/control-plane/package.json` has Fastify only, with no multipart plugin, and repo searches found no generic upload route helpers.

- Observation: the first clean-room `pnpm ci:repro:current` run exposed a deterministic failure in `src/modules/twin/codeowners-discovery.spec.ts` because the test wrote files before the `.github` and `docs` directories were fully created.
  Evidence: the repro run failed inside the temp worktree until the spec awaited the directory creation before calling `writeFile`.

- Observation: PR #62 `integration-db` on GitHub Actions exported S3 env vars for the new F1B storage surface but only provisioned Postgres, so `src/modules/sources/storage.spec.ts` failed with `ECONNREFUSED` against `127.0.0.1:9000`.
  Evidence: `gh run view 24112600278 -R 616xold/pocket-cfo --log-failed` showed the `S3SourceFileStorage` spec failing while the workflow job only started the Postgres service container.

## Decision Log

- Decision: preserve F1A `sources` and `source_snapshots` as the backward-compatible registry and checkpoint surface.
  Rationale: the user explicitly requires additive F1B work and forbids ripping out existing snapshot summary behavior.

- Decision: add `source_files` as the immutable raw-file layer and `provenance_records` as the raw-ingest audit and lineage layer.
  Rationale: this is the smallest truthful shape that gives each stored raw file a stable identity, checksum, storage reference, and explicit source plus snapshot linkage.

- Decision: mirror the newly registered primary file metadata into the newly created `source_snapshots` row.
  Rationale: F1A routes and read models already expose snapshot summaries, so mirroring keeps them backward compatible while the new file layer lands underneath.

- Decision: implement the upload route with `application/octet-stream` plus validated metadata instead of introducing a multipart dependency in this slice.
  Rationale: multipart is absent today, and a small binary-body route is the narrowest honest server-side upload mechanism that still stores raw bytes rather than fake metadata-only placeholders.

- Decision: keep GitHub connector work explicitly out of scope and keep source-domain replay out of scope for this slice.
  Rationale: the user forbids widening into connector replacement or later-phase work; provenance records provide the requested additive audit trail while replay remains mission-scoped today and would otherwise broaden the slice.

- Decision: keep the PR #62 hotfix inside CI provisioning and shared repro defaults instead of changing F1B source-domain code or tests.
  Rationale: the failing log proved the regression was environmental rather than product logic, so the narrow truthful fix is to provision MinIO plus the expected bucket in GitHub Actions and align `tools/ci-repro-shared.mjs` with the same object-store defaults.

## Context and Orientation

Pocket CFO is in the F1 source-registry and raw-ingest phase.
F0 guidance reset is complete and F1A already shipped the first additive source-registry foundation with `sources`, `source_snapshots`, and thin `/sources` routes beside the legacy GitHub connector.

The relevant bounded contexts for this slice are:

- `packages/domain` for pure source-file and provenance contracts
- `packages/db` for additive schema and forward-only migrations
- `apps/control-plane/src/modules/sources/` for route parsing, storage orchestration, persistence, and read models
- `apps/control-plane/src/app.ts`, `apps/control-plane/src/bootstrap.ts`, and `apps/control-plane/src/lib/types.ts` for wiring
- `.env.example` only if a truly unavoidable storage-setting change appears

GitHub connector work is out of scope.
Parser dispatch, Finance Twin writes, CFO Wiki compilation, reporting, monitoring, and web UI upload are out of scope.
The active-doc boundary should remain unchanged unless implementation reveals a direct conflict.

## Plan of Work

Implement this F1B slice in four bounded passes.

First, extend the domain and schema model so raw files and provenance have explicit contracts while `source_snapshots` remain the summary-facing compatibility layer.
Second, add a small source-storage helper in the control plane that reuses the existing S3-style artifact configuration plus `SOURCE_OBJECT_PREFIX` to persist raw bytes immutably.
Third, extend the sources repository and service so one file registration writes bytes to object storage and then creates one next-version snapshot, one source-file row, and one provenance record transactionally for an existing source.
Fourth, expose the new file-focused read and write routes, then cover them with deterministic service, repository, and app-level tests.

Keep the module split boring and explicit.
Routes stay thin, storage interaction stays outside the route layer, and `packages/domain` stays dependency-light.

## Concrete Steps

1. Create and keep this active Finance Plan current throughout the slice.

2. Extend `packages/domain/src/source-registry.ts` and `packages/domain/src/index.ts` with additive schemas and types for:
   - immutable `source_file` records
   - `provenance_record` entries for file registration
   - write input for registering a file against an existing source
   - read views for listing source files and reading a single source file detail

3. Extend `packages/db/src/schema/sources.ts`, `packages/db/src/schema/index.ts`, and `packages/db/src/schema.spec.ts` with additive enums and tables for:
   - `source_files`
   - `provenance_records`
   The schema must keep checksum, media type, size, original filename, storage kind, storage ref, source linkage, and snapshot linkage explicit.

4. Generate or author the forward-only Drizzle migration under `packages/db/drizzle/` and update `packages/db/drizzle/meta/` if needed.

5. Add the control-plane source-ingest implementation under `apps/control-plane/src/modules/sources/`, likely including:
   - `schema.ts` updates for file registration metadata and new route params
   - `routes.ts` updates for `POST /sources/:sourceId/files`, `GET /sources/:sourceId/files`, and `GET /sources/files/:sourceFileId`
   - `service.ts` updates for orchestrating file registration
   - `repository.ts`, `drizzle-repository.ts`, and `repository-mappers.ts` updates for new tables and read models
   - `storage.ts` for object-store writes and storage-key construction
   - `errors.ts` and `apps/control-plane/src/lib/http-errors.ts` updates only as needed for not-found or invalid-upload cases

6. Update `apps/control-plane/src/bootstrap.ts`, `apps/control-plane/src/lib/types.ts`, and `apps/control-plane/src/app.ts` only as needed to wire the new source-storage dependency and route surface.

7. Add deterministic tests covering:
   - service-level file registration and snapshot-version behavior
   - DB-backed repository persistence for source files and provenance records
   - app-level upload and read routes
   - schema export coverage

8. Run validation in this exact order using the repo-default local env:

   ```bash
   pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/sources/service.spec.ts src/modules/sources/drizzle-repository.spec.ts src/app.spec.ts
   pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/twin/workflow-sync.spec.ts src/modules/twin/test-suite-sync.spec.ts
   pnpm lint
   pnpm typecheck
   pnpm test
   pnpm ci:repro:current
   ```

9. If and only if every required validation is green, create exactly one commit:

   ```bash
   git commit -m "feat: add source file ingest and provenance"
   ```

10. If green, confirm the branch name, show the requested git status/log commands, push `codex/f1b-source-files-and-provenance-local-v1`, verify the remote head, and create or report the PR into `main` with the requested title and body.

## Validation and Acceptance

Required validation commands, in order:

```bash
pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/sources/service.spec.ts src/modules/sources/drizzle-repository.spec.ts src/app.spec.ts
pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/twin/workflow-sync.spec.ts src/modules/twin/test-suite-sync.spec.ts
pnpm lint
pnpm typecheck
pnpm test
pnpm ci:repro:current
```

Acceptance is met when all of the following are true:

- `packages/domain` defines additive `source_file` and `provenance_record` contracts without deleting F1A source or snapshot contracts
- `packages/db` persists additive `source_files` and `provenance_records` tables through a forward-only migration
- the control plane can accept one raw binary upload for an existing source and persist the bytes immutably to object storage
- one file registration creates the next snapshot version plus one `source_file` row plus one `provenance_record` in a single transaction
- `GET /sources/:sourceId/files` and `GET /sources/files/:sourceFileId` expose the new raw-file layer directly
- F1A source list/detail routes stay backward compatible because snapshot summaries remain populated
- tests prove checksum, metadata, storage references, and source plus snapshot linkage deterministically
- limitations remain explicit: no parser dispatch, no Finance Twin writes, no CFO Wiki work, no reports, no monitoring, no source-domain replay yet

## Idempotence and Recovery

This slice is additive-first and retry-safe when followed carefully.

- Re-running tests is safe because the existing test reset truncates state between cases and will be extended to cover the new tables.
- Object-storage writes happen before the DB transaction, so failures after upload must use deterministic storage-key construction to make retries idempotent or safe to overwrite for the same file payload during a retried test run.
- If the migration or DB writes are wrong, restore uncommitted files, regenerate the migration cleanly, and rerun the targeted validations before proceeding.
- The slice does not mutate legacy GitHub state, twin state, wiki state, or mission artifacts, so rollback scope stays isolated to the new source-ingest module and additive source schema.

## Artifacts and Notes

Expected artifacts from this slice:

- one active F1B Finance Plan
- additive domain contracts for raw source files and provenance
- additive schema and migration for `source_files` and `provenance_records`
- a source-storage helper that uses the repo’s existing object-store configuration
- deterministic tests for upload, persistence, and read behavior
- one clean commit, push, and PR if validation is fully green

Replay and evidence note:
this slice adds provenance-backed raw ingest but does not yet emit source-domain replay events or evidence bundles.
That limitation should remain explicit in code and plan notes until a later slice extends replay beyond mission-scoped events.

## Interfaces and Dependencies

Package and runtime boundaries:

- `@pocket-cto/domain` remains the contract source of truth
- `@pocket-cto/db` remains limited to schema and DB helpers
- `apps/control-plane` owns object-store interaction, repository orchestration, and HTTP transport

Configuration expectations:

- reuse `ARTIFACT_S3_ENDPOINT`, `ARTIFACT_S3_REGION`, `ARTIFACT_S3_BUCKET`, `ARTIFACT_S3_ACCESS_KEY`, `ARTIFACT_S3_SECRET_KEY`, `ARTIFACT_S3_FORCE_PATH_STYLE`, and `SOURCE_OBJECT_PREFIX`
- do not add new storage env keys unless implementation proves one is strictly unavoidable

If a new library is required to speak S3-compatible object storage cleanly, record that addition here and keep it scoped to the exact control-plane need.
No active-doc, stack-pack, or skill changes are expected from this slice.

## Outcomes & Retrospective

This slice is in progress.

The implementation now lands the intended F1B boundary as an additive raw-file truth layer beneath F1A snapshots rather than a rewrite of the source-registry foundation.
`source_files` and `provenance_records` now persist immutable raw-file metadata and ingest lineage, the control plane stores raw bytes in object storage through a dedicated storage helper, and one registration transaction creates the next snapshot version plus one source-file row plus one provenance row while keeping the existing snapshot summary surface backward compatible.

Validation passed for the targeted source-ingest tests, the required twin guard tests, `pnpm lint`, `pnpm typecheck`, `pnpm test`, and a final green `pnpm ci:repro:current`.
The only surprise during validation was an unrelated twin reproducibility race in the CODEOWNERS discovery spec, which was fixed narrowly by awaiting directory creation so the existing reproducibility surface stayed green.

Remaining work at the time of this update is publication only:
create the single requested hotfix commit, push the existing feature branch, and watch PR #62 checks to green.
