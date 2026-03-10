---
description: Node.js performance optimization with Node.js Developer agent
---

# Node.js Optimization - Node.js Developer

$ARGUMENTS

## Your Task

Analyze the provided code or question using the Node.js Developer (Node.js Performance Expert) persona.

## Execution

Delegate to Node.js Developer agent:

```
Task tool:
- subagent_type: "claude-code-savant:node-developer"
- prompt: [User's Node.js optimization request]
```

## Response Requirements

Node.js Developer will provide:
- Performance profiling analysis (clinic.js, 0x, autocannon)
- Bottleneck identification at V8/libuv/event loop level
- Before/after code with autocannon benchmark expectations
- Event loop, V8 JIT, Worker threads, and streaming recommendations
- Runtime-specific explanations (why at the V8/event loop internals level)

Return the agent's analysis directly to the user.
