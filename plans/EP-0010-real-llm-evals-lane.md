# EP-0010 - Add an opt-in real-LLM eval lane for prompt and evidence quality

This ExecPlan is a living document. Keep `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` current.

## Purpose / Big Picture

After this slice, Pocket CTO will have a checked-in manual eval lane that can call real OpenAI models against a small seeded dataset to score the prompt and artifact surfaces that matter right now. An engineer will be able to run `pnpm eval:planner`, `pnpm eval:executor`, or `pnpm eval:all` locally, get fast failure if live-eval opt-in is missing, and inspect durable JSONL results under `evals/results/` to compare prompt iterations over time.

This change is intentionally narrow. It does not put paid model calls into CI, does not replace the existing deterministic fixture-based tests, and does not change core mission orchestration behavior except for a tiny eval-input capture hook if one proves necessary. The initial seeded targets are planner prompt quality, executor final-report quality, and mission compiler quality only to the extent that the current stubbed compiler makes that benchmarking useful.

## Progress

- [x] (2026-03-13T19:20Z) Read the required repo docs, architecture docs, ops docs, prior ExecPlans, configuration surface, planner and executor prompt builders, mission compiler stub, evidence modules, orchestrator service, and current OpenAI-related grep results before planning.
- [x] (2026-03-13T19:20Z) Verified the gap before coding: OpenAI env parsing already exists in `packages/config/src/index.ts`, but there is no dedicated eval environment surface, no local eval harness, no checked-in eval datasets, no durable eval output writer, and no CI-isolated manual scripts for real-model measurement.
- [x] (2026-03-13T19:20Z) Drafted this ExecPlan with the bounded scope, exact edit surface, validation commands, manual-only posture, rubric strategy, and evidence implications for the new eval lane.
- [x] (2026-03-13T19:35Z) Added `loadEvalEnv` plus dedicated eval env vars in `packages/config`, created the `apps/control-plane/src/modules/evals/` bounded context, added CLI entrypoints and manual scripts, checked in small datasets plus the rubric under `evals/`, and updated `.env.example`, `.gitignore`, and `docs/ops/local-dev.md`.
- [x] (2026-03-13T19:35Z) Added focused eval tests for dataset loading, result writing, and dry-run execution; verified `pnpm eval:planner -- --dry-run --limit 1` writes JSONL output under `evals/results/` without requiring a live API key.
- [x] (2026-03-13T19:35Z) Ran `pnpm repo:hygiene`, `pnpm lint`, `pnpm typecheck`, and `pnpm test` successfully after the eval-lane changes.
- [x] (2026-03-13T19:35Z) Checked the session for `OPENAI_API_KEY`; it is absent in this environment, so no live paid eval was run. The lane is ready for manual live use once the key is present together with `OPENAI_EVALS_ENABLED=true`.

## Surprises & Discoveries

- Observation: The current OpenAI integration surface is configuration-only.
  Evidence: `packages/config/src/index.ts` already parses `OPENAI_API_KEY`, `OPENAI_MISSION_COMPILER_MODEL`, `OPENAI_SUMMARY_MODEL`, and `OPENAI_REASONING_MODEL`, but repo-wide search found no OpenAI client usage in application code.

- Observation: The mission compiler is still a true stub, while planner and executor prompt builders are already meaningful prompt-quality surfaces.
  Evidence: `apps/control-plane/src/modules/missions/compiler.ts` returns a fixed `StubMissionCompiler` response, while `apps/control-plane/src/modules/runtime-codex/planner-prompt.ts` and `apps/control-plane/src/modules/runtime-codex/executor-prompt.ts` contain explicit instruction layouts, constraints, and section contracts.

- Observation: Pocket CTO already treats replay and evidence as audit surfaces, so the eval lane should preserve prompt provenance and grading rationale instead of logging only a single numeric score.
  Evidence: `docs/architecture/replay-and-evidence.md` requires objective, change summary, verification evidence, risk notes, rollback notes, approval trace, artifact index, and replay entrypoint for proof bundles.

- Observation: The current repo hygiene rules already ignore `tmp/` and other runtime artifacts, but not a dedicated eval results folder.
  Evidence: `.gitignore` excludes temp and runtime output paths, yet does not mention `evals/results/`.

