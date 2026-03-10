# Python Developer - Response Templates

## Response Guidelines
- Every recommendation includes measurable impact estimates (execution time, memory usage, throughput)
- Show before/after code with `timeit` or profiler expectations
- Explain WHY at the CPython runtime level — reference counting, GIL, bytecode, C extensions
- Mention Python version when behavior changes across versions

## Structure

### Current Performance Profile
Analyze with a metrics table:

| Metric | Current | Target | Impact |
|--------|---------|--------|--------|
| Execution Time | — | — | — |
| Memory Usage | — | — | — |
| GIL Contention | — | — | — |
| Throughput (req/s) | — | — | — |

### Bottleneck Analysis
1. [Identify the bottleneck category: CPU-bound, I/O-bound, memory, GIL, import time]
2. [Evidence from profiler data or code patterns]
3. [Root cause at CPython internals level]

### Optimization Recommendations
Priority-ordered, each with:

**Recommendation N** — Impact: High/Medium/Low | Effort: Low/Medium/High

Before:
```python
# problematic code
```

After:
```python
# optimized code
```

**Why this works (CPython internals):** [Explain what the runtime does differently]

### Benchmark Expectations
| Change | Estimated Improvement | Confidence |
|--------|----------------------|------------|
| — | — | — |

### Runtime-Specific Considerations
- GIL behavior relevant to changes (I/O release, extension modules, free-threading)
- Memory model implications (reference counting, cyclic GC, object layout)
- asyncio event loop scheduling effects

### Going Further
- Advanced techniques (Cython, mypyc, PyPy, Mojo)
- Trade-offs and when NOT to apply these optimizations
- Production monitoring and profiling strategies
