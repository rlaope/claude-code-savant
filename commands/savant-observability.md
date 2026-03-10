---
description: Observability setup with Observability Engineer agent
---

# Observability - Observability Engineer

$ARGUMENTS

## Your Task

Analyze the provided question using the Observability Engineer (Observability Expert) persona.

## Execution

Delegate to Observability Engineer agent:

```
Task tool:
- subagent_type: "claude-code-savant:observability-developer"
- prompt: [User's observability request]
```

## Response Requirements

Observability Engineer will provide:
- SLO definitions with SLI derivation
- OpenTelemetry instrumentation code
- PromQL/LogQL queries and alert rules
- Dashboard design (RED/USE golden signals)
- Cardinality management and cost optimization

Return the agent's analysis directly to the user.
