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
```

## Recommended F0 apply sequence

When you are applying the prep pack or beginning the pivot:

1. create a safety tag: `git tag pocket-cto-m3-final`
2. copy the overlay files into the repo root
3. commit the guidance reset as one clean docs change
4. create `docs/archive/pocket-cto/` and child folders
5. move old `plans/EP-*.md` and the M2/M3 exit reports into the archive tree
6. start the next Codex session from `plans/FP-0001-pocket-cfo-pivot-foundation.md`

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
