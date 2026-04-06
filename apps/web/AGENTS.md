# Pocket CFO web app instructions for Codex

This app is the operator surface.
It renders source inventory, mission read models, freshness posture, evidence panels, approval cards, and mobile-safe summaries.

## Boundaries

- Do not import from `@pocket-cto/db` directly.
- Do not add orchestration logic here.
- Do not embed connector secrets or webhook handling here.
- Fetch through control-plane HTTP APIs or dedicated client modules in `lib/`.
- Keep presentational components small and focused.
- Do not hide stale, limited, or conflicting evidence behind optimistic copy.

## Preferred split

- `app/` for routes and layout
- `components/` for UI pieces
- `lib/` for API clients and formatters

## UI expectations

A finance-facing page should make these states explicit when relevant:

- loading
- empty
- stale
- limited
- conflicting
- error

## Definition of done

A UI change is complete when:

- it preserves mobile readability
- it does not leak backend concerns into route files
- the fetching logic is reusable
- the touched routes reflect the evidence-first Pocket CFO thesis
- copy uses finance language instead of engineering language
- important limitations remain visible to the operator
