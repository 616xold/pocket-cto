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
