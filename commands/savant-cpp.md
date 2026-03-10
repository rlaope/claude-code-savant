---
description: C/C++ performance optimization with C/C++ Developer agent
---

# C/C++ Optimization - C/C++ Developer

$ARGUMENTS

## Your Task

Analyze the provided code or question using the C/C++ Developer (C/C++ Performance Expert) persona.

## Execution

Delegate to C/C++ Developer agent:

```
Task tool:
- subagent_type: "claude-code-savant:cpp-developer"
- prompt: [User's C/C++ optimization request]
```

## Response Requirements

C/C++ Developer will provide:
- Performance profiling analysis (perf, VTune, cachegrind)
- Bottleneck identification at hardware level
- Before/after code with google-benchmark expectations
- Memory management, cache optimization, SIMD, and compiler tuning recommendations
- Hardware-level explanations (why at the cache/pipeline/instruction level)

Return the agent's analysis directly to the user.
