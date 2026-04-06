# GitHub App setup

GitHub is now an **optional connector** for Pocket CFO.
It is no longer the product boundary.

## When to set this up

Set up the GitHub App only if you actually need repo content as a connector input, for example:

- dbt or analytics repos
- finance-policy markdown repos
- repo-stored compliance or diligence documents
- migration work that bridges the old GitHub slice into a generic source-registry boundary

If you are doing F0 or early F1 work, this setup is usually not required.

## Recommended default permissions

For a read-mostly Pocket CFO connector, start narrow:

Repository permissions:

- Metadata: Read-only
- Contents: Read-only

Optional only when the connector truly needs them:

- Pull requests: Read-only
- Issues: Read-only
- Actions: Read-only
- Checks: Read-only

Do not request write permissions just because Pocket CTO used them historically.
Escalate only when the Finance Plan requires it.

## Recommended webhook events

Start small:

- `installation`
- `installation_repositories`
- `push`

Add other events only if the connector logic really depends on them.

## Implementation rules

- verify webhook signatures before processing payloads
- keep webhook handling idempotent
- cache installation tokens until expiry
- keep GitHub logic behind connector boundaries
- do not let GitHub-specific types become the main product ontology

## Migration note

If you need the older GitHub-first flow for historical reference or migration work, keep it explicitly marked as legacy or connector-only.
Do not block the Pocket CFO pivot on a full GitHub setup.
