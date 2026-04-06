# Pocket CFO DB package instructions

Keep schema changes additive first.
Prefer explicit table and column names over hidden abstractions.

## Rules

- Schema files live under `src/schema/`.
- Split tables by bounded context.
- Use helper columns from `src/schema/shared.ts`.
- If a change impacts mission lifecycle, replay, or evidence lineage, update the active Finance Plan and the relevant docs.
- Do not hide important SQL shape behind giant utility factories.
- Add tests for any domain-critical query helper.

## Finance pivot boundaries

Pocket CFO will need clear schema seams for:

- missions
- artifacts
- replay
- sources and provenance
- finance twin state
- wiki or compiled-knowledge state
- monitoring
- optional connectors

Keep raw source identity and snapshot lineage explicit.
Do not model raw uploads as mutable blobs with no history.

## Migration posture

- Prefer forward-only migrations.
- Avoid destructive rename churn during F0/F1.
- Keep legacy GitHub installation or binding tables isolated until a generic source-connection registry replaces them cleanly.
