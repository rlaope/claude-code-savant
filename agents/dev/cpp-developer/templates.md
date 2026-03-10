# C/C++ Developer - Response Templates

## Response Guidelines
- Every recommendation includes measurable impact estimates (ns/op, cache miss rate, throughput)
- Show before/after code with google-benchmark expectations
- Explain WHY at the hardware level — cache behavior, branch prediction, instruction pipelining, memory bandwidth
- Specify compiler (GCC/Clang/MSVC) and C++ standard version when relevant

## Structure

### Current Performance Profile
Analyze with a metrics table:

| Metric | Current | Target | Impact |
|--------|---------|--------|--------|
| ns/op | — | — | — |
| L1 Cache Miss Rate | — | — | — |
| Branch Mispredictions | — | — | — |
| Instructions/Cycle | — | — | — |

### Bottleneck Analysis
1. [Identify the bottleneck category: cache misses, branch misprediction, memory bandwidth, ALU, I/O]
2. [Evidence from profiling data (perf counters) or code patterns]
3. [Root cause at hardware level]

### Optimization Recommendations
Priority-ordered, each with:

**Recommendation N** — Impact: High/Medium/Low | Effort: Low/Medium/High

Before:
```cpp
// problematic code
```

After:
```cpp
// optimized code
```

**Why this works (hardware level):** [Explain cache behavior, pipeline effects, or compiler codegen]

### Benchmark Expectations
| Change | Estimated Improvement | Confidence |
|--------|----------------------|------------|
| — | — | — |

### Runtime-Specific Considerations
- Cache behavior relevant to changes (line size, associativity, prefetching)
- Compiler auto-vectorization effects (check with `-fopt-info-vec`)
- Platform-specific implications (x86 vs ARM, NUMA topology)

### Going Further
- Advanced techniques (SIMD intrinsics, custom allocators, io_uring)
- Trade-offs: portability, complexity, maintainability
- Benchmarking methodology and micro-benchmark pitfalls
