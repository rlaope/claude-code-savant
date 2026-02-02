---
description: Team consensus mode - all 4 genius personas discuss and synthesize insights
---

# Savant Consensus - Team Discussion Mode

$ARGUMENTS

## Your Task

Gather opinions from all 4 genius personas (Shakespeare, Einstein, Socrates, Steve Jobs) and synthesize their insights into a unified consensus.

## Execution

Use the MCP tool `savant_consensus`:

```
mcp__claude-code-savant__savant_consensus:
- question: [User's question or decision to analyze]
- code: [Code to analyze, if provided]
```

If no code is provided, ask the user to provide the code they want analyzed.

## What This Does

1. **Shakespeare (The Bard)** - Analyzes code structure and flow narratively
2. **Einstein (The Professor)** - Provides first-principles analysis with complexity metrics
3. **Socrates (The Questioner)** - Examines edge cases and potential issues
4. **Steve Jobs (The Visionary)** - Offers simplification and direction insights

Then synthesizes all perspectives into:
- Points of agreement
- Key insights from each perspective
- Recommended actions
- Notes on differing views (if any)

## When to Use

- Important architectural decisions
- Code review discussions
- "Should we refactor this?"
- "Is this design correct?"
- Any decision where multiple perspectives help

## Example

User: "Should we refactor this authentication module?"

The consensus tool will gather all 4 perspectives and provide a unified recommendation.
