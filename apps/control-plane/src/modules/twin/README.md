# Twin module

This bounded context owns the engineering-twin persistence spine.
Keep transport, service rules, and persistence separate from mission orchestration and unrelated integrations.

Current responsibilities in M3.1:

- persist repo-scoped twin sync runs, entities, and edges
- expose repo-scoped debug read surfaces
- reuse the GitHub repository registry as the source of truth for target repositories

Deferred responsibilities for later M3 slices:

- extraction and metadata sync
- freshness scoring and stale interpretation
- blast-radius answering
- discovery-mission formatting
