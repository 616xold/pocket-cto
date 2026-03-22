# Real-LLM Evals

This folder exists so Pocket CTO can measure prompt and artifact quality with real model calls without weakening deterministic CI.

Why now:

- planner and executor prompt quality already affect operator-visible evidence
- the mission compiler is still stubbed, so a small benchmark lane helps us see what a real compiler could do before wiring it into runtime behavior
- fake fixtures still guard `pnpm test` and CI, while this lane stays manual and opt-in

Layout:

- `datasets/` holds small checked-in eval inputs
- `rubrics/` holds the grading rubric used by the local harness
- `results/` is gitignored and stores timestamped JSONL outputs for comparison across prompt iterations

Live usage:

```bash
pnpm eval:doctor
pnpm eval:planner -- --dry-run
EVALS_ENABLED=true pnpm eval:smoke:planner
EVALS_ENABLED=true pnpm eval:smoke:executor
EVALS_ENABLED=true pnpm eval:planner
EVALS_ENABLED=true EVAL_BACKEND=codex_subscription pnpm eval:smoke:planner
pnpm eval:compare -- --a evals/results/<older>.jsonl --b evals/results/<newer>.jsonl
```

Primary envs:

- `EVALS_ENABLED=true`
- `EVAL_BACKEND=openai_responses` or `EVAL_BACKEND=codex_subscription`
- `EVAL_MODEL` defaults to `gpt-5.4`
- `EVAL_GRADER_MODEL` defaults to `gpt-5.4-mini`
- `EVAL_REFERENCE_MODEL` defaults to `gpt-5.4`

Backend policy:

- `openai_responses` is the official reported lane. It still requires `OPENAI_API_KEY` and preserves API proof like response ids and token usage.
- `codex_subscription` is the local tuning lane. It uses the supported local Codex app-server path, fresh read-only threads, no network, no workspace writes, and records only the proof metadata that path can honestly provide.

Legacy env aliases remain accepted:

- `OPENAI_EVALS_ENABLED`
- `OPENAI_EVAL_MODEL`
- `OPENAI_EVAL_GRADER_MODEL`
- `OPENAI_EVAL_REFERENCE_MODEL`

If both the generic and legacy names are set, the generic `EVAL_*` values win.

Default model policy:

- candidate defaults to `gpt-5.4` so the eval candidate tracks the strongest current cross-Codex/API baseline
- grader defaults to `gpt-5.4-mini` so scoring stays strong but cheaper
- reference defaults to `gpt-5.4`
- `gpt-5.3-codex-spark` stays optional and experimental, not the baseline default

`pnpm eval:doctor` shows the selected backend, whether the current shell is dry-run-only or live-ready, reports the best-known key source (`shell env`, `loaded .env`, or `unknown`), and prints the results directory without exposing the full API key.
`pnpm eval:smoke:planner` and `pnpm eval:smoke:executor` are the intentional one-sample live proof paths and fail if they would fall back to dry-run.
`pnpm eval:compare` compares two saved JSONL runs so you can see score movement, dimension movement, and model changes without manually diffing raw files.

Saved result records now keep compact provenance for later iteration work:

- dataset name
- dataset item id
- prompt version
- git SHA when available
- branch name when available

Important:
this repo uses a custom local harness. The `openai_responses` backend calls the OpenAI Responses API directly, while the `codex_subscription` backend uses the supported local Codex app-server path.
Either way, these runs produce local JSONL files and terminal summaries; they do not appear as hosted OpenAI Evals API runs.
