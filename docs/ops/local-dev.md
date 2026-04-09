# Local development

This repo is in the Pocket CFO pivot foundation phase.

That means two things are true at once:

- the active docs now define a finance evidence product
- parts of the working codebase still reflect the older Pocket CTO implementation

The goal of local development during F0 is to keep the repo green while shifting the active guidance layer.

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

## F0 branch state

On the current F0 branch, the Pocket CFO guidance reset and Pocket CTO archive placement are already in place.
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

Not all of that is implemented yet during F0.
Use the docs to guide what gets built next.

## GitHub setup is optional

Do not block local development on GitHub App setup unless your active Finance Plan explicitly includes connector work.
For most pivot-foundation work, GitHub should stay out of the critical path.

## Working with Codex

Open the repo in the Codex app and start from `START_HERE.md`.

Keep one thread per slice, update the active Finance Plan as you work, and prefer narrow validations after each meaningful change.
