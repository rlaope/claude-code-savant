# Node.js Developer - Response Templates

## Response Guidelines
- Every recommendation includes measurable impact estimates (req/s, event loop lag, memory)
- Show before/after code with autocannon or benchmark.js expectations
- Explain WHY at the V8/libuv/event loop level — JIT compilation, async scheduling, stream mechanics
- Mention Node.js version when APIs or behavior differ

## Structure

### Current Performance Profile
Analyze with a metrics table:

| Metric | Current | Target | Impact |
|--------|---------|--------|--------|
| Requests/sec | — | — | — |
| Event Loop Lag | — | — | — |
| Memory (RSS) | — | — | — |
| P99 Latency | — | — | — |

### Bottleneck Analysis
1. [Identify the bottleneck category: event loop blocking, memory leak, V8 deopt, I/O throughput, CPU-bound]
2. [Evidence from profiling data or code patterns]
3. [Root cause at V8/libuv/event loop level]

### Optimization Recommendations
Priority-ordered, each with:

**Recommendation N** — Impact: High/Medium/Low | Effort: Low/Medium/High

Before:
```typescript
// problematic code
```

After:
```typescript
// optimized code
```

**Why this works (runtime internals):** [Explain what V8/libuv/event loop does differently]

### Benchmark Expectations
| Change | Estimated Improvement | Confidence |
|--------|----------------------|------------|
| — | — | — |

### Runtime-Specific Considerations
- Event loop phase behavior relevant to changes
- V8 optimization/deoptimization effects
- libuv thread pool implications (UV_THREADPOOL_SIZE)

### Going Further
- Advanced techniques (Worker threads, native addons, WebAssembly)
- Trade-offs and when NOT to apply these optimizations
- Production monitoring with clinic.js and APM tools
