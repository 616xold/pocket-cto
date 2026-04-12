# Local development

This repo is now past the Pocket CFO pivot-foundation reset, through the F1 source-ingest milestone, and through the merged F2A, F2B, F2C, F2D, F2E, F2F, and F2G finance-twin slices.

That means two things are true at once:

- the active docs now define a finance evidence product
- parts of the working codebase still reflect the older Pocket CTO implementation

The goal of local development in the current repo state is to keep the repo green while preserving the finished F1 raw-source path, preserving the shipped finance-twin slices, and starting later-phase work only through an explicit active Finance Plan.

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
pnpm smoke:finance-twin-account-bridge:local
pnpm smoke:finance-twin-balance-bridge-prerequisites:local
pnpm smoke:finance-twin-account-catalog:local
pnpm smoke:finance-twin-general-ledger:local
pnpm smoke:finance-twin-snapshot:local
pnpm smoke:finance-twin-reconciliation:local
pnpm smoke:finance-twin-period-context:local
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
- F2B chart-of-accounts CSV sync and account-catalog reads are implemented
- F2C general-ledger CSV sync and persisted journal-entry or journal-line reads are implemented
- F2D additive company snapshot and lineage reads now tie the latest successful implemented finance slices together truthfully
- F2E adds a company-level reconciliation-readiness read that stays explicit about coverage, comparability, and limitations rather than faking a balance reconciliation
- F2F hardens reporting-window truth so reconciliation can distinguish source-declared general-ledger period context from activity-window-only fallback
- F2G adds matched-period account-bridge readiness plus chart-of-accounts-backed unmatched diagnostics without inventing a numeric bridge
- F2H is the active next slice and adds a stricter balance-bridge-prerequisites read that still refuses fake bridge numbers or variance
- the packaged `pnpm smoke:finance-twin:local` path proves the trial-balance sync from stored raw bytes
- the packaged `pnpm smoke:finance-twin-account-bridge:local` path proves matched-period account-bridge readiness, explicit unmatched diagnostics, and activity-lineage drill-through from persisted state
- the packaged `pnpm smoke:finance-twin-balance-bridge-prerequisites:local` path proves blocked balance-bridge prerequisites, explicit missing-proof diagnostics, and no-fake-variance behavior from persisted state
- the packaged `pnpm smoke:finance-twin-account-catalog:local` path proves persisted account-catalog state
- the packaged `pnpm smoke:finance-twin-general-ledger:local` path proves persisted general-ledger journal state from stored raw bytes
- the packaged `pnpm smoke:finance-twin-snapshot:local` path proves mixed-slice snapshot and lineage drill behavior from persisted state
- the packaged `pnpm smoke:finance-twin-reconciliation:local` path proves reconciliation-readiness, explicit basis semantics, and general-ledger activity lineage drill behavior from persisted state
- the packaged `pnpm smoke:finance-twin-period-context:local` path proves explicit source-declared general-ledger period-context capture and period-scoped reconciliation truth from persisted state

Steps 5 and 6 remain later-phase work.
Use the docs to guide what gets built next.

The active finance-twin read surface is currently backend-first:

- company summary
- company snapshot
- account catalog
- general ledger
- lineage drill
- trial-balance-versus-general-ledger reconciliation readiness
- trial-balance-versus-general-ledger matched-period account-bridge readiness
- trial-balance-versus-general-ledger balance-bridge prerequisites
- general-ledger account activity lineage

## GitHub setup is optional

Do not block local development on GitHub App setup unless your active Finance Plan explicitly includes connector work.
For most source-ingest and reconciliation work, GitHub should stay out of the critical path.

## Working with Codex

Open the repo in the Codex app and start from `START_HERE.md`.

Keep one thread per slice, update the active Finance Plan as you work, and prefer narrow validations after each meaningful change.
