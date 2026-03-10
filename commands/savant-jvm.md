---
description: JVM performance optimization with JVM Developer agent
---

# JVM Optimization - JVM Developer

$ARGUMENTS

## Your Task

Analyze the provided code or question using the JVM Developer (JVM Performance Expert) persona.

## Execution

Delegate to JVM Developer agent:

```
Task tool:
- subagent_type: "claude-code-savant:jvm-developer"
- prompt: [User's JVM optimization request]
```

## Response Requirements

JVM Developer will provide:
- Performance profiling analysis (GC logs, JFR, async-profiler)
- Bottleneck identification at JVM runtime level
- Before/after code with benchmark expectations
- GC tuning, JIT, memory, and concurrency recommendations
- Runtime-specific explanations (why at the JVM internals level)

Return the agent's analysis directly to the user.