- Observation: Reusing the full runtime `loadEnv` path would have forced eval commands to require unrelated DB and artifact-store env vars.
  Evidence: the existing runtime env schema requires `DATABASE_URL`, S3 settings, worker config, and other app-startup fields that the local eval harness does not use.

- Observation: `pnpm` forwards a literal `--` separator into nested script argv, so the eval CLI needed to tolerate that token explicitly.
  Evidence: the first manual `pnpm eval:planner -- --dry-run --limit 1` run failed until the arg parser learned to ignore `--`.

- Observation: The first text-rule scorer version undercounted heading compliance because it collapsed newlines before checking for `##` sections.
  Evidence: the initial dry-run planner artifact contained all required sections, but the saved JSONL still reported every section as missing until the rule scorer switched to raw newline-preserving heading checks.

## Decision Log

- Decision: Implement the first eval lane as a local harness that calls the OpenAI API directly instead of integrating the hosted Evals API.
  Rationale: This repo stage needs small, legible, local-first evals with explicit datasets, deterministic dry runs, and append-only result files. A direct harness keeps the boundary simple and avoids premature platform coupling.
  Date/Author: 2026-03-13 / Codex

- Decision: Keep eval code inside `apps/control-plane/src/modules/evals/` with a small CLI entrypoint under `apps/control-plane/src/evals/`.
  Rationale: The evaluated surfaces currently live in the control plane, and the harness needs direct access to planner prompt builders, executor summary logic, and the mission compiler boundary without introducing a new cross-package abstraction too early.
  Date/Author: 2026-03-13 / Codex

- Decision: Separate dedicated eval env vars from runtime env vars.
  Rationale: Manual benchmark posture, model choice, and grader or reference-model selection are operationally different from runtime production defaults. Separate envs prevent accidental coupling and make CI exclusion explicit.
  Date/Author: 2026-03-13 / Codex

- Decision: Use hybrid grading with rule-based checks plus model grading against a checked-in rubric.
  Rationale: Constraint compliance and section presence are cheaply validated by code, while clarity, evidence readiness, and actionability still benefit from a grader model. Combining both improves explainability and keeps the first version simple.
  Date/Author: 2026-03-13 / Codex

- Decision: Use the OpenAI Responses HTTP API through `fetch` instead of adding the Node SDK for this first harness.
  Rationale: The repo already runs on modern Node with `fetch`, the eval lane only needs a narrow client surface, and avoiding a new dependency keeps the change smaller and easier to audit.
  Date/Author: 2026-03-13 / Codex

- Decision: Add a dedicated `loadEvalEnv` helper instead of reusing the full runtime env loader.
  Rationale: Manual evals should not require unrelated database, MinIO, or worker env vars just to load datasets and call the OpenAI API.
  Date/Author: 2026-03-13 / Codex

## Context and Orientation

Pocket CTO is currently in the M1 runtime-integration era, where prompt quality and operator-facing evidence quality matter, but the repo still depends on deterministic fake fixtures for CI. The relevant control-plane surfaces are the stubbed mission compiler in `apps/control-plane/src/modules/missions/compiler.ts`, the planner prompt builder in `apps/control-plane/src/modules/runtime-codex/planner-prompt.ts`, the executor prompt builder in `apps/control-plane/src/modules/runtime-codex/executor-prompt.ts`, and the executor summary formatter in `apps/control-plane/src/modules/evidence/executor-output.ts`.

The new eval lane should remain outside orchestration-critical paths. It will load checked-in datasets from a root `evals/` folder, build candidate inputs using the existing surfaces, optionally call live models only when explicitly enabled, write durable results under `evals/results/`, and leave all core worker, mission, and replay paths unchanged unless a tiny helper is needed to capture a prompt input in a reusable way.

The expected edit surface is:

- `plans/EP-0010-real-llm-evals-lane.md`
- `package.json`
- `.gitignore`
- `docs/ops/local-dev.md`
- `packages/config/src/index.ts`
- `apps/control-plane/package.json`
- new small modules under `apps/control-plane/src/modules/evals/`
- new CLI entrypoints under `apps/control-plane/src/evals/`
- new datasets and rubric notes under `evals/`
- focused specs near the new eval modules

