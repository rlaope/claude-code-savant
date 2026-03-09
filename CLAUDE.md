# Claude Code Savant - Development Rules

## Documentation Sync Rule

**IMPORTANT**: Whenever adding, removing, or modifying agents, commands, features, or UI changes:

1. **README.md** must be updated to reflect the change:
   - Personas section (add/remove persona descriptions)
   - Commands table (add/remove commands)
   - Direct Agent Calls list
   - Features table (if UI changes)
   - Project Structure (if new files added)
   - Description line at top of README

2. **Welcome bubbles** in `web/public/index.html` must include EN/KO text for new personas

3. **Group chat** prompt in `web/server.ts` must reference all current personas

4. **Server persona meta** in `web/server.ts` `loadPersonas()` must include the new agent

This ensures documentation is always in sync with the codebase.
