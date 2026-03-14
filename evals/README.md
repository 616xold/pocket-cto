# Real-LLM Evals

This folder exists so Pocket CTO can measure prompt and artifact quality with real OpenAI model calls without weakening deterministic CI.

Why now:

- planner and executor prompt quality already affect operator-visible evidence
- the mission compiler is still stubbed, so a small benchmark lane helps us see what a real compiler could do before wiring it into runtime behavior
- fake fixtures still guard `pnpm test` and CI, while this lane stays manual, opt-in, and paid

Layout:

- `datasets/` holds small checked-in eval inputs
- `rubrics/` holds the grading rubric used by the local harness
- `results/` is gitignored and stores timestamped JSONL outputs for comparison across prompt iterations

Live usage:

```bash
pnpm eval:doctor
pnpm eval:planner -- --dry-run
OPENAI_EVALS_ENABLED=true pnpm eval:smoke:planner
OPENAI_EVALS_ENABLED=true pnpm eval:smoke:executor
OPENAI_EVALS_ENABLED=true pnpm eval:planner
pnpm eval:compare -- --a evals/results/<older>.jsonl --b evals/results/<newer>.jsonl
```

Live runs require both:

- `OPENAI_API_KEY`
- `OPENAI_EVALS_ENABLED=true`

Default model envs:

- `OPENAI_EVAL_MODEL=gpt-5-mini`
- `OPENAI_EVAL_GRADER_MODEL=gpt-5-mini`
- `OPENAI_EVAL_REFERENCE_MODEL=gpt-5-codex`

`pnpm eval:doctor` shows whether the current shell is dry-run-only or live-ready, reports the best-known key source (`shell env`, `loaded .env`, or `unknown`), and prints the results directory without exposing the full API key.
`pnpm eval:smoke:planner` and `pnpm eval:smoke:executor` are the intentional one-sample live proof paths and fail if they would fall back to dry-run.
`pnpm eval:compare` compares two saved JSONL runs so you can see score movement, dimension movement, and model changes without manually diffing raw files.

Saved result records now keep compact provenance for later iteration work:

- dataset name
- dataset item id
- prompt version
- git SHA when available
- branch name when available

Important:
this repo uses a custom local harness that calls the OpenAI Responses API directly.
That means a live eval here will produce local JSONL files and terminal summaries, but it will not appear as a hosted OpenAI Evals API run.