This slice should not change `WORKFLOW.md`, stack packs, GitHub App permissions, webhook expectations, or the normal `pnpm test` or `pnpm check` contract.

## Plan of Work

First, add dedicated eval configuration in `packages/config/src/index.ts` and thread that through a small eval harness configuration module under `apps/control-plane/src/modules/evals/`. The config must require both `OPENAI_API_KEY` and `OPENAI_EVALS_ENABLED=true` for live runs, provide clear defaults for `OPENAI_EVAL_MODEL`, `OPENAI_EVAL_GRADER_MODEL`, and `OPENAI_EVAL_REFERENCE_MODEL`, and allow a dry-run mode that exercises dataset loading, prompt construction, and result writing without paid calls.

Next, create a modular eval bounded context in the control plane. That context should include dataset loading, prompt-source adapters for planner, executor, and compiler targets, a live OpenAI runner, rule-based scoring helpers, a rubric-aware grader prompt builder, result serialization, and an append-only JSONL writer. The modules should stay small and discoverable instead of becoming one large benchmark file.

Then, add checked-in datasets and rubric notes under `evals/`. Each dataset should stay small and legible, include stable item ids, and model the surfaces that matter now: planner prompt outputs, executor final reports, and mission compilation. The rubric must explicitly grade constraint compliance, clarity, evidence readiness, and actionability, and the result format must preserve timestamp, dataset item id, model, prompt source or version, scores, and short notes.

After that, add explicit root scripts for manual eval execution only and update docs. The docs must explain the env vars, the manual-only nature of the lane, how dry-run differs from live mode, and where results land. The docs should also explain why fake fixtures remain the CI guardrail even after live evals exist.

Finally, add focused tests for dataset loading, result writing, and dry-run behavior, then run `pnpm repo:hygiene`, `pnpm lint`, `pnpm typecheck`, and `pnpm test`. If live credentials are present in the current session, run one tiny planner eval and record the exact model, sample count, output path, and one example score summary.

## Concrete Steps

Run these commands from the repository root as needed:

    git status --short
    rg -n "OPENAI_|mission compiler|planner prompt|executor prompt|summary" packages apps docs
    pnpm repo:hygiene
    pnpm lint
    pnpm typecheck
    pnpm test
    pnpm eval:planner -- --dry-run
    OPENAI_EVALS_ENABLED=true pnpm eval:planner

Implementation order:

1. Keep this ExecPlan current with discoveries, design decisions, validation evidence, and any scope narrowing.
2. Extend `packages/config/src/index.ts` with dedicated eval env vars and add focused config tests if needed.
3. Add the `modules/evals/` bounded context and CLI entrypoints in the control plane.
4. Add checked-in datasets, rubric files, and gitignored result output handling under `evals/`.
5. Add explicit manual scripts in the root `package.json` and any package-local helper scripts required to run them cleanly.
6. Update `docs/ops/local-dev.md` and add a short eval note explaining why this lane exists now and why it stays out of CI.
7. Add focused tests for dataset loading, result writing, and dry-run execution.
8. Run the required validation commands and, if credentials are available, one tiny live planner eval.
9. Record exact outcomes and remaining gaps in this plan.

## Validation and Acceptance

Success for this slice is demonstrated when all of the following are true:

1. `pnpm eval:planner`, `pnpm eval:executor`, and `pnpm eval:all` exist and are not called by `ci:static`, `ci:integration-db`, `pnpm test`, or `pnpm check`.
2. Live eval runs fail fast with a clear error when `OPENAI_API_KEY` is absent or `OPENAI_EVALS_ENABLED` is not `true`.
3. A dry-run mode can execute the harness without paid model calls and still exercise dataset loading, prompt-source selection, and result writing.
4. Dedicated eval env vars exist for candidate, grader, and reference-model selection and are documented in `docs/ops/local-dev.md`.
5. Small checked-in datasets exist for planner prompt quality, executor final-report quality, and compiler quality or compiler-gap benchmarking.
6. The rubric is checked in and explicitly scores constraint compliance, clarity, evidence readiness, and actionability.
7. Results are written durably under `evals/results/` as JSONL or JSON and include timestamp, dataset item id, model, prompt source or version, scores, and short notes.
8. Focused tests cover dataset loading, result writing, and dry-run behavior without requiring a live API key.
9. The docs explicitly state that real-model evals are manual, opt-in, paid, and outside CI.
10. If a live run occurs in this session, the recorded evidence includes the model used, number of samples, output path, and one example score summary.

