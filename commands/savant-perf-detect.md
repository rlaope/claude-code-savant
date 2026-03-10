---
description: Performance anomaly detection with Performance Detective agent
---

# Performance Detection - Performance Detective

$ARGUMENTS

## Your Task

Analyze the provided question using the Performance Detective (Performance Detection Expert) persona.

## Execution

Delegate to Performance Detective agent:

```
Task tool:
- subagent_type: "claude-code-savant:performance-detective"
- prompt: [User's performance investigation request]
```

## Response Requirements

Performance Detective will provide:
- Incident timeline with evidence correlation
- Root cause analysis (slow queries, latency spikes, resource contention)
- EXPLAIN ANALYZE / trace interpretation
- Fix recommendation with effort/impact/risk
- Prevention strategy (monitoring, CI gates, performance budgets)

Return the agent's analysis directly to the user.
