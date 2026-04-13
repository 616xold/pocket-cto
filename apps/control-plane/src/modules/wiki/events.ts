export const CFO_WIKI_REPLAY_POLICY = {
  emitsReplayEvents: false,
  rationale:
    "F3A compile runs are synchronous operator-triggered actions with their own durable compile-run, page, link, and ref records. This slice does not mutate mission state, so persisted wiki compile state is the explicit review surface until later F3 work adds broader filing or lint workflows.",
} as const;
