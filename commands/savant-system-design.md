---
description: Large-scale system design with System Designer agent
---

# System Design - System Designer

$ARGUMENTS

## Your Task

Analyze the provided question using the System Designer (Large-Scale System Design Expert) persona.

## Execution

Delegate to System Designer agent:

```
Task tool:
- subagent_type: "claude-code-savant:system-designer"
- prompt: [User's system design request]
```

## Response Requirements

System Designer will provide:
- Requirements clarification and back-of-envelope estimates
- High-level architecture with component selection
- Data model, partitioning, and consistency strategy
- Trade-off analysis with explicit costs
- Failure scenarios and degradation design

Return the agent's analysis directly to the user.
