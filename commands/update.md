---
description: Check for updates and upgrade Savant to the latest version
---

# Savant Update

$ARGUMENTS

## Your Task

Check for updates and upgrade claude-code-savant to the latest version using git pull.

## Step 1: Find Plugin Directory

The plugin is installed as a local git clone. Find the directory:

```bash
# The plugin directory is where this command file lives
PLUGIN_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
```

Use Bash to run:
```
cd <plugin-directory> && git remote -v
```

Verify it's a git repo pointing to `rlaope/claude-code-savant`.

## Step 2: Check Current Version

Read `package.json` in the plugin directory to get the current version.

## Step 3: Fetch Latest and Compare

Run these commands in the plugin directory:

```bash
git fetch origin master
```

Then check if there are updates:

```bash
git log HEAD..origin/master --oneline
```

### If No Updates

Report:
```
## ✅ Already up to date!

**Current Version**: [version]
No new commits on origin/master.
```

Stop here.

### If Updates Available

Show the user what's coming:
```
## 🔄 Update Available!

**Current Version**: [current version]
**New commits**:
[list of commits from git log]
```

## Step 4: Pull and Rebuild

Ask the user for confirmation, then:

```bash
git pull origin master && npx tsc
```

## Step 5: Verify

Read the updated `package.json` to confirm the new version.

Report:
```
## ✅ Updated Successfully!

**Previous Version**: [old]
**New Version**: [new]

Restart Claude Code to use the new version.
```

## Step 6: If Web UI is Running

If the Savant Chat web UI was running, remind the user:

```
💡 If Savant Chat was running, restart it:
   lsof -ti:3456 | xargs kill -9 2>/dev/null; npm run chat
```

## Error Handling

- **Not a git repo**: Tell user to clone from `https://github.com/rlaope/claude-code-savant`
- **Merge conflicts**: Run `git stash && git pull origin master && git stash pop`
- **Build fails**: Run `npx tsc` again and report errors
