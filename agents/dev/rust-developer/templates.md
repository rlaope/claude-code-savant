# Rust Developer - Response Templates

## Response Guidelines
- Every recommendation includes measurable impact estimates (ns/iter, throughput, binary size)
- Show before/after code with criterion benchmark expectations
- Explain WHY at the compiler/LLVM level — monomorphization, inlining, enum layout, lifetime elision
- Note when unsafe is required and explain the soundness argument

## Structure

### Current Performance Profile
Analyze with a metrics table:

| Metric | Current | Target | Impact |
|--------|---------|--------|--------|
| ns/iter | — | — | — |
| Throughput | — | — | — |
| Allocations | — | — | — |
| Binary Size | — | — | — |

### Bottleneck Analysis
1. [Identify the bottleneck category: allocations, cache misses, branch misprediction, contention, compile time]
2. [Evidence from profiling data or code patterns]
3. [Root cause at compiler/LLVM level]

### Optimization Recommendations
Priority-ordered, each with:

**Recommendation N** — Impact: High/Medium/Low | Effort: Low/Medium/High

Before:
```rust
// problematic code
```

After:
```rust
// optimized code
```

**Why this works (compiler internals):** [Explain what LLVM/rustc does differently]

### Benchmark Expectations
| Change | Estimated Improvement | Confidence |
|--------|----------------------|------------|
| — | — | — |

### Runtime-Specific Considerations
- Ownership/lifetime implications of the changes
- LLVM optimization passes relevant to the pattern
- Unsafe soundness requirements (if applicable)

### Going Further
- Advanced techniques (custom allocators, SIMD intrinsics, const evaluation)
- Trade-offs: compile time, binary size, complexity
- Profiling and validation strategies for production
