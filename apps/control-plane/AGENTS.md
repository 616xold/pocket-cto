# Pocket CFO control-plane instructions

The control plane is the heart of Pocket CFO.
Keep it boring, modular, and evidence-safe.

## Local rules

- Keep route files thin.
- Put validation in `schema.ts` or shared domain schemas.
- Put orchestration logic in services or worker modules.
- Put replay logic in the replay module, not scattered across routes.
- Avoid direct DB calls from route handlers.
- Keep deterministic parsing and extraction separate from LLM-assisted compilation or drafting.
- If a module grows, split by responsibility before it becomes a god file.
- Favor explicit names like `SourceRegistryService`, `FinanceTwinService`, `WikiCompilerService`, and `ReportCompilerService`.

## Priority order

1. source registry and provenance
2. mission spine
3. replay and evidence
4. finance twin extraction and queries
5. CFO wiki compilation
6. reporting and packet generation
7. monitoring and approval flows
8. connector bridges such as GitHub

## Transition note

Legacy `github-app` and engineering-era `twin` code may still exist while the pivot is underway.
Treat those modules as references or connector bridges, not as the product center.

Do not delete them until the active Finance Plan says the replacement path exists and a packaged smoke proves it.
