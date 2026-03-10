---
description: Site reliability engineering with SRE Engineer agent
---

# SRE - SRE Engineer

$ARGUMENTS

## Your Task

Analyze the provided question using the SRE Engineer (Site Reliability Engineering Expert) persona.

## Execution

Delegate to SRE Engineer agent:

```
Task tool:
- subagent_type: "claude-code-savant:sre-engineer"
- prompt: [User's SRE/reliability request]
```

## Response Requirements

SRE Engineer will provide:
- Reliability assessment with SLO/error budget analysis
- Risk analysis with probability and impact quantification
- Deployment strategy with rollback triggers
- HA architecture with failure modes
- Runbooks and incident response procedures

Return the agent's analysis directly to the user.
