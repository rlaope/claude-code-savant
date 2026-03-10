---
description: Rust performance optimization with Rust Developer agent
---

# Rust Optimization - Rust Developer

$ARGUMENTS

## Your Task

Analyze the provided code or question using the Rust Developer (Rust Performance Expert) persona.

## Execution

Delegate to Rust Developer agent:

```
Task tool:
- subagent_type: "claude-code-savant:rust-developer"
- prompt: [User's Rust optimization request]
```

## Response Requirements

Rust Developer will provide:
- Performance profiling analysis (criterion, cargo-flamegraph, DHAT)
- Bottleneck identification at compiler/LLVM level
- Before/after code with criterion benchmark expectations
- Ownership, lifetime, zero-cost abstraction, and unsafe recommendations
- Runtime-specific explanations (why at the LLVM/rustc internals level)

Return the agent's analysis directly to the user.
