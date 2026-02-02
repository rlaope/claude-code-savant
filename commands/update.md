---
description: Check for updates and upgrade Savant to the latest version
---

# Savant Update

$ARGUMENTS

## Your Task

Check for updates and help user upgrade to the latest version.

## Step 1: Fetch Latest Version from GitHub

Use WebFetch to check the latest version:

```
WebFetch:
- url: "https://raw.githubusercontent.com/rlaope/claude-code-savant/master/package.json"
- prompt: "What is the version number?"
```

## Step 2: Show Update Information

### If Update Available

```
## 🔄 Savant Update Available!

**Your Version**: [current]
**Latest Version**: [from GitHub]

### How to Update:

# Re-add marketplace to refresh
/plugin marketplace add rlaope/claude-code-savant

# Then reinstall
/plugin uninstall claude-code-savant
/plugin install claude-code-savant

### After Update:
Run `/savant-setup` to configure new features!
```

### If Already Latest

```
## ✅ You're Up to Date!

**Current Version**: [version] (Latest)

No updates available.
```

## Current Version Info

**Latest Version: 1.3.0**

### What's New in 1.3.0:
- 🔧 **Dynamic TypeScript Agents**: Context-aware prompt generation
- 📦 **MCP Server Support**: `.mcp.json` integration

### What's in 1.2.0:
- 🎭 **Smart Router**: Auto-detect best persona with `/savant`
- 🌍 **Multi-language**: English, 한국어, 日本語, 中文 support
- ⚡ **Default Mode**: Always-on routing with `/savant-default`
- 🧙 **Setup Wizard**: First-time configuration

## Version History

| Version | Features |
|---------|----------|
| 1.3.0 | Dynamic TypeScript Agents, MCP Server |
| 1.2.0 | Smart Router, Default Mode, Multi-language, Setup Wizard |
| 1.1.0 | Steve Jobs & Socrates personas |
| 1.0.0 | Einstein & Shakespeare personas |

## GitHub Repository

https://github.com/rlaope/claude-code-savant
