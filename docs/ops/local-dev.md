# Local development

This repo is now past the Pocket CFO pivot-foundation reset and through the F1 source-ingest milestone.

That means two things are true at once:

- the active docs now define a finance evidence product
- parts of the working codebase still reflect the older Pocket CTO implementation

The goal of local development in the current repo state is to keep the repo green while preserving the finished F1 source-ingest path and starting later-phase work only through an explicit active Finance Plan.

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
```

## Pivot-foundation baseline

On the current Pocket CFO branch, the F0 guidance reset and Pocket CTO archive placement are already in place.
Do not rerun the prep-pack apply sequence here as if it were still the active next step.

If you need to port the same reset onto an older branch, follow the documented sequence in `plans/FP-0001-pocket-cfo-pivot-foundation.md` and keep that work scoped to guidance and archive placement only.

## Source-ingest-first mindset

For Pocket CFO, local development should move toward a source-ingest-first loop:

1. register or upload a source bundle
2. preserve raw files immutably
3. parse deterministically where possible
4. populate the Finance Twin
5. refresh the CFO Wiki
6. run discovery or reporting missions against stored state

Not all of that is implemented yet after F1.
Use the docs to guide what gets built next.

## GitHub setup is optional

Do not block local development on GitHub App setup unless your active Finance Plan explicitly includes connector work.
For most source-ingest and reconciliation work, GitHub should stay out of the critical path.

## Working with Codex

Open the repo in the Codex app and start from `START_HERE.md`.

Keep one thread per slice, update the active Finance Plan as you work, and prefer narrow validations after each meaningful change.
