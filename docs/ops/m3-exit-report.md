# M3 exit report

Status: `M3 complete`

Date: `2026-03-21`

## Scope closed

M3 closes with the engineering-twin stack now operator-visible and proofable end to end:

- the web operator home and `/missions` surface both expose a typed discovery-intake card
- mission detail renders the stored `discovery_answer` artifact as a summary-shaped evidence block
- `pnpm smoke:m3-discovery:live -- --isolate-db ...` is now the canonical packaged proof path
- the live closeout proof below shows a real `auth_change` discovery mission succeeding with a ready proof bundle

## Exact smoke inputs

Primary live closeout run:

```bash
pnpm smoke:m3-discovery:live -- \
  --isolate-db \
  --repo-full-name 616xold/pocket-cto \
  --changed-path apps/control-plane/src/modules/github-app/auth.ts \
  --source-repo-root /tmp/pocket-cto-source-zNcXqW
```

Truthful proof notes:

- `questionKind`: `auth_change`
- `proofMode`: `refreshed_live_state`
- `proofModeReason`: `truthful_source_match`
- the source checkout remote resolved to `https://github.com/616xold/pocket-cto.git`
- the helper itself now owns the fresh local Postgres isolation path, including DB creation, migration, teardown, and optional failure preservation, so M3 proof no longer depends on manual shell choreography
- shared-database mode still exists for day-to-day local debugging, but the isolated packaged command is the canonical closeout path because it avoids unrelated queued local work
- the first packaged isolated rerun exposed one honest teardown bug: the helper closed Fastify but did not explicitly drain shared `pg` pools before dropping the temporary databases, so Postgres terminated a still-open pooled connection; the helper now calls `closeAllPools()` before cleanup and the rerun below completed with isolated DB teardown succeeding

## Live discovery evidence

- `mission id`: `9516babf-208c-445b-b71d-e94b8a6bdfa4`
- `artifact id`: `cec554ca-0438-42bd-a024-508b655f98e6`
- `proof bundle status`: `ready`
- `repo full name`: `616xold/pocket-cto`
- `question kind`: `auth_change`
- `changed paths`: `apps/control-plane/src/modules/github-app/auth.ts`
- `freshness rollup`: `fresh`
- `freshness reason`: `All scored twin slices are within their freshness windows.`
- `impacted manifest count`: `1`
- `impacted directory count`: `1`
- `owner count`: `0`
- `related test suite count`: `1`
- `related mapped CI job count`: `0`
- `limitation count`: `3`
- `installations synced`: `1`
- `repositories synced`: `1`
- `proof mode`: `refreshed_live_state`
- `isolated DB cleanup status`: `dropped_after_success`

Safe answer summary:

> This stored auth_change query maps 1 changed path(s) to 1 workspace directory and 1 primary manifest(s), with 1 related test suite(s), 0 mapped CI job(s), 0 unmatched path(s), and 3 explicit limitation(s).

Twin refresh runs completed successfully for:

- metadata
- ownership
- workflows
- test suites
- docs
- runbooks

## Validation matrix

All required validation commands succeeded in the working tree:

- `pnpm db:generate`
- `pnpm db:migrate`
- `pnpm run db:migrate:ci`
- `pnpm repo:hygiene`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm build`
- `pnpm test`
- `pnpm ci:repro:current`

Notable findings during validation:

- repo-wide `typecheck` initially failed because one new web spec fixture included fields not present in the domain schema; that fixture was corrected and the full validation matrix then passed
- the clean-worktree repro succeeded after the fix, confirming the slice is reproducible outside the active workspace
- the packaged discovery helper now carries the isolation lifecycle itself, replacing the earlier ad hoc `DATABASE_URL=<fresh local postgres db>` wrapper that had been used only to dodge shared-local backlog
- the first isolated packaged rerun surfaced one real cleanup bug in the helper itself, and the final rerun after explicitly draining shared DB pools succeeded with the isolated databases dropped automatically

## Exit decision

The roadmap M3 exit criteria are now satisfied:

- a discovery mission can answer an `auth_change` blast-radius question
- the answer cites twin-backed impacted targets plus freshness state
- stale or missing twin posture remains visible in the mission-detail discovery block instead of being hidden

This repository is now in an evidence-backed `M3 complete` state and is clean to move to `M4`.
