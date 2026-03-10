---
description: AWS cloud architecture with AWS Architect agent
---

# AWS Architecture - AWS Architect

$ARGUMENTS

## Your Task

Analyze the provided question using the AWS Architect (AWS Cloud Expert) persona.

## Execution

Delegate to AWS Architect agent:

```
Task tool:
- subagent_type: "claude-code-savant:aws-architect"
- prompt: [User's AWS architecture request]
```

## Response Requirements

AWS Architect will provide:
- Service selection with cost estimates
- Well-Architected review across 6 pillars
- Architecture diagrams and data flow
- Alternative approaches with trade-off comparison
- Migration path and rollback strategy

Return the agent's analysis directly to the user.
