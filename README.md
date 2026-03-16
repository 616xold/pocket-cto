# Pocket CTO

Pocket CTO is an evidence-native engineering mission control system.

It is **not** a generic chat bot and it is **not** a thin wrapper around a coding model.
It turns messy operator intent into typed engineering missions, executes those missions in isolated workspaces, records proof, and returns decision-ready evidence to a pocket-friendly interface.

## Product boundary for v1

Pocket CTO v1 is intentionally narrow:

- single operator, single trust boundary
- GitHub-first
- text-first intake
- PWA-first mobile interface
- Codex App Server as the coding runtime
- no multi-tenant SaaS boundary
- no autonomous production deploys
- no automatic merges
- no OpenClaw or multi-channel bridge in the critical path

This repo is structured to help Codex implement the system modularly and milestone by milestone.

## What is already decided

1. **Mission IR is the core contract.**
   Every request gets compiled into a typed mission before orchestration starts.

2. **GitHub App, not PAT.**
   Use a GitHub App for repo access, webhooks, and PR coordination.

3. **Postgres is the source of truth.**
   State, replay events, twin entities, approvals, and the outbox live in Postgres.
   Redis is intentionally deferred from v1.

4. **Evidence is first-class.**
   Successful runs do not end with "done". They end with a proof bundle.

5. **Codex works through plans and skills.**
   Complex work must go through `PLANS.md` and the checked-in skills under `.agents/skills`.

## Repository map

```text
.
├── AGENTS.md
├── PLANS.md
├── WORKFLOW.md
├── START_HERE.md
├── apps
│   ├── control-plane
│   └── web
├── docs
│   ├── architecture
│   ├── benchmarks
│   ├── ops
│   └── adrs
├── packages
│   ├── codex-runtime
│   ├── config
│   ├── db
│   ├── domain
│   ├── stack-packs
│   └── testkit
├── plans
│   ├── ROADMAP.md
│   ├── EP-0001-mission-spine.md
│   └── templates
└── .agents
    └── skills
```

## Immediate implementation order

1. Read `START_HERE.md`.
2. Read `AGENTS.md`.
3. Read `PLANS.md`.
4. Read `plans/ROADMAP.md`.
5. Start with `plans/EP-0001-mission-spine.md`.
6. Keep all progress updates inside the ExecPlan while working.
7. Do not skip tests, replay logging, or docs updates.

## Local development

### Prerequisites

- Node 22+
- pnpm 10+
- Docker Desktop or compatible container runtime
- A GitHub App if you want to exercise M2.1 installation sync or M2.2 webhook ingress locally
- Codex app or Codex CLI installed locally

M2.4 now extends that GitHub slice: when a mission resolves to a synced writable repository row, successful executor runs can publish a deterministic branch, open a draft PR through the GitHub App installation, and persist a durable `pr_link` artifact. Mission repo targeting is now narrow but friendlier: Pocket CTO can normalize an exact `owner/repo`, a unique synced short repo name, or the single active synced repo in one-repo local setups. See [docs/ops/local-dev.md](docs/ops/local-dev.md) for the current permission and smoke-test details.

### Bootstrap

```bash
cp .env.example .env
docker compose up -d
pnpm install
pnpm db:generate
pnpm db:migrate
pnpm dev
pnpm dev:worker   # in a second terminal once task execution work begins
```

For the local GitHub App and webhook setup, use the local-dev guide in `docs/ops/local-dev.md`.
M2.2 now expects `GITHUB_WEBHOOK_SECRET` for live `POST /github/webhooks` ingress.
With `pnpm dev` running, `http://localhost:3000/` is now the operator home and `http://localhost:3000/missions` is the newest-first mission list; the text-intake box on those surfaces reuses `POST /missions/text` and redirects into mission detail.

### Quality gates

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm check
```

## North star

The hero behavior is:

> a vague mobile request becomes a governed software mission with a plan, isolated execution, proof, and a one-tap approval card.

Everything in this repository should push toward that behavior.

## License

This project is licensed under the Apache License 2.0. See [LICENSE](LICENSE).
