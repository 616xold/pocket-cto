# Local development

This repo is now past the Pocket CFO pivot-foundation reset, through the F1 source-ingest milestone, and through the merged F2A trial-balance finance-twin slice.

That means two things are true at once:

- the active docs now define a finance evidence product
- parts of the working codebase still reflect the older Pocket CTO implementation

The goal of local development in the current repo state is to keep the repo green while preserving the finished F1 raw-source path, preserving the shipped F2A finance-twin path, and starting later-phase work only through an explicit active Finance Plan.

## Baseline bootstrap

```bash
cp .env.example .env
docker compose up -d
pnpm install
pnpm db:generate
pnpm db:migrate
pnpm dev
```

Useful validation commands:

```bash
pnpm repo:hygiene
pnpm lint
pnpm typecheck
pnpm test
pnpm check
pnpm smoke:source-registry:local
pnpm smoke:source-ingest:local
pnpm smoke:finance-twin:local
pnpm smoke:finance-twin-account-catalog:local
```

## Pivot-foundation baseline

On the current Pocket CFO branch, the F0 guidance reset and Pocket CTO archive placement are already in place.
Do not rerun the prep-pack apply sequence here as if it were still the active next step.

If you need to port the same reset onto an older branch, follow the documented sequence in `plans/FP-0001-pocket-cfo-pivot-foundation.md` and keep that work scoped to guidance and archive placement only.

## Source-registry-to-finance-twin mindset

For Pocket CFO, local development should move toward a source-registry-to-finance-twin loop:

1. register or upload a source bundle
2. preserve raw files immutably
3. parse deterministically where possible
4. populate the Finance Twin
5. refresh the CFO Wiki
6. run discovery or reporting missions against stored state

Today, steps 1 through 4 exist in a narrow form:

- F1 source registration and raw-file ingest are implemented
- F2A trial-balance CSV sync is implemented
- the packaged `pnpm smoke:finance-twin:local` path proves the trial-balance sync from stored raw bytes
- the packaged `pnpm smoke:finance-twin-account-catalog:local` path proves persisted account-catalog state once the F2B slice is present

Steps 5 and 6 remain later-phase work.
Use the docs to guide what gets built next.

## GitHub setup is optional

Do not block local development on GitHub App setup unless your active Finance Plan explicitly includes connector work.
For most source-ingest and reconciliation work, GitHub should stay out of the critical path.

## Working with Codex

Open the repo in the Codex app and start from `START_HERE.md`.

Keep one thread per slice, update the active Finance Plan as you work, and prefer narrow validations after each meaningful change.
