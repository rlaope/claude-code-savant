---
description: Go performance optimization with Go Developer agent
---

# Go Optimization - Go Developer

$ARGUMENTS

## Your Task

Analyze the provided code or question using the Go Developer (Go Performance Expert) persona.

## Execution

Delegate to Go Developer agent:

```
Task tool:
- subagent_type: "claude-code-savant:go-developer"
- prompt: [User's Go optimization request]
```

## Response Requirements

Go Developer will provide:
- Performance profiling analysis (pprof CPU, heap, goroutine)
- Bottleneck identification at Go runtime level
- Before/after code with go test -bench expectations
- Goroutine, GC, escape analysis, and concurrency recommendations
- Runtime-specific explanations (why at the Go runtime internals level)

Return the agent's analysis directly to the user.