## Idempotence and Recovery

This slice should stay additive and easy to retry. Re-running an eval should append or create a new timestamped result file rather than mutating prior results in place. Dry-run mode should be safe in any environment and should not require secrets.

If live model execution fails because of missing env, network issues, or API errors, the harness should fail clearly without affecting application state. The safe recovery path is to set the required env vars correctly and rerun the specific manual eval command. Because this lane is outside CI and outside the runtime hot path, rollback is straightforward: revert the eval modules, scripts, docs, and config additions together.

## Artifacts and Notes

The initial real-LLM eval lane gap analysis captured before implementation:

1. Worth testing now:
   planner prompt quality, executor final-report quality, and mission compiler quality as a benchmark against the current stub.
2. Current stub or fake-heavy paths:
   `apps/control-plane/src/modules/missions/compiler.ts` is a hardcoded stub and planner or executor behavior still relies on fake Codex fixture coverage for deterministic tests.
3. Intended implementation boundary:
   a control-plane-local eval harness with checked-in datasets, dedicated env vars, manual scripts only, hybrid grading, and append-only result writing under `evals/results/`.
4. Evidence expectation:
   each result record should be durable enough to compare prompt iterations later and should retain prompt source, rubric scores, and short notes instead of only a pass or fail flag.

Validation results and any live-run notes will be added here as implementation proceeds.

Validation results captured after implementation:

- `pnpm repo:hygiene` passed.
- `pnpm lint` passed.
- `pnpm typecheck` passed.
- `pnpm test` passed.
- `pnpm eval:planner -- --dry-run --limit 1` passed.
  - output path: `evals/results/20260313T193611Z-planner.jsonl`
  - samples: `1`
  - average dry-run score: `5`

Live-run note:

- `OPENAI_API_KEY` is absent in this session, so no live paid eval was executed here.

## Interfaces and Dependencies

Important repository interfaces for this slice:

- `loadEnv` and `EnvSchema` in `packages/config/src/index.ts`
- `MissionCompiler` and `StubMissionCompiler` in `apps/control-plane/src/modules/missions/compiler.ts`
- `buildPlannerTurnInput` in `apps/control-plane/src/modules/runtime-codex/planner-prompt.ts`
- `buildExecutorTurnInput` in `apps/control-plane/src/modules/runtime-codex/executor-prompt.ts`
- `buildExecutorTaskSummary` in `apps/control-plane/src/modules/evidence/executor-output.ts`

Expected new interfaces:

- eval harness config and opt-in guard helpers
- dataset loader and dataset item schemas
- prompt-source adapters for planner, executor, and compiler eval targets
- rule-based scoring helpers
- model grader client helpers
- JSONL result writer
- CLI runners for planner, executor, and combined evals

External dependencies:

- `OPENAI_API_KEY`
- new env vars `OPENAI_EVALS_ENABLED`, `OPENAI_EVAL_MODEL`, `OPENAI_EVAL_GRADER_MODEL`, and `OPENAI_EVAL_REFERENCE_MODEL`
- likely the official `openai` Node SDK if that is the smallest clean integration surface

This slice should not introduce new database schema, replay event types, mission state transitions, or GitHub integration expectations.

## Outcomes & Retrospective

EP-0010 is complete for the intended first slice.
Pocket CTO now has a checked-in, opt-in real-LLM eval lane that stays outside required CI, evaluates the current planner, executor, and compiler-quality surfaces with small seeded datasets, and writes timestamped JSONL results to a gitignored comparison folder.

The implementation stayed modular and out of the runtime hot path.
The new bounded context lives under `apps/control-plane/src/modules/evals/`, the CLI entrypoint lives under `apps/control-plane/src/evals/`, configuration lives in `packages/config`, and the checked-in rubric and datasets live under `evals/`.

The remaining gap is purely operational: this session did not include `OPENAI_API_KEY`, so live paid execution was not demonstrated here.
Once the key is present, the lane is ready for regular manual use with `OPENAI_EVALS_ENABLED=true`.
