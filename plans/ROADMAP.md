# Pocket CTO roadmap

This roadmap is the working build order for the repo.

It is intentionally specific.
If you change the sequence, record the reason in an ADR or the active ExecPlan.

## Build philosophy

Build one strong vertical slice at a time.

The first version should prove that Pocket CTO can:

1. persist typed missions
2. orchestrate isolated tasks
3. drive Codex App Server
4. capture replay events
5. assemble proof bundles
6. present decision-ready outputs on a mobile-friendly surface

## Milestone map

### M0 - Foundation and mission spine

Goal: make text intake become a persisted mission with task records, replay events, and a visible proof-bundle placeholder.

Submilestones:

- M0.1 repo bootstrap and dev infrastructure
- M0.2 domain schemas and DB schema
- M0.3 API and worker process spine
- M0.4 replay event pipeline
- M0.5 proof bundle placeholder and mission detail endpoint

Exit criteria:

- `POST /missions/text` creates a mission
- tasks are materialized and persisted
- replay events can be fetched for the mission
- the mission detail response includes a proof-bundle placeholder
- tests cover mission creation and replay appends

### M1 - Codex runtime integration and Build Run v1

Goal: take a queued build mission and run it through a Codex-backed planner and executor path.

Submilestones:

- M1.1 Codex App Server process bootstrap and initialize handshake
- M1.2 thread and turn lifecycle mapping
- M1.3 workspace manager with isolated worktrees
- M1.4 basic planner task
- M1.5 basic executor task
- M1.6 approval record creation for runtime approval requests
- M1.7 artifact placeholder emission for PR, test report, and summary

Exit criteria:

- one seeded build mission reaches `awaiting_approval` or `succeeded`
- task records store Codex thread ids
- runtime item events are visible as replay events
- approval requests are persisted and inspectable

### M2 - GitHub-first vertical slice and evidence-native completion

Goal: connect Pocket CTO to GitHub so an issue or operator prompt can result in a branch, PR, and proof bundle.

Submilestones:

- M2.1 GitHub App auth and installation model
- M2.2 webhook ingestion
- M2.3 repository registry and repo sync
- M2.4 branch and PR artifact creation
- M2.5 proof bundle manifest assembly
- M2.6 approval card formatter
- M2.7 web UI mission list and mission detail

Exit criteria:

- a GitHub issue or text request can create a build mission
- successful missions attach a PR link and proof bundle manifest
- mission detail page shows evidence and approval trace
- at least 3 seeded build tasks run end to end against the real single-operator M2 stack, using staging when it exists and otherwise the real local embedded stack with live GitHub App and Codex evidence

### M3 - Engineering twin v1

Goal: make planning and discovery grounded in a freshness-aware twin.
Status: complete. See `docs/ops/m3-exit-report.md` for the closeout evidence and live discovery proof.

Submilestones:

- M3.1 twin entity and edge schema
- M3.2 repository metadata extraction
- M3.3 CODEOWNERS and ownership extraction
- M3.4 CI workflow and test suite extraction
- M3.5 docs and runbook indexing
- M3.6 freshness scoring and stale markers
- M3.7 blast-radius query service
- M3.8 discovery mission formatter

Exit criteria:

- a discovery mission can answer an auth-change blast-radius question
- answers cite twin entities and freshness state
- stale or missing twin data is visible instead of hidden

### M4 - Incident Run and release safety

Goal: extend the system beyond build runs into triage and safe action selection.

Submilestones:

- M4.1 incident mission type prompt and schema tuning
- M4.2 observability adapter interfaces
- M4.3 dashboard and alert twin entities
- M4.4 suspect ranking
- M4.5 rollback note generator
- M4.6 canary and release checklist contracts
- M4.7 incident proof bundle and summary cards

Exit criteria:

- a simulated incident mission ends with either a fix PR or a rollback recommendation
- the result includes suspects, evidence, and a rollback path
- replay clearly shows the decision chain

### M5 - Pocket interface

Goal: make the full mission lifecycle operable from a phone.

Submilestones:

- M5.1 PWA shell and installability
- M5.2 web push subscription flow
- M5.3 concise approval cards
- M5.4 mission timeline optimized for mobile
- M5.5 pause, cancel, retry controls
- M5.6 optional screenshot and voice note ingestion interface stubs

Exit criteria:

- a mission can be started, monitored, approved, retried, and cancelled from mobile
- the mobile view preserves proof and replay legibility

### M6 - Public adoption loop

Goal: turn the project from a private build into a category-defining public artifact.

Submilestones:

- M6.1 public replay gallery
- M6.2 benchmark repo and scorer
- M6.3 first stack pack
- M6.4 docs hardening and onboarding
- M6.5 public demo repo and three polished replays
- M6.6 optional messaging bridge

Exit criteria:

- an external engineer can clone the repo, follow docs, and run a seeded mission
- public replays are shareable and self-explanatory
- at least one stack pack reduces onboarding friction for a real target stack

## What to defer unless proven necessary

- Redis
- multi-tenant auth
- OpenClaw bridge
- Jira or Linear adapters
- deploy automation
- automatic merges
- generalized portfolio scheduling across dozens of repos

## Kill criteria and narrowing moves

If M2 is slipping badly, do not add channels or packs.
Narrow instead:

- single repo instead of multi-repo
- build and discovery only
- no reviewer task yet
- no voice or screenshot intake
- simple PWA instead of polished dashboard

If M3 twin work is harder than expected, ship a useful small twin based on repo metadata, CODEOWNERS, test manifests, docs, and CI before adding deeper graph extraction.
