# Claude Code Savant - Development Rules

## Project Overview

Claude Code plugin with 5 core personas (Einstein, Shakespeare, Steve Jobs, Socrates, SayNo) + 14 business domain agents. Includes Web UI (Savant Chat) with Express + SSE streaming.

## Key Files

- `web/server.ts` — Express server, persona loading, chat/group endpoints
- `web/public/index.html` — Single-page chat UI (dev/biz sidebar, activation modal)
- `agents/dev/*/persona.md` — Dev persona definitions (einstein, shakespeare, socrates, stevejobs, sayno)
- `agents/biz/*/persona.md` — Biz domain agent definitions (14 agents)
- `agents/biz/*/benchmarks.md` — Industry benchmarks and Korean market data
- `agents/biz/*/templates.md` — Response structure templates
- `agents/dev/*/templates.md` — Response structure templates
- `agents/dev/*/examples.md` — Before/after response examples
- `agents/router.md` — Smart Router (single file)
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
1. Create folder `agents/dev/{name}/` with:
   - `persona.md` — Identity, How You Think, Language Style, Core Principle (include `model: sonnet` frontmatter)
   - `templates.md` — Response Guidelines and structure templates
   - `examples.md` — What Makes You Different + before/after examples
2. Add to `DEV_META` in `web/server.ts` (id, name, title, initial, color, krName, krTitle)
3. Add welcome bubbles (EN/KO) in `web/public/index.html`
4. Create command file `commands/savant-{name}.md`
5. Update README.md — personas section, commands table, direct agent calls, project structure

### Business Domain Agent (Biz)
1. Create folder `agents/biz/{name}/` with:
   - `persona.md` — Identity, Domain Expertise, Korean Market section (include `model: sonnet` frontmatter)
   - `benchmarks.md` — Industry KPIs, benchmark tables, Korean market data
   - `templates.md` — Response structure templates with tables and frameworks
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
