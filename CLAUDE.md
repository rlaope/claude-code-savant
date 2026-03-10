# Claude Code Savant - Development Rules

## Project Overview

Claude Code plugin with 5 core personas + 16 dev specialist agents + 14 business domain agents (35 total). Includes Web UI (Savant Chat) with Express + SSE streaming.

### Agent Categories

| Category | Count | Always On | Toggleable |
|----------|-------|-----------|------------|
| Core Dev | 4 | Einstein, Shakespeare, Socrates, Steve Jobs | — |
| Language Optimizers | 7 | — | JVM, Python, Go, Rust, Node.js, Swift, C/C++ |
| Infra/DevOps | 6 | — | AWS, K8s, IaC, Observability, CI/CD, Docker |
| SRE | 3 | — | System Designer, Performance Detective, SRE Engineer |
| Biz (gateway) | 1 | SayNo | — |
| Biz Domain | 14 | — | Finance, Growth, Legal, Fashion, Logistics, etc. |

## Key Files

- `web/server.ts` — Express server, `DEV_META`/`BIZ_META`, persona loading, chat/group endpoints
- `web/public/index.html` — SPA chat UI (dev/biz sidebar, activation modals, welcome bubbles)
- `agents/dev/*/persona.md` — Dev persona definitions (21 agents)
- `agents/biz/*/persona.md` — Biz domain agent definitions (14 agents)
- `agents/router.md` — Smart Router with language/infra/SRE detection rules
- `commands/*.md` — Slash command definitions (22 savant commands)
- `docs/business-agents.md` — Full business agents documentation

## Git Workflow

Before committing: `rlaopegit` → commit → push → `khopegit`

## Documentation Sync Rule

When adding, removing, or modifying agents/commands/features/UI:

1. **`web/server.ts`** — Add to `DEV_META` or `BIZ_META` (id, name, title, initial, color, krName, krTitle)
2. **`web/public/index.html`** — Welcome bubbles (EN/KO) in `getWelcomeBubble()`
3. **`agents/router.md`** — Add routing signals for the new agent
4. **`README.md`** — Personas section, commands table, direct agent calls, project structure
5. **`docs/business-agents.md`** — Update if biz agent added/removed

## Adding a New Agent

### Dev Specialist Agent
1. Create `agents/dev/{id}/` with:
   - `persona.md` — `model: sonnet` frontmatter + Identity, Domain Expertise, How You Think, Language Style, Core Principle
   - `templates.md` — Response structure with metrics tables, before/after code, runtime explanations
   - `examples.md` — What Makes You Different comparison table + full example response
2. Add to `DEV_META` in `web/server.ts`
3. Add welcome bubbles (EN/KO) in `getWelcomeBubble()` in `web/public/index.html`
4. Create `commands/savant-{name}.md`
5. Update `agents/router.md` — add detection signals
6. Update `README.md` — agent tables, commands, project structure, direct agent calls

### Business Domain Agent (Biz)
1. Create `agents/biz/{id}/` with:
   - `persona.md` — `model: sonnet` frontmatter + Identity, Domain Expertise, Korean Market
   - `benchmarks.md` — Industry KPIs, benchmark tables, Korean market data
   - `templates.md` — Response structure templates with tables and frameworks
2. Add to `BIZ_META` in `web/server.ts`
3. Add welcome bubbles (EN/KO) in `getWelcomeBubble()`
4. Update `docs/business-agents.md`
5. Update `README.md`

## Agent Activation System

- **Core Dev** (Einstein, Shakespeare, Socrates, Steve Jobs): Always visible, cannot toggle off
- **Biz Gateway** (SayNo): Always visible, cannot toggle off
- **All others**: Toggle via "Manage" button in sidebar (stored in localStorage)
- Dev activation: `savant-dev-enabled` key, functions: `isDevEnabled()`, `setDevEnabled()`, `isCoreDev()`
- Biz activation: `savant-biz-enabled` key, functions: `isBizEnabled()`, `setBizEnabled()`
- Both use `biz-chip` CSS class for modal toggle chips

## Build

```bash
npx tsc                # Compile server
npm run chat           # Start web UI (port 3456)
npm test               # Run tests
```
