---
description: "Launch Savant Chat - web messenger UI to chat with AI personas about your project"
---

# Savant Chat Launcher

Launch the Savant Chat web interface directly from Claude Code.

## Instructions

You MUST execute these steps in order:

1. Find the claude-code-savant plugin directory. Check these locations:
   - `~/.claude/plugins/claude-code-savant/`
   - The directory where this command file lives (go up one level from `commands/`)
   - Search for `claude-code-savant` in common plugin paths

2. Build the web server (if not already built):
```bash
cd <plugin_dir>/web && npx tsc 2>/dev/null
```

3. Start the server with the USER'S CURRENT PROJECT as context (not the plugin directory):
```bash
cd <plugin_dir>/web && PROJECT_DIR=<user_cwd> node dist/server.js &
```

4. Tell the user to open http://localhost:3456 (or the next available port)

5. If the build fails because dependencies aren't installed, run:
```bash
cd <plugin_dir> && npm install && cd web && npx tsc
```

IMPORTANT: `PROJECT_DIR` must be set to the user's current working directory, NOT the plugin directory. This is what gives the personas context about the user's project.
