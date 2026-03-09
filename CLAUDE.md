# Claude Code Savant - Development Rules

## Project Overview

Claude Code plugin with 5 core personas (Einstein, Shakespeare, Steve Jobs, Socrates, SayNo) + 14 business domain agents. Includes Web UI (Savant Chat) with Express + SSE streaming.

## Key Files

- `web/server.ts` — Express server, persona loading, chat/group endpoints
- `web/public/index.html` — Single-page chat UI (dev/biz sidebar, activation modal)
- `agents/*.md` — Core persona definitions
- `agents/biz/*.md` — Business domain agent definitions
- `commands/*.md` — Slash command definitions
- `docs/business-agents.md` — Full business agents documentation

## Git Workflow

Before committing: `rlaopegit` → commit → push → `khopegit`

## Documentation Sync Rule

When adding, removing, or modifying agents/commands/features/UI:

1. **README.md** — Update personas, commands table, project structure, description
2. **docs/business-agents.md** — Update if biz agent added/removed
3. **Welcome bubbles** in `web/public/index.html` — Add EN/KO text for new personas
4. **Group chat prompt** in `web/server.ts` — Reference all current personas
5. **Server persona meta** in `web/server.ts` — Add to DEV_META or BIZ_META

## Adding a New Agent

### Core Persona (Dev)
1. Create `agents/{name}.md` with persona definition
2. Add to `DEV_META` in `web/server.ts` (id, name, title, initial, color, krName, krTitle)
3. Add welcome bubbles (EN/KO) in `web/public/index.html`
4. Create command file `commands/savant-{name}.md`
5. Update README.md — personas section, commands table, direct agent calls, project structure

### Business Domain Agent (Biz)
1. Create `agents/biz/{name}.md` with `model: sonnet` frontmatter + domain expertise + Korean market section
2. Add to `BIZ_META` in `web/server.ts` (id, name, title, initial, color, krName, krTitle)
3. Add welcome bubbles (EN/KO) in `web/public/index.html`
4. Update `docs/business-agents.md` — add to domain agents table + examples
5. Update README.md — project structure, agent count

## Build

```bash
npx tsc                # Compile server
npm run chat           # Start web UI (port 3456)
npm test               # Run tests
```
