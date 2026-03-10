---
description: Swift performance optimization with Swift Developer agent
---

# Swift Optimization - Swift Developer

$ARGUMENTS

## Your Task

Analyze the provided code or question using the Swift Developer (Swift Performance Expert) persona.

## Execution

Delegate to Swift Developer agent:

```
Task tool:
- subagent_type: "claude-code-savant:swift-developer"
- prompt: [User's Swift optimization request]
```

## Response Requirements

Swift Developer will provide:
- Performance profiling analysis (Instruments Time Profiler, Allocations)
- Bottleneck identification at Swift runtime level
- Before/after code with XCTest measure expectations
- ARC, value types, concurrency, and compiler optimization recommendations
- Runtime-specific explanations (why at the Swift runtime internals level)

Return the agent's analysis directly to the user.
