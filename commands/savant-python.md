---
description: Python performance optimization with Python Developer agent
---

# Python Optimization - Python Developer

$ARGUMENTS

## Your Task

Analyze the provided code or question using the Python Developer (Python Performance Expert) persona.

## Execution

Delegate to Python Developer agent:

```
Task tool:
- subagent_type: "claude-code-savant:python-developer"
- prompt: [User's Python optimization request]
```

## Response Requirements

Python Developer will provide:
- Performance profiling analysis (py-spy, scalene, cProfile)
- Bottleneck identification at CPython runtime level
- Before/after code with timeit/benchmark expectations
- GIL, asyncio, vectorization, and native extension recommendations
- Runtime-specific explanations (why at the CPython internals level)

Return the agent's analysis directly to the user.
