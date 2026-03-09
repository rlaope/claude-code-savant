---
description: "Launch Savant Chat - a web-based messenger UI to chat with AI personas about your current project"
---

# Savant Chat Launcher

Launch the Savant Chat web interface. This opens a local messenger-style UI where you can chat with 4 AI personas (Einstein, Shakespeare, Socrates, Steve Jobs) who understand your current project context.

## What to do

1. Build and start the Savant Chat server
2. The server will scan the current project directory automatically
3. Open the browser to the chat UI

Run this command:

```bash
cd <project_root>/web && npx tsc && PROJECT_DIR=$(pwd)/.. node dist/server.js
```

Then open http://localhost:3456 in the browser.

## Features

- **Einstein** (The Professor): First-principles explanations
- **Shakespeare** (The Bard): Code analysis with narrative and flowcharts
- **Socrates** (The Debugger): Root cause investigation
- **Steve Jobs** (The Visionary): Bold project direction
- **Team Chat**: All 4 personas discuss together
- **Language Toggle**: English / Korean
- **Project Context**: Click the project badge to see what the AI knows
